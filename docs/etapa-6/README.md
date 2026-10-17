# Etapa 6 — catálogo documental y comprobación de maquinaria

Rama del PR #15: `feature/etapa-6-catalogo-maquinarias`. Se incorporó el head verificado de Etapa 5 `9db34e2f9fd1b3cabea21acb2a9c708782b63ab7`, conservando maquinaria. Ningún PR ni rama de publicación se fusiona o despliega.

El catálogo contiene **25 registros consultables** y **20 máquinas computables**: inyección 4, extrusión 3, película 4, soplado 3, termoformado 3 y secado 3. Las tres series originales y dos variantes aportadas por el usuario cuya equivalencia sigue pendiente no aumentan el mínimo. Los seis identificadores originales se conservan.

- [Auditoría final, aceptación y resultados](auditoria-final.md).
- [Matriz técnica por máquina](matriz-tecnica.md) y [datos de la matriz](matriz-tecnica.json).
- [Fuentes, fecha, hash y extractos revisados](fuentes-revisadas.json).
- [Discrepancias Moiron/Xihua y otros límites](discrepancias.md).
- [Capturas reales de navegador](capturas/README.md).

## Modelo de evidencia

`src/data/machines.v1.json` está separado de materiales. Cada registro identifica proceso, fabricante, modelo, configuración, magnitudes con unidad/condiciones, fuente por propiedad, fecha y campos no documentados. `document_checked` significa que se revisó el documento: no es ensayo, certificado del equipo instalado ni validación industrial.

`catalogReadiness()` exige modelo/configuración concreta, identidad sin duplicados, al menos tres parámetros, fuentes con consulta/hash y trazabilidad de propiedades. Verifica los mínimos por proceso y las dos máquinas prioritarias; una serie nunca cuenta como tres equipos. Para regenerar la matriz y comprobar cantidades:

```sh
node scripts/audit-machine-catalog.mjs --write --require-complete
```

## Integración

Se reutilizan los siete motores existentes sin cambiar sus ecuaciones. `src/machine-comparison.js` compara referencias con magnitudes compatibles, manteniendo pendientes los datos ausentes o condicionados.

| Proceso | Aplicación | Límites del alcance |
|---|---|---|
| Inyección | Confirmar variante para diámetro/carrera publicados; comparar volumen, carrera, cierre, presión de máquina y molde cuando estén documentados. | Nunca convertir masa ABS a volumen ni utilizar presión de máquina como cavidad. No precargar máximos de caudal como condiciones de operación. |
| Extrusión | Consultar diámetro/cilindro, L/D o sus opciones, rpm, par y potencia publicados; comprobar rpm/rendimiento solo cuando exista el dato aplicable. | No inferir kg/h por rpm/diámetro ni potencia media desde motor instalado. Variantes con capacidades desconocidas quedan pendientes. |
| Película | Precargar dado estándar confirmado; conservar BUR/DDR del motor y comparar ancho, espesor, burbuja o arrastre según cada ficha. | Monocapa/tricapa separadas; rangos configurables y anchos discrepantes no son límites individuales. |
| Soplado | Comparar dimensiones de molde y apertura introducidas explícitamente con límites publicados. | No comparar dimensiones del envase contra dimensiones de molde. |
| Termoformado | Ancho de material, espesor, altura, herramienta y conformado diferenciados; ciclos/h → ciclos/min, modo estándar/BFS explícito. | No convertir área de conformado en consumo de lámina ni máximo de velocidad en ciclo real precargado. |
| Secado | Volumen calculado frente a nominal, temperatura y referencias de rendimiento condicionadas. | Nominal no significa útil; aire caliente superficial no equivale a deshumidificación profunda. La potencia instalada no es potencia sensible ni consumo. |
| Costos | Seleccionar ficha y reutilizar explícitamente entradas compatibles de un snapshot guardado, con identidad y procedencia. | Nunca copiar kW instalados como potencia media. Preservar entradas manuales y origen aun si se cambia o quita la ficha activa. |

Los selectores filtran por proceso y fabricante. Confirmar una variante solo incorpora campos compatibles vacíos, sin sobrescribir manuales. Al cambiar/desactivar se limpian exclusivamente las precargas intactas de la máquina anterior. Se conserva el estado por proceso y entre niveles.

## Historial y exportación

El snapshot conserva perfil, configuración, condiciones, fuentes y evaluación. `applied` registra precargas retenidas; `used_fields` contiene solo las activas realmente usadas con origen de máquina. Las entradas ocultas retenidas se guardan separadamente de `inputs` en los casos con maquinaria y se recuperan con su origen. El estado básico sigue independiente de propiedades no activas.

La reutilización de un cálculo en costos registra ID, fecha, campos copiados/omitidos y ficha de origen. No recalcula el registro de origen. Excel, PDF y JSON conservan evidencia y valores del snapshot; exportar un histórico no invoca el motor ni reinterpreta el catálogo actual.

## Validación

Ejecutar `npm test`, suites `browser_smoke.py`, `browser_stage2.py`, `browser_stage3.py`, `browser_stage4.py`, `browser_stage5.py`, `browser_stage6.py`, `npm run build:pages` y `browser_pages_cache.py`. El build produce un artefacto local; no publica. La CI del PR ejecuta las mismas regresiones, y el workflow rápido comprueba maquinaria.

Se verifica Chromium en 320/360/390/768/1024/1440 px y ES/EN. No sustituye ensayos en equipos industriales ni pruebas en todos los navegadores/dispositivos físicos.
