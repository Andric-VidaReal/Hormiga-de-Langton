// VALIDACIÓN EMPÍRICA DEL CERTIFICADOR
//
// El certificado afirma "autopista eterna". Aquí se comprueba, para una muestra
// amplia, que tras el instante certificado el desplazamiento a 104 pasos sigue
// siendo constante durante 208 000 pasos más (2000 ciclos). No es una prueba,
// pero detectaría un certificado prematuro del tipo que ya encontramos.

import { simulateAbsorb, KK, rng } from './motor.mjs';
const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];

// Corre desde la configuración inicial; comprueba que D(t) es constante
// en toda la ventana [tDesde, tDesde + extra] y devuelve el último cambio.
function comprobar(initialKeys, tDesde, extra) {
  const cap = tDesde + extra;
  const black = new Set(initialKeys);
  let x = 0, y = 0, d = 0;
  const px = new Float64Array(cap + 1), py = new Float64Array(cap + 1);
  let prev = null, cambios = 0, primerCambio = -1;
  for (let t = 1; t <= cap; t++) {
    const k = KK(x, y);
    if (black.has(k)) { d = (d + 3) & 3; black.delete(k); } else { d = (d + 1) & 3; black.add(k); }
    x += DX[d]; y += DY[d];
    px[t] = x; py[t] = y;
    if (t >= 104) {
      const dx = x - px[t - 104], dy = y - py[t - 104];
      if (prev && (dx !== prev[0] || dy !== prev[1])) {
        cambios++;
        if (t >= tDesde && primerCambio < 0) primerCambio = t;
      }
      prev = [dx, dy];
    }
  }
  return { cambios, primerCambio };
}

const rand = rng(20261123);
const casos = [];

// 1) 4x4 aleatorios
for (let i = 0; i < 120; i++) {
  const off = [];
  for (let y = -2; y <= 1; y++) for (let x = -2; x <= 1; x++) if (rand() < 0.5) off.push([x, y]);
  casos.push(['4x4', off.map(([x, y]) => KK(x, y))]);
}
// 2) una celda lejana
for (let i = 0; i < 80; i++) {
  const x = Math.floor(rand() * 601) - 300, y = Math.floor(rand() * 601) - 300;
  if (x === 0 && y === 0) continue;
  casos.push(['1 celda', [KK(x, y)]]);
}
// 3) 7x7 aleatorios
for (let i = 0; i < 100; i++) {
  const off = [];
  for (let y = -3; y <= 3; y++) for (let x = -3; x <= 3; x++) if (rand() < 0.4) off.push([x, y]);
  casos.push(['7x7', off.map(([x, y]) => KK(x, y))]);
}

let ok = 0, mal = 0, sinCert = 0;
const t0 = Date.now();
for (const [nombre, keys] of casos) {
  const cert = simulateAbsorb(keys, 800000);
  if (!cert.detected) { sinCert++; console.log(`  SIN CERTIFICAR: ${nombre} (${keys.length} celdas)`); continue; }
  const r = comprobar(keys, cert.total, 104 * 2000);
  if (r.cambios > 0 && r.primerCambio >= 0) {
    mal++;
    console.log(`  FALLO tras certificar: ${nombre} t=${cert.T} primer cambio posterior=${r.primerCambio}`);
  } else ok++;
}

console.log(`\ncasos=${casos.length}  certificados y estables=${ok}  sin certificar=${sinCert}  fallos=${mal}`);
console.log(`tiempo=${((Date.now() - t0) / 1000).toFixed(0)}s`);
