import {readFileSync} from 'node:fs';
import {validateIssue,githubRequest,preparePullRequest} from './core.mjs';
const read=p=>JSON.parse(readFileSync(p,'utf8')),number=Number(process.env.ISSUE_NUMBER);
if(!Number.isSafeInteger(number)||number<1)throw Error('Invalid Issue number.');
const request=(path,options={})=>githubRequest(path,{...options,token:process.env.GITHUB_TOKEN});
// Re-fetch, never trust an artifact or an Issue that changed after validation.
const report=await validateIssue(await request('issues/'+number),read('src/data/materials.v1.3.json'),read('src/data/user-materials.v1.json'));
const earlier=read(process.env.REPORT_PATH||'validation/material-validation.json');
if(!earlier.valid||report.digest!==earlier.digest||report.base_catalog_revision!==earlier.base_catalog_revision)throw Error('Issue or catalog changed; run validation again.');
const repo=await request('');
const result=await preparePullRequest(report,{request,defaultBranch:repo.default_branch});console.log(result.url);
