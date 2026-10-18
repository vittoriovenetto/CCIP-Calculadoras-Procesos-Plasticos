import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {calculate} from '../src/engine.js';
import {validateMachineCatalog,machinesFor,newMachineState,selectMachine,setMachineConfirmed,assessMachine,machineSnapshot,restoreMachine,catalogReadiness} from '../src/machines.js';
import {prepareExport} from '../src/export-data.js';
const raw=JSON.parse(readFileSync(new URL('../src/data/machines.v1.json',import.meta.url),'utf8'));
const catalog=validateMachineCatalog(raw);
test('Maquinaria: mínimo de veinte fichas concretas documentadas, sin contar series ni duplicados',()=>{
 const audit=catalogReadiness(catalog);
 assert.ok(audit.complete,JSON.stringify(audit));assert.ok(audit.qualified_count>=20);
 for(const [process,min] of Object.entries(audit.minimum))assert.ok(audit.counts[process]>=min,process);
 assert.equal(machinesFor(catalog,'costos').length,0);
 assert.equal(new Set(catalog.machines.map(x=>x.id)).size,catalog.machines.length);
 assert.ok(catalog.machines.every(x=>x.source.url.startsWith('https://')));
 const duplicated=structuredClone(catalog);duplicated.machines.push({...structuredClone(catalog.machines[0]),id:'synthetic-duplicate-id'});
 assert.equal(catalogReadiness(duplicated).qualified_count,audit.qualified_count);
});
test('Maquinaria: rechaza URLs inseguras, duplicados y autofill en series',()=>{
 const a=structuredClone(catalog);a.machines.push(structuredClone(a.machines[0]));assert.throws(()=>validateMachineCatalog(a));
 const b=structuredClone(catalog);b.machines[0].source.url='javascript:alert(1)';assert.throws(()=>validateMachineCatalog(b));
 const c=structuredClone(catalog);c.machines[1].autofill_fields={screwD:'screw_diameter_range_mm'};assert.throws(()=>validateMachineCatalog(c));
});
test('Máquina ARBURG: aplica al seleccionar y conserva overrides manuales',()=>{
 const s=newMachineState(),v={screwD:'',screwMaxStroke:''},origins={};
 selectMachine(s,catalog,'arburg-allrounder-370s-700-290-s30','inyeccion',v,origins);
 assert.equal(s.confirmed,true);
 assert.equal(v.screwD,30);assert.equal(v.screwMaxStroke,150);assert.equal(origins.screwD,'machine_catalog');
 v.screwD=35;origins.screwD='manual';selectMachine(s,catalog,'','inyeccion',v,origins);
 assert.equal(v.screwD,35);assert.equal(v.screwMaxStroke,'');
});
test('Máquina: no se transfieren especificaciones de otra etapa o proceso',()=>{
 const s=newMachineState(),v={screwD:'',screwMaxStroke:''},origins={};
 selectMachine(s,catalog,'arburg-allrounder-370s-700-290-s30','extrusion',v,origins);assert.equal(s.id,'');
 selectMachine(s,catalog,'battenfeld-cincinnati-uniex-series','extrusion',v,origins);
 assert.equal(s.confirmed,false);assert.equal(v.screwD,'');
 assert.equal(assessMachine(s,'extrusion',{metrics:[]}).checks.length,0);
});
test('ARBURG: fuerza en tf se convierte a kN; compara 106 cm³ y 700 kN',()=>{
 const s=newMachineState(),v={screwD:'',screwMaxStroke:''},origins={};
 selectMachine(s,catalog,'arburg-allrounder-370s-700-290-s30','inyeccion',v,origins);

 const out=assessMachine(s,'inyeccion',{metrics:[
  {label:'Shot calculado (volumen)',value:110,unit:'cm³'},
  {label:'Carrera calculada del husillo',value:140,unit:'mm'},
  {label:'Fuerza de cierre con factor',value:80,unit:'tf'}
 ]},v);
 assert.equal(out.checks.length,3);
 assert.equal(out.checks[0].status,'above_published_limit');
 assert.equal(out.checks[1].status,'within_published_limit');
 assert.equal(out.checks[2].status,'above_published_limit');
 assert.ok(Math.abs(out.checks[2].actual-784.532)<1e-9);
});
test('Configuración equivocada suspende comparaciones y snapshot es inmutable',()=>{
 const s=newMachineState(),v={screwD:'',screwMaxStroke:''},origins={};
 selectMachine(s,catalog,'arburg-allrounder-370s-700-290-s30','inyeccion',v,origins);
 const frozen=machineSnapshot(s);assert.equal(restoreMachine(frozen).id,s.id);
 v.screwD=35;const wrong=assessMachine(s,'inyeccion',{metrics:[{label:'Shot calculado (volumen)',value:110,unit:'cm³'}]},v);
 assert.equal(wrong.checks.length,0);frozen.profile.specifications.shot_volume_cm3.value=999;
 assert.equal(s.profile.specifications.shot_volume_cm3.value,106);
});
test('Secador LHD 30: capacidad nominal y potencia conectada no son demanda real',()=>{
 const s=newMachineState(),v={},origins={};
 selectMachine(s,catalog,'motan-luxor-hd-lhd30','secado',v,origins);
 assert.equal(s.profile.specifications.hopper_nominal_L.value,30);
 assert.equal(s.profile.specifications.connected_power_kW.value,2);
 const assessed=assessMachine(s,'secado',{metrics:[{label:'Volumen útil mínimo de tolva',value:33,unit:'L'}]});
 assert.equal(assessed.checks.length,1);assert.equal(assessed.checks[0].status,'above_published_limit');
});
test('Exportación de snapshot de máquina no recalcula ni cambia las entradas',()=>{
 const s=newMachineState(),v={screwD:'',screwMaxStroke:''},origins={};
 selectMachine(s,catalog,'arburg-allrounder-370s-700-290-s30','inyeccion',v,origins);
 const record={module:'inyeccion',level:'technical',date:'2026-10-16T20:00:00Z',inputs:{...v},machine:machineSnapshot(s),metrics:[],warnings:[],notes:[]};
 const before=structuredClone(record);
 const out=prepareExport(record);assert.ok(out.summary.some(x=>x[1]===s.profile.model));
 assert.ok(out.sources.some(x=>String(x[1]).includes('arburg.com')));
 assert.deepEqual(record,before);
});

test('Precarga rechaza una dimensión numérica con unidad equivocada y no usa rangos',()=>{
 const wrong=structuredClone(catalog);wrong.machines[0].specifications.screw_diameter_mm.unit='cm';assert.throws(()=>validateMachineCatalog(wrong));
 const ranged=structuredClone(catalog);delete ranged.machines[0].specifications.screw_diameter_mm.value;ranged.machines[0].specifications.screw_diameter_mm.range=[20,30];assert.throws(()=>validateMachineCatalog(ranged));
});
test('Moiron M2-I: 15 tf, no 15 kN; 20 g ABS no son 20 cm³ ni propiedades M2-II',()=>{
 const one=catalog.machines.find(m=>m.id==='moiron-m2-i'),two=catalog.machines.find(m=>m.id==='moiron-m2-ii');
 assert.equal(one.specifications.screw_diameter_mm.value,20);assert.equal(one.specifications.shot_mass_ABS_g.value,20);
 assert.ok(Math.abs(one.specifications.clamp_force_kN.value-147.09975)<1e-9);
 assert.equal(one.specifications.max_injection_pressure_bar.value,600);assert.equal(two.specifications.max_injection_pressure_bar.value,1000);
 assert.equal(two.specifications.shot_mass_ABS_g.value,15);assert.ok(!one.specifications.shot_volume_cm3);assert.ok(!one.autofill_fields.screwMaxStroke);
 const s=newMachineState(),v={screwD:'',screwMaxStroke:'',partMass:'12'},o={};selectMachine(s,catalog,one.id,'inyeccion',v,o);
 assert.equal(v.screwD,20);assert.equal(v.screwMaxStroke,'');assert.equal(v.partMass,'12');
 const r=calculate('inyeccion',{method:'mass',cavities:1,partMass:12,runnerMass:0,meltDensity:.97,screwD:20},'advanced');
 const a=assessMachine(s,'inyeccion',r,v);assert.equal(a.checks.some(c=>c.key==='shot_volume_cm3'),false);assert.ok(a.pending.some(p=>p.key==='shot_mass_ABS_g'));
 s.operation={capacityConditionsConfirmed:true,capacityMaterial:'ABS'};
 assert.equal(assessMachine(s,'inyeccion',r,v).checks.find(c=>c.key==='shot_mass_ABS_g').actual,12);
});
test('XH-430B-25: monocapa separada de tricapa; dado sí, caudal y extremos de rango no',()=>{
 const mono=catalog.machines.find(m=>m.id==='xihua-xh-430b-25'),tri=catalog.machines.find(m=>m.id==='xihua-xh-430b-25-3');
 assert.equal(mono.specifications.layer_count.value,1);assert.equal(tri.specifications.layer_count.value,3);
 assert.equal(mono.specifications.die_diameter_mm.value,25);assert.equal(tri.specifications.die_diameter_mm.value,30);
 assert.ok(!mono.specifications.bubble_max_diameter_mm);assert.equal(tri.specifications.bubble_max_diameter_mm.value,300);
 assert.ok(!mono.specifications.output_max_kg_h);assert.ok(!mono.specifications.film_max_thickness_um);
 const s=newMachineState(),v={dieDiameter:'',dieGap:'',lineSpeed:'12'},o={};selectMachine(s,catalog,mono.id,'pelicula',v,o);
 assert.equal(v.dieDiameter,25);assert.equal(v.dieGap,'');assert.equal(v.lineSpeed,'12');
 v.dieDiameter='40';o.dieDiameter='manual';selectMachine(s,catalog,tri.id,'pelicula',v,o);assert.equal(v.dieDiameter,'40');
});
test('Fuentes de las capturas conservan variantes, unidades y discrepancias sin mezclarlas',()=>{
 const moiron=catalog.machines.find(m=>m.id==='moiron-page104-16mm-100kn'),xh=catalog.machines.find(m=>m.id==='dongguan-xihua-xh430b-2-2kw');
 assert.equal(moiron.specifications.screw_diameter_mm.value,16);assert.equal(moiron.specifications.clamp_force_kN.value,100);assert.equal(moiron.specifications.mold_opening_stroke_mm.value,135);assert.ok(!moiron.specifications.screw_max_stroke_mm);assert.ok(!moiron.specifications.max_injection_pressure_bar);
 assert.equal(xh.specifications.motor_installed_kW.value,2.2);assert.equal(xh.specifications.film_min_thickness_um.value,20);assert.equal(xh.specifications.film_max_thickness_um.value,200);assert.ok(!xh.specifications.film_max_layflat_mm);assert.ok(!xh.specifications.bubble_max_diameter_mm);
 assert.ok(catalogReadiness(catalog).excluded.includes(moiron.id));assert.ok(catalogReadiness(catalog).excluded.includes(xh.id));
});
test('Kiefel: no confundir superficie de conformado, herramienta, lámina ni modos de producción',()=>{
 const s=catalog.machines.find(m=>m.id==='kiefel-kmd642speed').specifications;
 assert.equal(s.forming_max_width_mm.value,620);assert.equal(s.tool_max_width_mm.value,640);assert.equal(s.sheet_max_width_mm.value,670);assert.equal(s.forming_max_height_mm.value,120);assert.equal(s.max_cycle_cpm.value,50);assert.equal(s.bfs_max_cycle_cpm.value,45);assert.ok(!s.sheet_max_length_mm);
 const record=structuredClone(catalog);record.machines[0].sources.push({id:'unsafe',url:'javascript:alert(1)'});assert.throws(()=>validateMachineCatalog(record));
});
test('Snapshot separa precarga retenida de campos activos realmente usados y overrides manuales',()=>{
 const s=newMachineState(),v={screwD:'',screwMaxStroke:''},o={};selectMachine(s,catalog,catalog.machines[0].id,'inyeccion',v,o);
 assert.deepEqual(machineSnapshot(s,{},o).used_fields,{});assert.deepEqual(machineSnapshot(s,v,o).used_fields,{screwD:30,screwMaxStroke:150});
 v.screwD='35';o.screwD='manual';assert.deepEqual(machineSnapshot(s,v,o).used_fields,{screwMaxStroke:150});
});
test('Costos conserva la procedencia de entradas reutilizadas al cambiar o quitar la ficha activa',()=>{
 const s=newMachineState(),values={partMass:'12'},origins={partMass:'saved_calculation'};s.reused_from={id:'source',applied:{partMass:'12'}};
 selectMachine(s,catalog,'moiron-m2-i','costos',values,origins);assert.equal(s.reused_from.id,'source');assert.equal(values.partMass,'12');
 selectMachine(s,catalog,'','costos',values,origins);assert.equal(machineSnapshot(s).reused_from.id,'source');assert.equal(values.partMass,'12');
});
test('Básico no confunde parámetros de máquina no activos con una variante incorrecta',()=>{
 const s=newMachineState(),v={screwD:'',screwMaxStroke:''},o={};selectMachine(s,catalog,catalog.machines[0].id,'inyeccion',v,o);
 const a=assessMachine(s,'inyeccion',{metrics:[{label:'Shot calculado (volumen)',value:35,unit:'cm³'}]},{});
 assert.ok(!a.notes.includes('screw_configuration_mismatch'));assert.equal(a.checks.find(c=>c.key==='shot_volume_cm3').actual,35);
});

test('Selección automática cambia o limpia solo campos de máquina y respeta entradas manuales',()=>{
 const s=newMachineState(),v={screwD:'',screwMaxStroke:'',partMass:'12'},o={partMass:'manual'};
 selectMachine(s,catalog,'arburg-allrounder-370s-700-290-s30','inyeccion',v,o);
 s.operation.injectionSpeed='15';
 selectMachine(s,catalog,'moiron-m2-i','inyeccion',v,o);
 assert.equal(v.screwD,20);assert.equal(v.screwMaxStroke,'');assert.equal(v.partMass,'12');assert.deepEqual(s.operation,{});
 v.screwD='17';o.screwD='manual';
 selectMachine(s,catalog,'moiron-m2-ii','inyeccion',v,o);
 assert.equal(v.screwD,'17');assert.deepEqual(s.applied,{});
 selectMachine(s,catalog,'','inyeccion',v,o);
 assert.equal(s.confirmed,false);assert.equal(s.profile,null);assert.deepEqual(s.applied,{});assert.equal(v.screwD,'17');
});

test('Aplicación automática no carga límites, rangos, potencias ni campos sin unidad compatible',()=>{
 for(const m of catalog.machines){
  const s=newMachineState(),v={},o={};selectMachine(s,catalog,m.id,m.process,v,o);
  assert.equal(s.confirmed,['specific_configuration','specific_model'].includes(m.scope),m.id);
  assert.deepEqual(Object.keys(v).sort(),Object.keys(m.autofill_fields||{}).sort(),m.id);
  for(const [field,key] of Object.entries(m.autofill_fields||{}))assert.equal(v[field],m.specifications[key].value,m.id);
 }
 const s=newMachineState(),v={},o={};selectMachine(s,catalog,catalog.machines[0].id,'costos',v,o);
 assert.equal(s.confirmed,false);assert.deepEqual(v,{});
});

test('Históricos sin confirmar se restauran sin activarse ni alterar entradas; la reselección activa la variante',()=>{
 const s=newMachineState(),v={},o={};selectMachine(s,catalog,catalog.machines[0].id,'inyeccion',v,o);
 setMachineConfirmed(s,false,v,o);
 const saved=machineSnapshot(s,v,o),copy=structuredClone(saved),restored=restoreMachine(saved);
 assert.equal(restored.confirmed,false);assert.deepEqual(saved,copy);
 assert.equal(assessMachine(restored,'inyeccion',{metrics:[]},v).checks.length,0);
 selectMachine(restored,catalog,restored.id,'inyeccion',v,o);
 assert.equal(restored.confirmed,true);assert.equal(v.screwD,30);
});
