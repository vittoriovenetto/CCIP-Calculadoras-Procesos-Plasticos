// Read-only joins: a documentary extension never creates another commercial ID.
import {norm} from './material-search.js';
import {normalizeDocumentedValue} from './research-data.js';
import {compareFlow,measurementKind,testConditions} from './rheology.js';
import {consultExperimentalFormulations} from './recycled.js';
import {resolveUserMaterials,clone} from './shared-materials.js';
export const categories=['commercial','generic','commercial_recycled','formulation','experimental','user'];
export function propertyGroup(key,label=''){
 const word=norm(key+' '+label);
 if(/mfr|mvr|flow|viscos|pvt|rheolog/.test(word))return 'rheological';
 if(/tensile|traction|traccion|flex|elong|strain|impact|hardness|dureza|mechan/.test(word))return 'mechanical';
 if(/dry|secado|residence|process|proces|mold temperature/.test(word))return 'processing';
 if(/heat|specific_heat|conduct|transition|crystall|melting|temperature|vicat|thermal|temperatura|hdt/.test(word))return 'thermal';
 if(/dens|moisture|humidity|humedad|shrink|contrac|absorption|physical/.test(word))return 'physical';
 return 'other';
}
const methodStandard=p=>p.evidence?.test_details?.standard||p.method||null;
function materialProperties(material,research,rheology,sources){
 const properties=[],flows=rheology?.measurements?.filter(x=>x.material_id===material.id)||[];
 const add=(key,p)=>{
  if(!p||!Number.isFinite(p.value)&&!p.range)return;
  if(/mfr|mvr/.test(key)&&flows.length)return;
  const details=p.evidence?.test_details||{},source=sources[p.source_id]||p.evidence;
  properties.push({key,label:key,value:p.value??null,range:p.range||null,unit:p.unit,original:p.entered_value??p.value??p.range?.join('–'),original_unit:p.entered_unit||p.unit,condition:p.condition||null,method:p.method||null,standard:methodStandard(p),temperature_C:details.temperature_C??null,pressure_MPa:details.pressure_MPa??null,load_kg:details.load_kg??null,preconditioning:details.preconditioning||null,phase:p.phase||({solid_density:'solid',melt_density:'melt',bulk_density:'bulk'}[key])||null,source_id:p.source_id,source:clone(source||{}),classification:material.record_status==='user_entered_unverified'?'user_entered':'pending_verification',group:propertyGroup(key),region:p.region||null,variant:p.variant||null});
 };
 for(const [key,p]of Object.entries(material.properties||{}))add(key,p);
 for(const p of material.additional_properties||[])add(p.key,p);
 const record=research?.records?.[material.id];
 for(const row of record?.facts||[]){
  if(measurementKind(row[0])&&flows.length)continue;
  const n=normalizeDocumentedValue(row),key='document:'+norm(row[0]);
  properties.push({key,label:row[0],value:n.value,range:n.range,bound:n.bound,unit:n.unit,original:row[1],original_unit:row[2],condition:row[3],method:row[4],standard:row[4],phase:null,temperature_C:null,pressure_MPa:null,load_kg:null,preconditioning:null,source_id:record.source_id,source:clone(research.sources[record.source_id]||{}),classification:n.classification,issue:n.issue||null,group:propertyGroup(row[0],row[5]),available:n.available});
 }
 return properties;
}
function localFlows(material,sources){
 return ['mfr','mvr'].flatMap(key=>{const p=material.properties?.[key];if(!p)return [];const d=p.evidence?.test_details||{},parsed=testConditions(p.condition||'');return [{id:material.id+'-'+key,material_id:material.id,family:material.family,kind:key.toUpperCase(),value:p.value,range:p.range,unit:key==='mfr'?'g/10 min':'cm³/10 min',temperature_C:d.temperature_C??parsed.temperature_C,load_kg:d.load_kg??parsed.load_kg,pressure_MPa:d.pressure_MPa??null,standard:d.standard||p.method,standard_edition:null,preconditioning:d.preconditioning||null,source_id:p.source_id,classification:'user_entered',verification:'user_entered_unverified',source:sources[p.source_id]||p.evidence}];});
}
export function buildExplorer({catalog,research,rheology,recycling,shared,locals=[],formulations=[]}){
 const resolved=resolveUserMaterials(shared,locals),allSources={...catalog.sources,...research.sources,...rheology.sources},entries=[];
 const base=[...catalog.materials.map(material=>({material,origin:'original'})),...resolved.items.map(material=>({material,origin:material.catalog_origin}))];
 for(const conflict of resolved.conflicts)base.push({material:conflict.local,origin:'local_conflict',conflict});
 for(const {material,origin,conflict}of base){
  const custom=material.record_status==='user_entered_unverified',sources={...allSources};
  if(custom){sources[material.source_id]=material.user_source;for(const p of Object.values(material.properties).filter(Boolean))sources[p.source_id]=p.evidence;}
  const properties=materialProperties(material,research,rheology,sources);
  const flows=custom?localFlows(material,sources):rheology.measurements.filter(x=>x.material_id===material.id);
  const applications=custom?material.user_details.applications:rheology.recommendations.filter(x=>x.material_id===material.id).map(x=>x.process_id);
  entries.push({key:material.id+(conflict?'~local':''),id:material.id,name:material.grade,family:material.family,manufacturer:material.manufacturer,category:custom?'user':material.record_status==='generic_unverified'?'generic':'commercial',material_kind:custom?material.user_details.material_kind:material.record_status==='generic_unverified'?'unspecified':'virgin',origin,verification:custom?(origin==='shared'?'approved_contribution':'user_unverified'):material.record_status==='generic_unverified'?'generic':research.records[material.id]?.facts.length?'partial':'pending',material:clone(material),properties,flows:clone(flows),sources:Object.fromEntries([...new Set([material.source_id,...properties.map(p=>p.source_id),...flows.map(p=>p.source_id)])].filter(id=>sources[id]).map(id=>[id,sources[id]])),applications:[...new Set(applications)],experimental:consultExperimentalFormulations(recycling,material.family),conflict:conflict||null,property_count:properties.length+flows.length,evidence_rank:custom?origin==='shared'?2:1:research.records[material.id]?.facts.length?3:0});
 }
 for(const row of recycling.experimental_formulations){const experiment=recycling.experiments.find(x=>x.id===row.experiment_id),source=recycling.sources[row.source_id];entries.push({key:'experimental:'+row.id,id:row.id,name:`${row.family} · ${row.virgin_percent} % V / ${row.recycled_percent} % R · ${row.source_id}`,family:row.family,manufacturer:'',category:'experimental',material_kind:row.virgin_percent===0?'recycled':row.recycled_percent===0?'virgin':'blend',origin:'experiment',verification:'experimental_only',properties:[],flows:[],applications:[],property_count:0,evidence_rank:2,sources:{[row.source_id]:source},experiment:clone(experiment),composition:clone(row),automatic_application_allowed:false});}
 const ids=new Set();for(const recipe of formulations){if(!recipe?.valid||ids.has(recipe.id))continue;ids.add(recipe.id);entries.push({key:recipe.id,id:recipe.id,name:recipe.name,family:recipe.family,manufacturer:'',category:'formulation',material_kind:recipe.recycled_fraction===0?'virgin':recipe.virgin_fraction===0?'recycled':'blend',origin:'local_formulation',verification:'requires_case_validation',properties:[],flows:[],applications:[],property_count:0,evidence_rank:0,formulation:clone(recipe),sources:{},automatic_application_allowed:false});}
 if(new Set(entries.map(x=>x.key)).size!==entries.length)throw Error('Identificadores duplicados en el explorador.');
 return {entries,conflicts:resolved.conflicts};
}
export function filterExplorer(entries,filters={}){
 const terms=norm(filters.query).split(/\s+/).filter(Boolean);
 const found=entries.filter(entry=>{
  for(const field of ['family','manufacturer','category','material_kind','verification'])if(filters[field]&&entry[field]!==filters[field])return false;
  if(filters.grade&&entry.name!==filters.grade)return false;
  if(filters.process&&!entry.applications.includes(filters.process))return false;
  if(filters.with_properties&&entry.property_count===0)return false;
  if(filters.property&&!entry.properties.some(x=>x.key===filters.property)&&!entry.flows.some(x=>x.kind.toLowerCase()===filters.property))return false;
  if(filters.group&&!entry.properties.some(x=>x.group===filters.group)&&(filters.group!=='rheological'||!entry.flows.length))return false;
  const haystack=norm([entry.name,entry.family,entry.manufacturer,entry.id,...entry.properties.map(p=>p.label),...entry.flows.map(p=>p.kind)].join(' '));return terms.every(term=>haystack.includes(term));
 });
 return found.sort((a,b)=>filters.sort==='properties'?b.property_count-a.property_count||a.name.localeCompare(b.name):filters.sort==='evidence'?b.evidence_rank-a.evidence_rank||a.name.localeCompare(b.name):String(a[filters.sort==='manufacturer'?'manufacturer':filters.sort==='family'?'family':'name']).localeCompare(String(b[filters.sort==='manufacturer'?'manufacturer':filters.sort==='family'?'family':'name']),'es'));
}
export function compareProperty(a,b){
 if(!a||!b)return {status:'pending',reason:'missing_property',difference:null};
 if(a.key!==b.key||a.unit!==b.unit)return {status:'incompatible',reason:'different_quantity_or_unit',difference:null};
 if(!Number.isFinite(a.value)||!Number.isFinite(b.value))return {status:'pending',reason:'non_exact_values',difference:null};
 const known=x=>x!==null&&x!==undefined&&x!=='';
 for(const key of ['phase','method','standard','condition','preconditioning','temperature_C','pressure_MPa','load_kg','sample_state'])if(known(a[key])&&known(b[key])&&a[key]!==b[key])return {status:'incompatible',reason:'different_conditions',difference:null};
 for(const key of ['phase','method','condition','preconditioning','temperature_C','pressure_MPa'])if(!known(a[key])||!known(b[key]))return {status:'conditional',reason:'missing_conditions',difference:null};
 if(!['official_grade_specific','independent_grade_experiment'].includes(a.classification)||!['official_grade_specific','independent_grade_experiment'].includes(b.classification))return {status:'conditional',reason:'unverified_or_estimated',difference:null};
 return {status:'compatible',reason:'same_documented_conditions',difference:b.value-a.value};
}
export function compareExplorer(a,b){
 if(!a||!b)return {a:a||null,b:b||null,rows:[]};
 const keys=[...new Set([...a.properties,...b.properties].map(p=>p.key))];
 const rows=keys.map(key=>{const first=a.properties.filter(p=>p.key===key),second=b.properties.filter(p=>p.key===key);return {key,first,second,assessment:first.length===1&&second.length===1?compareProperty(first[0],second[0]):{status:'conditional',reason:'multiple_or_missing_measurements',difference:null}};});
 const flowPairs=a.flows.length&&b.flows.length?a.flows.flatMap(first=>b.flows.map(second=>({key:'flow:'+first.id+':'+second.id,first:[first],second:[second],assessment:compareFlow(first,second)}))):[...a.flows.map(first=>({key:'flow:'+first.id,first:[first],second:[],assessment:compareFlow(first,null)})),...b.flows.map(second=>({key:'flow:'+second.id,first:[],second:[second],assessment:compareFlow(null,second)}))];
 return {a:clone(a),b:clone(b),rows:[...rows,...flowPairs],same_record:a.key===b.key,automatic_ranking:false};
}
