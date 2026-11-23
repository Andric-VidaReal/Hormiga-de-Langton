// Verificación LOCAL (motor propio) de los avances de 2026.
//
// 1) Semillas estándar publicadas por Jillhewar (g = 12, periodos 104).
// 2) Puerto de 4 celdas de Ke: sale por la derecha para siempre y entra en P104.
// 3) Cota exacta de 3 celdas: ninguna semilla de <=3 celdas en H+ evita salir
//    antes de 918 pasos; la cota se alcanza.
// 4) Caso de una celda con las 4 orientaciones iniciales en posiciones lejanas.

import { KK } from './motor.mjs';

const OFF = 1 << 21;
const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];

function paso(black, x, y, d) {
  const k = KK(x, y);
  if (black.has(k)) { d = (d + 3) & 3; black.delete(k); }
  else { d = (d + 1) & 3; black.add(k); }
  return [x + DX[d], y + DY[d], d];
}

function decode(k) {
  const x = Math.round(k / OFF);
  return [x, k - x * OFF];
}

function correr(celdas, d0, pasos) {
  const black = new Set(celdas);
  let x = 0, y = 0, d = d0;
  const px = new Int32Array(pasos + 1), py = new Int32Array(pasos + 1);
  px[0] = 0; py[0] = 0;
  for (let t = 1; t <= pasos; t++) {
    [x, y, d] = paso(black, x, y, d);
    px[t] = x; py[t] = y;
  }
  return { black, x, y, d, px, py };
}

// Certificador con dirección inicial arbitraria (idéntico en lógica a motor.mjs,
// salvo que no fuerza d0 = 0).
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
    if (ok) return { detected: true, T: pt, v: v2, absorbed: absorbed.size };
    for (let k2 = 0; k2 <= 104; k2++) {
      const tt = pt + k2;
      bx[tt % 105] = px + rel[2 * k2];
      by[tt % 105] = py + rel[2 * k2 + 1];
    }
    prev = null; stable = 0;
  }
  return { detected: false, reason: 'cap' };
}

const keys = (offs) => offs.map(([x, y]) => KK(x, y));

console.log('=== 1) Semillas estándar de Jillhewar (2026) ===');
const seedA = [[-2,-2],[-2,-1],[-1,0],[0,1],[1,-2],[1,1],[2,-2],[2,0],[3,-1],[3,0],[4,0]];
const seedB = [[-6,0],[-5,0],[-5,1],[-4,0],[-4,2],[-3,-1],[-3,2],[-2,-1],[-2,1],[-1,1],[0,0],[0,1],[0,2]];
for (const [nombre, offs, vEsperado] of [['A (11 celdas)', seedA, [2,-2]], ['B (13 celdas)', seedB, [-2,2]]]) {
  const r = certificar(keys(offs), 0, 200000);
  const coincide = r.detected && r.v[0] === vEsperado[0] && r.v[1] === vEsperado[1];
  console.log(`  ${nombre}: ${r.detected ? `T=${r.T} v=(${r.v})` : 'NO CERTIFICADA'}  ${coincide ? 'OK' : 'FALLO'}`);
}

console.log('\n=== 2) Puerto de 4 celdas de Ke (2026) ===');
// Ke usa y hacia arriba; nuestro motor usa y hacia abajo. Reflejamos y.
const G = [[0,-1],[1,1],[1,3],[2,2]];
const Gm = G.map(([x, y]) => [x, -y]);
{
  const r = correr(keys(Gm), 1, 182);
  const ok = r.x === 5 && r.y === -1 && r.d === 1 && r.black.size === 36;
  console.log(`  semilla reflejada: ${JSON.stringify(Gm)}`);
  console.log(`  tras 182 pasos: pos=(${r.x},${r.y}) direccion=${r.d} negras=${r.black.size}  ${ok ? 'OK' : 'FALLO'}`);
  const tail = certificar(keys(Gm), 1, 2_000_000);
  console.log(`  certificado desde t=0: ${tail.detected ? `T=${tail.T} v=(${tail.v}) absorbidas=${tail.absorbed}/4` : 'NO CERTIFICADO'}`);
}

console.log('\n=== 3) Cota exacta de 3 celdas en el semiplano derecho ===');
function primerSalida(S) {
  const black = new Set(keys(S));
  let x = 0, y = 0, d = 1;
  const leidas = [];
  const vistas = new Set();
  for (let t = 1; t <= 100000; t++) {
    const k = KK(x, y);
    if (!vistas.has(k)) { vistas.add(k); if (!black.has(k)) leidas.push(k); }
    [x, y, d] = paso(black, x, y, d);
    if (x < 0) return { t, leidas };
  }
  return { t: Infinity, leidas };
}
let familia = [[]];
for (let k = 0; k <= 3; k++) {
  let maxT = 0, peor = null;
  for (const S of familia) {
    const r = primerSalida(S);
    if (r.t > maxT) { maxT = r.t; peor = S; }
  }
  console.log(`  |S|=${k}: ${familia.length} semillas, max salida=${maxT}, peor=${JSON.stringify(peor)}`);
  if (k === 3) break;
  const siguiente = new Map();
  for (const S of familia) {
    const r = primerSalida(S);
    for (const q of r.leidas) {
      const T = [...S, decode(q)].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
      siguiente.set(JSON.stringify(T), T);
    }
  }
  familia = [...siguiente.values()];
}

console.log('\n=== 4) Una celda, 4 orientaciones, posiciones lejanas ===');
const posiciones = [[1000,-1000],[-777,999],[512,512],[-1234,-432]];
let buenas = 0;
for (const [x, y] of posiciones) {
  for (let d0 = 0; d0 < 4; d0++) {
    const r = certificar([KK(x, y)], d0, 2_000_000);
    if (r.detected) buenas++;
    else console.log(`  FALLO (${x},${y}) d0=${d0}`);
  }
}
console.log(`  certificadas: ${buenas}/${posiciones.length * 4}`);
