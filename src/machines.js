// Etapa 6: catálogo de equipos separado del catálogo de materiales.
// Los datos de familia de máquinas no son configuraciones ni capacidades verificadas de una instalación.
export const SUPPORTED_PROCESSES = ['inyeccion','extrusion','pelicula','soplado','termoformado','secado'];
import {compareMachine} from './machine-comparison.js';
export {machineUnit} from './machine-comparison.js';
const fieldRules = {inyeccion:{screwD:['screw_diameter_mm','mm'],screwMaxStroke:['screw_max_stroke_mm','mm']},pelicula:{dieDiameter:['die_diameter_mm','mm'],dieGap:['die_gap_mm','mm']}};
const specific = p => ['specific_configuration','specific_model'].includes(p?.scope);
const clone = x => x == null ? x : JSON.parse(JSON.stringify(x));
const finite = x => typeof x === 'number' && Number.isFinite(x);
export const newMachineState = () => ({id:'',confirmed:false,applied:{},profile:null,manufacturer:'',operation:{},reused_from:null});
// `confirmed` is retained for snapshot compatibility; new selections activate
// specific variants automatically. It does not certify a physical machine.
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
    if(m.sources!==undefined){
      if(!Array.isArray(m.sources)||!m.sources.length)throw Error('Fuentes de máquina incompletas.');
      const sourceIds=new Set();
      for(const source of m.sources){
        let address;try{address=new URL(source.url)}catch{throw Error('Fuente secundaria no válida.')}
        if(address.protocol!=='https:'||address.username||address.password||typeof source.id!=='string'||sourceIds.has(source.id))throw Error('Fuente secundaria no segura o duplicada.');
        sourceIds.add(source.id);
      }
      if(!sourceIds.has(src.id)||Object.values(m.specifications||{}).some(p=>!sourceIds.has(p.source_id)))throw Error('Propiedad sin fuente de máquina identificada.');
    }
    if(!m.specifications || typeof m.specifications!=='object'||Array.isArray(m.specifications))throw Error('Especificaciones de máquina no válidas.');
    for(const [key,p] of Object.entries(m.specifications)) {
      if(!/^[a-zA-Z0-9_]+$/.test(key)||typeof p?.unit!=='string'||!p.unit||typeof p.note!=='string'||
        (p.value!==undefined && !finite(p.value)) ||
        (p.range!==undefined && (!Array.isArray(p.range)||p.range.length!==2||!p.range.every(finite)||p.range[0]>p.range[1]))||
        (p.value===undefined && p.range===undefined) || (p.value!==undefined && p.range!==undefined))throw Error('Propiedad de máquina no válida.');
    }
    for(const [field,key] of Object.entries(m.autofill_fields||{}))
      if(!specific(m)||fieldRules[m.process]?.[field]?.[0]!==key||fieldRules[m.process]?.[field]?.[1]!==m.specifications[key]?.unit||!finite(m.specifications[key]?.value)||m.specifications[key].value<=0)throw Error('Precarga de máquina no apta.');
  }
  return data;
}
export function catalogReadiness(catalog) {
  const minimum={inyeccion:4,extrusion:3,pelicula:4,soplado:3,termoformado:3,secado:3};
  const counts=Object.fromEntries(SUPPORTED_PROCESSES.map(p=>[p,0])),identities=new Set(),excluded=[];
  for(const m of catalog.machines){
    const sources=m.sources||[m.source],ids=new Set(sources.map(s=>s.id));
    const identity=m.commercial_identity;
    const eligible=specific(m)&&m.verification_status==='document_checked'&&identity&&!identities.has(identity)&&
      sources.length&&sources.every(s=>s.http_status===200&&/^\d{4}-\d{2}-\d{2}$/.test(s.retrieved_on||'')&&/^[a-f0-9]{64}$/.test(s.sha256||''))&&
      Object.keys(m.specifications).length>=3&&Object.values(m.specifications).every(p=>ids.has(p.source_id));
    if(eligible){counts[m.process]++;identities.add(identity);}else excluded.push(m.id);
  }
  const priorities=['moiron-m2-i','xihua-xh-430b-25'].every(id=>catalog.machines.some(m=>m.id===id&&!excluded.includes(id)));
  return {minimum,counts,qualified_count:Object.values(counts).reduce((a,b)=>a+b,0),excluded,priorities_present:priorities,
    complete:priorities&&Object.entries(minimum).every(([p,n])=>counts[p]>=n),industrial_approval:false};
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
  selection.id=(machine?.process===process || process==='costos'&&!!machine)?machine.id:'';
  selection.profile=(machine?.process===process || process==='costos'&&!!machine)?clone(machine):null;
  selection.confirmed=false;selection.operation={};if(process!=='costos')selection.reused_from=null;
  // A concrete selection activates only the existing, documented prefill rules.
  // Costs keep their explicit saved-calculation reuse flow and never prefill ratings.
  return setMachineConfirmed(selection,process!=='costos',values,origins);
}
export function setMachineConfirmed(selection,confirmed,values,origins) {
  relinquish(selection,values,origins);
  selection.confirmed=!!confirmed&&specific(selection.profile);
  if(!selection.confirmed)return selection;
  for(const [field,key] of Object.entries(selection.profile.autofill_fields||{})) {
    const value=selection.profile.specifications[key].value;
    if((values[field]===''||values[field]==null||origins[field]==='machine_catalog')&&finite(value)){
      values[field]=value;origins[field]='machine_catalog';selection.applied[field]=value;
    }
  }
  return selection;
}
export function machineSnapshot(selection,inputs={},origins={}) {
  if(!selection?.profile)return selection?.reused_from?clone({id:'',profile:null,reused_from:selection.reused_from}):null;
  const used_fields=Object.fromEntries(Object.entries(selection.applied||{}).filter(([k,v])=>origins[k]==='machine_catalog'&&inputs[k]!==''&&inputs[k]!=null&&Number(inputs[k])===v));
  return clone({id:selection.id,confirmed:selection.confirmed,selection_kind:'documentary_reference',physical_configuration_verified:false,profile:selection.profile,applied:selection.applied,used_fields,operation:selection.operation,reused_from:selection.reused_from});
}
export function restoreMachine(snapshot) {
  const s=newMachineState();
  if(!snapshot?.profile){s.reused_from=clone(snapshot?.reused_from||null);return s;}
  if(snapshot.id!==snapshot.profile.id)return s;
  try{validateMachineCatalog({schema_version:'ccip-machines/1',machines:[snapshot.profile]})}catch{return s}
  s.id=snapshot.id;s.profile=clone(snapshot.profile);
  s.confirmed=snapshot.confirmed===true&&specific(s.profile);
  s.applied=Object.fromEntries(Object.entries(snapshot.applied||{}).filter(([k,v])=>finite(v)&&s.profile.autofill_fields?.[k]&&s.profile.specifications[s.profile.autofill_fields[k]]?.value===v));
  s.operation=snapshot.operation&&typeof snapshot.operation==='object'&&!Array.isArray(snapshot.operation)?clone(snapshot.operation):{};
  s.reused_from=clone(snapshot.reused_from||null);
  return s;
}
export function assessMachine(selection,process,result,values={},context={}) {
  const report=compareMachine(selection?.profile,selection?.confirmed,process,result,values,{...selection?.operation,...context});
  if(report){report.reference_selected=selection?.confirmed===true;report.configuration_confirmed=false;report.physical_configuration_verified=false;}
  return report;
}
export function reuseCalculation(record,values,origins,previous) {
  for(const [key,value] of Object.entries(previous?.applied||{}))if(origins[key]==='saved_calculation'&&values[key]===value){values[key]='';delete origins[key];}
  const allowed=['cycleSec','cavities','partMass','powerKw'],applied={},skipped=[];
  for(const key of allowed){
    const value=record?.inputs?.[key];
    if(!['string','number'].includes(typeof value)||typeof value==='string'&&!value.trim()||!Number.isFinite(Number(value))||Number(value)<0||key!=='powerKw'&&Number(value)===0)continue;
    // Only explicit operating power, never connected/installed machine ratings.
    if(key==='powerKw' && record.module!=='costos')continue;
    if(values[key]!==''&&values[key]!=null&&!['default_example','saved_calculation'].includes(origins[key])){skipped.push(key);continue;}
    values[key]=value;origins[key]='saved_calculation';applied[key]=value;
  }
  return {id:record?.id||null,date:record?.date||null,module:record?.module||null,name:record?.name||'',applied,skipped,
    machine:clone(record?.machine||null),input_origins:clone(record?.calculation_metadata?.input_origins||{}),installed_power_used_as_consumption:false};
}
