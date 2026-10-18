# Capturas reales de validación

26 PNG obtenidos con Playwright/Chromium desde la aplicación funcional local. No son diseños simulados ni imágenes generadas por IA. Cada enlace abre la captura a su resolución original; los anchos representan el viewport y la altura es 1000 px.

La matriz automatizada comprueba 320, 360, 390, 540, 768, 1024, 1440 y 1920 px, en ES/EN. Se conservan capturas representativas de 390 y 1440 px; la comparación usa desplazamiento horizontal dentro de la tabla, sin desbordar la página.

| Estado | ES 390 | ES 1440 | EN 390 | EN 1440 |
|---|---|---|---|---|
| Material del caso, maquinaria sin selección y menú de tres secciones | [PNG](ux-calculator-compact-es-390.png) | [PNG](ux-calculator-compact-es-1440.png) | [PNG](ux-calculator-compact-en-390.png) | [PNG](ux-calculator-compact-en-1440.png) |
| Editor de material abierto a todo el ancho | [PNG](ux-material-editor-es-390.png) | [PNG](ux-material-editor-es-1440.png) | [PNG](ux-material-editor-en-390.png) | [PNG](ux-material-editor-en-1440.png) |
| Biblioteca de maquinaria y tarjetas con fallback | [PNG](ux-machinery-library-es-390.png) | [PNG](ux-machinery-library-es-1440.png) | [PNG](ux-machinery-library-en-390.png) | [PNG](ux-machinery-library-en-1440.png) |
| Ficha de Moiron M2-I | [PNG](ux-moiron-ficha-es-390.png) | [PNG](ux-moiron-ficha-es-1440.png) | [PNG](ux-moiron-ficha-en-390.png) | [PNG](ux-moiron-ficha-en-1440.png) |
| Ficha de XH-430B-25 monocapa | [PNG](ux-xh-ficha-es-390.png) | [PNG](ux-xh-ficha-es-1440.png) | [PNG](ux-xh-ficha-en-390.png) | [PNG](ux-xh-ficha-en-1440.png) |
| Comparación documental M2-I / M2-II | [PNG](ux-machine-comparison-es-390.png) | [PNG](ux-machine-comparison-es-1440.png) | [PNG](ux-machine-comparison-en-390.png) | [PNG](ux-machine-comparison-en-1440.png) |

Selección ARBURG con precarga automática, sin checkbox: [móvil 390](ux-automatic-machine-es-390.png) · [escritorio 1440](ux-automatic-machine-es-1440.png).

## Correspondencia con las 12 vistas solicitadas

1. Acción bajo Grado comercial: Calculadora compacta.
2. Editor correctamente dimensionado: Editor abierto.
3. Maquinaria sin selección: Calculadora compacta.
4. Selección con precarga automática: ARBURG, dos anchos.
5. Menú sin Calculadora: Calculadora compacta y biblioteca.
6. Materiales, Maquinaria y Aprendizaje: menú visible en esas vistas.
7. Biblioteca: Maquinaria, cuatro combinaciones ES/EN y móvil/escritorio.
8. Tarjetas/fotografías: se documenta fallback; ninguna foto obtuvo autorización suficiente de redistribución. Véase [inventario](../fotografias.md).
9. Moiron M2-I: ficha en ambos idiomas y anchos.
10. XH-430B-25: ficha monocapa en ambos idiomas y anchos.
11. Comparador: M2-I / M2-II, ambos idiomas y anchos.
12. Interfaz móvil: columna 390 de la tabla y selección automática móvil.
