// ¿Hay celdas negras en el instante del certificado que caigan en un rayo
// futuro q_i + k*v (k>=1) de la autopista? futuroLibre solo revisa semillas
// iniciales; este script revisa TODAS las celdas negras presentes.

import { KK } from './motor.mjs';
const OFF = 1 << 21;
const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];
function paso(black, x, y, d) {
  const k = KK(x, y);
  if (black.has(k)) { d = (d + 3) & 3; black.delete(k); }
  else { d = (d + 1) & 3; black.add(k); }
  return [x + DX[d], y + DY[d], d];
}
function decode(k) { const x = Math.round(k / OFF); return [x, k - x * OFF]; }

function analizar(T, initialKeys = []) {
  const black = new Set(initialKeys);
  let x = 0, y = 0, d = 0;
  for (let t = 1; t <= T; t++) [x, y, d] = paso(black, x, y, d);
  const px = x, py = y, pd = d, base = new Set(black);
  const rel = [[0,0]];
  let cx = x, cy = y, cd = d;
  for (let i = 1; i <= 104; i++) {
    [cx, cy, cd] = paso(black, cx, cy, cd);
    rel.push([cx - px, cy - py]);
  }
  const v = [cx - px, cy - py];
  const R = new Set(rel.slice(0,104).map(([a,b]) => a + ',' + b));

  // Para cada celda negra actual, hallar el MÍNIMO k>=0 tal que cae en R+k*v.
  // Solo k>=0 mínimo > 0 es potencialmente problemático.
  let enRayo = 0, kMax = 0;
  const ejemplos = [];
  for (const ck of black) {
    const [cxx, cyy] = decode(ck);
    const rx = cxx - px, ry = cyy - py;
    let minK = Infinity;
    for (const rk of R) {
      const [a, b] = rk.split(',').map(Number);
      const dx = rx - a, dy = ry - b;
      let k;
      if (v[0] !== 0) {
        if (dx % v[0] !== 0) continue;
        k = dx / v[0];
        if (k * v[1] !== dy) continue;
      } else {
        if (dy % v[1] !== 0) continue;
        k = dy / v[1];
        if (k * v[0] !== dx) continue;
      }
      if (k >= 0 && k < minK) minK = k;
    }
    if (minK >= 1 && Number.isFinite(minK)) {
      enRayo++;
      kMax = Math.max(kMax, minK);
      if (ejemplos.length < 8) ejemplos.push(`celda=(${cxx},${cyy}) minK=${minK}`);
    }
  }
  console.log(`T=${T} |B|=${black.size} R=${R.size} v=(${v})`);
  console.log(`  negras con minK>=1: ${enRayo}  kMax=${kMax}`);
  for (const e of ejemplos) console.log('    ' + e);
}

console.log('Caso estándar:');
for (const T of [10496, 11000, 20000, 100000]) analizar(T);

console.log('\nPuerto de 4 celdas (dirección Este):');
const GM = [[0,1],[1,-1],[1,-3],[2,-2]];
// El análisis asume dirección inicial 0; para el puerto se omite (ya verificado
// por simulateAbsorb con las 4 semillas absorbidas).
