# Auditoría técnica final de Etapa 5 — PR #14

Fecha: **17 de octubre de 2026**, America/Santo_Domingo.
Rama exclusiva: `feature/etapa-5-secado-acondicionamiento`.
Base auditada: `814652806ba9df0480e352b69b0c12fed26df9bb`.
PR: https://github.com/vittoriovenetto/CCIP-Calculadoras-Procesos-Plasticos/pull/14

Se auditaron los cinco commits y trece archivos del PR, descripción, discusión y revisiones
(sin comentarios al consultar), requisitos adjuntos, esquema, motor, evaluación térmica,
materiales, interfaz, historial, exportaciones, pruebas y workflow. No se implementó de nuevo
la etapa ni se cambió la arquitectura. La CI inicial estaba verde; se reprodujeron errores
físicos/de integración a pesar de ese resultado.

[Diagnóstico antes de editar](auditoria-inicial.md) · [Matriz de 73 materiales](matriz-materiales.csv)
· [Matriz estructurada](matriz-materiales.json) · [Fuentes consultadas](fuentes-revisadas.json)

## Problemas, correcciones y matriz de aceptación

| Requisito / ID y gravedad | Estado anterior | Cambio | Prueba | Estado final |
|---|---|---|---|---|
| Cp documental válido — D01, crítica | Bastaban fase sólida y cualquier texto de condición; un punto a 25 °C habilitaba potencia. | Contrato térmico con fuente, grado/valor/unidad, definición e intervalo sustentados. Un punto no habilita potencia. | Node `audit Cp: isolated…`, `structured documentary mean…`; H02. | Corregido; sin Cp nuevo inventado. |
| Cp manual medio — D02, alta | Fase/límites/texto de fuente habilitaban potencia aunque el dato fuera puntual. | Promedio de extremos exactos o aproximación constante sustentada; sin transición; confirmación vinculada a valor/evidencia. | Node mean/phase/source/value-binding, metadatos malformados; H02/H03/H06. | Corregido; el respaldo documental real sigue bajo responsabilidad técnica del usuario. |
| Manuales y origen — D03, alta | Una elección dentro de rango se borraba como si fuera precarga. | Marca de selección manual, protección frente a precarga, conservación de valor/referencia; evidencia preservada como borrador al cambiar grado, con confirmaciones reiniciadas. | Node manual range / changing grade; H01. | Corregido. |
| Densidad aparente compatible — D04, alta | Una entrada manual producía volumen sin presentación, condiciones ni fuente. | Gate para ficha o entrada manual: kg/L, pellets/polvo, fuente y confirmación de condiciones; referencia de ficha compatible con presentación. | Node bulk/units/arithmetic; H02/H03. | Corregido; entrada retenida y solo volumen dependiente pendiente. |
| Trazabilidad de cálculos — D05, alta | Cp excluido podía aparecer como usado; evaluación ausente en Excel/PDF. | Entradas originales/efectivas/propiedades usadas separadas; `drying_assessment`, fuentes Cp/bulk y supuestos en los tres formatos. | Node snapshots; H04; suites de exportación Etapa 2. | Corregido. |
| Reciclados y formulaciones — D06, media | La guía visible podía referirse al virgen aunque secado de mezcla no fuera aplicable. | Aviso explícito y evaluación no aplicable; sin heredar datos ni habilitar potencia. Los registros propios necesitan evidencia propia. | Node blends / regresión Etapa 3; H01/H02. | Corregido; modelo de mezclas no desarrollado. |
| Claridad / pendientes / bilingüismo — D07, media | Resultados no finitos ocultos sin explicación suficiente; supuesto no visible junto a Ti. | Estado con dato faltante y forma de obtenerlo; Ti=25 °C como supuesto visible, nuevas ayudas/errores ES/EN. Contraste de la ayuda Cp mejorado. | H01/H02/H05 y 27 cambios ES/EN/ES de regresión. | Corregido dentro de cobertura. |
| Cobertura termodinámica — D08, media | La matriz de navegador excluía siempre la potencia de secado. | Fixture sintético con evidencia explícita; se comprueban todas las métricas del motor, incluida potencia avanzada, y casos donde debe estar pendiente. | Matriz general y H02/H03/H06. | Corregido, sin desactivar ni reducir exigencia. |
| Rangos temporales/temperatura — D09, media | Elección temporal no numérica podía disparar extremo superior automático. | Solo ausencia de elección propone el extremo superior; rango de temperatura requiere elección. Fuente y rango permanecen. | Node manual range, pruebas de materiales/Lean; H01. | Corregido. |
| Persistencia entre niveles e historial — D10, alta, detectado al comprobar recuperación | Guardar en básico perdía entradas/evidencias avanzadas no activas. | Estado retenido separado de cálculo activo; preservación de procedencia y recuperación de esos campos. | H07: avanzado→básico→guardar→recuperar→avanzado, resultados y registro original inmutable. | Corregido. |
| Restauración entre procesos — D11, media | El nuevo estado pendiente de secado podía seguir visible al recuperar otro módulo desde historial. | Vaciar/ocultar exclusivamente ese estado al calcular otro proceso. | H08: recuperar inyección después de secado pendiente. | Corregido. |
| Inventario M=Q·t y volumen V=M/ρ | Ecuaciones correctas; faltaba exigir aplicabilidad de densidad manual. | Ecuaciones intactas; verificación dimensional y gate de datos. | Node arithmetic/inputs + H03. | Verificado. |
| Potencia P=Q·Cp·ΔT/3600 | Ecuación correcta, contrato de Cp insuficiente. | Ecuación intacta, evidencia corregida y tratamiento de faltantes. | Node 50×2×55/3600=55/36 kW; H03/H06. | Verificado como estimación sensible del polímero. |
| Caudal vacío / Ti=25 °C | Comportamiento inicial correcto. | Mantener y explicitar/exportar origen; no atribuir Ti al fabricante. | Pruebas de esquema, H01, exportaciones. | Verificado. |
| Biblioteca y etapas anteriores | 73 identidades, 9 guías operacionales, Cp medio ausente. | Catálogo y ecuaciones intactos; matriz y consulta documental separadas. | Integridad + regresiones general/Etapas 2–4. | Verificado en cobertura ejecutada. |
| Equipos / Etapa 6 | Riesgo de interpretar necesidad nominal como capacidad de máquina. | Metadatos explícitos `machine_capacity_certified=false`, alcance y límites documentados. | Node arithmetic, H03/H04. | Contrato aclarado; no se desarrolla catálogo de máquinas. |

## Fuentes y resinas

Se revisaron las 73 identidades del catálogo y sus propiedades/evidencia disponibles; se
consultaron en vivo las **nueve fuentes oficiales correspondientes a los grados seleccionables**.
Las nueve devolvieron HTTP 200 con contenido técnico legible (dos PDF BASF, siete páginas HTML).
`fuentes-revisadas.json` conserva URL, fecha, tipo, hash SHA-256 y extractos de recomendaciones.
Los PDF BASF consultados indican revisión **09/2026**; los metadatos de catálogo conservan la descripción histórica recibida (02/2026 para R03). Los valores de tiempo, temperatura y densidad aparente revisados coinciden; la revisión actual queda trazada separadamente sin reescribir esa procedencia histórica.
No se confunde accesibilidad HTTP con certificación industrial ni se afirma haber reconsultado
las 73 fichas externas.

| Grado | Temperatura / tiempo documentados | Densidad aparente en catálogo | Alcance |
|---|---|---|---|
| Terluran GP-22 | 80 °C / 2–4 h | Sin dato | Recomendación orientativa; equipo/humedad importan; regranulado puede absorber humedad de forma distinta. |
| Ultramid B3S R03 | 80 °C / 4 h | ≈0.7 kg/L, granza | Aire seco, humedad inicial y punto de rocío condicionan tiempo; almacenamiento inadecuado puede requerir extensión. |
| Makrolon 2405 | 120 °C / 2–3 h | 0.66 kg/L; pellets, ISO 60 | Fuente publica 660 kg/m³; conversión exacta /1000. Guía para secador de aire seco. |
| Terluran GP-35 | 80 °C / 2–4 h | Sin dato | Guía del grado/variante de fuente; se mantienen las mediciones ASTM/ISO de Etapa 3 sin cambios. |
| Ultramid B3K | 80 °C / 4 h | Sin dato incorporado | Misma cautela de humedad, equipo y almacenamiento; ficha exacta, no extrapolación desde R03. |
| Makrolon 2407 | 120 °C / 2–3 h | Sin dato | Secador de aire seco; no transferir densidad de otro Makrolon. |
| Makrolon 2805 | 120 °C / 2–3 h | Sin dato | Fuente consultada presenta unidad de densidad aparente discrepante; no se convierte ni precarga. |
| Makrolon 2856 | 120 °C / 4 h | Sin dato | Tiempo fijo; unidad de densidad aparente discrepante en página consultada, sin precarga. |
| Makrolon 3108 | 120 °C / 2–3 h | Sin dato | Secador de aire seco; sin densidad aparente ni Cp medio aplicables en catálogo. |

La información adicional fiable hallada para **B3K** queda documentada: la ficha BASF describe
"granules with a bulk density of approx. 0.7 g/cm³", equivalente a ≈0.7 kg/L. Se registra en esta
auditoría con su fuente CAT264/R-CAT264 y hash; no se añade automáticamente al catálogo ni a otros
grados. No es densidad sólida ni una medida de lote.

Las páginas de **2805 y 2856** muestran "Bulk Density / Pellets / 660 / g/cm³ / ISO 60". Esa unidad
no se sustituye silenciosamente por kg/m³. Se conserva el extracto y se requiere aclaración del
fabricante o ficha alternativa exacta antes de incorporar un valor operativo. No se clasifica
un dato de otra ficha o región como error universal.

Las 19 identidades con filas documentales de secado en la extensión de investigación siguen
consultables, pero no se convierten indiscriminadamente en recomendaciones operacionales.
La selección de secado permanece en nueve grados; el modo manual admite materiales sin ficha.
Ti=25 °C sigue siendo un supuesto de interfaz para cualquier caso, no propiedad de ninguna resina.
No se halló Cp medio compatible en estas nueve fuentes; sigue sin precarga.

## Comprobación dimensional y numérica

Con entradas exclusivamente sintéticas Q=50 kg/h, t=4 h, ρ_bulk=0.7 kg/L, Ti=25 °C, Tf=80 °C y
Cp_medio=2 kJ/(kg·K) respaldado en ese intervalo: M=200 kg, V=285.714285714… L y P=1.527777777… kW.
No son propiedades reales de una resina ni parámetros de una máquina. Se verifican Q=0, ΔT=0,
Tf<Ti, temperaturas no físicas, datos vacíos/no numéricos/no finitos y negativos, unidades de
entrada/canónicas y separación de fases. Un faltante no genera cero ficticio.

## Ejecuciones y evidencias

| Ejecución local | Resultado |
|---|---|
| `npm test` | **645/645**, sin omitidas ni desactivadas |
| `python tests/browser_smoke.py` | **42/42**, 135 estados módulo/variante × nivel × pantalla; 73 perfiles y 27 cambios ES/EN/ES |
| `python tests/browser_stage2.py` | **6/6**, archivos XLSX/PDF/JSON reales y operaciones de historial |
| `python tests/browser_stage3.py` | **10/10**, evidencia, formulaciones y mediciones independientes |
| `python tests/browser_stage4.py` | **7/7**, explorador, aportes, conflictos y exportaciones |
| `python tests/browser_stage5.py` | **8/8**, evidencia térmica, datos manuales, niveles, recuperación, formatos y diseño |

Son **73 pruebas de navegador**, además de las 645 unitarias. La base antes de editar pasó
632 Node, 42 generales y 6 de exportaciones. Los problemas D01–D03 se reprodujeron de manera
independiente; su salida anterior está en `pruebas/reproducciones-antes.txt`.

Se comprobó la interfaz de secado en **320, 360, 390, 768, 1024 y 1440 px**, español e inglés,
sin desplazamiento horizontal global, con ayudas accesibles. Se incluyen 12 capturas completas
más 4 de la ayuda Cp en 320/1440 px. El build y su caché se registran después de guardar el código.

[Logs de pruebas](pruebas/) · [Capturas](capturas/README.md) · [Integridad byte a byte](integridad.json).
Los logs y capturas están en `pruebas/` y `capturas/`. El build genera un artefacto local; no publica.
La CI inicial del PR (head 8146528) pasó antes de la auditoría. La nueva CI debe evaluarse sobre
el head corregido; no se toma el resultado inicial como prueba de la corrección.

## Límites y pendientes

- La app valida consistencia de evidencia declarada. No interpreta automáticamente el contenido
  del documento manual ni certifica el valor, lote, ausencia de transiciones o compatibilidad real.
- Cp puntual, fuente sin intervalo/definición y Cp del fundido no habilitan potencia. Una media
  de un intervalo distinto no se traslada sin sustento; la aproximación constante es explícita.
- La potencia es sensible del polímero, no consumo eléctrico, potencia total instalada ni selección
  certificada de secador. No incluye agua evaporada, pérdidas, aire, desecante o regeneración.
- Tiempo nominal no garantiza humedad residual ni flujo uniforme en tolva. Se requiere validación
  con grado/lote, humedad de entrada, secador, punto de rocío, aire y medición final.
- Confirmar las unidades de densidad aparente de 2805/2856 antes de cualquier incorporación.
  La densidad adicional documentada de B3K queda pendiente de revisión de incorporación.
- No se desarrolla secado de mezclas ni un catálogo de máquinas. No se trasladan propiedades
  del virgen a reciclados o formulaciones; las propiedades propias requieren evidencia propia.
- Las capturas son de Chromium en viewports; no equivalen a probar todos los dispositivos físicos
  ni a validar Safari/Firefox o procesos industriales.
- Los registros históricos guardados y sus exportaciones permanecen inmutables. La vista activa
  recuperada se evalúa con el contrato actual; un Cp histórico insuficientemente documentado puede
  quedar pendiente allí, sin reescribir el snapshot antiguo.

No hay bloqueos técnicos del entorno. Las aclaraciones de fabricante y validación de ingeniería
son pendientes documentados; no se sustituyen por propiedades inventadas.

**Sin merge, sin deploy, sin cerrar PR #14, sin modificar `main`, `gh-pages` ni el repositorio original.**
