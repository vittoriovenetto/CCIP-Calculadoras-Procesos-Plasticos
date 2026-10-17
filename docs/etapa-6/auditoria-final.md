# Auditoría y ampliación de Etapa 6 — PR #15

Fecha: **17 de octubre de 2026**, America/Santo_Domingo.
Rama exclusiva: `feature/etapa-6-catalogo-maquinarias`.
Head inicial inspeccionado: `de1b6efe853ebaaf38f6778e16f0ad3b100fdff2`.
PR: https://github.com/vittoriovenetto/CCIP-Calculadoras-Procesos-Plasticos/pull/15

## Estado inicial y base

Se revisaron el PR completo (siete commits, quince archivos, descripción, comentarios/revisiones vacíos), CI, catálogo, selectores, comparaciones, historial, exportaciones, esquema y motores. Había seis referencias, tres de ellas series, con integración efectiva principalmente de inyección. Faltaban las dos máquinas prioritarias y los mínimos por proceso.

La CI inicial fallaba: ejecuciones `38988382115` y `38988382156`. Localmente, `npm test` pasó 640 pruebas y `browser_stage6.py` pasó dos y falló una: **H03, scrollWidth 363 en viewport 360**. El elemento identificado fue el `span` de confirmación comprimido por un checkbox que heredaba el ancho de los inputs generales. No se atribuyó el problema al motor ni se ocultó el overflow de la página.

Antes de ampliar se integró cuidadosamente Etapa 5 desde **`9db34e2f9fd1b3cabea21acb2a9c708782b63ab7`**, commit de integración de desarrollo `d500418`. Se resolvieron conflictos conservando ambas suites, la evaluación térmica, entradas retenidas, mensajes, traducciones, maquinaria y exportaciones. No se fusionó ningún PR ni se tocó una rama de publicación.

## Cantidades y criterio de conteo

| Proceso | Máquinas computables | Modelos |
|---|---:|---|
| Inyección | **4** | ARBURG 370 S 700-290/290, unidad horizontal 290 Ø30; Moiron M2-I Ø20; Moiron M2-II; Xihua XH-436 columna 25T. |
| Extrusión | **3** | Xihua XH-433-45 (tabla Ø25); XH-434-25; COLLIN E 20 E. |
| Película soplada | **4** | Xihua XH-430B-25; XH-430B-25-3; COLLIN BL 400 E y BL 600 E. |
| Soplado de envases | **3** | Kautex KBB 40, KBB 60 y KBB 80. |
| Termoformado | **3** | Kiefel SPEEDFORMER KMD 64.2 Speed, KMD 78.2 Speed y KMD 85 Speed. |
| Secado | **3** | motan LUXOR HD LHD 30, LHD 60 y LHD 150. |
| Total | **20** | Sin contar familias como modelos ni duplicar variantes cuya equivalencia está pendiente. |

Hay **25 registros consultables**: 20 computables, tres series originales (uniEX, EVO FFS, GEISS T11) y dos perfiles documentales adicionales de las capturas del usuario. Se añadieron **19 registros** respecto a los seis iniciales: **17 nuevas fichas computables y dos variantes adicionales no contadas**. Se conservaron los seis identificadores originales.

Cada ficha computable tiene fabricante/modelo identificables, configuración o columna concreta, al menos tres magnitudes documentadas, unidad, fuente por dato, fecha, hash y limitaciones. Se revisó el contenido técnico; HTTP 200 por sí solo no constituye verificación científica. No se afirma disponer de todos los parámetros de los veinte equipos ni de ensayos de capacidad.

[Catálogo](../../src/data/machines.v1.json) · [Matriz técnica](matriz-tecnica.md) · [Matriz estructurada](matriz-tecnica.json).

## Matriz de auditoría

| Requisito | Estado anterior / problema | Corrección | Evidencia | Estado final |
|---|---|---|---|---|
| Mínimo 20 y conteo correcto | Seis referencias, incluidas series; faltan prioridades. | 20 fichas computables; identidad comercial deduplicada y mínimos por proceso. Tres series y dos variantes no suman. | Node mínimo/duplicados; script `audit-machine-catalog.mjs --require-complete`; H13. | Cumplido documentalmente. |
| Moiron M2-I prioritaria | Ausente. | Perfil Ø20/15 tf del bloque M2-I, distinto de M2-II; diámetro aplicable, límites en unidades compatibles, ABS condicionado. | Node Moiron; H05/H06; fuentes y discrepancias. | Integrado; carrera/volumen máximo y otras magnitudes no documentadas quedan pendientes. |
| Captura Moiron del usuario | Ø16/100 kN/1 kW difiere de otras fuentes. | Ficha independiente de página 104; 135 mm como apertura de molde, nunca carrera de husillo. Masa sin polímero no se convierte a volumen. | H10; Node fuentes aportadas; discrepancias. | Conservada sin fusionar variantes ni aumentar el conteo. |
| XH-430B-25 prioritaria | Ausente. | Monocapa separada de tricapa; dado estándar confirmado; BUR/DDR del motor conservados; límites disponibles comparables. | Node XH; H06/H07. | Integrado; no inventar caudal, abertura, espesor o velocidad de arrastre. |
| Captura XH del usuario | 2.2 kW y anchos 300/180 mm difieren de la ficha 4 kW. | Registro independiente; 0.02–0.2 mm → 20–200 µm; los anchos discrepantes se conservan sin usarlos como límites. | H10; Node fuentes aportadas. | Conservado y condicionado; sin conteo adicional. |
| Desbordamiento 360 px | Checkbox general comprime texto de confirmación; span alcanza x=363. | Checkbox de 20 px y columna de texto flexible. Sin `overflow-x:hidden` general. | Reproducción inicial; H03/H07 con fichas abiertas en seis anchos. | Corregido en cobertura ejecutada. |
| Selectores / fabricante / proceso | Solo selector de modelo; series confundibles con variantes. | Proceso activo filtra catálogo; fabricante/modelo sincronizados; sin selección manual; estado por proceso. | H05/H13; matriz general. | Corregido. |
| Precarga segura | Solo ARBURG; comprobación de unidad insuficiente. | Lista explícita de campos compatibles por proceso, unidad exacta, variante concreta y confirmación. Manuales incluso iguales al antiguo valor permanecen. | Node unidades/rangos/manuales; H01/H05/H06. | Corregido. |
| Límites y desconocidos | Comparaciones solo inyección; riesgo de datos vacíos como cero. | Comparador separado de motores, conversiones explícitas, vacíos/espacios/negativos/no finitos pendientes; mínimos y máximos diferenciados. | Node comparaciones de seis procesos; H08/H11/H12. | Corregido; sin inferencias de rendimiento. |
| Presiones / masa / volumen | Riesgo al incorporar nuevas fichas. | Presión de máquina separada de cavidad/hidráulica; g ABS no se convierten a cm³. Unidades ambiguas originales no se normalizan arbitrariamente. | Node unidades/presiones/Moiron; discrepancias. | Verificado en datos incorporados. |
| Termoformado | Serie T11, sin variante evaluable. | Tres KMD concretas; lámina, herramienta, superficie y altura separadas; modo estándar/BFS explícito; ciclos/h → c/min. | H12; Node Kiefel y comparador. | Integrado; no inferir área útil ni ciclo real. |
| Secado / Etapa 5 | Recomendaciones podían confundirse con capacidad del equipo. | Nominal ≠ útil; aire caliente superficial ≠ secado deshumidificante; referencia ABS exige material, tiempo y temperatura compatibles. kW instalados no son potencia sensible/consumo. | H11; regresión Etapa 5; Node secado. | Integrado conservando el contrato físico de Etapa 5. |
| Producción y costos | No reutilizaba datos. | Reutilización explícita de entradas compatibles del historial, ID/fecha/orígenes/ficha de origen; sin consumo inferido. Referencia se conserva al cambiar/quitar ficha activa. | Node costos; H09; regresión Etapa 2. | Implementado. |
| Lectura del historial para reutilizar | Llamada sin almacenamiento devolvía vacío silencioso. | Lectura segura de localStorage; fallback vacío si no está disponible. Actualización de opciones tras guardar/renombrar/eliminar. | H09 y suite Etapa 2. | Corregido. |
| Guardar en básico y recuperar avanzado | Campos de maquinaria ocultos podían perderse. | Entradas retenidas separadas de inputs activos; origen manual conservado; `used_fields` separa uso real de precarga retenida. | H15 y Node snapshots. | Corregido. |
| Básico sin geometría activa | Ausencia de diámetro/carrera podía parecer variante equivocada. | Solo un número explícito diferente marca incompatibilidad; magnitudes no activas permanecen pendientes. | Node básico sin falsa incompatibilidad. | Corregido. |
| Idioma / presentación | Cambio de idioma podía borrar comparación visible; confirmar cerraba ficha abierta. | Cache de evaluación solo de presentación, invalidada por edición; ficha conserva expansión para la misma selección; etiquetas ES/EN. | H07/H14, comparación de snapshots y capturas. | Corregido; datos originales de fuente se conservan. |
| Ayuda fijada durante resize | Una ayuda fijada por clic podía cerrarse al pasar otro «?» bajo el cursor durante un cambio de ancho. Reproducido G36: hover de partMass ocultaba densidad y provocaba pérdida de foco. | La ayuda fijada conserva el contexto ante hover; clic o foco explícito cambian de parámetro. | G27 exige conservar ayuda ante hover y cambiar con clic; G36 exige popup visible, además de límites geométricos. | Corregido; sin forzar interacciones ni reabrir artificialmente el popup en el test. |
| Historial / XLSX / PDF / JSON | Evidencia inicial incompleta para el catálogo ampliado. | Snapshot completo con variantes, propiedades, fuentes, condiciones y evaluación; exportación histórica sin motor ni catálogo actual. | H04/H09/H15, suites Etapas 2–4; lectura independiente de archivos. | Verificado en cobertura. |
| Integridad / modularidad | Nuevas funciones podían alterar etapas previas. | Siete motores/esquema/materiales/archivos V1 intactos frente a base verificada. Comparador modular separado. | Regresiones e integridad byte a byte. | Conservado. |

## Fuentes y discrepancias

Se consultaron **20 documentos únicos** usados como evidencia del catálogo o del contraste de Moiron. `fuentes-revisadas.json` identifica URLs, fecha, SHA-256, extractos, alcance y registros aplicables. Los veinte documentos revisados respondieron 200 y se leyó su contenido técnico. Esto no significa certificación de los equipos instalados.

Se priorizaron fuentes de fabricante y tablas por modelo. El anuncio de Dongguan Xihua aportado por el usuario se identifica como anuncio del proveedor, distinto de las páginas de Guangdong Xihua. La ficha del distribuidor japonés Moiron se conserva como evidencia de una versión distinta, sin trasladar sus cifras a los perfiles de otras fuentes.

La página Mycowry respondió 503; la equivalencia M2-1/M2-I queda pendiente. Formech rechazó la consulta; no se usó para cubrir los tres modelos de termoformado. Se resolvió el acceso restringido inicial a los fabricantes mediante el borrador de dominios del entorno; no se eludieron restricciones ni se publicó CCIP.

[Discrepancias y tratamiento detallado](discrepancias.md), incluyendo:

- Moiron 20 g ABS frente a 20 cc declarado bajo encabezado de masa; 15 tf, 150 kN y 100 kN no se tratan como un mismo dato de una misma variante.
- Moiron página 104: cuerpo dice M2, fotografía M2-I; geometría Ø16, potencia 1 kW y dimensiones distintas.
- XH monocapa/tricapa; 150–180 mm como rango configurable; anuncio 2.2 kW con anchos discrepantes; encabezado de supuesto espesor 100–200 mm excluido.
- COLLIN: cilindro frente a husillo; rodillo frente a banda; opciones L/D sin selección automática.
- Kiefel: tabla por columna, máximos de herramienta/conformado/lámina distintos y velocidades estándar/BFS independientes.

## Pruebas ejecutadas

| Comprobación | Resultado local |
|---|---|
| `npm test` | **670 aprobadas**, cero fallidas/omitidas/desactivadas. |
| `python tests/browser_smoke.py` | **42 aprobadas**, 135 estados módulo/variante × nivel × pantalla; 73 perfiles; 27 cambios ES/EN/ES. |
| `python tests/browser_stage2.py` | **6 aprobadas**, historial y archivos reales. |
| `python tests/browser_stage3.py` | **10 aprobadas**, evidencia y formulaciones. |
| `python tests/browser_stage4.py` | **7 aprobadas**, explorador y aportes. |
| `python tests/browser_stage5.py` | **8 aprobadas**, contrato térmico y recuperación. |
| `python tests/browser_stage6.py` | **15 aprobadas**, catálogo, variantes, datos manuales, límites, idiomas, niveles, historial y exportaciones. |
| Auditoría de catálogo | **20 computables**, distribución 4/3/4/3/3/3; 25 registros; dos prioridades presentes. |

Total: **88 pruebas de navegador**, además de las 670 Node. Se comprueban 320/360/390/768/1024/1440 px en ES/EN, detalles abiertos, los seis procesos y los tres niveles. Las capturas son de la aplicación real en Chromium; los valores de demanda usados por los tests son fixtures sintéticos, no ensayos industriales.

Las pruebas nuevas comprueban conversiones 15 tf→147.09975 kN, 60 MPa→600 bar, 0.02 mm→20 µm y ciclos/h→c/min, además de rechazar masa→volumen sin densidad, unidades ambiguas y potencia instalada→consumo. Se distingue superar un máximo de caer bajo un mínimo. G36 falló en una repetición general por el cambio de ayuda fijada durante resize; se conservan la reproducción y la salida fallida junto a la ejecución corregida. No se desactivaron pruebas para conseguir resultados positivos; H01 ahora comprueba estados y cifras, y el selector del detalle técnico se identifica específicamente ante nuevos desplegables.

Build local y caché se verifican después de guardar el código, sin ejecutar publicación. La prueba de caché comprueba también las variantes Moiron Ø20/Ø16 y que 135 mm no se precargue como carrera. Los resultados remotos vigentes se consultan en los Checks del PR #15; el fallo inicial no se considera prueba del head corregido.

[Logs](pruebas/) · [Capturas](capturas/README.md) · [Integridad](integridad.json).

## Limitaciones y pendientes

1. No son certificados de máquina, fichas de una unidad instalada ni mediciones de consumo. Confirmar placa, número de serie, husillo, accionamiento, molde/herramienta, opciones y condiciones reales.
2. M2-1/M2-I y la equivalencia entre variantes Moiron continúan pendientes; no se crea un alias universal. Caudal, carrera y capacidad volumétrica no documentados no se inventan.
3. Aclarar los anchos del anuncio XH y su relación con otras configuraciones/entidades Xihua. Verificar cuál es el límite individual de burbuja del modelo monocapa y si la potencia tricapa es total o por husillo.
4. Los máximos publicados no garantizan que sean simultáneos. Presión, caudal, material, velocidad y accionamiento deben validarse conjuntamente; el comparador realiza cribado numérico.
5. Extrusión no predice kg/h desde rpm/par/diámetro; los campos sin capacidad documentada siguen pendientes. Las opciones 25D/30D del E20E requieren identificación física.
6. Molde no equivale a envase; superficie de conformado no equivale a lámina consumida ni área útil. Ciclos máximos de KMD no son productividad real del producto o de la línea.
7. Secado conserva las limitaciones de Etapa 5: humedad inicial/final, punto de rocío, flujo real, volumen útil y rendimiento térmico requieren evidencia. No se deduce consumo medio de kW conectados.
8. Se probaron viewports de Chromium, no todos los dispositivos físicos ni Safari/Firefox. La ingeniería industrial y la seguridad de operación siguen requiriendo validación especializada.

El PR permanece abierto para revisión. **Sin fusionar PR, sin deploy, sin modificar `main`, `gh-pages` ni el repositorio original de Reymenez.**
