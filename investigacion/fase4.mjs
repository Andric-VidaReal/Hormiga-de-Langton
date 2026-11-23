import { simulateAbsorb, KK } from './motor.mjs';

// Todas las configuraciones cuyo soporte cabe en una ventana 4x4 QUE CONTIENE
// la celda inicial de la hormiga: offsets (ox,oy) en {-3..0}^2, 16 alineaciones.
// Total: 16 * 2^16 = 1 048 576 configuraciones.

const CAP = 600_000;
const t0 = Date.now();
let total = 0, ok = 0, bad = 0, maxT = -1, worst = null, worstOff = null;
const Ts = [];

for (let oy = -3; oy <= 0; oy++) {
  for (let ox = -3; ox <= 0; ox++) {
    const cells = [];
    for (let y = oy; y < oy + 4; y++) for (let x = ox; x < ox + 4; x++) cells.push([x, y]);
    const n = cells.length;
    let localMax = -1;
    for (let mask = 0; mask < (1 << n); mask++) {
      const keys = [];
      for (let i = 0; i < n; i++) if (mask & (1 << i)) keys.push(KK(cells[i][0], cells[i][1]));
      const r = simulateAbsorb(keys, CAP);
      total++;
      if (r.detected) {
        ok++; Ts.push(r.T);
        if (r.T > maxT) { maxT = r.T; worst = keys.length; worstOff = [ox, oy]; }
        if (r.T > localMax) localMax = r.T;
      } else {
        bad++;
        if (bad <= 5) console.log(`   SIN CERTIFICAR offset=(${ox},${oy}) mask=${mask} motivo=${r.reason}`);
      }
    }
    const el = ((Date.now() - t0) / 1000).toFixed(0);
    console.log(`offset (${ox},${oy}): local maxT=${localMax}   [${total} / 1048576, ${el}s]`);
  }
}

Ts.sort((a, b) => a - b);
const q = (p) => Ts[Math.floor(p * (Ts.length - 1))];
const el = ((Date.now() - t0) / 1000).toFixed(0);
console.log('\n=== TOTAL 4x4 x 16 alineaciones ===');
console.log(`configs=${total}  certificadas=${ok}  sin certificar=${bad}  tiempo=${el}s`);
console.log(`T: min=${Ts[0]}  p50=${q(.5)}  p90=${q(.9)}  p99=${q(.99)}  max=${Ts[Ts.length - 1]}`);
