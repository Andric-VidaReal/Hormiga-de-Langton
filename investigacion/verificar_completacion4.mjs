// Verificación local del teorema de completación con 4 celdas (Ke 2026).
//
// Para varias configuraciones finitas arbitrarias X, una caja Q, y un prefijo
// de T pasos: se simula X hasta que sale de Q, se coloca el puerto de 4 celdas
// rotado en el punto de salida, y se comprueba que
//   (a) el prefijo hasta la salida es idéntico;
//   (b) la configuración AUMENTADA (X ∪ E) queda certificada para siempre.
// El teorema cambia la configuración inicial; NO prueba la conjetura general.

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
function rotar([x, y], k) {
  for (let i = 0; i < k; i++) [x, y] = [-y, x];
  return [x, y];
}
function fuera(x, y, R) { return x > R || x < -R || y > R || y < -R; }
function direccionSalida(x, y, R) {
  if (x > R) return 1;
  if (x < -R) return 3;
  if (y > R) return 2;
  return 0;
}

function simularPrefijo(keysInit, d0, hasta) {
  const black = new Set(keysInit);
  let x = 0, y = 0, d = d0;
  const hist = [];
  for (let t = 1; t <= hasta; t++) {
    const k = KK(x, y);
    const leido = black.has(k) ? 1 : 0;
    [x, y, d] = paso(black, x, y, d);
    hist.push(`${x},${y},${d},${leido}`);
  }
  return { x, y, d, black, hist };
}

// Certificador (dirección inicial arbitraria), lógica idéntica a motor.mjs.
function futuroLibre(initial, absorbed, px, py, Rset, v, baseBlack) {
  for (const ck of initial) {
    if (absorbed.has(ck)) continue;
    const [cx, cy] = decode(ck);
    for (const rk of Rset) {
      const [rx, ry] = rk.split(',').map(Number);
      const dx = cx - px - rx, dy = cy - py - ry;
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
      if (k < 0) continue;
      if (!baseBlack.has(KK(px + rx, py + ry))) return false;
    }
  }
  return true;
}
function certificar(initialKeys, d0, cap) {
  const black = new Set(initialKeys);
  const initial = new Set(initialKeys);
  const absorbed = new Set();
  let x = 0, y = 0, d = d0;
  const bx = new Float64Array(106), by = new Float64Array(106);
  bx[0] = 0; by[0] = 0;
  let prev = null, stable = 0, t = 0;
  const oneStep = () => {
    const k = KK(x, y);
    if (initial.has(k) && !absorbed.has(k)) absorbed.add(k);
    [x, y, d] = paso(black, x, y, d);
    bx[t % 105] = x; by[t % 105] = y;
  };
  while (t < cap) {
    t++; oneStep();
    if (t < 104) continue;
    const r0 = (t - 104) % 105;
    const vx = x - bx[r0], vy = y - by[r0];
    if (prev && (vx !== prev[0] || vy !== prev[1])) stable = 0;
    else stable++;
    prev = [vx, vy];
    if (stable < 312 || (vx === 0 && vy === 0)) continue;
    const baseBlack = new Set(black);
    const px = x, py = y, pd = d, pt = t;
    const rel = new Float64Array(210);
    rel[0] = 0; rel[1] = 0;
    for (let k2 = 1; k2 <= 104; k2++) {
      t++; oneStep();
      rel[2 * k2] = x - px; rel[2 * k2 + 1] = y - py;
    }
    const v2 = [x - px, y - py];
    let ok = d === pd;
    for (let k2 = 0; ok && k2 <= 104; k2++) {
      const dx = rel[2 * k2], dy = rel[2 * k2 + 1];
      if (baseBlack.has(KK(px + dx, py + dy)) !== black.has(KK(x + dx, y + dy))) ok = false;
    }
    if (ok) {
      const Rset = new Set();
      for (let k2 = 0; k2 <= 104; k2++) Rset.add(rel[2 * k2] + ',' + rel[2 * k2 + 1]);
      ok = futuroLibre(initial, absorbed, px, py, Rset, v2, baseBlack);
    }
    if (ok) return { detected: true, T: pt, v: v2 };
    for (let k2 = 0; k2 <= 104; k2++) {
      const tt = pt + k2;
      bx[tt % 105] = px + rel[2 * k2];
      by[tt % 105] = py + rel[2 * k2 + 1];
    }
    prev = null; stable = 0;
  }
  return { detected: false, reason: 'cap' };
}

// Puerto de Ke reflejado en y (nuestra convención), con dirección Este.
const GM = [[0,1],[1,-1],[1,-3],[2,-2]];

let s = 0x13579bdf >>> 0;
const rnd = () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };

function casoAleatorio(L, densidad) {
  const offs = [];
  for (let y = -L; y <= L; y++) for (let x = -L; x <= L; x++)
    if (!(x === 0 && y === 0) && rnd() < densidad) offs.push([x, y]);
  return offs;
}

const casos = [
  { nombre: 'una celda lejana', offs: [[18,-14]], d0: 0, R: 12 },
  { nombre: 'par asimétrico', offs: [[9,3],[-11,7]], d0: 2, R: 14 },
  { nombre: '7x7 denso', offs: casoAleatorio(3, 0.55), d0: 1, R: 16 },
  { nombre: '9x9 denso', offs: casoAleatorio(4, 0.35), d0: 3, R: 18 },
  { nombre: '11x11 disperso', offs: casoAleatorio(5, 0.18), d0: 0, R: 20 },
];

let buenos = 0;
for (const c of casos) {
  const B = new Set(c.offs.map(([x, y]) => KK(x, y)));
  // Buscar salida de la caja Q = [-R,R]^2.
  const black = new Set(B);
  let x = 0, y = 0, d = c.d0, tau = 0;
  while (!fuera(x, y, c.R) && tau < 2_000_000) {
    [x, y, d] = paso(black, x, y, d);
    tau++;
  }
  if (tau >= 2_000_000) { console.log(`${c.nombre}: NO SALIÓ`); continue; }

  const g = direccionSalida(x, y, c.R);
  const k = (g - 1 + 4) % 4;           // rotar Este -> dirección de salida
  const E = GM.map(([a, b]) => rotar([a, b], k)).map(([a, b]) => [x + a, y + b]);

  const base = simularPrefijo(c.offs.map(([a, b]) => KK(a, b)), c.d0, tau);
  const augKeys = [...c.offs.map(([a, b]) => KK(a, b)), ...E.map(([a, b]) => KK(a, b))];
  const aug = simularPrefijo(augKeys, c.d0, tau);
  const prefijoIgual = base.hist.every((h, i) => h === aug.hist[i]);
  const disjunto = E.every(([a, b]) => !B.has(KK(a, b)));
  const r = certificar(augKeys, c.d0, 2_000_000);
  const ok = prefijoIgual && disjunto && r.detected;
  if (ok) buenos++;
  console.log(
    `${c.nombre.padEnd(16)} celdas=${String(c.offs.length).padStart(3)} ` +
    `tau=${String(tau).padStart(6)} salida=(${x},${y}) g=${g} ` +
    `prefijo=${prefijoIgual ? 'sí' : 'NO'} disjunto=${disjunto ? 'sí' : 'NO'} ` +
    `cert=${r.detected ? `T=${r.T} v=(${r.v})` : 'NO'}  ${ok ? 'OK' : 'FALLO'}`
  );
}
console.log(`\ncompletación correcta: ${buenos}/${casos.length}`);
