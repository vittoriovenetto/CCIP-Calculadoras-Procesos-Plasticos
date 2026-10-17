// Evidence contracts, independent of equations. A point Cp is not an interval mean.
import {n} from './math.js';
const text=x=>typeof x==='string'&&x.trim().length>0;
const temp=x=>Number.isFinite(n(x))&&n(x)>-273.15;
const same=(a,b)=>Number.isFinite(n(a))&&Number.isFinite(n(b))&&Math.abs(n(a)-n(b))<=1e-10*Math.max(1,Math.abs(n(a)),Math.abs(n(b)));
export function cpSignature(value,context){
 return JSON.stringify([n(value),context.cpPhase,n(context.cpMinC),n(context.cpMaxC),context.cpDefinition,typeof context.specificHeatSource==='string'?context.specificHeatSource.trim():null,context.cpNoTransition===true]);
}
export function cpIntervalEvidence(evidence,inputs){
 if(!evidence||!Array.isArray(evidence.temperature_range_C)||evidence.temperature_range_C.length!==2||!evidence.temperature_range_C.every(x=>typeof x==='number'&&Number.isFinite(x))||evidence.phase!=='solid'||!['mean_over_interval','constant_approximation'].includes(evidence.definition)||evidence.no_transition!==true)return false;
 const [lo,hi]=evidence.temperature_range_C||[],t0=n(inputs.startT),t1=n(inputs.targetT);
 if(![lo,hi,t0,t1].every(temp)||n(hi)<=n(lo)||t1<t0||t0<n(lo)||t1>n(hi))return false;
 // An integral mean over a larger interval is not automatically the mean of a subinterval.
 return evidence.definition==='constant_approximation'||same(t0,lo)&&same(t1,hi);
}
export function documentedCp(state,inputs){
 const p=state?.grade_snapshot?.properties?.specific_heat,entry=state?.provenance?.specificHeat;
 const evidence=p?.thermal_evidence,source=state?.references_snapshot?.sources?.[p?.source_id];
 if(!p||!['library','user_custom'].includes(entry?.origin)||entry.grade_id!==state.grade_snapshot.id||p.unit!=='kJ/kg·K'||p.phase!=='solid'||!same(p.value,inputs.specificHeat)||!text(p.source_id)||!text(source?.url||p.evidence?.description))return null;
 return cpIntervalEvidence(evidence,inputs)?{...structuredClone(evidence),source_id:p.source_id,source:structuredClone(source||p.evidence),value:n(p.value),unit:p.unit}:null;
}
export function manualCp(state,inputs){
 const c=state?.context||{},evidence={phase:c.cpPhase,definition:c.cpDefinition,temperature_range_C:[n(c.cpMinC),n(c.cpMaxC)],no_transition:c.cpNoTransition===true,source:c.specificHeatSource,value:n(inputs.specificHeat),unit:'kJ/kg·K'};
 return text(evidence.source)&&c.cpEvidenceConfirmed===true&&c.cpConfirmedSignature===cpSignature(inputs.specificHeat,c)&&cpIntervalEvidence(evidence,inputs)?evidence:null;
}
export function bulkEvidence(state,inputs){
 const c=state?.context||{},entry=state?.provenance?.bulkDensity,p=state?.grade_snapshot?.properties?.bulk_density;
 const form=c.physicalForm,knownForm=p?.physical_form||(/pellets|granza/i.test((p?.condition||'')+' '+(p?.note||''))?'pellets':/powder|polvo/i.test((p?.condition||'')+' '+(p?.note||''))?'powder':null);
 const linked=['library','user_custom'].includes(entry?.origin)&&same(p?.value,inputs.bulkDensity)&&entry.grade_id===state?.grade_snapshot?.id;
 if(!['pellets','powder'].includes(form)||c.bulkCompatible!==true)return null;
 if(linked&&(p.unit!=='kg/L'||p.phase&&p.phase!=='bulk'||!knownForm||knownForm!==form))return null;
 const source=linked?(entry.source||p.evidence||state.source):c.bulkDensitySource;
 if(!source||typeof source==='string'&&!text(source)||typeof source==='object'&&!text(source.url)&&!text(source.description))return null;
 return {classification:linked?(entry.origin==='library'?'documented_typical':'user_entered'):'manual_declared',value:n(inputs.bulkDensity),unit:'kg/L',phase:'bulk',physical_form:form,source:structuredClone(source),conditions_confirmed:true,reference:linked?structuredClone(p):null,source_id:linked?p.source_id:null};
}
