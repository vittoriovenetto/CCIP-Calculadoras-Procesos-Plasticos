import { activeFields, modules } from './schema.js';
import { isBlank } from './math.js';

// El motor restringe entradas por nivel/método. El filtro visual no cambia las
// métricas, avisos o notas conservados en historial y exportaciones.
export const displayMetrics = result => result.metrics.filter(m=>typeof m.value==='number'&&Number.isFinite(m.value));
const contextual = [
  [/carrera calculada supera/i,'screwMaxStroke'],[/reserva\/colchón/i,'targetCushion'],
  [/diámetro interior debe/i,'innerD'],[/BUR menor/i,'dieDiameter'],
  [/espesor no permite|Pared relativamente gruesa/i,'wall'],[/temperatura final es menor/i,'targetT'],
  [/Rechazo del 100/i,'scrapPct'],[/Modo solo datos verificados|Referencia de familia fuera/i,'meltDensity'],
  [/Densidad fundida manual sin|Densidad fundida: valor manual/i,'meltDensity'],
  [/Tiempo de secado: valor manual/i,'residence'],[/Temperatura de secado: valor manual/i,'targetT'],[/Densidad del sólido: valor manual/i,'density'],[/Densidad aparente: valor manual/i,'bulkDensity'],[/Cp manual|Cp de fundido|intervalo documentado de Cp/i,'specificHeat']
];
export function inputIssues(moduleId,inputs,level,result) {
  const module=modules.find(m=>m.id===moduleId),fields=activeFields(module,inputs,level),issues=[];
  for (const field of fields.filter(f=>f.level===1&&f.type!=='select'&&!['runnerMass','runnerVolume'].includes(f.key))) {
    if(isBlank(inputs[field.key])) issues.push({field:field.key,message:`${field.label}: introduce un valor para este cálculo.`});
  }
  for (const message of new Set(result.warnings)) {
    const field=fields.find(f=>message.startsWith(f.label+':'))?.key || contextual.find(([pattern])=>pattern.test(message))?.[1];
    const preserved = /Hay datos manuales o de otro grado/i.test(message) ? fields.find(f=>['meltDensity','density','residence'].includes(f.key))?.key : null;
    if(preserved)issues.push({field:preserved,message});
    else if (field && fields.some(f=>f.key===field)) issues.push({field,message});
    else if (/excede el rango numérico|Módulo o nivel sin definición/i.test(message)) issues.push({field:null,message});
  }
  return issues.filter((issue,i,all)=>all.findIndex(x=>x.message===issue.message)===i);
}
