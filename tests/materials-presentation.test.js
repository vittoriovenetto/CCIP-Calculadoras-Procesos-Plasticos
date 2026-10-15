import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { documentedProperties, hasDocumentedProperty } from "../src/materials-view.js";

const data=JSON.parse(readFileSync(new URL("../src/data/materials.v1.3.json",import.meta.url),"utf8"));
const material=id=>data.materials.find(x=>x.id===id);

test("una propiedad nula o incompleta no genera tarjeta",()=>{
  for(const p of [null,undefined,{}, {value:null},{value:""}, {value:NaN},{value:Infinity},{range:[1]},{range:[3,2]},{range:[1,Infinity]},{value:"0"}]){
    assert.equal(hasDocumentedProperty(p),false,JSON.stringify(p));
  }
  assert.equal(hasDocumentedProperty({value:0,unit:"g/cm3"}),true);
  assert.equal(hasDocumentedProperty({value:0.95,unit:"g/cm3"}),true);
  assert.equal(hasDocumentedProperty({value:null,range:[1,3]}),true);
});
test("genérico y grado de catálogo vacío carecen de ficha",()=>{
  for(const id of ["generic-hdpe","generic-pc",material("catalog-hdpe-dow-08262b")?.id]){
    assert.equal(documentedProperties(material(id)).length,0,id);
  }
});
test("ficha parcial conserva solo propiedades existentes",()=>{
 const pa=material("basf-ultramid-b3s-r03");
 const list=documentedProperties(pa).map(([key])=>key);
 assert.ok(list.includes("solid_density"));
 assert.ok(list.includes("drying_temperature"));
 assert.ok(!list.includes("melt_density"));
 assert.ok(!list.includes("specific_heat"));
});
test("inventario completo: el número de fichas completas/parciales es verificable",()=>{
 const values=data.materials.map(m=>documentedProperties(m).length);
 assert.equal(values.length,99);
 assert.equal(values.filter(x=>x===0).length,90);
 assert.equal(values.filter(x=>x>0).length,9);
});