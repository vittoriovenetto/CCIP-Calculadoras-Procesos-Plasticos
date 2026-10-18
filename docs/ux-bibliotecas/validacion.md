# Validación del rediseño UX

## Alcance y entorno

Revisión independiente basada en Etapa 7 `289ebb020dbd6cfdc1f8cf7da4e712a5148560ec` (CI base: [39071350036](https://github.com/vittoriovenetto/CCIP-Calculadoras-Procesos-Plasticos/actions/runs/39071350036)). Se mantuvo el checkout original y se creó un worktree para `feature/ux-bibliotecas-materiales-maquinaria`. La implementación se validó localmente con Node 24.19.0, Python 3.12.14, Chromium 154.0.8037.57 y Firefox 153.0.

La CI del PR ejecuta Node y todos los scripts de navegador/auditoría sobre el commit de revisión; no contiene el job de publicación. El artefacto `dist/` se genera únicamente para pruebas locales, sin ejecutar `deploy:pages` ni `publish-pages.mjs`.

## Resultados

| Comando | Resultado |
|---|---|
| `npm test` | 719 aprobadas, 0 fallos, 0 omitidas |
| `python tests/browser_smoke.py` | 42 aprobadas; 135 estados, 73 perfiles y 27 casos ES/EN/ES |
| `python tests/browser_stage2.py` | 6 aprobadas; historial y archivos XLSX/PDF reales |
| `python tests/browser_stage3.py` | 10 aprobadas; formulaciones, flujo, evidencia y exportaciones |
| `python tests/browser_stage4.py` | 7 aprobadas; biblioteca, aportes y fichas de materiales |
| `python tests/browser_stage5.py` | 8 aprobadas; secado y persistencia manual |
| `python tests/browser_stage6.py` | 15 aprobadas; maquinaria, variantes, procesos y reutilización en costos |
| `python tests/browser_stage7.py` | 9 aprobadas; 336 estados, referencias independientes e históricos |
| `python tests/browser_machine_explorer.py` | 25 aprobadas; UX-01–UX-25, con repetición enfocada aprobada de UX-18 tras sincronizar fabricante |
| `CCIP_BROWSER=firefox … python tests/browser_machine_explorer.py` | 25 aprobadas; repetición enfocada adicional de UX-18 aprobada |
| `python scripts/validate-numerics-stage7.py` | 13 casos, 79 salidas aprobadas mediante referencia Decimal independiente |
| `node scripts/audit-machine-catalog.mjs --require-complete` | 25 registros, 20 identidades válidas; Moiron y XH conservados |
| `node scripts/audit-stage7.mjs` | 145 archivos protegidos y 73 materiales; sin discrepancias |
| `npm run build:pages` | Aprobado; catálogo 1.5.1, recursos versionados y manifiesto de integridad válido |
| `python tests/browser_pages_cache.py` | Aprobado; 390/768/1440 px y HTML histórico en caché, sin solicitudes a recursos obsoletos ni errores de página |
| `git diff --check` | Sin errores de espacios/conflictos |

El total de navegador en Chromium es **122 casos distintos**, además de las comprobaciones del artefacto/caché; las repeticiones enfocadas no se cuentan como casos adicionales. La matriz nueva recorre **320, 360, 390, 540, 768, 1024, 1440 y 1920 px**, en **ES y EN**, con comprobación de desbordamiento de página. Las tablas técnicas mantienen desplazamiento horizontal local.

## Cobertura UX y evidencia visual

`tests/browser_machine_explorer.py` implementa UX-01–UX-20, siguiendo su numeración en los nombres de los métodos: material y editor (01–03), selector compacto/automático y conservación manual (04–09), navegación sin Calculadora (10–13), búsqueda/filtros/fichas/comparación (14–17), uso en el proceso correcto (18), medios seguros/fallback (19), historial y formatos de exportación (20).

UX-21–UX-25 añaden enlaces directos/recarga y IDs inválidos, matriz visual bilingüe, imagen autorizada sintética dañada, catálogo inaccesible y borradores por pestaña. La prueba de imagen utiliza bytes inválidos y metadatos sintéticos exclusivamente en la ruta interceptada del navegador; no agrega fotografías ni atribuciones ficticias al catálogo de producción. Desplaza el recuadro al viewport para probar la carga diferida también en Firefox.

Se verificaron los PDF/JSON/XLSX generados, con identidad, unidades, fuentes y separación entre equipos. Las pruebas unitarias nuevas fijan hashes de los motores, ambos catálogos, V1 y versiones/ZIP del commit base; cubren comparabilidad dimensional, datos ausentes, condiciones, rangos, variantes, permisos y borradores. Los resultados históricos se conservan mediante snapshots, sin recalcular al navegar o cambiar idioma. UX-18 también conserva un filtro previo ARBURG y comprueba que usar Moiron lo sincroniza con la nueva selección, sin ocultarla en el selector.

Se incluyen **26 [capturas reales de Chromium](capturas/README.md)**: calculadora compacta, editor, biblioteca, fichas prioritarias y comparación, en móvil/escritorio y ES/EN; más dos de selección automática. El índice relaciona las capturas con las doce vistas solicitadas.

## Pruebas ajustadas y motivo

- `tests/machines-stage6.test.js`: selección concreta activa automáticamente las reglas de precarga existentes. Se retiraron pasos de confirmación en los casos positivos y se añadieron verificaciones de cambio/limpieza, preservación manual, rangos/unidades y restauración histórica sin activación implícita. La comparación del secador ya seleccionado se evalúa directamente.
- `tests/browser_stage6.py`: selección automática sin checkbox; la reutilización de costos se abre desde su desplegable compacto. Se conservan controles específicos de material/condiciones para rendimientos condicionados.
- `tests/browser_smoke.py`: abre el editor con su nueva acción bajo Grado, conserva soporte al summary cuando está en la biblioteca y permite elegir motor de navegador. No se retiran pruebas funcionales.
- `tests/browser_stage7.py`: regresa al caso mediante el retorno contextual de Aprendizaje; el elemento de menú Calculadora dejó de existir por requisito expreso.
- `tests/browser_pages_cache.py`: retira confirmaciones obsoletas y añade navegación/ficha XH y descargas JSON/PDF de maquinaria desde el árbol de recursos versionados, junto a los controles anteriores.
- UX-14: la búsqueda `XH430B25` debe encontrar **tres registros distintos** del catálogo existente (monocapa, tricapa y ficha con identidad entre fuentes pendiente). Se comprueba el conjunto exacto de IDs; no se ocultan ni fusionan variantes para obtener solo dos coincidencias.

Durante la integración, G35 detectó que el menú Aprendizaje heredaba indebidamente el nivel del caso y escondía lecciones. Se corrigió la ruta para abrir todos los niveles desde el menú, manteniendo filtros solo en enlaces explícitos; G35 se volvió a ejecutar y se repitió la suite smoke completa. El fallo de la primera ejecución no se cuenta como aprobación ni se relajaron sus expectativas.

## Navegadores y límites comprobados

**Firefox:** 25 casos UX aprobados y UX-18 repetido tras el último ajuste de sincronización. El lanzamiento inicial se bloqueaba al abrir páginas por las restricciones de namespaces/fontconfig del contenedor. Se utilizaron directorios XDG escribibles y la opción de prueba `CCIP_FIREFOX_CONTAINER=1` con `MOZ_DISABLE_CONTENT_SANDBOX=1`, `MOZ_DISABLE_RDD_SANDBOX=1`, `security.sandbox.content.level=0` y renderizado por software. Estos ajustes pertenecen únicamente al proceso local de pruebas, no a la web ni a Chromium/CI. `CCIP_BROWSER=firefox` selecciona ese motor; `PLAYWRIGHT_BROWSERS_PATH` señala su descarga local.

**WebKit:** se descargó el motor pero el lanzamiento no es posible porque faltan `libgtk-4.so.1`, `libgraphene-1.0.so.0`, `libharfbuzz-icu.so.0`, `libmanette-0.2.so.0`, `libhyphen.so.0` y `libGLESv2.so.2`. No se presenta como validado.

**Fotografías:** se revisaron 22 páginas fuente/legales para los 25 registros; ninguna imagen obtuvo autorización de redistribución suficientemente acreditada. Las tarjetas muestran el fallback neutral. [Inventario, identidad y decisión por equipo](fotografias.md) · [evidencias de consulta](fotografias.json).

## Protección de ramas e históricos

No se hizo merge, no se utilizó force push y no se eliminó ninguna versión. Las referencias protegidas se comprobaron frente al estado previo:

| Referencia | SHA conservado |
|---|---|
| `main` | `423c04b1710f8f009c811c893873184d363f1b66` |
| `gh-pages` | `3d15ad024ff414548884f73f5a1388158fc2dd4c` |
| `feature/etapa-7-auditoria-publicacion` | `289ebb020dbd6cfdc1f8cf7da4e712a5148560ec` |

El nuevo PR se dirige a Etapa 7. El PR #16 y la página pública no se modifican por esta entrega.

Resumen legible por máquina: [resultados.json](resultados.json). Los resultados locales reúnen las suites completas y la repetición enfocada tras el último ajuste de fabricante; la CI del PR vuelve a validar el árbol completo del commit final.
