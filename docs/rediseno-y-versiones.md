# Presentación CCIP, ayudas y conservación de V1

## Solicitud y alcance

La solicitud directa del usuario fue incorporar ayudas junto al botón «?», usar el logo CCIP, explicar la correspondencia con la calculadora original y conservar la aplicación anterior tanto en archivos como mediante una URL. La guía PDF y el ZIP son referencias de diseño: sus reconstrucciones no son capturas de la aplicación ni datos de ingeniería para introducir en las calculadoras.

Se adoptaron la paleta institucional, los parámetros agrupados, los resultados principales y la ficha de materiales desplegable de la guía. El perfil nuevo L1/L2/L3 y otros modelos propuestos en el documento quedan como trabajo independiente. La publicación se realiza según la autorización directa previa del usuario («Haz el deployment») para que ambos enlaces sean utilizables, conservando `main` y sin modificar el repositorio original.

## Interfaz

- Logo PNG CCIP, sin editar, equivalente a la imagen suministrada por el usuario. Se reutilizó su copia de mayor resolución, 504 × 160, mediante lectura de [assets/logo-ccip.png del original](https://github.com/reymenez323/Calculadora-de-shot-y-primera-inyeccion/blob/0ac352e69316c09bf988c72f4911f4fc59cda455/assets/logo-ccip.png).
- Las explicaciones existentes aparecen al pasar el cursor o enfocar «?». Un clic/toque fija la ayuda; otro la cierra. También se cierran con Escape o pulsando fuera. Se puede mover el cursor al texto de la ayuda. En pantallas pequeñas se coloca debajo si no cabe a un lado.
- Etiquetas, unidades, ayudas accesibles y procedencia de las entradas siguen asociadas a cada control. Abrir/cerrar las ayudas no modifica entradas ni resultados.
- La selección familia/fabricante/grado permanece visible. La ficha completa, fuentes, pVT y confirmaciones de compatibilidad se despliegan sin alterar el cálculo. Autocompletado y registros manuales conservan sus condiciones y trazabilidad.
- Tres resultados existentes por proceso se muestran primero; el resto de las métricas y sus ecuaciones siguen disponibles. Las advertencias de cálculo abren automáticamente su panel e indican su cantidad.
- La barra de utilización representa solo la capacidad volumétrica geométrica ya calculada. Un valor pendiente no se dibuja como cero. La barra se limita visualmente a 100 %, manteniendo el porcentaje real y el aviso cuando lo supera. No se asignan bandas universales de idoneidad ni se certifica una máquina.
- No se modificaron el motor, conversiones, ecuaciones, esquema de niveles ni biblioteca. `src/presentation.js` y `src/tooltips.js` separan la presentación de los modelos matemáticos.

## Qué significa V1 conservada

**Versión de interfaz**, **nivel de cálculo** y **versión de biblioteca** son conceptos diferentes. La V1 guardada contiene sus siete procesos y los tres niveles básico/técnico/avanzado, con biblioteca 1.2.0; no es el nivel básico.

| Copia | Ubicación | Identidad |
| --- | --- | --- |
| Web anterior, congelada | `versions/v1/` | Artefacto publicado `f8a130f6361f760218ca7a1dbaf1e9880ea53a47` |
| Código fuente anterior completo | `downloads/CCIP-Web-V1.zip` | Checkout `7ece24a90d072d61e03762c1505141370483777f`, antes del rediseño |
| Referencia Git | etiqueta `web-v1-2026-10-14` | Apunta al mismo checkout anterior |
| Procedencia y huellas SHA-256 | `versions/v1.json` y `versions/v1-integrity.json` | 24 archivos web y ZIP |

El commit fuente declarado por el artefacto web anterior es `5805a8241665a0021e97ed4892f8808fb6ad2026`. El siguiente commit `7ece24a` solo documentó aquella publicación: la aplicación no cambió entre ambos. El ZIP incluye pruebas y documentación del checkout, además de la aplicación; no incluye `.git`, adjuntos de esta conversación ni historiales personales. Para abrir su contenido localmente hay que usar un servidor estático, como indica su README.

Enlaces publicados:

- [Aplicación actual](https://vittoriovenetto.github.io/CCIP-Calculadoras-Procesos-Plasticos/)
- [Abrir V1 conservada](https://vittoriovenetto.github.io/CCIP-Calculadoras-Procesos-Plasticos/versions/v1/)
- [Descargar archivos V1](https://vittoriovenetto.github.io/CCIP-Calculadoras-Procesos-Plasticos/downloads/CCIP-Web-V1.zip)
- [Fuente etiquetada](https://github.com/vittoriovenetto/CCIP-Calculadoras-Procesos-Plasticos/tree/web-v1-2026-10-14)

La copia web conserva sus bytes originales: no se le añadió una barra de navegación ni se modificó su almacenamiento. Para volver a la versión actual, usa Atrás o el enlace anterior. Ambas aplicaciones comparten el origen web y la clave de historial local; congelar la V1 **no congela ni respalda automáticamente los cálculos personales**. Exporta los casos como JSON antes de alternar versiones si necesitas conservar una copia de ellos.

## Verificación y pendientes

Las pruebas verifican la integridad del archivo anterior, que los grupos contienen exactamente todos los parámetros activos y que las métricas principales pertenecen a los resultados originales. Las pruebas de Chromium cubren los siete procesos, nueve variantes, los tres niveles, biblioteca, historial, exportación, ayudas con mouse/teclado/toque, ficha plegable, descarga y cálculo en V1. Se comprueban tamaños de 320, 360, 390, 430, 768, 1024 y 1440 px, contenido al 200 % y colores forzados. Las capturas nuevas son fotografías del navegador, no las propuestas del ZIP.

La comprobación usa Chromium en este entorno: sigue pendiente probar Safari/iOS y Firefox y dispositivos físicos. La densidad de fundido y Cp siguen pendientes donde no hay datos admisibles; pVT orientativo no proporciona autocompletado. La utilización visual, las simplificaciones de cada proceso y los resultados deben contrastarse con datos reales. Véanse [modelos](modelos.md), [auditoría de materiales](auditoria-materiales-v1.2.md) y [comparación con la calculadora original](comparacion-original.md).

Resultado de la verificación: **326 pruebas Node correctas y 15 pruebas de navegador correctas**, con 108 estados de cálculo y 162 de biblioteca. Las verificaciones adicionales de ayudas al 200 % también pasan. Se corrigió el desbordamiento del título de Secado a 320 px y la posición de ayudas al ampliar el contenido. [Capturas reales](capturas/README.md).
