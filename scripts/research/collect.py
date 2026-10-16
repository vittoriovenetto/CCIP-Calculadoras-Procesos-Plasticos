"""Read public documentary evidence. No authentication, paywall bypass or automatic verification.
python scripts/research/collect.py --cache /tmp/ccip-research --mode primary|search
Responses remain local; commit only curated short excerpts, hashes and findings.
"""
import argparse, concurrent.futures, datetime, hashlib, json, re, subprocess, urllib.request, urllib.parse
from html.parser import HTMLParser
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
class Text(HTMLParser):
    def __init__(self):super().__init__();self.parts=[];self.skip=0;self.links=[];self.anchor=None
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs)
        if tag in ['script','style','noscript']:self.skip+=1
        if tag in ['p','div','tr','td','th','h1','h2','h3','li','br']:self.parts.append('\n')
        if tag=='a':self.anchor={'href':attrs.get('href',''),'text':''}
    def handle_endtag(self,tag):
        if tag in ['script','style','noscript']:self.skip=max(0,self.skip-1)
        if tag=='a' and self.anchor:self.links.append(self.anchor);self.anchor=None
    def handle_data(self,data):
        if not self.skip:self.parts.append(data)
        if self.anchor:self.anchor['text']+=data

def fetch(url,cache):
    key=hashlib.sha256(url.encode()).hexdigest();meta=cache/(key+'.json')
    if meta.exists():return json.loads(meta.read_text())
    result={'url':url,'checked_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'verified':False}
    try:
        request=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 (CCIP public academic material review)'})
        with urllib.request.urlopen(request,timeout=30) as response:
            body=response.read(16_000_001)
            if len(body)>16_000_000:raise ValueError('Document exceeds 16 MB; manual review needed')
            result.update(http_status=response.status,final_url=response.url,sha256=hashlib.sha256(body).hexdigest(),bytes=len(body))
        cache.joinpath(key+'.body').write_bytes(body)
        if body.startswith(b'%PDF'):
            converted=subprocess.run(['pdftotext','-layout',str(cache/(key+'.body')),'-'],capture_output=True,text=True,check=True)
            text=converted.stdout;links=[];result['document_type']='pdf'
        elif body.lstrip().startswith((b'{',b'[')):
            text=body.decode('utf-8',errors='replace');links=[];result['document_type']='json'
        else:
            parser=Text();parser.feed(body.decode('utf-8',errors='replace'))
            text='\n'.join(re.sub('[ \t]+',' ',line).strip() for line in ''.join(parser.parts).splitlines() if line.strip());links=parser.links;result['document_type']='html'
        cache.joinpath(key+'.txt').write_text(text)
        result.update(content_read=True,text_file=key+'.txt',links=links)
    except Exception as error:result.update(content_read=False,http_status=getattr(error,'code',None),error=str(error)[:350])
    meta.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');return result

def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--cache',type=Path,required=True);parser.add_argument('--mode',choices=['primary','search','bing'],required=True);args=parser.parse_args();args.cache.mkdir(parents=True,exist_ok=True)
    catalog=json.loads((ROOT/'src/data/materials.v1.3.json').read_text())
    tasks=[]
    if args.mode=='primary':
        for key,source in {**catalog['sources'],**catalog.get('pvt_reference_sources',{})}.items():
            if source.get('url'):tasks.append({'source_id':key,'url':source['url']})
    else:
        for material in catalog['materials']:
            generic=material['record_status']=='generic_unverified'
            name=material['family'] if generic else f'"{material["grade"]}" {material["manufacturer"]}'
            intents=['recycled virgin blends experimental properties DOI'] if generic else ['technical datasheet TDS','processing guide applications','mechanical physical properties thermal','rheology MFR MVR viscosity pVT','archived datasheet revision','virgin recycled blends experimental DOI']
            for intent in intents:
                query=name+' '+intent;tasks.append({'material_id':material['id'],'intent':intent,'query':query,'url':('https://www.bing.com/search?q=' if args.mode=='bing' else 'https://www.google.com/search?q=')+urllib.parse.quote(query)})
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        results=list(pool.map(lambda task:{**task,'response':fetch(task['url'],args.cache)},tasks))
    target=args.cache/(args.mode+'-manifest.json');target.write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n');print(f'{len(results)} attempts, {sum(r["response"]["content_read"] for r in results)} read; {target}')
if __name__=='__main__':main()
