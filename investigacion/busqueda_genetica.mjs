// BÚSQUEDA GENÉTICA DE TRANSITORIOS LARGOS
//
// Populación de configuraciones en una caja 25x25. Fitness = T (paso en que se
// certifica la autopista). Mutación = voltear 1-5 celdas; cruce = unión
// aleatoria de dos padres. Si una configuración no certifica en el horizonte,
// recibe fitness máximo: sería candidata a contraejemplo.

import { simulateAbsorb, KK } from './motor.mjs';

const CAP = 1_000_000;
const L = 12;
const celdas = [];
for (let y = -L; y <= L; y++) for (let x = -L; x <= L; x++) if (!(x === 0 && y === 0)) celdas.push([x, y]);

let s = 0x9e3779b9 >>> 0;
const rnd = () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
const elige = (a) => a[Math.floor(rnd() * a.length)];

function fitness(bits) {
  const keys = [];
  for (let i = 0; i < bits.length; i++) if (bits[i]) keys.push(KK(celdas[i][0], celdas[i][1]));
  if (keys.length === 0) return 1;
  const r = simulateAbsorb(keys, CAP);
  return r.detected ? r.T : CAP;
}

function mutar(bits, n) {
  const b = bits.slice();
  for (let k = 0; k < n; k++) {
    const i = Math.floor(rnd() * b.length);
    b[i] = b[i] ? 0 : 1;
  }
  return b;
}

function cruzar(a, b) {
  const c = a.slice();
  for (let i = 0; i < c.length; i++) if (rnd() < 0.5) c[i] = b[i];
  return c;
}

function aBitmap(keys) {
  const b = new Uint8Array(celdas.length);
  const set = new Set(keys);
  for (let i = 0; i < celdas.length; i++) if (set.has(KK(celdas[i][0], celdas[i][1]))) b[i] = 1;
  return b;
}

// Semilla: la peor configuración de una sola celda conocida
const semillas = [aBitmap([[7, -7]]), aBitmap([[7, -7], [-8, 6]]), aBitmap([[0, 1], [-1, 0]])];
let poblacion = semillas.map((b) => ({ bits: b, f: fitness(b) }));
for (let i = 0; i < 29; i++) {
  const b = new Uint8Array(celdas.length);
  for (let j = 0; j < celdas.length; j++) if (rnd() < 0.15) b[j] = 1;
  poblacion.push({ bits: b, f: fitness(b) });
}

let mejor = Math.max(...poblacion.map((p) => p.f));
let mejorBits = poblacion.find((p) => p.f === mejor).bits;
let evalCount = poblacion.length;
console.log(`inicial: mejor T=${mejor}`);

const GENERACIONES = 400;
for (let g = 1; g <= GENERACIONES; g++) {
  poblacion.sort((a, b) => b.f - a.f);
  const elite = poblacion.slice(0, 6);
  const hijos = [];
  while (hijos.length < 26) {
    const modo = rnd();
    let b;
    if (modo < 0.35) b = mutar(elige(elite).bits, 1 + Math.floor(rnd() * 3));
    else if (modo < 0.6) b = mutar(elige(elite).bits, 4 + Math.floor(rnd() * 4));
    else if (modo < 0.85) b = cruzar(elige(elite).bits, elige(elite).bits);
    else {
      b = new Uint8Array(celdas.length);
      for (let j = 0; j < celdas.length; j++) if (rnd() < 0.12) b[j] = 1;
    }
    const f = fitness(b);
    evalCount++;
    hijos.push({ bits: b, f });
    if (f > mejor) {
      mejor = f;
      mejorBits = b;
      const offs = [];
      for (let i = 0; i < b.length; i++) if (b[i]) offs.push(celdas[i]);
      console.log(`  gen ${g}: NUEVO MÁXIMO T=${mejor}  celdas=${offs.length}  muestra=${JSON.stringify(offs.slice(0, 12))}`);
    }
  }
  poblacion = [...elite, ...hijos];
  if (g % 50 === 0) console.log(`  gen ${g}: mejor=${mejor}  evaluaciones=${evalCount}`);
}

console.log(`\nmejor T encontrado: ${mejor}`);
console.log(`evaluaciones: ${evalCount}`);
const offs = [];
for (let i = 0; i < mejorBits.length; i++) if (mejorBits[i]) offs.push(celdas[i]);
console.log(`configuración (${offs.length} celdas): ${JSON.stringify(offs)}`);
