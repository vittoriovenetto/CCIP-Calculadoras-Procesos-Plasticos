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
MATERIALS = json.loads((ROOT / 'src/data/materials.v1.3.json').read_text())['materials']
ORIGINAL_MATERIALS = [m for m in MATERIALS if m['id'].startswith(('dow-', 'lyondellbasell-', 'indorama-', 'westlake-', 'ineos-', 'basf-', 'covestro-'))]
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
        cls.catalog_count = 0
        cls.language_count = 0

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.pw.stop()
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join()
        print(f"Estados módulo/variante × nivel × pantalla comprobados: {cls.matrix_count}")
        print(f"Perfiles iniciales comprobados en navegador: {cls.catalog_count}")
        print(f"Casos con cambio de idioma ES/EN/ES: {cls.language_count}")
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

    def select_process(self, module):
        picker = self.page.locator('#process-select')
        if picker.count() and picker.is_visible():
            picker.select_option(module)
        else:
            self.page.locator(f'[data-module="{module}"]').click()

    def fill_case(self, module, values, level="advanced"):
        self.select_process(module)
        self.page.locator('#level').select_option(level)
        if module=='secado' and self.page.locator('#calculation-grid').is_hidden():
            self.page.locator('#drying-manual').click()
        for key in ["method", "shape"]:
            if key in values:
                self.page.locator(f'[data-field="{key}"]').select_option(values[key])
        for control in self.page.locator('input[data-field]').all():
            key = control.get_attribute('data-field')
            control.fill(str(values[key]))
        self.page.locator('#calculate').click()
        self.open_results()

    def open_results(self):
        if self.page.locator('#results-details').is_visible() and not self.page.locator('#results-details').evaluate('el => el.open'):
            self.page.locator('#results-details > summary').click()

    def assert_layout(self):
        self.assertTrue(self.page.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'Desbordamiento horizontal de página')
        outside = self.page.locator('input, select, .actions button, .metric strong, .help').evaluate_all('''els => els.filter(el => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && (r.left < -1 || r.right > innerWidth + 1);
        }).map(el => el.outerHTML)''')
        self.assertEqual(outside, [], 'Controles/resultados fuera de pantalla')
        self.assertTrue(self.page.locator('.ccip-logo').evaluate('el => el.complete && el.naturalWidth > 0'))

    def select_grade(self, material):
        self.page.wait_for_function("document.querySelector('#material-family') && !document.querySelector('#material-family').disabled")
        self.page.locator('#material-family').select_option(material['family'])
        self.page.locator('#material-manufacturer').select_option(material['manufacturer'])
        self.page.locator('#material-grade').select_option(material['id'])
        if self.page.locator('#material-details').count() and not self.page.locator('#material-details').evaluate('el => el.open'):
            self.page.locator('#material-details > summary').click()

    def grade(self, grade_id):
        self.select_grade(next(m for m in MATERIALS if m['id']==grade_id))

    def help(self, key):
        self.page.locator(f'[data-help="{key}"]').click()
        self.assertTrue(self.page.locator('#hint-'+key).is_visible())

    def density(self, family='HDPE',level='technical'):
        self.page.locator('#level').select_option(level)
        self.grade('generic-'+family.lower())
        for key,value in {'partMass':30,'cavities':2,'runnerMass':5,'screwD':20,'screwMaxStroke':400}.items():
            self.page.locator(f'[data-field="{key}"]').fill(str(value))

    def save_case(self, name='Caso de prueba'):
        self.page.locator('#save').click()
        self.page.locator('#save-name').fill(name)
        self.page.locator('#save-confirm').click()

    def record(self):
        self.save_case()
        return self.page.evaluate("JSON.parse(localStorage.getItem('ccip-calculators-web-v1'))[0]")

    def test_T01_no_empty_pvt(self):
        self.page.locator('#level').select_option('advanced')
        for grade_id in ['catalog-hdpe-dow-dmda-8007-nt-7','basf-ultramid-b3s-r03','covestro-makrolon-2405','generic-hdpe']:
            self.grade(grade_id);self.assertEqual(self.page.locator('#pvt-section').count(),0)
            self.assertEqual(self.page.locator('#material-gaps').count(),0)

    def test_T02_real_visual_pvt(self):
        self.page.locator('#level').select_option('advanced');self.grade('ineos-styrolution-terluran-gp-22')
        self.page.locator('#pvt-section > summary').click()
        self.assertEqual(self.page.locator('.pvt-chart circle').count(),24)
        self.assertEqual(self.page.locator('.pvt-chart polyline').count(),6)
        self.assertIn('solo visualización',self.page.locator('#pvt-section').inner_text())
        r=self.record();self.assertEqual(r['density_assessment']['origin'],'family_reference')
        self.assertIn('reiloyusa',r['density_assessment']['source']['url'])
        self.assertIsNone(r['material']['grade_snapshot']['properties']['melt_density'])

    def test_T03_no_empty_datasheet(self):
        for family in ['HDPE','PA6','PC']:
            self.grade('generic-'+family.lower())
            self.assertEqual(self.page.locator('#material-properties').count(),0)
            self.assertEqual(self.page.locator('#material-details').count(),0)
        self.assertNotIn('Pendiente: no documentado',self.page.locator('#materials').inner_text())

    def test_T04_partial_properties_sources(self):
        material=next(m for m in MATERIALS if m['id']=='basf-ultramid-b3s-r03');self.select_grade(material)
        self.page.locator('#material-properties > summary').click()
        expected=sum(1 for p in material['properties'].values() if p and (isinstance(p.get('value'),(int,float)) or p.get('range')))
        self.assertEqual(self.page.locator('#material-properties [data-property]').count(),expected)
        self.assertEqual(self.page.locator('.source-link').count(),1)
        self.assertNotIn('Pendiente',self.page.locator('#material-properties').inner_text())
        self.assertIn('Método:',self.page.locator('#material-properties').inner_text())

    def test_T05_mass_without_density(self):
        self.page.locator('#level').select_option('basic')
        for key,value in {'partMass':30,'cavities':2,'runnerMass':5}.items():self.page.locator(f'[data-field="{key}"]').fill(str(value))
        r=self.record();self.assertEqual(r['metrics'][1]['value'],65)
        self.assertEqual(self.page.locator('[data-field="meltDensity"]').count(),0)
        self.assertEqual(self.page.locator('.metric').count(),2)
        self.assertNotIn('Pendiente',self.page.locator('#calculation-output').inner_text())

    def test_T06_automatic_editable_density(self):
        self.density();self.assertEqual(self.page.locator('[data-field="meltDensity"]').input_value(),'0.73')
        self.assertEqual(self.page.locator('#accept-family-density, #injection-density').count(),0)
        self.assertIn('estimación',self.page.locator('#provenance-meltDensity').inner_text())
        r=self.record();self.assertEqual(r['density_assessment']['reference_application'],'automatic_family_reference')
        self.assertAlmostEqual(r['metrics'][2]['value'],65/.73)
        self.assertEqual(self.page.locator('.kpi .density-estimate').count(),2)

    def test_T07_manual_density_and_trace(self):
        self.density();before=self.record();self.page.locator('[data-field="meltDensity"]').fill('0.8');after=self.record()
        self.assertEqual(before['metrics'][1]['value'],after['metrics'][1]['value'])
        self.assertNotEqual(before['metrics'][2]['value'],after['metrics'][2]['value'])
        self.assertEqual(after['density_assessment']['origin'],'user_override')
        self.assertEqual(after['material']['used_fields']['meltDensity']['reference']['value'],.73)
        self.assertEqual(self.page.locator('.manual-justification').count(),1)

    def test_T08_family_change_and_override(self):
        self.density();self.grade('generic-pc');self.assertEqual(self.page.locator('[data-field="meltDensity"]').input_value(),'1.02')
        self.page.locator('[data-field="meltDensity"]').fill('0.9');self.grade('generic-pp')
        self.assertEqual(self.page.locator('[data-field="meltDensity"]').input_value(),'0.9')
        self.page.locator('#calculate').click();self.assertIn('otro grado',self.page.locator('#error-meltDensity').inner_text())
        self.help('meltDensity');self.page.locator('#use-family-density').click()
        self.assertEqual(self.page.locator('[data-field="meltDensity"]').input_value(),'0.75')

    def test_T09_results_follow_level(self):
        for level,count in [('basic',2),('technical',7),('advanced',11)]:
            self.fill_case('inyeccion',VARIANTS[0][1],level)
            self.assertEqual(self.page.locator('.metric').count(),count)
            self.assertNotIn('Pendiente',self.page.locator('#calculation-output').inner_text())
        self.assertEqual(self.page.locator('#result-notes').count(),0)

    def test_T10_optional_results_hidden(self):
        self.page.locator('#level').select_option('advanced');self.page.locator('#calculate').click();self.open_results()
        self.assertEqual(self.page.locator('.metric').count(),2)
        self.assertEqual(self.page.locator('.kpi').count(),1)
        self.assertEqual(self.page.locator('[role="meter"]').count(),0)
        self.assertNotIn('Pendiente',self.page.locator('#calculation-output').inner_text())
        r=self.record();self.assertEqual(len(r['metrics']),11);self.assertIsNone(r['metrics'][8]['value']);self.assertGreater(len(r['notes']),0)

    def test_T11_drying_filter_and_autofill(self):
        self.select_process('secado');self.page.locator('#level').select_option('advanced')
        self.assertEqual(set(self.page.locator('#material-family option').evaluate_all('els=>els.map(e=>e.value)')),{'','ABS','PA6','PC'})
        self.grade('basf-ultramid-b3s-r03')
        self.assertEqual(self.page.locator('[data-field="residence"]').input_value(),'4')
        self.assertEqual(self.page.locator('[data-field="targetT"]').input_value(),'80')
        self.assertEqual(self.page.locator('[data-field="specificHeat"]').input_value(),'')
        self.assertIn('residencia nominal',self.page.locator('#drying-status').inner_text())
        r=self.record();self.assertEqual(r['metrics'][0]['value'],200)
        self.assertEqual(r['material']['used_fields']['residence']['reference']['value'],4)

    def test_T12_unavailable_drying_keeps_manual_path(self):
        self.grade('generic-hdpe');self.select_process('secado')
        self.assertTrue(self.page.locator('#calculation-grid').is_hidden())
        self.assertIn('no tiene tiempo/temperatura',self.page.locator('#drying-status').inner_text())
        self.page.locator('#drying-manual').click();self.assertTrue(self.page.locator('#calculation-grid').is_visible())
        self.page.locator('[data-field="residence"]').fill('3');r=self.record();self.assertEqual(r['metrics'][0]['value'],150)

    def test_T13_ranges_require_choice(self):
        self.select_process('secado');self.page.locator('#level').select_option('advanced');self.grade('covestro-makrolon-2405')
        self.assertEqual(self.page.locator('[data-field="residence"]').input_value(),'')
        self.assertEqual(self.page.locator('[data-field="targetT"]').input_value(),'120')
        self.page.locator('[data-field="residence"]').fill('2.5');r=self.record()
        self.assertEqual(r['material']['used_fields']['residence']['origin'],'range_selection')
        self.assertEqual(r['material']['used_fields']['residence']['reference']['range'],[2,3])
        self.assertEqual(r['metrics'][0]['value'],125)
        self.page.locator('[data-field="residence"]').fill('5');r=self.record()
        self.assertIn('fuera del rango',self.page.locator('#error-residence').inner_text())
        self.assertEqual(self.page.locator('.manual-justification').count(),1)
        self.assertIn('fuera del rango',r['material']['used_fields']['residence']['selection_reason'])

    def test_T14_no_inferred_cp(self):
        self.select_process('secado');self.page.locator('#level').select_option('advanced');self.grade('basf-ultramid-b3s-r03')
        r=self.record();self.assertIsNone(r['metrics'][2]['value']);self.assertIsNone(r['material']['grade_snapshot']['properties']['specific_heat'])
        self.assertNotIn('Potencia térmica',self.page.locator('#calculation-output').inner_text())
        self.help('bulkDensity');self.page.locator('#material-physicalForm').select_option('pellets')
        self.help('bulkDensity');self.page.locator('#material-bulkCompatible').check()
        self.assertEqual(self.page.locator('[data-field="bulkDensity"]').input_value(),'0.7')

    def test_T15_filters_are_process_specific(self):
        self.grade('generic-hdpe');self.select_process('secado')
        self.assertEqual(self.page.locator('#material-family option[value="HDPE"]').count(),0)
        self.select_process('inyeccion')
        self.assertEqual(self.page.locator('#material-grade').input_value(),'generic-hdpe')
        self.assertEqual(self.page.locator('[data-field="meltDensity"]').input_value(),'0.73')

    def test_T16_critical_validation_inline(self):
        self.page.locator('[data-field="partMass"]').fill('-1');r=self.record()
        self.assertIn('introduce > 0',self.page.locator('#error-partMass').inner_text())
        self.assertEqual(self.page.locator('[data-field="partMass"]').get_attribute('aria-invalid'),'true')
        self.assertTrue(any('Masa por pieza' in x for x in r['warnings']))
        self.fill_case('extrusion',{**VARIANTS[8][1],'outerD':10,'innerD':20})
        self.assertIn('menor que',self.page.locator('#error-innerD').inner_text())
        self.assertEqual(self.page.locator('#result-notes').count(),0)

    def test_T17_no_code_links(self):
        self.page.locator('#learn-page').click()
        self.assertEqual(self.page.locator('a[href*=".js"]').count(),0)
        self.assertEqual(self.page.locator('[data-lesson]').count(),42)
        self.assertEqual(self.page.locator('.formula-full-index tbody tr').count(),42)

    def test_T18_same_tab_preserves_case_language(self):
        self.fill_case('inyeccion',VARIANTS[0][1]);self.page.locator('#language').select_option('en')
        before=self.page.locator('[data-field]').evaluate_all('els=>els.map(e=>[e.dataset.field,e.value])');metrics=self.page.locator('.metric strong').all_inner_texts()
        pages=len(self.context.pages);self.page.locator('#learn-page').click()
        self.assertEqual(len(self.context.pages),pages);self.assertIn('view=learning',self.page.url)
        self.assertTrue(self.page.locator('#calculator-view').is_hidden());self.english_ui_is_complete()
        self.page.locator('#learning-back').click();self.assertEqual(self.page.locator('[data-field]').evaluate_all('els=>els.map(e=>[e.dataset.field,e.value])'),before)
        self.assertEqual(self.page.locator('.metric strong').all_inner_texts(),metrics)
        self.page.go_back();self.assertTrue(self.page.locator('#learning-view').is_visible())
        self.page.go_forward();self.assertTrue(self.page.locator('#calculator-view').is_visible())

    def test_T19_exclusive_accordion_keyboard(self):
        self.page.locator('#learn-page').click();self.assertEqual(self.page.locator('.education-panel[open]').count(),0)
        self.assertEqual(self.page.locator('.formula-topic[open]').count(),0)
        self.page.locator('#guide-inyeccion > summary').click()
        first=self.page.locator('#inyeccion-1 > summary');first.focus();self.page.keyboard.press('Enter')
        self.assertTrue(self.page.locator('#inyeccion-1').evaluate('e=>e.open'))
        self.page.locator('#inyeccion-2 > summary').click()
        self.page.wait_for_function("!document.querySelector('#inyeccion-1').open")
        self.assertEqual(self.page.locator('.education-panel[open]').count(),1)
        self.assertEqual(self.page.locator('#inyeccion-2 > summary').get_attribute('aria-expanded'),'true')

    def test_T20_result_opens_requested_formula(self):
        self.page.locator('#calculate').click();self.open_results()
        link=self.page.locator('.metric').nth(1).locator('.result-learning');url=link.get_attribute('href')
        self.assertIn('view=learning',url);self.assertIsNone(link.get_attribute('target'))
        link.click();self.assertEqual(self.page.locator('.education-panel[open]').count(),1)
        self.assertEqual(self.page.locator('.education-panel[open]').get_attribute('id'),url.split('#')[1])
        self.assertEqual(self.page.evaluate('document.activeElement.className'),'lesson-content')
        self.assertIn('Ejemplo resuelto',self.page.locator('.education-panel[open]').inner_text())

    def test_T21_responsive_and_evidence_captures(self):
        self.density(level='advanced');self.page.locator('#profile-details > summary').click();self.page.locator('#calculate').click()
        for scene in ['inyeccion','secado','sin-ficha','aprendizaje']:
            if scene=='secado':
                self.select_process('secado');self.grade('basf-ultramid-b3s-r03');self.page.locator('#calculate').click()
            if scene=='sin-ficha':
                self.select_process('inyeccion');self.grade('generic-hdpe')
            if scene=='aprendizaje':
                self.page.locator('#learn-page').click();self.page.locator('#guide-inyeccion > summary').click();self.page.locator('#inyeccion-1 > summary').click()
            for width in [320,390,768,1024,1440]:
                self.page.set_viewport_size({'width':width,'height':900});self.assert_layout()
                if width in [390,1440]:self.page.screenshot(path=str(ARTIFACTS/f'lean-{scene}-{width}.png'),full_page=True)

    def test_T22_seven_models_levels_methods_and_viewports(self):
        for width in [320,390,768,1024,1440]:
            self.page.set_viewport_size({'width':width,'height':900})
            for module,values in VARIANTS:
                for level in ['basic','technical','advanced']:
                    self.fill_case(module,values,level)
                    expected=self.page.evaluate('''async ([id,values,level])=>{const {calculate}=await import('./src/engine.js');return calculate(id,values,level).metrics.filter(m=>m.value!==null).map(m=>({label:m.label,text:Number(m.value).toLocaleString('es-DO',{maximumFractionDigits:m.precision})+' '+m.unit}))}''',[module,values,level])
                    self.assertEqual(self.page.locator('.metric').count(),len(expected),(module,level,width))
                    for i,item in enumerate(expected):
                        row=self.page.locator('.metric').nth(i);self.assertEqual(row.locator('b').inner_text(),item['label']);self.assertEqual(row.locator('strong').inner_text().strip(),item['text'].strip())
                    self.assert_layout();self.__class__.matrix_count+=1

    def test_T23_custom_materials_do_not_inherit(self):
        record=self.page.evaluate('''async()=>{const {makeCustomMaterial}=await import('./src/custom-materials.js');const m=makeCustomMaterial({family:'PP',grade:'Caso propio sin propiedades'});localStorage.setItem('ccip-user-materials-v1',JSON.stringify([m]));return m}''')
        self.page.reload();self.select_grade(record);r=self.record()
        self.assertTrue(all(x is None for x in r['material']['grade_snapshot']['properties'].values()))
        self.assertEqual(r['density_assessment']['origin'],'family_reference')
        self.assertIsNone(r['material']['grade_snapshot']['properties']['melt_density'])
        self.select_process('secado');self.assertEqual(self.page.locator('#material-grade option[value="'+record['id']+'"]').count(),0)

    def test_T24_english_essential_flows(self):
        self.density();self.help('meltDensity');self.page.locator('#language').select_option('en');self.english_ui_is_complete()
        self.page.keyboard.press('Escape');self.select_process('secado');self.english_ui_is_complete()
        self.grade('basf-ultramid-b3s-r03');self.page.locator('#level').select_option('advanced');self.help('residence');self.english_ui_is_complete()
        self.page.keyboard.press('Escape');self.page.locator('#learn-page').click();self.page.locator('#guide-inyeccion > summary').click();self.page.locator('#inyeccion-1 > summary').click();self.english_ui_is_complete()
    def open_custom_property(self, key):
        for selector in ['#custom-panel', '#custom-properties', f'#custom-property-{key}']:
            if not self.page.locator(selector).evaluate('el=>el.open'):
                self.page.locator(selector+' > summary').click()

    def english_ui_is_complete(self):
        self.page.wait_for_function("document.documentElement.lang==='en' && !document.body.innerText.includes('⚠ Datos típicos')")
        leftovers = self.page.evaluate(r'''()=>{const out=[];const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){
          if(n.parentElement.closest('script,style,textarea,[data-i18n-ignore]'))continue;
          const text=n.nodeValue.trim();if(text==='Español')continue;
          if(/\b(idioma|pendiente|datos|fuente|referencia|ficha|condiciones|grado|método|máximo|presiones|incertidumbre|revisión|estado|genérico|calcular|reserva|colchón|masa|cavidades|advertencias|parámetros|historial|sin|guardar|limpiar|agregar|introduce|rango|fase)\b/i.test(text))out.push(text);
        }return out;}''')
        self.assertEqual(leftovers,[], 'Texto de interfaz sin traducción')

    def test_G25_storage_blocked_still_calculates(self):
        self.page.add_init_script("Object.defineProperty(window, 'localStorage', {get(){throw new Error('bloqueado')}})")
        self.page.reload()
        self.fill_case('costos', VARIANTS[6][1])
        self.assertIn('18.4', self.page.locator('.metric').nth(4).inner_text())
        dialogs = []
        self.page.on('dialog', lambda dialog: (dialogs.append(dialog.message), dialog.accept()))
        self.page.locator('#save').click()
        self.assertEqual(dialogs, ['No se pudo escribir el historial. Comprueba el almacenamiento del navegador.'])

    def test_G26_keyboard_and_labels(self):
        self.page.locator('label[for="field-partMass"]').click()
        self.assertEqual(self.page.evaluate('document.activeElement.id'), 'field-partMass')
        self.page.keyboard.press('Control+A')
        self.page.keyboard.type('40')
        self.page.locator('#calculate').focus()
        self.page.keyboard.press('Enter')
        self.assertIn('40', self.page.locator('.metric').nth(1).text_content())
        self.assertEqual(self.page.locator('#calculation-output').get_attribute('aria-live'), 'polite')
        self.page.locator('[data-help="partMass"]').focus()
        self.page.keyboard.press('Enter')
        self.assertTrue(self.page.locator('#hint-partMass').is_visible())
        self.assertIn('Masa de pieza sólida', self.page.locator('#hint-partMass').inner_text())
        self.page.keyboard.press('Escape')
        self.assertTrue(self.page.locator('#hint-partMass').is_hidden())

    def test_G27_tooltips_mouse_keyboard_touch_and_layout(self):
        help_button = self.page.locator('[data-help="partMass"]')
        value = self.page.locator('[data-field="partMass"]').input_value()
        help_button.hover()
        self.page.wait_for_function("!document.querySelector('#hint-partMass').hidden")
        self.assertEqual(help_button.get_attribute('aria-expanded'), 'true')
        self.assertEqual(self.page.locator('#hint-partMass').get_attribute('role'), 'tooltip')
        self.page.locator('#hint-partMass').hover()
        self.assertTrue(self.page.locator('#hint-partMass').is_visible())
        self.page.locator('#calculate').hover()
        self.page.wait_for_function("document.querySelector('#hint-partMass').hidden")
        help_button.focus()
        self.assertTrue(self.page.locator('#hint-partMass').is_visible())
        self.page.keyboard.press('Escape')
        self.assertTrue(self.page.locator('#hint-partMass').is_hidden())
        self.assertEqual(self.page.locator('[data-field="partMass"]').input_value(), value)
        for width in [320, 360, 390, 430, 768, 1024, 1440]:
            self.page.set_viewport_size({'width': width, 'height': 900})
            help_button.click()
            popup = self.page.locator('#hint-partMass').bounding_box()
            self.assertIsNotNone(popup)
            self.assertGreaterEqual(popup['x'], 0)
            self.assertLessEqual(popup['x'] + popup['width'], width)
            self.assertLessEqual(popup['y'] + popup['height'], 900)
            self.assert_layout()
            if width == 1440:
                self.page.screenshot(path=str(ARTIFACTS / 'ayuda-parametro.png'))
            self.page.keyboard.press('Escape')
        # Un toque abre y otro cierra, sin hover disponible.
        context = self.browser.new_context(is_mobile=True, has_touch=True, viewport={'width':390,'height':844})
        try:
            page = context.new_page(); page.goto(self.url)
            page.locator('[data-help="partMass"]').tap()
            self.assertTrue(page.locator('#hint-partMass').is_visible())
            page.locator('[data-help="partMass"]').tap()
            self.assertTrue(page.locator('#hint-partMass').is_hidden())
            page.locator('[data-help="partMass"]').tap()
            page.locator('#materials-title').tap()
            self.assertTrue(page.locator('#hint-partMass').is_hidden())
        finally:context.close()

    def test_G28_language_switch_preserves_all_case_inputs_results_and_drafts(self):
        def quantities():
            return self.page.locator('.metric strong').evaluate_all("els=>els.map(el=>{const value=el.textContent.trim().split(' ')[0];return ['Pending','Pendiente'].includes(value)?null:value})")
        for module,values in VARIANTS:
            for level in ['basic','technical','advanced']:
                with self.subTest(module=module,level=level):
                    self.fill_case(module,values,level)
                    inputs=self.page.locator('[data-field]').evaluate_all('els=>els.map(el=>[el.dataset.field,el.value])')
                    before=quantities()
                    self.page.locator('#language').select_option('en')
                    self.page.wait_for_function("document.querySelector('#calculate').textContent==='Calculate'")
                    self.assertEqual(quantities(),before)
                    self.assertEqual(self.page.locator('[data-field]').evaluate_all('els=>els.map(el=>[el.dataset.field,el.value])'),inputs)
                    self.english_ui_is_complete()
                    self.page.locator('#language').select_option('es')
                    self.page.wait_for_function("document.querySelector('#calculate').textContent==='Calcular'")
                    self.assertEqual(quantities(),before)
                    self.__class__.language_count += 1
        self.open_custom_property('solid_density')
        self.page.locator('#custom-form [name="grade"]').fill('Borrador sin guardar')
        self.page.locator('#custom-form [name="solid_density"]').fill('950')
        self.page.locator('#custom-form [name="solid_density_unit"]').select_option('kg/m3')
        self.page.locator('#language').select_option('en')
        self.assertEqual(self.page.locator('#custom-form [name="grade"]').input_value(),'Borrador sin guardar')
        self.assertEqual(self.page.locator('#custom-form [name="solid_density"]').input_value(),'950')
        self.assertEqual(self.page.locator('#custom-form [name="solid_density_unit"]').input_value(),'kg/m3')
        self.page.reload()
        self.assertEqual(self.page.locator('#language').input_value(),'en')
        self.page.wait_for_function("document.querySelector('#calculate').textContent==='Calculate'")

    def test_G29_invalid_import_and_corrupt_storage_do_not_break_calculation(self):
        self.page.locator('#language').select_option('en')
        self.page.locator('#custom-panel > summary').click()
        self.page.locator('#custom-import').set_input_files({'name':'invalid.json','mimeType':'application/json','buffer':b'{bad'})
        self.page.wait_for_function("document.querySelector('#custom-feedback').textContent==='Invalid materials JSON.'")
        self.page.locator('#language').select_option('es')
        self.assertEqual(self.page.locator('#custom-feedback').inner_text(),'JSON de materiales no válido.')
        self.page.locator('#language').select_option('en')
        self.assertEqual(self.page.locator('#custom-feedback').inner_text(),'Invalid materials JSON.')
        self.page.locator('#custom-form button[type="submit"]').click()
        self.assertEqual(self.page.locator('#custom-feedback').inner_text(),'Invalid name, family or manufacturer.')
        self.page.locator('#language').select_option('es')
        self.assertEqual(self.page.locator('#custom-feedback').inner_text(),'Nombre, familia o fabricante no válido.')
        self.page.locator('#language').select_option('en')
        self.assertIsNone(self.page.evaluate("localStorage.getItem('ccip-user-materials-v1')"))
        self.page.evaluate("localStorage.setItem('ccip-user-materials-v1',JSON.stringify([{id:1,properties:[]},{id:'user-mal',family:'PC',grade:'Mal',properties:{solid_density:{value:-2,unit:'g/cm3'}}}]))")
        self.page.reload()
        self.assertEqual(self.page.locator('[data-personal-edit]').count(),0)
        self.fill_case('inyeccion',VARIANTS[0][1])
        self.assertIn('71.5',self.page.locator('.kpi').nth(0).inner_text())
        self.english_ui_is_complete()

    def test_G30_history_snapshot_readable_in_frozen_v1(self):
        record=self.page.evaluate("""async()=>{const {makeCustomMaterial}=await import('./src/custom-materials.js');const record=makeCustomMaterial({family:'PP',grade:'Caso propio de compatibilidad',melt_density:.8,source:'Demostración sintética, no medición'});localStorage.setItem('ccip-user-materials-v1',JSON.stringify([record]));return record;}""")
        self.page.reload();self.select_grade(record)
        self.fill_case('inyeccion',VARIANTS[0][1])
        self.save_case()
        snapshot=self.page.evaluate("JSON.parse(localStorage.getItem('ccip-calculators-web-v1'))[0]")
        self.assertEqual(snapshot['material']['dataset']['version'],json.loads((ROOT/'src/data/materials.v1.3.json').read_text())['catalog_revision'])
        self.page.locator('#language').select_option('en')
        self.page.goto(self.url+'versions/v1/')
        self.page.locator('[data-history]').nth(0).click()
        self.assertEqual(self.page.locator('#material-grade').count(),1)
        self.assertIn(record['grade'],self.page.locator('.material-summary').inner_text())
        with self.page.expect_download() as info:self.page.locator('#export').click()
        restored=json.loads(Path(info.value.path()).read_text())
        self.assertEqual(restored['inputs'],snapshot['inputs'])
        self.assertEqual(restored['metrics'],snapshot['metrics'])
        self.assertEqual(restored['material']['grade_id'],record['id'])
        self.assertEqual(self.page.locator('.mark').inner_text(),'CCIP')


    def test_G31_material_search_compare_and_csv(self):
        self.page.wait_for_function("document.querySelector('#material-family') && !document.querySelector('#material-family').disabled")
        self.page.locator('.finder-panel > summary').click()
        self.page.locator('#material-search').fill('DOWLEX 2045G')
        self.assertGreater(self.page.locator('#material-search-results .finder-option').count(),0)
        self.page.locator('#finder-with-data').check()
        self.assertGreater(self.page.locator('#material-search-results .finder-option').count(),0)
        self.page.locator('#material-search-results [data-grade-id="dow-dowlex-2045g"]').click()
        self.assertEqual(self.page.locator('#material-grade').input_value(),'dow-dowlex-2045g')
        self.page.set_viewport_size({'width':390,'height':844})
        self.assert_layout()
        self.fill_case('inyeccion',VARIANTS[0][1])
        self.save_case()
        self.page.locator('[data-field="partMass"]').fill('45')
        self.page.locator('#calculate').click()
        self.save_case()
        self.assertEqual(self.page.locator('#compare-a').locator('option').count(),3)
        self.assertIn('Shot calculado',self.page.locator('#comparison-output').inner_text())
        with self.page.expect_download() as downloaded:
            self.page.locator('#comparison-csv').click()
        content=Path(downloaded.value.path()).read_text(encoding='utf-8-sig')
        self.assertIn('Caso A',content)
        self.assertIn('Diferencia',content)
        with self.page.expect_download() as downloaded_json:
            self.page.locator('#comparison-json').click()
        payload=json.loads(Path(downloaded_json.value.path()).read_text())
        self.assertEqual(payload['comparison']['module'],'inyeccion')
        self.page.evaluate('window.print=()=>{window.__printed=true}')
        self.page.locator('#comparison-pdf').click()
        self.assertTrue(self.page.evaluate('window.__printed'))
        self.assert_layout()


    def test_G38_rename_history_and_clear_comparison(self):
        self.page.locator('#level').select_option('basic')
        self.save_case()
        self.page.locator('[data-field="partMass"]').fill('45')
        self.save_case()
        before=self.page.evaluate("JSON.parse(localStorage.getItem('ccip-calculators-web-v1'))")
        name='Molde piloto <prueba>'
        self.page.once('dialog',lambda d:d.accept(name))
        self.page.locator('[data-history-rename]').nth(0).click()
        after=self.page.evaluate("JSON.parse(localStorage.getItem('ccip-calculators-web-v1'))")
        self.assertEqual(after,[dict(before[0],name=name,updated_at=after[0]['updated_at']),before[1]])
        self.assertIn(name,self.page.locator('#history').inner_text())
        self.assertIn(name,self.page.locator('#compare-a option').nth(1).text_content())
        self.page.once('dialog',lambda d:d.dismiss())
        self.page.locator('[data-history-rename]').nth(0).click()
        self.assertEqual(self.page.evaluate("JSON.parse(localStorage.getItem('ccip-calculators-web-v1'))"),after)
        self.page.reload()
        self.page.locator('[data-history-rename]').nth(0).wait_for()
        self.assertIn(name,self.page.locator('#history').inner_text())
        for width in [390,768,1440]:
            self.page.set_viewport_size({'width':width,'height':1000})
            self.page.locator('#compare-a').select_option(self.page.locator('#compare-a option').nth(1).get_attribute('value'))
            self.page.locator('#compare-b').select_option(self.page.locator('#compare-b option').nth(2).get_attribute('value'))
            self.assertEqual(self.page.locator('.comparison-table').count(),1)
            self.page.locator('#comparison-clear').click()
            self.assertEqual(self.page.locator('#compare-a').input_value(),'')
            self.assertEqual(self.page.locator('#compare-b').input_value(),'')
            self.assertEqual(self.page.locator('.comparison-table').count(),0)
            for button in ['comparison-csv','comparison-json','comparison-pdf']:
                self.assertTrue(self.page.locator('#'+button).is_disabled())
            self.assert_layout()
        self.page.locator('#level').select_option('technical')
        self.assertEqual(self.page.locator('#compare-a').input_value(),'')
        self.assertEqual(self.page.locator('#compare-b').input_value(),'')
        self.page.locator('#compare-a').select_option(self.page.locator('#compare-a option').nth(1).get_attribute('value'))
        self.assertEqual(self.page.locator('.comparison-table').count(),0)
        self.page.locator('#compare-b').select_option(self.page.locator('#compare-b option').nth(2).get_attribute('value'))
        with self.page.expect_download() as downloaded:
            self.page.locator('#comparison-json').click()
        payload=json.loads(Path(downloaded.value.path()).read_text())
        self.assertEqual(payload['caseA']['name'],name)
        self.assertEqual(self.page.evaluate("JSON.parse(localStorage.getItem('ccip-calculators-web-v1'))"),after)
        self.page.locator('#language').select_option('en')
        self.assertEqual(self.page.locator('[data-history-rename]').nth(0).inner_text(),'Rename')
        self.assertEqual(self.page.locator('#comparison-clear').inner_text(),'Clear selection')
        self.assertIn(name,self.page.locator('#history').inner_text())

    def test_G39_stage1_titles_manual_credits_and_learning(self):
        authors=['Danaee María López Ortiz','Omar Antonio Valenzuela Ventura','Reymildo Jiménez Acosta','Montserrat Benavides Hernández','Euris Andrés Guerrero Pen','Emil Rdriguez Tejada']
        for language in ['es','en']:
            self.page.locator('#language').select_option(language)
            expected='Calculadora de procesos de transformación termoplásticos' if language=='es' else 'Thermoplastic processing calculator'
            self.assertEqual(self.page.locator('.hero h1').inner_text(),expected)
            self.assertEqual(self.page.title(),'CCIP | '+expected)
            self.assertEqual(self.page.locator('.hero .kicker').inner_text(),'CCIP · INTEC · Procesos 1: inyección' if language=='es' else 'CCIP · INTEC · Processes 1: injection molding')
            self.assertEqual(self.page.locator('.academic-credits li').all_text_contents(),authors)
            self.assertEqual(self.page.locator('.academic-credits strong').count(),0)
            styles=self.page.locator('.academic-credits li').evaluate_all('els=>els.map(el=>{const s=getComputedStyle(el);return s.color+"|"+s.fontWeight})')
            self.assertEqual(len(set(styles)),1)
            for width in [360,390,540,768,1024,1440]:
                self.page.set_viewport_size({'width':width,'height':1000})
                self.assert_layout()
                self.assertTrue(self.page.locator('#manual-open').is_visible())
                self.page.locator('#manual-open').focus()
                self.page.keyboard.press('Enter')
                self.assertTrue(self.page.locator('#user-manual').evaluate('el=>el.open'))
                self.assertEqual(self.page.locator('#manual-message').inner_text(),'Manual de uso en preparación' if language=='es' else 'User manual in preparation')
                self.page.keyboard.press('Tab')
                self.assertTrue(self.page.evaluate("document.querySelector('#user-manual').contains(document.activeElement)"))
                self.page.keyboard.press('Escape')
                self.assertFalse(self.page.locator('#user-manual').evaluate('el=>el.open'))
                self.assertTrue(self.page.locator('#manual-open').evaluate('el=>el===document.activeElement'))
                self.page.locator('#manual-open').click()
                self.page.locator('#user-manual button').click()
                self.assertFalse(self.page.locator('#user-manual').evaluate('el=>el.open'))
            self.page.locator('[data-field="partMass"]').fill('37')
            self.page.locator('#learn-page').click()
            self.assertEqual(self.page.locator('#formula-nav,[data-guide-process]').count(),0)
            self.assertEqual(self.page.locator('[data-module]').count(),7)
            self.page.locator('#formula-process').select_option('extrusion')
            self.page.locator('#formula-level').select_option('technical')
            self.page.locator('#language').select_option('es' if language=='en' else 'en')
            self.assertEqual(self.page.locator('#formula-process').input_value(),'extrusion')
            self.assertEqual(self.page.locator('#formula-level').input_value(),'technical')
            self.page.locator('#formula-index-details > summary').click()
            self.assertTrue(self.page.locator('#formulas-exact-index').is_visible())
            self.page.locator('#learning-back').click()
            self.assertEqual(self.page.locator('[data-field="partMass"]').input_value(),'37')
        self.page.goto(self.url+'formulas.html?process=inyeccion&level=advanced')
        self.assertEqual(self.page.locator('#formula-nav,[data-guide-process]').count(),0)
        self.assertEqual(self.page.locator('[data-lesson]').count(),42)

    def test_G40_stage1_official_logos_divider_and_clearspace(self):
        for width in [360,390,540,768,1024,1440]:
            self.page.set_viewport_size({'width':width,'height':1000})
            for lang in ['es','en']:
                self.page.locator('#language').select_option(lang)
                self.assert_layout()
                logo=self.page.locator('.intec-logo')
                self.assertTrue(logo.evaluate('el=>el.complete && el.naturalWidth===801 && el.naturalHeight===900'))
                box=logo.bounding_box();ccip=self.page.locator('.ccip-logo').bounding_box();divider=self.page.locator('.institutional-divider').bounding_box()
                self.assertAlmostEqual(box['width']/box['height'],801/900,places=3)
                # El PNG tiene margen transparente: comprobar el ancho de la
                # marca real (668 de los 801 px), no solo el lienzo del archivo.
                self.assertGreaterEqual(box['width']*668/801,75 if width<=540 else 50)
                name=self.page.locator('.institution-name')
                self.assertEqual(name.inner_text(),'Instituto Tecnológico de Santo Domingo (INTEC)')
                self.assertTrue(name.is_visible())
                self.assertGreaterEqual(name.bounding_box()['x'],box['x']+box['width'])
                self.assertGreaterEqual(name.bounding_box()['x']-box['x']-box['width'],2*38*box['width']/801)
                if width<=540:
                    self.assertLessEqual(ccip['y']+ccip['height'],divider['y'])
                    self.assertLessEqual(divider['y']+divider['height'],box['y'])
                    self.assertLessEqual(divider['height'],1.1)
                    identity=self.page.locator('.institutional-identity').bounding_box()
                    self.assertAlmostEqual(divider['x'],identity['x'],delta=1)
                    self.assertAlmostEqual(divider['width'],identity['width'],delta=1)
                    self.assertAlmostEqual(ccip['x']+ccip['width']/2,identity['x']+identity['width']/2,delta=1)
                else:
                    self.assertLessEqual(ccip['x']+ccip['width'],divider['x'])
                    self.assertLess(divider['x'],box['x'])
                    self.assertLessEqual(divider['width'],1.1)
                if width>540:
                    self.assertAlmostEqual(ccip['y']+ccip['height']/2,box['y']+box['height']/2,delta=1)
                padding=logo.evaluate('el=>parseFloat(getComputedStyle(el.parentElement).paddingLeft)')
                self.assertGreaterEqual(padding,2*38*box['width']/801)
                self.assertEqual(logo.evaluate('el=>getComputedStyle(el).filter'),'none')
                language=self.page.locator('#language').bounding_box()
                self.assertTrue(language['x']>=box['x']+box['width'] or language['y']>=box['y']+box['height'])
        self.assertEqual(self.page.locator('.brand').get_attribute('href'),'./')

    def test_G41_mobile_process_picker_and_desktop_buttons(self):
        ids=['inyeccion','extrusion','pelicula','soplado','termoformado','secado','costos']
        spanish=['Moldeo por inyección','Extrusión','Película soplada','Soplado de envases','Termoformado','Secado y acondicionamiento','Producción y costos']
        english=['Injection molding','Extrusion','Blown film','Blow molding','Thermoforming','Drying and conditioning','Production and costs']
        for width in [360,390,540,768,1024,1440]:
            self.page.set_viewport_size({'width':width,'height':1000})
            for language in ['es','en']:
                self.page.locator('#language').select_option(language)
                picker=self.page.locator('#process-select')
                self.assertEqual(picker.locator('option').count(),7)
                self.assertEqual(picker.locator('option').evaluate_all('els=>els.map(el=>el.value)'),ids)
                self.assertEqual(picker.locator('option').all_text_contents(),spanish if language=='es' else english)
                self.assertEqual(self.page.locator('label[for="process-select"]').text_content(),'Seleccionar proceso' if language=='es' else 'Select process')
                self.assertEqual(picker.is_visible(),width<=800)
                self.assertEqual(self.page.locator('#modules').is_visible(),width>800)
                for i,module in enumerate(ids):
                    self.select_process(module)
                    self.assertEqual(picker.input_value(),module)
                    self.assertEqual(self.page.locator('#modules .active').get_attribute('data-module'),module)
                    selected=picker.locator('option:checked').text_content()
                    self.assertEqual(self.page.locator('#module-title').text_content(),selected)
                    level=['basic','technical','advanced'][i%3]
                    self.page.locator('#level').select_option(level)
                    if module=='secado':
                        self.grade('ineos-styrolution-terluran-gp-22')
                        drying=next(m for m in MATERIALS if m['id']=='ineos-styrolution-terluran-gp-22')['properties']['drying_time']
                        duration=drying['value'] if drying['value'] is not None else drying['range'][0]
                        self.page.locator('[data-field="residence"]').fill(str(duration))
                    self.page.locator('#calculate').click()
                    self.assertGreater(self.page.locator('.kpi').count(),0,(width,language,module,self.page.locator('#calculation-output').inner_text(),self.page.locator('input[data-field]').evaluate_all('els=>els.map(e=>[e.dataset.field,e.value])')))
                    self.assertEqual(self.page.locator('#level').input_value(),level)
                    self.assert_layout()
                self.assertTrue(self.page.locator('aside').evaluate('el=>el.scrollWidth<=el.clientWidth'))

    def test_G42_process_picker_sync_sessions_learning_and_history(self):
        self.page.set_viewport_size({'width':390,'height':1000})
        self.grade('generic-hdpe')
        self.page.locator('[data-field="partMass"]').fill('47')
        self.save_case()
        self.select_process('extrusion')
        self.page.locator('[data-field="width"]').fill('630')
        self.page.locator('#level').select_option('advanced')
        self.select_process('inyeccion')
        self.assertEqual(self.page.locator('[data-field="partMass"]').input_value(),'47')
        self.assertEqual(self.page.locator('#material-grade').input_value(),'generic-hdpe')
        self.assertEqual(self.page.locator('#level').input_value(),'advanced')
        self.page.set_viewport_size({'width':1440,'height':1000})
        self.page.locator('[data-module="extrusion"]').click()
        self.assertEqual(self.page.locator('#process-select').input_value(),'extrusion')
        self.assertEqual(self.page.locator('[data-field="width"]').input_value(),'630')
        self.page.set_viewport_size({'width':390,'height':1000})
        self.assertEqual(self.page.locator('#process-select').input_value(),'extrusion')
        self.page.locator('[data-history]').nth(0).click()
        self.assertEqual(self.page.locator('#process-select').input_value(),'inyeccion')
        self.page.locator('#learn-page').click()
        self.assertIn('view=learning',self.page.url)
        self.page.locator('#process-select').select_option('costos')
        self.assertTrue(self.page.locator('#learning-view').is_hidden())
        self.assertEqual(self.page.locator('#process-select').input_value(),'costos')
        self.page.go_back()
        self.assertTrue(self.page.locator('#learning-view').is_visible())
        self.page.go_forward()
        self.assertTrue(self.page.locator('#learning-view').is_hidden())
        self.assertEqual(self.page.locator('#process-select').input_value(),'costos')
        self.page.locator('#language').select_option('en')
        self.assertEqual(self.page.locator('#process-select').input_value(),'costos')
        self.select_process('extrusion')
        self.assertEqual(self.page.locator('[data-field="width"]').input_value(),'630')

    def test_G32_custom_crud_import_export_persistence_and_units(self):
        self.open_custom_property('melt_density')
        form=self.page.locator('#custom-form')
        form.locator('[name="family"]').select_option('PP')
        form.locator('[name="grade"]').fill('Material de ensayo')
        form.locator('[name="manufacturer"]').fill('Laboratorio')
        form.locator('[name="melt_density"]').fill('800')
        form.locator('[name="melt_density_unit"]').select_option('kg/m3')
        form.locator('[name="melt_density_source"]').fill('Datos sintéticos; no son medición')
        form.locator('[name="melt_density_conditions"]').fill('220 °C; 30 MPa; fundido')
        form.locator('button[type="submit"]').click()
        saved=self.page.evaluate("JSON.parse(localStorage.getItem('ccip-user-materials-v1'))")
        self.assertEqual(saved[0]['properties']['melt_density']['value'],.8)
        self.assertEqual(saved[0]['properties']['melt_density']['entered_unit'],'kg/m3')
        grade_id=saved[0]['id']
        self.page.locator('#material-details > summary').click()
        self.assertEqual(self.page.locator('[data-field="meltDensity"]').input_value(),'0.8')
        self.page.locator('#custom-panel > summary').click()
        with self.page.expect_download() as info:self.page.locator('#custom-export').click()
        payload=Path(info.value.path()).read_bytes()
        exported=json.loads(payload)
        self.assertEqual(exported['schema_version'],'ccip-custom-materials/1')
        self.assertEqual(exported['materials'][0]['properties']['melt_density']['entered_value'],800)
        self.page.locator('[data-personal-edit]').click()
        self.open_custom_property('melt_density')
        self.assertEqual(form.locator('[name="melt_density"]').input_value(),'800')
        form.locator('[name="melt_density"]').fill('750')
        form.locator('button[type="submit"]').click()
        self.page.reload()
        self.assertEqual(self.page.locator('[data-personal-edit]').count(),1)
        self.select_grade({**saved[0],'id':grade_id})
        self.assertEqual(self.page.locator('[data-field="meltDensity"]').input_value(),'0.75')
        self.page.locator('#custom-panel > summary').click()
        self.page.on('dialog',lambda dialog:dialog.accept())
        self.page.locator('[data-personal-delete]').click()
        self.assertEqual(self.page.locator('[data-personal-edit]').count(),0)
        self.assertEqual(self.page.locator('[data-field="meltDensity"]').input_value(),'')
        self.page.locator('#custom-panel > summary').click()
        self.page.locator('#custom-import').set_input_files({'name':'propios.json','mimeType':'application/json','buffer':payload})
        self.page.wait_for_function("JSON.parse(localStorage.getItem('ccip-user-materials-v1')).length===1")
        self.assertEqual(self.page.locator('[data-personal-edit]').count(),1)
        self.page.reload()
        self.assertEqual(self.page.locator('[data-personal-edit]').count(),1)
        self.assertEqual(self.page.evaluate("JSON.parse(localStorage.getItem('ccip-user-materials-v1'))[0].id"),grade_id)

    def test_G33_archived_versions_and_download_integrity(self):
        import hashlib,urllib.request,zipfile,io
        snapshot=json.loads((ROOT/'versions/antes-inyeccion-2026-10-15.json').read_text())
        for name,digest in snapshot['web_sha256'].items():
            self.assertEqual(hashlib.sha256((ROOT/snapshot['web_path']/name).read_bytes()).hexdigest(),digest)
        with urllib.request.urlopen(self.url+snapshot['source_zip']) as response:payload=response.read()
        self.assertEqual(hashlib.sha256(payload).hexdigest(),snapshot['source_zip_sha256'])
        with zipfile.ZipFile(io.BytesIO(payload)) as z:self.assertIsNone(z.testzip())
        for path in [snapshot['web_path'],'versions/v1/']:
            self.page.goto(self.url+path);self.page.locator('[data-field="partMass"]').wait_for()
            for key,value in {'partMass':30,'cavities':2,'runnerMass':5}.items():self.page.locator('[data-field="'+key+'"]').fill(str(value))
            self.page.locator('#calculate').click();self.assertIn('65 g',self.page.locator('.metric').nth(1).text_content())
        self.assertEqual(snapshot['source_commit'],'e52269f0d2faa87da32b48022727c5c5252fbbc0')

    def test_G34_all_catalog_profiles_english_and_layout(self):
        self.page.locator('#language').select_option('en')
        for i,material in enumerate(MATERIALS):
            with self.subTest(grade=material['id']):
                self.page.set_viewport_size({'width':[320,390,768,1024,1440][i%5],'height':900})
                self.page.locator('#level').select_option(['basic','technical','advanced'][i%3]);self.select_grade(material)
                self.page.locator('#calculate').click();self.english_ui_is_complete();self.assert_layout()
                self.assertEqual(self.page.locator('#material-grade').input_value(),material['id'])
                self.__class__.catalog_count+=1

    def test_G35_all_formula_examples_filters_and_alternatives(self):
        for lang in ['es','en']:
            self.page.locator('#language').select_option(lang);self.page.locator('#learn-page').click()
            self.assertEqual(self.page.locator('[data-lesson]').count(),42)
            for module,_ in VARIANTS[:7]:
                topic=self.page.locator('#guide-'+module)
                if not topic.evaluate('el=>el.open'):topic.locator(':scope > summary').click()
                for card in topic.locator('[data-lesson]').all():
                    card.locator(':scope > summary').click()
                    value=card.locator('[data-example-value]')
                    raw=value.get_attribute('data-example-value')
                    expected=self.page.evaluate('''async id=>{const {lessons}=await import('./src/formulas-data.js');return lessons.find(x=>x.id===id).expected}''',card.get_attribute('id'))
                    self.assertAlmostEqual(float(raw),expected)
                    self.assertGreater(card.locator('.worked-example li').count(),0)
                    self.assertGreater(card.locator('.formula-variables b').count(),0)
                    self.assertEqual(self.page.locator('.education-panel[open]').count(),1)
            self.page.locator('#formula-level').select_option('technical')
            self.assertEqual(self.page.locator('[data-lesson]:not([hidden])').count(),28)
            self.page.locator('#formula-level').select_option('basic')
            self.assertGreater(self.page.locator('[data-lesson]:not([hidden])').count(),0)
            self.page.locator('#formula-process').select_option('secado')
            self.assertEqual(self.page.locator('.formula-topic:not([hidden])').count(),1)
            if lang=='en':self.english_ui_is_complete()
            self.page.locator('#learning-back').click()
        self.page.goto(self.url+'formulas.html?process=inyeccion&level=advanced#inyeccion-8')
        self.page.locator('#inyeccion-8[open]').wait_for()
        self.assertEqual(self.page.locator('a[href*=".js"]').count(),0)
        self.assertEqual(self.page.locator('.education-panel[open]').count(),1)

    def test_G36_strict_pvc_pa6_and_physical_profile(self):
        self.density(level='advanced');self.help('meltDensity')
        self.page.locator('#density-help > details > summary').click()
        for width in [320,390,768,1440]:
            self.page.set_viewport_size({'width':width,'height':900})
            self.page.wait_for_function("(()=>{const r=document.querySelector('#hint-meltDensity').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight})()")
        self.page.locator('#density-policy').select_option('verified_only')
        self.assertEqual(self.page.locator('[data-field="meltDensity"]').input_value(),'')
        self.page.locator('[data-field="meltDensity"]').fill('0.8');self.help('meltDensity')
        if not self.page.locator('#density-help > details').evaluate('el=>el.open'):self.page.locator('#density-help > details > summary').click()
        self.page.locator('#material-pvtTemperatureC').press_sequentially('230')
        self.page.locator('#material-pvtPressureMPa').press_sequentially('50')
        self.page.locator('#material-meltDensitySource').fill('Ensayo sintético de trazabilidad')
        self.page.locator('#density-verified').check();self.page.keyboard.press('Escape')
        r=self.record();self.assertEqual(r['density_assessment']['verified'],True)
        self.assertEqual(r['density_assessment']['value_g_cm3'],.8)
        self.help('meltDensity');self.page.locator('#density-policy').select_option('reference_allowed')
        self.grade('generic-pvc');self.page.locator('[data-field="meltDensity"]').fill('')
        self.help('meltDensity');self.page.locator('#pvc-melt-form').select_option('rigid')
        self.help('meltDensity');self.page.locator('#use-family-density').click()
        self.assertEqual(self.page.locator('[data-field="meltDensity"]').input_value(),'1.22')
        self.help('meltDensity');self.page.locator('#pvc-melt-form').select_option('flexible')
        self.assertEqual(self.page.locator('[data-field="meltDensity"]').input_value(),'1.2')
        self.grade('generic-pa6');self.assertEqual(self.page.locator('[data-field="meltDensity"]').input_value(),'0.96')
        self.help('meltDensity');self.page.locator('#density-help > details > summary').click()
        self.page.locator('#material-pvtTemperatureC').press_sequentially('260')
        self.assertEqual(self.page.locator('[data-field="meltDensity"]').input_value(),'')
        self.page.keyboard.press('Escape');self.grade('generic-hdpe')
        self.page.locator('[data-field="shotMargin"]').fill('20')
        self.page.locator('#profile-details > summary').click();r=self.record()
        self.assertEqual(r['injection_profile']['settings']['fractions'],[30,50,20])
        self.assertAlmostEqual(r['injection_profile']['volume_cm3'],65/.73)
        self.assertEqual(self.page.locator('.profile-bars span').count(),3)
        self.page.locator('#profile-fraction-0').fill('40');self.page.locator('#calculate').click()
        self.assertIn('sumar 100',self.page.locator('.profile-output').inner_text())
        self.page.locator('#profile-fraction-1').fill('40');self.page.locator('#profile-initial').fill('300');self.page.locator('#profile-direction').select_option('decreasing');r=self.record()
        self.assertEqual(r['injection_profile']['stages'][0]['start_position_mm'],300)
        self.page.locator('#level').select_option('basic');self.assertTrue(self.page.locator('#injection-profile').is_hidden())
        self.page.locator('[data-history]').nth(0).click();self.assertEqual(self.page.locator('#profile-fraction-0').input_value(),'40')

    def test_G37_custom_drying_filter_and_bulk_phase(self):
        record=self.page.evaluate('''async()=>{const {makeCustomMaterial}=await import('./src/custom-materials.js');const m=makeCustomMaterial({family:'PVC',grade:'PVC propio sintético',source:'Protocolo sintético, no propiedad industrial',drying_time:2,drying_temperature:60,bulk_density:500,bulk_density_unit:'kg/m3',bulk_density_form:'pellets'});localStorage.setItem('ccip-user-materials-v1',JSON.stringify([m]));return m}''')
        self.page.reload();self.select_process('secado');self.page.locator('#level').select_option('technical');self.select_grade(record)
        self.assertEqual(self.page.locator('[data-field="residence"]').input_value(),'2')
        self.help('bulkDensity');self.page.locator('#material-physicalForm').select_option('pellets')
        self.help('bulkDensity');self.page.locator('#material-bulkCompatible').check()
        self.assertEqual(self.page.locator('[data-field="bulkDensity"]').input_value(),'0.5')
        r=self.record();self.assertEqual(r['metrics'][1]['value'],200)
        self.assertEqual(r['material']['grade_snapshot']['properties']['bulk_density']['entered_unit'],'kg/m3')

if __name__ == '__main__':
    unittest.main(verbosity=2)
