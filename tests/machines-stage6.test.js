import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {calculate} from '../src/engine.js';
import {validateMachineCatalog,machinesFor,newMachineState,selectMachine,setMachineConfirmed,assessMachine,machineSnapshot,restoreMachine} from '../src/machines.js';
import {prepareExport} from '../src/export-data.js';
const raw=JSON.parse(readFileSync(new URL('../src/data/machines.v1.json',import.meta.url),'utf8'));
const catalog=validateMachineCatalog(raw);
test('Maquinaria: seis fichas oficiales y ninguna capacidad ficticia para costos',()=>{
 assert.equal(catalog.machines.length,6);
 for(const id of ['inyeccion','extrusion','pelicula','soplado','termoformado','secado'])assert.equal(machinesFor(catalog,id).length,1);
 assert.equal(machinesFor(catalog,'costos').length,0);
 assert.equal(new Set(catalog.machines.map(x=>x.id)).size,6);
 assert.ok(catalog.machines.every(x=>x.source.url.startsWith('https://')));
});
test('Maquinaria: rechaza URLs inseguras, duplicados y autofill en series',()=>{
 const a=structuredClone(catalog);a.machines.push(structuredClone(a.machines[0]));assert.throws(()=>validateMachineCatalog(a));
 const b=structuredClone(catalog);b.machines[0].source.url='javascript:alert(1)';assert.throws(()=>validateMachineCatalog(b));
 const c=structuredClone(catalog);c.machines[1].autofill_fields={screwD:'screw_diameter_range_mm'};assert.throws(()=>validateMachineCatalog(c));
});
test('Máquina ARBURG: exige consentimiento y conserva overrides manuales',()=>{
 const s=newMachineState(),v={screwD:'',screwMaxStroke:''},origins={};
 selectMachine(s,catalog,'arburg-allrounder-370s-700-290-s30','inyeccion',v,origins);
 assert.equal(v.screwD,'');setMachineConfirmed(s,true,v,origins);
 assert.equal(v.screwD,30);assert.equal(v.screwMaxStroke,150);assert.equal(origins.screwD,'machine_catalog');
 v.screwD=35;origins.screwD='manual';setMachineConfirmed(s,false,v,origins);
 assert.equal(v.screwD,35);assert.equal(v.screwMaxStroke,'');
});
test('Máquina: no se transfieren especificaciones de otra etapa o proceso',()=>{
 const s=newMachineState(),v={screwD:'',screwMaxStroke:''},origins={};
 selectMachine(s,catalog,'arburg-allrounder-370s-700-290-s30','extrusion',v,origins);assert.equal(s.id,'');
 selectMachine(s,catalog,'battenfeld-cincinnati-uniex-series','extrusion',v,origins);setMachineConfirmed(s,true,v,origins);
 assert.equal(s.confirmed,false);assert.equal(v.screwD,'');
 assert.equal(assessMachine(s,'extrusion',{metrics:[]}).checks.length,0);
});
test('ARBURG: fuerza en tf se convierte a kN; compara 106 cm³ y 700 kN',()=>{
 const s=newMachineState(),v={screwD:'',screwMaxStroke:''},origins={};
 selectMachine(s,catalog,'arburg-allrounder-370s-700-290-s30','inyeccion',v,origins);
 setMachineConfirmed(s,true,v,origins);
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
 selectMachine(s,catalog,'arburg-allrounder-370s-700-290-s30','inyeccion',v,origins);setMachineConfirmed(s,true,v,origins);
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
 assert.equal(assessMachine(s,'secado',{metrics:[{label:'Volumen útil mínimo de tolva',value:33,unit:'L'}]}).checks.length,0);
});
test('Exportación de snapshot de máquina no recalcula ni cambia las entradas',()=>{
 const s=newMachineState(),v={screwD:'',screwMaxStroke:''},origins={};
 selectMachine(s,catalog,'arburg-allrounder-370s-700-290-s30','inyeccion',v,origins);setMachineConfirmed(s,true,v,origins);
 const record={module:'inyeccion',level:'technical',date:'2026-10-16T20:00:00Z',inputs:{...v},machine:machineSnapshot(s),metrics:[],warnings:[],notes:[]};
 const before=structuredClone(record);
 const out=prepareExport(record);assert.ok(out.summary.some(x=>x[1]===s.profile.model));
 assert.ok(out.sources.some(x=>String(x[1]).includes('arburg.com')));
 assert.deepEqual(record,before);
});
