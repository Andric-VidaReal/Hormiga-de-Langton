// CASCADAS: semillas en las primeras visitas de la autopista estándar.
//
// Se siembra un bloque de celdas negras en las m primeras visitas posteriores a
// t=20000. La primera rompe la autopista; las demás pueden provocar reimpactos.
// Pregunta: ¿crece el transitorio con m? ¿Aparecen transitorios mucho mayores
// que el retraso t* de una sola semilla?

import { KK } from './motor.mjs';
const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];

const TMAX = 400000;
const sx = new Float64Array(TMAX + 1), sy = new Float64Array(TMAX + 1);
const primera = new Map();
{
  const black = new Set(); let x = 0, y = 0, d = 0;
  for (let t = 1; t <= TMAX; t++) {
    const k = KK(x, y);
    if (black.has(k)) { d = (d + 3) & 3; black.delete(k); } else { d = (d + 1) & 3; black.add(k); }
    x += DX[d]; y += DY[d]; sx[t] = x; sy[t] = y;
    const kk = KK(x, y);
    if (!primera.has(kk)) primera.set(kk, t);
  }
}
const primeras = [];
for (let t = 20001; t <= TMAX; t++) if (primera.get(KK(sx[t], sy[t])) === t) primeras.push(t);

function correr(seeds, cap) {
  const initial = new Set(seeds);
  const black = new Set(seeds);
  const cruzada = new Set();
  let x = 0, y = 0, d = 0;
  const px = new Float64Array(cap + 1), py = new Float64Array(cap + 1);
  let last = 0, prev = null;
  for (let t = 1; t <= cap; t++) {
    const k = KK(x, y);
    if (initial.has(k)) cruzada.add(k);
    if (black.has(k)) { d = (d + 3) & 3; black.delete(k); } else { d = (d + 1) & 3; black.add(k); }
    x += DX[d]; y += DY[d];
    px[t] = x; py[t] = y;
    if (t >= 104) {
      const dx = x - px[t - 104], dy = y - py[t - 104];
      if (prev && (dx !== prev[0] || dy !== prev[1])) last = t;
      prev = [dx, dy];
    }
  }
  return { last, final: prev, cruzadas: cruzada.size, tope: last === cap };
}

const caps = 1_500_000;
console.log('m     celdas   ventana temporal        cruzadas   último cambio   v final      ¿asentada?');
console.log('-------------------------------------------------------------------------------------------');
const filas = [];
for (const m of [1, 2, 3, 5, 8, 12, 16, 22, 32, 44, 66, 88, 132, 176, 264]) {
  const ts = primeras.slice(0, m);
  const seeds = ts.map((t) => KK(sx[t], sy[t]));
  const r = correr(seeds, caps);
  filas.push({ m, T: r.last, ...r });
  console.log(
    `${String(m).padStart(3)}   ${String(m).padStart(6)}   ` +
    `${String(ts[0]).padStart(6)}..${String(ts[m - 1]).padStart(6)}   ` +
    `${String(r.cruzadas).padStart(8)}   ${String(r.last).padStart(13)}   ` +
    `(${String(r.final).padStart(6)})   ${r.tope ? 'NO (tope)' : 'sí'}`
  );
}

const maxT = Math.max(...filas.map((f) => f.T));
console.log(`\nmáximo último cambio: ${maxT}`);
console.log('¿crece con m?', filas.map((f) => `${f.m}:${f.T}`).join('  '));
