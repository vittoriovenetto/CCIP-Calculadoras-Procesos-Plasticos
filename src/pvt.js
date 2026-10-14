// Visualización documental; este módulo no convierte v a rho ni alimenta el motor.
export const pvtStatusLabels = {
  not_found_grade_specific_public: "Pendiente: curva pública del grado exacto no localizada",
  grade_exact_chart_available: "Gráfica del grado exacto; sin tabla numérica validada",
  grade_exact_chart_available_approx_digitization: "Gráfica del grado exacto; digitalización aproximada",
  related_base_grade_chart_only: "Referencia de B3S — no validada para R03"
};
export function validVisualization(sample) {
  return !!sample && sample.purpose === "visualization_only" && sample.eligible_for_melt_density_autofill === false &&
    sample.v_specific_unit === "cm3/g" && sample.pressure_unit === "MPa" &&
    Array.isArray(sample.T_C) && sample.T_C.length >= 2 && sample.T_C.every((t, i, ts) => Number.isFinite(t) && (i === 0 || t > ts[i - 1])) &&
    Array.isArray(sample.isobars) && sample.isobars.length > 0 && sample.isobars.every(line => line &&
      Number.isFinite(line.P_MPa) && line.P_MPa >= 0 && Array.isArray(line.specific_volume_cm3_g) &&
      line.specific_volume_cm3_g.length === sample.T_C.length && line.specific_volume_cm3_g.every(v => Number.isFinite(v) && v > 0));
}
export function validatePvt(data) {
  for (const material of data.materials) {
    const pvt = material.pvt;
    if (!pvt) continue;
    if (!Object.hasOwn(pvtStatusLabels, pvt.status) || pvt.calculator_autofill_allowed !== false ||
      pvt.measured_or_calibrated_coefficients !== null || (pvt.source_ref && !data.pvt_reference_sources?.[pvt.source_ref])) throw Error("Contrato pVT no soportado: no hay densidad automática validada");
  }
  for (const sample of Object.values(data.pvt_visualization_samples || {})) {
    if (!validVisualization(sample) || !data.pvt_reference_sources?.[sample.source_ref]) throw Error("Serie de visualización pVT no válida");
  }
}

export function captureReferences(data, material) {
  const ids = new Set([material.source_id, material.incoming_product_moisture?.source_id, material.pvT_resource?.source_id,
    ...Object.values(material.properties).filter(Boolean).map(p => p.source_id),
    ...(material.reference_properties_not_for_autofill || []).map(p => p.source_id)]);
  if (material.family === 'PET' && data.sources.S12) ids.add('S12');
  return JSON.parse(JSON.stringify({
    sources: Object.fromEntries(Object.entries(data.sources).filter(([id]) => ids.has(id))),
    pvt_sources: data.pvt_reference_sources || {},
    pvt_sample: Object.values(data.pvt_visualization_samples || {}).find(s => s.source_ref === material.pvt?.source_ref) || null,
    pvt_model_reference: data.pvt_model_reference || null, data_contract: data.data_contract || null
  }));
}
