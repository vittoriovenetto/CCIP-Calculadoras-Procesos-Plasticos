# Auditoría exhaustiva de biblioteca de materiales — CCIP v1.4

**Fecha:** 15 octubre 2026. **Repositorio:** vittoriovenetto/CCIP-Calculadoras-Procesos-Plasticos.

## Decisión final

Se auditaron **90 grados comerciales + 9 entradas genéricas**. Se conservan exclusivamente grados con **al menos 3 propiedades numéricas publicadas**, pertenecientes a **dos grupos técnicos diferentes** (físico, reología/flujo, mecánico, térmico o secado), al menos una de densidad, flujo, mecánica o secado, y fuente oficial de fabricante.

**Balance final: 64 grados comerciales y 9 genéricos para datos manuales = 73 opciones. Se excluyeron 26 grados comerciales.** Se recuperaron datos documentados de Westlake (PVC), LyondellBasell (PP), Indorama (PET), Dow (PE), INEOS (ABS), BASF (PA6) y Covestro (PC). Algunos grados de PC inicialmente excluidos se recuperaron al localizar fichas exactas.

## Por familia

| Familia | Grados anteriores | Conservados | Excluidos | Genérico disponible |
|---|---:|---:|---:|---:|
| HDPE | 10 | 8 | 2 | Sí |
| LLDPE | 10 | 8 | 2 | Sí |
| LDPE | 10 | 5 | 5 | Sí |
| PP | 10 | 10 | 0 | Sí |
| PET | 10 | 3 | 7 | Sí |
| PVC | 10 | 10 | 0 | Sí |
| ABS | 10 | 8 | 2 | Sí |
| PA6 | 10 | 2 | 8 | Sí |
| PC | 10 | 10 | 0 | Sí |

## Advertencias de ingeniería

- **Tres propiedades no hacen una ficha completa.** Las condiciones del fabricante deben acompañar cada valor. La biblioteca no valida la formulación ni el lote.
- **PVC en polvo:** densidad aparente, viscosidad inherente y K están publicados. K e IV están correlacionados y no constituyen ensayos independientes; ninguna de esas magnitudes reemplaza MFR/MVR ni densidad fundida.
- **PET:** humedad del producto suministrado no equivale a humedad residual admisible tras secado. No autocompletar secado de fichas ajenas al grado.
- **MFR/MVR:** comparar solo a iguales condiciones de temperatura, carga y método. No convertir un indicador de flujo de PVC o PET en MFR.
- **Densidad sólida, aparente y fundida** son distintas. La mayoría no tiene curvas pVT numéricas calibradas de grado exacto; no habilitar inferencias engañosas.
- **Secado:** los rangos publicados se conservan como rangos; el motor no debe promediar ni confundir °F con °C. Las propiedades adicionales solo son descriptivas salvo integración física validada.
- **Los nueve genéricos no son fichas certificadas:** permiten entrada manual con condiciones; nunca precargan valores.

## Grados comerciales conservados (64)

| Familia | Grado | Propiedades registradas | Fuente del fabricante |
|---|---|---:|---|
| HDPE | DOW 12450N | 4 | [Fuente](https://www.dow.com/en-us/pdp.dow-12450n-high-density-polyethylene-resin.47054z.html) |
| HDPE | DOW 08262B | 3 | [Fuente](https://www.dow.com/en-us/pdp.dow-08262b-high-density-polyethylene-resin.82162z.html) |
| HDPE | DOW HDPE LP 8000 | 3 | [Fuente](https://www.dow.com/en-us/pdp.dow-hdpe-lp-8000-high-density-polyethylene-resin.359059z.html) |
| HDPE | DOW HDPE NG6997 | 3 | [Fuente](https://www.dow.com/en-us/pdp.dow-hdpe-ng6997-high-density-polyethylene-resin.119863z.html) |
| HDPE | DOW DMDA-8007 NT 7 | 3 | [Fuente](https://www.dow.com/en-us/pdp.dow-dmda-8007-nt-7-high-density-polyethylene-resin.92941z.html) |
| HDPE | DOW DGDA-5004 NT 7 | 6 | [Fuente](https://www.dow.com/en-us/pdp.dow-dgda-5004-nt-7-high-density-polyethylene-resin.92904z.html) |
| HDPE | DOW HDPE LP 8000 HD | 3 | [Fuente](https://www.dow.com/en-us/pdp.dow-hdpe-lp-8000-hd-high-density-polyethylene-resin.458736z.html) |
| HDPE | DOW HDPE DGDA-2484 NT | 3 | [Fuente](https://www.dow.com/en-us/pdp.dow-hdpe-dgda-2484-nt-high-density-polyethylene-resin.65261z.html) |
| LLDPE | DOWLEX 2045G | 3 | [Fuente](https://www.dow.com/en-us/pdp.dowlex-2045g-polyethylene-resin.7650z.html) |
| LLDPE | DOWLEX 2045.01G | 4 | [Fuente](https://www.dow.com/en-us/pdp.dowlex-204501g-polyethylene-resin.72471z.html) |
| LLDPE | DOWLEX 2645G | 5 | [Fuente](https://www.dow.com/en-us/pdp.dowlex-2645g-polyethylene-resin.104295z.html) |
| LLDPE | DOWLEX 2045.11G | 4 | [Fuente](https://www.dow.com/en-us/pdp.dowlex-204511g-polyethylene-resin.7651z.html) |
| LLDPE | DOWLEX 2045 | 4 | [Fuente](https://www.dow.com/en-us/pdp.dowlex-2045-polyethylene-resin.24764z.html) |
| LLDPE | DOWLEX 2035 | 4 | [Fuente](https://www.dow.com/en-us/pdp.dowlex-2035-polyethylene-resin.24762z.html) |
| LLDPE | DOWLEX 2036.01G | 4 | [Fuente](https://www.dow.com/en-us/pdp.dowlex-203601g-polyethylene-resin.386630z.html) |
| LLDPE | DOWLEX 2047G | 4 | [Fuente](https://www.dow.com/en-us/pdp.dowlex-2047g-polyethylene-resin.10239z.html) |
| LDPE | DOW LDPE 132G | 3 | [Fuente](https://www.dow.com/en-us/pdp.dow-ldpe-132g-low-density-polyethylene-resin.110928z.html) |
| LDPE | DOW LDPE 150E | 3 | [Fuente](https://www.dow.com/en-us/pdp.dow-ldpe-150e-low-density-polyethylene-resin.19527z.html) |
| LDPE | DOW LDPE 7010E | 4 | [Fuente](https://www.dow.com/en-us/pdp.dow-ldpe-7010e-low-density-polyethylene-resin.206483z.html) |
| LDPE | DOW 5004I | 4 | [Fuente](https://www.dow.com/en-us/pdp.dow-5004i-low-density-polyethylene-resin.20679z.html) |
| LDPE | DOW LDPE 219M | 3 | [Fuente](https://www.dow.com/en-us/pdp.dow-ldpe-219m-low-density-polyethylene-resin.80207z.html) |
| PP | Moplen HP500N | 5 | [Fuente](https://www.lyondellbasell.com/en/polymers/p/Moplen-HP500N/e8c2d3bb-d271-459f-a439-629a5d85a7da) |
| PP | Moplen HP501M | 5 | [Fuente](https://www.lyondellbasell.com/en/polymers/p/Moplen-HP501M/1f2b1127-1a74-4107-870e-7d04f3132220) |
| PP | Moplen HP400R | 5 | [Fuente](https://www.lyondellbasell.com/en/polymers/p/Moplen-HP400R/b8c2b2d7-cbc5-46e4-8506-8031418ef728) |
| PP | Moplen HP548R | 5 | [Fuente](https://www.lyondellbasell.com/49f80e/globalassets/documents/polymers-technical-literature/product-selection-guide-pp-consumer-injection-molding.pdf) |
| PP | Moplen HP648T | 5 | [Fuente](https://www.lyondellbasell.com/49f80e/globalassets/documents/polymers-technical-literature/product-selection-guide-pp-consumer-injection-molding.pdf) |
| PP | Moplen RP348R | 5 | [Fuente](https://www.lyondellbasell.com/49f80e/globalassets/documents/polymers-technical-literature/product-selection-guide-pp-consumer-injection-molding.pdf) |
| PP | Moplen RP248R | 5 | [Fuente](https://www.lyondellbasell.com/49f80e/globalassets/documents/polymers-technical-literature/product-selection-guide-pp-consumer-injection-molding.pdf) |
| PP | Moplen RP398T | 5 | [Fuente](https://www.lyondellbasell.com/49f80e/globalassets/documents/polymers-technical-literature/product-selection-guide-pp-consumer-injection-molding.pdf) |
| PP | Moplen RP348T HP | 5 | [Fuente](https://www.lyondellbasell.com/49f80e/globalassets/documents/polymers-technical-literature/product-selection-guide-pp-consumer-injection-molding.pdf) |
| PP | Moplen RP248U | 5 | [Fuente](https://www.lyondellbasell.com/49f80e/globalassets/documents/polymers-technical-literature/product-selection-guide-pp-consumer-injection-molding.pdf) |
| PET | Polyclear Refresh PET 1101 | 4 | [Fuente](https://www.indoramaventures.com/storage/downloads/product/pet/bottle-sheet/Polyclear-%C2%AE-Refresh-PET-1101-Rev-16.pdf) |
| PET | Polyclear Preserve PET 2201 | 5 | [Fuente](https://www.indoramaventures.com/storage/downloads/product/pet/bottle-sheet/Polyclear-%C2%AE-Preserve-PET-2201-Rev-13.pdf) |
| PET | Polyclear Splash PET 3301 | 4 | [Fuente](https://www.indoramaventures.com/storage/downloads/product/pet/bottle-sheet/Polyclear%20%C2%AE%20Splash%20PET%203301%20Rev%2015.pdf) |
| PVC | Westlake PVC 1195 | 5 | [Fuente](https://www.westlake.com/sites/default/files/1195_1.pdf) |
| PVC | Westlake PVC 2060 | 3 | [Fuente](https://www.westlake.com/pvc-technical-data) |
| PVC | Westlake PVC 1185 | 3 | [Fuente](https://www.westlake.com/pvc-technical-data) |
| PVC | Westlake PVC 5265 | 3 | [Fuente](https://www.westlake.com/pvc-technical-data) |
| PVC | Westlake PVC 2070 | 3 | [Fuente](https://www.westlake.com/pvc-technical-data) |
| PVC | Westlake PVC 5305 | 3 | [Fuente](https://www.westlake.com/pvc-technical-data) |
| PVC | Westlake PVC 2079 | 3 | [Fuente](https://www.westlake.com/pvc-technical-data) |
| PVC | Westlake PVC 2082 | 3 | [Fuente](https://www.westlake.com/pvc-technical-data) |
| PVC | Westlake PVC 1230P | 3 | [Fuente](https://www.westlake.com/pvc-technical-data) |
| PVC | Westlake PVC 1230S | 3 | [Fuente](https://www.westlake.com/pvc-technical-data) |
| ABS | Terluran GP-22 | 5 | [Fuente](https://www.ineos-styrolution.com/Product/Terluran_TERLURAN-GP-22_SKU300600120827.html) |
| ABS | Terluran GP-35 | 6 | [Fuente](https://eshop.ineos-styrolution.com/Product/Terluran_Terluran-GP-35_SKU300600120829.html) |
| ABS | Terluran HI-10 | 5 | [Fuente](https://eshop.ineos-styrolution.com/Product/Terluran_Terluran-HI-10_SKU300600120831.html) |
| ABS | Novodur H605 | 5 | [Fuente](https://www.ineos-styrolution.com/Product/Novodur-High-Heat_NOVODUR-H605_SKU302200150405.html) |
| ABS | Novodur HH-106 | 3 | [Fuente](https://eshop.ineos-styrolution.com/Product/Novodur-High-Heat_NOVODUR-HH-106_SKU302200150417.html) |
| ABS | Novodur HH-112 | 3 | [Fuente](https://eshop.ineos-styrolution.com/Product/Novodur-High-Heat_Novodur-HH-112_SKU302200150418.html) |
| ABS | Novodur P2MC | 5 | [Fuente](https://www.ineos-styrolution.com/Product/Novodur_Novodur-P2MC_SKU302100140449.html) |
| ABS | Novodur P2H-AT | 5 | [Fuente](https://eshop.ineos-styrolution.com/Product/Novodur_NOVODUR-P2H-AT_SKU302100140442.html) |
| PA6 | Ultramid B3S R03 | 7 | [Fuente](https://download.basf.com/p1/8a8081c57fd4b609017fd64903145168/en/ULTRAMID%253Csup%253E%25C2%25AE%253Csup%253E_B3S_R03) |
| PA6 | Ultramid B3K | 6 | [Fuente](https://download.basf.com/p1/8a8081c57fd4b609017fd659928f6ca1/en/ULTRAMID%25C2%25AE_B3K) |
| PC | Makrolon 2405 | 7 | [Fuente](https://solutions.covestro.com/en/products/makrolon/makrolon-2405_000000000000945088) |
| PC | Makrolon 2407 | 5 | [Fuente](https://solutions.covestro.com/en/products/makrolon/makrolon-2407_000000000086286874) |
| PC | Makrolon 2805 | 5 | [Fuente](https://solutions.covestro.com/en/products/makrolon/makrolon-2805_000000000057534382) |
| PC | Makrolon 2807 | 4 | [Fuente](https://solutions.covestro.com/-/media/covestro/solution-center/products/datasheets/imported/makrolon/makrolon-2807_zf_56978007-00009619-18637275.pdf) |
| PC | Makrolon 2856 | 5 | [Fuente](https://solutions.covestro.com/en/products/makrolon/makrolon-2856_000000000057534439) |
| PC | Makrolon 2858 | 3 | [Fuente](https://solutions.covestro.com/-/media/covestro/solution-center/brands/downloads/imported/1556888808.pdf?hash=6C670B9A7B2F77CD2BF485F9C9DD2988&rev=3230968946) |
| PC | Makrolon 3105 | 3 | [Fuente](https://solutions.covestro.com/en/products/makrolon/makrolon-3105_000000000057534560) |
| PC | Makrolon 3106 | 3 | [Fuente](https://solutions.covestro.com/en/products/makrolon/makrolon-3106_000000000056628987) |
| PC | Makrolon 3107 | 4 | [Fuente](https://solutions.covestro.com/en/products/makrolon/makrolon-3107_000000000057534595) |
| PC | Makrolon 3108 | 3 | [Fuente](https://solutions.covestro.com/en/products/makrolon/makrolon-3108_000000000000006499) |

## Grados excluidos del catálogo (26)

| Familia | Grado | Datos | Razón | Fuente consultada |
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

## Control de errores de procedencia

Se detectaron y retiraron **13 referencias pVT/Cp de otros grados** arrastradas de plantillas, y se corrigieron estados de secado que estaban heredados sin documentación propia. Ninguna curva pVT ajena se debe asociar ni aplicar a un grado nuevo. La ficha exacta de Makrolon 3108 fue revisada para completar sus propiedades de tracción y recomendaciones de secado. Los datos son típicos de fabricante; no valores de lote.

## Trazabilidad y recuperación

- La matriz JSON [auditoria-estricta-materiales-v1.4.json](auditoria-estricta-materiales-v1.4.json) conserva el dictamen de cada uno de los 99 registros sin exponer candidatos incompletos al usuario final.
- El archivo [cobertura-99-materiales-y-fuentes.md](cobertura-99-materiales-y-fuentes.md) queda solo como referencia histórica.
- No se elimina el historial guardado de cálculos ni materiales personalizados, aun si un grado comercial antiguo deja de ser seleccionable.
- El proceso para readmitir uno de los excluidos será: localizar ficha de grado exacto, capturar tres propiedades verificables y condiciones de ensayo, vincular fuente, superar pruebas y aprobar revisión humana.
- La documentación utilizada puede ser valores típicos o guías de selección, no certificados de lote. Validación experimental en el CCIP sigue siendo una tarea aparte.

**Fuentes principales:** [Westlake PVC](https://www.westlake.com/pvc-technical-data), [LYB PP](https://www.lyondellbasell.com/49f80e/globalassets/documents/polymers-technical-literature/product-selection-guide-pp-consumer-injection-molding.pdf), [Dow HDPE](https://www.dow.com/en-us/pdp.dow-dgda-5004-nt-7-high-density-polyethylene-resin.92904z.html), [BASF PA6](https://download.basf.com/p1/8a8081c57fd4b609017fd64903145168/en/ULTRAMID%253Csup%253E%25C2%25AE%253Csup%253E_B3S_R03), [INEOS ABS](https://www.ineos-styrolution.com/Product/Terluran_TERLURAN-GP-22_SKU300600120827.html), [Covestro PC](https://solutions.covestro.com/en/products/makrolon/makrolon-3108_000000000000006499), [Indorama PET](https://www.indoramaventures.com/storage/downloads/product/pet/bottle-sheet/Polyclear-%C2%AE-Preserve-PET-2201-Rev-13.pdf).
