# Extensión modular

La web funciona sin compilación ni dependencias JavaScript de terceros. Las rutas relativas permiten servirla bajo una subruta de GitHub Pages.

- `src/schema.js`: catálogo de siete procesos, campos, unidades, niveles, ayudas, dominios y ejemplos de geometría. `activeFields` aplica niveles y variantes.
- `src/math.js`: interpretación estricta de números, predicados y división segura. No contiene propiedades de materiales.
- `src/engine.js`: selección del modelo, filtrado/validación de entradas y contrato de salidas; `calculate(id, inputs, level = "advanced")`. El tercer argumento es opcional y preserva las llamadas originales que pasan todas las entradas.
- `src/models/<proceso>.js`: función independiente por proceso. Recibe entradas validadas y `{push, warn, notes}`. No accede al DOM, almacenamiento, ni modelos de otro proceso. `push(label, value, unit, formula, precision)` convierte resultados no finitos a `null`.
- `src/app.js`: navegación, formularios accesibles, actualización de resultados, guardar/recuperar y exportar.
- `src/materials.js` y `src/materials-view.js`: selección, reglas de compatibilidad, ficha, overrides y snapshot; catálogo activo local en `src/data/materials.v1.2.json`, con versiones anteriores conservadas.
- `src/pvt.js` y `src/materials-audit-view.js`: controles de referencias, gráfico orientativo aislado del motor y registro de evidencia manual.
- `src/history.js`: recuperación tolerante a almacenamiento bloqueado y entradas dañadas. Conserva los registros válidos y sus resultados anteriores; al recuperar se recalcula con el modelo vigente.
- `tests/engine.test.js`: diez casos originales conservados. `tests/validation.test.js`: referencias dimensionales, dominios, variantes y niveles. `tests/history.test.js`: persistencia. `tests/browser_smoke.py`: integración opcional en Chromium.

Para agregar una calculadora: definir su esquema con `id` único, implementar una función en `src/models`, importar/registrar esa función en `engine.js` y añadir referencias y limitaciones. No modificar fórmulas de procesos existentes. Para un dominio distinto de los comunes, declarar `min`, `exclusiveMin`, `max`, `exclusiveMax` o `integer` en el campo; propiedades de material sin fuente deben permanecer sin `default`.

Contrato de resultado: `{metrics, warnings, notes}`. Una métrica incluye `label`, `value` (número finito o `null`), `unit`, `formula`, `precision`. Cero es un resultado distinto de pendiente. Las entradas exportadas corresponden únicamente al nivel y variante calculados, con fecha ISO. El historial conserva hasta 60 registros y muestra los 15 más recientes; el navegador puede impedir su almacenamiento. No es un registro técnico certificado ni compartido entre equipos. JSON registra snapshot del grado, fuentes y valores de materiales usados. No garantiza restauración idéntica entre versiones del motor: un historial recuperado utiliza las fórmulas actuales.

La aplicación no transmite datos de materiales ni cálculos a servidores externos; necesita solo un servidor estático para cargar módulos ES. No hay backend, API de propiedades, base de máquinas ni control de proceso. Hay un catálogo local de nueve grados documentados; las fuentes externas solo se abren por decisión del usuario. Véase [reglas de integración](materiales.md).
