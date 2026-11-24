# Werkinstructies voor Claude

Deze repository is de website studieschuld-aflossen.nl: een statische rekentool die laat zien of extra aflossen op een DUO-studieschuld (SF35) loont, met en zonder aflossen via het IKB van je werkgever.

## Opbouw
- `index.html` — de hele site (HTML, CSS en JavaScript in één bestand). Geen build-stap.
- `regels.json` — alle getallen die jaarlijks kunnen veranderen. De rekentool leest dit bestand bij het laden in; staan er waarden in die ontbreken, dan valt de pagina terug op de waarden in `index.html`.
- Hosting: Cloudflare Pages, gekoppeld aan de branch `main`. Alles wat op `main` landt, staat binnen een minuut live.

## Regels
1. **Nooit rechtstreeks naar `main` pushen.** Werk altijd op een eigen branch en open een pull request. Nick keurt elke wijziging zelf goed.
2. **Elke wijziging in `regels.json` krijgt een bron**: de URL van de officiële pagina (bij voorkeur duo.nl, rijksoverheid.nl of de cao-tekst) en de datum waarop je die las. Zet die in de beschrijving van de pull request en pas `bijgewerkt` en `bron` in `regels.json` aan.
3. **Twijfel je, wijzig dan niets.** Open in plaats daarvan een issue met wat je zag en waarom je twijfelt.
4. Houd de rekenlogica en `regels.json` met elkaar in lijn. Verandert er iets in de manier waarop DUO rekent (niet alleen een getal), stel dat dan voor als aparte pull request met uitleg.
5. Schrijf teksten op de site in helder Nederlands, zonder het logo, de kleuren of de huisstijl van DUO, en zonder te suggereren dat de site van DUO is.

## Wat de wekelijkse controle nakijkt
- Rente voor terugbetalers SF35 (duo.nl → rente voor terugbetalers / nieuws over rentepercentages).
- Vrijstelling (draagkrachtvrije voet) en draagkrachtpercentage (duo.nl → berekening maandbedrag).
- Minimale draagkracht per maand en de partnerfactor.
- Nieuws over IKB- of werkgeversregelingen voor het aflossen van studieschuld (maxima per cao).
