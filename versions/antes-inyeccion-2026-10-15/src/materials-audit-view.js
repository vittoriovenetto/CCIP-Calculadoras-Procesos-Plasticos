import { safeSourceUrl, propertyLabels } from "./materials.js";
import { pvtStatusLabels, validVisualization } from "./pvt.js";
const safe = value => String(value ?? "").replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const link = (source, id) => {
  const url = safeSourceUrl(source?.url);
  return url ? `<a href="${safe(url)}" target="_blank" rel="noopener noreferrer">Abrir fuente [${safe(id)}]</a>` : '<span>Fuente no disponible</span>';
};
const gaps = {
  melt_density: "Densidad fundida: solicitar pVT/medición del grado exacto a temperatura y presión de proceso.",
  specific_heat_curve: "Cp(T): solicitar grado, fase, método e intervalo térmico; entalpía/calor latente si hay transición.",
  drying_guideline: "Secado: solicitar protocolo del grado; no copiar otro PET ni deducir de Tg/fusión.",
  real_machine_process_validation: "Equipo: registrar modelo, condiciones y al menos un caso medido por proceso.",
  lot_confirmation: "Lote: registrar proveedor, etiqueta/COA, formulación, color, cargas y aditivos.",
  final_compound: "PVC: definir estabilizantes, plastificantes, cargas y compuesto final."
};

function chart(sample) {
  if (!validVisualization(sample)) return '';
  const width = 760, height = 380, left = 70, top = 35, w = 650, h = 260;
  const ts = sample.T_C, values = sample.isobars.flatMap(line => line.specific_volume_cm3_g);
  const lo = Math.floor(Math.min(...values) * 20) / 20, hi = Math.ceil(Math.max(...values) * 20) / 20;
  const x = t => left + (t - ts[0]) / (ts.at(-1) - ts[0]) * w;
  const y = v => top + h - (v - lo) / (hi - lo || 1) * h;
  const colors = ['#98112a', '#146b53', '#235bb3', '#8a4e00', '#653fa5', '#333333'];
  const ticks = Array.from({ length: 5 }, (_, i) => lo + (hi - lo) * i / 4);
  return `<figure class="pvt-chart"><figcaption><b>Digitalización orientativa — solo visualización</b><p>${safe(sample.digitization_method)} Incertidumbre: ${safe(sample.estimated_uncertainty_cm3_g)}.</p></figcaption>
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Isobaras aproximadas de ABS Terluran GP-22; no utilizables para densidad automática"><title>Digitalización orientativa pVT, fuente ${safe(sample.source_ref)}</title>
      ${ticks.map(v => `<line x1="${left}" y1="${y(v)}" x2="${left + w}" y2="${y(v)}" stroke="#ddd"/><text x="${left - 8}" y="${y(v) + 4}" text-anchor="end">${v.toFixed(3)}</text>`).join('')}
      ${ts.map(t => `<text x="${x(t)}" y="${top + h + 22}" text-anchor="middle">${t}</text>`).join('')}
      <path d="M${left} ${top} V${top + h} H${left + w}" fill="none" stroke="#222"/>
      <text x="${left + w / 2}" y="${height - 30}" text-anchor="middle">Temperatura (°C)</text><text x="${left}" y="20">Volumen específico (cm³/g)</text>
      ${sample.isobars.map((line, index) => `<polyline points="${ts.map((t, i) => `${x(t)},${y(line.specific_volume_cm3_g[i])}`).join(' ')}" fill="none" stroke="${colors[index % colors.length]}" stroke-width="2" stroke-dasharray="${index % 2 ? '6 3' : 'none'}"/>${ts.map((t, i) => `<circle cx="${x(t)}" cy="${y(line.specific_volume_cm3_g[i])}" r="3" fill="${colors[index % colors.length]}"><title>${line.P_MPa} MPa; ${t} °C; ${line.specific_volume_cm3_g[i]} cm³/g</title></circle>`).join('')}`).join('')}
    </svg><div class="pvt-legend">${sample.isobars.map((line, i) => `<span style="color:${colors[i % colors.length]}">${line.P_MPa} MPa</span>`).join('')}</div>
    <details><summary>Puntos aproximados del adjunto (cm³/g)</summary><div class="pvt-table-wrap"><table><thead><tr><th>Presión MPa</th>${ts.map(t => `<th>${t} °C</th>`).join('')}</tr></thead><tbody>${sample.isobars.map(line => `<tr><th>${line.P_MPa}</th>${line.specific_volume_cm3_g.map(v => `<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div></details>
    <p class="warning">Las líneas unen puntos para ilustrar la figura; no son una interpolación validada. No calcular densidad, dimensionar equipos ni extrapolar con esta serie.</p></figure>`;
}
export function renderAudit(state, level) {
  const grade = state.grade_snapshot;
  if (!grade) return '';
  const refs = state.references_snapshot || {};
  const incoming = grade.incoming_product_moisture;
  const references = Array.isArray(grade.reference_properties_not_for_autofill) ? grade.reference_properties_not_for_autofill.filter(ref => ref && typeof ref === "object") : [];
  const pvt = grade.pvt;
  const source = refs.pvt_sources?.[pvt?.source_ref];
  return `${incoming ? `<section id="incoming-moisture" class="note"><b>Humedad del producto recibido (PET)</b><p>${safe(incoming.value)} ${safe(incoming.unit)}; <span>máximo</span> ${safe(incoming.max)} ${safe(incoming.unit)}. <span>${safe(incoming.meaning)}</span></p><small>${safe(incoming.status)} · ${link(refs.sources?.[incoming.source_id], incoming.source_id)}</small>${refs.sources?.S12 ? `<p>Procedimiento de escamas PET: referencia de otro proceso, sin autocompletado. ${link(refs.sources.S12, 'S12')}</p>` : ''}</section>` : ''}
    ${references.length ? `<details id="blocked-references" ${level === 'advanced' ? 'open' : ''}><summary>Referencias históricas / otros grados — sin autocompletado</summary>${references.map(ref => `<article class="material-property"><b>${ref.status === 'unverified_reference' ? `${propertyLabels[ref.property] || ref.property}: referencia sin verificación oficial; no autocompletar` : ref.property === 'specific_heat' ? 'Cp histórico agrupado: no aplicable automáticamente' : 'Guía PET de otro grado: no aplicable a Polyclear 1101'}</b><p>${safe(ref.value ?? '')} ${safe(ref.unit ?? '')} ${safe(ref.method ?? '')} <span>${safe(ref.applicability ?? ref.use ?? '')}</span></p>${Object.entries(ref).filter(([key]) => ['air_dew_point_C', 'pellet_temperature_C', 'residence_h'].includes(key)).map(([key, value]) => `<small>${safe(key)}: ${safe(value)}</small>`).join('')}<small>Estado: ${safe(ref.status || 'referencia de otro grado')}; fase: ${safe(ref.phase || 'no documentada')}; intervalo: ${safe(ref.temperature_range || 'no documentado')}</small>${link(refs.sources?.[ref.source_id], ref.source_id)}</article>`).join('')}</details>` : ''}
    ${pvt ? `<details id="pvt-section" ${level === 'advanced' ? 'open' : ''}><summary>Curvas pVT</summary><p><b>${safe(pvtStatusLabels[pvt.status] || 'Pendiente')}</b></p><p>${safe(pvt.graphical_data)}</p><p class="warning">Densidad automática deshabilitada. Se requieren puntos originales o coeficientes calibrados del grado exacto y dominio T/P validado. Prohibida la extrapolación.</p><p class="muted">Intervalo T validado: ${safe(pvt.T_range_C || 'pendiente')} · Intervalo P validado: ${safe(pvt.P_range_MPa || 'pendiente')} · Datos/coeficientes: pendientes.</p>${source ? `<p>${safe(source.grade)} · ${safe(source.publisher)} · ${link(source, pvt.source_ref)}</p><p>Presiones representadas: ${Array.isArray(source.pressure_MPa) ? source.pressure_MPa.map(safe).join(', ') + ' MPa' : 'sin tabla disponible'}. No constituyen un dominio numérico calibrado.</p>` : ''}${pvt.status === 'grade_exact_chart_available_approx_digitization' ? chart(refs.pvt_sample) : ''}</details>` : ''}
    ${pvt?.source_ref === 'PV02' && refs.pvt_sources?.PV04 ? `<p class="note">Referencia académica Tait, sin coeficientes integrados: requiere transcripción completa y validación. ${link(refs.pvt_sources.PV04, 'PV04')}</p>` : ''}
    ${grade.missing_data_audit ? `<details id="material-gaps"><summary>Datos pendientes y evidencia requerida</summary><ul>${Object.entries(grade.missing_data_audit).filter(([key, value]) => key !== 'drying_guideline' || value !== 'present_grade_specific').map(([key]) => `<li>${safe(gaps[key] || key)}</li>`).join('')}</ul></details>` : ''}`;
}
export function renderManualData(state, moduleId, level) {
  if (level !== 'advanced' || !['inyeccion', 'secado'].includes(moduleId)) return '';
  const numeric = (key, label, min) => `<label for="material-${key}">${label}</label><input id="material-${key}" data-material-context="${key}" type="number" step="any" min="${min}" value="${safe(state.context[key])}" placeholder="Dato medido / documentado">`;
  const text = (key, label) => `<label for="material-${key}">${label}</label><input id="material-${key}" data-material-context="${key}" value="${safe(state.context[key])}" placeholder="Documento, ensayo, versión y fecha">`;
  return `<details id="manual-thermodynamic" class="material-context" open><summary>Introducir datos manuales pVT / Cp</summary><p class="muted">Introduce la propiedad en el campo de cálculo y registra aquí su evidencia. Las figuras orientativas no suministran valores al motor.</p><div class="fields">${moduleId === 'inyeccion' ? `<div>${numeric('pvtTemperatureC', 'Temperatura de la densidad fundida (°C)', -273.15)}</div><div>${numeric('pvtPressureMPa', 'Presión de la densidad fundida (MPa)', 0)}</div><div>${text('meltDensitySource', 'Fuente / ensayo de densidad fundida')}</div>` : `<div>${numeric('cpMinC', 'Límite inferior del intervalo Cp (°C)', -273.15)}</div><div>${numeric('cpMaxC', 'Límite superior del intervalo Cp (°C)', -273.15)}</div><div><label for="material-cpPhase">Fase del Cp documentado</label><select id="material-cpPhase" data-material-context="cpPhase"><option value="">Sin confirmar</option><option value="solid" ${state.context.cpPhase === 'solid' ? 'selected' : ''}>Sólido</option><option value="melt" ${state.context.cpPhase === 'melt' ? 'selected' : ''}>Fundido</option></select></div><div>${text('specificHeatSource', 'Fuente / método / revisión de Cp')}</div>`}</div><p class="muted">Cp constante solo aproxima un intervalo de fase compatible. Si hay transición, se requiere entalpía/calor latente; este modelo no los calcula.</p></details>`;
}
