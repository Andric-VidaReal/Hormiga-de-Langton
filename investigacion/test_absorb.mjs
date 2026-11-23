import { simulateAbsorb, simulate, KK } from './motor.mjs';
const DX=[0,1,0,-1], DY=[-1,0,1,0];

console.log('vacío:', simulateAbsorb([], 200000));

const targets=[20000,50000,100000,200000,300000];
const posAt=new Map();
{
  const black=new Set(); let x=0,y=0,d=0;
  for(let t=1;t<=300000;t++){
    const k=KK(x,y); if(black.has(k)){d=(d+3)&3;black.delete(k);} else {d=(d+1)&3;black.add(k);}
    x+=DX[d]; y+=DY[d]; if(targets.includes(t)) posAt.set(t,[x,y]);
  }
}
console.log('\ncelda en trayectoria: absorbida + certificado');
for(const tHit of targets){
  const [px,py]=posAt.get(tHit);
  const r=simulateAbsorb([KK(px,py)], tHit+400000);
  console.log(`  t_hit=${String(tHit).padStart(6)} pos=(${px},${py})  ` +
    `${r.detected?`T=${r.T} (absorbida en ${r.lastAbsorb}) v=${r.v}`:`sin certificar: ${r.reason}`}`);
}
