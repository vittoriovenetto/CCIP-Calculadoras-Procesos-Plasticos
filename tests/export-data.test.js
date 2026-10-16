import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareExport, exportValue, safeLink } from '../src/export-data.js';
const snapshot={module:'inyeccion',level:'advanced',date:'2026-10-16T14:00:00Z',inputs:{partMass:'0001.234567890123',runnerMass:'',cavities:'0'},metrics:[{label:'Histórico',value:123.4567890123,unit:'cm³',formula:'V = m / ρ'},{label:'Pendiente',value:null}],warnings:['Histórica'],notes:['Sin validación industrial'],material:{used_fields:{partMass:{origin:'manual',value:'0001.234567890123'}},source:{url:'https://example.org/ficha'}}};
test('preparación no recalcula ni muta snapshot y conserva entradas, precisión y ausentes',()=>{
 const before=JSON.stringify(snapshot),data=prepareExport(snapshot,{status:'saved'});
 assert.equal(JSON.stringify(snapshot),before);assert.equal(data.results[0].value,123.4567890123);assert.equal(data.results[1].value,null);
 assert.equal(data.parameters[0].original,'0001.234567890123');assert.equal(data.parameters[0].value,1.234567890123);assert.equal(data.parameters[1].value,null);assert.equal(data.parameters[2].value,0);
 assert.equal(data.record.export_metadata.status,'saved');assert.ok(data.sources.some(row=>row[2]==='https://example.org/ficha'));
});
test('traducciones y trazabilidad distinguen referencia, ejemplo, manual e histórico desconocido',()=>{
 const s=structuredClone(snapshot);s.material.used_fields.partMass.origin='family_reference';s.calculation_metadata={input_origins:{cavities:'default_example'}};
 const data=prepareExport(s,{language:'en',status:'active'});assert.match(data.parameters[0].origin,/estimate/);assert.match(data.parameters[1].origin,/not recorded/);assert.match(data.parameters[2].origin,/example/);assert.match(data.summary[7][1],/Active state/);
});
test('fuentes inseguras no se activan como enlaces y datos antiguos incompletos exportan',()=>{
 for(const url of ['javascript:alert(1)','http://example.org','https://u:p@example.org','not a url'])assert.equal(safeLink(url),null);
 const data=prepareExport({...snapshot,material:null,warnings:'bad',notes:{},metrics:null});assert.deepEqual(data.results,[]);assert.equal(data.profile.length,0);
 assert.equal(exportValue(''),null);assert.equal(exportValue(null),null);assert.equal(exportValue(Infinity),null);assert.equal(exportValue('=1+1'),'=1+1');
});

test('unidades de parámetros se localizan sin convertir cantidades ni mutar el snapshot',()=>{
 const s={...snapshot,module:'costos',inputs:{resinCost:'12.50'}};
 const data=prepareExport(s,{language:'en'});assert.equal(data.parameters[0].unit,'currency/kg');assert.equal(data.parameters[0].value,12.5);assert.equal(data.record.inputs.resinCost,'12.50');
});
