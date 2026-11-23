# Hormiga de Langton — estado del arte (noviembre 2026)

Regla: blanco → giro 90° derecha, pinta negro, avanza; negro → giro 90° izquierda, pinta blanco, avanza.

## Resumen en una frase

El caso estándar sobre rejilla vacía está esencialmente **resuelto por computación finita** (autopista desde el paso 9 977, periodo 104); lo que sigue **abierto** es la conjetura del atractor para configuraciones iniciales arbitrarias, y lo que está **demostrado como límite duro** es que el problema general es Turing-universal y parcialmente indecidible.

---

## 1. Demostrado (teoremas)

| Resultado | Quién / cuándo |
|---|---|
| La trayectoria es **no acotada** para toda configuración inicial (siempre escapa de cualquier región finita conexa) | Bunimovich & Troubetzkoy, *J. Stat. Phys.* 67 (1992). Mal atribuido como «teorema de Cohen–Kong». |
| La **predicción** del estado tras t pasos es **P-completa** (P-hard + simulable en O(t)) | Gajardo, Moreira & Goles, *Discrete Applied Mathematics* 117 (2002) 41–50. |
| La hormiga (con configuraciones iniciales arbitrarias) es **Turing-universal**; varios problemas asociados son **indecidibles** | Gajardo, Moreira & Goles (2002). |
| Todo **turmite** no trivial simula cualquier máquina de Turing; predecir su comportamiento es P-completo | Maldonado, Gajardo, Hellouin de Menibus & Moreira (2017). |
| **Autopista** tras la fase caótica: periodo 104, desplazamiento (2,2) (módulo rotación), velocidad exacta **c = √2/52 ≈ 0,0272 celdas/paso** | Observación clásica; ecuación discreta y velocidad en Boon, *cond-mat/0004331* (2000). |
| Para rejilla inicial vacía, una vez alcanzado el patrón periódico su repetición indefinida se prueba por **inducción local** (computación finita + verificación) | Folclore / verificación estándar. |

## 2. Verificado por computación (no es teorema general)

- **Fase caótica hasta el paso 9 977**, luego autopista de 104 pasos que se repite indefinidamente.
- **Todas las configuraciones iniciales finitas probadas** convergen a una autopista. No hay contraejemplo conocido para la hormiga RL estándar.
- **Ants generalizados con muchísimas autopistas**: el número de autopistas posibles de una regla puede ser **ilimitado, incluso infinito**; frecuencias relativas de aparición de hasta 1/10⁷ (Gajardo, Lutfalla & Rao, *Natural Computing*, 2024/2025).
- **Tiempos de escape exactos** y cotas optimizadas mediante simulación con simetrías y backtracking (Etse, arXiv 2606.26677, jun. 2026).
- Reglas modificadas alcanzan caos más allá de **10¹³ pasos** (Tokarz, 2018).

## 2b. Preprints de 2026 (no revisados por pares, verificados en parte por nosotros)

- **Caso de una sola celda**: Hao Ke anuncia una prueba en Lean 4 de que *toda* configuración con una sola celda negra, en cualquier posición y orientación, acaba en el P104 estándar (`Zenodo 10.5281/zenodo.23675960`). Reduce el problema infinito a 22 canales de frente (21 ordinarios + 1 autopista inversa) con inducción XOR sobre capas. Nuestro motor certifica 66 048 posiciones en `[-128,128]²`, 16/16 casos lejanos con 4 orientaciones, y el exhaustivo `[-512,512]²` está en curso. No hemos podido replayar Lean (no instalado aquí).
- **Puerto de 4 celdas**: el mismo autor prueba que 4 celdas bastan para forzar P104 en el semiplano derecho, que 3 nunca bastan (cota exacta 918 pasos) y que se pueden añadir 4 celdas lejos de cualquier configuración finita para preservar un prefijo dado y forzar P104 (`Zenodo 10.5281/zenodo.23675974`). Nosotros verificamos la cota 918 (familias 1/2/20/261 semillas) y el puerto (182 pasos, `(5,−1)` reflejado, 36 negras, certificado eterno).
- **Restricciones a autopistas periódicas**: Jillhewar prueba condiciones necesarias (crecimiento `g ∈ 4ℤ₊`, `g ≥ 2 max(|a|,|b|)`, anchura diagonal ≥ 10 con partes computer-assisted) y excluye periodos ≤ 48 (`DOI 10.21203/rs.3.rs-10516269/v1`). Nuestro `g=12` encaja. Ninguno de estos trabajos demuestra la conjetura general.
- **Rigidez**: Ke prueba que, bajo deriva `(2,−2)`, crecimiento `+12`, anchura 10 y una condición de paridad por capas, la única traza es la P104 (`Zenodo 10.5281/zenodo.23675970`). Es condicional, no una prueba de entrada.

Detalle y verificaciones locales: `investigacion/AVANCES_2026.md`.

## 3. Abierto (el frente real)

1. **Conjetura de la autopista / del atractor**: ¿toda configuración inicial finita acaba construyendo una autopista? Nadie lo ha demostrado ni refutado para la hormiga RL estándar. Solo se sabe que la trayectoria es no acotada. El subcaso de **una sola celda negra** tiene una prueba en preprint con Lean (2026), coherente con todas nuestras verificaciones, pero aún no revisada por pares; el paso de «una celda» a «soporte finito arbitrario» sigue sin demostrar.
2. **Hormigas generalizadas**: la versión genérica de la conjetura es **falsa**. Lutfalla (arXiv 2505.05426, 2025) exhibe LLRRRL y LLRLRLL con autopista *y* otros comportamientos emergentes desde configuraciones finitas.
3. **Ants de 3 colores**: para RLR no se sabe siquiera si produce autopista alguna.
4. **Cuantitativo**: el tiempo de escape (cuánto puede confinarse la hormiga en una región finita) solo tiene cotas gruesas: factorial para cuadrados, lineal óptima para rectángulos de altura 2 y 3, polinómica para altura fija (2026). El caso general sigue mal entendido.
5. **Densidad y estadística de la fase caótica**: observada ≈0,326 en la caja del patrón; sin ley demostrada.

## 4. El «punto máximo» alcanzado

- **Límite de los argumentos computacionales**: la universalidad de Turing y la indecidibilidad de problemas *asociados* (2002) muestran que la predicción a largo plazo no es trivial. **No** implican que «toda configuración acabe en autopista» sea indecidible: si el enunciado universal fuera cierto, sería decidible por el algoritmo constante «sí». Lo indecidido son otras preguntas (por ejemplo, si una celda dada será visitada), no el enunciado universal mismo.
- **Cota superior de lo demostrado hoy**: no-acotación (1992) + P-completitud/universalidad (2002) + universalidad de turmites (2017).
- **Frontera computacional 2024–2026**: clasificación de autopistas en ants generalizados (infinitas autopistas posibles) y primeras cotas del tiempo de escape (2026).
- **Lo que falta para «cerrar» el problema**: probar la conjetura del atractor para la hormiga estándar, o encontrar un contraejemplo finito. Es el único enunciado central que sigue sin resolver.

## Fuentes

- Wikipedia, *Langton's ant* (rev. oct. 2026).
- Bunimovich & Troubetzkoy, *Recurrence properties of Lorentz lattice gas cellular automata*, J. Stat. Phys. 67 (1992).
- Gajardo, Moreira & Goles, *Complexity of Langton's ant*, Discrete Appl. Math. 117 (2002); arXiv:math/0306022.
- Maldonado, Gajardo, Hellouin de Menibus & Moreira, *Nontrivial Turmites are Turing-universal*, arXiv:1702.05547 (2017).
- Boon, *How fast does Langton's ant move?*, arXiv:cond-mat/0004331 (2000).
- Gajardo, Lutfalla & Rao, *Ants on the highway*, arXiv:2409.10124; Natural Computing (2025).
- Lutfalla, *Sideways on the highways*, arXiv:2505.05426 (2025); *The LLLR generalised Langton's ant*, arXiv:2506.10482 (2025).
- Etse, *How Long Can the Escaping Ant Be Confined?*, arXiv:2606.26677 (2026).
- Jillhewar, *Finite-Support Periodic Highways of Langton's Ant*, Research Square preprint, DOI 10.21203/rs.3.rs-10516269/v1 (2026).
- Ke, *Every One-Black-Cell Langton Ant Reaches the Period-104 Highway*, Zenodo 10.5281/zenodo.23675960 (2026, preprint con Lean).
- Ke, *Four-Cell Ports and Composable Highway Scattering*, Zenodo 10.5281/zenodo.23675974 (2026).
- Ke, *Uniqueness of the Classical Langton Ant Highway from Its Layer Profile*, Zenodo 10.5281/zenodo.23675970 (2026).
- Tokarz, *Dynamics of Langton's ant allowed to periodically go straight*, arXiv:1807.08789 (2018).
