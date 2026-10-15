import { activeFields } from "./schema.js";
import { isBlank, n } from "./math.js";
import { validatePvt, captureReferences } from "./pvt.js";
import { applyFamilyMeltDensity } from './injection-density.js';

export const propertyLabels = {
  solid_density: "Densidad del sólido", melt_density: "Densidad del fundido",
  bulk_density: "Densidad aparente", specific_heat: "Calor específico",
  drying_temperature: "Temperatura de secado", drying_time: "Tiempo de secado",
  moisture_target: "Humedad objetivo", moisture_max: "Humedad máxima de proceso",
  mfr: "MFR", mvr: "MVR", intrinsic_viscosity: "Viscosidad intrínseca (IV)",
  melt_temperature_recommended: "Temperatura recomendada de procesado",
  melting_temperature: "Temperatura de fusión"
};
export const statusLabels = {
  manufacturer_typical: "Valor típico", manufacturer_recommendation: "Recomendación",
  library: "De ficha", user_custom: "Dato ingresado por usuario", user_entered: "Dato ingresado por usuario", range_selection: "Rango seleccionado por usuario",
  user_override: "Modificado por usuario", manual: "Manual",
  family_reference: "Referencia de familia · estimación"
};
const mappings = {
  inyeccion: { meltDensity: ["melt_density", "g/cm3", "fundido"] },
  extrusion: { density: ["solid_density", "g/cm3", "sólido"] },
  pelicula: { density: ["solid_density", "g/cm3", "sólido"] },
  soplado: { density: ["solid_density", "g/cm3", "sólido"] },
  termoformado: { density: ["solid_density", "g/cm3", "sólido"] },
  secado: {
    bulkDensity: ["bulk_density", "kg/L", "aparente"],
    residence: ["drying_time", "h", "recomendación de secado"],
    targetT: ["drying_temperature", "°C", "recomendación de secado"],
    specificHeat: ["specific_heat", "kJ/kg·K", "térmico"]
  }
};
const processTags = { inyeccion: "inyección", extrusion: "extrusión", pelicula: "película soplada", soplado: "soplado", termoformado: "termoformado" };
const clone = value => JSON.parse(JSON.stringify(value));
export const safeSourceUrl = value => {
  try { const url = new URL(value); return url.protocol === "https:" ? url.href : null; } catch { return null; }
};
export function validateLibrary(data) {
  if (!data || !["1.0.0", "1.1.0", "1.2.0", "1.3.0"].includes(data.schema_version) || !data.sources || !Array.isArray(data.materials) || !data.materials.length) throw Error("Formato de biblioteca no válido");
  const ids = new Set();
  for (const material of data.materials) {
    if (!material.id || ids.has(material.id) || !material.family || !material.manufacturer || !material.grade ||
      !data.sources[material.source_id] || !material.properties || !Array.isArray(material.process_tags)) throw Error("Registro de material no válido");
    ids.add(material.id);
    for (const property of Object.values(material.properties).filter(Boolean)) {
      if (!data.sources[property.source_id] || !property.unit ||
        !["manufacturer_typical", "manufacturer_recommendation", "user_entered"].includes(property.status) ||
        (property.value !== null && !Number.isFinite(property.value)) ||
        (property.range !== null && (!Array.isArray(property.range) || property.range.length !== 2 || !property.range.every(Number.isFinite) || property.range[0] > property.range[1]))) throw Error("Propiedad no válida");
    }
  }
  validatePvt(data);
  return data;
}
export const families = data => [...new Set(data.materials.map(m => m.family))];
export const manufacturers = (data, family) => [...new Set(data.materials.filter(m => m.family === family).map(m => m.manufacturer))];
export const grades = (data, family, manufacturer) => data.materials.filter(m => m.family === family && m.manufacturer === manufacturer);
export const contextDefaults = () => ({ compatible: false, physicalForm: "", bulkCompatible: false, dryingCompatible: false, processConfirmed: false, dryingTime: "", conditionsNote: "", lot: "", pvtTemperatureC: "", pvtPressureMPa: "", meltDensitySource: "", meltDensityPolicy: "reference_allowed", meltDensityVerified: false, familyMeltReferenceAccepted: false, pvcMeltReferenceForm: "", pvcMeltCompoundConfirmed: false, cpMinC: "", cpMaxC: "", cpPhase: "", specificHeatSource: "" });
export const createMaterialState = () => ({ grade_snapshot: null, dataset: null, source: null, references_snapshot: null, provenance: {}, context: contextDefaults() });
export const outsideProcess = (material, moduleId) => !!material && !["generic_unverified", "user_entered_unverified", "grade_identity_referenced_properties_partial", "catalog_identity_pending_grade_data_verification"].includes(material.record_status) && !!processTags[moduleId] && !material.process_tags.some(tag => tag.includes(processTags[moduleId]));
export const expectedForm = material => material.record_status === "user_entered_unverified" ? (material.properties.bulk_density?.physical_form || null) : material.family === "PVC" ? "powder" : "pellets";

// Una selección invalida únicamente valores automáticos previos; nunca valores manuales.
export function clearAutomatic(materialState, values) {
  for (const [field, entry] of Object.entries(materialState.provenance)) {
    if (["library", "range_selection", "user_custom", "family_reference"].includes(entry.origin)) {
      values[field] = "";
      delete materialState.provenance[field];
    }
  }
}
export function selectMaterial(data, materialState, values, gradeId) {
  const policy = materialState.context.meltDensityPolicy;
  clearAutomatic(materialState, values);
  const material = data?.materials.find(m => m.id === gradeId);
  materialState.grade_snapshot = material ? clone(material) : null;
  materialState.dataset = material ? { name: data.dataset_name, version: data.catalog_revision || data.schema_version, retrieved_on: data.retrieved_on } : null;
  materialState.source = material ? clone(data.sources[material.source_id]) : null;
  materialState.references_snapshot = material ? captureReferences(data, material) : null;
  materialState.context = contextDefaults();
  if (policy === 'verified_only') materialState.context.meltDensityPolicy = policy;
}
export function markManual(materialState, moduleId, field, value) {
  const map = mappings[moduleId]?.[field];
  if (!map) return;
  if (moduleId === 'inyeccion' && field === 'meltDensity') materialState.context.meltDensityVerified = false;
  const previous = materialState.provenance[field];
  materialState.provenance[field] = {
    ...previous, property_key: map[0], unit: map[1], phase: map[2],
    origin: previous?.reference ? "user_override" : "manual", value,
    // Se conserva la identidad de la referencia, incluso al cambiar de grado.
    grade_id: previous?.grade_id ?? materialState.grade_snapshot?.id ?? null
  };
}

export function materialCandidates(materialState, module, values, level) {
  const material = materialState.grade_snapshot;
  if (!material) return [];
  return activeFields(module, values, level).flatMap(field => {
    const map = mappings[module.id]?.[field.key];
    if (!map) return [];
    const [key, unit, phase] = map, property = material.properties[key];
    if (key === "melt_density" && material.pvt?.calculator_autofill_allowed === false && material.record_status !== "user_entered_unverified") return [];
    if (!property || property.unit !== unit || !["manufacturer_typical", "manufacturer_recommendation", "user_entered"].includes(property.status)) return [];
    let value = property.value, reason = "";
    const requiredPhase = ({solid_density:"solid",melt_density:"melt",bulk_density:"bulk",specific_heat:"solid"})[key];
    if (property.phase && requiredPhase && property.phase !== requiredPhase) {
      return [{field:field.key,property_key:key,property,unit,phase,value,reason:"La fase documentada no corresponde a este cálculo; requiere validación técnica."}];
    }
    if (module.id === "secado" && key === "bulk_density") {
      if (!expectedForm(material)) reason = "Documenta la presentación de esta propiedad antes de autocompletar.";
      else if (materialState.context.physicalForm !== expectedForm(material)) reason = "Confirma pellets/polvo compatibles con la ficha.";
      else if (!materialState.context.bulkCompatible) reason = "Confirma método y condiciones de densidad aparente, incluida presentación/tamaño del material.";
    } else if (key.startsWith("drying_")) {
      if (!materialState.context.dryingCompatible) reason = "Confirma secador, humedad, punto de rocío y almacenamiento.";
    } else if (!materialState.context.compatible) {
      reason = "Confirma fase, formulación, método y condiciones del valor.";
    }
    if (outsideProcess(material, module.id) && !materialState.context.processConfirmed) reason = "El proceso no figura en las aplicaciones de ficha; requiere validación explícita.";
    if (property.range) {
      value = n(materialState.context.dryingTime);
      if (key !== "drying_time" || !Number.isFinite(value) || value < property.range[0] || value > property.range[1]) reason = "Selecciona explícitamente un valor dentro del rango documentado.";
    }
    if (!Number.isFinite(value) || (unit !== "°C" && value <= 0)) reason ||= "Dato numérico no documentado.";
    return [{ field: field.key, property_key: key, property, unit, phase, value, reason }];
  });
}
export function applyMaterial(materialState, module, values, level) {
  const candidates = materialCandidates(materialState, module, values, level);
  for (const candidate of candidates) {
    if (candidate.reason) continue;
    const previous = materialState.provenance[candidate.field];
    if (["manual", "user_override"].includes(previous?.origin)) continue;
    if (!isBlank(values[candidate.field]) && !["library", "range_selection", "user_custom", "family_reference"].includes(previous?.origin)) continue;
    values[candidate.field] = candidate.value;
    materialState.provenance[candidate.field] = {
      property_key: candidate.property_key, unit: candidate.unit, phase: candidate.phase,
      origin: candidate.property.status === "user_entered" ? "user_custom" : (candidate.property.range ? "range_selection" : "library"),
      value: candidate.value, grade_id: materialState.grade_snapshot.id,
      source_id: candidate.property.source_id, source: clone(candidate.property.evidence || materialState.source), reference: clone(candidate.property),
      original_value: candidate.property.value,
      selection_reason: candidate.property.range ? "Valor elegido explícitamente dentro del rango de ficha tras confirmar condiciones" : null
    };
  }
  applyFamilyMeltDensity(materialState, module, values, level);
  return candidates;
}
export function materialWarnings(materialState, moduleId, values = {}, level = "advanced") {
  const material = materialState.grade_snapshot;
  const warnings = [], context = materialState.context;
  if (level !== 'basic' && moduleId === 'inyeccion' && materialState.provenance.meltDensity?.origin !== 'family_reference' && n(values.meltDensity) > 0 &&
      (!Number.isFinite(n(context.pvtTemperatureC)) || n(context.pvtTemperatureC) <= -273.15 ||
       !Number.isFinite(n(context.pvtPressureMPa)) || n(context.pvtPressureMPa) < 0 || !context.meltDensitySource.trim())) {
    warnings.push("Densidad fundida manual sin trazabilidad completa: registra temperatura (°C), presión (MPa), fuente/método y revisión en modo avanzado. Resultado no validado técnicamente.");
  }
  if (level === 'advanced' && moduleId === 'secado' && n(values.specificHeat) > 0) {
    if (context.cpPhase === 'melt') warnings.push("Cp de fundido no corresponde al secado de granza/polvo sólido; verifica fase y modelo térmico. Resultado no validado técnicamente.");
    const lo = n(context.cpMinC), hi = n(context.cpMaxC);
    if (!Number.isFinite(lo) || !Number.isFinite(hi) || lo <= -273.15 || hi <= lo || !['solid', 'melt'].includes(context.cpPhase) || !context.specificHeatSource.trim()) warnings.push("Cp manual sin fase, intervalo y fuente completos: registra evidencia térmica. No sustituir por Cp histórico agrupado.");
    else if ([n(values.startT), n(values.targetT)].some(t => Number.isFinite(t) && (t < lo || t > hi))) warnings.push("Temperatura de cálculo fuera del intervalo documentado de Cp: extrapolación no validada; revisa el dato antes de utilizar el resultado.");
  }
  if (!material) return warnings;
  if (material.record_status === "generic_unverified") warnings.push(materialState.provenance.meltDensity?.origin === 'family_reference'
    ? "Material GENÉRICO: se usa una referencia de familia independiente, no una propiedad del grado. Los resultados dependientes son estimaciones."
    : "Material GENÉRICO: no se conoce grado, formulación ni lote. No se asignan propiedades típicas; las entradas manuales requieren fuente o medición.");
  else if (material.record_status === "user_entered_unverified") warnings.push("Material creado por usuario: propiedades no verificadas por el CCIP; confirme fuente, fase y método.");
  else warnings.push("Datos típicos/recomendados: no son certificación de lote ni validación industrial.");
  if (material.incoming_product_moisture) warnings.push("PET: 0.15 % objetivo / 0.30 % máximo son humedad del producto recibido, no objetivo ni límite después de secado.");
  if (Array.isArray(material.reference_properties_not_for_autofill) && material.reference_properties_not_for_autofill.some(ref => ref?.property === 'specific_heat')) warnings.push("Cp histórico 1.172 kJ/(kg K) agrupado 2405/2407/2456: no identifica fase/intervalo y no autocompleta secado.");
  if (material.pvt) warnings.push(material.pvt.status === 'related_base_grade_chart_only' ? "Referencia pVT de B3S — no validada para R03; no calcular densidad automática." : "pVT: las figuras/reconstrucciones son referencias; densidad automática deshabilitada y extrapolación prohibida.");
  if (outsideProcess(material, moduleId)) warnings.push("El proceso activo no está indicado en las aplicaciones de este grado; cualquier extrapolación requiere validación técnica.");
  if (material.revision_review_required) warnings.push("La ficha PET es de 2017: comprueba su vigencia. Humedad de suministro no equivale a humedad máxima de proceso. No hay secado documentado aquí.");
  if (material.id === "westlake-westlake-pvc-1195") warnings.push("PVC 1195 es resina en polvo, no pellets ni compuesto final. Su densidad aparente no es densidad sólida.");
  if (material.id === "dow-dow-ldpe-132g") warnings.push("170–230 °C es intervalo de procesado de película; no es temperatura de fusión DSC.");
  if (moduleId === "inyeccion" && !material.properties.melt_density) warnings.push("Densidad del fundido no documentada en la ficha: solicita pVT o medición a temperatura/presión de proceso. La densidad sólida no se aplica al shot.");
  if (moduleId === "secado") {
    if (!material.properties.specific_heat) warnings.push("Calor específico no documentado en la ficha: solicita cp del grado y del intervalo térmico. La potencia sensible queda pendiente si no introduces ese dato.");
    if (!material.properties.drying_time || !material.properties.drying_temperature) warnings.push("No hay instrucciones completas de secado para este grado; no se deducen de Tg o fusión.");
    if (material.properties.drying_time || material.properties.drying_temperature) warnings.push("Secado condicionado por equipo, humedad inicial, punto de rocío y almacenamiento; confirma compatibilidad antes de aplicar recomendaciones.");
    if (material.id === "indorama-ventures-polyclear-refresh-pet-1101") warnings.push("Densidad aparente 0.9 kg/L corresponde a 80 pellets/g; la ficha indica 0.88 kg/L para 60 pellets/g. Confirma presentación y condición.");
  }
  if (Object.values(materialState.provenance).some(p => p.origin === "user_override" || (p.grade_id && p.grade_id !== material.id))) warnings.push("Hay datos manuales o de otro grado conservados: revisa su compatibilidad y registra la justificación.");
  for (const entry of Object.values(materialState.provenance)) {
    if (entry.origin !== "user_override" || !entry.reference || !Number.isFinite(n(entry.value))) continue;
    const reference = entry.reference, value = n(entry.value);
    if (Array.isArray(reference.range) && (value < reference.range[0] || value > reference.range[1])) {
      warnings.push(`${propertyLabels[entry.property_key]}: valor manual fuera del rango de ficha; requiere validación técnica.`);
    } else if (Number.isFinite(reference.value) && value !== reference.value) {
      warnings.push(`${propertyLabels[entry.property_key]}: valor manual diferente de la referencia; confirma condiciones y justificación.`);
    }
  }
  return warnings;
}

export function materialSnapshot(materialState, module, inputs, level) {
  const fields = activeFields(module, inputs, level), used = {}, fieldStates = {};
  for (const field of fields) {
    const map = mappings[module.id]?.[field.key];
    if (!map) continue;
    const entry = materialState.provenance[field.key];
    if (entry) fieldStates[field.key] = { ...clone(entry), value: inputs[field.key] };
    if (isBlank(inputs[field.key])) continue;
    used[field.key] = { ...clone(entry || { origin: "manual", property_key: map[0], unit: map[1], phase: map[2], grade_id: null }), value: inputs[field.key] };
  }
  return clone({ grade_id: materialState.grade_snapshot?.id ?? null, source_id: materialState.grade_snapshot?.source_id ?? null,
    dataset: materialState.dataset, grade_snapshot: materialState.grade_snapshot, source: materialState.source, references_snapshot: materialState.references_snapshot,
    used_fields: used, field_states: fieldStates, context: materialState.context });
}
export function restoreMaterial(snapshot) {
  const result = createMaterialState();
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) return result;
  const material = snapshot.grade_snapshot;
  // Historial no confiable: validar forma antes de renderizar; URLs se validan por separado.
  if (material && typeof material.id === "string" && typeof material.grade === "string" && typeof material.family === "string" &&
    typeof material.manufacturer === "string" && material.properties && typeof material.properties === "object" && !Array.isArray(material.properties) &&
    Array.isArray(material.process_tags) && material.process_tags.every(tag => typeof tag === "string") &&
    Object.values(material.properties).every(p => p === null || (p && typeof p === "object" && !Array.isArray(p) &&
      (p.value === null || Number.isFinite(p.value)) && typeof p.unit === "string" &&
      (p.range === null || (Array.isArray(p.range) && p.range.length === 2 && p.range.every(Number.isFinite)))))) {
    result.grade_snapshot = clone(material);
    result.dataset = snapshot.dataset && typeof snapshot.dataset === "object" ? clone(snapshot.dataset) : null;
    result.source = snapshot.source && typeof snapshot.source === "object" ? clone(snapshot.source) : null;
    result.references_snapshot = snapshot.references_snapshot && typeof snapshot.references_snapshot === 'object' ? clone(snapshot.references_snapshot) : null;
  }
  const entries = snapshot.field_states ?? snapshot.used_fields;
  if (entries && typeof entries === "object" && !Array.isArray(entries)) {
    for (const [field, entry] of Object.entries(entries)) {
      if (Object.values(mappings).some(map => Object.hasOwn(map, field)) && entry && typeof entry === "object") result.provenance[field] = clone(entry);
    }
  }
  for (const key of Object.keys(result.context)) {
    if (typeof snapshot.context?.[key] === typeof result.context[key]) result.context[key] = snapshot.context[key];
  }
  return result;
}
