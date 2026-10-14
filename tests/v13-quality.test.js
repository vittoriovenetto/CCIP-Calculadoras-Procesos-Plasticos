import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {modules,activeFields} from '../src/schema.js';
import {calculate} from '../src/engine.js';
import {validateLibrary,createMaterialState,selectMaterial,applyMaterial,materialSnapshot} from '../src/materials.js';
import {makeCustomMaterial,validateUserMaterial,listUserMaterials,persistUserMaterials,parseUserImport,exportUserMaterials,mergeCustomMaterials,convertProperty,USER_KEY} from '../src/custom-materials.js';
import {lessons,examples} from '../src/formulas-data.js';
import {lessonLevel,guideHref} from '../src/formula-learning.js';
import {t,setLanguage,getLanguage} from '../src/i18n.js';
const data = JSON.parse(readFileSync(new URL('../src/data/materials.v1.3.json',import.meta.url)));
const audit = JSON.parse(readFileSync(new URL('../docs/auditoria-fuentes-v1.3.json',import.meta.url)));
const own = values => makeCustomMaterial({family:'PC',grade:'Caso manual',manufacturer:'Laboratorio',...values});
function storage(data = []) {
  let raw = typeof data === 'string' ? data : JSON.stringify(data);
  return {getItem:key=>key===USER_KEY?raw:null,setItem:(_,value)=>{raw=value;},raw:()=>raw};
}
test('Auditoría: 90 identidades pendientes con evidencia de bloqueo; ninguna certificación por URL',()=>{
  assert.equal(audit.records.length,90);assert.equal(data.schema_version,'1.3.0');
  const ids = new Set(audit.records.map(x=>x.id));assert.equal(ids.size,90);
  for (const record of audit.records) {
    assert.match(record.access_result,/Tunnel connection failed: 403/);
    assert.equal(record.identity_status,'pending_official_confirmation');
    assert.ok(data.materials.find(m=>m.id===record.id).identity_verification);
  }
  for (const m of data.materials.filter(m=>m.id.startsWith('catalog-'))) assert.ok(Object.values(m.properties).every(p=>p===null),'New candidate properties cannot be certified by their URL');
});
for (const profile of data.materials) test(`${profile.id}: compatible con 7 procesos × 3 niveles sin inventar magnitudes`,()=>{
  validateLibrary(data);
  for (const module of modules) for (const level of ['basic','technical','advanced']) {
    const state = createMaterialState(), values = {};
    selectMaterial(data,state,values,profile.id);
    Object.assign(state.context,{compatible:true,bulkCompatible:true,dryingCompatible:true,processConfirmed:true,physicalForm:profile.family==='PVC'?'powder':'pellets'});
    const candidates = applyMaterial(state,module,values,level), fields = new Set(activeFields(module,values,level).map(f=>f.key));
    assert.ok(candidates.every(c=>fields.has(c.field)));
    if (profile.record_status==='generic_unverified' || profile.id.startsWith('catalog-')) assert.deepEqual(values,{});
    const result = calculate(module.id,values,level);
    assert.ok(result.metrics.every(m=>m.value===null||Number.isFinite(m.value)));
    assert.equal(materialSnapshot(state,module,values,level).grade_id,profile.id);
  }
});
for (const lesson of lessons) test(`${lesson.id}: ejemplo independiente corresponde al motor y documenta entradas/conversiones`,()=>{
  const [id,values] = examples.find(([id])=>id===lesson.module), module = modules.find(x=>x.id===id);
  const metric = calculate(id,values,'advanced').metrics.find(m=>m.label===lesson.label);
  assert.ok(metric);assert.ok(Math.abs(metric.value-lesson.expected)<=1e-10*Math.max(1,Math.abs(lesson.expected)));
  assert.ok(lesson.steps.length>=2);assert.ok(lesson.fields.length>0);
  for (const key of lesson.fields) {assert.ok(module.fields.some(f=>f.key===key));assert.ok(Object.hasOwn(values,key));}
  assert.ok(lesson.conversions.es && lesson.conversions.en);
});
test('Guía cubre las 42 salidas sin duplicados y añade ambos modos geométricos',()=>{
  assert.equal(lessons.length,42);assert.equal(examples.length,9);
  for (const module of modules) assert.deepEqual(lessons.filter(x=>x.module===module.id).map(x=>x.label).sort(),calculate(module.id,{},'advanced').metrics.map(x=>x.label).sort());
});
test('Niveles de aprendizaje reproducen los 42 ejemplos, incluidos términos opcionales e intermedios',()=>{
  const levels = ['basic','technical','advanced'];
  for (const lesson of lessons) {
    const inputs = examples.find(([id])=>id===lesson.module)[1];
    const selected = lessonLevel(lesson);
    assert.ok(levels.includes(selected),lesson.id);
    for (const level of levels) {
      const value = calculate(lesson.module,inputs,level).metrics.find(m=>m.label===lesson.label).value;
      const matches = value !== null && Math.abs(value-lesson.expected) <= 1e-10*Math.max(1,Math.abs(lesson.expected));
      assert.equal(matches,levels.indexOf(level)>=levels.indexOf(selected),`${lesson.id}/${level}`);
    }
  }
  assert.equal(lessonLevel(lessons.find(x=>x.id==='inyeccion-2')),'technical','Un margen técnico distinto de cero no se enseña como ejemplo básico');
  assert.equal(lessonLevel(lessons.find(x=>x.id==='inyeccion-8')),'advanced');
});
test('Enlaces de resultados alcanzan su lección y habilitan un nivel suficiente aunque estén pendientes',()=>{
  for (const lesson of lessons) {
    const url = new URL(guideHref(lesson.module,'basic',lesson.label),'https://example.org/ccip/');
    assert.equal(url.hash,`#${lesson.id}`);
    assert.equal(url.searchParams.get('process'),lesson.module);
    assert.equal(url.searchParams.get('level'),lessonLevel(lesson));
  }
  assert.equal(guideHref('inyeccion','technical','Fuerza de cierre teórica'),'./formulas.html?process=inyeccion&level=advanced#inyeccion-8');
  assert.equal(guideHref('secado','invalid'),'./formulas.html?process=secado&level=advanced#guide-secado');
});
for (const [key,value,unit,wanted] of [
  ['solid_density',950,'kg/m3',.95],['melt_density',800,'kg/m3',.8],['bulk_density',500,'kg/m3',.5],
  ['bulk_density',.5,'g/cm3',.5],['specific_heat',2000,'J/kg·K',2],['drying_temperature',353.15,'K',80],['drying_time',120,'min',2],['moisture_target',0,'%',0]
]) test(`${key}: convierte ${value} ${unit} sin confundir fases`,()=>assert.ok(Math.abs(convertProperty(key,value,unit)-wanted)<1e-12));
test('Materiales: unidades equivocadas, cero densidad/Cp/tiempo, temperatura absoluta y números imposibles rechazados',()=>{
  for (const [key,value,unit] of [['solid_density',0,'g/cm3'],['melt_density',-1,'g/cm3'],['specific_heat',0,'kJ/kg·K'],['drying_time',0,'h'],['drying_temperature',0,'K'],['solid_density',1,'MPa'],['mfr',Infinity,'g/10min'],['bulk_density',true,'kg/L'],['mvr',' ','cm3/10min']]) assert.throws(()=>convertProperty(key,value,unit));
});
test('Cada propiedad conserva unidad introducida, fase y fuente propia, sin mutar catálogo de fabricante',()=>{
  const material = own({solid_density:950,solid_density_unit:'kg/m3',solid_density_source:'Ensayo sólido',solid_density_method:'ISO 1183',melt_density:.8,melt_density_source:'Ensayo pVT',melt_density_conditions:'220 °C, 30 MPa'});
  const roundTrip = validateUserMaterial(material), before = JSON.stringify(data), merged = mergeCustomMaterials(data,[roundTrip]);
  assert.equal(roundTrip.properties.solid_density.value,.95);assert.equal(roundTrip.properties.solid_density.entered_unit,'kg/m3');
  assert.equal(roundTrip.properties.melt_density.phase,'melt');
  assert.notEqual(roundTrip.properties.solid_density.source_id,roundTrip.properties.melt_density.source_id);
  assert.equal(merged.sources[roundTrip.properties.melt_density.source_id].description,'Ensayo pVT');
  validateLibrary(merged);assert.equal(JSON.stringify(data),before);
});
test('Fase Cp y densidad deben corresponder al proceso aunque se confirme compatibilidad',()=>{
  for (const [moduleId,key,phase,field] of [['secado','specific_heat','melt','specificHeat'],['inyeccion','melt_density','solid','meltDensity'],['extrusion','solid_density','melt','density']]) {
    const record = own({[key]:1,[key+'_phase']:phase}), merged = mergeCustomMaterials(data,[record]);
    const state = createMaterialState(), values = {};selectMaterial(merged,state,values,record.id);state.context.compatible=true;
    const candidates = applyMaterial(state,modules.find(x=>x.id===moduleId),values,'advanced');
    assert.equal(values[field],undefined);assert.ok(candidates.find(c=>c.field===field)?.reason.includes('fase'));
  }
});
test('Importación valida todos los registros antes de escribir y conserva origen no verificado',()=>{
  const record = own({melt_density:.8}), fake = {...record,record_status:'manufacturer_typical'};
  fake.properties.melt_density.status='manufacturer_typical';fake.properties.melt_density.source_id='S01';
  const restored = parseUserImport(JSON.stringify([fake]),[])[0];
  assert.equal(restored.record_status,'user_entered_unverified');assert.equal(restored.properties.melt_density.status,'user_entered');assert.notEqual(restored.properties.melt_density.source_id,'S01');
  assert.equal(parseUserImport(exportUserMaterials([restored]),[restored]).length,1);
  for (const input of ['{',JSON.stringify({schema_version:'other',materials:[]}),JSON.stringify([{...record,id:'S01'}]),JSON.stringify([record,record]),JSON.stringify([record,{...record,id:'user-other',grade:'OTRO',properties:{melt_density:{value:-1,unit:'g/cm3'}}}])]) assert.throws(()=>parseUserImport(input,[]));
  assert.throws(()=>parseUserImport(' '.repeat(2_000_001),[]));
});
test('Almacenamiento corrupto: se descartan registros inválidos y quedan utilizables los válidos',()=>{
  const record = own({solid_density:1}), good = validateUserMaterial(record);
  globalThis.localStorage=storage([null,good,{...good,id:4},{...good,id:'user-bad',grade:'Mal',properties:{solid_density:{value:'Infinity',unit:'g/cm3'}}}]);
  assert.equal(listUserMaterials().length,1);
  globalThis.localStorage=storage('{');assert.deepEqual(listUserMaterials(),[]);
  globalThis.localStorage=storage({materials:[good]});assert.deepEqual(listUserMaterials(),[]);
  delete globalThis.localStorage;
});
test('Guardado/importación fallidos no sobrescriben materiales personales ni catálogo',()=>{
  const record = own({solid_density:1});globalThis.localStorage=storage([record]);const before=localStorage.raw();
  assert.throws(()=>persistUserMaterials([record,{...record,id:'manufacturer'}]));assert.equal(localStorage.raw(),before);
  globalThis.localStorage={getItem:()=>null,setItem:()=>{throw Error('quota');}};
  assert.throws(()=>persistUserMaterials([record]),/guardar/);delete globalThis.localStorage;
});
for (const module of modules) test(`${module.id}: etiquetas, ayudas, opciones, ecuaciones, advertencias y límites tienen traducción`,()=>{
  const human = [module.name,module.description,...module.fields.flatMap(f=>[f.label,f.description,...(f.options||[]).map(x=>x[1])])];
  const invalid = Object.fromEntries(module.fields.map(f=>[f.key,f.type==='select'?'invalid':-1]));
  for (const values of [{},invalid]) {
    const output=calculate(module.id,values,'advanced');human.push(...output.metrics.flatMap(m=>[m.label,m.formula]),...output.warnings,...output.notes);
  }
  for (const text of human) if (!/^π × D × H/.test(text)) assert.notEqual(t(text,'en'),text,text);
});
test('Idioma elegido sigue disponible en sesión cuando localStorage falla',()=>{
  globalThis.localStorage={getItem:()=>{throw Error('blocked');},setItem:()=>{throw Error('blocked');}};
  setLanguage('en');assert.equal(getLanguage(),'en');assert.equal(t('Pendiente'),'Pending');setLanguage('es');delete globalThis.localStorage;
});

test('Traducciones compuestas: ayudas con unidades, rangos, genéricos y prefijos de advertencia',()=>{
  for (const [source,expected] of [
    ['⚠ La carrera calculada supera la carrera máxima indicada.','⚠ Calculated stroke exceeds the specified maximum stroke.'],
    ['Calor específico medio (kJ/kg·K)','Mean specific heat (kJ/kg·K)'],
    ['0.03–0.06 % masa (rango; no es un valor único)','0.03–0.06 wt % (range; not a single value)'],
    ['HDPE — Genérico (grado desconocido)','HDPE — Generic (unknown grade)'],
    ['sólido · Valor típico [S01]','solid · Typical value [S01]']
  ]) assert.equal(t(source,'en'),expected);
});

test('PVC propio puede ser pellets; no inferir polvo a partir de su familia',()=>{
  const record = makeCustomMaterial({family:'PVC',grade:'Compuesto propio',bulk_density:.5,bulk_density_form:'pellets'});
  const library=mergeCustomMaterials(data,[record]),state=createMaterialState(),values={};
  selectMaterial(library,state,values,record.id);Object.assign(state.context,{physicalForm:'pellets',bulkCompatible:true});
  applyMaterial(state,modules.find(m=>m.id==='secado'),values,'technical');
  assert.equal(values.bulkDensity,.5);assert.equal(validateUserMaterial(record).properties.bulk_density.physical_form,'pellets');
});
test('Presentación de densidad aparente propia ausente: no autocompletar por familia',()=>{
  const record=own({bulk_density:.5}),library=mergeCustomMaterials(data,[record]),state=createMaterialState(),values={};
  selectMaterial(library,state,values,record.id);Object.assign(state.context,{physicalForm:'pellets',bulkCompatible:true});
  const candidates=applyMaterial(state,modules.find(m=>m.id==='secado'),values,'technical');
  assert.equal(values.bulkDensity,undefined);assert.ok(candidates[0].reason.includes('presentación'));
});
