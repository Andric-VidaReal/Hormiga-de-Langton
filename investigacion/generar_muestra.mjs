// Genera una muestra determinista con los resultados del motor JS, para que
// verificacion_independiente/verificar.py los recalcule desde cero en Python.
import { simulateAbsorb, KK } from './motor.mjs';
import { writeFileSync } from 'node:fs';

let s = 0x1234abcd >>> 0;
const rnd = () => {
  s = (s * 1664525 + 1013904223) >>> 0;
  return s / 4294967296;
};

const offs = [];
for (let i = 0; i < 40; i++) {
  const x = Math.floor(rnd() * 401) - 200, y = Math.floor(rnd() * 401) - 200;
  if (x !== 0 || y !== 0) offs.push([[x, y]]);
}
for (let i = 0; i < 40; i++) {
  const L = rnd() < 0.5 ? 2 : 3;
  const off = [];
  for (let y = -L; y <= L; y++) for (let x = -L; x <= L; x++) {
    if (!(x === 0 && y === 0) && rnd() < 0.4) off.push([x, y]);
  }
  offs.push(off);
}

const muestra = [];
for (const off of offs) {
  const r = simulateAbsorb(off.map(([x, y]) => KK(x, y)), 2_000_000);
  if (!r.detected) { console.log('SIN CERTIFICAR en muestra:', JSON.stringify(off)); continue; }
  muestra.push({ offsets: off, T: r.T, v: r.v });
}

writeFileSync('investigacion/verificacion_independiente/muestra.json', JSON.stringify(muestra, null, 1));
console.log(`muestra generada: ${muestra.length} configuraciones (JS)`);
