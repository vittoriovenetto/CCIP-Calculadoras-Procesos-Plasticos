import { n, pos, nonneg, usable, ratio, optional } from "../math.js";

export function inyeccion(v, { push, warn, notes }) {
  const mode = v.method || "mass";
  const c = n(v.cavities), runner = optional(v.runnerMass, 0);
  const margin = optional(v.shotMargin, 0);
  const rho = n(v.meltDensity);
  const mass = usable(v.partMass, c) && nonneg(runner) ? n(v.partMass) * c + runner : NaN;
  const volume = usable(v.partVolume, c) && nonneg(optional(v.runnerVolume, 0))
    ? n(v.partVolume) * c + optional(v.runnerVolume, 0) : NaN;
  const shotG = mode === "mass" && Number.isFinite(mass) && nonneg(margin)
    ? mass * (1 + margin / 100)
    : mode === "volume" && Number.isFinite(volume) && pos(rho) && nonneg(margin)
      ? volume * rho * (1 + margin / 100) : NaN;
  const shotCm3 = mode === "mass" ? (pos(rho) ? shotG / rho : NaN)
    : Number.isFinite(volume) && nonneg(margin) ? volume * (1 + margin / 100) : NaN;
  push("Masa total sin reserva", mode === "mass" ? mass : (pos(rho) ? volume * rho : NaN), "g", "Pieza × cavidades + canales");
  push("Shot calculado (masa)", shotG, "g", "Masa total × (1 + reserva / 100)");
  push("Shot calculado (volumen)", shotCm3, "cm³", "Masa / densidad del fundido, o volumen de fundido + reserva");
  const screwArea = usable(v.screwD) ? Math.PI * n(v.screwD) ** 2 / 4 : NaN;
  const screwCap = usable(v.screwMaxStroke) ? screwArea * n(v.screwMaxStroke) / 1000 : NaN;
  const travel = ratio(shotCm3 * 1000, screwArea);
  push("Capacidad volumétrica teórica del husillo", screwCap, "cm³", "π × D² × carrera / 4000");
  push("Utilización volumétrica teórica", ratio(shotCm3 * 100, screwCap), "%", "Shot / capacidad teórica × 100", 1);
  push("Carrera calculada del husillo", travel, "mm", "Shot × 1000 / área del husillo", 1);
  push("Recorrido remanente al dosificar al máximo", Number.isFinite(travel) && pos(v.screwMaxStroke) ? n(v.screwMaxStroke) - travel : NaN, "mm", "Carrera máxima - carrera requerida", 1);
  const press = n(v.cavityPressure), area = n(v.projectedArea), factor = n(v.clampFactor);
  const force = usable(press, area) ? area * press * 100 / 9806.65 : NaN;
  push("Fuerza de cierre teórica", force, "tf", "Área proyectada [cm²] × presión de cavidad [MPa] × 100 / 9806.65", 2);
  push("Fuerza de cierre con factor", Number.isFinite(force) && pos(factor) ? force * factor : NaN, "tf", "Fuerza teórica × factor seleccionado");
  push("Tiempo de llenado ideal", ratio(shotCm3, n(v.injectionFlow)), "s", "Volumen / caudal volumétrico");
  push("Tiempo de plastificación estimado", ratio(shotG * 3.6, n(v.plasticizingRate)), "s", "Shot [g] × 3.6 / capacidad [kg/h]");
  if (mode === "mass" && !pos(rho)) warn("Para estimar volumen y carrera desde la masa, introduce la densidad del FUNDIDO (nivel técnico o avanzado), no la densidad sólida.");
  if (Number.isFinite(travel) && pos(v.screwMaxStroke) && travel > n(v.screwMaxStroke)) warn("La carrera calculada supera la carrera máxima indicada.");
  if (Number.isFinite(travel) && pos(v.screwMaxStroke) && nonneg(v.targetCushion) && travel + n(v.targetCushion) > n(v.screwMaxStroke)) warn("No queda la carrera de reserva/colchón indicada. Verifica los datos y el diseño del husillo.");
  if (pos(rho)) notes.push("Densidad del fundido: debe proceder de datos reales a condiciones de proceso.");
  notes.push("La capacidad del husillo es un volumen geométrico ideal; comprueba la ficha de máquina y sus límites reales.");
  notes.push("El modo volumétrico requiere volumen equivalente de fundido; el volumen sólido de una pieza no determina por sí solo el shot (contracción y compactación).");
  notes.push("La reserva y los canales vacíos se interpretan como cero; deben confirmarse. El llenado usa volumen con reserva, no predice la curva real ni el tiempo de llenado de cavidades.");
  notes.push("El margen adicional de shot es independiente del colchón residual de máquina.");
}
