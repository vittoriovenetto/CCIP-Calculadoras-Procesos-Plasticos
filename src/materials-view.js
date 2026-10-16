import {activeFormulation} from './recycled.js';
import { families, manufacturers, grades, propertyLabels, statusLabels, safeSourceUrl, outsideProcess } from "./materials.js";
import { renderAudit } from "./materials-audit-view.js";
import { t } from "./i18n.js";
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
  if (entry.origin === 'family_reference') return `Referencia de familia · estimación · ${entry.family} · ${entry.value} g/cm³`;
  if(entry.formulation_id)return `${entry.origin==='mixture_model'?t('Estimación de mezcla'):t('Dato manual de formulación')} · ${entry.value} ${entry.unit||''}`;
  const reference = entry.reference;
  return `${statusLabels[entry.origin] || "Manual"}${reference ? ` · ${statusLabels[reference.status] || "Referencia"} [${entry.source_id}] · referencia: ${display(reference)}` : ""}`;
}
export function renderMaterialFeedback(root, materialState, module, values, level) {
  const grade = materialState.grade_snapshot;
  // La evidencia completa sigue en el snapshot y la exportación. Aquí solo
  // aparece una acción cuando la aplicación al proceso necesita confirmación.
  const mismatch = !activeFormulation(materialState) && grade && outsideProcess(grade,module.id) && !materialState.context.processConfirmed;
  const feedback=root.querySelector('#material-feedback');
  if (!feedback) return;
  feedback.innerHTML = mismatch ? `<p class="warning">El proceso activo no está indicado en la ficha; confirma su compatibilidad antes de aplicar propiedades.</p>` : '';

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
  const extra = (Array.isArray(grade?.additional_properties) ? grade.additional_properties : []).filter(p => p && typeof p.value === "number" && Number.isFinite(p.value));
  const extraNames = {
    tensile_strength_yield: ["Resistencia a tracción en fluencia","Tensile yield strength"],
    tensile_modulus: ["Módulo de tracción","Tensile modulus"],
    flexural_modulus: ["Módulo de flexión","Flexural modulus"],
    secant_modulus: ["Módulo secante","Secant modulus"],
    deflection_temperature: ["Temperatura de deflexión térmica","Heat deflection temperature"],
    chip_count: ["Número de pellets por gramo","Pellets per gram"],
    inherent_viscosity: ["Viscosidad inherente (PVC)","Inherent viscosity (PVC)"],
    k_value: ["Valor K del PVC","PVC K value"],
    volatile_max: ["Contenido máximo de volátiles","Maximum volatile content"],
    particle_fines_max: ["Fracción de finos máxima","Maximum fines fraction"],
    drying_temperature_source_f: ["Temperatura de secado publicada (°F)","Published drying temperature (°F)"],
    mvr_secondary: ["Índice volumétrico de fluidez (otra condición)","Melt volume rate (other conditions)"],
    mfr_secondary: ["Índice de fluidez (otra carga)","Melt index (other test load)"],
    hardness_shore_d: ["Dureza Shore D","Shore D hardness"],
    vicat_temperature: ["Temperatura Vicat","Vicat temperature"],
    haze: ["Neblina óptica","Haze"],
    dart_impact: ["Impacto dardo","Dart drop impact"]
  };
  const extraMarkup = extra.length ? `<div class="property-list">${extra.map(p=>{
    const label=extraNames[p.key]?.[document.documentElement.lang==="en"?1:0]||p.key;
    const lang=document.documentElement.lang==="en"?"en":"es";
    const units=lang==="en"&&p.unit==="% masa máx."?"% mass max.":p.unit;
    const sourceStatus=p.status==="manufacturer_recommendation"
      ? (lang==="en"?"Manufacturer recommendation":"Recomendación de fabricante")
      : (lang==="en"?"Typical manufacturer value":"Valor típico de fabricante");
    return `<article class="material-property" data-property="${safe(p.key)}"><b>${safe(label)}</b><span><span>${safe(p.value)}</span> <span>${safe(units)}</span></span><small><span>${safe(t(p.method||"",lang))}</span>${p.condition?" · <span>"+safe(t(p.condition,lang))+"</span>":""} · <span>${safe(sourceStatus)}</span></small></article>` ;
  }).join("")}</div>` : "";
  const generic = grade?.record_status === "generic_unverified";
  const en = document.documentElement.lang === "en";
  const count = properties.length + extra.length;
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
  const sourceDetails = !grade || generic ? "" : `<p class="muted"><span>Fuente</span> [${safe(grade.source_id)}]: <span ${grade.record_status === "user_entered_unverified" && materialState.source?.description && materialState.source.description !== "Datos introducidos por usuario" ? "data-i18n-ignore" : ""}>${safe(materialState.source?.description || "Metadata no disponible")}</span> · <span>Biblioteca</span> ${safe(materialState.dataset?.version)} · <span>Revisión</span> ${safe(materialState.dataset?.retrieved_on)}</p>${sourceUrl ? `<a class="source-link" target="_blank" rel="noopener noreferrer" href="${safe(sourceUrl)}">Abrir referencia declarada [${safe(grade.source_id)}]</a>` : generic ? "" : '<p class="muted">Enlace de fuente no disponible.</p>'}`;
  const selectedVisible = !grade || !library || library.materials.some(m=>m.id===grade.id);
  const drying=module.id==='secado';
  const dryText = p => p ? display(p) : '';
  root.innerHTML = `<h2 id="materials-title">Material del caso</h2>
    <details class="finder-panel"><summary>🔎 Buscar por nombre, familia o marca</summary><div id="material-finder"></div></details>
    <div class="material-selectors fields">
      <div><label for="material-family">Familia</label><select id="material-family" ${available?'':'disabled'}>${options(familyOptions,selectedVisible?family:'',drying?'Selecciona material con datos de secado':'Material personalizado / sin ficha')}</select></div>
      <div><label for="material-manufacturer">Fabricante</label><select id="material-manufacturer" ${family&&available?'':'disabled'}>${options(manufacturerOptions,selectedVisible?manufacturer:'','Selecciona fabricante')}</select></div>
      <div><label for="material-grade">Grado comercial</label><select id="material-grade" ${manufacturer&&available?'':'disabled'}><option value="">${drying?'Selecciona un grado con secado documentado':'Material personalizado / sin ficha'}</option>${gradeOptions.map(m=>`<option value="${safe(m.id)}" ${m.id===grade?.id?'selected':''}>${safe(m.grade)}</option>`).join('')}</select></div>
    </div><p id="material-load-status" class="muted">${safe(loadStatus)}</p>
    ${selectedVisible ? `<p class="material-compact">${safe(compactText)}</p>` : ''}
    ${drying ? `<div id="drying-status">${!selectedVisible || !grade ? `<p>El material anterior no tiene tiempo/temperatura de secado en ficha. Elige otro grado o usa datos manuales documentados.</p><button type="button" id="drying-manual">Usar datos manuales documentados</button>` : `<p><b>Recomendación de secado de ficha:</b> ${safe(dryText(grade.properties.drying_temperature))} · ${safe(dryText(grade.properties.drying_time))}</p><p class="muted">Usar como residencia nominal de tolva requiere condiciones compatibles de secador, humedad y punto de rocío. No predice humedad residual.</p>`}</div>` : ''}
    ${count && selectedVisible ? `<details id="material-details" ${detailsOpen?'open':''}><summary>Ficha y fuentes</summary><div class="material-details-body">${sourceDetails}
      <details id="material-properties"><summary>Ficha: valores, unidades, fase y condiciones</summary><div class="property-list">${properties.map(([key,label])=>{
        const p=grade.properties[key];
        return `<article data-property="${key}" class="material-property"><b>${safe(label)}</b><span>${safe(display(p))}</span><small>${safe(p.phase||phase(key))} · ${safe(statusLabels[p.status]||'Referencia')} [${safe(p.source_id)}]</small><small><span>Método:</span> <span ${p.status==='user_entered'?'data-i18n-ignore':''}>${safe(p.method||'no documentado')}</span> · <span>Condiciones:</span> <span ${p.status==='user_entered'?'data-i18n-ignore':''}>${safe(p.condition||'no documentadas')}</span></small>${p.note?`<small ${p.status==='user_entered'?'data-i18n-ignore':''}>${safe(p.note)}</small>`:''}</article>`;
      }).join('')}</div>${extraMarkup}</details>${renderAudit(materialState,level)}</div></details>` : ''}
    ${!activeFormulation(materialState)&&outsideProcess(grade,module.id) ? check('processConfirmed','He validado el uso en este proceso, que no figura entre las aplicaciones de la ficha.') : ''}
    ${Object.values(materialState.provenance).some(e=>e.origin==='user_override') ? `<details class="manual-justification"><summary>Justificación de los cambios manuales</summary><label for="material-conditionsNote">Condiciones y justificación del caso / cambios manuales</label><textarea id="material-conditionsNote" data-material-context="conditionsNote" rows="2">${safe(materialState.context.conditionsNote)}</textarea></details>` : ''}
    <div id="material-feedback" aria-live="polite"></div>`;

  renderMaterialSearch(root,library,id=>onChange("grade",id));
  root.querySelector('#drying-manual')?.addEventListener('click',()=>onChange('context',{key:'dryingManualMode',value:true}));
  root.querySelector('#material-details')?.addEventListener('toggle', e => onDetailsToggle(e.target.open));
  for (const [key, id] of [['family', 'material-family'], ['manufacturer', 'material-manufacturer'], ['grade', 'material-grade']]) root.querySelector('#' + id).addEventListener('change', e => onChange(key, e.target.value));
  root.querySelectorAll('[data-material-context]').forEach(el => el.addEventListener(el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input', () => onChange('context', { key: el.dataset.materialContext, value: el.type === 'checkbox' ? el.checked : el.value })));
  renderMaterialFeedback(root, materialState, module, values, level);
}
