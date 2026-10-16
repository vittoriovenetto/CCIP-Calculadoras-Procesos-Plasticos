import {createHash} from 'node:crypto';
// All external text is data. This module never runs shell commands.
import {validateContribution,parseContributionBody,sha256,contributionBody} from '../../src/material-contributions.js';
import {validateSharedCatalog,canonical,githubReference,REPOSITORY} from '../../src/shared-materials.js';
export function changedFields(before,after,path=''){
 if(canonical(before)===canonical(after))return [];
 if(!before||!after||typeof before!=='object'||typeof after!=='object'||Array.isArray(before)||Array.isArray(after))return [path||'material'];
 return [...new Set([...Object.keys(before),...Object.keys(after)])].flatMap(key=>changedFields(before[key],after[key],path?path+'.'+key:key));
}
export async function validateIssue(issue,catalog,shared){
 validateSharedCatalog(shared);
 if(!Number.isSafeInteger(issue.number)||issue.number<1||issue.html_url!==`https://github.com/${REPOSITORY}/issues/${issue.number}`)throw Error('Issue de otro repositorio o identificador no válido.');
 const payload=validateContribution(parseContributionBody(issue.body),shared),m=payload.material;
 if(catalog.materials.some(x=>x.id===m.id||x.family===m.family&&x.grade.toLowerCase()===m.grade.toLowerCase()))throw Error('No se permite suplantar ni duplicar una identidad original.');
 const previous=shared.materials.find(x=>x.id===m.id),digest=await sha256(canonical(payload));
 return {valid:true,schema:'ccip-material-validation/1',digest,issue:githubReference(issue.html_url),payload,classification:'user_entered_unverified',base_catalog_revision:shared.revision,previous:previous?.material??null,changed_fields:changedFields(previous?.material??null,m),pending_human_review:true};
}
export async function githubRequest(path,{method='GET',body,token,fetcher=fetch}={}){
 const response=await fetcher(`https://api.github.com/repos/${REPOSITORY}/${path}`,{method,headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',...(token?{Authorization:`Bearer ${token}`}:{})},...(body?{body:JSON.stringify(body)}:{})});
 if(!response.ok){const error=Error(`GitHub HTTP ${response.status}`);error.status=response.status;throw error;}return response.status===204?null:response.json();
}
export async function preparePullRequest(report,{request,defaultBranch}){
 if(!report.valid||!report.pending_human_review||!/^[a-zA-Z0-9._/-]{1,100}$/.test(defaultBranch))throw Error('Informe o rama base no válida.');
 const branch=`contributions/${report.payload.material.id}-${report.digest.slice(0,12)}-r${report.base_catalog_revision}`,path=`.github/material-proposals/${report.payload.material.id}.json`;
 const existing=await request(`pulls?state=open&head=vittoriovenetto:${encodeURIComponent(branch)}`);if(existing.length)return {existing:true,url:existing[0].html_url};
 const base=await request(`git/ref/heads/${encodeURIComponent(defaultBranch)}`);
 let branchExists=false;try{await request(`git/ref/heads/${encodeURIComponent(branch)}`);branchExists=true;}catch(error){if(error.status!==404)throw error;}
 if(!branchExists)await request('git/refs',{method:'POST',body:{ref:'refs/heads/'+branch,sha:base.object.sha}});
 const proposal={schema:'ccip-material-review-proposal/1',state:'pending_human_review',digest:report.digest,source_issue:report.issue.url,base_catalog_revision:report.base_catalog_revision,previous:report.previous,proposed:report.payload.material,changed_fields:report.changed_fields,payload:report.payload};
 const content=Buffer.from(JSON.stringify(proposal,null,2)+'\n').toString('base64');let existingFile=null;
 if(branchExists){try{existingFile=await request(`contents/${path}?ref=${encodeURIComponent(branch)}`);}catch(error){if(error.status!==404)throw error;}}
 if(existingFile){const stored=JSON.parse(Buffer.from(existingFile.content,'base64').toString('utf8'));if(canonical(stored)!==canonical(proposal))throw Error('Existing proposal branch differs; human review required.');}
 else await request(`contents/${path}`,{method:'PUT',body:{message:'Prepare user material for human review',branch,content}});
 const body=contributionBody({payload:report.payload,digest:report.digest})+`\nSource Issue: ${report.issue.url}\n\nPending human review. No approval, catalog write, merge or deployment.\nReview proposal: ${path}\n`;
 const pr=await request('pulls',{method:'POST',body:{title:'[CCIP material] '+report.payload.material.id,head:branch,base:defaultBranch,draft:true,body}});
 return {existing:false,url:pr.html_url};
}
export function promoteProposal(proposal,shared,{reviewUrl,reviewer,justification,now=new Date().toISOString()}){
 validateSharedCatalog(shared);githubReference(reviewUrl);githubReference(proposal.source_issue);
 if(!justification?.trim()||!/^[-a-zA-Z0-9]{1,39}$/.test(reviewer||''))throw Error('Revisión humana incompleta.');
 if(proposal.state!=='pending_human_review'||proposal.base_catalog_revision!==shared.revision)throw Error('La biblioteca cambió: repetir la revisión.');
 if(createHash('sha256').update(canonical(proposal.payload)).digest('hex')!==proposal.digest)throw Error('Digest de propuesta no coincide.');
 const payload=validateContribution(proposal.payload,shared),previous=shared.materials.find(x=>x.id===payload.material.id);
 if(canonical(payload.material)!==canonical(proposal.proposed)||canonical(proposal.previous)!==canonical(previous?.material??null))throw Error('La propuesta no coincide con las revisiones revisadas.');
 const changes=changedFields(previous?.material??null,payload.material),revision=(previous?.revision||0)+1;
 const review={state:'approved_as_contribution',url:reviewUrl,reviewer,justification,changed_fields:changes,date:now};
 const material=structuredClone(payload.material);material.revision=revision;
 const entry={id:material.id,category:'Agregado por usuarios',material,revision,incorporated_at:previous?.incorporated_at||now,updated_at:now,verification_status:'approved_contribution_not_industrially_certified',contribution:{url:proposal.source_issue,submission_id:payload.submission_id},review,history:[...(previous?.history||[]),{revision,date:now,previous:previous?.material||null,proposed:material,changed_fields:changes,justification,source:proposal.source_issue,review:reviewUrl}]};
 return validateSharedCatalog({...shared,revision:shared.revision+1,materials:previous?shared.materials.map(x=>x.id===entry.id?entry:x):[...shared.materials,entry]});
}
