import { modules } from "./schema.js";
import { calculate } from "./engine.js";
import { t } from "./i18n.js";
function renderIndex(){
  const root=document.querySelector("#formulas-exact-index");
  if(!root)return;
  const lang=document.querySelector("#language")?.value==="en"?"en":"es";
  root.replaceChildren();
  const h=document.createElement("h2");
  h.textContent=lang==="en"?"Complete output-to-formula index":"Índice completo de resultados y fórmulas";
  root.append(h);
  const intro=document.createElement("p");
  intro.className="muted";
  intro.textContent=lang==="en"?"These equations and units come directly from the installed calculation engine. They are not certified plant models.":"Estas ecuaciones y unidades se leen del motor matemático de la aplicación. No sustituyen modelos validados de planta.";
  root.append(intro);
  let total=0;
  for(const m of modules){
    const entry=document.createElement("section");
    entry.className="formula-topic";
    const heading=document.createElement("h3");heading.textContent=t(m.name,lang);entry.append(heading);
    const table=document.createElement("table");table.className="formula-full-index";
    const tr=document.createElement("tr");
    for(const name of (lang==="en"?["Calculated output","Equation used","Unit"]:["Resultado calculado","Ecuación utilizada","Unidad"])){
      const th=document.createElement("th");th.textContent=name;tr.append(th);
    }
    const header=document.createElement("thead");header.append(tr);table.append(header);
    const tbody=document.createElement("tbody");
    for(const value of calculate(m.id,{}, "advanced").metrics){
      total++;
      const row=document.createElement("tr");
      for(const item of [t(value.label,lang),value.formula,value.unit]){
        const cell=document.createElement("td");cell.textContent=String(item??"");row.append(cell);
      }
      tbody.append(row);
    }
    table.append(tbody);entry.append(table);root.append(entry);
  }
  const count=document.createElement("p");
  count.className="muted";
  count.textContent=lang==="en"?total+" calculation outputs across "+modules.length+" processes.":total+" resultados calculados en "+modules.length+" procesos.";
  root.prepend(count);
}
renderIndex();
document.getElementById("language")?.addEventListener("change",renderIndex);
