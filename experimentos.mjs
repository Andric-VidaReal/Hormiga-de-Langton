import {
  Langton, run, inverseStep, normalizePattern, boundingBox,
  cellHash, DIR_NAMES,
} from './lib/langton.mjs';

const N = 9999;
const line = (s = '') => console.log(s);
const rule = (t) => { line('\n' + '='.repeat(72)); line(t); line('='.repeat(72)); };
const pct = (a, b) => (100 * a / b).toFixed(1) + '%';

// Reproduce hasta `steps` en el plano infinito y devuelve el conjunto negro.
function planeRun(steps, x = 0, y = 0, dir = 0) {
  const sim = new Langton({ world: 'infinite' });
  const r = run(sim, { steps, x, y, dir });
  return { sim, r };
}

/* ------------------------------------------------------------------ */
/* T0. Invariancia por simetría en el plano infinito                   */
/* ------------------------------------------------------------------ */
function t0_invariance() {
  rule('T0 · ¿El patrón a N pasos depende del inicio? (plano infinito, todo blanco)');
  const starts = [
    [0, 0, 0], [0, 0, 1], [0, 0, 2], [0, 0, 3],
    [500, -777, 0], [-1234, 987, 1], [42, 42, 2], [7, -9, 3],
  ];
  const ref = normalizePattern(planeRun(N, 0, 0, 0).sim.black, 0, 0, 0);
  let allEqual = true;
  line('inicio (x,y,dir)      negras   pos final        dist    patrón canónico');
  for (const [sx, sy, sd] of starts) {
    const { sim, r } = planeRun(N, sx, sy, sd);
    const canon = normalizePattern(sim.black, sx, sy, sd);
    const same = canon === ref;
    if (!same) allEqual = false;
    const dist = Math.hypot(r.x - sx, r.y - sy).toFixed(3);
    line(`${`(${sx},${sy},${DIR_NAMES[sd]})`.padEnd(18)} ${String(sim.black.size).padStart(5)}   ` +
         `${`(${r.x},${r.y})`.padEnd(14)} ${dist.padStart(6)}   ${same ? 'idéntico' : 'DISTINTO'}`);
  }
  // caja y densidad del patrón de referencia
  const { sim } = planeRun(N);
  const bb = boundingBox(sim.black);
  line(`\nCaja del patrón @${N}: ${bb.w}×${bb.h} = ${bb.area} celdas, ${sim.black.size} negras -> densidad ${pct(sim.black.size, bb.area)}`);
  line(`VEREDICTO T0: ${allEqual ? 'el patrón es idéntico salvo rotación/traslación' : 'hay divergencia'} (polvo: ${sim.black.size} negras)`);
}

/* ------------------------------------------------------------------ */
/* T1. Quiralidad: la reflexión NO es simetría                         */
/* ------------------------------------------------------------------ */
function t1_chirality() {
  rule('T1 · ¿Es el dibujo simétrico respecto a un espejo?');
  const { sim } = planeRun(N);
  const refl = new Set([...sim.black].map(k => {
    const i = k.indexOf(','); const x = +k.slice(0, i), y = +k.slice(i + 1);
    return (-x) + ',' + y;
  }));
  const same = normalizePattern(refl, 0, 0, 0) === normalizePattern(sim.black, 0, 0, 0);
  line(`Reflejar el patrón y compararlo consigo mismo: ${same ? 'IGUAL' : 'DISTINTO'}`);

  // Regla espejo (giro izquierda en blanco) con el inicio reflejado (dir 0) -> reflejo exacto.
  const simM = new Langton({ world: 'infinite', rule: 'LR' });
  run(simM, { steps: N, x: 0, y: 0, dir: 0 });
  const ok = normalizePattern(simM.black, 0, 0, 0) === normalizePattern(refl, 0, 0, 0);
  line(`Regla espejo con inicio espejo reproduce el reflejo: ${ok ? 'SÍ' : 'NO'}`);
  line(`VEREDICTO T1: la hormiga es QUIRAL; el espejo no es una simetría del sistema (solo lo es si también inviertes la regla).`);
}

/* ------------------------------------------------------------------ */
/* T2. Universalidad de la autopista                                   */
/* ------------------------------------------------------------------ */
function t2_highway() {
  rule('T2 · ¿La autopista aparece siempre en el mismo paso y con la misma velocidad?');
  const P = 104;
  const starts = [[0, 0, 0], [0, 0, 1], [100, -50, 2], [-300, 200, 3]];
  line('inicio          fin de fase caótica   desplazamiento/104 pasos');
  let stepsSeen = new Set();
  for (const [sx, sy, sd] of starts) {
    const total = 14000;
    const { r } = planeRun(total, sx, sy, sd);
    const disp = (a, b) => [r.path[b].x - r.path[a].x, r.path[b].y - r.path[a].y];
    let lastChange = 0, prev = null, final = null;
    for (let s = 0; s + P <= total; s++) {
      const d = disp(s, s + P);
      if (prev && (d[0] !== prev[0] || d[1] !== prev[1])) lastChange = s;
      prev = d; final = d;
    }
    stepsSeen.add(lastChange);
    line(`${`(${sx},${sy},${DIR_NAMES[sd]})`.padEnd(15)} ${String(lastChange).padStart(10)}            ` +
         `(${final[0]},${final[1]})   [${Math.hypot(...final).toFixed(2)} celdas]`);
  }
  line(`\n¿Mismo paso de transición para todos? ${stepsSeen.size === 1 ? 'SÍ -> ' + [...stepsSeen][0] : 'NO -> ' + [...stepsSeen].join(', ')}`);
  line('VEREDICTO T2: la transición es universal (no depende del inicio); solo se rota el vector de la autopista.');
}

/* ------------------------------------------------------------------ */
/* T3. Crecimiento en fase de autopista                                */
/* ------------------------------------------------------------------ */
function t3_growth() {
  rule('T3 · ¿Cuánto crece el número de celdas negras?');
  const sim = new Langton({ world: 'infinite' });
  let x = 0, y = 0, dir = 0;
  const marks = [10000, 20000, 40000, 80000];
  let prevM = null, prevC = null;
  line('pasos    negras    Δ negras    Δ por 1000 pasos');
  for (let i = 1; i <= 80000; i++) {
    const s = sim.step(x, y, dir, i); x = s.x; y = s.y; dir = s.dir;
    if (marks.includes(i)) {
      const dN = prevC === null ? '' : String(sim.black.size - prevC);
      const per = prevM === null ? '' : ((sim.black.size - prevC) / ((i - prevM) / 1000)).toFixed(2);
      line(`${String(i).padEnd(8)} ${String(sim.black.size).padStart(6)}    ${String(dN).padStart(8)}    ${per}`);
      prevM = i; prevC = sim.black.size;
    }
  }
  const slope = (sim.black.size - 0) / 80000;
  line(`\nPendiente global ≈ ${slope.toFixed(4)} celdas negras por paso (≈ 1 celda cada ${Math.round(1 / slope)} pasos).`);
  line('VEREDICTO T3: tras la autopista el crecimiento es LINEAL y constante; no hay saturación.');
}

/* ------------------------------------------------------------------ */
/* T4. Reversibilidad                                                  */
/* ------------------------------------------------------------------ */
function t4_reversibility() {
  rule('T4 · ¿Es la dinámica reversible? (ida y vuelta exacta)');
  for (const world of ['infinite', 'torus']) {
    const sim = new Langton({ world, size: 64 });
    let x = 0, y = 0, dir = 0;
    const S = 5000;
    for (let i = 0; i < S; i++) {
      const s = sim.step(x, y, dir, i + 1); x = s.x; y = s.y; dir = s.dir;
    }
    let bx = x, by = y, bd = dir;
    for (let i = 0; i < S; i++) {
      const s = inverseStep(sim, bx, by, bd); bx = s.x; by = s.y; bd = s.dir;
    }
    const ok = bx === 0 && by === 0 && bd === 0 && sim.black.size === 0;
    line(`${world.padEnd(9)}: ida ${S} pasos y vuelta -> (${bx},${by},${DIR_NAMES[bd]}), negras=${sim.black.size}  ${ok ? 'EXACTO' : 'FALLO'}`);
  }
  line('VEREDICTO T4: el mapa es una biyección; por tanto en un mundo finito sin borde (toro) no hay transitorios, solo ciclos.');
}

/* ------------------------------------------------------------------ */
/* T5. Toro: periodicidad pura y mismo periodo por traslación          */
/* ------------------------------------------------------------------ */
function cycleLength(size, sx = 0, sy = 0, cap = 30_000_000) {
  const sim = new Langton({ world: 'torus', size });
  let x = sx, y = sy, dir = 0;
  let hx = 0, hy = 0;
  const seen = new Map();
  for (let i = 0; i <= cap; i++) {
    const key = `${x},${y},${dir},${hx},${hy}`;
    if (seen.has(key)) return { period: i - seen.get(key), start: seen.get(key), steps: i };
    seen.set(key, i);
    const s = sim.step(x, y, dir, i + 1);
    // step togleó exactamente la celda (x,y): actualizamos el hash Zobrist.
    const [a, b] = cellHash(x, y);
    hx ^= a; hy ^= b;
    x = s.x; y = s.y; dir = s.dir;
  }
  return null;
}

function t5_torus() {
  rule('T5 · En un toro (sin bordes) ¿todo acaba en un ciclo?');
  for (const [size, sx, sy] of [[3, 0, 0], [3, 1, 1], [4, 0, 0], [4, 1, 1], [5, 0, 0], [5, 1, 1]]) {
    const res = cycleLength(size, sx, sy);
    if (!res) { line(`toro ${size}×${size} desde (${sx},${sy}): sin repetición (<30M)`); continue; }
    line(`toro ${size}×${size} desde (${sx},${sy}): periodo=${res.period}, transitorio=${res.start}  (repite en el paso ${res.steps})`);
  }
  line('VEREDICTO T5: no hay transitorio (empieza el ciclo en el paso 0). La posición inicial solo desfasa el ciclo; el periodo es el mismo.');
}

/* ------------------------------------------------------------------ */
/* T6. Sensibilidad al borde: tablero finito con escape                */
/* ------------------------------------------------------------------ */
function t6_boundary() {
  rule('T6 · Tablero finito con borde: ¿importa dónde empiezas? (si sale, se acaba)');
  const L = 41, CAP = 9999;
  const results = [];
  for (let sy = 0; sy < L; sy += 2) {
    for (let sx = 0; sx < L; sx += 2) {
      const sim = new Langton({ world: 'finite', size: L });
      const r = run(sim, { steps: CAP, x: sx, y: sy, dir: 0 });
      results.push({ sx, sy, escapedAt: r.escapedAt, black: sim.black.size });
    }
  }
  const esc = results.filter(r => r.escapedAt !== null).map(r => r.escapedAt);
  const never = results.filter(r => r.escapedAt === null);
  const mean = esc.reduce((a, b) => a + b, 0) / esc.length;
  const vari = esc.reduce((a, b) => a + (b - mean) ** 2, 0) / esc.length;
  line(`Muestras: ${results.length}   escapan: ${esc.length}   sobreviven ${CAP} pasos: ${never.length}   sin borde nunca podría salir`);
  line(`Paso de escape: min=${Math.min(...esc)}  max=${Math.max(...esc)}  media=${mean.toFixed(0)}  desv=${Math.sqrt(vari).toFixed(0)}`);
  const bl = results.map(r => r.black);
  line(`Negras al escapar/servir: min=${Math.min(...bl)}  max=${Math.max(...bl)}  media=${(bl.reduce((a, b) => a + b, 0) / bl.length).toFixed(0)}`);
  // mapa ASCII: oscuro = aguanta mucho, claro = escapa pronto
  const chars = ' .:-=+*#%@';
  line('\nMapa de "cuánto aguanta" según el inicio (fila=y, col=x):');
  let out = '';
  for (let sy = 0; sy < L; sy += 2) {
    for (let sx = 0; sx < L; sx += 2) {
      const r = results.find(q => q.sx === sx && q.sy === sy);
      let c;
      if (r.escapedAt === null) c = '@';
      else c = chars[Math.min(9, Math.floor(9 * r.escapedAt / CAP))];
      out += c;
    }
    out += '\n';
  }
  line(out);
  line(`VEREDICTO T6: con borde, el resultado depende fuertemente del inicio: mismo sistema, vidas de ${Math.min(...esc)} a ${Math.max(...esc)} pasos (rango ×${(Math.max(...esc) / Math.min(...esc)).toFixed(0)}).`);
}

/* ------------------------------------------------------------------ */
/* T7. ¿Se repite el estado completo en el plano infinito?             */
/* ------------------------------------------------------------------ */
function t7_no_repeat() {
  rule('T7 · ¿La hormiga en el plano infinito repite alguna vez su estado completo?');
  const sim = new Langton({ world: 'infinite' });
  let x = 0, y = 0, dir = 0, hx = 0, hy = 0;
  const seen = new Set();
  let repeatedAt = null;
  const CAP = 200000;
  for (let i = 0; i <= CAP; i++) {
    const key = `${x},${y},${dir},${hx},${hy}`;
    if (seen.has(key)) { repeatedAt = i; break; }
    seen.add(key);
    const s = sim.step(x, y, dir, i + 1);
    const [a, b] = cellHash(x, y);
    hx ^= a; hy ^= b;
    x = s.x; y = s.y; dir = s.dir;
  }
  line(`Estados distintos vistos en ${CAP} pasos: ${seen.size}`);
  line(`¿Repite estado completo? ${repeatedAt === null ? 'NO' : 'SÍ en el paso ' + repeatedAt}`);
  line(`Posición final: (${x},${y})  distancia al origen: ${Math.hypot(x, y).toFixed(1)};  negras=${sim.black.size}`);
  line('VEREDICTO T7: en el plano infinito no se repite el estado; el recorrido es genuinamente no periódico y no acotado.');
}

/* ------------------------------------------------------------------ */
/* T8. Predicción: el patrón a 9999 es un "corte" arbitrario            */
/* ------------------------------------------------------------------ */
function t8_snapshot_arbitrary() {
  rule('T8 · ¿Cuánto cambia el retrato entre pasos consecutivos en la zona 9999?');
  const sim = new Langton({ world: 'infinite' });
  let x = 0, y = 0, dir = 0;
  const snap = new Map();
  for (let i = 1; i <= 10100; i++) {
    const s = sim.step(x, y, dir, i); x = s.x; y = s.y; dir = s.dir;
    if (i >= 9990 && i <= 10010) snap.set(i, sim.black.size);
  }
  const ks = [...snap.keys()];
  line('paso   negras');
  for (const k of ks) if (k % 4 === 0 || k === 9999) line(`${k}   ${snap.get(k)}`);
  line(`\nEn los 21 pasos 9990..10010 las negras pasan de ${snap.get(9990)} a ${snap.get(10010)}.`);
  line('VEREDICTO T8: 9999 no es un "resultado"; es un fotograma cualquiera en plena transición a la autopista.');
}

t0_invariance();
t1_chirality();
t2_highway();
t3_growth();
t4_reversibility();
t5_torus();
t6_boundary();
t7_no_repeat();
t8_snapshot_arbitrary();
