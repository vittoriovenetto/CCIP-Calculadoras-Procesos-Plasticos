import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import {createHash} from 'node:crypto';
import {verifyArtifact,preservePublishedArchives,validateReleaseGate,readGitBlob} from './pages-integrity.mjs';
const root = dirname(dirname(fileURLToPath(import.meta.url))), site = join(root, 'dist');
const metadata = JSON.parse(readFileSync(join(site, 'deployment.json'), 'utf8'));
const git = (args, options = {}) => execFileSync('git', args, { cwd: root, encoding: 'utf8', ...options }).trim();
const expected=process.env.CCIP_EXPECTED_GH_PAGES_SHA;
if(!/^[a-f0-9]{40}$/.test(expected||''))throw Error('Define CCIP_EXPECTED_GH_PAGES_SHA con el commit respaldado antes de publicar.');
if (metadata.source_commit !== git(['rev-parse', 'HEAD'])) throw Error('El artefacto no corresponde a HEAD; ejecuta npm run build:pages.');
const artifact=verifyArtifact(site,metadata.source_commit);
if(!process.env.CCIP_RELEASE_GO_FILE)throw Error('Publication is NO-GO: define CCIP_RELEASE_GO_FILE with the completed technical release report.');
validateReleaseGate(JSON.parse(readFileSync(process.env.CCIP_RELEASE_GO_FILE,'utf8')),metadata.source_commit,artifact.tree_sha256,expected);
git(['diff', '--exit-code', 'HEAD', '--', 'index.html', 'formulas.html', '.nojekyll', 'src', 'versions', 'downloads']);
const temp = mkdtempSync(join(tmpdir(), 'ccip-pages-index-'));
try {
  const env = { ...process.env, GIT_INDEX_FILE: join(temp, 'index') };
  git(['read-tree', '--empty'], { env });
  git(['--work-tree=' + site, 'add', '--all'], { env });
  const tree = git(['write-tree'], { env });
  const remote = git(['ls-remote', 'origin', 'refs/heads/gh-pages']);
  if(remote.split(/\s+/)[0]!==expected)throw Error('gh-pages avanzó respecto al respaldo; detener y revisar.');
  const parents = [];
  if (remote) {
    git(['fetch', 'origin', 'refs/heads/gh-pages']);
    const parent=git(['rev-parse', 'FETCH_HEAD']);
    if(parent!==expected)throw Error('gh-pages cambió durante la preparación.');
    const historical={};
    for(const path of git(['ls-tree','-r','--name-only',parent,'--','versions/','downloads/','assets/']).split('\n').filter(Boolean)){
      historical[path]=createHash('sha256').update(readGitBlob(root,parent,path)).digest('hex');
    }
    preservePublishedArchives(historical,artifact.files);
    parents.push('-p',parent);
  }
  const commit = git(['commit-tree', tree, ...parents, '-m', `Deploy CCIP ${metadata.source_commit}`]);
  // Un push normal conserva historia y falla si otra publicación avanzó en paralelo.
  console.log(git(['push', 'origin', `${commit}:refs/heads/gh-pages`]));
  console.log('Artefacto subido a gh-pages:', commit);
  console.log('La publicación requiere Pages configurado para gh-pages / (root).');
} finally {
  rmSync(temp, { recursive: true, force: true });
}
