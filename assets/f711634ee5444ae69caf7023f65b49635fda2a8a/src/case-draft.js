import {modules} from './schema.js';
import {materialSnapshot,restoreMaterial} from './materials.js';
import {machineSnapshot,restoreMachine} from './machines.js';
import {restoreInjectionProfile} from './injection-profile.js';

// Per-tab working drafts are separate from immutable saved calculations.
export const caseDraftKey='ccip-working-tab/1';
const scalar=value=>(typeof value==='string'&&value.length<=5000)||(typeof value==='number'&&Number.isFinite(value));
const plain=value=>value&&typeof value==='object'&&!Array.isArray(value);
function decodeEntry(id,entry){
 const module=modules.find(m=>m.id===id);if(!module||!plain(entry)||!plain(entry.values))return null;
 const values=Object.fromEntries(module.fields.filter(f=>scalar(entry.values[f.key])).map(f=>[f.key,entry.values[f.key]]));
 const origins=Object.fromEntries(Object.keys(values).filter(key=>typeof entry.origins?.[key]==='string'&&entry.origins[key].length<=64).map(key=>[key,entry.origins[key]]));
 const machine=restoreMachine(entry.machine);machine.manufacturer=typeof entry.machine_manufacturer==='string'?entry.machine_manufacturer.slice(0,150):'';
 return {values,origins,material:restoreMaterial(entry.material),machine,filters:{family:typeof entry.filters?.family==='string'?entry.filters.family.slice(0,100):'',manufacturer:typeof entry.filters?.manufacturer==='string'?entry.filters.manufacturer.slice(0,150):''}};
}
export function readCaseDraft(storage){
 try{
  const text=storage.getItem(caseDraftKey);if(!text||text.length>1500000)return null;
  const raw=JSON.parse(text);if(raw.schema!==caseDraftKey||!modules.some(m=>m.id===raw.active)||!['basic','technical','advanced'].includes(raw.level)||!plain(raw.entries))return null;
  const entries=Object.fromEntries(Object.entries(raw.entries).map(([id,entry])=>[id,decodeEntry(id,entry)]).filter(([,entry])=>entry));
  if(!entries[raw.active])return null;
  const editor=plain(raw.editor)?raw.editor:null;
  return {active:raw.active,level:raw.level,entries,profile:restoreInjectionProfile(raw.profile),editor};
 }catch{return null;}
}
export function writeCaseDraft(storage,{active,level,entries,profile,editor}){
 try{
  const encoded={};
  for(const [id,entry] of Object.entries(entries)){
   const module=modules.find(m=>m.id===id);if(!module)continue;
   encoded[id]={values:entry.values,origins:entry.origins,filters:entry.filters,material:materialSnapshot(entry.material,module,entry.values,level),machine:machineSnapshot(entry.machine,entry.values,entry.origins),machine_manufacturer:entry.machine.manufacturer};
  }
  const text=JSON.stringify({schema:caseDraftKey,active,level,entries:encoded,profile,editor});if(text.length>1500000)return false;
  storage.setItem(caseDraftKey,text);return true;
 }catch{return false;}
}
