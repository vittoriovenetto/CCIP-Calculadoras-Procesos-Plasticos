import { modules, levels } from './schema.js';
import { calculate } from './engine.js';
import { lessons, examples } from './formulas-data.js';

// El nivel describe el ejemplo enseñado, incluida la dependencia de resultados
// intermedios y los términos opcionales que el motor omite en niveles inferiores.
const lessonLevels = new Map();
for (const module of modules) {
  const inputs = examples.find(([id]) => id === module.id)[1];
  for (const level of Object.keys(levels)) {
    for (const metric of calculate(module.id, inputs, level).metrics) {
      const lesson = lessons.find(x => x.module === module.id && x.label === metric.label);
      const reproducesExample = lesson && metric.value !== null && Math.abs(metric.value - lesson.expected) <= 1e-10 * Math.max(1, Math.abs(lesson.expected));
      if (reproducesExample && !lessonLevels.has(lesson.id)) lessonLevels.set(lesson.id, level);
    }
  }
}
export const lessonLevel = lesson => lessonLevels.get(lesson.id);
export const lessonFor = (module, label) => lessons.find(x => x.module === module && x.label === label);
export const levelNames = { basic: 'Básico', technical: 'Técnico', advanced: 'Avanzado' };

export function guideHref(module, level = 'advanced', label) {
  const lesson = label ? lessonFor(module, label) : null;
  const requested = Object.hasOwn(levels, level) ? level : 'advanced';
  // Un resultado pendiente puede necesitar un nivel superior al del caso actual.
  const shown = lesson && levels[lessonLevel(lesson)] > levels[requested] ? lessonLevel(lesson) : requested;
  return `./formulas.html?process=${encodeURIComponent(module)}&level=${shown}#${lesson ? lesson.id : `guide-${module}`}`;
}
