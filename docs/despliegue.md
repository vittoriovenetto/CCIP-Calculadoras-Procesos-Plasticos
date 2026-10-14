# Publicación en GitHub Pages

La aplicación estática se publica desde `gh-pages`, conservando `main` y la rama de desarrollo. No necesita servidor de aplicaciones, secretos, variables de producción ni compilación de dependencias.

## Despliegue confirmado

GitHub completó correctamente el workflow nativo [pages build and deployment](https://github.com/vittoriovenetto/CCIP-Calculadoras-Procesos-Plasticos/actions/runs/38514593056) al publicar la rama `gh-pages`.

- URL proporcionada por GitHub: https://vittoriovenetto.github.io/CCIP-Calculadoras-Procesos-Plasticos/
- Commit del artefacto: `f8a130f6361f760218ca7a1dbaf1e9880ea53a47`.
- Commit de origen: `5805a8241665a0021e97ed4892f8808fb6ad2026`.
- Biblioteca: `1.2.0`.
- `main` conservó `423c04b1710f8f009c811c893873184d363f1b66`.

Antes de subir, se sirvió `dist/` bajo la subruta del repositorio y se verificaron en Chromium nueve variantes funcionales, los nueve grados, los 24 puntos de la gráfica ABS, cuatro tamaños y ausencia de errores de recursos/JavaScript. Se comprobó también la metadata del artefacto publicado mediante el archivo raw de GitHub.

La respuesta HTTP del sitio Pages no pudo comprobarse directamente desde este entorno por su restricción de red. El éxito indicado es el resultado del servicio de despliegue de GitHub y su enlace de entorno, no una prueba funcional posterior sobre la URL pública.

## Artefacto y publicación

Desde un checkout limpio de la versión aprobada:

```sh
npm run deploy:pages
```

`build:pages` copia únicamente `index.html`, `.nojekyll` y los archivos rastreados de `src/` a `dist/`, más un `deployment.json` que identifica commit de origen y versión de biblioteca. No incluye Git, pruebas, capturas, adjuntos, credenciales ni documentación de desarrollo. Rechaza cambios pendientes en los archivos de aplicación y no elimina un directorio `dist` ajeno.

El publicador usa un índice temporal, crea un commit del artefacto y hace un push normal a `gh-pages`, conservando su historia y sin cambiar rama/índice de desarrollo ni forzar actualizaciones. No configura ni activa el servicio Pages: subir la rama por sí solo no demuestra que la web esté publicada.

## Configuración para instalaciones nuevas

En **Settings → Pages → Build and deployment**:

- Source: **Deploy from a branch**.
- Branch: **gh-pages**.
- Folder: **/(root)**.
- **Save**.

Requiere permisos de administrador o mantenedor del repositorio. El servicio de GitHub construye/despliega la rama después de guardar. Si existe una restricción del entorno `github-pages`, debe permitir la rama `gh-pages`. No se añaden workflows personalizados ni se fusiona `main`.

Después del despliegue, verificar el enlace que indique GitHub Pages y que `deployment.json` corresponda al commit publicado. Para el dominio estándar de esta cuenta se espera `https://vittoriovenetto.github.io/CCIP-Calculadoras-Procesos-Plasticos/`; no se afirma que esté activo hasta recibir la respuesta del sitio. Un dominio personalizado debe confirmarse en Settings.

## Estado y limitaciones

Se mantiene la identificación de versión experimental y las limitaciones del modelo. La publicación no equivale a validación industrial; siguen pendientes ensayos, revisión técnica y datos termodinámicos calibrados.

Este entorno permitió el push Git pero rechazó la conexión a `api.github.com` y `vittoriovenetto.github.io` con 403 en el túnel de red. Se guardaron ambos dominios como requisitos de red en la configuración del entorno. Hasta activar ese acceso no se puede administrar Pages ni comprobar su respuesta pública desde aquí. La configuración del entorno y la configuración de GitHub Pages son operaciones distintas.
