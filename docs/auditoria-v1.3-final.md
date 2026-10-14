# CCIP V1.3 — informe de finalización y validación

Fecha: 2026-10-14. Rama: `feature/catalogo-90-i18n-formulas`. [PR #2](https://github.com/vittoriovenetto/CCIP-Calculadoras-Procesos-Plasticos/pull/2), base `feature/web-v1-modular`. Punto de partida `d4cea38f2145f8c82f13de04178182753879854d`.

La interfaz y el código quedan preparados para revisión. **La verificación documental oficial de los 90 grados no pudo cerrarse**, y no se declara lista una publicación como catálogo certificado. No se publicó ni se actualizó `main`/`gh-pages`, ni se modificó el repositorio original de reymenez323.

## Archivos y funcionalidades

| Archivos | Cambios y motivo |
| --- | --- |
| `src/custom-materials.js` | Importación/exportación versionada; validación profunda, normalización sin sobrescribir fabricante, duplicados y límites; descarte seguro de registros dañados; persistencia y edición conservando la unidad original. Unidad, fase, fuente, método y condiciones por propiedad. Pellets/polvo declarado en densidad aparente propia. |
| `src/app.js` | Mantener borradores al cambiar idioma/proceso; actualizar catálogo local tras CRUD/importación; limpiar valores automáticos de materiales eliminados y refrescar los usados en sesiones al editar. Historial mantiene snapshots anteriores. |
| `src/materials.js` | Admitir contrato 1.3.0 y conservar versiones anteriores; impedir autocompletado cuando fase o presentación no corresponden. La densidad aparente de PVC propio no se presupone de polvo. Referencia de cada propiedad propia con su fuente individual. |
| `src/materials-view.js`, `src/materials-audit-view.js` | Fichas compactas conservadas; identidad comercial pendiente visible; referencias sin confirmar separadas de valores admitidos. Datos escritos por el usuario protegidos de traducción automática. |
| `src/i18n.js`, `src/i18n-audit.js` | Traducción ES/EN de mensajes dinámicos, rangos, ayudas con unidades, ecuaciones, fuentes y errores. Observer reversible ante cambios de texto; sin modificar inputs, claves, números ni ecuaciones. Preferencia en memoria si el almacenamiento falla. |
| `formulas.html`, `src/formulas-data.js`, `src/formulas-index.js` | Las 26 explicaciones agrupadas se amplían a las 42 salidas del motor, con un área auxiliar, sin perder sus relaciones. Cada salida tiene finalidad, variables/unidades, conversiones, ejemplo paso a paso, hipótesis y referencia. Variante volumétrica y tubo documentadas; índice leído del motor. |
| `src/data/materials.v1.3.json` | 99 perfiles, esquema explícito 1.3.0, nombres comerciales propuestos sin atribuir comprobación inexistente. Dos valores Dow nuevos aislados como referencia no autocompletable. V1.0/V1.1/V1.2 sin cambios. |
| `scripts/build-pages.mjs`, `scripts/publish-pages.mjs`, `package.json` | Preparación local incluye `formulas.html`, sus recursos y metadata de biblioteca 1.3.0; guardas de checkout limpio ampliadas. Solo se verificó el paquete local, sin ejecutar el publicador. |
| `.github/workflows/validate-web.yml`, `tests/requirements.txt` | Actions con runtime Node 24, versiones específicas de las acciones comprobadas; Ubuntu 24.04 y Playwright 1.62.0. Registro y capturas guardados como artefactos de CI incluso al fallar. |
| `tests/v13-quality.test.js`, `tests/browser_smoke.py` | Matriz de 99 × 7 × 3 en Node, ejemplos, conversiones, fases, datos corruptos, importación atómica, idiomas, responsive y V1 histórica. |

No se modificaron `src/engine.js`, `src/math.js`, `src/schema.js` ni los siete archivos `src/models/`. Las correcciones son de admisibilidad/trazabilidad de entradas y presentación, sin alterar ecuaciones.

## Pruebas y límites de la verificación

Resultados de la ejecución final (registrados tras completarse; no inferidos de una propuesta):

| Comprobación | Ejecutadas | Aprobadas | Fallidas |
| --- | ---: | ---: | ---: |
| `npm test` | 500 | 500 | 0 |
| `python3 tests/browser_smoke.py` | 24 | 24 | 0 |

Los subestados de una misma prueba no se cuentan como pruebas adicionales: 135 variantes/procesos × niveles × pantallas; 162 estados de nueve perfiles documentados en tres procesos/niveles y dos pantallas; 99 perfiles iniciales recorridos en navegador; 27 casos ES/EN/ES conservando entradas y magnitudes. Node comprueba 2.079 estados adicionales de compatibilidad de perfiles (99 × 7 × 3).

Se ejecutaron las pruebas anteriores del motor, casos independientes por proceso, conversiones y dominios, vacíos/cero/negativos/imposibles, historial corrupto y entradas fuera de rango. Se comprueban 42 ejemplos numéricos frente a valores esperados documentados, sin modificar el motor. Los ejemplos y las capturas son sintéticos: no son valores certificados de materiales o máquinas.

Navegador: Chromium local y Playwright 1.62.0. Tamaños 320, 390, 768, 1024 y 1440 px; ayudas también a 360/430, toque/teclado, contenido al 200 %, colores forzados, consola y recursos. Bibliotecas/editor/fórmulas se abren para comprobar controles y desbordamiento; navegación móvil y tabla pVT permiten desplazamiento interno intencional. Importación inválida y formulario vacío tienen errores localizados reversibles. La preferencia de idioma, propiedades, ediciones y JSON se recuperan tras recarga.

La V1 conserva sus 24 archivos y ZIP con SHA-256 original; se comprueba su descarga y cálculo, y la recuperación desde V1 de un snapshot V1.3 con material propio, obteniendo idénticas entradas/métricas exportadas. La V1 tiene su interfaz histórica en español y comparte el origen/clave de historial; no incorpora editor ni catálogo nuevos.

No se probaron dispositivos físicos, Safari/iOS ni Firefox, lector de pantalla ni ensayos industriales. El cambio de idioma no traduce nombres comerciales o texto libre escrito por el usuario. Si el navegador bloquea localStorage, no se promete persistencia entre sesiones; se mantiene el cálculo y se informa del fallo de guardado.

## Actions y errores corregidos

Al iniciar, las ejecuciones `38536412628` y `38536406156` de `d4cea38` estaban correctas (unit y browser). En el histórico, `38535990193` tenía browser fallido con salida 1. La API mostró además avisos de runtime Node 20 y de próxima migración de ubuntu-latest; se actualizaron las acciones a runtime Node 24 y se fijó Ubuntu 24.04.

El historial de la rama ya contiene la corrección de favicon `ce66b89`. Se conserva y se comprueban icono y enlaces internos de fórmulas. Los logs completos del fallo antiguo están inaccesibles en `results-receiver.actions.githubusercontent.com` por la restricción del túnel; no se afirma haber leído su stack completo ni atribuirle causas adicionales.

Las pruebas nuevas encontraron fragmentos de español en prefijos «⚠», ayudas con unidades, genéricos, rangos, fuentes y referencias históricas; se corrigieron sus plantillas y recursión sin modificar datos. También se corrigieron importación ausente, editor reiniciado al cambiar idioma, validación superficial de almacenamiento y aplicación de propiedades con fase incompatible. PVC propio puede declarar pellets sin que se presuponga polvo.

## Fuentes y propiedades pendientes

[Auditoría por grado y por consulta](auditoria-fuentes-v1.3.json): **90 registros comerciales propuestos y 90 pendientes de confirmación oficial directa**. Las 61 URLs declaradas, incluidas referencias pVT y SI, se consultaron y quedaron bloqueadas por el túnel 403; no se recibió la respuesta de los fabricantes. No es evidencia de enlace roto, ni de existencia/inexistencia de los productos.

| Familia | Propuestos | Confirmados oficialmente en esta auditoría | Pendientes |
| --- | ---: | ---: | ---: |
| HDPE | 10 | 0 | 10 |
| LDPE | 10 | 0 | 10 |
| LLDPE | 10 | 0 | 10 |
| PP | 10 | 0 | 10 |
| PET | 10 | 0 | 10 |
| PVC | 10 | 0 | 10 |
| ABS | 10 | 0 | 10 |
| PA6 | 10 | 0 | 10 |
| PC | 10 | 0 | 10 |

El JSON de auditoría enumera **cada nombre exacto, fabricante, URL, estado y propiedades pendientes**. Nueve perfiles originales conservan las 34 propiedades de la biblioteca verificada aportada por el usuario V1.2 (densidades sólidas/aparentes, MFR/MVR/IV, temperaturas y recomendaciones según cada ficha), con esa procedencia explícita y sin recertificación vigente en esta ejecución. Hay 1.136 celdas de propiedades nulas en los 90 perfiles comerciales; fundido y Cp son nulos en todos ellos.

DOWLEX 2045.01G y 2045.11G tenían densidades nuevas atribuidas a URLs del fabricante sin evidencia consultable en esta revisión. Se mantienen sus valores como **referencias no verificadas, sin autocompletado**, en vez de publicarlos como propiedades confirmadas. Los 81 perfiles añadidos no reciben propiedades de otra variante. Los nueve genéricos carecen de todas las propiedades y exigen datos manuales.

Para cerrar la auditoría hace falta acceder a fichas oficiales del grado exacto o recibir esas fichas: comprobar identidad/familia/formulación, revisión/vigencia, unidades, método, fase, temperatura/presión y presentación. Reconsulta con `python3 scripts/audit-material-sources.py --output /tmp/ccip-sources.json`. Una coincidencia de texto se guarda solo como candidata: el script no certifica ni cambia propiedades automáticamente.

## Validación técnica/experimental pendiente

| Proceso | Comprobación necesaria |
| --- | --- |
| Inyección | pVT/ρ del fundido por grado a T/P reales; volumen dosificado/carrera/colchón y límites del equipo; presión efectiva de cavidad, cierre y tasas medidas de llenado/plastificación. Capacidad geométrica no certifica máquina. Perfil L1/L2/L3 pendiente. |
| Extrusión | Sección/densidad real, velocidad, pérdidas, caudal e inventario; energía específica medida y distribución de residencia. No se predice caudal por RPM. |
| Película | BUR/DDR y producción contra diámetro/espesor reales, hinchamiento, enfriamiento, densidad y uniformidad. |
| Soplado | Masa/volumen contra geometría del envase, cuello/asa/rebabas y pared real; aproximación de pared delgada, no capacidad útil. |
| Termoformado | Consumo/ciclo real, recortes y espesor local; relación geométrica no predice distribución de deformación. |
| Secado | Humedad inicial/final, rocío, equipo y recomendaciones exactas; densidad aparente/presentación y Cp(T) de fase compatible. La potencia es sensible mínima, sin evaporación, pérdidas ni regeneración. |
| Costos | Consumo/energía/producción/rechazos y moneda reales; gastos indirectos, recuperación, disponibilidad/OEE y amortización fuera del costo parcial. |

No se obtuvieron ni inventaron nuevas mediciones de materiales o máquinas. Las figuras pVT siguen siendo referencias documentales; no proporcionan densidad automática ni autorizan extrapolación.

## Revisión y publicación

[Capturas reales](capturas/v1.3/README.md). La comprobación del paquete estático es local; no se usa una URL de GitHub Pages para V1.3. El PR requiere revisión de fuentes y aceptación técnica antes de publicar. `main` permanece en `423c04b1710f8f009c811c893873184d363f1b66` y `gh-pages` en `385a72a7c5267293b2fb0bcdcaa8a55442943691`.
