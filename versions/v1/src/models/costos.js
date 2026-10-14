import { n, nonneg, usable, ratio, optional } from "../math.js";

export function costos(v, { push, warn, notes }) {
  const cycle = n(v.cycleSec),cav=n(v.cavities),mass=n(v.partMass);
  const scrap=optional(v.scrapPct,0);
  const pieces=usable(cycle,cav) && nonneg(scrap)&&scrap<=100?3600*cav/cycle*(1-scrap/100):NaN;
  const feed=usable(cycle,cav,mass)?3600*cav*mass/cycle/1000:NaN;
  const hourlyMaterials = nonneg(v.resinCost) && Number.isFinite(feed) ? feed*n(v.resinCost):NaN;
  const hourlyEnergy=nonneg(v.powerKw)&&nonneg(v.energyCost)?n(v.powerKw)*n(v.energyCost):NaN;
  const hourlyLabor=nonneg(v.laborHour)?n(v.laborHour):NaN;
  const total=Number.isFinite(hourlyMaterials)&&Number.isFinite(hourlyEnergy)&&Number.isFinite(hourlyLabor)?hourlyMaterials+hourlyEnergy+hourlyLabor:NaN;
  push("Piezas buenas teóricas",pieces,"pzas/h","3600 × cavidades / ciclo × (1 − rechazo/100)",1);
  push("Consumo de material",feed,"kg/h","Masa × cavidades × ciclos/h / 1000");
  push("Costo de material",hourlyMaterials,"moneda/h","Consumo [kg/h] × precio [moneda/kg]");
  push("Costo energético",hourlyEnergy,"moneda/h","Potencia media [kW] × tarifa [moneda/kWh]");
  push("Costo horario directo parcial",total,"moneda/h","Material + energía + mano de obra");
  push("Costo directo parcial por pieza buena",ratio(total,pieces),"moneda/pza","Costo horario / piezas buenas/h");
  if (scrap === 100) warn("Rechazo del 100 %: no hay piezas buenas y el costo por pieza queda pendiente.");
  notes.push("Rechazo vacío se interpreta como cero. El consumo incluye piezas rechazadas, sin coladas ni rebabas; no supone recuperación de material ni disponibilidad/OEE.");
  notes.push("Modelo simplificado: no incluye depreciación, mantenimiento, moldes, recirculación, costos indirectos ni ajustes de rechazo.");
  notes.push("Selecciona una moneda consistente para las tres entradas de costos.");
}
