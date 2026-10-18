import { n, usable, ratio } from "../math.js";

export function termoformado(v, { push, warn, notes }) {
  const area = usable(v.blankW,v.blankL) ? n(v.blankW)*n(v.blankL) : NaN;
  const mass = usable(area,v.initialT,v.density) ? area*n(v.initialT)*n(v.density)/1000 : NaN;
  const cycle = n(v.cycleSec), nests=n(v.cavities);
  push("Superficie de lámina consumida", area, "mm²", "Ancho de recorte × largo de recorte");
  push("Masa de lámina por ciclo", mass, "g", "Área × espesor × densidad / 1000");
  push("Espesor medio geométrico ideal", ratio(n(v.initialT),n(v.drawAreaRatio)), "mm", "Espesor inicial / relación de áreas");
  push("Ciclos teóricos por hora", ratio(3600,cycle), "ciclos/h", "3600 / tiempo de ciclo",1);
  push("Piezas teóricas por hora", usable(nests) ? ratio(3600*nests,cycle) : NaN, "pzas/h", "3600 × cavidades / ciclo",1);
  push("Consumo de lámina", usable(mass,cycle) ? mass*3600/cycle/1000 : NaN, "kg/h", "Masa por ciclo × ciclos/h / 1000");
  notes.push("El espesor local real no puede obtenerse solo con el promedio: influye la geometría, temperatura y distribución de deformación.");
  notes.push("El consumo incluye toda la superficie inicial (también recortes), no solo material en piezas.");
}
