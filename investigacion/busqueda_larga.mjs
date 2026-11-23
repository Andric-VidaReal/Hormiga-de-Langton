// BÚSQUEDA ADVERSARIA DE LARGO HORIZONTE
//
// Estructuras diseñadas para dificultar la convergencia: muros, peines, anillos,
// tableros de ajedrez, bloques simétricos y aleatorios densos. Horizonte 10^7.
// Objetivo: encontrar el mayor transitorio observado, y sobre todo cualquier
// configuración que NO certifique (candidato a contraejemplo de la conjetura).

import { simulateAbsorb, KK } from './motor.mjs';

const CAP = 10_000_000;
const casos = [];
const add = (nombre, celdas) => casos.push({ nombre, keys: celdas.map(([x, y]) => KK(x, y)) });

// Muros horizontales / verticales a distancia D
for (const D of [10, 50, 100, 300]) {
  for (const L of [20, 100, 400]) {
    const h = [], v = [];
    for (let i = -L; i <= L; i++) { h.push([i, D]); v.push([D, i]); }
    add(`muro horizontal D=${D} L=${L}`, h);
    add(`muro vertical D=${D} L=${L}`, v);
  }
}
// Peines: varios muros paralelos
for (const pasoMuro of [10, 30, 100]) {
  const off = [];
  for (let y = 10; y <= 10 + 5 * pasoMuro; y += pasoMuro)
    for (let x = -200; x <= 200; x++) off.push([x, y]);
  add(`peine paso=${pasoMuro}`, off);
}
// Anillos cuadrados concéntricos
for (const n of [2, 5, 10, 30]) {
  const off = [];
  for (let k = 1; k <= n; k++) {
    const r = k * 4;
    for (let i = -r; i <= r; i++) {
      off.push([i, -r], [i, r], [-r, i], [r, i]);
    }
  }
  add(`anillos n=${n}`, off);
}
// Tablero de ajedrez
for (const L of [10, 25, 50]) {
  const off = [];
  for (let y = -L; y <= L; y++) for (let x = -L; x <= L; x++)
    if (((x + y) & 1) === 0) off.push([x, y]);
  add(`ajedrez L=${L}`, off);
}
// Cruces y diagonales
for (const L of [50, 200]) {
  const cruz = [], equis = [], diag = [];
  for (let i = -L; i <= L; i++) {
    cruz.push([i, 0], [0, i]);
    equis.push([i, i], [i, -i]);
    diag.push([i, i]);
  }
  add(`cruz L=${L}`, cruz);
  add(`equis L=${L}`, equis);
  add(`diagonal L=${L}`, diag);
}
// Bloques sólidos
for (const L of [5, 15, 40]) {
  const off = [];
  for (let y = -L; y <= L; y++) for (let x = -L; x <= L; x++) off.push([x, y]);
  add(`bloque L=${L}`, off);
}
// Aleatorios densos, soporte grande
let s = 0xabcdef01 >>> 0;
const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
for (const [L, dens] of [[10, 0.25], [10, 0.5], [10, 0.75], [25, 0.1], [25, 0.25], [25, 0.5], [60, 0.05], [60, 0.15]]) {
  for (let rep = 0; rep < 12; rep++) {
    const off = [];
    for (let y = -L; y <= L; y++) for (let x = -L; x <= L; x++)
      if (!(x === 0 && y === 0) && rnd() < dens) off.push([x, y]);
    add(`aleatorio L=${L} d=${dens} #${rep}`, off);
  }
}

console.log(`casos: ${casos.length}   horizonte: ${CAP} pasos`);
const t0 = Date.now();
let ok = 0, sinCert = 0, maxT = -1, peor = null;
const largos = [];

for (let i = 0; i < casos.length; i++) {
  const { nombre, keys } = casos[i];
  const r = simulateAbsorb(keys, CAP);
  if (r.detected) {
    ok++;
    if (r.T > maxT) { maxT = r.T; peor = `${nombre} (${keys.length} celdas, v=${r.v})`; }
    if (r.T > 500000) largos.push(`${nombre}: T=${r.T}`);
  } else {
    sinCert++;
    console.log(`  *** SIN CERTIFICAR: ${nombre} (${keys.length} celdas) motivo=${r.reason} absorbidas=${r.absorbed}/${r.needed}`);
  }
  if ((i + 1) % 25 === 0) console.log(`  ... ${i + 1}/${casos.length} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
}

console.log(`\ncertificadas=${ok}  sin certificar=${sinCert}  tiempo=${((Date.now() - t0) / 1000).toFixed(0)}s`);
console.log(`máximo T=${maxT}  -> ${peor}`);
console.log(`casos con T>500000: ${largos.length}`);
for (const l of largos) console.log('  ' + l);
