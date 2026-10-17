import { cpSync, readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import {artifactFiles,digest} from './pages-integrity.mjs';

// Cached older HTML must still be able to lazy-load its immutable dependencies.
// Read only tracked archives already copied to dist; never use a moving remote.
export function preserveArchivedAssets(site){
 const versions=join(site,'versions');if(!existsSync(versions))return;
 for(const version of readdirSync(versions,{withFileTypes:true}).filter(x=>x.isDirectory())){
  const source=join(versions,version.name,'assets');if(!existsSync(source))continue;
  for(const [path,hash] of Object.entries(artifactFiles(source))){
   if(!/^[a-f0-9]{40}\/src\//.test(path))throw Error('Invalid archived asset path: '+path);
   const target=join(site,'assets',path);
   if(existsSync(target)){if(digest(readFileSync(target))!==hash)throw Error('Immutable asset collision: '+path);}
   else {mkdirSync(dirname(target),{recursive:true});cpSync(join(source,path),target);}
  }
 }
}

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
