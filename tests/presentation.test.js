import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { modules, activeFields } from '../src/schema.js';
import { fieldGroups, primaryLabels } from '../src/presentation.js';
import { calculate } from '../src/engine.js';
import { variants } from './fixtures.js';
const file = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
test('V1: archivos y ZIP conservados coinciden con la huella de la versión publicada', () => {
  const integrity = JSON.parse(file('versions/v1-integrity.json'));
  for (const [path, digest] of Object.entries(integrity.files)) assert.equal(sha(file('versions/v1/' + path)), digest, path);
  assert.equal(sha(file('downloads/CCIP-Web-V1.zip')), integrity.source_zip_sha256);
  assert.equal(file('downloads/CCIP-Web-V1.zip').subarray(0, 2).toString(), 'PK');
  assert.equal(JSON.parse(file('versions/v1/deployment.json')).material_library, '1.2.0');
});
for (const [id, values] of variants) for (const level of ['basic', 'technical', 'advanced']) {
  test(`${id} ${values.method || values.shape || ''} ${level}: grupos conservan todos los campos activos sin duplicarlos`, () => {
    const module = modules.find(m => m.id === id), active = activeFields(module, values, level), grouped = fieldGroups(id, active);
    const keys = grouped.flatMap(g => g.fields.map(f => f.key));
    assert.deepEqual(keys.slice().sort(), active.map(f => f.key).sort());
    assert.equal(new Set(keys).size, keys.length);
    const metrics = calculate(id, values, level).metrics;
    for (const label of primaryLabels[id]) assert.ok(metrics.some(m => m.label === label),label);
  });
}
