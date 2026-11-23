"""Verificación INDEPENDIENTE del certificado de autopista.

Reimplementa la dinámica y el certificador desde cero (claves = tuplas (x,y),
sin imports del motor JS) y compara contra la salida de generar_muestra.mjs.

Además verifica el caso estándar y la ley del +12.
"""

import json
import os

DX = (0, 1, 0, -1)
DY = (-1, 0, 1, 0)


def paso(black, x, y, d):
    """Un paso de Langton. Devuelve (x, y, d) tras mover."""
    k = (x, y)
    if k in black:
        d = (d + 3) & 3
        black.remove(k)
    else:
        d = (d + 1) & 3
        black.add(k)
    return x + DX[d], y + DY[d], d


def frente_libre(initial, absorbed, px, py, R, v, base):
    """Ninguna semilla no absorbida rompe el patrón en R + k*v, k >= 0."""
    for cx, cy in initial:
        if (cx, cy) in absorbed:
            continue
        for rx, ry in R:
            dx, dy = cx - px - rx, cy - py - ry
            if v[0] != 0:
                if dx % v[0] != 0:
                    continue
                k = dx // v[0]
                if k * v[1] != dy:
                    continue
            else:
                if dy % v[1] != 0:
                    continue
                k = dy // v[1]
                if k * v[0] != dx:
                    continue
            if k < 0:
                continue
            if (px + rx, py + ry) not in base:
                return False
    return True


def certificar(offsets, cap=2_000_000):
    black = set(offsets)
    initial = set(offsets)
    absorbed = set()
    x = y = d = 0
    px_hist = [0] * (cap + 1)
    py_hist = [0] * (cap + 1)
    prev = None
    stable = 0
    t = 0
    while t < cap:
        t += 1
        k = (x, y)
        if k in initial and k not in absorbed:
            absorbed.add(k)
        x, y, d = paso(black, x, y, d)
        px_hist[t], py_hist[t] = x, y
        if t < 104:
            continue
        vx, vy = x - px_hist[t - 104], y - py_hist[t - 104]
        if prev and (vx, vy) != prev:
            stable = 0
        else:
            stable += 1
        prev = (vx, vy)
        if stable < 312 or (vx, vy) == (0, 0):
            continue

        base = set(black)
        bx, by, bd, bt = x, y, d, t
        rel = [(0, 0)]
        for _ in range(1, 105):
            x, y, d = paso(black, x, y, d)
            rel.append((x - bx, y - by))
        v2 = (x - bx, y - by)
        ok = d == bd
        if ok:
            for rx, ry in rel:
                if ((bx + rx, by + ry) in base) != ((x + rx, y + ry) in black):
                    ok = False
                    break
        if ok:
            ok = frente_libre(initial, absorbed, bx, by, set(rel), v2, base)
        if ok:
            return {"T": bt, "v": list(v2)}
        for i, (rx, ry) in enumerate(rel):
            px_hist[bt + i] = bx + rx
            py_hist[bt + i] = by + ry
        prev = None
        stable = 0
    return None


def main():
    ruta = os.path.join(os.path.dirname(__file__), "muestra.json")
    with open(ruta, encoding="utf-8") as f:
        muestra = json.load(f)

    coinciden = 0
    discrepancias = []
    for i, caso in enumerate(muestra):
        r = certificar([tuple(p) for p in caso["offsets"]])
        if r is None:
            discrepancias.append((i, "sin certificar", caso["T"], caso["v"]))
            continue
        if r["T"] == caso["T"] and r["v"] == caso["v"]:
            coinciden += 1
        else:
            discrepancias.append((i, "valor distinto", (caso["T"], caso["v"]), r))
    print(f"muestra: {len(muestra)} configuraciones")
    print(f"coincidencias exactas (T y v): {coinciden}/{len(muestra)}")
    for d in discrepancias[:10]:
        print("  DISCREPANCIA:", d)

    # Caso estándar y conteo
    black = set()
    x = y = d = 0
    conteo = {20000: None, 50000: None, 100000: None}
    for t in range(1, 100001):
        x, y, d = paso(black, x, y, d)
        if t in conteo:
            conteo[t] = len(black)
    print(f"estándar: posición en 100000 = ({x},{y}), |B| = {conteo[100000]}")
    print("  esperado: posición (-1748,1726), |B| = 11108")

    # +12 por ciclo en un tramo
    black = set()
    x = y = d = 0
    cs = {}
    for t in range(1, 30001):
        x, y, d = paso(black, x, y, d)
        if t in (20000, 20104):
            cs[t] = len(black)
    print(f"  |B(20104)| - |B(20000)| = {cs[20104] - cs[20000]}  (esperado 12)")


if __name__ == "__main__":
    main()
