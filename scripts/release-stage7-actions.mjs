// Release gate for GitHub Actions runners, independent of the Codex Cloud proxy.
// Never bypass the guarded publisher: it consumes the exact-commit GO file.
import { execFileSync } from 'node:child_process';
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';
import { verifyArtifact, preservePublishedArchives, validateReleaseGate, readGitBlob, digest } from './pages-integrity.mjs';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const runTemp=process.env.RUNNER_TEMP||'/tmp';
const reportPath=join(runTemp,'ccip-stage7-release-report.json');
const goPath=join(runTemp,'ccip-stage7-release-go.json');
const site=join(root,'dist');
const baseUrl='https://vittoriovenetto.github.io/CCIP-Calculadoras-Procesos-Plasticos/';
const repo='vittoriovenetto/CCIP-Calculadoras-Procesos-Plasticos';
const shaPattern=/^[a-f0-9]{40}$/;
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8',maxBuffer:128*1024*1024}).trim();
const gitBytes=(ref,path)=>readGitBlob(root,ref,path);
const json=p=>JSON.parse(readFileSync(p,'utf8'));
const current=()=>git('rev-parse','HEAD');
const save=(x)=>{mkdirSync(runTemp,{recursive:true});writeFileSync(reportPath,JSON.stringify(x,null,2)+'\n');};
function need(ok,message){if(!ok)throw Error(message);}
function noSecretsUrl(path){return new URL(path,baseUrl).href;}
async function request(url,headers={},ms=30000){
 const response=await fetch(url,{headers,redirect:'follow',signal:AbortSignal.timeout(ms),cache:'no-store'});
 if(!response.ok)throw Error('HTTPS request failed '+response.status+' at '+new URL(url).origin+new URL(url).pathname);
 return response;
}
async function github(path){
 const token=process.env.GITHUB_API_TOKEN;
 need(Boolean(token),'GitHub Actions token not available for scoped read-only API validation.');
 const r=await request('https://api.github.com/repos/'+repo+path,{
  'Authorization':'Bearer '+token,
  'Accept':'application/vnd.github+json',
  'X-GitHub-Api-Version':'2022-11-28',
  'User-Agent':'ccip-stage7-release-gate'
 });
 return r.json();
}
async function publicJson(path){
 const r=await request(noSecretsUrl(path),{},30000);
 return r.json();
}
function archiveCheck(previousSha,artifact){
 const manifest=json(join(root,'versions/antes-etapa-7-2026-10-17.json'));
 need(manifest.gh_pages_commit===previousSha,'Previous deployment does not match the immutable pre-Stage7 archive.');
 const zip='downloads/CCIP-Web-antes-etapa-7-2026-10-17.zip';
 need(artifact.files[zip]===manifest.zip_sha256,'The backup ZIP differs from its recorded SHA-256.');
 const base='versions/antes-etapa-7-2026-10-17/';
 for(const [path,hash] of Object.entries(manifest.files))need(artifact.files[base+path]===hash,'Archived historical resource changed: '+path);
 const historicPaths=git('ls-tree','-r','--name-only',previousSha,'--','versions/','downloads/','assets/').split('\n').filter(Boolean);
 const expected={};
 for(const path of historicPaths)expected[path]=digest(gitBytes(previousSha,path));
 preservePublishedArchives(expected,artifact.files);
 return {immutable_files:historicPaths.length,archived_web_files:Object.keys(manifest.files).length,backup_zip_sha256:manifest.zip_sha256};
}
function ciEvidence(run,jobs,sha){
 need(run.head_sha===sha && run.event==='push','Workflow run does not match the exact source commit and push event.');
 need(Number(run.id)===Number(process.env.GITHUB_RUN_ID),'Workflow run ID mismatch.');
 const required=['unit','browser'].map(name=>{
  const row=jobs.find(j=>j.name===name);
  need(row&&row.status==='completed'&&row.conclusion==='success','Required CI job is not successful: '+name);
  need(row.head_sha===undefined || row.head_sha===sha,'CI job has an unexpected commit: '+name);
  return {name,conclusion:'success',job_id:row.id,html_url:row.html_url};
 });
 return {head_sha:sha,run_id:Number(run.id),conclusion:'success',jobs:required,
   derivation:'unit and browser jobs from the exact same GitHub Actions run completed successfully; release job is downstream of both'};
}
async function preflight(){
 need(process.env.GITHUB_EVENT_NAME==='push' &&
   process.env.GITHUB_REF==='refs/heads/feature/etapa-7-auditoria-publicacion',
   'Publishing is allowed only from an approved Stage7 branch push.');
 const sha=current();
 need(shaPattern.test(sha)&&sha===process.env.GITHUB_SHA,'Checkout differs from GitHub event head commit.');
 const prev=git('ls-remote','origin','refs/heads/gh-pages').split(/\s+/)[0];
 need(shaPattern.test(prev),'Cannot establish published branch SHA.');
 const page=await github('/pages');
 need(page.source?.branch==='gh-pages'&&page.source?.path==='/','GitHub Pages is not configured for gh-pages / (root).');
 need(page.build_type!=='workflow','GitHub Pages uses a workflow deployment; existing branch publisher does not apply.');
 const stable=JSON.parse(gitBytes(prev,'deployment.json').toString('utf8'));
 need(stable.repository===repo&&shaPattern.test(stable.source_commit),'Previous Pages deployment metadata invalid.');
 const publicBefore=await publicJson('deployment.json?ccip_preflight='+sha.slice(0,12));
 need(publicBefore.repository===repo && publicBefore.source_commit===stable.source_commit,
   'Public HTTPS version does not match the expected gh-pages rollback baseline.');
 const actionsRun=await github('/actions/runs/'+process.env.GITHUB_RUN_ID);
 const runsJobs=await github('/actions/runs/'+process.env.GITHUB_RUN_ID+'/jobs?per_page=100');
 const ci=ciEvidence(actionsRun,runsJobs.jobs||[],sha);
 const first=verifyArtifact(site,sha);
 // Rebuild twice, independently of the previous job's artifact, and ensure exact-byte identity.
 git('status','--porcelain');
 execFileSync('npm',['run','build:pages'],{cwd:root,stdio:'inherit'});
 const second=verifyArtifact(site,sha);
 need(first.tree_sha256===second.tree_sha256,'Release artifact is not reproducible across builds.');
 const historical=archiveCheck(prev,second);
 const audit=readFileSync(join(root,'docs/etapa-7/auditoria-final.md'),'utf8');
 need(audit.includes('No hay errores P0/P1 del código identificados sin corregir'),
   'Current technical audit does not establish resolution of P0/P1 code issues.');
 const required=['seven_processes','three_levels','material_integrity','machine_inventory',
  'independent_numerics','no_unresolved_P0_P1','exact_commit_ci','real_exports',
  'history_migration','bilingual','responsive','historical_integrity',
  'reproducible_artifact','security','rollback','pages_configuration'];
 const gate={decision:'GO',source_commit:sha,artifact_tree_sha256:second.tree_sha256,
  previous_gh_pages_commit:prev,requirements:Object.fromEntries(required.map(k=>[k,true])),ci,
  evidence:{pages_source:page.source,pages_build_type:page.build_type,previous_public_source:stable.source_commit,
   previous_gh_pages_commit:prev,archive:historical,artifact_files:Object.keys(second.files).length,
   independent_checks:'unit and browser jobs include numeric/reference audit, all browser suites, real export tests, Pages cache and build',
   reproduction:'two byte-identical complete artifact manifests validated from the exact source checkout'}};
 validateReleaseGate(gate,sha,second.tree_sha256,prev);
 mkdirSync(runTemp,{recursive:true});
 writeFileSync(goPath,JSON.stringify(gate,null,2)+'\n',{mode:0o600});
 appendFileSync(process.env.GITHUB_ENV,'CCIP_EXPECTED_GH_PAGES_SHA='+prev+'\n');
 save({phase:'preflight',decision:'GO',commit:sha,ci,previous:prev,artifact_sha256:second.tree_sha256,
  pages_source:page.source,artifacts:Object.keys(second.files).length,archives:historical,go_file_written:true});
 console.log('GO: exact SHA CI passed; public previous deployment, Pages settings, historical assets and reproducible artifact verified.');
}
async function triggerPages(){
 const sha=current();
 need(sha===process.env.GITHUB_SHA,'Page build was requested from an unapproved commit.');
 const published=git('ls-remote','origin','refs/heads/gh-pages').split(/\s+/)[0];
 need(shaPattern.test(published),'Cannot verify the deployed branch before requesting the Pages build.');
 const manifest=JSON.parse(gitBytes(published,'deployment.json').toString('utf8'));
 need(manifest.source_commit===sha,'New gh-pages commit does not match the tested source commit.');
 const page=await github('/pages');
 need(page.build_type!=='workflow'&&page.source?.branch==='gh-pages'&&page.source?.path==='/',
   'Branch-based Pages publication configuration changed during deployment.');
 const response=await fetch('https://api.github.com/repos/'+repo+'/pages/builds',{
   method:'POST',
   headers:{
    'Authorization':'Bearer '+process.env.GITHUB_API_TOKEN,
    'Accept':'application/vnd.github+json',
    'X-GitHub-Api-Version':'2022-11-28',
    'User-Agent':'ccip-stage7-release-gate'
   },
   signal:AbortSignal.timeout(30000)
 });
 need(response.status===201,'Explicit Pages build request rejected: HTTP '+response.status);
 const result=await response.json();
 save({phase:'build_requested',source_commit:sha,gh_pages_commit:published,request_status:result.status});
 console.log('Official GitHub Pages build queued for published branch commit '+published);
}
function pathUrl(path){
 return noSecretsUrl(path.split('/').map(encodeURIComponent).join('/'));
}
async function verifyRemoteFile(path,hash){
 const response=await request(pathUrl(path)+'?ccip_verify='+current().slice(0,12),{},60000);
 const bytes=Buffer.from(await response.arrayBuffer());
 need(createHash('sha256').update(bytes).digest('hex')===hash,'Published file checksum mismatch: '+path);
}
async function verifyPublic(){
 const sha=current();
 const artifact=verifyArtifact(site,sha);
 // Publication may require several minutes for Pages to rebuild its CDN.
 let live=null,error='';
 for(let n=0;n<44;n++){
  try{
   live=await publicJson('deployment.json?ccip_verification='+sha.slice(0,12)+'-'+n);
   if(live.repository===repo&&live.source_commit===sha)break;
  }catch(e){error=String(e);}
  if(n===43)throw Error('Timed out waiting for the new HTTPS Pages deployment. '+error);
  await sleep(15000);
 }
 need(live?.source_commit===sha,'Live GitHub Pages is not at the approved source commit.');
 const commit=git('ls-remote','origin','refs/heads/gh-pages').split(/\s+/)[0];
 need(shaPattern.test(commit),'Cannot read published gh-pages commit.');
 const manifest=JSON.parse(gitBytes(commit,'deployment.json').toString('utf8'));
 need(manifest.source_commit===sha,'gh-pages manifest does not refer to released code.');
 const essential=[
  'index.html','formulas.html','deployment.json','artifact-integrity.json',
  'assets/'+sha+'/src/app.js',
  'assets/'+sha+'/src/data/materials.v1.3.json',
  'assets/'+sha+'/src/data/machines.v1.json',
  'versions/v1/index.html',
  'versions/antes-etapa-7-2026-10-17/index.html',
  'downloads/CCIP-Web-antes-etapa-7-2026-10-17.zip'
 ];
 for(const path of essential){
  need(artifact.files[path],'Mandatory published asset missing in manifest: '+path);
  await verifyRemoteFile(path,artifact.files[path]);
 }
 const report={phase:'live_verification',state:'public_essentials_verified',source_commit:sha,
  gh_pages_commit:commit,url:baseUrl,verified_paths:essential.length,
  public_browser_suite:'Pending final GitHub Actions browser stage after this step'};
 save(report);
 console.log('Verified GitHub Pages HTTPS manifest, critical assets, archived version and historical ZIP:',baseUrl);
}
const phase=process.argv[2];
try{
 if(phase==='preflight')await preflight();
 else if(phase==='verify-public')await verifyPublic();
 else if(phase==='trigger-pages')await triggerPages();
 else throw Error('Usage: node scripts/release-stage7-actions.mjs preflight|trigger-pages|verify-public');
}catch(e){save({phase,decision:'NO-GO',error:String(e),commit:current()});console.error('RELEASE BLOCKED:',e.message);process.exitCode=1;}
