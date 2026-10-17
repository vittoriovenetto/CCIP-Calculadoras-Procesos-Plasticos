export const symbols = {
  "cavities": "n",
  "partMass": "mₚ",
  "runnerMass": "mᵣ",
  "partVolume": "Vₚ",
  "runnerVolume": "Vᵣ",
  "meltDensity": "ρₘ",
  "shotMargin": "a",
  "screwD": "D",
  "screwMaxStroke": "Lₘₐₓ",
  "targetCushion": "L꜀",
  "projectedArea": "Aₚ",
  "cavityPressure": "P",
  "clampFactor": "k",
  "injectionFlow": "qᵥ",
  "plasticizingRate": "qₘ",
  "width": "w",
  "thickness": "e",
  "outerD": "Dₒ",
  "innerD": "Dᵢ",
  "lineSpeed": "v",
  "density": "ρₛ",
  "lossPct": "r",
  "secEnergy": "E",
  "holdUpKg": "M",
  "layflat": "w",
  "filmGauge": "e",
  "dieDiameter": "Dᵈ",
  "dieGap": "g",
  "bodyD": "D",
  "bodyH": "H",
  "wall": "e",
  "parisonD": "Dₚ",
  "unitsHour": "N",
  "blankW": "w",
  "blankL": "l",
  "initialT": "e₀",
  "cycleSec": "t꜀",
  "drawAreaRatio": "Rₐ",
  "throughput": "Q",
  "residence": "tᵣ",
  "bulkDensity": "ρᵦ",
  "startT": "T₀",
  "targetT": "T₁",
  "specificHeat": "cₚ",
  "scrapPct": "r",
  "resinCost": "pₘ",
  "powerKw": "P",
  "energyCost": "pₑ",
  "laborHour": "Cₗ"
};
export const lessons = [
  {
    "id": "inyeccion-1",
    "module": "inyeccion",
    "label": "Masa total sin reserva",
    "equation": "m₀ = n mₚ + mᵣ",
    "fields": [
      "cavities",
      "partMass",
      "runnerMass"
    ],
    "steps": [
      "m₀ = 2 × 30 + 5",
      "m₀ = 65 g"
    ],
    "expected": 65,
    "conversions": {
      "es": "1 cm³ = 1000 mm³; 1 cm² × 1 MPa = 100 N; 1 tf = 9806.65 N; 1 kg/h = 1000/3600 g/s. La reserva a está en %, no en fracción.",
      "en": "1 cm³ = 1000 mm³; 1 cm² × 1 MPa = 100 N; 1 tf = 9806.65 N; 1 kg/h = 1000/3600 g/s. Allowance a is in %, not a fraction."
    }
  },
  {
    "id": "inyeccion-2",
    "module": "inyeccion",
    "label": "Shot calculado (masa)",
    "equation": "mₛ = m₀ (1 + a/100)",
    "fields": [
      "cavities",
      "partMass",
      "runnerMass",
      "shotMargin"
    ],
    "steps": [
      "m₀ = 2 × 30 + 5 = 65 g",
      "mₛ = 65 × (1 + 10/100) = 71.5 g"
    ],
    "expected": 71.5,
    "conversions": {
      "es": "1 cm³ = 1000 mm³; 1 cm² × 1 MPa = 100 N; 1 tf = 9806.65 N; 1 kg/h = 1000/3600 g/s. La reserva a está en %, no en fracción.",
      "en": "1 cm³ = 1000 mm³; 1 cm² × 1 MPa = 100 N; 1 tf = 9806.65 N; 1 kg/h = 1000/3600 g/s. Allowance a is in %, not a fraction."
    }
  },
  {
    "id": "inyeccion-3",
    "module": "inyeccion",
    "label": "Shot calculado (volumen)",
    "equation": "Vₛ = mₛ / ρₘ",
    "fields": [
      "cavities",
      "partMass",
      "runnerMass",
      "shotMargin",
      "meltDensity"
    ],
    "steps": [
      "mₛ = 65 × 1.1 = 71.5 g",
      "Vₛ = 71.5 / 0.8 = 89.375 cm³"
    ],
    "expected": 89.375,
    "conversions": {
      "es": "1 cm³ = 1000 mm³; 1 cm² × 1 MPa = 100 N; 1 tf = 9806.65 N; 1 kg/h = 1000/3600 g/s. La reserva a está en %, no en fracción.",
      "en": "1 cm³ = 1000 mm³; 1 cm² × 1 MPa = 100 N; 1 tf = 9806.65 N; 1 kg/h = 1000/3600 g/s. Allowance a is in %, not a fraction."
    }
  },
  {
    "id": "inyeccion-4",
    "module": "inyeccion",
    "label": "Capacidad volumétrica teórica del husillo",
    "equation": "Vₘₐₓ = (π D²/4) Lₘₐₓ / 1000",
    "fields": [
      "screwD",
      "screwMaxStroke"
    ],
    "steps": [
      "A = π × 20² / 4 = 314.159265 mm²",
      "Vₘₐₓ = 314.159265 × 400 / 1000 ≈ 125.663706 cm³"
    ],
    "expected": 125.66370614359172,
    "conversions": {
      "es": "1 cm³ = 1000 mm³; 1 cm² × 1 MPa = 100 N; 1 tf = 9806.65 N; 1 kg/h = 1000/3600 g/s. La reserva a está en %, no en fracción.",
      "en": "1 cm³ = 1000 mm³; 1 cm² × 1 MPa = 100 N; 1 tf = 9806.65 N; 1 kg/h = 1000/3600 g/s. Allowance a is in %, not a fraction."
    }
  },
  {
    "id": "inyeccion-5",
    "module": "inyeccion",
    "label": "Utilización volumétrica teórica",
    "equation": "U = 100 Vₛ / Vₘₐₓ",
    "fields": [
      "cavities",
      "partMass",
      "runnerMass",
      "shotMargin",
      "meltDensity",
      "screwD",
      "screwMaxStroke"
    ],
    "steps": [
      "Vₛ = 71.5 / 0.8 = 89.375 cm³",
      "U = 100 × 89.375 / 125.663706 ≈ 71.122365 %"
    ],
    "expected": 71.12236519419073,
    "conversions": {
      "es": "1 cm³ = 1000 mm³; 1 cm² × 1 MPa = 100 N; 1 tf = 9806.65 N; 1 kg/h = 1000/3600 g/s. La reserva a está en %, no en fracción.",
      "en": "1 cm³ = 1000 mm³; 1 cm² × 1 MPa = 100 N; 1 tf = 9806.65 N; 1 kg/h = 1000/3600 g/s. Allowance a is in %, not a fraction."
    }
  },
  {
    "id": "inyeccion-6",
    "module": "inyeccion",
    "label": "Carrera calculada del husillo",
    "equation": "Lₛ = 1000 Vₛ / A",
    "fields": [
      "cavities",
      "partMass",
      "runnerMass",
      "shotMargin",
      "meltDensity",
      "screwD"
    ],
    "steps": [
      "A = π × 20² / 4 = 314.159265 mm²",
      "Lₛ = 1000 × 89.375 / 314.159265 ≈ 284.489461 mm"
    ],
    "expected": 284.4894607767629,
    "conversions": {
      "es": "1 cm³ = 1000 mm³; 1 cm² × 1 MPa = 100 N; 1 tf = 9806.65 N; 1 kg/h = 1000/3600 g/s. La reserva a está en %, no en fracción.",
      "en": "1 cm³ = 1000 mm³; 1 cm² × 1 MPa = 100 N; 1 tf = 9806.65 N; 1 kg/h = 1000/3600 g/s. Allowance a is in %, not a fraction."
    }
  },
  {
    "id": "inyeccion-7",
    "module": "inyeccion",
    "label": "Recorrido remanente al dosificar al máximo",
    "equation": "Lᵣ = Lₘₐₓ − Lₛ",
    "fields": [
      "screwMaxStroke",
      "screwD",
      "partMass",
      "cavities",
      "runnerMass",
      "shotMargin",
      "meltDensity"
    ],
    "steps": [
      "Lₛ ≈ 284.489461 mm",
      "Lᵣ = 400 − 284.489461 ≈ 115.510539 mm"
    ],
    "expected": 115.51053922323712,
    "conversions": {
      "es": "1 cm³ = 1000 mm³; 1 cm² × 1 MPa = 100 N; 1 tf = 9806.65 N; 1 kg/h = 1000/3600 g/s. La reserva a está en %, no en fracción.",
      "en": "1 cm³ = 1000 mm³; 1 cm² × 1 MPa = 100 N; 1 tf = 9806.65 N; 1 kg/h = 1000/3600 g/s. Allowance a is in %, not a fraction."
    }
  },
  {
    "id": "inyeccion-8",
    "module": "inyeccion",
    "label": "Fuerza de cierre teórica",
    "equation": "F = 100 Aₚ P / 9806.65",
    "fields": [
      "projectedArea",
      "cavityPressure"
    ],
    "steps": [
      "F = 100 × 100 × 50 = 500000 N",
      "F = 500000 / 9806.65 ≈ 50.985811 tf"
    ],
    "expected": 50.98581064889641,
    "conversions": {
      "es": "1 cm³ = 1000 mm³; 1 cm² × 1 MPa = 100 N; 1 tf = 9806.65 N; 1 kg/h = 1000/3600 g/s. La reserva a está en %, no en fracción.",
      "en": "1 cm³ = 1000 mm³; 1 cm² × 1 MPa = 100 N; 1 tf = 9806.65 N; 1 kg/h = 1000/3600 g/s. Allowance a is in %, not a fraction."
    }
  },
  {
    "id": "inyeccion-9",
    "module": "inyeccion",
    "label": "Fuerza de cierre con factor",
    "equation": "Fₛ = F k",
    "fields": [
      "projectedArea",
      "cavityPressure",
      "clampFactor"
    ],
    "steps": [
      "F = 500000 / 9806.65 ≈ 50.985811 tf",
      "Fₛ = 50.985811 × 1.2 ≈ 61.182973 tf"
    ],
    "expected": 61.18297277867569,
    "conversions": {
      "es": "1 cm³ = 1000 mm³; 1 cm² × 1 MPa = 100 N; 1 tf = 9806.65 N; 1 kg/h = 1000/3600 g/s. La reserva a está en %, no en fracción.",
      "en": "1 cm³ = 1000 mm³; 1 cm² × 1 MPa = 100 N; 1 tf = 9806.65 N; 1 kg/h = 1000/3600 g/s. Allowance a is in %, not a fraction."
    }
  },
  {
    "id": "inyeccion-10",
    "module": "inyeccion",
    "label": "Tiempo de llenado ideal",
    "equation": "tᶠ = Vₛ / qᵥ",
    "fields": [
      "partMass",
      "cavities",
      "runnerMass",
      "shotMargin",
      "meltDensity",
      "injectionFlow"
    ],
    "steps": [
      "Vₛ = 71.5 / 0.8 = 89.375 cm³",
      "tᶠ = 89.375 / 100 = 0.89375 s"
    ],
    "expected": 0.89375,
    "conversions": {
      "es": "1 cm³ = 1000 mm³; 1 cm² × 1 MPa = 100 N; 1 tf = 9806.65 N; 1 kg/h = 1000/3600 g/s. La reserva a está en %, no en fracción.",
      "en": "1 cm³ = 1000 mm³; 1 cm² × 1 MPa = 100 N; 1 tf = 9806.65 N; 1 kg/h = 1000/3600 g/s. Allowance a is in %, not a fraction."
    }
  },
  {
    "id": "inyeccion-11",
    "module": "inyeccion",
    "label": "Tiempo de plastificación estimado",
    "equation": "tᵖ = 3.6 mₛ / qₘ",
    "fields": [
      "partMass",
      "cavities",
      "runnerMass",
      "shotMargin",
      "plasticizingRate"
    ],
    "steps": [
      "qₘ = 20 kg/h = 20000/3600 g/s",
      "tᵖ = 71.5 × 3.6 / 20 = 12.87 s"
    ],
    "expected": 12.87,
    "conversions": {
      "es": "1 cm³ = 1000 mm³; 1 cm² × 1 MPa = 100 N; 1 tf = 9806.65 N; 1 kg/h = 1000/3600 g/s. La reserva a está en %, no en fracción.",
      "en": "1 cm³ = 1000 mm³; 1 cm² × 1 MPa = 100 N; 1 tf = 9806.65 N; 1 kg/h = 1000/3600 g/s. Allowance a is in %, not a fraction."
    }
  },
  {
    "id": "extrusion-1",
    "module": "extrusion",
    "label": "Área transversal",
    "equation": "A = w e; A(tubo) = π (Dₒ² − Dᵢ²)/4",
    "fields": [
      "width",
      "thickness"
    ],
    "steps": [
      "A = 500 × 1",
      "A = 500 mm²"
    ],
    "expected": 500,
    "conversions": {
      "es": "1 m = 1000 mm; 1 cm³ = 1000 mm³; 1 kg = 1000 g; 1 h = 60 min. kg/h × kWh/kg = kW.",
      "en": "1 m = 1000 mm; 1 cm³ = 1000 mm³; 1 kg = 1000 g; 1 h = 60 min. kg/h × kWh/kg = kW."
    }
  },
  {
    "id": "extrusion-2",
    "module": "extrusion",
    "label": "Masa por metro de producto",
    "equation": "m′ = A ρₛ",
    "fields": [
      "width",
      "thickness",
      "density"
    ],
    "steps": [
      "V(1 m) = 500 mm² × 1000 mm / 1000 = 500 cm³",
      "m′ = 500 × 0.92 = 460 g/m"
    ],
    "expected": 460,
    "conversions": {
      "es": "1 m = 1000 mm; 1 cm³ = 1000 mm³; 1 kg = 1000 g; 1 h = 60 min. kg/h × kWh/kg = kW.",
      "en": "1 m = 1000 mm; 1 cm³ = 1000 mm³; 1 kg = 1000 g; 1 h = 60 min. kg/h × kWh/kg = kW."
    }
  },
  {
    "id": "extrusion-3",
    "module": "extrusion",
    "label": "Producción neta ideal",
    "equation": "Qₙ = m′ v × 60/1000",
    "fields": [
      "width",
      "thickness",
      "density",
      "lineSpeed"
    ],
    "steps": [
      "m′ = 500 × 0.92 = 460 g/m",
      "Qₙ = 460 × 10 × 60 / 1000 = 276 kg/h"
    ],
    "expected": 276,
    "conversions": {
      "es": "1 m = 1000 mm; 1 cm³ = 1000 mm³; 1 kg = 1000 g; 1 h = 60 min. kg/h × kWh/kg = kW.",
      "en": "1 m = 1000 mm; 1 cm³ = 1000 mm³; 1 kg = 1000 g; 1 h = 60 min. kg/h × kWh/kg = kW."
    }
  },
  {
    "id": "extrusion-4",
    "module": "extrusion",
    "label": "Alimentación con pérdida indicada",
    "equation": "Qᶠ = Qₙ / (1 − r/100)",
    "fields": [
      "width",
      "thickness",
      "density",
      "lineSpeed",
      "lossPct"
    ],
    "steps": [
      "Qₙ = 276 kg/h; 1 − 20/100 = 0.8",
      "Qᶠ = 276 / 0.8 = 345 kg/h"
    ],
    "expected": 345,
    "conversions": {
      "es": "1 m = 1000 mm; 1 cm³ = 1000 mm³; 1 kg = 1000 g; 1 h = 60 min. kg/h × kWh/kg = kW.",
      "en": "1 m = 1000 mm; 1 cm³ = 1000 mm³; 1 kg = 1000 g; 1 h = 60 min. kg/h × kWh/kg = kW."
    }
  },
  {
    "id": "extrusion-5",
    "module": "extrusion",
    "label": "Potencia específica estimada",
    "equation": "P = Qᶠ E",
    "fields": [
      "width",
      "thickness",
      "density",
      "lineSpeed",
      "lossPct",
      "secEnergy"
    ],
    "steps": [
      "Qᶠ = 276 / 0.8 = 345 kg/h",
      "P = 345 × 0.2 = 69 kW"
    ],
    "expected": 69,
    "conversions": {
      "es": "1 m = 1000 mm; 1 cm³ = 1000 mm³; 1 kg = 1000 g; 1 h = 60 min. kg/h × kWh/kg = kW.",
      "en": "1 m = 1000 mm; 1 cm³ = 1000 mm³; 1 kg = 1000 g; 1 h = 60 min. kg/h × kWh/kg = kW."
    }
  },
  {
    "id": "extrusion-6",
    "module": "extrusion",
    "label": "Tiempo de residencia nominal",
    "equation": "tᵣ = 60 M / Qᶠ",
    "fields": [
      "holdUpKg",
      "width",
      "thickness",
      "density",
      "lineSpeed",
      "lossPct"
    ],
    "steps": [
      "Qᶠ = 345 kg/h",
      "tᵣ = 60 × 10 / 345 ≈ 1.739130 min"
    ],
    "expected": 1.7391304347826086,
    "conversions": {
      "es": "1 m = 1000 mm; 1 cm³ = 1000 mm³; 1 kg = 1000 g; 1 h = 60 min. kg/h × kWh/kg = kW.",
      "en": "1 m = 1000 mm; 1 cm³ = 1000 mm³; 1 kg = 1000 g; 1 h = 60 min. kg/h × kWh/kg = kW."
    }
  },
  {
    "id": "pelicula-1",
    "module": "pelicula",
    "label": "Diámetro ideal de burbuja",
    "equation": "Dᵦ = 2 w / π",
    "fields": [
      "layflat"
    ],
    "steps": [
      "Dᵦ = 2 × 500 / π",
      "Dᵦ ≈ 318.309886 mm"
    ],
    "expected": 318.3098861837907,
    "conversions": {
      "es": "Espesor e: µm / 1000 → mm. El factor 0.06 reúne minutos/hora, mm³/cm³ y gramos/kg. BUR y DDR son adimensionales.",
      "en": "Thickness e: µm / 1000 → mm. Factor 0.06 combines minutes/hour, mm³/cm³ and grams/kg. BUR and DDR are dimensionless."
    }
  },
  {
    "id": "pelicula-2",
    "module": "pelicula",
    "label": "Área transversal total de la película",
    "equation": "A = 2 w (e/1000)",
    "fields": [
      "layflat",
      "filmGauge"
    ],
    "steps": [
      "e = 50 µm = 0.05 mm",
      "A = 2 × 500 × 0.05 = 50 mm²"
    ],
    "expected": 50,
    "conversions": {
      "es": "Espesor e: µm / 1000 → mm. El factor 0.06 reúne minutos/hora, mm³/cm³ y gramos/kg. BUR y DDR son adimensionales.",
      "en": "Thickness e: µm / 1000 → mm. Factor 0.06 combines minutes/hour, mm³/cm³ and grams/kg. BUR and DDR are dimensionless."
    }
  },
  {
    "id": "pelicula-3",
    "module": "pelicula",
    "label": "Producción ideal",
    "equation": "Q = A v ρₛ × 0.06",
    "fields": [
      "layflat",
      "filmGauge",
      "lineSpeed",
      "density"
    ],
    "steps": [
      "A = 2 × 500 × (50/1000) = 50 mm²",
      "Q = 50 × 18 × 0.92 × 0.06 = 49.68 kg/h"
    ],
    "expected": 49.68,
    "conversions": {
      "es": "Espesor e: µm / 1000 → mm. El factor 0.06 reúne minutos/hora, mm³/cm³ y gramos/kg. BUR y DDR son adimensionales.",
      "en": "Thickness e: µm / 1000 → mm. Factor 0.06 combines minutes/hour, mm³/cm³ and grams/kg. BUR and DDR are dimensionless."
    }
  },
  {
    "id": "pelicula-4",
    "module": "pelicula",
    "label": "Relación de soplado (BUR)",
    "equation": "BUR = Dᵦ / Dᵈ",
    "fields": [
      "layflat",
      "dieDiameter"
    ],
    "steps": [
      "Dᵦ = 2 × 500 / π ≈ 318.309886 mm",
      "BUR = 318.309886 / 200 ≈ 1.591549"
    ],
    "expected": 1.5915494309189535,
    "conversions": {
      "es": "Espesor e: µm / 1000 → mm. El factor 0.06 reúne minutos/hora, mm³/cm³ y gramos/kg. BUR y DDR son adimensionales.",
      "en": "Thickness e: µm / 1000 → mm. Factor 0.06 combines minutes/hour, mm³/cm³ and grams/kg. BUR and DDR are dimensionless."
    }
  },
  {
    "id": "pelicula-5",
    "module": "pelicula",
    "label": "Relación ideal de estiramiento (DDR)",
    "equation": "DDR = 1000 g / (e BUR)",
    "fields": [
      "layflat",
      "dieDiameter",
      "dieGap",
      "filmGauge"
    ],
    "steps": [
      "e = 50 µm = 0.05 mm; BUR ≈ 1.591549",
      "DDR = 1 / (0.05 × 1.591549) ≈ 12.566371"
    ],
    "expected": 12.566370614359172,
    "conversions": {
      "es": "Espesor e: µm / 1000 → mm. El factor 0.06 reúne minutos/hora, mm³/cm³ y gramos/kg. BUR y DDR son adimensionales.",
      "en": "Thickness e: µm / 1000 → mm. Factor 0.06 combines minutes/hour, mm³/cm³ and grams/kg. BUR and DDR are dimensionless."
    }
  },
  {
    "id": "soplado-1",
    "module": "soplado",
    "label": "Volumen geométrico cilíndrico",
    "equation": "Vₒ = π D² H / 4000",
    "fields": [
      "bodyD",
      "bodyH"
    ],
    "steps": [
      "V = π × 80² × 200 / 4 = 1005309.649149 mm³",
      "Vₒ = V / 1000 ≈ 1005.309649 mL"
    ],
    "expected": 1005.3096491487338,
    "conversions": {
      "es": "1 mL = 1 cm³ = 1000 mm³; 1000 g = 1 kg. Todas las dimensiones de pared se introducen en mm.",
      "en": "1 mL = 1 cm³ = 1000 mm³; 1000 g = 1 kg. All wall dimensions are entered in mm."
    }
  },
  {
    "id": "soplado-2",
    "module": "soplado",
    "label": "Superficie de cilindro cerrado",
    "equation": "S = π D H + π D²/2",
    "fields": [
      "bodyD",
      "bodyH"
    ],
    "steps": [
      "S = π × 80 × 200 + π × 80² / 2",
      "S ≈ 60318.578949 mm²"
    ],
    "expected": 60318.57894892403,
    "conversions": {
      "es": "1 mL = 1 cm³ = 1000 mm³; 1000 g = 1 kg. Todas las dimensiones de pared se introducen en mm.",
      "en": "1 mL = 1 cm³ = 1000 mm³; 1000 g = 1 kg. All wall dimensions are entered in mm."
    }
  },
  {
    "id": "soplado-3",
    "module": "soplado",
    "label": "Masa de pared ideal",
    "equation": "m = S e ρₛ / 1000",
    "fields": [
      "bodyD",
      "bodyH",
      "wall",
      "density"
    ],
    "steps": [
      "S ≈ 60318.578949 mm²; e = 1 mm",
      "m = 60318.578949 × 1 × 1 / 1000 ≈ 60.318579 g"
    ],
    "expected": 60.31857894892403,
    "conversions": {
      "es": "1 mL = 1 cm³ = 1000 mm³; 1000 g = 1 kg. Todas las dimensiones de pared se introducen en mm.",
      "en": "1 mL = 1 cm³ = 1000 mm³; 1000 g = 1 kg. All wall dimensions are entered in mm."
    }
  },
  {
    "id": "soplado-4",
    "module": "soplado",
    "label": "Expansión diametral",
    "equation": "R = D / Dₚ",
    "fields": [
      "bodyD",
      "parisonD"
    ],
    "steps": [
      "R = 80 / 20",
      "R = 4"
    ],
    "expected": 4,
    "conversions": {
      "es": "1 mL = 1 cm³ = 1000 mm³; 1000 g = 1 kg. Todas las dimensiones de pared se introducen en mm.",
      "en": "1 mL = 1 cm³ = 1000 mm³; 1000 g = 1 kg. All wall dimensions are entered in mm."
    }
  },
  {
    "id": "soplado-5",
    "module": "soplado",
    "label": "Material para producción nominal",
    "equation": "Q = m N / 1000",
    "fields": [
      "bodyD",
      "bodyH",
      "wall",
      "density",
      "unitsHour"
    ],
    "steps": [
      "m ≈ 60.318579 g",
      "Q = 60.318579 × 100 / 1000 ≈ 6.031858 kg/h"
    ],
    "expected": 6.031857894892402,
    "conversions": {
      "es": "1 mL = 1 cm³ = 1000 mm³; 1000 g = 1 kg. Todas las dimensiones de pared se introducen en mm.",
      "en": "1 mL = 1 cm³ = 1000 mm³; 1000 g = 1 kg. All wall dimensions are entered in mm."
    }
  },
  {
    "id": "termoformado-1",
    "module": "termoformado",
    "label": "Superficie de lámina consumida",
    "equation": "A = w l",
    "fields": [
      "blankW",
      "blankL"
    ],
    "steps": [
      "A = 400 × 300",
      "A = 120000 mm²"
    ],
    "expected": 120000,
    "conversions": {
      "es": "1 cm³ = 1000 mm³; 1 h = 3600 s; 1000 g = 1 kg. La relación Rₐ es adimensional.",
      "en": "1 cm³ = 1000 mm³; 1 h = 3600 s; 1000 g = 1 kg. Ratio Rₐ is dimensionless."
    }
  },
  {
    "id": "termoformado-2",
    "module": "termoformado",
    "label": "Masa de lámina por ciclo",
    "equation": "m = A e₀ ρₛ / 1000",
    "fields": [
      "blankW",
      "blankL",
      "initialT",
      "density"
    ],
    "steps": [
      "A = 400 × 300 = 120000 mm²",
      "m = 120000 × 1 × 1 / 1000 = 120 g"
    ],
    "expected": 120,
    "conversions": {
      "es": "1 cm³ = 1000 mm³; 1 h = 3600 s; 1000 g = 1 kg. La relación Rₐ es adimensional.",
      "en": "1 cm³ = 1000 mm³; 1 h = 3600 s; 1000 g = 1 kg. Ratio Rₐ is dimensionless."
    }
  },
  {
    "id": "termoformado-3",
    "module": "termoformado",
    "label": "Espesor medio geométrico ideal",
    "equation": "ē = e₀ / Rₐ",
    "fields": [
      "initialT",
      "drawAreaRatio"
    ],
    "steps": [
      "Rₐ = Aᶠ/A₀ = 3",
      "ē = 1 / 3 ≈ 0.333333 mm"
    ],
    "expected": 0.3333333333333333,
    "conversions": {
      "es": "1 cm³ = 1000 mm³; 1 h = 3600 s; 1000 g = 1 kg. La relación Rₐ es adimensional.",
      "en": "1 cm³ = 1000 mm³; 1 h = 3600 s; 1000 g = 1 kg. Ratio Rₐ is dimensionless."
    }
  },
  {
    "id": "termoformado-4",
    "module": "termoformado",
    "label": "Ciclos teóricos por hora",
    "equation": "C = 3600 / t꜀",
    "fields": [
      "cycleSec"
    ],
    "steps": [
      "1 h = 3600 s",
      "C = 3600 / 20 = 180 ciclos/h"
    ],
    "expected": 180,
    "conversions": {
      "es": "1 cm³ = 1000 mm³; 1 h = 3600 s; 1000 g = 1 kg. La relación Rₐ es adimensional.",
      "en": "1 cm³ = 1000 mm³; 1 h = 3600 s; 1000 g = 1 kg. Ratio Rₐ is dimensionless."
    }
  },
  {
    "id": "termoformado-5",
    "module": "termoformado",
    "label": "Piezas teóricas por hora",
    "equation": "N = n C",
    "fields": [
      "cycleSec",
      "cavities"
    ],
    "steps": [
      "C = 3600 / 20 = 180 ciclos/h",
      "N = 2 × 180 = 360 pzas/h"
    ],
    "expected": 360,
    "conversions": {
      "es": "1 cm³ = 1000 mm³; 1 h = 3600 s; 1000 g = 1 kg. La relación Rₐ es adimensional.",
      "en": "1 cm³ = 1000 mm³; 1 h = 3600 s; 1000 g = 1 kg. Ratio Rₐ is dimensionless."
    }
  },
  {
    "id": "termoformado-6",
    "module": "termoformado",
    "label": "Consumo de lámina",
    "equation": "Q = m C / 1000",
    "fields": [
      "blankW",
      "blankL",
      "initialT",
      "density",
      "cycleSec"
    ],
    "steps": [
      "m = 120 g; C = 180 ciclos/h",
      "Q = 120 × 180 / 1000 = 21.6 kg/h"
    ],
    "expected": 21.6,
    "conversions": {
      "es": "1 cm³ = 1000 mm³; 1 h = 3600 s; 1000 g = 1 kg. La relación Rₐ es adimensional.",
      "en": "1 cm³ = 1000 mm³; 1 h = 3600 s; 1000 g = 1 kg. Ratio Rₐ is dimensionless."
    }
  },
  {
    "id": "secado-1",
    "module": "secado",
    "label": "Masa mínima de material en tolva",
    "equation": "M = Q tᵣ",
    "fields": [
      "throughput",
      "residence"
    ],
    "steps": [
      "Q = 50 kg/h; tᵣ = 3 h",
      "M = 50 × 3 = 150 kg"
    ],
    "expected": 150,
    "conversions": {
      "es": "1 h = 3600 s; kJ/s = kW; kg / (kg/L) = L. ΔT en °C tiene la misma magnitud que ΔT en K.",
      "en": "1 h = 3600 s; kJ/s = kW; kg / (kg/L) = L. Temperature differences in °C and K have the same magnitude."
    }
  },
  {
    "id": "secado-2",
    "module": "secado",
    "label": "Volumen útil mínimo de tolva",
    "equation": "V = M / ρᵦ",
    "fields": [
      "throughput",
      "residence",
      "bulkDensity"
    ],
    "steps": [
      "M = 50 × 3 = 150 kg",
      "V = 150 / 0.5 = 300 L"
    ],
    "expected": 300,
    "conversions": {
      "es": "1 h = 3600 s; kJ/s = kW; kg / (kg/L) = L. ΔT en °C tiene la misma magnitud que ΔT en K.",
      "en": "1 h = 3600 s; kJ/s = kW; kg / (kg/L) = L. Temperature differences in °C and K have the same magnitude."
    }
  },
  {
    "id": "secado-3",
    "module": "secado",
    "label": "Potencia térmica sensible mínima",
    "equation": "P = Q cₚ (T₁ − T₀) / 3600",
    "fields": [
      "throughput",
      "specificHeat",
      "startT",
      "targetT"
    ],
    "steps": [
      "ΔT = 80 − 20 = 60 K",
      "P = 50 × 2 × 60 / 3600 ≈ 1.666667 kW"
    ],
    "expected": 1.6666666666666667,
    "conversions": {
      "es": "1 h = 3600 s; kJ/s = kW; kg / (kg/L) = L. ΔT en °C tiene la misma magnitud que ΔT en K.",
      "en": "1 h = 3600 s; kJ/s = kW; kg / (kg/L) = L. Temperature differences in °C and K have the same magnitude."
    }
  },
  {
    "id": "costos-1",
    "module": "costos",
    "label": "Piezas buenas teóricas",
    "equation": "Nᵍ = (3600 n/t꜀)(1 − r/100)",
    "fields": [
      "cycleSec",
      "cavities",
      "scrapPct"
    ],
    "steps": [
      "N = 3600 × 2 / 30 = 240 pzas/h",
      "Nᵍ = 240 × (1 − 10/100) = 216 pzas/h"
    ],
    "expected": 216,
    "conversions": {
      "es": "1 h = 3600 s; 1000 g = 1 kg. Todos los precios deben usar la misma moneda; rechazo r se divide entre 100.",
      "en": "1 h = 3600 s; 1000 g = 1 kg. All prices must use the same currency; reject percentage r is divided by 100."
    }
  },
  {
    "id": "costos-2",
    "module": "costos",
    "label": "Consumo de material",
    "equation": "Q = mₚ n (3600/t꜀) / 1000",
    "fields": [
      "partMass",
      "cavities",
      "cycleSec"
    ],
    "steps": [
      "C = 3600/30 = 120 ciclos/h",
      "Q = 30 × 2 × 120 / 1000 = 7.2 kg/h"
    ],
    "expected": 7.2,
    "conversions": {
      "es": "1 h = 3600 s; 1000 g = 1 kg. Todos los precios deben usar la misma moneda; rechazo r se divide entre 100.",
      "en": "1 h = 3600 s; 1000 g = 1 kg. All prices must use the same currency; reject percentage r is divided by 100."
    }
  },
  {
    "id": "costos-3",
    "module": "costos",
    "label": "Costo de material",
    "equation": "Cₘ = Q pₘ",
    "fields": [
      "partMass",
      "cavities",
      "cycleSec",
      "resinCost"
    ],
    "steps": [
      "Q = 7.2 kg/h",
      "Cₘ = 7.2 × 2 = 14.4 moneda/h"
    ],
    "expected": 14.4,
    "conversions": {
      "es": "1 h = 3600 s; 1000 g = 1 kg. Todos los precios deben usar la misma moneda; rechazo r se divide entre 100.",
      "en": "1 h = 3600 s; 1000 g = 1 kg. All prices must use the same currency; reject percentage r is divided by 100."
    }
  },
  {
    "id": "costos-4",
    "module": "costos",
    "label": "Costo energético",
    "equation": "Cₑ = P pₑ",
    "fields": [
      "powerKw",
      "energyCost"
    ],
    "steps": [
      "P = 5 kW; pₑ = 0.2 moneda/kWh",
      "Cₑ = 5 × 0.2 = 1 moneda/h"
    ],
    "expected": 1,
    "conversions": {
      "es": "1 h = 3600 s; 1000 g = 1 kg. Todos los precios deben usar la misma moneda; rechazo r se divide entre 100.",
      "en": "1 h = 3600 s; 1000 g = 1 kg. All prices must use the same currency; reject percentage r is divided by 100."
    }
  },
  {
    "id": "costos-5",
    "module": "costos",
    "label": "Costo horario directo parcial",
    "equation": "Cₕ = Cₘ + Cₑ + Cₗ",
    "fields": [
      "partMass",
      "cavities",
      "cycleSec",
      "resinCost",
      "powerKw",
      "energyCost",
      "laborHour"
    ],
    "steps": [
      "Cₘ = 14.4; Cₑ = 1; Cₗ = 3 moneda/h",
      "Cₕ = 14.4 + 1 + 3 = 18.4 moneda/h"
    ],
    "expected": 18.4,
    "conversions": {
      "es": "1 h = 3600 s; 1000 g = 1 kg. Todos los precios deben usar la misma moneda; rechazo r se divide entre 100.",
      "en": "1 h = 3600 s; 1000 g = 1 kg. All prices must use the same currency; reject percentage r is divided by 100."
    }
  },
  {
    "id": "costos-6",
    "module": "costos",
    "label": "Costo directo parcial por pieza buena",
    "equation": "c = Cₕ / Nᵍ",
    "fields": [
      "partMass",
      "cavities",
      "cycleSec",
      "scrapPct",
      "resinCost",
      "powerKw",
      "energyCost",
      "laborHour"
    ],
    "steps": [
      "Cₕ = 18.4 moneda/h; Nᵍ = 216 pzas/h",
      "c = 18.4 / 216 ≈ 0.085185 moneda/pza"
    ],
    "expected": 0.08518518518518518,
    "conversions": {
      "es": "1 h = 3600 s; 1000 g = 1 kg. Todos los precios deben usar la misma moneda; rechazo r se divide entre 100.",
      "en": "1 h = 3600 s; 1000 g = 1 kg. All prices must use the same currency; reject percentage r is divided by 100."
    }
  }
];
export const examples = [
  [
    "inyeccion",
    {
      "method": "mass",
      "cavities": 2,
      "partMass": 30,
      "runnerMass": 5,
      "partVolume": 35,
      "runnerVolume": 5,
      "meltDensity": 0.8,
      "shotMargin": 10,
      "screwD": 20,
      "screwMaxStroke": 400,
      "targetCushion": 20,
      "projectedArea": 100,
      "cavityPressure": 50,
      "clampFactor": 1.2,
      "injectionFlow": 100,
      "plasticizingRate": 20
    }
  ],
  [
    "extrusion",
    {
      "shape": "sheet",
      "width": 500,
      "thickness": 1,
      "outerD": 20,
      "innerD": 10,
      "lineSpeed": 10,
      "density": 0.92,
      "lossPct": 20,
      "secEnergy": 0.2,
      "holdUpKg": 10
    }
  ],
  [
    "pelicula",
    {
      "layflat": 500,
      "filmGauge": 50,
      "lineSpeed": 18,
      "density": 0.92,
      "dieDiameter": 200,
      "dieGap": 1
    }
  ],
  [
    "soplado",
    {
      "bodyD": 80,
      "bodyH": 200,
      "wall": 1,
      "density": 1,
      "parisonD": 20,
      "unitsHour": 100
    }
  ],
  [
    "termoformado",
    {
      "blankW": 400,
      "blankL": 300,
      "initialT": 1,
      "cycleSec": 20,
      "cavities": 2,
      "density": 1,
      "drawAreaRatio": 3
    }
  ],
  [
    "secado",
    {
      "throughput": 50,
      "residence": 3,
      "bulkDensity": 0.5,
      "startT": 20,
      "targetT": 80,
      "specificHeat": 2
    }
  ],
  [
    "costos",
    {
      "cycleSec": 30,
      "cavities": 2,
      "partMass": 30,
      "scrapPct": 10,
      "resinCost": 2,
      "powerKw": 5,
      "energyCost": 0.2,
      "laborHour": 3
    }
  ],
  [
    "inyeccion",
    {
      "method": "volume",
      "cavities": 2,
      "partMass": 30,
      "runnerMass": 5,
      "partVolume": 35,
      "runnerVolume": 5,
      "meltDensity": 0.8,
      "shotMargin": 10,
      "screwD": 20,
      "screwMaxStroke": 400,
      "targetCushion": 20,
      "projectedArea": 100,
      "cavityPressure": 50,
      "clampFactor": 1.2,
      "injectionFlow": 100,
      "plasticizingRate": 20
    }
  ],
  [
    "extrusion",
    {
      "shape": "tube",
      "width": 500,
      "thickness": 1,
      "outerD": 20,
      "innerD": 10,
      "lineSpeed": 10,
      "density": 0.92,
      "lossPct": 20,
      "secEnergy": 0.2,
      "holdUpKg": 10
    }
  ]
];
