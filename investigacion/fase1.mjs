// FASE 1 de la investigación sobre la conjetura de la autopista.
//
// Objetivo: NO demostrar la conjetura, sino
//   (a) certificar por máquina que familias finitas ENTERAS acaban en autopista,
//   (b) buscar los transitorios más largos y posibles contraejemplos,
//   (c) cuantificar hasta dónde llega la evidencia.
//
// Certificado: detectamos desplazamiento constante cada 104 pasos y luego
// comprobamos que el estado LOCAL se repite trasladado. Eso PRUEBA autopista
// eterna para esa configuración concreta.

const OFF = 1 << 21;
const KK = (x, y) => x * OFF + y;
const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];

function simulate(initialKeys, cap) {
  const black = new Set(initialKeys);
  let x = 0, y = 0, d = 0;
  const bx = new Float64Array(106), by = new Float64Array(106);
  bx[0] = 0; by[0] = 0;
  let prev = null, stable = 0;
  let t = 0;

  const oneStep = () => {
    const k = KK(x, y);
    if (black.has(k)) { d = (d + 3) & 3; black.delete(k); }
    else { d = (d + 1) & 3; black.add(k); }
    x += DX[d]; y += DY[d];
    bx[t % 105] = x; by[t % 105] = y;
  };

  while (t < cap) {
    t++;
    oneStep();

    if (t < 104) continue;
    const r0 = (t - 104) % 105;
    const vx = x - bx[r0], vy = y - by[r0];
    if (prev && (vx !== prev[0] || vy !== prev[1])) stable = 0;
    else stable++;
    prev = [vx, vy];

    if (stable < 312 || (vx === 0 && vy === 0)) continue;

    // Candidato: verificar certificado en t.
    const baseBlack = new Set(black);
    const px = x, py = y, pd = d, pt = t;
    const rel = new Float64Array(210);
    rel[0] = 0; rel[1] = 0;
    for (let k2 = 1; k2 <= 104; k2++) {
      t++;
      oneStep();
      rel[2 * k2] = x - px; rel[2 * k2 + 1] = y - py;
    }
    const vx2 = x - px, vy2 = y - py;
    let ok = d === pd;
    for (let k2 = 0; ok && k2 <= 104; k2++) {
      const dx = rel[2 * k2], dy = rel[2 * k2 + 1];
      const a = baseBlack.has(KK(px + dx, py + dy));
      const b = black.has(KK(x + dx, y + dy));
      if (a !== b) ok = false;
    }
    if (ok) return { detected: true, T: pt, v: [vx2, vy2], total: t };

    // Falso positivo: reconstruir el anillo para los últimos 105 pasos y seguir.
    for (let k2 = 0; k2 <= 104; k2++) {
      const tt = pt + k2;
      bx[tt % 105] = px + rel[2 * k2];
      by[tt % 105] = py + rel[2 * k2 + 1];
    }
    prev = null; stable = 0;
  }
  return { detected: false, T: -1, reason: 'cap' };
}

function keysFromOffsets(offsets) {
  return offsets.map(([x, y]) => KK(x, y));
}

// --- Familias de configuraciones ----------------------------------------

function* boxSubsets(lo, hi) {
  const cells = [];
  for (let y = lo; y <= hi; y++) for (let x = lo; x <= hi; x++) cells.push([x, y]);
  const n = cells.length;
  for (let mask = 0; mask < (1 << n); mask++) {
    const off = [];
    for (let i = 0; i < n; i++) if (mask & (1 << i)) off.push(cells[i]);
    yield off;
  }
}

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomOffsets(rand, lo, hi, density) {
  const off = [];
  for (let y = lo; y <= hi; y++) for (let x = lo; x <= hi; x++)
    if (rand() < density) off.push([x, y]);
  return off;
}

function summarize(name, results, cap) {
  const ok = results.filter(r => r.detected);
  const bad = results.filter(r => !r.detected);
  const Ts = ok.map(r => r.T).sort((a, b) => a - b);
  console.log(`\n${name}`);
  console.log(`  certificadas: ${ok.length}/${results.length}   sin certificar: ${bad.length}`);
  if (Ts.length) {
    const q = (p) => Ts[Math.min(Ts.length - 1, Math.floor(p * Ts.length))];
    console.log(`  transitorio T: min=${Ts[0]}  p50=${q(0.5)}  p90=${q(0.9)}  max=${Ts[Ts.length - 1]}`);
    const worst = ok.reduce((a, b) => (b.T > a.T ? b : a));
    console.log(`  peor caso: T=${worst.T}  v=(${worst.v})  config=${JSON.stringify(worst.offsets)}`);
  }
  if (bad.length) {
    console.log(`  PRIMEROS SIN CERTIFICAR (cap=${cap}):`);
    for (const r of bad.slice(0, 8)) console.log(`    ${JSON.stringify(r.offsets)}  motivo=${r.reason}`);
  }
  return { ok: ok.length, bad: bad.length, maxT: Ts.length ? Ts[Ts.length - 1] : null };
}

// --- Ejecución -----------------------------------------------------------

const CAP = 300_000;

console.log('=== FASE 1: evidencia computacional sobre la conjetura ===');

// A) Exhaustivo 3x3 centrado en la hormiga (512 configuraciones)
{
  const results = [];
  for (const offsets of boxSubsets(-1, 1)) {
    const r = simulate(keysFromOffsets(offsets), CAP);
    results.push({ offsets, ...r });
  }
  summarize('A) EXHAUSTIVO 3x3 (512 configs, hormiga en el centro)', results, CAP);
}

// B) Aleatorio 4x4 (1.000 configs, varias densidades)
{
  const rand = rng(12345);
  const results = [];
  for (let i = 0; i < 1000; i++) {
    const density = [0.15, 0.3, 0.5, 0.7, 0.85][i % 5];
    const offsets = randomOffsets(rand, -2, 1, density);
    const r = simulate(keysFromOffsets(offsets), CAP);
    results.push({ offsets, ...r });
  }
  summarize('B) ALEATORIO 4x4 (1000 configs)', results, CAP);
}

// C) Una sola celda negra a distancia (625 offsets)
{
  const results = [];
  for (let y = -12; y <= 12; y++) for (let x = -12; x <= 12; x++) {
    if (x === 0 && y === 0) continue; // hormiga sobre blanca
    const offsets = [[x, y]];
    const r = simulate(keysFromOffsets(offsets), CAP);
    results.push({ offsets, ...r });
  }
  summarize('C) UNA SOLA CELDA NEGRA (625 offsets)', results, CAP);
}

// D) Aleatorio 7x7 (500 configs)
{
  const rand = rng(999);
  const results = [];
  for (let i = 0; i < 500; i++) {
    const density = [0.1, 0.25, 0.4, 0.55, 0.7, 0.85][i % 6];
    const offsets = randomOffsets(rand, -3, 3, density);
    const r = simulate(keysFromOffsets(offsets), CAP);
    results.push({ offsets, ...r });
  }
  summarize('D) ALEATORIO 7x7 (500 configs)', results, CAP);
}

// E) Caza de transitorios largos: 11x11 denso, cap alto
{
  const CAP_E = 2_000_000;
  const rand = rng(2026);
  const results = [];
  for (let i = 0; i < 120; i++) {
    const density = [0.3, 0.45, 0.6, 0.75][i % 4];
    const offsets = randomOffsets(rand, -5, 5, density);
    const r = simulate(keysFromOffsets(offsets), CAP_E);
    results.push({ offsets, ...r });
  }
  summarize('E) CAZA DE TRANSITORIOS LARGOS 11x11 (120 configs, cap=2e6)', results, CAP_E);
}
