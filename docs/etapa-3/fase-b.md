# Fase B — evidencia incorporada sin transferir datos entre grados

El catálogo conserva 73 IDs, 64 grados comerciales y nueve perfiles manuales, y pasa a revisión `1.5.1` tras la revisión regional del PR #12 (la primera integración fue `1.5.0`). El esquema principal sigue siendo compatible con `1.3.0`. La extensión `src/data/material-research.v1.json` enlaza las fichas por ID; las propiedades originales no se rellenan con datos de otra fase ni de otro grado.

Se incorporan 1.592 filas documentales primarias de 47 grados con fuentes específicas. La revisión regional posterior añade una fuente ASTM para GP-35 y tres mediciones de fluidez respaldadas por ella, sin añadir grados. No equivalen a 1.592 propiedades físicas nuevas e independientes: incluyen ensayos bajo distintas condiciones, códigos cualitativos, recomendaciones y datos que refuerzan una propiedad existente. [Cobertura por entrada](coverage.json). Se conservan etiqueta, valor, unidad, condición, norma y grupo originales; los valores exactos, rangos y límites se distinguen. Un rango nunca se sustituye por su promedio, y ausencia o código de rotura nunca se convierte en cero.

Los otros **17 grados comerciales permanecen sin enriquecimiento numérico adicional**, y los nueve genéricos siguen sin propiedades específicas de grado. La biblioteca no se declara plenamente verificada por investigar sus 73 identidades; no se inventan propiedades para aumentar la cobertura. Los PDF PET conservan separadas sus columnas objetivo/límite y las alternativas por tamaño de pellet. Las recomendaciones de procesamiento no son consignas universales de máquina.

## Decisión técnica explícita

La revisión inicial solo contrastó la tabla ISO/EMEA y generalizó indebidamente que MFR 34 era un error. Se retira esa conclusión: INEOS publica **MFR 34 g/10 min, ASTM D1238, Américas**, y **MVR 34 cm³/10 min, ISO 1133, EMEA**, ambos a 220 °C/10 kg para el SKU público `300600120829`. El MFR original se restaura y el MVR se conserva como medición independiente. No se realiza conversión por densidad ni se certifica equivalencia entre formulaciones regionales, variantes coloreadas o lotes. Se registran fuente, región, condiciones, muestra sin colorear y revisión original `08/01/2022`. [Revisión de ambas tablas y PDF](gp35-regional-review.md) · [Decisiones anteriores y vigentes](source-decisions.json). Los snapshots anteriores no se modifican.

Las demás propiedades originales conservan sus valores. Las fuentes consultables se actualizan con alcance «contenido del grado revisado»; esto no certifica lotes ni revalida automáticamente cada campo heredado. La fecha de publicación de una página sin revisión explícita queda ausente; no se deduce del copyright del sitio. Las fichas BASF consultadas declaran 09/2026; las fichas Indorama son documentos históricos cuya revisión se conserva.

## Anomalías de fuente

Una escala Shore D que publica 110 y etiquetas de impacto con unidad contradictoria se conservan como texto documental pendiente de revisión. No se promueven a cantidades fiables. Los sufijos de rotura P/C/N y límites «>» no se interpretan como resultados exactos. Los módulos de cálculo todavía no consumen esta extensión; su integración visual y su captura en nuevos snapshots corresponden a la fase E.

El módulo de secado conserva los nueve grados habilitados y sus precargas. Las recomendaciones adicionales encontradas se guardan como documentación; no amplían el filtro ni cambian ecuaciones, tiempos, temperaturas o potencia térmica.
