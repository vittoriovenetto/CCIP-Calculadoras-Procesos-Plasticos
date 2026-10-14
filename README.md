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
- Tres niveles de detalle: básico, técnico, avanzado; cada uno activa nuevas entradas. Los datos ocultos no participan en el cálculo.
- Las propiedades y los parámetros de máquina sin fuente permanecen vacíos; los datos de catálogo se aplican solo a campos compatibles y tras confirmar condiciones; las dimensiones y cantidades precargadas son ejemplos editables.
- Explicaciones de cada parámetro y fórmulas en los resultados.
- Biblioteca de nueve grados comerciales con selección familia → fabricante → grado, fuentes y condiciones locales.
- Autocompletado condicionado de propiedades compatibles, rangos elegidos explícitamente y overrides manuales trazables.
- Historial/JSON conserva identidad del grado, fuente, auditoría, referencias pVT y snapshot de propiedades utilizadas.
- Gráfica pVT orientativa de ABS, fuentes de PC y referencia B3S para PA6: densidad automática deshabilitada.
- Modo avanzado para registrar T/P y fuente de densidad manual, o fase/intervalo/fuente de Cp.
- Resultados pendientes si faltan datos: **no se inventan propiedades**. Densidad fundida y calor específico siguen pendientes en los nueve grados.
- Advertencias y limitaciones del modelo.
- Historial de hasta 60 resultados en el navegador (localStorage).
- Exportación JSON con entradas, resultados, fórmulas y fecha; útil para futura app Flutter.
- Interfaz adaptable a pantallas móviles.

## Ejecutar
Usa un servidor estático, por ejemplo `python -m http.server 8000`, y abre `http://localhost:8000`. Los módulos JavaScript necesitan servidor local y no deben abrirse con `file://`.

Para ejecutar las pruebas del motor, niveles, entradas e historial: `npm test` (requiere Node.js 18 o superior; no requiere instalar paquetes).

Integración de interfaz opcional: `python3 tests/browser_smoke.py`, con Python, Playwright y Chromium disponibles. En una máquina nueva instala Playwright (`python3 -m pip install playwright`) y su navegador (`python3 -m playwright install chromium`); si Chromium ya está instalado, se reutiliza. `CCIP_CHROMIUM` permite indicar su ejecutable y `CCIP_TEST_ARTIFACTS` un directorio de capturas. La prueba inicia su propio servidor local y no publica nada. Comprueba nueve variantes × tres niveles × cuatro tamaños, más nueve grados × tres procesos × tres niveles × escritorio/móvil; también edición, fuentes, rangos, overrides, historial, JSON y cálculo offline tras cargar recursos.

Los cambios de esta auditoría se preparan en `feature/web-v1-modular`. La publicación en GitHub Pages y la fusión a `main` quedan pendientes de una decisión posterior; no son parte de la verificación local.

## Estructura
- `index.html`: HTML de entrada.
- `src/app.js`: navegación, controles y almacenamiento local.
- `src/schema.js`: catálogo de parámetros, niveles y descripciones.
- `src/engine.js`: registro de modelos y validación de entradas.
- `src/models/`: motor independiente de cada proceso y notas técnicas.
- `src/math.js`: conversiones numéricas y división segura.
- `src/data/materials.v1.2.json`: biblioteca activa con auditoría y referencias pVT; archivos V1.0/V1.1 conservados sin cambios.
- `src/pvt.js`: validación y copia de referencias documentales, sin lookup de densidad.
- `src/materials-audit-view.js`: referencias bloqueadas, gráfica orientativa y controles manuales.
- `src/materials.js`: selección, compatibilidad, autocompletado y snapshots.
- `src/materials-view.js`: selector, ficha y advertencias.
- `docs/materiales.md`: reglas de biblioteca, trazabilidad y pruebas.
- `src/history.js`: lectura validada del historial.
- `src/styles.css`: estilos responsivos.
- `tests/`: pruebas de referencia, dominios/niveles, historial e integración de navegador.
- `docs/modelos.md`: ecuaciones, unidades, dominios, límites y validación técnica necesaria.
- `docs/arquitectura.md`: contrato y extensión de calculadoras.
- `docs/auditoria.md`: hallazgos y resultados de verificación.

## Limitaciones técnicas
Los cálculos **son modelos simplificados y no están validados para operación industrial**. La precisión depende del grado comercial, las mediciones y las condiciones de proceso. La densidad del fundido no se puede sustituir automáticamente por la densidad del sólido. La capacidad de inyección calculada es geométrica ideal, no una homologación de máquina; el margen de shot no equivale al colchón residual.

La película supone dos paredes uniformes sin pérdidas. El DDR geométrico no contempla hinchamiento. Los balances de extrusión no predicen rendimiento a partir de RPM. El secado no modela humedad final ni evaporación. El costo directo parcial omite gastos indirectos.

## Pendientes de validación
1. Revisar las hipótesis de cada ecuación con bibliografía y manuales del CCIP.
2. Comprobar casos de prueba con equipos y grados reales.
3. Ampliar la biblioteca documentada y completar pVT/densidad fundida, cp(T) y secado faltante, con fichas vigentes y condiciones de ensayo.
4. Incorporar perfiles de máquina, reportes PDF/Excel, simulaciones y herramientas inversas.
5. Obtener conformidad para identidad gráfica institucional definitiva.

**Importante:** la app Flutter será otro proyecto; ambos pueden compartir especificaciones matemáticas y pruebas, no el mismo código JavaScript.

Consulta [modelos y validación técnica](docs/modelos.md), [arquitectura modular](docs/arquitectura.md) y [auditoría y pruebas](docs/auditoria.md) antes de utilizar resultados fuera de un ejercicio académico.

Consulta [biblioteca de materiales y reglas de aplicación](docs/materiales.md) para conocer los nueve grados, condiciones, niveles y propiedades pendientes.

La [auditoría V1.1 / referencias pVT V1.2](docs/auditoria-materiales-v1.2.md) detalla datos incorporados, controles de calidad, pruebas y validaciones pendientes.
