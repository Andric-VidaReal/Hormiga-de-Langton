// LEY EXACTA DEL REAJUSTE (versión corregida)
//
// La autopista estándar cumple estado(t+104) = estado(t) + v,  v=(-2,2).
// Sea c una celda cuya PRIMERA visita ocurre en t*. La configuración
// "solo c negra" coincide con la estándar hasta t* y se desvía en t*+1.
//
// Si t* y t*+104 son ambas primeras visitas (de c y de c+v), entonces el
// estado perturbado en t*+104 es el trasladado por v del estado en t*, así que
// las evoluciones posteriores son idénticas salvo traslación y
//
//     T(t*+104) = T(t*) + 104   =>   reajuste = T - t*  es CONSTANTE.
//
// El reajuste depende solo de la fase (t* mod 104), no de la distancia.

import { KK } from './motor.mjs';
const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];

const TMAX = 400000;
const sx = new Float64Array(TMAX + 1), sy = new Float64Array(TMAX + 1);
{
  const black = new Set();
  let x = 0, y = 0, d = 0;
  for (let t = 1; t <= TMAX; t++) {
    const k = KK(x, y);
    if (black.has(k)) { d = (d + 3) & 3; black.delete(k); }
    else { d = (d + 1) & 3; black.add(k); }
    x += DX[d]; y += DY[d];
    sx[t] = x; sy[t] = y;
  }
}

const primera = new Map();
for (let t = 0; t <= TMAX; t++) {
  const k = KK(sx[t], sy[t]);
  if (!primera.has(k)) primera.set(k, t);
}

const esPrimera = (t) => primera.get(KK(sx[t], sy[t])) === t;

// Reajuste de la configuración "solo p(t*) negra". t* debe ser primera visita.
function reajuste(tStar, capExtra = 150000) {
  const cap = tStar + capExtra;
  const black = new Set([KK(sx[tStar], sy[tStar])]);
  let x = 0, y = 0, d = 0;
  const px = new Float64Array(cap + 1), py = new Float64Array(cap + 1);
  let last = 0, prev = null;
  for (let t = 1; t <= cap; t++) {
    const k = KK(x, y);
    if (black.has(k)) { d = (d + 3) & 3; black.delete(k); }
    else { d = (d + 1) & 3; black.add(k); }
    x += DX[d]; y += DY[d];
    px[t] = x; py[t] = y;
    if (t >= 104) {
      const dx = x - px[t - 104], dy = y - py[t - 104];
      if (prev && (dx !== prev[0] || dy !== prev[1])) last = t;
      prev = [dx, dy];
    }
  }
  return { T: last, reajuste: last - tStar, final: prev, tope: last === cap };
}

// --- inventario de primeras visitas por fase en [15000, 150000] ---
const porFase = Array.from({ length: 104 }, () => []);
for (let t = 15000; t <= 150000; t++) {
  if (esPrimera(t)) porFase[t % 104].push(t);
}
let minFase = Infinity, maxFase = -1;
for (let f = 0; f < 104; f++) {
  minFase = Math.min(minFase, porFase[f].length);
  maxFase = Math.max(maxFase, porFase[f].length);
}
console.log(`Primeras visitas por fase en [15000,150000]: min=${minFase} max=${maxFase} total=${porFase.reduce((a, b) => a + b.length, 0)}`);

// --- verificación de la ley: 3 primeras visitas por fase, muy separadas ---
const R = new Array(104).fill(null);
let fallos = 0, topes = 0, medidas = 0;
const detalles = [];

for (let f = 0; f < 104; f++) {
  const lista = porFase[f];
  if (!lista.length) continue;
  const muestras = [...new Set([lista[0], lista[Math.floor(lista.length / 2)], lista[lista.length - 1]])];
  const vals = [];
  for (const t of muestras) {
    const r = reajuste(t);
    vals.push(r.reajuste);
    if (r.tope) topes++;
    medidas++;
  }
  R[f] = vals[0];
  if (!vals.every((v) => v === vals[0])) {
    fallos++;
    detalles.push(`fase ${f}: ${muestras.map((t, i) => `t*=${t}->${vals[i]}`).join('  ')}`);
  }
}

console.log(`\nFases probadas: ${R.filter((v) => v !== null).length}/104   corridas=${medidas}`);
console.log(`Fases donde el reajuste NO es constante: ${fallos}   (topes=${topes})`);
for (const d of detalles) console.log('   ' + d);

const vals = R.filter((v) => v !== null).sort((a, b) => a - b);
const media = vals.reduce((a, b) => a + b, 0) / vals.length;
console.log(`\nReajuste por fase: min=${vals[0]}  mediana=${vals[Math.floor(vals.length / 2)]}  max=${vals[vals.length - 1]}  media=${media.toFixed(1)}`);

// --- los puntos sueltos del informe anterior: cuál era su primera visita real ---
console.log('\nPuntos del informe anterior (t nominal -> primera visita real -> reajuste):');
for (const t of [20000, 50000, 100000, 200000, 300000]) {
  const fv = primera.get(KK(sx[t], sy[t]));
  const r = reajuste(fv);
  console.log(`  nominal ${String(t).padStart(6)}  primera visita ${String(fv).padStart(6)}  ` +
    `fase ${String(fv % 104).padStart(3)}  reajuste ${String(r.reajuste).padStart(6)}  T=${fv + r.reajuste}`);
}
