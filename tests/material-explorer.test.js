import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {makeCustomMaterial,validateUserMaterial,convertProperty} from '../src/custom-materials.js';
import {buildExplorer,filterExplorer,compareExplorer,compareProperty} from '../src/material-explorer-data.js';
import {emptySharedCatalog,validateSharedCatalog,mergeSharedAndLocal,canonical} from '../src/shared-materials.js';
import {prepareContribution,contributionBody,githubIssueLink,confirmContribution,validateContribution,parseContributionBody} from '../src/material-contributions.js';
import {validateIssue,preparePullRequest,promoteProposal} from '../scripts/material-contributions/core.mjs';
import {prepareMaterialReport} from '../src/material-report.js';
const read=name=>JSON.parse(readFileSync(new URL('../src/data/'+name,import.meta.url)));
const data={catalog:read('materials.v1.3.json'),research:read('material-research.v1.json'),rheology:read('rheology.v1.json'),recycling:read('recycling.v1.json'),shared:emptySharedCatalog()};
const library=buildExplorer(data),custom=()=>makeCustomMaterial({family:'PP',grade:'Synthetic laboratory fixture, no real grade',source:'Synthetic fixture source',provenance:'Synthetic laboratory, test only',verification_declaration:true,material_kind:'recycled',melt_density:800,melt_density_unit:'kg/m3',melt_density_conditions:'220 °C; 5 MPa',melt_density_temperature_C:220,melt_density_pressure_MPa:5,tensile_modulus:1.5,tensile_modulus_unit:'GPa'});
const issue=prepared=>({number:456,html_url:'https://github.com/vittoriovenetto/CCIP-Calculadoras-Procesos-Plasticos/issues/456',body:contributionBody(prepared),labels:[],state:'open'});
async function proposed(){const prepared=await prepareContribution(custom(),{shared:data.shared,justification:'Controlled test, not a public submission'}),report=await validateIssue(issue(prepared),data.catalog,data.shared);return {prepared,report,proposal:{state:'pending_human_review',digest:report.digest,source_issue:report.issue.url,base_catalog_revision:report.base_catalog_revision,previous:report.previous,proposed:report.payload.material,payload:report.payload}};}
const review={reviewUrl:'https://github.com/vittoriovenetto/CCIP-Calculadoras-Procesos-Plasticos/pull/456',reviewer:'fixture-reviewer',justification:'Synthetic test only',now:'2026-10-16T12:00:00.000Z'};
test('explorer joins exactly 73 original identities, 47 enriched / 17 pending / 9 generic and 15 independent experiments',()=>{
 assert.equal(library.entries.length,88);assert.equal(new Set(library.entries.map(x=>x.key)).size,88);
 const original=library.entries.filter(x=>x.origin==='original');assert.equal(original.length,73);
 assert.equal(original.filter(x=>x.verification==='partial').length,47);assert.equal(original.filter(x=>x.verification==='pending').length,17);assert.equal(original.filter(x=>x.category==='generic').length,9);
 for(const m of original)assert.ok(data.catalog.materials.some(x=>x.id===m.id));
 const experimental=library.entries.filter(x=>x.category==='experimental');assert.equal(experimental.length,15);for(const e of experimental){assert.ok(e.experiment);assert.ok(e.composition.source_id);assert.equal(e.properties.length,0);assert.equal(e.automatic_application_allowed,false);}
});
test('combined search/family/manufacturer/property filters, sorting and categories remain independent',()=>{
 const found=filterExplorer(library.entries,{query:'dow',family:'HDPE',manufacturer:'Dow',category:'commercial',property:'mfr',group:'rheological',with_properties:true,sort:'properties'});
 assert.ok(found.length>0);for(const e of found){assert.equal(e.family,'HDPE');assert.equal(e.manufacturer,'Dow');assert.ok(e.flows.some(x=>x.kind==='MFR'));}
 assert.equal(filterExplorer(library.entries,{category:'experimental',family:'HDPE'}).length,8);
 assert.equal(filterExplorer(library.entries,{query:'no_such_polymer_fixture'}).length,0);
 assert.equal(filterExplorer(library.entries,{category:'user'}).length,0);
});
test('GP35 ASTM MFR and ISO MVR both remain independent official measurements with regional provenance',()=>{
 const gp=library.entries.find(x=>x.id==='catalog-abs-terluran-gp-35');
 for(const kind of ['MFR','MVR'])assert.ok(gp.flows.some(x=>x.kind===kind&&x.value===34));
 const pair=compareExplorer(gp,gp).rows.find(x=>x.first[0]?.kind==='MFR'&&x.second[0]?.kind==='MVR');assert.equal(pair.assessment.reason,'different_quantity');assert.equal(pair.assessment.difference,null);
 assert.ok(Object.keys(gp.sources).length<10,'ficha does not include unrelated global sources');
});
test('unknown mechanical or phase conditions never produce a false numeric comparison or ranking',()=>{
 const p={key:'solid_density',unit:'g/cm3',value:1,phase:'solid',method:'ISO 1183',condition:'23 °C',temperature_C:23,pressure_MPa:null,preconditioning:null,classification:'official_grade_specific'};
 assert.equal(compareProperty(p,{...p,value:.9}).difference,null);assert.equal(compareProperty(p,{...p,phase:'melt'}).status,'incompatible');
 assert.equal(compareExplorer(library.entries[0],library.entries[1]).automatic_ranking,false);
});
test('custom metadata, canonical units, blank drafts and stable edit revision survive sanitization',()=>{
 const m=custom();assert.equal(m.properties.melt_density.value,.8);assert.equal(m.properties.tensile_modulus.value,1500);assert.equal(m.category,'Agregado por usuarios');assert.equal(m.user_details.material_kind,'recycled');assert.equal(m.properties.melt_density.evidence.test_details.temperature_C,220);
 assert.equal(canonical(validateUserMaterial(m)),canonical(m));
 const draft=makeCustomMaterial({family:'PC',grade:'Blank fixture'});assert.ok(Object.values(draft.properties).every(x=>x===null));
 const edit=makeCustomMaterial({family:'PC',grade:'Edited fixture'},draft.id,draft);assert.equal(edit.id,draft.id);assert.equal(edit.revision,2);assert.equal(edit.created_at,draft.created_at);
 assert.throws(()=>convertProperty('tensile_modulus',-1,'GPa'));assert.throws(()=>convertProperty('tensile_modulus',1,'kg'));
});
test('proposal requires provenance, declaration and justification, rejects impersonation / extra fields / bad values',async()=>{
 const prepared=await prepareContribution(custom(),{justification:'Test only'});assert.equal(prepared.state,'prepared');assert.equal(prepared.remote_confirmed,false);
 assert.equal(parseContributionBody(contributionBody(prepared)).submission_id,prepared.payload.submission_id);
 for(const patch of [{justification:''},{material:{...prepared.payload.material,record_status:'manufacturer_typical'}},{approved:true},{base_revision:2},{material:{...prepared.payload.material,id:'catalog-pp-fixture'}}])assert.throws(()=>validateContribution({...prepared.payload,...patch}));
 await assert.rejects(()=>prepareContribution(makeCustomMaterial({family:'PP',grade:'Incomplete fixture'}),{justification:'Test only'}));
});
test('long proposal falls back to manual paste without falsely confirming submission',async()=>{
 const m=custom();m.user_details.observations='x'.repeat(1900);m.user_details.formulation='y'.repeat(900);
 const p=await prepareContribution(m,{justification:'z'.repeat(1900)}),link=githubIssueLink(p);assert.equal(link.manual_paste,true);assert.equal(link.remote_confirmed,false);assert.ok(link.body.includes(p.payload.submission_id));assert.ok(!new URL(link.url).searchParams.has('body'));
});
test('receipt must be a matching actual API Issue/PR; mismatches and rate limits remain unconfirmed',async()=>{
 const {prepared}=await proposed();const response=data=>async(url,options)=>{assert.equal(options.credentials,'omit');assert.ok(!options.headers.Authorization);return {ok:true,json:async()=>data};};
 const confirmed=await confirmContribution(prepared,issue(prepared).html_url,response(issue(prepared)));assert.equal(confirmed.remote_confirmed,true);assert.equal(confirmed.state,'pending_review');
 const corrections=await confirmContribution(prepared,issue(prepared).html_url,response({...issue(prepared),labels:[{name:'ccip-requires-corrections'}]}));assert.equal(corrections.state,'requires_corrections');
 const rejected=await confirmContribution(prepared,issue(prepared).html_url,response({...issue(prepared),labels:[{name:'ccip-rejected'}]}));assert.equal(rejected.state,'rejected');
 await assert.rejects(()=>confirmContribution(prepared,'https://evil.invalid/issues/456',response(issue(prepared))));
 await assert.rejects(()=>confirmContribution(prepared,issue(prepared).html_url,response({...issue(prepared),body:contributionBody({...prepared,payload:{...prepared.payload,justification:'Changed remotely'}})})));
 for(const status of [403,429,404])await assert.rejects(()=>confirmContribution(prepared,issue(prepared).html_url,async()=>({ok:false,status})));
});
test('server revalidates original IDs, duplicates, raw units and shared base revisions',async()=>{
 const {prepared}=await proposed();const original=structuredClone(prepared);original.payload.material.grade=data.catalog.materials.find(x=>x.family==='PP').grade;
 await assert.rejects(()=>validateIssue(issue(original),data.catalog,data.shared));
 const forged=structuredClone(prepared);forged.payload.material.properties.melt_density.unit='lb/ft3';await assert.rejects(()=>validateIssue(issue(forged),data.catalog,data.shared));
});
test('review promotion retains prior versions and shared/local conflicts without mutating original catalog',async()=>{
 const original=canonical(data.catalog),{prepared,proposal}=await proposed(),shared=promoteProposal(proposal,data.shared,review);
 assert.equal(shared.materials[0].revision,1);assert.equal(shared.materials[0].history[0].previous,null);validateSharedCatalog(shared);
 const merged=mergeSharedAndLocal(data.catalog,shared,[]);assert.equal(merged.materials.length,74);assert.equal(merged.materials.at(-1).catalog_origin,'shared');
 const local=custom();local.id=prepared.payload.material.id;const validated=validateUserMaterial(local);validated.grade='Edited locally';
 const conflict=buildExplorer({...data,shared,locals:[validated]});assert.equal(conflict.conflicts.length,1);assert.equal(conflict.entries.filter(x=>x.id===local.id).length,2);assert.equal(canonical(data.catalog),original);
 const update=await prepareContribution(validated,{action:'update',base_revision:1,shared,justification:'Synthetic revision'}),updateReport=await validateIssue(issue(update),data.catalog,shared);
 const next=promoteProposal({state:'pending_human_review',digest:updateReport.digest,source_issue:updateReport.issue.url,base_catalog_revision:shared.revision,previous:updateReport.previous,proposed:updateReport.payload.material,payload:updateReport.payload},shared,review);
 assert.equal(next.materials.length,1);assert.equal(next.materials[0].revision,2);assert.equal(next.materials[0].history.length,2);assert.equal(next.materials[0].history[1].previous.grade,prepared.payload.material.grade);
 assert.throws(()=>validateContribution(update.payload,next));assert.throws(()=>promoteProposal(proposal,shared,review));
});
test('data-only draft PR uses fixed path and permissions scope, escapes untrusted text, supports idempotent existing PR',async()=>{
 const {report}=await proposed(),calls=[];const request=async(path,options={})=>{calls.push({path,...options});if(path.startsWith('pulls?'))return [];if(path.startsWith('git/ref/heads/contributions')){const e=Error('Missing fixture branch');e.status=404;throw e;}if(path.startsWith('git/ref/heads/'))return {object:{sha:'a'.repeat(40)}};if(path==='pulls')return {html_url:'https://github.com/vittoriovenetto/CCIP-Calculadoras-Procesos-Plasticos/pull/999'};return {};};
 const result=await preparePullRequest(report,{request,defaultBranch:'main'});assert.equal(result.existing,false);
 const writes=calls.filter(x=>x.method);assert.equal(writes.length,3);assert.ok(writes[1].path.startsWith('contents/.github/material-proposals/user-'));assert.equal(writes[2].body.draft,true);assert.ok(!calls.some(x=>/merge|src\/data/.test(x.path)));
 const repeated=await preparePullRequest(report,{request:async()=>[{html_url:result.url}],defaultBranch:'main'});assert.equal(repeated.existing,true);
});
test('material report snapshots retain original properties, sources and compatibility without calculator mutation',()=>{
 const selected=library.entries.filter(x=>x.id==='catalog-abs-terluran-gp-35'||x.id==='dow-dowlex-2045g'),report=prepareMaterialReport(selected,'en');assert.equal(report.record.entries.length,2);assert.equal(report.record.comparison.automatic_ranking,false);assert.equal(report.report_labels.parameters,'Properties and conditions');assert.ok(report.parameters.length>0);assert.ok(report.sources.length>0);assert.equal(report.profile.length,0);
});

test('shared approval cannot be forged through an import, inconsistent history or different live snapshot',async()=>{
 const {proposal}=await proposed(),shared=promoteProposal(proposal,data.shared,review);
 for(const change of [x=>x.materials[0].history=[],x=>x.materials[0].material.revision=9,x=>x.materials[0].review.state='pending',x=>x.materials[0].material.grade='Changed without review',x=>x.materials[0].history[0].source='javascript:alert(1)']){const corrupt=structuredClone(shared);change(corrupt);assert.throws(()=>validateSharedCatalog(corrupt));}
 const imported=validateUserMaterial({...shared.materials[0].material,record_status:'manufacturer_typical',catalog_origin:'shared',shared_revision:99});assert.equal(imported.record_status,'user_entered_unverified');assert.equal(imported.shared_revision,undefined);assert.equal(imported.catalog_origin,undefined);
});
test('shared name collision preserves a distinct local record as an explicit conflict instead of hiding the whole library',async()=>{
 const {proposal}=await proposed(),shared=promoteProposal(proposal,data.shared,review),local=custom();local.grade=shared.materials[0].material.grade;
 const resolved=buildExplorer({...data,shared,locals:[local]});assert.equal(resolved.conflicts[0].reason,'same_name_different_id');assert.equal(resolved.entries.filter(x=>x.origin==='original').length,73);assert.ok(resolved.entries.some(x=>x.key===local.id+'~local'));
 assert.equal(mergeSharedAndLocal(data.catalog,shared,[local]).materials.length,74);
});
test('user-entered solid and melt values require a source and sufficient declared conditions to autofill',async()=>{
 const {createMaterialState,selectMaterial,applyMaterial}=await import('../src/materials.js'),{enableLeanMaterial}=await import('../src/lean-materials.js'),{modules}=await import('../src/schema.js');
 const m=makeCustomMaterial({family:'PP',grade:'Untraced synthetic density',material_kind:'recycled',melt_density:.8});
 const merged=mergeSharedAndLocal(data.catalog,emptySharedCatalog(),[m]),state=enableLeanMaterial(createMaterialState()),module=modules.find(x=>x.id==='inyeccion'),values=Object.fromEntries(module.fields.map(f=>[f.key,f.default??'']));
 selectMaterial(merged,state,values,m.id);applyMaterial(state,module,values,'technical');assert.equal(values.meltDensity,'');assert.ok(!state.provenance.meltDensity);
 const trace=custom(),catalog=mergeSharedAndLocal(data.catalog,emptySharedCatalog(),[trace]);selectMaterial(catalog,state,values,trace.id);applyMaterial(state,module,values,'technical');assert.equal(values.meltDensity,.8);assert.equal(state.provenance.meltDensity.origin,'user_custom');
});
test('new custom recycled and blend materials never receive virgin family melt density as a fallback',async()=>{
 const {createMaterialState,selectMaterial,applyMaterial}=await import('../src/materials.js'),{enableLeanMaterial}=await import('../src/lean-materials.js'),{modules}=await import('../src/schema.js');
 for(const material_kind of ['recycled','blend']){
  const m=makeCustomMaterial({family:'PP',grade:'No-density synthetic '+material_kind,material_kind}),catalog=mergeSharedAndLocal(data.catalog,emptySharedCatalog(),[m]),state=enableLeanMaterial(createMaterialState()),module=modules.find(x=>x.id==='inyeccion'),values=Object.fromEntries(module.fields.map(f=>[f.key,f.default??'']));
  selectMaterial(catalog,state,values,m.id);applyMaterial(state,module,values,'advanced');assert.equal(values.meltDensity,'');assert.equal(state.provenance.meltDensity,undefined);
 }
});
test('three-material report preserves all three documentary pair comparisons',()=>{
 const entries=library.entries.filter(x=>x.category==='commercial').slice(0,3),report=prepareMaterialReport(entries);assert.equal(report.record.entries.length,3);assert.equal(report.record.comparisons.length,3);assert.ok(report.results.length>0);
});
test('oversized, nested, source-impersonating and unsafe URLs are rejected as data',async()=>{
 const {prepared}=await proposed();
 assert.throws(()=>validateContribution({...prepared.payload,justification:'x'.repeat(50000)}));
 const malicious=structuredClone(prepared.payload);malicious.material.properties.melt_density.source_id='S01';assert.throws(()=>validateContribution(malicious));
 assert.throws(()=>makeCustomMaterial({family:'PP',grade:'Unsafe URL fixture',url:'https://user:password@example.com'}));
 assert.throws(()=>parseContributionBody('<!-- ccip-material-contribution/1 -->\n```json\n{"__proto__":{"approved":true}}\n```'));
});
test('known different mechanical standards override missing conditions; no false equivalence',()=>{
 const a={key:'tensile_modulus',unit:'MPa',value:1500,phase:null,method:'ISO 527'},b={...a,value:1600,method:'ASTM D638'};
 assert.equal(compareProperty(a,b).status,'incompatible');assert.equal(compareProperty(a,b).difference,null);
});
