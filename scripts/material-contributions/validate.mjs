import {readFileSync,writeFileSync} from 'node:fs';
import {validateIssue,githubRequest} from './core.mjs';
const read=path=>JSON.parse(readFileSync(path,'utf8'));
const event=read(process.env.GITHUB_EVENT_PATH),number=event.issue?.number??Number(process.env.ISSUE_NUMBER),output=process.env.REPORT_PATH||'material-validation.json';
try{
 if(!Number.isSafeInteger(number)||number<1)throw Error('Issue number required.');
 const issue=await githubRequest('issues/'+number,{token:process.env.GITHUB_TOKEN});
 if(!issue.body?.startsWith('<!-- ccip-material-contribution/1 -->')){writeFileSync(output,JSON.stringify({valid:false,skipped:true,reason:'Not a CCIP material proposal'}));process.exit(0);}
 const report=await validateIssue(issue,read('src/data/materials.v1.3.json'),read('src/data/user-materials.v1.json'));
 writeFileSync(output,JSON.stringify(report,null,2));console.log('Proposal validated; pending human review. SHA-256:',report.digest);
}catch(error){writeFileSync(output,JSON.stringify({valid:false,reason:error.message}));console.error(error.message);process.exitCode=1;}
