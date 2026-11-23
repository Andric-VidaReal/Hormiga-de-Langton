import { simulateAbsorb, KK, keysFromOffsets } from './motor.mjs';

function runFamily(name, gen, cap) {
  let ok = 0, bad = 0, maxT = -1, worst = null;
  const Ts = [];
  const t0 = Date.now();
  for (const offsets of gen) {
    const r = simulateAbsorb(keysFromOffsets(offsets), cap);
    if (r.detected) {
      ok++; Ts.push(r.T);
      if (r.T > maxT) { maxT = r.T; worst = offsets; }
    } else {
      bad++;
      if (bad <= 5) console.log(`   SIN CERTIFICAR: ${JSON.stringify(offsets)} motivo=${r.reason}`);
    }
  }
  Ts.sort((a, b) => a - b);
  const q = (p) => Ts[Math.floor(p * (Ts.length - 1))];
  console.log(`\n${name}`);
  console.log(`  certificadas=${ok}/${ok + bad}  sin certificar=${bad}  tiempo=${((Date.now() - t0) / 1000).toFixed(0)}s`);
  if (Ts.length) {
    console.log(`  T: min=${Ts[0]} p50=${q(.5)} p90=${q(.9)} max=${Ts[Ts.length - 1]}`);
    console.log(`  peor: ${JSON.stringify(worst)}`);
  }
  return { ok, bad, maxT };
}

function* box(lo, hi) {
  const cells = [];
  for (let y = lo; y <= hi; y++) for (let x = lo; x <= hi; x++) cells.push([x, y]);
  const n = cells.length;
  for (let mask = 0; mask < (1 << n); mask++) {
    const off = [];
    for (let i = 0; i < n; i++) if (mask & (1 << i)) off.push(cells[i]);
    yield off;
  }
}

runFamily('A) EXHAUSTIVO 3x3 centrado (512)', box(-1, 1), 500000);
runFamily('B) EXHAUSTIVO 4x4 en [-2,1]^2 (65 536)', box(-2, 1), 600000);

// C) una sola celda negra, offsets [-18,18]
function* unaCelda() {
  for (let y = -18; y <= 18; y++) for (let x = -18; x <= 18; x++) {
    if (x === 0 && y === 0) continue;
    yield [[x, y]];
  }
}
runFamily('C) UNA CELDA NEGRA, offsets [-18,18] (1368)', unaCelda(), 500000);
