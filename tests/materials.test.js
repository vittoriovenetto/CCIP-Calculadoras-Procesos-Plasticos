import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { modules } from '../src/schema.js';
import { calculate } from '../src/engine.js';
import { validateLibrary, families, manufacturers, grades, createMaterialState, selectMaterial, applyMaterial, clearAutomatic, markManual, materialSnapshot, restoreMaterial, materialWarnings, safeSourceUrl } from '../src/materials.js';
import { readHistory } from '../src/history.js';
const data = validateLibrary(JSON.parse(readFileSync(new URL('../src/data/materials.v1.json', import.meta.url), 'utf8')));
const module = id => modules.find(m => m.id === id);
const valuesFor = id => Object.fromEntries(module(id).fields.map(f => [f.key, f.default ?? '']));
const selected = id => { const state = createMaterialState(); selectMaterial(data, state, {}, id); return state; };
const pa6 = 'basf-ultramid-b3s-r03', pc = 'covestro-makrolon-2405', abs = 'ineos-styrolution-terluran-gp-22';

test('catálogo: nueve identidades y nueve fuentes, campos ausentes null, sin alteración de adjunto', () => {
  assert.equal(data.materials.length, 9);
  assert.equal(Object.keys(data.sources).length, 9);
  for (const material of data.materials) {
    assert.ok(grades(data, material.family, material.manufacturer).some(m => m.id === material.id));
    assert.ok(manufacturers(data, material.family).includes(material.manufacturer));
    assert.ok(families(data).includes(material.family));
    assert.equal(material.properties.melt_density, null);
    assert.equal(material.properties.specific_heat, null);
    assert.ok(safeSourceUrl(data.sources[material.source_id].url));
  }
});
test('biblioteca rechaza fuente ausente, propiedades no finitas, rango inválido e IDs duplicados', () => {
  const corruptions = [d => d.materials.push(d.materials[0]), d => delete d.sources.S01,
    d => d.materials[0].properties.solid_density.value = Infinity,
    d => d.materials[0].properties.solid_density.range = [2, 1]];
  for (const corrupt of corruptions) { const d = structuredClone(data); corrupt(d); assert.throws(() => validateLibrary(d)); }
});
for (const grade of data.materials) {
  for (const id of ['extrusion', 'pelicula', 'soplado', 'termoformado']) {
    for (const level of ['basic', 'technical', 'advanced']) {
      test(`${grade.family} ${id} ${level}: fase sólida confirmada, respeta nivel y ausencia`, () => {
        const state = selected(grade.id), values = valuesFor(id), snapshot = structuredClone(data);
        applyMaterial(state, module(id), values, level);
        assert.equal(values.density, '');
        state.context.compatible = true;
        state.context.processConfirmed = true;
        applyMaterial(state, module(id), values, level);
        assert.equal(values.density, level !== 'basic' && grade.properties.solid_density ? grade.properties.solid_density.value : '');
        assert.deepEqual(data, snapshot);
        if (grade.properties.solid_density && level !== 'basic') assert.equal(state.provenance.density.unit, 'g/cm3');
      });
    }
  }
  test(`${grade.family}: inyección conserva masa pero no deriva densidad fundida; sin cp de secado`, () => {
    const state = selected(grade.id), values = valuesFor('inyeccion');
    state.context.compatible = true; state.context.processConfirmed = true;
    applyMaterial(state, module('inyeccion'), values, 'advanced');
    assert.equal(values.meltDensity, '');
    const metrics = calculate('inyeccion', values).metrics;
    assert.equal(metrics[1].value, 30);
    assert.equal(metrics[2].value, null);
    assert.equal(metrics[5].value, null);
    assert.ok(materialWarnings(state, 'inyeccion').some(w => w.includes('pVT')));
    const dry = valuesFor('secado'); state.context.dryingCompatible = true; state.context.bulkCompatible = true; state.context.physicalForm = grade.family === 'PVC' ? 'powder' : 'pellets';
    applyMaterial(state, module('secado'), dry, 'advanced');
    assert.equal(dry.specificHeat, '');
    assert.equal(calculate('secado', dry).metrics[2].value, null);
  });
}
test('PA6: confirma secador/formulación; precarga 0.7 kg/L, 4 h, 80 °C y no cp', () => {
  const state = selected(pa6), values = valuesFor('secado');
  applyMaterial(state, module('secado'), values, 'advanced');
  assert.equal(values.bulkDensity, ''); assert.equal(values.residence, ''); assert.equal(values.targetT, '');
  state.context.bulkCompatible = true; state.context.physicalForm = 'pellets'; state.context.dryingCompatible = true;
  applyMaterial(state, module('secado'), values, 'advanced');
  assert.deepEqual([values.bulkDensity, values.residence, values.targetT, values.specificHeat], [0.7, 4, 80, '']);
  const output = calculate('secado', values);
  assert.equal(output.metrics[0].value, 200);
  assert.ok(Math.abs(output.metrics[1].value - 200 / 0.7) < 1e-10);
});
test('PA6: secado básico solo aplica residencia; técnico también densidad, no temperatura oculta', () => {
  const state = selected(pa6), values = valuesFor('secado');
  state.context.bulkCompatible = true; state.context.physicalForm = 'pellets'; state.context.dryingCompatible = true;
  applyMaterial(state, module('secado'), values, 'basic');
  assert.deepEqual([values.bulkDensity, values.residence, values.targetT], ['', 4, '']);
  applyMaterial(state, module('secado'), values, 'technical');
  assert.deepEqual([values.bulkDensity, values.residence, values.targetT], [0.7, 4, '']);
});
for (const id of [pc, abs]) test(`${id}: rango explícito, no mínimo/promedio inferido; rechaza fuera de rango`, () => {
  const state = selected(id), values = valuesFor('secado'); state.context.dryingCompatible = true;
  applyMaterial(state, module('secado'), values, 'advanced');
  assert.equal(values.residence, '');
  for (const invalid of ['', 'texto', 0, 5]) {
    state.context.dryingTime = invalid; clearAutomatic(state, values);
    applyMaterial(state, module('secado'), values, 'advanced'); assert.equal(values.residence, '');
  }
  state.context.dryingTime = '2.5'; applyMaterial(state, module('secado'), values, 'advanced');
  assert.equal(values.residence, 2.5);
  assert.equal(state.provenance.residence.origin, 'range_selection');
  assert.ok(state.provenance.residence.selection_reason);
});
test('PVC: solo densidad aparente de polvo; no sólida, no secado; PET tiene condición pellets y vigencia', () => {
  const state = selected('westlake-westlake-pvc-1195'), values = valuesFor('secado');
  state.context.bulkCompatible = true; state.context.physicalForm = 'pellets'; applyMaterial(state, module('secado'), values, 'advanced'); assert.equal(values.bulkDensity, '');
  state.context.bulkCompatible = true; state.context.physicalForm = 'powder'; applyMaterial(state, module('secado'), values, 'advanced'); assert.equal(values.bulkDensity, 0.53);
  assert.equal(values.residence, ''); assert.equal(values.targetT, '');
  assert.ok(materialWarnings(state, 'secado').some(w => w.includes('polvo')));
  const pet = selected('indorama-ventures-polyclear-refresh-pet-1101');
  assert.ok(materialWarnings(pet, 'secado').some(w => w.includes('80 pellets/g')));
  assert.ok(materialWarnings(pet, 'secado').some(w => w.includes('2017')));
});
test('proceso no recomendado necesita confirmación; MFR/MVR/IV nunca se convierten a caudal, presión o viscosidad', () => {
  const state = selected(pa6), values = valuesFor('extrusion'); state.context.compatible = true;
  applyMaterial(state, module('extrusion'), values, 'advanced'); assert.equal(values.density, '');
  state.context.processConfirmed = true; applyMaterial(state, module('extrusion'), values, 'advanced'); assert.equal(values.density, 1.13);
  assert.equal(values.secEnergy, ''); assert.equal(values.holdUpKg, '');
  assert.equal(values.lineSpeed, 10);
});
test('unidades incompatibles no se aplican aunque el nombre coincida', () => {
  const state = selected(pa6), values = valuesFor('secado'); state.context.bulkCompatible = true; state.context.physicalForm = 'pellets';
  state.grade_snapshot.properties.bulk_density.unit = 'g/cm3';
  applyMaterial(state, module('secado'), values, 'advanced'); assert.equal(values.bulkDensity, '');
});
test('cambio de grado limpia valores automáticos; conserva override y referencia anterior, incluso borrado manual', () => {
  const state = selected(pa6), values = valuesFor('secado'); state.context.bulkCompatible = true; state.context.physicalForm = 'pellets'; state.context.dryingCompatible = true;
  applyMaterial(state, module('secado'), values, 'advanced');
  values.bulkDensity = 0.65; markManual(state, 'secado', 'bulkDensity', 0.65);
  const original = structuredClone(state.provenance.bulkDensity);
  selectMaterial(data, state, values, pc);
  assert.equal(values.bulkDensity, 0.65); assert.equal(values.residence, ''); assert.equal(values.targetT, '');
  assert.deepEqual(state.provenance.bulkDensity, original);
  state.context.bulkCompatible = true; state.context.physicalForm = 'pellets'; state.context.dryingCompatible = true; state.context.dryingTime = '2.5';
  applyMaterial(state, module('secado'), values, 'advanced'); assert.equal(values.bulkDensity, 0.65);
  assert.equal(state.provenance.bulkDensity.reference.value, 0.7); assert.equal(state.provenance.bulkDensity.grade_id, pa6);
  values.bulkDensity = ''; markManual(state, 'secado', 'bulkDensity', '');
  applyMaterial(state, module('secado'), values, 'advanced'); assert.equal(values.bulkDensity, '');
  selectMaterial(data, state, values, ''); assert.equal(state.grade_snapshot, null); assert.equal(values.residence, '');
});
test('entrada manual anterior a selección no se sobrescribe aunque sea cero o negativa', () => {
  for (const value of [0, -1, 0.6]) {
    const state = createMaterialState(), values = valuesFor('secado'); values.bulkDensity = value;
    markManual(state, 'secado', 'bulkDensity', value); selectMaterial(data, state, values, pa6);
    state.context.bulkCompatible = true; state.context.physicalForm = 'pellets'; applyMaterial(state, module('secado'), values, 'advanced'); assert.equal(values.bulkDensity, value);
  }
});
test('snapshot/historial retiene identidad, fuente, condiciones, rangos, valores usados y overrides', () => {
  const state = selected(pc), values = valuesFor('secado'); state.context.bulkCompatible = true; state.context.physicalForm = 'pellets'; state.context.dryingCompatible = true; state.context.dryingTime = '2.5';
  state.context.lot = 'Lote de prueba'; state.context.conditionsNote = 'Condiciones validadas para prueba';
  applyMaterial(state, module('secado'), values, 'advanced');
  values.targetT = 115; markManual(state, 'secado', 'targetT', 115);
  const snapshot = materialSnapshot(state, module('secado'), values, 'advanced');
  assert.equal(snapshot.grade_id, pc); assert.equal(snapshot.source_id, 'S09');
  assert.equal(snapshot.used_fields.targetT.reference.value, 120); assert.equal(snapshot.used_fields.targetT.value, 115);
  assert.equal(snapshot.used_fields.targetT.origin, 'user_override');
  assert.deepEqual(snapshot.used_fields.residence.reference.range, [2, 3]);
  assert.equal(snapshot.used_fields.bulkDensity.reference.method, 'ISO 60');
  assert.ok(snapshot.source.url); assert.ok(snapshot.used_fields.targetT.source.url);
  assert.equal(snapshot.grade_snapshot.properties.specific_heat, null);
  const record = { module: 'secado', level: 'advanced', date: '2026-10-13T12:00:00Z', inputs: values, material: snapshot };
  const restoredRecord = readHistory({ getItem() { return JSON.stringify([record]); } })[0];
  assert.deepEqual(restoredRecord.material, snapshot);
  const restored = restoreMaterial(restoredRecord.material);
  assert.deepEqual(materialSnapshot(restored, module('secado'), values, 'advanced'), snapshot);
  snapshot.grade_snapshot.properties.bulk_density.value = 99;
  assert.equal(state.grade_snapshot.properties.bulk_density.value, 0.66);
  const basic = materialSnapshot(state, module('secado'), values, 'basic');
  assert.deepEqual(Object.keys(basic.used_fields), ['residence']);
});
test('manual/sin ficha y registros anteriores funcionan; snapshot malformado y URL activa no se aceptan', () => {
  assert.equal(restoreMaterial(null).grade_snapshot, null);
  assert.equal(restoreMaterial({grade_snapshot:{properties:[]}}).grade_snapshot, null);
  assert.equal(restoreMaterial({grade_snapshot:{...data.materials[0],process_tags:[{}]}}).grade_snapshot, null);
  for (const url of ['javascript:alert(1)', 'data:text/html,<script>', 'http://example.com', 'no url']) assert.equal(safeSourceUrl(url), null);
  const state = createMaterialState(), values = valuesFor('inyeccion'); values.meltDensity = '0.8';
  markManual(state, 'inyeccion', 'meltDensity', '0.8');
  const snapshot = materialSnapshot(state, module('inyeccion'), values, 'technical');
  assert.equal(snapshot.grade_id, null); assert.equal(snapshot.used_fields.meltDensity.origin, 'manual');
  assert.equal(snapshot.used_fields.meltDensity.phase, 'fundido');
});

test('PET: confirmar solo pellets no basta; exige condición de densidad aparente', () => {
  const state = selected('indorama-ventures-polyclear-refresh-pet-1101'), values = valuesFor('secado');
  state.context.physicalForm = 'pellets';
  applyMaterial(state, module('secado'), values, 'technical');
  assert.equal(values.bulkDensity, '');
  state.context.bulkCompatible = true;
  applyMaterial(state, module('secado'), values, 'technical');
  assert.equal(values.bulkDensity, 0.9);
  assert.ok(state.provenance.bulkDensity.reference.condition.includes('80 pellets/g'));
});
test('override fuera del rango se advierte y conserva el valor manual', () => {
  const state = selected(pc), values = valuesFor('secado');
  state.context.dryingCompatible = true; state.context.dryingTime = '2.5';
  applyMaterial(state, module('secado'), values, 'advanced');
  values.residence = '5'; markManual(state, 'secado', 'residence', '5');
  assert.ok(materialWarnings(state, 'secado').some(w => w.includes('fuera del rango')));
  applyMaterial(state, module('secado'), values, 'advanced');
  assert.equal(values.residence, '5');
});
test('snapshot preserva un borrado manual y su referencia tras recuperación/cambio de nivel', () => {
  const state = selected(pa6), values = valuesFor('secado');
  state.context.bulkCompatible = true; state.context.physicalForm = 'pellets';
  applyMaterial(state, module('secado'), values, 'technical');
  values.bulkDensity = ''; markManual(state, 'secado', 'bulkDensity', '');
  const snapshot = materialSnapshot(state, module('secado'), values, 'technical');
  assert.equal(snapshot.used_fields.bulkDensity, undefined);
  assert.equal(snapshot.field_states.bulkDensity.origin, 'user_override');
  const restored = restoreMaterial(snapshot);
  applyMaterial(restored, module('secado'), values, 'advanced');
  assert.equal(values.bulkDensity, '');
  assert.equal(restored.provenance.bulkDensity.reference.value, 0.7);
});
