import {calculateWithMeltDensity} from './injection-density.js';
import {activeFormulation} from './recycled.js';
import {n,isBlank} from './math.js';
const dependencies={
 extrusion:['Masa por metro de producto','Producción neta ideal','Alimentación con pérdida indicada','Potencia específica estimada','Tiempo de residencia nominal'],
 pelicula:['Producción ideal'],soplado:['Masa de pared ideal','Material para producción nominal'],termoformado:['Masa de lámina por ciclo','Consumo de lámina']
};
// Solo selecciona datos y etiqueta resultados; las ecuaciones de los siete motores
// permanecen en sus módulos originales.
export function calculateFormulationCase(moduleId,inputs,level,state) {
 if(!activeFormulation(state))return calculateWithMeltDensity(moduleId,inputs,level,state);
 const recipe=state.formulation,field=moduleId==='inyeccion'?'meltDensity':moduleId==='secado'?null:'density';
 const entry=field?state.provenance[field]:null,effective={...inputs};
 const owned=entry?.formulation_id===recipe.id;
 let rejection=null;
 if(field&&!isBlank(effective[field])&&!owned){effective[field]='';rejection='property_not_linked_to_formulation';}
 if(moduleId==='secado')return {...calculateWithMeltDensity(moduleId,{},level,state),formulation_assessment:{used:false,reason:'drying_formulation_not_implemented'}};
 if(owned&&entry.origin==='mixture_model'&&moduleId==='inyeccion') {
  const point=entry.reference?.conditions;
  if(!point||n(state.context.pvtTemperatureC)!==point.temperature_C||n(state.context.pvtPressureMPa)!==point.pressure_MPa){effective[field]='';rejection='model_conditions_changed';}
 }
 const view={...state,provenance:{...state.provenance,...(field?{[field]:owned?entry:undefined}:{})},grade_snapshot:state.grade_snapshot?{...state.grade_snapshot,properties:{...state.grade_snapshot.properties,melt_density:null}}:null,context:{...state.context,familyMeltReferenceMode:'explicit',familyMeltReferenceAccepted:false,...(entry?.origin==='mixture_model'?{meltDensityVerified:false}:{})}};
 const result=calculateWithMeltDensity(moduleId,effective,level,view);
 const used=field&&Number.isFinite(n((result.calculation_inputs||effective)[field]))&&n((result.calculation_inputs||effective)[field])>0;
 const approximate=!!used&&owned&&(entry.origin==='mixture_model'||entry.reference?.approximate===true)&&result.density_assessment?.verified!==true;
 if(approximate) {
  const labels=new Set(dependencies[moduleId]||[]);
  for(const metric of result.metrics)if(metric.value!==null&&(moduleId==='inyeccion'?metric.density_estimate:labels.has(metric.label))){metric.density_estimate=true;metric.estimate_basis=entry.origin==='mixture_model'?'mixture_model':'manual_override_of_mixture_model';}
  result.warnings=result.warnings.filter(x=>!x.startsWith('Estimación con densidad fundida de referencia de familia'));
  result.warnings.push('Estimación con densidad de formulación; modelo ideal o modificación manual identificada. No es una propiedad certificada de grado ni una validación industrial.');
 }
 if(result.density_assessment&&used&&owned){result.density_assessment.family_reference=null;result.density_assessment.model_reference=entry.reference?.model_id?structuredClone(entry.reference):null;}
 if(rejection)result.warnings.push('La propiedad no corresponde a esta formulación o a las condiciones declaradas. Los resultados dependientes quedan pendientes.');
 result.warnings.push('La composición V/R no demuestra aptitud del producto ni autoriza transferir propiedades del componente virgen.');
 result.formulation_assessment={formulation_id:recipe.id,used:!!used,density_field:field,approximate,classification:used?(approximate?'documented_model_estimate':'user_entered'):'not_available',rejection,thermal_correction_applied:false};
 result.calculation_inputs=result.calculation_inputs||effective;
 return result;
}
