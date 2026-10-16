import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {compareFlow,mvrToMfr,testConditions} from '../src/rheology.js';
const data=JSON.parse(readFileSync(new URL('../src/data/rheology.v1.json',import.meta.url)));
const flow={material_id:'synthetic-test',family:'PP',kind:'MFR',value:12,unit:'g/10 min',temperature_C:230,load_kg:2.16,pressure_MPa:1,standard:'ISO 1133-1',standard_edition:'2022',preconditioning:'dry, protocol synthetic'};
test('varios ensayos por grado mantienen temperatura, carga, norma y evidencia separadas',()=>{
 const rows=data.measurements.filter(m=>m.material_id==='catalog-hdpe-dow-hdpe-lp-8000');assert.ok(rows.some(m=>m.load_kg===21.6));assert.ok(rows.some(m=>m.load_kg===5));
 assert.equal(new Set(data.measurements.map(m=>m.id)).size,data.measurements.length);
 for(const m of data.measurements){assert.ok(data.sources[m.source_id]);assert.ok(['MFR','MVR'].includes(m.kind));assert.equal(m.unit,m.kind==='MFR'?'g/10 min':'cm³/10 min');assert.equal(m.standard_edition,null,'No adoptar una edición actual no declarada en la ficha');}
 assert.ok(!data.measurements.some(m=>m.material_id==='catalog-abs-terluran-gp-35'&&m.kind==='MFR'&&m.value===34));
 assert.ok(data.measurements.some(m=>m.material_id==='catalog-abs-terluran-gp-35'&&m.kind==='MVR'&&m.value===34));
});
test('comparación rechaza cantidades, familias, cargas, temperaturas y métodos incompatibles',()=>{
 assert.equal(compareFlow(flow,{...flow,value:15}).difference,3);
 for(const other of [{...flow,kind:'MVR',unit:'cm³/10 min'},{...flow,load_kg:5},{...flow,temperature_C:190},{...flow,standard:'ASTM D1238'},{...flow,family:'HDPE'},{...flow,standard_edition:'2011'},{...flow,preconditioning:'wet'}])assert.equal(compareFlow(flow,other).status,'incompatible');
 assert.equal(compareFlow(flow,{...flow,load_kg:null}).status,'pending');assert.equal(compareFlow(flow,{...flow,standard:null}).status,'pending');
 const conditional=compareFlow({...flow,standard_edition:null},{...flow,value:15,preconditioning:null});assert.equal(conditional.status,'conditional');assert.equal(conditional.difference,null);
});
test('MVR no se convierte con densidad sólida, de familia, otro grado o condiciones incompletas',()=>{
 const m={...flow,kind:'MVR',unit:'cm³/10 min',value:10};
 const density={material_id:m.material_id,phase:'melt',unit:'g/cm³',value:.75,temperature_C:230,pressure_MPa:1,classification:'official_grade_specific',validated:true,source_id:'synthetic-reference'};
 assert.equal(mvrToMfr(m,density).value,7.5);
 for(const bad of [null,{...density,phase:'solid'},{...density,phase:'bulk'},{...density,classification:'family_reference'},{...density,validated:false},{...density,temperature_C:190},{...density,pressure_MPa:null},{...density,material_id:'other'},{...density,source_id:null}])assert.equal(mvrToMfr(m,bad).value,null);
 assert.equal(mvrToMfr({...m,pressure_MPa:null},density).value,null);
});
test('recomendaciones proceden de aplicaciones documentadas, sin rangos MFR universales',()=>{
 assert.ok(data.recommendations.length>0);for(const r of data.recommendations){assert.equal(r.scope,'grade_specific_application');assert.ok(data.sources[r.source_id]);assert.equal(r.mfr_interval,null);assert.equal(r.mvr_interval,null);assert.ok(!['secado','costos'].includes(r.process_id));}
 assert.deepEqual(testConditions('190 °C / 2,16 kg'),{temperature_C:190,load_kg:2.16});assert.deepEqual(testConditions('ASTM D1238'),{temperature_C:null,load_kg:null});
});
