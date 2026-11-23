# Hormiga de Langton — teorías y primer contraste

Regla base: celda **blanca** → gira 90° a la **derecha**, pinta negro, avanza.
Celda **negra** → gira 90° a la **izquierda**, pinta blanco, avanza.
Salida completa: `resultados.txt` (generado con `node experimentos.mjs`).

Estados simulados: plano infinito, tablero finito con borde (la hormiga escapa) y toro (sin borde).

---

## T0 · Invariancia del patrón en el plano infinito — ✅ confirmada

**Teoría.** En un plano infinito y todo blanco, el patrón a N pasos no depende de la posición ni de la orientación inicial: solo cambia por traslación y rotación.

**Datos a 9999 pasos** (8 inicios distintos):

| inicio | negras | posición | distancia |
|---|---|---|---|
| (0,0,N) | 719 | (-16,-9) | 18.358 |
| (0,0,E) | 719 | (9,-16) | 18.358 |
| (0,0,S) | 719 | (16,9) | 18.358 |
| (0,0,O) | 719 | (-9,16) | 18.358 |
| (500,-777,N) | 719 | (484,-786) | 18.358 |
| (-1234,987,E) | 719 | (-1225,971) | 18.358 |

Patrón canónico idéntico en los 8 casos. Caja 49×45, densidad 32,6 %.
**Matiz:** la *posición* no coincide, solo su distancia; es la misma figura girada. Es una simetría geométrica trivial, no una convergencia.

## T1 · Quiralidad: el espejo no es simetría — ✅ confirmada

Reflejar el patrón y compararlo consigo mismo da **DISTINTO**. La versión espejo solo se reproduce si además se invierte la regla (giro izquierda en blanco): con regla `LR` e inicio reflejado el reflejo sale **exacto**.
**Consecuencia:** no existe simetría de reflexión; sí de rotación (4 orientaciones equivalentes).

## T2 · Universalidad de la transición a la autopista — ✅ confirmada

Para 4 inicios distintos, el fin de la fase caótica ocurre **siempre en el paso 9976**. A partir de ahí el desplazamiento cada 104 pasos es constante (módulo rotación): (-2,2), (-2,-2), (2,-2), (2,2), siempre de longitud 2,83 celdas.
**Consecuencia:** la "autopista" es universal; el inicio solo la rota.

## T3 · Crecimiento lineal tras la autopista — ✅ confirmada

| pasos | negras | Δ/1000 pasos |
|---|---|---|
| 10 000 | 720 | — |
| 20 000 | 1872 | 115,2 |
| 40 000 | 4182 | 115,5 |
| 80 000 | 8798 | 115,4 |

Pendiente ≈ **0,110 celdas negras/paso** (1 celda cada ~9 pasos). No hay saturación.
**Predicción falsable:** el número de negras crece como `≈ 0,11·N + c`; debería mantenerse a 10⁶ pasos.

## T4 · Reversibilidad — ✅ confirmada

Ida de 5000 pasos y vuelta con el paso inverso exacto recupera `(0,0,N)` y tablero vacío, tanto en plano infinito como en toro.
**Consecuencia fuerte:** el mapa es una **biyección**. En cualquier mundo finito sin borde no puede haber transitorios: todo estado está ya dentro de un ciclo.

## T5 · Toro: periodicidad pura — ✅ confirmada

| toro | desde (0,0) | desde (1,1) |
|---|---|---|
| 3×3 | periodo 66, transitorio 0 | periodo 66 |
| 4×4 | periodo 96, transitorio 0 | periodo 96 |
| 5×5 | periodo 11 710, transitorio 0 | periodo 11 710 |

Mismo periodo al trasladar el inicio: la posición solo desfasa el ciclo. El salto 96 → 11 710 al pasar de 4 a 5 muestra que el periodo **no** crece suavemente con el tamaño.

## T6 · Sensibilidad al borde en tablero finito — ✅ confirmada (y refuta tu hipótesis)

Tablero 41×41, inicio en muestreo 21×21, dirección N, la hormiga escapa al salir:

- 441/441 escapan; **ninguna** llega a 9999.
- Vida: mín 1, máx 7385, media 1221, desv 1752 (**rango ×7385**).
- Negras al escapar: de 1 a 519.

**Consecuencia:** con borde, el resultado depende brutalmente del punto de partida. La invariancia de T0 es exclusiva del plano sin frontera.

## T7 · No periodicidad en el plano infinito — ✅ confirmada

200 000 pasos → 200 001 estados distintos (hash Zobrist de 64 bits). **Nunca** repite estado completo. A ese paso: (-3671, 3644), 22 641 negras.
**Consecuencia:** el recorrido es genuinamente no periódico y no acotado.

## T8 · "9999" es un corte arbitrario — ✅ confirmada

Entre los pasos 9990 y 10010 las negras pasan de 714 a 722, atravesando justo la transición (9976). El retrato de 9999 no es un resultado estable: es un fotograma durante el cambio de régimen.

---

## Resumen ejecutivo

1. **Tu intuición acierta solo en el plano infinito vacío**, y por simetría (rotación/traslación), no por convergencia.
2. **La posición no es invariante**; el patrón sí, salvo giro. La reflexión no lo es.
3. **En cuanto hay borde, la posición inicial manda** (vidas de 1 a 7385 pasos en 41×41).
4. **El número interesante no es 9999 sino 9976**: ahí empieza la autopista universal de periodo 104.
5. **No hay "conclusión"**: en el plano infinito nunca se repite; en un toro entra en ciclo desde el paso 0.

## Siguientes teorías a contrastar

- ¿La densidad 0,326 de la fase caótica es universal? Medirla a varios N e inicios.
- ¿El periodo en toro N×N sigue una ley? Serie 3→66, 4→96, 5→11710; explorar 6, 7, 8.
- ¿Cuánto tarda en "olvidar" el estado inicial si se parte de configuraciones aleatorias (p. ej. 10 % negro)?
- Mapa de escape completo 41×41 a resolución 1 (no cada 2) para ver la estructura fina.
