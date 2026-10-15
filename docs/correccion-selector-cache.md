# Selector de materiales y caché de publicación

La captura reportada se reproduce cargando el HTML Lean con los módulos y CSS de la publicación anterior: el selector queda vacío y aparece `Cannot set properties of null (setting 'hidden')`. La cabecera también pierde su presentación porque la hoja de estilos anterior no reconoce el contenedor nuevo.

El selector de familia, fabricante y grado no fue eliminado. Se conserva visible sobre los parámetros, con el buscador y la presentación de tarjeta. La corrección de publicación asigna a todo el árbol `src` una ruta `assets/<commit>/src/`: HTML, estilos, módulos importados y catálogo corresponden a la misma revisión. No basta cambiar la URL de `app.js`, porque sus imports relativos podrían seguir cargando módulos antiguos.

La construcción conserva las rutas originales y las versiones archivadas; no modifica fórmulas, propiedades, datos guardados ni los archivos históricos. Para futuras copias de una publicación con esta estructura, se deben conservar también los archivos `assets/` referenciados por su HTML.

Validación: `npm test`, `npm run build:pages` y `python3 tests/browser_pages_cache.py`. Esta última sirve el artefacto y simula archivos antiguos en las rutas anteriores; verifica selector HDPE, densidad automática, tres niveles, navegación de aprendizaje y disposición en móvil/tableta/PC (390/768/1440 px), sin errores de JavaScript ni peticiones a los módulos anteriores.
