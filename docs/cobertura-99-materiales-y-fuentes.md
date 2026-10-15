> **ARCHIVO HISTÓRICO — NO ES EL CATÁLOGO ACTIVO.** Actualizado por la auditoría [v1.4](INFORME_AUDITORIA_MATERIALES_V1_4.md): 64 grados con ≥3 propiedades y 9 perfiles manuales. Se retiraron 26 grados de esta lista. Este documento muestra el estado anterior al filtro.

# Cobertura real del catálogo de 99 materiales (15/10/2026)

**Alcance:** 90 grados comerciales + 9 perfiles genéricos sin grado conocido.

El usuario solicita incorporar toda la información disponible. Este repositorio contiene una **fase de incorporación trazable**, no una afirmación de que los 90 grados ya tengan sus fichas completas.

## Estado resumido

- 99 perfiles.
- 26 grados con datos de fabricante revisados parcialmente (20 Dow, 2 LYB, 1 BASF, 2 Covestro, 1 INEOS).
- 55 grados comerciales nuevos que todavía requieren investigación individual de fuentes.
- 9 genéricos sin información de grado: **no deben disponer de propiedades supuestas**.
- Los nueve grados iniciales conservan propiedades aportadas anteriormente; su verificación actual específica debe revisarse por separado.
- No existen valores medidos de densidad de fundido en los grados recién agregados; **nunca** sustituir por densidad sólida.

## Normas de captura

1. Confirmar nombre exacto y tipo comercial en fuente oficial, no solo en un agregador.
2. Extraer valor + unidad + método + temperatura + carga de ensayo + fase o forma de material + grado + URL + fecha.
3. Registrar rangos en `range`; NO calcular medias automáticas para secado o presión.
4. Diferenciar MFR (masa) y MVR (volumen). **MFR bajo 21.6 kg no se compara con MFR bajo 2.16 kg**.
5. No confundir temperatura de fusión DSC con temperatura recomendada de procesamiento.
6. Densidad sólida, aparente de gránulos/polvo y fundida son propiedades distintas; jamás intercambiarlas.
7. Propiedades adicionales mecánicas/ópticas entran en `additional_properties` con condiciones; no alimentan los motores salvo revisión formal de ecuaciones.
8. Los campos no publicados siguen como `null`. Permitir datos propios únicamente con su trazabilidad.

## Inventario y avance por grado

| Familia | Material/grado | Propiedades registradas | Fuente |
|---|---|---:|---|
| HDPE | DOW 12450N (Inicial (pendiente revalidación)) | 2 | [Ficha de origen](https://www.dow.com/en-us/pdp.dow-12450n-high-density-polyethylene-resin.47054z.html) |
| HDPE | DOW 08262B (Revisión parcial) | 3 | [Ficha de origen](https://www.dow.com/en-us/pdp.dow-08262b-high-density-polyethylene-resin.82162z.html) |
| HDPE | DOW HDPE LP 8000 (Revisión parcial) | 3 | [Ficha de origen](https://www.dow.com/en-us/pdp.dow-hdpe-lp-8000-high-density-polyethylene-resin.359059z.html) |
| HDPE | DOW HDPE NG6997 (Revisión parcial) | 3 | [Ficha de origen](https://www.dow.com/en-us/pdp.dow-hdpe-ng6997-high-density-polyethylene-resin.119863z.html) |
| HDPE | DOW 05962B (Revisión parcial) | 2 | [Ficha de origen](https://www.dow.com/en-us/pdp.dow-05962b-high-density-polyethylene-resin.64720z.html) |
| HDPE | DOW DMDA-8007 NT 7 (Revisión parcial) | 3 | [Ficha de origen](https://www.dow.com/en-us/pdp.dow-dmda-8007-nt-7-high-density-polyethylene-resin.92941z.html) |
| HDPE | DOW DGDA-5004 NT 7 (Revisión parcial) | 6 | [Ficha de origen](https://www.dow.com/en-us/pdp.dow-dgda-5004-nt-7-high-density-polyethylene-resin.92904z.html) |
| HDPE | DOW HDPE LP 8000 HD (Revisión parcial) | 3 | [Ficha de origen](https://www.dow.com/en-us/pdp.dow-hdpe-lp-8000-hd-high-density-polyethylene-resin.458736z.html) |
| HDPE | DOW HDPE DGDA-2484 NT (Revisión parcial) | 3 | [Ficha de origen](https://www.dow.com/en-us/pdp.dow-hdpe-dgda-2484-nt-high-density-polyethylene-resin.65261z.html) |
| HDPE | DOW HDPE DGDA-2426 NT (Pendiente fuente individual) | 0 | [Ficha de origen](https://www.dow.com/en-us/pdp.dow-hdpe-dgda-2426-nt-bimodal-polyethylene-resin.442623z.html) |
| HDPE | HDPE — Genérico (grado desconocido) (Genérico) | 0 | Sin ficha |
| LLDPE | DOWLEX 2045G (Inicial (pendiente revalidación)) | 3 | [Ficha de origen](https://www.dow.com/en-us/pdp.dowlex-2045g-polyethylene-resin.7650z.html) |
| LLDPE | DOWLEX 2049G (Pendiente fuente individual) | 0 | [Ficha de origen](https://www.dow.com/en-us/pdp.dowlex-2049g-polyethylene-resin.9597z.html) |
| LLDPE | DOWLEX 2045.01G (Revisión parcial) | 4 | [Ficha de origen](https://www.dow.com/en-us/pdp.dowlex-204501g-polyethylene-resin.72471z.html) |
| LLDPE | DOWLEX 2645G (Revisión parcial) | 5 | [Ficha de origen](https://www.dow.com/en-us/pdp.dowlex-2645g-polyethylene-resin.104295z.html) |
| LLDPE | DOWLEX 2045G CIR (Revisión parcial) | 2 | [Ficha de origen](https://www.dow.com/en-us/pdp.dowlex-2045g-cir-polyethylene-resin.515268z.html) |
| LLDPE | DOWLEX 2045.11G (Revisión parcial) | 4 | [Ficha de origen](https://www.dow.com/en-us/pdp.dowlex-204511g-polyethylene-resin.7651z.html) |
| LLDPE | DOWLEX 2045 (Revisión parcial) | 4 | [Ficha de origen](https://www.dow.com/en-us/pdp.dowlex-2045-polyethylene-resin.24764z.html) |
| LLDPE | DOWLEX 2035 (Revisión parcial) | 4 | [Ficha de origen](https://www.dow.com/en-us/pdp.dowlex-2035-polyethylene-resin.24762z.html) |
| LLDPE | DOWLEX 2036.01G (Revisión parcial) | 4 | [Ficha de origen](https://www.dow.com/en-us/pdp.dowlex-203601g-polyethylene-resin.386630z.html) |
| LLDPE | DOWLEX 2047G (Revisión parcial) | 4 | [Ficha de origen](https://www.dow.com/en-us/pdp.dowlex-2047g-polyethylene-resin.10239z.html) |
| LLDPE | LLDPE — Genérico (grado desconocido) (Genérico) | 0 | Sin ficha |
| LDPE | DOW LDPE 132G (Inicial (pendiente revalidación)) | 3 | [Ficha de origen](https://www.dow.com/en-us/pdp.dow-ldpe-132g-low-density-polyethylene-resin.110928z.html) |
| LDPE | DOW LDPE 150E (Revisión parcial) | 3 | [Ficha de origen](https://www.dow.com/en-us/pdp.dow-ldpe-150e-low-density-polyethylene-resin.19527z.html) |
| LDPE | DOW LDPE 7010E (Revisión parcial) | 4 | [Ficha de origen](https://www.dow.com/en-us/pdp.dow-ldpe-7010e-low-density-polyethylene-resin.206483z.html) |
| LDPE | DOW 5004I (Revisión parcial) | 4 | [Ficha de origen](https://www.dow.com/en-us/pdp.dow-5004i-low-density-polyethylene-resin.20679z.html) |
| LDPE | DOW LDPE 219M (Revisión parcial) | 3 | [Ficha de origen](https://www.dow.com/en-us/pdp.dow-ldpe-219m-low-density-polyethylene-resin.80207z.html) |
| LDPE | DOW LDPE 203M (Pendiente fuente individual) | 0 | [Ficha de origen](https://www.dow.com/en-us/pdp.dow-ldpe-203m-low-density-polyethylene-resin.80210z.html) |
| LDPE | DOW LDPE 310LG (Pendiente fuente individual) | 0 | [Ficha de origen](https://www.dow.com/en-us/pdp.dow-ldpe-310lg-low-density-polyethylene-resin.188542z.html) |
| LDPE | DOW LDPE 352E (Pendiente fuente individual) | 0 | [Ficha de origen](https://www.dow.com/en-us/pdp.dow-ldpe-352e-low-density-polyethylene-resin.20966z.html) |
| LDPE | DOW LDPE 220M (Pendiente fuente individual) | 0 | [Ficha de origen](https://www.dow.com/en-us/pdp.dow-ldpe-220m-low-density-polyethylene-resin.80215z.html) |
| LDPE | DOW LDPE 432E (Pendiente fuente individual) | 0 | [Ficha de origen](https://www.dow.com/en-us/pdp.dow-ldpe-432e-low-density-polyethylene-resin.403830z.html) |
| LDPE | LDPE — Genérico (grado desconocido) (Genérico) | 0 | Sin ficha |
| PP | Moplen HP500N (Inicial (pendiente revalidación)) | 2 | [Ficha de origen](https://productsafety.lyondellbasell.com/directrequest?productguid=e8c2d3bb-d271-459f-a439-629a5d85a7da&responsetypeguid=46d59436-1337-4083-ac94-e673e98a4f93&searchhistoryguid=19f453cf-ed90-4ff8-b698-3309ce2d9bf9&searchresultrank=6) |
| PP | Moplen HP501M (Revisión parcial) | 5 | [Ficha de origen](https://www.lyondellbasell.com/en/polymers/p/Moplen-HP501M/1f2b1127-1a74-4107-870e-7d04f3132220) |
| PP | Moplen HP400R (Revisión parcial) | 5 | [Ficha de origen](https://www.lyondellbasell.com/en/polymers/p/Moplen-HP400R/b8c2b2d7-cbc5-46e4-8506-8031418ef728) |
| PP | Moplen HP548R (Pendiente fuente individual) | 0 | [Ficha de origen](https://www.lyondellbasell.com/globalassets/archives/sites/lyb-documents/op/pp/polypropylene-consumer-and-injection-molding.pdf) |
| PP | Moplen HP648T (Pendiente fuente individual) | 0 | [Ficha de origen](https://www.lyondellbasell.com/globalassets/archives/sites/lyb-documents/op/pp/polypropylene-consumer-and-injection-molding.pdf) |
| PP | Moplen RP348R (Pendiente fuente individual) | 0 | [Ficha de origen](https://www.lyondellbasell.com/globalassets/archives/sites/lyb-documents/op/pp/polypropylene-consumer-and-injection-molding.pdf) |
| PP | Moplen RP248R (Pendiente fuente individual) | 0 | [Ficha de origen](https://www.lyondellbasell.com/globalassets/archives/sites/lyb-documents/op/pp/polypropylene-consumer-and-injection-molding.pdf) |
| PP | Moplen RP398T (Pendiente fuente individual) | 0 | [Ficha de origen](https://www.lyondellbasell.com/globalassets/archives/sites/lyb-documents/op/pp/polypropylene-consumer-and-injection-molding.pdf) |
| PP | Moplen RP348T HP (Pendiente fuente individual) | 0 | [Ficha de origen](https://www.lyondellbasell.com/globalassets/archives/sites/lyb-documents/op/pp/polypropylene-consumer-and-injection-molding.pdf) |
| PP | Moplen RP248U (Pendiente fuente individual) | 0 | [Ficha de origen](https://www.lyondellbasell.com/globalassets/archives/sites/lyb-documents/op/pp/polypropylene-consumer-and-injection-molding.pdf) |
| PP | PP — Genérico (grado desconocido) (Genérico) | 0 | Sin ficha |
| PET | Polyclear Refresh PET 1101 (Inicial (pendiente revalidación)) | 4 | [Ficha de origen](https://www.indoramaventures.com/storage/downloads/product/pet/bottle-sheet/Polyclear-%C2%AE-Refresh-PET-1101-Rev-16.pdf) |
| PET | Polyclear PET T-94G (Pendiente fuente individual) | 0 | [Ficha de origen](https://www.indoramaventures.com/en/our-products/pet) |
| PET | Polyclear Preserve PET 2201 (Pendiente fuente individual) | 0 | [Ficha de origen](https://www.indoramaventures.com/en/our-products/pet) |
| PET | Polyclear Preserve PET 2201-D (Pendiente fuente individual) | 0 | [Ficha de origen](https://www.indoramaventures.com/en/our-products/pet) |
| PET | Polyclear Splash PET 3301 (Pendiente fuente individual) | 0 | [Ficha de origen](https://www.indoramaventures.com/en/our-products/pet) |
| PET | Polyclear TITAN PET T94-Ti (Pendiente fuente individual) | 0 | [Ficha de origen](https://www.indoramaventures.com/en/our-products/pet) |
| PET | Preformance PET (Pendiente fuente individual) | 0 | [Ficha de origen](https://www.indoramaventures.com/en/our-products/pet) |
| PET | Polyclear EBM PET 5505 (Pendiente fuente individual) | 0 | [Ficha de origen](https://beta.indoramaventures.com/storage/downloads/specialty-polymers/indorama_ventures_specialtiy_polymers_product_overview_for-website_12.2025.pdf) |
| PET | Polyclear EBM PET 5507 (Pendiente fuente individual) | 0 | [Ficha de origen](https://beta.indoramaventures.com/storage/downloads/specialty-polymers/indorama_ventures_specialtiy_polymers_product_overview_for-website_12.2025.pdf) |
| PET | Polyclear AERO PET 5605 (Pendiente fuente individual) | 0 | [Ficha de origen](https://beta.indoramaventures.com/storage/downloads/specialty-polymers/indorama_ventures_specialtiy_polymers_product_overview_for-website_12.2025.pdf) |
| PET | PET — Genérico (grado desconocido) (Genérico) | 0 | Sin ficha |
| PVC | Westlake PVC 1195 (Inicial (pendiente revalidación)) | 1 | [Ficha de origen](https://www.westlake.com/sites/default/files/1195_1.pdf) |
| PVC | Westlake PVC 2060 (Pendiente fuente individual) | 0 | [Ficha de origen](https://www.westlake.com/pvc-technical-data) |
| PVC | Westlake PVC 1185 (Pendiente fuente individual) | 0 | [Ficha de origen](https://www.westlake.com/pvc-technical-data) |
| PVC | Westlake PVC 5265 (Pendiente fuente individual) | 0 | [Ficha de origen](https://www.westlake.com/pvc-technical-data) |
| PVC | Westlake PVC 2070 (Pendiente fuente individual) | 0 | [Ficha de origen](https://www.westlake.com/pvc-technical-data) |
| PVC | Westlake PVC 5305 (Pendiente fuente individual) | 0 | [Ficha de origen](https://www.westlake.com/pvc-technical-data) |
| PVC | Westlake PVC 2079 (Pendiente fuente individual) | 0 | [Ficha de origen](https://www.westlake.com/pvc-technical-data) |
| PVC | Westlake PVC 2082 (Pendiente fuente individual) | 0 | [Ficha de origen](https://www.westlake.com/pvc-technical-data) |
| PVC | Westlake PVC 1230P (Pendiente fuente individual) | 0 | [Ficha de origen](https://www.westlake.com/pvc-technical-data) |
| PVC | Westlake PVC 1230S (Pendiente fuente individual) | 0 | [Ficha de origen](https://www.westlake.com/pvc-technical-data) |
| PVC | PVC — Genérico (grado desconocido) (Genérico) | 0 | Sin ficha |
| ABS | Terluran GP-22 (Inicial (pendiente revalidación)) | 5 | [Ficha de origen](https://www.ineos-styrolution.com/Product/Terluran_TERLURAN-GP-22_SKU300600120827.html) |
| ABS | Terluran GP-35 (Revisión parcial) | 6 | [Ficha de origen](https://eshop.ineos-styrolution.com/Product/Terluran_Terluran-GP-35_SKU300600120829.html) |
| ABS | Terluran HI-10 (Pendiente fuente individual) | 0 | [Ficha de origen](https://eshop.ineos-styrolution.com/Product/Terluran_Terluran-HI-10_SKU300600120831.html) |
| ABS | Terluran SP-6 (Pendiente fuente individual) | 0 | [Ficha de origen](https://www.ineos-styrolution.com/Product/Terluran_ID30060012_lang_ja_JP.html) |
| ABS | Terluran GP-35 White (Pendiente fuente individual) | 0 | [Ficha de origen](https://www.ineos-styrolution.com/Product/Terluran_ID30060012_lang_ja_JP.html) |
| ABS | Novodur H605 (Pendiente fuente individual) | 0 | [Ficha de origen](https://www.ineos-styrolution.com/Product/Novodur-High-Heat_NOVODUR-H605_SKU302200150405.html) |
| ABS | Novodur HH-106 (Pendiente fuente individual) | 0 | [Ficha de origen](https://www.ineos-styrolution.com/Product/Novodur-ABS-_NOVODUR-HH-106_SKU302200150417.html) |
| ABS | Novodur HH-112 (Pendiente fuente individual) | 0 | [Ficha de origen](https://eshop.ineos-styrolution.com/Product/Novodur-High-Heat_Novodur-HH-112_SKU302200150418.html) |
| ABS | Novodur P2MC (Pendiente fuente individual) | 0 | [Ficha de origen](https://www.ineos-styrolution.com/Product/Novodur_Novodur-P2MC_SKU302100140449.html) |
| ABS | Novodur P2H-AT (Pendiente fuente individual) | 0 | [Ficha de origen](https://eshop.ineos-styrolution.com/Product/Novodur_NOVODUR-P2H-AT_SKU302100140442.html) |
| ABS | ABS — Genérico (grado desconocido) (Genérico) | 0 | Sin ficha |
| PA6 | Ultramid B3S R03 (Inicial (pendiente revalidación)) | 7 | [Ficha de origen](https://download.basf.com/p1/8a8081c57fd4b609017fd64903145168/en/ULTRAMID%253Csup%253E%25C2%25AE%253Csup%253E_B3S_R03) |
| PA6 | Ultramid B3K (Revisión parcial) | 6 | [Ficha de origen](https://download.basf.com/p1/8a8081c57fd4b609017fd659928f6ca1/en/ULTRAMID%25C2%25AE_B3K) |
| PA6 | Ultramid B3L (Pendiente fuente individual) | 0 | [Ficha de origen](https://download.basf.com/p1/8a8081c57fd4b609017fdf6c58512210/en/Ultramid%3Csup%3E%C2%AE%3Csup%3E_%28PA%29_%E2%80%92_Product_Range) |
| PA6 | Ultramid B3S (Pendiente fuente individual) | 0 | [Ficha de origen](https://download.basf.com/p1/8a8081c57fd4b609017fdf6c58512210/en/Ultramid%3Csup%3E%C2%AE%3Csup%3E_%28PA%29_%E2%80%92_Product_Range) |
| PA6 | Ultramid B3Z2 (Pendiente fuente individual) | 0 | [Ficha de origen](https://download.basf.com/p1/8a8081c57fd4b609017fdf6c58512210/en/Ultramid%3Csup%3E%C2%AE%3Csup%3E_%28PA%29_%E2%80%92_Product_Range) |
| PA6 | Ultramid B3EG6 (Pendiente fuente individual) | 0 | [Ficha de origen](https://download.basf.com/p1/8a8081c57fd4b609017fdf6c58512210/en/Ultramid%3Csup%3E%C2%AE%3Csup%3E_%28PA%29_%E2%80%92_Product_Range) |
| PA6 | Ultramid B3U30G6 (Pendiente fuente individual) | 0 | [Ficha de origen](https://plastics-rubber.basf.com/northamerica/en/performance_polymers/industries/pp_powertools) |
| PA6 | Ultramid B3U50G6 (Pendiente fuente individual) | 0 | [Ficha de origen](https://plastics-rubber.basf.com/northamerica/en/performance_polymers/industries/pp_powertools) |
| PA6 | Ultramid B3U42G6 (Pendiente fuente individual) | 0 | [Ficha de origen](https://plastics-rubber.basf.com/northamerica/en/performance_polymers/industries/pp_powertools) |
| PA6 | Ultramid B3ZG6 (Pendiente fuente individual) | 0 | [Ficha de origen](https://plastics-rubber.basf.com/northamerica/en/performance_polymers/industries/pp_powertools) |
| PA6 | PA6 — Genérico (grado desconocido) (Genérico) | 0 | Sin ficha |
| PC | Makrolon 2405 (Inicial (pendiente revalidación)) | 7 | [Ficha de origen](https://solutions.covestro.com/en/products/makrolon/makrolon-2405_000000000000945088) |
| PC | Makrolon 2407 (Revisión parcial) | 5 | [Ficha de origen](https://solutions.covestro.com/en/products/makrolon/makrolon-2407_000000000086286874) |
| PC | Makrolon 2805 (Revisión parcial) | 5 | [Ficha de origen](https://solutions.covestro.com/en/products/makrolon/makrolon-2805_000000000057534382) |
| PC | Makrolon 2807 (Pendiente fuente individual) | 0 | [Ficha de origen](https://solutions.covestro.com/-/media/covestro/solution-center/whitepapers/marking-products-made-of-technical-thermoplastics.pdf) |
| PC | Makrolon 2856 (Pendiente fuente individual) | 0 | [Ficha de origen](https://solutions.covestro.com/-/media/covestro/solution-center/whitepapers/marking-products-made-of-technical-thermoplastics.pdf) |
| PC | Makrolon 2858 (Pendiente fuente individual) | 0 | [Ficha de origen](https://solutions.covestro.com/-/media/covestro/solution-center/whitepapers/marking-products-made-of-technical-thermoplastics.pdf) |
| PC | Makrolon 3105 (Pendiente fuente individual) | 0 | [Ficha de origen](https://solutions.covestro.com/-/media/covestro/solution-center/whitepapers/marking-products-made-of-technical-thermoplastics.pdf) |
| PC | Makrolon 3106 (Pendiente fuente individual) | 0 | [Ficha de origen](https://solutions.covestro.com/-/media/covestro/solution-center/whitepapers/marking-products-made-of-technical-thermoplastics.pdf) |
| PC | Makrolon 3107 (Pendiente fuente individual) | 0 | [Ficha de origen](https://solutions.covestro.com/-/media/covestro/solution-center/whitepapers/marking-products-made-of-technical-thermoplastics.pdf) |
| PC | Makrolon 3108 (Pendiente fuente individual) | 0 | [Ficha de origen](https://solutions.covestro.com/-/media/covestro/solution-center/whitepapers/marking-products-made-of-technical-thermoplastics.pdf) |
| PC | PC — Genérico (grado desconocido) (Genérico) | 0 | Sin ficha |

## Funciones de interfaz previstas

- **Búsqueda:** texto por familia, fabricante, grado y SKU; filtro por familia, fabricante y disponibilidad de propiedades.
- **Comparación de resultados:** dos cálculos del mismo proceso, guardados con las condiciones originales; métricas idénticas y unidades compatibles, diferencias absolutas y relativas; ausencias como —.
- **Exportación:** comparaciones en CSV compatible con Excel, JSON técnico con entradas y referencias, e impresión / Guardar como PDF. CSV no es XLSX nativo.
- Futuras etapas: comparar propiedades de grados **solo** con métodos/condiciones de prueba equivalentes, registrar versiones de fichas por fecha y lote, publicar PDFs de fabricante donde su licencia lo permita (por defecto, solo enlazar).

## Para completar las restantes fuentes

Priorizar: (1) Dow LDPE restantes y PE pendientes; (2) LyondellBasell PP; (3) Covestro PC; (4) BASF PA6; (5) INEOS ABS; (6) Indorama PET; (7) Westlake PVC, separando resinas en polvo y compuestos.

No reutilizar temperaturas ni humedades de otros grados solo por pertenecer a la misma familia.
