import {searchMaterials, documentedCount} from "./material-search.js";
import {t} from "./i18n.js";
// Search state persists when the parent view redraws after material selection.
const state={query:"",family:"",manufacturer:"",dataOnly:false,expanded:false};
export function renderMaterialSearch(host,library,onSelect) {
 const root=host.querySelector("#material-finder");
 if(!root)return;
 const en=document.documentElement.lang==="en";
 const tr=(a,b)=>en?b:a;
 const families=[...new Set((library?.materials||[]).map(m=>m.family))].sort();
 const makers=[...new Set((library?.materials||[]).filter(m=>!state.family||m.family===state.family).map(m=>m.manufacturer))].sort();
 if(state.manufacturer&&!makers.includes(state.manufacturer))state.manufacturer="";
 root.innerHTML="";
 const controls=document.createElement("div");
 controls.className="finder-controls";
 const title=document.createElement("label");title.htmlFor="material-search";title.textContent=tr("Buscar por familia, fabricante o grado","Search by family, manufacturer or grade");
 const input=document.createElement("input");input.type="search";input.id="material-search";input.autocomplete="off";input.placeholder=tr("Ej.: HDPE, Dow, 2045G, Makrolon…","E.g. HDPE, Dow, 2045G, Makrolon…");input.value=state.query;
 const row=document.createElement("div");row.className="finder-filters";
 const fam=document.createElement("select");fam.id="finder-family";fam.setAttribute("aria-label",tr("Filtrar familia","Filter family"));
 const maker=document.createElement("select");maker.id="finder-manufacturer";maker.setAttribute("aria-label",tr("Filtrar fabricante","Filter manufacturer"));
 const options=(sel,values,prompt,current)=>{
  const empty=document.createElement("option");empty.value="";empty.textContent=prompt;sel.append(empty);
  for(const val of values){const opt=document.createElement("option");opt.value=val;opt.textContent=val;sel.append(opt)}
  sel.value=current;
 };
 options(fam,families,tr("Todas las familias","All families"),state.family);
 options(maker,makers,tr("Todos los fabricantes","All manufacturers"),state.manufacturer);
 const only=document.createElement("label");only.className="finder-only";
 const checkbox=document.createElement("input");checkbox.type="checkbox";checkbox.id="finder-with-data";checkbox.checked=state.dataOnly;
 const text=document.createElement("span");text.textContent=tr("Solo con propiedades registradas","With recorded properties only");
 only.append(checkbox,text);row.append(fam,maker);
 const results=document.createElement("div");results.id="material-search-results";results.className="finder-results";results.setAttribute("aria-live","polite");
 controls.append(title,input,row,only,results);root.append(controls);
 const show=()=>{
  const all=searchMaterials(library?.materials||[],{query:state.query,family:state.family,manufacturer:state.manufacturer,onlyWithData:state.dataOnly});
  results.replaceChildren();
  const count=document.createElement("p");count.className="muted finder-count";count.textContent=tr(all.length+" coincidencias",""+all.length+" matches");results.append(count);
  const limit=state.expanded?all.length:Math.min(8,all.length);
  for(const m of all.slice(0,limit)){
   const btn=document.createElement("button");btn.type="button";btn.className="finder-option";
   btn.dataset.gradeId=m.id;
   const identity=document.createElement("span");identity.className="finder-identity";
   const nm=document.createElement("b");nm.textContent=m.grade;
   const by=document.createElement("small");by.textContent=m.family+" · "+m.manufacturer;
   identity.append(nm,by);
   const available=promptStatus(m,tr);
   const right=document.createElement("small");right.className="finder-available";right.textContent=available;
   btn.append(identity,right);
   if(m.id===host.querySelector("#material-grade")?.value){btn.classList.add("selected");btn.setAttribute("aria-pressed","true")}
   btn.addEventListener("click",()=>onSelect(m.id));
   results.append(btn);
  }
  if(!all.length){const p=document.createElement("p");p.className="muted";p.textContent=tr("Sin coincidencias. Prueba otro filtro.","No matches. Try another filter.");results.append(p)}
  if(limit<all.length){const more=document.createElement("button");more.type="button";more.className="finder-more";more.textContent=tr("Ver los "+all.length+" resultados","Show all "+all.length+" results");more.addEventListener("click",()=>{state.expanded=true;show()});results.append(more)}
 };
 input.addEventListener("input",()=>{state.query=input.value;state.expanded=false;show()});
 fam.addEventListener("change",()=>{state.family=fam.value;state.manufacturer="";state.expanded=false;renderMaterialSearch(host,library,onSelect)});
 maker.addEventListener("change",()=>{state.manufacturer=maker.value;state.expanded=false;show()});
 checkbox.addEventListener("change",()=>{state.dataOnly=checkbox.checked;state.expanded=false;show()});
 show();
}
function promptStatus(material,tr){
 const n=documentedCount(material);
 if(material.record_status==="generic_unverified")return tr("Genérico","Generic");
 return n>0?tr(n+" propiedades",n+" properties"):tr("Sin datos","No values");
}
