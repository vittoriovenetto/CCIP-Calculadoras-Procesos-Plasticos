# Publicación en GitHub Pages

Publicación más reciente: [inyección con referencias fundidas, perfil físico y copia de la web anterior — 15/10/2026](despliegue-inyeccion-2026-10-15.md).

La aplicación estática se publica desde `gh-pages`, conservando `main` y la rama de desarrollo. No necesita servidor de aplicaciones, secretos, variables de producción ni compilación de dependencias.

## Despliegue inicial confirmado

GitHub completó correctamente el workflow nativo [pages build and deployment](https://github.com/vittoriovenetto/CCIP-Calculadoras-Procesos-Plasticos/actions/runs/38514593056) al publicar la rama `gh-pages`.

- URL proporcionada por GitHub: https://vittoriovenetto.github.io/CCIP-Calculadoras-Procesos-Plasticos/
- Commit del artefacto: `f8a130f6361f760218ca7a1dbaf1e9880ea53a47`.
- Commit de origen: `5805a8241665a0021e97ed4892f8808fb6ad2026`.
- Biblioteca: `1.2.0`.
- `main` conservó `423c04b1710f8f009c811c893873184d363f1b66`.

Antes de subir, se sirvió `dist/` bajo la subruta del repositorio y se verificaron en Chromium nueve variantes funcionales, los nueve grados, los 24 puntos de la gráfica ABS, cuatro tamaños y ausencia de errores de recursos/JavaScript. Se comprobó también la metadata del artefacto publicado mediante el archivo raw de GitHub.

La respuesta HTTP del sitio Pages no pudo comprobarse directamente desde este entorno por su restricción de red. El éxito indicado es el resultado del servicio de despliegue de GitHub y su enlace de entorno, no una prueba funcional posterior sobre la URL pública.

## Rediseño y V1 conservada — 2026-10-14

GitHub confirmó correctamente el [despliegue del rediseño](https://github.com/vittoriovenetto/CCIP-Calculadoras-Procesos-Plasticos/actions/runs/38524671401), incluido el job de publicación y el enlace de entorno.

- Código de aplicación: `793171cb1c515bfb01a6ecc0a9555aeb59e70e75`.
- Artefacto publicado: `385a72a7c5267293b2fb0bcdcaa8a55442943691` en `gh-pages`.
- Biblioteca: `1.2.0`; ecuaciones, motor y datos sin cambios respecto a la V1 anterior.
- [V1 congelada](https://vittoriovenetto.github.io/CCIP-Calculadoras-Procesos-Plasticos/versions/v1/) y [ZIP de su fuente](https://vittoriovenetto.github.io/CCIP-Calculadoras-Procesos-Plasticos/downloads/CCIP-Web-V1.zip) incluidos en el mismo artefacto.
- Etiqueta `web-v1-2026-10-14` apunta a `7ece24a90d072d61e03762c1505141370483777f` y fue subida al repositorio del usuario.
- `main` sigue en `423c04b1710f8f009c811c893873184d363f1b66`; ningún cambio al original.

Verificación: 326 pruebas Node y 15 pruebas Chromium correctas, más comprobación del artefacto `dist/` bajo una subruta: nueve variantes avanzadas, logo/ayudas a 320/768/1440 px, 24 archivos web V1 con SHA-256 intacto, ZIP íntegro y cálculo de la copia anterior. Los archivos `deployment.json` de la rama publicada se comprobaron mediante raw de GitHub para ambas aplicaciones.

Se conserva la limitación de red indicada arriba: el entorno no permite comprobar la respuesta HTTP pública del dominio Pages. La confirmación de publicación procede del servicio GitHub; la prueba funcional se realizó localmente sobre el artefacto exacto. Este registro de despliegue se añadió posteriormente como documentación, sin cambiar el paquete publicado.

## V1.3 publicada por autorización del usuario — 2026-10-14

GitHub confirmó el [despliegue V1.3](https://github.com/vittoriovenetto/CCIP-Calculadoras-Procesos-Plasticos/actions/runs/38591913209) y el entorno `github-pages` en estado `success`.

- URL: https://vittoriovenetto.github.io/CCIP-Calculadoras-Procesos-Plasticos/
- Código publicado: `824c9cb84a7df9acdc70dd9a200b70d151d9c00b`.
- Artefacto `gh-pages`: `7834287dd53f10b3087359806b8d20f5f835965c`.
- Biblioteca: `1.3.0`, con advertencias y datos pendientes conservados.
- Primera visita en español; la elección posterior ES/EN se recuerda cuando hay almacenamiento disponible.
- Enlaces a V1 y su ZIP retirados de ambas páginas actuales. Los archivos históricos y sus URL directas permanecen disponibles e intactos.
- PR #2 abierto para revisión, sin fusionar; `main` conserva `423c04b1710f8f009c811c893873184d363f1b66`. No se modificó el repositorio original.

Validación del código publicado: 500 pruebas Node y 24 Playwright completas, sin fallos; 135 estados módulo/variante × nivel × pantalla, 162 estados de biblioteca, 99 perfiles y 27 casos de cambio ES/EN/ES. Las ejecuciones [PR](https://github.com/vittoriovenetto/CCIP-Calculadoras-Procesos-Plasticos/actions/runs/38591816963) y [push](https://github.com/vittoriovenetto/CCIP-Calculadoras-Procesos-Plasticos/actions/runs/38591810351) también completaron unit/browser correctamente.

Antes de publicar se sirvió el artefacto exacto bajo una subruta y se verificaron español inicial en calculadoras/fórmulas, siete módulos, 42 lecciones, logo y ausencia de desbordamiento a 390/768/1440 px, V1 funcional, los 24 hashes históricos y ZIP íntegro. Después de publicar, la URL pública respondió HTTP 200: `deployment.json` identifica el código/biblioteca anteriores; `index.html` y `formulas.html` son byte a byte iguales al artefacto, incluyen `lang="es"` y no contienen enlaces históricos. Se comprobaron también los hashes públicos del HTML de V1 y del ZIP. La restricción HTTP documentada en despliegues anteriores ya no afecta a estas peticiones. Chromium directo al dominio público rechazó el certificado del proxy del entorno; no se desactivó TLS. La validación funcional en navegador se hizo localmente sobre el paquete exacto.

La publicación es experimental y fue solicitada expresamente por el usuario. Continúa pendiente la confirmación documental oficial de los 90 grados, las propiedades ausentes y la validación técnica de los modelos. Las capturas y logs se actualizaron en el PR; el commit de documentación posterior no altera el paquete publicado.

## Aprendizaje de fórmulas publicado — 2026-10-14

Tras informar el usuario de que abría la web pero no veía las fórmulas o los cambios recientes, se añadió un apartado visible de aprendizaje y acceso desde cada resultado. La guía filtra por proceso/nivel: técnico muestra 28 explicaciones y avanzado las 42; variables y ejemplos se muestran abiertos. Se versionaron las referencias de entrada JS/CSS y se entregan URLs completas con referencia a esta revisión. Esto facilita solicitar archivos nuevos; no se atribuye sin pruebas el problema inicial a la caché.

- [Workflow de publicación correcto](https://github.com/vittoriovenetto/CCIP-Calculadoras-Procesos-Plasticos/actions/runs/38595704569).
- Fuente: `c53deb29b8124d479c215edd5b65d984cf5708da`.
- Artefacto: `a56ef5d8720fd0557b5f484e0c355ffc1aaf9b30` en `gh-pages`.
- Biblioteca 1.3.0, motor/ecuaciones/materiales y archivos históricos sin cambios.
- 502 pruebas Node correctas; ejecución local completa de 25 pruebas Chromium correcta, más prueba del artefacto exacto para los siete procesos × tres niveles y los 42 enlaces. [Informe y alcance](aprendizaje-formulas.md).
- Validación CI del commit: [PR](https://github.com/vittoriovenetto/CCIP-Calculadoras-Procesos-Plasticos/actions/runs/38595403993) y [push](https://github.com/vittoriovenetto/CCIP-Calculadoras-Procesos-Plasticos/actions/runs/38595395283).
- Verificación pública: `deployment.json` del código anterior, `index.html` y `formulas.html` y todos los 32 archivos `src/` respondieron HTTP 200 y son iguales a `dist/`. Las URLs con filtros técnico/avanzado también respondieron; V1 y ZIP conservaron sus hashes.
- `main` permanece en `423c04b1710f8f009c811c893873184d363f1b66`; PR #2 abierto, sin fusión ni cambios al repositorio original.

[Capturas reales y logs](capturas/aprendizaje/README.md). La validación funcional de navegador se realizó sobre el paquete exacto local; la verificación del dominio público fue HTTP con TLS, conservando la limitación de certificado de Chromium directo indicada anteriormente. Las propiedades ausentes y la validación técnica industrial siguen pendientes. La documentación/capturas posteriores no alteran el artefacto publicado.

## Acceso lateral a Aprender publicado — 2026-10-14

Por petición del usuario, se retira el bloque de aprendizaje del principio del área de cálculo y el enlace duplicado del encabezado. **Aprender · Fórmulas y ejemplos** queda debajo de los siete procesos en el lateral (debajo del menú horizontal en móvil) y abre la guía en otra pestaña. Se conservan sus 42 explicaciones, filtros técnico/avanzado y enlaces desde resultados.

- Fuente: `01e5b8808bbaa135462cfb21d3de1b175565fc56`.
- Artefacto: `cc259753b40d25fdfce14abc02ecd827022917e6` en `gh-pages`, biblioteca 1.3.0.
- [Publicación confirmada](https://github.com/vittoriovenetto/CCIP-Calculadoras-Procesos-Plasticos/actions/runs/38597709605), intento 2. El primer intento falló por HTTP 500 interno de GitHub Pages al crear el despliegue; las anotaciones recomendaron reintentar. Se repitió el trabajo fallido con el mismo paquete y terminó correctamente.
- 502 pruebas Node y cinco pruebas dirigidas de navegador correctas; CI completó unit/browser en ambas ejecuciones del commit: [PR](https://github.com/vittoriovenetto/CCIP-Calculadoras-Procesos-Plasticos/actions/runs/38597515357) y [push](https://github.com/vittoriovenetto/CCIP-Calculadoras-Procesos-Plasticos/actions/runs/38597505213), incluyendo las 25 pruebas de navegador completas.
- Paquete exacto comprobado localmente en 390/768/1440 px: acceso lateral, ausencia del bloque central, página independiente con 42/28 explicaciones, conservación de entradas, siete procesos × tres niveles, español inicial/inglés y ausencia de errores JS/recursos.
- Verificación pública: HTTP 200 para `deployment.json` de la fuente anterior, ambas páginas y los 32 archivos `src/`, iguales al artefacto. HTML principal con acceso lateral y sin bloque central/enlace de encabezado. V1 y ZIP intactos por SHA-256.
- `main` permanece en `423c04b1710f8f009c811c893873184d363f1b66`; PR abierto sin fusionar y repositorio original intacto.

[Capturas del lateral](capturas/lateral/README.md). La documentación posterior no altera el paquete publicado. URL para solicitar esta revisión:

```text
https://vittoriovenetto.github.io/CCIP-Calculadoras-Procesos-Plasticos/?v=20261014-lateral
```

## Título Aprendizaje publicado — 2026-10-14

El título del acceso lateral cambia de «Aprender» a **Aprendizaje**, como pidió el usuario. Traducción inglesa existente: **Learning**. Fuente `e52269f0d2faa87da32b48022727c5c5252fbbc0`, artefacto `dafab9c29fa475583673d06fb1798ff5d028cc7b`. [Workflow correcto](https://github.com/vittoriovenetto/CCIP-Calculadoras-Procesos-Plasticos/actions/runs/38600254553). El paquete se comprobó en Chromium a 320/390/768/1440 px, ambos idiomas y apertura de las 42 lecciones. La URL pública respondió HTTP 200 con el HTML exacto, el título nuevo y el manifest correspondiente. No cambian fórmulas ni funcionalidades. `main` y el repositorio original permanecen intactos.

URL con referencia a esta revisión: https://vittoriovenetto.github.io/CCIP-Calculadoras-Procesos-Plasticos/?v=20261014-aprendizaje

## Artefacto y publicación

Desde un checkout limpio de la versión aprobada:

```sh
npm run deploy:pages
```

`build:pages` copia `index.html`, `formulas.html`, `.nojekyll` y los archivos rastreados de `src/`, `versions/` y `downloads/` a `dist/`, más un `deployment.json` que identifica commit de origen y versión de biblioteca. La web anterior y el ZIP de su fuente se incluyen intencionalmente para conservación. Fuera de ese ZIP no incluye Git, pruebas, capturas, adjuntos, credenciales ni documentación de desarrollo. Rechaza cambios pendientes en los archivos de aplicación y no elimina un directorio `dist` ajeno.

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

Durante los despliegues anteriores, este entorno permitió el push Git pero rechazó la conexión a `api.github.com` y `vittoriovenetto.github.io` con 403 en el túnel de red. Se guardaron ambos dominios como requisitos de red en la configuración del entorno. En la publicación V1.3 sí se comprobó la respuesta HTTP pública y se consultó la API de GitHub con los permisos del entorno. La configuración del entorno y la configuración de GitHub Pages son operaciones distintas.
