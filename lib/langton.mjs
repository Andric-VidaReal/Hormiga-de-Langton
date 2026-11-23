// Núcleo de simulación de la Hormiga de Langton.
// Reglas: celda blanca -> gira 90° a la derecha, pinta negro, avanza.
//         celda negra  -> gira 90° a la izquierda, pinta blanco, avanza.

export const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // N, E, S, O
export const DIR_NAMES = ['N', 'E', 'S', 'O'];

export class Langton {
  constructor({ world = 'infinite', size = 0, rule = 'RL', black = [] } = {}) {
    this.world = world;      // 'infinite' | 'finite' (escape por borde) | 'torus'
    this.size = size;
    this.rule = rule;        // 'RL' estándar; 'LR' espejo (para probar quiralidad)
    this.black = new Set(black);
  }
  k(x, y) { return x + ',' + y; }
  isBlack(x, y) { return this.black.has(this.k(x, y)); }
  toggle(x, y) {
    const k = this.k(x, y);
    if (this.black.has(k)) { this.black.delete(k); return true; }
    this.black.add(k); return false;
  }
  inBounds(x, y) { return x >= 0 && y >= 0 && x < this.size && y < this.size; }
  wrap(v) { return ((v % this.size) + this.size) % this.size; }

  step(x, y, dir, stepNo) {
    const black = this.isBlack(x, y);
    const wt = this.rule === 'RL' ? 1 : -1;       // giro en blanco
    dir = (dir + (black ? -wt : wt) + 4) % 4;
    this.toggle(x, y);
    let nx = x + DIRS[dir][0];
    let ny = y + DIRS[dir][1];
    if (this.world === 'torus') { nx = this.wrap(nx); ny = this.wrap(ny); }
    else if (this.world === 'finite' && !this.inBounds(nx, ny)) {
      return { x, y, dir, escaped: true, step: stepNo };
    }
    return { x: nx, y: ny, dir, escaped: false, step: stepNo };
  }
}

export function run(sim, { steps, x = 0, y = 0, dir = 0 }) {
  const path = [{ x, y, dir, step: 0 }];
  let escapedAt = null;
  for (let i = 1; i <= steps; i++) {
    const s = sim.step(x, y, dir, i);
    x = s.x; y = s.y; dir = s.dir;
    path.push({ x, y, dir, step: i });
    if (s.escaped) { escapedAt = i; break; }
  }
  return { sim, path, x, y, dir, escapedAt, done: path.length - 1 };
}

// Paso inverso exacto (la dinámica de Langton es biyectiva).
export function inverseStep(sim, x, y, dir) {
  let cx = x - DIRS[dir][0];
  let cy = y - DIRS[dir][1];
  if (sim.world === 'torus') { cx = sim.wrap(cx); cy = sim.wrap(cy); }
  const nowBlack = sim.isBlack(cx, cy);          // color TRAS la visita
  const wt = sim.rule === 'RL' ? 1 : -1;
  // si ahora es negra, antes era blanca -> dir = dir' - wt
  // si ahora es blanca, antes era negra  -> dir = dir' + wt
  const beforeDir = (nowBlack ? dir - wt + 8 : dir + wt + 8) % 4;
  sim.toggle(cx, cy);                            // deshacer el giro de color
  return { x: cx, y: cy, dir: beforeDir };
}

// Normaliza el patrón: quita traslación y rota según la dirección inicial.
export function normalizePattern(black, sx, sy, startDir) {
  const out = [];
  for (const k of black) {
    let [x, y] = k.split(',').map(Number);
    x -= sx; y -= sy;
    let r = ((-startDir % 4) + 4) % 4;
    while (r--) { const nx = -y; const ny = x; x = nx; y = ny; }
    out.push(x + ',' + y);
  }
  return out.sort().join(';');
}

export function boundingBox(black) {
  if (!black.size) return null;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const k of black) {
    const i = k.indexOf(',');
    const x = +k.slice(0, i), y = +k.slice(i + 1);
    if (x < x0) x0 = x; if (x > x1) x1 = x;
    if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  return { x0, y0, x1, y1, w: x1 - x0 + 1, h: y1 - y0 + 1, area: (x1 - x0 + 1) * (y1 - y0 + 1) };
}

// Hash Zobrist de 64 bits (dos palabras de 32) para detectar repetición de estado.
export function cellHash(x, y) {
  let a = (Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ 0x9e3779b9) | 0;
  a = Math.imul(a ^ (a >>> 13), 1274126177);
  a = (a ^ (a >>> 16)) >>> 0;
  let b = (Math.imul(x ^ 0x85ebca6b, 2246822519) ^ Math.imul(y + 0x27d4eb2d, 3266489917)) | 0;
  b = Math.imul(b ^ (b >>> 15), 2246822507);
  b = (b ^ (b >>> 13)) >>> 0;
  return [a, b];
}
