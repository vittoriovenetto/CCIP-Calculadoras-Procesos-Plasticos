import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { versionPagesAssets } from '../scripts/version-pages-assets.mjs';

test('Pages aísla módulos, estilos y catálogo del caché de versiones anteriores', () => {
  const site = mkdtempSync(join(tmpdir(), 'ccip-assets-test-'));
  try {
    mkdirSync(join(site, 'src/data'), { recursive: true });
    mkdirSync(join(site, 'versions/v1'), { recursive: true });
    const app = "import './materials.js'; fetch(new URL('./data/materials.json', import.meta.url));";
    const fixture = { 'src/app.js': app, 'src/materials.js': 'export const ready = true;', 'src/styles.css': '.bar{display:flex}', 'src/data/materials.json': '{"materials":[]}' };
    for (const [name, content] of Object.entries(fixture)) writeFileSync(join(site, name), content);
    const html = '<link href="./src/styles.css?v=old"><script type="module" src="./src/app.js?v=old"></script>';
    for (const name of ['index.html', 'formulas.html', 'versions/v1/index.html']) writeFileSync(join(site, name), html);
    const first = 'a'.repeat(40), second = 'b'.repeat(40);
    versionPagesAssets(site, first);
    for (const name of ['index.html', 'formulas.html']) {
      const output = readFileSync(join(site, name), 'utf8');
      assert.ok(output.includes(`./assets/${first}/src/styles.css`));
      assert.ok(output.includes(`./assets/${first}/src/app.js`));
      assert.ok(!output.includes('"./src/'));
    }
    for (const [name, content] of Object.entries(fixture)) assert.equal(readFileSync(join(site, 'assets', first, name), 'utf8'), content);
    assert.equal(readFileSync(join(site, 'versions/v1/index.html'), 'utf8'), html);
    for (const name of ['index.html', 'formulas.html']) writeFileSync(join(site, name), html);
    versionPagesAssets(site, second);
    assert.ok(readFileSync(join(site, 'index.html'), 'utf8').includes(`./assets/${second}/src/app.js`));
    assert.equal(readFileSync(join(site, 'assets', first, 'src/app.js'), 'utf8'), app);
    assert.throws(() => versionPagesAssets(site, '../invalid'), /inválido/);
  } finally { rmSync(site, { recursive: true, force: true }); }
});
