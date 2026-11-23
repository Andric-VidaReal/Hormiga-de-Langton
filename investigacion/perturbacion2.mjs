import { KK } from './motor.mjs';

// NOTA: los instantes de esta tabla son NOMINALES. La autopista revisita celdas,
// así que el impacto real ocurre en la PRIMERA visita de la celda sembrada, que
// puede ser anterior. Los T medidos aquí son correctos; el reajuste debe
// recalcularse respecto a la primera visita (ver ley_fase.mjs).

const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];

// Último paso en que cambió el desplazamiento a 104 pasos = fin real de la fase caótica.
function lastChange(initialKeys, cap) {
  const black = new Set(initialKeys);
  let x = 0, y = 0, d = 0;
  const bx = new Float64Array(105), by = new Float64Array(105);
  bx[0] = 0; by[0] = 0;
  let prev = null, last = 0, final = null;
  for (let t = 1; t <= cap; t++) {
    const k = KK(x, y);
    if (black.has(k)) { d = (d + 3) & 3; black.delete(k); }
    else { d = (d + 1) & 3; black.add(k); }
    x += DX[d]; y += DY[d];
    bx[t % 105] = x; by[t % 105] = y;
    if (t < 104) continue;
    const r0 = (t - 104) % 105;
    const vx = x - bx[r0], vy = y - by[r0];
    if (prev && (vx !== prev[0] || vy !== prev[1])) last = t;
    prev = [vx, vy]; final = [vx, vy];
  }
  return { last, final, pos: [x, y] };
}

// 1) Trayectoria estándar: posiciones en tiempos objetivo.
const targets = [20000, 50000, 100000, 200000, 300000];
const posAt = new Map();
{
  const black = new Set();
  let x = 0, y = 0, d = 0;
  for (let t = 1; t <= 300000; t++) {
    const k = KK(x, y);
    if (black.has(k)) { d = (d + 3) & 3; black.delete(k); }
    else { d = (d + 1) & 3; black.add(k); }
    x += DX[d]; y += DY[d];
    if (targets.includes(t)) posAt.set(t, [x, y]);
  }
}

console.log('CONTROL (vacío):', lastChange([], 600000));

console.log('\nUNA CELDA NEGRA EN LA TRAYECTORIA FUTURA DE LA AUTOPISTA');
console.log('t_hit     posición          último cambio   reajuste (T - t_hit)');
for (const tHit of targets) {
  const [px, py] = posAt.get(tHit);
  const cap = tHit + 300000;
  const r = lastChange([KK(px, py)], cap);
  console.log(`${String(tHit).padStart(6)}   (${String(px).padStart(6)},${String(py).padStart(6)})   ` +
    `${String(r.last).padStart(13)}   ${String(r.last - tHit).padStart(10)}   v=(${r.final})`);
}

console.log('\nCONTROL FUERA DE LA TRAYECTORIA (celda lejana que la autopista no visita)');
for (const [px, py] of [[0, 500], [500, 0], [-500, -500]]) {
  const r = lastChange([KK(px, py)], 400000);
  console.log(`  celda (${px},${py}): último cambio=${r.last}  v=(${r.final})`);
}
