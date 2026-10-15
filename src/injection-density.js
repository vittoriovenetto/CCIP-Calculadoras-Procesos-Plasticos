import { familyMeltDensities } from './data/melt-density-family.v1.js';
import { activeFields } from './schema.js';
import { calculate } from './engine.js';
import { n, isBlank } from './math.js';

const clone = value => JSON.parse(JSON.stringify(value));
export const familyDensityCatalog = familyMeltDensities;
export const densityPolicies = ['reference_allowed', 'verified_only'];
const familyOrigin = entry => entry?.origin === 'family_reference';
const positive = value => typeof value === 'number' && Number.isFinite(value) && value > 0;
const text = value => typeof value === 'string' && value.trim().length > 0;
const https = value => { try { return new URL(value).protocol === 'https:'; } catch { return false; } };

export function validatedGradeMeltDensity(state) {
  const grade = state.grade_snapshot, property = grade?.properties?.melt_density;
  const source = state.references_snapshot?.sources?.[property?.source_id] || (property?.source_id === grade?.source_id ? state.source : null);
  if (!state.context.compatible || !property || property.phase !== 'melt' || property.approximate === true || !positive(property.value) ||
    !['g/cm3','g/cm³'].includes(property.unit) || !text(property.verification_basis) || !text(property.condition) ||
    !['manufacturer_typical','manufacturer_recommendation'].includes(property.status) || !https(source?.url)) return null;
  return { origin:'library', property_key:'melt_density', unit:'g/cm3', phase:'fundido', value:property.value,
    grade_id:grade.id, source_id:property.source_id, source:clone(source), reference:clone(property) };
}

// Solo convierte unidades. Un valor ya fundido no recibe corrección térmica.
export function familyReference(family, context = {}, catalog = familyDensityCatalog) {
  if (catalog?.schema_version !== '1.0.0' || catalog.scope !== 'family_reference' || !Array.isArray(catalog.entries)) return null;
  const rows = catalog.entries.filter(row => row?.family === family && (family !== 'PVC' || (row.variant === context.pvcMeltReferenceForm && context.pvcMeltCompoundConfirmed === true)));
  if (rows.length !== 1) return null;
  const row = rows[0];
  if ((!isBlank(context.pvtTemperatureC) && (!Number.isFinite(n(context.pvtTemperatureC)) || n(context.pvtTemperatureC) <= -273.15)) ||
      (!isBlank(context.pvtPressureMPa) && (!Number.isFinite(n(context.pvtPressureMPa)) || n(context.pvtPressureMPa) < 0))) return null;
  if (row.status !== 'reference_generic_estimate' || row.phase !== 'melt' || row.approximate !== true || !positive(row.value) ||
    !['g/cm3', 'g/cm³', 'kg/m3', 'kg/m³'].includes(row.unit) || !text(row.source?.title) || !text(row.source?.publisher) ||
    !https(row.source?.url) || !text(row.conditions?.applicability)) return null;
  if (typeof row.conditions.temperature_C === 'number' && !isBlank(context.pvtTemperatureC) && n(context.pvtTemperatureC) !== row.conditions.temperature_C) return null;
  for (const [key, entered, min] of [['temperature_range_C', context.pvtTemperatureC, -273.15], ['pressure_range_MPa', context.pvtPressureMPa, 0]]) {
    const range = row.conditions[key];
    if (range != null) {
      if (!Array.isArray(range) || range.length !== 2 || !range.every(Number.isFinite) || range[0] > range[1] || range[0] < min || (min < 0 && range[0] === min)) return null;
      if (!isBlank(entered) && (!Number.isFinite(n(entered)) || n(entered) < range[0] || n(entered) > range[1])) return null;
    }
  }
  const value = row.unit.startsWith('kg/') ? row.value / 1000 : row.value;
  if (!positive(value)) return null;
  return { ...clone(row), canonical_value: value, canonical_unit: 'g/cm3', catalog_version: catalog.schema_version };
}

export function applyFamilyMeltDensity(state, module, values, level, catalog = familyDensityCatalog) {
  if (module.id !== 'inyeccion') return null;
  const previous = state.provenance.meltDensity;
  const family = state.grade_snapshot?.family;
  const reference = familyReference(family, state.context, catalog);
  const allowed = state.context.meltDensityPolicy === 'reference_allowed' && state.context.familyMeltReferenceAccepted === true;
  if (familyOrigin(previous) && (!allowed || !reference || previous.family !== family || previous.reference?.variant !== reference.variant)) {
    values.meltDensity = '';delete state.provenance.meltDensity;
  }
  if (!allowed || !reference || !activeFields(module, values, level).some(f => f.key === 'meltDensity')) return null;
  const entry = state.provenance.meltDensity;
  if (['manual', 'user_override'].includes(entry?.origin) || (!isBlank(values.meltDensity) && !familyOrigin(entry))) return null;
  values.meltDensity = reference.canonical_value;
  state.provenance.meltDensity = {
    origin: 'family_reference', property_key: 'melt_density', phase: 'fundido', unit: 'g/cm3',
    family, grade_id: null, value: reference.canonical_value, approximate: true,
    source_id: `family-melt-${family}`, source: clone(reference.source), reference,
    catalog_version: reference.catalog_version
  };
  return reference;
}

export function verifiedMeltDensity(state, inputs) {
  if (!positive(n(inputs.meltDensity))) return false;
  const entry = state.provenance.meltDensity;
  if (familyOrigin(entry)) return false;
  const context = state.context;
  // Un valor típico documentado no se denomina certificado de lote.
  const gradeEntry = validatedGradeMeltDensity(state);
  if (entry?.origin === 'library' && gradeEntry && entry.grade_id === gradeEntry.grade_id &&
    gradeEntry.value === n(inputs.meltDensity)) return true;
  // Declaración explícita del usuario, con evidencia; no certificación del CCIP.
  return context.meltDensityVerified === true && text(context.meltDensitySource) &&
    Number.isFinite(n(context.pvtTemperatureC)) && n(context.pvtTemperatureC) > -273.15 &&
    Number.isFinite(n(context.pvtPressureMPa)) && n(context.pvtPressureMPa) >= 0;
}

const massDependencies = new Set(['Shot calculado (volumen)', 'Utilización volumétrica teórica', 'Carrera calculada del husillo', 'Recorrido remanente al dosificar al máximo', 'Tiempo de llenado ideal']);
const volumeDependencies = new Set(['Masa total sin reserva', 'Shot calculado (masa)', 'Tiempo de plastificación estimado']);

export function calculateWithMeltDensity(moduleId, inputs, level, state) {
  if (moduleId !== 'inyeccion') return calculate(moduleId, inputs, level);
  const effective = { ...inputs };
  let entry = state.provenance.meltDensity;
  const densityActive = level === 'technical' || level === 'advanced';
  const gradeEntry = densityActive ? validatedGradeMeltDensity(state) : null;
  if (gradeEntry) { effective.meltDensity = gradeEntry.value;entry = gradeEntry; }
  const verified = densityActive && verifiedMeltDensity({...state,provenance:{...state.provenance,meltDensity:entry}}, effective);
  const strict = state.context.meltDensityPolicy !== 'reference_allowed';
  const rejected = densityActive && strict && !verified && !isBlank(effective.meltDensity);
  const recordedReference = familyOrigin(entry) ? familyReference(entry.family, state.context, { schema_version: '1.0.0', scope: 'family_reference', entries: [entry.reference] }) : null;
  const invalidReference = densityActive && familyOrigin(entry) &&
    (state.context.familyMeltReferenceAccepted !== true || !recordedReference || entry.family !== state.grade_snapshot?.family || recordedReference.canonical_value !== n(effective.meltDensity));
  if (rejected || invalidReference) effective.meltDensity = '';
  const result = calculate(moduleId, effective, level);
  const used = densityActive && positive(n(effective.meltDensity));
  const estimated = used && !verified && (familyOrigin(entry) || entry?.reference?.approximate === true);
  const dependent = inputs.method === 'volume' ? volumeDependencies : massDependencies;
  if (estimated) {
    for (const metric of result.metrics) if (dependent.has(metric.label) && metric.value !== null) {
      metric.density_estimate = true;
      metric.estimate_basis = familyOrigin(entry) ? 'family_melt_reference' : 'manual_override_of_family_reference';
    }
    result.warnings.push('Estimación con densidad fundida de referencia de familia; no es una propiedad certificada del grado ni del lote. No se aplica otra corrección térmica.');
  }
  if (rejected) result.warnings.push('Modo solo datos verificados: la densidad introducida no tiene verificación y trazabilidad completas. Se conservan las entradas; los resultados dependientes quedan pendientes.');
  if (invalidReference) result.warnings.push('Referencia de familia fuera de sus condiciones documentadas o sin evidencia válida; no se extrapola la densidad.');
  result.density_assessment = {
    policy: strict ? 'verified_only' : 'reference_allowed', used, verified, approximate: estimated,
    origin: used ? (entry?.origin || 'manual') : 'not_used',
    verification: verified ? (entry?.origin === 'library' ? 'documented_grade' : 'user_declaration_with_evidence') : null,
    manual_confirmed_at_calculation: used && ['manual','user_override','user_custom'].includes(entry?.origin || 'manual'),
    value_g_cm3: used ? n(effective.meltDensity) : null,
    family_reference: used && entry?.reference?.approximate === true ? clone(entry.reference) : null,
    source: used && ['manual','user_override','user_custom'].includes(entry?.origin || 'manual') && text(state.context.meltDensitySource) ? { title: state.context.meltDensitySource } : used && entry?.source ? clone(entry.source) : null,
    entered_conditions: { temperature_C: Number.isFinite(n(state.context.pvtTemperatureC)) ? n(state.context.pvtTemperatureC) : null, pressure_MPa: Number.isFinite(n(state.context.pvtPressureMPa)) ? n(state.context.pvtPressureMPa) : null },
    rejected_by_policy: rejected, rejected_reference: !!invalidReference, grade_property_modified: false, thermal_correction_applied: false
  };
  result.density_provenance = used && entry ? clone(entry) : null;
  result.calculation_inputs = effective;
  return result;
}
