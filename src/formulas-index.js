import { modules, levels } from './schema.js';
import { calculate } from './engine.js';
import { initI18n, getLanguage, t } from './i18n.js';
import { lessons, examples, symbols } from './formulas-data.js';
import { safe } from './materials-view.js';
import { lessonFor, lessonLevel, levelNames } from './formula-learning.js';
const query = new URLSearchParams(location.search);
const filters = {
  process: modules.some(m => m.id === query.get('process')) ? query.get('process') : 'all',
  level: Object.hasOwn(levels, query.get('level')) ? query.get('level') : 'all'
};
const copy = (es,en) => getLanguage() === 'en' ? en : es;
const local = value => getLanguage() !== 'en' ? String(value) : t(value,getLanguage()).replaceAll('(tubo)','(tube)').replaceAll('moneda/','currency/').replaceAll('ciclos/h','cycles/h').replaceAll('pzas/h','parts/h');
const numbers = value => Number(value).toLocaleString(getLanguage()==='en'?'en-US':'es-DO',{maximumFractionDigits:6});
const glossary = {
  inyeccion: [['m₀','Masa total sin reserva','g'],['mₛ','Shot calculado (masa)','g'],['Vₛ','Shot calculado (volumen)','cm³'],['Vₘₐₓ','Capacidad volumétrica teórica del husillo','cm³'],['A','Área del husillo','mm²'],['Lₛ','Carrera calculada del husillo','mm'],['F','Fuerza de cierre teórica','tf']],
  extrusion:[['A','Área transversal','mm²'],['m′','Masa por metro de producto','g/m'],['Qₙ','Producción neta ideal','kg/h'],['Qᶠ','Alimentación con pérdida indicada','kg/h']],
  pelicula:[['A','Área transversal total de la película','mm²'],['Dᵦ','Diámetro ideal de burbuja','mm'],['BUR','Relación de soplado (BUR)','—']],
  soplado:[['S','Superficie de cilindro cerrado','mm²'],['m','Masa de pared ideal','g']],
  termoformado:[['A','Superficie de lámina consumida','mm²'],['m','Masa de lámina por ciclo','g'],['C','Ciclos teóricos por hora','ciclos/h']],
  secado:[['M','Masa mínima de material en tolva','kg']],
  costos:[['Q','Consumo de material','kg/h'],['Nᵍ','Piezas buenas teóricas','pzas/h'],['Cₘ','Costo de material','moneda/h'],['Cₑ','Costo energético','moneda/h'],['Cₕ','Costo horario directo parcial','moneda/h']]
};
function renderIndex() {
  const root = document.getElementById('formulas-exact-index');root.replaceChildren();
  root.innerHTML = `<p class="muted">${copy(`${lessons.length} salidas calculadas en ${modules.length} procesos. Las expresiones se leen directamente del motor.`,`${lessons.length} calculated outputs across ${modules.length} processes. Expressions are read directly from the engine.`)}</p>`;
  for (const module of modules) {
    const outputs = calculate(module.id,{},'advanced').metrics;
    root.insertAdjacentHTML('beforeend',`<section data-index-process="${module.id}"><h3>${safe(t(module.name))}</h3><table class="formula-full-index"><thead><tr>${[copy('Resultado','Output'),copy('Ecuación utilizada','Equation used'),copy('Unidad','Unit')].map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${outputs.map(m=>`<tr data-index-level="${lessonLevel(lessonFor(module.id,m.label))}"><td>${safe(t(m.label))}</td><td>${safe(t(m.formula))}</td><td>${safe(local(m.unit))}</td></tr>`).join('')}</tbody></table></section>`);
  }
}
function renderLessons() {
  document.getElementById('formula-lessons').innerHTML = modules.map(module=>{
    const inputs = examples.find(([id])=>id===module.id)[1], model = calculate(module.id,inputs,'advanced');
    const cards = model.metrics.map(metric=>lessonFor(module.id,metric.label)).filter(Boolean).map(lesson=>{
      const output = model.metrics.find(x=>x.label===lesson.label), lhs = lesson.equation.split('=')[0].trim();
      const variableRows = lesson.fields.map(key=>{
        const field = module.fields.find(f=>f.key===key);
        return [symbols[key],t(field.label),local(field.unit || '—'),`${inputs[key]} ${local(field.unit || '')}`,t(field.description)];
      });
      variableRows.push([lhs,t(lesson.label),local(output.unit),'—',copy('Resultado buscado.','Calculated output.')]);
      for (const [symbol,label,unit] of glossary[module.id]) if (new RegExp('(?<![\\p{L}\\p{N}])'+symbol+'(?![\\p{L}\\p{N}])','u').test(lesson.equation) && symbol!==lhs && !variableRows.some(row=>row[0]===symbol)) variableRows.push([symbol,t(label),local(unit),'—',copy('Resultado intermedio; véase su explicación en este proceso.','Intermediate output; see its explanation in this process.')]);
      return `<details class="equation education-panel" id="${lesson.id}" data-lesson="${lesson.id}" data-lesson-level="${lessonLevel(lesson)}"><summary aria-expanded="false">${safe(t(lesson.label))}</summary><div class="lesson-content" tabindex="-1"><span class="lesson-level">${copy('Nivel del ejemplo','Example level')}: ${safe(t(levelNames[lessonLevel(lesson)]))}</span><h3>${safe(t(lesson.label))}</h3><p>${copy('Finalidad: estimar','Purpose: estimate')} ${safe(t(lesson.label).toLowerCase())} [${safe(local(output.unit))}].</p><div class="eq-math">${safe(local(lesson.equation))}</div>
        <section><h4>${copy('Variables, unidades y datos del ejemplo','Variables, units and example inputs')}</h4><div class="formula-variables">${variableRows.map(([symbol,name,unit,value,description])=>`<div><b>${safe(symbol)} · ${safe(name)}</b><p>${safe(description)}</p><small>${copy('Unidad','Unit')}: ${safe(unit)} · ${copy('Ejemplo','Example')}: ${safe(value)}</small></div>`).join('')}</div></section>
        <section class="worked-example"><h4>${copy('Ejemplo resuelto paso a paso','Worked example, step by step')}</h4><p class="muted">${copy('Valores sintéticos, sin asignación a un grado o máquina.','Synthetic values, not assigned to a grade or machine.')}</p><ol>${lesson.steps.map(step=>`<li><code>${safe(local(step))}</code></li>`).join('')}</ol><p><b>${copy('Resultado','Result')}: <span data-example-value="${lesson.expected}">${numbers(lesson.expected)} ${safe(local(output.unit))}</span></b></p></section>
        <section><h4>${copy('Conversiones, hipótesis, límites y referencias','Conversions, assumptions, limits and references')}</h4><p>${safe(lesson.conversions[getLanguage()])}</p>${model.notes.map(note=>`<p class="note">${safe(t(note))}</p>`).join('')}
          <p>${copy('Sin entradas válidas, los resultados dependientes quedan pendientes. No utilizar como validación industrial.','Without valid inputs, dependent outputs remain pending. Do not use as industrial validation.')}</p>
          <p>${copy('Referencia: derivación geométrica, conservación de masa o balance sensible del modelo implementado. Conversiones según unidades SI; fuerza convencional con g₀ = 9.80665 m/s².','Reference: geometric derivation, mass conservation or sensible balance of the implemented model. SI unit conversions; conventional force uses g₀ = 9.80665 m/s².')}</p>
          <a href="https://www.bipm.org/en/publications/si-brochure">${copy('Referencia de unidades SI: BIPM','SI unit reference: BIPM')}</a>
        </section></div></details>`;
    }).join('');
    const alternatives = module.id==='inyeccion' || module.id==='extrusion' ? alternateExample(module.id) : '';
    const auxiliary = module.id==='inyeccion' ? `<details class="equation education-panel" id="inyeccion-area" data-auxiliary="screw-area"><summary aria-expanded="false">${copy('Área del husillo (variable auxiliar)','Screw area (auxiliary variable)')}</summary><p>${copy('Sección transversal geométrica para capacidad y carrera; no es el área del canal helicoidal.','Geometric cross section for capacity and stroke; not helical channel area.')}</p><div class="eq-math">A = π D² / 4</div><p>D [mm]; A [mm²]. D = 20 mm → A = π × 20² / 4 ≈ 314.159265 mm².</p></details>` : '';
    return `<details class="formula-topic" id="guide-${module.id}"><summary aria-expanded="false"><h2>${safe(t(module.name))}</h2></summary><p>${safe(t(module.description))}</p>${cards}${auxiliary}${alternatives}</details>`;
  }).join('');
}
function alternateExample(id) {
  const inputs = examples.slice(7).find(([module])=>module===id)[1], output = calculate(id,inputs,'advanced');
  const equation = id==='inyeccion' ? 'V₀ = n Vₚ + Vᵣ = 2 × 35 + 5 = 75 cm³; Vₛ = 75 × 1.1 = 82.5 cm³; m₀ = 75 × 0.8 = 60 g; mₛ = 82.5 × 0.8 = 66 g.' : 'A = π (Dₒ² − Dᵢ²)/4 = π (20² − 10²)/4 ≈ 235.619449 mm²; m′ = A × 0.92 ≈ 216.769893 g/m; Qₙ ≈ 130.061936 kg/h.';
  return `<details id="${id}-alternativo" class="alternate-example education-panel"><summary>${id==='inyeccion'?copy('Alternativa: dosificación por volumen','Alternative: volume metering'):copy('Alternativa: extrusión de tubo','Alternative: tube extrusion')}</summary><p>${safe(equation)}</p><p>${id==='inyeccion'?copy('Vₚ: volumen de fundido por pieza; Vᵣ: volumen de canales, ambos en cm³. ρₘ = 0.8 g/cm³ es un dato sintético manual.','Vₚ: melt-equivalent volume per part; Vᵣ: runner volume, both in cm³. ρₘ = 0.8 g/cm³ is synthetic manual data.'):copy('Dₒ y Dᵢ son diámetros exterior e interior en mm, con 0 ≤ Dᵢ < Dₒ. Los demás datos son los del ejemplo de lámina.','Dₒ and Dᵢ are outer and inner diameters in mm, with 0 ≤ Dᵢ < Dₒ. Other inputs match the sheet example.')}</p><div>${output.metrics.map(m=>`<p data-alternate-level="${lessonLevel(lessonFor(id,m.label))}">${safe(t(m.label))}: ${numbers(m.value)} ${safe(local(m.unit))}</p>`).join('')}</div></details>`;
}
const matchesLevel = level => filters.level === 'all' || levels[level] <= levels[filters.level];
function applyFilters() {
  let count = 0;
  for (const module of modules) {
    const topic = document.getElementById(`guide-${module.id}`);
    const processMatches = filters.process === 'all' || filters.process === module.id;
    let topicCount = 0;
    for (const card of topic.querySelectorAll('[data-lesson]')) {
      card.hidden = !processMatches || !matchesLevel(card.dataset.lessonLevel);
      if (!card.hidden) topicCount++;
    }
    count += topicCount;
    topic.hidden = topicCount === 0;
    const auxiliary = topic.querySelector('[data-auxiliary]');
    if (auxiliary) auxiliary.hidden = !matchesLevel('technical');
    for (const alternative of topic.querySelectorAll('.alternate-example')) {
      alternative.hidden = !matchesLevel('technical');
      for (const result of alternative.querySelectorAll('[data-alternate-level]')) result.hidden = !matchesLevel(result.dataset.alternateLevel);
    }
    const index = document.querySelector(`[data-index-process="${module.id}"]`);
    index.hidden = topic.hidden;
    for (const row of index.querySelectorAll('[data-index-level]')) row.hidden = !matchesLevel(row.dataset.indexLevel);
  }
  document.getElementById('formula-count').textContent = copy(`${count} explicaciones disponibles con estos filtros.`,`${count} explanations available with these filters.`);
}
function renderGuide() {
  document.getElementById('formula-process').innerHTML = `<option value="all">${copy('Todos los procesos','All processes')}</option>` + modules.map(m=>`<option value="${m.id}">${safe(t(m.name))}</option>`).join('');
  document.getElementById('formula-process').value = filters.process;
  document.getElementById('formula-level').value = filters.level;
  renderIndex();renderLessons();applyFilters();
}
function bindAccordions() {
  for(const panel of document.querySelectorAll('.education-panel,.formula-topic'))panel.addEventListener('toggle',()=>{
    if(!panel.isConnected)return;
    panel.querySelector(':scope > summary')?.setAttribute('aria-expanded',String(panel.open));
    if(!panel.open)return;
    if(panel.matches('.education-panel'))for(const other of document.querySelectorAll('.education-panel'))if(other!==panel)other.open=false;
    if(panel.matches('.formula-topic'))for(const other of document.querySelectorAll('.formula-topic'))if(other!==panel)other.open=false;
  });
}
export function openGuideTarget(id=location.hash.slice(1)) {
  const target=document.getElementById(id);
  if(!target || target.hidden || target.closest('[hidden]'))return;
  const topic=target.closest('.formula-topic');if(topic)topic.open=true;
  if(target.matches('details'))target.open=true;
  const focus=target.querySelector('.lesson-content')||target.querySelector('summary');
  focus?.focus({preventScroll:true});target.scrollIntoView({block:'start'});
}
export function mountGuide(root,options={}) {
  if(root)root.innerHTML=`<div class="panel formula-controls"><button id="learning-back" type="button">${copy('Volver a calculadora','Back to calculator')}</button><h1>${copy('Aprendizaje','Learning')}</h1><p>${copy('Ejemplos sintéticos de enseñanza; no son datos de un material ni una máquina real.','Synthetic teaching examples; not data for a real material or machine.')}</p><div class="formula-filters"><label>${copy('Proceso','Process')}<select id="formula-process"></select></label><label>${copy('Nivel de aprendizaje','Learning level')}<select id="formula-level"><option value="all">${copy('Todos los niveles','All levels')}</option>${Object.entries(levelNames).map(([key,label])=>`<option value="${key}">${safe(t(label))}</option>`).join('')}</select></label></div><p id="formula-count" role="status"></p></div><details id="formula-index-details"><summary>${copy('Índice completo de resultados y fórmulas','Complete output and formula index')}</summary><div id="formulas-exact-index"></div></details><div id="formula-lessons"></div>`;
  filters.process=modules.some(m=>m.id===options.process)?options.process:(root?'all':filters.process);
  filters.level=Object.hasOwn(levels,options.level)?options.level:(root?'all':filters.level);
  renderGuide();bindAccordions();
  for(const [id,key] of [['formula-process','process'],['formula-level','level']])document.getElementById(id).addEventListener('change',e=>{
    filters[key]=e.target.value;applyFilters();
    for(const panel of document.querySelectorAll('.education-panel'))if(panel.hidden||panel.closest('[hidden]'))panel.open=false;
    const url=new URL(location.href);for(const name of ['process','level'])filters[name]==='all'?url.searchParams.delete(name):url.searchParams.set(name,filters[name]);
    url.hash='';history.replaceState(history.state,'',url);
  });
  document.getElementById('learning-back')?.addEventListener('click',()=>options.onBack?.());
  if(options.lesson)openGuideTarget(options.lesson);else if(!root)openGuideTarget();
}
function refreshLanguage() {
  if(!document.getElementById('formula-lessons'))return;
  const opened=document.querySelector('.education-panel[open]')?.id;
  const processes=[...document.querySelectorAll('.formula-topic[open]')].map(x=>x.id);
  renderGuide();bindAccordions();
  for(const id of processes){const el=document.getElementById(id);if(el)el.open=true;}
  if(opened){const el=document.getElementById(opened);if(el)el.open=true;}
}
if(document.getElementById('formula-lessons')){initI18n();mountGuide(null);}
addEventListener('hashchange',()=>{if(document.getElementById('formula-lessons'))openGuideTarget();});
document.addEventListener('ccip-language-change',refreshLanguage);
