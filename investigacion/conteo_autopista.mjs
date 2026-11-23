// TEOREMA DEL CONTEO: en la autopista estándar, el número de celdas negras
// crece EXACTAMENTE 12 por cada ciclo de 104 pasos.
//
// Prueba (a partir del certificado): el ciclo que empieza en t+104 es el
// trasladado por v del que empieza en t (misma dirección, mismo patrón en la
// ventana visitada). El número de celdas negras que se crean/destruyen en un
// ciclo es una función del patrón y de la secuencia de visitas, ambas iguales
// salvo traslación. Luego |B(t+104)| − |B(t)| es una constante C. Se mide C.
//
// Este script comprueba C en TODOS los instantes de un rango amplio.

import { KK } from './motor.mjs';
const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];

const TMAX = 400000;
const black = new Set();
const cuenta = new Int32Array(TMAX + 1);
let x = 0, y = 0, d = 0;
cuenta[0] = 0;
for (let t = 1; t <= TMAX; t++) {
  const k = KK(x, y);
  if (black.has(k)) { d = (d + 3) & 3; black.delete(k); }
  else { d = (d + 1) & 3; black.add(k); }
  x += DX[d]; y += DY[d];
  cuenta[t] = black.size;
}

const T0 = 11000;
const C = new Map();
let desviaciones = 0;
for (let t = T0; t + 104 <= TMAX; t++) {
  const delta = cuenta[t + 104] - cuenta[t];
  C.set(delta, (C.get(delta) || 0) + 1);
  if (delta !== 12) {
    desviaciones++;
    if (desviaciones <= 10) console.log(`  t=${t}: |B(t+104)|-|B(t)| = ${delta}`);
  }
}

console.log(`comprobados t en [${T0}, ${TMAX - 104}] = ${TMAX - 104 - T0 + 1} instantes`);
console.log(`desviaciones de +12: ${desviaciones}`);
console.log('distribución de incrementos:', [...C].sort((a, b) => a[0] - b[0]).map(([k, v]) => `${k}:${v}`).join('  '));

// Fórmula exacta: |B(t)| = |B(t0)| + 12 * floor((t - t0)/104) + r(t mod 104)
// Se comprueba calculando, para una base t0 en la autopista, la tabla de residuos.
const t0 = 11000;
const residuo = new Int32Array(104);
for (let j = 0; j < 104; j++) residuo[j] = cuenta[t0 + j] - cuenta[t0];
let formulaOk = true;
for (let t = t0; t <= TMAX; t++) {
  const k = Math.floor((t - t0) / 104);
  const j = (t - t0) % 104;
  const pred = cuenta[t0] + 12 * k + residuo[j];
  if (pred !== cuenta[t]) {
    formulaOk = false;
    if (formulaOk) console.log(`  fórmula falla en t=${t}: pred=${pred} real=${cuenta[t]}`);
    break;
  }
}
console.log(`\n|B(${t0})| = ${cuenta[t0]}`);
console.log(`fórmula |B(t)| = ${cuenta[t0]} + 12*floor((t-${t0})/104) + residuo(t-${t0} mod 104): ${formulaOk ? 'válida en todo el rango' : 'FALLA'}`);
console.log('residuo (104 valores):', Array.from(residuo).join(','));

// Comprobación de los valores citados en los informes.
for (const t of [20000, 50000, 100000, 200000, 400000]) {
  console.log(`  |B(${t})| = ${cuenta[t]}`);
}
