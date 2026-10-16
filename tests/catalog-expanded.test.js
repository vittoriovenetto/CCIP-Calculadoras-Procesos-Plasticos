import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {validateLibrary, selectMaterial, createMaterialState, applyMaterial} from "../src/materials.js";
import {modules} from "../src/schema.js";
import {makeCustomMaterial,mergeCustomMaterials,FAMILIES} from "../src/custom-materials.js";
import {t} from "../src/i18n.js";
const raw=JSON.parse(readFileSync(new URL("../src/data/materials.v1.3.json",import.meta.url),"utf8"));
test("73 curated profiles: 64 published commercial grades plus nine generic manual families",()=>{
 const lib=validateLibrary(raw);
 assert.equal(lib.materials.length,73);
 assert.equal(lib.catalog_revision,"1.5.1");
 for(const family of FAMILIES){
   const entries=lib.materials.filter(x=>x.family===family);
   assert.ok(entries.length>=2,family);
   assert.equal(entries.filter(x=>x.record_status==="generic_unverified").length,1,family);
   assert.ok(entries.filter(x=>x.record_status!=="generic_unverified").length>=1,family);
   assert.equal(new Set(entries.map(x=>x.id)).size,entries.length);
 }
});
test("generic materials never assume densities",()=>{
 for(const family of FAMILIES){
   const material=raw.materials.find(x=>x.family===family&&x.record_status==="generic_unverified");
   assert.ok(material);
   assert.equal(material.properties.solid_density,null);
   assert.equal(material.properties.melt_density,null);
   assert.equal(material.properties.bulk_density,null);
   assert.equal(material.properties.specific_heat,null);
 }
});
test("source urls on every commercial grade are HTTPS and linked to manufacturer records",()=>{
 for(const m of raw.materials.filter(x=>x.record_status!=="generic_unverified")){
   assert.match(raw.sources[m.source_id].url,/^https:\/\//);
   for(const p of Object.values(m.properties).filter(Boolean))assert.ok(raw.sources[p.source_id]);
 }
});
test("custom user material is explicitly unverified and fields absent remain null",()=>{
 const m=makeCustomMaterial({family:"HDPE",grade:"Lote propio 003",manufacturer:"Planta",melt_density:"0.78",solid_density:"0.95",source:"Ensayo de planta",method:"PVT",conditions:"220 °C 30 MPa"});
 assert.equal(m.record_status,"user_entered_unverified");
 assert.equal(m.properties.melt_density.value,.78);
 assert.equal(m.properties.melt_density.status,"user_entered");
 assert.equal(m.properties.specific_heat,null);
 assert.equal(m.properties.mfr,null);
 const all=validateLibrary(mergeCustomMaterials(raw,[m]));
 assert.equal(all.materials.length,74);
 const materialState=createMaterialState();const values={meltDensity:"",cavities:1};
 selectMaterial(all,materialState,values,m.id);
 applyMaterial(materialState,modules.find(x=>x.id==="inyeccion"),values,"technical");
 assert.equal(values.meltDensity,"","not applied without compatibility confirmation");
 materialState.context.compatible=true;
 applyMaterial(materialState,modules.find(x=>x.id==="inyeccion"),values,"technical");
 assert.equal(values.meltDensity,.78);
 assert.equal(materialState.provenance.meltDensity.origin,"user_custom");
});
test("invalid custom entries are rejected",()=>{
 assert.throws(()=>makeCustomMaterial({family:"UNKNOWN",grade:"X"}));
 assert.throws(()=>makeCustomMaterial({family:"PC",grade:"X",melt_density:"-1"}));
 assert.throws(()=>makeCustomMaterial({family:"PP",grade:"X",solid_density:"Infinity"}));
 assert.throws(()=>makeCustomMaterial({family:"PP",grade:"X",url:"javascript:alert(1)"}));
});
test("translate core UI labels while preserving original",()=>{
 assert.equal(t("Moldeo por inyección","en"),"Injection molding");
 assert.equal(t("Moldeo por inyección","es"),"Moldeo por inyección");
 assert.equal(t("Densidad del fundido","en"),"Melt density");
});