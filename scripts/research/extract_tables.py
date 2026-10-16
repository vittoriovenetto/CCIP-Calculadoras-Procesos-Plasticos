"""Extract review candidates from downloaded manufacturer tables. Never certifies values."""
import argparse, hashlib, json, re
from pathlib import Path
from bs4 import BeautifulSoup

def rows_from_html(body,manufacturer):
 soup=BeautifulSoup(body,'html.parser');rows=[]
 for index,table in enumerate(soup.find_all('table')):
  heading=table.find_previous(['h2','h3','h4','h5']);section=heading.get_text(' ',strip=True) if heading else ''
  for tr in table.find_all('tr'):
   cells=[re.sub(r'\s+',' ',c.get_text(' ',strip=True)).strip() for c in tr.find_all(['td','th'],recursive=False)]
   if len(cells)==1:section=cells[0];continue
   if not cells or cells[0].lower().startswith(('property','key properties','typical properties')):continue
   if manufacturer=='Covestro' and len(cells)==5:label,condition,value,unit,method=cells
   elif manufacturer=='INEOS Styrolution' and len(cells)==4:label,method,unit,value=cells;condition=label
   elif manufacturer=='Dow' and len(cells)==2:label,value=cells;condition=label;unit=None;method=None
   else:continue
   if label and value:rows.append({'label_original':label,'value_original':value,'unit_original':unit,'method_original':method,'condition_original':condition,'section_original':section,'table_index':index,'review_state':'candidate_not_verified'})
 return {'title':soup.title.get_text(' ',strip=True) if soup.title else None,'rows':rows}

def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--cache',type=Path,required=True);p.add_argument('--catalog',type=Path,default=Path('src/data/materials.v1.3.json'));p.add_argument('--output',type=Path,required=True);args=p.parse_args()
 catalog=json.loads(args.catalog.read_text());documents=[]
 for material in catalog['materials']:
  if material['record_status']=='generic_unverified':continue
  source=catalog['sources'][material['source_id']];key=hashlib.sha256(source.get('url','').encode()).hexdigest();meta=args.cache/(key+'.json')
  response=json.loads(meta.read_text()) if meta.exists() else {}
  data=rows_from_html((args.cache/(key+'.body')).read_bytes(),material['manufacturer']) if response.get('content_read') and response.get('document_type')=='html' else {'title':None,'rows':[]}
  documents.append({'material_id':material['id'],'grade':material['grade'],'family':material['family'],'manufacturer':material['manufacturer'],'source_id':material['source_id'],'url':source.get('url'),'sha256':response.get('sha256'),'content_read':response.get('content_read',False),'document_type':response.get('document_type'),'response':{k:v for k,v in response.items() if k not in ['links']},**data})
 args.output.write_text(json.dumps(documents,ensure_ascii=False,indent=2)+'\n')
 print(len(documents),'individual entries;',sum(len(x['rows']) for x in documents),'candidate rows, not automatically verified')
if __name__=='__main__':main()
