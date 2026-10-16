import test from 'node:test';
import assert from 'node:assert/strict';
import {makeFormulation,formulationDensity,ratioPresets,unsupportedMixtureProperty} from '../src/recycled.js';
const virgin={id:'synthetic-virgin',family:'HDPE',manufacturer:'Synthetic fixture',grade:'Not a commercial material'};
const input={basis:'mass',virgin_percent:80,recycled_percent:20,origin:'PCR',recycled_id:'synthetic-recycled',recycled_name:'Synthetic batch',recycled_family:'HDPE',model_accepted:true,density_strategy:'ideal',density_phase:'melt',component_densities:{virgin:{value:.75,phase:'melt',unit:'g/cm³',temperature_C:200,pressure_MPa:5,source:'Synthetic assay V',material_id:virgin.id,confirmed:true},recycled:{value:.80,phase:'melt',unit:'g/cm³',temperature_C:200,pressure_MPa:5,source:'Synthetic assay R',material_id:'synthetic-recycled',confirmed:true}}};
test('proporciones V/R por masa: once predefinidas, personalizadas y sin duplicados equivalentes',()=>{
 assert.equal(ratioPresets.length,11);assert.deepEqual(ratioPresets[0],[100,0]);assert.deepEqual(ratioPresets.at(-1),[0,100]);
 for(const [v,r] of ratioPresets){const recipe=makeFormulation({...input,virgin_percent:v,recycled_percent:r},virgin);assert.ok(recipe.valid);assert.equal(recipe.virgin_fraction+recipe.recycled_fraction,1);}
 const a=makeFormulation(input,virgin),b=makeFormulation({...input,virgin_percent:'80.0',recycled_percent:'20.00'},virgin);assert.equal(a.id,b.id);assert.equal(a.canonical_key,b.canonical_key);
 assert.notEqual(a.id,makeFormulation({...input,recycled_id:'different-batch'},virgin).id);
 for(const bad of [{virgin_percent:80,recycled_percent:30},{virgin_percent:'',recycled_percent:100},{virgin_percent:-1,recycled_percent:101},{basis:'volume'},{cycles:-1},{cycles:1.5},{origin:'made up'}])assert.equal(makeFormulation({...input,...bad},virgin).valid,false);
 assert.equal(makeFormulation({...input,cycles:0},virgin).reprocessing_cycles,0);assert.equal(makeFormulation(input,virgin).reprocessing_cycles,null);
});
test('densidad ideal usa volúmenes específicos aditivos, nunca promedio aritmético de densidades',()=>{
 const recipe=makeFormulation(input,virgin),result=formulationDensity(recipe);
 assert.ok(Math.abs(result.value-1/(.8/.75+.2/.8))<1e-12);assert.notEqual(result.value,.8*.75+.2*.8);assert.equal(result.approximate,true);assert.equal(result.classification,'documented_model_estimate');assert.equal(result.temperature_C,200);assert.equal(result.component_values.length,2);
});
test('fase, evidencia, identidad, familia y condiciones deben ser compatibles',()=>{
 for(const modify of [x=>x.model_accepted=false,x=>x.recycled_family='PP',x=>x.component_densities.recycled.phase='solid',x=>x.component_densities.recycled.value='',x=>x.component_densities.recycled.value=0,x=>x.component_densities.recycled.value=-.8,x=>x.component_densities.recycled.temperature_C=210,x=>x.component_densities.recycled.pressure_MPa=null,x=>x.component_densities.recycled.source='',x=>x.component_densities.recycled.confirmed=false,x=>x.component_densities.recycled.material_id='other']){
  const value=structuredClone(input);modify(value);assert.equal(formulationDensity(makeFormulation(value,virgin)).value,null);
 }
 const cold=structuredClone(input);cold.density_phase='solid';for(const d of Object.values(cold.component_densities)){d.phase='solid';d.temperature_C=-20;d.pressure_MPa=0;}assert.ok(formulationDensity(makeFormulation(cold,virgin)).value>0);
});
test('extremos 100/0 y 0/100 no exigen densidad de un componente ausente',()=>{
 const a=makeFormulation({...input,virgin_percent:100,recycled_percent:0,component_densities:{virgin:input.component_densities.virgin},model_accepted:false},virgin);assert.equal(formulationDensity(a).value,.75);assert.equal(formulationDensity(a).approximate,false);
 const b=makeFormulation({...input,virgin_percent:0,recycled_percent:100,component_densities:{recycled:input.component_densities.recycled},model_accepted:false},virgin);assert.equal(formulationDensity(b).value,.8);
});
test('dato medido de formulación sustituye el modelo conservando identidad y condición',()=>{
 const recipe=makeFormulation(input,virgin);recipe.density_strategy='measured';recipe.measured_density={...input.component_densities.recycled,value:.77,material_id:recipe.id};assert.equal(formulationDensity(recipe).value,.77);assert.equal(formulationDensity(recipe).model_id,null);assert.equal(formulationDensity(recipe).approximate,false);
 recipe.measured_density.material_id='other';assert.equal(formulationDensity(recipe).value,null);
});
test('MFR, resistencia, Tg/Tm, humedad y secado no se heredan ni se promedian',()=>{
 for(const property of ['mfr','mvr','tensile_strength','elongation','impact','glass_transition_temperature','melting_temperature','moisture','drying_time'])assert.equal(unsupportedMixtureProperty(makeFormulation(input,virgin),property).value,null);
 assert.equal(formulationDensity(makeFormulation({...input,density_strategy:'none'},virgin)).value,null);
});

test('ciclos inválidos no se convierten silenciosamente en desconocidos',()=>{
 assert.equal(makeFormulation({...input,cycles:'abc'},virgin).valid,false);
 assert.equal(makeFormulation({...input,cycles:false},virgin).valid,false);
});

test('evidencia de reciclado mantiene sistemas experimentales separados del catálogo',async()=>{
 const {readFileSync}=await import('node:fs');const data=JSON.parse(readFileSync(new URL('../src/data/recycling.v1.json',import.meta.url)));
 assert.equal(data.families.length,9);assert.equal(new Set(data.families.map(f=>f.family)).size,9);assert.equal(data.experiments.length,6);
 for(const family of data.families){assert.equal(family.numeric_properties_inherited,false);assert.equal(family.percentage_recommendation,null);}
 for(const experiment of data.experiments){assert.equal(experiment.automatic_application_allowed,false);assert.equal(experiment.virgin_catalog_id,null);assert.ok(data.sources[experiment.source_id].doi);assert.ok(experiment.tables.length>0);}
 const ids=new Set();for(const composition of data.experimental_formulations){assert.equal(composition.virgin_percent+composition.recycled_percent,100);assert.equal(composition.percentage_basis,'mass');assert.ok(!ids.has(composition.id));ids.add(composition.id);assert.equal(composition.automatic_application_allowed,false);}
});
