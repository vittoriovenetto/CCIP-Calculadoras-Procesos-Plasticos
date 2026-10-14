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
  root.innerHTML = `<p class="muted">${copy('42 salidas calculadas en 7 procesos. Las expresiones se leen directamente del motor.','42 calculated outputs across 7 processes. Expressions are read directly from the engine.')}</p>`;
  for (const module of modules) {
    const outputs = calculate(module.id,{},'advanced').metrics;
    root.insertAdjacentHTML('beforeend',`<section data-index-process="${module.id}"><h3>${safe(t(module.name))}</h3><table class="formula-full-index"><thead><tr>${[copy('Resultado','Output'),copy('Ecuación utilizada','Equation used'),copy('Unidad','Unit')].map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${outputs.map(m=>`<tr data-index-level="${lessonLevel(lessonFor(module.id,m.label))}"><td>${safe(t(m.label))}</td><td>${safe(t(m.formula))}</td><td>${safe(local(m.unit))}</td></tr>`).join('')}</tbody></table></section>`);
  }
}
function renderLessons() {
  document.getElementById('formula-nav').innerHTML = modules.map(m=>`<a data-guide-process="${m.id}" href="#guide-${m.id}">${safe(t(m.name))}</a>`).join('');
  document.getElementById('formula-lessons').innerHTML = modules.map(module=>{
    const inputs = examples.find(([id])=>id===module.id)[1], model = calculate(module.id,inputs,'advanced');
    const cards = lessons.filter(x=>x.module===module.id).map(lesson=>{
      const output = model.metrics.find(x=>x.label===lesson.label), lhs = lesson.equation.split('=')[0].trim();
      const variableRows = lesson.fields.map(key=>{
        const field = module.fields.find(f=>f.key===key);
        return [symbols[key],t(field.label),local(field.unit || '—'),`${inputs[key]} ${local(field.unit || '')}`,t(field.description)];
      });
      variableRows.push([lhs,t(lesson.label),local(output.unit),'—',copy('Resultado buscado.','Calculated output.')]);
      for (const [symbol,label,unit] of glossary[module.id]) if (new RegExp('(?<![\\p{L}\\p{N}])'+symbol+'(?![\\p{L}\\p{N}])','u').test(lesson.equation) && symbol!==lhs && !variableRows.some(row=>row[0]===symbol)) variableRows.push([symbol,t(label),local(unit),'—',copy('Resultado intermedio; véase su explicación en este proceso.','Intermediate output; see its explanation in this process.')]);
      return `<article class="equation" id="${lesson.id}" data-lesson="${lesson.id}" data-lesson-level="${lessonLevel(lesson)}"><span class="lesson-level">${copy('Nivel del ejemplo','Example level')}: ${safe(t(levelNames[lessonLevel(lesson)]))}</span><h3>${safe(t(lesson.label))}</h3><p>${copy('Finalidad: estimar','Purpose: estimate')} ${safe(t(lesson.label).toLowerCase())} [${safe(local(output.unit))}].</p><div class="eq-math">${safe(local(lesson.equation))}</div>
        <details open><summary>${copy('Variables, unidades y datos del ejemplo','Variables, units and example inputs')}</summary><div class="formula-variables">${variableRows.map(([symbol,name,unit,value,description])=>`<div><b>${safe(symbol)} · ${safe(name)}</b><p>${safe(description)}</p><small>${copy('Unidad','Unit')}: ${safe(unit)} · ${copy('Ejemplo','Example')}: ${safe(value)}</small></div>`).join('')}</div></details>
        <details open class="worked-example"><summary>${copy('Ejemplo resuelto paso a paso','Worked example, step by step')}</summary><p class="muted">${copy('Valores sintéticos, sin asignación a un grado o máquina.','Synthetic values, not assigned to a grade or machine.')}</p><ol>${lesson.steps.map(step=>`<li><code>${safe(local(step))}</code></li>`).join('')}</ol><p><b>${copy('Resultado','Result')}: <span data-example-value="${lesson.expected}">${numbers(lesson.expected)} ${safe(local(output.unit))}</span></b></p></details>
        <details><summary>${copy('Conversiones, hipótesis, límites y referencias','Conversions, assumptions, limits and references')}</summary><p>${safe(lesson.conversions[getLanguage()])}</p>${model.notes.map(note=>`<p class="note">${safe(t(note))}</p>`).join('')}
          <p>${copy('Sin entradas válidas, los resultados dependientes quedan pendientes. No utilizar como validación industrial.','Without valid inputs, dependent outputs remain pending. Do not use as industrial validation.')}</p>
          <p>${copy('Referencia: derivación geométrica, conservación de masa o balance sensible del modelo implementado. Conversiones según unidades SI; fuerza convencional con g₀ = 9.80665 m/s².','Reference: geometric derivation, mass conservation or sensible balance of the implemented model. SI unit conversions; conventional force uses g₀ = 9.80665 m/s².')}</p>
          <a href="./src/models/${module.id}.js">${copy('Consultar el modelo implementado','Read the implemented model')}</a> · <a href="https://www.bipm.org/en/publications/si-brochure" target="_blank" rel="noopener noreferrer">${copy('Referencia de unidades SI: BIPM','SI unit reference: BIPM')}</a>
        </details></article>`;
    }).join('');
    const alternatives = module.id==='inyeccion' || module.id==='extrusion' ? alternateExample(module.id) : '';
    const auxiliary = module.id==='inyeccion' ? `<article class="equation" data-auxiliary="screw-area"><h3>${copy('Área del husillo (variable auxiliar)','Screw area (auxiliary variable)')}</h3><p>${copy('Sección transversal geométrica para capacidad y carrera; no es el área del canal helicoidal.','Geometric cross section for capacity and stroke; not helical channel area.')}</p><div class="eq-math">A = π D² / 4</div><p>D [mm]; A [mm²]. D = 20 mm → A = π × 20² / 4 ≈ 314.159265 mm².</p></article>` : '';
    return `<section class="formula-topic" id="guide-${module.id}"><h2>${safe(t(module.name))}</h2><p>${safe(t(module.description))}</p>${auxiliary}${cards}${alternatives}</section>`;
  }).join('');
}
function alternateExample(id) {
  const inputs = examples.slice(7).find(([module])=>module===id)[1], output = calculate(id,inputs,'advanced');
  const equation = id==='inyeccion' ? 'V₀ = n Vₚ + Vᵣ = 2 × 35 + 5 = 75 cm³; Vₛ = 75 × 1.1 = 82.5 cm³; m₀ = 75 × 0.8 = 60 g; mₛ = 82.5 × 0.8 = 66 g.' : 'A = π (Dₒ² − Dᵢ²)/4 = π (20² − 10²)/4 ≈ 235.619449 mm²; m′ = A × 0.92 ≈ 216.769893 g/m; Qₙ ≈ 130.061936 kg/h.';
  return `<details class="alternate-example"><summary>${id==='inyeccion'?copy('Alternativa: dosificación por volumen','Alternative: volume metering'):copy('Alternativa: extrusión de tubo','Alternative: tube extrusion')}</summary><p>${safe(equation)}</p><p>${id==='inyeccion'?copy('Vₚ: volumen de fundido por pieza; Vᵣ: volumen de canales, ambos en cm³. ρₘ = 0.8 g/cm³ es un dato sintético manual.','Vₚ: melt-equivalent volume per part; Vᵣ: runner volume, both in cm³. ρₘ = 0.8 g/cm³ is synthetic manual data.'):copy('Dₒ y Dᵢ son diámetros exterior e interior en mm, con 0 ≤ Dᵢ < Dₒ. Los demás datos son los del ejemplo de lámina.','Dₒ and Dᵢ are outer and inner diameters in mm, with 0 ≤ Dᵢ < Dₒ. Other inputs match the sheet example.')}</p><div>${output.metrics.map(m=>`<p data-alternate-level="${lessonLevel(lessonFor(id,m.label))}">${safe(t(m.label))}: ${numbers(m.value)} ${safe(local(m.unit))}</p>`).join('')}</div></details>`;
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
    document.querySelector(`[data-guide-process="${module.id}"]`).hidden = topic.hidden;
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
function openTarget() {
  const id = location.hash.slice(1), target = document.getElementById(id);
  if (target && !target.hidden && !target.closest('[hidden]')) {
    for (const details of target.querySelectorAll('details')) details.open = true;
    target.scrollIntoView();
  }
}
for (const [id,key] of [['formula-process','process'],['formula-level','level']]) {
  document.getElementById(id).addEventListener('change',e=>{
    filters[key] = e.target.value;applyFilters();
    const url = new URL(location.href);
    for (const name of ['process','level']) filters[name] === 'all' ? url.searchParams.delete(name) : url.searchParams.set(name,filters[name]);
    // Evita conservar el fragmento de una explicación oculta por el filtro nuevo.
    url.hash = '';history.replaceState(null,'',url);
  });
}
initI18n();renderGuide();openTarget();
addEventListener('hashchange',openTarget);
document.addEventListener('ccip-language-change',()=>{renderGuide();});
