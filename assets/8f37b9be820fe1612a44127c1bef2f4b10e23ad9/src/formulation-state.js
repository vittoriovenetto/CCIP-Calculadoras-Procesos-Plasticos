import {makeFormulation,formulationDensity,activeFormulation} from './recycled.js';
export const materialFields=['meltDensity','density','bulkDensity','specificHeat','targetT','residence'];
const clone=x=>structuredClone(x);
const capture=(state,values)=>({values:Object.fromEntries(materialFields.map(k=>[k,values[k]])),provenance:Object.fromEntries(materialFields.filter(k=>state.provenance[k]).map(k=>[k,clone(state.provenance[k])])),context:clone(state.context)});
const clear=(state,values)=>{for(const key of materialFields){if(Object.hasOwn(values,key))values[key]='';delete state.provenance[key];}state.context.meltDensityVerified=false;state.context.meltDensitySource='';};
export function leaveFormulation(state,values) {
 const original=state.formulation_original_state,policy=state.context.meltDensityPolicy;clear(state,values);
 if(original){Object.assign(values,clone(original.values));Object.assign(state.provenance,clone(original.provenance));state.context={...clone(original.context),meltDensityPolicy:policy};}
 state.formulation=null;state.formulation_mode='virgin';state.formulation_input=null;state.formulation_original_state=null;delete state.formulation_property_signature;
}
export function applyFormulationInput(state,values,input,moduleId) {
 const previousActive=activeFormulation(state),grade=state.grade_snapshot;
 const recipe=makeFormulation(input,grade);recipe.density_result=formulationDensity(recipe);
 const mode=input.mode||'blend';
 const newActive=recipe.valid?recipe.recycled_fraction>0:mode!=='virgin';
 if(!previousActive&&newActive)state.formulation_original_state=capture(state,values);
 const {notes,...propertyInput}=input;
 const signature=JSON.stringify(propertyInput);
 const changed=signature!==state.formulation_property_signature;
 state.formulation_input=clone(input);state.formulation_mode=mode;state.formulation=recipe;state.formulation_property_signature=signature;
 if(!changed)return recipe;
 if(!newActive){
  if(previousActive&&state.formulation_original_state){const old=state.formulation_original_state,policy=state.context.meltDensityPolicy;clear(state,values);Object.assign(values,clone(old.values));Object.assign(state.provenance,clone(old.provenance));state.context={...clone(old.context),meltDensityPolicy:policy};}
  return recipe;
 }
 clear(state,values);
 const density=recipe.density_result;
 if(!recipe.valid||density.value===null||moduleId==='secado')return recipe;
 const field=moduleId==='inyeccion'?(density.phase==='melt'?'meltDensity':null):['extrusion','pelicula','soplado','termoformado'].includes(moduleId)&&density.phase==='solid'?'density':null;
 if(!field)return recipe;
 values[field]=density.value;
 const sourceTitle=(density.source_ids||[]).join(' · ');
 state.provenance[field]={origin:density.approximate?'mixture_model':'user_custom',formulation_id:recipe.id,grade_id:null,property_key:density.phase==='melt'?'melt_density':'solid_density',phase:density.phase==='melt'?'fundido':'sólido',unit:'g/cm3',value:density.value,source_id:density.model_id||'user-formulation-assay',source:{title:sourceTitle,description:sourceTitle,classification:'user_entered'},reference:{...clone(density),value:density.value,unit:'g/cm3',status:'user_entered',conditions:{temperature_C:density.temperature_C,pressure_MPa:density.pressure_MPa},classification:density.classification}};
 if(field==='meltDensity'){state.context.pvtTemperatureC=String(density.temperature_C);state.context.pvtPressureMPa=String(density.pressure_MPa);state.context.meltDensitySource=sourceTitle;state.context.meltDensityVerified=!density.approximate;}
 return recipe;
}
