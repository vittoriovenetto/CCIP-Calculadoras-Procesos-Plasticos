const groups = {
  inyeccion: [['Pieza y molde', ['method','cavities','partMass','runnerMass','partVolume','runnerVolume']], ['Máquina y dosificación', ['meltDensity','shotMargin','screwD','screwMaxStroke','targetCushion']], ['Condiciones de proceso', ['projectedArea','cavityPressure','clampFactor','injectionFlow','plasticizingRate']]],
  extrusion: [['Geometría del producto', ['shape','width','thickness','outerD','innerD']], ['Material y producción', ['lineSpeed','density','lossPct']], ['Energía y residencia', ['secEnergy','holdUpKg']]],
  pelicula: [['Película y producción', ['layflat','filmGauge','lineSpeed','density']], ['Dado y estiramiento', ['dieDiameter','dieGap']]],
  soplado: [['Geometría del envase', ['bodyD','bodyH','wall','density']], ['Expansión y producción', ['parisonD','unitsHour']]],
  termoformado: [['Lámina consumida', ['blankW','blankL','initialT','density']], ['Ciclo y deformación', ['cycleSec','cavities','drawAreaRatio']]],
  secado: [['Tolva y alimentación', ['throughput','residence','bulkDensity']], ['Calentamiento sensible', ['startT','targetT','specificHeat']]],
  costos: [['Producción', ['cycleSec','cavities','partMass','scrapPct']], ['Costos directos', ['resinCost','powerKw','energyCost','laborHour']]]
};
export function fieldGroups(moduleId, fields) {
  const grouped = (groups[moduleId] || []).map(([label, keys]) => ({ label, fields: fields.filter(f => keys.includes(f.key)) })).filter(g => g.fields.length);
  const assigned = new Set(grouped.flatMap(g => g.fields.map(f => f.key)));
  const rest = fields.filter(f => !assigned.has(f.key));
  if (rest.length) grouped.push({ label: 'Otros parámetros', fields: rest });
  return grouped;
}
export const primaryLabels = {
  inyeccion: ['Shot calculado (masa)','Shot calculado (volumen)','Utilización volumétrica teórica'],
  extrusion: ['Producción neta ideal','Alimentación con pérdida indicada','Área transversal'],
  pelicula: ['Producción ideal','Relación de soplado (BUR)','Relación ideal de estiramiento (DDR)'],
  soplado: ['Volumen geométrico cilíndrico','Masa de pared ideal','Material para producción nominal'],
  termoformado: ['Piezas teóricas por hora','Consumo de lámina','Espesor medio geométrico ideal'],
  secado: ['Masa mínima de material en tolva','Volumen útil mínimo de tolva','Potencia térmica sensible mínima'],
  costos: ['Piezas buenas teóricas','Costo horario directo parcial','Costo directo parcial por pieza buena']
};
