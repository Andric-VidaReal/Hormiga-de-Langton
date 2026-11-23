import { simulate, KK } from './motor.mjs';

const CAP = 400_000;
const cells = [];
for (let y = -2; y <= 1; y++) for (let x = -2; x <= 1; x++) cells.push([x, y]);
const n = cells.length;

const vTally = new Map();
const Ts = [];
let bad = 0;
const perBlack = new Map(); // #negras -> [T...]

for (let mask = 0; mask < (1 << n); mask++) {
  const keys = [];
  let cnt = 0;
  for (let i = 0; i < n; i++) if (mask & (1 << i)) { keys.push(KK(cells[i][0], cells[i][1])); cnt++; }
  const r = simulate(keys, CAP);
  if (!r.detected) { bad++; continue; }
  const vk = r.v[0] + ',' + r.v[1];
  vTally.set(vk, (vTally.get(vk) || 0) + 1);
  Ts.push(r.T);
  if (!perBlack.has(cnt)) perBlack.set(cnt, []);
  perBlack.get(cnt).push(r.T);
}

Ts.sort((a, b) => a - b);
const q = (p) => Ts[Math.floor(p * (Ts.length - 1))];
console.log(`configs=${(1 << n)}  sin certificar=${bad}`);
console.log('DESPLAZAMIENTOS de autopista (por 104 pasos):');
for (const [k, c] of [...vTally].sort((a, b) => b[1] - a[1])) console.log(`   v=(${k})  ->  ${c}`);
console.log(`\nTRANSITORIO T: min=${Ts[0]}  p10=${q(.1)}  p25=${q(.25)}  p50=${q(.5)}  p75=${q(.75)}  p90=${q(.9)}  p99=${q(.99)}  max=${Ts[Ts.length - 1]}`);
console.log(`media=${(Ts.reduce((a, b) => a + b, 0) / Ts.length).toFixed(0)}`);

console.log('\nT medio por número de celdas negras iniciales:');
for (const c of [...perBlack.keys()].sort((a, b) => a - b)) {
  const arr = perBlack.get(c);
  const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
  console.log(`   ${String(c).padStart(2)} negras: n=${String(arr.length).padStart(5)}  T_medio=${avg.toFixed(0).padStart(7)}  T_max=${Math.max(...arr)}`);
}
