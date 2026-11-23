# La conjetura abierta y lo que sí queda demostrado

## 1. El enunciado exacto que está abierto

> **Conjetura de la autopista (caso RL estándar).** Sea el plano infinito con todas las celdas blancas salvo un número finito de celdas negras, en cualquier posición. ¿Es cierto que la hormiga acaba entrando en una «autopista», es decir, un régimen periódico de traslación (periodo finito, desplazamiento constante distinto de cero, repetido indefinidamente)?

Estado: **abierta**. Se ha comprobado para todas las configuraciones finitas ensayadas, pero no hay demostración ni contraejemplo publicado y revisado. Lo único demostrado en la literatura clásica es que la trayectoria es **no acotada** (Bunimovich–Troubetzkoy, 1992). No acotada ≠ autopista: podría escaparse de forma no periódica. En 2026 apareció un preprint con prueba Lean de que la conjetura sí vale para **una sola celda negra** (`investigacion/AVANCES_2026.md`); el paso a soporte finito arbitrario sigue abierto y el preprint aún no está revisado por pares.

## 2. Lo que sí es un teorema (y he verificado)

> **Teorema (caso estándar, rejilla vacía).** Empezando en una rejilla totalmente blanca, la autopista que aparece hacia el paso 9 977 es **eterna**.

**Prueba por certificado finito + inducción.** Sea S₀ = 11 000, P = 104, v = (−2, 2). Sea R el conjunto de las 52 celdas que la hormiga lee durante un ciclo (posiciones relativas a su posición en S₀). Se comprueba, con aritmética exacta, que el estado local en S₀ + P es el estado local en S₀ trasladado por v:

- misma dirección,
- misma posición relativa,
- mismos colores en las 52 celdas de R,
- la hormiga no sale de R durante el ciclo.

Como la dinámica es determinista y **local** (solo depende de las celdas que pisa), el ciclo se repite indefinidamente. Verificado para 5 ciclos consecutivos con `certificado_autopista.mjs`; por inducción, para todos.

Huella del estado local base: `1ed29fb9`. Verificación: `node certificado_autopista.mjs`.

**Lo que este teorema NO dice:** no dice nada sobre configuraciones iniciales distintas de la vacía. Ese es justo el problema abierto.

## 3. Por qué el problema abierto no es «fácil»

1. **No hay función potencial ni invariante conocida.** Nada que decrezca monótonamente y fuerce la entrada en un ciclo. Sin Lyapunov no hay argumento de convergencia.
2. **La reversibilidad prohíbe los argumentos de atractor.** El mapa es una biyección; no hay disipación. En un espacio compacto eso significa ciclos puros (lo comprobamos en el toro). En el plano infinito, «atractor» es solo una metáfora: no hay un teorema de convergencia que aplicar.
3. **Los transitorios no tienen cota — y ahora está demostrado.** Para RL y con **una sola celda negra** se probó que el último cambio de régimen supera cualquier `N` prefijado (ver `investigacion/TEOREMA_TRANSITORIO.md`): basta colocar la celda en el primer punto de visita estándar posterior a `N`. Además, en `t* − 1` el estado local es **idéntico** al de la autopista eterna, así que ningún criterio puramente local puede decidir la convergencia. El preprint de Ke (2026) afirma que, pese a eso, esas mismas configuraciones de una celda acaban entrando en P104; eso es compatible con nuestro teorema y subraya que «tiempo arbitrariamente largo» no es «no convergencia». En variantes y reglas generalizadas se han observado fases caóticas de más de 10¹³ pasos.
4. **Realimentación global.** La regla es local, pero la posición futura depende de todo el historial de colores escritos. Es un bucle local↔global sin variable de control.
5. **Falla en las generalizaciones.** En 2025 se exhibieron ants generalizados (LLRRRL, LLRLRLL) con autopista *y* otros regímenes. Por tanto la conjetura no se deduce de ningún principio general de turmites: si es cierta para RL, la prueba debe usar algo específico de RL.
6. **Universalidad, no indecidibilidad del enunciado.** Gajardo–Moreira–Goles (2002) prueban P-completitud e indecidibilidad de problemas *asociados* (por ejemplo, si una celda dada será visitada). Eso **no** demuestra que «¿toda configuración acaba en autopista?» sea indecidible: si la respuesta global fuera sí, sería decidible de forma trivial. Lo que sí indica es que una prueba no puede apoyarse en predicción eficiente arbitraria.

## 4. Qué haría falta para resolverla

Alguna de estas tres cosas:

- una **cantidad potencial** que obligue a abandonar la fase caótica y cuya imposibilidad de decrecer sin límite sea demostrable;
- una **clasificación completa** de los regímenes recurrentes locales posibles para RL, probando que el único compatible con soporte finito es la autopista;
- un **teorema de rigidez** sobre estructuras periódicas de traslación que excluya las alternativas no periódicas.

Para **una sola celda negra** el preprint de Ke (2026) aporta una cuarta vía: una descomposición en 22 canales de frente más inducción XOR, formalizada en Lean. Para soporte finito arbitrario **ninguna de las tres** está disponible; los resultados de 2026 solo dan condiciones necesarias y rigidez condicional. Por eso el problema sigue abierto desde 1986.

## 5. Lo que sí se puede hacer (y no es resolverlo)

- Verificación exhaustiva por tamaños: todas las configuraciones con soporte en cajas de n×n hasta cierto n. Es evidencia fuerte, **no** prueba.
- Formalización del certificado en un asistente (Lean/Coq) para el caso estándar.
- Búsqueda de contraejemplos dirigida (configuraciones simétricas, semillas grandes, transitorios largos).
- Exploración de invariantes estadísticos de la fase caótica.
- Revisión detallada de los preprints de 2026 y, si se dispone de Lean 4.30, replay del proof de una celda: `investigacion/AVANCES_2026.md`.
