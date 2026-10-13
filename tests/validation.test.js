import test from 'node:test';
import assert from 'node:assert/strict';
import { calculate, n } from '../src/engine.js';
import { modules, activeFields } from '../src/schema.js';
import { fixtures, variants } from './fixtures.js';

const value = (id, inputs, label, level = 'advanced') => calculate(id, inputs, level).metrics.find(m => m.label === label)?.value;
const close = (actual, expected) => {
  assert.equal(typeof actual, 'number');
  assert.ok(Math.abs(actual - expected) <= 1e-10 * Math.max(1, Math.abs(expected)), `${actual} ≠ ${expected}`);
};
const refs = {
  inyeccion: [65, 71.5, 89.375, 40 * Math.PI, 223.4375 / Math.PI, 893.75 / Math.PI, 400 - 893.75 / Math.PI, 500000 / 9806.65, 600000 / 9806.65, 0.89375, 12.87],
  extrusion: [500, 460, 276, 345, 69, 40 / 23],
  pelicula: [1000 / Math.PI, 50, 49.68, 5 / Math.PI, 4 * Math.PI],
  soplado: [320 * Math.PI, 19200 * Math.PI, 19.2 * Math.PI, 4, 1.92 * Math.PI],
  termoformado: [120000, 120, 1 / 3, 180, 360, 21.6],
  secado: [150, 300, 5 / 3],
  costos: [216, 7.2, 14.4, 1, 18.4, 23 / 270]
};
for (const [id, inputs] of Object.entries(fixtures)) {
  test(`${id}: todas las salidas contra referencia dimensional independiente`, () => {
    const output = calculate(id, inputs);
    assert.equal(output.metrics.length, refs[id].length);
    output.metrics.forEach((metric, index) => close(metric.value, refs[id][index]));
    assert.deepEqual(output.warnings, []);
    assert.ok(output.notes.length > 0);
  });
}

test('inyección volumétrica: reserva, masa y carrera', () => {
  const inputs = { ...fixtures.inyeccion, method: 'volume' };
  close(value('inyeccion', inputs, 'Shot calculado (volumen)'), 82.5);
  close(value('inyeccion', inputs, 'Shot calculado (masa)'), 66);
  close(value('inyeccion', inputs, 'Carrera calculada del husillo'), 825 / Math.PI);
});
test('extrusión tubular: anillo y conversión de mm² a g/m y kg/h', () => {
  const output = calculate('extrusion', { ...fixtures.extrusion, shape: 'tube' });
  [75 * Math.PI, 69 * Math.PI, 41.4 * Math.PI, 51.75 * Math.PI, 10.35 * Math.PI, 600 / (51.75 * Math.PI)].forEach((expected, i) => close(output.metrics[i].value, expected));
});

for (const [id, inputs] of variants) {
  const module = modules.find(m => m.id === id);
  const variant = inputs.method || inputs.shape || '';
  for (const level of ['basic', 'technical', 'advanced']) {
    test(`${id} ${variant}: nivel ${level} ignora campos ocultos sin perder resultados disponibles`, () => {
      const snapshot = structuredClone(inputs);
      const visible = Object.fromEntries(activeFields(module, inputs, level).map(f => [f.key, inputs[f.key]]));
      const output = calculate(id, inputs, level);
      assert.deepEqual(output, calculate(id, visible));
      assert.ok(output.metrics.some(m => m.value !== null));
      assert.ok(output.metrics.every(m => m.value === null || Number.isFinite(m.value)));
      const densityWarning = id === 'inyeccion' && inputs.method === 'mass' && level === 'basic';
      assert.equal(output.warnings.length, densityWarning ? 1 : 0);
      const available = {
        inyeccion: level === 'basic' ? (inputs.method === 'mass' ? [0, 1] : [2]) : level === 'technical' ? [0, 1, 2, 3, 4, 5, 6] : refs[id].map((_, i) => i),
        extrusion: level === 'basic' ? [0] : level === 'technical' ? [0, 1, 2, 3] : [0, 1, 2, 3, 4, 5],
        pelicula: level === 'basic' ? [0, 1] : level === 'technical' ? [0, 1, 2, 3] : [0, 1, 2, 3, 4],
        soplado: level === 'basic' ? [0, 1] : level === 'technical' ? [0, 1, 2] : [0, 1, 2, 3, 4],
        termoformado: level === 'basic' ? [0, 3] : level === 'technical' ? [0, 1, 3, 4, 5] : [0, 1, 2, 3, 4, 5],
        secado: level === 'basic' ? [0] : level === 'technical' ? [0, 1] : [0, 1, 2],
        costos: level === 'basic' ? [0, 1] : level === 'technical' ? [0, 1, 2] : [0, 1, 2, 3, 4, 5]
      }[id];
      output.metrics.forEach((m, i) => assert.equal(m.value !== null, available.includes(i), m.label));
      assert.deepEqual(inputs, snapshot);
    });
  }
  for (const field of activeFields(module, inputs).filter(f => f.type !== 'select')) {
    test(`${id} ${variant}: valida dominio de ${field.key}`, () => {
      const invalid = field.min - 1;
      assert.ok(calculate(id, { ...inputs, [field.key]: invalid }).warnings.some(w => w.startsWith(field.label + ':')));
      for (const blank of ['', '   ', null, undefined]) {
        const output = calculate(id, { ...inputs, [field.key]: blank });
        assert.ok(output.metrics.every(m => m.value === null || Number.isFinite(m.value)));
        assert.ok(!output.warnings.some(w => w.startsWith(field.label + ':')), 'vacío significa pendiente, no inválido');
      }
      for (const bad of ['texto', true, [], {}, Infinity, -Infinity]) {
        assert.ok(calculate(id, { ...inputs, [field.key]: bad }).warnings.some(w => w.startsWith(field.label + ':')));
      }
      const zeroOutput = calculate(id, { ...inputs, [field.key]: 0 });
      const zeroInvalid = field.min > 0 || (field.min === 0 && field.exclusiveMin);
      assert.equal(zeroOutput.warnings.some(w => w.startsWith(field.label + ':')), zeroInvalid);
      if (field.integer) assert.ok(calculate(id, { ...inputs, [field.key]: 1.5 }).warnings.some(w => w.startsWith(field.label + ':')));
      if (field.max != null) assert.ok(calculate(id, { ...inputs, [field.key]: field.max + 1 }).warnings.some(w => w.startsWith(field.label + ':')));
    });
  }
}

test('entradas vacías: ninguna calculadora inventa propiedades o resultados', () => {
  for (const module of modules) {
    const defaults = module.fields.filter(f => f.default != null && ['density', 'meltDensity', 'bulkDensity', 'specificHeat', 'residence', 'clampFactor'].includes(f.key));
    assert.deepEqual(defaults, []);
    for (const blank of ['', '  ', null, undefined]) {
      const inputs = Object.fromEntries(module.fields.filter(f => f.type !== 'select').map(f => [f.key, blank]));
      assert.ok(calculate(module.id, inputs).metrics.every(m => m.value === null));
    }
  }
});
test('conversión numérica no interpreta booleanos ni listas como cantidades', () => {
  for (const x of ['', '  ', null, undefined, false, true, [], [1], {}, Infinity, 'Infinity', '1,2']) assert.ok(Number.isNaN(n(x)));
  assert.equal(n(' 0 '), 0);
  assert.equal(n('1e-3'), 0.001);
});
test('API: módulo/nivel desconocido y entradas nulas no lanzan excepción', () => {
  for (const id of ['desconocido', '__proto__', 'toString']) assert.equal(calculate(id).metrics.length, 0);
  assert.equal(calculate('secado', null).metrics[0].value, null);
  assert.equal(calculate('secado', {}, 'toString').metrics.length, 0);
});
test('inyección volumétrica requiere cavidades positivas y enteras', () => {
  for (const cavities of ['', 0, -1, 1.5]) {
    const out = calculate('inyeccion', { ...fixtures.inyeccion, method: 'volume', cavities });
    assert.ok(out.metrics.slice(0, 3).every(m => m.value === null));
  }
});
test('sin densidad del fundido: volumen informado disponible, masa pendiente', () => {
  const inputs = { ...fixtures.inyeccion, method: 'volume', meltDensity: '' };
  assert.equal(value('inyeccion', inputs, 'Shot calculado (masa)'), null);
  close(value('inyeccion', inputs, 'Shot calculado (volumen)'), 82.5);
});
test('no se inventa factor de cierre y se advierte falta de carrera/colchón', () => {
  const out = calculate('inyeccion', { ...fixtures.inyeccion, screwMaxStroke: 280, clampFactor: '' });
  assert.equal(out.metrics.find(m => m.label === 'Fuerza de cierre con factor').value, null);
  assert.equal(out.warnings.length, 2);
});
test('tubo admite diámetro interior cero y rechaza geometrías invertidas', () => {
  close(value('extrusion', { ...fixtures.extrusion, shape: 'tube', innerD: 0 }, 'Área transversal'), 100 * Math.PI);
  for (const innerD of [20, 21]) {
    const out = calculate('extrusion', { ...fixtures.extrusion, shape: 'tube', innerD });
    assert.ok(out.metrics.every(m => m.value === null));
    assert.ok(out.warnings.some(w => w.includes('menor')));
  }
});
test('extrusión sin caudal: cero producción/potencia y residencia indefinida', () => {
  const out = calculate('extrusion', { ...fixtures.extrusion, lineSpeed: 0 });
  assert.deepEqual(out.metrics.slice(2).map(m => m.value), [0, 0, 0, null]);
  assert.equal(value('extrusion', { ...fixtures.extrusion, lossPct: 100 }, 'Alimentación con pérdida indicada'), null);
});
test('película parada produce cero; BUR menor que uno se advierte', () => {
  close(value('pelicula', { ...fixtures.pelicula, lineSpeed: 0 }, 'Producción ideal'), 0);
  assert.ok(calculate('pelicula', { ...fixtures.pelicula, dieDiameter: 1000 }).warnings.some(w => w.includes('BUR')));
});
test('soplado rechaza paredes imposibles y permite productividad cero', () => {
  assert.equal(value('soplado', { ...fixtures.soplado, wall: 40 }, 'Masa de pared ideal'), null);
  assert.ok(calculate('soplado', { ...fixtures.soplado, wall: 5 }).warnings.some(w => w.includes('gruesa')));
  close(value('soplado', { ...fixtures.soplado, unitsHour: 0 }, 'Material para producción nominal'), 0);
});
test('termoformado sin cavidades no infiere piezas; ratio de áreas menor a uno inválido', () => {
  assert.equal(value('termoformado', { ...fixtures.termoformado, cavities: '' }, 'Piezas teóricas por hora'), null);
  assert.equal(value('termoformado', { ...fixtures.termoformado, drawAreaRatio: 0.5 }, 'Espesor medio geométrico ideal'), null);
});
test('secado admite °C negativos/cero, ΔT nulo y caudal cero', () => {
  close(value('secado', { ...fixtures.secado, startT: -20, targetT: 0 }, 'Potencia térmica sensible mínima'), 5 / 9);
  close(value('secado', { ...fixtures.secado, startT: 0, targetT: 0 }, 'Potencia térmica sensible mínima'), 0);
  assert.deepEqual(calculate('secado', { ...fixtures.secado, throughput: 0 }).metrics.map(m => m.value), [0, 0, 0]);
  const cooling = calculate('secado', { ...fixtures.secado, startT: 80, targetT: 20 });
  assert.equal(cooling.metrics[2].value, null);
  assert.ok(cooling.warnings.some(w => w.includes('menor')));
  assert.equal(value('secado', { ...fixtures.secado, targetT: -273.15 }, 'Potencia térmica sensible mínima'), null);
});
test('costos admite tarifas cero; sin datos no supone operación gratuita; rechazo total no divide por cero', () => {
  const inputs = { ...fixtures.costos, resinCost: 0, powerKw: 0, energyCost: 0, laborHour: 0 };
  close(value('costos', inputs, 'Costo directo parcial por pieza buena'), 0);
  assert.equal(value('costos', { ...inputs, laborHour: '' }, 'Costo horario directo parcial'), null);
  const allScrap = calculate('costos', { ...fixtures.costos, scrapPct: 100 });
  close(allScrap.metrics[0].value, 0);
  assert.equal(allScrap.metrics.at(-1).value, null);
  assert.ok(allScrap.warnings.some(w => w.includes('100 %')));
});
test('límites numéricos: no exporta Infinity/NaN como resultados válidos', () => {
  const out = calculate('termoformado', { ...fixtures.termoformado, blankW: 1e308, blankL: 1e308 });
  assert.equal(out.metrics[0].value, null);
  assert.ok(out.warnings.some(w => w.includes('rango numérico')));
});
