import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {normalizeDocumentedValue} from '../../src/research-data.js';
import {measurementKind,testConditions} from '../../src/rheology.js';
const read=p=>JSON.parse(fs.readFileSync(p));
const catalog=read('src/data/materials.v1.3.json'),prior=read('docs/etapa-3/baseline/materials.pre-etapa3.json'),research=read('src/data/material-research.v1.json');
const review=read('docs/etapa-3/gp35-regional-review.json');
const measurements=[],recommendations=[],sources={...research.sources,...review.sources};
const id=text=>createHash('sha256').update(text).digest('hex').slice(0,16);
const standard=text=>typeof text==='string'&&/ISO\s*\d|ASTM\s*D\s*\d/.test(text)?text:null;
for(const grade of catalog.materials) {
 const documentary=research.records[grade.id];
 for(const row of documentary.facts) {
  const kind=measurementKind(row[0]);if(!kind)continue;
  const p=normalizeDocumentedValue(row);if(!p.available||p.value===null||p.unit!==(kind==='MVR'?'cm³/10 min':'g/10 min'))continue;
  const method=row[4]||row[0].match(/\b(?:ISO\s*\d+(?:-\d+)?|ASTM\s*D\s*\d+)/)?.[0]||null;
  const conditions=testConditions([row[0],row[3]].join(' '));
  measurements.push({id:'flow-'+id(grade.id+JSON.stringify(row)),material_id:grade.id,family:grade.family,kind,value:p.value,range:null,unit:p.unit,...conditions,pressure_MPa:null,standard:standard(method),standard_edition:method?.match(/:(\d{4})/)?.[1]||null,method_declared:method,preconditioning:null,source_id:documentary.source_id,...(grade.id===review.material_id?{region:sources[documentary.source_id].region,variant:null,sample_state:'uncolored_products',sku:review.identity_conclusion.sku,revision_original:sources[documentary.source_id].revision_original}:{}),classification:'official_grade_specific',verification:'document_content_reviewed',condition_original:row[3],label_original:row[0],notes:['No es viscosidad ni recomendación de MFR por proceso.']});
 }
 if(grade.id===review.material_id)for(const extra of review.additional_flow_measurements){
  const source=sources[extra.source_id];
  measurements.push({id:'flow-'+id(grade.id+extra.source_id+JSON.stringify(extra)),material_id:grade.id,family:grade.family,...extra,range:null,pressure_MPa:null,standard_edition:null,preconditioning:null,region:source.region,variant:source.variant,sample_state:source.sample_state,sku:source.sku,revision_original:source.revision_original,classification:'official_grade_specific',verification:'regional_table_and_pdf_content_reviewed',condition_original:`${extra.temperature_C} °C / ${extra.load_kg} kg`,notes:['Typical uncolored products; regional/colored-variant equivalence is not proven. Independent measurement, not an MVR/MFR conversion.']});
 }
 const old=prior.materials.find(m=>m.id===grade.id);
 const existing=[...Object.entries(old.properties).map(([key,p])=>({key,...p})),...(old.additional_properties||[])].filter(p=>/^m(?:fr|vr)(?:_secondary)?$/.test(p.key)&&Number.isFinite(p.value));
 for(const p of existing) {
  const sourceId='legacy-'+p.source_id;sources[sourceId]=structuredClone(prior.sources[p.source_id]);
  const kind=p.key.startsWith('mvr')?'MVR':'MFR',conditions=testConditions(p.condition);
  const published=measurements.find(m=>m.material_id===grade.id&&m.kind===kind&&m.value===p.value&&m.temperature_C===conditions.temperature_C&&m.load_kg===conditions.load_kg&&m.standard===standard(p.method));
  const evidence={source_id:sourceId,property_key:p.key,condition_original:p.condition,method_declared:p.method,verification:grade.id===review.material_id?'prior_value_matches_regional_document_original_region_not_recorded':'prior_catalog_not_reconfirmed'};
  if(published){(published.prior_evidence||=[]).push(evidence);continue;}
  measurements.push({id:'legacy-flow-'+id(grade.id+p.key+JSON.stringify(p)),material_id:grade.id,family:grade.family,kind,value:p.value,range:p.range||null,unit:kind==='MVR'?'cm³/10 min':'g/10 min',...conditions,pressure_MPa:null,standard:standard(p.method),standard_edition:null,method_declared:p.method,preconditioning:null,source_id:sourceId,classification:'pending_verification',verification:'prior_catalog_not_reconfirmed',condition_original:p.condition||null,label_original:p.key,notes:['Valor previo conservado; su documento/condición no se reconfirmó para este ensayo.']});
 }
 const description=documentary.description_original||'';
 const fabrication=documentary.facts.filter(row=>row[0]==='Fabrication Method').map(row=>row[1]).join('; ');
 const text=description+' '+fabrication;
 const mapping=[['inyeccion',/injection.?mould|injection.?mold|inyecci[oó]n/i],['extrusion',/\bextrusion\b|extrusi[oó]n/i],['pelicula',/blown.?film|pel[ií]cula.?soplada/i],['soplado',/blow.?mold|blow.?mould|estirado.?soplado/i],['termoformado',/thermoform|termoform/i]];
 if(documentary.source_id)for(const [process,pattern]of mapping)if(pattern.test(text))recommendations.push({id:'application-'+id(grade.id+process),material_id:grade.id,family:grade.family,process_id:process,scope:'grade_specific_application',classification:'official_grade_specific',source_id:documentary.source_id,statement_original:fabrication||description.slice(0,800),mfr_interval:null,mvr_interval:null,test_conditions:null,limitations:['Aplicación indicada por fabricante; no garantiza idoneidad de máquina, geometría o producto.','No equivale a un rango universal de MFR ni permite excluir materiales por fluidez únicamente.']});
}
const out={schema:'ccip-rheology/1',revision:'1.0.1',sources,measurements,recommendations,policies:{no_mfr_viscosity_equivalence:true,no_automatic_mvr_mfr_conversion:true,no_universal_process_mfr_ranges:true,do_not_assign_current_standard_edition_to_old_tests:true}};
fs.writeFileSync('src/data/rheology.v1.json',JSON.stringify(out)+'\n');
const csv=(file,head,rows)=>fs.writeFileSync(file,[head,...rows].map(row=>row.map(x=>'"'+String(x??'').replaceAll('"','""')+'"').join(',')).join('\n')+'\n');
csv('docs/etapa-3/flow-matrix.csv',['material_id','kind','value','unit','temperature_C','load_kg','method','standard_edition','source_id','classification','region','variant','sample_state','sku'],measurements.map(m=>[m.material_id,m.kind,m.value,m.unit,m.temperature_C,m.load_kg,m.standard,m.standard_edition,m.source_id,m.classification,m.region,m.variant,m.sample_state,m.sku]));
csv('docs/etapa-3/process-matrix.csv',['material_id','process_id','scope','source_id','mfr_interval','mvr_interval'],recommendations.map(r=>[r.material_id,r.process_id,r.scope,r.source_id,null,null]));
console.log({measurements:measurements.length,documented:measurements.filter(m=>m.classification==='official_grade_specific').length,recommendations:recommendations.length});
