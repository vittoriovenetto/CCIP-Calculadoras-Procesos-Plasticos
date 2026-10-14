# Modelos, unidades y validación técnica

Esta versión comprueba aritmética, unidades y dominios de entrada. **No constituye validación industrial**, selección de equipo ni receta de operación. Los números de `tests/fixtures.js` y las dimensiones/cantidades precargadas en pantalla son casos sintéticos editables; no identifican grados comerciales ni máquinas reales. La biblioteca V1 incorpora nueve grados documentados en los adjuntos del usuario; las propiedades ausentes permanecen pendientes. Véase [biblioteca y compatibilidad](materiales.md).

## Convenciones comunes

- Masa: g en piezas; kg en caudales/inventarios. Longitudes: mm, excepto velocidad de línea en m/min y película en µm. Densidad sólida/fundida: g/cm³; densidad aparente de granza: kg/L. No son intercambiables.
- `1 cm³ = 1000 mm³`, `1 mL = 1 cm³`, `1 µm = 0.001 mm`, `1 h = 3600 s`, `1 MPa = 1 N/mm²`, `1 tf = 9806.65 N`, `1 kW = 1 kJ/s`. La tonelada fuerza no es una unidad de masa.
- Se aceptan números finitos y cadenas numéricas; vacío/espacios/null significan dato ausente, no cero. Booleanos, listas, texto, NaN e infinito son inválidos. El separador de la API numérica es el punto; el navegador gestiona su formato de entrada.
- Una entrada inválida genera advertencia y deja pendientes sus resultados dependientes; los resultados independientes siguen disponibles. Nunca se exporta un resultado NaN/Infinity. Los desbordamientos detectados se advierten.
- Cavidades/piezas por ciclo: enteros positivos. Dimensiones, densidades, tiempos, caudales de inyección/plastificación, energía específica, inventario y cp: positivos. Velocidad de línea, caudal de secado, unidades/h, canales, colchón, reserva y costos: admiten cero. Diámetro interior cero representa el límite de sección maciza.
- Temperaturas Celsius: mayores que −273.15 °C. El calentamiento necesita ΔT ≥ 0; ΔT = 0 da potencia sensible cero. Esto no recomienda secar a ninguna temperatura concreta.
- Pérdidas de extrusión: 0 ≤ p < 100 %. Rechazo de piezas: 0 ≤ r ≤ 100 %. Con rechazo total hay cero piezas buenas y costo unitario pendiente. Factor de cierre y relación de áreas: ≥ 1.
- Canales, reserva, pérdida y rechazo ausentes se interpretan como cero para mantener el cálculo nominal existente; la interfaz y las notas explican esta hipótesis, que debe confirmarse. No se asignan densidades, cp, tiempo de secado ni factor de seguridad cuando faltan.
- Los niveles limitan tanto las entradas visibles como las utilizadas: básico (1), técnico (1–2), avanzado (1–3). Los datos ocultos se conservan al cambiar nivel para volver a editarlos, pero no participan en el cálculo ni se incluyen en sus entradas exportadas. Los resultados que necesitan datos de un nivel superior quedan pendientes; un nivel avanzado no aumenta la fidelidad física de las ecuaciones.

## Inyección

Para N cavidades, masa de pieza m y masa total de canales mc: `M = mN + mc`. El shot reservado es `Ms = M(1 + reserva/100)`. Con densidad real del fundido ρf: `Vs = Ms/ρf`.

En modo volumétrico se requiere **volumen equivalente de fundido** por pieza y canales a condiciones de proceso: `Vs = (Vp N + Vc)(1 + reserva/100)` y `Ms = Vs ρf`. El volumen sólido final no se convierte automáticamente en volumen de fundido: faltan contracción, densidad/PVT y compactación. La denominación del campo se corrigió para evitar esa confusión.

Con diámetro nominal D y carrera máxima L: área `A = πD²/4` en mm², capacidad ideal `C = AL/1000` en cm³, carrera `s = 1000Vs/A` en mm, utilización `100Vs/C` en %, recorrido remanente `L − s`. Un remanente negativo es un diagnóstico de incompatibilidad y no un resultado operativo válido. Se advierte si `s > L` o `s + colchón > L`.

Cierre: `F = área proyectada [cm²] × presión efectiva de cavidad [MPa] × 100/9806.65` en tf; con factor, `Fseg = F × factor`. No se presupone un factor 1.25 ni se usa presión hidráulica como presión de cavidad. Llenado nominal `Vs/Q` en s; plastificación `Ms × 3.6/R` en s para R en kg/h.

**Límites/validación necesaria:** capacidad geométrica no homologada, geometría efectiva del husillo y válvula, carrera y colchón según máquina, pérdidas/compresibilidad, curva de caudal y presión real, temperatura del fundido, canales y contracción. Llenado usa el shot con reserva: no representa por sí solo el llenado de cavidades ni un ciclo completo. El margen de shot no equivale al colchón residual. Masa, volumen, carrera, utilización, fuerza de cierre y tiempos requieren contrastar ficha de equipo, datos del grado y mediciones antes de emplearlos en producción.

## Extrusión

Lámina: sección `A = ancho × espesor`. Tubo: `A = π(De² − Di²)/4`, con `0 ≤ Di < De`, en mm². Un metro de producto tiene volumen numéricamente A en cm³: `m' = Aρ` g/m. Producción ideal `Qn = m' v × 60/1000` kg/h, para v en m/min. Alimentación `Qa = Qn/(1 − pérdida/100)` kg/h.

Potencia `P = Qa × energía específica` kW con energía en kWh/kg. Residencia nominal `t = 60 × inventario/Qa` min. Con v = 0, producción/alimentación/potencia calculada son cero; la residencia queda pendiente al no haber caudal.

**Límites/validación necesaria:** sección y densidad uniformes a medición final, velocidad sin deslizamiento y balance de pérdidas consistente. No predice RPM, reología, presión, temperatura, tornillo ni estabilidad. La residencia nominal no es la distribución de tiempos. La energía específica y el inventario son datos medidos, no propiedades deducidas. Validar caudal pesado, sección, consumo eléctrico y tiempo de residencia; potencia no dimensiona motor ni incluye automáticamente demanda en vacío.

## Película soplada

Para ancho plegado W en mm, espesor de **una pared** e en µm, velocidad v en m/min y densidad sólida ρ: diámetro de burbuja `Db = 2W/π`, sección de dos paredes `A = 2W(e/1000)` mm² y producción `Q = A v ρ × 0.06` kg/h. `BUR = Db/Dd` y `DDR = gap [mm] × 1000/(e [µm] × BUR)`. BUR < 1 genera aviso de revisión, no se fuerza a un valor supuesto.

**Límites/validación necesaria:** tubo sin corte, paredes uniformes y sin pérdidas; no hay pliegues laterales ni multicapa con distintas densidades. DDR es una aproximación geométrica con sección anular delgada y diámetro nominal del anillo: no incluye hinchamiento, cambio de densidad entre dado y producto, cristalización ni variación de espesor. Validar geometría del dado, BUR/DDR, espesores y producción gravimétrica; no usar DDR como velocidad real de fundido sin caracterización adicional.

## Soplado de envases

Cilindro exterior cerrado D × H en mm: `Vext = πD²H/4000` mL y `Sext = πDH + πD²/2` mm². Pared delgada uniforme t: masa aproximada `m = Sext tρ/1000` g. Expansión diametral `D/Dparisón`; consumo nominal `m × unidades/h /1000` kg/h.

**Límites/validación necesaria:** el volumen mostrado es exterior, **no capacidad útil del envase**. La aproximación de masa usa la superficie exterior, sobreestima la pared frente al cilindro hueco ideal y omite cuello, hombros, asa, rebabas y distribución local. Se rechaza masa si `2t ≥ D` o `2t ≥ H`. Se advierte pared gruesa cuando `t/min(D/2,H) > 0.1`; es una señal heurística de revisión, no una tolerancia industrial ni garantía de precisión bajo ese umbral. Validar por pesaje, espesores locales, geometría real y medición de capacidad. Expansión diametral no predice espesor ni resistencia.

## Termoformado

Área de lámina **total consumida por ciclo** `A0 = ancho × largo` mm²; masa `m0 = A0 e0ρ/1000` g. Espesor medio geométrico `emedio = e0/RA` mm, con `RA = área formada/área inicial` de la misma región (RA ≥ 1). Ciclos/h `3600/tc`; piezas/h `3600N/tc`; consumo `m0 × 3600/tc/1000` kg/h. Sin N no se supone una cavidad en el motor.

**Límites/validación necesaria:** conservación ideal de volumen/densidad; no se obtiene espesor local ni espesor mínimo. El área de recorte es de todo el ciclo, no de cada cavidad, e incluye sobrantes. Validar temperatura, deformación, área efectiva, espesores y tiempos medidos. Productividad nominal omite disponibilidad y rechazo; no equivale a piezas conformes/h.

## Secado

Inventario nominal `M = caudal [kg/h] × residencia [h]` kg; volumen útil nominal `V = M/densidad aparente [kg/L]` L. Potencia sensible mínima `P = caudal × cp [kJ/kg·K] × (Tf − Ti)/3600` kW. Las diferencias de °C y K tienen la misma magnitud. No se requiere que Ti o Tf sean positivas en escala Celsius. Caudal cero produce cero inventario, volumen y potencia si los demás datos están presentes.

**Límites/validación necesaria:** no calcula humedad final, calor de evaporación, pérdidas, distribución de residencia, eficiencia, aire, punto de rocío, regeneración ni fracción útil de la tolva. Volumen útil no es capacidad nominal de catálogo. Tiempo/temperatura deben venir del grado y del fabricante; cp es un promedio verificado en el intervalo. Validar humedad antes/después y desempeño del equipo; potencia mínima no dimensiona un secador real. Tf < Ti deja el calentamiento pendiente y advierte que el modelo no aplica.

## Producción y costos

Para ciclo tc en s, N piezas/ciclo, masa m en g y rechazo r %: piezas buenas `Ng = 3600N/tc × (1 − r/100)`; alimentación `Qa = 3600Nm/tc/1000` kg/h, incluyendo piezas rechazadas. Material/h `Qa × precio/kg`; energía/h `potencia media [kW] × tarifa [moneda/kWh]`; costo parcial/h `material + energía + mano de obra`; costo por pieza buena `costo parcial/h / Ng`.

**Límites/validación necesaria:** consumo excluye coladas, rebabas y purgas, sin recuperación ni crédito de material. No incluye OEE/disponibilidad, moldes, depreciación, mantenimiento, indirectos ni variaciones de ciclo. Costos explícitos cero son válidos; campos vacíos no se interpretan como operación gratuita. Una misma moneda y un mismo período de medición deben aplicarse a todos los costos. Validar contra producción conformada, consumos y contabilidad; costo parcial no equivale a costo total ni precio de venta. Con 100 % de rechazo no existe costo por pieza buena finito.

## Evidencia pendiente antes de aprobar resultados técnicos

Por cada caso real: registrar grado comercial y ficha/versionado, condiciones de temperatura/presión, unidades y fuente de densidad/cp, máquina y manual aplicable, geometría, mediciones trazables y responsable de revisión. Comparar predicción y medición con incertidumbre y tolerancia acordadas por ingeniería. Esta auditoría no dispone de esos documentos ni de datos de planta; no los sustituye por constantes ni referencias inventadas.
