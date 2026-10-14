"""Read declared sources; never mark a grade verified from a URL or a text match.
Usage: python3 scripts/audit-material-sources.py --output /tmp/ccip-sources.json
Downloaded content is temporary; only URL/status/hash/match-candidate are saved.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
from pathlib import Path
import re
import subprocess
import tempfile
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--output', type=Path, default=Path('/tmp/ccip-sources.json'))
args = parser.parse_args()
catalog = json.loads((ROOT/'src/data/materials.v1.3.json').read_text())
urls = list(dict.fromkeys([s['url'] for s in catalog['sources'].values() if s.get('url')] +
                         [s['url'] for s in catalog.get('pvt_reference_sources',{}).values() if s.get('url')] +
                         ['https://www.bipm.org/en/publications/si-brochure']))

def fetch(url):
    result = {'url':url,'confirmed':False}
    try:
        request = urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0 (CCIP documentary audit)'})
        with urllib.request.urlopen(request, timeout=20) as response:
            body = response.read(16_000_001)
            if len(body) > 16_000_000:
                return {**result,'access_result':'Response exceeds 16 MB; manual review required'}
            result.update(http_status=response.status,final_url=response.url,sha256=hashlib.sha256(body).hexdigest())
            text = body.decode('utf-8',errors='replace')
            if body.startswith(b'%PDF'):
                with tempfile.TemporaryDirectory(prefix='ccip-source-') as directory:
                    document = Path(directory)/'source.pdf';document.write_bytes(body)
                    converted = subprocess.run(['pdftotext','-layout',str(document),'-'],capture_output=True,text=True)
                    text = converted.stdout if converted.returncode==0 else ''
            normalized = re.sub(r'[^a-z0-9]','',text.lower())
            candidates = []
            for material in catalog['materials']:
                if catalog['sources'][material['source_id']].get('url') == url:
                    name = re.sub(r'[^a-z0-9]','',material['grade'].lower())
                    if name and name in normalized:candidates.append(material['id'])
            result.update(access_result='Read; manual review of identity/family/properties still required',text_match_candidates=candidates)
    except Exception as error:
        result.update(http_status=getattr(error,'code',None),access_result=str(error)[:300])
    return result

with ThreadPoolExecutor(max_workers=8) as pool:
    results = list(pool.map(fetch,urls))
args.output.write_text(json.dumps({'policy':'A text match is a candidate, not verification. Confirm exact grade, manufacturer, family, revision, values and conditions manually.','requests':results},ensure_ascii=False,indent=2)+'\n')
print(f'{len(results)} declared URLs checked. Report: {args.output}. No catalog property changed.')
