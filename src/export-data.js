import { modules } from './schema.js';
import { t } from './i18n.js';

export const exportCopy = lang => (es, en) => lang === 'en' ? en : es;
export const safeLink = value => {
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : null; } catch { return null; }
};
const text = value => typeof value === 'string' ? value : JSON.stringify(value) ?? '';
export const exportValue = value => value === null || value === undefined || value === '' ? null :
  typeof value === 'number' ? (Number.isFinite(value) ? value : null) :
    typeof value === 'string' && value.trim() && Number.isFinite(Number(value)) ? Number(value) : text(value);
export function flattenEvidence(value, prefix = '', rows = []) {
  if (value === null || value === undefined || value === '') return rows;
  if (typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) flattenEvidence(item, prefix ? `${prefix}.${key}` : key, rows);
  } else rows.push([prefix, text(value), safeLink(value)]);
  return rows;
}
export function prepareExport(snapshot, { language = 'es', status = 'saved', name, basedOn = null } = {}) {
  // No motor ni biblioteca: una sola copia coherente para los tres formatos.
  const record = JSON.parse(JSON.stringify(snapshot));
  const tr = exportCopy(language), module = modules.find(m => m.id === record.module);
  if (!module) throw Error('Proceso desconocido.');
  const label = value => t(String(value ?? ''), language);
  record.export_metadata = { language, status, exported_at: new Date().toISOString(), based_on_id: basedOn };
  if (name !== undefined) record.name = name;
  const grade = record.material?.grade_snapshot;
  const unavailable = tr('No disponible', 'Unavailable');
  const nameValue = typeof record.name === 'string' && record.name ? record.name : label(module.name);
  const validation = tr('Académico; requiere validación técnica', 'Academic; requires technical validation');
  const summary = [
    [tr('Nombre del cálculo', 'Calculation name'), nameValue], ['ID', record.id || unavailable],
    [tr('Proceso', 'Process'), label(module.name)], [tr('Nivel', 'Level'), label({ basic: 'Básico', technical: 'Técnico', advanced: 'Avanzado' }[record.level])],
    [tr('Creación', 'Created'), record.created_at || record.date || unavailable],
    [tr('Modificación', 'Modified'), record.updated_at || record.date || unavailable],
    [tr('Exportación', 'Exported'), record.export_metadata.exported_at],
    [tr('Estado del cálculo', 'Calculation state'), status === 'saved' ? tr('Snapshot guardado; sin recalcular', 'Saved snapshot; not recalculated') : tr('Estado activo; exportar no guarda cambios', 'Active state; exporting does not save changes')],
    [tr('Material', 'Material'), record.material?.formulation?.name || grade?.grade || tr('Personalizado / sin ficha', 'Custom / no datasheet')],
    [tr('Familia', 'Family'), grade?.family || unavailable], [tr('Maquinaria seleccionada','Selected equipment'), record.machine?.profile?.model || unavailable], [tr('Configuración confirmada','Configuration confirmed'), record.machine?.confirmed===true?tr('Sí','Yes'):tr('No / no aplicable','No / not applicable')], [record.material?.formulation?tr('Fabricante del componente virgen','Virgin component manufacturer'):tr('Fabricante', 'Manufacturer'), grade?.manufacturer || unavailable],
    [record.material?.formulation?tr('Grado virgen de referencia','Virgin reference grade'):tr('Grado comercial', 'Commercial grade'), grade?.grade || unavailable], [tr('Validación técnica', 'Technical validation'), validation]
  ];
  const origins = {
    family_reference: tr('Referencia de familia — estimación', 'Family reference — estimate'),
    user_override: tr('Anulación manual; no es dato certificado del fabricante', 'Manual override; not a certified manufacturer value'),
    manual: tr('Entrada manual', 'Manual input'), user_entered: tr('Dato de usuario no verificado', 'Unverified user data'),
    manufacturer_typical: tr('Valor típico de ficha; no certificado de lote', 'Typical datasheet value; not batch certified'),
    manufacturer_recommendation: tr('Recomendación de ficha', 'Datasheet recommendation'),
    range_selection: tr('Elección explícita en rango de ficha', 'Explicit choice in datasheet range'),
    manufacturer_range_upper: tr('Extremo superior nominal del rango de ficha', 'Nominal upper bound of datasheet range'),
    machine_catalog: tr('Especificación del equipo confirmada', 'Confirmed machine specification'),
    operating_assumption: tr('Supuesto operativo editable', 'Editable operating assumption'),
    default_example: tr('Ejemplo precargado editable', 'Editable preloaded example'),
    library: tr('Ficha documental; ver condiciones y estado en fuentes', 'Documented datasheet; see conditions and status in sources'),
    mixture_model: tr('Estimación de mezcla — modelo ideal documentado', 'Mixture estimate — documented ideal model'),
    user_custom: tr('Material personalizado; dato de usuario no verificado', 'Custom material; unverified user data'),
    default: tr('Ejemplo precargado editable', 'Editable preloaded example'),
    historical_unknown: tr('Origen no registrado en el historial', 'Origin not recorded in history')
  };
  const parameters = Object.entries(record.inputs || {}).map(([key, raw]) => {
    const field = module.fields.find(f => f.key === key);
    const evidence = record.material?.used_fields?.[key] || record.material?.field_states?.[key];
    const origin = evidence?.origin || record.calculation_metadata?.input_origins?.[key] || 'historical_unknown';
    return { key, label: label(field?.label || key), value: exportValue(raw), original: raw === null ? '' : text(raw),
      unit: label(field?.unit || evidence?.unit || ''), origin: origins[origin] || label(origin), source_id: evidence?.source_id || '' };
  });
  const results = (Array.isArray(record.metrics) ? record.metrics : []).map(metric => ({
    label: label(metric.label), value: typeof metric.value === 'number' && Number.isFinite(metric.value) ? metric.value : null,
    unit: label(metric.unit), formula: label(metric.formula), estimated: metric.density_estimate === true
  }));
  const observations = [
    [tr('Alcance', 'Scope'), validation],
    ...(Array.isArray(record.warnings) ? record.warnings : []).map(x => [tr('Advertencia', 'Warning'), label(x)]),
    ...(Array.isArray(record.notes) ? record.notes : []).map(x => [tr('Limitación / modelo', 'Limitation / model'), label(x)]),
    ...flattenEvidence({ applied_properties: record.material?.used_fields, field_states: record.material?.field_states,
      formulation:record.material?.formulation, formulation_input:record.material?.formulation_input, formulation_assessment:record.formulation_assessment, research_snapshot:record.material?.research_snapshot,
      process_conditions: record.material?.context, density_assessment: record.density_assessment,
      input_issues: record.input_issues, calculation_metadata: record.calculation_metadata,
      machine_snapshot:record.machine, machine_assessment:record.machine_assessment,
      drying_assessment:record.drying_assessment,
      profile_settings: record.injection_profile_settings, profile_note: record.injection_profile?.note,
      profile_assessment: record.injection_profile ? {valid:record.injection_profile.valid,error:record.injection_profile.error,approximate:record.injection_profile.approximate,basis:record.injection_profile.basis,thermal_correction_applied:record.injection_profile.thermal_correction_applied,absolute_machine_positions:record.injection_profile.absolute_machine_positions}:null,
      user_material_trace:grade?.record_status==='user_entered_unverified'?{id:grade.id,revision:grade.revision,shared_revision:grade.shared_revision,catalog_origin:grade.catalog_origin,user_details:grade.user_details,shared_metadata:grade.shared_metadata,properties:grade.properties,created_at:grade.created_at,local_updated_on:grade.local_updated_on}:null,
      grade_notes: grade?.notes })
  ];
  const sources = flattenEvidence({ material_source: record.material?.source,
    material_references: record.material?.references_snapshot?.sources,
    pvt_reference: record.material?.references_snapshot?.pvt_sources?.[grade?.pvt?.source_ref],
    formulation_sources:record.material?.formulation?.density_result, research_sources:record.material?.research_snapshot?.source, flow_sources:record.material?.research_snapshot?.flow_sources,
    density_source: record.density_assessment?.source, machine_source:record.machine?.profile?.source });
  if (!sources.length) sources.push([tr('Fuentes', 'Sources'), tr('Sin fuente documental registrada; revisar datos manuales', 'No documented source recorded; review manual inputs')]);
  const profile = Array.isArray(record.injection_profile?.stages) ? record.injection_profile.stages.map(s =>
    [s.label, s.fraction, s.volume_cm3, s.mass_g, s.stroke_mm, s.cumulative_mm, s.start_position_mm, s.end_position_mm]) : [];
  return { record, language, name: nameValue, summary, parameters, results, observations, sources, profile,
    title: tr('Calculadora de procesos de transformación termoplásticos', 'Thermoplastic processing calculator'), unavailable };
}
export function exportFilename(data, extension) {
  const safe = data.name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 70) || data.record.module;
  return `CCIP-${safe}.${extension}`;
}
