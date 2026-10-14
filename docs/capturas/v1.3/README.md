# Capturas y resultados V1.3

Capturas reales de Chromium, obtenidas durante las pruebas locales del 2026-10-14. Muestran el código publicado `824c9cb`, sin enlaces históricos en la interfaz; no son maquetas. La confirmación de publicación figura en el [registro](../../despliegue.md).

| Vista | Español | Inglés |
| --- | --- | --- |
| PC, 1440 px | [PC ES](v13-es-1440.png) | [PC EN](v13-en-1440.png) |
| Móvil, 390 px | [Móvil ES](v13-es-390.png) | [Móvil EN](v13-en-390.png) |
| Tablet, 768 px | [Tablet ES](v13-es-768.png) | Ver matriz de pruebas |
| Fórmulas | [Móvil ES](formulas-es-390.png) | [PC EN](formulas-en-1440.png) |

La calculadora muestra inyección técnica con datos sintéticos de `tests/fixtures.js`. La densidad fundida manual **0.8 g/cm³** no se atribuye a un material comercial; la advertencia de trazabilidad queda visible. El catálogo muestra 99 opciones, sin confirmar oficialmente las 90 identidades propuestas.

Se capturó página completa para calculadoras; su altura excede la del viewport. En fórmulas se capturó una vista de pantalla, además de comprobar todas las ecuaciones y paneles. Se probaron también 320 y 1024 px, ambos idiomas, parámetros y fichas desplegadas y controles del editor.

[Salida Node: 500 pruebas](node-tests.txt) · [Salida Playwright: 24 pruebas](browser-tests.txt) · [Informe y pendientes](../../auditoria-v1.3-final.md)

Los dos registros son de la ejecución completa local del código publicado; se comprobaron además español inicial en ambas páginas y disponibilidad directa de V1/ZIP sin enlaces visibles. CI completó ambas suites sobre el mismo commit. Los artefactos de GitHub Actions incluyen capturas de los cinco tamaños y log.
