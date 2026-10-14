/**
 * Custom grade records are private to this browser (localStorage). All data
 * are supplied by the user and never presented as manufacturer-certified.
 * No network calls or implicit family-density defaults.
 */
export const USER_KEY = "ccip-user-materials-v1";
export const FAMILIES = ["HDPE","LLDPE","LDPE","PP","PET","PVC","ABS","PA6","PC"];
export const NUMERICS = {
  solid_density: ["Densidad sólida / Solid density","g/cm3",10],
  melt_density: ["Densidad fundida / Melt density","g/cm3",10],
  bulk_density: ["Densidad aparente / Bulk density","kg/L",10],
  specific_heat: ["Calor específico / Specific heat","kJ/kg·K",30],
  drying_temperature: ["Temperatura de secado / Drying temperature","°C",400],
  drying_time: ["Tiempo de secado / Drying time","h",100],
  moisture_target: ["Humedad objetivo / Target moisture","%",100],
  moisture_max: ["Humedad máxima / Maximum moisture","%",100],
  mfr: ["MFR","g/10min",1000],
  mvr: ["MVR","cm3/10min",1000],
  intrinsic_viscosity: ["Viscosidad intrínseca / Intrinsic viscosity","dL/g",20],
  melt_temperature_recommended: ["Temperatura de proceso / Processing temperature","°C",500],
  melting_temperature: ["Temperatura de fusión / Melting point","°C",500]
};
export const safeId=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,"-").slice(0,45);
const clone=x=>JSON.parse(JSON.stringify(x));
export const listUserMaterials=()=>{
 try{
  const data=JSON.parse(localStorage.getItem(USER_KEY) || "[]");
  return Array.isArray(data)?data.filter(x=>x && x.id?.startsWith("user-") && FAMILIES.includes(x.family) && x.grade && x.properties && typeof x.properties==="object").slice(0,120):[];
 } catch{return []}
};
export function persistUserMaterials(list) {
 if(list.length>120) throw Error("Maximum 120 personal records");
 localStorage.setItem(USER_KEY,JSON.stringify(list));
}
export function makeCustomMaterial(form,existingId){
 const family=String(form.family||"").trim(), grade=String(form.grade||"").trim(), manufacturer=String(form.manufacturer||"Usuario").trim();
 if(!FAMILIES.includes(family)||grade.length<2||grade.length>100||manufacturer.length>100) throw Error("Nombre, familia o fabricante no válido.");
 const id=existingId || "user-"+safeId(family)+"-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8);
 const sourceId="SRC-"+id;
 const url=String(form.url||"").trim();
 if(url && !/^https:\/\/[^ ]{3,500}$/i.test(url)) throw Error("Solo se permiten enlaces HTTPS de fuente.");
 const sourceNote=String(form.source||"").trim().slice(0,500);
 const method=String(form.method||"").trim().slice(0,160);
 const conditions=String(form.conditions||"").trim().slice(0,250);
 const properties={};
 for(const [key,[label,unit,max]] of Object.entries(NUMERICS)){
   const raw=form[key];
   if(raw===""||raw==null){properties[key]=null;continue}
   const value=Number(raw);
   if(!Number.isFinite(value) || (key==="drying_temperature"||key==="melt_temperature_recommended"||key==="melting_temperature"?value<=-273.15:value<0) || value>max) throw Error("Valor fuera de rango: "+label);
   properties[key]={value,unit,source_id:sourceId,method:method||"Indicado por usuario",condition:conditions||null,range:null,status:"user_entered",note:sourceNote||"Origen manual; comprobar con ficha técnica o medición."};
 }
 return {
  id,family,manufacturer:manufacturer||"Usuario",grade,source_id:sourceId,process_tags:[],
  properties,record_status:"user_entered_unverified",revision_review_required:false,
  notes:"Material creado por usuario. Datos no verificados por CCIP; uso condicionado a la trazabilidad y validación del usuario.",
  missing_data_audit:{},reference_properties_not_for_autofill:[],pvt:{
    status:"not_found_grade_specific_public",source_ref:null,calculator_autofill_allowed:false,
    measured_or_calibrated_coefficients:null,graphical_data:"No hay modelo pVT validado para este registro.",T_range_C:null,P_range_MPa:null
  },
  user_source:{manufacturer:manufacturer||"Usuario",grade,url:url||null,description:sourceNote||"Datos introducidos por usuario",entered:true},
  local_updated_on:new Date().toISOString()
 };
}
export function mergeCustomMaterials(catalog, records=listUserMaterials()){
 const data=clone(catalog);
 const found=new Set(data.materials.map(x=>x.id));
 for(const record of records){
  if(found.has(record.id)) continue;
  const id=record.source_id;
  if(!id || !record.user_source) continue;
  data.sources[id]=clone(record.user_source);
  data.materials.push(clone(record));
  found.add(record.id);
 }
 return data;
}
export function renderCustomEditor(root,{onSave,onDelete,lang="es"}={}){
 const en=lang==="en",records=listUserMaterials();
 const text=(es,eng)=>en?eng:es;
 const escape=s=>String(s||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll('"',"&quot;");
 root.innerHTML = `<details id="custom-panel"><summary>${text("Agregar / editar material propio","Add / edit custom material")} (${records.length})</summary>
 <p class="muted">${text("Datos guardados solo en este navegador. Sin validación ni sincronización. Nunca se asumen propiedades de la familia.","Saved only in this browser. Unverified, not synchronized. Family properties are never assumed.")}</p>
 <form id="custom-form"><div class="fields">
 <label>${text("Familia","Family")}<select name="family" required>${FAMILIES.map(f=>`<option value="${f}">${f}</option>`).join("")}</select></label>
 <label>${text("Nombre del material/grado","Material/grade name")}<input name="grade" maxlength="100" required></label>
 <label>${text("Fabricante / procedencia","Manufacturer / origin")}<input name="manufacturer" maxlength="100"></label>
 <label>${text("Fuente o ficha (HTTPS)","Source or datasheet (HTTPS)")}<input name="url" type="url"></label>
 <label>${text("Descripción de fuente","Source description")}<input name="source" maxlength="500"></label>
 <label>${text("Método de medida","Measurement method")}<input name="method" maxlength="160"></label>
 <label>${text("Condiciones (temperatura, presión, fase, lote...)","Conditions (temperature, pressure, phase, batch...)")}<input name="conditions" maxlength="250"></label>
 ${Object.entries(NUMERICS).map(([k,[label,unit,max]])=>`<label>${en?label.split(" / ").at(-1):label.split(" / ")[0]} (${unit})<input name="${k}" type="number" step="any" min="${k==="drying_temperature"||k.includes("temperature")?'-273.14':'0'}" max="${max}" placeholder="—"></label>`).join("")}
 </div><div class="actions"><button type="submit" class="primary">${text("Guardar material local","Save material locally")}</button><button id="custom-export" type="button">${text("Exportar catálogo personal JSON","Export personal catalog JSON")}</button></div></form>
 <p id="custom-feedback" role="status"></p>
 <h3>${text("Mis materiales","My materials")}</h3><div id="custom-list">${records.length?records.map(m=>`<div class="historyRow"><span>${escape(m.family)} · ${escape(m.grade)}</span><span class="material-editor-actions"><button type="button" data-personal-edit="${escape(m.id)}">${text("Editar","Edit")}</button><button type="button" data-personal-delete="${escape(m.id)}">${text("Eliminar","Delete")}</button></span></div>`).join(""):`<p class="muted">${text("Sin registros","No records")}</p>`}</div>
 </details>`;
 root.querySelector("form").addEventListener("submit",e=>{
   e.preventDefault();
   const f=Object.fromEntries(new FormData(e.target));
   try{
     const editing=e.target.dataset.editing || null;
     const record=makeCustomMaterial(f,editing);
     const saved=listUserMaterials();
     if(saved.some(x=>x.id!==editing && x.family===record.family && x.grade.toLowerCase()===record.grade.toLowerCase()))throw Error(text("Ya existe un material con ese nombre","Material name already exists"));
     if(editing && !saved.some(x=>x.id===editing))throw Error(text("El material a editar no existe","Material not found"));
     const updated=editing ? saved.map(x=>x.id===editing?record:x):[...saved,record];
     persistUserMaterials(updated);onSave?.(record);
   }catch(error){root.querySelector("#custom-feedback").textContent=error.message}
 });
 root.querySelectorAll("[data-personal-edit]").forEach(el=>el.addEventListener("click",()=>{
   const record=listUserMaterials().find(m=>m.id===el.dataset.personalEdit);
   if(!record)return;
   const form=root.querySelector("#custom-form");
   form.dataset.editing=record.id;
   const values={family:record.family,grade:record.grade,manufacturer:record.manufacturer,
     url:record.user_source?.url||"",source:record.user_source?.description||"",
     method:Object.values(record.properties).find(p=>p?.method)?.method||"",
     conditions:Object.values(record.properties).find(p=>p?.condition)?.condition||""};
   for(const [key,p] of Object.entries(record.properties))if(p?.value!=null)values[key]=p.value;
   for(const [key,val] of Object.entries(values))if(form.elements.namedItem(key))form.elements.namedItem(key).value=val;
   root.querySelector("#custom-panel").open=true;
   form.querySelector('[name="grade"]').focus();
   root.querySelector("#custom-feedback").textContent=text("Editando material existente","Editing an existing material");
 }));
 root.querySelectorAll("[data-personal-delete]").forEach(el=>el.addEventListener("click",()=>{
   if(!confirm(text("¿Eliminar material guardado?","Delete saved material?")))return;
   const remaining=listUserMaterials().filter(x=>x.id!==el.dataset.personalDelete);
   persistUserMaterials(remaining);onDelete?.();
 }));
 root.querySelector("#custom-export").addEventListener("click",()=>{
   const blob=new Blob([JSON.stringify(listUserMaterials(),null,2)],{type:"application/json"});
   const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="ccip-materiales-personales.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 });
}
