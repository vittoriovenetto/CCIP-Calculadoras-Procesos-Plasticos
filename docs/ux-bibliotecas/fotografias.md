# Fotografías: inventario de fuentes y permisos

Se consultaron las páginas fuente de los 25 registros y avisos legales de fabricantes. No se estableció una licencia clara de redistribución pública para ninguna imagen; **no se incorporan fotografías ni se hace hotlinking**. Todas las tarjetas mantienen el recuadro neutral «Imagen no disponible».

## Prioridades

- **Moiron M2-I:** [página fuente](https://www.microplast.com/products.html). El material visual identificado lleva la marca Moiron y M2-I; no se estableció que sea una fotografía y puede ser un render. Tampoco consta licencia de redistribución. No se reutiliza ni se sustituye por la variante Ø16 mm de otra ficha.
- **XH-430B-25:** [página oficial](https://www.xihuamach.com/cmjxl/6.html). Se localizó la fotografía de producto, separada de la tricapa XH-430B-3. El aviso copyright no concede redistribución; no se incorpora.
- **Kiefel:** el [aviso legal](https://www.kiefel.com/en/imprint) exige consentimiento escrito para distribuir el contenido y limita las copias a uso privado no comercial. Además, imágenes KMD 78.2/90.1 no se asignan a la variante KMD 64.2.
- Las fotografías/ilustraciones de una serie COLLIN, GEISS o Kautex no identifican automáticamente una variante individual.

## Inventario por registro

| Registro | Fuente revisada | Uso en CCIP |
|---|---|---|
| `arburg-allrounder-370s-700-290-s30` | [Fuente](https://www.arburg.com/media/daten/publications/technical_data/hydraulic_machines/allrounder_s/ARBURG_ALLROUNDER_370S_multi-component_TD_528998_fr.pdf) | Sin permiso establecido; fallback |
| `battenfeld-cincinnati-uniex-series` | [Fuente](https://www.battenfeld-cincinnati.com/products/detail/uniex) | Sin permiso establecido; fallback |
| `reifenhauser-evo-ffs-series` | [Fuente](https://reifenhauser.com/en/lines-components/extrusion-lines/blown-film-lines/evo-ffs) | Sin permiso establecido; fallback |
| `kautex-kbb40` | [Fuente](https://www.kautex-group.com/en/machine/kbb/) | Sin permiso establecido; fallback |
| `geiss-t11-series` | [Fuente](https://www.geiss-ttt.com/en/products/thermoforming-systems/t11-thermoforming-machine/) | Sin permiso establecido; fallback |
| `motan-luxor-hd-lhd30` | [Fuente](https://www.motan.com/fileadmin/data/products/pdf/drying/luxor-s/es_LUXOR-S.pdf) | Sin permiso establecido; fallback |
| `moiron-m2-i` | [Fuente](https://www.microplast.com/products.html) | Sin permiso establecido; fallback |
| `moiron-m2-ii` | [Fuente](https://www.microplast.com/products.html) | Sin permiso establecido; fallback |
| `xihua-xh436-25t` | [Fuente](https://www.xihuamach.com/zsj/) | Sin permiso establecido; fallback |
| `xihua-xh433-45` | [Fuente](https://www.xihuamach.com/jcj/191.html) | Sin permiso establecido; fallback |
| `xihua-xh434-25` | [Fuente](https://www.xihuamach.com/jcj/104.html) | Sin permiso establecido; fallback |
| `collin-e20-e` | [Fuente](https://www.collin-solutions.com/en/product/extruders-e-2/) | Sin permiso establecido; fallback |
| `xihua-xh-430b-25` | [Fuente](https://www.xihuamach.com/cmjxl/6.html) | Sin permiso establecido; fallback |
| `xihua-xh-430b-25-3` | [Fuente](https://www.xihuamach.com/cmjxl/4.html) | Sin permiso establecido; fallback |
| `kautex-kbb60` | [Fuente](https://www.kautex-group.com/en/machine/kbb/) | Sin permiso establecido; fallback |
| `kautex-kbb80` | [Fuente](https://www.kautex-group.com/en/machine/kbb/) | Sin permiso establecido; fallback |
| `motan-luxor-hd-lhd60` | [Fuente](https://www.motan.com/fileadmin/data/products/pdf/drying/luxor-s/es_LUXOR-S.pdf) | Sin permiso establecido; fallback |
| `motan-luxor-hd-lhd150` | [Fuente](https://www.motan.com/fileadmin/data/products/pdf/drying/luxor-s/es_LUXOR-S.pdf) | Sin permiso establecido; fallback |
| `collin-bl-400-e` | [Fuente](https://www.collin-solutions.com/en/product/blown-film-lines-e-air-cooled/) | Sin permiso establecido; fallback |
| `collin-bl-600-e` | [Fuente](https://www.collin-solutions.com/en/product/blown-film-lines-e-air-cooled/) | Sin permiso establecido; fallback |
| `moiron-page104-16mm-100kn` | [Fuente](https://www.moirons.com/product/diyixilie/104.html) | Sin permiso establecido; fallback |
| `dongguan-xihua-xh430b-2-2kw` | [Fuente](https://dgxihua.en.made-in-china.com/product/jXsEJupbfyrF/China-PP-HDPE-LDPE-PLA-Lab-Blow-Film-Machine.html) | Sin permiso establecido; fallback |
| `kiefel-kmd642speed` | [Fuente](https://www.kiefel.com/en/solutions/by-machine-solution/speedformer-kmd?variant=kmd642speed) | Sin permiso establecido; fallback |
| `kiefel-kmd782speed` | [Fuente](https://www.kiefel.com/en/solutions/by-machine-solution/speedformer-kmd?variant=kmd782speed) | Sin permiso establecido; fallback |
| `kiefel-kmd85speed` | [Fuente](https://www.kiefel.com/en/solutions/by-machine-solution/speedformer-kmd?variant=kmd85speed) | Sin permiso establecido; fallback |

Los metadatos completos están en `fotografias.json` y `src/data/machine-images.v1.json`: registro, fabricante, URL, tipo de fuente, titular cuando consta, fundamento de permiso, fecha, texto alternativo e identidad de variante. Las candidatas se conservaron solo para inspección en el área de trabajo, fuera del repositorio.

## Incorporación futura

El renderizador acepta únicamente un archivo local optimizado, asociado al ID exacto y con permiso `approved`, fundamento de uso, titular, URL verificable, texto alternativo ES/EN y SHA-256. El layout reserva proporción 8:5; las imágenes usan carga diferida, dimensiones y fallback ante error. Los registros sin permiso nunca solicitan la URL candidata. No hay imágenes generadas por IA ni fotografías genéricas atribuidas a modelos concretos.
