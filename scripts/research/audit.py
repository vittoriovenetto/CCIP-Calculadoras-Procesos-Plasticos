"""Reproducible phase-A inventory: reads cached evidence; never changes active material data."""
import argparse,csv,datetime,hashlib,json,re
from pathlib import Path
from extract_tables import rows_from_html
ROOT=Path(__file__).resolve().parents[2]
BASE='fdf3a27eca518fe600b07d236e78b334db554232'

def numeric(p):
 return isinstance(p,dict) and (isinstance(p.get('value'),(int,float)) and not isinstance(p.get('value'),bool) or isinstance(p.get('range'),list) and len(p['range'])==2 and all(isinstance(x,(int,float)) and not isinstance(x,bool) for x in p['range']))
def properties(m):return [(k,p) for k,p in m['properties'].items() if numeric(p)]+[(p['key'],p) for p in m.get('additional_properties',[]) if numeric(p)]
def csv_file(path,rows):
 if not rows:return
 with path.open('w',newline='') as out:
  writer=csv.DictWriter(out,fieldnames=list(rows[0]));writer.writeheader()
  for row in rows:writer.writerow({k:json.dumps(v,ensure_ascii=False) if isinstance(v,(list,dict)) else v for k,v in row.items()})
def write(path,data):path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
def main():
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--cache',type=Path,required=True);parser.add_argument('--output',type=Path,required=True);args=parser.parse_args();args.output.mkdir(parents=True,exist_ok=True)
 raw=(ROOT/'docs/etapa-3/baseline/materials.pre-etapa3.json').read_bytes();catalog=json.loads(raw);current=json.loads((ROOT/'src/data/materials.v1.3.json').read_text())
 requests={}
 for path in args.cache.glob('*.json'):
  if path.name.endswith('-manifest.json'):continue
  data=json.loads(path.read_text())
  if isinstance(data,dict) and 'url' in data:requests[data['url']]={k:v for k,v in data.items() if k not in ['links','text_file']}
 alternatives={
 'catalog-pc-makrolon-2807':'https://solutions.covestro.com/en/products/makrolon/makrolon-2807_000000000086287188',
 'catalog-pp-moplen-hp648t':'https://www.lyondellbasell.com/en/polymers/p/Moplen-HP648T/5feb890b-a3a7-48df-a187-25d2dc1d7b80',
 'ineos-styrolution-terluran-gp-22':'https://eshop.ineos-styrolution.com/Product/Terluran_TERLURAN-GP-22_SKU300600120827.html',
 'catalog-abs-novodur-h605':'https://eshop.ineos-styrolution.com/Product/Novodur-High-Heat_NOVODUR-H605_SKU302200150405.html',
 'catalog-abs-novodur-p2mc':'https://eshop.ineos-styrolution.com/Product/Novodur_Novodur-P2MC_SKU302100140449.html'}
 searches=[]
 for name in ['search','bing','focused-search']:
  path=args.cache/(name+'-manifest.json')
  if path.exists():
   for row in json.loads(path.read_text()):searches.append({k:v for k,v in row.items() if k!='response'}|{'engine':'Google' if name=='search' else 'Bing','http_status':row['response'].get('http_status'),'sha256':row['response'].get('sha256'),'review_status':'search_response_only_not_property_evidence'})
 records=[];documents=[];flow=[];recommendations=[]
 for material in catalog['materials']:
  generic=material['record_status']=='generic_unverified';prior=properties(material);source=catalog['sources'][material['source_id']];url=alternatives.get(material['id'],source.get('url'));response=requests.get(url,{})
  key=hashlib.sha256((url or '').encode()).hexdigest();meta=args.cache/(key+'.json');full=json.loads(meta.read_text()) if meta.exists() else {}
  data=rows_from_html((args.cache/(key+'.body')).read_bytes(),material['manufacturer']) if full.get('content_read') and full.get('document_type')=='html' else {'title':None,'rows':[]}
  text=args.cache/(key+'.txt');text=text.read_text() if text.exists() else ''
  # No verification bit is set by this extractor: exact-identity and property review is explicit in phase B.
  documents.append({'material_id':material['id'],'source_id':material['source_id'],'source_url':url,'response':response,'title':data['title'],'excerpt':text[:350] if full.get('document_type')=='pdf' else None,'table_candidates':data['rows'],'review_state':'content_located_pending_property_integration' if full.get('content_read') else 'inaccessible_or_manual_profile'})
  missing=[key for key,value in material['properties'].items() if value is None]
  records.append({'id':material['id'],'family':material['family'],'manufacturer':material['manufacturer'],'grade':material['grade'],'record_type':'generic_manual' if generic else 'commercial','record_status':material['record_status'],
   'properties_original':material['properties'],'additional_properties_original':material.get('additional_properties',[]),'initial_numeric_fields':len(prior),'new_properties':0,'corrected_properties':0,'pending_primary_properties':missing,'pending_primary_count':len(missing),
   'candidate_rows_found':len(data['rows']),'declared_sources':list(dict.fromkeys([material['source_id']]+[p['source_id'] for _,p in prior])), 'source_url_original':source.get('url'),'source_url_candidate':url,'source_verification_original':source.get('verification_status'),
   'source_content_read':full.get('content_read',False),'documentary_verification_this_phase':'not_certified_by_extractor','process_tags_original':material['process_tags'],'process_compatibility_this_phase':'not_revalidated','search_attempts':sum(s['material_id']==material['id'] for s in searches),'research_status':'generic_family_review' if generic else 'individual_search_and_document_review_partial_evidence',
   'limitations':'No se garantiza localizar toda publicación existente. Los resultados de buscador, DOI o un HTTP 200 no verifican propiedades. Las carencias permanecen pendientes.'})
  for key,p in prior:
   if re.fullmatch(r'm[ fv]r(?:_secondary)?'.replace(' ',''),key):
    condition=p.get('condition') or '';t=re.search(r'(-?\d+(?:[.,]\d+)?)\s*°\s*C',condition);load=re.search(r'(\d+(?:[.,]\d+)?)\s*kg',condition)
    flow.append({'material_id':material['id'],'property_key_original':key,'kind_recorded':'MVR' if key.startswith('mvr') else 'MFR','value':p.get('value'),'range':p.get('range'),'unit':p['unit'],'temperature_C':float(t[1].replace(',','.')) if t else None,'load_kg':float(load[1].replace(',','.')) if load else None,'method_declared':p.get('method'),'standard_edition':None,'preconditioning':None,'condition_original':condition,'source_id':p['source_id'],'verification':'prior_catalog_not_reconfirmed','conversion_performed':False})
  for process in material['process_tags']:recommendations.append({'material_id':material['id'],'process_tag':process,'scope':'generic_profile' if generic else 'previous_catalog_claim','source_id':material['source_id'],'numeric_mfr_range':None,'verification':'not_revalidated_in_phase_A'})
 ids={m['id'] for m in current['materials']};baseline_ids={m['id'] for m in catalog['materials']}
 summary={'base_commit':BASE,'baseline_sha256':hashlib.sha256(raw).hexdigest(),'materials':len(records),'commercial':sum(r['record_type']=='commercial' for r in records),'generic_manual':sum(r['record_type']=='generic_manual' for r in records),'numeric_fields_original':sum(r['initial_numeric_fields'] for r in records),'candidate_rows':sum(r['candidate_rows_found'] for r in records),'executed_search_requests':len(searches),'new_properties':0,'corrected_properties':0,'active_catalog_byte_identical':raw==(ROOT/'src/data/materials.v1.3.json').read_bytes(),'removed_ids':sorted(baseline_ids-ids),'added_ids':sorted(ids-baseline_ids),'phase':'A — inventory and evidence collection; B/E not implied complete'}
 write(args.output/'inventory.json',records);write(args.output/'documents.json',documents);write(args.output/'searches.json',searches);write(args.output/'requests.json',list(requests.values()));write(args.output/'flow-before.json',flow);write(args.output/'processes-before.json',recommendations);write(args.output/'summary.json',summary)
 simple=[{k:v for k,v in r.items() if k not in ['properties_original','additional_properties_original']} for r in records];csv_file(args.output/'inventory.csv',simple);csv_file(args.output/'flow-before.csv',flow);csv_file(args.output/'processes-before.csv',recommendations)
 md=['# Fase A — inventario y evidencia documental','',f'Base: `{BASE}`. Copia anterior SHA-256: `{summary["baseline_sha256"]}`.','',f'{summary["materials"]} entradas: {summary["commercial"]} comerciales y {summary["generic_manual"]} genéricas. {summary["numeric_fields_original"]} campos numéricos originales. {summary["candidate_rows"]} filas candidatas localizadas; no son valores automáticamente certificados.','',f'{len(searches)} solicitudes de búsqueda registradas. Algunos resultados no son pertinentes y Google requiere JavaScript; no se usan como evidencia numérica.','', '| ID | Familia | Grado | Campos previos | Filas candidatas | Contenido fuente | Búsquedas |','|---|---|---|---:|---:|---|---:|']
 md += [f'| {r["id"]} | {r["family"]} | {r["grade"]} | {r["initial_numeric_fields"]} | {r["candidate_rows_found"]} | {"Leído; revisar evidencia" if r["source_content_read"] else "Sin contenido / perfil manual"} | {r["search_attempts"]} |' for r in records]
 md+=['','El catálogo activo sigue intacto en esta fase. Los nuevos hechos se integrarán únicamente tras revisar identidad, unidad, método, condiciones y procedencia. Los nueve genéricos continúan sin propiedades de grado.','', 'GP-35: la tabla inicial ISO/EMEA publica MVR 34 cm³/10 min (220 °C/10 kg). La revisión regional posterior confirma también MFR 34 ASTM/Américas. Conservar ambos registros y su contexto; no concluir un error universal. Ver gp35-regional-review.md.','', 'Fuentes con 403/404/503 y DOI sin texto consultable quedan pendientes; no se declara un grado inexistente a partir de un fallo de acceso.']
 (args.output/'README.md').write_text('\n'.join(md)+'\n');print(json.dumps(summary,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
