// Formulaciones separadas del catálogo comercial. Sin promedios universales de
// MFR, resistencia, Tg/Tm, humedad o secado.
export const recycledOrigins = ['PIR','PCR','internal_regrind','commercial_recycled','not_specified'];
export const ratioPresets = Array.from({length:11},(_,i)=>[100-i*10,i*10]);
export const mixtureModel = Object.freeze({id:'ideal_additive_specific_volumes/1',equation:'ρ = 1 / (wᵥ/ρᵥ + wᵣ/ρᵣ)',units:'w: mass fraction; ρ: g/cm³',hypotheses:['same_declared_family','same_phase','same_temperature','same_pressure','additive_specific_volumes','no_reaction_or_excess_volume'],scope:'Preliminary ideal estimate at the documented point; no universal family validity or industrial certification.'});
const quantity=value=>typeof value==='number'?Number.isFinite(value)?value:null:typeof value==='string'&&value.trim()&&Number.isFinite(Number(value))?Number(value):null;
const text=value=>typeof value==='string'?value.trim():'';
const clone=value=>structuredClone(value);
const fingerprint=value=>{let a=2166136261,b=3339675911;for(const char of value){a=Math.imul(a^char.charCodeAt(0),16777619);b=Math.imul(b^char.charCodeAt(0),2246822519);}return (a>>>0).toString(16)+(b>>>0).toString(16);};
export function makeFormulation(input,virgin) {
 const errors=[],v=quantity(input.virgin_percent),r=quantity(input.recycled_percent),cycles=input.cycles===''||input.cycles===null||input.cycles===undefined?null:quantity(input.cycles);
 if(!virgin?.id||!virgin?.family)errors.push('select_virgin_reference');
 if(input.basis!=='mass')errors.push('mass_basis_required');
 if(v===null||r===null||v<0||v>100||r<0||r>100||Math.abs(v+r-100)>1e-8)errors.push('fractions_must_sum_100');
 if((input.cycles!==''&&input.cycles!==null&&input.cycles!==undefined&&cycles===null)||cycles!==null&&(!Number.isInteger(cycles)||cycles<0))errors.push('invalid_reprocessing_cycles');
 if(!recycledOrigins.includes(input.origin))errors.push('invalid_recycled_origin');
 if(errors.length)return {valid:false,errors};
 const recycled={id:text(input.recycled_id)||null,name:text(input.recycled_name)||null,manufacturer:text(input.recycled_manufacturer)||null,lot:text(input.lot)||null,family:text(input.recycled_family)||null,origin:input.origin,identity_status:text(input.recycled_name)&&text(input.recycled_id)?'user_identified':'unknown_or_incomplete',source:text(input.recycled_source)||null};
 const canonical=JSON.stringify([virgin.id,virgin.family,recycled.id,recycled.name?.toLowerCase()||null,recycled.manufacturer?.toLowerCase()||null,recycled.lot,recycled.family,recycled.origin,v,r,'mass',cycles,text(input.processing_conditions),text(input.pretreatment)]);
 return {valid:true,schema:'ccip-formulation/1',id:'formulation-'+fingerprint(canonical),canonical_key:canonical,name:`${virgin.family} · ${v} % V / ${r} % R`,family:virgin.family,record_type:r===0?'virgin_reference':v===0?'recycled_material':'virgin_recycled_blend',virgin_reference:{id:virgin.id,family:virgin.family,manufacturer:virgin.manufacturer,grade:virgin.grade},recycled_component:recycled,virgin_percent:v,recycled_percent:r,virgin_fraction:v/100,recycled_fraction:r/100,percentage_basis:'mass',original_percentages:{virgin:input.virgin_percent,recycled:input.recycled_percent},reprocessing_cycles:cycles,processing_conditions:text(input.processing_conditions)||null,pretreatment:text(input.pretreatment)||null,verification_status:r===0?'virgin_reference':'requires_case_validation',density_strategy:input.density_strategy||'none',density_phase:input.density_phase||'melt',model_accepted:input.model_accepted===true,component_densities:clone(input.component_densities||{}),measured_density:clone(input.measured_density||null),notes:text(input.notes)||null,sources:clone(input.sources||[]),limitations:['Formulation for analysis; percentages are not industrial recommendations.','No inherited virgin properties for a blend or unidentified recycled material.','Food-contact, medical and structural suitability are not established.']};
}
function densityRecord(record,phase) {
 if(!record||record.phase!==phase||!['solid','melt'].includes(phase))return {valid:false,reason:'density_phase_mismatch'};
 const value=quantity(record.value),temperature=quantity(record.temperature_C),pressure=quantity(record.pressure_MPa);
 if(value===null||value<=0||!['g/cm³','g/cm3'].includes(record.unit))return {valid:false,reason:'positive_density_and_unit_required'};
 if(temperature===null||temperature<=-273.15||pressure===null||pressure<0)return {valid:false,reason:'density_conditions_required'};
 if(!text(record.source)||!text(record.material_id)||record.confirmed!==true)return {valid:false,reason:'density_identity_and_evidence_required'};
 return {valid:true,value,temperature_C:temperature,pressure_MPa:pressure,source:record.source,material_id:record.material_id,classification:'user_entered',phase,unit:'g/cm³'};
}
export function formulationDensity(recipe) {
 const pending=reason=>({value:null,unit:'g/cm³',phase:recipe?.density_phase||null,classification:'not_available',reason});
 if(!recipe?.valid)return pending('invalid_formulation');
 const phase=recipe.density_phase;
 if(recipe.density_strategy==='measured') {
  const measured=densityRecord(recipe.measured_density,phase);if(!measured.valid)return pending(measured.reason);
  if(measured.material_id!==recipe.id)return pending('measurement_belongs_to_different_formulation');
  return {...measured,classification:'user_entered',claim:'user_declared_measured',approximate:false,source_ids:[measured.source],model_id:null};
 }
 if(recipe.density_strategy!=='ideal')return pending('no_density_selected');
 const v=recipe.virgin_fraction,r=recipe.recycled_fraction;
 const active=[];
 if(v>0){const p=densityRecord(recipe.component_densities?.virgin,phase);if(!p.valid)return pending(p.reason);if(p.material_id!==recipe.virgin_reference.id)return pending('virgin_density_identity_mismatch');active.push({fraction:v,...p});}
 if(r>0){const p=densityRecord(recipe.component_densities?.recycled,phase);if(!p.valid)return pending(p.reason);if(!recipe.recycled_component.id||p.material_id!==recipe.recycled_component.id)return pending('recycled_density_identity_mismatch');active.push({fraction:r,...p});}
 if(!active.length)return pending('invalid_formulation');
 if(active.length===1)return {...active[0],classification:'user_entered',claim:'user_declared_component_value',approximate:false,source_ids:[active[0].source],model_id:null};
 if(!recipe.model_accepted)return pending('accept_model_hypotheses');
 if(recipe.recycled_component.family!==recipe.family)return pending('outside_same_family_model_scope');
 const [first,second]=active;
 if(first.phase!==second.phase||first.temperature_C!==second.temperature_C||first.pressure_MPa!==second.pressure_MPa)return pending('component_conditions_must_match');
 const denominator=active.reduce((sum,p)=>sum+p.fraction/p.value,0),value=1/denominator;
 if(!Number.isFinite(value)||value<=0)return pending('numeric_overflow');
 return {value,unit:'g/cm³',phase,temperature_C:first.temperature_C,pressure_MPa:first.pressure_MPa,classification:'documented_model_estimate',approximate:true,model_id:mixtureModel.id,equation:mixtureModel.equation,hypotheses:[...mixtureModel.hypotheses],component_values:active.map(p=>({material_id:p.material_id,value:p.value,phase:p.phase,unit:p.unit,fraction:p.fraction,source:p.source,classification:p.classification})),source_ids:active.map(p=>p.source),reference_document:'docs/etapa-3/modelos.md',reason:'ideal_estimate_not_industrially_validated'};
}
export function unsupportedMixtureProperty(recipe,key) {
 return {value:null,classification:'not_available',property:key,reason:'No documented model for these exact components and conditions. No automatic averaging or inheritance.'};
}
export const activeFormulation = state => state.formulation?.valid===true&&Number.isFinite(state.formulation.recycled_fraction)&&state.formulation.recycled_fraction>=0&&state.formulation.recycled_fraction<=1 ? state.formulation.recycled_fraction>0 : !!state.formulation_mode&&state.formulation_mode!=='virgin';
