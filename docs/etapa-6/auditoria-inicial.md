# Etapa 6 — auditoría antes de ampliar

Fecha: 2026-10-17. Rama exclusiva del PR #15: `feature/etapa-6-catalogo-maquinarias`.
Base inspeccionada: `de1b6efe853ebaaf38f6778e16f0ad3b100fdff2`.

Se revisaron descripción, siete commits, quince archivos, comentarios y revisiones (sin comentarios), catálogo, selectores, evaluación, historial, exportación, motores y pruebas. Las dos ejecuciones de CI del head fallan.

| Hallazgo | Gravedad | Corrección necesaria |
|---|---|---|
| Solo seis referencias; varias son series, no veinte configuraciones concretas. Faltan Moiron M2-I y XH-430B-25. | Alta | Investigar variantes y fuentes reales; no contar familias como equipos ni fabricar especificaciones. |
| Evaluación efectiva solo de inyección; otros procesos sin integración real. Costos no reutiliza cálculos. | Alta | Mapeo por magnitud, condiciones y unidades; comparar solo límites aplicables; reutilizar datos de operación trazables sin potencia instalada como consumo. |
| Falta filtro de fabricante y detalle de evidencia por propiedad. | Media | Selector sincronizado, ficha completa, condiciones, variantes, campos pendientes y fuentes por dato. |
| Desbordamiento reproducido a 360 px: scrollWidth=363; span de confirmación alcanza x=363. El checkbox hereda dimensiones generales de input y comprime el texto. | Media | Dimensionar el checkbox y la columna de texto; no ocultar overflow global. Prueba de todos los anchos. |
| Rama no incorpora la auditoría final de Etapa 5 (head verificado `9db34e2`). | Alta | Integrar ese head preservando maquinaria, metadata de secado e historial; ejecutar regresiones. |
| Las cinco URL iniciales Moiron/Xihua devuelven `Tunnel connection failed: 403 Forbidden` en el proxy del entorno. | Bloqueo de evidencia | Solicitar habilitación de los dominios o documentación técnica accesible; no declarar verificados esos equipos mientras falte la consulta. |

Pruebas iniciales: `npm test` ejecutado; `browser_stage6.py` 2 correctas y 1 fallida (H03, 360 px). Logs iniciales locales: `/tmp/ccip-e6-baseline-*`.
