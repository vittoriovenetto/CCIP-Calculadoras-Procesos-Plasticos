import { modules, activeFields } from "./schema.js";
import { initI18n, getLanguage, t } from "./i18n.js";
import { mergeCustomMaterials, renderCustomEditor } from "./custom-materials.js";
import { calculate } from "./engine.js";
import { readHistory, storageKey } from "./history.js";
import { validateLibrary, createMaterialState, selectMaterial, markManual, clearAutomatic, applyMaterial, materialSnapshot, restoreMaterial, materialWarnings } from "./materials.js";
import { fieldGroups, primaryLabels } from "./presentation.js";
import { bindParameterHelp } from "./tooltips.js";
import { safe, renderMaterials, renderMaterialFeedback, provenanceText } from "./materials-view.js";
import { guideHref } from "./formula-learning.js";

const $ = id => document.getElementById(id);
const state = { id: "inyeccion", level: "technical", values: {}, material: createMaterialState(), filters: { family: "", manufacturer: "" } };
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
  $("result-notes").querySelector("summary").textContent = "Advertencias, hipótesis y límites";
}

function nav() {
  $("modules").innerHTML = modules.map(m => `<button data-module="${m.id}" aria-pressed="${m.id === state.id}" class="${m.id === state.id ? "active" : ""}">${safe(m.name)}</button>`).join("");
  document.querySelectorAll("[data-module]").forEach(b => b.addEventListener("click", () => {
    sessions.set(state.id, { values: state.values, material: state.material, filters: state.filters });
    const selectedGrade = state.material.grade_snapshot?.id;
    state.id = b.dataset.module;
    const session = sessions.get(state.id);
    state.values = session?.values || initialValues();
    state.material = session?.material || createMaterialState();
    state.filters = session?.filters || { family: "", manufacturer: "" };
    if (!session && selectedGrade) selectMaterial(library, state.material, state.values, selectedGrade);
    draw();
  }));
}

function draw() {
  drawLearningLinks();
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

function drawLearningLinks() {
  $("learn-current").href = guideHref(state.id, state.level);
  $("learn-technical").href = guideHref(state.id, "technical");
  $("learn-advanced").href = guideHref(state.id, "advanced");
}

const learningLink = label => `<a class="result-learning" href="${safe(guideHref(state.id, state.level, label))}" target="_blank" rel="noopener">Ver fórmula y ejemplo</a>`;

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
  renderMaterials($("materials"), { library, loadStatus, materialState: state.material, filters: state.filters,
    module: mod(), values: state.values, level: state.level, onChange: materialChanged, detailsOpen: materialDetailsOpen, onDetailsToggle: open => { materialDetailsOpen = open; } });
}
function materialChanged(action, value) {
  if (action === "reference") {
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
    if (["compatible", "physicalForm", "bulkCompatible", "dryingCompatible", "processConfirmed", "dryingTime"].includes(value.key)) {
      clearAutomatic(state.material, state.values);
      applyMaterial(state.material, mod(), state.values, state.level);
      drawFields();
      renderMaterialFeedback($("materials"), state.material, mod(), state.values, state.level);
    }
    else renderMaterialFeedback($("materials"), state.material, mod(), state.values, state.level);
    invalidate();
    return;
  }
  if (action === "family" && value && library) {
    const generic = library.materials.find(m => m.family === value && m.record_status === "generic_unverified");
    selectMaterial(library, state.material, state.values, generic?.id || null);
    state.filters = { family: value, manufacturer: generic?.manufacturer || "" };
    draw();
    return;
  }
  selectMaterial(library, state.material, state.values, action === "grade" ? value : null);
  if (action === "family") state.filters = { family: value, manufacturer: "" };
  if (action === "manufacturer") state.filters.manufacturer = value;
  draw();
}
function drawFields() {
  parameterHelp.close();
  const renderField = f => {
    const options = f.options?.map(([value, label]) => `<option value="${safe(value)}" ${String(state.values[f.key]) === String(value) ? "selected" : ""}>${safe(label)}</option>`).join("") || "";
    const attrs = `id="field-${f.key}" data-field="${f.key}" aria-describedby="hint-${f.key}"`;
    const control = f.type === "select" ? `<select ${attrs}>${options}</select>` :
      `<input ${attrs} inputmode="decimal" type="number" step="${f.integer ? "1" : "any"}" min="${f.min}" ${f.max == null ? "" : `max="${f.max}"`} value="${safe(state.values[f.key])}" placeholder="Sin dato"/>`;
    return `<div class="field"><div class="field-heading"><label for="field-${f.key}">${safe(f.label)}</label><button type="button" class="help" data-help="${f.key}" aria-controls="hint-${f.key}" aria-expanded="false" aria-label="Explicar ${safe(f.label)}">?</button></div><div class="inputWrap">${control}${f.unit ? `<span class="unit">${safe(f.unit)}</span>` : ""}</div><div id="hint-${f.key}" class="parameter-tooltip" role="tooltip" hidden><b>${safe(f.label)}${f.unit ? ` (${safe(f.unit)})` : ""}</b><p>${safe(f.description)}</p></div><small id="provenance-${f.key}" class="field-provenance">${safe(provenanceText(state.material.provenance[f.key]))}</small></div>`;
  };
  $("fields").innerHTML = fieldGroups(state.id, activeFields(mod(), state.values, state.level)).map(group => `<fieldset class="parameter-group"><legend>${safe(group.label)}</legend><div class="fields">${group.fields.map(renderField).join("")}</div></fieldset>`).join("");
  document.querySelectorAll("[data-field]").forEach(el => el.addEventListener(el.tagName === "SELECT" ? "change" : "input", () => {
    state.values[el.dataset.field] = el.validity.badInput ? "invalid" : el.value;
    markManual(state.material, state.id, el.dataset.field, state.values[el.dataset.field]);
    $("provenance-" + el.dataset.field).textContent = provenanceText(state.material.provenance[el.dataset.field]);
    renderMaterialFeedback($("materials"), state.material, mod(), state.values, state.level);
    if (el.dataset.field === "method" || el.dataset.field === "shape") draw();
    else invalidate();
  }));

}

function compute() {
  const inputs = Object.fromEntries(activeFields(mod(), state.values, state.level).map(f => [f.key, state.values[f.key]]));
  const a = calculate(state.id, inputs, state.level);
  a.warnings.push(...materialWarnings(state.material, state.id, inputs, state.level));
  const item = { module: state.id, date: new Date().toISOString(), level: state.level, inputs, material: materialSnapshot(state.material, mod(), inputs, state.level), ...a };
  $("result-date").textContent = new Date(item.date).toLocaleString("es-DO");
  const format = m => m.value === null ? "Pendiente" : Number(m.value).toLocaleString("es-DO", { maximumFractionDigits: m.precision }) + " " + m.unit;
  const primary = (primaryLabels[state.id] || []).map(label => a.metrics.find(m => m.label === label)).filter(Boolean);
  $("summary-metrics").innerHTML = primary.map(m => `<article class="kpi"><h3>${safe(m.label)}</h3><strong>${safe(format(m))}</strong><small>${m.value === null ? "Requiere datos válidos para este resultado" : "Estimación académica"}</small>${learningLink(m.label)}</article>`).join("");
  const usage = a.metrics.find(m => m.label === "Utilización volumétrica teórica");
  $("usage").innerHTML = usage ? `<div class="usage"><b>Utilización geométrica del husillo</b><p>${safe(format(usage))}</p>${usage.value === null ? '<p class="muted">Pendiente: requiere volumen de shot, diámetro y carrera disponibles.</p>' : `<div class="usage-track" role="meter" aria-label="Utilización geométrica" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.min(100, Math.max(0, usage.value))}" aria-valuetext="${safe(format(usage))}${usage.value > 100 ? "; supera la capacidad teórica" : ""}"><span style="width:${Math.min(100, Math.max(0, usage.value))}%"></span></div><small>${usage.value > 100 ? "Supera la capacidad geométrica indicada. " : ""}Verifica los límites reales del equipo; el porcentaje no certifica idoneidad.</small>`}</div>` : "";
  $("metrics").innerHTML = a.metrics.map(m => `<div class="metric"><div><b>${safe(m.label)}</b><small>${safe(m.formula)}</small>${learningLink(m.label)}</div><strong>${m.value === null ? "Pendiente" : Number(m.value).toLocaleString("es-DO", { maximumFractionDigits: m.precision })} ${m.value === null ? "" : safe(m.unit)}</strong></div>`).join("");
  $("messages").innerHTML = a.warnings.map(t => `<div class="warning">⚠ ${safe(t)}</div>`).join("") + a.notes.map(t => `<div class="note">${safe(t)}</div>`).join("");
  $("result-notes").querySelector("summary").textContent = a.warnings.length ? `Advertencias (${a.warnings.length}), hipótesis y límites` : "Hipótesis y límites";
  if (a.warnings.length) $("result-notes").open = true;
  return item;
}

function renderHistory() {
  const items = loadHistory();
  $("history").innerHTML = items.length ? items.slice(0, 15).map((x, i) => `<div class="historyRow"><span>${safe(modules.find(m => m.id === x.module).name)} · ${safe(new Date(x.date).toLocaleString("es-DO"))}</span><button data-history="${i}">Recuperar</button></div>`).join("") : "<p class='muted'>Aún no hay cálculos guardados en este navegador.</p>";
  document.querySelectorAll("[data-history]").forEach(b => b.addEventListener("click", () => {
    const item = items[Number(b.dataset.history)];
    state.id = item.module;
    state.level = item.level;
    state.values = { ...initialValues(), ...item.inputs };
    state.material = restoreMaterial(item.material);
    state.filters = { family: state.material.grade_snapshot?.family || "", manufacturer: state.material.grade_snapshot?.manufacturer || "" };
    // Recuperar conserva el snapshot: no volver a aplicar datos actuales ni ocultos.
    nav();
    $("level").value = state.level;
    $("module-title").textContent = mod().name;
    $("module-desc").textContent = mod().description;
    drawLearningLinks();
    drawFields();
    drawMaterials();
    renderHistory();
    compute();
  }));
}

$("calculate").addEventListener("click", compute);
$("reset").addEventListener("click", () => { state.values = initialValues(); state.material = createMaterialState(); state.filters = { family: "", manufacturer: "" }; draw(); });
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


// La carga del catálogo no impide calcular con entradas manuales si falla.
fetch(new URL("./data/materials.v1.3.json", import.meta.url))
  .then(response => { if (!response.ok) throw Error(`HTTP ${response.status}`); return response.json(); })
  .then(data => { catalogBase = validateLibrary(data); library = validateLibrary(mergeCustomMaterials(catalogBase)); loadStatus = `${library.materials.length} opciones · catálogo ${data.catalog_revision || data.schema_version} · revisión ${library.retrieved_on}`; })
  .catch(() => { loadStatus = "Catálogo no disponible: puedes continuar con material personalizado y datos manuales."; })
  .finally(drawMaterials);
