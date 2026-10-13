import { n, pos, nonneg, usable, ratio } from "../math.js";

export function pelicula(v, { push, warn, notes }) {
  const width = n(v.layflat), gauge = n(v.filmGauge), speed = n(v.lineSpeed), rho = n(v.density);
  const a = usable(width, gauge) ? 2 * width * (gauge / 1000) : NaN; // mm², dos paredes
  const kgH = usable(a, rho) && nonneg(speed) ? a * speed * rho * 0.06 : NaN;
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
}
