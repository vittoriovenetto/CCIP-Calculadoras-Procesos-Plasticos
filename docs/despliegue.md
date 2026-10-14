# Publicación en GitHub Pages

La aplicación estática se publica desde `gh-pages`, conservando `main` y la rama de desarrollo. No necesita servidor de aplicaciones, secretos, variables de producción ni compilación de dependencias.

## Artefacto y publicación

Desde un checkout limpio de la versión aprobada:

```sh
npm run deploy:pages
```

`build:pages` copia únicamente `index.html`, `.nojekyll` y los archivos rastreados de `src/` a `dist/`, más un `deployment.json` que identifica commit de origen y versión de biblioteca. No incluye Git, pruebas, capturas, adjuntos, credenciales ni documentación de desarrollo. Rechaza cambios pendientes en los archivos de aplicación y no elimina un directorio `dist` ajeno.

El publicador usa un índice temporal, crea un commit del artefacto y hace un push normal a `gh-pages`, conservando su historia y sin cambiar rama/índice de desarrollo ni forzar actualizaciones. No configura ni activa el servicio Pages: subir la rama por sí solo no demuestra que la web esté publicada.

## Configuración de GitHub necesaria

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
