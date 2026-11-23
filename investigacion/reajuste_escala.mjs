// ¿Está acotado el REAJUSTE (T − t*) o también crece con la distancia?
//
// Para cada fase con primeras visitas, se toman semillas a distancias
// crecientes (hasta t* ~ 10^6) y se mide el reajuste. El teorema solo dice
// T > t*; esto mide cuánto más.

import { KK } from './motor.mjs';
const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];

const TMAX = 1_050_000;
const sx = new Float64Array(TMAX + 1), sy = new Float64Array(TMAX + 1);
{
  const black = new Set(); let x = 0, y = 0, d = 0;
  for (let t = 1; t <= TMAX; t++) {
    const k = KK(x, y);
    if (black.has(k)) { d = (d + 3) & 3; black.delete(k); } else { d = (d + 1) & 3; black.add(k); }
    x += DX[d]; y += DY[d]; sx[t] = x; sy[t] = y;
  }
}
const primera = new Map();
for (let t = 0; t <= TMAX; t++) { const k = KK(sx[t], sy[t]); if (!primera.has(k)) primera.set(k, t); }
const esPrimera = (t) => t >= 0 && t <= TMAX && primera.get(KK(sx[t], sy[t])) === t;

function reajuste(tStar, capExtra = 200000) {
  const cap = Math.min(tStar + capExtra, TMAX + 400000);
  const black = new Set([KK(sx[tStar], sy[tStar])]);
  let x = 0, y = 0, d = 0;
  const px = new Float64Array(cap + 1), py = new Float64Array(cap + 1);
  let last = 0, prev = null;
  for (let t = 1; t <= cap; t++) {
    const k = KK(x, y);
    if (black.has(k)) { d = (d + 3) & 3; black.delete(k); } else { d = (d + 1) & 3; black.add(k); }
    x += DX[d]; y += DY[d];
    px[t] = x; py[t] = y;
    if (t >= 104) {
      const dx = x - px[t - 104], dy = y - py[t - 104];
      if (prev && (dx !== prev[0] || dy !== prev[1])) last = t;
      prev = [dx, dy];
    }
  }
  return { reajuste: last - tStar, tope: last === cap };
}

// Fases presentes como primera visita, y primera visita más cercana a cada objetivo.
const objetivos = [30_000, 100_000, 300_000, 1_000_000];
const fases = [...new Set(Array.from(primera.values()).filter((t) => t > 20000 && t < 40000).map((t) => t % 104))].sort((a, b) => a - b);
console.log(`fases con primeras visitas: ${fases.length}`);

const resultados = objetivos.map(() => []);
let topes = 0;

for (const objetivo of objetivos) {
  for (const f of fases) {
    // primera visita de esa fase más próxima al objetivo
    let mejor = -1, mejorD = Infinity;
    for (let t = Math.max(20000, objetivo - 3000); t <= Math.min(TMAX, objetivo + 3000); t++) {
      if (t % 104 === f && esPrimera(t)) { const d = Math.abs(t - objetivo); if (d < mejorD) { mejorD = d; mejor = t; } }
    }
    if (mejor < 0) continue;
    const r = reajuste(mejor);
    if (r.tope) topes++;
    resultados[objetivos.indexOf(objetivo)].push({ t: mejor, r: r.reajuste });
  }
  const rs = resultados[objetivos.indexOf(objetivo)].map((o) => o.r).sort((a, b) => a - b);
  const q = (p) => rs[Math.floor(p * (rs.length - 1))];
  console.log(`objetivo ${String(objetivo).padStart(8)}: n=${rs.length}  min=${rs[0]}  mediana=${q(.5)}  p90=${q(.9)}  max=${rs[rs.length - 1]}`);
}

console.log(`\ncorridas que tocan el tope: ${topes}`);
const todos = resultados.flat().map((o) => o.r);
console.log(`máximo global del reajuste: ${Math.max(...todos)}`);
