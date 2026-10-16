import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateResearch,normalizeDocumentedValue,researchSnapshot,evidenceKinds} from '../src/research-data.js';
const read=name=>JSON.parse(readFileSync(new URL('../'+name,import.meta.url)));
const data=read('src/data/material-research.v1.json'),catalog=read('src/data/materials.v1.3.json');
test('evidencia de fase B: identidad, fuente consultada, originales y genéricos separados',()=>{
 validateResearch(data,catalog);assert.equal(evidenceKinds.length,8);
 for(const [id,record] of Object.entries(data.records)){
  const grade=catalog.materials.find(m=>m.id===id);assert.ok(grade);
  if(grade.record_status==='generic_unverified')assert.deepEqual(record.facts,[]);
  if(record.facts.length){const source=data.sources[record.source_id];assert.equal(source.grade,grade.grade);assert.match(source.url,/^https:\/\//);assert.match(source.sha256,/^[a-f0-9]{64}$/);assert.equal(source.verification_status,'content_reviewed_exact_grade');}
  assert.equal(new Set(record.facts.map(row=>JSON.stringify(row))).size,record.facts.length,'Filas idénticas duplicadas '+id);
 }
});
test('normalización conserva valores, rangos y límites sin inventar ceros o promedios',()=>{
 const row=(label,value,unit='MPa')=>[label,value,unit,null,'ISO 527','Mechanical properties'];
 assert.equal(normalizeDocumentedValue(row('Tensile Modulus','2,400')).value,2400);
 const original=row('Molding Shrinkage','0.60 - 0.80','%');assert.deepEqual(normalizeDocumentedValue(original).range,[.6,.8]);assert.equal(normalizeDocumentedValue(original).value,null);
 assert.deepEqual(normalizeDocumentedValue(row('Strain at Break','> 50','%')).bound,{operator:'>',value:50});
 assert.equal(normalizeDocumentedValue(row('Charpy Impact','N','kJ/m²')).value,null);
 assert.equal(normalizeDocumentedValue(row('Charpy Impact','65P','kJ/m²')).value,null);
 assert.equal(normalizeDocumentedValue(row('Unknown','',null)).value,null);
 assert.equal(normalizeDocumentedValue(row('Elongation','600 %',null)).value,600);
 assert.equal(normalizeDocumentedValue(row('Hardness Shore D','110','-')).classification,'pending_verification');
 assert.deepEqual(original,row('Molding Shrinkage','0.60 - 0.80','%'));
});
test('el snapshot documental conserva versión y evidencia sin depender del catálogo futuro',()=>{
 const id='covestro-makrolon-2405',snap=researchSnapshot(data,id);const before=structuredClone(data.records[id]);
 snap.facts[0][1]='9999';assert.deepEqual(data.records[id],before);assert.equal(snap.source.grade,'Makrolon 2405');assert.equal(researchSnapshot(data,'unknown'),null);
});
test('corrección GP-35 cambia tipo y unidad con evidencia; conserva el valor 34 y el estado anterior',()=>{
 const grade=catalog.materials.find(m=>m.id==='catalog-abs-terluran-gp-35');const corrected=grade.additional_properties.find(p=>p.key==='mvr_secondary');
 assert.equal(corrected.value,34);assert.equal(corrected.unit,'cm3/10min');assert.equal(corrected.method,'ISO 1133');assert.ok(!grade.additional_properties.some(p=>p.key==='mfr_secondary'&&p.value===34));
 const decisions=read('docs/etapa-3/source-decisions.json');const decision=decisions.find(d=>d.property_key==='mvr_secondary');assert.equal(decision.before.unit,'g/10min');assert.equal(decision.after.value,34);
});
test('datos de otro grado y unidades ambiguas no se promueven por coincidencia de URL',()=>{
 const bad=structuredClone(data);bad.records['generic-pc'].facts=[['Density','1.2','g/cm³',null,null,'Physical']];bad.records['generic-pc'].source_id='R-S09';assert.throws(()=>validateResearch(bad,catalog));
 const cross=structuredClone(data);cross.records['dow-dow-12450n'].source_id='R-S09';assert.throws(()=>validateResearch(cross,catalog),/different grade/);
 assert.equal(normalizeDocumentedValue(['Density Range','.940-.950',null,null,null,'Physical']).available,false);
 const mismatch=normalizeDocumentedValue(['Impact Strength in MPa (psi)','273 kJ/m2 (130 ft lb/in2)',null,null,null,'Physical']);assert.equal(mismatch.classification,'pending_verification');assert.equal(mismatch.value,null);
});
