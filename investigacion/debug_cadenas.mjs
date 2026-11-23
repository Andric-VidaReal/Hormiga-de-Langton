import { KK } from './motor.mjs';
const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];
const TMAX = 200000;
const sx = new Float64Array(TMAX + 1), sy = new Float64Array(TMAX + 1);
{
  const black = new Set(); let x = 0, y = 0, d = 0;
  for (let t = 1; t <= TMAX; t++) {
    const k = KK(x, y);
    if (black.has(k)) { d = (d + 3) & 3; black.delete(k); } else { d = (d + 1) & 3; black.add(k); }
    x += DX[d]; y += DY[d]; sx[t] = x; sy[t] = y;
  }
}
const primera = new Map();
for (let t = 0; t <= TMAX; t++) { const k = KK(sx[t], sy[t]); if (!primera.has(k)) primera.set(k, t); }
const esPrimera = (t) => primera.get(KK(sx[t], sy[t])) === t;

// ¿Qué fases aparecen como primera visita y con qué frecuencia por ciclo?
const porFase = Array.from({ length: 104 }, () => []);
for (let t = 15000; t <= 160000; t++) if (esPrimera(t)) porFase[t % 104].push(t);
console.log('fases presentes:', porFase.map((v, f) => [f, v.length]).filter(([, n]) => n).map(([f, n]) => `${f}(${n})`).join(' '));

// ¿La cadena t*, t*+104, t*+208... es continua?
console.log('\nCadenas (longitud de rachas consecutivas de primeras visitas):');
const longitudes = new Map();
let rachas = [];
for (let f = 0; f < 104; f++) {
  const l = porFase[f];
  if (!l.length) continue;
  let run = 1;
  for (let i = 1; i < l.length; i++) {
    if (l[i] === l[i - 1] + 104) run++;
    else { rachas.push([f, l[i - 1] - 104 * (run - 1), run]); longitudes.set(run, (longitudes.get(run) || 0) + 1); run = 1; }
  }
  rachas.push([f, l[l.length - 1] - 104 * (run - 1), run]);
  longitudes.set(run, (longitudes.get(run) || 0) + 1);
}
rachas.sort((a, b) => b[2] - a[2]);
console.log('  rachas más largas:', rachas.slice(0, 8).map(([f, ini, n]) => `fase ${f}: ${ini}..+${n} ciclos`).join(' | '));
console.log('  distribución de longitudes:', [...longitudes].sort((a, b) => a[0] - b[0]).map(([k, v]) => `${k}:${v}`).join(' '));

// Fase 65: dónde están sus primeras visitas y si son consecutivas
const c65 = [15041, 82537, 149929].filter(() => true);
for (const t of c65) {
  let consec = 0;
  while (esPrimera(t + 104 * (consec + 1))) consec++;
  let atras = 0;
  while (t - 104 * (atras + 1) >= 0 && esPrimera(t - 104 * (atras + 1))) atras++;
  console.log(`\nt*=${t} fase=${t % 104}: cadena hacia atrás=${atras}, hacia delante=${consec}`);
}
