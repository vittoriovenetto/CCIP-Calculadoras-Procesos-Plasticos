# Biblioteca de polímeros V1: implementación y validación

Se implementa la especificación `CCIP_Especificacion_Biblioteca_Materiales_v1.pdf` y se incorpora el archivo `CCIP_Biblioteca_Materiales_Verificada_v1.json` entregados por el usuario. El JSON se copia **sin modificar** a `src/data/materials.v1.json`.

SHA-256 del adjunto y de la copia: `da3df79ab06e8fffda98676a68362d2d044ece9c6c93921f7434d6bb104357a4`.

Biblioteca `ccip-material-reference-seed`, esquema `1.0.0`, revisión declarada en el adjunto `2026-10-13`. Los datos y las URLs proceden de la entrega del usuario; esta integración no afirma haber vuelto a comprobar las fichas de fabricante ni su vigencia. Son valores típicos/recomendaciones, no certificaciones de lote ni validación industrial. Se conservan las fuentes como metadata local; no se redistribuyen los PDFs de fabricantes.

## Catálogo

| Familia | Fabricante / grado | Fuente | Densidad sólida g/cm³ | Aparente kg/L | Secado documentado |
| --- | --- | --- | --- | --- | --- |
| HDPE | Dow / DOW 12450N | S01 | 0.95 | Pendiente | Pendiente |
| LLDPE | Dow / DOWLEX 2045G | S02 | 0.92 | Pendiente | Pendiente |
| LDPE | Dow / DOW LDPE 132G | S03 | 0.921 | Pendiente | Pendiente |
| PP | LyondellBasell / Moplen HP500N | S04 | 0.9 | Pendiente | Pendiente |
| PET | Indorama Ventures / Polyclear Refresh PET 1101 | S05 | 1.398 | 0.9 a 80 pellets/g | Pendiente |
| PVC | Westlake / Westlake PVC 1195 | S06 | Pendiente | 0.53, polvo | Pendiente |
| ABS | INEOS Styrolution / Terluran GP-22 | S07 | 1.04 | Pendiente | 80 °C, rango 2–4 h |
| PA6 | BASF / Ultramid B3S R03 | S08 | 1.13 | 0.7, pellets, aproximada | 80 °C / 4 h, aire seco y condiciones de ficha |
| PC | Covestro / Makrolon 2405 | S09 | 1.2 | 0.66, pellets | 120 °C, rango 2–3 h, aire seco |

Los nueve registros mantienen `melt_density` y `specific_heat` en `null`. No se añade ninguna propiedad para completar esos huecos.

## Uso en la interfaz

1. Elegir **familia → fabricante → grado**. Todos los grados permanecen consultables; el catálogo no declara que cualquier grado sea apropiado para todos los procesos. Seleccionar “Material personalizado / sin ficha” permite trabajar exclusivamente con entradas manuales.
2. Consultar la ficha: unidad, fase, estado típico/recomendación, método, condiciones, notas, fuente, fecha y versión. Un método/condición no documentado se identifica así; no se completa con un supuesto. El enlace abre la URL HTTPS original de fabricante.
3. Confirmar compatibilidad de grado/formulación, fase, método y condiciones para aplicar densidad sólida. Si el proceso no aparece en las aplicaciones de la ficha, se exige confirmación adicional de validación técnica.
4. Para densidad aparente, confirmar **pellets/polvo** y, por separado, las condiciones de ensayo/presentación. En PET, decir “pellets” no basta: 0.9 corresponde a 80 pellets/g; el valor alternativo 0.88 para 60 pellets/g permanece descrito en la condición, sin sustituir el dato automáticamente.
5. Para secado, confirmar compatibilidad de secador, humedad, punto de rocío y almacenamiento. ABS no trae tipo de secador documentado en el JSON: debe validarse, sin inventar un método.
6. Para rangos de tiempo ABS/PC, introducir explícitamente un tiempo dentro del rango. No se selecciona mínimo, máximo o promedio por defecto. La selección y su criterio quedan registrados.
7. Las ediciones manuales se conservan aunque cambie el grado. Si procede, un botón **Usar referencia en…** permite reemplazar explícitamente un dato manual por la ficha confirmada. Una modificación o borrado de un dato aplicado se marca como **Modificado por usuario** y conserva la referencia original.

Cambiar de grado retira valores automáticos del grado anterior y reinicia confirmaciones, mientras conserva valores manuales con su identidad de origen. Desmarcar condiciones retira los datos automáticos afectados; no elimina modificaciones manuales. Cambiar de módulo conserva la sesión de ese proceso durante la visita; un proceso nuevo puede heredar el grado como referencia, pero requiere sus propias confirmaciones. “Limpiar” restablece el módulo a ejemplos iniciales y material personalizado.

## Mapa y niveles

| Campo | Única propiedad admitida | Regla |
| --- | --- | --- |
| `inyeccion.meltDensity` | `melt_density`, g/cm3 | En esta entrega siempre pendiente/manual. Nunca toma densidad sólida. |
| `extrusion/pelicula/soplado/termoformado.density` | `solid_density`, g/cm3 | Solo producto/pared/lámina sólida de misma formulación y condiciones confirmadas. |
| `secado.bulkDensity` | `bulk_density`, kg/L | Misma presentación y condiciones confirmadas; polvo PVC no equivale a pellets o compuesto. |
| `secado.residence` | `drying_time`, h | Recomendación del grado, condiciones confirmadas y rango elegido explícitamente si existe. |
| `secado.targetT` | `drying_temperature`, °C | Recomendación de secado; no usa temperatura de fusión ni de procesado. |
| `secado.specificHeat` | `specific_heat`, kJ/kg·K | En esta entrega pendiente/manual. No se utiliza una constante universal. |

Se mantienen los niveles de campos existentes: el básico muestra grado y propiedades esenciales como referencia, sin introducir densidades/temperaturas ocultas en el motor. En secado básico puede aplicarse residencia, porque ese campo ya era básico. Técnico añade métodos/indicadores de ficha y propiedades visibles en sus campos. Avanzado añade temperatura de secado en el cálculo y registro de lote/formulación/mediciones, junto con solicitudes pVT, cp(T) y humedad. Las condiciones y justificación pueden registrarse en cualquier nivel.

MFR/MVR/IV se muestran con unidades, método, temperatura y carga disponibles; no se convierten a viscosidad, presión, caudal o productividad. Humedad objetivo, máxima y de suministro no se confunden. Los parámetros de máquina, geometría, energía específica y productividad no se infieren del grado.

## Trazabilidad y persistencia

Cada cálculo/historial/JSON incorpora `material`:

- `grade_id`, `source_id`, `dataset` (nombre, versión, fecha de revisión).
- `grade_snapshot`: copia de identidad, propiedades, condiciones, estados, notas y aplicaciones; conserva los `null` de origen.
- `source`: metadata local del fabricante y URL, no su documento protegido.
- `used_fields`: propiedades efectivamente introducidas en los campos activos, valor usado, unidad, fase, origen, referencia, fuente y grado de origen. Un override de PA6 conservado al elegir PC sigue identificado como referencia PA6/S08, no se atribuye a PC/S09.
- `field_states`: estado de entradas activas, incluidos borrados manuales con referencia; evita volver a llenar silenciosamente un campo borrado al recuperar el historial.
- `context`: confirmaciones, presentación, tiempo elegido, justificación y lote.

`library` identifica dato de ficha; `range_selection` identifica valor explícito del rango; `user_override` conserva el original; `manual` no inventa una fuente. Solo los campos activos del nivel y variante se incluyen en `used_fields`/`field_states`. Las notas de ficha y advertencias materiales también acompañan el cálculo.

Recuperar usa la copia guardada, no los valores actuales del catálogo, y no reaplica automáticamente propiedades. El resultado se recalcula con el **motor actual**: el snapshot de material permite reconstruir los datos, pero no versiona el código del motor ni certifica reproducción industrial idéntica entre versiones. Registros antiguos sin `material` funcionan en modo manual. Registros dañados no provocan navegación a módulos inexistentes ni enlaces ejecutables.

## Arquitectura y red

`materials.js` contiene filtros, mapa de campos/unidades, restricciones, autocompletado, overrides, advertencias, snapshot y recuperación. `materials-view.js` contiene la ficha y controles; `app.js` conecta el estado con el motor existente. Los siete modelos matemáticos no se modifican.

El catálogo se carga desde una ruta relativa del propio sitio; no utiliza APIs de materiales, claves ni solicitudes externas durante el cálculo. Las fuentes se consultan únicamente al abrir sus enlaces. Si el catálogo falta o tiene formato inválido, se informa y continúan los cálculos manuales. Cálculos, navegación y metadata funcionan sin red **tras cargar la página y sus recursos**. No se promete primera carga ni recarga completamente offline: no se añadió service worker.

Se conserva compatibilidad con el servicio estático bajo subruta de GitHub Pages. No se publica la web ni se fusiona con `main` en esta fase.

## Pruebas y límites

- `npm test`: **270 pruebas aprobadas**, incluidas 137 previas y 133 nuevas de biblioteca. Cubren nueve grados, cuatro módulos con densidad sólida, tres niveles, ausencia de datos, fases/unidades, condiciones, rangos, protección de entradas manuales, cambio de grado, snapshots, fuentes y registros antiguos.
- `python3 tests/browser_smoke.py`: **10 pruebas de integración**; matriz existente de 108 estados en cuatro tamaños, más 162 estados de biblioteca (nueve grados × inyección/película/secado × tres niveles × escritorio/móvil). Además: edición, overrides, historial/JSON, catálogo inválido, offline tras carga y recuperación de metadata dañada.
- El archivo JSON copiado coincide byte por byte con el adjunto; se conserva su SHA-256.

La selección y confirmaciones no sustituyen fichas vigentes, pVT, cp(T), humedad, certificados de lote ni ensayos. Siguen pendientes densidad fundida/cp de los nueve grados, secado no documentado de PE/PP/PET/PVC, verificación actual de fuentes y disponibilidad local, y validación técnica. Compatibilidad de dispositivos se verifica por viewport en Chromium; Safari, Firefox y equipos físicos permanecen pendientes.
