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
test('GP-35 restaura el MFR respaldado por ASTM y conserva el MVR ISO sin conversión ni error universal',()=>{
 const grade=catalog.materials.find(m=>m.id==='catalog-abs-terluran-gp-35');
 const mfr=grade.additional_properties.find(p=>p.key==='mfr_secondary'),mvr=grade.additional_properties.find(p=>p.key==='mvr_secondary');
 assert.equal(mfr.value,34);assert.equal(mfr.unit,'g/10min');assert.equal(mfr.method,'ASTM D1238');assert.equal(mfr.region,'Americas');
 assert.equal(mvr.value,34);assert.equal(mvr.unit,'cm3/10min');assert.equal(mvr.method,'ISO 1133');assert.equal(mvr.region,'EMEA');assert.notEqual(mfr.source_id,mvr.source_id);
 const decisions=read('docs/etapa-3/source-decisions.json');const historical=decisions.find(d=>d.property_key==='mvr_secondary');assert.equal(historical.status,'superseded_after_regional_review');assert.equal(historical.before.unit,'g/10min');
 const review=read('docs/etapa-3/gp35-regional-review.json');assert.equal(review.identity_conclusion.same_public_sku,true);assert.equal(review.identity_conclusion.same_regional_formulation_proven,false);assert.equal(review.identity_conclusion.same_colored_variant_or_batch_proven,false);
 for(const source of Object.values(review.sources)){assert.match(source.sha256,/^[a-f0-9]{64}$/);assert.match(source.url,/SelectedRegion=Region_/);assert.equal(source.revision_original,'08/01/2022');assert.equal(source.publication_date,null);}
});
test('datos de otro grado y unidades ambiguas no se promueven por coincidencia de URL',()=>{
 const bad=structuredClone(data);bad.records['generic-pc'].facts=[['Density','1.2','g/cm³',null,null,'Physical']];bad.records['generic-pc'].source_id='R-S09';assert.throws(()=>validateResearch(bad,catalog));
 const cross=structuredClone(data);cross.records['dow-dow-12450n'].source_id='R-S09';assert.throws(()=>validateResearch(cross,catalog),/different grade/);
 assert.equal(normalizeDocumentedValue(['Density Range','.940-.950',null,null,null,'Physical']).available,false);
 const mismatch=normalizeDocumentedValue(['Impact Strength in MPa (psi)','273 kJ/m2 (130 ft lb/in2)',null,null,null,'Physical']);assert.equal(mismatch.classification,'pending_verification');assert.equal(mismatch.value,null);
});
test('cobertura parcial: 47 comerciales enriquecidos, 17 sin datos numéricos adicionales y nueve manuales',()=>{
 const commercial=catalog.materials.filter(m=>m.record_status!=='generic_unverified');
 assert.equal(commercial.filter(m=>data.records[m.id].facts.length>0).length,47);
 assert.equal(commercial.filter(m=>data.records[m.id].facts.length===0).length,17);
 assert.equal(catalog.materials.filter(m=>m.record_status==='generic_unverified').length,9);
});
test('la revisión regional conserva todos los números y unidades del catálogo anterior',()=>{
 const before=read('docs/etapa-3/baseline/materials.pre-etapa3.json');
 for(const old of before.materials){const current=catalog.materials.find(m=>m.id===old.id);for(const [key,p]of Object.entries(old.properties)){if(p){assert.equal(current.properties[key].value,p.value);assert.deepEqual(current.properties[key].range,p.range);assert.equal(current.properties[key].unit,p.unit);}else assert.equal(current.properties[key],null);}
 for(const p of old.additional_properties||[]){const now=current.additional_properties.find(x=>x.key===p.key);assert.equal(now.value,p.value);assert.equal(now.unit,p.unit);}}
});
