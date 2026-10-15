# Publicación de inyección y conservación de la web anterior

El 15/10/2026 (America/Santo_Domingo), el usuario autorizó publicar los cambios del PR #6 y pidió mantener accesible la versión anterior. La publicación usa `gh-pages`; no requiere fusionar `main`. No se modifica el repositorio original de Reymenez. Los enlaces históricos se entregan en el chat y en esta documentación, sin añadirlos al menú de la aplicación.

## Versión anterior conservada

Antes de modificar Pages, la URL pública respondió HTTP 200 con el manifest del código `e52269f0d2faa87da32b48022727c5c5252fbbc0`, biblioteca 1.3.0. Su artefacto publicado es `dafab9c29fa475583673d06fb1798ff5d028cc7b`.

- [Abrir la versión anterior](https://vittoriovenetto.github.io/CCIP-Calculadoras-Procesos-Plasticos/versions/antes-inyeccion-2026-10-15/).
- [Descargar su código fuente completo en ZIP](https://vittoriovenetto.github.io/CCIP-Calculadoras-Procesos-Plasticos/downloads/CCIP-Web-Anterior-2026-10-15.zip).
- Etiqueta Git: `web-antes-inyeccion-2026-10-15`, sobre el commit fuente anterior.
- [Procedencia y hashes SHA-256](../versions/antes-inyeccion-2026-10-15.json): 36 archivos web conservados byte a byte, más huella del ZIP. El ZIP proviene de `git archive` del commit fuente, incluye sus archivos rastreados y no incluye `.git`, credenciales o archivos locales ajenos al repositorio.

La copia web se conserva sin modificar sus enlaces relativos, cálculos, biblioteca o preferencias. Las dos páginas y los archivos de aplicación coinciden con su commit fuente; el `deployment.json` conserva el del artefacto publicado. No se copian recursivamente las otras versiones o descargas dentro de esta nueva URL. La [V1 archivada previamente](https://vittoriovenetto.github.io/CCIP-Calculadoras-Procesos-Plasticos/versions/v1/) y su ZIP se mantienen intactos.

Las aplicaciones comparten origen web y almacenamiento local. Una copia de la aplicación **no respalda los cálculos personales**: exportar JSON antes de alternar versiones si se necesita una copia independiente de los casos.

## Nueva publicación

URL principal: https://vittoriovenetto.github.io/CCIP-Calculadoras-Procesos-Plasticos/?v=20261015-inyeccion-perfil

Incluye el catálogo auditado de 64 grados y 9 perfiles genéricos, referencias fundidas separadas con aceptación explícita/modo verificado y perfil geométrico físico L1/L2/L3 opcional en avanzado. Las referencias de entrada JS/CSS se actualizan para esta revisión. La primera visita continúa en español; se conserva la elección posterior de idioma.

Pruebas del código funcional: **520 Node + 30 navegador**, aprobadas en [CI del PR #6](https://github.com/vittoriovenetto/CCIP-Calculadoras-Procesos-Plasticos/actions/runs/38762179031). La conservación se verifica por hashes, ZIP íntegro y prueba funcional del artefacto que incluye ambas versiones. El resultado de publicación y la comprobación HTTP posterior se registran una vez confirmados.

La publicación sigue siendo experimental. Densidades familiares, formulación real, condiciones pVT y perfil geométrico requieren revisión técnica; publicar no equivale a validación industrial. Véanse [fuentes, fórmulas y limitaciones](inyeccion-densidad-perfil-v1.5.md).

## Publicación y verificación confirmadas

GitHub completó correctamente [pages build and deployment](https://github.com/vittoriovenetto/CCIP-Calculadoras-Procesos-Plasticos/actions/runs/38764714618).

- Fuente publicada: `0c83631180e8c3fcd50a584d6cfad70e8c4a50c0`.
- Artefacto en `gh-pages`: `f069284acadb9f940db11a60615a7fdbdfac0259`.
- Biblioteca actual: 1.4.0, con referencias fundidas separadas de las fichas.
- Comprobación pública: 15/10/2026 a las 11:57, America/Santo_Domingo. **82 recursos HTTP 200**, iguales por SHA-256 al artefacto: páginas/manifest, todos los archivos actuales de `src/`, la copia anterior (excepto el archivo de control oculto `.nojekyll`), su ZIP, el HTML de V1 y su ZIP. [Registro JSON](capturas/inyeccion-v1.5/deployment-public-2026-10-15.json).
- Comprobación local del paquete exacto: 520 pruebas Node aprobadas; nuevo perfil, referencias, historial, ES/EN y anchos 1440/768/390/320 px; copia anterior con 27 casos (9 variantes × 3 pantallas), 42 lecciones y área auxiliar; V1 funcional. Se verificaron los 36 hashes del archivo nuevo, su ZIP descargado y los 24 hashes V1.
- Chromium directo al dominio público rechazó el certificado del proxy del entorno (`ERR_CERT_AUTHORITY_INVALID`). No se desactivó TLS: la validación funcional de navegador fue sobre el artefacto exacto local y la comprobación pública fue HTTP con validación TLS.
- `main` conserva `423c04b1710f8f009c811c893873184d363f1b66`; PR #6 abierto sin fusionar. La etiqueta de la fuente anterior está disponible en el remoto. Ningún cambio al repositorio original.

Esta documentación posterior no altera los archivos publicados ni sustituye su commit de origen declarado en `deployment.json`.
