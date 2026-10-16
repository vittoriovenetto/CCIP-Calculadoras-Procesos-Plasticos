import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {modules} from '../src/schema.js';
import {calculate} from '../src/engine.js';
import {createMaterialState, selectMaterial, applyMaterial, materialSnapshot, restoreMaterial} from '../src/materials.js';
import {enableLeanMaterial, materialCatalogFor} from '../src/lean-materials.js';
import {prepareDryingCase} from '../src/drying-assessment.js';
const catalog=JSON.parse(readFileSync(new URL('../src/data/materials.v1.3.json',import.meta.url),'utf8'));
const dry=modules.find(m=>m.id==='secado');
const props=()=>Object.fromEntries(dry.fields.map(f=>[f.key,f.default??'']));
const selected=id=>{const state=enableLeanMaterial(createMaterialState()),v=props();selectMaterial(catalog,state,v,id);return {state,v};};
test('Secado: caudal vacío, temperatura inicial de 25 °C, sin Cp ni máquinas inventados',()=>{
 const v=props();assert.equal(v.throughput,'');assert.equal(v.startT,25);assert.equal(v.residence,'');assert.equal(v.specificHeat,'');
 assert.equal(calculate('secado',v).metrics[0].value,null);
});
test('Secado: nueve grados elegibles sin expandir a PET/PP/PE ni reciclados',()=>{
 const filtered=materialCatalogFor(catalog,'secado');assert.equal(filtered.materials.length,9);
 assert.ok(filtered.materials.every(x=>x.properties.drying_time&&x.properties.drying_temperature));
});
test('Secado: rango temporal propone extremo superior, conserva origen y snapshot',()=>{
 const {state,v}=selected('covestro-makrolon-2405');applyMaterial(state,dry,v,'advanced');
 assert.equal(v.residence,3);assert.equal(v.targetT,120);
 assert.equal(state.provenance.residence.origin,'manufacturer_range_upper');
 assert.deepEqual(state.provenance.residence.reference.range,[2,3]);
 const copy=restoreMaterial(materialSnapshot(state,dry,v,'advanced'));
 assert.equal(copy.provenance.residence.origin,'manufacturer_range_upper');
 assert.equal(calculate('secado',{...v,throughput:50}).metrics[0].value,150);
});
test('Secado: tiempo fijo y densidad aparente por forma confirmada; sin Cp inferido',()=>{
 const {state,v}=selected('basf-ultramid-b3s-r03');state.context.physicalForm='pellets';state.context.bulkCompatible=true;
 applyMaterial(state,dry,v,'advanced');assert.equal(v.residence,4);assert.equal(v.targetT,80);assert.equal(v.bulkDensity,0.7);
 assert.equal(v.specificHeat,'');assert.equal(calculate('secado',{...v,throughput:50}).metrics[2].value,null);
});
test('Cp manual sin fase/rango/fuente no habilita potencia; con evidencia sí',()=>{
 const {state,v}=selected('basf-ultramid-b3s-r03');applyMaterial(state,dry,v,'advanced');
 const inputs={...v,throughput:'50',startT:'25',targetT:'80',specificHeat:'2'};
 const pending=prepareDryingCase(inputs,state,'advanced',{startT:'operating_assumption'});
 assert.equal(pending.effective.specificHeat,'');assert.equal(pending.assessment.cp_valid_for_sensible_estimate,false);
 assert.ok(pending.warnings.some(w=>w.includes('fase sólida')));
 state.context.cpPhase='solid';state.context.cpMinC='20';state.context.cpMaxC='90';state.context.specificHeatSource='Medición DSC; ensayo local y fecha';
 const ready=prepareDryingCase(inputs,state,'advanced',{startT:'operating_assumption'});
 assert.equal(ready.effective.specificHeat,'2');assert.equal(ready.assessment.cp_valid_for_sensible_estimate,true);
 assert.ok(Math.abs(calculate('secado',ready.effective).metrics[2].value-55/36)<1e-9);
 assert.deepEqual(inputs,{...v,throughput:'50',startT:'25',targetT:'80',specificHeat:'2'});
});
test('Secado: rango Cp incompleto o temperatura fuera impiden extrapolación',()=>{
 const state=createMaterialState();Object.assign(state.context,{cpPhase:'solid',cpMinC:'35',cpMaxC:'70',specificHeatSource:'Ensayo local'});
 const input={throughput:50,residence:3,startT:25,targetT:80,specificHeat:2};
 const r=prepareDryingCase(input,state,'advanced',{});assert.equal(r.effective.specificHeat,'');assert.equal(r.assessment.cp_valid_for_sensible_estimate,false);
 assert.equal(calculate('secado',{...input,startT:80,targetT:25}).metrics[2].value,null);
});
