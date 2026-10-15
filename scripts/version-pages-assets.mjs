import { cpSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Cada HTML publicado carga un árbol completo e inmutable de módulos, CSS y
// catálogo. Cambiar solo la URL de app.js deja sus imports en la caché anterior.
export function versionPagesAssets(site, commit) {
  if (!/^[a-f0-9]{40}$/.test(commit)) throw Error('Commit de publicación inválido.');
  const prefix = `./assets/${commit}/src/`;
  cpSync(join(site, 'src'), join(site, 'assets', commit, 'src'), { recursive: true });
  for (const name of ['index.html', 'formulas.html']) {
    const path = join(site, name);
    writeFileSync(path, readFileSync(path, 'utf8').replaceAll('./src/', prefix));
  }
}
