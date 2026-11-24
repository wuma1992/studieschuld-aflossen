// Rekencontrole voor studieschuld-aflossen.nl.
// Draaien: node --test tests/
// Deze tests vergelijken de rekentool met bekende uitkomsten van DUO.
// Faalt er een test na een wijziging in reken.js of regels.json, dan klopt er iets niet.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Reken = require('../reken.js');

const regels = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'regels.json'), 'utf8'));
const WML = regels.minimumloonPeiljaar.bedrag;
const st = (naam) => regels.stelsels[naam];
const dichtbij = (echt, verwacht, marge = 0.02) =>
  assert.ok(Math.abs(echt - verwacht) <= marge, `verwacht ${verwacht}, kreeg ${echt}`);

// Basisinvoer: eerste jaar, geen groei en geen inflatie, zodat jaar 1 precies het peiljaarinkomen gebruikt.
function invoer(stelsel, extra = {}) {
  return Object.assign({
    st: st(stelsel), hh: 'alleen', partner: 0, partnerTelt: false, volledig: false,
    draagkracht: true, wml: WML, tax: regels.ikb.standaardBelastingvoordeel, viaIkb: true,
    debt: 76045.94, r: 0.0256, months: 408, inc: 58626, grow: 0, growYrs: 0, infl: 0, exYrs: 0,
  }, extra);
}

test('regels.json bevat alle vier de terugbetalingsregels', () => {
  for (const naam of ['SF35', 'SF15', 'SF15-oud', 'SF15-lllk']) {
    const s = st(naam);
    assert.ok(s, `${naam} ontbreekt`);
    assert.ok([15, 35].includes(s.aflosjaren), `${naam}: aflosjaren`);
    assert.ok(s.vrijstellingFactor.alleenstaand > 0 && s.vrijstellingFactor.partnerOfOuder > 0, `${naam}: vrijstelling`);
    assert.ok(s.standaardRente > 0 && s.standaardRente < 10, `${naam}: rente`);
  }
});

test('vrijstellingen 2027 komen overeen met de tabel van DUO', () => {
  // Bron: duo.nl/particulier/studieschuld-terugbetalen/berekening-maandbedrag.jsp (terugbetaaljaar 2027)
  const duo = {
    'SF35': [28405.73, 40620.19],
    'SF15': [23860.81, 34086.88],
    'SF15-oud': [14202.87, 28405.73],
    'SF15-lllk': [23860.81, 34086.88],
  };
  for (const [naam, [alleen, partner]] of Object.entries(duo)) {
    dichtbij(WML * st(naam).vrijstellingFactor.alleenstaand, alleen);
    dichtbij(WML * st(naam).vrijstellingFactor.partnerOfOuder, partner);
  }
});

test('SF35: echte DUO-beslissing 2027 (inkomen € 58.626) geeft € 100,73 per maand', () => {
  const r = Reken.sim(invoer('SF35'), 0);
  dichtbij(r.pts[1].pay, 100.73);
});

test('SF15: 12% van het inkomen boven de vrijstelling', () => {
  const r = Reken.sim(invoer('SF15', { inc: 40000, months: 180 }), 0);
  dichtbij(r.pts[1].pay, (40000 - WML * 0.84) * 0.12 / 12);
});

test('SF15-oud: draagkracht in schijven', () => {
  const vrij = WML * 0.5, boven = 58626 - vrij;
  const s1 = Math.min(boven, 0.5 * vrij);
  const s2 = Math.min(boven - s1, 0.5 * vrij);
  const s3 = Math.min(boven - s1 - s2, 2.6 * WML - vrij);
  const s4 = boven - s1 - s2 - s3;
  const verwacht = (s1 * 0.079 + s2 * 0.158 + s3 * 0.237 + s4 * 0.30) / 12;
  dichtbij(Reken.draagkrachtJaar(st('SF15-oud'), 58626, vrij, WML) / 12, verwacht);
});

test('SF35: onder € 5 draagkracht per maand betaal je niets', () => {
  const r = Reken.sim(invoer('SF35', { inc: WML + 1000 }), 0); // draagkracht ≈ € 3,33
  assert.equal(r.pts[1].pay, 0);
});

test('nooit meer dan het wettelijk maandbedrag', () => {
  const r = Reken.sim(invoer('SF35', { debt: 1000, inc: 150000 }), 0);
  const i = 0.0256 / 12, wettelijk = 1000 * i / (1 - Math.pow(1 + i, -408));
  dichtbij(r.pts[1].pay, wettelijk);
});

test('restschuld na de aflosfase wordt kwijtgescholden', () => {
  const r = Reken.sim(invoer('SF35', { inc: 30000, months: 24 }), 0);
  assert.equal(r.end, null);
  assert.ok(r.left > 70000, 'bij een laag inkomen blijft er veel schuld over');
});

test('extra aflossen stopt na het opgegeven aantal jaar', () => {
  const r = Reken.sim(invoer('SF35', { exYrs: 5 }), 1250);
  dichtbij(r.ex, 6250);
});

test('extra aflossen via IKB kost netto minder dan uit eigen geld', () => {
  const ikb = Reken.sim(invoer('SF35', { viaIkb: true }), 1250);
  const eigen = Reken.sim(invoer('SF35', { viaIkb: false }), 1250);
  dichtbij(ikb.net, ikb.ex * (1 - regels.ikb.standaardBelastingvoordeel));
  assert.ok(ikb.total < eigen.total);
});

test('SF15-oud zonder partnerinkomen: geen kwijtschelding', () => {
  const r = Reken.sim(invoer('SF15-oud', { hh: 'partner', volledig: true, months: 180, inc: 30000 }), 0);
  assert.equal(r.left, 0);
});
