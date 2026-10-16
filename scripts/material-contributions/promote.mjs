// Maintainer runs this locally after reviewing a proposal; produces a reviewable JSON diff.
import {readFileSync,writeFileSync} from 'node:fs';
import {promoteProposal} from './core.mjs';
const [file,reviewUrl,reviewer,justification]=process.argv.slice(2);
if(!file||!reviewUrl||!reviewer||!justification)throw Error('Usage: node scripts/material-contributions/promote.mjs proposal.json review-PR-URL reviewer justification');
const sharedPath='src/data/user-materials.v1.json',read=p=>JSON.parse(readFileSync(p,'utf8'));
const next=promoteProposal(read(file),read(sharedPath),{reviewUrl,reviewer,justification});
writeFileSync(sharedPath,JSON.stringify(next,null,2)+'\n');console.log('Prepared local catalog diff. Requires human review, merge and future release.');
