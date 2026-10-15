# Auditoría Lean de diez capturas — para revisión

Solicitud confirmada en el chat el 15/10/2026 (America/Santo_Domingo): **implementar los diez cambios**, incluida la nueva política de referencia fundida automática sin aceptación previa, en una rama y PR **sin publicar**. Esta confirmación sustituye la regla anterior de aceptación previa para casos nuevos de la interfaz Lean. No autoriza fusionar `main` ni modificar `gh-pages`.

Base revisada: `feature/ux-lean-materiales-v1.5`, commit `91187fadbce10a66a5f40ebc058dc96881a384bc`, PR #6. Rama de esta entrega: `feature/auditoria-lean-10-capturas`. El PDF y DOCX aportados describen los requisitos; el alcance de implementación procede de la confirmación explícita del usuario. Se conservaron las diez capturas originales y su [manifest SHA-256](capturas/lean-originales/integrity.json).

## Cumplimiento por requisito

| Requisito | Antes | Comportamiento de esta rama | Archivos principales | Evidencia |
| --- | --- | --- | --- | --- |
| P0-01, pVT contextual | El objeto `pvt` bastaba para mostrar un bloque vacío, avisos e intervalos pendientes | Solo se presenta una gráfica documental del grado exacto con muestra visual válida y fuente HTTPS; muestra y fuente deben corresponder. Hoy cumple ABS GP-22. La muestra sigue sin alimentar densidad | `src/materials-audit-view.js` | T01–T02; [sin ficha](capturas/lean/lean-sin-ficha-1440.png) |
| P0-02, ficha sin ruido | Las propiedades ausentes ya se omitían, pero quedaban ficha genérica vacía y confirmaciones globales | La ficha completa desaparece cuando no hay propiedades. Las fichas parciales conservan solo datos presentes, método y fuente. No hay validación global obligatoria; incompatibilidades concretas siguen requiriendo confirmación | `src/materials-view.js`, `src/materials.js` | T03–T04; [sin ficha móvil](capturas/lean/lean-sin-ficha-390.png) |
| P0-03, referencia fundida automática | La referencia requería abrir otro panel y aceptarla | Se precarga la referencia de familia compatible en técnico/avanzado; editable y rotulada como estimación. Se conserva precedencia de grado validado/manual, modo verificado, separación de fichas y masa sin densidad | `src/injection-density.js`, `src/lean-materials.js`, `src/materials.js` | T05–T08, G36; [inyección](capturas/lean/lean-inyeccion-1440.png) |
| P0-04, unificar densidad | Panel de densidad extenso, separado de su campo | Procedencia breve junto al campo; fuente, alcance, condiciones y modo verificado dentro de «?». Sin checkbox de aceptación familiar ni panel duplicado | `src/injection-density-view.js`, `src/app.js`, `src/tooltips.js` | T06, G27, G36; [inyección móvil](capturas/lean/lean-inyeccion-390.png) |
| P0-05, resultados aplicables | KPI y filas «Pendiente», incluso para funciones opcionales/niveles inferiores | Solo se representan métricas finitas calculadas por el motor con entradas activas del nivel/método. Cero sigue siendo resultado válido. Se oculta utilización sin volumen/geometría; salida completa permanece en JSON/historial | `src/results-view.js`, `src/app.js`, `src/compare.js` | T09–T10, T16, T22; [inyección](capturas/lean/lean-inyeccion-1440.png) |
| P0-06, secado contextual | Todo el catálogo seleccionable y formulario lleno de ausencias | Selector y buscador limitados a grados con tiempo **y** temperatura documentados, unidades compatibles y fuente declarada; actualmente nueve comerciales. Incluye materiales propios completos con evidencia. Recomendaciones precargadas; rangos exigen elección explícita. Se mantiene una entrada manual explícita como alternativa | `src/lean-materials.js`, `src/materials-view.js`, `src/materials.js`, `src/app.js` | T11–T15, G37; [secado](capturas/lean/lean-secado-1440.png) |
| P0-07, advertencias accionables | Avisos generales repetidos en ficha y resultados | Se retira el bloque global. Errores de dominio, exceso de carrera, colchón, geometría, rechazo total, evidencia manual y rangos aparecen junto al campo. Alertas numéricas generales quedan junto a resultados. Todas las advertencias/notas técnicas se conservan en exportación. Justificación solo tras modificar datos de material | `src/results-view.js`, `src/materials-view.js`, `src/app.js` | T13, T16, G25–G31; [secado móvil](capturas/lean/lean-secado-390.png) |
| P0-08, aprendizaje sin código | «Consultar modelo implementado» abría JS | La interfaz activa de aprendizaje solo ofrece explicaciones, ejemplos y referencia SI; se elimina el enlace al JS | `src/formulas-index.js` | T17, G35; [aprendizaje](capturas/lean/lean-aprendizaje-1440.png) |
| P0-09, misma pestaña | Aprendizaje y resultados abrían otra pestaña | Vista interna con URL `?view=learning`, lateral CCIP, botón «Volver a calculadora» y navegación Atrás/Adelante. El formulario, resultados, borrador de material e idioma permanecen en la misma sesión/DOM | `src/app.js`, `src/formula-learning.js`, `index.html` | T18, T20, T24, G28; [aprendizaje móvil](capturas/lean/lean-aprendizaje-390.png) |
| P0-10, acordeón exclusivo | Todos los ejemplos extendidos al entrar | Procesos y cálculos plegados inicialmente. Un solo cálculo abierto, teclado, `aria-expanded` y foco al abrir un enlace de resultado. Los nombres se corresponden con las métricas del motor y su catálogo de explicaciones, sin fijar «11». Se conservan las 42 explicaciones, área auxiliar y alternativas por volumen/tubo | `src/formulas-index.js`, `src/styles.css` | T19–T20, G35; [aprendizaje](capturas/lean/lean-aprendizaje-1440.png) |

## Reglas de cálculo y datos conservadas

Los siete archivos `src/models/*.js`, `src/engine.js`, el esquema de entradas/unidades y el catálogo comercial no se modifican. El filtro visual se aplica **después** de calcular: no convierte ausencias en ceros, no completa propiedades y no cambia ecuaciones. El comparador muestra filas con al menos un resultado disponible; CSV/JSON conservan la salida técnica original, incluidos pendientes y advertencias.

La referencia familiar vive en su tabla separada. Los casos nuevos registran `familyMeltReferenceMode: automatic` y `density_assessment.reference_application: automatic_family_reference`; no se registra una aceptación individual inexistente. Los snapshots anteriores sin este modo conservan su política explícita al recuperarlos. El usuario puede volver a aplicar una referencia mediante la ayuda del campo, introducir un valor propio o activar «Solo datos verificados».

Una edición manual se mantiene como anulación explícita al cambiar de grado y se señala para revisión; una referencia automática sí cambia con la familia. Se preservan origen, valor realmente usado, fuente, condiciones, referencia original y estado en historial/JSON. No se sustituye densidad fundida por sólida/aparente ni se aplica otra corrección térmica.

PVC continúa exigiendo seleccionar explícitamente **compuesto final rígido o flexible**; elegirlo confirma esa formulación, no una resina en polvo desconocida. PA6 continúa limitado a la referencia bibliográfica de 250 °C cuando se declara temperatura. El modo verificado conserva su verificación específica y su evidencia contextual; editar valor, temperatura, presión o fuente invalida la declaración previa.

El perfil físico L1/L2/L3 se mantiene solo en avanzado, separado de los niveles. Porcentajes editables con suma 100 %, gráfico, volumen sin margen/colchón automático, recorridos y coordenadas únicamente con origen y sentido declarados. No se crean velocidades ni presiones.

En secado, precargar tiempo y temperatura es una **recomendación de ficha**, no una certificación del proceso: usar el tiempo como residencia nominal de tolva exige comprobar secador, humedad inicial, punto de rocío y almacenamiento. Se explica junto a la recomendación y en «?». El modelo sigue calculando masa en tolva, volumen útil y potencia sensible; no calcula humedad final. Los rangos no se promedian; una elección fuera del rango se conserva como anulación manual con aviso y justificación. La densidad aparente exige presentación/método compatibles y Cp no se deduce ni se completa por familia.

## Pruebas y regresión

Comandos: `npm test` y `python3 tests/browser_smoke.py`. Las pruebas de navegador previas se adaptaron a los comportamientos aprobados: por ejemplo, los resultados nulos deben desaparecer de la vista y las curvas vacías ya no deben existir. No se rebajan las comprobaciones matemáticas: las 520 pruebas previas continúan, con sus cuatro expectativas de presentación/URL actualizadas, y se añaden 27 pruebas de política/datos/presentación.

- **547 Node aprobadas**, cero fallidas u omitidas.
- **37 pruebas Chromium aprobadas**, incluidas T01–T24 y G25–G37.
- 135 estados de cálculo: nueve variantes × tres niveles × cinco anchos (320/390/768/1024/1440 px), con resultados comparados contra el motor.
- 73 perfiles seleccionados y comprobados en inglés; niveles y tamaños rotados. El filtrado del catálogo de secado se comprueba por separado, incluida la admisión/exclusión de materiales propios.
- 27 casos de cambio ES/EN/ES con parámetros, cantidades y borrador conservados. Las 42 explicaciones se recorren en ambos idiomas, con ejemplos, variables y filtros técnico/básico; rutas históricas `formulas.html` siguen funcionando.
- Historial nuevo recuperado desde V1 congelada; comparación, CSV, JSON, impresión, CRUD/importación/exportación de materiales, errores de importación y almacenamiento bloqueado/corrupto.
- Ayudas con mouse, foco, Escape y toque; la ayuda de densidad se reajusta al expandir controles. Referencias manuales, modo verificado, PVC/PA6 y perfil geométrico comprobados.
- Integridad de las diez capturas originales, los 36 archivos de la versión anterior y sus ZIP; la V1 congelada conserva sus pruebas de compatibilidad e integridad.

[Capturas y registros](capturas/lean/README.md). La CI del PR repite las suites completas sobre la rama de revisión; no hay despliegue en esta entrega.

## Límites y pendientes técnicos

- No quedan cambios P0-01 a P0-10 pendientes en el alcance descrito. Las propiedades de fabricantes y referencias familiares conservan su procedencia previa; no se realizó una nueva verificación independiente de sus fuentes ni una certificación industrial.
- Las curvas PC/PA6 y otras referencias sin una gráfica específica realmente renderizable permanecen en el JSON técnico, sin panel pVT en la vista. No se descargan/digitalizan curvas nuevas ni se inventan coeficientes.
- No se incorporan datos de secado, Cp, humedad final, máquinas, presiones o velocidades adicionales. Un grado sin ambos datos de secado sigue disponible en los otros procesos.
- Un valor manual puede requerir revisión de fase, condiciones y fuente: la interfaz lo advierte, y la salida sigue siendo académica. Los avisos y límites completos están en exportación y aprendizaje; ocultar una tarjeta pendiente no valida un resultado.
- Conservar el caso al entrar/salir de aprendizaje no equivale a un respaldo tras cerrar la sesión o recargar la página. Para conservarlo de forma permanente se mantiene «Guardar cálculo»/JSON. Las versiones históricas comparten almacenamiento del mismo origen.
- Se verificó Chromium con tamaños simulados; Safari/iOS, Firefox y dispositivos físicos requieren validación posterior. El JavaScript sigue siendo público por la naturaleza estática de Pages; solo se retiran sus enlaces de aprendizaje.

## Publicación y protección de versiones

La web publicada continúa en el artefacto `f069284acadb9f940db11a60615a7fdbdfac0259`. `main` continúa en `423c04b1710f8f009c811c893873184d363f1b66`. No se ejecuta publicación ni se fusionan cambios. Las carpetas `versions/`, los ZIP de `downloads/` y el repositorio original de Reymenez permanecen intactos. El usuario recibirá el PR y las capturas para revisión.
