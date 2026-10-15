import { safeSourceUrl } from './materials.js';

const numeric = (p,unit) => {
  const valid=x=>Number.isFinite(x)&&(unit==='°C'?x>-273.15:x>0);
  return p && p.unit===unit && (valid(p.value) || Array.isArray(p.range)&&p.range.length===2&&p.range.every(valid)&&p.range[0]<=p.range[1]);
};
export function hasDryingGuideline(material,sources) {
  if (!material || material.record_status==='generic_unverified') return false;
  return [['drying_time','h'],['drying_temperature','°C']].every(([key,unit])=>{
    const p=material.properties?.[key],source=sources?.[p?.source_id];
    return numeric(p,unit) && ['manufacturer_typical','manufacturer_recommendation','user_entered'].includes(p.status) &&
      (material.record_status==='user_entered_unverified'
        ? typeof p.evidence?.description==='string' && p.evidence.description.trim().length>0 && p.evidence.description!=='Datos introducidos por usuario'
        : !!safeSourceUrl(source?.url));
  });
}
export const materialCatalogFor = (library,moduleId) => !library || moduleId!=='secado' ? library :
  {...library,materials:library.materials.filter(m=>hasDryingGuideline(m,library.sources))};
export const enableLeanMaterial = state => {
  state.context.leanInterface=true;
  state.context.familyMeltReferenceMode='automatic';
  return state;
};
