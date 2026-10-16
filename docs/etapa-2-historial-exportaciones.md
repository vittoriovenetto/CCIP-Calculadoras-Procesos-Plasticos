# Etapa 2 — gestión de cálculos y exportaciones

Base funcional: `b3d41a3a92110e8abdf53d2a2dd11a5f758a782a`, rama `feature/etapa-1-identidad-aprendizaje`, PR #10. Se verificaron su divisor móvil horizontal, selector móvil de siete procesos y las dos ejecuciones CI satisfactorias antes de crear `feature/etapa-2-historial-exportaciones`. El nuevo PR tiene como base la rama de Etapa 1, no `main`.

## Uso

- **Guardar cálculo** abre un diálogo. **Guardar como nuevo** exige nombre y siempre crea otro ID, incluso con nombres repetidos. El diálogo comienza en esta opción.
- **Sobrescribir existente** ofrece únicamente cálculos del mismo proceso, con nombre, proceso, modificación y grado. Muestra el destino y exige marcar su confirmación. Conserva ID, nombre y creación; actualiza el snapshot y la modificación.
- Recuperar recuerda el ID. Se pueden editar parámetros, calcular, guardar una copia o sobrescribir explícitamente. Calcular y exportar nunca sobrescriben el registro.
- Cada fila permite recuperar, renombrar, eliminar y exportar JSON/Excel/PDF. Eliminar solicita confirmación con el nombre y afecta solo al ID elegido. Si estaba seleccionado en la comparación, se vacía esa selección sin sustituirla por otro caso.
- Se muestran inicialmente 15 filas, con **Mostrar más** hasta las 60 disponibles. Al llegar a 60 se rechaza una nueva alta; se puede sobrescribir o eliminar explícitamente. No se descartan registros antiguos para hacer espacio.
- El control compacto junto a los botones de cálculo exporta el estado activo, identificado como tal. Exportar un registro del historial usa directamente su snapshot, aunque el estado activo y el catálogo sean distintos.

## Almacenamiento y compatibilidad

Se mantiene la clave `ccip-calculators-web-v1` y un arreglo JSON compatible con los lectores anteriores. No se altera la biblioteca de materiales, los motores ni los archivos archivados.

| Campo | Significado |
| --- | --- |
| `id` | UUID de nuevas altas; ID determinista persistido para registros heredados |
| `name` | Nombre del usuario, 1–120 caracteres; no se traduce ni se usa como identidad |
| `created_at` | ISO 8601 de creación; para legados se conserva `date` |
| `updated_at` | ISO 8601 de última escritura; sobrescribir/renombrar lo actualiza |
| `date` | Fecha del cálculo del snapshot; conservada al renombrar |
| `module`, `level`, `inputs`, `metrics` | Proceso, nivel, entradas originales y resultados originales |
| `material` | Grado, propiedades utilizadas, procedencias, contexto y referencias capturadas |
| `warnings`, `notes`, `input_issues` | Advertencias, supuestos, limitaciones y entradas inválidas |
| `calculation_metadata` | Versión `ccip-calculation/2` y procedencia de entradas: ejemplo precargado o manual |
| Campos adicionales | Se conservan perfiles, densidad, fuentes y otros campos desconocidos del legado |

La migración añade únicamente identidad y fechas faltantes, y repara IDs duplicados. No recalcula ni normaliza entradas o resultados. Las entradas inválidas/desconocidas del arreglo se conservan en almacenamiento aunque no se presenten como cálculos recuperables. Un legado excepcional con más de 60 registros conserva todos sus bytes de datos; se muestran como máximo 60 y no se permiten nuevas altas.

Las escrituras comprueban que el contenido no haya cambiado desde la lectura y verifican el resultado de `setItem`. Un fallo de permisos, cuota, JSON inválido o cambio concurrente se informa sin anunciar éxito ni truncar registros. Si falla la persistencia de la migración, sus IDs provisorios son deterministas y se informa del error. El cálculo y la exportación activa siguen disponibles sin almacenamiento. La comprobación entre pestañas es preventiva: `localStorage` no proporciona transacciones entre ventanas ni un bloqueo distribuido.

Para volver a un lector anterior se puede conservar el mismo arreglo: ignora los campos nuevos. Las operaciones realizadas en una versión antigua no garantizan conservar IDs (ni las reglas nuevas de sobrescritura). Exportar JSON permite guardar una copia independiente; no se ha añadido importación de historial en esta etapa.

## Exportaciones

`export-data.js` prepara una copia común; no importa el motor ni consulta el catálogo. `export-file.js` descarga el archivo. Los generadores separados cargan sus dependencias solo al seleccionar el formato correspondiente.

**Excel real (OOXML)**: Resumen, Parámetros, Resultados, Fuentes y observaciones, y hoja L1/L2/L3 cuando existe. Encabezados congelados, colores institucionales, columnas con ajuste de texto. Las cantidades son celdas numéricas; cada entrada conserva además su representación original de texto. Ausentes e inválidos se indican como no disponibles, nunca como cero. Notas mayores de 30.000 caracteres continúan en filas sucesivas. Nombres y textos son celdas de texto explícitas, incluso si empiezan por `=`, `+`, `-` o `@`; no se crean objetos de fórmula.

**PDF real**: reporte independiente A4 con información del caso, entradas, resultados, perfil si procede, observaciones, procedencias y fuentes. Incluye paginación, encabezados de tabla repetidos y enlaces HTTPS seguros cuando corresponda. Las notas largas continúan en varias páginas; textos extensos de tabla se dividen en filas de continuación. La tipografía local conserva tildes y los símbolos matemáticos utilizados por los modelos. No usa la impresión de la pantalla ni un conversor remoto.

**JSON**: conserva el snapshot y añade `export_metadata` con idioma, fecha de exportación, `status: active|saved` y `based_on_id` cuando el estado activo procede de un registro del mismo proceso. La exportación activa no se presenta como registro guardado. El historial exportado conserva ID, nombre y fechas originales.

Las referencias de familia siguen identificadas como estimaciones; no se confunden con propiedades certificadas de grado. Se preservan fuente, condiciones, política de densidad, aceptación, ausencia de corrección térmica y evaluación del perfil. Si un legado no registra el origen de una entrada, el reporte declara **origen no registrado** en lugar de inferirlo. Los textos técnicos capturados se conservan; los rótulos disponibles se traducen según ES/EN.

CSV/JSON e impresión del comparador se mantienen. La selección automática inicial usa dos IDs distintos, aunque el segundo registro se añada después del primero; las selecciones explícitas se conservan. Se pospone el Excel de varios registros: era opcional y requeriría introducir una selección adicional en el historial. La comparación de dos casos sigue disponible.

## Dependencias locales

| Componente | Versión / licencia | Motivo |
| --- | --- | --- |
| ExcelJS | 4.4.0 / MIT | Escritura OOXML en navegador, números y textos explícitos, estilos, varias hojas; API estable. Es la última versión estable consultada, publicada en 2023, y exige revisión periódica de mantenimiento |
| pdfmake | 0.3.11 / MIT | Reportes estructurados, tablas, paginación A4, fuentes incorporadas y descarga directa; versión publicada en 2026 |
| DejaVu Sans normal/negrita | 2.37 / Bitstream Vera, modificaciones DejaVu de dominio público | Cobertura comprobada de español, inglés y símbolos `π ρ Δ ᵢ ₘ ₛ ³ ² − × µ ° ≤ ≥` |

Los bundles oficiales se descargaron del registro npm verificando SHA-512 contra `dist.integrity`. Las copias locales y licencias tienen SHA-256 en [manifest.json](../src/vendor/manifest.json), comprobado en pruebas. Se incluye también la licencia del SVG-to-PDFKit incorporado en pdfmake. No se modifican los bundles.

La carga inicial no descarga bundles ni fuentes. Excel añade aproximadamente 0,95 MB sin comprimir cuando se utiliza; PDF añade 1,05 MB de biblioteca y 1,47 MB de fuentes, una sola vez por sesión. Ningún cálculo se envía fuera del navegador. Las rutas relativas funcionan también bajo los recursos versionados por SHA del artefacto Pages.

## Validación y evidencias

Comandos reproducibles desde la raíz (Node 24, Python 3.12, Chromium):

```sh
python -m pip install -r tests/requirements.txt
python -m playwright install chromium
npm test
CCIP_TEST_ARTIFACTS=test-artifacts python tests/browser_smoke.py
CCIP_TEST_ARTIFACTS=test-artifacts/etapa-2 python tests/browser_stage2.py
npm run build:pages
python tests/browser_pages_cache.py
```

El build exige los archivos de aplicación confirmados en Git. Solo construye `dist`; no publica. El workflow ejecuta estas validaciones y conserva capturas/logs como artefactos durante 30 días.

- Pruebas unitarias: **571 satisfactorias**. Migración, nombres repetidos, IDs, sobrescritura, preservación de campos desconocidos, eliminación, 60 registros, cuota, permisos, corrupción, escrituras ignoradas y cambio concurrente. Preparación de exportaciones y SHA-256 de dependencias.
- Regresión de navegador: 42 pruebas; 135 estados proceso/variante × nivel × pantalla, 73 perfiles de materiales y 27 cambios ES/EN/ES. Incluye materiales propios, secado, aprendizaje, comparación, archivos archivados e identidad móvil.
- Etapa 2: 6 pruebas de integración; operaciones reales de almacenamiento, cancelaciones, conservación del comparador, 15/30/45/60 filas, ausencia de sobrescritura al calcular y fallos de generación recuperables.
- Matriz de exportación: 7 procesos × ES/EN × activo/guardado × XLSX/PDF = **56 archivos**, más los JSON históricos. Excel leído con **openpyxl**, PDF con **pypdf y PyMuPDF**. Se comprueban cifras, entradas originales, unidades, hojas, ausencia de fórmulas inyectadas, A4, límites geométricos del texto y pies numerados en todas las páginas.
- Informe histórico adicional: resultados deliberadamente diferentes del estado actual, precisión numérica, entradas con ceros iniciales, datos ausentes, fuente HTTPS, nombre `=HYPERLINK(...)`, símbolos y más de 10.000 caracteres de advertencias distribuidos en tres páginas. El snapshot permanece intacto.
- Perfil con HDPE: referencia Reiloy 0,73 g/cm³, procedencia y carácter orientativo, hoja de tres etapas y aviso de estimación en PDF.
- Capturas ES/EN en 360, 390, 540, 768, 1024 y 1440 px, sin desbordamiento. Artefacto construido comprobado también con caché antigua y generación diferida de XLSX/PDF.

[Resultados de ejecución](capturas/etapa-2/resultados.txt).

| Evidencia | Captura |
| --- | --- |
| Guardar en móvil, 390 px | [Abrir](capturas/etapa-2/guardar-es-390.png) |
| Historial en móvil, 390 px | [Abrir](capturas/etapa-2/historial-es-390.png) |
| Historial en tableta, 768 px | [Abrir](capturas/etapa-2/historial-es-768.png) |
| Guardar en escritorio, 1440 px | [Abrir](capturas/etapa-2/guardar-es-1440.png) |
| Historial en escritorio, 1440 px | [Abrir](capturas/etapa-2/historial-es-1440.png) |
| Historial en inglés, 1440 px | [Abrir](capturas/etapa-2/historial-en-1440.png) |

[Ejemplo XLSX](ejemplos/etapa-2/inyeccion-ejemplo-academico.xlsx) · [Ejemplo PDF](ejemplos/etapa-2/inyeccion-ejemplo-academico.pdf). Son casos académicos con entradas didácticas y densidad genérica identificada; no datos de una máquina ni validación de proceso industrial.

## Límites pendientes

- Los modelos conservan sus límites técnicos originales; guardar/exportar no valida una configuración de máquina ni certifica una propiedad.
- Lectura estructural y visual comprobada con herramientas independientes. No se ha abierto esta entrega en las aplicaciones propietarias Microsoft Excel/Acrobat ni probado Safari/iOS o Firefox en dispositivos físicos.
- Excel utiliza su precisión numérica habitual (aproximadamente 15 cifras significativas). La columna de entrada original y JSON preservan las cadenas introducidas.
- El historial es local al navegador/origen, con el mismo límite de cuota existente; cambiar de dispositivo o borrar datos del navegador no lo sincroniza.
- Exportar confirma la generación e inicio de descarga, no puede comprobar que el usuario haya conservado el archivo en su sistema operativo.

No se modifican los motores, esquema de parámetros, 73 materiales, secado, fórmulas de aprendizaje, logotipos, créditos ni versiones archivadas. No se realizan merge, deploy, cambios en `gh-pages` ni etapas 3–8.
