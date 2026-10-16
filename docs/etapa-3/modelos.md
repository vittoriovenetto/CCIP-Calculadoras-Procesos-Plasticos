# Modelos de formulación — dominio y trazabilidad

## Densidad ideal por volúmenes específicos aditivos

Para masas de componentes `mᵥ`, `mᵣ`, se define `wᵥ = mᵥ/(mᵥ+mᵣ)` y `wᵣ = mᵣ/(mᵥ+mᵣ)`. Si se supone que el volumen total es aditivo a una misma temperatura, presión y fase:

`V = mᵥ/ρᵥ + mᵣ/ρᵣ`

Al dividir masa total por volumen se obtiene:

`ρ = 1 / (wᵥ/ρᵥ + wᵣ/ρᵣ)`

Las fracciones son **másicas**, adimensionales y suman 1. Las densidades se introducen en g/cm³; el resultado conserva esa unidad. No es el promedio aritmético de densidades. Se deriva de las definiciones de densidad y conservación de masa, añadiendo la **hipótesis operativa** de aditividad de volúmenes específicos. Su incorporación fue propuesta expresamente en la especificación del usuario; esta nota es la documentación del modelo, no una validación experimental universal.

El dominio implementado se limita a una familia declarada común, dos componentes identificados y misma fase, temperatura y presión documentadas. No se estiman condiciones ausentes, no se extrapola pVT, no se aplica un factor térmico a una densidad ya fundida y no se usa densidad aparente. La aceptación de hipótesis por el usuario no certifica el material. Los datos manuales permanecen identificados como datos de usuario; la salida se clasifica como estimación de modelo.

Un cambio de composición invalida las propiedades aplicadas de la formulación anterior. El punto T/P del modelo no puede cambiarse en inyección manteniendo automáticamente el valor previo. En modo solo datos verificados se rechaza la densidad ideal. El usuario puede sustituirla por una medición de esa formulación, con identidad, fase, fuente y condiciones declaradas.

En 100/0 y 0/100 no se exige la densidad del componente inexistente ni se llama mezcla al material puro. Si falta cualquier dato necesario, solo quedan pendientes las salidas que lo requieren. La masa gravimétrica de inyección no requiere densidad.

## Modelos que no se aplican

| Propiedad | Comportamiento |
| --- | --- |
| MFR/MVR | Sin promedio aritmético ni conversión con densidad sólida/de familia; requiere ensayo o modelo validado para componentes y condiciones exactos |
| Resistencia, elongación, impacto | No se heredan del virgen ni se interpolan sin validación |
| Tg, Tm, cristalización, degradación | Sin variación lineal universal |
| Humedad, secado, Cp | Sin transferencia automática del virgen; la revisión completa del secado pertenece a una etapa posterior |
| Compatibilidad industrial | No se infiere del MFR o de una proporción V/R |

Los estudios de HDPE, PP, LDPE, ABS y PA6 se conservan como **sistemas experimentales separados**, con sus propias identidades, procedimientos y tablas. No justifican trasplantar sus propiedades a los grados Dow, Moplen, Terluran, Ultramid o Makrolon del catálogo. Las tablas de parámetros de máquina son condiciones del experimento, no consignas recomendadas. No se digitalizan curvas a ojo ni se reconstruyen datos de los otros grados.
