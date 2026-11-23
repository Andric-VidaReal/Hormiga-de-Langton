import { KK } from './motor.mjs';
const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];
const G = [[0,-1],[1,1],[1,3],[2,2]];

function run(offs, d0, n) {
  const black = new Set(offs.map(([x,y]) => KK(x,y)));
  let x=0,y=0,d=d0, minx=0;
  for (let t=1;t<=n;t++) {
    const k=KK(x,y);
    if (black.has(k)) { d=(d+3)&3; black.delete(k); } else { d=(d+1)&3; black.add(k); }
    x+=DX[d]; y+=DY[d]; minx=Math.min(minx,x);
  }
  return {x,y,d,n:black.size,minx};
}

// Reflejo y -> -y, y también reflejo x -> -x (por si acaso)
const variantes = {
  original: G,
  espejoY: G.map(([x,y]) => [x,-y]),
  espejoX: G.map(([x,y]) => [-x,y]),
  espejoXY: G.map(([x,y]) => [-x,-y]),
  rot90: G.map(([x,y]) => [-y,x]),
  rot90inv: G.map(([x,y]) => [y,-x]),
};
for (const [nombre, offs] of Object.entries(variantes)) {
  for (const d0 of [1,3]) {
    const r = run(offs,d0,182);
    console.log(`${nombre.padEnd(9)} d0=${d0}: pos=(${r.x},${r.y}) dir=${r.d} negras=${r.n} minx=${r.minx}`);
  }
}
