import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {modules} from '../src/schema.js';
import {calculate} from '../src/engine.js';
import {createMaterialState,selectMaterial,applyMaterial,clearAutomatic,markManual,materialSnapshot,restoreMaterial} from '../src/materials.js';
import {enableLeanMaterial,materialCatalogFor,hasDryingGuideline} from '../src/lean-materials.js';
import {calculateWithMeltDensity} from '../src/injection-density.js';
import {displayMetrics,inputIssues} from '../src/results-view.js';
import {makeCustomMaterial,mergeCustomMaterials} from '../src/custom-materials.js';
import {renderAudit} from '../src/materials-audit-view.js';
const data=JSON.parse(fs.readFileSync(new URL('../src/data/materials.v1.3.json',import.meta.url)));
const module=id=>modules.find(m=>m.id===id);
const input=()=>({method:'mass',partMass:30,cavities:2,runnerMass:5,screwD:20,screwMaxStroke:400});
function chosen(id){const state=enableLeanMaterial(createMaterialState()),values=input();selectMaterial(data,state,values,id);return{state,values};}
for(const [family,value] of [['HDPE',.73],['LDPE',.76],['LLDPE',.70],['PP',.75],['PET',1.10],['ABS',.97],['PA6',.96],['PC',1.02]])test(`Lean ${family}: referencia automática, editable, sin modificar ficha y con fuente congelada`,()=>{
 const {state,values}=chosen('generic-'+family.toLowerCase());const before=structuredClone(state.grade_snapshot);
 assert.equal(state.context.familyMeltReferenceAccepted,false);applyMaterial(state,module('inyeccion'),values,'technical');assert.equal(values.meltDensity,value);
 const result=calculateWithMeltDensity('inyeccion',values,'technical',state);assert.equal(result.density_assessment.reference_application,'automatic_family_reference');assert.equal(result.metrics[2].density_estimate,true);
 assert.deepEqual(state.grade_snapshot,before);assert.equal(state.grade_snapshot.properties.melt_density,null);
 const restored=restoreMaterial(materialSnapshot(state,module('inyeccion'),values,'technical'));
 assert.deepEqual(calculateWithMeltDensity('inyeccion',values,'technical',restored),result);
});
test('Cambio de familia actualiza referencia; una anulación manual explícita se conserva',()=>{
 const {state,values}=chosen('generic-hdpe');applyMaterial(state,module('inyeccion'),values,'advanced');selectMaterial(data,state,values,'generic-pc');applyMaterial(state,module('inyeccion'),values,'advanced');assert.equal(values.meltDensity,1.02);
 values.meltDensity=.9;markManual(state,'inyeccion','meltDensity',.9);selectMaterial(data,state,values,'generic-pp');applyMaterial(state,module('inyeccion'),values,'advanced');assert.equal(values.meltDensity,.9);assert.equal(state.provenance.meltDensity.origin,'user_override');
});
test('Modo verificado no se reabre al cambiar grado y básico no usa rho oculta',()=>{
 const {state,values}=chosen('generic-hdpe');state.context.meltDensityPolicy='verified_only';applyMaterial(state,module('inyeccion'),values,'advanced');assert.ok(!values.meltDensity);
 selectMaterial(data,state,values,'generic-pp');applyMaterial(state,module('inyeccion'),values,'advanced');assert.ok(!values.meltDensity);
 state.context.meltDensityPolicy='reference_allowed';applyMaterial(state,module('inyeccion'),values,'advanced');const out=calculateWithMeltDensity('inyeccion',values,'basic',state);assert.equal(out.metrics[1].value,65);assert.equal(out.metrics[2].value,null);
});
test('Snapshot histórico anterior conserva la política de aceptación explícita',()=>{
 const legacy=createMaterialState(),values=input();selectMaterial(data,legacy,values,'generic-hdpe');const saved=materialSnapshot(legacy,module('inyeccion'),values,'technical');delete saved.context.leanInterface;delete saved.context.familyMeltReferenceMode;
 const restored=restoreMaterial(saved);applyMaterial(restored,module('inyeccion'),values,'technical');assert.ok(!values.meltDensity);assert.equal(restored.context.familyMeltReferenceMode,'explicit');
});
test('PVC sin compuesto confirmado y PA6 fuera de 250 °C no reciben referencia',()=>{
 const {state,values}=chosen('generic-pvc');applyMaterial(state,module('inyeccion'),values,'technical');assert.ok(!values.meltDensity);
 selectMaterial(data,state,values,'generic-pa6');state.context.pvtTemperatureC=260;applyMaterial(state,module('inyeccion'),values,'technical');assert.ok(!values.meltDensity);
});
test('Secado: nueve grados completos; filtro local no modifica el catálogo ni otros procesos',()=>{
 const before=JSON.stringify(data),filtered=materialCatalogFor(data,'secado');assert.equal(filtered.materials.length,9);assert.ok(filtered.materials.every(m=>hasDryingGuideline(m,data.sources)));
 assert.ok(!filtered.materials.some(m=>m.family==='HDPE'));assert.strictEqual(materialCatalogFor(data,'inyeccion'),data);assert.equal(JSON.stringify(data),before);
});
test('Secado: tiempo fijo y temperatura se precargan como recomendaciones, sin Cp inferido',()=>{
 const {state,values}=chosen('basf-ultramid-b3s-r03');applyMaterial(state,module('secado'),values,'advanced');assert.equal(values.residence,4);assert.equal(values.targetT,80);assert.ok(!values.specificHeat);assert.ok(!values.bulkDensity);
 assert.equal(state.provenance.residence.property_key,'drying_time');assert.equal(state.context.dryingCompatible,false);
});
test('Secado Lean: se propone extremo superior de rango, y la elección explícita conserva evidencia',()=>{
 const {state,values}=chosen('covestro-makrolon-2405');applyMaterial(state,module('secado'),values,'advanced');assert.equal(values.residence,3);assert.equal(values.targetT,120);
 assert.equal(state.provenance.residence.origin,'manufacturer_range_upper');
 state.context.dryingTime=2.5;clearAutomatic(state,values);applyMaterial(state,module('secado'),values,'advanced');assert.equal(values.residence,2.5);
 assert.equal(state.provenance.residence.origin,'range_selection');assert.deepEqual(state.provenance.residence.reference.range,[2,3]);
});
test('Secado: material propio completo con fuente sí; incompleto, sin fuente o unidad incompatible no',()=>{
 const own=makeCustomMaterial({family:'PA6',grade:'Caso sintético',drying_time:3,drying_temperature:80,source:'Protocolo sintético para pruebas'});
 const merged=mergeCustomMaterials(data,[own]);assert.ok(materialCatalogFor(merged,'secado').materials.some(m=>m.id===own.id));
 for(const alter of [m=>m.properties.drying_time=null,m=>m.properties.drying_temperature=null,m=>m.properties.drying_time.evidence.description='',m=>m.properties.drying_temperature.unit='K']){
  const m=structuredClone(own);alter(m);assert.equal(hasDryingGuideline(m,merged.sources),false);
 }
});
for(const family of ['HDPE','PET','PA6','PC'])test(`pVT ${family}: se oculta el panel sin gráfica utilizable del grado exacto, datos intactos`,()=>{
 const grade=data.materials.find(m=>m.family===family&&m.record_status!=='generic_unverified');const{state}=chosen(grade.id),before=structuredClone(state.grade_snapshot);
 assert.ok(!renderAudit(state,'advanced').includes('pvt-section'));assert.deepEqual(state.grade_snapshot,before);
});
test('pVT ABS: gráfica y fuente visibles, muestra no calibrada nunca genera rho',()=>{
 const {state}=chosen('ineos-styrolution-terluran-gp-22');const html=renderAudit(state,'advanced');assert.equal((html.match(/<circle /g)||[]).length,24);assert.ok(html.includes('pvt-section'));assert.equal(state.references_snapshot.pvt_sample.eligible_for_melt_density_autofill,false);
 state.references_snapshot.pvt_sample.source_ref='wrong';assert.ok(!renderAudit(state,'advanced').includes('pvt-section'));
});
test('Filtro visual conserva cero, descarta ausentes/no finitos y no muta salida técnica',()=>{
 const result={metrics:[{value:0},{value:null},{value:Infinity},{value:-2},{value:'4'}],warnings:['no tocar'],notes:['no tocar']},before=structuredClone(result);
 assert.deepEqual(displayMetrics(result).map(m=>m.value),[0,-2]);assert.deepEqual(result,before);
});
for(const [id,values,wanted] of [['inyeccion',{method:'mass',partMass:-1,cavities:1},'partMass'],['extrusion',{shape:'tube',outerD:10,innerD:20},'innerD'],['secado',{throughput:50,residence:2,startT:100,targetT:80,specificHeat:2},'targetT'],['costos',{cycleSec:30,cavities:2,partMass:30,scrapPct:100},'scrapPct']])test(`${id}: error crítico queda asociado al campo aun si se oculta una métrica`,()=>{
 const result=calculate(id,values,'advanced');assert.ok(inputIssues(id,values,'advanced',result).some(x=>x.field===wanted));
});

test('Temperatura de secado en rango: no se elige mínimo, máximo ni promedio automáticamente',()=>{
 const {state,values}=chosen('basf-ultramid-b3s-r03');state.grade_snapshot.properties.drying_temperature={...state.grade_snapshot.properties.drying_temperature,value:null,range:[70,90]};
 applyMaterial(state,module('secado'),values,'advanced');assert.ok(!values.targetT);
 state.context.dryingTemperature='80';applyMaterial(state,module('secado'),values,'advanced');assert.equal(values.targetT,80);assert.deepEqual(state.provenance.targetT.reference.range,[70,90]);
});
