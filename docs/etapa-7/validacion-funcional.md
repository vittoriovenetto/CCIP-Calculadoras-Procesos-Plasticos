# Validación funcional

## Resultado del checkout auditado

**700 Node, 97 pruebas de navegador únicas; cero fallidas, omitidas o desactivadas.** Las nueve pruebas nuevas se suman a las 88 previas, no sustituyen cobertura. Los 79 contrastes Decimal son adicionales y no se suman como si fueran otros tests Node. Ver salidas fechadas de esta ejecución en [pruebas](pruebas/).

| Suite | Aprobadas | Alcance |
|---|---:|---|
| Node | 700 | Motores, unidades, materiales, evidencia, perfil, snapshots, seguridad y publicación. |
| General | 42 | 135 estados/variantes/niveles/pantallas; 73 perfiles; 27 cambios ES/EN/ES. |
| Etapa 2 | 6 | CRUD de historial, migración, confirmaciones, ZIP XLSX y PDF reales. |
| Etapa 3 | 10 | Reciclados, condiciones, MFR/MVR, trazabilidad y exportación. |
| Etapa 4 | 7 | Explorador, materiales locales, propuestas y resistencia a HTML malicioso. |
| Etapa 5 | 8 | Nueve guías, caudal vacío, 25 °C editable, Cp de intervalo y bulk documentados. |
| Etapa 6 | 15 | Los 25 equipos consultables, 20 computables, versiones, manuales, costos e idiomas. |
| Etapa 7 | 9 | 336 combinaciones de siete procesos × tres niveles × dos idiomas × ocho anchos; referencias independientes, fallos de JSON opcional, exportaciones, teclado, históricos y URL. |

Anchos: **320/360/390/540/768/1024/1440/1920 px**. No se ocultó overflow global ni se cambió el CSS para silenciar un test. Materiales y Aprendizaje conservan estado al regresar; la URL de calculadora identifica proceso/nivel y permite Atrás/Adelante.

## Archivos reales y persistencia

Se descargaron XLSX, PDF y JSON; openpyxl inspeccionó celdas/tipos/unidades y ausencia de fórmulas inyectadas. pypdf y PyMuPDF abrieron los PDF, comprobaron texto, márgenes y ausencia de solapamiento entre líneas. Se conserva una imagen renderizada del PDF real, no una simulación. CSV del comparador conserva la cobertura general previa.

Las exportaciones del historial conservan el snapshot íntegro. El JSON puede añadir `export_metadata` con idioma y formato: esto no modifica el registro guardado. La migración conserva IDs nuevos estables, entradas desconocidas, resultados y registros futuros no interpretados. El guardado de materiales locales ahora rechaza JSON dañado/incompatible sin borrar el original.

## Fallos de recursos

Con JSON inválido en los catálogos opcionales, la aplicación avisa y conserva la calculadora manual. No se inventan valores. Los fixtures de fallos son respuestas locales interceptadas en el navegador; no alteran servidores públicos.

## Build y web pública

El build, caché y prueba sobre `dist/` se registran en sus salidas específicas. No confundir esos resultados con una comprobación pública. La prueba nueva de caché conserva también el HTML anterior y sus módulos diferidos por SHA.

**La web pública nueva no está validada ni publicada** mientras continúe el rechazo 403 del proxy y no se consulte la CI/configuración real de Pages. No se han hecho comprobaciones en dispositivos físicos, Safari o Firefox.

Recuperación explícita: J08 usa un histórico con 987.654321 g frente a una entrada que produciría 1 g con el motor actual. La pantalla/exportación mantienen 987.654321 hasta pulsar Calcular. J09 comprueba que editar el perfil invalide el snapshot activo para exportar el caso editado sin sobrescribir el histórico. Se repitieron todas las regresiones después de este cambio.
