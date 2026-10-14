/** Local, unverified records. Validate and normalize before storage or merging. */
import { getLanguage, t } from './i18n.js';
export const USER_KEY = 'ccip-user-materials-v1';
export const FAMILIES = ['HDPE','LLDPE','LDPE','PP','PET','PVC','ABS','PA6','PC'];
export const NUMERICS = {
  solid_density: ['Densidad sólida','g/cm3',10], melt_density: ['Densidad fundida','g/cm3',10],
  bulk_density: ['Densidad aparente','kg/L',10], specific_heat: ['Calor específico','kJ/kg·K',30],
  drying_temperature: ['Temperatura de secado','°C',400], drying_time: ['Tiempo de secado','h',100],
  moisture_target: ['Humedad objetivo','%',100], moisture_max: ['Humedad máxima de proceso','%',100],
  mfr: ['MFR','g/10min',1000], mvr: ['MVR','cm3/10min',1000],
  intrinsic_viscosity: ['Viscosidad intrínseca (IV)','dL/g',20],
  melt_temperature_recommended: ['Temperatura recomendada de procesado','°C',500],
  melting_temperature: ['Temperatura de fusión','°C',500]
};
export const UNITS = {
  solid_density: ['g/cm3','kg/m3'], melt_density: ['g/cm3','kg/m3'], bulk_density: ['kg/L','kg/m3','g/cm3'],
  specific_heat: ['kJ/kg·K','J/kg·K'], drying_temperature: ['°C','K'], drying_time: ['h','min'],
  moisture_target: ['%'], moisture_max: ['%'], mfr: ['g/10min'], mvr: ['cm3/10min'],
  intrinsic_viscosity: ['dL/g'], melt_temperature_recommended: ['°C','K'], melting_temperature: ['°C','K']
};
const expectedPhase = key => key === 'solid_density' ? 'solid' : key === 'melt_density' ? 'melt' : key === 'bulk_density' ? 'bulk' : key === 'specific_heat' ? 'unknown' : 'test';
const phases = ['unknown','solid','melt','bulk','test'];
const clone = x => JSON.parse(JSON.stringify(x));
export const safeId = s => s.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,45);
const fail = message => { throw Error(message); };
function text(value, max, fallback = '') {
  if (value == null || value === '') return fallback;
  if (typeof value !== 'string' || value.length > max) fail('Texto de material no válido.');
  return value.trim();
}
function sourceUrl(value) {
  const raw = text(value, 500);
  if (!raw) return null;
  try { const url = new URL(raw); if (url.protocol === 'https:' && !url.username && !url.password) return url.href; } catch {}
  fail('Solo se permiten enlaces HTTPS de fuente sin credenciales.');
}
export function convertProperty(key, value, unit = NUMERICS[key]?.[1]) {
  if (!Object.hasOwn(NUMERICS,key) || !UNITS[key].includes(unit) || !['number','string'].includes(typeof value) || String(value).trim() === '') fail('Valor o unidad de propiedad no válido.');
  let number = Number(value);
  if (!Number.isFinite(number)) fail('La propiedad debe ser un número finito.');
  if (unit === 'kg/m3' || unit === 'J/kg·K') number /= 1000;
  if (unit === 'K') number -= 273.15;
  if (key === 'drying_time' && unit === 'min') number /= 60;
  const min = NUMERICS[key][1] === '°C' ? -273.15 : 0;
  const allowZero = ['moisture_target','moisture_max','mfr','mvr'].includes(key);
  if (number > NUMERICS[key][2] || (allowZero ? number < min : number <= min)) fail('Valor fuera de rango: ' + NUMERICS[key][0]);
  return number;
}
export function makeCustomMaterial(form, existingId) {
  if (!form || typeof form !== 'object' || Array.isArray(form)) fail('Formato de material no válido.');
  const family = text(form.family,10), grade = text(form.grade,100), manufacturer = text(form.manufacturer,100,'Usuario');
  if (!FAMILIES.includes(family) || grade.length < 2) fail('Nombre, familia o fabricante no válido.');
  const id = existingId || 'user-' + safeId(family) + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8);
  if (!/^user-[a-z0-9-]{1,100}$/.test(id)) fail('Identificador de material personal no válido.');
  const sourceId = 'SRC-' + id, url = sourceUrl(form.url), source = text(form.source,500);
  const method = text(form.method,160), conditions = text(form.conditions,500);
  const properties = {};
  for (const [key,[,unit]] of Object.entries(NUMERICS)) {
    const raw = form[key];
    if (raw === '' || raw == null) { properties[key] = null; continue; }
    const enteredUnit = form[key+'_unit'] || unit;
    const value = convertProperty(key,raw,enteredUnit), phase = form[key+'_phase'] || expectedPhase(key);
    if (!phases.includes(phase)) fail('Fase de propiedad no válida.');
    const physicalForm = key === 'bulk_density' ? (form[key+'_form'] || '') : null;
    if (physicalForm !== null && !['','pellets','powder'].includes(physicalForm)) fail('Presentación de propiedad no válida.');
    const propertyUrl = sourceUrl(form[key+'_url'] || url);
    const description = text(form[key+'_source'],500,source);
    properties[key] = { value,unit,range:null,source_id:sourceId+'-'+key,status:'user_entered',
      phase,physical_form:physicalForm,method:text(form[key+'_method'],160,method) || 'Indicado por usuario',
      condition:text(form[key+'_conditions'],500,conditions) || null,
      note:description || 'Origen manual; comprobar con ficha técnica o medición.',
      evidence:{url:propertyUrl,description:description || 'Datos introducidos por usuario',manufacturer,grade,entered:true},
      entered_value:Number(raw),entered_unit:enteredUnit };
  }
  return { id,family,manufacturer,grade,source_id:sourceId,process_tags:[],properties,
    record_status:'user_entered_unverified',revision_review_required:false,
    notes:'Material creado por usuario. Datos no verificados por CCIP; uso condicionado a la trazabilidad y validación del usuario.',
    missing_data_audit:{},reference_properties_not_for_autofill:[],
    pvt:{status:'not_found_grade_specific_public',source_ref:null,calculator_autofill_allowed:false,measured_or_calibrated_coefficients:null,
      graphical_data:'No hay modelo pVT validado para este registro.',T_range_C:null,P_range_MPa:null},
    user_source:{manufacturer,grade,url,description:source || 'Datos introducidos por usuario',entered:true},
    local_updated_on:new Date().toISOString() };
}
export function validateUserMaterial(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record) || typeof record.id !== 'string' ||
      !record.properties || typeof record.properties !== 'object' || Array.isArray(record.properties)) fail('Registro personal no válido.');
  const form = {family:record.family,grade:record.grade,manufacturer:record.manufacturer,
    url:record.user_source?.url,source:record.user_source?.description};
  for (const [key,p] of Object.entries(record.properties)) {
    if (!Object.hasOwn(NUMERICS,key)) fail('Propiedad personal desconocida.');
    if (p === null) continue;
    if (!p || typeof p !== 'object' || Array.isArray(p) || p.range != null || p.value == null) fail('Propiedad personal no válida.');
    // Imported source IDs/statuses cannot impersonate original manufacturer records.
    form[key] = p.value; form[key+'_unit'] = p.unit; form[key+'_phase'] = p.phase;
    form[key+'_form'] = p.physical_form; form[key+'_method'] = p.method; form[key+'_conditions'] = p.condition;
    form[key+'_source'] = p.evidence?.description || p.note; form[key+'_url'] = p.evidence?.url;
  }
  const clean = makeCustomMaterial(form,record.id);
  for (const [key,p] of Object.entries(record.properties)) if (p && p.entered_unit != null) {
    const converted = convertProperty(key,p.entered_value,p.entered_unit);
    if (Math.abs(converted-p.value) > 1e-10*Math.max(1,Math.abs(p.value))) fail('Conversión de unidad personal inconsistente.');
    clean.properties[key].entered_unit = p.entered_unit;
    clean.properties[key].entered_value = p.entered_value;
  }
  if (typeof record.local_updated_on === 'string' && Number.isFinite(Date.parse(record.local_updated_on))) clean.local_updated_on = record.local_updated_on;
  return clean;
}
function unique(records) {
  if (!Array.isArray(records) || records.length > 120) fail('Máximo 120 materiales personales.');
  const ids = new Set(), names = new Set();
  return records.map(record => {
    const clean = validateUserMaterial(record), name = clean.family+':'+clean.grade.toLowerCase();
    if (ids.has(clean.id) || names.has(name)) fail('Material personal duplicado.');
    ids.add(clean.id);names.add(name);return clean;
  });
}
export function listUserMaterials() {
  try {
    const raw = localStorage.getItem(USER_KEY) || '[]'; if (raw.length > 2_000_000) return [];
    const data = JSON.parse(raw); if (!Array.isArray(data)) return [];
    const valid = [], ids = new Set(), names = new Set();
    for (const record of data.slice(0,120)) try {
      const clean = validateUserMaterial(record), name = clean.family+':'+clean.grade.toLowerCase();
      if (!ids.has(clean.id) && !names.has(name)) { valid.push(clean);ids.add(clean.id);names.add(name); }
    } catch { /* Ignore damaged records; retain remaining usable user records. */ }
    return valid;
  } catch { return []; }
}
export function persistUserMaterials(records) {
  const clean = unique(records);
  try { localStorage.setItem(USER_KEY,JSON.stringify(clean)); } catch { fail('No se pudieron guardar los materiales en este navegador.'); }
  return clean;
}
export const exportUserMaterials = (records = listUserMaterials()) => JSON.stringify({schema_version:'ccip-custom-materials/1',materials:unique(records)},null,2);
export function parseUserImport(raw, existing = listUserMaterials()) {
  if (typeof raw !== 'string' || raw.length > 2_000_000) fail('Archivo JSON demasiado grande o no válido.');
  let data; try { data = JSON.parse(raw); } catch { fail('JSON de materiales no válido.'); }
  if (!Array.isArray(data) && data?.schema_version !== 'ccip-custom-materials/1') fail('Versión de importación no soportada.');
  const incoming = unique(Array.isArray(data) ? data : data.materials), records = unique(existing);
  for (const record of incoming) {
    const previous = records.find(x => x.id === record.id);
    if (previous) { if (JSON.stringify(previous) === JSON.stringify(record)) continue; fail('El identificador importado ya existe con datos diferentes.'); }
    records.push(record);
  }
  return unique(records); // Atomic: no write occurs until the entire import is valid.
}
export function mergeCustomMaterials(catalog, records = listUserMaterials()) {
  const data = clone(catalog), found = new Set(data.materials.map(x=>x.id));
  for (const record of unique(records)) {
    if (found.has(record.id)) fail('Un material personal no puede reemplazar el catálogo original.');
    data.sources[record.source_id] = clone(record.user_source);
    for (const p of Object.values(record.properties).filter(Boolean)) data.sources[p.source_id] = clone(p.evidence);
    data.materials.push(clone(record));found.add(record.id);
  }
  return data;
}
export function renderCustomEditor(root,{onSave,onDelete,onImport} = {}) {
  const records = listUserMaterials(), escape = x => String(x ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
  const input = (name,label,max = 500,type = 'text') => `<label>${label}<input name="${name}" type="${type}" maxlength="${max}"></label>`;
  root.innerHTML = `<details id="custom-panel"><summary>Agregar / editar material propio (${records.length})</summary>
    <p class="muted">Datos guardados solo en este navegador. Sin validación ni sincronización. Nunca se asumen propiedades de la familia.</p>
    <form id="custom-form" novalidate><fieldset class="parameter-group"><legend>Identificación y fuente general</legend><div class="fields">
    <label>Familia<select name="family" required>${FAMILIES.map(x=>`<option>${x}</option>`).join('')}</select></label>
    ${input('grade','Nombre del material/grado',100)}${input('manufacturer','Fabricante / procedencia',100)}
    ${input('url','Fuente o ficha (HTTPS)',500,'url')}${input('source','Descripción de fuente')}
    ${input('method','Método de medida',160)}${input('conditions','Condiciones (temperatura, presión, fase, lote...)')}
    </div></fieldset><details id="custom-properties"><summary>Propiedades y evidencia por dato</summary>
    <p class="muted">Deja vacías las propiedades desconocidas. Cada dato conserva unidad, fase, fuente, método y condiciones; puede usar la fuente general.</p>
    ${Object.entries(NUMERICS).map(([key,[label,unit,max]])=>`<details class="custom-property" id="custom-property-${key}" name="personal-property"><summary>${label}</summary><fieldset class="parameter-group"><legend>${label}</legend><div class="fields">
    <label>${label}<input name="${key}" type="number" step="any" placeholder="—"></label>
    <label>Unidad<select name="${key}_unit">${UNITS[key].map(u=>`<option value="${u}">${u}</option>`).join('')}</select></label>
    <label>Fase<select name="${key}_phase">${phases.map(p=>`<option value="${p}" ${p===expectedPhase(key)?'selected':''}>${({unknown:'Sin confirmar',solid:'Sólido',melt:'Fundido',bulk:'Material a granel',test:'Ensayo / proceso'})[p]}</option>`).join('')}</select></label>
    ${key === 'bulk_density' ? '<label>Presentación real del material<select name="bulk_density_form"><option value="">Sin confirmar</option><option value="pellets">pellets</option><option value="powder">powder</option></select></label>' : ''}${input(key+'_source','Fuente de esta propiedad')}${input(key+'_url','Enlace de esta propiedad (HTTPS)',500,'url')}
    ${input(key+'_method','Método de esta propiedad',160)}${input(key+'_conditions','Condiciones de esta propiedad')}
    </div></fieldset></details>`).join('')}</details>
    <div class="actions"><button type="submit" class="primary">Guardar material local</button><button id="custom-cancel" type="button">Nuevo / cancelar edición</button><button id="custom-export" type="button">Exportar catálogo personal JSON</button></div></form>
    <label class="import-label">Importar materiales JSON<input id="custom-import" type="file" accept="application/json,.json"></label>
    <p id="custom-feedback" role="status"></p><h3>Mis materiales</h3><div id="custom-list">${records.length ? records.map(m=>`<div class="historyRow"><span data-i18n-ignore>${escape(m.family)} · ${escape(m.grade)}</span><span class="material-editor-actions"><button type="button" data-personal-edit="${escape(m.id)}">Editar</button><button type="button" data-personal-delete="${escape(m.id)}">Eliminar</button></span></div>`).join('') : '<p class="muted">Sin registros</p>'}</div></details>`;
  const form = root.querySelector('form'), feedback = message => { root.querySelector('#custom-feedback').textContent = message; };
  form.elements.grade.required = true;
  form.addEventListener('submit',e=>{
    e.preventDefault();
    try {
      if ([...form.elements].some(el=>el.validity?.badInput)) fail('La propiedad debe ser un número finito.');
      const editing = form.dataset.editing || null, record = makeCustomMaterial(Object.fromEntries(new FormData(form)),editing), saved = listUserMaterials();
      if (editing && !saved.some(x=>x.id===editing)) fail('El material a editar no existe.');
      persistUserMaterials(editing ? saved.map(x=>x.id===editing?record:x) : [...saved,record]);onSave?.(record);
    } catch(error) { feedback(error.message); }
  });
  root.querySelector('#custom-cancel').addEventListener('click',()=>{form.reset();delete form.dataset.editing;feedback('Formulario listo para un material nuevo.');});
  root.querySelectorAll('[data-personal-edit]').forEach(button=>button.addEventListener('click',()=>{
    const record = listUserMaterials().find(x=>x.id===button.dataset.personalEdit);if (!record) return;
    form.reset();form.dataset.editing = record.id;
    const values = {family:record.family,grade:record.grade,manufacturer:record.manufacturer,url:record.user_source.url || '',source:record.user_source.description};
    for (const [key,p] of Object.entries(record.properties)) if (p) Object.assign(values,{[key]:p.entered_value ?? p.value,[key+'_unit']:p.entered_unit || p.unit,[key+'_phase']:p.phase,[key+'_form']:p.physical_form || '',[key+'_source']:p.evidence.description,[key+'_url']:p.evidence.url || '',[key+'_method']:p.method,[key+'_conditions']:p.condition || ''});
    for (const [key,value] of Object.entries(values)) if (form.elements.namedItem(key)) form.elements.namedItem(key).value = value;
    root.querySelector('#custom-panel').open = true;root.querySelector('#custom-properties').open = true;form.elements.grade.focus();feedback('Editando material existente');
  }));
  root.querySelectorAll('[data-personal-delete]').forEach(button=>button.addEventListener('click',()=>{
    if (!confirm(t('¿Eliminar material guardado?',getLanguage()))) return;
    try {persistUserMaterials(listUserMaterials().filter(x=>x.id!==button.dataset.personalDelete));onDelete?.(button.dataset.personalDelete);} catch(error){feedback(error.message);}
  }));
  root.querySelector('#custom-export').addEventListener('click',()=>{
    const url = URL.createObjectURL(new Blob([exportUserMaterials()],{type:'application/json'})), anchor = document.createElement('a');
    anchor.href = url;anchor.download = 'ccip-materiales-personales.json';anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  root.querySelector('#custom-import').addEventListener('change',async e=>{
    const file = e.target.files[0];if (!file) return;
    try {if (file.size > 2_000_000) fail('Archivo JSON demasiado grande o no válido.');const merged = parseUserImport(await file.text());persistUserMaterials(merged);onImport?.();} catch(error){feedback(error.message);} finally {e.target.value='';}
  });
}
