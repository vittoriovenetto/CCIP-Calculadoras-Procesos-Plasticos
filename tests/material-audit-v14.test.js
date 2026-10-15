import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {searchMaterials} from "../src/material-search.js";
import {validateLibrary} from "../src/materials.js";
const lib=JSON.parse(readFileSync(new URL("../src/data/materials.v1.3.json",import.meta.url),"utf8"));
const audit=JSON.parse(readFileSync(new URL("../docs/auditoria-estricta-materiales-v1.4.json",import.meta.url),"utf8"));
const valid=p=>p&&typeof p==="object"&&((typeof p.value==="number"&&Number.isFinite(p.value))||(Array.isArray(p.range)&&p.range.length===2&&p.range.every(x=>typeof x==="number"&&Number.isFinite(x))));
const names=m=>[...Object.entries(m.properties||{}).filter(([k,p])=>valid(p)).map(([k])=>k),...(m.additional_properties||[]).filter(valid).map(p=>p.key)];
const category=k=>/density/.test(k)?"physical":/mfr|mvr|viscosity|k_value/.test(k)?"flow":/drying|moisture/.test(k)?"drying":/tensile|flexural|impact|modulus|hardness|strength|secant/.test(k)?"mechanical":/melt_temperature|melting|vicat|deflection|heat/.test(k)?"thermal":"other";
test("auditoría v1.4 elimina 26 grados sin 3 propiedades y conserva familias",()=>{
 validateLibrary(lib);assert.equal(lib.materials.length,73);
 assert.equal(audit.records.length,99);assert.equal(audit.counts.removed,26);
 const ids=new Set(lib.materials.map(x=>x.id));
 for(const rec of audit.records)assert.equal(ids.has(rec.id),rec.decision!=="REMOVE",rec.grade);
 for(const family of ["HDPE","LLDPE","LDPE","PP","PET","PVC","ABS","PA6","PC"]){
 const members=lib.materials.filter(m=>m.family===family);assert.ok(members.length>=2);
 assert.equal(members.filter(m=>m.record_status==="generic_unverified").length,1);
 }
});
test("cada grado comercial tiene ≥3 propiedades trazables en ≥2 grupos",()=>{
 const commercial=lib.materials.filter(m=>m.record_status!=="generic_unverified");
 assert.equal(commercial.length,64);
 for(const m of commercial){
 const k=names(m);
 assert.ok(k.length>=3,m.grade+" has "+k.length);
 assert.ok(new Set(k.map(category)).size>=2,m.grade);
 const source=lib.sources[m.source_id];assert.match(source.url,/^https:\/\//,m.grade);
 const entries=[...Object.values(m.properties||{}),...(m.additional_properties||[])].filter(valid);
 for(const p of entries)assert.equal(p.source_id,m.source_id,m.grade+" "+p.key);
 assert.equal(m.properties.melt_density,null,"Melt density must remain missing for grade without pvT: "+m.grade);
 }
});
test("genéricos y grados excluidos no contaminan cálculos ni buscador",()=>{
 for(const m of lib.materials.filter(m=>m.record_status==="generic_unverified")){
 assert.ok(Object.values(m.properties).every(p=>p===null));
 assert.equal((m.additional_properties||[]).length,0);
 }
 for(const r of audit.records.filter(r=>r.decision==="REMOVE")){
 assert.ok(!searchMaterials(lib.materials,{query:r.id}).some(m=>m.id===r.id),r.id);
 }
 const hi=lib.materials.find(m=>m.id==="catalog-abs-terluran-hi-10");
 assert.equal(hi.properties.drying_temperature,null);
 assert.ok(hi.additional_properties.some(p=>p.key==="drying_temperature_source_f"&&p.unit==="°F"));
});
