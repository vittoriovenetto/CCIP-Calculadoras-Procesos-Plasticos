import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {validateMachineCatalog,catalogReadiness,newMachineState,selectMachine,assessMachine,machineSnapshot} from '../src/machines.js';
import {createMaterialState} from '../src/materials.js';
import {filterMachines,highlights,compareMachineRecords,specificationGroup} from '../src/machine-explorer-data.js';
import {prepareMachineReport} from '../src/machine-report.js';
import {permittedMachineImage} from '../src/machine-explorer-view.js';
import {caseDraftKey,readCaseDraft,writeCaseDraft} from '../src/case-draft.js';
const json=path=>JSON.parse(readFileSync(new URL(path,import.meta.url)));
const catalog=validateMachineCatalog(json('../src/data/machines.v1.json'));
const machine=id=>catalog.machines.find(m=>m.id===id);
const moiron=machine('moiron-m2-i'),xh=machine('xihua-xh-430b-25');
const clone=x=>structuredClone(x);

test('Materiales originales, catálogo de máquinas, motores, V1 e históricos conservan bytes de Etapa 7',()=>{
 const fixture=json('./fixtures-ux-integrity.json');
 for(const [path,hash] of Object.entries(fixture.files))assert.equal(createHash('sha256').update(readFileSync(new URL('../'+path,import.meta.url))).digest('hex'),hash,path);
});

test('Biblioteca comparte los 25 registros y conserva veinte identidades documentadas, Moiron y película XH',()=>{
 assert.equal(catalog.machines.length,25);assert.equal(catalogReadiness(catalog).qualified_count,20);
 assert.equal(moiron.process,'inyeccion');assert.equal(xh.process,'pelicula');assert.equal(filterMachines(catalog)[0],catalog.machines[0]);
 const selected=newMachineState();selected.manufacturer='Arburg';selectMachine(selected,catalog,moiron.id,'inyeccion',{},{});assert.equal(selected.manufacturer,'Moiron');
});
test('Buscador admite fabricante/modelo, ID, proceso, tipo, mayúsculas y signos sin cambiar identidades',()=>{
 for(const query of ['MOIRON M2-I','moiron-m2-i','M2I'])assert.ok(filterMachines(catalog,{query}).includes(moiron),query);
 assert.ok(filterMachines(catalog,{query:'PELÍCULA XH430B'}).includes(xh));
 assert.ok(filterMachines(catalog,{query:'servo compacta'}).includes(moiron));assert.equal(moiron.id,'moiron-m2-i');
});
test('Filtros combinados no confunden series con configuraciones concretas ni especificaciones ausentes',()=>{
 const found=filterMachines(catalog,{process:'pelicula',manufacturer:'Xihua',scope:'specific_configuration',documentation:'document_checked',specification:'die_diameter_mm'});
 assert.equal(found.length,2);assert.ok(found.includes(xh));
 assert.equal(filterMachines(catalog,{scope:'series_range'}).length,2);
 assert.equal(filterMachines(catalog,{process:'inyeccion',specification:'die_diameter_mm'}).length,0);
 assert.equal(filterMachines(catalog,{query:'not-a-real-machine'}).length,0);
});
test('Tarjetas limitan sus destacados a tres especificaciones documentadas, sin rellenar huecos',()=>{
 for(const m of catalog.machines){const rows=highlights(m);assert.ok(rows.length<=3);for(const s of rows)assert.deepEqual(s,{key:s.key,...m.specifications[s.key]});}
 assert.equal(highlights(moiron).some(s=>s.key==='shot_volume_cm3'),false);
 assert.equal(specificationGroup('connected_power_kW'),'drive');
});
test('Comparación exige de dos a cuatro equipos distintos y no produce rankings',()=>{
 for(const rows of [[],[moiron],[moiron,moiron],catalog.machines.slice(0,5)])assert.throws(()=>compareMachineRecords(rows));
 const r=compareMachineRecords(catalog.machines.slice(0,4));assert.equal(r.pairs.length,6);assert.equal(r.ranking,null);assert.equal(r.industrial_approval,false);
});
test('Conversión dimensional de cierre tf/kN es explícita; no clasifica una máquina como mejor',()=>{
 const a=clone(moiron),b=clone(moiron);b.id='synthetic-clamp-test';a.specifications={clamp_force_kN:{value:10,unit:'tf',conditions:null}};b.specifications={clamp_force_kN:{value:98.0665,unit:'kN',conditions:null}};
 const row=compareMachineRecords([a,b]).pairs[0].rows[0];assert.equal(row.status,'comparable');assert.ok(Math.abs(row.normalized.first-row.normalized.second)<1e-10);assert.equal(row.normalized.unit,'kN');
});
test('Masa de disparo, volumen de disparo y papeles de potencia permanecen separados',()=>{
 const a=clone(moiron),b=clone(catalog.machines[0]);a.specifications={shot_mass_ABS_g:{value:20,unit:'g',conditions:{material:'ABS'}},motor_installed_kW:{value:2,unit:'kW'}};
 b.specifications={shot_volume_cm3:{value:20,unit:'cm³'},actual_operating_power_kW:{value:2,unit:'kW'}};
 const rows=compareMachineRecords([a,b]).pairs[0].rows;assert.ok(rows.every(row=>row.status==='missing'&&row.normalized===null));
});
test('Procesos diferentes, series, variantes ambiguas e intervalos no se declaran equivalentes',()=>{
 const a=clone(moiron),b=clone(moiron);b.id='synthetic-other-machine';
 for(const [field,value,expected] of [['process','extrusion','different_process'],['scope','series_range','series_reference'],['identity_status','unresolved','variant_identity_pending']]){
  const other={...b,[field]:value};assert.ok(compareMachineRecords([a,other]).pairs[0].rows.every(row=>row.status===expected));
 }
 b.specifications.screw_diameter_mm={range:[16,20],unit:'mm'};
 assert.equal(compareMachineRecords([a,b]).pairs[0].rows.find(row=>row.key==='screw_diameter_mm').status,'range_reference');
});
test('Rendimiento requiere condiciones documentadas compatibles y mantiene el cero documentado',()=>{
 const a=clone(moiron),b=clone(moiron);b.id='synthetic-output-machine';
 a.specifications={output_max_kg_h:{value:0,unit:'kg/h',conditions:null}};b.specifications={output_max_kg_h:{value:10,unit:'kg/h',conditions:null}};
 let row=compareMachineRecords([a,b]).pairs[0].rows[0];assert.equal(row.status,'conditions_required');assert.equal(row.first.value,0);
 a.specifications.output_max_kg_h.conditions={material:'PE'};b.specifications.output_max_kg_h.conditions={material:'PP'};
 assert.equal(compareMachineRecords([a,b]).pairs[0].rows[0].status,'different_conditions');
});
test('Reportes de uno a cuatro equipos conservan fuentes, condiciones, valores y objetos originales',()=>{
 const rows=catalog.machines.slice(0,4),before=clone(rows);
 for(const language of ['es','en']){
  const data=prepareMachineReport(rows,language);assert.equal(data.record.machines.length,4);assert.equal(data.record.comparison.pairs.length,6);
  assert.ok(data.summary.some(row=>row[1]==='D'));assert.ok(data.sources.some(row=>String(row[1]).includes('arburg.com')));
  assert.ok(data.parameters.every(p=>typeof p.unit==='string'));assert.ok(data.observations.length>1);
 }
 assert.deepEqual(rows,before);assert.equal(prepareMachineReport([moiron]).record.comparison,null);
});
test('Fotografías sin permiso o de otra variante no se renderizan; rutas y titular son obligatorios',()=>{
 const good={machine_id:moiron.id,manufacturer:'Moiron',source_type:'manufacturer_product_page',verified_at:'2026-10-17T12:00:00Z',permission:{status:'approved',basis:'Synthetic unit-test permission fixture; never a product photograph'},holder:'Synthetic test holder',alt_es:'Prueba',alt_en:'Test',source_url:'https://example.com/permission',local_path:'./assets/machines/test.webp',sha256:'a'.repeat(64)};
 assert.equal(permittedMachineImage(good,moiron.id),true);
 for(const changes of [{machine_id:'moiron-m2-ii'},{permission:{status:'not_granted'}},{local_path:'https://example.com/picture.jpg'},{local_path:'./assets/machines/../wrong.jpg'},{source_url:'https://secret:secret@example.com/'},{holder:null},{verified_at:'invalid'},{manufacturer:null}])assert.equal(permittedMachineImage({...good,...changes},moiron.id),false);
 const records=json('../src/data/machine-images.v1.json').images;assert.equal(Object.keys(records).length,25);for(const [id,image] of Object.entries(records))assert.equal(permittedMachineImage(image,id),false);
});
test('Borradores de pestaña conservan entradas manuales y selección sin escribir historial ni recalcular',()=>{
 const data=new Map(),storage={getItem:key=>data.get(key)||null,setItem:(key,value)=>{assert.equal(key,caseDraftKey);data.set(key,value);}};
 const values={partMass:'13.125',screwD:'',screwMaxStroke:''},origins={partMass:'manual'},selected=newMachineState();selectMachine(selected,catalog,moiron.id,'inyeccion',values,origins);
 values.screwD='17';origins.screwD='manual';selected.manufacturer='Moiron';
 const entry={values,origins,material:createMaterialState(),machine:selected,filters:{family:'ABS',manufacturer:''}};
 assert.equal(writeCaseDraft(storage,{active:'inyeccion',level:'advanced',entries:{inyeccion:entry},profile:{},editor:{open:true,fields:[]}}),true);
 const saved=readCaseDraft(storage);assert.equal(saved.entries.inyeccion.values.screwD,'17');assert.equal(saved.entries.inyeccion.origins.screwD,'manual');assert.equal(saved.entries.inyeccion.machine.id,moiron.id);assert.equal(saved.entries.inyeccion.machine.manufacturer,'Moiron');assert.equal(saved.editor.open,true);
 assert.equal(data.size,1);assert.equal(JSON.parse(data.get(caseDraftKey)).metrics,undefined);
});
test('Borradores inválidos o almacenamiento bloqueado no impiden el modo manual',()=>{
 for(const raw of ['{bad','[]','null',JSON.stringify({schema:'future',entries:{}}),'x'.repeat(1500001)])assert.equal(readCaseDraft({getItem:()=>raw}),null);
 assert.equal(readCaseDraft({getItem:()=>{throw Error('blocked');}}),null);
 assert.equal(writeCaseDraft({setItem:()=>{throw Error('blocked');}},{active:'inyeccion',level:'basic',entries:{}}),false);
});
test('La selección automática registra referencia documental, sin certificar la configuración física',()=>{
 const s=newMachineState(),v={},o={};selectMachine(s,catalog,moiron.id,'inyeccion',v,o);
 const snapshot=machineSnapshot(s,v,o);assert.equal(snapshot.selection_kind,'documentary_reference');assert.equal(snapshot.physical_configuration_verified,false);
 const assessment=assessMachine(s,'inyeccion',{metrics:[]},v);assert.equal(assessment.reference_selected,true);assert.equal(assessment.configuration_confirmed,false);assert.equal(assessment.physical_configuration_verified,false);assert.equal(assessment.industrial_approval,false);
});
test('Workflow de la rama de revisión valida push/PR sin job, permiso ni comando de publicación',()=>{
 const workflow=readFileSync(new URL('../.github/workflows/validate-web.yml',import.meta.url),'utf8');
 assert.match(workflow,/feature\/ux-bibliotecas-materiales-maquinaria/);assert.match(workflow,/pull_request:/);assert.match(workflow,/browser_machine_explorer\.py/);
 assert.doesNotMatch(workflow,/publish-verified-pages|deploy:pages|publish-pages\.mjs|pages:\s*write|contents:\s*write|deploy-pages/);
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8'),app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
 assert.ok(!html.includes('calculator-page'));assert.ok(!app.includes('calculator-page'));
});
