# Auditoría final de Etapa 7

**Estado: auditoría local completada; publicación NO-GO.** No se sustituyen controles remotos por tests locales. Fecha: 17/10/2026, America/Santo_Domingo.

## Base e inspección inicial

Se consultaron por Git todas las ramas y refs de PR. Etapa 6 sigue en `f6ae02f`, Etapa 5 en `9db34e2`, Etapa 4 en `51def4b`, Etapa 3 en `7de3816`; las tres últimas son ancestros de Etapa 6. No existía rama/ref de Etapa 7. No se partió de main. Estado API actual de PR/CI/Pages: pendiente por 403, no inferido a partir de refs Git. El verde de la CI anterior de Etapa 6 es evidencia histórica, no aprobación de esta entrega.

Base local: 670 Node y 42 navegador general aprobados antes de editar. El inventario inicial contiene los 25 registros y 20 computables esperados.

## Hallazgos

Nueve hallazgos: siete corregidos (P0: 1; P1: 5; P2: 1) y dos dependencias externas pendientes. No hay errores P0/P1 del código identificados sin corregir; E01 impide cerrar la puerta de publicación. No se detectó necesidad de modificar ecuaciones ni propiedades documentadas.

| ID | Criticidad | Problema inicial | Corrección | Evidencia | Estado final |
|---|---|---|---|---|---|
| F01 | P0 | El publicador no contrastaba los históricos publicados con el nuevo artefacto. | Manifiesto por archivo; rechazo ante pérdida/alteración de versiones y ZIP; puerta GO obligatoria. | stage7-audit.test.js; integridad-base.json; archivo de 90 recursos. | Corregido |
| F02 | P1 | El publicador podía basarse en un gh-pages distinto del que se respaldó. | SHA esperado obligatorio, doble comprobación fetch/remote y push normal. | publish-pages.mjs; contrato documentado y puerta de publicación. | Corregido |
| F03 | P1 | El guardado personal sobrescribía almacenamiento JSON dañado; reproducción: {broken → []. | Se valida el almacenamiento previo y se rechaza la escritura conservando bytes; control de cambio concurrente. | Nuevo test de corrupción/formato futuro/concurrencia; regresión G32/F02. | Corregido |
| F04 | P1 | La calculadora no aplicaba proceso/nivel de URL ni sincronizaba Atrás/Adelante. | Ruta central compartida por desplegable/botones, restauración y navegación de nivel. | J07, navegación de siete procesos y regresión general. | Corregido |
| F05 | P2 | Tres mensajes de contexto/fallo parcial de catálogo quedaban en español al seleccionar inglés. | Traducciones de biblioteca compartida, temperatura inicial y tiempo nominal de ficha; nuevo error de almacenamiento bilingüe. | J02/J05; suite general EN; i18n.js. | Corregido |
| F06 | P1 | Un HTML antiguo conservado en caché podía perder sus imports diferidos al eliminar el árbol assets anterior. | Recuperación de assets archivados sin colisión; conservación obligatoria en publicación. | Nuevo escenario HTML anterior en browser_pages_cache.py; test de colisión inmutable. | Corregido |
| F07 | P1 | Recuperar un histórico ejecutaba el motor, cambiando la vista según el motor vigente aunque no sobrescribiera almacenamiento. | Presentación del snapshot sin cálculo; exportación original hasta acción explícita o edición. Normalización de presentación de datos almacenados y perfil seguro, sin modificar el registro. | J08/J09 y tests de snapshotPresentation; no cambia motores. | Corregido |
| E01 | P1 externo | Proxy rechaza con 403 la API GitHub y Pages, pese a estar los dominios en configuración guardada. | Borrador reproducible guardado; falta aplicar/publicar la configuración del entorno. No se fuerza ni se elude la política. | Consultas fallidas de túnel; Git sí permite leer/push. | Pendiente; bloquea publicar |
| E02 | P2 externo | Automatización de aportes no está activada en la rama predeterminada. | Se conservan definición y mensajes de activación pendiente; preparado para revisión separada. | origin/main sin workflow; user-materials.v1.json; documentación Etapa 4. | Pendiente permitido para la web |

## Matriz de requisitos

| Requisito | Estado inicial | Problema | Corrección / control | Evidencia | Estado final |
|---|---|---|---|---|---|
| 1–4 Base/ramas/PR | Etapa 6 f6ae02f acumulada | API no accesible | Ancestros Git y nueva rama independiente; no merges | Refs Git y commit base | Local aprobado; estado API pendiente |
| 5 Arquitectura | Siete módulos y gates separados | Riesgos de publicación/persistencia | Cambios focalizados; sin reescritura | 145 archivos protegidos, revisión JS/JSON | Aprobado local |
| 6 Validación independiente | Tests del motor existentes | Faltaba nueva referencia de Etapa 7 | Decimal Python 50 dígitos, 13 casos y 79 resultados | validacion-numerica.md | Aprobado |
| 7 Inyección | Motor y L1/L2/L3 existentes | Riesgo de confundir fase/unidades/etapas | Validación independiente masa/volumen/cierre/carrera/perfil | Node, J03, H01–H15 | Aprobado en modelo ideal |
| 8 Extrusión | Lámina/tubo, continuidad | RPM no define producción | Se conservan límites; resultados con pérdidas/residencia/energía | Referencias Decimal y suites | Aprobado |
| 9 Película | BUR/DDR y XH separados | No resolver anchos contradictorios inventando | BUR/DDR independientes y conservación geométrica | Decimal, H06/H10 | Aprobado; incertidumbre explícita |
| 10 Soplado | Cilindro cerrado ideal | Molde no equivale a envase | Separación de demanda de molde | Decimal, H08 | Aprobado dentro del modelo |
| 11 Termoformado | Lámina y herramientas | Nominal/útil y modo BFS distintos | Columnas y modo conservados | Decimal, H12 | Aprobado |
| 12 Secado | Nueve guías verificadas documentalmente | Cp puntual/bulk incompatible no deben usarse | Gates intactos; caudal vacío y 25 °C supuesto | 145 hashes; Etapa 5, J03 | Aprobado |
| 13 Costos | Costo directo parcial | No incorpora OEE/turnos/indirectos | Límite explícito, no consumo desde kW instalados | Decimal, H09 | Aprobado en alcance existente |
| 14 Materiales | 73 IDs (64+9) | Integridad no certifica todas las propiedades | Hashes e identidad; 47 enriquecidos/17 sin más números | audit-stage7.mjs | Aprobado integridad |
| 15 Reciclados | 15 formulaciones, seis sistemas experimentales | No transferir al grado virgen | Proporciones y procedencia conservadas | Etapa 3, integridad | Aprobado |
| 16 Explorador | Búsqueda/fichas/comparación | No convertir desconocido en cero | Regresión íntegra; GP-35 independiente ASTM/ISO | Etapa 4, J05 | Aprobado |
| 17 Usuarios/aportes | Local funcional; Issues inactivo | Almacenamiento dañado y activación remota | Guardado protegido; estados remotos explícitos | Node, G32/F02, catálogo activación | Local aprobado; remoto pendiente |
| 18 Maquinaria | 25 registros/20 computables | Variantes y campos insuficientes | Sin añadir máquinas ni borrar incertidumbres | audit-machine-catalog; 15 H tests | Aprobado documentalmente |
| 19 Historial | Snapshots/migración | No recalcular ni perder desconocidos | Conservación y regresión de todas las operaciones | Node, Etapa 2, H04/H15 | Aprobado |
| 20 Exportaciones | XLSX/PDF/JSON/CSV | Extensión no demuestra archivo válido | Lectores independientes, tipos y no solapamiento | Etapa 2, J04, PDF renderizado | Aprobado |
| 21 Interfaz/accesibilidad | Diseño institucional existente | Añadir 540 y 1920 y rutas reales | 336 estados adicionales; foco/etiquetas, no overflow global | J01/J05/J07 y general | Aprobado Chromium |
| 22 Idiomas | ES/EN, tres mensajes residuales | Mensajes parcialmente sin traducir | Traducciones completas de los casos identificados | J02/J05; EN general y exportaciones | Aprobado en cobertura |
| 23 Seguridad | Validaciones y vendor locales | Pérdida de datos y publicación sin integridad | Guardas nuevas, XSS/fórmulas/JSON/URL probados | seguridad-y-limitaciones.md | Aprobado básico local |
| 24 Tests | 670 Node/88 navegador previos | No copiar resultados anteriores | 700 Node/97 navegador ejecutados aquí | pruebas/ | Aprobado local |
| 25 CI | Workflow anterior activo para etapas previas | Rama nueva no incluida; acceso API bloqueado | Incorporar Etapa 7 y mantener todas las suites | validate-web.yml | Preparado; resultado remoto pendiente |
| 26 Informes | Documentación previa | Faltaba auditoría final acumulada | Esta carpeta, matrices, logs y capturas reales | docs/etapa-7/ | Preparado |
| 27–28 Paquete e históricos | gh-pages 3f4a4f5; fuente 8335961 | Requiere respaldo previo | 90 archivos + ZIP, hashes; assets antiguos conservados | Manifiesto de archivo e integridad | Aprobado local; HTTP pendiente |
| 29 GO/NO-GO | Autorización condicionada | CI/Pages no verificables desde este entorno | Puerta NO-GO, publicador rechaza informe incompleto | publicacion.md; pruebas de gate | NO-GO |
| 30–31 Deploy/verificación pública | Versión anterior permanece publicada | Controles remotos pendientes | No se ejecuta publicación ni se simula éxito | Estado Git gh-pages sin cambios | Bloqueado |
| 32 Rollback | Artefacto previo recuperable | No usar force ni eliminar archivos nuevos | Procedimiento normal con unión de históricos/assets | publicacion.md; respaldo exacto | Preparado; no ejecutado |
| 33 README | Frases obsoletas de 99 perfiles | Descripción no coincidía con biblioteca real | Actualizar inventario y estado sin decir publicado | README principal | Corregido |
| 34–35 Entrega/condiciones | Objetivo publicación final | No permite cerrar con remoto desconocido | Rama y evidencias preparadas; bloqueo explícito | Este informe y entrega en chat | Entrega parcial revisable; publicación pendiente |

## Resultados y límites

Ver [validación funcional](validacion-funcional.md), [referencias numéricas](validacion-numerica.md), [seguridad](seguridad-y-limitaciones.md) y [publicación](publicacion.md). El build/caché y las nueve pruebas de artefacto se comprueban aparte. No se desactivó ninguna prueba para obtener verde. Durante la construcción del runner se corrigieron dos supuestos del propio test: esperar un ID inexistente en el fallback y olvidar `export_metadata` legítimo del JSON. Se conservaron aserciones de cálculo manual y contenido íntegro del snapshot; no se relajaron resultados matemáticos.

La nueva publicación y el PR remoto no se dan por hechos mientras no se verifiquen por API y HTTPS. No se modifica main, no se fusionan PR anteriores y no se toca el repositorio original de Reymenez.

Al introducir la vista conservada, G36 detectó que editar un perfil debía invalidar el snapshot activo. Se corrigió la invalidación por cambio real de ajustes y se añadió J09, manteniendo las aserciones numéricas originales de G36. Toda la regresión volvió a aprobar tras esa corrección: 700 Node y 97 navegador únicos, sin fallos ni omisiones.
