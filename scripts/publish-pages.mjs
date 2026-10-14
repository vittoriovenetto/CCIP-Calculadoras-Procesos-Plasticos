import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
const root = dirname(dirname(fileURLToPath(import.meta.url))), site = join(root, 'dist');
const metadata = JSON.parse(readFileSync(join(site, 'deployment.json'), 'utf8'));
const git = (args, options = {}) => execFileSync('git', args, { cwd: root, encoding: 'utf8', ...options }).trim();
if (metadata.source_commit !== git(['rev-parse', 'HEAD'])) throw Error('El artefacto no corresponde a HEAD; ejecuta npm run build:pages.');
git(['diff', '--exit-code', 'HEAD', '--', 'index.html', '.nojekyll', 'src']);
const temp = mkdtempSync(join(tmpdir(), 'ccip-pages-index-'));
try {
  const env = { ...process.env, GIT_INDEX_FILE: join(temp, 'index') };
  git(['read-tree', '--empty'], { env });
  git(['--work-tree=' + site, 'add', '--all'], { env });
  const tree = git(['write-tree'], { env });
  const remote = git(['ls-remote', 'origin', 'refs/heads/gh-pages']);
  const parents = [];
  if (remote) {
    git(['fetch', 'origin', 'refs/heads/gh-pages']);
    parents.push('-p', git(['rev-parse', 'FETCH_HEAD']));
  }
  const commit = git(['commit-tree', tree, ...parents, '-m', `Deploy CCIP ${metadata.source_commit}`]);
  // Un push normal conserva historia y falla si otra publicación avanzó en paralelo.
  console.log(git(['push', 'origin', `${commit}:refs/heads/gh-pages`]));
  console.log('Artefacto subido a gh-pages:', commit);
  console.log('La publicación requiere Pages configurado para gh-pages / (root).');
} finally {
  rmSync(temp, { recursive: true, force: true });
}
