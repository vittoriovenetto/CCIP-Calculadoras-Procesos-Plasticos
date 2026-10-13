/* Núcleo matemático CCIP.
 * Convención: los resultados representan estimaciones de ingeniería;
 * nunca completamos propiedades de polímeros faltantes con constantes implícitas.
 * Todas las conversiones se expresan en cada modelo.
 */
export const n = (x) => (x === "" || x == null || (typeof x === "string" && !x.trim())) ? NaN : Number(x);
const pos = (x) => Number.isFinite(n(x)) && n(x) > 0;
const nonneg = (x) => Number.isFinite(n(x)) && n(x) >= 0;
const usable = (...xs) => xs.every(pos);
const mk = (label, value, unit, formula = "", precision = 2) => ({
  label, value: Number.isFinite(value) ? value : null, unit, formula, precision
});
const ratio = (a, b) => Number.isFinite(a) && Number.isFinite(b) && b > 0 ? a / b : NaN;
const optional = (v, fallback) => v === "" || v == null ? fallback : n(v);

export function calculate(id, v = {}) {
  const metrics = [];
  const warnings = [];
  const notes = [];
  const push = (...args) => metrics.push(mk(...args));
  const warn = (message) => warnings.push(message);

  if (id === "inyeccion") {
    const mode = v.method || "mass";
    const c = n(v.cavities), runner = optional(v.runnerMass, 0);
    const margin = optional(v.shotMargin, 0);
    const rho = n(v.meltDensity);
    const mass = usable(v.partMass, c) && nonneg(runner) ? n(v.partMass) * c + runner : NaN;
    const volume = usable(v.partVolume) && nonneg(optional(v.runnerVolume, 0))
      ? n(v.partVolume) * c + optional(v.runnerVolume, 0) : NaN;
    const shotG = mode === "mass" && Number.isFinite(mass) && nonneg(margin)
      ? mass * (1 + margin / 100)
      : mode === "volume" && Number.isFinite(volume) && pos(rho) && nonneg(margin)
        ? volume * rho * (1 + margin / 100) : NaN;
    const shotCm3 = mode === "mass" ? (pos(rho) ? shotG / rho : NaN)
      : Number.isFinite(volume) && nonneg(margin) ? volume * (1 + margin / 100) : NaN;
    push("Masa total sin reserva", mode === "mass" ? mass : (pos(rho) ? volume * rho : NaN), "g", "Pieza × cavidades + canales");
    push("Shot calculado (masa)", shotG, "g", "Masa total × (1 + reserva / 100)");
    push("Shot calculado (volumen)", shotCm3, "cm³", "Masa / densidad del fundido, o volumen geométrico + reserva");
    const screwArea = usable(v.screwD) ? Math.PI * n(v.screwD) ** 2 / 4 : NaN;
    const screwCap = usable(v.screwMaxStroke) ? screwArea * n(v.screwMaxStroke) / 1000 : NaN;
    const travel = ratio(shotCm3 * 1000, screwArea);
    push("Capacidad volumétrica teórica del husillo", screwCap, "cm³", "π × D² × carrera / 4000");
    push("Utilización volumétrica teórica", ratio(shotCm3 * 100, screwCap), "%", "Shot / capacidad teórica × 100", 1);
    push("Carrera calculada del husillo", travel, "mm", "Shot × 1000 / área del husillo", 1);
    push("Recorrido remanente al dosificar al máximo", Number.isFinite(travel) && pos(v.screwMaxStroke) ? n(v.screwMaxStroke) - travel : NaN, "mm", "Carrera máxima - carrera requerida", 1);
    const press = n(v.cavityPressure), area = n(v.projectedArea), factor = optional(v.clampFactor, 1.25);
    const force = usable(press, area) ? area * press * 100 / 9806.65 : NaN;
    push("Fuerza de cierre teórica", force, "tf", "Área proyectada [cm²] × presión de cavidad [MPa] × 100 / 9806.65", 2);
    push("Fuerza de cierre con factor", Number.isFinite(force) && pos(factor) ? force * factor : NaN, "tf", "Fuerza teórica × factor seleccionado");
    push("Tiempo de llenado ideal", ratio(shotCm3, n(v.injectionFlow)), "s", "Volumen / caudal volumétrico");
    push("Tiempo de plastificación estimado", ratio(shotG * 3.6, n(v.plasticizingRate)), "s", "Shot [g] × 3.6 / capacidad [kg/h]");
    if (mode === "mass" && !pos(rho)) warn("Para estimar volumen y carrera desde la masa, introduce la densidad del FUNDIDO, no la densidad sólida.");
    if (Number.isFinite(travel) && pos(v.screwMaxStroke) && travel > n(v.screwMaxStroke)) warn("La carrera calculada supera la carrera máxima indicada.");
    if (Number.isFinite(travel) && pos(v.screwMaxStroke) && nonneg(v.targetCushion) && travel + n(v.targetCushion) > n(v.screwMaxStroke)) warn("No queda la carrera de reserva/colchón indicada. Verifica los datos y el diseño del husillo.");
    if (pos(rho)) notes.push("Densidad del fundido: debe proceder de datos reales a condiciones de proceso.");
    notes.push("La capacidad del husillo es un volumen geométrico ideal; comprueba la ficha de máquina y sus límites reales.");
    notes.push("El margen adicional de shot es independiente del colchón residual de máquina.");
  } else if (id === "extrusion") {
    const geo = v.shape || "sheet", rho = n(v.density), speed = n(v.lineSpeed);
    const a = geo === "sheet"
      ? usable(v.width, v.thickness) ? n(v.width) * n(v.thickness) : NaN
      : usable(v.outerD, v.innerD) && n(v.outerD) > n(v.innerD)
        ? Math.PI / 4 * (n(v.outerD) ** 2 - n(v.innerD) ** 2) : NaN;
    const massPerM = usable(a, rho) ? a * rho : NaN; // mm² × 1000 mm /1000 => cm³; g/m
    const kgH = usable(massPerM, speed) ? massPerM * speed * 60 / 1000 : NaN;
    const rejects = optional(v.lossPct, 0);
    const feed = Number.isFinite(kgH) && nonneg(rejects) && rejects < 100 ? kgH / (1 - rejects / 100) : NaN;
    push("Área transversal", a, "mm²", geo === "sheet" ? "Ancho × espesor" : "π/4 × (D exterior² - D interior²)");
    push("Masa por metro de producto", massPerM, "g/m", "Área [mm²] × densidad [g/cm³]");
    push("Producción neta ideal", kgH, "kg/h", "Masa por metro × velocidad [m/min] × 60 / 1000");
    push("Alimentación con pérdida indicada", feed, "kg/h", "Producción / (1 - pérdida / 100)");
    push("Potencia específica estimada", pos(v.secEnergy) && Number.isFinite(feed) ? feed * n(v.secEnergy) : NaN, "kW", "Alimentación [kg/h] × energía específica [kWh/kg]");
    push("Tiempo de residencia nominal", usable(v.holdUpKg) && Number.isFinite(feed) ? 60 * n(v.holdUpKg) / feed : NaN, "min", "Inventario de material [kg] / caudal [kg/h] × 60");
    if (geo === "tube" && pos(v.outerD) && pos(v.innerD) && n(v.innerD) >= n(v.outerD)) warn("El diámetro interior debe ser menor que el exterior.");
    notes.push("Continuidad ideal con sección y densidad uniforme; no predice caudal a partir de RPM, presión o geometría de tornillo.");
  } else if (id === "pelicula") {
    const width = n(v.layflat), gauge = n(v.filmGauge), speed = n(v.lineSpeed), rho = n(v.density);
    const a = usable(width, gauge) ? 2 * width * (gauge / 1000) : NaN; // mm², dos paredes
    const kgH = usable(a, speed, rho) ? a * speed * rho * 0.06 : NaN;
    const diameter = pos(width) ? 2 * width / Math.PI : NaN;
    const bur = ratio(diameter, n(v.dieDiameter));
    const ddr = usable(v.dieGap, gauge, bur) ? n(v.dieGap) * 1000 / (gauge * bur) : NaN;
    push("Diámetro ideal de burbuja", diameter, "mm", "2 × ancho plegado / π");
    push("Área transversal total de la película", a, "mm²", "2 × ancho plegado × espesor");
    push("Producción ideal", kgH, "kg/h", "Área × velocidad × densidad × 0.06");
    push("Relación de soplado (BUR)", bur, "—", "Diámetro de burbuja / diámetro de dado", 2);
    push("Relación ideal de estiramiento (DDR)", ddr, "—", "Abertura del dado / (espesor × BUR)", 2);
    if (Number.isFinite(bur) && bur < 1) warn("BUR menor de 1: revisa ancho plegado o diámetro del dado.");
    notes.push("Se trata de película tubular sin corte longitudinal, dos paredes, espesor uniforme y sin pérdidas.");
    notes.push("El DDR es geométrico ideal: ignora hinchamiento del extruido, cambios de densidad y variación de espesor.");
  } else if (id === "soplado") {
    const d = n(v.bodyD), h = n(v.bodyH), t = n(v.wall), rho = n(v.density);
    const volumeMl = usable(d, h) ? Math.PI * d * d * h / (4 * 1000) : NaN;
    const surface = usable(d,h) ? Math.PI * d * h + Math.PI * d*d/2 : NaN;
    const wallMass = usable(surface,t,rho) ? surface * t * rho / 1000 : NaN;
    push("Volumen geométrico cilíndrico", volumeMl, "mL", "π × diámetro² × altura / 4000");
    push("Superficie de cilindro cerrado", surface, "mm²", "π × D × H + π × D² / 2");
    push("Masa de pared ideal", wallMass, "g", "Superficie × espesor × densidad / 1000");
    push("Expansión diametral", ratio(d, n(v.parisonD)), "—", "Diámetro del cuerpo / diámetro del parisón");
    push("Material para producción nominal", usable(v.unitsHour, wallMass) ? wallMass * n(v.unitsHour) / 1000 : NaN, "kg/h", "Masa de pared × unidades/h / 1000");
    notes.push("Modelo preliminar de envase cilíndrico cerrado; ignora cuello, asa, geometría real, rebabas y distribución no uniforme.");
  } else if (id === "termoformado") {
    const area = usable(v.blankW,v.blankL) ? n(v.blankW)*n(v.blankL) : NaN;
    const mass = usable(area,v.initialT,v.density) ? area*n(v.initialT)*n(v.density)/1000 : NaN;
    const cycle = n(v.cycleSec), nests=optional(v.cavities,1);
    push("Superficie de lámina consumida", area, "mm²", "Ancho de recorte × largo de recorte");
    push("Masa de lámina por ciclo", mass, "g", "Área × espesor × densidad / 1000");
    push("Espesor medio geométrico ideal", ratio(n(v.initialT),n(v.drawAreaRatio)), "mm", "Espesor inicial / relación de áreas");
    push("Ciclos teóricos por hora", ratio(3600,cycle), "ciclos/h", "3600 / tiempo de ciclo",1);
    push("Piezas teóricas por hora", usable(nests) ? ratio(3600*nests,cycle) : NaN, "pzas/h", "3600 × cavidades / ciclo",1);
    push("Consumo de lámina", usable(mass,cycle) ? mass*3600/cycle/1000 : NaN, "kg/h", "Masa por ciclo × ciclos/h / 1000");
    notes.push("El espesor local real no puede obtenerse solo con el promedio: influye la geometría, temperatura y distribución de deformación.");
    notes.push("El consumo incluye toda la superficie inicial (también recortes), no solo material en piezas.");
  } else if (id === "secado") {
    const kgH=n(v.throughput), hrs=n(v.residence),bulk=n(v.bulkDensity);
    const delta=usable(v.targetT) && Number.isFinite(n(v.startT)) ? n(v.targetT)-n(v.startT) : NaN;
    const sensible=usable(kgH,v.specificHeat) && Number.isFinite(delta) && delta>=0
      ? kgH*n(v.specificHeat)*delta/3600 : NaN;
    push("Masa mínima de material en tolva", usable(kgH,hrs)?kgH*hrs:NaN,"kg","Caudal [kg/h] × residencia [h]");
    push("Volumen útil mínimo de tolva", usable(kgH,hrs,bulk)?kgH*hrs/bulk:NaN,"L","Masa en tolva / densidad aparente [kg/L]");
    push("Potencia térmica sensible mínima", sensible, "kW", "Caudal × cp [kJ/kg·K] × ΔT / 3600");
    if (Number.isFinite(delta) && delta<0) warn("La temperatura final es menor que la inicial; el cálculo de calentamiento no aplica.");
    notes.push("No calcula eliminación de humedad ni demanda total del secador. Falta calor de evaporación, pérdidas y regeneración.");
    notes.push("Tiempo y temperatura de secado deben seguir la ficha del grado comercial; no se infieren de Tg o ablandamiento.");
  } else if (id === "costos") {
    const cycle = n(v.cycleSec),cav=n(v.cavities),mass=n(v.partMass);
    const scrap=optional(v.scrapPct,0);
    const pieces=usable(cycle,cav) && nonneg(scrap)&&scrap<100?3600*cav/cycle*(1-scrap/100):NaN;
    const feed=usable(cycle,cav,mass)?3600*cav*mass/cycle/1000:NaN;
    const hourlyMaterials = pos(v.resinCost) && Number.isFinite(feed) ? feed*n(v.resinCost):NaN;
    const hourlyEnergy=nonneg(v.powerKw)&&nonneg(v.energyCost)?n(v.powerKw)*n(v.energyCost):NaN;
    const hourlyLabor=nonneg(v.laborHour)?n(v.laborHour):NaN;
    const total=Number.isFinite(hourlyMaterials)&&Number.isFinite(hourlyEnergy)&&Number.isFinite(hourlyLabor)?hourlyMaterials+hourlyEnergy+hourlyLabor:NaN;
    push("Piezas buenas teóricas",pieces,"pzas/h","3600 × cavidades / ciclo × (1 − rechazo/100)",1);
    push("Consumo de material",feed,"kg/h","Masa × cavidades × ciclos/h / 1000");
    push("Costo de material",hourlyMaterials,"moneda/h","Consumo [kg/h] × precio [moneda/kg]");
    push("Costo energético",hourlyEnergy,"moneda/h","Potencia media [kW] × tarifa [moneda/kWh]");
    push("Costo horario directo parcial",total,"moneda/h","Material + energía + mano de obra");
    push("Costo directo parcial por pieza buena",ratio(total,pieces),"moneda/pza","Costo horario / piezas buenas/h");
    notes.push("Modelo simplificado: no incluye depreciación, mantenimiento, moldes, recirculación, costos indirectos ni ajustes de rechazo.");
    notes.push("Selecciona una moneda consistente para las tres entradas de costos.");
  }
  if (!metrics.length) warn("Módulo sin definición de cálculo.");
  return { metrics, warnings, notes };
}
