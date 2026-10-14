import test from 'node:test';
import assert from 'node:assert/strict';
import { readHistory, storageKey } from '../src/history.js';
const record = { module: 'secado', level: 'advanced', date: '2026-10-13T10:00:00.000Z', inputs: { throughput: 50, startT: '-20' } };
const storage = data => ({ getItem(key) { assert.equal(key, storageKey); return JSON.stringify(data); } });
test('historial valida estructura, módulo, nivel, fecha y cantidades', () => {
  const bad = [null, 1, {}, { ...record, module: '__proto__' }, { ...record, level: 'toString' }, { ...record, date: 'no fecha' }, { ...record, inputs: [] }];
  const good = { ...record, inputs: { ...record.inputs, targetT: '<script>', arbitrary: 'no', bulkDensity: false, specificHeat: [] } };
  assert.deepEqual(readHistory(storage([...bad, good])), [{ ...record, inputs: { ...record.inputs, targetT: '<script>' } }]);
});
test('historial corrupto o almacenamiento bloqueado permite iniciar', () => {
  assert.deepEqual(readHistory({ getItem() { throw Error('denegado'); } }), []);
  assert.deepEqual(readHistory({ getItem() { return '{'; } }), []);
  assert.deepEqual(readHistory(storage({})), []);
});
test('historial conserva entradas válidas de versiones previas y límite de 60', () => {
  const items = Array.from({ length: 70 }, () => record);
  assert.equal(readHistory(storage(items)).length, 60);
  assert.deepEqual(readHistory(storage([record])), [record]);
});

test('historial conserva fórmulas/resultados guardados al leer registros anteriores', () => {
  const item = { ...record, metrics: [{ label: 'Masa', value: 150, unit: 'kg', formula: 'Q × t', precision: 2 }], warnings: [], notes: ['Nominal'] };
  assert.deepEqual(readHistory(storage([item])), [item]);
});
