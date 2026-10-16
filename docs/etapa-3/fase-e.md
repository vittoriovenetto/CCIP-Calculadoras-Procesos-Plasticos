# Fase E — interfaz, integración y validación

La consulta documental se carga al abrir «Investigación técnica, fluidez y reciclabilidad». Las propiedades mantienen texto original, métodos, unidades y condiciones; los estados ausentes o dudosos permanecen explícitos. Las aplicaciones declaradas se muestran separadas de los índices de fluidez. La comparación bloquea magnitudes, condiciones o métodos incompatibles y avisa cuando faltan edición o acondicionamiento.

El selector conserva los 73 registros, las familias, los fabricantes y los grados originales. Añade origen virgen/PIR/PCR/interno/comercial y formulaciones V/R con once repartos más una opción personalizada en masa. La identidad, lote, ciclos, tratamiento y ensayos se expanden cuando se necesitan. La familia del componente reciclado necesita declaración explícita: no se atribuye automáticamente la del virgen.

Las recetas no alteran las fichas comerciales. Seleccionar reciclado limpia las propiedades físicas anteriores; una formulación inválida tampoco permite recuperar silenciosamente las propiedades vírgenes. Las densidades del modelo tienen componente, fuente, fase y punto T/P; se requiere confirmación del ensayo y aceptación de hipótesis. Cambiar identidad/composición invalida la medición de formulación; cambiar fase borra los ensayos anteriores. La modificación manual continúa disponible y queda identificada. El modo verificado rechaza el modelo ideal.

Los nuevos snapshots incluyen receta, composición, ensayos, clasificación, fuente, modelo y condiciones. Si se consultó investigación, conservan la evidencia documental utilizada. Recuperar un registro no reemplaza su evidencia por el catálogo actual, y consultar uno antiguo sin esta ampliación requiere volver a seleccionar explícitamente el grado. Exportar un registro guardado no recalcula sus resultados; Excel/PDF/JSON muestran la formulación y distinguen la referencia del componente virgen. Los historiales anteriores no se escriben retroactivamente.

## Validación local

| Comprobación | Resultado |
|---|---|
| Base de Etapa 2 | 571 pruebas unitarias, 42 de navegador y 6 de historial/exportación aprobadas antes de editar |
| Unitarias actuales | 602 aprobadas; integridad de catálogo, evidencia, reología, recetas, modelo y snapshots |
| Regresión de navegador | 42 aprobadas; 135 estados de variantes/niveles/pantallas, 73 perfiles, 27 recorridos ES/EN/ES |
| Historial/exportaciones de Etapa 2 | 6 aprobadas; XLSX/PDF reales leídos con openpyxl, pypdf y PyMuPDF |
| Integración nueva de Etapa 3 | 8 aprobadas; extremos, recetas inválidas, ensayos y modelo, datos verificados, comparación MFR/MVR, historial y exportación bilingüe |
| Matriz de formulaciones | 9 familias × 6 procesos × 3 niveles = 162 estados sin propiedades heredadas; secado conserva sus 9 grados |
| Pantallas nuevas | 360, 390, 540, 768, 1024 y 1440 px en ES/EN, sin desbordamiento de la página |
| Artefacto local | build:pages y browser_pages_cache.py aprobados; recursos y datos diferidos bajo SHA, XLSX/PDF y recetas en 390/768/1440 px; sin publicar |

Se corrigió una expectativa de prueba que fijaba la revisión antigua `1.4.0`: ahora compara la revisión del catálogo cargado, conservando la prueba real de lectura del historial desde la versión congelada V1. Las métricas sin datos siguen ocultas en la interfaz Lean y permanecen nulas en snapshots/exportaciones; las pruebas nuevas verifican ambos comportamientos.

Los motores, matemáticas, esquemas de cálculo, archivos históricos, descargas, créditos y logotipos no cambian respecto de `fdf3a27`. Los cambios en presentación y selección de datos no añaden ecuaciones a los motores ni modifican el modelo de secado. No se ejecuta merge, publicación de Pages ni modificaciones de `main`/`gh-pages`.

## Capturas y reproducción

Las capturas de mezclas utilizan **ensayos sintéticos de prueba**, identificados como tales; no describen propiedades de un material real ni ajustes de máquina recomendados.

- [Modelo y perfil, móvil](capturas/perfil-movil-390.png).
- [Modelo y perfil, escritorio](capturas/perfil-escritorio-1440.png).
- [Consulta de fluidez, escritorio](capturas/fluidez-escritorio-1440.png).
- [Formulario de mezcla, inglés](capturas/mezcla-en-1440.png).

```sh
npm test
python tests/browser_smoke.py
python tests/browser_stage2.py
python tests/browser_stage3.py
# Con los archivos de aplicación comprometidos en Git:
npm run build:pages
python tests/browser_pages_cache.py
# Regenerar auditorías de los datos incorporados, sin red:
node scripts/research/report-stage3.mjs
```

Los generadores de investigación anteriores requieren la caché documental descrita en la fase A y dependencias de `scripts/research/requirements.txt`. Los informes guardan las huellas y URL; no se redistribuyen los PDF completos de fabricantes ni se promete acceso permanente a sus sitios.

## Límites técnicos pendientes

Las 17 fichas sin evidencia adicional, las tres anomalías, los ensayos antiguos sin edición/acondicionamiento y las propiedades ausentes siguen pendientes de revisión. No existe validación industrial universal del modelo ideal ni transferencia experimental a los 64 grados retenidos. Sin ensayos específicos, MFR, propiedades mecánicas, térmicas, contaminación y secado de recetas no se calculan. Se posponen el explorador independiente, la persistencia compartida en GitHub y las etapas completas de secado y máquinas.
