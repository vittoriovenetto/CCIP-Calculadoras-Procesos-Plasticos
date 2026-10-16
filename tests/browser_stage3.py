"""Etapa 3: recetas, evidencia, procedencia y archivos reales; no publica."""
import json
import unittest
from browser_stage2 import Stage2, ARTIFACTS, KEY
from browser_smoke import MATERIALS

class Stage3(Stage2):
    def setUp(self):
        super().setUp()
        self.page.set_default_timeout(7000)

    def recipe(self):
        self.grade('dow-dow-12450n')
        self.page.locator('#material-origin').select_option('blend')
        self.assertIn('pendiente',self.page.locator('#blend-preview').inner_text().lower())

    def model(self):
        self.recipe()
        self.page.locator('#formulation-editor details').first.locator('summary').click()
        self.page.locator('#blend-recycled_family').fill('HDPE')
        self.page.locator('#blend-recycled_id').fill('synthetic-test-R')
        self.page.locator('#blend-recycled_name').fill('Synthetic browser fixture, not a real grade')
        self.page.locator('#blend-density-details > summary').click()
        self.page.locator('#blend-density-strategy').select_option('ideal')
        for component,value in [('virgin','.75'),('recycled','.70')]:
            for key,text in [('value',value),('temperature_C','200'),('pressure_MPa','5'),('source','Synthetic test fixture, no manufacturer claim')]:
                self.page.locator(f'#blend-{component}-{key}').fill(text)
            self.page.locator(f'#blend-{component}-confirmed').check()
        self.page.locator('#blend-model-accepted').check()
        self.assertIn('Estimación de modelo',self.page.locator('#blend-preview').inner_text())

    def test_E01_origins_presets_invalid_mass_and_no_inheritance(self):
        self.recipe()
        self.assertEqual(self.page.locator('#blend-ratio option').count(),12)
        for ratio in ['100/0','90/10','80/20','70/30','60/40','50/50','40/60','30/70','20/80','10/90','0/100']:
            self.page.locator('#blend-ratio').select_option(ratio)
            self.assertEqual(self.page.locator('#blend-virgin_percent').input_value(),ratio.split('/')[0])
            self.page.locator('#calculate').click()
            if ratio!='100/0':self.assertEqual(self.page.locator('#field-meltDensity').input_value(),'')
        self.page.locator('#blend-virgin_percent').fill('40')
        self.assertIn('revisa porcentajes',self.page.locator('#blend-preview').inner_text())
        self.page.locator('#calculate').click();self.open_results()
        self.assertEqual(self.page.locator('#metrics .metric').filter(has_text='Shot calculado (volumen)').count(),0)
        self.save_case('Sin volumen disponible')
        self.assertIsNone(next(m['value'] for m in self.stored()[0]['metrics'] if m['label']=='Shot calculado (volumen)'))
        self.assertNotIn('Pendiente',self.page.locator('#metrics .metric').filter(has_text='Shot calculado (masa)').inner_text())
        for origin in ['PIR','PCR','internal_regrind','commercial_recycled']:
            self.page.locator('#material-origin').select_option(origin)
            self.assertEqual(self.page.locator('#blend-recycled_percent').input_value(),'100')
        self.page.locator('#material-origin').select_option('virgin')
        self.assertEqual(self.page.locator('#formulation-editor').inner_text(),'')
        self.assertNotEqual(self.page.locator('#field-meltDensity').input_value(),'')

    def test_E02_model_math_strict_conditions_manual_and_phase(self):
        self.model()
        self.assertAlmostEqual(float(self.page.locator('#field-meltDensity').input_value()),1/(.8/.75+.2/.7),places=12)
        self.page.locator('#level').select_option('advanced')
        self.page.locator('#profile-details > summary').click()
        self.page.locator('#calculate').click();self.open_results()
        self.assertIn('densidad de formulación',self.page.locator('#metrics').inner_text())
        self.assertEqual(self.page.locator('.profile-output tbody tr').count(),3)
        self.page.locator('#field-meltDensity').fill('.72')
        self.assertEqual(self.page.locator('#field-meltDensity').input_value(),'.72')
        self.page.locator('#calculate').click()
        self.assertIn('densidad de formulación',self.page.locator('#metrics').inner_text())
        self.help('meltDensity')
        self.assertEqual(self.page.locator('#use-family-density').count(),0)
        self.page.locator('#density-help details > summary').click()
        self.page.locator('#density-policy').select_option('verified_only')
        self.page.locator('#calculate').click();self.open_results()
        self.assertEqual(self.page.locator('#metrics .metric').filter(has_text='Shot calculado (volumen)').count(),0)
        self.save_case('Sin volumen disponible')
        self.assertIsNone(next(m['value'] for m in self.stored()[0]['metrics'] if m['label']=='Shot calculado (volumen)'))
        self.page.locator('#blend-density-details > summary').click()
        self.page.locator('#blend-density-phase').select_option('solid')
        self.assertEqual(self.page.locator('#blend-virgin-value').input_value(),'')
        self.assertEqual(self.page.locator('#field-meltDensity').input_value(),'')

    def test_E03_research_multiple_measurements_comparisons_and_saved_evidence(self):
        self.grade('catalog-abs-terluran-gp-35')
        self.page.locator('#research-details > summary').click()
        self.page.locator('#research-flow').wait_for()
        self.page.locator('#research-flow > summary').click()
        self.assertGreaterEqual(self.page.locator('#flow-a option').count(),3)
        options=self.page.locator('#flow-a option').evaluate_all('els=>els.slice(1).map(e=>({value:e.value,text:e.textContent}))')
        mfr=next(x for x in options if 'MFR' in x['text']);mvr=next(x for x in options if 'MVR' in x['text'])
        self.page.locator('#flow-a').select_option(mfr['value']);self.page.locator('#flow-b').select_option(mvr['value'])
        self.assertEqual(self.page.locator('#flow-comparison').get_attribute('data-reason'),'different_quantity')
        self.page.locator('#flow-b').select_option(mfr['value'])
        self.assertEqual(self.page.locator('#flow-comparison').get_attribute('data-status'),'conditional')
        self.save_case('Evidencia GP35');saved=self.stored()[0]
        self.assertTrue(saved['material']['research_snapshot']['facts'])
        self.assertEqual(saved['material']['research_snapshot']['flow_comparison']['result']['status'],'conditional')
        snapshot=saved['material']['research_snapshot']
        self.page.route('**/material-research.v1.json',lambda route:route.abort())
        self.page.locator('[data-history]').first.click()
        self.page.locator('#research-details > summary').click()
        self.page.locator('#research-flow').wait_for()
        self.assertEqual(self.stored()[0]['material']['research_snapshot'],snapshot)
        self.assertFalse(self.errors)

    def test_E04_formulation_history_and_real_exports(self):
        self.model();self.save_case('Mezcla sintética 80/20')
        snapshot=self.stored()[0];density=snapshot['inputs']['meltDensity']
        self.assertEqual(snapshot['material']['formulation']['percentage_basis'],'mass')
        self.assertEqual(snapshot['material']['used_fields']['meltDensity']['origin'],'mixture_model')
        self.page.locator('#blend-ratio').select_option('50/50');self.page.locator('[data-history]').first.click()
        self.assertEqual(self.page.locator('#blend-ratio').input_value(),'80/20')
        self.assertEqual(float(self.page.locator('#field-meltDensity').input_value()),float(density))
        self.assertEqual(self.stored()[0],snapshot)
        jpath=self.download('json',saved=True);saved_json=json.loads(jpath.read_text())
        self.assertIn('formulation',json.dumps(saved_json))
        for lang in ['es','en']:
            self.page.locator('#language').select_option(lang)
            book=self.check_excel(self.download('xlsx',saved=True),snapshot,lang)
            text=' '.join(str(c.value) for sheet in book for row in sheet for c in row)
            self.assertIn('80 % V / 20 % R',text);self.assertIn('Synthetic test fixture',text)
            pdf,pages=self.check_pdf(self.download('pdf',saved=True),lang)
            self.assertIn('80 % V / 20 % R',pdf);self.assertIn('Synthetic test fixture',pdf)
        self.assertEqual(self.stored()[0],snapshot)

    def test_E05_responsive_bilingual_and_drying_filter(self):
        self.model()
        for lang in ['es','en']:
            self.page.locator('#language').select_option(lang)
            self.assertEqual(self.page.locator('#material-origin').input_value(),'blend')
            for width in [360,390,540,768,1024,1440]:
                self.page.set_viewport_size({'width':width,'height':1000})
                self.page.locator('#blend-density-details').evaluate('el=>el.open=true')
                self.assert_layout()
                self.page.locator('#materials').scroll_into_view_if_needed()
                self.page.screenshot(path=str(ARTIFACTS/f'etapa3-mezcla-{lang}-{width}.png'),full_page=True)
        self.select_process('secado')
        self.assertEqual(self.page.locator('#material-origin').count(),0)
        self.assertEqual(self.page.evaluate("async()=>{const m=await import('./src/lean-materials.js');const d=await (await fetch('./src/data/materials.v1.3.json')).json();return m.materialCatalogFor(d,'secado').materials.length}"),9)
        self.select_process('inyeccion')
        self.assertEqual(self.page.locator('#material-origin').input_value(),'blend')
        self.page.locator('#learn-page').click();self.assertTrue(self.page.locator('#learning-view').is_visible())

    def test_E06_measurement_cannot_follow_different_ratio_or_phase(self):
        self.recipe();self.page.locator('#blend-density-details > summary').click()
        self.page.locator('#blend-density-strategy').select_option('measured')
        for key,value in [('value','.74'),('temperature_C','200'),('pressure_MPa','5'),('source','Synthetic measured fixture')]:
            self.page.locator(f'#blend-measured-{key}').fill(value)
        self.page.locator('#blend-measured-confirmed').check()
        self.assertAlmostEqual(float(self.page.locator('#field-meltDensity').input_value()),.74)
        self.page.locator('#blend-ratio').select_option('70/30')
        self.assertEqual(self.page.locator('#field-meltDensity').input_value(),'')
        self.assertFalse(self.page.locator('#blend-measured-confirmed').is_checked())

    def test_E08_documentary_and_profile_screenshots(self):
        self.model()
        self.page.locator('#level').select_option('advanced')
        self.page.locator('#field-screwD').fill('20')
        self.page.locator('#field-screwMaxStroke').fill('400')
        self.page.locator('#profile-details > summary').click()
        self.page.locator('#calculate').click()
        for width in [390,1440]:
            self.page.set_viewport_size({'width':width,'height':1000})
            self.assert_layout()
            self.page.evaluate('window.scrollTo(0,0)')
            self.page.screenshot(path=str(ARTIFACTS/f'etapa3-perfil-es-{width}.png'),full_page=True)
        self.grade('catalog-abs-terluran-gp-35')
        self.page.locator('#research-details > summary').click()
        self.page.locator('#research-flow').wait_for()
        self.page.locator('#research-flow > summary').click()
        self.page.locator('#research-details').scroll_into_view_if_needed()
        self.page.screenshot(path=str(ARTIFACTS/'etapa3-fluidez-es-1440.png'),full_page=True)

    def test_E07_families_processes_levels_without_inherited_properties(self):
        for module in ['inyeccion','extrusion','pelicula','soplado','termoformado','costos']:
            self.select_process(module)
            for family in ['hdpe','ldpe','lldpe','pp','pet','abs','pa6','pc','pvc']:
                self.grade('generic-'+family)
                self.page.locator('#material-origin').select_option('blend')
                for level in ['basic','technical','advanced']:
                    self.page.locator('#level').select_option(level)
                    self.page.locator('#calculate').click()
                    self.assertEqual(self.page.locator('#material-origin').input_value(),'blend')
                    for key in ['meltDensity','density','specificHeat','bulkDensity']:
                        control=self.page.locator('#field-'+key)
                        if control.count():self.assertEqual(control.input_value(),'')
        self.select_process('secado')
        self.assertEqual(self.page.locator('#material-origin').count(),0)

    def test_E09_gp35_official_regional_measurements_remain_independent(self):
        self.grade('catalog-abs-terluran-gp-35')
        self.page.locator('#research-details > summary').click()
        self.page.locator('#research-flow').wait_for()
        self.page.locator('#research-flow > summary').click()
        options=self.page.locator('#flow-a option').evaluate_all('els=>els.slice(1).map(e=>({value:e.value,text:e.textContent}))')
        astm=next(x for x in options if ' MFR 34 ' in x['text'])
        iso=next(x for x in options if ' MVR 34 ' in x['text'])
        self.assertIn('Americas',astm['text']);self.assertIn('EMEA',iso['text'])
        self.page.locator('#flow-a').select_option(astm['value']);self.page.locator('#flow-b').select_option(iso['value'])
        self.assertEqual(self.page.locator('#flow-comparison').get_attribute('data-reason'),'different_quantity')
        self.save_case('GP35 ASTM e ISO por región')
        record=self.stored()[0]['material']['research_snapshot']
        rows=[x for x in record['flow_measurements'] if x['value']==34]
        self.assertEqual(len(rows),2);self.assertNotEqual(rows[0]['source_id'],rows[1]['source_id'])
        for x in rows:self.assertEqual(x['sku'],'300600120829');self.assertIsNone(x['variant']);self.assertIn(x['source_id'],record['flow_sources'])
        self.page.screenshot(path=str(ARTIFACTS/'revision-gp35-regiones.png'),full_page=True)

    def test_E10_all_fifteen_experimental_formulations_have_provenance_without_autofill(self):
        ids=set()
        for language in ['es','en']:
            self.page.locator('#language').select_option(language)
            for family,count in [('hdpe',8),('pp',7)]:
                self.grade('generic-'+family)
                values=self.page.locator('[data-field]').evaluate_all('els=>els.map(e=>[e.dataset.field,e.value])')
                self.page.locator('#research-details > summary').click()
                self.page.locator('#research-recycling').wait_for()
                self.page.locator('#research-recycling > summary').click()
                self.page.locator('#research-compositions > summary').click()
                articles=self.page.locator('[data-experimental-formulation]')
                self.assertEqual(articles.count(),count)
                for a in articles.all():
                    ids.add(a.get_attribute('data-experimental-formulation'))
                    self.assertIn('DOI:',a.inner_text());self.assertIn('REC-0',a.inner_text());self.assertTrue(a.locator('a[href^="https://www.mdpi.com/"]').count())
                self.assertEqual(values,self.page.locator('[data-field]').evaluate_all('els=>els.map(e=>[e.dataset.field,e.value])'))
                if language=='es':self.page.screenshot(path=str(ARTIFACTS/f'revision-composiciones-{family}.png'),full_page=True)
        self.assertEqual(len(ids),15)
        self.save_case('Ensayos publicados sin aplicación')
        rows=self.stored()[0]['material']['research_snapshot']['experimental_formulations']
        self.assertEqual(len(rows),7)
        for row in rows:self.assertFalse(row['automatic_application_allowed']);self.assertIsNone(row['virgin_catalog_id']);self.assertTrue(row['source']['doi'])

if __name__=='__main__':
    suite=unittest.TestSuite(Stage3(name) for name in unittest.defaultTestLoader.getTestCaseNames(Stage3) if name.startswith('test_E'))
    result=unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(not result.wasSuccessful())
