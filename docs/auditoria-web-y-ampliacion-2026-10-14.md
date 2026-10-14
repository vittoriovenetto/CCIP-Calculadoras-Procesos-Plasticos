# Auditoría inicial de la página publicada y alcance de la ampliación

> Este documento conserva el estado inicial del PR. Los resultados y pendientes actuales se detallan en [auditoría final V1.3](auditoria-v1.3-final.md). La publicación no se autoriza en esta tarea.

Fecha: 2026-10-14 · repositorio: `vittoriovenetto/CCIP-Calculadoras-Procesos-Plasticos`.

## Versiones

- Página visible al comenzar la revisión: rama `gh-pages`, `deployment.json` con `source_commit=793171cb1c515bfb01a6ecc0a9555aeb59e70e75` y catálogo `1.2.0`.
- Desarrollo original de la plataforma: `feature/web-v1-modular`. El repositorio `main` sigue con README.
- Nueva propuesta bajo pruebas: `feature/catalogo-90-i18n-formulas`. **No cambia el sitio publicado ni la calculadora original del compañero**.

## Inspección del código publicado

| Área | Observación | Prioridad |
| --- | --- | --- |
| Navegación | Siete módulos y nivel básico/técnico/avanzado; la versión publicada tiene un menú lateral y navegación móvil desplazable. | Conservar; probar con usuarios |
| Resultado | Tarjetas de KPI, barra de utilización del husillo y apartado expandible de ecuaciones. | Conservar |
| Materiales | Ficha desplegable y nueve registros v1.2; faltaban genéricos y editor. | Implementado en nueva rama |
| Idiomas | Interfaz original únicamente en español. | ES/EN en nueva rama; revisar traducciones dinámicas |
| Formación | Fórmulas resumidas dentro de cada cálculo, sin un manual central. | Formulario educativo bilingüe agregado en `formulas.html` |
| Inyección | Shot/carrera/cierre/llenado y plastificación; perfil por etapas L1/L2/L3 no implementado en el motor actual. | Pendiente: definición/validación |
| pVT | Curva ABS digitalizada solo para visualizar, PC y PA6 como referencias; autofill de densidad fundida bloqueado. | Correcto: no habilitar desde aproximaciones |
| Materiales exactos | Densidad fundida y Cp(T) incompletos, secado dependiente de grado, condiciones y equipo. | Validación experimental |
| Salidas | Historial local y JSON; no informes PDF/Excel nativos del motor. | Fase posterior |
| Accesibilidad | Tooltips con teclado/toque, responsive CSS y aria en resultados. | Validar Safari/Firefox/lector pantalla |
| Calidad | Pruebas Node y Playwright en rama de desarrollo, pero no homologación con ensayos de planta. | Mantener CI y añadir datos reales |

**Límite de la auditoría**: repositorio/artefactos de despliegue y pruebas automatizadas, no inspección visual directa en iOS/Android reales ni ensayos de proceso.

## Cambios de esta entrega experimental

1. Catálogo v1.3: 90 identidades de grados comerciales (10/familia) + 9 perfiles genéricos (11 opciones/familia, 99 en total).
2. **No confundir identificación de un grado con ficha técnica totalmente verificada.** La mayoría de propiedades nuevas se mantienen nulas; dos referencias Dow LLDPE tienen densidad sólida en fuente oficial; no se calcula densidad fundida sin pVT validado.
3. Seleccionar la familia configura un perfil genérico; seleccionar fabricante+grado cambia a una ficha específica.
4. Crear, editar, eliminar y exportar registros personales con propiedades, método de ensayo y fuente; se almacenan **solo localmente** en el navegador.
5. Interfaz ES/EN con preferencia local; se conservan las claves internas y unidades.
6. Biblioteca separada en `formulas.html`: 26 ecuaciones, símbolos, unidades, hipótesis y limitaciones, en ambos idiomas.
7. Pruebas Node para los nuevos contratos; test de navegador para selección genérica, editor, idioma y fórmulas.

## Reglas de seguridad técnica

- Un perfil genérico **no asigna** densidad, MFR, Cp o temperatura de secado promedio porque no se conoce grado, fase ni condiciones.
- Un grado comercial con propiedades sin referencia individual no las completa con valores de la familia.
- Valores propios pueden utilizarse cuando el usuario confirma fase/método/condiciones y conserva su procedencia, pero siguen identificados como no certificados.
- Densidad sólida, aparente y fundida son magnitudes distintas y nunca se intercambian automáticamente.
- Valores pVT digitalizados no alimentan el motor matemático; prohibida la extrapolación silenciosa.
- Las formas/condiciones relevantes (pellets vs polvo, temperaturas/presiones, aditivos, lote) afectan la aplicabilidad.

## Próximas mejoras (tras aprobar esta rama)

**P0 — validar antes de producción:** revisión de fuentes de identidad y fichas de los 90 grados por grado exacto; revisión técnica de todos los números de los nueve materiales iniciales y los nuevos datos Dow; probar guardado/edición local con Chrome móvil y Safari; cerrar CI.

**P1 — rediseño funcional:** buscador y filtros por fabricante, grado y familia; importación/exportación local de materiales propios, validación de duplicados y avisos de registros desactualizados; idioma completo de mensajes de error/notas técnicas; cálculo de L1/L2/L3 sometido a aprobación docente; informes PDF/Excel.

**P2 — robustez científica:** ampliar cálculos de enfriamiento, presión y ciclo usando variables adicionales; registro de máquina y lote; modelos pVT calibrados y Cp(T) por grado; casos de referencia experimentales por proceso; auditoría de unidades, sensibilidad e incertidumbres.

## Criterios para integrar a publicación

- `npm test`: 100 % de pruebas en verde.
- Playwright sin errores de consola, overflow ni pérdidas de datos en móvil/desktop; comprobar ES/EN y `formulas.html`.
- Material genérico sin relleno implícito de parámetros; material propio con registro de condiciones/sistema de procedencia.
- Autenticidad de las fuentes/identidades del catálogo revisada antes de presentarlas como **verificadas**.
- Pull request aprobado y despliegue explícito a `gh-pages`; conservar copia V1.
