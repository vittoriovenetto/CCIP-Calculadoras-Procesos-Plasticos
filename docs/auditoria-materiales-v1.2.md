# Auditoría V1.1 y referencias pVT V1.2

Implementación de los cuatro adjuntos suministrados: auditoría de datos pendientes y JSON V1.1; anexo de curvas pVT y JSON V1.2. La biblioteca activa pasa a **1.2.0**. Los archivos JSON V1.0 y V1.1 se conservan para trazabilidad y pruebas de compatibilidad.

## Integridad y alcance

Las copias en `src/data/materials.v1.1.json` y `src/data/materials.v1.2.json` son idénticas a los adjuntos. SHA-256:

- V1.1: `2e3ff988500c71f6cc07a90766bff32c579895acca542e096bfb59dda9ff45b3`.
- V1.2: `5a34bef1dcd5fee6bd7bf3efddf5cfcae1daa40c0ea01b25e9986ddd90c33028`.

Los nueve grados conservan todas sus propiedades originales, sus fuentes primarias y sus campos `null`. V1.1 añade auditoría, nueve fuentes S10–S18, humedad del producto recibido de PET y referencias documentales bloqueadas. V1.2 conserva íntegramente V1.1 y añade estado pVT por grado, cuatro referencias PV01–PV04, reglas de utilización y puntos de visualización de ABS.

Se respetan las fechas tal como aparecen en los archivos: los JSON indican revisión `2026-10-13`; el anexo PDF declara `14 de octubre de 2026`. No se interpreta esta incorporación como nueva verificación independiente de fabricantes ni certificación de lote.

## Ficha y referencias

La ficha incorpora **Curvas pVT**, referencias históricas/de otros grados y lista de evidencia pendiente. En básico/técnico los detalles especializados se pueden desplegar; avanzado los muestra abiertos junto a los controles de evidencia manual. Todas las fuentes se guardan como metadata local; abrir sus enlaces es una acción del usuario. No se redistribuyen documentos de fabricantes.

| Caso | Presentación y uso |
| --- | --- |
| PC Makrolon 2405 | Enlace PV01 al gráfico original, presiones 0.1, 20, 40, 80, 120, 160, 200 MPa. Sin tabla original ni coeficientes integrados: densidad automática deshabilitada. |
| ABS Terluran GP-22 | Enlace PV02, presiones 0.1, 40, 80, 120, 160, 200 MPa. Gráfico local de 24 puntos aproximados, únicamente documental. Referencia académica Tait PV04 accesible sin integrar coeficientes. |
| PA6 Ultramid B3S R03 | Solo referencia PV03 **“Referencia de B3S — no validada para R03”**, a 0.1 MPa (1 bar). No se muestra una curva numérica de R03. |
| HDPE, LLDPE, LDPE, PP, PET y PVC | Curva exacta pendiente según la auditoría suministrada; no se asigna modelo genérico. |
| Cp histórico PC | 1172 J/(kg·K) = 1.172 kJ/(kg·K), ASTM D2766, documento agrupado 2405/2407/2456 S10. Sin fase ni intervalo: visible como referencia histórica, nunca autocompleta `specificHeat`. |
| PET humedad recibida | 0.15 % objetivo y 0.30 % máximo, S17: especificación del producto suministrado de 2017. Se muestra separada de humedad objetivo/máxima de secado, cuyos campos siguen `null`. |
| PET de comparación | S11 Laser+ CSD B90A y S12 procedimiento de escamas PET: enlaces/contexto de otros grados/procesos, sin aplicar temperatura, residencia ni humedad a Polyclear 1101. |
| PVC 1195 | Mantiene advertencia de polvo; se solicita definición del compuesto y sus estabilizantes/plastificantes/cargas. No se extrapola la resina a formulación final. |

## Gráfica orientativa de ABS

`pvt.js` valida la serie y `materials-audit-view.js` dibuja un SVG con seis isobaras, puntos, leyenda, títulos y tabla accesible. Temperaturas: 20, 100, 120 y 270 °C; volumen específico en cm³/g; presión en MPa. Los números son exactamente los del JSON, sin ajustar ni completar nuevos datos.

Rótulo **Digitalización orientativa — solo visualización** y aviso de incertidumbre de lectura aproximada del adjunto (±0.005–0.01 cm³/g, sin validación metrológica). Las líneas unen puntos para ilustrar la figura: no implementan lookup de densidad, interpolación calibrada ni extrapolación. La gráfica no calcula `rho = 1/v`, no ofrece botón de aplicación y no proporciona entradas al motor.

`purpose = visualization_only`, `eligible_for_melt_density_autofill = false` y `calculator_autofill_allowed = false` se verifican. Bibliotecas que intentan desbloquear esas figuras, presentan series incompletas/unidades incompatibles o indican coeficientes aún no soportados se rechazan. El candidato de densidad fundida queda bloqueado aunque se introdujera un escalar en una propiedad de un grado marcado como no autorizado. Los nueve registros suministrados siguen teniendo densidad fundida y Cp `null`.

## Datos manuales pVT / Cp

En avanzado, para inyección se registran temperatura °C, presión MPa y fuente/ensayo/revisión del dato de densidad introducido por el usuario. En secado se registran fase de Cp, límites de intervalo °C y fuente/método/revisión. También se conservan lote y justificación existentes. Los controles están disponibles para material personalizado y grados del catálogo.

Estas anotaciones **no calculan una propiedad** ni trasladan valores de la gráfica. Se introduce la densidad o Cp en su campo habitual. Falta de evidencia, T/P inválidas, intervalo de Cp incoherente, temperaturas de cálculo fuera del intervalo o Cp de fundido para secado de sólidos generan advertencias de falta de validación. La evidencia manual es declarada por el usuario, no certificada automáticamente.

Se mantienen operativos los cálculos independientes: sin densidad fundida, masa de shot disponible y volumen/carrera pendientes; sin Cp, inventario/volumen de tolva pueden calcularse, potencia sensible pendiente. Entradas manuales numéricamente válidas conservan el comportamiento existente y se acompañan de advertencias cuando no se acreditan condiciones. El modelo térmico no integra Cp(T), entalpía ni calor latente: un cambio de fase requiere modelo/datos adicionales.

## Trazabilidad e historial

El snapshot añade `references_snapshot`: fuentes documentales relevantes, referencias pVT, la serie orientativa correspondiente al grado y contrato de datos. Incluye identidad/versionado del dataset, auditoría del grado y contexto manual. Las referencias permanecen separadas de `used_fields`; el origen de una densidad ingresada sigue siendo `manual`, aunque su ficha incluya gráficos.

Al recuperar un historial se usa su snapshot, incluyendo advertencias/figuras originales, no se reemplaza por la biblioteca actual. Registros V1.0 sin pVT y contexto manual nuevo se recuperan con valores y versión originales. El cálculo utiliza las fórmulas actuales del motor, igual que antes; no se garantiza reproducibilidad del código entre versiones. Los parámetros y fórmulas de los siete modelos no se modificaron.

## Verificación

- **298 pruebas Node aprobadas**: las 270 anteriores y 28 nuevas. Integridad de identidades/propiedades, contrato V1.1/V1.2, humedad de PET, Cp histórico, seis grados pendientes, PA6 B3S ≠ R03, presiones/unidades, 24 puntos ABS, prohibición de autocompletado, fuentes, snapshots y evidencia manual.
- **12 pruebas Chromium**: los diez flujos anteriores y dos adicionales de auditoría/curvas/manual/historial V1.0. Se mantienen 108 estados de calculadoras y 162 estados de biblioteca, más recorrido pVT de los nueve grados y gráfica a 320 px.
- Comparación byte a byte de ambos JSON con sus adjuntos y `git diff --check`.

Las pruebas son de software y referencias documentales/sintéticas. No se realizaron ensayos reales, revisión docente/ingeniero ni validación industrial. El anexo pide estos pasos antes de habilitar uso técnico o publicar; se conservan como pendientes, sin afirmar que los tests los sustituyan. Safari/Firefox, dispositivos físicos, puntos pVT experimentales/coeficientes calibrados del grado exacto, Cp(T)/entalpía, secado faltante, documentación del lote y casos medidos por proceso siguen pendientes.

La entrega se mantiene en `feature/web-v1-modular` para revisión, sin fusionar `main`, publicar la web ni modificar el repositorio de la calculadora original.

[Captura de ficha pVT y trazabilidad manual](capturas/pvt-abs.png).
