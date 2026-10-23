# Manual visual de CCIP integrado

**Estado:** rama de revisión; sin merge ni publicación.

- Botón «Manual de uso»: abre el HTML visual interactivo en un diálogo dentro de la calculadora.
- Manual: `downloads/Manual_Visual_CCIP_Interactivo.html`, 19 capítulos, buscador, selector, galerías y textos desplegables.
- Fotografías: once capturas reales de la aplicación incluidas en `downloads/manual-images/`, obtenidas del commit del PR #17 `f711634ee5444ae69caf7023f65b49635fda2a8a`; no requiere cargar imágenes desde GitHub.
- El diálogo permite cerrar con Escape, pulsar «Cerrar» o abrir la guía completa en otra pestaña.
- El iframe usa `sandbox` sin `allow-same-origin` para aislar los scripts del manual del estado de la calculadora.
- El archivo se carga solamente al abrir el manual por primera vez y no altera el historial del usuario.
- Pruebas: `npm test` y `python tests/browser_manual.py`, incluidas en CI.
- Para aprobar: verificar funcionalidad en escritorio y móvil y después integrar mediante PR contra `feature/ux-bibliotecas-materiales-maquinaria`.

No tocar `main`, `gh-pages` ni versiones históricas.