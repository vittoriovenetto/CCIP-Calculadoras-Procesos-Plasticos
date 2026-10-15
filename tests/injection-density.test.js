import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {modules} from '../src/schema.js';
import {calculate} from '../src/engine.js';
import {familyDensityCatalog, familyReference, applyFamilyMeltDensity, calculateWithMeltDensity} from '../src/injection-density.js';
import {createMaterialState, selectMaterial, applyMaterial, markManual, materialSnapshot, restoreMaterial} from '../src/materials.js';
import {compareRecords,comparisonCSV} from '../src/compare.js';
const data = JSON.parse(readFileSync(new URL('../src/data/materials.v1.3.json',import.meta.url)));
const injection = modules.find(m=>m.id==='inyeccion');
const values = () => ({method:'mass',partMass:30,cavities:2,runnerMass:5,shotMargin:0,screwD:20,screwMaxStroke:400,injectionFlow:10,plasticizingRate:20,projectedArea:20,cavityPressure:50,clampFactor:1.2});
function selected(family='HDPE') {
  const state = createMaterialState(), inputs = values();
  selectMaterial(data,state,inputs,data.materials.find(m=>m.family===family&&m.record_status==='generic_unverified').id);
  return {state,inputs};
}
const output = (result,label) => result.metrics.find(m=>m.label===label);
const close = (a,b) => assert.ok(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)),`${a} != ${b}`);

test('Tabla separada: cifras aportadas, unidades, estado y condiciones no inventadas',()=>{
  assert.equal(familyDensityCatalog.entries.length,10);
  for (const [family,wanted] of [['HDPE',.73],['LDPE',.76],['LLDPE',.70],['PP',.75],['PET',1.10],['ABS',.97],['PA6',.96],['PC',1.02]]) {
    const r=familyReference(family);assert.equal(r.canonical_value,wanted);assert.equal(r.status,'reference_generic_estimate');
    assert.equal(r.conditions.temperature_C,family==='PA6'?250:'not_specified');assert.equal(r.conditions.pressure_MPa,'not_specified');
    assert.equal(r.source.verification_basis,'user_supplied_reference_with_citation');
  }
  assert.ok(data.materials.every(m=>m.properties.melt_density===null),'No se cambia ninguna ficha comercial');
});
for (const level of ['basic','technical','advanced']) test(`${level}: 65 g sin densidad, con referencia no aceptada y con modo verificado`,()=>{
  const {state,inputs}=selected();
  for (const policy of ['reference_allowed','verified_only']) {
    state.context.meltDensityPolicy=policy;applyMaterial(state,injection,inputs,level);
    assert.ok(!inputs.meltDensity);
    const result=calculateWithMeltDensity('inyeccion',inputs,level,state);
    assert.equal(output(result,'Shot calculado (masa)').value,65);
    assert.equal(output(result,'Shot calculado (volumen)').value,null);
  }
});
for (const family of ['HDPE','LDPE','LLDPE','PP','PET','ABS','PA6','PC']) test(`${family}: aceptación explícita, fuente congelada y ficha intacta`,()=>{
  const {state,inputs}=selected(family), before=JSON.stringify(state.grade_snapshot);
  applyMaterial(state,injection,inputs,'technical');assert.ok(!inputs.meltDensity);
  state.context.familyMeltReferenceAccepted=true;applyMaterial(state,injection,inputs,'technical');
  assert.equal(inputs.meltDensity,familyReference(family).canonical_value);
  assert.equal(state.provenance.meltDensity.grade_id,null);
  const result=calculateWithMeltDensity('inyeccion',inputs,'technical',state);
  const snapshot=materialSnapshot(state,injection,result.calculation_inputs,'technical');
  assert.equal(snapshot.used_fields.meltDensity.origin,'family_reference');assert.equal(snapshot.grade_snapshot.properties.melt_density,null);
  assert.equal(JSON.stringify(state.grade_snapshot),before);
  const restored=restoreMaterial(JSON.parse(JSON.stringify(snapshot)));
  assert.deepEqual(calculateWithMeltDensity('inyeccion',inputs,'technical',restored),result);
});
test('Verificaciones dimensionales: g/(g/cm³), mm³/cm³, capacidad, carrera y porcentaje',()=>{
  const {state,inputs}=selected();state.context.familyMeltReferenceAccepted=true;applyMaterial(state,injection,inputs,'advanced');
  inputs.hotFactor=.4; // Se ignora: rho ya está en fase fundida.
  const result=calculateWithMeltDensity('inyeccion',inputs,'advanced',state);
  close(output(result,'Shot calculado (volumen)').value,89.04109589041096);
  close(output(result,'Capacidad volumétrica teórica del husillo').value,125.66370614359172);
  close(output(result,'Carrera calculada del husillo').value,283.42661098556704);
  close(output(result,'Utilización volumétrica teórica').value,70.85665274639176);
  assert.equal(output(result,'Capacidad volumétrica teórica del husillo').density_estimate,undefined);
  for(const label of ['Shot calculado (volumen)','Carrera calculada del husillo','Utilización volumétrica teórica','Tiempo de llenado ideal'])assert.equal(output(result,label).density_estimate,true);
  for(const label of ['Masa total sin reserva','Shot calculado (masa)','Tiempo de plastificación estimado','Fuerza de cierre teórica'])assert.equal(output(result,label).density_estimate,undefined);
  assert.equal(result.density_assessment.thermal_correction_applied,false);
});
test('Método volumétrico: sin rho conserva volumen/carrera; con referencia solo las masas dependen de rho',()=>{
  const {state,inputs}=selected();Object.assign(inputs,{method:'volume',partVolume:30,runnerVolume:5});
  let result=calculateWithMeltDensity('inyeccion',inputs,'advanced',state);
  assert.equal(output(result,'Shot calculado (volumen)').value,65);assert.equal(output(result,'Shot calculado (masa)').value,null);
  state.context.familyMeltReferenceAccepted=true;applyMaterial(state,injection,inputs,'advanced');result=calculateWithMeltDensity('inyeccion',inputs,'advanced',state);
  assert.equal(output(result,'Shot calculado (volumen)').density_estimate,undefined);assert.equal(output(result,'Carrera calculada del husillo').density_estimate,undefined);
  assert.equal(output(result,'Shot calculado (masa)').density_estimate,true);assert.equal(output(result,'Tiempo de plastificación estimado').density_estimate,true);
});
test('Básico nunca usa rho, diámetro o carrera ocultos al volver desde avanzado',()=>{
  const {state,inputs}=selected();state.context.familyMeltReferenceAccepted=true;applyMaterial(state,injection,inputs,'advanced');
  const result=calculateWithMeltDensity('inyeccion',inputs,'basic',state);
  assert.equal(output(result,'Shot calculado (masa)').value,65);assert.equal(output(result,'Shot calculado (volumen)').value,null);
  assert.equal(output(result,'Capacidad volumétrica teórica del husillo').value,null);assert.equal(result.density_assessment.used,false);
});
test('PVC polvo/compuesto desconocido no recibe rho; rígido y flexible son referencias diferentes',()=>{
  const {state,inputs}=selected('PVC');state.context.familyMeltReferenceAccepted=true;
  applyMaterial(state,injection,inputs,'advanced');assert.ok(!inputs.meltDensity);assert.equal(familyReference('PVC'),null);
  state.context.pvcMeltReferenceForm='rigid';applyMaterial(state,injection,inputs,'advanced');assert.ok(!inputs.meltDensity);
  state.context.pvcMeltCompoundConfirmed=true;applyMaterial(state,injection,inputs,'advanced');assert.equal(inputs.meltDensity,1.22);
  state.context.pvcMeltReferenceForm='flexible';applyMaterial(state,injection,inputs,'advanced');assert.equal(inputs.meltDensity,1.20);
  state.context.pvcMeltCompoundConfirmed=false;applyMaterial(state,injection,inputs,'advanced');assert.equal(inputs.meltDensity,'');
});
test('Manual se conserva frente a referencia y se puede rechazar sin bloquear la masa',()=>{
  const {state,inputs}=selected();state.context.familyMeltReferenceAccepted=true;applyMaterial(state,injection,inputs,'advanced');
  inputs.meltDensity=.8;markManual(state,'inyeccion','meltDensity',.8);applyMaterial(state,injection,inputs,'advanced');assert.equal(inputs.meltDensity,.8);
  let result=calculateWithMeltDensity('inyeccion',inputs,'advanced',state);assert.equal(result.density_assessment.manual_confirmed_at_calculation,true);
  assert.equal(result.density_assessment.approximate,true);
  state.context.meltDensityPolicy='verified_only';result=calculateWithMeltDensity('inyeccion',inputs,'advanced',state);
  assert.equal(result.density_assessment.used,false);assert.equal(inputs.meltDensity,.8);assert.equal(output(result,'Shot calculado (masa)').value,65);
  Object.assign(state.context,{meltDensityVerified:true,meltDensitySource:'Ensayo sintético; no material real',pvtTemperatureC:'230',pvtPressureMPa:'0'});
  result=calculateWithMeltDensity('inyeccion',inputs,'advanced',state);assert.equal(result.density_assessment.verified,true);assert.equal(result.density_assessment.verification,'user_declaration_with_evidence');
  assert.equal(result.density_assessment.source.title,'Ensayo sintético; no material real');
});
test('Rho vacía, cero, negativa, infinita o inválida nunca se registra como utilizada/verificada',()=>{
  const {state,inputs}=selected();
  Object.assign(state.context,{meltDensityVerified:true,meltDensitySource:'Ensayo sintético',pvtTemperatureC:230,pvtPressureMPa:0});
  for (const meltDensity of ['',0,-.8,Infinity,NaN,'invalid']) {
    const result=calculateWithMeltDensity('inyeccion',{...inputs,meltDensity},'advanced',state);
    assert.equal(result.density_assessment.used,false);assert.equal(result.density_assessment.verified,false);
    assert.equal(result.density_assessment.value_g_cm3,null);assert.equal(output(result,'Shot calculado (masa)').value,65);
  }
});
test('Dato del grado validado tiene prioridad sobre manual y referencia; no copia rho sólida',()=>{
  const {state,inputs}=selected();state.context.familyMeltReferenceAccepted=true;applyMaterial(state,injection,inputs,'advanced');
  state.grade_snapshot.properties.melt_density={value:.9,unit:'g/cm3',phase:'melt',status:'manufacturer_typical',source_id:'TEST',condition:'Caso sintético a condiciones confirmadas',verification_basis:'synthetic_test_not_real_grade'};
  state.grade_snapshot.source_id='TEST';state.source={url:'https://example.org/synthetic',title:'Ensayo sintético'};state.context.compatible=true;
  inputs.meltDensity=.8;markManual(state,'inyeccion','meltDensity',.8);
  let result=calculateWithMeltDensity('inyeccion',inputs,'advanced',state);
  assert.equal(result.density_assessment.value_g_cm3,.9);assert.equal(result.density_assessment.origin,'library');assert.equal(result.density_assessment.approximate,false);
  state.grade_snapshot.properties.melt_density.phase='solid';result=calculateWithMeltDensity('inyeccion',inputs,'advanced',state);assert.equal(result.density_assessment.value_g_cm3,.8);
  Object.assign(state.grade_snapshot.properties.melt_density,{phase:'melt',approximate:true});
  result=calculateWithMeltDensity('inyeccion',inputs,'advanced',state);assert.equal(result.density_assessment.value_g_cm3,.8);
});
test('Modo verificado y cambio de grado no reactivan una referencia sin aceptación nueva',()=>{
  const {state,inputs}=selected();state.context.familyMeltReferenceAccepted=true;applyMaterial(state,injection,inputs,'advanced');
  state.context.meltDensityPolicy='verified_only';applyMaterial(state,injection,inputs,'advanced');assert.equal(inputs.meltDensity,'');
  selectMaterial(data,state,inputs,data.materials.find(m=>m.family==='PP'&&m.record_status==='generic_unverified').id);
  assert.equal(state.context.meltDensityPolicy,'verified_only');assert.equal(state.context.familyMeltReferenceAccepted,false);
});
test('PA6 a 250 °C no se extrapola a otra temperatura y condiciones inválidas no se aceptan',()=>{
  assert.ok(familyReference('PA6',{pvtTemperatureC:'250'}));assert.equal(familyReference('PA6',{pvtTemperatureC:'260'}),null);
  for(const bad of ['NaN',-273.15,Infinity])assert.equal(familyReference('HDPE',{pvtTemperatureC:bad}),null);
  assert.equal(familyReference('HDPE',{pvtPressureMPa:-1}),null);
  const {state,inputs}=selected('PA6');state.context.familyMeltReferenceAccepted=true;applyMaterial(state,injection,inputs,'advanced');state.context.pvtTemperatureC='260';
  const result=calculateWithMeltDensity('inyeccion',inputs,'advanced',state);assert.equal(output(result,'Shot calculado (masa)').value,65);assert.equal(result.density_assessment.rejected_reference,true);
});
test('Validador de referencia no admite cero, vacío, negativo, fase equivocada, fuente ausente ni duplicados',()=>{
  const source=familyDensityCatalog.entries.find(r=>r.family==='HDPE');
  for(const patch of [{value:0},{value:''},{value:-1},{value:NaN},{value:Infinity},{phase:'solid'},{unit:'kg/L'},{source:null},{conditions:null},{status:'manufacturer_typical'}]) {
    assert.equal(familyReference('HDPE',{}, {schema_version:'1.0.0',scope:'family_reference',entries:[{...source,...patch}]}),null);
  }
  assert.equal(familyReference('HDPE',{}, {...familyDensityCatalog,entries:[source,source]}),null);
  assert.equal(familyReference('UNKNOWN'),null);
});
test('kg/m³ se convierte una sola vez a g/cm³ y no cambia las unidades del dato fuente',()=>{
  const row={...familyDensityCatalog.entries[0],value:730,unit:'kg/m3'};
  const catalog={schema_version:'1.0.0',scope:'family_reference',entries:[row]};
  const reference=familyReference('HDPE',{},catalog);assert.equal(reference.value,730);assert.equal(reference.canonical_value,.73);
});
test('Comparación y CSV mantienen marcas de estimación y la densidad/fuente utilizadas',()=>{
  const {state,inputs}=selected();state.context.familyMeltReferenceAccepted=true;applyMaterial(state,injection,inputs,'advanced');
  const a={module:'inyeccion',...calculateWithMeltDensity('inyeccion',inputs,'advanced',state)};
  const result=compareRecords(a,a);assert.equal(result.rows.find(r=>r.name==='Shot calculado (volumen)').first_estimated,true);
  const csv=comparisonCSV(a,a,result);assert.match(csv,/0.73/);assert.match(csv,/family_reference/);assert.match(csv,/reiloyusa.com/);
});
test('Los seis procesos restantes no aplican referencias ni cambian sus resultados',()=>{
  const {state,inputs}=selected();state.context.familyMeltReferenceAccepted=true;
  for(const module of modules.filter(m=>m.id!=='inyeccion')) {
    const before=JSON.stringify(inputs);applyFamilyMeltDensity(state,module,inputs,'advanced');assert.equal(JSON.stringify(inputs),before);
    assert.deepEqual(calculateWithMeltDensity(module.id,inputs,'advanced',state),calculate(module.id,inputs,'advanced'));
  }
});
