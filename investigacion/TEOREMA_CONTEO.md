# Teorema del conteo: la autopista estándar crece exactamente 12 celdas por ciclo

## Enunciado

Sea `B(t)` el conjunto de celdas negras tras `t` pasos en el plano vacío. Entonces, para todo `t ≥ 11 000`,

```
|B(t + 104)| = |B(t)| + 12.
```

Más aún, el conteo es exactamente afín-periódico. Con `t₀ = 11 000` y `r(j) = |B(t₀ + j)| − |B(t₀)|` para `0 ≤ j < 104`:

```
|B(t)| = 834 + 12·⌊(t − t₀)/104⌋ + r((t − t₀) mod 104).
```

La tabla `r` (104 valores) es

```
0,-1,0,1,2,3,2,1,2,3,2,3,2,1,2,1,0,1,0,1,0,-1,0,1,2,3,2,1,2,1,0,1,
2,3,4,3,2,3,4,5,6,5,4,5,4,5,6,7,8,7,8,7,6,5,4,5,6,7,8,7,8,9,8,9,
10,11,12,11,10,9,8,9,8,9,10,11,12,11,12,13,14,15,14,13,12,11,12,11,12,
13,14,15,14,15,14,13,14,15,14,13,12,11,12,13
```

## Demostración

Por el certificado, para `t ≥ t₀` el ciclo que empieza en `t + 104` es el trasladado por `v = (−2,2)` del ciclo que empieza en `t`: misma dirección, misma secuencia de posiciones relativas y mismos colores en la ventana visitada.

Durante un ciclo, el número de celdas negras cambia en

```
Σ (visitas a celdas blancas) − (visitas a celdas negras),
```

donde «blanca/negra» se evalúa en el instante de cada visita. Esa suma depende solo del patrón de la ventana y de la secuencia de visitas, que son iguales salvo traslación. Luego el incremento `|B(t+104)| − |B(t)|` es una constante `C`, independiente de `t`.

Midiendo en un solo ciclo se obtiene `C = 12`. Por inducción, para todo `k ≥ 0`:

```
|B(t₀ + 104k)| = |B(t₀)| + 12k,
```

y el valor dentro del ciclo queda fijado por la tabla de residuos. ∎

## Verificación

`conteo_autopista.mjs` recorre **todos** los instantes `t ∈ [11 000, 399 896]` (388 897 comprobaciones):

- incrementos distintos de 12: **0**;
- distribución: `12: 388 897`;
- la fórmula afín-periódica es válida en todo el rango (con `|B(11 000)| = 834`).

Valores de control: `|B(20 000)| = 1 872`, `|B(50 000)| = 5 334`, `|B(100 000)| = 11 108`, `|B(400 000)| = 45 720`.

## Consecuencias

- **Densidad lineal exacta:** el número de celdas negras crece a razón de `12/104 = 3/26 ≈ 0,11538` celdas por paso. Esto confirma con valor exacto la tasa `≈0,11` medida empíricamente en la fase 1.
- **El patrón completo no es periódico.** La periodicidad del certificado es local; globalmente el conjunto crece 12 celdas por ciclo. La diferencia entre `B(t) + v` y `B(t + 104)` es un defecto de frente de tamaño fijo (392 celdas que faltan y 404 que sobran, constantes en todo el rango).
- **La «autopista» es una onda que avanza, no un estado estacionario.** Cualquier demostración de la conjetura general tiene que convivir con este crecimiento lineal del soporte.
