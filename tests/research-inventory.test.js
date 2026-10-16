import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const json=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const baseline=json('docs/etapa-3/baseline/materials.pre-etapa3.json');
const current=json('src/data/materials.v1.3.json');
const records=json('docs/etapa-3/fase-a/inventory.json');
test('Etapa 3 conserva las 73 identidades y la copia anterior inmutable',()=>{
 const manifest=json('docs/etapa-3/baseline/manifest.json');
 assert.equal(createHash('sha256').update(readFileSync(new URL('../docs/etapa-3/baseline/'+manifest.file,import.meta.url))).digest('hex'),manifest.sha256);
 const identity=material=>[material.id,material.family,material.manufacturer,material.grade,material.record_status==='generic_unverified'];
 assert.deepEqual(current.materials.map(identity),baseline.materials.map(identity));
 assert.equal(new Set(current.materials.map(m=>m.id)).size,73);
 assert.equal(current.materials.filter(m=>m.record_status==='generic_unverified').length,9);
});
test('inventario individual conserva entradas, propiedades originales y búsquedas ejecutadas',()=>{
 assert.equal(records.length,73);
 for(const material of baseline.materials){
  const record=records.find(r=>r.id===material.id);assert.ok(record,material.id);
  assert.deepEqual(record.properties_original,material.properties);assert.deepEqual(record.additional_properties_original,material.additional_properties||[]);
  assert.equal(record.new_properties,0);assert.equal(record.corrected_properties,0);assert.ok(record.search_attempts>0);
 }
});
test('la recopilación no certifica fuentes por HTTP ni fabrica versiones de normas',()=>{
 const requests=json('docs/etapa-3/fase-a/requests.json');assert.ok(requests.length>50);
 for(const request of requests){assert.equal(request.verified,false);if(request.content_read){assert.match(request.sha256,/^[a-f0-9]{64}$/);assert.equal(request.http_status,200);}}
 for(const measurement of json('docs/etapa-3/fase-a/flow-before.json')){assert.equal(measurement.conversion_performed,false);assert.equal(measurement.standard_edition,null);}
});
test('los 26 grados previamente excluidos no vuelven al catálogo',()=>{
 const old=json('docs/auditoria-estricta-materiales-v1.4.json');const ids=new Set(current.materials.map(m=>m.id));
 const excluded=old.records.filter(r=>r.decision==='REMOVE');assert.equal(excluded.length,26);
 for(const record of excluded)assert.ok(!ids.has(record.id),record.id);
});
