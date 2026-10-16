# CCIP — ETAPA 4
## Explorador integral de materiales y persistencia de materiales agregados por usuarios en GitHub

### OBJETIVO GENERAL

Implementar la Etapa 4 del plan maestro de desarrollo de:

**Calculadora de procesos de transformación termoplásticos — CCIP / INTEC**

Esta etapa tiene dos objetivos obligatorios:

1. Crear un apartado independiente, semejante al apartado de Aprendizaje, para consultar, buscar, filtrar, comparar y analizar los materiales y sus propiedades técnicas.
2. Permitir que los usuarios agreguen y editen materiales propios, y puedan enviar esos cambios a GitHub para formar parte de una biblioteca compartida, no limitada al navegador donde se introdujeron.

La categoría visible de dichos materiales se llamará exactamente:

**Agregado por usuarios**

Mantener la arquitectura web estática, la interfaz Lean, español/inglés y la trazabilidad técnica desarrollada en las etapas anteriores.

---

# 1. REPOSITORIO Y RAMA DE TRABAJO

Repositorio:

`vittoriovenetto/CCIP-Calculadoras-Procesos-Plasticos`

PR de la Etapa 3:

https://github.com/vittoriovenetto/CCIP-Calculadoras-Procesos-Plasticos/pull/12

Rama de partida:

`feature/etapa-3-materiales-fluidez-reciclados`

Antes de comenzar:

1. Revisar el estado más reciente del PR #12.
2. Confirmar si se realizaron correcciones documentales posteriores, especialmente las de Terluran GP-35.
3. Identificar el último commit funcional.
4. Ejecutar las pruebas existentes.
5. Crear una rama nueva para esta etapa.
6. Abrir un PR contra la rama de la Etapa 3.

Conservar la cadena de PR existente.

No partir de `main` si no contiene el código más reciente.

No hacer merge ni deploy.

---

# 2. ESTADO ACTUAL DEL SISTEMA

El proyecto dispone de:

- Biblioteca original de 73 registros.
- 64 grados comerciales.
- 9 perfiles genéricos.
- Extensión documental de investigación.
- Biblioteca reológica.
- Evidencia de materiales reciclados.
- Formulaciones V/R.
- Buscador de materiales dentro de la calculadora.
- Editor de materiales personalizados.
- Historial con identificadores persistentes.
- Exportaciones Excel, PDF y JSON.
- Apartado de Aprendizaje.

Revisar especialmente:

- `src/custom-materials.js`
- `src/material-search.js`
- `src/material-search-ui.js`
- `src/materials.js`
- `src/materials-view.js`
- `src/material-research-view.js`
- `src/research-data.js`
- `src/rheology.js`
- `src/recycled.js`
- `src/recycled-view.js`
- `src/app.js`
- `src/i18n.js`
- `src/styles.css`
- `index.html`

No crear otro sistema independiente de propiedades si es posible reutilizar los modelos existentes.

---

# FASE A — EXPLORADOR INDEPENDIENTE DE MATERIALES

## 3. CREAR UN APARTADO NUEVO

Añadir un apartado principal denominado:

**Materiales**

Su acceso debe estar junto a la navegación principal, con una jerarquía visual coherente con Aprendizaje.

Debe ser posible cambiar entre:

- Calculadora.
- Aprendizaje.
- Materiales.

No eliminar el selector de materiales que actualmente funciona dentro de cada calculadora.

La nueva sección es una herramienta de consulta más completa, no un reemplazo del selector contextual de cálculo.

### Comportamiento

- Abrir Materiales sin perder los datos de la calculadora.
- Regresar a la calculadora conservando el proceso y sus parámetros.
- Mantener la selección de idioma.
- Admitir navegación hacia atrás y adelante.
- Permitir enlaces directos al apartado y a fichas individuales.
- Conservar el diseño adaptable a móviles.

Utilizar el sistema actual de navegación y el historial del navegador.

---

# 4. PANTALLA PRINCIPAL DEL EXPLORADOR

El apartado debe mostrar un encabezado:

**Biblioteca de materiales**

Debajo, incorporar un buscador central.

Texto sugerido:

"Buscar materiales por familia, fabricante, grado o propiedad".

### Filtros

Permitir filtrar por:

- Familia.
- Fabricante.
- Grado comercial.
- Proceso de transformación.
- Tipo de material.
- Estado de verificación.
- Disponibilidad de propiedades.
- Propiedad específica.
- Material virgen.
- Material reciclado.
- Mezcla virgen/reciclado.
- Agregado por usuarios.

También permitir ordenar por:

- Nombre.
- Familia.
- Fabricante.
- Cantidad de propiedades documentadas.
- Nivel de evidencia disponible.

Los filtros deben poder combinarse.

Mostrar siempre cuántos resultados corresponden a la búsqueda.

Incluir un botón para limpiar filtros.

No mostrar resultados duplicados por estar presentes en varias bases documentales.

---

# 5. PRESENTACIÓN DE MATERIALES

Utilizar tarjetas compactas o una tabla adaptable.

Cada registro debe permitir identificar rápidamente:

- Nombre.
- Familia.
- Fabricante.
- Grado.
- Tipo de material.
- Aplicaciones documentadas.
- Cantidad de propiedades disponibles.
- Estado de verificación.
- Existencia de datos de fluidez.
- Existencia de referencias de reciclado.

Mantener un diseño sencillo.

No mostrar todas las propiedades de cada material en la pantalla principal.

Permitir abrir una ficha técnica detallada al seleccionar un material.

### Categorías de visualización

Distinguir claramente:

1. Grados comerciales.
2. Perfiles genéricos.
3. Reciclados comerciales documentados.
4. Formulaciones virgen/reciclado.
5. Referencias experimentales.
6. Agregado por usuarios.

Las categorías son clasificaciones de registros. No deben sustituir la familia química real del polímero.

---

# 6. FICHA TÉCNICA COMPLETA

Al seleccionar un material, mostrar una ficha organizada por secciones.

## A. Identificación

- Familia.
- Subfamilia.
- Fabricante.
- Grado.
- Tipo de polímero.
- Aplicaciones.
- Presentación física.
- Formulación conocida.
- Estado documental.

## B. Propiedades físicas

Mostrar propiedades disponibles:

- Densidad sólida.
- Densidad fundida.
- Densidad aparente.
- Contracción.
- Humedad.
- Absorción de agua.
- Otras propiedades documentadas.

## C. Propiedades mecánicas

- Resistencia a tracción.
- Módulo.
- Elongación.
- Impacto.
- Flexión.
- Dureza.
- Otras propiedades existentes.

## D. Propiedades térmicas

- Tg.
- Tm.
- Cristalización.
- HDT.
- Vicat.
- Cp.
- Conductividad.
- Estabilidad térmica.
- Otras propiedades documentadas.

## E. Propiedades reológicas

- MFR.
- MVR.
- Condiciones de ensayo.
- Viscosidad cuando esté disponible.
- Curvas pVT.
- Otros datos reológicos.

## F. Procesamiento

- Procesos recomendados.
- Temperaturas.
- Condiciones de procesamiento.
- Secado.
- Limitaciones.
- Recomendaciones del fabricante.

## G. Referencias

Mostrar:

- Fuente.
- Fabricante o autor.
- Documento.
- Enlace.
- Fecha.
- Revisión.
- Norma.
- Estado de verificación.

No inventar propiedades faltantes.

No presentar referencias genéricas como datos certificados del grado.

---

# 7. TABLAS Y VISUALIZACIONES TÉCNICAS

Aprovechar los datos documentales de la Etapa 3.

Cuando existan mediciones bajo diferentes condiciones, mostrar una tabla detallada.

Ejemplo:

| Propiedad | Valor | Unidad | Condición | Norma | Fuente |
|---|---|---|---|---|---|

Para índices de fluidez, mostrar cada ensayo de manera independiente.

No reducir mediciones MFR/MVR distintas a un único valor representativo sin justificación.

### Gráficas

Permitir visualizar:

- Curvas pVT documentadas.
- Propiedades frente a temperatura.
- Propiedades frente a presión.
- Curvas reológicas.
- Comparaciones entre datos experimentales.

Solo mostrar gráficas cuando existan suficientes datos y condiciones compatibles.

No crear curvas falsas mediante interpolaciones o extrapolaciones injustificadas.

Cuando una visualización sea aproximada, identificarla expresamente.

---

# 8. COMPARADOR DE MATERIALES

Crear un comparador independiente del comparador de cálculos.

Permitir seleccionar al menos dos materiales.

Comparar:

- Identidad.
- Propiedades físicas.
- Propiedades térmicas.
- Propiedades mecánicas.
- Índices de fluidez.
- Procesos recomendados.
- Fuentes.
- Estado de verificación.

### Reglas técnicas

No comparar directamente valores incompatibles.

Para MFR/MVR, comprobar:

- Magnitud.
- Unidad.
- Temperatura.
- Carga.
- Norma.
- Método.
- Acondicionamiento.

Si las condiciones difieren, mostrar los valores por separado y advertir que no existe comparabilidad directa.

No declarar automáticamente que un material es mejor por tener un valor mayor o menor.

Permitir exportar una comparación a Excel o PDF aprovechando la infraestructura de la Etapa 2, sin alterar sus exportaciones existentes.

---

# FASE B — CATEGORÍA AGREGADO POR USUARIOS

## 9. CREAR CATEGORÍA ESPECÍFICA

Incorporar al explorador la categoría:

**Agregado por usuarios**

Esta categoría debe ser visible y filtrable.

Los materiales que pertenezcan a ella conservarán su familia química real:

- HDPE.
- LDPE.
- LLDPE.
- PP.
- PET.
- ABS.
- PA6.
- PC.
- PVC.
- Otras familias únicamente si el esquema se amplía de forma controlada.

Ejemplo:

Categoría: Agregado por usuarios.

Familia: PP.

Material: PP recuperado, lote de laboratorio.

Estado: Aporte de usuario no verificado.

No introducir estos registros en la categoría de materiales comerciales verificados.

No modificar las 73 identidades originales.

---

# 10. AGREGAR MATERIAL PROPIO

Reutilizar y mejorar el formulario existente en `src/custom-materials.js`.

Permitir introducir:

### Identidad

- Nombre del material.
- Familia.
- Subfamilia.
- Fabricante o proveedor.
- Identificador o código.
- Tipo de material.
- Grado o formulación.
- Lote.
- Procedencia.

### Caracterización

- Propiedades físicas.
- Propiedades mecánicas.
- Propiedades térmicas.
- Propiedades reológicas.
- Condiciones de secado.
- Aplicaciones de procesamiento.

### Evidencia

- Fuente.
- URL.
- Norma.
- Método de ensayo.
- Temperatura.
- Presión.
- Carga.
- Condiciones experimentales.
- Fecha de ensayo o publicación.
- Observaciones.

Permitir dejar propiedades sin completar.

No exigir una cantidad arbitraria de propiedades para guardar un borrador local.

Para una propuesta de incorporación compartida, exigir los campos mínimos de identidad, procedencia y declaración del estado de verificación.

---

# 11. EDITAR MATERIAL PROPIO

Permitir que un usuario edite materiales creados previamente.

Opciones:

- Consultar.
- Editar.
- Guardar cambios locales.
- Exportar JSON.
- Proponer incorporación a GitHub.
- Proponer actualización de un material compartido.

Conservar el identificador cuando se edite el mismo material.

Registrar fecha de modificación y revisión.

No generar duplicados por cada edición.

### Historial de versiones

Para materiales compartidos, conservar:

- Versión anterior.
- Versión propuesta.
- Campos modificados.
- Justificación.
- Fecha.
- Fuente de los cambios.

Una actualización compartida debe corresponder al ID existente y no crear otro material si realmente se está editando el mismo registro.

No permitir sobrescribir arbitrariamente las fichas originales de fabricantes.

---

# FASE C — PERSISTENCIA EN GITHUB

## 12. OBJETIVO DE PERSISTENCIA

Actualmente, los materiales propios se guardan en:

`localStorage`

Clave:

`ccip-user-materials-v1`

Esto debe conservarse como almacenamiento local y mecanismo de recuperación.

Sin embargo, quiero incorporar un sistema adicional que permita enviar materiales a GitHub y, después de su aprobación, consultarlos desde otros dispositivos.

**No basta con exportar un archivo JSON al dispositivo del usuario.**

Debe existir un flujo real y documentado que termine en un registro persistente en GitHub.

---

# 13. RESTRICCIÓN DE SEGURIDAD

La aplicación está publicada mediante GitHub Pages y no tiene un backend propio.

Por tanto:

- No insertar tokens personales de GitHub en JavaScript.
- No guardar tokens en localStorage.
- No incluir secretos en HTML, JSON o archivos públicos.
- No utilizar un token general compartido entre usuarios.
- No dar permisos de escritura anónima al repositorio.
- No permitir que una aportación modifique directamente el catálogo principal sin revisión.

No simular una escritura en GitHub mediante un guardado local.

No mostrar el mensaje «Guardado en GitHub» si únicamente se descargó un JSON o se abrió un formulario sin enviarlo.

---

# 14. FLUJO DE CONTRIBUCIONES RECOMENDADO

Implementar preferiblemente un sistema de contribuciones basado en GitHub Issues y Pull Requests.

La aplicación debe permitir preparar una propuesta estructurada desde el formulario de materiales.

### Flujo del usuario

1. Crear o editar un material.
2. Guardarlo localmente.
3. Pulsar «Enviar a GitHub».
4. Validar los datos necesarios.
5. Mostrar una vista previa de la contribución.
6. Informar que la propuesta será pública y estará sujeta a revisión.
7. Abrir GitHub con una propuesta precargada.
8. Solicitar autenticación con una cuenta GitHub cuando GitHub la requiera.
9. Permitir que el usuario confirme el envío desde GitHub.
10. Conservar el material local como respaldo.

Después de enviar:

- La propuesta debe quedar registrada en GitHub.
- Debe poder identificarse mediante una URL o número de Issue/PR.
- Debe tener estado pendiente de revisión.
- No debe aparecer como material aprobado hasta que se incorpore al catálogo compartido.

### Importante

Abrir la pantalla de creación de un Issue no significa que el Issue ya fue creado.

No declarar un envío exitoso sin confirmación verificable.

Si se requiere que el usuario complete manualmente el último paso en GitHub, explicarlo claramente.

---

# 15. AUTOMATIZACIÓN DE VALIDACIÓN

Preparar una automatización de GitHub Actions para propuestas de materiales.

La automatización debe:

1. Leer la contribución.
2. Verificar su estructura.
3. Validar identificadores.
4. Validar propiedades.
5. Validar unidades.
6. Validar enlaces.
7. Detectar duplicados.
8. Clasificar el aporte.
9. Comprobar límites de tamaño.
10. Generar un informe de aceptación o rechazo técnico.
11. Preparar una propuesta de actualización del catálogo compartido, cuando proceda.

Preferir un Pull Request de incorporación para revisión.

No aprobar o fusionar automáticamente.

### Seguridad del workflow

Tratar el contenido de Issues como datos no confiables.

No ejecutar scripts, código o comandos introducidos por usuarios.

No interpolar texto no confiable directamente en comandos de shell.

Usar permisos mínimos.

No ejecutar código de contribuciones externas en contextos privilegiados.

Separar validación de lectura y operaciones con permisos de escritura.

No publicar secretos en registros de Actions.

No ejecutar automáticamente cambios de catálogo sin validación de esquema y revisión humana.

### Limitación de activación

Los workflows que procesan eventos de Issues normalmente deben estar disponibles en la rama predeterminada del repositorio.

Actualmente, el desarrollo principal permanece en ramas de características encadenadas.

Por ello:

- Preparar y probar el flujo.
- Verificar la configuración necesaria para activarlo.
- Documentar cualquier paso que requiera incorporar posteriormente el workflow a la rama predeterminada.
- No modificar `main` sin autorización.
- No declarar el procesamiento automatizado como operativo si todavía no se ha activado.

La propuesta de GitHub mediante su interfaz web puede ser utilizable antes de esa activación; el procesamiento automático deberá identificarse como pendiente mientras corresponda.

---

# 16. ALMACENAMIENTO DE MATERIALES COMPARTIDOS

Crear una biblioteca diferenciada para materiales aprobados procedentes de usuarios.

Ruta sugerida:

`src/data/user-materials.v1.json`

O una estructura equivalente de archivos por material más un índice validado.

Cada registro debe incluir:

- ID estable.
- Categoría.
- Familia.
- Nombre.
- Tipo de material.
- Propiedades.
- Fuentes.
- Identificador de contribución.
- Fecha de incorporación.
- Fecha de actualización.
- Revisión.
- Estado de verificación.
- Historial de modificaciones.
- Referencias de GitHub.

No mezclar estos registros indiscriminadamente con los 73 originales.

El catálogo compartido debe poder consultarse desde la aplicación una vez integrado en la versión publicada.

No utilizar GitHub Issues abiertos como fuente directa de propiedades para cálculos industriales.

Solo los registros aprobados y validados deben incorporarse automáticamente a la biblioteca compartida.

---

# 17. ESTADOS DE MATERIALES DE USUARIO

Implementar una clasificación clara:

**Local**

Material guardado solamente en el navegador.

**Propuesta preparada**

Datos validados y listos para enviar, pero todavía no recibidos por GitHub.

**Enviado a GitHub**

Existe una contribución confirmada mediante Issue o PR.

**Pendiente de revisión**

El material espera verificación técnica o aprobación.

**Aprobado como aporte**

El material ha sido incorporado al catálogo compartido.

**Rechazado / requiere correcciones**

La propuesta no cumple los requisitos documentales o técnicos.

**Actualización pendiente**

Existe una propuesta de modificación de un registro compartido.

La aprobación como aporte no equivale a certificación industrial de sus propiedades.

Mantener esa diferencia visible.

---

# 18. CONSULTA Y SINCRONIZACIÓN

Al cargar la biblioteca:

1. Cargar el catálogo original.
2. Cargar las extensiones de investigación.
3. Cargar la información de reciclados.
4. Cargar materiales aportados y aprobados.
5. Incorporar materiales locales del usuario sin sobrescribir los compartidos.

Evitar duplicados.

Diferenciar correctamente los orígenes.

### Conflictos

Si un material existe localmente y también está compartido:

- Comparar ID y revisión.
- No sobrescribir silenciosamente.
- Informar de diferencias.
- Permitir conservar una copia local.
- Permitir proponer actualización.

No modificar las propiedades históricas capturadas en cálculos anteriores.

### Sincronización

Distinguir actualización de catálogo publicado de sincronización de propuestas pendientes.

No afirmar que un aporte está disponible para todos mientras siga esperando revisión.

---

# FASE D — SEGURIDAD E INTEGRACIÓN

## 19. VALIDACIÓN DE PROPIEDADES

Reutilizar las validaciones existentes en `custom-materials.js`.

Mantener:

- Unidades normalizadas.
- Valores físicamente admisibles.
- Fases.
- Métodos.
- Fuentes.
- Condiciones.
- Restricciones de autocompletado.

No permitir que un material introducido por usuario se haga pasar por un registro comercial verificado mediante campos como `record_status` o `source_id`.

Validar las aportaciones nuevamente en el lado que procese las propuestas, no confiar únicamente en la validación del navegador.

### Seguridad adicional

Proteger contra:

- XSS.
- Inyección de HTML.
- Inyección de fórmulas en Excel.
- URLs maliciosas.
- Archivos excesivamente grandes.
- Datos JSON malformados.
- Duplicación de IDs.
- Valores no finitos.
- Fuentes falsificadas.
- Modificaciones concurrentes.

No publicar información personal que el usuario no haya decidido enviar.

---

# 20. INTEGRACIÓN CON CÁLCULOS

Los materiales locales y compartidos deben poder utilizarse en las calculadoras cuando sus propiedades sean compatibles.

Conservar:

- Selección de material.
- Precarga validada.
- Entradas manuales.
- Condiciones.
- Advertencias.
- Procedencia.
- Versiones de datos.

No autocompletar propiedades sin condiciones suficientes.

No utilizar una propiedad de reciclado como si fuera un valor certificado del material virgen.

No cambiar fórmulas de cálculo en esta etapa.

---

# 21. INTEGRACIÓN CON HISTORIAL Y EXPORTACIONES

Conservar las funciones desarrolladas en la Etapa 2:

- Guardar cálculo nuevo.
- Sobrescribir.
- Renombrar.
- Eliminar.
- Recuperar.
- Exportar Excel.
- Exportar PDF.
- Exportar JSON.

Los cálculos que utilicen un material agregado por usuario deben conservar:

- ID del material.
- Identidad.
- Revisión.
- Propiedades utilizadas.
- Fuentes.
- Estado de verificación.
- Procedencia local o compartida.

Los cálculos históricos deben permanecer inmutables ante futuras actualizaciones del catálogo.

---

# 22. BILINGÜISMO Y DISEÑO

Conservar la interfaz Lean.

Implementar traducción completa en español e inglés para:

- Materiales.
- Biblioteca.
- Buscar.
- Filtrar.
- Comparar.
- Agregado por usuarios.
- Agregar material.
- Editar material.
- Guardar localmente.
- Enviar a GitHub.
- Pendiente de revisión.
- Aprobado.
- Ver fuente.
- Consultar propiedades.
- Exportar ficha.
- Error de validación.
- Conflicto de versión.

No traducir nombres comerciales ni nombres personalizados.

### Responsividad

Probar:

- 360 px.
- 390 px.
- 540 px.
- 768 px.
- 1024 px.
- 1440 px.

En móvil:

- Evitar scroll horizontal de la página.
- Usar filtros desplegables.
- Mantener fichas legibles.
- Presentar las tablas extensas dentro de contenedores desplazables.
- Mantener botones accesibles.
- Evitar listas excesivamente largas sin búsqueda.

---

# FASE E — PRUEBAS Y VALIDACIÓN

## 23. PRUEBAS DEL EXPLORADOR

Comprobar:

1. Apertura del nuevo apartado.
2. Regreso a la calculadora sin perder parámetros.
3. Búsqueda por familia.
4. Búsqueda por fabricante.
5. Búsqueda por grado.
6. Combinación de filtros.
7. Estado de verificación.
8. Fichas de las 73 entradas originales.
9. Fichas genéricas.
10. Datos de investigación.
11. MFR/MVR con condiciones.
12. Referencias experimentales.
13. Formulaciones recicladas.
14. Comparación de materiales.
15. Exportación de fichas.
16. Español e inglés.
17. Navegación directa mediante URL.

## 24. PRUEBAS DE MATERIALES PROPIOS

Comprobar:

1. Crear material.
2. Editar material.
3. Guardar localmente.
4. Recuperar después de recargar la página.
5. Importar JSON.
6. Exportar JSON.
7. Eliminar material local.
8. Evitar duplicados.
9. Validar unidades.
10. Validar fuentes.
11. Preservar las propiedades no informadas.
12. Mantener identidad y revisión.

## 25. PRUEBAS DE GITHUB

Comprobar:

1. Preparación de una contribución válida.
2. Preparación de una actualización.
3. Rechazo de registros malformados.
4. Generación correcta del enlace o mecanismo de envío.
5. Confirmación de que el usuario debe finalizar el envío en GitHub, cuando corresponda.
6. Referencia al Issue o PR realmente creado.
7. Validación de contenido no confiable.
8. Detección de duplicados.
9. Protección de identidades originales.
10. Propuesta de cambio sin merge.
11. No exposición de credenciales.
12. Manejo de problemas de autenticación, permisos y límites de URL.
13. Identificación honesta de workflows no activados.

Utilizar pruebas automatizadas locales y simulaciones controladas cuando no sea posible ejecutar el flujo real sin modificar el repositorio principal.

No crear contribuciones públicas de prueba innecesarias.

No declarar una prueba de integración GitHub real como satisfactoria si solamente se simuló.

---

# 26. REGRESIÓN GENERAL

Ejecutar todas las pruebas existentes.

Conservar:

- Los siete procesos.
- Los tres niveles.
- Los 73 registros originales.
- La investigación de la Etapa 3.
- Los índices de fluidez.
- Las mezclas V/R.
- El secado existente.
- Aprendizaje.
- Historial.
- Comparaciones.
- Exportaciones.
- Identidad institucional.
- Navegación móvil.
- Versiones históricas.

Ninguna mejora del explorador debe modificar resultados numéricos anteriores sin razón documentada.

---

# 27. ENTREGABLES

Entregar:

1. Nuevo apartado Materiales.
2. Buscador avanzado.
3. Fichas técnicas completas.
4. Comparador de materiales.
5. Categoría Agregado por usuarios.
6. Editor mejorado.
7. Biblioteca de aportes compartidos.
8. Flujo de envío a GitHub.
9. Validación de contribuciones.
10. Automatización de revisión o propuesta de PR.
11. Documentación de permisos y activación.
12. Pruebas unitarias.
13. Pruebas de navegador.
14. Capturas de escritorio y móvil.
15. Informe de integración.
16. PR para revisión.

### Evidencia obligatoria

Documentar claramente qué funciona completamente y qué requiere una autorización o activación posterior.

No declarar implementada una sincronización compartida cuando únicamente exista almacenamiento local.

No presentar una propuesta de Issue sin enviar como confirmación de guardado remoto.

No dar por operativa una automatización GitHub Actions que no pueda ejecutarse todavía desde la rama predeterminada.

---

# 28. CRITERIOS DE ACEPTACIÓN

La Etapa 4 estará completa cuando:

1. Exista un apartado independiente Materiales.
2. Se puedan buscar y filtrar los registros existentes.
3. Se puedan consultar sus propiedades y fuentes.
4. Se pueda acceder a MFR/MVR y sus condiciones.
5. Se puedan consultar datos de reciclados y formulaciones.
6. Se puedan comparar dos materiales.
7. Se puedan crear y editar materiales propios.
8. Los materiales propios pertenezcan a la categoría Agregado por usuarios.
9. Exista un flujo funcional y seguro para remitir aportes a GitHub.
10. Esté claramente documentada la incorporación de aportes aprobados al catálogo común.
11. No se expongan tokens ni credenciales.
12. Se preserve la identidad de los 73 registros originales.
13. No se alteren cálculos históricos.
14. Continúen funcionando las exportaciones.
15. La aplicación sea compatible con móvil y escritorio.
16. Todos los cambios estén cubiertos por pruebas adecuadas.

**Si la activación completa de la persistencia compartida requiere una operación posterior sobre la rama predeterminada, debe informarse expresamente. No se aceptará sustituir silenciosamente ese requisito por un guardado local.**

---

# 29. RESTRICCIONES FINALES

No implementar la nueva etapa de secado.

No implementar el catálogo de maquinarias.

No modificar ecuaciones de los motores de cálculo.

No añadir nuevos grados comerciales vírgenes.

No eliminar los 73 registros originales.

No alterar registros históricos.

No exponer credenciales.

No automatizar merges de contribuciones.

**NO REALIZAR MERGE.**

**NO REALIZAR DEPLOY.**

**NO MODIFICAR `main` NI `gh-pages`.**

Crear una rama nueva y entregar un Pull Request contra la rama de la Etapa 3, con pruebas y documentación completas.

Esperar mi revisión antes de continuar con la siguiente etapa.