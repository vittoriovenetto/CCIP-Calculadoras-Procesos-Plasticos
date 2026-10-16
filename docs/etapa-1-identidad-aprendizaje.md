# Etapa 1 — identidad visual y aprendizaje

Base funcional auditada: `feature/historial-nombres-comparacion-limpiar`, PR #9, commit `83359612fa7ca5b862ea25f01fabdacbb03c3ef7`. Rama: `feature/etapa-1-identidad-aprendizaje`. Ramas y nueve PR abiertos contrastados al comenzar, el 16/10/2026 (America/Santo_Domingo); no había una base funcional posterior. `main` solo contiene README y no se utilizó como base de desarrollo.

## Alcance implementado

| Punto del plan | Resultado | Archivos |
| --- | --- | --- |
| 6 · Cabecera | CCIP conservado a la izquierda, divisor vertical y logo comercial oficial INTEC a su derecha. Idioma y estado experimental conservados. Cabecera responsive compartida con la ruta histórica de fórmulas | `index.html`, `formulas.html`, `src/styles.css`, `src/assets/logo-intec-comercial.png` |
| 7 · Rótulo | `CCIP · INTEC · Procesos 1: inyección`, localizado en inglés, visible también en móvil | `index.html`, `src/i18n.js` |
| 8 · Título | H1 exacto `Calculadora de procesos de transformación termoplásticos`; pestaña y traducción inglesa coherentes. Se conserva el degradado institucional | `index.html`, `src/styles.css`, `src/i18n.js` |
| 9 · Manual | Botón visible abre el diálogo nativo con «Manual de uso en preparación». Cierre por botón y Escape, foco contenido y restaurado al botón. Sin manual inventado ni enlace falso | `index.html`, `src/manual-dialog.js`, `src/styles.css`, `src/i18n.js` |
| 13 · Créditos | Texto académico original conservado, línea divisoria y seis nombres centrados en el orden y ortografía suministrados; los cinco últimos en negrita discreta. Nombres propios sin traducción | `index.html`, `formulas.html`, `src/styles.css` |
| 14 · Aprendizaje | Eliminada exclusivamente la fila de enlaces de proceso que duplicaba el selector. Se mantienen selectores proceso/nivel, 42 explicaciones, índice, acordeones, ejemplos, enlaces profundos, retorno y siete botones de la calculadora | `src/formulas-index.js`, `formulas.html` |

El cambio de `formulas.html` es necesario para eliminar también la navegación duplicada de la ruta histórica, conservar sus enlaces y mantener una cabecera/pie coherentes. El módulo nuevo `manual-dialog.js` aísla los controles del mensaje del manual: `src/app.js` y la lógica de cálculo quedan intactos. El workflow solo incorpora la rama y base del PR a la validación existente; no añade despliegues.

## Procedencia y uso del logo INTEC

Se descargó de [la página oficial](https://identidad.intec.edu.do/manual-de-uso/logo) el archivo [INTEC_LOGO_COMERCIAL_FULL_RGB.png](https://identidad.intec.edu.do/images/descargas/INTEC_LOGO_COMERCIAL_FULL_RGB.png). Su contenido es **idéntico byte a byte** al PNG del [ZIP comercial Full color](https://identidad.intec.edu.do/images/descargas/INTEC%20Logo%20Comercial%20-%20Full%20color.zip).

- Archivo original RGBA: 801 × 900 px, SHA-256 `0f87ef7f0cc6469c4ce86912340207552f90f0c7b6982e87a63dc4adfd675de8`.
- Se conserva el contorno blanco y la transparencia originales. No se redibuja, genera, recorta, recolorea ni deforma.
- Manual: ancho mínimo digital 50 px y móvil 75 px; protección mínima 2X alrededor, donde X es el ancho del tronco de la i. Se usan 104 px de lienzo en escritorio y 90 px en móvil. Incluso el ancho visible de la marca (668/801 del lienzo) supera 75 px en móvil.
- Padding exterior de 16 px en escritorio y 12 px en móvil: supera por sí solo 2X a esos tamaños, además de los márgenes transparentes originales. El divisor queda fuera de esa protección.
- Nombre institucional conservado como `Instituto Tecnológico de Santo Domingo (INTEC)`, incluso en inglés, según el manual.

[Metadatos de procedencia y reglas](fuentes/logo-intec-comercial.json).

## Integridad y exclusiones

No se modifican los siete modelos, motor, esquema, unidades, catálogo, secado, maquinaria, historial, comparación, materiales propios ni versiones anteriores. Se comprobaron los bytes de los archivos protegidos contra el SHA de partida: [manifiesto SHA-256](capturas/etapa-1/integridad.json). No se inició ninguna otra etapa.

No se publica ni fusiona: `main` permanece en `423c04b1710f8f009c811c893873184d363f1b66`; `gh-pages` en `3f4a4f5893fa96864292edf5d69f2412525908ad`; la web conserva `source_commit: 83359612fa7ca5b862ea25f01fabdacbb03c3ef7`.

## Pruebas

- `npm test`: **550 aprobadas**, cero fallidas u omitidas (549 previas + integridad del logo oficial).
- `python3 tests/browser_smoke.py`: **40 aprobadas**, cero fallidas u omitidas. Incluye títulos, diálogo, créditos y cabecera con logo original; 135 estados de cálculo de siete procesos/variantes en tres niveles, 73 perfiles y 27 ciclos ES/EN/ES.
- Las pruebas de Etapa 1 recorren ambos idiomas y 360/390/768/1024/1440 px: ausencia de desbordamiento, imágenes cargadas, proporciones, mínimos, alineación, separación de controles, foco del manual y conservación del estado de aprendizaje/caso.
- Se verifican las 42 explicaciones, alternativas e índice, y las rutas históricas/deep links de fórmulas.
- Construcción y prueba de caché del artefacto se registran antes de entregar el PR, sin publicación.

[Registro Node](capturas/etapa-1/node-tests.txt) · [Registro Chromium](capturas/etapa-1/browser-tests.txt).

Se detectó al probar el diálogo que Tab podía mover el foco al navegador cuando solo había un control; se añadió manejo de Tab/Shift+Tab para mantener el foco en Cerrar. La regresión comprueba apertura por teclado, cierre por botón/Escape y retorno al botón en ambos idiomas y cinco anchos.

## Evidencia visual

[28 capturas antes/después](capturas/etapa-1/README.md): calculadora en ES/EN a 360/390/768/1024/1440 px, y aprendizaje en ES/EN a 390/1440 px. Las imágenes «antes» se tomaron sobre la base 8335961 antes de modificar los archivos. Las imágenes «después» reflejan la cabecera final con logo oficial.

## Límites y pendientes

- El manual de uso real sigue en preparación, tal como se solicitó; el diálogo es informativo.
- Las pruebas de navegador usan Chromium y tamaños simulados. Safari/iOS, Firefox y dispositivos físicos no se probaron.
- Los modelos y propiedades conservan sus límites técnicos previos; esta etapa visual no certifica resultados industriales.
- No quedan pendientes de los seis cambios visuales dentro del alcance descrito. La CI del PR repite las suites sobre esta rama; su resultado se consulta por separado de los registros locales.
