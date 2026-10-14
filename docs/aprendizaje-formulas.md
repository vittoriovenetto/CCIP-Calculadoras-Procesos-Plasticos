# Aprendizaje de fórmulas — 2026-10-14

El usuario indicó que podía abrir la página pero no veía las fórmulas o los cambios recientes. La biblioteca publicada respondía HTTP 200 y contenía 42 explicaciones, aunque solo se accedía desde un enlace pequeño en el encabezado y no distinguía los niveles. No se ha demostrado que el origen del problema fuese la caché del navegador.

## Cambios

- Apartado visible **Aprende las fórmulas** dentro de la calculadora: acceso al proceso/nivel activo y accesos separados a técnico y avanzado.
- Cada resultado, incluido uno pendiente, enlaza a su explicación y ejemplo. La guía se abre en otra pestaña para conservar las entradas del caso.
- Filtros por proceso y nivel en `formulas.html`. Los enlaces directos incluyen ambos filtros y el fragmento de la lección; los filtros se conservan al recargar y al cambiar ES/EN.
- Variables, unidades y ejemplo paso a paso abiertos al entrar; conversiones, hipótesis, límites y referencias disponibles en cada explicación.
- Diez ejemplos de nivel básico, 18 técnicos y 14 avanzados: el filtro técnico muestra 28 y el avanzado las 42 explicaciones. El nivel describe el ejemplo, no certifica que el resultado esté disponible para cualquier conjunto de datos. Se determina reproduciendo su resultado independiente con el motor y con las entradas admitidas en cada nivel; incluye las dependencias y términos opcionales.
- Ejemplos alternativos de dosificación por volumen y extrusión de tubo disponibles en técnico y avanzado. Se muestran solo los resultados correspondientes al nivel elegido. Se conserva el área auxiliar del husillo.
- Referencias versionadas a los archivos de entrada JavaScript y CSS para solicitar la interfaz nueva al navegador; se entregan URL completas para copiar y pegar.

No cambian el motor, las ecuaciones, las propiedades de materiales, los datos de máquina, las condiciones de validación ni los archivos de V1. Los datos de los ejemplos son sintéticos y permanecen identificados como tales.

## Validación previa

`npm test`: **502 pruebas aprobadas**, ninguna fallida. Se comprueban los 42 resultados de ejemplo contra el motor, su clasificación por nivel y los enlaces a lecciones avanzadas desde resultados pendientes de niveles inferiores.

Primera ejecución dirigida Playwright: **cinco pruebas aprobadas** (15, 19, 21, 22 y 25): español inicial y archivos V1, cambios ES/EN/ES, guía y enlaces, diseño adaptable, siete procesos × tres niveles y acceso directo a cada una de las 42 explicaciones. El ajuste final de visibilidad de los ejemplos alternativos se valida en la ejecución completa y CI posteriores.

Las comprobaciones funcionales usan Chromium y un servidor local bajo una subruta equivalente a GitHub Pages. La publicación y verificación de la URL pública se registran en [despliegue](despliegue.md). La confirmación de fuentes de materiales y la validación técnica industrial siguen pendientes.
