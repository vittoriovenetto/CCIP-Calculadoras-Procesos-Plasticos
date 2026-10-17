import { n, pos, nonneg, usable, ratio } from "../math.js";

export function soplado(v, { push, warn, notes }) {
  const d = n(v.bodyD), h = n(v.bodyH), t = n(v.wall), rho = n(v.density);
  const volumeMl = usable(d, h) ? Math.PI * d * d * h / (4 * 1000) : NaN;
  const surface = usable(d,h) ? Math.PI * d * h + Math.PI * d*d/2 : NaN;
  const wallMass = usable(surface,t,rho) && 2*t<d && 2*t<h ? surface * t * rho / 1000 : NaN;
  if (usable(d, h, t) && (2 * t >= d || 2 * t >= h)) {
    warn("El espesor no permite un interior cilíndrico positivo; revisa dimensiones.");
  } else if (usable(d, h, t) && t / Math.min(d / 2, h) > 0.1) {
    warn("Pared relativamente gruesa: la aproximación superficie × espesor requiere validación.");
  }
  push("Volumen geométrico cilíndrico", volumeMl, "mL", "π × diámetro² × altura / 4000");
  push("Superficie de cilindro cerrado", surface, "mm²", "π × D × H + π × D² / 2");
  push("Masa de pared ideal", wallMass, "g", "Superficie × espesor × densidad / 1000");
  push("Expansión diametral", ratio(d, n(v.parisonD)), "—", "Diámetro del cuerpo / diámetro del parisón");
  push("Material para producción nominal", nonneg(v.unitsHour) && pos(wallMass) ? wallMass * n(v.unitsHour) / 1000 : NaN, "kg/h", "Masa de pared × unidades/h / 1000");
  notes.push("El volumen calculado es exterior; no es capacidad útil. La masa usa pared delgada sobre superficie exterior y sobreestima respecto al cilindro hueco ideal.");
  notes.push("Modelo preliminar de envase cilíndrico cerrado; ignora cuello, asa, geometría real, rebabas y distribución no uniforme.");
}
