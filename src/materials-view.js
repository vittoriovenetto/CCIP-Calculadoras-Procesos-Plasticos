import { families, manufacturers, grades, propertyLabels, statusLabels, safeSourceUrl, materialWarnings, materialCandidates, outsideProcess } from "./materials.js";
import { renderAudit, renderManualData } from "./materials-audit-view.js";
import { renderMaterialSearch } from "./material-search-ui.js";
export const safe = t => String(t ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const options = (values, selected, prompt) => `<option value="">${safe(prompt)}</option>` + values.map(v => `<option value="${safe(v)}" ${v === selected ? "selected" : ""}>${safe(v)}</option>`).join("");
const phase = key => ({ solid_density: "sólido", melt_density: "fundido", bulk_density: "aparente (pellets/polvo)", specific_heat: "fase e intervalo térmico por confirmar", mfr: "fundido / ensayo de flujo", mvr: "fundido / ensayo de volumen", drying_time: "material a secar / recomendación", drying_temperature: "material a secar / recomendación", moisture_max: "límite de humedad de proceso", moisture_target: "objetivo de humedad" }[key] || "referencia de ensayo/proceso");
const display = p => !p ? "Pendiente: no documentado" : Array.isArray(p.range) ? `${p.range.join("–")} ${p.unit} (rango; no es un valor único)` : `${p.value ?? "Pendiente"} ${p.unit ?? ""}`;
// Solo mostrar propiedades numéricas documentadas, incluso si valen cero.
export function hasDocumentedProperty(p) {
  return !!p && typeof p === "object" && !Array.isArray(p) &&
    ((typeof p.value === "number" && Number.isFinite(p.value)) ||
      (Array.isArray(p.range) && p.range.length === 2 &&
        p.range.every(v => typeof v === "number" && Number.isFinite(v)) && p.range[0] <= p.range[1]));
}
export function documentedProperties(grade) {
  return grade?.properties && typeof grade.properties === "object" && !Array.isArray(grade.properties)
    ? Object.entries(propertyLabels).filter(([key]) => hasDocumentedProperty(grade.properties[key]))
    : [];
}
export function provenanceText(entry) {
  if (!entry) return "Entrada manual / sin ficha aplicada";
  const reference = entry.reference;
  return `${statusLabels[entry.origin] || "Manual"}${reference ? ` · ${statusLabels[reference.status] || "Referencia"} [${entry.source_id}] · referencia: ${display(reference)}` : ""}`;
}
export function renderMaterialFeedback(root, materialState, module, values, level) {
  const grade = materialState.grade_snapshot;
  const messages = materialWarnings(materialState, module.id, values, level);
  const candidates = materialCandidates(materialState, module, values, level);
  for (const candidate of candidates) {
    if (candidate.reason) messages.push(`${propertyLabels[candidate.property_key]}: ${candidate.reason}`);
    else if (materialState.provenance[candidate.field]?.origin === "manual" || materialState.provenance[candidate.field]?.origin === "user_override" ||
      (values[candidate.field] !== "" && values[candidate.field] != null && !materialState.provenance[candidate.field])) messages.push(`${propertyLabels[candidate.property_key]}: valor manual conservado; no se reemplaza por la ficha.`);
  }
  const replacements = candidates.filter(c => !c.reason && ["manual", "user_override"].includes(materialState.provenance[c.field]?.origin));
  root.querySelector('#material-feedback').innerHTML = messages.map(t => `<p class="note">${safe(t)}</p>`).join("") + (grade ? replacements.map(c => `<button data-use-reference="${safe(c.field)}">Usar referencia en ${safe(propertyLabels[c.property_key])}</button>`).join("") : '<p class="muted">Material personalizado / sin ficha: introduce propiedades verificadas. Los parámetros de máquina y geometría siempre se ingresan aparte.</p>');
  root.querySelectorAll('[data-use-reference]').forEach(button => button.addEventListener('click', () => root.onMaterialReference?.(button.dataset.useReference)));
}
export function renderMaterials(root, { library, loadStatus, materialState, filters, module, values, level, onChange, detailsOpen = false, onDetailsToggle = () => {} }) {
  root.onMaterialReference = field => onChange('reference', field);
  const grade = materialState.grade_snapshot;
  const available = !!library;
  const family = grade?.family || filters.family, manufacturer = grade?.manufacturer || filters.manufacturer;
  const familyOptions = available ? families(library) : [];
  const manufacturerOptions = available ? manufacturers(library, family) : [];
  const gradeOptions = available ? grades(library, family, manufacturer) : [];
  const check = (key, label) => `<label class="material-check"><input id="material-${key}" type="checkbox" data-material-context="${key}" ${materialState.context[key] ? "checked" : ""}>${safe(label)}</label>`;
  const sourceUrl = safeSourceUrl(materialState.source?.url);
  // Muestra solo las propiedades realmente informadas por una ficha o usuario.
  // Cero es válido; null, valores no numéricos y rangos incompletos no.
  const properties = documentedProperties(grade);
  const generic = grade?.record_status === "generic_unverified";
  const en = document.documentElement.lang === "en";
  const count = properties.length;
  const compactText = !grade
    ? (en ? "Select a family or add your own grade." : "Selecciona una familia o agrega tu propio material.")
    : generic
      ? (en ? grade.family + " · Generic grade: no technical values; enter documented or measured properties."
            : grade.family + " · Genérico sin propiedades de ficha; introduce valores medidos o documentados.")
      : grade.record_status === "user_entered_unverified"
        ? (en ? grade.family + " · " + grade.grade + " · " + count + " user-entered properties (unverified)."
              : grade.family + " · " + grade.grade + " · " + count + " propiedades ingresadas por usuario (no verificadas).")
        : (en ? grade.family + " · " + grade.grade + " · " + (count ? count + " technical properties available." : "No technical properties entered yet.")
              : grade.family + " · " + grade.grade + " · " + (count ? count + " propiedades técnicas disponibles." : "Sin propiedades técnicas registradas."));
  const detailsTitle = count
    ? (en ? "Material properties, compatibility and references" : "Ficha, compatibilidad, pVT y fuentes")
    : generic
      ? (en ? "Unknown grade: manual data and conditions" : "Grado genérico: datos y condiciones manuales")
      : (en ? "Material information and process conditions" : "Información y condiciones del material");
  const sourceDetails = !grade || generic ? "" : `<p class="muted"><span>Fuente</span> [${safe(grade.source_id)}]: <span ${grade.record_status === "user_entered_unverified" && materialState.source?.description && materialState.source.description !== "Datos introducidos por usuario" ? "data-i18n-ignore" : ""}>${safe(materialState.source?.description || "Metadata no disponible")}</span> · <span>Biblioteca</span> ${safe(materialState.dataset?.version)} · <span>Revisión</span> ${safe(materialState.dataset?.retrieved_on)}</p>${sourceUrl ? `<a class="source-link" target="_blank" rel="noopener noreferrer" href="${safe(sourceUrl)}">Abrir referencia declarada [${safe(grade.source_id)}]</a>` : generic ? "" : '<p class="muted">Enlace de fuente no disponible.</p>'}`;
  root.innerHTML = `<h2 id="materials-title">Material del caso</h2>
    <details class="finder-panel"><summary>🔎 Buscar por nombre, familia o marca</summary><div id="material-finder"></div></details>
    <div class="material-selectors fields">
      <div><label for="material-family">Familia</label><select id="material-family" ${available ? "" : "disabled"}>${options(familyOptions, family, "Material personalizado / sin ficha")}</select></div>
      <div><label for="material-manufacturer">Fabricante</label><select id="material-manufacturer" ${family && available ? "" : "disabled"}>${options(manufacturerOptions, manufacturer, "Selecciona fabricante")}</select></div>
      <div><label for="material-grade">Grado comercial</label><select id="material-grade" ${manufacturer && available ? "" : "disabled"}><option value="">Material personalizado / sin ficha</option>${gradeOptions.map(m => `<option value="${safe(m.id)}" ${m.id === grade?.id ? "selected" : ""}>${safe(m.grade)}</option>`).join("")}</select></div>
    </div><p id="material-load-status" class="muted">${safe(loadStatus)}</p>
    <p class="material-compact">${safe(compactText)}</p>
    <details id="material-details" ${detailsOpen ? 'open' : ''}><summary>${safe(detailsTitle)}</summary><div class="material-details-body">
    ${grade ? `<div class="material-summary"><h3>${safe(grade.family)} · <span ${grade.record_status === "user_entered_unverified" && grade.manufacturer !== "Usuario" ? "data-i18n-ignore" : ""}>${safe(grade.manufacturer)}</span> · <span ${grade.record_status === "user_entered_unverified" ? "data-i18n-ignore" : ""}>${safe(grade.grade)}</span></h3><p>${safe(grade.notes)}</p>${grade.identity_verification ? '<p class="warning">Identidad comercial pendiente de verificación oficial.</p>' : ""}${sourceDetails}
      ${properties.length ? `<details id="material-properties" ${level === "basic" ? "" : "open"}><summary>Ficha: valores, unidades, fase y condiciones</summary><div class="property-list">${properties.map(([key, label]) => {
        const p = grade.properties[key];
        return `<article data-property="${key}" class="material-property"><b>${safe(label)}</b><span>${safe(display(p))}</span><small>${safe(p?.phase || phase(key))}${p ? ` · ${safe(statusLabels[p.status] || "Referencia")} [${safe(p.source_id)}]` : ""}</small>${p ? `<small><span>Método:</span> <span ${p.status === "user_entered" && p.method && p.method !== "Indicado por usuario" ? "data-i18n-ignore" : ""}>${safe(p.method || "no documentado")}</span> · <span>Condiciones:</span> <span ${p.status === "user_entered" && p.condition ? "data-i18n-ignore" : ""}>${safe(p.condition || "no documentadas")}</span></small>${p.note ? `<small ${p.status === "user_entered" && !["Datos introducidos por usuario", "Origen manual; comprobar con ficha técnica o medición."].includes(p.note) ? "data-i18n-ignore" : ""}>${safe(p.note)}</small>` : ""}` : ""}</article>`;
      }).join("")}</div></details>` : ""}
      ${renderAudit(materialState, level)}${level !== "basic" ? '<p class="muted">MFR/MVR/IV solo se comparan con iguales métodos, temperatura, carga y unidades. No se convierten a viscosidad reológica, presión, caudal ni productividad.</p>' : ""}<div class="material-context">
      ${["extrusion", "pelicula", "soplado", "termoformado", "inyeccion"].includes(module.id) ? check('compatible', 'Confirmo el grado/formulación y la compatibilidad de fase, método y condiciones. Si faltan condiciones en la ficha, he validado el valor para mi caso.') : ""}
      ${outsideProcess(grade, module.id) ? check('processConfirmed', 'He validado el uso en este proceso, que no figura entre las aplicaciones de la ficha.') : ""}
      ${module.id === 'secado' ? `<label for="material-physicalForm">Presentación real del material</label><select id="material-physicalForm" data-material-context="physicalForm">${options(['pellets', 'powder'], materialState.context.physicalForm, 'Sin confirmar')}</select><p class="muted">pellets = granza; powder = polvo. Coincidir con la condición de la ficha.</p>${check('bulkCompatible', 'Confirmo método y condiciones de densidad aparente, incluida presentación/tamaño del material. Si faltan en la ficha, he validado el valor para mi caso.')}${check('dryingCompatible', 'Confirmo el método de secado indicado en la ficha y la compatibilidad de humedad inicial, punto de rocío y almacenamiento; validé las condiciones ausentes.')} ${Array.isArray(grade.properties.drying_time?.range) ? `<label for="material-dryingTime">Tiempo elegido dentro de ${safe(display(grade.properties.drying_time))}</label><input id="material-dryingTime" data-material-context="dryingTime" type="number" step="any" min="${grade.properties.drying_time.range[0]}" max="${grade.properties.drying_time.range[1]}" value="${safe(materialState.context.dryingTime)}" placeholder="Elige un valor validado"><p class="muted">No se elige mínimo, máximo ni promedio automáticamente.</p>` : ""}` : ""}
      <label for="material-conditionsNote">Condiciones y justificación del caso / cambios manuales</label><textarea id="material-conditionsNote" data-material-context="conditionsNote" rows="2" placeholder="Fase, temperatura, método, secador o justificación de una modificación">${safe(materialState.context.conditionsNote)}</textarea>
      ${level === "advanced" ? `<label for="material-lot">Lote / formulación / mediciones locales</label><input id="material-lot" data-material-context="lot" value="${safe(materialState.context.lot)}" placeholder="Dato manual, no deducido de la familia"><p class="muted">Solicita pVT a T/P de proceso, cp(T), humedad inicial/final y certificados del lote. Compara alternativas únicamente con iguales métodos y condiciones.</p>` : ""}
      </div></div>` : ""}${renderManualData(materialState, module.id, level)}<div id="material-feedback" aria-live="polite"></div></div></details>`;
  renderMaterialSearch(root,library,id=>onChange("grade",id));
  root.querySelector('#material-details').addEventListener('toggle', e => onDetailsToggle(e.target.open));
  for (const [key, id] of [['family', 'material-family'], ['manufacturer', 'material-manufacturer'], ['grade', 'material-grade']]) root.querySelector('#' + id).addEventListener('change', e => onChange(key, e.target.value));
  root.querySelectorAll('[data-material-context]').forEach(el => el.addEventListener(el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input', () => onChange('context', { key: el.dataset.materialContext, value: el.type === 'checkbox' ? el.checked : el.value })));
  renderMaterialFeedback(root, materialState, module, values, level);
}
