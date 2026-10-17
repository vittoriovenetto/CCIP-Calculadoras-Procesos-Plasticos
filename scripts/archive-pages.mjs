// Preserve the exact public artifact without recursively archiving old versions.
import {execFileSync} from 'node:child_process';
import {existsSync,mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {readGitBlob} from './pages-integrity.mjs';
const root=dirname(dirname(fileURLToPath(import.meta.url)));
const git=(args,encoding='utf8')=>execFileSync('git',args,{cwd:root,encoding,maxBuffer:128*1024*1024});
const ref=process.argv[2],name=process.argv[3];
if(!ref||!/^antes-etapa-7-\d{4}-\d{2}-\d{2}$/.test(name||''))throw Error('Usage: node scripts/archive-pages.mjs REF antes-etapa-7-YYYY-MM-DD');
const sha=git(['rev-parse','--verify',ref+'^{commit}']).trim();
const base=join(root,'versions',name),zip=join(root,'downloads','CCIP-Web-'+name+'.zip'),manifest=base+'.json';
if([base,zip,manifest].some(existsSync))throw Error('Archive path already exists; never overwrite it.');
const metadata=JSON.parse(git(['show',sha+':deployment.json']));
const files=git(['ls-tree','-r','--name-only',sha]).trim().split('\n').filter(p=>['.nojekyll','index.html','formulas.html','deployment.json'].includes(p)||p.startsWith('src/')||p.startsWith('assets/'));
if(!files.includes('index.html')||!files.includes('deployment.json')||!files.some(p=>p.startsWith('src/')))throw Error('Incomplete Pages artifact.');
const hashes={};
for(const path of files){
 const bytes=readGitBlob(root,sha,path),target=join(base,path);mkdirSync(dirname(target),{recursive:true});writeFileSync(target,bytes);
 hashes[path]=createHash('sha256').update(bytes).digest('hex');
}
mkdirSync(dirname(zip),{recursive:true});
writeFileSync(zip,git(['archive','--format=zip','--prefix=CCIP-Web-'+name+'/',sha,'--',...files],null));
const report={schema:'ccip-web-archive/1',gh_pages_commit:sha,source_commit:metadata.source_commit,scope:'Exact public web files only; no recursive versions/downloads and no browser localStorage backup',files:hashes,zip:'downloads/'+zip.split('/').at(-1),zip_sha256:createHash('sha256').update(readFileSync(zip)).digest('hex')};
writeFileSync(manifest,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({archive:name,files:files.length,gh_pages_commit:sha,source_commit:metadata.source_commit,zip:report.zip}));
