// TEOREMA: el transitorio no está acotado (demostración directa).
//
// Idea: por el certificado, la autopista estándar satisface
//   p(t+104) = p(t) + v,   v = (-2, 2),   para todo t >= 10496.
// Sea t* > N un instante en que la hormiga estándar PISA POR PRIMERA VEZ una
// celda c. Pongamos c negra y nada más. Como c no se lee antes de t*, la
// trayectoria perturbada coincide EXACTAMENTE con la estándar para t <= t*.
// Por tanto D(t*) = p(t*) - p(t*-104) = v (desplazamiento de la autopista).
// Pero en el paso t*+1 la hormiga lee c NEGRA en vez de blanca y gira al otro
// lado, así que D(t*+1) != v. Luego el desplazamiento a 104 pasos cambia en
// t*+1 > N: el último cambio de régimen es > N, sin necesidad de saber qué
// pasa después.
//
// El script verifica, además, que la coincidencia es exacta paso a paso.

import { KK } from './motor.mjs';
const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];

const TMAX = 1_200_000;
const sx = new Float64Array(TMAX + 1), sy = new Float64Array(TMAX + 1);
{
  const black = new Set();
  let x = 0, y = 0, d = 0;
  sx[0] = 0; sy[0] = 0;
  for (let t = 1; t <= TMAX; t++) {
    const k = KK(x, y);
    if (black.has(k)) { d = (d + 3) & 3; black.delete(k); }
    else { d = (d + 1) & 3; black.add(k); }
    x += DX[d]; y += DY[d];
    sx[t] = x; sy[t] = y;
  }
}

// Primera visita: se calcula con un Map indexado por clave (memoria suficiente
// para 1.2 M posiciones distintas).
const primeraVisita = new Map();
for (let t = 0; t <= TMAX; t++) {
  const k = KK(sx[t], sy[t]);
  if (!primeraVisita.has(k)) primeraVisita.set(k, t);
}

const vStd = [-2, 2];
const HIGHWAY = 10496;

function D(t) { return [sx[t] - sx[t - 104], sy[t] - sy[t - 104]]; }

// Corrida con una celda negra en `semilla`; devuelve trayectoria y último cambio.
function correr(semilla, cap) {
  const black = new Set([semilla]);
  let x = 0, y = 0, d = 0;
  const px = new Float64Array(cap + 1), py = new Float64Array(cap + 1);
  px[0] = 0; py[0] = 0;
  let last = 0, prev = null, finalD = null;
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
      finalD = [dx, dy];
    }
  }
  return { px, py, last, finalD };
}

// Busca el primer t > desde con primera visita.
function primerNueva(desde) {
  for (let t = desde + 1; t <= TMAX; t++) {
    if (primeraVisita.get(KK(sx[t], sy[t])) === t) return t;
  }
  return -1;
}

console.log('N          t*          celda c              D(t*)      D(t*+1)     coincide hasta t*   último cambio   > N');
console.log('----------------------------------------------------------------------------------------------------');
for (const N of [20000, 50000, 100000, 300000, 1000000]) {
  const tStar = primerNueva(Math.max(N, HIGHWAY + 104));
  const c = [sx[tStar], sy[tStar]];
  const cap = tStar + 200000;
  const r = correr(KK(c[0], c[1]), cap);

  // ¿Coincide con la estándar para todo t <= t*?
  let coincide = true;
  for (let t = 0; t <= tStar; t++) {
    if (r.px[t] !== sx[t] || r.py[t] !== sy[t]) { coincide = false; break; }
  }
  const dT = D(tStar);
  const dT1 = [r.px[tStar + 1] - r.px[tStar - 103], r.py[tStar + 1] - r.py[tStar - 103]];

  console.log(
    `${String(N).padStart(8)}  ${String(tStar).padStart(8)}  ` +
    `(${String(c[0]).padStart(7)},${String(c[1]).padStart(7)})  ` +
    `(${String(dT).padStart(6)})  (${String(dT1).padStart(6)})  ` +
    `${coincide ? 'SÍ' : 'NO'}                ${String(r.last).padStart(9)}   ${r.last > N ? 'SÍ' : 'NO'}`
  );
}

console.log('\nComprobación extra: en la autopista estándar D(t) = (-2,2) para todo t >= 10496.');
let todoV = true;
for (let t = HIGHWAY + 104; t <= HIGHWAY + 5000; t += 7) {
  const d = D(t);
  if (d[0] !== -2 || d[1] !== 2) { todoV = false; console.log('  fallo en t=', t, d); break; }
}
console.log('  ', todoV ? 'verificado en la ventana muestreada' : 'FALLO');
