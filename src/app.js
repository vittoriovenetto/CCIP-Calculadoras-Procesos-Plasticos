import { modules, activeFields } from "./schema.js";
import { calculate } from "./engine.js";
import { readHistory, storageKey } from "./history.js";
import { validateLibrary, createMaterialState, selectMaterial, markManual, clearAutomatic, applyMaterial, materialSnapshot, restoreMaterial, materialWarnings } from "./materials.js";
import { safe, renderMaterials, renderMaterialFeedback, provenanceText } from "./materials-view.js";

const $ = id => document.getElementById(id);
const state = { id: "inyeccion", level: "technical", values: {}, material: createMaterialState(), filters: { family: "", manufacturer: "" } };
const sessions = new Map();
let library = null, loadStatus = "Cargando catálogo local…";
const mod = () => modules.find(m => m.id === state.id);
const initialValues = () => Object.fromEntries(mod().fields.map(f => [f.key, f.default ?? ""]));
const loadHistory = () => {
  // Acceder al propio localStorage también puede fallar en contextos restringidos.
  try { return readHistory(localStorage); } catch { return []; }
};

function invalidate() {
  $("result-date").textContent = "Pendientes";
  $("metrics").innerHTML = "<p class='muted'>Introduce los parámetros y pulsa Calcular. Los resultados sin datos válidos quedan pendientes.</p>";
  $("messages").innerHTML = "";
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
  nav();
  $("level").value = state.level;
  $("module-title").textContent = mod().name;
  $("module-desc").textContent = mod().description;
  applyMaterial(state.material, mod(), state.values, state.level);
  drawFields();
  drawMaterials();
  invalidate();
  renderHistory();
}

function drawMaterials() {
  renderMaterials($("materials"), { library, loadStatus, materialState: state.material, filters: state.filters,
    module: mod(), values: state.values, level: state.level, onChange: materialChanged });
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
    if (!["conditionsNote", "lot"].includes(value.key)) {
      clearAutomatic(state.material, state.values);
      applyMaterial(state.material, mod(), state.values, state.level);
      drawFields();
      renderMaterialFeedback($("materials"), state.material, mod(), state.values, state.level);
    }
    invalidate();
    return;
  }
  selectMaterial(library, state.material, state.values, action === "grade" ? value : null);
  if (action === "family") state.filters = { family: value, manufacturer: "" };
  if (action === "manufacturer") state.filters.manufacturer = value;
  draw();
}
function drawFields() {
  $("fields").innerHTML = activeFields(mod(), state.values, state.level).map(f => {
    const options = f.options?.map(([value, label]) => `<option value="${safe(value)}" ${String(state.values[f.key]) === String(value) ? "selected" : ""}>${safe(label)}</option>`).join("") || "";
    const attrs = `id="field-${f.key}" data-field="${f.key}" aria-describedby="hint-${f.key}"`;
    const control = f.type === "select" ? `<select ${attrs}>${options}</select>` :
      `<input ${attrs} inputmode="decimal" type="number" step="${f.integer ? "1" : "any"}" min="${f.min}" ${f.max == null ? "" : `max="${f.max}"`} value="${safe(state.values[f.key])}" placeholder="Sin dato"/>`;
    return `<div class="field"><div class="field-heading"><label for="field-${f.key}">${safe(f.label)}</label><button type="button" class="help" data-help="${f.key}" title="${safe(f.description)}" aria-label="Explicar ${safe(f.label)}">ⓘ</button></div><div class="inputWrap">${control}${f.unit ? `<span class="unit">${safe(f.unit)}</span>` : ""}</div><p id="hint-${f.key}" class="hint">${safe(f.description)}</p><small id="provenance-${f.key}" class="field-provenance">${safe(provenanceText(state.material.provenance[f.key]))}</small></div>`;
  }).join("");
  document.querySelectorAll("[data-field]").forEach(el => el.addEventListener(el.tagName === "SELECT" ? "change" : "input", () => {
    state.values[el.dataset.field] = el.validity.badInput ? "invalid" : el.value;
    markManual(state.material, state.id, el.dataset.field, state.values[el.dataset.field]);
    $("provenance-" + el.dataset.field).textContent = provenanceText(state.material.provenance[el.dataset.field]);
    renderMaterialFeedback($("materials"), state.material, mod(), state.values, state.level);
    if (el.dataset.field === "method" || el.dataset.field === "shape") draw();
    else invalidate();
  }));
  document.querySelectorAll("[data-help]").forEach(el => el.addEventListener("click", () => {
    const f = mod().fields.find(x => x.key === el.dataset.help);
    alert(f.label + ": " + f.description);
  }));
}

function compute() {
  const inputs = Object.fromEntries(activeFields(mod(), state.values, state.level).map(f => [f.key, state.values[f.key]]));
  const a = calculate(state.id, inputs, state.level);
  a.warnings.push(...materialWarnings(state.material, state.id));
  const item = { module: state.id, date: new Date().toISOString(), level: state.level, inputs, material: materialSnapshot(state.material, mod(), inputs, state.level), ...a };
  $("result-date").textContent = new Date(item.date).toLocaleString("es-DO");
  $("metrics").innerHTML = a.metrics.map(m => `<div class="metric"><div><b>${safe(m.label)}</b><small>${safe(m.formula)}</small></div><strong>${m.value === null ? "Pendiente" : Number(m.value).toLocaleString("es-DO", { maximumFractionDigits: m.precision })} ${m.value === null ? "" : safe(m.unit)}</strong></div>`).join("");
  $("messages").innerHTML = a.warnings.map(t => `<div class="warning">⚠ ${safe(t)}</div>`).join("") + a.notes.map(t => `<div class="note">${safe(t)}</div>`).join("");
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
  } catch { alert("No se pudo guardar el historial en este navegador."); }
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

// La carga del catálogo no impide calcular con entradas manuales si falla.
fetch(new URL("./data/materials.v1.json", import.meta.url))
  .then(response => { if (!response.ok) throw Error(`HTTP ${response.status}`); return response.json(); })
  .then(data => { library = validateLibrary(data); loadStatus = `${library.materials.length} grados · biblioteca ${library.schema_version} · revisión ${library.retrieved_on}`; })
  .catch(() => { loadStatus = "Catálogo no disponible: puedes continuar con material personalizado y datos manuales."; })
  .finally(drawMaterials);
