# Punto de guardia — 23 de noviembre de 2026

Sesión pausada a petición del usuario. Todo el trabajo está en disco (el directorio no es repositorio git).

## Estado de la conjetura

**Abierta.** Ningún resultado de esta sesión la resuelve. Los preprints de 2026 se registran como tales, con su nivel de verificación.

## Cambios nuevos en esta sesión

### Documentos
- `investigacion/AVANCES_2026.md` — nuevo. Contraste con Jillhewar 2026 y Ke 2026, con verificaciones locales.
- `ESTADO_DEL_ARTE.md` — añadida sección 2b; corregida la afirmación de indecidibilidad; nuevas fuentes.
- `CONJETURA_Y_CERTIFICADO.md` — corregido el «muro de indecidibilidad»; matizado el caso de una celda; puntero a `AVANCES_2026.md`.
- `investigacion/INVESTIGACION.md` — secciones 6–8 actualizadas con conteo, verificación independiente, 4 celdas y preprints.
- `investigacion/TEOREMA_CONTEO.md` — teorema `+12` por ciclo (388 897 instantes, 0 desviaciones).

### Scripts nuevos
- `investigacion/verificar_avances2026.mjs` — semillas estándar, puerto de 4 celdas, cota de 3 celdas, 4 orientaciones lejanas.
- `investigacion/verificar_completacion4.mjs` — completación con 4 celdas en 5 configuraciones adversarias.
- `investigacion/debug_puerto.mjs` — diagnosis de convención `y` (Ke vs motor).
- `investigacion/debug_futuro_negro.mjs` — auditoría de celdas negras en rayos futuros.
- `investigacion/conteo_autopista.mjs`, `investigacion/cascada.mjs`, `investigacion/fase5.mjs`, `investigacion/busqueda_larga.mjs`, `investigacion/busqueda_genetica.mjs`, `investigacion/generar_muestra.mjs`.
- `investigacion/verificacion_independiente/verificar.py` — reimplementación Python: **80/80 coincidencias**.

### Corrección importante del certificador
`investigacion/motor.mjs` ahora incluye `futuroNegro()`: además de la periodicidad local y del frente de semillas, exige que ninguna celda negra **presente** en el instante del certificado tenga como representación mínima `R + k·v` con `k ≥ 1`. La auditoría mostró que en el caso estándar todas las celdas negras sobre rayos futuros ya están en `R` (`minK = 0`), así que el refuerzo no cambió los resultados verificados.

## Verificaciones con el certificador reforzado (v2)

- `verificar_avances2026.mjs`: **OK** (semillas A/B, puerto 4 celdas, cota 918, 16/16 orientaciones). Salida en `verificar_avances2026_v2_resultados.txt`.
- `verificar_completacion4.mjs`: **5/5 OK**. Salida en `verificar_completacion4_v2_resultados.txt`.
- `validacion.mjs`: **interrumpida** al pausar; el archivo `validacion_v2_resultados.txt` puede estar vacío o incompleto. La versión anterior sí había dado 300/300.

## Exhaustivo `fase6.mjs` (una celda en `[-512,512]²`)

Detenido a petición del usuario cuando llevaba **600 000 / 1 048 575** configuraciones (~706 s), sin fallos registrados hasta ese punto. Quedó registrado en `investigacion/fase6_resultados.txt`. **No está terminado**: no se debe citar como resultado completo.

## Resultados consolidated previos (intactos)

- 3×3: 512/512. 4×4: 65 536/65 536. 4×4 × 16 alineaciones: 1 048 576/1 048 576.
- Una celda `[-128,128]²`: 66 048/66 048. Pares `[-8,8]²`: 41 328/41 328.
- 5×5 aleatorias: 50 000/50 000. 9×9 aleatorias: 20 000/20 000.
- Total exhaustivo/muestreado completado: **1 226 244 configuraciones, 0 fallos** (sin contar fase6 parcial).
- Teorema del transitorio no acotado: verificado hasta `N=10⁶`.
- Búsqueda adversaria 139 casos a 10⁷ pasos: 139/139 certificados, máximo `T=156 615`.
- Búsqueda genética: mejor `T=119 587` tras 10 432 evaluaciones; sin contraejemplos.

## Al reanudar

1. Repetir `validacion.mjs` con el motor v2.
2. Relanzar `fase6.mjs` (o reanudar desde la última celda procesada; el script actual.no tiene soporte de reanudación, así que conviene añadirlo).
3. Intentar instalar Lean 4.30 para replayar el proof de una celda.
4. Mantener la distinción demostrado / verificado / empírico / abierto.
