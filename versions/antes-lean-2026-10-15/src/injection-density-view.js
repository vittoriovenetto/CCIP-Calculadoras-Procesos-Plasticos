import { familyDensityCatalog, familyReference } from './injection-density.js';
import { safe } from './materials-view.js';
import { safeSourceUrl } from './materials.js';
import { t } from './i18n.js';

export function renderInjectionDensity(root, { module, level, state, values, onChange, onUseReference }) {
  root.hidden = module.id !== 'inyeccion' || level === 'basic';
  if (root.hidden) { root.replaceChildren();return; }
  const open = root.querySelector('details')?.open || false;
  const strict = state.context.meltDensityPolicy === 'verified_only';
  const family = state.grade_snapshot?.family;
  const ref = familyReference(family, state.context);
  const entry = state.provenance.meltDensity;
  const link = source => safeSourceUrl(source?.url) ? `<a href="${safe(source.url)}" target="_blank" rel="noopener noreferrer">${safe(t('Ver fuente'))}</a>` : '—';
  const control = (key, label, type = 'text', min = '') => `<label for="material-${key}">${safe(t(label))}<input id="material-${key}" data-density-context="${key}" type="${type}" ${type === 'number' ? `step="any" min="${min}"` : ''} value="${safe(state.context[key])}"></label>`;
  root.innerHTML = `<details ${open ? 'open' : ''}><summary>${safe(t('Densidad fundida: referencia y verificación'))}</summary>
    <label for="density-policy">${safe(t('Datos permitidos para densidad fundida'))}</label><select id="density-policy"><option value="reference_allowed" ${strict ? '' : 'selected'}>${safe(t('Permitir referencias de familia (estimaciones)'))}</option><option value="verified_only" ${strict ? 'selected' : ''}>${safe(t('Solo datos verificados'))}</option></select>
    <p class="muted">${safe(t('Las referencias de familia están separadas de las fichas de grado. No se usa densidad sólida ni se aplica otra corrección térmica.'))}</p>
    ${family === 'PVC' ? `<label for="pvc-melt-form">${safe(t('Compuesto final de PVC'))}<select id="pvc-melt-form"><option value="">${safe(t('Sin confirmar'))}</option><option value="rigid" ${state.context.pvcMeltReferenceForm === 'rigid' ? 'selected' : ''}>${safe(t('PVC rígido'))}</option><option value="flexible" ${state.context.pvcMeltReferenceForm === 'flexible' ? 'selected' : ''}>${safe(t('PVC flexible'))}</option></select></label><label class="material-check"><input id="pvc-melt-confirmed" type="checkbox" ${state.context.pvcMeltCompoundConfirmed ? 'checked' : ''}>${safe(t('Confirmo el compuesto final; no aplico esta referencia a resina en polvo de formulación desconocida.'))}</label>` : ''}
    ${ref ? `<p class="note"><b>${safe(family)}</b> · ${safe(ref.value)} ${safe(ref.unit)} · ${safe(t('Densidad fundida estimada — referencia de familia'))}<br><span data-i18n-ignore>${safe(ref.source.publisher)} · ${safe(ref.source.title)}</span> · ${safe(t(ref.source.locator || ''))} · ${link(ref.source)}<br>${safe(t('Temperatura'))}: ${ref.conditions.temperature_C === 'not_specified' ? safe(t('No especificada')) : `${safe(ref.conditions.temperature_C)} °C`} · ${safe(t('Presión'))}: ${ref.conditions.pressure_MPa === 'not_specified' ? safe(t('No especificada')) : `${safe(ref.conditions.pressure_MPa)} MPa`}<br>${safe(t(ref.conditions.applicability))}</p>${!strict ? `<label class="material-check"><input id="accept-family-density" type="checkbox" ${state.context.familyMeltReferenceAccepted ? 'checked' : ''}>${safe(t('Acepto usar la densidad fundida de referencia de familia como estimación preliminar.'))}</label>${entry?.origin !== 'family_reference' ? `<button id="use-family-density" type="button">${safe(t('Usar referencia de familia'))}</button>` : ''}` : ''}` : `<p class="muted">${safe(t('No hay una referencia fundida documentada disponible para esta familia y condiciones. No se asigna un valor automático.'))}</p>`}
    <p class="muted">${safe(t('Prioridad: grado validado, valor manual confirmado al calcular y referencia de familia aceptada.'))}</p>
    ${strict ? `<label class="material-check"><input type="checkbox" id="density-verified" ${state.context.meltDensityVerified ? 'checked' : ''}>${safe(t('Verifiqué el valor manual para este material en fase fundida y a las condiciones indicadas.'))}</label><p class="muted">${safe(t('Verificación declarada por el usuario; no es certificación del CCIP. Requiere fuente, temperatura y presión.'))}</p>${level === 'technical' ? `<div class="fields">${control('pvtTemperatureC','Temperatura de la densidad fundida (°C)','number','-273.15')}${control('pvtPressureMPa','Presión de la densidad fundida (MPa)','number','0')}${control('meltDensitySource','Fuente / ensayo de densidad fundida')}</div>` : `<p class="muted">${safe(t('Registra temperatura, presión y fuente en los datos manuales pVT del material.'))}</p>`}` : ''}
    <details><summary>${safe(t('Tabla de referencias por familia'))}</summary><div class="pvt-table-wrap"><table><thead><tr><th>${safe(t('Familia'))}</th><th>${safe(t('Densidad fundida'))}</th><th>${safe(t('Fuente y alcance'))}</th></tr></thead><tbody>${familyDensityCatalog.entries.map(row => {
      const documented = familyReference(row.family,{pvcMeltReferenceForm:row.variant,pvcMeltCompoundConfirmed:true});
      return `<tr><th>${safe(row.family === 'PVC' ? t(row.variant === 'rigid' ? 'PVC rígido' : 'PVC flexible') : row.family)}</th><td>${documented ? `${safe(row.value)} ${safe(row.unit)} · ${safe(t('Estimación'))}` : safe(t('Sin referencia documentada'))}</td><td>${documented ? `${link(row.source)} ${safe(t(row.conditions.applicability))}` : '—'}</td></tr>`;
    }).join('')}</tbody></table></div></details></details>`;
  root.querySelector('#density-policy').addEventListener('change', e => onChange('meltDensityPolicy',e.target.value));
  root.querySelector('#density-verified')?.addEventListener('change',e=>onChange('meltDensityVerified',e.target.checked));
  root.querySelector('#accept-family-density')?.addEventListener('change',e=>onChange('familyMeltReferenceAccepted',e.target.checked));
  root.querySelector('#pvc-melt-form')?.addEventListener('change',e=>onChange('pvcMeltReferenceForm',e.target.value));
  root.querySelector('#pvc-melt-confirmed')?.addEventListener('change',e=>onChange('pvcMeltCompoundConfirmed',e.target.checked));
  root.querySelector('#use-family-density')?.addEventListener('click',onUseReference);
  for (const control of root.querySelectorAll('[data-density-context]')) control.addEventListener('input', e=>onChange(control.dataset.densityContext,control.validity.badInput ? 'invalid' : e.target.value));
}
