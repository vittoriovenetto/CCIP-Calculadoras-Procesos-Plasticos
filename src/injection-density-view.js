import { familyReference } from './injection-density.js';
import { safe } from './materials-view.js';
import { safeSourceUrl } from './materials.js';
import { t } from './i18n.js';

// Se monta dentro de la ayuda «?» del campo; no crea otro panel de cálculo.
export function renderInjectionDensity(root,{state,onChange,onUseReference}) {
  if (!root) return;
  const open=root.querySelector('details')?.open||false;
  const ref=familyReference(state.grade_snapshot?.family,state.context),strict=state.context.meltDensityPolicy==='verified_only';
  const control=(key,label,type='text')=>`<label for="material-${key}">${safe(t(label))}<input id="material-${key}" data-density-context="${key}" type="${type}" ${type==='number'?'step="any"':''} value="${safe(state.context[key])}"></label>`;
  root.innerHTML=`<p>${safe(t('Las referencias de familia son estimaciones; no son propiedades certificadas del grado ni datos pVT. No se usa densidad sólida ni factor de caliente.'))}</p>
    ${ref?`<p><b>${safe(ref.family)}: ${safe(ref.value)} ${safe(ref.unit)}</b><br><span data-i18n-ignore>${safe(ref.source.publisher)} · ${safe(ref.source.title)}</span><br>${safe(t(ref.source.locator||''))} · ${safeSourceUrl(ref.source.url)?`<a href="${safe(ref.source.url)}" target="_blank" rel="noopener">${safe(t('Ver fuente'))}</a>`:''}<br>${safe(t(ref.conditions.applicability))}</p>`:''}
    ${(!state.provenance.meltDensity||['manual','user_override'].includes(state.provenance.meltDensity?.origin))&&ref&&!strict?`<button id="use-family-density" type="button">${safe(t('Usar referencia de familia'))}</button>`:''}
    ${state.grade_snapshot?.family==='PVC'?`<label for="pvc-melt-form">${safe(t('Compuesto final de PVC confirmado'))}<select id="pvc-melt-form"><option value="">${safe(t('Sin confirmar'))}</option><option value="rigid" ${state.context.pvcMeltReferenceForm==='rigid'?'selected':''}>${safe(t('PVC rígido'))}</option><option value="flexible" ${state.context.pvcMeltReferenceForm==='flexible'?'selected':''}>${safe(t('PVC flexible'))}</option></select></label><p>${safe(t('No aplicar a resina en polvo de formulación desconocida.'))}</p>`:''}
    <details ${open?'open':''}><summary>${safe(t('Condiciones y datos verificados'))}</summary><label for="density-policy">${safe(t('Datos permitidos para densidad fundida'))}</label><select id="density-policy"><option value="reference_allowed" ${strict?'':'selected'}>${safe(t('Permitir referencias de familia (estimaciones)'))}</option><option value="verified_only" ${strict?'selected':''}>${safe(t('Solo datos verificados'))}</option></select>
      ${control('pvtTemperatureC','Temperatura de la densidad fundida (°C)','number')}${control('pvtPressureMPa','Presión de la densidad fundida (MPa)','number')}${control('meltDensitySource','Fuente / ensayo de densidad fundida')}
      ${strict?`<label class="material-check"><input id="density-verified" type="checkbox" ${state.context.meltDensityVerified?'checked':''}>${safe(t('Verifiqué el valor manual para este material en fase fundida y a las condiciones indicadas.'))}</label><p>${safe(t('Verificación declarada por el usuario; no es certificación del CCIP. Requiere fuente, temperatura y presión.'))}</p>`:''}</details>`;
  root.querySelector('#density-policy').addEventListener('change',e=>onChange('meltDensityPolicy',e.target.value));
  root.querySelector('#pvc-melt-form')?.addEventListener('change',e=>onChange('pvcMeltReferenceForm',e.target.value));
  root.querySelector('#density-verified')?.addEventListener('change',e=>onChange('meltDensityVerified',e.target.checked));
  root.querySelector('#use-family-density')?.addEventListener('click',onUseReference);
  for(const input of root.querySelectorAll('[data-density-context]'))input.addEventListener('input',()=>onChange(input.dataset.densityContext,input.validity.badInput?'invalid':input.value));
}
