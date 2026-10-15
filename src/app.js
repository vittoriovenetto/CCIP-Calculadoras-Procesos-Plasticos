import { modules, activeFields } from "./schema.js";
import { initI18n, getLanguage, t } from "./i18n.js";
import { mergeCustomMaterials, renderCustomEditor } from "./custom-materials.js";
import { calculateWithMeltDensity, applyFamilyMeltDensity } from "./injection-density.js";
import { renderInjectionDensity } from "./injection-density-view.js";
import { readHistory, renameHistoryItem, storageKey } from "./history.js";
import { validateLibrary, createMaterialState, selectMaterial, markManual, clearAutomatic, applyMaterial, materialSnapshot, restoreMaterial, materialWarnings } from "./materials.js";
import { fieldGroups, primaryLabels } from "./presentation.js";
import { bindParameterHelp } from "./tooltips.js";
import { safe, renderMaterials, renderMaterialFeedback, provenanceText } from "./materials-view.js";
import { guideHref } from "./formula-learning.js";
import { renderComparison } from "./compare.js";
import { defaultInjectionProfile, restoreInjectionProfile, calculateInjectionProfile } from "./injection-profile.js";
import { renderInjectionProfile } from "./injection-profile-view.js";
import { renderManualData } from "./materials-audit-view.js";
import { materialCatalogFor, hasDryingGuideline, enableLeanMaterial } from "./lean-materials.js";
import { displayMetrics, inputIssues } from "./results-view.js";
import { mountGuide } from "./formulas-index.js";
const freshMaterial = () => enableLeanMaterial(createMaterialState());

const $ = id => document.getElementById(id);
const state = { id: "inyeccion", level: "technical", values: {}, material: freshMaterial(), filters: { family: "", manufacturer: "" } };
state.profile = defaultInjectionProfile();
const sessions = new Map();
let library = null, catalogBase = null, loadStatus = "Cargando catálogo local…";
let materialDetailsOpen = false;
const parameterHelp = bindParameterHelp($("fields"));
const mod = () => modules.find(m => m.id === state.id);
const initialValues = () => Object.fromEntries(mod().fields.map(f => [f.key, f.default ?? ""]));
const loadHistory = () => {
  // Acceder al propio localStorage también puede fallar en contextos restringidos.
  try { return readHistory(localStorage); } catch { return []; }
};

function invalidate() {
  $("result-date").textContent = "Pendientes";
  $("summary-metrics").innerHTML = '<p class="muted">Los resultados aparecerán aquí al calcular.</p>';
  $("usage").innerHTML = "";
  $("metrics").innerHTML = "<p class='muted'>Introduce los parámetros y pulsa Calcular. Los resultados sin datos válidos quedan pendientes.</p>";
  $("messages").innerHTML = "";
  drawProfile(null);
  for(const error of document.querySelectorAll('.field-error')) error.replaceChildren();
  for(const input of document.querySelectorAll('[data-field]')) input.removeAttribute('aria-invalid');
}

function nav() {
  $("modules").innerHTML = modules.map(m => `<button data-module="${m.id}" aria-pressed="${m.id === state.id}" class="${m.id === state.id ? "active" : ""}">${safe(m.name)}</button>`).join("");
  document.querySelectorAll("[data-module]").forEach(b => b.addEventListener("click", () => {
    sessions.set(state.id, { values: state.values, material: state.material, filters: state.filters });
    const selectedGrade = state.material.grade_snapshot?.id;
    state.id = b.dataset.module;
    const session = sessions.get(state.id);
    state.values = session?.values || initialValues();
    state.material = session?.material || freshMaterial();
    state.filters = session?.filters || { family: "", manufacturer: "" };
    if (!session && selectedGrade) selectMaterial(library, state.material, state.values, selectedGrade);
    closeLearning();draw();
  }));
}

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
for(const key of ['view','process','level'])calculatorUrl.searchParams.delete(key);
calculatorUrl.hash='';
function closeLearning(push=true) {
  if($("learning-view").hidden)return;
  $("learning-view").hidden=true;$("calculator-view").hidden=false;$("learn-page").removeAttribute("aria-current");
  if(push)history.pushState({ccipView:'calculator'},'',calculatorUrl);
  $("module-title").setAttribute('tabindex','-1');$("module-title").focus({preventScroll:true});
}
function showLearning(href,push=true) {
  parameterHelp.close();
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
addEventListener('popstate',()=>new URL(location.href).searchParams.get('view')==='learning'?showLearning(location.href,false):closeLearning(false));

function refreshPersonalCatalog() {
  const base = catalogBase || {schema_version:"1.3.0",dataset_name:"Personal materials",retrieved_on:new Date().toISOString().slice(0,10),sources:{},materials:[]};
  const merged = mergeCustomMaterials(base);
  library = merged.materials.length ? validateLibrary(merged) : null;
  if (library) loadStatus = `${library.materials.length} opciones · catálogo ${library.catalog_revision || library.schema_version} · revisión ${library.retrieved_on}`;
}
function drawCustomEditor() {
  renderCustomEditor($("custom-material-editor"), {
    onSave: record => {
      refreshPersonalCatalog();
      for (const session of sessions.values()) if (session.material.grade_snapshot?.id === record.id) selectMaterial(library,session.material,session.values,record.id);
      selectMaterial(library,state.material,state.values,record.id);
      state.filters = {family:record.family,manufacturer:record.manufacturer};
      drawCustomEditor();draw();
    },
    onDelete: id => {
      refreshPersonalCatalog();
      for (const session of sessions.values()) if (session.material.grade_snapshot?.id === id) {selectMaterial(library,session.material,session.values,null);session.filters={family:"",manufacturer:""};}
      if (state.material.grade_snapshot?.id === id) {selectMaterial(library,state.material,state.values,null);state.filters={family:"",manufacturer:""};}
      drawCustomEditor();draw();
    },
    onImport: () => {refreshPersonalCatalog();drawCustomEditor();draw();$("custom-panel").open=true;}
  });
}

function drawMaterials() {
  renderMaterials($("materials"), { library: materialCatalogFor(library,state.id), loadStatus, materialState: state.material, filters: state.filters,
    module: mod(), values: state.values, level: state.level, onChange: materialChanged, detailsOpen: materialDetailsOpen, onDetailsToggle: open => { materialDetailsOpen = open; } });
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
const densityBadge = metric => metric.density_estimate ? '<small class="density-estimate">Estimación · densidad de familia</small>' : '';

function materialChanged(action, value) {
  if (action === "reference") {
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
    if (state.id === 'inyeccion' && ['pvtTemperatureC','pvtPressureMPa','meltDensitySource'].includes(value.key)) {
      state.material.context.meltDensityVerified = false;
      if ($('density-verified')) $('density-verified').checked = false;
    }
    if (state.id === 'inyeccion' && ['pvtTemperatureC','pvtPressureMPa'].includes(value.key)) {
      const previous = state.values.meltDensity;
      applyFamilyMeltDensity(state.material,mod(),state.values,state.level);
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
      clearAutomatic(state.material, state.values);
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
    return `<div class="field"><div class="field-heading"><label for="field-${f.key}">${safe(f.label)}</label><button type="button" class="help" data-help="${f.key}" aria-controls="hint-${f.key}" aria-expanded="false" aria-label="Explicar ${safe(f.label)}">?</button></div><div class="inputWrap">${control}${f.unit ? `<span class="unit">${safe(f.unit)}</span>` : ""}</div><div id="hint-${f.key}" class="parameter-tooltip" role="tooltip" hidden><b>${safe(f.label)}${f.unit ? ` (${safe(f.unit)})` : ""}</b><p>${safe(f.description)}</p>${fieldHelp(f)}</div><small id="provenance-${f.key}" class="field-provenance">${state.material.provenance[f.key]?safe(provenanceText(state.material.provenance[f.key])):""}</small><div class="field-error" id="error-${f.key}" role="status"></div></div>`;
  };
  $("fields").innerHTML = fieldGroups(state.id, activeFields(mod(), state.values, state.level)).map(group => `<fieldset class="parameter-group"><legend>${safe(group.label)}</legend><div class="fields">${group.fields.map(renderField).join("")}</div></fieldset>`).join("");
  document.querySelectorAll("[data-field]").forEach(el => el.addEventListener(el.tagName === "SELECT" ? "change" : "input", () => {
    state.values[el.dataset.field] = el.validity.badInput ? "invalid" : el.value;
    markManual(state.material, state.id, el.dataset.field, state.values[el.dataset.field]);
    if(state.id==='secado'&&['residence','targetT'].includes(el.dataset.field)) {
      const property=state.material.grade_snapshot?.properties[el.dataset.field==='residence'?'drying_time':'drying_temperature'];
      const number=Number(el.value);
      if(property?.range&&el.value!=='') {
        const inRange=Number.isFinite(number)&&number>=property.range[0]&&number<=property.range[1];
        state.material.context[el.dataset.field==='residence'?'dryingTime':'dryingTemperature']=inRange?el.value:'';
        const entry=state.material.provenance[el.dataset.field];
        Object.assign(entry,{origin:inRange?'range_selection':'user_override',reference:structuredClone(property),source:structuredClone(state.material.source),source_id:property.source_id,selection_reason:inRange?'Valor elegido explícitamente por el usuario dentro del rango de ficha':'Anulación manual fuera del rango de ficha; requiere validación técnica'});
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
    return `<p>La recomendación de secado es una guía; usarla como residencia nominal exige comprobar humedad inicial, secador y punto de rocío. No garantiza humedad final.</p>${p?.range?`<p>Elige explícitamente un tiempo entre ${safe(p.range[0])} y ${safe(p.range[1])} h; no se usa un promedio.</p>`:''}`;
  }
  if(state.id==='secado'&&f.key==='bulkDensity')return `<label for="material-physicalForm">Presentación real del material</label><select id="material-physicalForm" data-material-context="physicalForm"><option value="">Sin confirmar</option>${['pellets','powder'].map(x=>`<option ${state.material.context.physicalForm===x?'selected':''}>${x}</option>`).join('')}</select><label><input id="material-bulkCompatible" data-material-context="bulkCompatible" type="checkbox" ${state.material.context.bulkCompatible?'checked':''}>Confirmo método y condiciones de densidad aparente, incluida presentación/tamaño del material.</label>`;
  return '';
}

function compute() {
  if (state.id === 'inyeccion' && $("profile-details")) state.profile.enabled = $("profile-details").open;
  const inputs = Object.fromEntries(activeFields(mod(), state.values, state.level).map(f => [f.key, state.values[f.key]]));
  const a = calculateWithMeltDensity(state.id, inputs, state.level, state.material);
  if (a.density_provenance?.origin === 'library') {
    state.values.meltDensity = inputs.meltDensity = a.calculation_inputs.meltDensity;
    state.material.provenance.meltDensity = a.density_provenance;
    drawFields();
  }
  a.warnings.push(...materialWarnings(state.material, state.id, inputs, state.level));
  const injectionProfile = state.id === 'inyeccion' ? calculateInjectionProfile(a.calculation_inputs || inputs, state.level, state.profile, a.density_assessment) : null;
  const issues=inputIssues(state.id,inputs,state.level,a);
  for(const issue of issues)if(!a.warnings.includes(issue.message))a.warnings.push(issue.message);
  const visible=displayMetrics(a);
  const item = {input_issues:issues, ...(state.id === 'inyeccion' ? {injection_profile_settings:state.profile,injection_profile:injectionProfile} : {}), module: state.id, date: new Date().toISOString(), level: state.level, inputs, material: materialSnapshot(state.material, mod(), a.calculation_inputs || inputs, state.level), ...a };
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

function renderHistory() {
  const items = loadHistory();
  $("history").innerHTML = items.length ? items.slice(0, 15).map((x, i) => `<div class="historyRow"><span>${typeof x.name === 'string' && x.name ? `<b data-i18n-ignore>${safe(x.name)}</b> · ` : ''}${safe(modules.find(m => m.id === x.module).name)} · ${safe(new Date(x.date).toLocaleString("es-DO"))}</span><button type="button" data-history-rename="${i}">Renombrar</button><button data-history="${i}">Recuperar</button></div>`).join("") : "<p class='muted'>Aún no hay cálculos guardados en este navegador.</p>";
  renderComparison($("comparison"), items, modules);
  $("history").querySelectorAll('[data-history-rename]').forEach(button => button.addEventListener('click', () => {
    const index = Number(button.dataset.historyRename), item = items[index];
    const name = prompt(t('Nombre del cálculo (máximo 120 caracteres):'), typeof item.name === 'string' ? item.name : t(modules.find(m => m.id === item.module).name));
    if (name === null) return;
    if (!name.trim() || name.trim().length > 120) { alert(t('Introduce un nombre de 1 a 120 caracteres.')); return; }
    try { renameHistoryItem(localStorage, index, name); renderHistory(); }
    catch { alert(t('No se pudo renombrar el cálculo en este navegador.')); }
  }));
  document.querySelectorAll("[data-history]").forEach(b => b.addEventListener("click", () => {
    const item = items[Number(b.dataset.history)];
    state.id = item.module;
    state.level = item.level;
    state.values = { ...initialValues(), ...item.inputs };
    state.material = restoreMaterial(item.material);
    if (state.id === 'inyeccion') state.profile = restoreInjectionProfile(item.injection_profile_settings);
    state.filters = { family: state.material.grade_snapshot?.family || "", manufacturer: state.material.grade_snapshot?.manufacturer || "" };
    // Recuperar conserva el snapshot: no volver a aplicar datos actuales ni ocultos.
    nav();
    $("level").value = state.level;
    $("module-title").textContent = mod().name;
    $("module-desc").textContent = mod().description;
    drawFields();
    drawMaterials();
    drawProfile(null);
    renderHistory();
    compute();
  }));
}

$("calculate").addEventListener("click", compute);
$("reset").addEventListener("click", () => { if (state.id === "inyeccion") state.profile = defaultInjectionProfile(); state.values = initialValues(); state.material = freshMaterial(); state.filters = { family: "", manufacturer: "" }; draw(); });
$("level").addEventListener("change", e => { state.level = e.target.value; draw(); });
$("save").addEventListener("click", () => {
  const item = compute();
  const history = loadHistory();
  history.unshift(item);
  try {
    localStorage.setItem(storageKey, JSON.stringify(history.slice(0, 60)));
    renderHistory();
  } catch { alert(t("No se pudo guardar el historial en este navegador.")); }
});
$("export").addEventListener("click", () => {
  const item = compute();
  const blob = new Blob([JSON.stringify(item, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob), a = document.createElement("a");
  a.href = url;
  a.download = "ccip-" + item.module + "-" + item.date.slice(0, 10) + ".json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
state.values = initialValues();
draw();
initI18n();
if(new URL(location.href).searchParams.get('view')==='learning')showLearning(location.href,false);


// La carga del catálogo no impide calcular con entradas manuales si falla.
fetch(new URL("./data/materials.v1.3.json", import.meta.url))
  .then(response => { if (!response.ok) throw Error(`HTTP ${response.status}`); return response.json(); })
  .then(data => { catalogBase = validateLibrary(data); library = validateLibrary(mergeCustomMaterials(catalogBase)); loadStatus = `${library.materials.length} opciones · catálogo ${data.catalog_revision || data.schema_version} · revisión ${library.retrieved_on}`; })
  .catch(() => { loadStatus = "Catálogo no disponible: puedes continuar con material personalizado y datos manuales."; })
  .finally(drawMaterials);
