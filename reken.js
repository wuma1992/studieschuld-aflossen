// Rekenlogica van studieschuld-aflossen.nl.
// Gebruikt door index.html (in de browser) en door tests/reken.test.js (in Node).
(function(root){
const STANDAARD={minimumloonPeiljaar:{bedrag:28405.73},stelsels:{
 'SF35':{aflosjaren:35,vrijstellingFactor:{alleenstaand:1,partnerOfOuder:1.43},draagkracht:{type:'vast',percentage:.04},minimumDraagkrachtPerMaand:5,partnerinkomenKeuze:false,draagkrachtAutomatisch:true,standaardRente:2.70},
 'SF15':{aflosjaren:15,vrijstellingFactor:{alleenstaand:.84,partnerOfOuder:1.2},draagkracht:{type:'vast',percentage:.12},minimumDraagkrachtPerMaand:0,partnerinkomenKeuze:false,draagkrachtAutomatisch:true,standaardRente:3.28},
 'SF15-oud':{aflosjaren:15,vrijstellingFactor:{alleenstaand:.5,partnerOfOuder:1},draagkracht:{type:'schijven',schijven:[{breedte:'0.5*vrijstelling',percentage:.079},{breedte:'0.5*vrijstelling',percentage:.158},{breedte:'2.6*minimumloon-vrijstelling',percentage:.237},{breedte:'rest',percentage:.3}]},minimumDraagkrachtPerMaand:0,partnerinkomenKeuze:true,draagkrachtAutomatisch:false,standaardRente:3.28},
 'SF15-lllk':{aflosjaren:15,vrijstellingFactor:{alleenstaand:.84,partnerOfOuder:1.2},draagkracht:{type:'vast',percentage:.12},minimumDraagkrachtPerMaand:0,partnerinkomenKeuze:false,draagkrachtAutomatisch:true,standaardRente:2.70}},
 ikb:{standaardBelastingvoordeel:.45}};

// jaarlijkse draagkracht volgens de regels van het stelsel (toets = toetsingsinkomen peiljaar)
function draagkrachtJaar(st,toets,vrij,wml){
  const boven=Math.max(0,toets-vrij);
  if(st.draagkracht.type==='vast')return st.draagkracht.percentage*boven;
  let rest=boven,tot=0;
  for(const s of st.draagkracht.schijven){
    let b=s.breedte==='rest'?Infinity:s.breedte==='0.5*vrijstelling'?0.5*vrij:Math.max(0,2.6*wml-vrij);
    const deel=Math.min(rest,b);tot+=deel*s.percentage;rest-=deel;if(rest<=0)break;
  }
  return tot;
}


// Simuleert de aflosfase per jaar. p.viaIkb: extra aflossing via IKB (netto goedkoper met p.tax).
// Geeft o.a. paid (termijnen), ex (extra afgelost), total (netto kosten), pv (netto kosten in euro's van nu),
// left (kwijtgescholden), end (jaar waarin schuld weg is) en pts (schuld en maandbedrag per jaar).
function sim(p,extra){
  const st=p.st;let debt=p.debt,ml=p.months,paid=0,ex=0,pv=0,end=null;const pts=[{y:0,d:debt}];
  const yrsMax=p.volledig?60:Math.ceil(ml/12);
  for(let t=1;t<=yrsMax&&(ml>0||p.volledig);t++){
    const i=p.r/12,f=Math.pow(1+p.infl,t);
    const lag=Math.max(t-2,0);
    const inc=p.inc*Math.pow(1+p.grow,Math.min(lag,p.growYrs))*Math.pow(1+p.infl,lag);
    const part=p.partnerTelt?p.partner*Math.pow(1+p.infl,lag):0;
    const wml=p.wml*Math.pow(1+p.infl,t-1);
    const vrij=wml*(p.hh==='alleen'?st.vrijstellingFactor.alleenstaand:st.vrijstellingFactor.partnerOfOuder);
    const restM=Math.max(ml,12);
    const w=debt>0?(i>0?debt*i/(1-Math.pow(1+i,-restM)):debt/restM):0;
    let pay=w;
    if(p.draagkracht){
      const dk=draagkrachtJaar(st,inc+part,vrij,wml)/12;
      pay=Math.min(dk,w);
      if(dk<st.minimumDraagkrachtPerMaand)pay=0;
    }
    let yp=0;
    for(let m=0;m<12;m++){debt*=1+i;const q=Math.min(pay,debt);debt-=q;yp+=q;if(ml>0)ml--;if(debt<=0.005){debt=0;break}}
    paid+=yp;pv+=yp/f;
    if(extra>0&&debt>0&&(!p.exYrs||t<=p.exYrs)){const e=Math.min(extra,debt);debt-=e;ex+=e;pv+=e*(p.viaIkb?1-p.tax:1)/f}
    pts.push({y:t,d:debt,pay});
    if(debt<=0.005){end=t;break}
    if(ml<=0&&!p.volledig)break;
  }
  const net=ex*(p.viaIkb?1-p.tax:1);
  return{paid,ex,net,total:paid+net,pv,left:p.volledig?0:debt,end,pts};
}

const Reken={STANDAARD,draagkrachtJaar,sim};
if(typeof module!=='undefined'&&module.exports)module.exports=Reken;else root.Reken=Reken;
})(this);
