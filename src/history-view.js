import { modules } from './schema.js';
import { getLanguage, t } from './i18n.js';
import { safe } from './materials-view.js';
import { loadHistoryState, saveHistoryItem, renameHistoryItem, deleteHistoryItem } from './history.js';
import { renderComparison } from './compare.js';
import { exportFile } from './export-file.js';

const words = {
 'Seleccionar formato':'Choose format','Guardar como nuevo':'Save as new','Sobrescribir existente':'Overwrite existing','Nombre del cálculo':'Calculation name',
 'Confirmo que deseo reemplazar este cálculo.':'I confirm that I want to replace this calculation.',
 'Cancelar':'Cancel','Confirmar guardado':'Confirm save','Mostrar más':'Show more','Exportar':'Export','Renombrar':'Rename',
 'Eliminar':'Delete','Recuperar':'Restore','Seleccionar cálculo':'Select calculation',
 'Ficha actual de maquinaria':'Current equipment datasheet',
 'Cálculo guardado.':'Calculation saved.','Cálculo eliminado.':'Calculation deleted.','Nombre actualizado.':'Name updated.',
 'Generando archivo…':'Generating file…','Archivo generado.':'File generated.','No se pudo generar el archivo.':'The file could not be generated.',
 'El historial está dañado. No se modificaron sus datos.':'History is corrupt. Its data has not been modified.',
 'El historial cambió en otra pestaña. Revisa la selección e inténtalo nuevamente.':'History changed in another tab. Review your selection and try again.',
 'Se alcanzó el límite de 60 cálculos. Elimina uno explícitamente o sobrescribe uno del mismo proceso.':'The limit of 60 calculations has been reached. Explicitly delete one or overwrite one from the same process.',
 'No se pudo escribir el historial. Comprueba el almacenamiento del navegador.':'History could not be written. Check browser storage.',
 'El cálculo seleccionado ya no existe o pertenece a otro proceso.':'The selected calculation no longer exists or belongs to another process.',
 'Introduce un nombre de 1 a 120 caracteres.':'Enter a name of 1 to 120 characters.',
 'Guardar cálculo':'Save calculation','No hay cálculos del mismo proceso para sobrescribir.':'There are no calculations from the same process to overwrite.',
 'Exportar estado activo':'Export active state','Formato de exportación':'Export format',
 'Aún no hay cálculos guardados en este navegador.':'No calculations saved in this browser yet.'
};
const tr = es => getLanguage() === 'en' ? words[es] || t(es) : es;
const errorText = error => tr(({corrupt:'El historial está dañado. No se modificaron sus datos.',changed:'El historial cambió en otra pestaña. Revisa la selección e inténtalo nuevamente.',limit:'Se alcanzó el límite de 60 cálculos. Elimina uno explícitamente o sobrescribe uno del mismo proceso.',name:'Introduce un nombre de 1 a 120 caracteres.',not_found:'El cálculo seleccionado ya no existe o pertenece a otro proceso.',wrong_process:'El cálculo seleccionado ya no existe o pertenece a otro proceso.'})[error.code || error] || 'No se pudo escribir el historial. Comprueba el almacenamiento del navegador.');
const title = item => item.name || t(modules.find(m => m.id === item.module)?.name || item.module);
const detail = item => [title(item),t(modules.find(m => m.id === item.module)?.name || item.module),item.material?.formulation?.name||item.material?.grade_snapshot?.grade,new Date(item.updated_at || item.date).toLocaleString(getLanguage() === 'en' ? 'en-US' : 'es-DO')].filter(Boolean).join(' · ');

export function mountHistory({root,comparison,getSnapshot,onRestore,onMachine,onChange=()=>{}}) {
 let recoveredId = null, count = 15, pending = null;
 const status = document.createElement('p');status.id='history-status';status.role='status';status.setAttribute('data-i18n-ignore','');root.before(status);
 const dialog = document.createElement('dialog');dialog.id='save-dialog';dialog.className='save-dialog';dialog.setAttribute('aria-labelledby','save-title');dialog.setAttribute('data-i18n-ignore','');document.body.append(dialog);
 function report(message) {status.textContent=message;}
 function failure(error) {const text=errorText(error);report(text);alert(text);}
 async function download(item,format,button,active=false) {
   button.disabled=true;report(tr('Generando archivo…'));
   try {
     let base;
     if(active) { try {base=loadHistoryState(localStorage).items.find(x=>x.id===recoveredId&&x.module===item.module);}catch{/* Exportar no requiere almacenamiento. */} }
     await exportFile(item,format,{language:getLanguage(),status:active?'active':'saved',basedOn:base?.id||null,name:active?base?.name:undefined});report(tr('Archivo generado.'));}
   catch {report(tr('No se pudo generar el archivo.'));alert(tr('No se pudo generar el archivo.'));}
   finally {button.disabled=false;}
 }
 function render() {
   let loaded;
   try {loaded=loadHistoryState(localStorage);} catch {loaded={items:[],error:'storage'};}
   const {items,error}=loaded;
   if(error)report(errorText(error));
   root.innerHTML=items.length?items.slice(0,count).map(item=>`<div class="historyRow"><span data-i18n-ignore>${safe(detail(item))}</span><div class="history-actions"><button type="button" data-history="${safe(item.id)}">${tr('Recuperar')}</button><button type="button" data-history-rename="${safe(item.id)}">${tr('Renombrar')}</button><button type="button" data-history-delete="${safe(item.id)}">${tr('Eliminar')}</button><label>${tr('Exportar')}<select data-history-export="${safe(item.id)}"><option value="">${tr('Seleccionar formato')}</option><option value="json">JSON</option><option value="xlsx">Excel (.xlsx)</option><option value="pdf">PDF</option></select></label></div></div>`).join(''):`<p>${tr('Aún no hay cálculos guardados en este navegador.')}</p>`;
   if(items.length>count)root.insertAdjacentHTML('beforeend',`<button type="button" id="history-more">${tr('Mostrar más')}</button>`);
   if(onMachine)for(const item of items.filter(x=>x.machine?.id).slice(0,count)){
     const row=[...root.querySelectorAll('[data-history]')].find(button=>button.dataset.history===item.id)?.closest('.history-actions');if(!row)continue;
     const link=document.createElement('a');link.textContent=tr('Ficha actual de maquinaria');link.href='?view=machines&machine='+encodeURIComponent(item.machine.id);link.dataset.historyMachine=item.machine.id;
     link.onclick=event=>{if(event.ctrlKey||event.metaKey||event.shiftKey)return;event.preventDefault();onMachine(item.machine.id);};row.append(link);
   }
   root.querySelector('#history-more')?.addEventListener('click',()=>{count+=15;render();});
   root.querySelectorAll('[data-history]').forEach(button=>button.onclick=()=>{const item=items.find(x=>x.id===button.dataset.history);recoveredId=item.id;onRestore(structuredClone(item));});
   root.querySelectorAll('[data-history-rename]').forEach(button=>button.onclick=()=>{
     const item=items.find(x=>x.id===button.dataset.historyRename),name=prompt(t('Nombre del cálculo (máximo 120 caracteres):'),title(item));
     if(name===null)return;
     try {renameHistoryItem(localStorage,item.id,name);render();report(tr('Nombre actualizado.'));onChange();}catch(error){failure(error);}
   });
   root.querySelectorAll('[data-history-delete]').forEach(button=>button.onclick=()=>{
     const item=items.find(x=>x.id===button.dataset.historyDelete);
     if(!confirm(getLanguage()==='en'?`Delete “${title(item)}”? This cannot be undone.`:`¿Eliminar «${title(item)}»? Esta acción no se puede deshacer.`))return;
     try {deleteHistoryItem(localStorage,item.id);if(recoveredId===item.id)recoveredId=null;render();report(tr('Cálculo eliminado.'));onChange();}catch(error){failure(error);}
   });
   root.querySelectorAll('[data-history-export]').forEach(select=>select.onchange=async()=>{if(!select.value)return;const format=select.value;select.value='';await download(items.find(x=>x.id===select.dataset.historyExport),format,select);});
   renderComparison(comparison,items,modules);
 }
 function openSave() {
   pending=getSnapshot();
   let items;try {const loaded=loadHistoryState(localStorage);if(loaded.error)throw {code:loaded.error};items=loaded.items.filter(x=>x.module===pending.module);}catch(error){failure(error);return;}
   dialog.innerHTML=`<form id="save-form"><h2 id="save-title">${tr('Guardar cálculo')}</h2><label>${tr('Guardar cálculo')}<select id="save-mode"><option value="new">${tr('Guardar como nuevo')}</option><option value="overwrite" ${items.length?'':'disabled'}>${tr('Sobrescribir existente')}</option></select></label><div id="save-new"><label>${tr('Nombre del cálculo')}<input id="save-name" maxlength="120" required value="${safe(title(items.find(x=>x.id===recoveredId)||pending))}"></label></div><div id="save-existing" hidden><label>${tr('Seleccionar cálculo')}<select id="save-target" data-i18n-ignore>${items.map(x=>`<option value="${safe(x.id)}">${safe(detail(x))}</option>`).join('')}</select></label><p id="save-target-detail"></p><label class="overwrite-confirm"><input id="save-overwrite-confirm" type="checkbox">${tr('Confirmo que deseo reemplazar este cálculo.')}</label></div>${items.length?'':`<p>${tr('No hay cálculos del mismo proceso para sobrescribir.')}</p>`}<div class="actions"><button type="button" id="save-cancel">${tr('Cancelar')}</button><button class="primary" id="save-confirm">${tr('Confirmar guardado')}</button></div></form>`;
   const $=id=>dialog.querySelector('#'+id),mode=$('save-mode'),target=$('save-target'),check=$('save-overwrite-confirm');
   if(items.some(x=>x.id===recoveredId))target.value=recoveredId;
   const update=()=>{const overwrite=mode.value==='overwrite';$('save-new').hidden=overwrite;$('save-existing').hidden=!overwrite;$('save-name').required=!overwrite;$('save-confirm').disabled=overwrite&&!check.checked;$('save-target-detail').textContent=items.find(x=>x.id===target.value)?detail(items.find(x=>x.id===target.value)):'';};
   mode.onchange=()=>{check.checked=false;update();};target.onchange=()=>{check.checked=false;update();};check.onchange=update;$('save-cancel').onclick=()=>dialog.close();
   $('save-form').onsubmit=event=>{
     event.preventDefault();if(mode.value==='overwrite'&&!check.checked)return;
     try {const item=saveHistoryItem(localStorage,pending,{name:$('save-name').value,overwriteId:mode.value==='overwrite'?target.value:null});recoveredId=item.id;dialog.close();render();report(tr('Cálculo guardado.'));onChange();}catch(error){failure(error);}
   };
   update();dialog.showModal();$('save-name').focus();
 }
 dialog.addEventListener('keydown',event=>{if(event.key!=='Tab')return;const controls=[...dialog.querySelectorAll('button,input,select')].filter(el=>!el.disabled&&el.getClientRects().length);const first=controls[0],last=controls.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}});
 document.getElementById('save').onclick=openSave;
 document.getElementById('export').onclick=()=>download(getSnapshot(),document.getElementById('export-format').value,document.getElementById('export'),true);
 document.addEventListener('ccip-language-change',()=>{report('');if(dialog.open)dialog.close();render();document.getElementById('export').textContent=tr('Exportar estado activo');document.getElementById('export-format-label').textContent=tr('Formato de exportación');});
 addEventListener('storage',event=>{if(event.key==='ccip-calculators-web-v1')render();});
 return {render};
}
