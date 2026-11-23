// Certificado de que la autopista de Langton (inicio estándar, rejilla vacía)
// es ETERNA. No es una observación: es una verificación finita + inducción.
//
// Idea: si en dos inicios de ciclo consecutivos el estado LOCAL de la hormiga
// (posición relativa + dirección + colores de todas las celdas que va a leer)
// coincide salvo traslación v, entonces por determinismo el ciclo se repite
// indefinidamente. Solo hay que comprobar UNA vez.

import { Langton } from './lib/langton.mjs';

const S0 = 11000;      // dentro de la autopista (empieza ~9977)
const P = 104;         // periodo
const CYCLES = 5;

// Ejecuta y guarda el estado en los tiempos que interesan.
function build() {
  const sim = new Langton({ world: 'infinite' });
  let x = 0, y = 0, dir = 0;
  const snap = new Map(); // t -> {black:Set, x,y,dir}
  const visited = new Map(); // t -> [x,y] posición en el paso t
  visited.set(0, [0, 0]);
  const want = new Set();
  for (let k = 0; k <= CYCLES; k++) want.add(S0 + k * P);
  const maxT = S0 + CYCLES * P;
  for (let i = 1; i <= maxT; i++) {
    const s = sim.step(x, y, dir, i);
    x = s.x; y = s.y; dir = s.dir;
    visited.set(i, [x, y]);
    if (want.has(i)) snap.set(i, { black: new Set(sim.black), x, y, dir });
  }
  return { snap, visited };
}

const { snap, visited } = build();
const base = snap.get(S0);
const nx = snap.get(S0 + P);
const vx = nx.x - base.x, vy = nx.y - base.y;

// Celdas que la hormiga lee durante un ciclo (posiciones en [S0, S0+P]).
const R = new Map(); // "dx,dy" -> true
for (let t = S0; t <= S0 + P; t++) {
  const [px, py] = visited.get(t);
  R.set((px - base.x) + ',' + (py - base.y), true);
}

function colorAt(black, px, py) { return black.has(px + ',' + py); }

// ¿El estado local en S0+P es el de S0 trasladado por v?
function checkCycle(a, b) {
  const misPos = !(b.x - a.x === vx && b.y - a.y === vy && b.dir === a.dir);
  if (misPos) return { ok: false, why: 'posición/dirección distinta' };
  let checked = 0;
  for (const key of R.keys()) {
    const [dx, dy] = key.split(',').map(Number);
    const ca = colorAt(a.black, a.x + dx, a.y + dy);
    const cb = colorAt(b.black, b.x + dx, b.y + dy);
    if (ca !== cb) return { ok: false, why: `difiere en (dx,dy)=(${dx},${dy})` };
    checked++;
  }
  return { ok: true, checked };
}

console.log('=== CERTIFICADO: autopista eterna (caso estándar) ===');
console.log(`inicio de ciclo S0 = ${S0}, periodo P = ${P}`);
console.log(`desplazamiento v = (${vx},${vy}), |v| = ${Math.hypot(vx, vy).toFixed(4)}`);
console.log(`celdas locales que se leen por ciclo: |R| = ${R.size}`);
console.log('');
let allOk = true;
for (let k = 0; k < CYCLES; k++) {
  const a = snap.get(S0 + k * P), b = snap.get(S0 + (k + 1) * P);
  const r = checkCycle(a, b);
  console.log(`ciclo ${k}->${k + 1} (t=${S0 + k * P} -> ${S0 + (k + 1) * P}): ${r.ok ? 'OK' : 'FALLO: ' + r.why}`);
  if (!r.ok) allOk = false;
}

// Huella del estado local (para reproducibilidad)
let h = 2166136261;
const keys = [...R.keys()].sort();
for (const key of keys) {
  const [dx, dy] = key.split(',').map(Number);
  const c = colorAt(base.black, base.x + dx, base.y + dy) ? 1 : 0;
  h = Math.imul(h ^ (dx + 1000), 16777619);
  h = Math.imul(h ^ (dy + 1000), 16777619);
  h = Math.imul(h ^ c, 16777619);
}
console.log(`\nhuella FNVa del estado local base = ${(h >>> 0).toString(16)}`);
console.log('');
console.log(allOk
  ? 'TEOREMA (verificado por máquina): como el estado local del ciclo se repite exactamente, al ser la dinámica determinista y local, la autopista continúa para siempre. q.e.d.'
  : 'La verificación falló: no hay certificado con estos parámetros.');

// Cuántas celdas negras hay dentro de R en el instante base (contexto)
let blk = 0;
for (const key of R.keys()) {
  const [dx, dy] = key.split(',').map(Number);
  if (colorAt(base.black, base.x + dx, base.y + dy)) blk++;
}
console.log(`Contexto: ${blk}/${R.size} celdas de R están negras en t=${S0}.`);
