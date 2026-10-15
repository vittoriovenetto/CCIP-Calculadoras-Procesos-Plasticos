/**
 * Filtro de catálogo sin cálculos ni cambios de datos.
 * Busca por familia, fabricante y grado (insensible a acentos).
 * Los genéricos siguen siendo seleccionables incluso sin ficha.
 */
export const norm = value => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("es").trim();
export const documentedCount = material => Object.values(material?.properties || {}).filter(p =>
  p && typeof p === "object" && ((typeof p.value === "number" && Number.isFinite(p.value)) ||
  (Array.isArray(p.range) && p.range.length === 2 && p.range.every(v => typeof v === "number" && Number.isFinite(v)) && p.range[0] <= p.range[1]))
).length;
export function searchMaterials(materials, {query="",family="",manufacturer="",onlyWithData=false}={}) {
 const terms=norm(query).split(/\s+/).filter(Boolean);
 return (Array.isArray(materials)?materials:[]).filter(m=>{
   if(family && m.family!==family) return false;
   if(manufacturer && m.manufacturer!==manufacturer) return false;
   if(onlyWithData && documentedCount(m)===0)return false;
   const haystack=norm([m.family,m.manufacturer,m.grade,m.id].join(" "));
   return terms.every(t=>haystack.includes(t));
 }).sort((a,b)=>{
   const ga=a.record_status==="generic_unverified",gb=b.record_status==="generic_unverified";
   if(ga!==gb)return ga?-1:1;
   const ac=documentedCount(a),bc=documentedCount(b);
   if(ac!==bc)return bc-ac;
   return [a.family,a.grade].join("/").localeCompare([b.family,b.grade].join("/"),"es");
 });
}