// Whitelisted user data only. Neither local imports nor form fields confer approval.
export const USER_CATEGORY='Agregado por usuarios';
export const MATERIAL_KINDS=['virgin','recycled','blend','unspecified'];
export const USER_ORIGINS=['PIR','PCR','internal_regrind','commercial_recycled','not_specified'];
export const USER_PROCESSES=['inyeccion','extrusion','pelicula','soplado','termoformado','secado','costos'];
export const EXTRA_NUMERICS={tensile_strength:['Resistencia a tracción','MPa',10000],tensile_modulus:['Módulo de tracción','MPa',1000000],flexural_strength:['Resistencia a flexión','MPa',10000],flexural_modulus:['Módulo de flexión','MPa',1000000],elongation_break:['Elongación a rotura','%',10000],impact_strength:['Resistencia al impacto','kJ/m2',10000],hardness_shore_d:['Dureza Shore D','Shore D',100],glass_transition_temperature:['Temperatura de transición vítrea','°C',1000],crystallization_temperature:['Temperatura de cristalización','°C',1000],heat_deflection_temperature:['Temperatura de deflexión térmica','°C',1000],vicat_temperature:['Temperatura Vicat','°C',1000],thermal_conductivity:['Conductividad térmica','W/m·K',1000]};
export const EXTRA_UNITS=Object.fromEntries(Object.entries(EXTRA_NUMERICS).map(([key,[,unit]])=>[key,['tensile_strength','tensile_modulus','flexural_strength','flexural_modulus'].includes(key)?['MPa','GPa']:unit==='°C'?['°C','K']:[unit]]));
const error=()=>{throw Error('Metadatos de material no válidos.');};
export function detailText(value,max=500){if(value===undefined||value===null)return '';if(typeof value!=='string'||value.length>max)error();return value.trim();}
export function optionalQuantity(value,min,max){if(value===undefined||value===null||value==='')return null;if(!['number','string'].includes(typeof value)||!String(value).trim())error();const n=Number(value);if(!Number.isFinite(n)||n<min||n>max)error();return n;}
export function userDetails(form){
 const input=form.user_details||form;
 if(typeof input!=='object'||Array.isArray(input))error();
 const material_kind=input.material_kind||'unspecified',origin=input.origin||'not_specified';
 if(!MATERIAL_KINDS.includes(material_kind)||!USER_ORIGINS.includes(origin))error();
 const applications=input.applications||[];if(!Array.isArray(applications)||applications.length>7||applications.some(x=>!USER_PROCESSES.includes(x)))error();
 return {subfamily:detailText(input.subfamily,100),code:detailText(input.code,100),material_kind,lot:detailText(input.lot,100),origin,provenance:detailText(input.provenance,1000),formulation:detailText(input.formulation,1000),physical_form:detailText(input.physical_form,100),applications:[...new Set(applications)],observations:detailText(input.observations,2000),verification_declaration:input.verification_declaration===true};
}
export function testDetails(form,key){
 const input=form[key+'_test_details']||{};if(typeof input!=='object'||Array.isArray(input))error();
 const get=name=>form[key+'_'+name]??input[name];
 const date=detailText(get('test_date'),40);if(date&&!/^\d{4}-\d{2}-\d{2}$/.test(date))error();
 return {standard:detailText(get('standard'),160),temperature_C:optionalQuantity(get('temperature_C'),-273.149999,2000),pressure_MPa:optionalQuantity(get('pressure_MPa'),0,10000),load_kg:optionalQuantity(get('load_kg'),0,10000),preconditioning:detailText(get('preconditioning'),500),sample_state:detailText(get('sample_state'),200),test_date:date||null};
}
export function validRevision(value){const n=value??1;if(!Number.isSafeInteger(n)||n<1||n>1000000)error();return n;}
export function validTimestamp(value,nullable=false){if(nullable&&(value===null||value===undefined))return null;if(typeof value!=='string'||value.length>40||!Number.isFinite(Date.parse(value)))error();return value;}
