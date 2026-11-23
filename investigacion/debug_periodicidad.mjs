import { KK } from './motor.mjs';
const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];

// ¿El conjunto negro completo es periódico? set(t+104) == set(t) + v ?
// v = (-2,2). Guardamos el conjunto en t y en t+104 y comparamos.
function estadoEn(tObjetivo) {
  const black = new Set(); let x = 0, y = 0, d = 0;
  const snap = new Map();
  const objetivos = new Set(tObjetivo);
  if (objetivos.has(0)) snap.set(0, new Set(black));
  for (let t = 1; t <= Math.max(...tObjetivo); t++) {
    const k = KK(x, y);
    if (black.has(k)) { d = (d + 3) & 3; black.delete(k); } else { d = (d + 1) & 3; black.add(k); }
    x += DX[d]; y += DY[d];
    if (objetivos.has(t)) snap.set(t, new Set(black));
  }
  return snap;
}

const ts = [20000, 20104, 50000, 50104, 100000, 100104];
const snap = estadoEn(ts);
const v = [-2, 2];

function comparar(t) {
  const A = snap.get(t), B = snap.get(t + 104);
  let soloA = 0, soloB = 0;
  for (const k of A) {
    const x = Math.round(k / (1 << 21)), y = k - x * (1 << 21);
    if (!B.has(KK(x + v[0], y + v[1]))) soloA++;
  }
  for (const k of B) {
    const x = Math.round(k / (1 << 21)), y = k - x * (1 << 21);
    if (!A.has(KK(x - v[0], y - v[1]))) soloB++;
  }
  console.log(`t=${t}: |A|=${A.size} |B|=${B.size}  solo en A+v: ${soloA}   solo en B: ${soloB}`);
}
for (const t of [20000, 50000, 100000]) comparar(t);
