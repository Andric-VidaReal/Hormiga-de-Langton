import { simulate, KK, keysFromOffsets } from './motor.mjs';

const CAP = 400_000;

// ---------- F) EXHAUSTIVO 4x4 ----------
// Todas las 2^16 configuraciones con celdas negras en [-2,1]^2 y la hormiga en (0,0).
function exhaustivo4() {
  console.log('F) EXHAUSTIVO 4x4: 65 536 configuraciones (soporte en [-2,1]^2)');
  const cells = [];
  for (let y = -2; y <= 1; y++) for (let x = -2; x <= 1; x++) cells.push([x, y]);
  const n = cells.length;
  const initialKeys = new Int32Array(n);

  let ok = 0, bad = 0, maxT = -1, maxMask = -1, maxV = null;
  const t0 = Date.now();
  for (let mask = 0; mask < (1 << n); mask++) {
    const keys = [];
    for (let i = 0; i < n; i++) if (mask & (1 << i)) keys.push(KK(cells[i][0], cells[i][1]));
    const r = simulate(keys, CAP);
    if (r.detected) {
      ok++;
      if (r.T > maxT) { maxT = r.T; maxMask = mask; maxV = r.v; }
    } else {
      bad++;
      if (bad <= 5) console.log(`   SIN CERTIFICAR mask=${mask} motivo=${r.reason}`);
    }
    if (mask % 8192 === 0 && mask > 0) {
      const el = ((Date.now() - t0) / 1000).toFixed(0);
      console.log(`   ...${mask} / 65536  (${el}s)  maxT=${maxT}`);
    }
  }
  const el = ((Date.now() - t0) / 1000).toFixed(0);
  console.log(`   RESULTADO: certificadas=${ok}  sin certificar=${bad}  tiempo=${el}s`);
  console.log(`   transitorio máximo T=${maxT}  v=(${maxV})  mask=${maxMask}`);
  const worst = [];
  for (let i = 0; i < n; i++) if (maxMask & (1 << i)) worst.push(cells[i]);
  console.log(`   peor configuración: ${JSON.stringify(worst)}`);
  return { ok, bad, maxT };
}

// ---------- G) MAPA DE TRANSITORIOS: UNA SOLA CELDA NEGRA ----------
function mapaUnaCelda() {
  console.log('\nG) UNA SOLA CELDA NEGRA: mapa de transitorios T(x,y), offsets [-18,18]');
  const R = 18;
  const rows = [];
  let maxT = -1, best = null, ok = 0, bad = 0;
  const t0 = Date.now();
  for (let y = -R; y <= R; y++) {
    const line = [];
    for (let x = -R; x <= R; x++) {
      if (x === 0 && y === 0) { line.push('o'); continue; }
      const r = simulate(keysFromOffsets([[x, y]]), CAP);
      if (r.detected) {
        ok++;
        if (r.T > maxT) { maxT = r.T; best = [x, y, r.T]; }
        const idx = Math.max(0, Math.min(9, Math.floor((Math.log10(r.T) - 2.6) * 4)));
        line.push(' .:-=+*#%@'[idx]);
      } else { bad++; line.push('X'); }
    }
    rows.push(line.join(''));
  }
  const el = ((Date.now() - t0) / 1000).toFixed(0);
  console.log('   (o = hormiga; X = sin certificar; más oscuro = transitorio más largo)');
  for (const r of rows) console.log('   ' + r);
  console.log(`   certificadas=${ok} sin certificar=${bad}  tiempo=${el}s`);
  console.log(`   transitorio máximo: T=${best[2]} en offset (${best[0]},${best[1]})`);
}

exhaustivo4();
mapaUnaCelda();
