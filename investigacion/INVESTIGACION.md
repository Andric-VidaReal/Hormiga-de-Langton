# Investigación sobre la conjetura de la autopista — fases 1–4

Fecha: 2026-11-23. Estado: **la conjetura general sigue abierta.** Lo que hay aquí es progreso verificado: dos resultados demostrados (caso estándar y no-acotación del transitorio), verificación exhaustiva a gran escala y un mapa de los obstáculos.

## 1. Qué se ha construido

- `motor.mjs` — simulador y **certificador de autopista eterna** para configuraciones iniciales finitas arbitrarias.
- `fase3.mjs`, `fase4.mjs`, `fase5.mjs` — verificación exhaustiva de familias finitas.
- `teorema_transitorio.mjs`, `conteo_autopista.mjs` — verificación de los dos teoremas.
- `ley_fase.mjs`, `perturbacion2.mjs`, `reajuste_escala.mjs`, `cascada.mjs` — estructura y escala del reajuste.
- `validacion.mjs` — comprobación de que los certificados no son prematuros.
- `analisis.mjs` — estadística de los regímenes alcanzados.

## 2. El certificado (y el fallo que hubo que corregir)

Un certificado de «autopista eterna» necesita dos condiciones:

1. **Periodicidad local:** en el instante `t`, el estado sobre la ventana visitada `R` se repite trasladado por `v` en 104 pasos (misma dirección, mismos colores, mismo patrón).
2. **Frente futuro limpio:** ninguna **semilla inicial no visitada** cae en `R + k·v` (`k ≥ 0`) en una posición donde el patrón base espera **blanco**.

La condición 2 es imprescindible. Mi primer certificado solo comprobaba (1) y era **prematuro** para configuraciones no vacías: una celda negra lejana, fuera de la ventana local, puede estar en la trayectoria futura y romper la autopista miles de pasos después. Descubierto y corregido; el certificado final exige (1) y (2).

## 3. Verificación exhaustiva

| Familia | Configuraciones | Certificadas | T (min / p50 / p90 / p99 / max) |
|---|---|---|---|
| 3×3 centrado en la hormiga | 512 | **512** | 615 / 2 789 / 11 610 / — / 43 679 |
| 4×4 en `[-2,1]²` | 65 536 | **65 536** | 570 / 2 277 / 10 506 / — / 103 813 |
| 4×4 en las **16 alineaciones** con la hormiga | **1 048 576** | **1 048 576** | 544 / 2 283 / 10 524 / 29 693 / 153 012 |
| Una sola celda negra, offsets `[-18,18]` | 1 368 | **1 368** | 725 / 10 392 / 16 529 / — / 106 673 |
| Una sola celda, `[-128,128]²` | **66 048** | **66 048** | 725 / 10 392 / 10 392 / 19 491 / 106 673 |
| Dos celdas, `[-8,8]²` | **41 328** | **41 328** | 577 / 4 381 / 14 472 / 34 464 / 106 672 |
| 5×5 aleatorias | 50 000 | **50 000** | 543 / 2 490 / 10 932 / 30 298 / 113 050 |
| 9×9 aleatorias | 20 000 | **20 000** | 535 / 3 124 / 12 376 / 31 723 / 93 997 |

Fase 5 añadió **177 376 configuraciones nuevas, todas certificadas, 0 fallos**. Dato llamativo: con **una sola celda**, el 97,8 % de los casos acaba en la orientación estándar `v = (−2,2)` (64 583 de 66 048); las otras tres orientaciones se reparten el resto (690 / 476 / 299). Con dos o más celdas las cuatro orientaciones se equilibran.

La familia grande (16 alineaciones × 2¹⁶ subconjuntos) tardó 462 s. Máximos por alineación: entre 85 900 y 153 012; la peor alineación es la que deja la hormiga en la esquina `(0,−3)`.

**Todos los regímenes certificados tienen `v = (±2, ±2)`** (las 4 orientaciones), con frecuencias casi idénticas (16 608 / 16 577 / 16 216 / 16 135 sobre las 65 536 de 4×4). No apareció ningún otro desplazamiento.

## 4. Teorema: el transitorio no está acotado

Demostrado y verificado (detalle en `TEOREMA_TRANSITORIO.md`):

> **Teorema.** Para todo `N` existe una configuración con **una sola celda negra** cuyo desplazamiento a 104 pasos cambia después del paso `N`.

Prueba: si la semilla está en una celda `c` cuya **primera** visita estándar es `t* > N`, la trayectoria perturbada coincide con la estándar hasta `t*`. Por la periodicidad certificada, `D(t*) = v`; en el paso siguiente la hormiga lee `c` negra en vez de blanca, gira al lado opuesto y `D(t*+1) = v − 2e ≠ v` (con `e` el paso unidad de la estándar). Luego el último cambio es `> N`. No se supone convergencia en ningún punto.

**Corolario.** En `t* − 1` el estado sobre la ventana visitada es **idéntico** al de la autopista eterna, y aun así la configuración no está en la autopista. Ningún certificado puramente local puede decidir la eternidad: hace falta la condición (2).

### Tabla verificada

| N | t* (primera visita) | celda c | D(t*) | D(t*+1) | último cambio |
|---|---|---|---|---|---|
| 20 000 | 20 006 | (−209, 187) | (−2,2) | (0,2) | 22 009 |
| 50 000 | 50 002 | (−783, 765) | (−2,2) | (0,2) | 50 141 |
| 100 000 | 100 007 | (−1 746, 1 727) | (−2,2) | (−2,0) | 108 459 |
| 300 000 | 300 001 | (−5 593, 5 574) | (−2,2) | (−2,4) | 351 150 |
| 1 000 000 | 1 000 008 | (−19 056, 19 034) | (−2,2) | (0,2) | 1 006 478 |

### Corrección de la tabla anterior

Los «t_hit» del informe previo eran instantes **nominales**, no primeras visitas. La autopista revisita celdas, así que el impacto real ocurre en la primera visita. Con los tiempos correctos:

| t nominal | primera visita real | reajuste (T − t*) | T |
|---|---|---|---|
| 20 000 | 19 988 | 414 | 20 402 |
| 50 000 | 49 988 | 3 659 | 53 647 |
| 100 000 | 99 992 | 6 470 | 106 462 |
| 200 000 | 200 000 | 3 748 | 203 748 |
| 300 000 | 300 000 | 15 681 | 315 681 |

El valor de `T` coincide exactamente con lo medido antes; lo que cambia es la interpretación del reajuste.

### No hay ley de fase exacta

Un intento natural: como el patrón local se repite cada 104 pasos, ¿depende el reajuste solo de la fase de `t*`? Se probaron 3 primeras visitas por fase separadas hasta 10⁵ pasos:

- 21 de las 22 fases con primeras visitas dan el **mismo** reajuste;
- **la fase 65 no**: 64 115 / 131 611 / 51 149.

La razón es estructural: el conjunto negro **no** es un trasladado exacto entre ciclos. Entre `t` y `t+104` hay 392 celdas que no viajan con el patrón y 404 nuevas; el conjunto **crece 12 celdas por ciclo** (`debug_periodicidad.mjs`). Solo la ventana local es periódica. La fase domina el reajuste, pero las 12 celdas nuevas por ciclo introducen una corrección de tamaño finito que, por sensibilidad, puede cambiar el resultado.

### Escala del reajuste

Mismo experimento a distancias hasta 10⁶ (22 fases, una semilla por fase y distancia):

| distancia objetivo | n | mín | mediana | p90 | máx |
|---|---|---|---|---|---|
| 30 000 | 22 | 139 | 3 748 | 12 587 | 79 091 |
| 100 000 | 22 | 139 | 3 748 | 12 587 | **149 083** |
| 300 000 | 22 | 139 | 3 748 | 12 587 | 51 149 |
| 1 000 000 | 22 | 139 | 3 748 | 12 587 | 51 149 |

No hay tendencia creciente: el reajuste fluctúa en un rango de ~10⁵ y el máximo global observado es **149 083**. La mediana y el p90 coinciden en las cuatro filas porque, salvo la fase 65, el reajuste depende solo de la fase. `reajuste_escala.mjs`.

### Validación del certificador

El certificado se validó ejecutando 300 configuraciones (120 de 4×4 aleatorias, 80 de una celda lejana hasta ±300, 100 de 7×7 aleatorias), certificándolas y **siguiendo 2 000 ciclos más** (208 000 pasos) para comprobar que el desplazamiento no cambia: **300/300 estables, 0 fallos** (`validacion.mjs`).

### Cascadas: varias semillas no hacen crecer el transitorio

Sembrando bloques de `m = 1 … 264` celdas en las primeras visitas posteriores a `t = 20 000` (`cascada.mjs`), el último cambio va de 22 009 a un máximo de **41 534** (en `m = 22`) y luego **decrece**: con `m ≥ 66` la hormiga solo cruza 41 de las semillas y el último cambio se queda fijo en **22 236**, independientemente de cuántas se añadan. La pared de celdas negras no produce un régimen caótico sostenido: la hormiga se reasienta y esquiva el resto del muro.

## 5. Teorema del conteo

Demostrado a partir del mismo certificado (detalle en `TEOREMA_CONTEO.md`):

> **Teorema.** Para todo `t ≥ 11 000`, `|B(t + 104)| = |B(t)| + 12`, donde `B(t)` es el conjunto de celdas negras del plano vacío.

La razón: el ciclo que empieza en `t + 104` es el trasladado por `v` del ciclo que empieza en `t`, así que el saldo neto de celdas pintadas/borradas en un ciclo es el mismo siempre. Midiendo un ciclo da `+12`.

Además el conteo es **afín-periódico exacto**:

```
|B(t)| = 834 + 12·⌊(t − 11 000)/104⌋ + r((t − 11 000) mod 104),
```

con `r` una tabla fija de 104 valores. Verificado en los **388 897 instantes** de `[11 000, 399 896]`: cero desviaciones. La tasa de crecimiento es exactamente `12/104 = 3/26 ≈ 0,11538` celdas por paso, que confirma con valor exacto la pendiente `≈0,11` medida al inicio.

Esto cuantifica por qué no hay ley de fase exacta: `B(t) + v` y `B(t + 104)` difieren en un defecto de frente de tamaño fijo (392 celdas que faltan, 404 que sobran), aunque el saldo neto sea siempre +12.

## 6. Qué está demostrado y qué no

**Demostrado (teoremas):**
- La autopista del plano vacío es eterna (certificado + inducción).
- El transitorio no tiene cota uniforme, incluso con una sola celda negra.
- Ningún certificado puramente local puede decidir la eternidad.
- El número de celdas negras de la autopista estándar crece exactamente `+12` por ciclo.
- **Independiente (80/80)** en una reimplementación Python desde cero (`verificacion_independiente/verificar.py`).

**Demostrado por verificación exhaustiva (teoremas finitos):**
- Las 512 configuraciones de 3×3, las 65 536 de 4×4, las **1 048 576** de 4×4 en 16 alineaciones, las **66 048** de una sola celda en `[-128,128]²`, los **41 328** pares en `[-8,8]²` y 70 000 configuraciones aleatorias de 5×5 y 9×9 alcanzan una autopista **eterna** según el certificado. Total: **1 226 244 configuraciones, 0 fallos**.
- Cota de 3 celdas en el semiplano derecho verificada: 1/2/20/261 semillas con máximos 2/38/106/**918** pasos (`verificar_avances2026.mjs`).
- Puerto de 4 celdas verificado: 182 pasos, `(5,−1)` tras reflejar `y`, 36 negras, certificado eterno (`verificar_avances2026.mjs`).
- Completación con 4 celdas verificada en 5 configuraciones adversarias: prefijo preservado y autopista eterna en **5/5** (`verificar_completacion4.mjs`).

**En preprint con Lean 4 (no revisado por pares, no replayado aquí):**
- Ke (2026): toda configuración de **una sola celda negra** acaba en P104, mediante 22 canales de frente e inducción XOR.

**Abierto:**
- Que **toda** configuración inicial finita acabe en autopista.
- La clasificación de posibles regímenes no periódicos y no acotados.
- Si el reajuste tras una perturbación lejana está acotado (lo observado fluctúa, máximo 149 083, sin crecimiento monótono).

**Empírico, no prueba:**
- Que solo aparezca `v = (±2,±2)`.
- Las distribuciones de transitorios y la dominancia de `v = (−2,2)` con una sola semilla.

## 7. Siguiente paso propuesto

1. Replayar el proof Lean de una celda si se instala Lean 4.30 (`investigacion/AVANCES_2026.md`); es el único frente verdaderamente nuevo.
2. Terminar y documentar el exhaustivo `fase6.mjs` de una celda en `[-512,512]²`.
3. Verificar más puertos de 4 celdas y reglas de dispersión composable con nuestro certificador.
4. Revisar si el argumento de 22 canales puede extenderse a dos celdas (primer escalón real hacia el caso general).

## 8. Contraste con la literatura de 2026

Los preprints de Jillhewar y Ke imponen restricciones fuertes a las autopistas periódicas, prueban el caso de una celda y construyen puertos de 4 celdas, pero **ninguno demuestra la conjetura general**. El detalle, con las verificaciones locales, está en `AVANCES_2026.md`. En particular, el teorema de completación con 4 celdas **añade celdas** a la configuración inicial: no prueba que la configuración original converja.
