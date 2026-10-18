# Rediseño UX de bibliotecas y controles del caso

Rama de revisión: `feature/ux-bibliotecas-materiales-maquinaria`. Base: Etapa 7 `289ebb020dbd6cfdc1f8cf7da4e712a5148560ec`, con CI aprobada en la ejecución `39071350036`, que incorpora las etapas 5 y 6. Se conserva el trabajo funcional del ajuste anterior y se sustituye su interpretación de la navegación: **no existe un elemento «Calculadora» en el menú**, ni siquiera oculto o deshabilitado.

## Cinco cambios

1. **Material del caso:** acción secundaria con «+», contador y editor existente debajo de Grado comercial. Tres columnas en escritorio, selectores apilados en móvil. El formulario abre a todo el ancho, conserva el mismo nodo/listeners y mantiene borradores al cambiar idioma o vista. Crear, editar, importar o eliminar actualiza el contador y el catálogo seleccionable, también al volver desde la biblioteca.
2. **Maquinaria de referencia opcional:** título y dos selectores compactos, sin párrafos documentales ni detalles abiertos por defecto. Con selección aparecen identidad, estado de aplicación, Ver ficha técnica, Cambiar máquina y Quitar selección. Las condiciones de comparación y el origen se consultan bajo demanda. Costos conserva su reutilización explícita del historial en un desplegable.
3. **Precarga automática:** seleccionar una configuración concreta usa las reglas existentes de `autofill_fields`, proceso, unidad y valor documentado. Solo rellena huecos compatibles; no sustituye entradas manuales. Al cambiar o quitar la máquina retira únicamente la precarga anterior que conserve su valor y origen automáticos. No infiere volumen a partir de masa ABS, rendimiento desde RPM, consumo desde potencia instalada ni extremos de serie. Los rendimientos condicionados mantienen sus controles específicos de material/condiciones.
4. **Navegación:** Materiales, Maquinaria y Aprendizaje son las únicas secciones independientes del menú. El logo y los retornos dentro del contenido llevan al caso activo. Seleccionar un proceso abre su cálculo. Se conservan Atrás/Adelante, URLs de proceso/nivel, idioma y formularios. Consultar una ficha lleva el foco a su encabezado; usarla lleva al módulo correcto.
5. **Maquinaria:** biblioteca de los mismos 25 registros, con seis filtros, búsqueda parcial sin distinción de mayúsculas/acentos, tarjetas, fichas agrupadas, fuentes, advertencias y comparación de dos a cuatro equipos. Las prioridades Moiron M2-I y XH-430B-25 permanecen separadas de sus variantes. PDF, JSON y Excel reutilizan los exportadores existentes.

## Arquitectura y datos

| Módulo | Responsabilidad |
|---|---|
| `src/app.js` | Rutas, vistas, sesiones del caso e integración con historial/editor |
| `src/materials-view.js` | Acceso al editor bajo Grado comercial y host a todo el ancho |
| `src/material-explorer-view.js` | Retorno del único editor a su host dentro del caso |
| `src/machines.js` | Selección, precarga, procedencia, restauración y comparación del caso |
| `src/machines-view.js` | Selector compacto y etiquetas técnicas compartidas |
| `src/machine-explorer-data.js` | Búsqueda, filtros, destacados y comparabilidad documental |
| `src/machine-explorer-view.js` | Biblioteca, fichas, selección/comparación e imágenes autorizadas |
| `src/machine-report.js` | Reportes documentales mediante PDF/Excel/JSON existentes |
| `src/case-draft.js` | Borrador de trabajo por pestaña, separado del historial guardado |
| `src/data/machine-images.v1.json` | Metadatos de medios, identidad y permisos; no especificaciones duplicadas |

El selector y la biblioteca leen el mismo `machineCatalog`, validado desde `src/data/machines.v1.json`. La biblioteca no mantiene otra copia de especificaciones ni otro estado de selección del caso. Su selección de fichas y de equipos para comparar es exclusivamente de consulta.

## Rutas

- Principal: `?process=inyeccion&level=advanced`.
- Referencia del caso: `?process=pelicula&level=technical&machine=xihua-xh-430b-25`.
- Biblioteca: `?view=machines`.
- Moiron: `?view=machines&machine=moiron-m2-i`.
- XH monocapa: `?view=machines&machine=xihua-xh-430b-25`.
- Materiales y Aprendizaje conservan `?view=materials` y `?view=learning`, incluidos sus enlaces específicos.

«Usar en calculadora» abre el proceso del registro: XH en Película soplada y Moiron en Inyección. Conserva idioma y entradas manuales de la sesión de destino. El enlace del resumen vuelve a la ficha y el historial ofrece «Ficha actual de maquinaria»: consultar el catálogo actual no altera la ficha incluida en un cálculo guardado.

Aprendizaje abre todos sus niveles desde el menú; solo un enlace que declara un proceso o nivel aplica ese filtro. Así se conserva el comportamiento anterior y el caso activo sigue disponible al volver.

## Estados, trazabilidad y persistencia

- `machine.confirmed` conserva su nombre por compatibilidad histórica y representa activación de la referencia, no una comprobación física. Los snapshots nuevos incluyen `selection_kind: documentary_reference` y `physical_configuration_verified: false`.
- La evaluación nueva distingue `reference_selected: true` de `configuration_confirmed: false` y `physical_configuration_verified: false`. `industrial_approval` permanece falso.
- Las etiquetas visibles hablan de «equipo seleccionado» y «configuración activa»; no afirman una confirmación personal ni una certificación.
- El historial sigue almacenando identidad, variante, parámetros usados/retendidos, orígenes manuales, fuentes, resultados, advertencias y fecha. Restauración y exportación utilizan el snapshot; consultar fichas o cambiar de idioma no recalcula sus resultados.
- `sessionStorage` conserva el borrador de la pestaña al recargar: campos por proceso, referencias seleccionadas, contexto de material, editor sin guardar, filtros y comparación de la biblioteca. Este borrador no escribe en `ccip-calculators-web-v1` ni en los materiales guardados. Se validan entradas al recuperarlo y se reutilizan `restoreMaterial`/`restoreMachine`.
- Si el almacenamiento está bloqueado, dañado o excede el límite del borrador, la calculadora continúa en modo manual. El borrador de pestaña no sustituye la exportación de los casos personales.

## Reglas del comparador

Se presentan identidad, proceso, tecnología, configuración, especificaciones, unidades, condiciones y fuentes. Solo la misma propiedad física de configuraciones concretas, mismo proceso, condiciones compatibles y unidades convertibles se marca como comparable documentalmente. La conversión tf→kN utiliza la función existente y se muestra explícitamente.

Masa y volumen de disparo tienen claves distintas; potencia instalada y consumo también. Rangos de serie, identidad de variante pendiente, intervalos, ausencia de datos, unidades incompatibles o condiciones diferentes permanecen separados. Procesos diferentes generan un aviso. No hay puntuación global, ranking ni recomendación industrial. Un dato ausente se presenta como «No documentado» y nunca como cero.

## Fotografías

Se investigaron las fuentes de los 25 registros y avisos legales, con 22 páginas revisadas. **No se estableció una autorización de redistribución suficiente para incorporar fotografías.** Se usa el recuadro neutral con icono técnico, sin imágenes generadas por IA, fotografías de otras variantes ni hotlinking. La biblioteca sigue siendo funcional.

[Inventario y decisión por equipo](fotografias.md) · [Metadatos y evidencias](fotografias.json). El renderizador de imágenes autorizadas exige identidad, fabricante, titular, fundamento de uso, fecha, fuente, alt ES/EN, ruta local segura y SHA-256; reserva proporción, usa carga diferida y ofrece fallback sin reintentos repetidos al fallar.

## Seguridad de la revisión

La rama nueva se creó desde Etapa 7; no se enviaron cambios a la rama que publica. `validate-web.yml` valida esta rama y el PR contra Etapa 7 con `contents: read`. Se retiró de esta rama el job de publicación; no existen permisos Pages/Contents de escritura ni llamadas al publicador en su workflow. Se mantienen las defensas del publicador existente, que no se ejecutó.

No se modifican modelos matemáticos, el catálogo original de materiales/maquinaria ni V1/versiones/ZIP. `tests/fixtures-ux-integrity.json` fija los hashes del commit base para esas rutas, además de los 145 archivos ya protegidos por la auditoría de Etapa 7.

## Validación y capturas

Resultados y comandos en [validacion.md](validacion.md). Cobertura de UX-01 a UX-20, más enlaces directos, recarga/borradores, fallos de catálogo e imágenes, ES/EN y ocho anchos: 320, 360, 390, 540, 768, 1024, 1440 y 1920 px.

[Capturas reales de Chromium](capturas/README.md). Las imágenes de validación proceden de la aplicación local y no sustituyen fotografías de maquinaria.

## Límites pendientes

Las miniaturas reales requieren una autorización de reutilización y verificación de identidad de variante. WebKit necesita bibliotecas del sistema que faltan en este entorno. Las comparaciones siguen siendo documentales y el envío de aportes sigue sujeto a la activación/revisión existente en la rama predeterminada. Esta entrega no realiza merge ni publicación.
