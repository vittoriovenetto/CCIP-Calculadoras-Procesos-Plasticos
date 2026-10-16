# CCIP — Calculadoras de Procesos Plásticos

## Etapa 4 — biblioteca integral y aportes (para revisión)

Parte del commit aceptado `7de3816` del PR #12. Añade **Materiales** como apartado independiente,
fichas trazables, filtros combinados, comparación y Excel/PDF/JSON. Amplía el editor propio y
prepara propuestas públicas de GitHub con recepción verificable y biblioteca compartida separada.
La automatización de Issues está **pendiente de activación en la rama predeterminada** y revisión
humana; no se ha fusionado, publicado ni añadido ningún aporte ficticio como aprobado.

[Guía y alcance](docs/etapa-4/README.md) · [Protocolo y activación pendiente](docs/etapa-4/aportes-github.md) · [Validación y capturas](docs/etapa-4/validacion.md)

## Etapa 3 — materiales, fluidez y formulaciones (para revisión)

Esta rama parte de la Etapa 2 (PR #11), conserva los 73 registros y añade evidencia documental trazable, varias mediciones MFR/MVR y recetas locales V/R en masa. Las propiedades ausentes no se inventan ni se heredan del virgen. La densidad ideal es una estimación explícita con componentes, fase y condiciones documentadas. **Sin merge ni deploy.** Se incorpora evidencia adicional en 47 grados; otros 17 comerciales permanecen sin enriquecimiento numérico adicional. Investigar 73 identidades no certifica toda la biblioteca.

[Revisión regional de GP-35: ASTM y ISO independientes](docs/etapa-3/gp35-regional-review.md) · [Auditoría de los 73 registros, matrices y bibliografía](docs/etapa-3/README.md) · [Modelos y límites](docs/etapa-3/modelos.md) · [Pruebas y capturas](docs/etapa-3/fase-e.md)

## Auditoría Lean de diez capturas — pendiente de revisión

La rama `feature/auditoria-lean-10-capturas` implementa la auditoría visual aprobada por el usuario: referencias fundidas automáticas y editables, resultados calculables, secado filtrado, evidencias y avisos contextuales, y aprendizaje integrado con acordeón exclusivo. No modifica los siete motores, el catálogo ni las versiones archivadas. **Esta auditoría no se publica ni se fusiona**.

[Informe por requisito P0-01 a P0-10](docs/auditoria-lean-10-capturas.md) · [Capturas de los cambios](docs/capturas/lean/README.md) · [Diez capturas originales](docs/capturas/lean-originales/integrity.json)

## Inyección — referencias fundidas y perfil físico (para revisión)

La rama `feature/ux-lean-materiales-v1.5`, basada en `audit/materiales-minimo-3-propiedades`, incorpora referencias genéricas de densidad fundida con aceptación explícita, edición manual y modo «solo datos verificados». El cálculo por masa sigue funcionando sin densidad. La biblioteca comercial no cambia.

En **avanzado** se añade el perfil geométrico físico **L1/L2/L3**, opcional y distinto de los tres niveles: porcentajes 30/50/20 editables que deben sumar 100, gráfico, volúmenes, recorridos individuales/acumulados y coordenadas únicamente con origen y sentido definidos. Se usa la dosificación sin reserva ni colchón automático, sin inventar velocidades o presiones.

Consulta [fórmulas, fuentes, límites y pruebas](docs/inyeccion-densidad-perfil-v1.5.md). El usuario autorizó posteriormente publicar conservando la web anterior; véase el [registro de publicación y copias](docs/despliegue-inyeccion-2026-10-15.md). No se fusiona `main`.

## Catálogo depurado v1.4 — base histórica de las 73 identidades (15/10/2026)

**Prioridad: calidad sobre cantidad.** Tras auditar 99 registros históricos, el catálogo seleccionable contiene **64 grados comerciales con un mínimo de tres propiedades numéricas atribuidas a fabricante** y **9 perfiles genéricos exclusivamente manuales**. Se retiraron **26 grados sin datos suficientes**; esos registros ya no están disponibles para nuevas selecciones.

- [Informe técnico con nombres y justificación de los 31 excluidos](docs/INFORME_AUDITORIA_MATERIALES_V1_4.md).
- [Matriz JSON de trazabilidad por los 99 registros evaluados](docs/auditoria-estricta-materiales-v1.4.json).
- **Aclaración:** el archivo `docs/cobertura-99-materiales-y-fuentes.md` es la fotografía histórica anterior a esta auditoría y no refleja el catálogo vigente.
- Se mantienen entradas «GENÉRICO» sin propiedades propias de ficha para HDPE, LLDPE, LDPE, PP, PET, PVC, ABS, PA6 y PC. En esta rama se ofrece una referencia fundida **separada**, solo con aceptación explícita y fuera del modo «solo datos verificados». No se infiere una propiedad del grado.
- Los valores son típicos de ficha y solo se comparan bajo métodos, carga, temperatura, presentación y condiciones equivalentes. No son certificados de lote ni validación industrial.
- El filtrado no elimina el historial local de cálculos ni materiales propios ya guardados.
- Antes de publicar, comprobar los trabajos unitarios y de Playwright y revisar las fuentes exactas con el CCIP.



Proyecto académico independiente para **Procesos de Transformación I (CCIP / INTEC)**. Código web completamente nuevo; no se ha modificado el repositorio de la calculadora original.

## Modelos incluidos
- Moldeo por inyección: shot por masa o volumen; capacidad geométrica, utilización, carrera, fuerza de cierre, llenado y plastificación.
- Extrusión: caudal de láminas y tubos, productividad, tiempo de residencia nominal y potencia con energía específica ingresada.
- Película soplada: BUR, DDR geométrico ideal y producción.
- Soplado de envases: geometría cilíndrica ideal, masa y productividad.
- Termoformado: consumo de lámina, espesor medio aproximado y productividad.
- Secado: dimensionamiento nominal de tolva y calentamiento sensible mínimo.
- Producción y costos: producción, consumo, costo directo parcial.

## Funcionalidad
- Tres niveles de detalle: básico, técnico, avanzado; cada uno activa nuevas entradas. Los datos ocultos no participan en el cálculo.
- Las propiedades y los parámetros de máquina sin fuente permanecen vacíos; los datos de catálogo se aplican solo a campos compatibles y tras confirmar condiciones; las dimensiones y cantidades precargadas son ejemplos editables.
- Ayudas «?» al pasar el cursor, enfocar o tocar; fórmulas completas en resultados desplegables.
- Logo CCIP y ficha de materiales compacta. V1 conservada como web y ZIP mediante URL directa; sin enlaces históricos en la interfaz actual.
- Catálogo V1.3 con 90 identidades comerciales propuestas y 9 genéricos (99 perfiles), selección familia → fabricante → grado, fuentes y condiciones locales. **La confirmación oficial de las 90 identidades sigue pendiente por bloqueo de red**; nueve perfiles conservan la documentación aportada en V1.2.
- Autocompletado condicionado de propiedades compatibles, rangos elegidos explícitamente y overrides manuales trazables.
- Historial/JSON conserva identidad del grado, fuente, auditoría, referencias pVT y snapshot de propiedades utilizadas.
- Gráfica pVT orientativa de ABS, fuentes de PC y referencia B3S para PA6: densidad automática deshabilitada.
- Modo avanzado para registrar T/P y fuente de densidad manual, o fase/intervalo/fuente de Cp.
- Resultados pendientes si faltan datos: **no se inventan propiedades**. Densidad fundida y calor específico siguen pendientes en los 90 perfiles comerciales; los datos propios requieren declaración de fase, fuente y condiciones.
- Advertencias y limitaciones del modelo.
- Historial de hasta 60 resultados en el navegador (localStorage).
- Exportación JSON con entradas, resultados, fórmulas y fecha; útil para futura app Flutter.
- Interfaz adaptable a pantallas móviles.

## Ejecutar
Usa un servidor estático, por ejemplo `python -m http.server 8000`, y abre `http://localhost:8000`. Los módulos JavaScript necesitan servidor local y no deben abrirse con `file://`.

Para ejecutar las pruebas del motor, niveles, entradas e historial: `npm test` (requiere Node.js 18 o superior; no requiere instalar paquetes).

Integración de interfaz opcional: `python3 tests/browser_smoke.py`, con Python, Playwright y Chromium disponibles. En una máquina nueva instala Playwright (`python3 -m pip install -r tests/requirements.txt`) y su navegador (`python3 -m playwright install chromium`); si Chromium ya está instalado, se reutiliza. `CCIP_CHROMIUM` permite indicar su ejecutable y `CCIP_TEST_ARTIFACTS` un directorio de capturas. La prueba inicia su propio servidor local y no publica nada. Comprueba nueve variantes × tres niveles × cinco tamaños, más nueve perfiles documentados × tres procesos × tres niveles × escritorio/móvil; los 99 perfiles, cambios de idioma y materiales propios también se comprueban; también edición, fuentes, rangos, overrides, historial, JSON y cálculo offline tras cargar recursos.

La V1.3 se desarrolla en `feature/catalogo-90-i18n-formulas`, [PR #2](https://github.com/vittoriovenetto/CCIP-Calculadoras-Procesos-Plasticos/pull/2) hacia `feature/web-v1-modular`. El usuario autorizó su publicación experimental en GitHub Pages el 2026-10-14, manteniendo el PR abierto y `main` sin fusionar. Véase el [registro de despliegue](docs/despliegue.md). La primera visita empieza en español; después se conserva el idioma elegido cuando el navegador permite almacenamiento.

[Aplicación actual](https://vittoriovenetto.github.io/CCIP-Calculadoras-Procesos-Plasticos/) · [Abrir V1 conservada](https://vittoriovenetto.github.io/CCIP-Calculadoras-Procesos-Plasticos/versions/v1/) · [Descargar archivos V1](https://vittoriovenetto.github.io/CCIP-Calculadoras-Procesos-Plasticos/downloads/CCIP-Web-V1.zip)

La [documentación del rediseño y conservación](docs/rediseno-y-versiones.md) distingue versiones históricas, niveles de cálculo y biblioteca. La original se aproxima a técnico con funciones avanzadas: consulta la [comparación de funciones y ecuaciones](docs/comparacion-original.md).

## Estructura
- `index.html`: HTML de entrada.
- `src/app.js`: navegación, controles y almacenamiento local.
- `src/schema.js`: catálogo de parámetros, niveles y descripciones.
- `src/engine.js`: registro de modelos y validación de entradas.
- `src/models/`: motor independiente de cada proceso y notas técnicas.
- `src/math.js`: conversiones numéricas y división segura.
- `src/data/materials.v1.3.json`: catálogo activo con 99 perfiles y estado documental explícito. V1.0/V1.1/V1.2 permanecen conservadas.
- `src/custom-materials.js`: propiedades personales, conversiones, importación/exportación y almacenamiento validado.
- `src/i18n*.js`: presentación ES/EN, separada de entradas y cálculo.
- `src/formulas-data.js`, `src/formulas-index.js`, `src/formula-learning.js` y `formulas.html`: 42 salidas explicadas, área auxiliar y ejemplos sintéticos de las nueve variantes.
- `src/pvt.js`: validación y copia de referencias documentales, sin lookup de densidad.
- `src/materials-audit-view.js`: referencias bloqueadas, gráfica orientativa y controles manuales.
- `src/materials.js`: selección, compatibilidad, autocompletado y snapshots.
- `src/materials-view.js`: selector, ficha y advertencias.
- `docs/materiales.md`: reglas de biblioteca, trazabilidad y pruebas.
- `src/history.js`: lectura validada del historial.
- `src/styles.css`: estilos responsivos.
- `src/presentation.js` y `src/tooltips.js`: grupos de campos, métricas principales y ayudas; separados del motor.
- `versions/v1/` y `downloads/CCIP-Web-V1.zip`: aplicación anterior congelada y código completo; integridad documentada en `versions/v1-integrity.json`.
- `tests/`: pruebas de referencia, dominios/niveles, historial e integración de navegador.
- `docs/modelos.md`: ecuaciones, unidades, dominios, límites y validación técnica necesaria.
- `docs/arquitectura.md`: contrato y extensión de calculadoras.
- `docs/auditoria.md`: hallazgos y resultados de verificación.

## Limitaciones técnicas
Los cálculos **son modelos simplificados y no están validados para operación industrial**. La precisión depende del grado comercial, las mediciones y las condiciones de proceso. La densidad del fundido no se puede sustituir automáticamente por la densidad del sólido. La capacidad de inyección calculada es geométrica ideal, no una homologación de máquina; el margen de shot no equivale al colchón residual.

La película supone dos paredes uniformes sin pérdidas. El DDR geométrico no contempla hinchamiento. Los balances de extrusión no predicen rendimiento a partir de RPM. El secado no modela humedad final ni evaporación. El costo directo parcial omite gastos indirectos.

## Pendientes de validación
1. Revisar las hipótesis de cada ecuación con bibliografía y manuales del CCIP.
2. Comprobar casos de prueba con equipos y grados reales.
3. Ampliar la biblioteca documentada y completar pVT/densidad fundida, cp(T) y secado faltante, con fichas vigentes y condiciones de ensayo.
4. Incorporar perfiles de máquina, reportes PDF/Excel, simulaciones y herramientas inversas.
5. Obtener conformidad para identidad gráfica institucional definitiva.

**Importante:** la app Flutter será otro proyecto; ambos pueden compartir especificaciones matemáticas y pruebas, no el mismo código JavaScript.

Consulta [modelos y validación técnica](docs/modelos.md), [arquitectura modular](docs/arquitectura.md) y [auditoría y pruebas](docs/auditoria.md) antes de utilizar resultados fuera de un ejercicio académico.

Consulta [biblioteca de materiales y reglas de aplicación](docs/materiales.md) para conocer los nueve grados, condiciones, niveles y propiedades pendientes.

La [auditoría V1.1 / referencias pVT V1.2](docs/auditoria-materiales-v1.2.md) detalla datos incorporados, controles de calidad, pruebas y validaciones pendientes.

## V1.3 — finalización y revisión

- 10 referencias comerciales propuestas por familia HDPE, LDPE, LLDPE, PP, PET, PVC, ABS, PA6 y PC, más 9 genéricos sin propiedades supuestas. Las 90 identidades no se presentan como fichas verificadas.
- Crear, editar, eliminar, seleccionar, exportar e importar materiales propios. Cada propiedad mantiene unidad introducida y canónica, fase, fuente, método y condiciones. Para densidad aparente propia también se declara pellets/polvo: no se deduce de la familia PVC. Datos no verificados por CCIP, guardados solo localmente.
- Validación de JSON, versión, nombres/ID duplicados, unidades, límites, fases y URLs. Importación atómica; registros corruptos no impiden usar los válidos ni calcular. Los materiales propios no pueden sobrescribir fichas originales.
- ES/EN en controles, ayudas, fichas, ecuaciones, resultados, errores y límites. Cambiar idioma conserva parámetros, resultados y borradores. La preferencia se guarda cuando el navegador permite almacenamiento. Los nombres comerciales y textos escritos por el usuario conservan su contenido original.
- Acceso «Aprendizaje» en el menú lateral a una página independiente, con filtros por proceso/nivel y enlaces desde cada resultado. Guía con 42 explicaciones de resultados y área auxiliar del husillo: variables, unidades, conversiones, ejemplos paso a paso, límites y referencias. Incluye dosificación por volumen y extrusión de tubo, ampliando las 26 explicaciones iniciales.
- Pruebas finales: **500 Node + 24 Playwright**, 135 estados de cálculo, 162 de biblioteca inicial, 99 perfiles y 27 casos ES/EN/ES; validación adicional del historial V1.3 recuperado desde V1 congelada. Véase [informe](docs/auditoria-v1.3-final.md) para resultados ejecutados y alcance.

[Aprendizaje de fórmulas](docs/aprendizaje-formulas.md) · [Capturas V1.3](docs/capturas/v1.3/README.md) · [Auditoría individual de fuentes](docs/auditoria-fuentes-v1.3.json)

Reconsulta documental reproducible, sin modificar el catálogo:

```sh
python3 scripts/audit-material-sources.py --output /tmp/ccip-sources.json
```

Las 61 consultas declaradas (incluidas referencias pVT y SI) quedaron bloqueadas por el túnel de red 403. Esto no prueba que los sitios respondan 404. Los dos valores nuevos Dow sin comprobación directa se conservan como referencias históricas sin autocompletado; las 34 propiedades aportadas en los nueve perfiles V1.2 mantienen su procedencia documental, sin recertificación oficial actual. No se cambió ninguna ecuación del motor.

La publicación experimental fue autorizada por el usuario; no certifica el catálogo ni los resultados. Continúan pendientes la confirmación de fuentes/identidades, datos con condiciones admisibles y revisión de casos reales. Safari/Firefox, dispositivos físicos y validación industrial siguen pendientes. El PR permanece para revisión; no se autorizó fusionarlo a `main`.

## Desarrollo experimental — buscador, comparador y fichas (15/10/2026)

La rama `feature/buscador-comparador-catalogo` añade funciones **sin sustituir la página publicada**:

- Buscador por familia, fabricante y nombre/grado, coincidencia parcial insensible a mayúsculas y acentos; filtros de familia, fabricante y presencia de propiedades registradas. Los selectores clásicos se conservan.
- Panel **Comparar resultados** con dos cálculos guardados del mismo proceso. Muestra unidades, resultados y diferencias (B-A y %). No compara números de unidades incompatibles y no recalcula snapshots antiguos.
- Exportación de comparaciones a CSV (compatible con Excel), JSON técnico y `Imprimir / Guardar como PDF` mediante el navegador. **No genera XLSX nativo**.
- Catálogo ampliado: los 99 perfiles conservados, con 26 grados comercialmente identificados con datos parciales de fabricante (20 Dow, 2 PP LYB, 1 PA6 BASF, 2 PC Covestro y 1 ABS INEOS). Las nueve opciones GENÉRICAS no heredan propiedades; los demás grados permanecen incompletos.
- Condiciones de MFR y MVR (carga y temperatura), densidades sólidas y propiedades adicionales solo con fuente de grado exacto.
- [Matriz de cobertura de los 99 perfiles](docs/cobertura-99-materiales-y-fuentes.md): estado, valores y vínculos a la ficha/fabricante.

**Antes de publicar:** revisar pruebas CI Node/Playwright, verificar fichas grado a grado, probar guardado/comparación y exportación en móvil, y aprobar un pull request. No reutilizar datos de otro grado. El documento de cobertura no equivale a certificados de lote.
