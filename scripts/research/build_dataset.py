"""Phase B: integrate explicitly reviewed manufacturer documents, never search snippets."""
import hashlib,json,re
from pathlib import Path
from extract_tables import rows_from_html
ROOT=Path(__file__).resolve().parents[2]

def build(cache):
 baseline=json.loads((ROOT/'docs/etapa-3/baseline/materials.pre-etapa3.json').read_text());docs=json.loads((ROOT/'docs/etapa-3/fase-a/documents.json').read_text());sources={};records={};decisions=[]
 for document in docs:
  mid=document['material_id'];material=next(m for m in baseline['materials'] if m['id']==mid);response=document['response'];facts=[];description=None;excerpt=None
  if document['table_candidates']:
   facts=[[p['label_original'],p['value_original'],p['unit_original'],p['condition_original'],p['method_original'],p['section_original']] for p in document['table_candidates']]
   textfile=cache/(hashlib.sha256(document['source_url'].encode()).hexdigest()+'.txt');text=textfile.read_text()
   if material['manufacturer']=='Dow':
    start=text.find('What is ');end=text.find('Properties\nKey Properties',start);description=text[start:end].strip() if start>=0 and end>start else None
   elif material['manufacturer']=='Covestro':
    start=text.find('Product description');end=text.find('Typical Values',start);description=text[start:end].strip() if start>=0 and end>start else None
   else:
    start=text.find(material['grade'].upper());description=None
  elif response.get('content_read') and material['manufacturer']=='BASF' and response.get('document_type')=='pdf':
   text=cache.joinpath(hashlib.sha256(document['source_url'].encode()).hexdigest()+'.txt').read_text();start=text.find('Test method');end=text.find('Footnotes',start);section='';description=text[text.find('Product Information'):text.find('Physical form')].strip()
   for line in text[start:end].splitlines()[1:]:
    cells=re.split(r'\s{2,}',line.strip())
    if len(cells)==1 and cells[0]:section=cells[0]
    elif len(cells)==4:
     label,method,unit,value=cells;facts.append([label,value,unit,label,method,section])
  elif response.get('content_read') and material['manufacturer']=='LyondellBasell':
   text=cache.joinpath(hashlib.sha256(document['source_url'].encode()).hexdigest()+'.txt').read_text();start=text.find('Typical Properties');end=text.find('Product Stewardship',start);lines=[x.strip() for x in text[start:end].splitlines()[1:] if x.strip()]
   for i in range(0,len(lines)-1,2):
    label,value=lines[i:i+2];facts.append([label,value,None,label,None,'Typical Properties'])
   start=text.find('Description');end=text.find('Availability',start);description=text[start:end].strip()
  elif response.get('content_read') and material['manufacturer']=='Indorama Ventures':
   text=cache.joinpath(hashlib.sha256(document['source_url'].encode()).hexdigest()+'.txt').read_text();start=text.find('HOJA DE DATOS');end=text.find('Propiedad General',start);description=text[start:end].strip()
   # PDF target/limit columns are distinct. Preserve them verbatim as documentary facts,
   # without converting min/max, tolerances or pellet-size alternatives to single values.
   section='Propiedad General — objetivo y límites originales'
   for line in text.splitlines():
    if re.match(r'\s*(Viscosidad Intrínseca|Color b|Acetaldehído|Cristalización|Humedad|Finos|Densidad|Tamaño de Chip|Punto de Fusión|Chips Amarillos)\b',line):
     cells=re.split(r'\s{2,}',line.strip());label=cells[0];rest=' | '.join(cells[1:]);facts.append([label,rest,None,'Consultar objetivo, límites y notas de la ficha',None,section])
   excerpt='Las columnas objetivo/límite y las alternativas por tamaño de pellet no se reducen a un valor único.'
  facts=list(dict.fromkeys(tuple(row) for row in facts))
  facts=[list(row) for row in facts]
  source_id='R-'+material['source_id'] if facts else None
  if source_id:
   sources[source_id]={'source_id':source_id,'manufacturer':material['manufacturer'],'grade':material['grade'],'document_name':document['title'] or text.splitlines()[0].strip() or material['grade']+' processing data sheet','url':document['source_url'],'doi':None,'document_type':response.get('document_type'),'publication_date':None,'revision':None,'consulted_on':'2026-10-16','sha256':response.get('sha256'),'verification_status':'content_reviewed_exact_grade','scope':'Manufacturer documentary values; not lot certification or industrial validation','notes':excerpt}
   if material['manufacturer']=='BASF':sources[source_id].update(publication_date='2026-09',revision='09/2026',document_name=material['grade']+' Processing Data Sheet')
   if material['manufacturer']=='Indorama Ventures':
    revision=re.search(r'Rev\.?\s*#?\s*(\d+)',text);sources[source_id]['revision']=revision[1] if revision else None;sources[source_id]['notes']='Documento histórico del fabricante; fecha/revisión tal como figura, sin afirmar vigencia comercial actual. '+(excerpt or '')
  records[mid]={'material_id':mid,'family':material['family'],'record_type':'generic_manual' if material['record_status']=='generic_unverified' else 'commercial','source_id':source_id,'description_original':description,'facts':facts,'verification':'documentary_specific_grade' if facts else 'no_additional_verified_facts','limitations':['No aplicar a otros grados, reciclados o mezclas.','No reconstruir curvas ni condiciones de ensayo ausentes.']}
  if not facts:records[mid]['limitations'].append('Fuente no accesible, evidencia insuficiente o perfil manual: se conservan datos previos sin rellenar ausencias.')
 # Grade identity is reviewed from each selected document; no alias copying across grades.
 output={'schema':'ccip-material-research/1','revision':'1.0.0','retrieved_on':'2026-10-16','sources':sources,'records':records,'classification_policy':['official_grade_specific','independent_grade_experiment','family_reference','documented_model_estimate','operating_assumption','user_entered','pending_verification','not_available'],'normalization_policy':'Original rows preserved; values with qualifiers or ambiguous units are not silently converted to exact numbers.'}
 (ROOT/'src/data/material-research.v1.json').write_text(json.dumps(output,ensure_ascii=False,separators=(',',':'))+'\n')
 current=json.loads(json.dumps(baseline));current['catalog_revision']='1.5.0';current['research_extension']={'schema':output['schema'],'file':'material-research.v1.json','revision':'1.0.0'}
 for material in current['materials']:
  record=records[material['id']];material['research_ref']=material['id']
  if record['facts']:
   old=current['sources'][material['source_id']];new_url=sources[record['source_id']]['url']
   decisions.append({'source_id':material['source_id'],'material_id':material['id'],'before':old.copy(),'after_url':new_url,'verification':'content_reviewed_exact_grade','sha256':sources[record['source_id']]['sha256'],'scope':'Source identity/content; existing fields retain their individual original provenance.'})
   old.update(url=new_url,verification_status='content_reviewed_exact_grade',last_content_review='2026-10-16')
  if material['id']=='catalog-abs-terluran-gp-35':
   for prop in material.get('additional_properties',[]):
    if prop['key']=='mfr_secondary' and prop['value']==34:
     before=prop.copy();prop.update(key='mvr_secondary',unit='cm3/10min',method='ISO 1133',condition='220 °C / 10 kg',verification_basis='official_grade_table_content_reviewed_2026-10-16')
     prop['note']='Corrección documental: MVR, no MFR. No es conversión por densidad. Estado anterior conservado en auditoría.'
     decisions.append({'material_id':material['id'],'property_key':'mvr_secondary','before':before,'after':prop.copy(),'source_id':record['source_id'],'reason':'Official table labels 34 as Melt Volume Rate, cm³/10 min, ISO 1133 at 220 °C/10 kg.'})
 (ROOT/'src/data/materials.v1.3.json').write_text(json.dumps(current,ensure_ascii=False,indent=2)+'\n')
 (ROOT/'docs/etapa-3/source-decisions.json').write_text(json.dumps(decisions,ensure_ascii=False,indent=2)+'\n')
 print(len(records),'identities;',len(sources),'reviewed sources;',sum(len(x['facts']) for x in records.values()),'documentary facts')
if __name__=='__main__':
 import argparse
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--cache',type=Path,required=True);args=parser.parse_args();build(args.cache)
