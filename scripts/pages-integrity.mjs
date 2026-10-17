import {readFileSync,readdirSync,lstatSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join,relative} from 'node:path';
import {execFileSync} from 'node:child_process';
export const repository='vittoriovenetto/CCIP-Calculadoras-Procesos-Plasticos';
export const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
export const readGitBlob=(cwd,ref,path)=>execFileSync('git',['show',ref+':'+path],{cwd,maxBuffer:128*1024*1024});
export function artifactFiles(root){
 const files={};
 function walk(dir){for(const name of readdirSync(dir).sort()){
  const path=join(dir,name),stat=lstatSync(path),key=relative(root,path).replaceAll('\\','/');
  if(stat.isSymbolicLink())throw Error('Symbolic links are not permitted in Pages: '+key);
  if(stat.isDirectory())walk(path);else if(key!=='artifact-integrity.json')files[key]=digest(readFileSync(path));
 }}walk(root);return files;
}
export function verifyArtifact(root,commit){
 const meta=JSON.parse(readFileSync(join(root,'deployment.json'),'utf8'));
 if(!/^[a-f0-9]{40}$/.test(commit)||meta.source_commit!==commit||meta.repository!==repository)throw Error('Artifact source/repository mismatch.');
 const files=artifactFiles(root);
 for(const path of Object.keys(files)){
  if(!['index.html','formulas.html','.nojekyll','deployment.json'].includes(path)&&!['src/','assets/','versions/','downloads/'].some(p=>path.startsWith(p)))throw Error('Unexpected artifact file: '+path);
  if(/(^|\/)(?:\.git|\.env(?:\.|$)|id_rsa|credentials)(\/|$)|\.(?:pem|key)$/i.test(path))throw Error('Sensitive artifact path: '+path);
  if(!path.endsWith('.zip')&&/(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)/.test(readFileSync(join(root,path),'utf8')))throw Error('Potential secret in artifact: '+path);
 }
 for(const page of ['index.html','formulas.html']){
  const html=readFileSync(join(root,page),'utf8');
  if(!html.includes(`./assets/${commit}/src/`)||html.includes('"./src/'))throw Error('Unversioned root page: '+page);
 }
 for(const [path,hash] of Object.entries(files).filter(([p])=>p.startsWith('src/'))){if(files[`assets/${commit}/${path}`]!==hash)throw Error('Versioned dependency mismatch: '+path);}
 const manifest={schema:'ccip-pages-integrity/1',source_commit:commit,files,tree_sha256:digest(JSON.stringify(files))};
 if(existsSync(join(root,'artifact-integrity.json'))){const prior=JSON.parse(readFileSync(join(root,'artifact-integrity.json'),'utf8'));if(JSON.stringify(prior)!==JSON.stringify(manifest))throw Error('Artifact integrity manifest differs.');}
 return manifest;
}
export function preservePublishedArchives(previous,artifact){
 for(const [path,hash] of Object.entries(previous))if(['versions/','downloads/','assets/'].some(p=>path.startsWith(p))&&artifact[path]!==hash)throw Error('Published historical file lost or modified: '+path);
}
export function validateReleaseGate(gate,sourceCommit,treeSha,previous){
 const required=['seven_processes','three_levels','material_integrity','machine_inventory','independent_numerics','no_unresolved_P0_P1','exact_commit_ci','real_exports','history_migration','bilingual','responsive','historical_integrity','reproducible_artifact','security','rollback','pages_configuration'];
 if(gate?.decision!=='GO'||gate.source_commit!==sourceCommit||gate.artifact_tree_sha256!==treeSha||gate.previous_gh_pages_commit!==previous||required.some(k=>gate.requirements?.[k]!==true))throw Error('Publication is NO-GO: missing, failed or mismatched release evidence.');
 if(gate.ci?.head_sha!==sourceCommit||gate.ci?.conclusion!=='success'||!Number.isSafeInteger(gate.ci?.run_id)||!['unit','browser'].every(n=>gate.ci.jobs?.some(j=>j.name===n&&j.conclusion==='success')))throw Error('Publication is NO-GO: exact-commit CI evidence required.');
 return true;
}
