import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateFormulationCase} from '../src/formulation-calculation.js';
import {createMaterialState} from '../src/materials.js';
import {calculateWithMeltDensity} from '../src/injection-density.js';
import {variants} from './fixtures.js';
const recipe={valid:true,id:'synthetic-recipe',recycled_fraction:.2};
const state=()=>({...createMaterialState(),formulation:recipe,grade_snapshot:{id:'original-virgin',family:'HDPE',properties:{melt_density:null}}});
test('formulación sin datos no usa densidades del grado virgen ni de familia y conserva cálculo por masa',()=>{
 const s=state();s.context.familyMeltReferenceMode='automatic';s.provenance.meltDensity={origin:'family_reference',grade_id:null};
 const result=calculateFormulationCase('inyeccion',{...variants[0][1],meltDensity:.73},'advanced',s);
 assert.equal(result.metrics.find(m=>m.label==='Shot calculado (masa)').value,71.5);
 assert.equal(result.metrics.find(m=>m.label==='Shot calculado (volumen)').value,null);
});
test('la mezcla estima solo resultados dependientes y no aplica otro factor térmico',()=>{
 const s=state();s.provenance.density={origin:'mixture_model',formulation_id:recipe.id,reference:{approximate:true}};
 const result=calculateFormulationCase('extrusion',variants[1][1],'advanced',s);
 assert.equal(result.metrics.find(m=>m.label==='Área transversal').density_estimate,undefined);
 assert.equal(result.metrics.find(m=>m.label==='Producción neta ideal').density_estimate,true);
 assert.equal(result.formulation_assessment.thermal_correction_applied,false);
});
test('cambio de T/P invalida una densidad de modelo y modo verificado rechaza estimaciones',()=>{
 const s=state();s.context.pvtTemperatureC='200';s.context.pvtPressureMPa='5';s.provenance.meltDensity={origin:'mixture_model',formulation_id:recipe.id,reference:{approximate:true,model_id:'synthetic',conditions:{temperature_C:200,pressure_MPa:5}}};
 let r=calculateFormulationCase('inyeccion',variants[0][1],'advanced',s);assert.equal(r.density_assessment.approximate,true);assert.equal(r.density_assessment.family_reference,null);
 s.context.pvtTemperatureC='210';r=calculateFormulationCase('inyeccion',variants[0][1],'advanced',s);assert.equal(r.density_assessment.used,false);
 s.context.pvtTemperatureC='200';s.context.meltDensityPolicy='verified_only';s.context.meltDensityVerified=true;s.context.meltDensitySource='not an experimental measurement';r=calculateFormulationCase('inyeccion',variants[0][1],'advanced',s);assert.equal(r.density_assessment.used,false);
});
test('sin formulación, la selección de datos y resultados coincide con el comportamiento anterior',()=>{
 for(const [module,values] of variants)for(const level of ['basic','technical','advanced']){
  const s=createMaterialState();assert.deepEqual(calculateFormulationCase(module,values,level,s),calculateWithMeltDensity(module,values,level,s));
 }
});
