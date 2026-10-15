import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {searchMaterials,documentedCount} from "../src/material-search.js";
import {compareRecords,comparisonCSV} from "../src/compare.js";
const d=JSON.parse(readFileSync(new URL("../src/data/materials.v1.3.json",import.meta.url),"utf8"));
test("search across family, manufacturer, grade, accent-neutral",()=>{
 const data=d.materials;
 assert.equal(data.length,73);
 assert.ok(searchMaterials(data,{query:"2045"}).some(m=>m.grade==="DOWLEX 2045G"));
 assert.ok(searchMaterials(data,{query:"dow 2045"}).some(m=>m.grade==="DOWLEX 2045G"));
 assert.ok(searchMaterials(data,{query:"MOPLEN",family:"PP"}).every(m=>m.family==="PP"));
 assert.ok(searchMaterials(data,{query:"MAKROLON",manufacturer:"Covestro"}).some(m=>m.grade==="Makrolon 2405"));
 assert.ok(searchMaterials(data,{query:"PVC",onlyWithData:true}).some(m=>m.grade==="Westlake PVC 1195"));
 assert.equal(searchMaterials(data,{query:"generic",onlyWithData:true}).length,0);
 assert.equal(documentedCount(d.materials.find(m=>m.id==="generic-hdpe")),0);
 assert.ok(documentedCount(d.materials.find(m=>m.id==="catalog-hdpe-dow-08262b"))>=2);
 assert.equal(searchMaterials(data,{query:"xyznotamaterial"}).length,0);
});
test("comparison respects units, missing values, reference-zero and process",()=>{
 const a={module:"inyeccion",date:"2026-10-15",inputs:{partMass:30},metrics:[{label:"Shot calculado (masa)",value:60,unit:"g"},{label:"Shot calculado (volumen)",value:null,unit:"cm³"},{label:"Utilización",value:0,unit:"%"}]};
 const b={module:"inyeccion",date:"2026-10-15",inputs:{partMass:40},metrics:[{label:"Shot calculado (masa)",value:80,unit:"g"},{label:"Shot calculado (volumen)",value:100,unit:"g"},{label:"Utilización",value:5,unit:"%"}]};
 const o=compareRecords(a,b);
 assert.equal(o.error,null);
 assert.equal(o.rows[0].diff,20);
 assert.ok(Math.abs(o.rows[0].pct-33.333333333333336)<1e-8);
 assert.equal(o.rows[1].comparable,false);
 assert.equal(o.rows[1].diff,null);
 assert.equal(o.rows[2].pct,null);
 assert.equal(o.rows[2].diff,5);
 assert.match(comparisonCSV(a,b,o),/Shot calculado/);
 assert.match(comparisonCSV(a,b,o),/Caso A/);
 assert.ok(compareRecords(a,{...b,module:"secado"}).error);
 assert.ok(compareRecords(a,undefined).error);
});
test("CSV escapes formulas and quote sequences without losing delimiters",()=>{
 const a={module:"pelicula",metrics:[{label:'Volumen "A";=alert',unit:"g",value:1}]};
 const b={module:"pelicula",metrics:[{label:'Volumen "A";=alert',unit:"g",value:2}]};
 const text=comparisonCSV(a,b,compareRecords(a,b));
 assert.ok(text.includes('"Volumen ""A"";=alert"'));
});
test("only verified additional property records become available",()=>{
 const records=d.materials.filter(m=>m.data_review?.status==="manufacturer_webpage_reviewed");
 assert.equal(records.length,18);
 for(const m of records){
   assert.ok(m.properties.solid_density?.value);
   assert.ok(m.properties.mfr?.value!==undefined);
   assert.equal(m.properties.mfr.method,"ASTM D1238");
   assert.match(m.properties.mfr.condition,/190 °C/);
   assert.equal(m.properties.melt_density,null);
 }
 for(const m of d.materials.filter(x=>x.record_status==="generic_unverified"))
   assert.ok(Object.values(m.properties).every(v=>v===null));
});
