import {validateUserMaterial,mergeCustomMaterials,listUserMaterials} from './custom-materials.js';
import {USER_CATEGORY,validRevision,validTimestamp} from './user-material-details.js';
export const REPOSITORY='vittoriovenetto/CCIP-Calculadoras-Procesos-Plasticos';
export const SHARED_SCHEMA='ccip-shared-user-materials/1';
export const clone=x=>structuredClone(x);
export const canonical=x=>x===null||typeof x!=='object'?JSON.stringify(x):Array.isArray(x)?'['+x.map(canonical).join(',')+']':'{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+canonical(x[k])).join(',')+'}';
export function githubReference(raw){
 try{const u=new URL(raw),match=u.pathname.match(/^\/vittoriovenetto\/CCIP-Calculadoras-Procesos-Plasticos\/(issues|pull)\/([1-9]\d{0,9})\/?$/);if(u.protocol==='https:'&&u.hostname==='github.com'&&!u.username&&!u.password&&match&&!u.search&&!u.hash)return {kind:match[1]==='issues'?'issue':'pull',number:Number(match[2]),url:`https://github.com/${REPOSITORY}/${match[1]}/${match[2]}`};}catch{}
 throw Error('Referencia de GitHub no válida para este repositorio.');
}
export function validateSharedCatalog(data){
 if(!data||data.schema!==SHARED_SCHEMA||!Number.isSafeInteger(data.revision)||data.revision<1||!Array.isArray(data.materials)||data.materials.length>2000)throw Error('Biblioteca compartida no válida.');
 const ids=new Set(),names=new Set();
 const materials=data.materials.map(entry=>{
  const material=validateUserMaterial(entry.material);
  if(entry.id!==material.id||entry.category!==USER_CATEGORY||entry.verification_status!=='approved_contribution_not_industrially_certified'||entry.review?.state!=='approved_as_contribution'||!Array.isArray(entry.history)||!entry.history.length)throw Error('Aporte compartido sin aprobación documental.');
  validRevision(entry.revision);validTimestamp(entry.incorporated_at);validTimestamp(entry.updated_at);githubReference(entry.contribution?.url);githubReference(entry.review?.url);
  if(!/^[a-zA-Z0-9-]{1,39}$/.test(entry.review.reviewer||'')||!Array.isArray(entry.review.changed_fields)||!entry.review.justification)throw Error('Revisión de aporte incompleta.');
  if(entry.revision!==material.revision||entry.history.length!==entry.revision||entry.history.length>1000||entry.review.justification.length>2000||entry.review.changed_fields.some(x=>typeof x!=='string'||x.length>200))throw Error('Historial o revisión de aporte inconsistente.');
  for(const [i,row]of entry.history.entries()){
   if(row.revision!==i+1||!Array.isArray(row.changed_fields)||!row.justification||row.justification.length>2000)throw Error('Historial de aporte incompleto.');
   validTimestamp(row.date);githubReference(row.source);githubReference(row.review);
   const snapshot=validateUserMaterial(row.proposed);if(snapshot.id!==entry.id||snapshot.revision!==row.revision)throw Error('Snapshot de revisión no válido.');
   if(i===0&&row.previous!==null||i>0&&canonical(row.previous)!==canonical(entry.history[i-1].proposed))throw Error('Cadena de revisiones inconsistente.');
  }
  if(canonical(entry.history.at(-1).proposed)!==canonical(material))throw Error('La versión vigente no coincide con su historial.');
  const name=material.family+':'+material.grade.toLowerCase();if(ids.has(entry.id)||names.has(name))throw Error('Aporte compartido duplicado.');ids.add(entry.id);names.add(name);
  return {...clone(entry),material};
 });
 return {...clone(data),materials};
}
export function sharedRecord(entry){return {...clone(entry.material),catalog_origin:'shared',shared_revision:entry.revision,shared_metadata:{contribution:clone(entry.contribution),review:clone(entry.review),history:clone(entry.history),incorporated_at:entry.incorporated_at,updated_at:entry.updated_at,verification_status:entry.verification_status}};}
export function resolveUserMaterials(shared,locals){
 const approved=validateSharedCatalog(shared).materials,localRecords=locals.map(validateUserMaterial),ids=new Set(),items=[],conflicts=[];
 for(const entry of approved){
  ids.add(entry.id);const local=localRecords.find(x=>x.id===entry.id),published=sharedRecord(entry);
  if(local&&canonical(local)!==canonical(entry.material)){
   conflicts.push({id:entry.id,shared_revision:entry.revision,local_revision:local.revision,shared:clone(published),local:{...clone(local),catalog_origin:'local'},reason:'different_revision_or_content'});
  }
  items.push(published);
 }
 for(const record of localRecords)if(!ids.has(record.id)){
  const named=approved.find(x=>x.material.family===record.family&&x.material.grade.toLowerCase()===record.grade.toLowerCase());
  if(named)conflicts.push({id:record.id,shared_revision:named.revision,local_revision:record.revision,shared:sharedRecord(named),local:{...clone(record),catalog_origin:'local'},reason:'same_name_different_id'});
  else items.push({...clone(record),catalog_origin:'local'});
 }
 return {items,conflicts};
}
export function mergeSharedAndLocal(catalog,shared,locals=listUserMaterials()){
 const resolved=resolveUserMaterials(shared,locals),merged=mergeCustomMaterials(catalog,resolved.items,{maxRecords:2120});
 for(const record of resolved.items){const material=merged.materials.find(x=>x.id===record.id);Object.assign(material,{catalog_origin:record.catalog_origin,...(record.catalog_origin==='shared'?{shared_revision:record.shared_revision,shared_metadata:clone(record.shared_metadata)}:{})});}
 return {...merged,user_material_conflicts:resolved.conflicts,shared_catalog_revision:shared.revision};
}
export const emptySharedCatalog=()=>({schema:SHARED_SCHEMA,revision:1,materials:[],activation:{issue_automation:'pending_default_branch_activation',catalog_delivery:'bundled_reviewed_release_only'}});
