import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { versionPagesAssets } from './version-pages-assets.mjs';
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const site = join(root, 'dist');
const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
git(['diff', '--exit-code', 'HEAD', '--', 'index.html', 'formulas.html', '.nojekyll', 'src', 'versions', 'downloads']);
const owner = 'vittoriovenetto/CCIP-Calculadoras-Procesos-Plasticos';
if (existsSync(site)) {
  const marker = join(site, 'deployment.json');
  if (!existsSync(marker) || JSON.parse(readFileSync(marker, 'utf8')).repository !== owner) throw Error('dist no es un artefacto CCIP reconocido; no se elimina.');
  rmSync(site, { recursive: true });
}
mkdirSync(site);
for (const file of git(['ls-files', 'index.html', 'formulas.html', '.nojekyll', 'src', 'versions', 'downloads']).split('\n')) {
  const target = join(site, file);
  mkdirSync(dirname(target), { recursive: true });
  cpSync(join(root, file), target, { dereference: false });
}
const library = JSON.parse(readFileSync(join(site, 'src/data/materials.v1.3.json'), 'utf8'));
const sourceCommit = git(['rev-parse', 'HEAD']);
versionPagesAssets(site, sourceCommit);
writeFileSync(join(site, 'deployment.json'), JSON.stringify({ repository: owner, source_commit: sourceCommit, material_library: (library.catalog_revision || library.schema_version) }, null, 2) + '\n');
console.log('Artefacto listo: dist/; biblioteca', (library.catalog_revision || library.schema_version));
