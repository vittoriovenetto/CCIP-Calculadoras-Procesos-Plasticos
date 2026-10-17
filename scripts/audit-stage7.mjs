// Reproducible identity, provenance and integrity checks; not scientific certification.
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {validateLibrary} from '../src/materials.js';
import {validateResearch} from '../src/research-data.js';
import {hasDryingGuideline} from '../src/lean-materials.js';
import {validateMachineCatalog,catalogReadiness} from '../src/machines.js';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const base=read('docs/etapa-7/integridad-base.json'),failures=[];
const require=(ok,message)=>{if(!ok)failures.push(message);};
for(const [path,hash] of Object.entries(base.files)){
 const url=new URL('../'+path,import.meta.url);
 require(existsSync(url)&&createHash('sha256').update(readFileSync(url)).digest('hex')===hash,'Protected file differs: '+path);
}
const library=validateLibrary(read('src/data/materials.v1.3.json')),research=validateResearch(read('src/data/material-research.v1.json'),library);
const ids=library.materials.map(m=>m.id),generic=library.materials.filter(m=>m.record_status==='generic_unverified');
require(ids.length===73&&new Set(ids).size===73&&JSON.stringify([...ids].sort())===JSON.stringify(base.material_ids),'Original material identities differ');
require(generic.length===9,'Nine generic profiles required');
const enriched=Object.values(research.records).filter(r=>r.facts.length).length;
require(enriched===47,'Research enrichment inventory changed');
const missing=library.materials.filter(m=>m.record_status!=='generic_unverified'&&!research.records[m.id].facts.length).map(m=>m.id);
require(missing.length===17,'Seventeen commercial grades without new numeric enrichment must remain identified');
const dry=library.materials.filter(m=>hasDryingGuideline(m,library.sources));require(dry.length===9,'Drying guidance inventory differs');
const recycle=read('src/data/recycling.v1.json');require(recycle.experimental_formulations.length===15,'Fifteen experimental formulations required');
for(const f of recycle.experimental_formulations)require(!ids.includes(f.id),'Experimental formulation impersonates a grade');
const flow=read('src/data/rheology.v1.json'),gp=flow.measurements.filter(m=>m.material_id==='catalog-abs-terluran-gp-35'&&m.value===34&&m.temperature_C===220&&m.load_kg===10);
require(gp.some(m=>m.kind==='MFR'&&m.unit==='g/10 min'&&m.standard==='ASTM D1238')&&gp.some(m=>m.kind==='MVR'&&m.unit==='cm³/10 min'&&m.standard==='ISO 1133'),'Independent GP-35 regional measurements must remain separate');
const machines=validateMachineCatalog(read('src/data/machines.v1.json')),audit=catalogReadiness(machines);
require(machines.machines.length===25&&audit.qualified_count===20&&audit.complete,'25 records / 20 qualified machines required');
const archive=read('versions/antes-etapa-7-2026-10-17.json');
for(const [p,hash] of Object.entries(archive.files))require(createHash('sha256').update(readFileSync(new URL('../versions/antes-etapa-7-2026-10-17/'+p,import.meta.url))).digest('hex')===hash,'Prior published file differs: '+p);
require(createHash('sha256').update(readFileSync(new URL('../'+archive.zip,import.meta.url))).digest('hex')===archive.zip_sha256,'Prior published ZIP differs');
const report={schema:'ccip-stage7-audit/1',base_commit:base.source_commit,protected_files:Object.keys(base.files).length,materials:{original:ids.length,commercial:64,generic:generic.length,new_numeric_evidence:enriched,commercial_without_new_numeric_evidence:missing,fully_scientifically_verified:false,drying_guidelines:dry.map(m=>m.id)},experimental_formulations:recycle.experimental_formulations.length,machines:{records:25,...audit},prior_published_archive:{files:Object.keys(archive.files).length,gh_pages_commit:archive.gh_pages_commit,source_commit:archive.source_commit},failures};
if(process.argv.includes('--write'))writeFileSync(new URL('../docs/etapa-7/pruebas/integridad.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));if(failures.length)process.exitCode=1;
