// Motor de simulación + certificación de autopista eterna.
//
// Certificado para configuración inicial ARBITRARIA (finita):
//  1. periodicidad local: el estado sobre la ventana visitada R se repite
//     trasladado por v en 104 pasos;
//  2. ninguna semilla inicial SIN absorber cae en R + k*v (k>=0) en un sitio
//     donde el patrón base espera blanco.
// Si ambas se cumplen, por determinismo/localidad la autopista es eterna.

const OFF = 1 << 21;
export const KK = (x, y) => x * OFF + y;
export const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];

const decode = (k) => {
  const x = Math.round(k / OFF);
  return [x, k - x * OFF];
};

// Simulación simple: devuelve el primer instante con periodicidad local.
export function simulate(initialKeys, cap) {
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
    if (ok) return { detected: true, T: pt, v: v2, total: t };
    for (let k2 = 0; k2 <= 104; k2++) {
      const tt = pt + k2;
      bx[tt % 105] = px + rel[2 * k2];
      by[tt % 105] = py + rel[2 * k2 + 1];
    }
    prev = null; stable = 0;
  }
  return { detected: false, T: -1, reason: 'cap' };
}

// ¿Ninguna semilla inicial no absorbida rompe el patrón en el futuro?
// Para cada semilla c y cada celda relativa r de R, si c = p + r + k*v (k>=0)
// y el patrón base espera blanco en r, la autopista se romperá allí.
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

// Refuerzo: ninguna celda negra PRESENTE en el instante del certificado puede
// caer en un rayo futuro R + k*v con k >= 1 minimal. Las que están en R (k=0)
// ya las controla la periodicidad local; las que tuvieran k>=1 serían leídas
// como negras antes de que el patrón las hubiera pintado, y romperían el ciclo.
function futuroNegro(baseBlack, px, py, Rset, v) {
  for (const ck of baseBlack) {
    const [cx, cy] = decode(ck);
    let minK = Infinity;
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
      if (k >= 0 && k < minK) minK = k;
    }
    if (Number.isFinite(minK) && minK >= 1) return false;
  }
  return true;
}

// Certificado válido para configuraciones no vacías (ver cabecera).
export function simulateAbsorb(initialKeys, cap) {
  const black = new Set(initialKeys);
  const initial = new Set(initialKeys);
  const absorbed = new Set();
  let lastAbsorb = 0;
  let x = 0, y = 0, d = 0;
  const bx = new Float64Array(106), by = new Float64Array(106);
  bx[0] = 0; by[0] = 0;
  let prev = null, stable = 0;
  let t = 0;

  const oneStep = () => {
    const k = KK(x, y);
    if (initial.has(k) && !absorbed.has(k)) { absorbed.add(k); lastAbsorb = t; }
    if (black.has(k)) { d = (d + 3) & 3; black.delete(k); }
    else { d = (d + 1) & 3; black.add(k); }
    x += DX[d]; y += DY[d];
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
      ok = futuroLibre(initial, absorbed, px, py, Rset, v2, baseBlack)
        && futuroNegro(baseBlack, px, py, Rset, v2);
    }
    if (ok) return { detected: true, T: pt, v: v2, total: t, lastAbsorb };
    for (let k2 = 0; k2 <= 104; k2++) {
      const tt = pt + k2;
      bx[tt % 105] = px + rel[2 * k2];
      by[tt % 105] = py + rel[2 * k2 + 1];
    }
    prev = null; stable = 0;
  }
  return { detected: false, T: -1, reason: 'cap', absorbed: absorbed.size, needed: initial.size };
}

export const keysFromOffsets = (offsets) => offsets.map(([x, y]) => KK(x, y));

export function* boxSubsets(lo, hi) {
  const cells = [];
  for (let y = lo; y <= hi; y++) for (let x = lo; x <= hi; x++) cells.push([x, y]);
  const n = cells.length;
  for (let mask = 0; mask < (1 << n); mask++) {
    const off = [];
    for (let i = 0; i < n; i++) if (mask & (1 << i)) off.push(cells[i]);
    yield off;
  }
}

export function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomOffsets(rand, lo, hi, density) {
  const off = [];
  for (let y = lo; y <= hi; y++) for (let x = lo; x <= hi; x++)
    if (rand() < density) off.push([x, y]);
  return off;
}
