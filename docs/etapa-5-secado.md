# CCIP — Etapa 5: secado y acondicionamiento

Base de desarrollo: PR #13, `51def4b684e926e22806d60dc5b346f987b44d1a`.
Auditoría del mismo PR #14 sobre `814652806ba9df0480e352b69b0c12fed26df9bb`.
[Informe final, matriz de requisitos y pruebas](etapa-5/auditoria-final.md).
Sin merge ni deploy. Los siete motores y los 73 registros originales permanecen intactos.

## Datos y procedencia

Nueve grados (ABS, PA6 y PC) conservan recomendaciones de secado. Un rango de tiempo propone
inicialmente su extremo superior, con referencia/rango original y origen `manufacturer_range_upper`.
Es una propuesta nominal editable; no garantiza humedad final. Un tiempo fijo conserva su valor.
Una elección de rango no numérica no se sustituye por el extremo superior. Una temperatura
publicada como rango sigue requiriendo elección expresa; no se calcula desde Tg ni fusión.

El caudal inicia vacío [kg/h]. Ti inicia en **25 °C, supuesto operativo editable**, identificado
junto al campo y en metadatos/exportaciones; no es una propiedad del fabricante. Las entradas
manuales y su origen sobreviven a cambios de nivel y de material. Al cambiar de grado se conserva
la evidencia manual como borrador, pero se reinician las confirmaciones de aplicabilidad.

La densidad aparente se expresa en kg/L; requiere fuente, presentación y condiciones confirmadas.
Un dato de ficha debe corresponder a la presentación documentada. Un valor manual sin esas
confirmaciones permanece visible, pero no habilita volumen. Densidad sólida y fundida no se
sustituyen por densidad aparente. El inventario por masa sigue siendo independiente de densidad.

La [matriz de 73 identidades](etapa-5/matriz-materiales.csv) y la [revisión de las nueve fuentes
oficiales](etapa-5/fuentes-revisadas.json) distinguen dato ausente, documental, manual y supuesto.
No se añadieron valores numéricos al catálogo ni se amplió indiscriminadamente su selección.
Las formulaciones no heredan guías del componente virgen. El secado de mezclas sigue pendiente
de modelo/evidencia específicos; no se desarrolla aquí una etapa posterior.

## Contrato de Cp

No hay un Cp medio aplicable suministrado por las nueve fichas. Un Cp puntual, aunque diga
"sólido", tenga norma DSC o una temperatura de ensayo, **no demuestra el promedio de Ti a Tf**.
Para ΔT>0, el promedio es Cp_medio = [h(Tf)−h(Ti)]/(Tf−Ti) = ∫Cp(T)dT/(Tf−Ti), a condiciones
compatibles de fase y presión. El programa no integra curvas ni infiere ese promedio.

Se permiten dos definiciones explícitas con evidencia de sólido sin transiciones:

- `mean_over_interval`: promedio integral documentado para los extremos exactos Ti y Tf.
  Un promedio de un intervalo más amplio no es automáticamente el promedio de un subintervalo.
- `constant_approximation`: aproximación constante sustentada por la fuente en un intervalo
  que cubra Ti–Tf. Se advierte su carácter aproximado; un punto aislado no basta para sustentarla.

Los datos documentales futuros requieren `thermal_evidence` con definición, fase, intervalo en °C
y ausencia de transición, además de fuente, unidad y valor del grado coincidentes. No se crean
estos metadatos para las fichas actuales. La evidencia manual exige fuente, definición, límites,
fase, declaración de ausencia de transiciones y confirmación vinculada al **valor actual**.
Cambiar el valor o la evidencia invalida la confirmación. Es una declaración del usuario; la app
comprueba consistencia de metadatos, no certifica ni interpreta automáticamente el documento.

Si falta ese respaldo, el Cp introducido se conserva en formulario, historial y exportación,
pero se excluye de las entradas efectivas y la potencia queda pendiente con explicación.
No se aplica Cp del fundido a granza sólida ni Cp histórico agrupado a un grado distinto.

## Fórmulas y límites

- Inventario nominal: M = Q·t [kg], con Q [kg/h] y t [h].
- Volumen útil mínimo teórico: V = M/ρ_bulk [L], con ρ_bulk [kg/L].
- Potencia sensible del polímero: P = Q·Cp_medio·(Tf−Ti)/3600 [kW], con Cp [kJ/(kg·K)].

El factor 3600 convierte horas a segundos: kJ/s = kW. Se admiten Q=0 y ΔT=0 cuando el resto de
entradas y evidencias sean válidas. Vacíos, no finitos, Q negativo, t/ρ/Cp no positivos,
T≤−273.15 °C o Tf<Ti no generan ceros ficticios. Los resultados independientes pueden seguir listos.
No se calculan eliminación de humedad, potencia eléctrica total, evaporación, regeneración,
pérdidas, punto de rocío, flujo de aire ni distribución real de residencia.

`drying_assessment` distingue alcance, razones pendientes, evidencia Cp/bulk y declaraciones de
aplicabilidad. `machine_capacity_certified=false` y `nominal_inventory_not_machine_rating=true`:
una etapa de selección de equipos puede usar estos resultados como necesidades nominales del
caso, nunca como capacidad o potencia certificada de una máquina.

## Historial y exportaciones

Se separan las entradas originales, entradas efectivas enviadas al motor y propiedades usadas.
El estado de campos de secado no activos se conserva en `calculation_metadata.retained_inputs`
y `material.field_states`; no entra en los cálculos básicos/técnicos. Se recupera al cambiar de nivel.
Excel/PDF/JSON incluyen evaluación, fuentes y carácter de supuesto/selección nominal.
Los cálculos históricos no se migran ni se sobrescriben al recuperar o exportar. Una vista activa
recuperada se evalúa con las restricciones actuales; un registro antiguo sin evidencia suficiente
puede mostrar potencia pendiente en esa vista, conservando su snapshot y exportación originales.

## Pruebas

`npm test`, `python tests/browser_smoke.py`, suites de etapas 2–5, `npm run build:pages` y
`python tests/browser_pages_cache.py`. [Resultados ejecutados y límites](etapa-5/auditoria-final.md).
No equivalen a ensayos industriales ni en dispositivos físicos de todos los fabricantes.
