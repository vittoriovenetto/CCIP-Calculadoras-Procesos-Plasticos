import { modules, activeFields, levels } from "./schema.js";
import { n, isBlank } from "./math.js";
import { inyeccion } from "./models/inyeccion.js";
import { extrusion } from "./models/extrusion.js";
import { pelicula } from "./models/pelicula.js";
import { soplado } from "./models/soplado.js";
import { termoformado } from "./models/termoformado.js";
import { secado } from "./models/secado.js";
import { costos } from "./models/costos.js";

export { n } from "./math.js";
// Añadir un proceso registra su esquema y su función; no cambia otros modelos.
const models = { inyeccion, extrusion, pelicula, soplado, termoformado, secado, costos };

export function calculate(id, inputs = {}, level = "advanced") {
  const metrics = [], warnings = [], notes = [];
  const module = modules.find(m => m.id === id);
  if (!module || !Object.hasOwn(models, id) || !Object.hasOwn(levels, level)) {
    return { metrics, warnings: ["Módulo o nivel sin definición de cálculo."], notes };
  }
  const raw = inputs && typeof inputs === "object" ? { ...inputs } : {};
  for (const field of module.fields.filter(f => f.type === "select")) {
    if (isBlank(raw[field.key])) raw[field.key] = field.default;
  }
  const values = {};
  for (const field of activeFields(module, raw, level)) {
    const value = raw[field.key];
    if (isBlank(value)) continue;
    let valid;
    if (field.type === "select") {
      valid = field.options.some(([option]) => option === value);
      values[field.key] = valid ? value : "invalid";
    } else {
      const number = n(value);
      valid = Number.isFinite(number) &&
        (field.exclusiveMin ? number > field.min : number >= field.min) &&
        (field.max == null || (field.exclusiveMax ? number < field.max : number <= field.max)) &&
        (!field.integer || Number.isInteger(number));
      values[field.key] = valid ? number : NaN;
    }
    if (!valid) {
      const range = field.type === "select" ? "una opción del selector" :
        `${field.exclusiveMin ? ">" : "≥"} ${field.min}${field.max == null ? "" : ` y ${field.exclusiveMax ? "<" : "≤"} ${field.max}`}${field.integer ? ", entero" : ""}`;
      warnings.push(`${field.label}: introduce ${range}. Los resultados dependientes quedan pendientes.`);
    }
  }
  const push = (label, value, unit, formula = "", precision = 2) => {
    metrics.push({ label, value: Number.isFinite(value) ? value : null, unit, formula, precision });
    if (value === Infinity || value === -Infinity) warnings.push(`${label}: el resultado excede el rango numérico; revisa la escala de las entradas.`);
  };
  models[id](values, { push, warn: message => warnings.push(message), notes });
  return { metrics, warnings, notes };
}
