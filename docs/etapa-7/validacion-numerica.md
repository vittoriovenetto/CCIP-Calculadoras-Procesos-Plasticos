# Validación numérica independiente

13 casos sintéticos; 79 salidas contrastadas. Referencias calculadas con Python Decimal (50 dígitos) sin importar CCIP. Node se utiliza únicamente para leer el resultado real. Tolerancia absoluta/relativa: 1e-10 × max(1, |referencia|). No son propiedades de grados o equipos comerciales.

Fuentes: definiciones SI, BIPM (https://www.bipm.org/en/publications/si-brochure); gravedad convencional g₀=9.80665 m/s²; continuidad, geometría y balance sensible declarados en cada fila. La validación comprueba el modelo ideal, no rendimiento industrial. En secado el motor aritmético recibe Cp sintético: su validez de intervalo se verifica aparte en el gate de Etapa 5.

Reproducir: `python scripts/validate-numerics-stage7.py --write`. Los datos completos están en `tests/fixtures-stage7-numerics.json`.

| Caso / resultado | Fórmula | Referencia | CCIP | Unidad | Diferencia | Tolerancia | Conclusión |
|---|---|---:|---:|---|---:|---:|---|
| inyeccion-masa / Masa total sin reserva | n·mₚ+mᵣ, o (n·Vₚ+Vᵣ)ρₘ | 56.0 | 56 | g | 0.0 | 5.6000000000000005e-09 | Aprobado |
| inyeccion-masa / Shot calculado (masa) | m₀(1+a/100) | 60.48 | 60.480000000000004 | g | 7.105427357601002e-15 | 6.048e-09 | Aprobado |
| inyeccion-masa / Shot calculado (volumen) | mₛ/ρₘ | 75.6 | 75.6 | cm³ | 0.0 | 7.56e-09 | Aprobado |
| inyeccion-masa / Capacidad volumétrica teórica del husillo | πD²sₘₐₓ/(4·1000) | 78.53981633974483 | 78.53981633974483 | cm³ | 0.0 | 7.853981633974483e-09 | Aprobado |
| inyeccion-masa / Utilización volumétrica teórica | 100Vₛ/Vₘₐₓ | 96.2569095819783 | 96.25690958197829 | % | 1.4210854715202004e-14 | 9.625690958197831e-09 | Aprobado |
| inyeccion-masa / Carrera calculada del husillo | 1000Vₛ/(πD²/4) | 240.64227395494575 | 240.64227395494575 | mm | 0.0 | 2.4064227395494575e-08 | Aprobado |
| inyeccion-masa / Recorrido remanente al dosificar al máximo | sₘₐₓ−s | 9.357726045054253 | 9.35772604505425 | mm | 3.552713678800501e-15 | 9.357726045054253e-10 | Aprobado |
| inyeccion-masa / Fuerza de cierre teórica | 32 cm²·40 MPa·100 N/(9806.65 N/tf) | 13.052367526117482 | 13.052367526117482 | tf | 0.0 | 1.3052367526117483e-09 | Aprobado |
| inyeccion-masa / Fuerza de cierre con factor | F·1.15 | 15.010222655035104 | 15.010222655035104 | tf | 0.0 | 1.5010222655035105e-09 | Aprobado |
| inyeccion-masa / Tiempo de llenado ideal | Vₛ/(8 cm³/s) | 9.45 | 9.45 | s | 0.0 | 9.45e-10 | Aprobado |
| inyeccion-masa / Tiempo de plastificación estimado | mₛ·3600/(5·1000) | 43.5456 | 43.5456 | s | 0.0 | 4.35456e-09 | Aprobado |
| inyeccion-volumen / Masa total sin reserva | n·mₚ+mᵣ, o (n·Vₚ+Vᵣ)ρₘ | 24.0 | 24 | g | 0.0 | 2.4e-09 | Aprobado |
| inyeccion-volumen / Shot calculado (masa) | m₀(1+a/100) | 26.4 | 26.400000000000002 | g | 3.552713678800501e-15 | 2.64e-09 | Aprobado |
| inyeccion-volumen / Shot calculado (volumen) | mₛ/ρₘ | 35.2 | 35.2 | cm³ | 0.0 | 3.5200000000000003e-09 | Aprobado |
| inyeccion-volumen / Capacidad volumétrica teórica del husillo | πD²sₘₐₓ/(4·1000) | 40.21238596594935 | 40.21238596594935 | cm³ | 0.0 | 4.021238596594935e-09 | Aprobado |
| inyeccion-volumen / Utilización volumétrica teórica | 100Vₛ/Vₘₐₓ | 87.53521870054243 | 87.53521870054244 | % | 1.4210854715202004e-14 | 8.753521870054244e-09 | Aprobado |
| inyeccion-volumen / Carrera calculada del husillo | 1000Vₛ/(πD²/4) | 175.07043740108486 | 175.0704374010849 | mm | 2.842170943040401e-14 | 1.7507043740108487e-08 | Aprobado |
| inyeccion-volumen / Recorrido remanente al dosificar al máximo | sₘₐₓ−s | 24.92956259891513 | 24.929562598915112 | mm | 1.7763568394002505e-14 | 2.492956259891513e-09 | Aprobado |
| inyeccion-volumen / Fuerza de cierre teórica | 32 cm²·40 MPa·100 N/(9806.65 N/tf) | 13.052367526117482 | 13.052367526117482 | tf | 0.0 | 1.3052367526117483e-09 | Aprobado |
| inyeccion-volumen / Fuerza de cierre con factor | F·1.15 | 15.010222655035104 | 15.010222655035104 | tf | 0.0 | 1.5010222655035105e-09 | Aprobado |
| inyeccion-volumen / Tiempo de llenado ideal | Vₛ/(8 cm³/s) | 4.4 | 4.4 | s | 0.0 | 4.4000000000000003e-10 | Aprobado |
| inyeccion-volumen / Tiempo de plastificación estimado | mₛ·3600/(5·1000) | 19.008 | 19.008000000000003 | s | 3.552713678800501e-15 | 1.9008e-09 | Aprobado |
| extrusion-lamina / Área transversal | w·e, o π(Dₒ²−Dᵢ²)/4 | 300.0 | 300 | mm² | 0.0 | 3.0000000000000004e-08 | Aprobado |
| extrusion-lamina / Masa por metro de producto | A mm²·1000 mm/(1000 mm³/cm³)·ρ | 276.0 | 276 | g/m | 0.0 | 2.7600000000000002e-08 | Aprobado |
| extrusion-lamina / Producción neta ideal | m′·v·60/1000 | 198.72 | 198.72 | kg/h | 0.0 | 1.9872e-08 | Aprobado |
| extrusion-lamina / Alimentación con pérdida indicada | Qₙ/(1−r/100) | 216.0 | 216 | kg/h | 0.0 | 2.16e-08 | Aprobado |
| extrusion-lamina / Potencia específica estimada | Qᶠ·E | 64.8 | 64.8 | kW | 0.0 | 6.48e-09 | Aprobado |
| extrusion-lamina / Tiempo de residencia nominal | 60M/Qᶠ; pendiente si Qᶠ=0 | 1.3888888888888888 | 1.3888888888888888 | min | 0.0 | 1.3888888888888888e-10 | Aprobado |
| extrusion-tubo / Área transversal | w·e, o π(Dₒ²−Dᵢ²)/4 | 176.71458676442586 | 176.71458676442586 | mm² | 0.0 | 1.7671458676442587e-08 | Aprobado |
| extrusion-tubo / Masa por metro de producto | A mm²·1000 mm/(1000 mm³/cm³)·ρ | 247.40042147019622 | 247.4004214701962 | g/m | 2.842170943040401e-14 | 2.4740042147019623e-08 | Aprobado |
| extrusion-tubo / Producción neta ideal | m′·v·60/1000 | 118.75220230569418 | 118.75220230569417 | kg/h | 1.4210854715202004e-14 | 1.1875220230569419e-08 | Aprobado |
| extrusion-tubo / Alimentación con pérdida indicada | Qₙ/(1−r/100) | 118.75220230569418 | 118.75220230569417 | kg/h | 1.4210854715202004e-14 | 1.1875220230569419e-08 | Aprobado |
| extrusion-tubo / Potencia específica estimada | Qᶠ·E | 53.438491037562386 | 53.43849103756238 | kW | 7.105427357601002e-15 | 5.343849103756239e-09 | Aprobado |
| extrusion-tubo / Tiempo de residencia nominal | 60M/Qᶠ; pendiente si Qᶠ=0 | 1.5157613627799555 | 1.5157613627799558 | min | 2.220446049250313e-16 | 1.5157613627799555e-10 | Aprobado |
| extrusion-parada / Área transversal | w·e, o π(Dₒ²−Dᵢ²)/4 | 300.0 | 300 | mm² | 0.0 | 3.0000000000000004e-08 | Aprobado |
| extrusion-parada / Masa por metro de producto | A mm²·1000 mm/(1000 mm³/cm³)·ρ | 276.0 | 276 | g/m | 0.0 | 2.7600000000000002e-08 | Aprobado |
| extrusion-parada / Producción neta ideal | m′·v·60/1000 | 0.0 | 0 | kg/h | 0.0 | 1e-10 | Aprobado |
| extrusion-parada / Alimentación con pérdida indicada | Qₙ/(1−r/100) | 0.0 | 0 | kg/h | 0.0 | 1e-10 | Aprobado |
| extrusion-parada / Potencia específica estimada | Qᶠ·E | 0.0 | 0 | kW | 0.0 | 1e-10 | Aprobado |
| extrusion-parada / Tiempo de residencia nominal | 60M/Qᶠ; pendiente si Qᶠ=0 | None | None | min | None | 1e-10 | Aprobado |
| pelicula-normal / Diámetro ideal de burbuja | Dᵦ=2w/π | 199.99999999999997 | 200 | mm | 2.842170943040401e-14 | 1.9999999999999997e-08 | Aprobado |
| pelicula-normal / Área transversal total de la película | 2w·e/1000 | 31.41592653589793 | 31.415926535897935 | mm² | 3.552713678800501e-15 | 3.141592653589793e-09 | Aprobado |
| pelicula-normal / Producción ideal | 2w·e·v·ρ con conversión SI | 13.873273158252525 | 13.873273158252527 | kg/h | 1.7763568394002505e-15 | 1.3873273158252526e-09 | Aprobado |
| pelicula-normal / Relación de soplado (BUR) | Dᵦ/Dᵈ | 1.9999999999999998 | 2 | — | 2.220446049250313e-16 | 1.9999999999999998e-10 | Aprobado |
| pelicula-normal / Relación ideal de estiramiento (DDR) | g/(e·BUR), g y e en mm | 8.0 | 8 | — | 0.0 | 8e-10 | Aprobado |
| pelicula-parada / Diámetro ideal de burbuja | Dᵦ=2w/π | 199.99999999999997 | 200 | mm | 2.842170943040401e-14 | 1.9999999999999997e-08 | Aprobado |
| pelicula-parada / Área transversal total de la película | 2w·e/1000 | 31.41592653589793 | 31.415926535897935 | mm² | 3.552713678800501e-15 | 3.141592653589793e-09 | Aprobado |
| pelicula-parada / Producción ideal | 2w·e·v·ρ con conversión SI | 0.0 | 0 | kg/h | 0.0 | 1e-10 | Aprobado |
| pelicula-parada / Relación de soplado (BUR) | Dᵦ/Dᵈ | 1.9999999999999998 | 2 | — | 2.220446049250313e-16 | 1.9999999999999998e-10 | Aprobado |
| pelicula-parada / Relación ideal de estiramiento (DDR) | g/(e·BUR), g y e en mm | 8.0 | 8 | — | 0.0 | 8e-10 | Aprobado |
| soplado-cilindro / Volumen geométrico cilíndrico | πD²H/4000 (volumen exterior) | 508.9380098815465 | 508.93800988154646 | mL | 5.684341886080802e-14 | 5.089380098815465e-08 | Aprobado |
| soplado-cilindro / Superficie de cilindro cerrado | πDH+πD²/2 | 39584.067435231394 | 39584.06743523139 | mm² | 7.275957614183426e-12 | 3.95840674352314e-06 | Aprobado |
| soplado-cilindro / Masa de pared ideal | S·e·ρ/1000 (aproximación de pared delgada) | 22.562918438081894 | 22.562918438081887 | g | 7.105427357601002e-15 | 2.2562918438081896e-09 | Aprobado |
| soplado-cilindro / Expansión diametral | D/Dₚ | 2.4 | 2.4 | — | 0.0 | 2.4e-10 | Aprobado |
| soplado-cilindro / Material para producción nominal | m·N/1000 | 27.075502125698275 | 27.075502125698264 | kg/h | 1.0658141036401503e-14 | 2.7075502125698278e-09 | Aprobado |
| termoformado-lamina / Superficie de lámina consumida | w·l | 75000.0 | 75000 | mm² | 0.0 | 7.5e-06 | Aprobado |
| termoformado-lamina / Masa de lámina por ciclo | A·e·ρ/1000 | 94.5 | 94.5 | g | 0.0 | 9.45e-09 | Aprobado |
| termoformado-lamina / Espesor medio geométrico ideal | e₀/Rₐ | 0.5 | 0.5 | mm | 0.0 | 1e-10 | Aprobado |
| termoformado-lamina / Ciclos teóricos por hora | 3600/t | 240.0 | 240 | ciclos/h | 0.0 | 2.4e-08 | Aprobado |
| termoformado-lamina / Piezas teóricas por hora | 3600n/t | 960.0 | 960 | pzas/h | 0.0 | 9.6e-08 | Aprobado |
| termoformado-lamina / Consumo de lámina | m·3600/t/1000 | 22.68 | 22.68 | kg/h | 0.0 | 2.268e-09 | Aprobado |
| secado-nominal / Masa mínima de material en tolva | Q·t | 63.0 | 63 | kg | 0.0 | 6.3e-09 | Aprobado |
| secado-nominal / Volumen útil mínimo de tolva | M/ρbulk | 101.61290322580645 | 101.61290322580645 | L | 0.0 | 1.0161290322580645e-08 | Aprobado |
| secado-nominal / Potencia térmica sensible mínima | Q·Cp·(Tf−Ti)/3600; evidencia térmica sintética | 0.525 | 0.525 | kW | 0.0 | 1e-10 | Aprobado |
| secado-parada / Masa mínima de material en tolva | Q·t | 0.0 | 0 | kg | 0.0 | 1e-10 | Aprobado |
| secado-parada / Volumen útil mínimo de tolva | M/ρbulk | 0.0 | 0 | L | 0.0 | 1e-10 | Aprobado |
| secado-parada / Potencia térmica sensible mínima | Q·Cp·(Tf−Ti)/3600; evidencia térmica sintética | 0.0 | 0 | kW | 0.0 | 1e-10 | Aprobado |
| costos-normal / Piezas buenas teóricas | 3600n/t·(1−rechazo/100) | 555.0 | 555 | pzas/h | 0.0 | 5.55e-08 | Aprobado |
| costos-normal / Consumo de material | 3600n·m/t/1000 | 9.0 | 9 | kg/h | 0.0 | 9e-10 | Aprobado |
| costos-normal / Costo de material | Q·precio | 16.2 | 16.2 | moneda/h | 0.0 | 1.62e-09 | Aprobado |
| costos-normal / Costo energético | Pmedia·tarifa | 0.64 | 0.64 | moneda/h | 0.0 | 1e-10 | Aprobado |
| costos-normal / Costo horario directo parcial | Cm+Ce+mano de obra | 28.84 | 28.84 | moneda/h | 0.0 | 2.884e-09 | Aprobado |
| costos-normal / Costo directo parcial por pieza buena | Ch/Ng; pendiente si Ng=0 | 0.051963963963963966 | 0.051963963963963966 | moneda/pza | 0.0 | 1e-10 | Aprobado |
| costos-rechazo-total / Piezas buenas teóricas | 3600n/t·(1−rechazo/100) | 0.0 | 0 | pzas/h | 0.0 | 1e-10 | Aprobado |
| costos-rechazo-total / Consumo de material | 3600n·m/t/1000 | 9.0 | 9 | kg/h | 0.0 | 9e-10 | Aprobado |
| costos-rechazo-total / Costo de material | Q·precio | 16.2 | 16.2 | moneda/h | 0.0 | 1.62e-09 | Aprobado |
| costos-rechazo-total / Costo energético | Pmedia·tarifa | 0.64 | 0.64 | moneda/h | 0.0 | 1e-10 | Aprobado |
| costos-rechazo-total / Costo horario directo parcial | Cm+Ce+mano de obra | 28.84 | 28.84 | moneda/h | 0.0 | 2.884e-09 | Aprobado |
| costos-rechazo-total / Costo directo parcial por pieza buena | Ch/Ng; pendiente si Ng=0 | None | None | moneda/pza | None | 1e-10 | Aprobado |
