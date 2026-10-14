import { n, pos, nonneg, usable, optional } from "../math.js";

export function extrusion(v, { push, warn, notes }) {
  const geo = v.shape || "sheet", rho = n(v.density), speed = n(v.lineSpeed);
  const a = geo === "sheet"
    ? usable(v.width, v.thickness) ? n(v.width) * n(v.thickness) : NaN
    : geo === "tube" && pos(v.outerD) && nonneg(v.innerD) && n(v.outerD) > n(v.innerD)
      ? Math.PI / 4 * (n(v.outerD) ** 2 - n(v.innerD) ** 2) : NaN;
  const massPerM = usable(a, rho) ? a * rho : NaN; // mm² × 1000 mm /1000 => cm³; g/m
  const kgH = pos(massPerM) && nonneg(speed) ? massPerM * speed * 60 / 1000 : NaN;
  const rejects = optional(v.lossPct, 0);
  const feed = Number.isFinite(kgH) && nonneg(rejects) && rejects < 100 ? kgH / (1 - rejects / 100) : NaN;
  push("Área transversal", a, "mm²", geo === "sheet" ? "Ancho × espesor" : "π/4 × (D exterior² - D interior²)");
  push("Masa por metro de producto", massPerM, "g/m", "Área [mm²] × densidad [g/cm³]");
  push("Producción neta ideal", kgH, "kg/h", "Masa por metro × velocidad [m/min] × 60 / 1000");
  push("Alimentación con pérdida indicada", feed, "kg/h", "Producción / (1 - pérdida / 100)");
  push("Potencia específica estimada", pos(v.secEnergy) && Number.isFinite(feed) ? feed * n(v.secEnergy) : NaN, "kW", "Alimentación [kg/h] × energía específica [kWh/kg]");
  push("Tiempo de residencia nominal", usable(v.holdUpKg) && pos(feed) ? 60 * n(v.holdUpKg) / feed : NaN, "min", "Inventario de material [kg] / caudal [kg/h] × 60");
  if (geo === "tube" && pos(v.outerD) && nonneg(v.innerD) && n(v.innerD) >= n(v.outerD)) warn("El diámetro interior debe ser menor que el exterior.");
  notes.push("Pérdida vacía se interpreta como cero. Residencia es inventario dividido por caudal, no una distribución de tiempos; potencia usa energía específica medida, sin predecir tamaño de motor.");
  notes.push("Continuidad ideal con sección y densidad uniforme; no predice caudal a partir de RPM, presión o geometría de tornillo.");
}
