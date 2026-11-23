# Avances externos de 2026 y verificación con nuestro motor

**Estado de la conjetura general: sigue abierta.** Ninguno de los trabajos aquí citados afirma haberla resuelto. Todos son **preprints de 2026, sin revisión por pares**; los registramos con su nivel exacto de verificación.

## 1. Jillhewar: restricciones a autopistas periódicas

*Atharva Jillhewar, “Finite-Support Periodic Highways of Langton's Ant: Necessary Conditions, Transverse Exclusions, and Exact Search” (Research Square, DOI 10.21203/rs.3.rs-10516269/v1; código/Lean en `Atharva12456/langtons-ant-highway`).*

Afirma, bajo la hipótesis de que la traza es eventualmente periódica con deriva no nula:

- el crecimiento neto de celdas negras es `g ∈ 4ℤ₊` y satisface `g ≥ 2·max(|a|,|b|)`;
- la anchura transversal de una autopista diagonal es par y **≥ 10** (exclusiones de anchura 2 analítica; de 4, 6 y 8 computer-assisted, con parte del argumento de anchura 4 verificada en Lean);
- no existe autopista periódica de soporte finito con periodo `≤ 48` (búsqueda exacta, 14,4 horas-agregado de shard);
- existe un criterio decidible de realizabilidad periódica, con semillas explícitas.

**No demuestra** que toda órbita de soporte finito llegue a ser periódica.

### Contraste local

`verificar_avances2026.mjs` comprueba con nuestro motor las dos semillas estándar publicadas:

| Semilla | Celdas | Resultado nuestro |
|---|---:|---|
| Normalización A, deriva `(2,−2)` | 11 | certificada, `T=4114`, `v=(2,−2)` |
| Normalización B, deriva `(−2,2)` | 13 | certificada, `T=1488`, `v=(−2,2)` |

Además, `conteo_autopista.mjs` había obtenido exactamente `g=12` para la autopista estándar (`+12` celdas por periodo de 104). Eso satisface `12 ∈ 4ℤ₊` y coincide con el `net_growth_R_minus_L = 12` del artefacto externo.

## 2. Ke: caso de una sola celda

*Hao Ke, “Every One-Black-Cell Langton Ant Reaches the Period-104 Highway: A Lean-Checked Proof” (Zenodo 10.5281/zenodo.23675960; `kehao95/langtons-ant-core/one_black`).*

Enunciado del preprint:

> Toda configuración clásica con **exactamente una celda negra**, en cualquier posición y con cualquier orientación de la hormiga, acaba siguiendo la traza estándar P104, salvo traslación y rotación de cuarto de vuelta.

Estructura de la prueba:

1. replay exacto del vacío hasta el paso 9 977 y bloque P104 permanente;
2. 1 376 casos en los que la celda ya fue leída en la fase caótica;
3. si no, acoplamiento con la órbita vacía hasta la entrada en autopista;
4. descomposición geométrica en **22 canales de frente**;
5. 21 canales ordinarios + 1 canal excepcional con autopista inversa y ley afín de colisión;
6. inducción XOR sobre capas traducidas (archivos inertes) para profundidad arbitraria.

El autor declara la cadena formalizada en Lean 4 con tres hojas `native_decide`: el certificado del vacío, los 1 376 casos de prefijo y el certificado compartido de los 22 canales.

### Verificación local disponible

No reproducemos Lean (no está instalado en esta máquina), pero nuestros datos numéricos son consistentes:

- una celda en `[-18,18]²`: **1 368/1 368** certificadas;
- una celda en `[-128,128]²`: **66 048/66 048** certificadas;
- una celda en `[-512,512]²`: exhaustivo en curso (`fase6.mjs`);
- 4 posiciones lejanas (hasta `|x|,|y|≈1234`) × 4 orientaciones iniciales: **16/16** certificadas con `certificarConDirección` (`verificar_avances2026.mjs`).

Esto confirma la consecuencia observable del teorema: el transitorio puede ser arbitrariamente largo (nuestro `TEOREMA_TRANSITORIO.md`) pero, en el caso de una sola celda, la hormiga acabaría entrando en P104. **Seguimos sin presentar el preprint como literatura revisada.**

## 3. Ke: puerto de 4 celdas y dispersión composable

*Hao Ke, “Four-Cell Ports and Composable Highway Scattering for Langton's Ant” (Zenodo 10.5281/zenodo.23675974; `four_cell_port/PROOF.md`).*

Afirma:

- con la hormiga en `(0,0)` mirando al Este, `G={(0,-1),(1,1),(1,3),(2,2)}` mantiene `x≥0` para siempre y entra en P104 tras 182 pasos;
- con **3** celdas o menos en el semiplano derecho, la primera salida ocurre siempre antes de 918 pasos, y la cota se alcanza;
- para cualquier configuración finita `X`, cualquier conjunto protegido finito `K` y cualquier `T`, se pueden añadir **4** celdas negras fuera de una caja que contenga todo eso, preservar la observación durante `T` pasos y forzar P104;
- hay 30 reglas de dispersión composables y excursiones de retorno arbitrariamente largas que recuperan la autopista.

Punto clave: el teorema de completación **cambia la configuración inicial** (`B ↦ B∪E`). No implica la conjetura general.

### Verificación local

Con la convención de nuestro motor (`y` hacia abajo) hay que reflejar `y`:

```
G = {(0,-1),(1,1),(1,3),(2,2)}  ->  Gm = {(0,1),(1,-1),(1,-3),(2,-2)}
```

`verificar_avances2026.mjs` obtiene:

- tras 182 pasos desde `Gm` con dirección Este: posición `(5,−1)`, dirección Este, **36** celdas negras: coincide con `(5,1)` del preprint tras reflejar `y`;
- certificado eterno desde `t=0`: `T=597`, `v=(2,−2)`, las 4 semillas absorbidas;
- enumeración de la cota de 3 celdas: familias de tamaños **1, 2, 20, 261** con máximos de primera salida **2, 38, 106, 918** exactamente; peor semilla de 3 celdas `{(0,1),(2,-1),(3,-3)}`, reflejo de la del preprint.

Esto explica también por qué nuestras `cascada.mjs` no encontraron caos sostenido: las semillas bien situadas actúan como puertos que devuelven la hormiga a P104.

### Completación con 4 celdas: prueba local en 5 casos adversarios

`verificar_completacion4.mjs` toma configuraciones finitas arbitrarias (1 celda lejana, par asimétrico, bloques 7×7/9×9/11×11 densos), las simula hasta que salen de una caja `Q`, coloca el puerto rotado en el punto de salida y comprueba:

| Configuración | Celdas | τ (salida) | Prefijo idéntico | Disjunto | Certificado eterno |
|---|---:|---:|---|---|---|
| una celda lejana | 1 | 1 297 | sí | sí | `T=2257, v=(2,−2)` |
| par asimétrico | 2 | 1 629 | sí | sí | `T=2226, v=(−2,2)` |
| 7×7 denso | 21 | 3 530 | sí | sí | `T=4127, v=(−2,2)` |
| 9×9 denso | 21 | 3 177 | sí | sí | `T=3774, v=(2,2)` |
| 11×11 disperso | 32 | 1 933 | sí | sí | `T=2530, v=(2,−2)` |

**5/5 correctos.** Esto valida el mecanismo constructivo en nuestros propios ejemplos, pero insiste en el matiz: la entrada se modifica añadiendo 4 celdas; no dice nada de la configuración original.

## 4. Ke: unicidad de la autopista estándar

*Hao Ke, “Uniqueness of the Classical Langton Ant Highway from Its Layer Profile” (Zenodo 10.5281/zenodo.23675970).*

Bajo hipótesis de deriva `(2,−2)`, crecimiento `+12`, anchura transversal 10 y una condición de paridad por nivel, prueba que el periodo es 104 y la secuencia de giros es la estándar hasta fase cíclica. Es un teorema de **rigidez condicional**: no prueba que esas hipótesis se den siempre.

## 5. Qué cambia en nuestro mapa

| Antes | Ahora |
|---|---|
| «Caso de una celda: abierto, evidencia abrumadora» | Preprint con Lean lo afirma; verificación numérica local masiva coherente. Falta revisión/replay de Lean. |
| «Puerto de 4 celdas: no contemplado» | Verificado localmente; da una construcción explícita de transitorios largos **cambiando la entrada**. |
| «`g=12` medido por nosotros» | Coincide con condición necesaria `g ∈ 4ℤ₊` y con el artefacto estándar externo. |
| «Indecidibilidad como muro para la conjetura» | Corregido: la indecidibilidad afecta a problemas asociados, no al enunciado universal (si fuera cierto, sería decidible). |

## 6. Límite

La conjetura general —toda configuración inicial finita, sin añadir nada, acaba en autopista— **sigue sin prueba ni contraejemplo**. Los preprints de 2026 reducen el hueco a un «teorema de entrada» para soportes arbitrarios, pero no lo aportan.

Scripts: `verificar_avances2026.mjs`, `debug_puerto.mjs`, `conteo_autopista.mjs`, `fase3.mjs`–`fase6.mjs`.
