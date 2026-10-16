// Reproduce the documentary correction from curated public regional evidence.
// Does not fetch the network, convert MVR/MFR or change calculator equations.
import fs from 'node:fs';
const read=p=>JSON.parse(fs.readFileSync(p));
const write=(p,x,compact=false)=>fs.writeFileSync(p,JSON.stringify(x,null,compact?undefined:2)+'\n');
const review=read('docs/etapa-3/gp35-regional-review.json'),catalog=read('src/data/materials.v1.3.json'),research=read('src/data/material-research.v1.json'),baseline=read('docs/etapa-3/baseline/materials.pre-etapa3.json');
const grade=catalog.materials.find(m=>m.id===review.material_id),original=baseline.materials.find(m=>m.id===review.material_id);
const astm=review.sources['R-CAT255-ASTM-AMERICAS'],iso=review.sources['R-CAT255'];
catalog.catalog_revision='1.5.1';research.revision='1.0.1';catalog.research_extension.revision=research.revision;
research.sources[iso.source_id]={...research.sources[iso.source_id],...iso};
research.sources[astm.source_id]=structuredClone(astm);
research.records[review.material_id].additional_flow_source_ids=[astm.source_id];
research.records[review.material_id].documentary_review_ref='docs/etapa-3/gp35-regional-review.json';
delete research.records[review.material_id].additional_flow_evidence;
research.records[review.material_id].limitations=[...new Set([...research.records[review.material_id].limitations,'Primary documentary rows are ISO/EMEA; independent ASTM/Americas flow measurements are retained in rheology.v1.json. No regional or colored-variant equivalence is certified.'])];
catalog.sources[astm.source_id]=structuredClone(astm);
Object.assign(catalog.sources[grade.source_id],{url:iso.url,region:iso.region,variant:null,sample_state:iso.sample_state,variant_scope:iso.variant_scope,revision_original:iso.revision_original,documentary_review:'gp35-regional-review.json'});
for(const key of ['mfr','mvr']){
 if(grade.properties[key])Object.assign(grade.properties[key],{source_id:astm.source_id,region:astm.region,variant:null,sample_state:astm.sample_state,verification_basis:'official_regional_table_and_pdf_content_reviewed_2026-10-16'});
}
let mfr=grade.additional_properties.find(p=>p.key==='mfr_secondary');
if(!mfr){mfr=structuredClone(original.additional_properties.find(p=>p.key==='mfr_secondary'));grade.additional_properties.push(mfr);}
Object.assign(mfr,{source_id:astm.source_id,region:astm.region,variant:null,sample_state:astm.sample_state,method:'ASTM D1238',unit:'g/10min',verification_basis:'official_regional_table_and_pdf_content_reviewed_2026-10-16',note:'MFR 34 publicado en ASTM/Américas. Se conserva por separado del MVR 34 ISO/EMEA; no es una conversión ni un error universal.'});
let mvr=grade.additional_properties.find(p=>p.key==='mvr_secondary');
if(!mvr){mvr=structuredClone(mfr);grade.additional_properties.push(mvr);}
Object.assign(mvr,{key:'mvr_secondary',value:34,unit:'cm3/10min',method:'ISO 1133',condition:'220 °C / 10 kg',source_id:grade.source_id,region:iso.region,variant:null,sample_state:iso.sample_state,verification_basis:'official_regional_table_and_pdf_content_reviewed_2026-10-16',note:'MVR 34 publicado en ISO/EMEA. Registro independiente del MFR 34 ASTM/Américas; sufijo de variante/lote no especificado por la tabla.'});
const originalKeys=original.additional_properties.map(p=>p.key);
grade.additional_properties=[...originalKeys.map(key=>grade.additional_properties.find(p=>p.key===key)),...grade.additional_properties.filter(p=>!originalKeys.includes(p.key))];
const decisions=read('docs/etapa-3/source-decisions.json').filter(d=>!(d.material_id===review.material_id&&(d.property_key==='mvr_secondary'||d.decision_id==='GP35-REGIONAL-REVIEW')));
const historical=structuredClone(review.previous_pr_decision);
historical.status='superseded_after_regional_review';historical.historical_reason=historical.reason;historical.reason='Initial ISO-only reclassification. Its universal MFR-error interpretation is withdrawn after consulting the official ASTM/Americas table.';historical.superseded_by='GP35-REGIONAL-REVIEW';
for(const d of decisions)if(d.material_id===grade.id&&d.source_id===grade.source_id){d.after_url=iso.url;d.regional_review='gp35-regional-review.json';}
decisions.push(historical,{decision_id:'GP35-REGIONAL-REVIEW',material_id:grade.id,status:'active',review_file:'gp35-regional-review.json',before_pr_head:review.previous_pr_head,after_measurements:[mfr,mvr],reason:'Both MFR 34 ASTM/Americas and MVR 34 ISO/EMEA are official measurements for public GP-35 SKU 300600120829. Preserve independently; no density conversion or universal misclassification claim.',identity_limit:review.identity_conclusion});
write('src/data/materials.v1.3.json',catalog);write('src/data/material-research.v1.json',research,true);write('docs/etapa-3/source-decisions.json',decisions);
