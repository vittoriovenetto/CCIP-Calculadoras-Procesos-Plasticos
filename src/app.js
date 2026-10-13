import { modules, activeFields } from "./schema.js";
import { calculate } from "./engine.js";
import { readHistory, storageKey } from "./history.js";

const $ = id => document.getElementById(id);
const state = { id: "inyeccion", level: "technical", values: {} };
const safe = t => String(t ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;").replaceAll('"', "&quot;");
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
    state.id = b.dataset.module;
    state.values = initialValues();
    draw();
  }));
}

function draw() {
  nav();
  $("level").value = state.level;
  $("module-title").textContent = mod().name;
  $("module-desc").textContent = mod().description;
  $("fields").innerHTML = activeFields(mod(), state.values, state.level).map(f => {
    const options = f.options?.map(([value, label]) => `<option value="${safe(value)}" ${String(state.values[f.key]) === String(value) ? "selected" : ""}>${safe(label)}</option>`).join("") || "";
    const attrs = `id="field-${f.key}" data-field="${f.key}" aria-describedby="hint-${f.key}"`;
    const control = f.type === "select" ? `<select ${attrs}>${options}</select>` :
      `<input ${attrs} inputmode="decimal" type="number" step="${f.integer ? "1" : "any"}" min="${f.min}" ${f.max == null ? "" : `max="${f.max}"`} value="${safe(state.values[f.key])}" placeholder="Sin dato"/>`;
    return `<div class="field"><div class="field-heading"><label for="field-${f.key}">${safe(f.label)}</label><button type="button" class="help" data-help="${f.key}" title="${safe(f.description)}" aria-label="Explicar ${safe(f.label)}">ⓘ</button></div><div class="inputWrap">${control}${f.unit ? `<span class="unit">${safe(f.unit)}</span>` : ""}</div><p id="hint-${f.key}" class="hint">${safe(f.description)}</p></div>`;
  }).join("");
  document.querySelectorAll("[data-field]").forEach(el => el.addEventListener(el.tagName === "SELECT" ? "change" : "input", () => {
    state.values[el.dataset.field] = el.validity.badInput ? "invalid" : el.value;
    if (el.dataset.field === "method" || el.dataset.field === "shape") draw();
    else invalidate();
  }));
  document.querySelectorAll("[data-help]").forEach(el => el.addEventListener("click", () => {
    const f = mod().fields.find(x => x.key === el.dataset.help);
    alert(f.label + ": " + f.description);
  }));
  invalidate();
  renderHistory();
}

function compute() {
  const inputs = Object.fromEntries(activeFields(mod(), state.values, state.level).map(f => [f.key, state.values[f.key]]));
  const a = calculate(state.id, inputs, state.level);
  const item = { module: state.id, date: new Date().toISOString(), level: state.level, inputs, ...a };
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
    draw();
    compute();
  }));
}

$("calculate").addEventListener("click", compute);
$("reset").addEventListener("click", () => { state.values = initialValues(); draw(); });
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
