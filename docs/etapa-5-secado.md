# CCIP — Etapa 5: secado y acondicionamiento

Base: PR #13, commit `51def4b684e926e22806d60dc5b346f987b44d1a`. No modifica catálogo original, modelos de otros procesos, fórmulas de aprendizaje, historial ni la versión publicada.

## Datos y procedencia
- Nueve grados (ABS, PA6, PC) tienen recomendaciones de tiempo y temperatura de secado en `src/data/materials.v1.3.json`; se conservan sus fuentes exactas.
- La versión Lean propone automáticamente el **extremo superior** cuando el tiempo se publica como rango. Se registra el rango original, fuente, valor aplicado y origen `manufacturer_range_upper`. Esta selección es un criterio nominal conservador y editable, no predice humedad final.
- Grados con tiempo fijo continúan aplicando el valor de ficha. La temperatura de secado de ficha se aplica solo en nivel avanzado según el contrato existente. Una temperatura publicada en rango sigue exigiendo selección explícita: no se elige sin considerar material/equipo.
- Los materiales propios exigen evidencia documentada. Los nueve genéricos, PE/PP/PET/PVC sin instrucciones del grado y reciclados no heredan tiempos ni temperaturas del virgen.
- El caudal inicia **vacío** (kg/h) para no inventar parámetros de máquina. El cálculo depende de un caudal ingresado. La temperatura inicial comienza en **25 °C** como supuesto operativo editable, identificado en metadatos; no se atribuye al fabricante.
- La densidad aparente solo es aplicable a presentación compatible y método confirmado. Las densidades sólidas o fundidas no son sustituibles.
- El Cp de los nueve grados continúa **sin precarga**: no se identifica una curva o Cp medio del sólido a lo largo de un intervalo de temperatura documentado. Si el usuario ingresa Cp para el balance sensible, debe declarar fase sólida, extremos de intervalo térmico y fuente en la ayuda avanzada. Sin ese contrato, el valor queda visible y guardable como entrada, pero el resultado de potencia queda pendiente.

## Fórmulas existentes y límites
- Masa mínima nominal: `M = Q·t` [kg].
- Volumen útil mínimo: `V = M/ρ_bulk` [L], si existe densidad aparente compatible.
- Potencia térmica sensible ideal del polímero: `P = Q·Cp·(T_final-T_inicial)/3600` [kW], solo para ΔT ≥ 0 y un Cp sólido sustentado en el intervalo.
- **No** se modelan potencia eléctrica del secador, calor de evaporación, regeneración de desecante, pérdidas de calor, flujo de aire, punto de rocío real o humedad residual. El resultado NO es un criterio de dimensionamiento industrial definitivo.
- Una recomendación de secado no puede derivarse universalmente de Tg o de la temperatura de fusión. Las ventanas de secado y riesgos de degradación exigen ficha del grado.

## Trazabilidad y retrocompatibilidad
El cálculo conserva las entradas originales y `drying_assessment` junto a notas/advertencias en el snapshot. Los registros históricos no se migran ni recalculan al exportarse; se conservan las exportaciones JSON/XLSX/PDF y el límite del historial. Los demás motores y la biblioteca de 73 identidades no cambian.

## Pruebas
`npm test`, `python tests/browser_smoke.py`, las suites de etapas 2, 3 y 4, `npm run build:pages`, `python tests/browser_pages_cache.py`. La prueba `tests/drying-stage5.test.js` valida el valor 25 °C, caudal vacío, nueve grados, rangos, bloqueo de Cp sin evidencia, y los cálculos numéricos del modelo.
Las verificaciones de navegador y build corresponden a GitHub Actions; no constituyen ensayo en hardware ni validación industrial.

No hay merge ni despliegue.