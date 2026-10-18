import {getLanguage} from './i18n.js';
import {safe} from './materials-view.js';
import {machineSpecLabels} from './machines-view.js';
import {filterMachines,compareMachineRecords,highlights,specificationGroup,processNames,machineTypes} from './machine-explorer-data.js';
import {exportMachineReport} from './machine-report.js';

const tr=(es,en)=>getLanguage()==='en'?en:es;
const localized=pair=>pair?.[getLanguage()==='en'?1:0]||'—';
const specLabel=key=>localized(machineSpecLabels[key]||[key,key]);
const scopes={specific_configuration:['Configuración concreta','Specific configuration'],specific_model:['Modelo concreto','Specific model'],series_range:['Rango de serie','Series range'],configurable_series:['Serie configurable','Configurable series']};
const documentation=key=>key==='document_checked'?tr('Documento revisado','Document reviewed'):tr('Reconsulta pendiente','Recheck pending');
const groups={injection:['Disparo e inyección','Shot and injection'],screw_die:['Husillo, dado y configuración','Screw, die and configuration'],mould:['Cierre, molde y herramienta','Clamping, mould and tooling'],product:['Producto y conformado','Product and forming'],drive:['Accionamiento y potencia instalada','Drive and installed power'],drying:['Secado y aire de proceso','Drying and process air'],capacity:['Velocidades y capacidad condicionada','Speeds and conditional capacity'],general:['Otras especificaciones','Other specifications']};
const comparisonStatus={comparable:['Comparable como dato documental','Comparable as documentary data'],missing:['No documentado en uno de los equipos','Not documented for one machine'],different_process:['Procesos diferentes; no equivalentes','Different processes; not equivalent'],series_reference:['Serie: no representa una unidad concreta','Series: does not represent one specific unit'],variant_identity_pending:['Identidad entre variantes pendiente','Cross-variant identity pending'],range_reference:['Intervalos de referencia; sin valor único','Reference ranges; no single value'],conditions_required:['Faltan condiciones compatibles del rendimiento','Compatible output conditions are missing'],different_conditions:['Condiciones documentadas diferentes','Different documented conditions'],incompatible_units:['Unidades incompatibles','Incompatible units']};
const value=spec=>spec?`${spec.value??spec.range?.join('–')??tr('No documentado','Not documented')} ${spec.unit||''}`:tr('No documentado','Not documented');
const config=m=>getLanguage()==='en'?m.configuration_en||m.configuration:m.configuration_es||m.configuration;
const model=m=>getLanguage()==='en'?m.model_en||m.model:m.model;
const safeSourceUrl=value=>{try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password?url.href:null;}catch{return null;}};
const sourceLink=(source,label=source.title)=>{const url=safeSourceUrl(source.url);return url?`<a href="${safe(url)}" target="_blank" rel="noopener noreferrer">${safe(label)}</a>`:safe(label);};
export function permittedMachineImage(record,id,manufacturer){
 return record?.machine_id===id&&!!record.manufacturer&&(!manufacturer||record.manufacturer===manufacturer)&&!!record.source_type&&Number.isFinite(Date.parse(record.verified_at||''))&&record?.permission?.status==='approved'&&!!record.permission.basis&&!!record.holder&&!!record.alt_es&&!!record.alt_en&&!!safeSourceUrl(record.source_url)&&/^\.\/assets\/machines\/[a-z0-9_-]+\.(?:webp|png|jpg|avif)$/.test(record.local_path||'')&&/^[a-f0-9]{64}$/.test(record.sha256||'');
}
export function createMachineExplorer(root,{getCatalog,getSelection,onRoute,onBack,onUse}){
 let filters={},compared=[],selected='',imageRecords={},loadingImages=false,filtersOpen=false;
 const failedImages=new Set();
 const filterKeys=['query','process','manufacturer','type','scope','documentation','specification'];
 try{
  const saved=JSON.parse(sessionStorage.getItem('ccip-machine-explorer/1')||'null');
  if(saved?.schema===1){
   filtersOpen=saved.filters_open===true;
   filters=Object.fromEntries(filterKeys.filter(key=>typeof saved.filters?.[key]==='string'&&saved.filters[key].length<=1000).map(key=>[key,saved.filters[key]]));
   if(Array.isArray(saved.compared))compared=[...new Set(saved.compared.filter(id=>typeof id==='string'&&/^[-a-z0-9]{5,100}$/.test(id)))].slice(0,4);
  }
 }catch{}
 const persist=()=>{try{sessionStorage.setItem('ccip-machine-explorer/1',JSON.stringify({schema:1,filters,compared,filters_open:filtersOpen}));}catch{}};
 root.setAttribute('data-i18n-ignore','');
 const catalog=()=>getCatalog(),find=id=>catalog()?.machines.find(m=>m.id===id);
 const comparisonRecords=()=>compared.map(find).filter(Boolean);
 const reportImages=records=>Object.fromEntries(records.filter(m=>imageRecords[m.id]).map(m=>[m.id,imageRecords[m.id]]));
 const status=message=>{const el=root.querySelector('#machine-library-status');if(el)el.textContent=message;};
 const fallback=()=>`<span class="machine-image-placeholder"><svg viewBox="0 0 80 52" aria-hidden="true" focusable="false"><path d="M8 44V25l18-10v10l18-10v10h14V8h12v36Z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M17 35h5m10 0h5m10 0h5" stroke="currentColor" stroke-width="3"/></svg><span>${tr('Imagen no disponible','Image unavailable')}</span></span>`;
 function refreshImages(){
  for(const box of root.querySelectorAll('[data-machine-image]')){
   const id=box.dataset.machineImage,record=imageRecords[id],key=id+':'+record?.local_path;
   if(permittedMachineImage(record,id,find(id)?.manufacturer)&&!failedImages.has(key)){
    const src=new URL(record.local_path,import.meta.url).href;
    if(box.querySelector('img')?.src===src)continue;
    const img=document.createElement('img');img.alt=getLanguage()==='en'?record.alt_en:record.alt_es;img.width=480;img.height=300;img.loading='lazy';img.decoding='async';
    img.addEventListener('error',()=>{failedImages.add(key);box.innerHTML=fallback();},{once:true});img.src=src;box.replaceChildren(img);
   }else box.innerHTML=fallback();
  }
 }
 function loadImages(){
  if(loadingImages)return;loadingImages=true;
  fetch(new URL('./data/machine-images.v1.json',import.meta.url)).then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{if(data.schema==='ccip-machine-images/1'&&data.images&&typeof data.images==='object')imageRecords=data.images;}).catch(()=>{}).finally(refreshImages);
 }
 const image=m=>`<div class="machine-image" data-machine-image="${safe(m.id)}">${fallback()}</div>`;
 function exportButtons(target){return `<div class="machine-export-actions" aria-label="${tr('Exportar documentación','Export documentation')}">${['pdf','json','xlsx'].map(format=>`<button type="button" data-machine-export="${target}" data-format="${format}">${tr('Exportar','Export')} ${format.toUpperCase()}</button>`).join('')}</div>`;}
 function renderCards(){
  const found=filterMachines(catalog(),filters),cards=root.querySelector('#machine-cards');if(!cards)return;
  root.querySelector('#machine-result-count').textContent=`${found.length} / ${catalog()?.machines.length||0} ${tr('equipos','machines')}`;
  cards.innerHTML=found.map(m=>`<article class="machine-card" data-machine-card="${safe(m.id)}">${image(m)}<div class="machine-card-content"><p class="machine-card-process">${localized(processNames[m.process])}</p><h2><a data-machine-route="${safe(m.id)}" href="?view=machines&machine=${encodeURIComponent(m.id)}">${safe(model(m))}</a></h2><p>${safe(m.manufacturer)}</p><p class="muted machine-card-variant">${safe(config(m)||localized(scopes[m.scope]))}</p><dl>${highlights(m).map(s=>`<div><dt>${safe(specLabel(s.key))}</dt><dd>${safe(value(s))}</dd></div>`).join('')}</dl><p class="machine-documentation">${documentation(m.verification_status)} · ${localized(scopes[m.scope])}</p>${getSelection()?.id===m.id?`<span class="machine-current">${tr('Referencia del caso activo','Active case reference')}</span>`:''}<div class="machine-card-actions"><a data-machine-route="${safe(m.id)}" href="?view=machines&machine=${encodeURIComponent(m.id)}">${tr('Ver ficha','View datasheet')}</a><button type="button" data-machine-use="${safe(m.id)}">${tr('Usar en calculadora','Use in calculator')}</button><label class="machine-compare-check"><input type="checkbox" data-machine-compare="${safe(m.id)}" ${compared.includes(m.id)?'checked':''}>${tr('Comparar','Compare')}</label></div></div></article>`).join('')||`<p>${tr('Sin equipos con estos filtros.','No machines match these filters.')}</p>`;
  refreshImages();
 }
 function renderFicha(){
  const box=root.querySelector('#machine-ficha');if(!selected){box.replaceChildren();return;}
  const m=find(selected);if(!m){box.innerHTML=`<p class="warning">${tr('Equipo no encontrado en el catálogo.','Machine not found in the catalog.')}</p>`;return;}
  const grouped={};for(const [key,spec] of Object.entries(m.specifications))(grouped[specificationGroup(key)]??=[]).push([key,spec]);
  box.innerHTML=`<article class="panel machine-datasheet" data-machine-detail="${safe(m.id)}"><div class="machine-detail-heading">${image(m)}<div><p class="machine-card-process">${localized(processNames[m.process])}</p><h2 tabindex="-1">${safe(model(m))}</h2><p>${safe(m.manufacturer)}</p><p>${safe(config(m)||localized(scopes[m.scope]))}</p><p class="machine-documentation">${documentation(m.verification_status)} · ${localized(scopes[m.scope])}</p><p class="muted">${tr('Referencia documental; no certifica la configuración física ni la aptitud industrial.','Documentary reference; does not certify physical configuration or industrial suitability.')}</p><div class="machine-card-actions"><button type="button" class="primary" data-machine-use="${safe(m.id)}">${tr('Usar en calculadora','Use in calculator')}</button><label class="machine-compare-check"><input type="checkbox" data-machine-compare="${safe(m.id)}" ${compared.includes(m.id)?'checked':''}>${tr('Comparar','Compare')}</label><a data-machine-route="" href="?view=machines">${tr('Volver a equipos','Back to machines')}</a></div></div></div>
   ${m.identity_status?`<p class="warning">${tr('Equivalencia entre variantes pendiente: no se mezclan especificaciones de modelos o fuentes diferentes.','Cross-variant equivalence pending: specifications from different models or sources are not merged.')}</p>`:''}
   ${Object.entries(grouped).map(([group,rows])=>`<section class="machine-spec-group"><h3>${localized(groups[group])}</h3><dl>${rows.map(([key,s])=>`<div><dt>${safe(specLabel(key))}</dt><dd><strong>${safe(value(s))}</strong><small>${safe(getLanguage()==='en'?s.note_en||s.note:s.note)}</small>${s.conditions?`<small>${tr('Condiciones','Conditions')}: ${safe(JSON.stringify(s.conditions))}</small>`:''}<small>${tr('Fuente','Source')}: ${safe(s.source_id||m.source.id)} · ${safe(s.retrieved_on||m.source.retrieved_on||'—')}</small></dd></div>`).join('')}</dl></section>`).join('')}
   <details class="machine-missing"><summary>${tr('Datos no documentados','Undocumented data')}</summary><p>${(m.undocumented_fields||[]).map(key=>`${safe(specLabel(key))}: ${tr('No documentado','Not documented')}`).join(' · ')||tr('Sin campos adicionales declarados.','No additional fields declared.')}</p></details>
   <section class="machine-sources"><h3>${tr('Datos técnicos y fuentes','Technical data and sources')}</h3>${(m.sources||[m.source]).map(source=>`<p>${sourceLink(source)}<br><small>${safe(source.id||'')} · ${tr('Consulta','Retrieved')}: ${safe(source.retrieved_on||catalog().retrieved_on||'—')}<br>${safe(getLanguage()==='en'?source.scope_note_en||'Consult the original document for conditions and limitations.':source.scope_note||'')}</small></p>`).join('')}<p>${safe(getLanguage()==='en'?m.limitations_en||m.limitations||'':m.limitations||'')}</p><p class="muted">${tr('Las condiciones y propiedades ausentes se mantienen sin dato. La potencia instalada no es consumo y las masas de disparo no son volúmenes.','Missing conditions and properties remain unavailable. Installed power is not consumption and shot masses are not volumes.')}</p></section>${exportButtons('datasheet')}</article>`;
  refreshImages();
 }
 function renderComparison(){
  const box=root.querySelector('#machine-library-comparison'),machines=comparisonRecords();
  box.innerHTML=`<div class="machine-comparison-heading"><h2 tabindex="-1">${tr('Comparar equipos','Compare machines')} (${machines.length}/4)</h2><button type="button" id="machine-clear-comparison" ${machines.length?'':'disabled'}>${tr('Limpiar comparación','Clear comparison')}</button></div>`;
  if(machines.length<2){box.insertAdjacentHTML('beforeend',`<p class="muted">${tr('Selecciona de dos a cuatro equipos.','Select two to four machines.')}</p>`);return;}
  const report=compareMachineRecords(machines);
  const identities=[['Fabricante','Manufacturer',m=>m.manufacturer],['Modelo','Model',model],['Proceso','Process',m=>localized(processNames[m.process])],['Tecnología','Technology',m=>localized(machineTypes[m.machine_type]||[m.machine_type,m.machine_type])],['Configuración','Configuration',m=>config(m)||localized(scopes[m.scope])]];
  box.insertAdjacentHTML('beforeend',`<p class="muted">${tr('Sin clasificación de mejor equipo. Los datos incompatibles se muestran separados.','No best-machine ranking. Incompatible data remain separate.')}</p><div class="machine-table-wrap"><table><caption>${tr('Identidad de los equipos seleccionados','Selected machine identities')}</caption><thead><tr><th>${tr('Dato','Field')}</th>${machines.map(m=>`<th>${safe(model(m))}</th>`).join('')}</tr></thead><tbody>${identities.map(([es,en,read])=>`<tr><th>${tr(es,en)}</th>${machines.map(m=>`<td>${safe(read(m))}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
  for(const pair of report.pairs){
   const a=find(pair.a),b=find(pair.b);
   box.insertAdjacentHTML('beforeend',`<details class="machine-pair" ${machines.length===2?'open':''}><summary>${safe(model(a))} / ${safe(model(b))}</summary>${pair.different_process?`<p class="warning">${tr('Procesos diferentes: las propiedades técnicas no se consideran equivalentes.','Different processes: technical properties are not considered equivalent.')}</p>`:''}<div class="machine-table-wrap"><table><caption>${tr('Especificaciones, condiciones y procedencia','Specifications, conditions and provenance')}</caption><thead><tr><th>${tr('Especificación','Specification')}</th><th>${safe(model(a))}</th><th>${safe(model(b))}</th><th>${tr('Comparabilidad','Comparability')}</th></tr></thead><tbody>${pair.rows.map(row=>`<tr data-machine-comparability="${row.status}"><th>${safe(specLabel(row.key))}</th>${[row.first,row.second].map(spec=>`<td>${safe(value(spec))}${spec?`<small>${safe(spec.source_id||'')}${spec.conditions?' · '+safe(JSON.stringify(spec.conditions)):''}</small>`:''}</td>`).join('')}<td>${localized(comparisonStatus[row.status])}${row.normalized&&row.first.unit!==row.second.unit?`<small>${row.normalized.first} / ${row.normalized.second} ${safe(row.normalized.unit)}</small>`:''}</td></tr>`).join('')}</tbody></table></div></details>`);
  }
  box.insertAdjacentHTML('beforeend',exportButtons('comparison'));
 }
 function render(id=selected,{focus=false}={}){
  selected=id||'';
  root.setAttribute('aria-label',tr('Maquinaria','Machinery'));
  const all=catalog()?.machines||[];
  if(catalog())compared=compared.filter(find);
  const options=(values,current,read=x=>x)=>`<option value="">${tr('Todos','All')}</option>`+[...new Set(values.filter(Boolean))].sort().map(x=>`<option value="${safe(x)}" ${x===current?'selected':''}>${safe(read(x))}</option>`).join('');
  const filter=(key,label,values,read)=>`<label>${label}<select data-machine-filter="${key}">${options(values,filters[key],read)}</select></label>`;
  root.innerHTML=`<div class="panel machine-library-header"><button type="button" id="machines-back">${tr('Volver a la calculadora','Back to calculator')}</button><h1>${tr('Maquinaria','Machinery')}</h1><p>${tr('Biblioteca técnica de equipos para transformación de plásticos','Technical equipment library for plastics processing')}</p></div><div class="panel machine-library-controls"><label for="machine-query">${tr('Buscar fabricante, modelo, serie o proceso','Search manufacturer, model, series or process')}</label><input id="machine-query" type="search" value="${safe(filters.query||'')}"><details id="machine-filters"><summary>${tr('Filtros de maquinaria','Machine filters')}</summary><div class="machine-filter-grid">${filter('process',tr('Proceso','Process'),all.map(m=>m.process),x=>localized(processNames[x]))}${filter('manufacturer',tr('Fabricante','Manufacturer'),all.map(m=>m.manufacturer))}${filter('type',tr('Tipo de máquina','Machine type'),all.map(m=>m.machine_type),x=>localized(machineTypes[x]||[x,x]))}${filter('scope',tr('Configuración o serie','Configuration or series'),all.map(m=>m.scope),x=>localized(scopes[x]))}${filter('documentation',tr('Estado documental','Documentation status'),all.map(m=>m.verification_status),documentation)}${filter('specification',tr('Especificación disponible','Available specification'),all.flatMap(m=>Object.keys(m.specifications)),specLabel)}</div></details><div class="machine-library-actions"><button id="machine-clear-filters" type="button">${tr('Limpiar filtros','Clear filters')}</button><button id="machine-show-comparison" type="button">${tr('Ver comparación','View comparison')}</button></div><p id="machine-library-status" role="status">${catalog()?'':tr('Catálogo de maquinaria no disponible; puedes continuar con entradas manuales.','Machinery catalog unavailable; manual inputs remain available.')}</p></div><div id="machine-ficha"></div><section id="machine-library-comparison" class="panel"></section><p id="machine-result-count" class="machine-result-count" role="status"></p><div id="machine-cards" class="machine-cards"></div>`;
  root.querySelector('#machine-filters').open=filtersOpen;
  renderCards();renderFicha();renderComparison();loadImages();
  if(focus){const heading=root.querySelector(selected?'#machine-ficha h2':'.machine-library-header h1');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});heading.scrollIntoView({block:'start'});}}
 }
 root.addEventListener('toggle',event=>{if(event.target.id==='machine-filters'){filtersOpen=event.target.open;persist();}},true);
 root.addEventListener('input',event=>{if(event.target.id==='machine-query'){filters.query=event.target.value;persist();renderCards();}});
 root.addEventListener('change',event=>{
  const el=event.target;
  if(el.dataset.machineFilter){filters[el.dataset.machineFilter]=el.value;persist();renderCards();}
  if(el.hasAttribute('data-machine-compare')){
   const id=el.dataset.machineCompare;
   if(el.checked&&!compared.includes(id)&&compared.length>=4){el.checked=false;status(tr('Compara como máximo cuatro equipos.','Compare at most four machines.'));return;}
   compared=el.checked?[...new Set([...compared,id])]:compared.filter(x=>x!==id);
   persist();renderCards();renderFicha();renderComparison();status('');
  }
 });
 root.addEventListener('click',async event=>{
  const route=event.target.closest('[data-machine-route]');
  if(route&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&event.button===0){event.preventDefault();onRoute(route.dataset.machineRoute);return;}
  const use=event.target.closest('[data-machine-use]');if(use){onUse(use.dataset.machineUse);return;}
  if(event.target.id==='machines-back'){onBack();return;}
  if(event.target.id==='machine-clear-filters'){filters={};persist();render();return;}
  if(event.target.id==='machine-clear-comparison'){compared=[];persist();renderCards();renderFicha();renderComparison();return;}
  if(event.target.id==='machine-show-comparison'){const target=root.querySelector('#machine-library-comparison h2');target.scrollIntoView({block:'start'});target.focus({preventScroll:true});return;}
  const button=event.target.closest('[data-machine-export]');if(!button)return;
  button.disabled=true;
  try{const records=button.dataset.machineExport==='comparison'?comparisonRecords():[find(selected)].filter(Boolean);await exportMachineReport(records,button.dataset.format,getLanguage(),reportImages(records));status(tr('Archivo exportado.','File exported.'));}
  catch{status(tr('No se pudo exportar la documentación.','Documentation could not be exported.'));}
  finally{button.disabled=false;}
 });
 return {render};
}
