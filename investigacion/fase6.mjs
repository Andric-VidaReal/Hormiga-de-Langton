// FASE 6: TODAS las configuraciones de una sola celda en [-512,512]^2
// (1 048 575 configuraciones) con el certificador corregido.
import { simulateAbsorb, KK } from './motor.mjs';

const R = 512;
const CAP = 2_000_000;
const t0 = Date.now();
let total = 0, ok = 0, mal = 0, maxT = -1, peor = null;
const vs = new Map();

for (let y = -R; y <= R; y++) {
  for (let x = -R; x <= R; x++) {
    if (x === 0 && y === 0) continue;
    const r = simulateAbsorb([KK(x, y)], CAP);
    total++;
    if (r.detected) {
      ok++;
      const vk = r.v.join(',');
      vs.set(vk, (vs.get(vk) || 0) + 1);
      if (r.T > maxT) { maxT = r.T; peor = [x, y]; }
    } else {
      mal++;
      if (mal <= 10) console.log(`  SIN CERTIFICAR: (${x},${y}) motivo=${r.reason}`);
    }
    if (total % 100000 === 0) {
      process.stdout.write(`  ${total}/1048575  (${((Date.now() - t0) / 1000).toFixed(0)}s)\n`);
    }
  }
}

console.log(`\nconfigs=${total}  certificadas=${ok}  sin certificar=${mal}  tiempo=${((Date.now() - t0) / 1000).toFixed(0)}s`);
console.log(`máximo T=${maxT} en ${JSON.stringify(peor)}`);
console.log(`v: ${[...vs].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k}:${n}`).join('  ')}`);
