// Selection/evidence gate only: the seven process equations remain unchanged.
import {n} from './math.js';
import {documentedCp,manualCp,bulkEvidence} from './drying-evidence.js';
import {activeFormulation} from './recycled.js';
export function prepareDryingCase(inputs,state,level,origins={}){
 const effective={...inputs},warnings=[],c=state?.context||{},grade=state?.grade_snapshot;
 const assumed=origins.startT==='operating_assumption'&&n(inputs.startT)===25;
 const assessment={schema:'ccip-drying-assessment/1',model:'sensible_heat_of_solid_polymer_only',predicts_residual_moisture:false,predicts_dryer_electric_power:false,predicts_evaporation_or_regeneration:false,machine_capacity_certified:false,nominal_inventory_not_machine_rating:true,assumed_start_temperature_C:assumed?25:null,cp_valid_for_sensible_estimate:false,cp_evidence:'not_available',cp_details:null,bulk_valid_for_volume:false,bulk_details:null,pending:[]};
 const pending=(metric,field,message)=>{assessment.pending.push({metric,field,message});warnings.push(message);};
 if(assumed)warnings.push('Temperatura inicial: 25 °C es un supuesto operativo editable, no una propiedad medida del grado.');
 if(activeFormulation(state||{})){
  for(const key of ['residence','bulkDensity','specificHeat','targetT'])effective[key]='';
  pending('inventory','residence','Secado de esta formulación: no hay instrucciones validadas para la mezcla; solicita ensayos y recomendaciones de su formulación exacta. No se aplica la guía del componente virgen.');
  assessment.applicable=false;assessment.reason='drying_formulation_not_implemented';return {effective,warnings,assessment};
 }
 assessment.applicable=true;
 if(state?.provenance?.residence?.origin==='manufacturer_range_upper')warnings.push('Tiempo de residencia: valor nominal propuesto en el extremo superior del rango de ficha; confirmar con humedad inicial, secador y punto de rocío.');
 if(!Number.isFinite(n(inputs.throughput))||n(inputs.throughput)<0)pending('inventory','throughput','Caudal de polímero: introduce o mide el caudal real en kg/h; sin él no se calcula inventario ni potencia.');
 if(!(n(inputs.residence)>0))pending('inventory','residence','Tiempo de residencia: introduce un tiempo positivo en h de la ficha del grado o de un ensayo de tu material.');
 if(level!=='basic'){
  const bulk=n(inputs.bulkDensity)>0?bulkEvidence(state,inputs):null;
  assessment.bulk_valid_for_volume=!!bulk;assessment.bulk_details=bulk;
  if(!bulk){effective.bulkDensity='';pending('volume','bulkDensity','Densidad aparente: documenta un valor positivo en kg/L, presentación pellets/polvo, fuente y condiciones compatibles. Obtén la densidad a granel mediante ficha o ensayo; no uses densidad sólida ni fundida.');}
 }
 if(level==='advanced'){
  const t0=n(inputs.startT),t1=n(inputs.targetT),recommended=grade?.properties?.drying_temperature;
  if(recommended&&Number.isFinite(t1)&&t1>(recommended.range?.[1]??recommended.value))warnings.push('Temperatura final: supera la recomendación de secado del grado; solicita justificación del fabricante o validación específica.');
  if(!Number.isFinite(t0)||!Number.isFinite(t1)||t0<=-273.15||t1<=-273.15||t1<t0)pending('power','targetT','Temperaturas de calentamiento: documenta ambas temperaturas por encima de −273.15 °C y una temperatura final no menor que la inicial.');
  const evidence=n(inputs.specificHeat)>0?(documentedCp(state,inputs)||manualCp(state,inputs)):null;
  if(evidence){assessment.cp_valid_for_sensible_estimate=true;assessment.cp_details=evidence;assessment.cp_evidence=evidence.source_id?'documented_interval_evidence':'user_declared_interval_evidence';
   if(evidence.definition==='constant_approximation')warnings.push('Cp constante: aproximación declarada para fase sólida sin transición; la potencia es una estimación sensible del polímero, no potencia eléctrica del secador.');
  }else{effective.specificHeat='';assessment.cp_evidence='missing_valid_mean_interval_evidence';pending('power','specificHeat','Calor específico medio: un Cp puntual no demuestra el promedio del calentamiento. Documenta fase sólida sin transición, definición, intervalo, fuente y confirma la evidencia del valor actual. La entrada se conserva; la potencia queda pendiente.');}
 }
 return {effective,warnings,assessment};
}
