import { t } from "./i18n.js";
// Comparador y exportador offline. Usa los snapshots guardados; no recalcula
// resultados con propiedades que pudieron cambiar desde la fecha de guardado.
export function compareRecords(a,b){
 if(!a||!b)return {rows:[],error:"Selecciona dos cálculos guardados."};
 if(a.module!==b.module)return {rows:[],error:"Selecciona cálculos del mismo proceso para comparar unidades y modelos compatibles."};
 const other=new Map((b.metrics||[]).map(m=>[m.label,m]));
 const rows=(a.metrics||[]).filter(m=>other.has(m.label)).map(m=>{
   const second=other.get(m.label);
   const comparable=m.unit===second.unit;
   const av=(typeof m.value==="number"&&Number.isFinite(m.value))?m.value:null;
   const bv=(typeof second.value==="number"&&Number.isFinite(second.value))?second.value:null;
   const diff=comparable&&av!==null&&bv!==null?bv-av:null;
   const pct=diff!==null&&av!==0?100*diff/Math.abs(av):null;
   return {name:m.label,unit:m.unit,first:av,second:bv,diff,pct,comparable,first_estimated:m.density_estimate===true,second_estimated:second.density_estimate===true};
 });
 return {rows,error:null,commonInputs:Object.keys(a.inputs||{}).filter(k=>JSON.stringify(a.inputs[k])===JSON.stringify(b.inputs?.[k])),module:a.module,gradeA:a.material?.grade_snapshot?.grade||"",gradeB:b.material?.grade_snapshot?.grade||""};
}
const safe=t=>String(t??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
const fmt=n=>n===null||n===undefined?"—":Number(n).toLocaleString("es-DO",{maximumFractionDigits:3});
export const csvCell=value=>'"'+String(value??"").replaceAll('"','""')+'"';
export function comparisonCSV(a,b,output){
 const lines=[
 ["CCIP — Comparación de cálculos"],
 ["Modelo",output.module],
 ["Caso A",a?.date||"",output.gradeA],
 ["Caso B",b?.date||"",output.gradeB],
 [],
 ["Resultado","Unidad","Caso A","Caso B","Diferencia B - A","Variación %","Estimación A","Estimación B","Densidad A [g/cm³]","Origen A","Fuente A","Densidad B [g/cm³]","Origen B","Fuente B"]
 ];
 for(const r of output.rows)lines.push([r.name,r.unit,r.first,r.second,r.diff,r.pct,r.first_estimated,r.second_estimated,a?.density_assessment?.value_g_cm3,a?.density_assessment?.origin,a?.density_assessment?.source?.url||a?.density_assessment?.source?.title,b?.density_assessment?.value_g_cm3,b?.density_assessment?.origin,b?.density_assessment?.source?.url||b?.density_assessment?.source?.title]);
 return "\ufeff"+lines.map(row=>row.map(csvCell).join(";")).join("\r\n");
}
const download=(body,filename,type)=>{
 const url=URL.createObjectURL(new Blob([body],{type}));
 const a=document.createElement("a");a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),500);
};
const state={a:"",b:"",manualSelection:false};
export function renderComparison(root,history,modules){
 if(!root)return;
 const lang=document.documentElement.lang==="en"?"en":"es";
 const tr=(es,en)=>lang==="en"?en:es;
 const eligible=(history||[]).filter(x=>x&&Array.isArray(x.metrics)&&x.metrics.length&&x.module);
 const keys=eligible.map(h=>h.id);
 if((state.a&&!keys.includes(state.a))||(state.b&&!keys.includes(state.b)))state.manualSelection=true;
 if(!keys.includes(state.a))state.a=state.manualSelection?"":keys[0]||"";
 if(!keys.includes(state.b))state.b=state.manualSelection?"":keys[1]||"";
 const option=(id,label)=>'<option value="'+safe(id)+'">'+safe(label)+'</option>';
 const labels=eligible.map(x=>option(x.id,[typeof x.name==='string'?x.name:'',t(modules.find(m=>m.id===x.module)?.name||x.module),x.material?.grade_snapshot?.grade||"",new Date(x.updated_at||x.date).toLocaleString(lang==="en"?"en-US":"es-DO")].filter(Boolean).join(" · ")).replace('<option ','<option data-i18n-ignore ')).join("");
 root.innerHTML='<h2>'+tr("Comparar resultados guardados","Compare saved results")+'</h2>'+
 '<p class="muted">'+tr("Guarda primero dos cálculos del mismo proceso. La comparación utiliza los valores y fuentes originales, sin recalcularlos.","Save two calculations of the same process first. The comparison retains their original results and sources without recalculation.")+'</p>'+
 '<div class="comparison-selectors">'+
 '<label>'+tr("Caso A (referencia)","Case A (reference)")+'<select id="compare-a">'+option("",tr("Seleccionar cálculo","Select calculation"))+labels+'</select></label>'+
 '<label>'+tr("Caso B (alternativa)","Case B (alternative)")+'<select id="compare-b">'+option("",tr("Seleccionar cálculo","Select calculation"))+labels+'</select></label>'+
 '</div><div id="comparison-output"></div><div class="comparison-actions"><button id="comparison-clear" type="button">'+tr("Limpiar selección","Clear selection")+'</button><button id="comparison-csv" type="button">'+tr("Exportar tabla CSV para Excel","Export Excel-compatible CSV")+'</button><button id="comparison-pdf" type="button">'+tr("Imprimir / guardar PDF","Print / save PDF")+'</button><button id="comparison-json" type="button">'+tr("Exportar JSON técnico","Export technical JSON")+'</button></div>';
 const a=root.querySelector("#compare-a"),b=root.querySelector("#compare-b");
 a.value=state.a;b.value=state.b;
 const out=root.querySelector("#comparison-output");
 const selected=control=>control.value===''?undefined:eligible.find(item=>item.id===control.value);
 const redraw=()=>{
   const one=selected(a),two=selected(b);
   const result=compareRecords(one,two);
   state.a=a.value;state.b=b.value;
   for(const btn of root.querySelectorAll(".comparison-actions button:not(#comparison-clear)"))btn.disabled=!!result.error;
   root.querySelector('#comparison-clear').disabled=!a.value&&!b.value;
   if(result.error){
    out.innerHTML='<p class="muted">'+safe(tr(result.error,result.error==="Selecciona dos cálculos guardados."?"Select two saved cases.":"Choose calculations from the same process."))+'</p>';return;
   }
   const rows=result.rows.filter(r=>r.first!==null||r.second!==null).map(r=>'<tr><th scope="row">'+safe(r.name)+((r.first_estimated||r.second_estimated)?'<small class="density-estimate">'+tr('Estimación con densidad de familia','Estimate using family density')+' · '+[r.first_estimated?'A':'',r.second_estimated?'B':''].filter(Boolean).join(' / ')+'</small>':'')+'</th><td>'+safe(r.unit)+'</td><td>'+fmt(r.first)+'</td><td>'+fmt(r.second)+'</td><td>'+fmt(r.diff)+'</td><td>'+fmt(r.pct)+(r.pct===null?"":" %")+'</td></tr>').join("");
   out.innerHTML='<div class="comparison-table-wrap"><table class="comparison-table"><thead><tr><th>'+tr("Resultado","Output")+'</th><th>'+tr("Unidad","Unit")+'</th><th>A</th><th>B</th><th>Δ</th><th>Δ %</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
   '<p class="muted">'+tr("— significa falta de datos, unidades incompatibles o división no definida. Las diferencias no prueban que un material sea mejor.","— means missing data, incompatible units or undefined division. Differences alone do not prove a material is better.")+'</p>';
 };
 const change=()=>{state.manualSelection=true;redraw();};
 a.addEventListener("change",change);b.addEventListener("change",change);
 root.querySelector('#comparison-clear').addEventListener('click',()=>{a.value='';b.value='';change();a.focus();});
 root.querySelector("#comparison-csv").addEventListener("click",()=>{const x=selected(a),y=selected(b);download(comparisonCSV(x,y,compareRecords(x,y)),"ccip-comparacion.csv","text/csv;charset=utf-8")});
 root.querySelector("#comparison-json").addEventListener("click",()=>{const x=selected(a),y=selected(b);download(JSON.stringify({caseA:x,caseB:y,comparison:compareRecords(x,y)},null,2),"ccip-comparacion.json","application/json")});
 root.querySelector("#comparison-pdf").addEventListener("click",()=>{document.body.classList.add("printing-comparison");window.print()});
 window.addEventListener("afterprint",()=>document.body.classList.remove("printing-comparison"),{once:true});
 redraw();
}
