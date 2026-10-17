import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {calculate} from '../src/engine.js';
import {modules} from '../src/schema.js';
import {calculateInjectionProfile} from '../src/injection-profile.js';
import {prepareDryingCase} from '../src/drying-assessment.js';
import {createMaterialState} from '../src/materials.js';
import {loadHistoryState,storageKey} from '../src/history.js';
import {persistUserMaterials,USER_KEY} from '../src/custom-materials.js';
import {versionPagesAssets,preserveArchivedAssets} from '../scripts/version-pages-assets.mjs';
import {verifyArtifact,preservePublishedArchives,validateReleaseGate,repository} from '../scripts/pages-integrity.mjs';
const fixtures=JSON.parse(readFileSync(new URL('./fixtures-stage7-numerics.json',import.meta.url)));
for(const c of fixtures)test('Etapa 7 referencia Decimal independiente: '+c.name,()=>{
 const result=calculate(c.process,c.inputs,'advanced');assert.equal(result.metrics.length,c.expected.length);
 for(const ref of c.expected){const got=result.metrics.find(m=>m.label===ref.label);assert.equal(got.unit,ref.unit);
  if(ref.value===null)assert.equal(got.value,null);else assert.ok(Math.abs(got.value-ref.value)<=1e-10*Math.max(1,Math.abs(ref.value)),ref.label);
 }
});
for(const module of modules)test('Etapa 7 entradas límite, vacío y tipos: '+module.id,()=>{
 for(const value of ['',null,-1,Infinity,NaN,true,{},[],1e308]){
  const inputs=Object.fromEntries(module.fields.filter(f=>!f.type).map(f=>[f.key,value]));
  for(const level of ['basic','technical','advanced']){
   const result=calculate(module.id,inputs,level);
   assert.ok(result.metrics.length>0);assert.ok(result.metrics.every(m=>m.value===null||Number.isFinite(m.value)));
   if(value===''||value===null||typeof value!=='number'||!Number.isFinite(value)||value<0)assert.ok(result.metrics.every(m=>m.value===null));
  }
 }
});
test('Etapa 7 perfil físico conserva volumen, sin margen ni colchón, coordenadas explícitas',()=>{
 const c=fixtures[0],settings={enabled:true,fractions:[30,50,20],initial_position_mm:250,direction:'decreasing'};
 const r=calculateInjectionProfile(c.inputs,'advanced',settings,{approximate:true});
 assert.equal(r.volume_cm3,70);assert.equal(r.mass_g,56);assert.ok(Math.abs(r.stroke_mm-222.81692032865348)<1e-10);
 assert.deepEqual(r.stages.map(s=>s.volume_cm3),[21,35,14]);
 assert.ok(Math.abs(r.stages.reduce((s,x)=>s+x.stroke_mm,0)-r.stroke_mm)<1e-10);
 assert.ok(Math.abs(r.stages.at(-1).end_position_mm-(250-r.stroke_mm))<1e-10);
 const noOrigin=calculateInjectionProfile(c.inputs,'advanced',{...settings,initial_position_mm:''},{});
 assert.equal(noOrigin.absolute_machine_positions,false);assert.ok(noOrigin.stages.every(x=>x.end_position_mm===null));
 assert.equal(calculateInjectionProfile(c.inputs,'technical',settings,{}),null);
 assert.equal(calculateInjectionProfile(c.inputs,'advanced',{...settings,fractions:[30,50,21]},{}).valid,false);
});
test('Etapa 7 Cp aritmético correcto sigue bloqueado sin evidencia térmica',()=>{
 const c=fixtures.find(x=>x.name==='secado-nominal');const gated=prepareDryingCase(c.inputs,createMaterialState(),'advanced');
 assert.equal(gated.effective.specificHeat,'');assert.equal(gated.effective.bulkDensity,'');
 const result=calculate('secado',gated.effective);assert.equal(result.metrics[0].value,63);assert.equal(result.metrics[1].value,null);assert.equal(result.metrics[2].value,null);
});
test('Etapa 7 migración conserva resultados y entradas desconocidas sin recalcular',()=>{
 const old={module:'inyeccion',level:'basic',date:'2025-02-01T01:02:03Z',inputs:{partMass:'013.000',future:'keep'},metrics:[{label:'Historical',value:123.456,unit:'g'}],unknown:{keep:true}};
 let raw=JSON.stringify([old,old,{futureOnly:true}]);const storage={getItem:k=>k===storageKey?raw:null,setItem:(k,v)=>{assert.equal(k,storageKey);raw=v;}};
 const items=loadHistoryState(storage).items;assert.equal(items.length,2);assert.notEqual(items[0].id,items[1].id);
 for(const item of items){assert.deepEqual(item.metrics,old.metrics);assert.deepEqual(item.inputs,old.inputs);assert.deepEqual(item.unknown,old.unknown);}
 assert.deepEqual(JSON.parse(raw)[2],{futureOnly:true});const before=raw;loadHistoryState(storage);assert.equal(raw,before);
});
test('Etapa 7 publicación rechaza archivo histórico perdido, alterado o artefacto sensible',()=>{
 const dir=mkdtempSync(join(tmpdir(),'ccip-stage7-')),sha='a'.repeat(40);
 try{
  mkdirSync(join(dir,'src'));writeFileSync(join(dir,'src/app.js'),'export const fixture=true;');
  for(const p of ['index.html','formulas.html'])writeFileSync(join(dir,p),'<script src="./src/app.js"></script>');
  writeFileSync(join(dir,'deployment.json'),JSON.stringify({repository,source_commit:sha}));versionPagesAssets(dir,sha);
  const good=verifyArtifact(dir,sha);assert.ok(good.tree_sha256);assert.throws(()=>verifyArtifact(dir,'b'.repeat(40)),/mismatch/);
  assert.throws(()=>preservePublishedArchives({'versions/v1/index.html':'old'},good.files),/lost or modified/);
  assert.doesNotThrow(()=>preservePublishedArchives({'versions/v1/index.html':'old'},{'versions/v1/index.html':'old'}));
  writeFileSync(join(dir,'src','.env'),'synthetic_fixture');assert.throws(()=>verifyArtifact(dir,sha),/Sensitive/);
  rmSync(join(dir,'src','.env'));writeFileSync(join(dir,'src/app.js'),'changed');assert.throws(()=>verifyArtifact(dir,sha),/dependency mismatch/);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
test('Etapa 7 guardado personal no sobrescribe almacenamiento corrupto, futuro o modificado',()=>{
 const before=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
 try{
  for(const initial of ['{broken',JSON.stringify({schema:'future'}),JSON.stringify([{id:'unknown'}])]){
   let raw=initial;Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:()=>raw,setItem:(k,v)=>{assert.equal(k,USER_KEY);raw=v;}}});
   assert.throws(()=>persistUserMaterials([]),/No se sobrescriben/);assert.equal(raw,initial);
  }
  let reads=0,called=false;Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:()=>++reads===1?'[]':'["changed"]',setItem:()=>{called=true;}}});
  assert.throws(()=>persistUserMaterials([]),/No se pudieron guardar/);assert.equal(called,false);
 }finally{if(before)Object.defineProperty(globalThis,'localStorage',before);else delete globalThis.localStorage;}
});
test('Etapa 7 assets históricos permiten HTML antiguo en caché sin mezclar ni sobrescribir bytes',()=>{
 const dir=mkdtempSync(join(tmpdir(),'ccip-old-assets-')),old='b'.repeat(40),source=join(dir,'versions','previous','assets',old,'src');
 try{
  mkdirSync(source,{recursive:true});writeFileSync(join(source,'app.js'),'immutable older version');preserveArchivedAssets(dir);
  assert.equal(readFileSync(join(dir,'assets',old,'src/app.js'),'utf8'),'immutable older version');
  preserveArchivedAssets(dir);writeFileSync(join(dir,'assets',old,'src/app.js'),'collision');assert.throws(()=>preserveArchivedAssets(dir),/collision/);
  assert.throws(()=>preservePublishedArchives({['assets/'+old+'/src/app.js']:'hash'},{}),/lost or modified/);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
test('Etapa 7 puerta de publicación exige evidencia completa del commit exacto',()=>{
 const source='a'.repeat(40),previous='b'.repeat(40),tree='c'.repeat(64);
 const keys=['seven_processes','three_levels','material_integrity','machine_inventory','independent_numerics','no_unresolved_P0_P1','exact_commit_ci','real_exports','history_migration','bilingual','responsive','historical_integrity','reproducible_artifact','security','rollback','pages_configuration'];
 const gate={decision:'GO',source_commit:source,previous_gh_pages_commit:previous,artifact_tree_sha256:tree,requirements:Object.fromEntries(keys.map(k=>[k,true])),ci:{head_sha:source,run_id:123,conclusion:'success',jobs:[{name:'unit',conclusion:'success'},{name:'browser',conclusion:'success'}]}};
 assert.equal(validateReleaseGate(gate,source,tree,previous),true);
 for(const key of keys)assert.throws(()=>validateReleaseGate({...gate,requirements:{...gate.requirements,[key]:false}},source,tree,previous),/NO-GO/);
 assert.throws(()=>validateReleaseGate(gate,previous,tree,previous),/NO-GO/);
 assert.throws(()=>validateReleaseGate({...gate,ci:{...gate.ci,conclusion:'failure'}},source,tree,previous),/NO-GO/);
});
