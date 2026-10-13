"""Prueba de integración opcional: Python + Playwright + Chromium.
Ejecutar desde la raíz: python3 tests/browser_smoke.py
No instala dependencias ni publica; sirve el checkout local bajo una subruta.
"""
import functools
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import threading
import unittest
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
VARIANTS = json.loads(subprocess.check_output(
    ["node", "--input-type=module", "-e", "import { variants } from './tests/fixtures.js'; console.log(JSON.stringify(variants))"], cwd=ROOT, text=True))
ARTIFACTS = Path(os.environ.get("CCIP_TEST_ARTIFACTS", tempfile.mkdtemp(prefix="ccip-browser-")))
ARTIFACTS.mkdir(parents=True, exist_ok=True)


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass


class BrowserSmoke(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # La ruta del proyecto imita GitHub Pages /nombre-repositorio/.
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(QuietHandler, directory=str(ROOT.parent)))
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.url = f"http://127.0.0.1:{cls.server.server_port}/{ROOT.name}/"
        cls.pw = sync_playwright().start()
        chromium = os.environ.get("CCIP_CHROMIUM") or shutil.which("chromium") or shutil.which("chromium-browser")
        cls.browser = cls.pw.chromium.launch(executable_path=chromium)
        cls.matrix_count = 0

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.pw.stop()
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join()
        print(f"Estados módulo/variante × nivel × pantalla comprobados: {cls.matrix_count}")
        print(f"Capturas: {ARTIFACTS}")

    def setUp(self):
        self.context = self.browser.new_context()
        self.page = self.context.new_page()
        self.errors = []
        self.page.on("pageerror", lambda e: self.errors.append(str(e)))
        self.page.on("console", lambda m: self.errors.append(m.text) if m.type == "error" else None)
        self.page.goto(self.url)
        self.page.locator('[data-field="partMass"]').wait_for()

    def tearDown(self):
        try:
            self.assertEqual(self.errors, [], "Errores de JavaScript o recursos")
        finally:
            self.context.close()

    def fill_case(self, module, values, level="advanced"):
        self.page.locator(f'[data-module="{module}"]').click()
        self.page.locator('#level').select_option(level)
        for key in ["method", "shape"]:
            if key in values:
                self.page.locator(f'[data-field="{key}"]').select_option(values[key])
        for control in self.page.locator('input[data-field]').all():
            key = control.get_attribute('data-field')
            control.fill(str(values[key]))
        self.page.locator('#calculate').click()

    def assert_layout(self):
        self.assertTrue(self.page.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'Desbordamiento horizontal de página')
        # El menú móvil tiene desplazamiento horizontal intencional.
        outside = self.page.locator('input, select, .actions button, .metric strong, .help').evaluate_all('''els => els.filter(el => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && (r.left < -1 || r.right > innerWidth + 1);
        }).map(el => el.outerHTML)''')
        self.assertEqual(outside, [], 'Controles/resultados fuera de pantalla')
        self.assertEqual(self.page.locator('.mark').evaluate('el => getComputedStyle(el).whiteSpace'), 'nowrap')

    def test_01_all_modules_levels_and_viewports(self):
        for width, height in [(1440, 900), (768, 1024), (390, 844), (320, 568)]:
            self.page.set_viewport_size({"width": width, "height": height})
            for module, values in VARIANTS:
                for level in ["basic", "technical", "advanced"]:
                    with self.subTest(width=width, module=module, variant=values.get('method', values.get('shape')), level=level):
                        self.fill_case(module, values, level)
                        expected = self.page.evaluate('''async ([id, values, level]) => {
                          const { calculate } = await import('./src/engine.js');
                          return calculate(id, values, level).metrics.map(m => ({
                            label: m.label, text: m.value === null ? 'Pendiente' :
                            Number(m.value).toLocaleString('es-DO', {maximumFractionDigits: m.precision}) + ' ' + m.unit
                          }));
                        }''', [module, values, level])
                        metrics = self.page.locator('.metric')
                        self.assertEqual(metrics.count(), len(expected))
                        for index, metric in enumerate(expected):
                            self.assertEqual(metrics.nth(index).locator('b').inner_text(), metric['label'])
                            self.assertEqual(metrics.nth(index).locator('strong').inner_text().strip(), metric['text'].strip())
                        self.assert_layout()
                        for control in self.page.locator('[data-field]').all():
                            self.assertEqual(self.page.locator(f'label[for="{control.get_attribute("id")}"]').count(), 1)
                        self.__class__.matrix_count += 1
            self.page.screenshot(path=str(ARTIFACTS / f'extrusion-tubo-{width}.png'), full_page=True)

    def test_02_input_invalidation_levels_and_reset(self):
        values = VARIANTS[0][1]
        self.fill_case('inyeccion', values)
        self.page.locator('[data-field="partMass"]').fill('40')
        self.assertEqual(self.page.locator('#result-date').inner_text(), 'Pendientes')
        self.assertEqual(self.page.locator('.metric').count(), 0)
        # Calcular con foco en el campo debe leer la última edición.
        self.page.locator('#calculate').click()
        self.assertIn('93.5', self.page.locator('.metric').nth(1).inner_text())
        self.page.locator('#level').select_option('basic')
        self.page.locator('#calculate').click()
        self.assertIn('85', self.page.locator('.metric').nth(1).inner_text())
        self.assertIn('Pendiente', self.page.locator('.metric').nth(2).inner_text())
        self.page.locator('#level').select_option('advanced')
        self.assertEqual(self.page.locator('[data-field="meltDensity"]').input_value(), '0.8')
        self.page.locator('#reset').click()
        self.assertEqual(self.page.locator('#result-date').inner_text(), 'Pendientes')
        self.assertEqual(self.page.locator('[data-field="meltDensity"]').input_value(), '')
        self.page.locator('[data-field="partMass"]').fill('-1')
        self.page.locator('#calculate').click()
        self.assertIn('Masa por pieza:', self.page.locator('#messages').inner_text())
        self.assertIn('Pendiente', self.page.locator('.metric').nth(1).inner_text())

    def test_03_history_export_and_corrupt_storage(self):
        self.fill_case('secado', VARIANTS[5][1])
        self.page.locator('#save').click()
        self.page.locator('[data-module="costos"]').click()
        self.page.locator('[data-history="0"]').click()
        self.assertEqual(self.page.locator('#module-title').inner_text(), 'Secado y acondicionamiento')
        self.assertEqual(self.page.locator('[data-field="throughput"]').input_value(), '50')
        self.assertIn('150', self.page.locator('.metric').nth(0).inner_text())
        with self.page.expect_download() as info:
            self.page.locator('#export').click()
        data = json.loads(Path(info.value.path()).read_text())
        self.assertEqual(data['module'], 'secado')
        self.assertEqual(data['level'], 'advanced')
        self.assertEqual(data['metrics'][0]['value'], 150)
        self.assertTrue(all(m['formula'] for m in data['metrics']))
        self.page.locator('#level').select_option('basic')
        with self.page.expect_download() as info:
            self.page.locator('#export').click()
        data = json.loads(Path(info.value.path()).read_text())
        self.assertNotIn('specificHeat', data['inputs'])
        self.assertIsNone(data['metrics'][2]['value'])
        self.page.evaluate('''localStorage.setItem('ccip-calculators-web-v1', JSON.stringify([
          null, { module:'no-existe', level:'basic', date:'2026-10-13', inputs:{} },
          { module:'secado', level:'advanced', date:'2026-10-13', inputs:{startT:'<img src=x onerror=alert(1)>',throughput:50} }
        ]))''')
        self.page.reload()
        self.assertEqual(self.page.locator('[data-history]').count(), 1)
        self.page.locator('[data-history="0"]').click()
        self.assertEqual(self.page.locator('#fields img').count(), 0)
        self.page.evaluate("localStorage.setItem('ccip-calculators-web-v1', '{')")
        self.page.reload()
        self.assertEqual(self.page.locator('[data-history]').count(), 0)

    def test_04_storage_blocked_still_calculates(self):
        self.page.add_init_script("Object.defineProperty(window, 'localStorage', {get(){throw new Error('bloqueado')}})")
        self.page.reload()
        self.fill_case('costos', VARIANTS[6][1])
        self.assertIn('18.4', self.page.locator('.metric').nth(4).inner_text())
        dialogs = []
        self.page.on('dialog', lambda dialog: (dialogs.append(dialog.message), dialog.accept()))
        self.page.locator('#save').click()
        self.assertEqual(dialogs, ['No se pudo guardar el historial en este navegador.'])

    def test_05_keyboard_and_labels(self):
        self.page.locator('label[for="field-partMass"]').click()
        self.assertEqual(self.page.evaluate('document.activeElement.id'), 'field-partMass')
        self.page.keyboard.press('Control+A')
        self.page.keyboard.type('40')
        self.page.locator('#calculate').focus()
        self.page.keyboard.press('Enter')
        self.assertIn('40', self.page.locator('.metric').nth(1).inner_text())
        self.assertEqual(self.page.locator('#calculation-output').get_attribute('aria-live'), 'polite')
        dialogs = []
        self.page.on('dialog', lambda dialog: (dialogs.append(dialog.message), dialog.accept()))
        self.page.locator('[data-help="partMass"]').focus()
        self.page.keyboard.press('Enter')
        self.assertTrue(dialogs[0].startswith('Masa por pieza:'))

    def test_06_zero_and_empty_inputs_in_browser(self):
        self.fill_case('secado', {**VARIANTS[5][1], 'startT': -20, 'targetT': 0})
        self.assertIn('0.56', self.page.locator('.metric').nth(2).inner_text())
        self.page.locator('[data-field="specificHeat"]').fill('')
        self.page.locator('#calculate').click()
        self.assertIn('Pendiente', self.page.locator('.metric').nth(2).inner_text())
        self.fill_case('costos', {**VARIANTS[6][1], 'resinCost': 0, 'powerKw': 0, 'energyCost': 0, 'laborHour': 0})
        self.assertEqual(self.page.locator('.metric').nth(5).locator('strong').inner_text().strip(), '0 moneda/pza')
        self.assert_layout()


if __name__ == '__main__':
    unittest.main(verbosity=2)
