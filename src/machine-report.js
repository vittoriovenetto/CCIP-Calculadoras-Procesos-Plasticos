import {flattenEvidence,exportCopy} from './export-data.js';
import {compareMachineRecords} from './machine-explorer-data.js';
import {machineSpecLabels} from './machines-view.js';

export function prepareMachineReport(machines,language='es',images={}){
 if(!Array.isArray(machines)||!machines.length||machines.length>4)throw Error('Select one to four machines.');
 const records=structuredClone(machines),tr=exportCopy(language),en=language==='en';
 const comparison=records.length>1?compareMachineRecords(records):null;
 const label=key=>machineSpecLabels[key]?.[en?1:0]||key;
 const identity=records.flatMap((m,i)=>[[tr('Equipo','Equipment'),String.fromCharCode(65+i)],['ID',m.id],[tr('Fabricante','Manufacturer'),m.manufacturer],[tr('Modelo','Model'),en?m.model_en||m.model:m.model],[tr('Proceso','Process'),m.process],[tr('Configuración','Configuration'),en?m.configuration_en||m.configuration:m.configuration],[tr('Estado documental','Documentation status'),m.verification_status]]);
 return {record:{schema:'ccip-machine-report/1',machines:records,comparison,images:structuredClone(images),export_metadata:{exported_at:new Date().toISOString(),language}},language,name:records.map(m=>m.model).join(' / '),title:tr('Maquinaria — ficha / comparación documental','Machinery — datasheet / documentary comparison'),unavailable:tr('No documentado','Not documented'),summary:identity,
  parameters:records.flatMap((m,i)=>Object.entries(m.specifications).map(([key,s])=>({label:`${String.fromCharCode(65+i)} · ${label(key)}`,value:s.value??s.range.join('–'),original:String(s.value??s.range.join('–')),unit:s.unit,origin:[en?s.note_en||s.note:s.note,s.conditions?JSON.stringify(s.conditions):''].filter(Boolean).join(' · '),source_id:s.source_id||m.source.id}))),
  results:(comparison?.pairs||[]).flatMap(pair=>pair.rows.map(row=>({label:`${pair.a} / ${pair.b} · ${label(row.key)}`,value:row.status,unit:'',formula:row.normalized?JSON.stringify(row.normalized):'',estimated:false}))),
  sources:records.flatMap(m=>flattenEvidence({[m.id]:m.sources||[m.source]})),
  observations:[[tr('Alcance','Scope'),tr('Referencia documental, sin certificación de configuración física ni clasificación de mejor equipo. Datos ausentes, series y condiciones distintas no son equivalentes.','Documentary reference, without physical configuration certification or best-machine ranking. Missing data, series and different conditions are not equivalent.')],...flattenEvidence(records.map(m=>({id:m.id,scope:m.scope,limitations:m.limitations,undocumented_fields:m.undocumented_fields,identity_status:m.identity_status})))],profile:[],report_labels:{summary:tr('Identidad y estado','Identity and status'),parameters:tr('Especificaciones y condiciones','Specifications and conditions'),results:tr('Comparabilidad documental','Documentary comparability'),sources:tr('Fuentes y límites','Sources and limits')}};
}
export async function exportMachineReport(machines,format,language,images){
 const data=prepareMachineReport(machines,language,images);let blob;
 if(format==='json')blob=new Blob([JSON.stringify(data.record,null,2)],{type:'application/json'});
 else if(format==='xlsx')blob=await(await import('./export-excel.js')).generateExcel(data);
 else if(format==='pdf')blob=await(await import('./export-pdf.js')).generatePdf(data);
 else throw Error('Unknown report format.');
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='CCIP-maquinaria-'+machines.map(m=>m.id.replace(/[^a-z0-9_-]/gi,'-')).join('-').slice(0,100)+'.'+format;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
