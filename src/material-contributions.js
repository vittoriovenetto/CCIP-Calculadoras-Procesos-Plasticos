// Public GitHub web flow. No token, secret, implicit write or local-success claim.
import {validateUserMaterial} from './custom-materials.js';
import {REPOSITORY,canonical,githubReference} from './shared-materials.js';
export const CONTRIBUTION_SCHEMA='ccip-material-contribution/1';
export const CONTRIBUTION_MARKER='<!-- ccip-material-contribution/1 -->';
export const CONTRIBUTION_KEY='ccip-material-proposals-v1';
export const MAX_PROPOSAL_BYTES=45000;
const bytes=s=>new TextEncoder().encode(s).length;
export async function sha256(text){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))].map(x=>x.toString(16).padStart(2,'0')).join('');}
export function validateContribution(payload,shared){
 if(!payload||payload.schema!==CONTRIBUTION_SCHEMA||!['create','update'].includes(payload.action)||!/^submission-[a-z0-9-]{8,80}$/.test(payload.submission_id||''))throw Error('Propuesta de material no válida.');
 if(bytes(JSON.stringify(payload))>MAX_PROPOSAL_BYTES)throw Error('Propuesta demasiado grande.');
 const allowed=['schema','submission_id','action','base_revision','prepared_at','justification','material'];
 if(Object.keys(payload).some(key=>!allowed.includes(key)))throw Error('Campos de propuesta desconocidos.');
 const inspect=(x,depth=0)=>{if(depth>16)throw Error('JSON demasiado profundo.');if(x&&typeof x==='object'){for(const [key,value]of Object.entries(x)){if(['__proto__','prototype','constructor'].includes(key))throw Error('Clave JSON no permitida.');inspect(value,depth+1);}}};inspect(payload);
 const raw=payload.material,material=validateUserMaterial(raw);
 if(raw.record_status!=='user_entered_unverified'||raw.source_id!==material.source_id||raw.category!=='Agregado por usuarios'||Object.entries(raw.properties).some(([key,p])=>p&&(p.status!=='user_entered'||p.source_id!==material.properties[key]?.source_id)))throw Error('La propuesta no puede suplantar una ficha comercial ni una fuente verificada.');
 if(!material.user_details.provenance||!material.user_source.description||material.user_details.verification_declaration!==true)throw Error('Completa identidad, procedencia, fuente y declaración de aporte no verificado.');
 if(typeof payload.justification!=='string'||!payload.justification.trim()||payload.justification.length>2000)throw Error('Indica la justificación de la propuesta.');
 if(!Number.isFinite(Date.parse(payload.prepared_at||'')))throw Error('Fecha de propuesta no válida.');
 if(payload.action==='update'&&(!Number.isSafeInteger(payload.base_revision)||payload.base_revision<1))throw Error('La actualización requiere una revisión base.');
 if(payload.action==='create'&&payload.base_revision!==null)throw Error('Un aporte nuevo no tiene revisión compartida base.');
 if(shared){
  const previous=shared.materials.find(x=>x.id===material.id);
  if(payload.action==='create'&&(previous||shared.materials.some(x=>x.material.family===material.family&&x.material.grade.toLowerCase()===material.grade.toLowerCase())))throw Error('Aporte compartido duplicado.');
  if(payload.action==='update'&&(!previous||previous.revision!==payload.base_revision))throw Error('Conflicto de revisión compartida.');
 }
 return {...payload,material};
}
export async function prepareContribution(record,{action='create',base_revision=null,justification='',shared}={}){
 const material=validateUserMaterial(record),payload={schema:CONTRIBUTION_SCHEMA,submission_id:'submission-'+crypto.randomUUID(),action,base_revision,prepared_at:new Date().toISOString(),justification,material};
 validateContribution(payload,shared);return {payload,digest:await sha256(canonical(payload)),state:'prepared',remote_confirmed:false};
}
export function contributionBody(prepared){return `${CONTRIBUTION_MARKER}\nPropuesta pública de material CCIP; pendiente de revisión. La incorporación no certifica propiedades industriales.\n\n\`\`\`json\n${JSON.stringify(prepared.payload)}\n\`\`\`\n\nSHA-256: ${prepared.digest}\n`;}
export function parseContributionBody(body){
 if(typeof body!=='string'||bytes(body)>60000||!body.startsWith(CONTRIBUTION_MARKER))throw Error('El Issue no contiene una propuesta CCIP válida.');
 const match=body.match(/```json\n([^]*?)\n```/);if(!match)throw Error('Falta el JSON estructurado de la propuesta.');
 let data;try{data=JSON.parse(match[1]);}catch{throw Error('JSON de propuesta no válido.');}
 return validateContribution(data);
}
export function githubIssueLink(prepared){
 const body=contributionBody(prepared),title='[CCIP material] '+prepared.payload.material.id;
 const full=`https://github.com/${REPOSITORY}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
 return {url:full.length<=7500?full:`https://github.com/${REPOSITORY}/issues/new?title=${encodeURIComponent(title)}`,manual_paste:full.length>7500,body,remote_confirmed:false};
}
export async function confirmContribution(prepared,rawUrl,fetcher=fetch){
 const ref=githubReference(rawUrl),path=ref.kind==='issue'?'issues':'pulls';
 const response=await fetcher(`https://api.github.com/repos/${REPOSITORY}/${path}/${ref.number}`,{headers:{Accept:'application/vnd.github+json'},credentials:'omit'});
 if(!response.ok)throw Error(response.status===403||response.status===429?'GitHub limita las consultas o requiere permisos. La propuesta no está confirmada.':'No se pudo confirmar la propuesta en GitHub.');
 const data=await response.json();if(data.number!==ref.number||data.html_url!==ref.url||data.repository_url&&data.repository_url!==`https://api.github.com/repos/${REPOSITORY}`)throw Error('La respuesta de GitHub no corresponde a esta contribución.');
 const payload=parseContributionBody(data.body),digest=await sha256(canonical(payload));
 if(payload.submission_id!==prepared.payload.submission_id||digest!==prepared.digest)throw Error('El contenido de GitHub no coincide con la propuesta preparada.');
 const correction=(data.labels||[]).some(x=>x.name==='ccip-requires-corrections'),rejected=(data.labels||[]).some(x=>x.name==='ccip-rejected');
 return {...prepared,state:rejected?'rejected':correction?'requires_corrections':payload.action==='update'?'update_pending':'pending_review',remote_confirmed:true,reference:ref,confirmed_at:new Date().toISOString(),remote_state:data.state};
}
export function listContributions(){try{const raw=localStorage.getItem(CONTRIBUTION_KEY)||'[]';if(raw.length>2000000)return [];const rows=JSON.parse(raw);return Array.isArray(rows)?rows.filter(x=>{try{validateContribution(x.payload);if(!/^[a-f0-9]{64}$/.test(x.digest)||!['prepared','pending_review','update_pending','requires_corrections','rejected'].includes(x.state))return false;if(x.reference)githubReference(x.reference.url);return true;}catch{return false;}}).slice(0,100):[];}catch{return [];}}
export function persistContribution(prepared){const rows=listContributions().filter(x=>x.payload.submission_id!==prepared.payload.submission_id);rows.unshift(prepared);if(new TextEncoder().encode(JSON.stringify(rows)).length>2000000)throw Error('No hay espacio para guardar el respaldo de propuestas.');localStorage.setItem(CONTRIBUTION_KEY,JSON.stringify(rows.slice(0,100)));}
