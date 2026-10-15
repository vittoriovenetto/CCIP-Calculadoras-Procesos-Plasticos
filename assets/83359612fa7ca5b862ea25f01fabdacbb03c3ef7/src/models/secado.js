import { n, pos, nonneg, usable } from "../math.js";

export function secado(v, { push, warn, notes }) {
  const kgH=n(v.throughput), hrs=n(v.residence),bulk=n(v.bulkDensity);
  const delta=Number.isFinite(n(v.targetT)) && Number.isFinite(n(v.startT)) ? n(v.targetT)-n(v.startT) : NaN;
  const sensible=nonneg(kgH) && pos(v.specificHeat) && Number.isFinite(delta) && delta>=0
    ? kgH*n(v.specificHeat)*delta/3600 : NaN;
  push("Masa mínima de material en tolva", nonneg(kgH) && pos(hrs)?kgH*hrs:NaN,"kg","Caudal [kg/h] × residencia [h]");
  push("Volumen útil mínimo de tolva", nonneg(kgH) && usable(hrs,bulk)?kgH*hrs/bulk:NaN,"L","Masa en tolva / densidad aparente [kg/L]");
  push("Potencia térmica sensible mínima", sensible, "kW", "Caudal × cp [kJ/kg·K] × ΔT / 3600");
  if (Number.isFinite(delta) && delta<0) warn("La temperatura final es menor que la inicial; el cálculo de calentamiento no aplica.");
  notes.push("No calcula eliminación de humedad ni demanda total del secador. Falta calor de evaporación, pérdidas y regeneración.");
  notes.push("Tiempo y temperatura de secado deben seguir la ficha del grado comercial; no se infieren de Tg o ablandamiento.");
}
