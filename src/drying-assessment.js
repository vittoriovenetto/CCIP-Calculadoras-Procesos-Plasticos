// Etapa 5: gate de evidencia para el balance sensible, sin modificar el motor compartido.
// Un Cp manual no tiene validez térmica solo por ser numérico.
import { n } from './math.js';

const number = value => Number.isFinite(n(value));
export function prepareDryingCase(inputs, state, level, origins = {}) {
  const effective = {...inputs}, warnings = [];
  const context = state?.context || {}, grade = state?.grade_snapshot;
  const assessment = {
    model: 'sensible_heat_of_solid_polymer_only',
    predicts_residual_moisture: false, predicts_dryer_electric_power: false,
    predicts_evaporation_or_regeneration: false,
    assumed_start_temperature_C: origins.startT === 'operating_assumption' ? 25 : null,
    cp_valid_for_sensible_estimate: false, cp_evidence: 'not_available'
  };
  if (origins.startT === 'operating_assumption' && number(inputs.startT) && n(inputs.startT) === 25)
    warnings.push('Temperatura inicial: 25 °C es un supuesto operativo editable, no una propiedad medida del grado.');
  const residence = state?.provenance?.residence;
  if (residence?.origin === 'manufacturer_range_upper')
    warnings.push('Tiempo de residencia: valor nominal propuesto en el extremo superior del rango de ficha; confirmar con humedad inicial, secador y punto de rocío.');
  const recommended = grade?.properties?.drying_temperature;
  if (number(inputs.targetT) && recommended && Array.isArray(recommended.range) && n(inputs.targetT) > recommended.range[1])
    warnings.push('Temperatura final: supera el máximo del rango de secado publicado; requiere justificación del fabricante o validación específica.');
  else if (number(inputs.targetT) && recommended && number(recommended.value) && n(inputs.targetT) > n(recommended.value))
    warnings.push('Temperatura final: supera la recomendación puntual de secado publicada para el grado; revisar ficha y condiciones.');
  if (level === 'advanced' && number(inputs.specificHeat) && n(inputs.specificHeat) > 0) {
    const cpProperty = grade?.properties?.specific_heat;
    const cpFromGrade = state?.provenance?.specificHeat?.origin === 'library' && cpProperty?.phase === 'solid' &&
      typeof cpProperty?.condition === 'string' && cpProperty.condition.trim() && cpProperty.source_id;
    const lo = n(context.cpMinC),hi = n(context.cpMaxC),t0=n(inputs.startT),t1=n(inputs.targetT);
    const manualOK = context.cpPhase === 'solid' && number(context.cpMinC) && number(context.cpMaxC) &&
      hi > lo && [t0,t1].every(t => Number.isFinite(t) && t >= lo && t <= hi) &&
      typeof context.specificHeatSource === 'string' && context.specificHeatSource.trim().length > 0;
    if (cpFromGrade || manualOK) {
      assessment.cp_valid_for_sensible_estimate = true;
      assessment.cp_evidence = cpFromGrade ? 'grade_specific_with_phase_conditions' : 'user_declared_solid_phase_interval_and_source';
    } else {
      effective.specificHeat = '';
      assessment.cp_evidence = 'missing_solid_phase_interval_or_source';
      warnings.push('Calor específico medio: para calcular potencia sensible, documenta Cp de fase sólida, intervalo que incluya ambas temperaturas y fuente/método. El valor sin evidencia se conserva en la entrada, pero NO participa en el cálculo.');
    }
  }
  return {effective,warnings,assessment};
}
