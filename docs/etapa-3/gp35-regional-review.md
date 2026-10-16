# Terluran GP-35 — revisión documental regional del PR #12

Se retira la conclusión inicial que presentaba **MFR = 34** como un error universal. La revisión anterior había considerado únicamente la tabla ISO/EMEA. Las tablas y los PDF oficiales consultados respaldan **ambas mediciones**, con magnitudes, unidades y métodos distintos. No se obtiene una de otra por conversión.

| Contexto documental | Grado y SKU público | Medición | Condiciones | Norma declarada | Muestra | Revisión original |
|---|---|---|---|---|---|---|
| Américas, tabla y TDS ASTM | Terluran GP-35, `300600120829` | MFR 34 g/10 min | 220 °C / 10 kg | ASTM D 1238 | Valores típicos de productos sin colorear | `08/01/2022` |
| EMEA, tabla y TDS ISO | Terluran GP-35, `300600120829` | MVR 34 cm³/10 min | 220 °C / 10 kg | ISO 1133 | Valores típicos de productos sin colorear | `08/01/2022` |

El PDF ASTM también respalda MFR 3,1 g/10 min a 200 °C/5 kg y MVR 11 cm³/10 min a 230 °C/3,8 kg, ambos con ASTM D 1238. Se conservan como ensayos separados de los dos resultados de 34. La edición/año de las normas y el preacondicionamiento no están declarados; no se rellenan con las versiones actuales.

## Identidad, región y variante

Las páginas comparten nombre comercial y SKU público. Se comprobó la tabla ASTM seleccionando **Américas** y la ISO seleccionando **EMEA**; Asia también muestra la fila ISO. La página de Américas ofrece además un enlace ISO con `ShowISO=true`, cuyo PDF contiene el contacto EMEA. Esto no demuestra otra medición regional independiente y no se duplica el MVR 34 por ese enlace.

Las páginas de Américas y EMEA listan `GP-35 NR` y `GP-35 BK10009`; Asia también muestra `GP-35 WT010222`. Sin embargo, las tablas y TDS declaran valores típicos para productos sin colorear y no asignan cada ensayo a un sufijo de variante individual. Por eso se registra `variant: null` y `sample_state: uncolored_products`. No se atribuyen los resultados a BK10009, a WT010222 ni a lotes concretos, y no se certifica que todas las formulaciones regionales sean idénticas.

La fecha se conserva literalmente como `08/01/2022`: no se deduce si utiliza día/mes o mes/día. Es la revisión del documento, no la edición de la norma ni una certificación de vigencia comercial o de lote.

## Fuentes oficiales consultadas

- [Tabla de Américas — MFR 34 ASTM](https://eshop.ineos-styrolution.com/Product/Terluran_Terluran-GP-35_SKU300600120829.html?SKU=300600120829&SelectedRegion=Region_America).
- [Tabla EMEA — MVR 34 ISO](https://eshop.ineos-styrolution.com/Product/Terluran_Terluran-GP-35_SKU300600120829.html?SKU=300600120829&SelectedRegion=Region_EMEA).
- [Tabla Asia — MVR 34 ISO](https://eshop.ineos-styrolution.com/Product/Terluran_Terluran-GP-35_SKU300600120829.html?SKU=300600120829&SelectedRegion=Region_Asia).

Desde cada página se consultó el enlace público «Technical Data Sheet». El endpoint PDF reutiliza la URL y depende de la región de la sesión; un enlace PDF sin contexto puede devolver otra tabla. Para reproducir la consulta, seleccionar primero la región en la página oficial y descargar después el TDS correspondiente. Se guardaron URL de contexto, URL de PDF, huella SHA-256, extractos breves y fecha de consulta en [el registro estructurado](gp35-regional-review.json); no se redistribuyen los PDF completos.

## Corrección de datos y auditoría

- Se restaura `mfr_secondary = 34 g/10min`, fuente ASTM/Américas, y se mantiene `mvr_secondary = 34 cm3/10min`, fuente ISO/EMEA, como registros independientes.
- Se actualiza la procedencia de MFR 3,1 y MVR 11 con el PDF ASTM consultado. Ningún motor usa estas mediciones como viscosidad ni convierte MVR/MFR automáticamente.
- La biblioteca reológica contiene **69 mediciones: 56 con evidencia documental revisada y 13 previas pendientes de reconfirmación**. Se conservan las fuentes históricas sin convertirlas retroactivamente en fuentes verificadas.
- La decisión inicial permanece en `source-decisions.json` como `superseded_after_regional_review`, con una decisión vigente que explica la rectificación. Los snapshots históricos permanecen intactos.
- El catálogo pasa a revisión `1.5.1`; las extensiones documental y reológica, a `1.0.1`. Los 73 IDs y las funciones de cálculo se conservan.

Los números iguales de ASTM e ISO no prueban equivalencia dimensional, una relación de densidad ni igualdad de formulación regional. Sin datos completos de variante, edición y acondicionamiento, tampoco se declara una comparación concluyente entre ensayos.
