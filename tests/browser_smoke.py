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
MATERIALS = json.loads((ROOT / 'src/data/materials.v1.2.json').read_text())['materials']
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
        cls.material_count = 0

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.pw.stop()
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join()
        print(f"Estados módulo/variante × nivel × pantalla comprobados: {cls.matrix_count}")
        print(f"Estados biblioteca × proceso × nivel × pantalla: {cls.material_count}")
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

    def select_grade(self, material):
        self.page.wait_for_function("document.querySelector('#material-family') && !document.querySelector('#material-family').disabled")
        self.page.locator('#material-family').select_option(material['family'])
        self.page.locator('#material-manufacturer').select_option(material['manufacturer'])
        self.page.locator('#material-grade').select_option(material['id'])

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


    def test_07_materials_levels_and_mobile(self):
        for width, height in [(1440, 900), (390, 844)]:
            self.page.set_viewport_size({"width": width, "height": height})
            for material in MATERIALS:
                for module in ['inyeccion', 'pelicula', 'secado']:
                    for level in ['basic', 'technical', 'advanced']:
                        with self.subTest(width=width, grade=material['id'], module=module, level=level):
                            self.page.locator(f'[data-module="{module}"]').click()
                            self.page.locator('#reset').click()
                            self.page.locator('#level').select_option(level)
                            self.select_grade(material)
                            source = self.page.locator('.source-link')
                            self.assertEqual(source.count(), 1)
                            self.assertTrue(source.get_attribute('href').startswith('https://'))
                            self.assertIn(material['source_id'], source.inner_text())
                            if module == 'inyeccion':
                                if level != 'basic':
                                    self.assertEqual(self.page.locator('[data-field="meltDensity"]').input_value(), '')
                                self.page.locator('#calculate').click()
                                self.assertIn('30', self.page.locator('.metric').nth(1).inner_text())
                                self.assertIn('Pendiente', self.page.locator('.metric').nth(2).inner_text())
                            elif module == 'pelicula':
                                self.page.locator('#material-compatible').check()
                                if self.page.locator('#material-processConfirmed').count():
                                    self.page.locator('#material-processConfirmed').check()
                                if level != 'basic':
                                    density = material['properties']['solid_density']
                                    self.assertEqual(self.page.locator('[data-field="density"]').input_value(), str(density['value']) if density else '')
                            else:
                                self.page.locator('#material-physicalForm').select_option('powder' if material['family'] == 'PVC' else 'pellets')
                                self.page.locator('#material-bulkCompatible').check()
                                self.page.locator('#material-dryingCompatible').check()
                                drying = material['properties']['drying_time']
                                if drying and drying['range']:
                                    self.assertEqual(self.page.locator('[data-field="residence"]').input_value(), '')
                                    self.page.locator('#material-dryingTime').fill('2.5')
                                expected = 2.5 if drying and drying['range'] else drying['value'] if drying else ''
                                self.assertEqual(self.page.locator('[data-field="residence"]').input_value(), str(expected))
                                if level != 'basic':
                                    bulk = material['properties']['bulk_density']
                                    self.assertEqual(self.page.locator('[data-field="bulkDensity"]').input_value(), str(bulk['value']) if bulk else '')
                                if level == 'advanced':
                                    self.assertEqual(self.page.locator('[data-field="specificHeat"]').input_value(), '')
                            self.assert_layout()
                            self.__class__.material_count += 1
            self.page.screenshot(path=str(ARTIFACTS / f'materiales-pc-secado-{width}.png'), full_page=True)

    def test_08_overrides_grade_changes_history_and_snapshot(self):
        pa6 = next(m for m in MATERIALS if m['family'] == 'PA6')
        pc = next(m for m in MATERIALS if m['family'] == 'PC')
        self.page.locator('[data-module="secado"]').click()
        self.page.locator('#level').select_option('advanced')
        self.select_grade(pa6)
        self.page.locator('#material-physicalForm').select_option('pellets')
        self.page.locator('#material-bulkCompatible').check()
        self.page.locator('#material-dryingCompatible').check()
        self.assertEqual(self.page.locator('[data-field="targetT"]').input_value(), '80')
        self.page.locator('[data-field="bulkDensity"]').fill('0.65')
        self.assertIn('Modificado por usuario', self.page.locator('#provenance-bulkDensity').inner_text())
        self.select_grade(pc)
        self.assertEqual(self.page.locator('[data-field="bulkDensity"]').input_value(), '0.65')
        self.assertEqual(self.page.locator('[data-field="targetT"]').input_value(), '')
        self.page.locator('#material-physicalForm').select_option('pellets')
        self.page.locator('#material-bulkCompatible').check()
        self.page.locator('#material-dryingCompatible').check()
        self.page.locator('#material-dryingTime').fill('2.5')
        self.page.locator('#material-conditionsNote').fill('Condiciones y cambio manual validados para ensayo')
        self.page.locator('#material-lot').fill('Lote de prueba')
        self.page.locator('#save').click()
        with self.page.expect_download() as info:
            self.page.locator('#export').click()
        data = json.loads(Path(info.value.path()).read_text())
        snapshot = data['material']
        self.assertEqual(snapshot['grade_id'], pc['id'])
        self.assertEqual(snapshot['source_id'], 'S09')
        self.assertEqual(snapshot['used_fields']['bulkDensity']['value'], '0.65')
        self.assertEqual(snapshot['used_fields']['bulkDensity']['reference']['value'], 0.7)
        self.assertEqual(snapshot['used_fields']['bulkDensity']['grade_id'], pa6['id'])
        self.assertEqual(snapshot['used_fields']['bulkDensity']['source_id'], 'S08')
        self.assertEqual(snapshot['used_fields']['residence']['reference']['range'], [2, 3])
        self.assertIsNone(snapshot['grade_snapshot']['properties']['specific_heat'])
        self.page.locator('[data-module="inyeccion"]').click()
        self.page.locator('[data-history="0"]').click()
        self.assertEqual(self.page.locator('#material-grade').input_value(), pc['id'])
        self.assertEqual(self.page.locator('[data-field="bulkDensity"]').input_value(), '0.65')
        self.assertEqual(self.page.locator('#material-lot').input_value(), 'Lote de prueba')
        self.page.locator('[data-use-reference="bulkDensity"]').click()
        self.assertEqual(self.page.locator('[data-field="bulkDensity"]').input_value(), '0.66')
        self.page.locator('[data-field="bulkDensity"]').fill('')
        self.page.locator('#level').select_option('technical')
        self.assertEqual(self.page.locator('[data-field="bulkDensity"]').input_value(), '')
        self.page.locator('#material-grade').select_option('')
        self.assertEqual(self.page.locator('[data-field="bulkDensity"]').input_value(), '')
        self.assertEqual(self.page.locator('[data-field="residence"]').input_value(), '')

    def test_09_catalogue_failure_and_offline_calculation(self):
        # Un JSON inválido no genera un fallo HTTP intencional en consola.
        self.page.route('**/materials.v1.2.json', lambda route: route.fulfill(status=200, content_type='application/json', body='{}'))
        self.page.reload()
        self.page.wait_for_function("document.querySelector('#material-load-status').textContent.includes('no disponible')")
        self.fill_case('inyeccion', VARIANTS[0][1])
        self.assertIn('71.5', self.page.locator('.metric').nth(1).inner_text())
        self.page.unroute('**/materials.v1.2.json')
        self.page.reload()
        self.page.wait_for_function("document.querySelector('#material-load-status').textContent.includes('9 grados')")
        pa6 = next(m for m in MATERIALS if m['family'] == 'PA6')
        self.page.locator('[data-module="secado"]').click()
        self.page.locator('#level').select_option('advanced')
        self.select_grade(pa6)
        self.context.set_offline(True)
        self.page.locator('#material-physicalForm').select_option('pellets')
        self.page.locator('#material-bulkCompatible').check()
        self.page.locator('#material-dryingCompatible').check()
        self.page.locator('#calculate').click()
        self.assertIn('200', self.page.locator('.metric').nth(0).inner_text())
        self.assertIn('Pendiente', self.page.locator('.metric').nth(2).inner_text())
        self.assertIn('ISO 1133', self.page.locator('[data-property="mvr"]').inner_text())
        self.page.locator('#save').click()
        self.assertEqual(self.page.locator('[data-history="0"]').count(), 1)
        self.context.set_offline(False)

    def test_10_untrusted_material_history(self):
        self.page.evaluate("""localStorage.setItem('ccip-calculators-web-v1', JSON.stringify([{module:'secado',level:'advanced',date:'2026-10-13',inputs:{throughput:50,residence:3},material:{grade_snapshot:{id:'x',family:'x',manufacturer:'x',grade:'x',properties:[],process_tags:[{}]}}}]))""")
        self.page.reload()
        self.page.locator('[data-history="0"]').click()
        self.assertIn('150', self.page.locator('.metric').nth(0).inner_text())
        self.assertEqual(self.page.locator('.source-link').count(), 0)


    def test_11_audit_pvt_references_and_manual_traceability(self):
        self.page.locator('#level').select_option('advanced')
        for material in MATERIALS:
            self.page.locator('[data-module="inyeccion"]').click()
            self.page.locator('#reset').click()
            self.select_grade(material)
            self.assertEqual(self.page.locator('#pvt-section').count(), 1)
            self.assertEqual(self.page.locator('[data-field="meltDensity"]').input_value(), '')
            self.page.locator('#calculate').click()
            self.assertIn('Pendiente', self.page.locator('.metric').nth(2).inner_text())
            if material['family'] == 'PA6':
                self.assertIn('Referencia de B3S — no validada para R03', self.page.locator('#pvt-section').inner_text())
                self.assertEqual(self.page.locator('.pvt-chart svg').count(), 0)
            if material['family'] == 'ABS':
                self.assertEqual(self.page.locator('.pvt-chart polyline').count(), 6)
                self.assertEqual(self.page.locator('.pvt-chart circle').count(), 24)
                self.assertIn('Digitalización orientativa', self.page.locator('.pvt-chart').inner_text())
                self.page.set_viewport_size({'width': 320, 'height': 568})
                self.assert_layout()
                self.page.set_viewport_size({'width': 1440, 'height': 900})
            if material['family'] == 'PET':
                self.assertIn('0.15', self.page.locator('#incoming-moisture').inner_text())
                self.assertIn('0.3', self.page.locator('#incoming-moisture').inner_text())
                self.assertIn('NO humedad', self.page.locator('#incoming-moisture').inner_text())
                self.page.locator('[data-module="secado"]').click()
                self.assertEqual(self.page.locator('[data-field="residence"]').input_value(), '')
                self.assertEqual(self.page.locator('[data-field="targetT"]').input_value(), '')
            if material['family'] == 'PC':
                self.page.locator('[data-module="secado"]').click()
                self.select_grade(material)
                self.assertIn('1.172', self.page.locator('#blocked-references').inner_text())
                self.assertEqual(self.page.locator('[data-field="specificHeat"]').input_value(), '')
        self.page.locator('[data-module="inyeccion"]').click()
        self.page.locator('#reset').click()
        self.select_grade(next(m for m in MATERIALS if m['family'] == 'ABS'))
        self.page.locator('#material-pvtTemperatureC').fill('230')
        self.page.locator('#material-pvtPressureMPa').fill('40')
        self.page.locator('#material-meltDensitySource').fill('Dato manual de demostración, no obtenido del gráfico')
        self.assertEqual(self.page.locator('[data-field="meltDensity"]').input_value(), '')
        self.page.locator('[data-field="meltDensity"]').fill('0.9')
        self.page.locator('#save').click()
        with self.page.expect_download() as info:
            self.page.locator('#export').click()
        data = json.loads(Path(info.value.path()).read_text())
        self.assertEqual(data['material']['dataset']['version'], '1.2.0')
        self.assertEqual(data['material']['context']['pvtTemperatureC'], '230')
        self.assertEqual(data['material']['context']['pvtPressureMPa'], '40')
        self.assertIsNone(data['material']['grade_snapshot']['properties']['melt_density'])
        self.assertFalse(data['material']['references_snapshot']['pvt_sample']['eligible_for_melt_density_autofill'])
        self.assertEqual(data['material']['used_fields']['meltDensity']['origin'], 'manual')
        self.page.locator('[data-module="costos"]').click()
        self.page.locator('[data-history="0"]').click()
        self.assertEqual(self.page.locator('#material-pvtPressureMPa').input_value(), '40')
        self.page.evaluate('scrollTo(0,0)')
        self.page.screenshot(path=str(ARTIFACTS / 'pvt-abs-1440.png'), full_page=True)

    def test_12_legacy_material_snapshot(self):
        self.page.evaluate("""async () => {
          const data = await (await fetch('./src/data/materials.v1.json')).json();
          const { createMaterialState, selectMaterial, materialSnapshot } = await import('./src/materials.js');
          const { modules } = await import('./src/schema.js');
          const state = createMaterialState();
          selectMaterial(data,state,{},'covestro-makrolon-2405');
          const inputs = {throughput:50,residence:3};
          const material = materialSnapshot(state,modules.find(m => m.id === 'secado'),inputs,'advanced');
          localStorage.setItem('ccip-calculators-web-v1',JSON.stringify([{module:'secado',level:'advanced',date:'2026-10-13',inputs,material}]));
        }""")
        self.page.reload()
        self.page.locator('[data-history="0"]').click()
        self.assertIn('Biblioteca 1.0.0', self.page.locator('.material-summary').inner_text())
        self.assertEqual(self.page.locator('#pvt-section').count(), 0)
        self.assertIn('150', self.page.locator('.metric').nth(0).inner_text())


if __name__ == '__main__':
    unittest.main(verbosity=2)
