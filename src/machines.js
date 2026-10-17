// Etapa 6: catálogo de equipos separado del catálogo de materiales.
// Los datos de familia de máquinas no son configuraciones ni capacidades verificadas de una instalación.
export const SUPPORTED_PROCESSES = ['inyeccion','extrusion','pelicula','soplado','termoformado','secado'];
const allowedFields = {screwD:'screw_diameter_mm',screwMaxStroke:'screw_max_stroke_mm'};
const clone = x => x == null ? x : JSON.parse(JSON.stringify(x));
const finite = x => typeof x === 'number' && Number.isFinite(x);
export const newMachineState = () => ({id:'',confirmed:false,applied:{},profile:null});
export function validateMachineCatalog(data) {
  if(data?.schema_version!=='ccip-machines/1' || !Array.isArray(data.machines)) throw Error('Versión del catálogo de máquinas inválida.');
  const ids=new Set();
  for(const m of data.machines){
    if(!m || typeof m.id!=='string'||!/^[-a-z0-9]{5,100}$/.test(m.id)||ids.has(m.id)||
      !SUPPORTED_PROCESSES.includes(m.process)||!['specific_configuration','specific_model','series_range','configurable_series'].includes(m.scope)||
      typeof m.manufacturer!=='string'||!m.manufacturer.trim()||typeof m.model!=='string'||!m.model.trim())throw Error('Ficha de máquina inválida.');
    ids.add(m.id);
    const src=m.source;
    if(!src || typeof src.title!=='string'||typeof src.scope_note!=='string')throw Error('Fuente incompleta.');
    let url;try{url=new URL(src.url)}catch{throw Error('Fuente de máquina no válida.')}
    if(url.protocol!=='https:'||url.username||url.password)throw Error('Fuente de máquina no segura.');
    if(!m.specifications || typeof m.specifications!=='object'||Array.isArray(m.specifications))throw Error('Especificaciones de máquina no válidas.');
    for(const [key,p] of Object.entries(m.specifications)) {
      if(!/^[a-zA-Z0-9_]+$/.test(key)||typeof p?.unit!=='string'||!p.unit||typeof p.note!=='string'||
        (p.value!==undefined && !finite(p.value)) ||
        (p.range!==undefined && (!Array.isArray(p.range)||p.range.length!==2||!p.range.every(finite)||p.range[0]>p.range[1]))||
        (p.value===undefined && p.range===undefined) || (p.value!==undefined && p.range!==undefined))throw Error('Propiedad de máquina no válida.');
    }
    for(const [field,key] of Object.entries(m.autofill_fields||{}))
      if(m.scope!=='specific_configuration'||allowedFields[field]!==key||!finite(m.specifications[key]?.value))throw Error('Precarga de máquina no apta.');
  }
  return data;
}
export const machinesFor = (catalog,process) => (catalog?.machines||[]).filter(m=>m.process===process);
export const machineFor = (catalog,id) => catalog?.machines?.find(m=>m.id===id)||null;
function relinquish(selection,values,origins) {
  for(const [field,value] of Object.entries(selection.applied||{}))if(origins[field]==='machine_catalog' && Number(values[field])===value) {
    values[field]='';delete origins[field];
  }
  selection.applied={};
}
export function selectMachine(selection,catalog,id,process,values,origins) {
  relinquish(selection,values,origins);
  const machine=machineFor(catalog,id);
  selection.id=machine?.process===process?machine.id:'';
  selection.profile=machine?.process===process?clone(machine):null;
  selection.confirmed=false;
  return selection;
}
export function setMachineConfirmed(selection,confirmed,values,origins) {
  relinquish(selection,values,origins);
  selection.confirmed=!!confirmed&&selection.profile?.scope==='specific_configuration';
  if(!selection.confirmed)return selection;
  for(const [field,key] of Object.entries(selection.profile.autofill_fields||{})) {
    const value=selection.profile.specifications[key].value;
    if((values[field]===''||values[field]==null||origins[field]==='machine_catalog')&&finite(value)){
      values[field]=value;origins[field]='machine_catalog';selection.applied[field]=value;
    }
  }
  return selection;
}
export function machineSnapshot(selection) {
  if(!selection?.id || !selection.profile)return null;
  return clone({id:selection.id,confirmed:selection.confirmed,profile:selection.profile,applied:selection.applied});
}
export function restoreMachine(snapshot) {
  const s=newMachineState();
  if(!snapshot?.profile || snapshot.id!==snapshot.profile.id)return s;
  try{validateMachineCatalog({schema_version:'ccip-machines/1',machines:[snapshot.profile]})}catch{return s}
  s.id=snapshot.id;s.profile=clone(snapshot.profile);
  s.confirmed=snapshot.confirmed===true&&s.profile.scope==='specific_configuration';
  s.applied=Object.fromEntries(Object.entries(snapshot.applied||{}).filter(([k,v])=>Object.hasOwn(allowedFields,k)&&finite(v)));
  return s;
}
const metric=(result,label,unit)=>result?.metrics?.find(m=>m.label===label&&m.unit===unit&&finite(m.value));
export function assessMachine(selection,process,result,values={}) {
  const profile=selection?.profile;
  if(!profile||profile.process!==process)return null;
  const report={machine_id:profile.id,model:profile.model,manufacturer:profile.manufacturer,source:clone(profile.source),
    scope:profile.scope,configuration_confirmed:selection.confirmed===true,checks:[],notes:[]};
  if(profile.scope!=='specific_configuration') {
    report.notes.push('Serie o modelo configurable: sus intervalos no certifican los límites de un equipo configurado; se necesita ficha de variante.');
    if(process==='secado')report.notes.push('Volumen nominal de tolva y potencia conectada no son volumen útil ni consumo real; no convertir en potencia de secado.');
    return report;
  }
  if(!selection.confirmed) {
    report.notes.push('Confirma físicamente que el equipo corresponde a la variante exacta antes de usar capacidades de referencia.');
    return report;
  }
  const s=profile.specifications;
  if(finite(s.screw_diameter_mm?.value)&&finite(s.screw_max_stroke_mm?.value) &&
    (finite(Number(values.screwD))&&Number(values.screwD)!==s.screw_diameter_mm.value||
      finite(Number(values.screwMaxStroke))&&Number(values.screwMaxStroke)!==s.screw_max_stroke_mm.value)){
    report.notes.push('Los datos de husillo/carrera del caso no coinciden con la configuración seleccionada. Se suspenden comparaciones de capacidad.');
    return report;
  }
  if(process==='inyeccion'){
    const pairs=[
      ['Shot calculado (volumen)','cm³','shot_volume_cm3','cm³',1],
      ['Carrera calculada del husillo','mm','screw_max_stroke_mm','mm',1],
      ['Fuerza de cierre con factor','tf','clamp_force_kN','kN',9.80665]
    ];
    for(const [label,unit,key,limitUnit,factor] of pairs){
      const measured=metric(result,label,unit),limit=s[key]?.value;
      if(!measured||!finite(limit))continue;
      const demand=measured.value*factor;
      report.checks.push({label,actual:demand,limit,unit:limitUnit,status:demand>limit?'above_published_limit':'within_published_limit',
        note:key==='clamp_force_kN'?'Cálculo ideal con factor y conversión 1 tf = 9.80665 kN; no certifica la máquina.':'Comparación geométrica o nominal; validar reserva, material, condición real y versión de máquina.'});
    }
  }
  report.notes.push('Cumplir los límites numéricos no demuestra viabilidad de proceso: presión, velocidad, enfriamiento, material, molde y configuraciones se verifican por separado.');
  return report;
}
