import {machineUnit} from './machines.js';

export const processNames={inyeccion:['Inyección','Injection'],extrusion:['Extrusión','Extrusion'],pelicula:['Película soplada','Blown film'],soplado:['Soplado de envases','Container blow moulding'],termoformado:['Termoformado','Thermoforming'],secado:['Secado','Drying']};
export const machineTypes={
 inyeccion:['Inyectora hidráulica','Hydraulic injection machine'],extrusion:['Extrusora','Extruder'],pelicula:['Línea de película soplada','Blown film line'],soplado:['Sopladora','Blow moulding machine'],termoformado:['Termoformadora','Thermoformer'],
 hot_air_surface_dryer:['Secador de aire caliente','Hot-air dryer'],compact_servo_injection:['Inyectora servo compacta','Compact servo injection machine'],compact_injection:['Inyectora compacta','Compact injection machine'],laboratory_hydraulic_injection:['Inyectora hidráulica de laboratorio','Laboratory hydraulic injection machine'],single_screw_laboratory_extruder:['Extrusora monohusillo de laboratorio','Single-screw laboratory extruder'],laboratory_blown_film:['Película soplada de laboratorio','Laboratory blown film line'],continuous_extrusion_blow_moulding:['Soplado por extrusión continua','Continuous extrusion blow moulding'],air_cooled_blown_film_takeoff_line:['Línea de película con enfriamiento por aire','Air-cooled blown film take-off line'],roll_fed_thermoformer:['Termoformadora de bobina','Roll-fed thermoformer']
};
export const isSpecific=machine=>['specific_configuration','specific_model'].includes(machine?.scope);
const normalized=value=>String(value??'').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().replace(/[^a-z0-9]/g,'');
export function filterMachines(catalog,filters={}){
 const tokens=String(filters.query||'').trim().split(/\s+/).map(normalized).filter(Boolean);
 return (catalog?.machines||[]).filter(m=>{
  const hay=normalized([m.id,m.manufacturer,m.model,m.model_en,m.family,m.series,m.machine_type,m.configuration,m.configuration_en,...(processNames[m.process]||[]),...(machineTypes[m.machine_type]||[])].join(' '));
  return tokens.every(token=>hay.includes(token))&&(!filters.process||m.process===filters.process)&&(!filters.manufacturer||m.manufacturer===filters.manufacturer)&&(!filters.type||m.machine_type===filters.type)&&(!filters.scope||m.scope===filters.scope)&&(!filters.documentation||m.verification_status===filters.documentation)&&(!filters.specification||Object.hasOwn(m.specifications,filters.specification));
 });
}
const primaryKeys={inyeccion:['clamp_force_kN','screw_diameter_mm','shot_volume_cm3','shot_mass_ABS_g'],extrusion:['screw_diameter_mm','screw_L_over_D','screw_speed_rpm'],pelicula:['die_diameter_mm','screw_diameter_mm','layer_count'],soplado:['clamp_force_kN','mold_max_width_mm','product_max_volume_L'],termoformado:['forming_max_width_mm','forming_max_length_mm','forming_max_height_mm'],secado:['hopper_nominal_L','process_airflow_m3_h','max_temperature_C']};
export const highlights=machine=>(primaryKeys[machine.process]||[]).filter(key=>machine.specifications[key]).slice(0,3).map(key=>({key,...machine.specifications[key]}));
export function specificationGroup(key){
 if(/power|motor|heater|voltage|frequency|torque/.test(key))return 'drive';
 if(/hopper|airflow|temperature|dew_point/.test(key))return 'drying';
 if(/shot|injection|plasticizing/.test(key))return 'injection';
 if(/screw|extruder|die_|layer_count/.test(key))return 'screw_die';
 if(/mold|mould|clamp|tiebar|platen|tool_|punching/.test(key))return 'mould';
 if(/film|sheet|forming|bubble|width_.*published/.test(key))return 'product';
 if(/output|speed|cycle|residence|hauloff/.test(key))return 'capacity';
 return 'general';
}
const stable=value=>JSON.stringify(value&&typeof value==='object'&&!Array.isArray(value)?Object.fromEntries(Object.keys(value).sort().map(key=>[key,JSON.parse(stable(value[key]))])):value??null);
const finite=value=>typeof value==='number'&&Number.isFinite(value);
const convert=(value,from,to)=>from===to?value:machineUnit(value,from,to);
export function compareMachineRecords(machines){
 if(!Array.isArray(machines)||machines.length<2||machines.length>4||new Set(machines.map(m=>m.id)).size!==machines.length)throw Error('Select two to four distinct machines.');
 const pairs=[];
 for(let i=0;i<machines.length;i++)for(let j=i+1;j<machines.length;j++){
  const a=machines[i],b=machines[j];
  const rows=[...new Set([...Object.keys(a.specifications),...Object.keys(b.specifications)])].map(key=>{
   const first=a.specifications[key]||null,second=b.specifications[key]||null;
   let status='comparable',normalizedValues=null;
   if(!first||!second)status='missing';
   else if(a.process!==b.process)status='different_process';
   else if(!isSpecific(a)||!isSpecific(b))status='series_reference';
   else if(a.identity_status||b.identity_status)status='variant_identity_pending';
   else if(!finite(first.value)||!finite(second.value))status='range_reference';
   else if(/output|plasticizing|shot_mass/.test(key)&&(!first.conditions||!second.conditions))status='conditions_required';
   else if(stable(first.conditions)!==stable(second.conditions))status='different_conditions';
   else {
    const unit=key==='clamp_force_kN'?'kN':first.unit;
    const left=convert(first.value,first.unit,unit),right=convert(second.value,second.unit,unit);
    if(!finite(left)||!finite(right))status='incompatible_units';else normalizedValues={first:left,second:right,unit};
   }
   return {key,first,second,status,normalized:normalizedValues};
  });
  pairs.push({a:a.id,b:b.id,different_process:a.process!==b.process,rows});
 }
 return {schema:'ccip-machine-comparison/1',machine_ids:machines.map(m=>m.id),pairs,industrial_approval:false,ranking:null};
}
