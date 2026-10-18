// El índice de fluidez es una medición a T/carga/método; no es viscosidad.
const number=x=>typeof x==='number'&&Number.isFinite(x);
export function testConditions(text='') {
 const temp=String(text).match(/(-?\d+(?:[.,]\d+)?)\s*°\s*C/),load=String(text).match(/(\d+(?:[.,]\d+)?)\s*kg/);
 return {temperature_C:temp?Number(temp[1].replace(',','.')):null,load_kg:load?Number(load[1].replace(',','.')):null};
}
export function measurementKind(label='') {
 if(/melt.?volume|\bMVR\b/i.test(label))return 'MVR';
 if(/melt.?mass|melt flow|melt index|\bMFR\b|\bMFI\b/i.test(label))return 'MFR';
 return null;
}
export function compareFlow(a,b) {
 if(!a||!b)return {status:'pending',reason:'select_measurements',difference:null};
 if(a.kind!==b.kind||a.unit!==b.unit)return {status:'incompatible',reason:'different_quantity',difference:null};
 if(a.family!==b.family)return {status:'incompatible',reason:'different_family',difference:null};
 for(const key of ['temperature_C','load_kg']) {
  if(!number(a[key])||!number(b[key]))return {status:'pending',reason:'missing_test_conditions',difference:null};
  if(a[key]!==b[key])return {status:'incompatible',reason:'different_test_conditions',difference:null};
 }
 if(!a.standard||!b.standard)return {status:'pending',reason:'missing_method',difference:null};
 if(a.standard!==b.standard)return {status:'incompatible',reason:'different_method',difference:null};
 for(const [key,reason]of [['region','different_region'],['variant','different_variant'],['sample_state','different_sample_state']])if(a[key]&&b[key]&&a[key]!==b[key])return {status:'incompatible',reason,difference:null};
 if(a.sku&&b.sku&&a.sku!==b.sku)return {status:'incompatible',reason:'different_commercial_identity',difference:null};
 const warnings=[];
 if((a.region||b.region)&&(!a.region||!b.region))warnings.push('region_unknown');
 if((Object.hasOwn(a,'variant')||Object.hasOwn(b,'variant'))&&(!a.variant||!b.variant))warnings.push('variant_not_specified');
 if(a.classification==='pending_verification'||b.classification==='pending_verification')warnings.push('measurement_not_reconfirmed');
 if(!a.standard_edition||!b.standard_edition)warnings.push('standard_edition_unknown');
 else if(a.standard_edition!==b.standard_edition)return {status:'incompatible',reason:'different_standard_edition',difference:null};
 if(!a.preconditioning||!b.preconditioning)warnings.push('preconditioning_unknown');
 else if(a.preconditioning!==b.preconditioning)return {status:'incompatible',reason:'different_preconditioning',difference:null};
 if(!number(a.value)||!number(b.value))return {status:'pending',reason:'non_exact_measurements',difference:null};
 if(warnings.length)return {status:'conditional',reason:'declared_conditions_match_details_missing',warnings,difference:null};
 return {status:'compatible',reason:'documented_conditions_match',warnings:[],difference:b.value-a.value};
}
export function mvrToMfr(measurement,density) {
 const pending=reason=>({value:null,unit:'g/10 min',reason});
 if(measurement?.kind!=='MVR'||measurement.unit!=='cm³/10 min'||!number(measurement.value)||measurement.value<0)return pending('invalid_mvr');
 if(!density||density.phase!=='melt'||density.unit!=='g/cm³'||!number(density.value)||density.value<=0)return pending('requires_melt_density');
 if(!['official_grade_specific','independent_grade_experiment'].includes(density.classification)||density.validated!==true||density.material_id!==measurement.material_id)return pending('requires_validated_grade_density');
 if(!density.source_id)return pending('requires_density_source');
 for(const key of ['temperature_C','pressure_MPa'])if(!number(measurement[key])||!number(density[key])||measurement[key]!==density[key])return pending('requires_matching_density_conditions');
 const value=measurement.value*density.value;
 return number(value)?{value,unit:'g/10 min',reason:'conversion_with_validated_melt_density',density_source_id:density.source_id}:pending('numeric_overflow');
}
export function processRecommendations(data,materialId,processId) {
 return (data?.recommendations||[]).filter(r=>r.material_id===materialId&&(!processId||r.process_id===processId));
}
