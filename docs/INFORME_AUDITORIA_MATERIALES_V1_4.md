# Auditoría exhaustiva de biblioteca de materiales — CCIP v1.4

**Fecha:** 15 octubre 2026. **Repositorio:** vittoriovenetto/CCIP-Calculadoras-Procesos-Plasticos.

## Decisión y método

Se evaluaron **90 grados comerciales + 9 familias genéricas** presentes en el catálogo anterior. Se publican únicamente grados comerciales con **al menos 3 datos numéricos documentados**, de **dos grupos técnicos distintos** (físico, flujo/reología, mecánico, térmico o secado), incluyendo alguno de densidad, flujo, mecánica o secado, y enlace oficial de fabricante. Un nombre y un enlace sin propiedades no es ficha técnica. Los 9 registros genéricos siguen disponibles **solo para introducir datos propios**; no se cuentan como fichas.

**Resultado: 59 grados comerciales aprobados, 31 excluidos, 9 perfiles genéricos mantenidos. TOTAL 68 opciones.**

## Resumen por familia

| Familia | Comerciales anteriores | Conservados | Excluidos | Genérico para entrada manual |
|---|---:|---:|---:|---:|
| HDPE | 10 | 8 | 2 | Sí |
| LLDPE | 10 | 8 | 2 | Sí |
| LDPE | 10 | 5 | 5 | Sí |
| PP | 10 | 10 | 0 | Sí |
| PET | 10 | 3 | 7 | Sí |
| PVC | 10 | 10 | 0 | Sí |
| ABS | 10 | 8 | 2 | Sí |
| PA6 | 10 | 2 | 8 | Sí |
| PC | 10 | 5 | 5 | Sí |

## Limitaciones críticas y criterios de comparación

- **Tres valores no equivalen a una ficha completa.** Deben validarse método, unidad, fase, temperatura, carga, grado, lote y fecha; las fichas publican típicos, no certificados.
- **PVC:** K e IV están correlacionados y **no son MFR/MVR**; el tercer valor es densidad aparente de resina en **polvo**, no densidad sólida del compuesto ni densidad de fundido. Por lo tanto, se conservan en el catálogo para comparar resinas, pero no se rellenan automáticamente parámetros de moldeo que requieran densidad sólida o fundida.
- **PET:** propiedades como humedad de suministro/objetivo de fabricación no equivalen a humedad residual permitida al procesar. No se atribuye secado del grado desde una guía general.
- **PC/PA6/ABS:** el tiempo de secado de ficha depende de presentación y humedad inicial; rangos quedan rangos, no se promedian automáticamente.
- **MFR/MVR:** no se convierten entre sí ni se comparan bajo temperaturas/cargas diferentes. Los datos en °F quedan en una propiedad auxiliar y no se inyectan a campos °C.
- **Densidad:** sólida, fundida y aparente son magnitudes diferentes; no se copian o derivan automáticamente entre sí.
- **pVT:** falta modelo medido/calibrado por grado para la mayoría; no se aplican curvas digitalizadas como si fueran coeficientes certificados.
- **Trazabilidad:** conservar historial de casos y datos personales, aunque un grado comercial desaparezca del menú actual. El JSON de auditoría permite comprender por qué fue retirado.

## Grados comerciales conservados

| Familia | Grado | Datos | Fuente oficial |
|---|---|---:|---|
| HDPE | DOW 12450N | 4 | [Fabricante](https://www.dow.com/en-us/pdp.dow-12450n-high-density-polyethylene-resin.47054z.html) |
| HDPE | DOW 08262B | 3 | [Fabricante](https://www.dow.com/en-us/pdp.dow-08262b-high-density-polyethylene-resin.82162z.html) |
| HDPE | DOW HDPE LP 8000 | 3 | [Fabricante](https://www.dow.com/en-us/pdp.dow-hdpe-lp-8000-high-density-polyethylene-resin.359059z.html) |
| HDPE | DOW HDPE NG6997 | 3 | [Fabricante](https://www.dow.com/en-us/pdp.dow-hdpe-ng6997-high-density-polyethylene-resin.119863z.html) |
| HDPE | DOW DMDA-8007 NT 7 | 3 | [Fabricante](https://www.dow.com/en-us/pdp.dow-dmda-8007-nt-7-high-density-polyethylene-resin.92941z.html) |
| HDPE | DOW DGDA-5004 NT 7 | 6 | [Fabricante](https://www.dow.com/en-us/pdp.dow-dgda-5004-nt-7-high-density-polyethylene-resin.92904z.html) |
| HDPE | DOW HDPE LP 8000 HD | 3 | [Fabricante](https://www.dow.com/en-us/pdp.dow-hdpe-lp-8000-hd-high-density-polyethylene-resin.458736z.html) |
| HDPE | DOW HDPE DGDA-2484 NT | 3 | [Fabricante](https://www.dow.com/en-us/pdp.dow-hdpe-dgda-2484-nt-high-density-polyethylene-resin.65261z.html) |
| LLDPE | DOWLEX 2045G | 3 | [Fabricante](https://www.dow.com/en-us/pdp.dowlex-2045g-polyethylene-resin.7650z.html) |
| LLDPE | DOWLEX 2045.01G | 4 | [Fabricante](https://www.dow.com/en-us/pdp.dowlex-204501g-polyethylene-resin.72471z.html) |
| LLDPE | DOWLEX 2645G | 5 | [Fabricante](https://www.dow.com/en-us/pdp.dowlex-2645g-polyethylene-resin.104295z.html) |
| LLDPE | DOWLEX 2045.11G | 4 | [Fabricante](https://www.dow.com/en-us/pdp.dowlex-204511g-polyethylene-resin.7651z.html) |
| LLDPE | DOWLEX 2045 | 4 | [Fabricante](https://www.dow.com/en-us/pdp.dowlex-2045-polyethylene-resin.24764z.html) |
| LLDPE | DOWLEX 2035 | 4 | [Fabricante](https://www.dow.com/en-us/pdp.dowlex-2035-polyethylene-resin.24762z.html) |
| LLDPE | DOWLEX 2036.01G | 4 | [Fabricante](https://www.dow.com/en-us/pdp.dowlex-203601g-polyethylene-resin.386630z.html) |
| LLDPE | DOWLEX 2047G | 4 | [Fabricante](https://www.dow.com/en-us/pdp.dowlex-2047g-polyethylene-resin.10239z.html) |
| LDPE | DOW LDPE 132G | 3 | [Fabricante](https://www.dow.com/en-us/pdp.dow-ldpe-132g-low-density-polyethylene-resin.110928z.html) |
| LDPE | DOW LDPE 150E | 3 | [Fabricante](https://www.dow.com/en-us/pdp.dow-ldpe-150e-low-density-polyethylene-resin.19527z.html) |
| LDPE | DOW LDPE 7010E | 4 | [Fabricante](https://www.dow.com/en-us/pdp.dow-ldpe-7010e-low-density-polyethylene-resin.206483z.html) |
| LDPE | DOW 5004I | 4 | [Fabricante](https://www.dow.com/en-us/pdp.dow-5004i-low-density-polyethylene-resin.20679z.html) |
| LDPE | DOW LDPE 219M | 3 | [Fabricante](https://www.dow.com/en-us/pdp.dow-ldpe-219m-low-density-polyethylene-resin.80207z.html) |
| PP | Moplen HP500N | 5 | [Fabricante](https://www.lyondellbasell.com/en/polymers/p/Moplen-HP500N/e8c2d3bb-d271-459f-a439-629a5d85a7da) |
| PP | Moplen HP501M | 5 | [Fabricante](https://www.lyondellbasell.com/en/polymers/p/Moplen-HP501M/1f2b1127-1a74-4107-870e-7d04f3132220) |
| PP | Moplen HP400R | 5 | [Fabricante](https://www.lyondellbasell.com/en/polymers/p/Moplen-HP400R/b8c2b2d7-cbc5-46e4-8506-8031418ef728) |
| PP | Moplen HP548R | 5 | [Fabricante](https://www.lyondellbasell.com/49f80e/globalassets/documents/polymers-technical-literature/product-selection-guide-pp-consumer-injection-molding.pdf) |
| PP | Moplen HP648T | 5 | [Fabricante](https://www.lyondellbasell.com/49f80e/globalassets/documents/polymers-technical-literature/product-selection-guide-pp-consumer-injection-molding.pdf) |
| PP | Moplen RP348R | 5 | [Fabricante](https://www.lyondellbasell.com/49f80e/globalassets/documents/polymers-technical-literature/product-selection-guide-pp-consumer-injection-molding.pdf) |
| PP | Moplen RP248R | 5 | [Fabricante](https://www.lyondellbasell.com/49f80e/globalassets/documents/polymers-technical-literature/product-selection-guide-pp-consumer-injection-molding.pdf) |
| PP | Moplen RP398T | 5 | [Fabricante](https://www.lyondellbasell.com/49f80e/globalassets/documents/polymers-technical-literature/product-selection-guide-pp-consumer-injection-molding.pdf) |
| PP | Moplen RP348T HP | 5 | [Fabricante](https://www.lyondellbasell.com/49f80e/globalassets/documents/polymers-technical-literature/product-selection-guide-pp-consumer-injection-molding.pdf) |
| PP | Moplen RP248U | 5 | [Fabricante](https://www.lyondellbasell.com/49f80e/globalassets/documents/polymers-technical-literature/product-selection-guide-pp-consumer-injection-molding.pdf) |
| PET | Polyclear Refresh PET 1101 | 4 | [Fabricante](https://www.indoramaventures.com/storage/downloads/product/pet/bottle-sheet/Polyclear-%C2%AE-Refresh-PET-1101-Rev-16.pdf) |
| PET | Polyclear Preserve PET 2201 | 5 | [Fabricante](https://www.indoramaventures.com/storage/downloads/product/pet/bottle-sheet/Polyclear-%C2%AE-Preserve-PET-2201-Rev-13.pdf) |
| PET | Polyclear Splash PET 3301 | 4 | [Fabricante](https://www.indoramaventures.com/storage/downloads/product/pet/bottle-sheet/Polyclear%20%C2%AE%20Splash%20PET%203301%20Rev%2015.pdf) |
| PVC | Westlake PVC 1195 | 5 | [Fabricante](https://www.westlake.com/sites/default/files/1195_1.pdf) |
| PVC | Westlake PVC 2060 | 3 | [Fabricante](https://www.westlake.com/pvc-technical-data) |
| PVC | Westlake PVC 1185 | 3 | [Fabricante](https://www.westlake.com/pvc-technical-data) |
| PVC | Westlake PVC 5265 | 3 | [Fabricante](https://www.westlake.com/pvc-technical-data) |
| PVC | Westlake PVC 2070 | 3 | [Fabricante](https://www.westlake.com/pvc-technical-data) |
| PVC | Westlake PVC 5305 | 3 | [Fabricante](https://www.westlake.com/pvc-technical-data) |
| PVC | Westlake PVC 2079 | 3 | [Fabricante](https://www.westlake.com/pvc-technical-data) |
| PVC | Westlake PVC 2082 | 3 | [Fabricante](https://www.westlake.com/pvc-technical-data) |
| PVC | Westlake PVC 1230P | 3 | [Fabricante](https://www.westlake.com/pvc-technical-data) |
| PVC | Westlake PVC 1230S | 3 | [Fabricante](https://www.westlake.com/pvc-technical-data) |
| ABS | Terluran GP-22 | 5 | [Fabricante](https://www.ineos-styrolution.com/Product/Terluran_TERLURAN-GP-22_SKU300600120827.html) |
| ABS | Terluran GP-35 | 6 | [Fabricante](https://eshop.ineos-styrolution.com/Product/Terluran_Terluran-GP-35_SKU300600120829.html) |
| ABS | Terluran HI-10 | 5 | [Fabricante](https://eshop.ineos-styrolution.com/Product/Terluran_Terluran-HI-10_SKU300600120831.html) |
| ABS | Novodur H605 | 5 | [Fabricante](https://www.ineos-styrolution.com/Product/Novodur-High-Heat_NOVODUR-H605_SKU302200150405.html) |
| ABS | Novodur HH-106 | 3 | [Fabricante](https://eshop.ineos-styrolution.com/Product/Novodur-High-Heat_NOVODUR-HH-106_SKU302200150417.html) |
| ABS | Novodur HH-112 | 3 | [Fabricante](https://eshop.ineos-styrolution.com/Product/Novodur-High-Heat_Novodur-HH-112_SKU302200150418.html) |
| ABS | Novodur P2MC | 5 | [Fabricante](https://www.ineos-styrolution.com/Product/Novodur_Novodur-P2MC_SKU302100140449.html) |
| ABS | Novodur P2H-AT | 5 | [Fabricante](https://eshop.ineos-styrolution.com/Product/Novodur_NOVODUR-P2H-AT_SKU302100140442.html) |
| PA6 | Ultramid B3S R03 | 7 | [Fabricante](https://download.basf.com/p1/8a8081c57fd4b609017fd64903145168/en/ULTRAMID%253Csup%253E%25C2%25AE%253Csup%253E_B3S_R03) |
| PA6 | Ultramid B3K | 6 | [Fabricante](https://download.basf.com/p1/8a8081c57fd4b609017fd659928f6ca1/en/ULTRAMID%25C2%25AE_B3K) |
| PC | Makrolon 2405 | 7 | [Fabricante](https://solutions.covestro.com/en/products/makrolon/makrolon-2405_000000000000945088) |
| PC | Makrolon 2407 | 5 | [Fabricante](https://solutions.covestro.com/en/products/makrolon/makrolon-2407_000000000086286874) |
| PC | Makrolon 2805 | 5 | [Fabricante](https://solutions.covestro.com/en/products/makrolon/makrolon-2805_000000000057534382) |
| PC | Makrolon 2856 | 5 | [Fabricante](https://solutions.covestro.com/en/products/makrolon/makrolon-2856_000000000057534439) |
| PC | Makrolon 3105 | 3 | [Fabricante](https://solutions.covestro.com/en/products/makrolon/makrolon-3105_000000000057534560) |

## Grados excluidos del catálogo activo

| Familia | Grado | Datos registrados | Motivo de exclusión | Fuente consultada |
|---|---|---:|---|---|
| HDPE | DOW 05962B | 2 | Solo 2 propiedades técnicas documentadas (mínimo 3) | [Fuente](https://www.dow.com/en-us/pdp.dow-05962b-high-density-polyethylene-resin.64720z.html) |
| HDPE | DOW HDPE DGDA-2426 NT | 0 | Solo 0 propiedades técnicas documentadas (mínimo 3) | [Fuente](https://www.dow.com/en-us/pdp.dow-hdpe-dgda-2426-nt-bimodal-polyethylene-resin.442623z.html) |
| LLDPE | DOWLEX 2049G | 0 | Solo 0 propiedades técnicas documentadas (mínimo 3) | [Fuente](https://www.dow.com/en-us/pdp.dowlex-2049g-polyethylene-resin.9597z.html) |
| LLDPE | DOWLEX 2045G CIR | 2 | Solo 2 propiedades técnicas documentadas (mínimo 3) | [Fuente](https://www.dow.com/en-us/pdp.dowlex-2045g-cir-polyethylene-resin.515268z.html) |
| LDPE | DOW LDPE 203M | 0 | Solo 0 propiedades técnicas documentadas (mínimo 3) | [Fuente](https://www.dow.com/en-us/pdp.dow-ldpe-203m-low-density-polyethylene-resin.80210z.html) |
| LDPE | DOW LDPE 310LG | 0 | Solo 0 propiedades técnicas documentadas (mínimo 3) | [Fuente](https://www.dow.com/en-us/pdp.dow-ldpe-310lg-low-density-polyethylene-resin.188542z.html) |
| LDPE | DOW LDPE 352E | 0 | Solo 0 propiedades técnicas documentadas (mínimo 3) | [Fuente](https://www.dow.com/en-us/pdp.dow-ldpe-352e-low-density-polyethylene-resin.20966z.html) |
| LDPE | DOW LDPE 220M | 0 | Solo 0 propiedades técnicas documentadas (mínimo 3) | [Fuente](https://www.dow.com/en-us/pdp.dow-ldpe-220m-low-density-polyethylene-resin.80215z.html) |
| LDPE | DOW LDPE 432E | 0 | Solo 0 propiedades técnicas documentadas (mínimo 3) | [Fuente](https://www.dow.com/en-us/pdp.dow-ldpe-432e-low-density-polyethylene-resin.403830z.html) |
| PET | Polyclear PET T-94G | 0 | Solo 0 propiedades técnicas documentadas (mínimo 3) | [Fuente](https://www.indoramaventures.com/en/our-products/pet) |
| PET | Polyclear Preserve PET 2201-D | 0 | Solo 0 propiedades técnicas documentadas (mínimo 3) | [Fuente](https://www.indoramaventures.com/en/our-products/pet) |
| PET | Polyclear TITAN PET T94-Ti | 0 | Solo 0 propiedades técnicas documentadas (mínimo 3) | [Fuente](https://www.indoramaventures.com/en/our-products/pet) |
| PET | Preformance PET | 0 | Solo 0 propiedades técnicas documentadas (mínimo 3) | [Fuente](https://www.indoramaventures.com/en/our-products/pet) |
| PET | Polyclear EBM PET 5505 | 0 | Solo 0 propiedades técnicas documentadas (mínimo 3) | [Fuente](https://beta.indoramaventures.com/storage/downloads/specialty-polymers/indorama_ventures_specialtiy_polymers_product_overview_for-website_12.2025.pdf) |
| PET | Polyclear EBM PET 5507 | 0 | Solo 0 propiedades técnicas documentadas (mínimo 3) | [Fuente](https://beta.indoramaventures.com/storage/downloads/specialty-polymers/indorama_ventures_specialtiy_polymers_product_overview_for-website_12.2025.pdf) |
| PET | Polyclear AERO PET 5605 | 0 | Solo 0 propiedades técnicas documentadas (mínimo 3) | [Fuente](https://beta.indoramaventures.com/storage/downloads/specialty-polymers/indorama_ventures_specialtiy_polymers_product_overview_for-website_12.2025.pdf) |
| ABS | Terluran SP-6 | 0 | Solo 0 propiedades técnicas documentadas (mínimo 3) | [Fuente](https://www.ineos-styrolution.com/Product/Terluran_ID30060012_lang_ja_JP.html) |
| ABS | Terluran GP-35 White | 0 | Solo 0 propiedades técnicas documentadas (mínimo 3) | [Fuente](https://www.ineos-styrolution.com/Product/Terluran_ID30060012_lang_ja_JP.html) |
| PA6 | Ultramid B3L | 0 | Solo 0 propiedades técnicas documentadas (mínimo 3) | [Fuente](https://download.basf.com/p1/8a8081c57fd4b609017fdf6c58512210/en/Ultramid%3Csup%3E%C2%AE%3Csup%3E_%28PA%29_%E2%80%92_Product_Range) |
| PA6 | Ultramid B3S | 0 | Solo 0 propiedades técnicas documentadas (mínimo 3) | [Fuente](https://download.basf.com/p1/8a8081c57fd4b609017fdf6c58512210/en/Ultramid%3Csup%3E%C2%AE%3Csup%3E_%28PA%29_%E2%80%92_Product_Range) |
| PA6 | Ultramid B3Z2 | 0 | Solo 0 propiedades técnicas documentadas (mínimo 3) | [Fuente](https://download.basf.com/p1/8a8081c57fd4b609017fdf6c58512210/en/Ultramid%3Csup%3E%C2%AE%3Csup%3E_%28PA%29_%E2%80%92_Product_Range) |
| PA6 | Ultramid B3EG6 | 0 | Solo 0 propiedades técnicas documentadas (mínimo 3) | [Fuente](https://download.basf.com/p1/8a8081c57fd4b609017fdf6c58512210/en/Ultramid%3Csup%3E%C2%AE%3Csup%3E_%28PA%29_%E2%80%92_Product_Range) |
| PA6 | Ultramid B3U30G6 | 0 | Solo 0 propiedades técnicas documentadas (mínimo 3) | [Fuente](https://plastics-rubber.basf.com/northamerica/en/performance_polymers/industries/pp_powertools) |
| PA6 | Ultramid B3U50G6 | 0 | Solo 0 propiedades técnicas documentadas (mínimo 3) | [Fuente](https://plastics-rubber.basf.com/northamerica/en/performance_polymers/industries/pp_powertools) |
| PA6 | Ultramid B3U42G6 | 0 | Solo 0 propiedades técnicas documentadas (mínimo 3) | [Fuente](https://plastics-rubber.basf.com/northamerica/en/performance_polymers/industries/pp_powertools) |
| PA6 | Ultramid B3ZG6 | 0 | Solo 0 propiedades técnicas documentadas (mínimo 3) | [Fuente](https://plastics-rubber.basf.com/northamerica/en/performance_polymers/industries/pp_powertools) |
| PC | Makrolon 2807 | 0 | Solo 0 propiedades técnicas documentadas (mínimo 3) | [Fuente](https://solutions.covestro.com/-/media/covestro/solution-center/whitepapers/marking-products-made-of-technical-thermoplastics.pdf) |
| PC | Makrolon 2858 | 0 | Solo 0 propiedades técnicas documentadas (mínimo 3) | [Fuente](https://solutions.covestro.com/-/media/covestro/solution-center/whitepapers/marking-products-made-of-technical-thermoplastics.pdf) |
| PC | Makrolon 3106 | 0 | Solo 0 propiedades técnicas documentadas (mínimo 3) | [Fuente](https://solutions.covestro.com/-/media/covestro/solution-center/whitepapers/marking-products-made-of-technical-thermoplastics.pdf) |
| PC | Makrolon 3107 | 0 | Solo 0 propiedades técnicas documentadas (mínimo 3) | [Fuente](https://solutions.covestro.com/-/media/covestro/solution-center/whitepapers/marking-products-made-of-technical-thermoplastics.pdf) |
| PC | Makrolon 3108 | 0 | Solo 0 propiedades técnicas documentadas (mínimo 3) | [Fuente](https://solutions.covestro.com/-/media/covestro/solution-center/whitepapers/marking-products-made-of-technical-thermoplastics.pdf) |

## Referencias transversales de fabricante consultadas

- [Dow — DGDA-5004 NT 7](https://www.dow.com/en-us/pdp.dow-dgda-5004-nt-7-high-density-polyethylene-resin.92904z.html) y fichas por grado.
- [LyondellBasell — guía de PP de inyección](https://www.lyondellbasell.com/49f80e/globalassets/documents/polymers-technical-literature/product-selection-guide-pp-consumer-injection-molding.pdf).
- [Westlake — serie PVC y tabla por grado](https://www.westlake.com/pvc-technical-data).
- [Indorama — PET 2201](https://www.indoramaventures.com/storage/downloads/product/pet/bottle-sheet/Polyclear-%C2%AE-Preserve-PET-2201-Rev-13.pdf) y PET Splash 3301.
- [BASF — Ultramid B3S R03](https://download.basf.com/p1/8a8081c57fd4b609017fd64903145168/en/ULTRAMID%253Csup%253E%25C2%25AE%253Csup%253E_B3S_R03).
- [INEOS — Terluran GP-22](https://www.ineos-styrolution.com/Product/Terluran_TERLURAN-GP-22_SKU300600120827.html).
- [Covestro — Makrolon 2407](https://solutions.covestro.com/en/products/makrolon/makrolon-2407_000000000086286874).

## Integración y control de calidad

1. El buscador y la selección deben presentar **solo 68 perfiles**; en PP y PVC hay 10 grados, en PA6 solo dos por falta de datos de otros.
2. Filtros «con propiedades disponibles» deben mostrar solo comerciales y excluir genéricos sin medidas.
3. La ficha expandida debe mostrar **solo propiedades documentadas**; si el genérico no tiene ninguna, la sección se oculta.
4. Crear/editar materiales personales (persistencia local) sigue disponible en las 9 familias.
5. No reutilizar etiquetas obsoletas «99 perfiles», «90 grados» o «v1.3.1» en interfaz/documentos activos.
6. Los ensayos en planta con grado, lote y condiciones son la etapa necesaria para **validación de proceso**; esta auditoría es documental.

La matriz estructurada detallada está en [auditoria-estricta-materiales-v1.4.json](auditoria-estricta-materiales-v1.4.json). Se pueden recuperar candidatos descartados solamente tras verificar al menos tres valores completos, actualizar fuente y pasar pruebas.
