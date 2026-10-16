# Etapa 4 — Biblioteca y aportes de materiales

Base aceptada: `7de3816d4a8c8b215848d68d9433e6172040d561`, PR #12,
`feature/etapa-3-materiales-fluidez-reciclados`.
Rama de trabajo: `feature/etapa-4-explorador-aportes`.
Fecha de comprobación: 16 de octubre de 2026 (America/Santo_Domingo).

Esta entrega implementa las fases A–E del [pedido recibido](especificacion.md).
No cambia las 73 identidades originales, la evidencia de Etapa 3, los siete motores,
las versiones archivadas ni la página publicada. No incorpora grados vírgenes nuevos.

## Consulta

El acceso **Materiales** está junto a Calculadora y Aprendizaje. La biblioteca conserva
el caso activo al entrar/salir, el idioma, los borradores sin guardar y el historial
atrás/adelante. Las fichas admiten enlaces `?view=materials&material=ID`.
La carga documental es independiente de los cálculos manuales.

La vista reúne, mediante sus identificadores, catálogo, investigación y reología:

- 73 identidades originales: 64 grados comerciales y 9 perfiles genéricos.
- 47 grados con evidencia adicional de Etapa 3; 17 sin enriquecimiento numérico adicional.
- 15 formulaciones experimentales en categoría separada, con estudio y composición.
- Formulaciones locales que existan en el caso, sesiones o snapshots del historial.
- Registros locales y aportes compartidos revisados, diferenciados por origen.

Investigar una identidad no equivale a verificar íntegramente sus propiedades.
Los dos registros oficiales de GP-35 (ASTM MFR / ISO MVR) permanecen independientes,
con condiciones, unidades, región/variante y referencias. No se infieren propiedades
faltantes, viscosidad a partir de MFR, ni densidad fundida a partir de densidad sólida.

Los filtros se combinan: texto, familia, fabricante, nombre/grado, proceso documentado,
categoría, tipo virgen/reciclado/mezcla, estado, propiedad, grupo y disponibilidad.
Orden por nombre, familia, fabricante, cantidad de registros o evidencia. El recuento
incluye los resultados completos; las tarjetas se muestran por lotes de 12.
Una categoría sin registros (por ejemplo reciclados comerciales documentados) devuelve
cero, sin inventar representantes.

Las fichas agrupan identidad, física, mecánica, térmica, reología, procesamiento y fuentes.
Las mediciones MFR/MVR se conservan por ensayo. La única curva disponible sigue siendo
la digitalización aproximada pVT de GP-22, con advertencia de visualización exclusivamente.
No se crean curvas a partir de puntos insuficientes ni se alimenta el motor con esa figura.

El comparador independiente admite 2–4 materiales y muestra todas sus parejas. Mantiene
separadas las mediciones con unidades, fases, normas o condiciones incompatibles; una
condición desconocida impide declarar equivalencia. No clasifica materiales mejores/peores.
Excel, PDF y JSON contienen los registros, condiciones, fuentes y comparabilidad; reutilizan
los generadores de Etapa 2 sin modificar los informes de cálculos anteriores.

## Materiales propios

La categoría visible es **Agregado por usuarios** (User added en inglés). La familia
química sigue siendo una de las nueve familias controladas. El editor existente añade
subfamilia, código, lote, procedencia, tipo/origen de reciclado, formulación, presentación,
aplicaciones, observaciones y declaración de dato no verificado. Permite borradores con
identidad y sin ninguna propiedad. Las propiedades adicionales son campos de entrada,
no valores numéricos asignados por CCIP.

Cada propiedad conserva unidad original/canónica, fase, fuente, URL, norma/método,
condición, T, P, carga, acondicionamiento, muestra y fecha. Se mantiene el almacenamiento
`ccip-user-materials-v1`, importación/exportación y edición del mismo ID con revisión y
fechas. Los importadores normalizan y descartan supuestas aprobaciones o fuentes de fabricante.

La integración con cálculos exige fases y condiciones compatibles. Las densidades y Cp
de usuario sin fuente/condiciones suficientes quedan pendientes; una declaración explícita
de compatibilidad sigue disponible. Los reciclados/mezclas de usuario no reciben la densidad
fundida genérica del polímero virgen. El método gravimétrico continúa sin exigir densidad.
No se cambiaron fórmulas de los motores ni modelos de secado.

Los snapshots guardados conservan identidad, revisión, origen local/compartido, propiedades,
fuentes y metadatos de revisión. Excel/PDF incluyen la trazabilidad de materiales de usuario.
Editar desde la biblioteca no cambia silenciosamente el caso activo ni los cálculos guardados.

## Aportes y persistencia

El catálogo versionado [user-materials.v1.json](../../src/data/user-materials.v1.json) empieza
vacío: no hay aportes sintéticos presentados como aprobados. Los registros revisados que se
incorporen a ese archivo estarán disponibles en otros dispositivos después de una publicación
revisada futura. No hay sincronización automática de borradores ni de Issues pendientes.

Flujo real: guardar local → preparar JSON validado y vista previa pública → abrir GitHub →
autenticarse y pulsar **Submit new issue** allí → pegar la URL → comprobar recepción con la
API pública del repositorio. La aplicación coteja repositorio, número, ID de propuesta y
SHA-256 del contenido normalizado. Abrir el formulario o descargar un JSON nunca implica
que el envío exista. Si la URL sería demasiado larga, ofrece copiar/pegar el cuerpo completo.
Las propuestas preparadas pueden recuperarse tras recargar, sin cambiar su identificador.

Estados: local; propuesta preparada sin recepción; recepción verificada pendiente de revisión;
actualización pendiente; requiere correcciones; rechazado; aprobado como aporte solamente
cuando existe en el catálogo compartido. Las etiquetas `ccip-requires-corrections` y
`ccip-rejected` informan esos estados remotos. Ninguna etiqueta de Issue confiere aprobación.
Un error de red/API, límite de consultas o contenido distinto conserva la falta de confirmación.
La aprobación documental de un aporte no es certificación industrial.

Si coincide un ID local/compartido y difieren contenido o revisión, prevalece el compartido en
el selector de cálculo, se conserva el borrador conflictivo con ficha aparte y se muestra la
advertencia. El usuario puede editarlo, conservar una copia con ID distinto o proponer una
actualización del mismo ID. También se detecta el mismo nombre/familia con ID distinto.
La propuesta de actualización exige confirmar la revisión compartida base; el procesador vuelve
a comprobarla contra la biblioteca vigente. No se sobrescriben snapshots ni el catálogo original.

## Automatización preparada; activación pendiente

Consultar [protocolo y activación](aportes-github.md). El workflow está preparado y probado
con respuestas controladas, pero **no está operativo para Issues en la rama predeterminada**.
No se ha cambiado `main`, creado Issues de prueba públicos, publicado ni fusionado nada.
El envío web de Issues y la comprobación API son independientes de esa activación.

La validación de solo lectura produce un informe. Un mantenedor puede solicitar por
`workflow_dispatch` un PR borrador con una propuesta JSON en `.github/material-proposals/`.
El job de escritura vuelve a consultar/validar el Issue y no modifica el catálogo activo,
no ejecuta su contenido y no aprueba ni fusiona. La promoción posterior exige revisión humana,
revisión base vigente y un diff local explícito del archivo compartido con historial.

## Evidencia de validación y límites

Resultados y capturas: [validación](validacion.md). Los ensayos sintéticos están únicamente en
las pruebas o respuestas controladas. No representan ensayos industriales ni nuevos grados.
Las condiciones desconocidas siguen visibles como ausentes; no hay validación de desempeño,
compatibilidad de formulaciones ni certificación de lote. Los límites conservadores del
comparador pueden impedir una comparación que requiera revisión técnica adicional.
