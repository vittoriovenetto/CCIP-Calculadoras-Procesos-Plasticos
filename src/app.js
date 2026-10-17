import {cpSignature} from './drying-evidence.js';
import {readHistory} from './history.js';
import {createExplorer} from './material-explorer-view.js';
import {mergeSharedAndLocal,emptySharedCatalog,validateSharedCatalog} from './shared-materials.js';
import {listUserMaterials,persistUserMaterials,makeCustomMaterial} from './custom-materials.js';
import {renderRecycled} from './recycled-view.js';
import {renderResearch} from './material-research-view.js';
import {applyFormulationInput,leaveFormulation} from './formulation-state.js';
import {activeFormulation} from './recycled.js';
import {calculateFormulationCase} from "./formulation-calculation.js";
import { modules, activeFields } from "./schema.js";
import { initI18n, getLanguage, t } from "./i18n.js";
import { renderCustomEditor } from "./custom-materials.js";
import { applyFamilyMeltDensity } from "./injection-density.js";
import { renderInjectionDensity } from "./injection-density-view.js";
import { mountHistory } from "./history-view.js";
import { validateLibrary, createMaterialState, selectMaterial, markManual, clearAutomatic, applyMaterial, materialSnapshot, restoreMaterial, materialWarnings } from "./materials.js";
import { fieldGroups, primaryLabels } from "./presentation.js";
import { bindParameterHelp } from "./tooltips.js";
import { safe, renderMaterials, renderMaterialFeedback, provenanceText } from "./materials-view.js";
import { guideHref } from "./formula-learning.js";

import { defaultInjectionProfile, restoreInjectionProfile, calculateInjectionProfile } from "./injection-profile.js";
import { renderInjectionProfile } from "./injection-profile-view.js";
import { renderManualData } from "./materials-audit-view.js";
import { materialCatalogFor, hasDryingGuideline, enableLeanMaterial } from "./lean-materials.js";
import { prepareDryingCase } from "./drying-assessment.js";
import { displayMetrics, inputIssues } from "./results-view.js";
import { mountGuide } from "./formulas-index.js";
const freshMaterial = () => enableLeanMaterial(createMaterialState());

const $ = id => document.getElementById(id);
const state = { id: "inyeccion", level: "technical", values: {}, material: freshMaterial(), filters: { family: "", manufacturer: "" } };
state.profile = defaultInjectionProfile();
const sessions = new Map();
let sharedCatalog=emptySharedCatalog(), sharedAvailable=false, explorer;
let library = null, catalogBase = null, loadStatus = "Cargando catálogo local…";
let materialDetailsOpen = false;
const parameterHelp = bindParameterHelp($("fields"));
const mod = () => modules.find(m => m.id === state.id);
const initialValues = () => Object.fromEntries(mod().fields.map(f => [f.key, f.default ?? ""]));
let historyView;
const renderHistory = () => historyView?.render();
const initialOrigins = () => Object.fromEntries(mod().fields.filter(f => f.default !== undefined && f.default !== "").map(f => [f.key, state.id==="secado" && f.key==="startT" ? "operating_assumption" : "default_example"]));

function invalidate() {
  $("result-date").textContent = "Pendientes";
  $("summary-metrics").innerHTML = '<p class="muted">Los resultados aparecerán aquí al calcular.</p>';
  $("usage").innerHTML = "";if($("drying-calculation-status"))$("drying-calculation-status").replaceChildren();
  $("metrics").innerHTML = "<p class='muted'>Introduce los parámetros y pulsa Calcular. Los resultados sin datos válidos quedan pendientes.</p>";
  $("messages").innerHTML = "";
  drawProfile(null);
  for(const error of document.querySelectorAll('.field-error')) error.replaceChildren();
  for(const input of document.querySelectorAll('[data-field]')) input.removeAttribute('aria-invalid');
}

function selectProcess(id) {
  if (!modules.some(m => m.id === id)) return;
  sessions.set(state.id, { values: state.values, origins: state.origins, material: state.material, filters: state.filters });
  const selectedGrade = state.material.grade_snapshot?.id;
  state.id = id;
  const session = sessions.get(state.id);
  state.values = session?.values || initialValues();
  state.origins = session?.origins || initialOrigins();
  state.material = session?.material || freshMaterial();
  state.filters = session?.filters || { family: "", manufacturer: "" };
  if (!session && selectedGrade) selectMaterial(library, state.material, state.values, selectedGrade);
  closeLearning();draw();
}

function nav() {
  $("modules").innerHTML = modules.map(m => `<button data-module="${m.id}" aria-pressed="${m.id === state.id}" class="${m.id === state.id ? "active" : ""}">${safe(m.name)}</button>`).join("");
  document.querySelectorAll("[data-module]").forEach(b => b.addEventListener("click", () => selectProcess(b.dataset.module)));
  $("process-select").innerHTML = modules.map(m => `<option value="${m.id}">${safe(m.name)}</option>`).join("");
  $("process-select").value = state.id;
}
$("process-select").addEventListener("change", event => selectProcess(event.target.value));

function draw() {
  nav();
  $("level").value = state.level;
  $("module-title").textContent = mod().name;
  $("module-desc").textContent = mod().description;
  applyMaterial(state.material, mod(), state.values, state.level);
  drawFields();
  drawMaterials();
  if (!$("custom-material-editor").children.length) drawCustomEditor();
  invalidate();
  renderHistory();
}

const learningLink = label => `<a class="result-learning" href="${safe(guideHref(state.id, state.level, label))}">Ver fórmula y ejemplo</a>`;

const calculatorUrl = new URL(location.href);
for(const key of ['view','process','level','material'])calculatorUrl.searchParams.delete(key);
calculatorUrl.hash='';
function closeLearning(push=true) {
  if($("learning-view").hidden && $("materials-view").hidden)return;
  explorer?.returnEditor();$("materials-view").hidden=true;$("materials-page").removeAttribute("aria-current");$("calculator-page").setAttribute("aria-current","page");
  $("learning-view").hidden=true;$("calculator-view").hidden=false;$("learn-page").removeAttribute("aria-current");
  if(push)history.pushState({ccipView:'calculator'},'',calculatorUrl);
  $("module-title").setAttribute('tabindex','-1');$("module-title").focus({preventScroll:true});
}
function showLearning(href,push=true) {
  parameterHelp.close();$("calculator-page").removeAttribute("aria-current");explorer?.returnEditor();$("materials-view").hidden=true;$("materials-page").removeAttribute("aria-current");
  const requested=new URL(href,location.href),url=new URL(calculatorUrl);
  url.searchParams.set('view','learning');
  for(const key of ['process','level'])if(requested.searchParams.has(key))url.searchParams.set(key,requested.searchParams.get(key));
  url.hash=requested.hash;
  if(push)history.pushState({ccipView:'learning'},'',url);
  $("calculator-view").hidden=true;$("learning-view").hidden=false;$("learn-page").setAttribute("aria-current","page");
  mountGuide($("learning-view"),{process:url.searchParams.get('process'),level:url.searchParams.get('level'),lesson:url.hash.slice(1),onBack:()=>closeLearning()});
  if(!url.hash)$("learning-back").focus({preventScroll:true});
}
document.addEventListener('click',event=>{
  const link=event.target.closest('#learn-page,.result-learning');
  if(!link||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.button!==0)return;
  event.preventDefault();showLearning(link.href);
});
function showMaterials(key='',push=true){
  parameterHelp.close();$("calculator-page").removeAttribute('aria-current');const url=new URL(calculatorUrl);url.searchParams.set('view','materials');if(key)url.searchParams.set('material',key);
  if(push)history.pushState({ccipView:'materials'},'',url);
  $("calculator-view").hidden=true;$("learning-view").hidden=true;$("materials-view").hidden=false;$("learn-page").removeAttribute('aria-current');$("materials-page").setAttribute('aria-current','page');explorer.render(key);
}
$("calculator-page").addEventListener("click",e=>{if(e.ctrlKey||e.metaKey)return;e.preventDefault();closeLearning();});
$("materials-page").addEventListener('click',e=>{if(e.ctrlKey||e.metaKey)return;e.preventDefault();showMaterials();});
function routeView(){const url=new URL(location.href),view=url.searchParams.get('view');if(view==='learning')showLearning(url,false);else if(view==='materials')showMaterials(url.searchParams.get('material')||'',false);else closeLearning(false);}
addEventListener('popstate',routeView);


function refreshPersonalCatalog() {
  const base = catalogBase || {schema_version:"1.3.0",dataset_name:"Personal materials",retrieved_on:new Date().toISOString().slice(0,10),sources:{},materials:[]};
  const merged = mergeSharedAndLocal(base,sharedCatalog);
  library = merged.materials.length ? validateLibrary(merged) : null;
  if (library) loadStatus = `${library.materials.length} opciones · catálogo ${library.catalog_revision || library.schema_version} · revisión ${library.retrieved_on}`;
}
function drawCustomEditor() {
  renderCustomEditor($("custom-material-editor"), {
    onSave: record => {
      refreshPersonalCatalog();
      if(!$("materials-view").hidden){drawCustomEditor();showMaterials(record.id+(sharedCatalog.materials.some(x=>x.id===record.id)?'~local':''));return;}
      for (const session of sessions.values()) if (session.material.grade_snapshot?.id === record.id) selectMaterial(library,session.material,session.values,record.id);
      selectMaterial(library,state.material,state.values,record.id);
      state.filters = {family:record.family,manufacturer:record.manufacturer};
      drawCustomEditor();draw();
    },
    onDelete: id => {
      refreshPersonalCatalog();
      if(!$("materials-view").hidden){drawCustomEditor();showMaterials();return;}
      for (const session of sessions.values()) if (session.material.grade_snapshot?.id === id) {selectMaterial(library,session.material,session.values,null);session.filters={family:"",manufacturer:""};}
      if (state.material.grade_snapshot?.id === id) {selectMaterial(library,state.material,state.values,null);state.filters={family:"",manufacturer:""};}
      drawCustomEditor();draw();
    },
    onImport: () => {refreshPersonalCatalog();drawCustomEditor();if(!$("materials-view").hidden){explorer.render();}else draw();$("custom-panel").open=true;}
  });
}

function drawMaterials() {
  renderMaterials($("materials"), { library: materialCatalogFor(library,state.id), loadStatus, materialState: state.material, filters: state.filters,
    module: mod(), values: state.values, level: state.level, onChange: materialChanged, detailsOpen: materialDetailsOpen, onDetailsToggle: open => { materialDetailsOpen = open; } });
  renderRecycled($("materials"),{state:state.material,moduleId:state.id,onVirgin:()=>{leaveFormulation(state.material,state.values);draw();},onChange:(input,redraw)=>{
    applyFormulationInput(state.material,state.values,input,state.id);drawFields();invalidate();
    if(redraw){drawMaterials();const details=$("blend-density-details");if(details)details.open=input.density_strategy!=='none';}
  }});
  renderResearch($("materials"),state.material,state.id);
  if(activeFormulation(state.material)){
    const label=document.querySelector('label[for="material-grade"]');if(label)label.textContent=getLanguage()==='en'?'Virgin reference grade':'Grado virgen de referencia';
    const compact=document.querySelector('.material-compact');if(compact)compact.textContent=(getLanguage()==='en'?'Virgin component reference: ':'Componente virgen de referencia: ')+(state.material.grade_snapshot?.grade||'');
    const summary=$("material-details")?.querySelector('summary');if(summary)summary.textContent=getLanguage()==='en'?'Virgin component datasheet — does not apply to the blend':'Ficha del componente virgen — no se aplica a la mezcla';
  }
}
function drawProfile(result) {
  renderInjectionProfile($("injection-profile"), {
    moduleId: state.id, level: state.level, settings: state.profile, result,
    onSettings: settings => { state.profile = settings; }
  });
}
function drawDensity() {
  renderInjectionDensity($("density-help"), {
    module: mod(), level: state.level, state: state.material, values: state.values,
    onChange: (key,value) => materialChanged('context',{key,value}),
    onUseReference: () => materialChanged('reference','meltDensity')
  });
}
const densityBadge = metric => metric.density_estimate ? `<small class="density-estimate">${metric.estimate_basis?.includes('mixture_model')?t('Estimación · densidad de formulación'):t('Estimación · densidad de familia')}</small>` : '';

function materialChanged(action, value) {
  if (action === "reference") {
    if(activeFormulation(state.material))return;
    if (value === 'meltDensity') state.material.context.familyMeltReferenceAccepted = true;
    state.values[value] = "";
    delete state.material.provenance[value];
    applyMaterial(state.material, mod(), state.values, state.level);
    drawFields();
    renderMaterialFeedback($("materials"), state.material, mod(), state.values, state.level);
    invalidate();
    return;
  }
  if (action === "context") {
    state.material.context[value.key] = value.value;
    if(state.id==='secado'&&['cpPhase','cpMinC','cpMaxC','cpDefinition','cpNoTransition','specificHeatSource','cpEvidenceConfirmed'].includes(value.key)){
      const c=state.material.context;
      if(value.key==='cpEvidenceConfirmed')c.cpConfirmedSignature=value.value?cpSignature(state.values.specificHeat,c):'';
      else{c.cpEvidenceConfirmed=false;c.cpConfirmedSignature='';if($('material-cpEvidenceConfirmed'))$('material-cpEvidenceConfirmed').checked=false;}
    }
    if (state.id === 'inyeccion' && ['pvtTemperatureC','pvtPressureMPa','meltDensitySource'].includes(value.key)) {
      state.material.context.meltDensityVerified = false;
      if ($('density-verified')) $('density-verified').checked = false;
    }
    if (state.id === 'inyeccion' && ['pvtTemperatureC','pvtPressureMPa'].includes(value.key)) {
      const previous = state.values.meltDensity;
      if(!state.material.formulation||state.material.formulation.recycled_fraction===0)applyFamilyMeltDensity(state.material,mod(),state.values,state.level);
      if (previous !== state.values.meltDensity) {
        if($('field-meltDensity'))$('field-meltDensity').value=state.values.meltDensity;
        if($('provenance-meltDensity'))$('provenance-meltDensity').textContent=state.material.provenance.meltDensity?provenanceText(state.material.provenance.meltDensity):'';
      }
      renderMaterialFeedback($("materials"),state.material,mod(),state.values,state.level);
      invalidate();return;
    }
    if (value.key === 'pvcMeltReferenceForm') state.material.context.pvcMeltCompoundConfirmed = ['rigid','flexible'].includes(value.value);
    if (value.key === 'dryingManualMode') {draw();return;}
    if (value.key === 'pvcMeltReferenceForm' || (value.key === 'meltDensityPolicy' && value.value === 'verified_only')) state.material.context.familyMeltReferenceAccepted = false;
    if (["compatible", "physicalForm", "bulkCompatible", "dryingCompatible", "processConfirmed", "dryingTime", "meltDensityPolicy", "familyMeltReferenceAccepted", "pvcMeltReferenceForm", "pvcMeltCompoundConfirmed"].includes(value.key)) {
      if(!activeFormulation(state.material))clearAutomatic(state.material, state.values);
      applyMaterial(state.material, mod(), state.values, state.level);
      drawFields();
      renderMaterialFeedback($("materials"), state.material, mod(), state.values, state.level);
    }
    else {
      renderMaterialFeedback($("materials"), state.material, mod(), state.values, state.level);
      if (value.key === "meltDensityVerified") drawDensity();
    }
    invalidate();
    return;
  }
  if(state.material.formulation_mode!=="virgin")leaveFormulation(state.material,state.values);
  if (action === "family" && value && library) {
    const generic = library.materials.find(m => m.family === value && m.record_status === "generic_unverified");
    selectMaterial(library, state.material, state.values, generic?.id || null);
    enableLeanMaterial(state.material);
    state.filters = { family: value, manufacturer: generic?.manufacturer || "" };
    draw();
    return;
  }
  selectMaterial(library, state.material, state.values, action === "grade" ? value : null);
  enableLeanMaterial(state.material);
  if (action === "family") state.filters = { family: value, manufacturer: "" };
  if (action === "manufacturer") state.filters.manufacturer = value;
  draw();
}
function drawFields() {
  parameterHelp.close();
  const dryReady = state.id !== 'secado' || hasDryingGuideline(state.material.grade_snapshot,library?.sources) || state.material.context.dryingManualMode;
  $("calculation-grid").hidden=!dryReady;
  const renderField = f => {
    const options = f.options?.map(([value, label]) => `<option value="${safe(value)}" ${String(state.values[f.key]) === String(value) ? "selected" : ""}>${safe(label)}</option>`).join("") || "";
    const attrs = `id="field-${f.key}" data-field="${f.key}" aria-describedby="hint-${f.key} error-${f.key}"`;
    const control = f.type === "select" ? `<select ${attrs}>${options}</select>` :
      `<input ${attrs} inputmode="decimal" type="number" step="${f.integer ? "1" : "any"}" min="${f.min}" ${f.max == null ? "" : `max="${f.max}"`} value="${safe(state.values[f.key])}" placeholder="Sin dato"/>`;
    return `<div class="field"><div class="field-heading"><label for="field-${f.key}">${safe(f.label)}</label><button type="button" class="help" data-help="${f.key}" aria-controls="hint-${f.key}" aria-expanded="false" aria-label="Explicar ${safe(f.label)}">?</button></div><div class="inputWrap">${control}${f.unit ? `<span class="unit">${safe(f.unit)}</span>` : ""}</div><div id="hint-${f.key}" class="parameter-tooltip" role="tooltip" hidden><b>${safe(f.label)}${f.unit ? ` (${safe(f.unit)})` : ""}</b><p>${safe(f.description)}</p>${fieldHelp(f)}</div><small id="provenance-${f.key}" class="field-provenance">${state.material.provenance[f.key]?safe(provenanceText(state.material.provenance[f.key])):state.id==='secado'&&f.key==='startT'&&state.origins.startT==='operating_assumption'?'25 °C · supuesto operativo editable; no dato de fabricante':""}</small><div class="field-error" id="error-${f.key}" role="status"></div></div>`;
  };
  $("fields").innerHTML = fieldGroups(state.id, activeFields(mod(), state.values, state.level)).map(group => `<fieldset class="parameter-group"><legend>${safe(group.label)}</legend><div class="fields">${group.fields.map(renderField).join("")}</div></fieldset>`).join("");
  document.querySelectorAll("[data-field]").forEach(el => el.addEventListener(el.tagName === "SELECT" ? "change" : "input", () => {
    state.values[el.dataset.field] = el.validity.badInput ? "invalid" : el.value;
    markManual(state.material, state.id, el.dataset.field, state.values[el.dataset.field]);
    state.origins[el.dataset.field] = "manual";
    if(state.id==='secado'&&el.dataset.field==='specificHeat'){state.material.context.cpEvidenceConfirmed=false;state.material.context.cpConfirmedSignature='';if($('material-cpEvidenceConfirmed'))$('material-cpEvidenceConfirmed').checked=false;}
    if(state.id==='secado'&&['residence','targetT'].includes(el.dataset.field)) {
      const property=state.material.grade_snapshot?.properties[el.dataset.field==='residence'?'drying_time':'drying_temperature'];
      const number=Number(el.value);
      if(property?.range&&el.value!=='') {
        const inRange=Number.isFinite(number)&&number>=property.range[0]&&number<=property.range[1];
        state.material.context[el.dataset.field==='residence'?'dryingTime':'dryingTemperature']=inRange?el.value:'';
        const entry=state.material.provenance[el.dataset.field];
        Object.assign(entry,{origin:inRange?'range_selection':'user_override',manual_selection:true,reference:structuredClone(property),source:structuredClone(state.material.source),source_id:property.source_id,selection_reason:inRange?'Valor elegido explícitamente por el usuario dentro del rango de ficha':'Anulación manual fuera del rango de ficha; requiere validación técnica'});
      }
    }
    $("provenance-" + el.dataset.field).textContent = state.material.provenance[el.dataset.field]?provenanceText(state.material.provenance[el.dataset.field]):"";
    renderMaterialFeedback($("materials"), state.material, mod(), state.values, state.level);
    if (el.dataset.field === "meltDensity") drawDensity();
    if(state.material.provenance[el.dataset.field])drawMaterials();
    if (el.dataset.field === "method" || el.dataset.field === "shape") draw();
    else invalidate();
  }));

  drawDensity();
  for(const control of $("fields").querySelectorAll('[data-material-context]')) control.addEventListener(control.type==='checkbox'||control.tagName==='SELECT'?'change':'input',()=>materialChanged('context',{key:control.dataset.materialContext,value:control.type==='checkbox'?control.checked:control.value}));
}

function fieldHelp(f) {
  if(f.key==='meltDensity')return '<div id="density-help"></div>';
  if(state.id==='secado'&&f.key==='specificHeat')return renderManualData(state.material,'secado','advanced');
  if(state.id==='secado'&&f.key==='residence') {
    const p=state.material.grade_snapshot?.properties.drying_time;
    const note = getLanguage()==='en'
      ? 'The datasheet time is a nominal residence guideline, not a guarantee of final moisture; verify dryer, initial moisture and dew point.'
      : 'El tiempo de ficha es una guía de residencia nominal, no garantiza humedad final; comprueba secador, humedad inicial y punto de rocío.';
    const rangeNote = p?.range ? (getLanguage()==='en'
      ? `<p>Range: ${safe(p.range[0])}–${safe(p.range[1])} h. The upper bound ${safe(p.range[1])} h is proposed initially (editable), not a mean or a measured drying time.</p>`
      : `<p>Rango: ${safe(p.range[0])}–${safe(p.range[1])} h. Inicialmente se propone el límite superior ${safe(p.range[1])} h (editable), no un promedio ni un dato medido.</p>`) : '';
    return `<p>${note}</p>${rangeNote}`;
  }
  if(state.id==='secado'&&f.key==='bulkDensity')return `<label for="material-physicalForm">Presentación real del material</label><select id="material-physicalForm" data-material-context="physicalForm"><option value="">Sin confirmar</option>${['pellets','powder'].map(x=>`<option ${state.material.context.physicalForm===x?'selected':''}>${x}</option>`).join('')}</select><label><input id="material-bulkCompatible" data-material-context="bulkCompatible" type="checkbox" ${state.material.context.bulkCompatible?'checked':''}>Confirmo método y condiciones de densidad aparente, incluida presentación/tamaño del material.</label><label for="material-bulkDensitySource">Fuente / método de densidad aparente manual</label><input id="material-bulkDensitySource" data-material-context="bulkDensitySource" value="${safe(state.material.context.bulkDensitySource)}">`;
  return '';
}

function compute() {
  if (state.id === 'inyeccion' && $("profile-details")) state.profile.enabled = $("profile-details").open;
  const inputs = Object.fromEntries(activeFields(mod(), state.values, state.level).map(f => [f.key, state.values[f.key]]));
  const drying = state.id === "secado" ? prepareDryingCase(inputs,state.material,state.level,state.origins) : null;
  const a = calculateFormulationCase(state.id, drying ? drying.effective : inputs, state.level, state.material);
  if (drying) {
    a.warnings.push(...drying.warnings);
    a.drying_assessment = drying.assessment;
    a.calculation_inputs = drying.effective;
  }
  if (a.density_provenance?.origin === 'library') {
    state.values.meltDensity = inputs.meltDensity = a.calculation_inputs.meltDensity;
    state.material.provenance.meltDensity = a.density_provenance;
    drawFields();
  }
  a.warnings.push(...materialWarnings(state.material, state.id, inputs, state.level));
  const injectionProfile = state.id === 'inyeccion' ? calculateInjectionProfile(a.calculation_inputs || inputs, state.level, state.profile, a.density_assessment) : null;
  if(injectionProfile&&a.formulation_assessment?.approximate){injectionProfile.estimate_basis='mixture_model';injectionProfile.note=injectionProfile.note?.replaceAll('densidad de familia','densidad de formulación').replaceAll('referencia de familia','modelo de formulación');}
  const issues=inputIssues(state.id,inputs,state.level,a);
  for(const issue of issues)if(!a.warnings.includes(issue.message))a.warnings.push(issue.message);
  const visible=displayMetrics(a);
  const dryingStatus=$('drying-calculation-status');dryingStatus.hidden=state.id!=='secado';
  if(state.id==='secado'){
    const status=dryingStatus;
    status.innerHTML=(drying.assessment.pending.length?'<h3>Resultados de secado pendientes</h3>'+drying.assessment.pending.map(p=>`<p>${safe(p.message)}</p>`).join(''):'<p>Resultados nominales del polímero; no certifican capacidad ni potencia de una máquina.</p>')+drying.warnings.filter(w=>w.startsWith('Cp constante:')).map(w=>`<p>${safe(w)}</p>`).join('');
  }else dryingStatus.replaceChildren();
  const item = {calculation_metadata:{schema_version:"ccip-calculation/2",input_origins:{...state.origins},...(state.id==='secado'?{retained_inputs:{...state.values}}:{})},input_issues:issues, ...(state.id === 'inyeccion' ? {injection_profile_settings:state.profile,injection_profile:injectionProfile} : {}), module: state.id, date: new Date().toISOString(), level: state.level, inputs, material: materialSnapshot(state.material, mod(), a.calculation_inputs || inputs, state.level), ...a };
  $("result-date").textContent = new Date(item.date).toLocaleString("es-DO");
  const format = m => m.value === null ? "Pendiente" : Number(m.value).toLocaleString("es-DO", { maximumFractionDigits: m.precision }) + " " + m.unit;
  const primary = (primaryLabels[state.id] || []).map(label => visible.find(m => m.label === label)).filter(Boolean);
  if(!primary.length)primary.push(...visible.slice(0,3));
  $("summary-metrics").innerHTML = primary.length ? primary.map(m => `<article class="kpi"><h3>${safe(m.label)}</h3><strong>${safe(format(m))}</strong><small>${m.value === null ? "Requiere datos válidos para este resultado" : "Estimación académica"}</small>${densityBadge(m)}${learningLink(m.label)}</article>`).join("") : '<p class="muted">Introduce los datos necesarios para calcular.</p>';
  const usage = visible.find(m => m.label === "Utilización volumétrica teórica");
  $("usage").innerHTML = usage ? `<div class="usage"><b>Utilización geométrica del husillo</b><p>${safe(format(usage))}</p>${densityBadge(usage)}${usage.value === null ? '<p class="muted">Pendiente: requiere volumen de shot, diámetro y carrera disponibles.</p>' : `<div class="usage-track" role="meter" aria-label="Utilización geométrica" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.min(100, Math.max(0, usage.value))}" aria-valuetext="${safe(format(usage))}${usage.value > 100 ? "; supera la capacidad teórica" : ""}"><span style="width:${Math.min(100, Math.max(0, usage.value))}%"></span></div><small>${usage.value > 100 ? "Supera la capacidad geométrica indicada. " : ""}Verifica los límites reales del equipo; el porcentaje no certifica idoneidad.</small>`}</div>` : "";
  $("results-details").hidden=!visible.length;
  $("metrics").innerHTML = visible.map(m => `<div class="metric"><div><b>${safe(m.label)}</b><small>${safe(m.formula)}</small>${densityBadge(m)}${learningLink(m.label)}</div><strong>${m.value === null ? "Pendiente" : Number(m.value).toLocaleString("es-DO", { maximumFractionDigits: m.precision })} ${m.value === null ? "" : safe(m.unit)}</strong></div>`).join("");
  for(const error of document.querySelectorAll('.field-error'))error.replaceChildren();
  for(const input of document.querySelectorAll('[data-field]'))input.removeAttribute('aria-invalid');
  for(const issue of issues.filter(x=>x.field)) {
    const field=$("field-"+issue.field);field?.setAttribute('aria-invalid','true');
    $("error-"+issue.field)?.insertAdjacentHTML('beforeend',`<p>${safe(issue.message)}</p>`);
  }
  $("messages").innerHTML=issues.filter(x=>!x.field).map(x=>`<p class="warning">${safe(x.message)}</p>`).join('');
  drawProfile(injectionProfile);
  return item;
}

function restoreHistoryItem(item) {
    state.id = item.module;
    state.level = item.level;
    state.values = { ...initialValues(), ...(state.id==='secado'?Object.fromEntries(mod().fields.filter(f=>['string','number'].includes(typeof item.calculation_metadata?.retained_inputs?.[f.key])).map(f=>[f.key,item.calculation_metadata.retained_inputs[f.key]])):{}), ...item.inputs };
    state.origins = {...item.calculation_metadata?.input_origins};
    state.material = restoreMaterial(item.material);
    if (state.id === 'inyeccion') state.profile = restoreInjectionProfile(item.injection_profile_settings);
    state.filters = { family: state.material.grade_snapshot?.family || "", manufacturer: state.material.grade_snapshot?.manufacturer || "" };
    nav();
    $("level").value = state.level;
    $("module-title").textContent = mod().name;
    $("module-desc").textContent = mod().description;
    drawFields();drawMaterials();drawProfile(null);renderHistory();compute();
}

$("calculate").addEventListener("click", compute);
$("reset").addEventListener("click", () => { if (state.id === "inyeccion") state.profile = defaultInjectionProfile(); state.values = initialValues(); state.origins = initialOrigins(); state.material = freshMaterial(); state.filters = { family: "", manufacturer: "" }; draw(); });
$("level").addEventListener("change", e => { state.level = e.target.value; draw(); });
historyView = mountHistory({root:$("history"),comparison:$("comparison"),getSnapshot:compute,onRestore:restoreHistoryItem});
state.origins = initialOrigins();
state.values = initialValues();
draw();
initI18n();
explorer=createExplorer($("materials-view"),{
 getShared:()=>sharedCatalog,getSharedAvailable:()=>sharedAvailable,getCatalog:()=>catalogBase,getFormulations:()=>[state.material.formulation,...[...sessions.values()].map(s=>s.material.formulation),...readHistory().map(x=>x.material?.formulation)].filter(Boolean),
 onRoute:key=>showMaterials(key),onBack:()=>closeLearning(),editor:$("custom-material-editor"),
 onNew:()=>{$("custom-panel").open=true;$("custom-form").elements.grade.focus();},
 onUse:entry=>{refreshPersonalCatalog();selectMaterial(library,state.material,state.values,entry.id);state.filters={family:entry.family,manufacturer:entry.manufacturer};closeLearning();draw();},
 onEdit:entry=>{
   const locals=listUserMaterials();if(!locals.some(x=>x.id===entry.id)){persistUserMaterials([...locals,entry.material]);localStorage.setItem('ccip-shared-base-'+entry.id,String(entry.material.shared_revision));drawCustomEditor();}
   explorer.editHost();$("custom-material-editor").querySelector(`[data-personal-edit="${entry.id}"]`)?.click();
 },
 onCopy:entry=>{const copy=structuredClone(entry.material);copy.id=makeCustomMaterial({family:copy.family,grade:copy.grade}).id;copy.grade+=' (copia local)';delete copy.shared_metadata;delete copy.shared_revision;persistUserMaterials([...listUserMaterials(),copy]);refreshPersonalCatalog();drawCustomEditor();showMaterials(copy.id);}
});
document.addEventListener('ccip-language-change',()=>{drawFields();drawMaterials();if(!$("materials-view").hidden)explorer.render(new URL(location.href).searchParams.get('material')||'');});
routeView();


// La carga del catálogo no impide calcular con entradas manuales si falla.
fetch(new URL("./data/materials.v1.3.json", import.meta.url))
  .then(response => { if (!response.ok) throw Error(`HTTP ${response.status}`); return response.json(); })
  .then(async data => {catalogBase=validateLibrary(data);try{const r=await fetch(new URL('./data/user-materials.v1.json',import.meta.url));if(!r.ok)throw Error();sharedCatalog=validateSharedCatalog(await r.json());sharedAvailable=true;refreshPersonalCatalog();}catch{refreshPersonalCatalog();loadStatus+=' · Biblioteca compartida no disponible';}})
  .catch(() => { loadStatus = "Catálogo no disponible: puedes continuar con material personalizado y datos manuales."; })
  .finally(()=>{drawMaterials();if(!$("materials-view").hidden)explorer.render(new URL(location.href).searchParams.get("material")||"");});
