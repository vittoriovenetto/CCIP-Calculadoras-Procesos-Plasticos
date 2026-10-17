# Auditoría inicial del PR #14 — 17/10/2026

Base examinada antes de editar: `814652806ba9df0480e352b69b0c12fed26df9bb`.
Cinco commits, trece archivos; sin comentarios de revisión ni discusión al consultar GitHub.
CI previa del head: satisfactoria (run 38986833989); no demuestra validez física.
Requisitos: solicitud de auditoría adjunta, descripción PR #14 y docs/etapa-5-secado.md.
Node 24.19.0, Python 3.12.14, Chromium y dependencias fijadas de pruebas disponibles.
No fue necesario instalar dependencias ni cambiar configuración de entorno.

| ID | Gravedad | Problema observado | Corrección propuesta |
|---|---|---|---|
| D01 | Crítica | Cp de ficha sólido con cualquier texto de condición se acepta sin intervalo ni definición de promedio. | Evidencia térmica estructurada, fuente, fase e intervalo; bloquear un Cp puntual y conservar entrada. |
| D02 | Alta | Cp manual con fase, límites y texto de fuente se acepta aunque sea un dato puntual, un promedio de otro intervalo o cambie el valor después de declararlo. | Declaración explícita de promedio del intervalo o aproximación constante sustentada; confirmación vinculada a valor/evidencia, sin transiciones. |
| D03 | Alta | Una selección manual dentro de un rango se marca range_selection y clearAutomatic la elimina al cambiar grado/confirmaciones. | Distinguir elección manual de precarga automática, conservar valor/origen e indicar incompatibilidades. |
| D04 | Alta | La densidad aparente manual puede producir volumen sin presentación/condiciones confirmadas. | Verificar aplicabilidad antes del balance; retener entrada pero dejar volumen pendiente si no hay trazabilidad compatible. |
| D05 | Alta | drying_assessment no se incluye en observaciones/fuentes de Excel/PDF; el snapshot puede llamar used_fields a Cp excluido. | Exportar evaluación/evidencia y separar entradas originales de entradas efectivas usadas. |
| D06 | Media | Recomendación del virgen puede seguir visible durante una formulación activa aunque el cálculo de secado de mezclas está bloqueado. | Señalar explícitamente que no es una guía de la mezcla; evaluación no aplicable, sin transferencia. |
| D07 | Media | Resultados pendientes se ocultan y faltan indicaciones de densidad/Cp requeridos; 25 °C no muestra origen junto a la entrada. | Estado por resultado con dato faltante y cómo obtenerlo; procedencia visible del supuesto y traducciones. |
| D08 | Media | La matriz de navegador excluye siempre la potencia de secado en vez de verificar un caso válido con evidencia. | Fixture térmico sintético sustentado y comprobación de todas las métricas; nuevos casos negativos. |
| D09 | Media | Extremo superior temporal se aplica también si el contexto pide un valor no numérico; falta distinguir ausencia de elección inválida. | Usar el extremo superior solo cuando el campo esté vacío; una elección inválida no genera una precarga. |

Las fórmulas M=Q·t, V=M/ρ_bulk y P=Q·Cp·ΔT/3600 son dimensionalmente correctas.
El motor ya rechaza entradas no finitas, temperaturas ≤−273.15 °C, Cp/ρ/t no positivos,
Q negativo y calentamiento invertido; se mantendrán ecuaciones y cobertura, ampliando pruebas.
No se propone añadir datos numéricos de materiales, maquinaria ni nuevos modelos de secado.
