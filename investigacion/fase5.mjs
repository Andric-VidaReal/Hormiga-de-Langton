// FASE 5: ampliación exhaustiva del espacio de configuraciones.
//
// A) UNA sola celda negra en todo el cuadrado [-128,128]^2  (65 535 configs)
// B) DOS celdas negras en [-8,8]^2                         (~41 000 configs)
// C) 5x5 aleatorias (50 000)
// D) 9x9 aleatorias (20 000)
//
// Todas con el certificador corregido (periodicidad local + frente limpio).

import { simulateAbsorb, KK, rng } from './motor.mjs';

const CAP = 2_000_000;

function resumen(nombre, gen, total) {
  const t0 = Date.now();
  let ok = 0, mal = 0, maxT = -1, peor = null, i = 0;
  const vs = new Map();
  const Ts = [];
  for (const { etiqueta, keys } of gen) {
    const r = simulateAbsorb(keys, CAP);
    i++;
    if (r.detected) {
      ok++;
      Ts.push(r.T);
      const vk = r.v.join(',');
      vs.set(vk, (vs.get(vk) || 0) + 1);
      if (r.T > maxT) { maxT = r.T; peor = etiqueta; }
    } else {
      mal++;
      if (mal <= 10) console.log(`   SIN CERTIFICAR: ${etiqueta} motivo=${r.reason}`);
    }
    if (i % 10000 === 0) {
      console.log(`   ... ${i}/${total}  (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
    }
  }
  Ts.sort((a, b) => a - b);
  const q = (p) => Ts[Math.floor(p * (Ts.length - 1))];
  console.log(`\n${nombre}`);
  console.log(`  configs=${i}  certificadas=${ok}  sin certificar=${mal}  tiempo=${((Date.now() - t0) / 1000).toFixed(0)}s`);
  if (Ts.length) {
    console.log(`  T: min=${Ts[0]}  p50=${q(.5)}  p90=${q(.9)}  p99=${q(.99)}  max=${maxT}`);
    console.log(`  peor: ${peor}`);
  }
  console.log(`  v: ${[...vs].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k}:${n}`).join('  ')}`);
  return mal;
}

// A) una celda
function* unaCelda(R) {
  for (let y = -R; y <= R; y++) for (let x = -R; x <= R; x++) {
    if (x === 0 && y === 0) continue;
    yield { etiqueta: `una (${x},${y})`, keys: [KK(x, y)] };
  }
}
resumen('A) UNA celda en [-128,128]^2', unaCelda(128), 257 * 257 - 1);

// B) pares
const celdasB = [];
for (let y = -8; y <= 8; y++) for (let x = -8; x <= 8; x++) if (!(x === 0 && y === 0)) celdasB.push([x, y]);
function* pares() {
  for (let i = 0; i < celdasB.length; i++) for (let j = i + 1; j < celdasB.length; j++) {
    yield { etiqueta: `par (${celdasB[i]})(${celdasB[j]})`, keys: [KK(...celdasB[i]), KK(...celdasB[j])] };
  }
}
resumen('B) DOS celdas en [-8,8]^2', pares(), (celdasB.length * (celdasB.length - 1)) / 2);

// C) 5x5 aleatorias
const rand = rng(555);
function* aleatorias(n, L, densidad) {
  for (let k = 0; k < n; k++) {
    const keys = [];
    for (let y = -L; y <= L; y++) for (let x = -L; x <= L; x++) {
      if (x === 0 && y === 0) continue;
      if (rand() < densidad) keys.push(KK(x, y));
    }
    yield { etiqueta: `5x5 #${k} (${keys.length} celdas)`, keys };
  }
}
resumen('C) 5x5 aleatorias (50 000)', aleatorias(50000, 2, 0.5), 50000);

// D) 9x9 aleatorias
resumen('D) 9x9 aleatorias (20 000)', aleatorias(20000, 4, 0.35), 20000);
