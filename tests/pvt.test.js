import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateLibrary, createMaterialState, selectMaterial, applyMaterial, materialCandidates, materialSnapshot, restoreMaterial, materialWarnings } from '../src/materials.js';
import { validatePvt, validVisualization } from '../src/pvt.js';
import { renderAudit, renderManualData } from '../src/materials-audit-view.js';
import { modules } from '../src/schema.js';
import { calculate } from '../src/engine.js';
const read = file => JSON.parse(readFileSync(new URL(`../src/data/${file}`, import.meta.url)));
const previous = read('materials.v1.json'), audit = validateLibrary(read('materials.v1.1.json')), current = validateLibrary(read('materials.v1.2.json'));
const module = id => modules.find(m => m.id === id);
const setup = (data, id) => { const s = createMaterialState(); selectMaterial(data, s, {}, id); return s; };

test('V1.1 y V1.2 conservan nueve identidades y todas las propiedades originales, fuentes primarias y null', () => {
  for (const data of [audit, current]) {
    assert.equal(data.materials.length, 9); assert.equal(Object.keys(data.sources).length, 18);
    data.materials.forEach((m, i) => { assert.equal(m.id, previous.materials[i].id); assert.deepEqual(m.properties, previous.materials[i].properties); assert.equal(m.source_id, previous.materials[i].source_id); });
  }
  current.materials.forEach((m, i) => { const { pvt, ...rest } = m; assert.deepEqual(rest, audit.materials[i]); assert.equal(pvt.calculator_autofill_allowed, false); assert.equal(pvt.measured_or_calibrated_coefficients, null); });
});
for (const data of [audit, current]) for (const material of data.materials) {
  test(`${data.schema_version} ${material.family}: auditoría/referencias no se aplican como rho/Cp/secado ausente`, () => {
    const state = setup(data, material.id);
    Object.assign(state.context, { compatible: true, bulkCompatible: true, physicalForm: material.family === 'PVC' ? 'powder' : 'pellets', dryingCompatible: true, processConfirmed: true, dryingTime: '2.5' });
    for (const level of ['basic', 'technical', 'advanced']) {
      const injection = { method: 'mass', partMass: 30, cavities: 1, meltDensity: '' };
      applyMaterial(state, module('inyeccion'), injection, level);
      assert.equal(injection.meltDensity, '');
      const output = calculate('inyeccion', injection, level);
      assert.equal(output.metrics[1].value, 30); assert.equal(output.metrics[2].value, null);
      const drying = { specificHeat: '', residence: '', targetT: '' };
      applyMaterial(state, module('secado'), drying, level); assert.equal(drying.specificHeat, '');
      if (!material.properties.drying_time) assert.equal(drying.residence, '');
      if (!material.properties.drying_temperature) assert.equal(drying.targetT, '');
    }
  });
}
test('inventario: seis pendientes, PC/ABS exactos solo gráficos y PA6 de otro grado', () => {
  assert.equal(current.materials.filter(m => m.pvt.status === 'not_found_grade_specific_public').length, 6);
  assert.equal(current.materials.find(m => m.family === 'PA6').pvt.status, 'related_base_grade_chart_only');
  assert.equal(current.materials.find(m => m.family === 'PC').pvt.source_ref, 'PV01');
  assert.equal(current.materials.find(m => m.family === 'ABS').pvt.source_ref, 'PV02');
  assert.deepEqual(current.pvt_reference_sources.PV01.pressure_MPa, [0.1, 20, 40, 80, 120, 160, 200]);
  assert.deepEqual(current.pvt_reference_sources.PV03.pressure_MPa, [0.1]);
});
test('PC: Cp histórico agrupado se muestra, no se usa; J a kJ correcto y fuente histórica local', () => {
  const s = setup(current, current.materials.find(m => m.family === 'PC').id);
  const ref = s.grade_snapshot.reference_properties_not_for_autofill[0];
  assert.equal(ref.value, 1172 / 1000); assert.equal(ref.temperature_range, null); assert.equal(ref.phase, null);
  const view = renderAudit(s, 'advanced');
  assert.ok(view.includes('1.172')); assert.ok(view.includes('S10')); assert.ok(view.includes('histórico agrupado'));
  assert.ok(view.includes('120, 160, 200 MPa')); assert.ok(!view.includes('<svg'));
  assert.ok(materialWarnings(s, 'secado').some(w => w.includes('no autocompleta')));
});
test('PET: humedad recibida separada de objetivo/máximo de secado; secado de otro grado es referencia bloqueada', () => {
  const s = setup(current, current.materials.find(m => m.family === 'PET').id);
  assert.equal(s.grade_snapshot.incoming_product_moisture.value, 0.15);
  assert.equal(s.grade_snapshot.incoming_product_moisture.max, 0.3);
  assert.equal(s.grade_snapshot.properties.moisture_target, null); assert.equal(s.grade_snapshot.properties.moisture_max, null);
  const html = renderAudit(s, 'basic'); assert.ok(html.includes('producto recibido')); assert.ok(html.includes('S17')); assert.ok(html.includes('S11'));
  assert.ok(materialWarnings(s, 'secado').some(w => w.includes('0.15 %') && w.includes('no objetivo')));
});
test('ABS: 24 puntos exactos del adjunto y seis isobaras orientativas; nunca lookup/interpolación de rho', () => {
  const s = setup(current, current.materials.find(m => m.family === 'ABS').id), sample = s.references_snapshot.pvt_sample;
  assert.ok(validVisualization(sample)); assert.deepEqual(sample.T_C, [20, 100, 120, 270]);
  assert.deepEqual(sample.isobars[0].specific_volume_cm3_g, [0.96, 0.988, 0.999, 1.087]);
  assert.equal(sample.isobars.length * sample.T_C.length, 24);
  const html = renderAudit(s, 'advanced'); assert.equal((html.match(/<polyline /g) || []).length, 6); assert.equal((html.match(/<circle /g) || []).length, 24);
  assert.ok(html.includes('Digitalización orientativa')); assert.ok(html.includes('no son una interpolación validada'));
  s.context.compatible = true;
  s.grade_snapshot.properties.melt_density = { ...s.grade_snapshot.properties.solid_density, value: 0.93 };
  assert.deepEqual(materialCandidates(s, module('inyeccion'), {method:'mass'}, 'advanced'), []);
});
test('PA6: ficha B3S no es R03; gráfico de ABS nunca aparece en ese grado', () => {
  const s = setup(current, current.materials.find(m => m.family === 'PA6').id);
  const html = renderAudit(s, 'advanced'); assert.ok(html.includes('Referencia de B3S — no validada para R03')); assert.ok(!html.includes('<svg'));
  assert.equal(s.references_snapshot.pvt_sample, null);
});
test('control pVT rechaza desbloquear figuras, datos incompletos, grados sin fuente, NaN y unidades ajenas', () => {
  for (const alter of [d => d.materials[0].pvt.calculator_autofill_allowed = true,
    d => d.materials[0].pvt.measured_or_calibrated_coefficients = {},
    d => d.materials[6].pvt.source_ref = 'PV99',
    d => d.pvt_visualization_samples['terluran-gp22'].isobars[0].specific_volume_cm3_g.pop(),
    d => d.pvt_visualization_samples['terluran-gp22'].eligible_for_melt_density_autofill = true,
    d => d.pvt_visualization_samples['terluran-gp22'].pressure_unit = 'bar']) {
    const copy = structuredClone(current); alter(copy); assert.throws(() => validatePvt(copy));
  }
  assert.equal(validVisualization({ ...current.pvt_visualization_samples['terluran-gp22'], isobars: [null] }), false);
});
test('snapshot conserva la curva orientativa, fuentes, auditoría y condiciones manuales sin cambiar el catálogo', () => {
  const s = setup(current, current.materials.find(m => m.family === 'ABS').id);
  Object.assign(s.context, { pvtTemperatureC: '230', pvtPressureMPa: '40', meltDensitySource: 'Medición documentada; revisión de prueba' });
  const values = {method:'mass',partMass:30,cavities:1,meltDensity:'0.9'};
  const snapshot = materialSnapshot(s, module('inyeccion'), values, 'advanced');
  assert.equal(snapshot.dataset.version, '1.2.0'); assert.equal(snapshot.references_snapshot.pvt_sample.eligible_for_melt_density_autofill, false);
  assert.equal(snapshot.grade_snapshot.pvt.calculator_autofill_allowed, false);
  const restored = restoreMaterial(snapshot); assert.deepEqual(materialSnapshot(restored,module('inyeccion'),values,'advanced'), snapshot);
  assert.ok(!materialWarnings(s,'inyeccion',values,'advanced').some(w => w.includes('sin trazabilidad')));
  snapshot.references_snapshot.pvt_sample.T_C[0] = 99;
  assert.equal(s.references_snapshot.pvt_sample.T_C[0], 20);
});
test('manual pVT/Cp: evidencia faltante, T/P inválidas e intervalo Cp extrapolado se advierten, sin rellenar propiedades', () => {
  const s = createMaterialState();
  assert.ok(materialWarnings(s,'inyeccion',{meltDensity:0.9},'technical').some(w => w.includes('sin trazabilidad')));
  Object.assign(s.context, {pvtTemperatureC:'230',pvtPressureMPa:'-1',meltDensitySource:'Ensayo'});
  assert.ok(materialWarnings(s,'inyeccion',{meltDensity:0.9},'advanced').length);
  s.context.pvtPressureMPa = '40'; assert.deepEqual(materialWarnings(s,'inyeccion',{meltDensity:0.9},'advanced'), []);
  assert.ok(materialWarnings(s,'secado',{specificHeat:2},'advanced').some(w => w.includes('Cp manual')));
  Object.assign(s.context, {cpMinC:'20',cpMaxC:'80',cpPhase:'solid',specificHeatSource:'Ensayo DSC en intervalo'});
  assert.ok(materialWarnings(s,'secado',{specificHeat:2,startT:20,targetT:100},'advanced').some(w => w.includes('fuera del intervalo')));
  assert.deepEqual(materialWarnings(s,'secado',{specificHeat:2,startT:20,targetT:80},'advanced'), []);
  assert.equal(renderManualData(s,'inyeccion','technical'), '');
  assert.ok(renderManualData(s,'inyeccion','advanced').includes('pvtPressureMPa'));
});
test('Cp manual de fundido se advierte como incompatible con secado de sólidos', () => {
  const s = createMaterialState();
  Object.assign(s.context, {cpMinC:'20',cpMaxC:'80',cpPhase:'melt',specificHeatSource:'Documento de prueba'});
  assert.ok(materialWarnings(s,'secado',{specificHeat:2,startT:20,targetT:80},'advanced').some(w => w.includes('no corresponde')));
});
