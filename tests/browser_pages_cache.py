"""Verifica el artefacto Pages incluso con recursos antiguos en caché.
Ejecutar después de npm run build:pages: python3 tests/browser_pages_cache.py
"""
import functools
import json
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import threading
import shutil
from urllib.parse import urlparse

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass


server = ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(QuietHandler, directory=str(ROOT)))
threading.Thread(target=server.serve_forever, daemon=True).start()
try:
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=os.environ.get('CCIP_CHROMIUM') or shutil.which('chromium') or shutil.which('chromium-browser'))
        for width in (390, 768, 1440):
            context = browser.new_context(viewport={'width': width, 'height': 1000})
            page = context.new_page()
            errors, stale_requests = [], []
            page.on('pageerror', lambda e: errors.append(str(e)))

            def stale_cache(route):
                path = urlparse(route.request.url).path
                if path.startswith('/dist/src/'):
                    stale_requests.append(path)
                    old = ROOT / 'versions/antes-lean-2026-10-15' / path.removeprefix('/dist/')
                    route.fulfill(path=str(old))
                else:
                    route.continue_()

            page.route('**/*', stale_cache)
            page.goto(f'http://127.0.0.1:{server.server_port}/dist/', wait_until='networkidle')
            page.locator('#material-family:not([disabled])').wait_for()
            for level in ('basic', 'technical', 'advanced'):
                page.locator('#level').select_option(level)
                page.locator('#material-family').select_option('HDPE')
                assert page.locator('#material-manufacturer').is_visible()
                assert page.locator('#material-grade').is_visible()
                assert page.locator('#material-grade').input_value() == 'generic-hdpe'
                assert page.locator('#materials').bounding_box()['y'] < page.locator('#calculation-grid').bounding_box()['y']
                if level != 'basic':
                    assert page.locator('[data-field="meltDensity"]').input_value() == '0.73'
            page.locator('#learn-page').click()
            assert page.locator('#learning-view').is_visible()
            page.go_back()
            assert page.locator('#material-family').input_value() == 'HDPE'
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            if width == 1440:
                assert page.locator('#calculator-view > .bar').evaluate('el => getComputedStyle(el).display') == 'flex'
            # Las dependencias diferidas también deben resolver dentro del SHA del artefacto.
            for fmt,magic in [('xlsx',b'PK'),('pdf',b'%PDF')]:
                page.locator('#export-format').select_option(fmt)
                with page.expect_download(timeout=90000) as download:
                    page.locator('#export').click()
                assert Path(download.value.path()).read_bytes().startswith(magic)
                page.wait_for_function("!document.getElementById('export').disabled")
            page.locator('#research-details > summary').click()
            page.locator('#research-flow').wait_for()
            page.locator('#material-origin').select_option('blend')
            assert page.locator('[data-field="meltDensity"]').input_value() == ''
            assert page.locator('#blend-ratio').input_value() == '80/20'
            page.locator('#materials-page').click()
            page.locator('#explorer-query').wait_for()
            page.locator('#explorer-query').fill('Terluran GP-35')
            page.locator('[data-entry="catalog-abs-terluran-gp-35"]').click()
            page.locator('#explorer-ficha h2').wait_for()
            assert 'MFR' in page.locator('#explorer-ficha').inner_text()
            assert 'MVR' in page.locator('#explorer-ficha').inner_text()
            with page.expect_download(timeout=90000) as download:
                page.locator('[data-export=ficha][data-format=xlsx]').click()
            assert Path(download.value.path()).read_bytes().startswith(b'PK')
            page.locator('#materials-back').click()
            assert page.locator('#blend-ratio').input_value() == '80/20'
            # The new library and its lazy exporters must use the same versioned tree.
            page.locator('#machines-page').click()
            page.locator('#machine-query').fill('XH430B25')
            page.locator('[data-machine-card="xihua-xh-430b-25"] [data-machine-route]').first.click()
            page.locator('[data-machine-detail="xihua-xh-430b-25"]').wait_for()
            for fmt,magic in [('json',None),('pdf',b'%PDF')]:
                with page.expect_download(timeout=90000) as download:
                    page.locator(f'[data-machine-export=datasheet][data-format={fmt}]').click()
                content=Path(download.value.path()).read_bytes()
                if magic:assert content.startswith(magic)
                else:
                    record=json.loads(content)
                    assert record['schema']=='ccip-machine-report/1'
                    assert record['machines'][0]['id']=='xihua-xh-430b-25'
            page.locator('#machines-back').click()
            assert page.locator('#blend-ratio').input_value() == '80/20'
            picker=page.locator('#process-select')
            if picker.is_visible():picker.select_option('secado')
            else:page.locator('[data-module="secado"]').click()
            page.locator('#material-family').select_option('PA6')
            page.locator('#material-manufacturer').select_option('BASF')
            page.locator('#material-grade').select_option('basf-ultramid-b3s-r03')
            assert page.locator('#field-throughput').input_value()==''
            assert page.locator('#field-startT').input_value()=='25'
            assert page.locator('#field-residence').input_value()=='4'
            assert page.locator('#field-specificHeat').input_value()==''
            page.locator('#field-throughput').fill('50');page.locator('#calculate').click()
            assert '200' in page.locator('#summary-metrics').inner_text()
            assert 'Cp puntual' in page.locator('#drying-calculation-status').inner_text()
            if picker.is_visible():picker.select_option('inyeccion')
            else:page.locator('[data-module="inyeccion"]').click()
            page.locator('#reset').click();page.locator('#level').select_option('technical')
            page.locator('#machine-select option[value="moiron-m2-i"]').wait_for(state='attached')
            page.locator('#machine-select').select_option('moiron-m2-i')
            assert page.locator('#field-screwD').input_value()=='20'
            page.locator('#machine-select').select_option('moiron-page104-16mm-100kn')
            assert page.locator('#field-screwD').input_value()=='16'
            assert page.locator('#field-screwMaxStroke').input_value()==''
            assert page.locator('#machine-select option[value="kiefel-kmd642speed"]').count()==0
            assert not stale_requests, stale_requests
            assert not errors, errors
            context.close()
        # An already cached OLD HTML document must still resolve its old tree.
        # New HTML with a stale unversioned JS cache (above) is a different case.
        archive=ROOT/'versions/antes-etapa-7-2026-10-17'
        if archive.exists():
            context=browser.new_context(viewport={'width':390,'height':1000})
            page=context.new_page();errors=[];asset_requests=[]
            page.on('pageerror',lambda e:errors.append(str(e)))
            page.on('request',lambda r:asset_requests.append(r.url) if '/assets/' in r.url else None)
            page.route(f'http://127.0.0.1:{server.server_port}/dist/',lambda r:r.fulfill(path=str(archive/'index.html')))
            page.goto(f'http://127.0.0.1:{server.server_port}/dist/',wait_until='networkidle')
            page.locator('#material-family:not([disabled])').wait_for();page.locator('#material-family').select_option('HDPE')
            assert page.locator('#field-meltDensity').input_value()=='0.73'
            page.locator('#calculate').click();assert page.locator('#summary-metrics').inner_text().strip()
            assert asset_requests and all('/assets/83359612fa7ca5b862ea25f01fabdacbb03c3ef7/' in u for u in asset_requests)
            assert not errors,errors
            context.close()
        browser.close()
    print('OK: selector visible, HDPE, tres niveles, aprendizaje y diseño en 390/768/1440 px; XLSX/PDF, bibliotecas y fichas diferidas, maquinaria JSON/PDF con identidad XH, formulación sin herencia, secado con caudal manual/Cp pendiente, variantes Moiron Ø20/Ø16 separadas y sin mezclar recursos antiguos.')
finally:
    server.shutdown()
    server.server_close()
