# Fase B — evidencia incorporada sin transferir datos entre grados

El catálogo conserva 73 IDs, 64 grados comerciales y nueve perfiles manuales, y pasa a revisión `1.5.0`. El esquema principal sigue siendo compatible con `1.3.0`. La extensión `src/data/material-research.v1.json` enlaza las fichas por ID; las propiedades originales no se rellenan con datos de otra fase ni de otro grado.

Se incorporan 1.592 filas documentales de 47 fuentes específicas de grado. No equivalen a 1.592 propiedades físicas nuevas e independientes: incluyen ensayos bajo distintas condiciones, códigos cualitativos, recomendaciones y datos que refuerzan una propiedad existente. [Cobertura por entrada](coverage.json). Se conservan etiqueta, valor, unidad, condición, norma y grupo originales; los valores exactos, rangos y límites se distinguen. Un rango nunca se sustituye por su promedio, y ausencia o código de rotura nunca se convierte en cero.

Las fuentes restantes y los nueve genéricos siguen sin datos adicionales verificados; no se inventan propiedades para aumentar la cobertura. Los PDF PET conservan separadas sus columnas objetivo/límite y las alternativas por tamaño de pellet. Las recomendaciones de procesamiento no son consignas universales de máquina.

## Decisión técnica explícita

En Terluran GP-35 se corrige el campo secundario 34: el fabricante declara **MVR 34 cm³/10 min, ISO 1133, 220 °C/10 kg**, no MFR 34 g/10 min. Se corrigen tipo, unidad y método; no se calcula mediante densidad. El campo primario bajo otras condiciones se conserva. [Estado anterior, evidencia y decisión](source-decisions.json). El snapshot anterior se mantiene inmutable; ningún historial existente se recalcula.

Las demás propiedades originales conservan sus valores. Las fuentes consultables se actualizan con alcance «contenido del grado revisado»; esto no certifica lotes ni revalida automáticamente cada campo heredado. La fecha de publicación de una página sin revisión explícita queda ausente; no se deduce del copyright del sitio. Las fichas BASF consultadas declaran 09/2026; las fichas Indorama son documentos históricos cuya revisión se conserva.

## Anomalías de fuente

Una escala Shore D que publica 110 y etiquetas de impacto con unidad contradictoria se conservan como texto documental pendiente de revisión. No se promueven a cantidades fiables. Los sufijos de rotura P/C/N y límites «>» no se interpretan como resultados exactos. Los módulos de cálculo todavía no consumen esta extensión; su integración visual y su captura en nuevos snapshots corresponden a la fase E.

El módulo de secado conserva los nueve grados habilitados y sus precargas. Las recomendaciones adicionales encontradas se guardan como documentación; no amplían el filtro ni cambian ecuaciones, tiempos, temperaturas o potencia térmica.
