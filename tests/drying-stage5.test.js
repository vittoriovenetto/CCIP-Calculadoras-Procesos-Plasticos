import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {modules} from '../src/schema.js';
import {calculate} from '../src/engine.js';
import {createMaterialState, selectMaterial, applyMaterial, materialSnapshot, restoreMaterial} from '../src/materials.js';
import {enableLeanMaterial, materialCatalogFor} from '../src/lean-materials.js';
import {cpSignature} from '../src/drying-evidence.js';
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
 Object.assign(state.context,{cpDefinition:'constant_approximation',cpNoTransition:true,cpEvidenceConfirmed:true});state.context.cpConfirmedSignature=cpSignature(inputs.specificHeat,state.context);
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

function manualState(inputs,definition='mean_over_interval',range=[25,80]){
 const state=createMaterialState();Object.assign(state.context,{cpPhase:'solid',cpMinC:range[0],cpMaxC:range[1],cpDefinition:definition,cpNoTransition:true,specificHeatSource:'Synthetic interval evidence: no real resin or industrial measurement',cpEvidenceConfirmed:true});state.context.cpConfirmedSignature=cpSignature(inputs.specificHeat,state.context);return state;
}
const caseInputs={throughput:50,residence:4,bulkDensity:.7,startT:25,targetT:80,specificHeat:2};
test('audit Cp: isolated solid grade measurement is not interval evidence, regardless of a condition string',()=>{
 const {state}=selected('basf-ultramid-b3s-r03');state.grade_snapshot.properties.specific_heat={value:2,range:null,unit:'kJ/kg·K',phase:'solid',condition:'DSC at 25 °C',source_id:'S08'};
 state.provenance.specificHeat={origin:'library',grade_id:state.grade_snapshot.id};
 const result=prepareDryingCase(caseInputs,state,'advanced');assert.equal(result.effective.specificHeat,'');assert.equal(result.assessment.cp_valid_for_sensible_estimate,false);assert.equal(caseInputs.specificHeat,2);
});
test('audit Cp: mean only matches exact endpoints; wider-range constant approximation requires a separate declaration',()=>{
 for(const [definition,range,expected]of [['mean_over_interval',[25,80],true],['mean_over_interval',[20,90],false],['constant_approximation',[20,90],true],['point_measurement',[25,80],false],['',[25,80],false]]){
  const state=manualState(caseInputs,definition,range),result=prepareDryingCase(caseInputs,state,'advanced');assert.equal(result.assessment.cp_valid_for_sensible_estimate,expected);
 }
});
test('audit Cp: phase, source, no-transition declaration, confirmation and value binding are all mandatory',()=>{
 for(const patch of [{cpPhase:'melt'},{specificHeatSource:''},{cpNoTransition:false},{cpEvidenceConfirmed:false},{cpMinC:-300},{cpMaxC:25}]){
  const state=manualState(caseInputs);Object.assign(state.context,patch);state.context.cpConfirmedSignature=cpSignature(caseInputs.specificHeat,state.context);assert.equal(prepareDryingCase(caseInputs,state,'advanced').assessment.cp_valid_for_sensible_estimate,false);
 }
 const state=manualState(caseInputs);assert.equal(prepareDryingCase({...caseInputs,specificHeat:2.1},state,'advanced').assessment.cp_valid_for_sensible_estimate,false);
 state.context.specificHeatSource+=' changed';assert.equal(prepareDryingCase(caseInputs,state,'advanced').assessment.cp_valid_for_sensible_estimate,false);
});
test('audit Cp: structured documentary mean with source, grade and exact interval is usable, point/unit/value mismatches are not',()=>{
 const {state}=selected('basf-ultramid-b3s-r03');const p={value:2,range:null,unit:'kJ/kg·K',phase:'solid',source_id:'S08',thermal_evidence:{definition:'mean_over_interval',phase:'solid',temperature_range_C:[25,80],no_transition:true}};
 state.grade_snapshot.properties.specific_heat=p;state.provenance.specificHeat={origin:'library',grade_id:state.grade_snapshot.id};
 assert.equal(prepareDryingCase(caseInputs,state,'advanced').assessment.cp_valid_for_sensible_estimate,true);
 p.unit='J/kg·K';assert.equal(prepareDryingCase(caseInputs,state,'advanced').assessment.cp_valid_for_sensible_estimate,false);
 p.unit='kJ/kg·K';p.thermal_evidence.temperature_range_C=[20,90];assert.equal(prepareDryingCase(caseInputs,state,'advanced').assessment.cp_valid_for_sensible_estimate,false);
});
test('audit arithmetic: M=Q·t, V=M/rho and P=Q Cp deltaT/3600 are independent results with explicit evidence',()=>{
 const state=manualState(caseInputs);Object.assign(state.context,{physicalForm:'pellets',bulkCompatible:true,bulkDensitySource:'Synthetic bulk-density assay'});
 const prepared=prepareDryingCase(caseInputs,state,'advanced'),result=calculate('secado',prepared.effective,'advanced');
 assert.equal(result.metrics[0].value,200);assert.ok(Math.abs(result.metrics[1].value-200/.7)<1e-10);assert.ok(Math.abs(result.metrics[2].value-55/36)<1e-12);assert.equal(prepared.assessment.machine_capacity_certified,false);
 for(const delta of [0,-10]){
  const input={...caseInputs,targetT:25+delta},s=manualState(input,'constant_approximation',[0,90]);Object.assign(s.context,{physicalForm:'pellets',bulkCompatible:true,bulkDensitySource:'Synthetic assay'});
  const out=calculate('secado',prepareDryingCase(input,s,'advanced').effective,'advanced');assert.equal(out.metrics[2].value,delta===0?0:null);
 }
});
test('audit bulk density: no source/presentation/conditions means pending volume while mass remains computable',()=>{
 const state=createMaterialState();let result=prepareDryingCase(caseInputs,state,'technical');assert.equal(result.effective.bulkDensity,'');assert.equal(calculate('secado',result.effective,'technical').metrics[0].value,200);assert.equal(calculate('secado',result.effective,'technical').metrics[1].value,null);
 Object.assign(state.context,{physicalForm:'pellets',bulkCompatible:true,bulkDensitySource:'Synthetic test'});result=prepareDryingCase(caseInputs,state,'technical');assert.equal(result.assessment.bulk_valid_for_volume,true);
 const {state:grade}=selected('covestro-makrolon-2405'),v={...caseInputs};Object.assign(grade.context,{physicalForm:'pellets',bulkCompatible:true});applyMaterial(grade,dry,v,'advanced');v.bulkDensity=.66;grade.provenance.bulkDensity={origin:'library',grade_id:grade.grade_snapshot.id,source:grade.source};assert.equal(prepareDryingCase(v,grade,'technical').assessment.bulk_valid_for_volume,true);
 grade.context.physicalForm='powder';assert.equal(prepareDryingCase(v,grade,'technical').assessment.bulk_valid_for_volume,false);
});
test('audit inputs: missing/negative/non-numeric Q/rho/Cp/time never turn into fabricated zero results',()=>{
 for(const key of ['throughput','residence','bulkDensity','specificHeat'])for(const bad of ['',null,-1,'no number',Infinity,NaN]){
  const input={...caseInputs,[key]:bad},s=manualState(input);Object.assign(s.context,{physicalForm:'pellets',bulkCompatible:true,bulkDensitySource:'Synthetic test'});
  const r=calculate('secado',prepareDryingCase(input,s,'advanced').effective,'advanced'),index=key==='specificHeat'?2:key==='bulkDensity'?1:0;assert.equal(r.metrics[index].value,null,`${key}: ${bad}`);
 }
 const input={...caseInputs,throughput:0},s=manualState(input);Object.assign(s.context,{physicalForm:'pellets',bulkCompatible:true,bulkDensitySource:'Synthetic assay'});assert.deepEqual(calculate('secado',prepareDryingCase(input,s,'advanced').effective,'advanced').metrics.map(x=>x.value),[0,0,0]);
});
test('audit manual range choice survives material/context changes with explicit origin, but automatic upper is replaceable',()=>{
 const {state,v}=selected('covestro-makrolon-2405');applyMaterial(state,dry,v,'advanced');
 v.residence=2.5;state.provenance.residence={...state.provenance.residence,origin:'range_selection',value:2.5,manual_selection:true};selectMaterial(catalog,state,v,'basf-ultramid-b3s-r03');applyMaterial(state,dry,v,'advanced');assert.equal(v.residence,2.5);assert.equal(state.provenance.residence.manual_selection,true);
 const {state:auto,v:values}=selected('covestro-makrolon-2405');auto.context.dryingTime='bad';applyMaterial(auto,dry,values,'advanced');assert.equal(values.residence,'');
});
test('audit units: normalized personal density and Cp keep the original units and never substitute solid for bulk density',async()=>{
 const {makeCustomMaterial}=await import('../src/custom-materials.js');const m=makeCustomMaterial({family:'PA6',grade:'Synthetic units fixture',bulk_density:700,bulk_density_unit:'kg/m3',bulk_density_form:'pellets',specific_heat:2000,specific_heat_unit:'J/kg·K',specific_heat_phase:'solid',source:'Synthetic assay'});
 assert.equal(m.properties.bulk_density.value,.7);assert.equal(m.properties.specific_heat.value,2);assert.equal(m.properties.bulk_density.entered_unit,'kg/m3');assert.equal(m.properties.specific_heat.entered_unit,'J/kg·K');
});
test('audit snapshots: Cp and excluded bulk inputs remain as raw entries, not used fields; assessment exports as evidence',async()=>{
 const {prepareExport}=await import('../src/export-data.js');const {state}=selected('covestro-makrolon-2405');const prepared=prepareDryingCase(caseInputs,state,'advanced',{startT:'operating_assumption'}),snapshot=materialSnapshot(state,dry,prepared.effective,'advanced');
 assert.equal(snapshot.used_fields.specificHeat,undefined);assert.equal(snapshot.used_fields.bulkDensity,undefined);
 const record={module:'secado',level:'advanced',inputs:caseInputs,material:snapshot,drying_assessment:prepared.assessment,metrics:calculate('secado',prepared.effective).metrics,calculation_metadata:{input_origins:{startT:'operating_assumption'}}};
 const exp=prepareExport(record);assert.equal(exp.record.inputs.specificHeat,2);assert.ok(exp.observations.some(row=>row[0].includes('drying_assessment.cp_evidence')));assert.ok(exp.parameters.find(p=>p.key==='startT').origin.includes('Supuesto operativo'));
});
test('audit malformed thermal metadata cannot enable power or throw during a calculation',()=>{
 assert.doesNotThrow(()=>prepareDryingCase(caseInputs,undefined,'advanced'));
 for(const range of [null,{},'25,80',[25],[25,80,90],['25','80'],[NaN,80]]){
  const {state}=selected('basf-ultramid-b3s-r03');state.grade_snapshot.properties.specific_heat={value:2,unit:'kJ/kg·K',phase:'solid',source_id:'S08',thermal_evidence:{phase:'solid',definition:'mean_over_interval',no_transition:true,temperature_range_C:range}};state.provenance.specificHeat={origin:'library',grade_id:state.grade_snapshot.id};
  assert.equal(prepareDryingCase(caseInputs,state,'advanced').assessment.cp_valid_for_sensible_estimate,false);
 }
});
test('audit blends and recycled formulations never inherit virgin drying or Cp',()=>{
 const {state}=selected('basf-ultramid-b3s-r03');state.formulation_mode='blend';state.formulation={id:'synthetic-fixture',valid:true,recycled_fraction:.2};
 const prepared=prepareDryingCase(caseInputs,state,'advanced');assert.equal(prepared.assessment.applicable,false);assert.equal(prepared.assessment.cp_valid_for_sensible_estimate,false);assert.equal(prepared.assessment.bulk_valid_for_volume,false);assert.deepEqual(calculate('secado',prepared.effective,'advanced').metrics.map(m=>m.value),[null,null,null]);assert.equal(caseInputs.residence,4);
});
test('audit changing grade retains manual evidence as a draft, resets applicability and never silently certifies it',()=>{
 const {state,v}=selected('covestro-makrolon-2405');v.specificHeat=2;v.bulkDensity=.7;state.provenance.specificHeat={origin:'manual',value:2};state.provenance.bulkDensity={origin:'manual',value:.7};
 Object.assign(state.context,manualState(caseInputs).context,{bulkDensitySource:'Synthetic bulk assay',physicalForm:'pellets',bulkCompatible:true});
 selectMaterial(catalog,state,v,'basf-ultramid-b3s-r03');assert.equal(v.specificHeat,2);assert.equal(state.context.specificHeatSource,'Synthetic interval evidence: no real resin or industrial measurement');assert.equal(state.context.bulkDensitySource,'Synthetic bulk assay');assert.equal(state.context.cpEvidenceConfirmed,false);assert.equal(state.context.bulkCompatible,false);
});
