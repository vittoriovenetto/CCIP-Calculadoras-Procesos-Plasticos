# Publicación y recuperación — Etapa 7

**PUBLICACIÓN BLOQUEADA / NO-GO.** La autorización del usuario ya existe y es suficiente para desplegar una vez aprobados todos los controles. No se requiere otra confirmación genérica; falta acceso técnico verificable.

## Versión previa y respaldo

- Rama previa `gh-pages`: **3f4a4f5893fa96864292edf5d69f2412525908ad**.
- Fuente declarada en su manifest Git: **83359612fa7ca5b862ea25f01fabdacbb03c3ef7**; biblioteca 1.4.0. Esto se leyó desde Git, no de una consulta HTTP exitosa nueva.
- Main inalterado: `423c04b1710f8f009c811c893873184d363f1b66`.
- [Copia exacta de 90 recursos](../../versions/antes-etapa-7-2026-10-17/) y [manifiesto con hashes](../../versions/antes-etapa-7-2026-10-17.json).
- [ZIP del artefacto web anterior](../../downloads/CCIP-Web-antes-etapa-7-2026-10-17.zip). No incluye recursivamente versions/downloads, .git ni datos personales del navegador.
- Etiqueta remota `pages-antes-etapa-7-2026-10-17` apunta al commit de artefacto anterior; no publica una web.
- Las rutas V1/antes-inyección/antes-Lean y sus ZIP originales permanecen sin cambios. Los nuevos enlaces web de respaldo solo estarán disponibles públicamente después de un deploy aprobado.

## Puerta de publicación

| Condición | Estado |
|---|---|
| Siete procesos y tres niveles | Aprobado local |
| 73 identidades originales, 15 formulaciones, 25 máquinas/20 computables | Aprobado integridad y comportamiento |
| Moiron M2-I y XH-430B-25 | Presentes, variantes separadas |
| Referencias numéricas independientes | 13 casos / 79 salidas aprobadas |
| P0/P1 del código identificados | Corregidos |
| Exportaciones, migración, idiomas y tamaños | Aprobados localmente |
| Build, artefacto y caché | Ver salidas reales en pruebas/; validación local |
| Versiones y rollback | Respaldo preparado y hashes íntegros |
| CI del SHA final | **Pendiente de verificación remota; no asumir verde** |
| Configuración real de Pages y versión pública visible | **Pendientes: proxy HTTP 403** |
| Verificación pública posterior | **No ejecutada; no hubo publicación** |

La API y la web pública rechazaron CONNECT con 403 pese a dominios guardados. Git funciona mediante su acceso provisto. El borrador de entorno contiene instalación probada y arranque reproducible; falta revisar/publicar ese borrador en la configuración del entorno para reconciliar el acceso. Esto es publicación del entorno, no de CCIP. No se han eludido restricciones ni solicitado PAT en chat.

## Procedimiento preparado

1. Consultar API de PR/CI/Pages y confirmar `gh-pages / root`, build_type y estado real. Crear/actualizar el PR de Etapa 7 contra Etapa 6, sin duplicarlo ni fusionarlo.
2. Guardar todas las correcciones; obtener `git rev-parse HEAD`. Esperar a que los jobs unit y browser de **ese SHA** finalicen en success. Conservar el JSON de GitHub con run ID, head SHA y jobs; no usar los verdes históricos de Etapa 6.
3. `npm run build:pages`, `python tests/browser_pages_cache.py`, `CCIP_STAGE7_DIST=1 python tests/browser_stage7.py`. Repetir el build y contrastar `artifact-integrity.json` para comprobar reproducibilidad. El manifiesto cubre todos los archivos, y `deployment.json.source_commit` debe coincidir con el SHA aprobado.
4. Completar un informe JSON GO fuera del checkout, con `source_commit`, `artifact_tree_sha256`, `previous_gh_pages_commit`, las 16 condiciones booleanas exigidas por `validateReleaseGate` y el objeto `ci` (`head_sha`, `run_id`, `conclusion`, jobs unit/browser). Solo asignar true con evidencia; la plantilla NO-GO no sirve para publicar.
5. Contrastar `git ls-remote origin refs/heads/gh-pages` con el SHA respaldado. Si avanzó, detener y preparar respaldo/contraste nuevos; no sobrescribir una ruta histórica.
6. Publicar con el mecanismo existente, definiendo `CCIP_EXPECTED_GH_PAGES_SHA` y `CCIP_RELEASE_GO_FILE`: `npm run deploy:pages`. El comando reconstruye y valida procedencia/manifiesto/gate/históricos/assets; realiza un push normal con el padre esperado. No modifica main ni hace merge de PR.
7. Esperar a Pages. Verificar HTTPS real y deployment.json exacto, hashes de recursos, catálogos, siete procesos y niveles, Materiales/Aprendizaje, historial/comparación, tres descargas reales, ES/EN/ES y móvil 360/390. Puede usarse `CCIP_STAGE7_URL=https://vittoriovenetto.github.io/CCIP-Calculadoras-Procesos-Plasticos/ python tests/browser_stage7.py`; no desactivar TLS. Comprobar además enlaces/ZIP históricos y el estado de Pages.
8. Registrar hora America/Santo_Domingo, SHA fuente, SHA gh-pages, ejecución de Pages y resultados públicos. Solo entonces cambiar el estado a publicado y actualizar documentación general. Ningún push aceptado por sí solo acredita una web funcional.

URL de destino (no prueba de una nueva publicación): https://vittoriovenetto.github.io/CCIP-Calculadoras-Procesos-Plasticos/

## Rollback sin force

Referencia estable: SHA anterior arriba, manifest y ZIP. Para recuperar tras un fallo grave, primero registrar incidencias y el SHA remoto fallido. Preparar un directorio temporal con el árbol web estable anterior y **añadir sin alterar** todas las rutas versions/, downloads/ y assets/ del remoto fallido. La unión conserva archivos históricos añadidos y permite que HTML en caché siga cargando ambos árboles. Ante colisión de bytes, detener y revisar.

Verificar hashes del árbol estable y de los históricos conservados. Construir un árbol Git mediante índice temporal, crear un commit con `git commit-tree` cuyo padre sea el SHA remoto fallido comprobado y subirlo con push normal a gh-pages. Si la rama avanzó, detener; nunca usar force/reset de historial. Esperar Pages y repetir las pruebas públicas. El deployment.json estable conserva el source_commit anterior; registrar que se trata de una recuperación, no de una Etapa 7 aprobada.

Este procedimiento está preparado, no ejecutado contra la web. Una copia web no respalda localStorage: exportar JSON de los casos personales antes de alternar versiones.

## Ensayo local del candidato

Código probado del artefacto: `057ab4ab921a173cb3f95de5bb626771222b4062`. Dos builds sucesivos produjeron exactamente el mismo manifiesto; árbol SHA-256 `d23bc4137b5f6ceeebff317a6a9e0bfb53b13129b82a46f250a911e9b17c6506`. Se ejecutaron caché y nueve tests sobre este `dist/`. Los commits documentales posteriores no son una aprobación de CI ni autorizan reutilizar un GO de otro SHA: para publicar se reconstruye el HEAD exacto después de su CI.

Prueba negativa del publicador: sin informe GO rechaza la operación antes de crear commit temporal o realizar push; se registró el rechazo esperado en `pruebas/puerta-no-go.json`. No se intentó publicación real.
