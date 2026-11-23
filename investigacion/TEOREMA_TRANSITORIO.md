# Teorema: el transitorio no está acotado

## Enunciado

**Teorema.** Para todo `N ∈ ℕ` existe una configuración inicial finita —de hecho, **una sola celda negra**— cuyo desplazamiento a 104 pasos cambia en algún instante posterior a `N`.

Equivalentemente: no existe ninguna cota uniforme del tiempo de convergencia. Para toda cota `B` existe una configuración —con una sola celda negra— cuyo desplazamiento a 104 pasos sigue cambiando después del paso `B`.

No se supone en ningún momento que la configuración converja: el enunciado es puramente sobre el comportamiento finito, y por eso es demostrable.

## Demostración

Sea la autopista estándar (plano vacío). Por el certificado (`certificado_autopista.mjs`), a partir de `t₀ = 10 496` se cumple

```
p(t + 104) = p(t) + v,      v = (−2, 2),
```

donde `p(t)` es la posición tras `t` pasos. Es decir, el desplazamiento a 104 pasos es constantemente `v`:

```
D(t) := p(t) − p(t − 104) = v        para todo t ≥ t₀.
```

La trayectoria estándar visita celdas **nuevas** en instantes arbitrariamente grandes: es no acotada y cada posición es una celda distinta, así que hay infinitas primeras visitas (empíricamente, ~22 por ciclo de 104 pasos). Para cada `N`, sea entonces

```
t* = min { t > max(N, t₀ + 104) : p(t) no fue visitada antes de t }.
```

Sea `c = p(t*)` y `C_N` la configuración con **solo `c` negra**.

1. **Coincidencia hasta `t*`.** Para `t ≤ t*` la hormiga de `C_N` no ha leído `c`: su primera lectura es en el paso `t* + 1`. Por inducción sobre `t`, lee los mismos colores y se mueve igual que la estándar. Luego `p_{C_N}(t) = p(t)` para todo `t ≤ t*`.

2. **El desplazamiento en `t*` es `v`.** Como `t* − 104 ≥ t₀` y las posiciones coinciden,
   `D_{C_N}(t*) = p(t*) − p(t* − 104) = v`.

3. **El desplazamiento en `t* + 1` ya no es `v`.** En el paso `t* + 1` la hormiga está en `c`. Sea `e` el vector unitario que da la hormiga estándar al moverse de `p(t*)` a `p(t* + 1)`. La estándar lee `c` **blanca** y gira a la derecha; `C_N` lee `c` **negra** y gira a la izquierda, es decir, da el paso `−e`. Por tanto

   ```
   p_{C_N}(t* + 1) = c − e,     mientras que     p(t* + 1) = c + e.
   ```

   Usando la periodicidad estándar en `t* + 1`, `p(t* − 103) = p(t* + 1) − v = (c + e) − v`, y entonces

   ```
   D_{C_N}(t* + 1) = (c − e) − p(t* − 103) = (c − e) − (c + e − v) = v − 2e ≠ v.
   ```

4. **Conclusión.** El desplazamiento a 104 pasos vale `v` en `t*` y `v − 2e ≠ v` en `t* + 1`. Luego hay un cambio de régimen en `t* + 1 > N`, y el **último** cambio es `≥ t* + 1 > N`. ∎

No hace falta saber qué ocurre después de `t* + 1`: la conclusión es sobre el último cambio, que no puede ser anterior a un cambio ya observado.

## Corolario (indistinguibilidad local)

En el instante `t* − 1` la configuración `C_N` es **localmente idéntica** a la autopista eterna: `c` aún no ha sido pisada, así que sobre toda la ventana visitada los colores coinciden celda a celda con la estándar, y el desplazamiento es exactamente `v`. Sin embargo **no** está en la autopista eterna: en el paso siguiente lee `c` negra y se desvía.

Por tanto **ningún certificado que solo inspeccione la ventana local puede decidir la eternidad**: hace falta comprobar el frente futuro, exactamente la condición (2) añadida al certificador en `motor.mjs`.

## Verificación computacional

Para cada `N` se localizó la primera visita `t*`, se construyó `C_N` y se comprobó la coincidencia paso a paso, el valor de `D(t*)`, el de `D(t* + 1)` y el último cambio real:

| N | t* | celda c | D(t*) | D(t*+1) | coincidencia hasta t* | último cambio | ¿> N? |
|---|---|---|---|---|---|---|---|
| 20 000 | 20 006 | (−209, 187) | (−2,2) | (0,2) | sí | 22 009 | sí |
| 50 000 | 50 002 | (−783, 765) | (−2,2) | (0,2) | sí | 50 141 | sí |
| 100 000 | 100 007 | (−1 746, 1 727) | (−2,2) | (−2,0) | sí | 108 459 | sí |
| 300 000 | 300 001 | (−5 593, 5 574) | (−2,2) | (−2,4) | sí | 351 150 | sí |
| 1 000 000 | 1 000 008 | (−19 056, 19 034) | (−2,2) | (0,2) | sí | 1 006 478 | sí |

Script: `teorema_transitorio.mjs` (salida en `teorema_transitorio_resultados.txt`).

## El conjunto negro no es un trasladado exacto

Un intento natural de ley exacta es suponer `colores(t + 104) = colores(t) + v` **globalmente**. Es falso: se comprobó (`debug_periodicidad.mjs`) que entre `t` y `t + 104` hay 392 celdas que deberían haber viajado con el patrón y no lo hacen, y 404 celdas nuevas. El conjunto negro **crece 12 celdas por ciclo**:

| t | celdas negras en t | en t+104 | faltantes | sobrantes |
|---|---|---|---|---|
| 20 000 | 1 872 | 1 884 | 392 | 404 |
| 50 000 | 5 334 | 5 346 | 392 | 404 |
| 100 000 | 11 108 | 11 120 | 392 | 404 |

Solo la **ventana local** es periódica; el patrón completo no. Por eso:

- el certificado tiene que mirar el frente (condición 2), y
- no existe una «ley de fase» exacta del reajuste. Se midió el reajuste agrupando por fase de la primera visita: 21 de 22 fases dan el mismo reajuste al variar la distancia en 10⁵ pasos, pero **la fase 65 no** (64 115 / 131 611 / 51 149). La fase domina el reajuste, pero no lo determina: las 12 celdas nuevas por ciclo introducen una corrección de tamaño finito que, por sensibilidad, puede cambiar el resultado global.

Esto es coherente con el teorema: la diferencia entre dos configuraciones con semillas trasladadas no es un simple trasladado, sino un trasladado **más 12 celdas de frente por ciclo**.

## Consecuencias

- **No hay cota uniforme del transitorio.** Cualquier demostración de la conjetura debe controlar tiempos arbitrariamente largos; no puede apoyarse en una compacidad con cota finita.
- **La autopista no es un atractor uniforme.** Una sola celda negra arbitrariamente lejana la rompe; solo tarda en notarse. La cuenca no es abierta en la topología de configuraciones finitas.
- **La información global es imprescindible.** En `t* − 1` el estado es localmente idéntico al de la autopista eterna; la diferencia está en una celda del frente. Cualquier prueba de convergencia debe ser global, no local.
- **No refuta la conjetura.** En todos los casos verificados la hormiga vuelve a una autopista; lo demostrado es solo que el *cuándo* no tiene cota.

## Qué NO demuestra

- No demuestra que toda configuración acabe en autopista (sigue abierto).
- No demuestra que el reajuste (el tiempo *después* del impacto) sea no acotado; lo medido sugiere que fluctúa, con máximo observado 149 083, sin crecimiento monótono con la distancia.
- No demuestra que exista una configuración que nunca converja.
