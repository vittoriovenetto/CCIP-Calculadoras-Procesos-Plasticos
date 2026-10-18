// Extension documental independiente del motor. Una fila conserva los seis campos
// originales [propiedad, valor, unidad, condición, método, grupo].
export const evidenceKinds = Object.freeze(['official_grade_specific','independent_grade_experiment','family_reference','documented_model_estimate','operating_assumption','user_entered','pending_verification','not_available']);
export const researchSchema = 'ccip-material-research/1';
const units = {'g/cm3':'g/cm³','g/cm³':'g/cm³','kg/m³':'kg/m³','cm³/10 min':'cm³/10 min','cm3/10min':'cm³/10 min','cm³/10min':'cm³/10 min','g/10 min':'g/10 min','g/10min':'g/10 min'};
export function normalizeDocumentedValue(row) {
 const [label,raw,declaredUnit,condition,method,group] = row;
 let unit=units[declaredUnit]||declaredUnit||'', value=String(raw??'').trim().replaceAll('\u2212','-').replaceAll('\u00a0',' ');
 let assumption=null;
 if(!unit) {
  const combined=label+' '+raw;
  if(/g\/cm[³3]/i.test(combined))unit='g/cm³';
  else if(/g\/10\s*min/i.test(combined))unit='g/10 min';
  else if(/cm[³3]\/10\s*min/i.test(combined))unit='cm³/10 min';
  else if(/in MPa|\bMPa\b/.test(combined))unit='MPa';
  else if(/°C/.test(label))unit='°C';
  else if(/\b%\b|%/.test(raw))unit='%';
 }
 const parsed={value:null,range:null,bound:null,unit,available:false,classification:'official_grade_specific',original:row};
 if(/Shore\s*D/i.test(label)&&Number(value)>100)return {...parsed,classification:'pending_verification',issue:'shore_scale_out_of_bounds'};
 // Campos sin unidad verificable y códigos de rotura (N, P, C) se mantienen textuales.
 if(!unit||unit==='-'&&!/Polymer|Abbreviation/i.test(label))return {...parsed,text:raw};
 value=value.replace(/(?<=\d),(?=\d{3}(?:\D|$))/g,'');
 const number='[+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)';
 const range=value.match(new RegExp('^('+number+')\\s*[-–]\\s*('+number+')$'));
 const bound=value.match(new RegExp('^([<>≤≥])\\s*('+number+')$'));
 if(range){const limits=[Number(range[1]),Number(range[2])];if(limits[0]<=limits[1])return {...parsed,range:limits,available:true};}
 if(bound)return {...parsed,bound:{operator:bound[1],value:Number(bound[2])},available:true};
 // Valor único, permitiendo unidad explícita o una columna imperial entre paréntesis.
 const exact=value.match(new RegExp('^('+number+')(?:\\s+([^]*))?$'));
 if(!exact)return {...parsed,text:raw};
 if(exact[2]&&!/^(?:%$)|^\(|^(?:g\/cm[³3]|g\/10\s*min|cm[³3]\/10\s*min|MPa|°C|%|kg\/m[³3]|kJ\/m[²2]|J\/m|hr|h|min|N|mm)\b/.test(exact[2]))return {...parsed,text:raw};
 if(/\(\d/.test(exact[2]||''))assumption='SI value retained; imperial alternative preserved in original text';
 if(/Impact/i.test(label)&&/in MPa/i.test(label)&&/kJ\/m/.test(value))return {...parsed,text:raw,classification:'pending_verification',issue:'label_value_unit_disagreement'};
 return {...parsed,value:Number(exact[1]),available:true,normalization_note:assumption};
}
export function validateResearch(data,catalog) {
 if(!data||data.schema!==researchSchema||!data.records||!data.sources)throw Error('Invalid research dataset');
 const ids=new Set(catalog.materials.map(m=>m.id));
 if(Object.keys(data.records).length!==ids.size)throw Error('Research identity set differs from catalog');
 for(const [id,record] of Object.entries(data.records)) {
  if(!ids.has(id)||record.material_id!==id||!Array.isArray(record.facts))throw Error('Invalid research identity');
  const grade=catalog.materials.find(m=>m.id===id);
  if(record.facts.length&&grade.record_status==='generic_unverified')throw Error('Generic profile cannot have grade-specific properties');
  if(record.facts.length&&!data.sources[record.source_id])throw Error('Missing documentary source');
  if(record.facts.length){const source=data.sources[record.source_id];if(source.grade!==grade.grade||source.manufacturer!==grade.manufacturer||record.family!==grade.family)throw Error('Document belongs to a different grade');}
  for(const row of record.facts)if(!Array.isArray(row)||row.length!==6||row.some(x=>x!==null&&typeof x!=='string'))throw Error('Invalid original documentary row');
 }
 return data;
}
export function researchSnapshot(data,materialId) {
 const record=data?.records?.[materialId];if(!record)return null;
 return structuredClone({schema:data.schema,revision:data.revision,...record,source:record.source_id?data.sources[record.source_id]:null});
}
