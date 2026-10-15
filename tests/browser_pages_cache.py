"""Verifica el artefacto Pages incluso con recursos antiguos en caché.
Ejecutar después de npm run build:pages: python3 tests/browser_pages_cache.py
"""
import functools
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
            assert not stale_requests, stale_requests
            assert not errors, errors
            context.close()
        browser.close()
    print('OK: selector visible, HDPE, tres niveles, aprendizaje y diseño en 390/768/1440 px; sin mezclar recursos antiguos.')
finally:
    server.shutdown()
    server.server_close()
