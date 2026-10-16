# Fase D — reciclados y formulaciones

Las formulaciones no duplican las 73 fichas. Conservan referencia del virgen, identidad del reciclado, fabricante/proveedor si se conoce, lote, origen PIR/PCR/interno/comercial, base, fracciones, ciclos, condiciones y pretratamiento. Las identidades inciertas se declaran, sin asignarles propiedades del componente virgen.

Se ofrecen las once composiciones 100/0, 90/10 … 0/100 y porcentajes personalizados. La convención es **primer porcentaje virgen / segundo reciclado, en masa**. Se validan intervalo y suma. Una representación equivalente como 80/20 y 80.0/20.00 conserva su clave canónica; cambiar identidad, lote o composición cambia la definición. El ID de formulación es un identificador local derivado; la clave canónica completa determina equivalencia y los cálculos del historial conservan sus UUID propios.

[Evaluación de las nueve familias](recycling-families.csv): HDPE, LDPE, LLDPE, PP, PET, PVC, ABS, PA6 y PC. Ninguna recibe un porcentaje máximo universal, una prohibición sin fuente o una garantía de uso alimentario, médico o estructural. Las familias sin datos experimentales directamente aplicables a las fuentes consultadas permanecen pendientes.

`recycling.v1.json` contiene seis sistemas experimentales públicos, separados del catálogo comercial, y quince composiciones documentadas [CSV](experimental-formulations.csv). Las identidades externas de los estudios son referencias experimentales, no grados comerciales vírgenes nuevos en el selector. Se preservan tablas originales, incertidumbres, métodos y límites; ninguna de estas tablas puede rellenar automáticamente un material de identidad distinta.

[Modelo de densidad y sus límites](modelos.md). Es el único modelo de mezcla implementado y exige aceptación explícita y datos compatibles. Las propiedades no documentadas continúan ausentes. Un dato medido de la formulación puede sustituir la estimación. La selección de datos y el etiquetado se aíslan en `formulation-calculation.js`; no se cambian las ecuaciones de ninguno de los siete procesos.
