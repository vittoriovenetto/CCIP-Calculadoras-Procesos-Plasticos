# CCIP — Calculadoras de Procesos Plásticos

Proyecto académico independiente para **Procesos de Transformación I (CCIP / INTEC)**. Código web completamente nuevo; no se ha modificado el repositorio de la calculadora original.

## Módulos incluidos en la V1 experimental
- Moldeo por inyección: shot por masa o volumen; capacidad geométrica, utilización, carrera, fuerza de cierre, llenado y plastificación.
- Extrusión: caudal de láminas y tubos, productividad, tiempo de residencia nominal y potencia con energía específica ingresada.
- Película soplada: BUR, DDR geométrico ideal y producción.
- Soplado de envases: geometría cilíndrica ideal, masa y productividad.
- Termoformado: consumo de lámina, espesor medio aproximado y productividad.
- Secado: dimensionamiento nominal de tolva y calentamiento sensible mínimo.
- Producción y costos: producción, consumo, costo directo parcial.

## Funcionalidad
- Tres niveles de detalle: básico, técnico, avanzado; cada uno activa nuevas entradas.
- Explicaciones de cada parámetro y fórmulas en los resultados.
- Resultados pendientes si faltan datos: **no se inventan propiedades**.
- Advertencias y limitaciones del modelo.
- Historial de hasta 60 resultados en el navegador (localStorage).
- Exportación JSON con entradas, resultados, fórmulas y fecha; útil para futura app Flutter.
- Interfaz adaptable a pantallas móviles.

## Ejecutar
Usa un servidor estático, por ejemplo `python -m http.server 8000`, y abre `http://localhost:8000`. Los módulos JavaScript necesitan servidor local y no deben abrirse con `file://`.

Para ejecutar comprobaciones iniciales: `npm test` (requiere Node.js 18 o superior).

Para publicar en GitHub Pages una vez incorporada la rama de desarrollo: **Settings → Pages → Deploy from a branch → main → /(root)**.

## Estructura
- `index.html`: HTML de entrada.
- `src/app.js`: navegación, controles y almacenamiento local.
- `src/schema.js`: catálogo de parámetros, niveles y descripciones.
- `src/engine.js`: motor de cálculo y notas técnicas.
- `src/styles.css`: estilos responsivos.
- `tests/engine.test.js`: pruebas automatizadas de referencia.

## Limitaciones técnicas
Los cálculos **son modelos simplificados y no están validados para operación industrial**. La precisión depende del grado comercial, las mediciones y las condiciones de proceso. La densidad del fundido no se puede sustituir automáticamente por la densidad del sólido. La capacidad de inyección calculada es geométrica ideal, no una homologación de máquina; el margen de shot no equivale al colchón residual.

La película supone dos paredes uniformes sin pérdidas. El DDR geométrico no contempla hinchamiento. Los balances de extrusión no predicen rendimiento a partir de RPM. El secado no modela humedad final ni evaporación. El costo directo parcial omite gastos indirectos.

## Pendientes de validación
1. Revisar las hipótesis de cada ecuación con bibliografía y manuales del CCIP.
2. Comprobar casos de prueba con equipos y grados reales.
3. Añadir base de materiales con referencia a grado, ficha y temperatura.
4. Incorporar perfiles de máquina, reportes PDF/Excel, simulaciones y herramientas inversas.
5. Obtener conformidad para identidad gráfica institucional definitiva.

**Importante:** la app Flutter será otro proyecto; ambos pueden compartir especificaciones matemáticas y pruebas, no el mismo código JavaScript.