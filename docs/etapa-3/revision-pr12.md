# PR #12 — corrección documental antes de cerrar la Etapa 3

## GP-35

Se retira la afirmación de que MFR 34 era un error universal. Se consultaron las páginas regionales y los dos PDF oficiales de INEOS Styrolution para Terluran GP-35, SKU público `300600120829`:

| Registro independiente | Región documental | Condiciones | Fuente |
|---|---|---|---|
| MFR 34 g/10 min, ASTM D1238 | Américas | 220 °C / 10 kg | Tabla y TDS ASTM |
| MVR 34 cm³/10 min, ISO 1133 | EMEA; fila también visible en Asia | 220 °C / 10 kg | Tabla y TDS ISO |

Se conservan ambas mediciones con fuentes y unidades distintas. Compartir nombre/SKU no demuestra equivalencia de formulación entre regiones, variantes coloreadas o lotes. Los documentos declaran valores típicos de productos sin colorear; el sufijo de variante permanece sin identificar. La revisión `08/01/2022` se registra literalmente, sin deducir convención de fecha ni edición de norma.

Además se reconfirman los valores anteriores MFR 3,1 a 200 °C/5 kg y MVR 11 a 230 °C/3,8 kg en el TDS ASTM. La biblioteca reológica queda en **69 mediciones: 56 documentadas y 13 previas pendientes de reconfirmación**. La decisión inicial se mantiene como antecedente expresamente superado, y ningún historial guardado se modifica.

[Informe regional y enlaces oficiales](gp35-regional-review.md) · [Registro, extractos y huellas de los documentos](gp35-regional-review.json) · [Decisiones](source-decisions.json)

## Cobertura parcial

**47 grados recibieron nueva evidencia y 17 grados comerciales permanecen sin enriquecimiento numérico adicional.** Los nueve perfiles genéricos continúan sin propiedades propias de grado. Investigar las 73 identidades no significa verificar plenamente toda la biblioteca; no se hace esa afirmación.

[Resumen estructurado de cobertura](coverage-summary.json) · [Auditoría de los 73 registros](audit-after.csv)

## Quince composiciones experimentales consultables

Se muestran individualmente en «Investigación técnica, fluidez y reciclabilidad» → «Reciclado» → «Composiciones experimentales publicadas»:

- **8 composiciones HDPE** del sistema REC-01 (Solvay A60-7019 y HDPE recuperado de envases rígidos).
- **5 composiciones PP** del sistema REC-02 (CAPILENE R50 y PP PCR del estudio).
- **2 composiciones PP** del sistema REC-03 (Moplen RP340H y redes de pesca PCR del estudio).

Las quince incluyen los extremos puros 100/0 y 0/100 cuando figuran en el estudio; no se presentan todas como mezclas binarias. Cada ficha de consulta muestra proporción V/R en masa, identidad de componentes, experimento, fuente, DOI y enlace al artículo. Los sistemas y tablas originales siguen disponibles. `automatic_application_allowed` es falso y `virgin_catalog_id` es nulo: consultar un estudio no asigna propiedades al grado comercial activo.

Las referencias quedan capturadas en nuevos snapshots cuando se consulta la investigación. Un historial anterior no recibe retroactivamente las composiciones o fuentes actuales.

[Inventario de las quince composiciones](experimental-formulations.json) · [Captura de HDPE](capturas/revision-composiciones-hdpe.png) · [Captura de PP](capturas/revision-composiciones-pp.png) · [GP-35 con contexto regional](capturas/revision-gp35-regiones.png)

## Regresión repetida

- **607 pruebas unitarias aprobadas**. Incluyen ambas mediciones oficiales de 34, procedencia regional, ausencia de equivalencia automática, cobertura 47/17, quince composiciones trazables y conservación de todos los valores/unidades del catálogo anterior.
- **42 pruebas generales de navegador aprobadas**: 135 estados de variantes/niveles/pantallas, los 73 registros y 27 recorridos ES/EN/ES.
- **6 pruebas de historial y exportación aprobadas**, con lectura independiente de archivos XLSX/PDF reales.
- **10 pruebas de integración de la Etapa 3 aprobadas**: incluyen las 162 combinaciones de familias/procesos/niveles anteriores y la consulta individual de las quince composiciones en ES/EN sin precarga de propiedades.
- El build local y la comprobación de caché del artefacto pasan en 390/768/1440 px, con datos diferidos y exportaciones reales, sin ejecutar publicación.

[Registros de la repetición](pruebas/revision-pr12/) · [Validación estructurada](validation.json)

Los motores, ecuaciones, parámetros de cálculo, aplicación principal, nueve grados de secado, aprendizaje, historial, materiales personalizados, comparación, exportaciones, idiomas, encabezado y versiones archivadas se conservan. Se actualiza la misma rama del PR #12; no se crea otro PR, no se fusiona y no se realiza deploy.

## Límites pendientes

Siguen pendientes las 17 fichas sin enriquecimiento adicional, las tres anomalías de fuente documentadas, las 13 mediciones antiguas sin reconfirmación y los detalles de edición/acondicionamiento o variante ausentes. Las dos tablas de GP-35 no justifican convertir MFR/MVR ni extrapolar a variantes coloreadas. Las propiedades de sistemas experimentales no se transfieren a otros componentes. El modelo ideal de densidad sigue siendo una estimación sin validación industrial universal.
