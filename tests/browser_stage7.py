"""Etapa 7: additional responsive, independent numerical and failure checks.
Set CCIP_STAGE7_URL to test the exact dist artifact or the public HTTPS URL.
No TLS overrides, deployment, or mutation of public data.
"""
import hashlib
import json
import os
import unittest
from pathlib import Path
import fitz
from browser_stage6 import Stage6
from browser_smoke import ROOT, ARTIFACTS, VARIANTS

WIDTHS=(320,360,390,540,768,1024,1440,1920)
class Stage7(Stage6):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        if os.environ.get('CCIP_STAGE7_DIST')=='1':cls.url+='dist/'
        if os.environ.get('CCIP_STAGE7_URL'):cls.url=os.environ['CCIP_STAGE7_URL']

    def test_J01_seven_processes_three_levels_eight_widths_two_languages(self):
        count=0
        for module,values in VARIANTS[:7]:
            for level in ('basic','technical','advanced'):
                self.fill_case(module,values,level)
                before=self.page.locator('#metrics').inner_text()
                self.assertTrue(before.strip())
                for lang in ('es','en'):
                    self.page.locator('#language').select_option(lang)
                    for width in WIDTHS:
                        self.page.set_viewport_size({'width':width,'height':1000})
                        self.assert_layout();count+=1
                        if module in ('inyeccion','secado') and level=='advanced' and width in (360,540,1440,1920):
                            self.page.screenshot(path=str(ARTIFACTS/f'etapa7-{module}-{lang}-{width}.png'),full_page=True)
                self.page.locator('#language').select_option('es')
                self.assertEqual(self.page.locator('#metrics').inner_text(),before)
        print('Etapa 7 estados adicionales módulo/nivel/idioma/ancho:',count,flush=True)

    def test_J02_invalid_optional_catalogs_leave_manual_calculation_available(self):
        for name in ('materials.v1.3.json','machines.v1.json','user-materials.v1.json'):
            self.page.route('**/'+name,lambda r:r.fulfill(status=200,content_type='application/json',body='{'))
        self.page.reload();self.page.locator('#materials').wait_for()
        self.page.wait_for_function("document.body.innerText.includes('Catálogo no disponible')")
        self.page.locator('#field-partMass').fill('13');self.page.locator('#field-cavities').fill('3');self.page.locator('#calculate').click();self.open_results()
        self.assertIn('39',self.page.locator('#metrics').inner_text())
        self.assertIn('entradas manuales',self.page.locator('#machine-panel').inner_text())
        self.page.locator('#language').select_option('en');self.english_ui_is_complete()
        self.assertIn('manual',self.page.locator('#machine-panel').inner_text())

    def test_J03_independent_values_visible_and_saved_for_all_seven_processes(self):
        fixtures=json.loads((ROOT/'tests/fixtures-stage7-numerics.json').read_text())
        chosen=[]
        for c in fixtures:
            if c['process'] not in [x['process'] for x in chosen]:chosen.append(c)
        for c in chosen:
            self.fill_case(c['process'],c['inputs']);self.save_case('Independent SI reference '+c['process'])
            record=self.stored()[0]
            for ref in c['expected']:
                got=next(m for m in record['metrics'] if m['label']==ref['label'])
                self.assertEqual(got['unit'],ref['unit'])
                if ref['value'] is None:self.assertIsNone(got['value'])
                else:self.assertAlmostEqual(got['value'],ref['value'],delta=1e-10*max(1,abs(ref['value'])))
        self.assertEqual(len(self.stored()),7)

    def test_J04_real_english_exports_keep_snapshot_and_pdf_lines_do_not_overlap(self):
        self.fill_case('inyeccion',VARIANTS[0][1]);self.save_case('Stage 7 = synthetic / '+('Long text '*12));record=self.stored()[0]
        self.page.locator('#language').select_option('en')
        for fmt in ('xlsx','pdf','json'):
            path=self.download(fmt,saved=True)
            if fmt=='xlsx':self.check_excel(path,record,'en')
            elif fmt=='json':
                exported=json.loads(path.read_text());metadata=exported.pop('export_metadata')
                self.assertEqual(metadata['language'],'en');self.assertEqual(exported,record)
            else:
                self.check_pdf(path,'en');doc=fitz.open(path)
                for page in doc:
                    lines=[line for block in page.get_text('dict')['blocks'] if block.get('type')==0 for line in block['lines']]
                    boxes=[fitz.Rect(line['bbox']) for line in lines]
                    for i,a in enumerate(boxes):
                        for b in boxes[i+1:]:
                            intersection=a&b
                            self.assertTrue(intersection.is_empty or intersection.width<.5 or intersection.height<.5,'Overlapping PDF text lines')
                doc[0].get_pixmap(matrix=fitz.Matrix(1,1)).save(str(ARTIFACTS/'etapa7-pdf-page1.png'))
            self.assertEqual(self.stored()[0],record)

    def test_J05_optional_pages_keyboard_and_mobile_layout(self):
        self.page.set_viewport_size({'width':360,'height':1000});self.page.locator('#field-partMass').fill('47.125')
        self.page.locator('#materials-page').click();self.page.locator('#explorer-query').wait_for()
        self.page.locator('#explorer-query').fill('Terluran GP-35');self.page.locator('[data-entry="catalog-abs-terluran-gp-35"]').click()
        self.assertIn('MFR',self.page.locator('#explorer-ficha').inner_text());self.assertIn('MVR',self.page.locator('#explorer-ficha').inner_text());self.assert_layout()
        self.page.locator('#language').select_option('en');self.assert_layout()
        self.page.locator('#learn-page').click();self.page.locator('#guide-inyeccion > summary').click();self.page.locator('#inyeccion-1 > summary').click();self.assert_layout()
        self.page.screenshot(path=str(ARTIFACTS/'etapa7-aprendizaje-en-360.png'),full_page=True)
        self.page.locator('#calculator-page').click();self.assertEqual(self.page.locator('#field-partMass').input_value(),'47.125')
        self.page.locator('#field-partMass').focus();self.assertEqual(self.page.evaluate('document.activeElement.id'),'field-partMass')
        self.page.locator('#language').select_option('es');self.assertEqual(self.page.locator('#field-partMass').input_value(),'47.125')

    def test_J06_historical_web_files_and_zips_remain_byte_exact(self):
        archive=json.loads((ROOT/'versions/antes-etapa-7-2026-10-17.json').read_text())
        for path,expected in archive['files'].items():
            if path=='.nojekyll':continue # Hidden control files are not served by Pages.
            response=self.context.request.get(self.url+'versions/antes-etapa-7-2026-10-17/'+path)
            self.assertEqual(response.status,200,path);self.assertEqual(hashlib.sha256(response.body()).hexdigest(),expected,path)
        response=self.context.request.get(self.url+archive['zip']);self.assertEqual(response.status,200)
        self.assertEqual(hashlib.sha256(response.body()).hexdigest(),archive['zip_sha256'])

    def test_J07_process_level_url_back_forward_and_deep_link(self):
        self.page.set_viewport_size({'width':390,'height':1000})
        self.page.locator('#field-partMass').fill('47.125')
        self.select_process('extrusion');self.assertIn('process=extrusion',self.page.url)
        self.page.locator('#level').select_option('advanced');self.assertIn('level=advanced',self.page.url)
        self.page.locator('#field-width').fill('321.75')
        self.select_process('inyeccion');self.assertEqual(self.page.locator('#field-partMass').input_value(),'47.125')
        self.page.go_back();self.assertEqual(self.page.locator('#process-select').input_value(),'extrusion')
        self.assertEqual(self.page.locator('#level').input_value(),'advanced');self.assertEqual(self.page.locator('#field-width').input_value(),'321.75')
        self.page.go_back();self.assertEqual(self.page.locator('#level').input_value(),'technical')
        self.page.go_forward();self.assertEqual(self.page.locator('#level').input_value(),'advanced')
        self.page.reload();self.assertEqual(self.page.locator('#process-select').input_value(),'extrusion');self.assertEqual(self.page.locator('#level').input_value(),'advanced')

    def test_J08_restore_and_active_export_show_original_snapshot_until_explicit_calculate(self):
        old={'id':'stage7-historical-fixture','name':'Original historic result','module':'inyeccion','level':'basic','date':'2025-02-01T01:02:03Z','inputs':{'method':'mass','partMass':'1','cavities':'1'},'metrics':[{'label':'Shot calculado (masa)','value':987.654321,'unit':'g','formula':'Recorded old model','precision':6}],'warnings':['Historical fixture, do not recalculate'],'notes':[]}
        self.page.evaluate('(x)=>localStorage.setItem("ccip-calculators-web-v1",JSON.stringify([x]))',old);self.page.reload()
        self.page.locator('[data-history]').click();self.open_results()
        self.assertIn('987.654321',self.page.locator('#metrics').inner_text());self.assertNotIn('2026',self.page.locator('#result-date').inner_text())
        stored=self.stored()[0];self.page.locator('#language').select_option('en')
        self.assertIn('987.654321',self.page.locator('#metrics').inner_text())
        path=self.download('json');exported=json.loads(path.read_text());exported.pop('export_metadata')
        self.assertEqual(exported,stored);self.assertEqual(self.stored()[0],stored)
        self.page.locator('#calculate').click();self.assertNotIn('987.654321',self.page.locator('#metrics').inner_text())
        self.assertEqual(self.stored()[0],stored)

    def test_J09_editing_restored_profile_invalidates_readonly_export_without_mutating_history(self):
        self.fill_case('inyeccion',VARIANTS[0][1]);self.save_case('Profile edit after restore');stored=self.stored()[0]
        self.page.locator('[data-history]').click();self.page.locator('#profile-details > summary').click()
        self.page.locator('#profile-fraction-0').fill('25');self.page.locator('#profile-fraction-1').fill('55')
        path=self.download('json');exported=json.loads(path.read_text())
        self.assertEqual(exported['injection_profile_settings']['fractions'],[25,55,20]);self.assertTrue(exported['injection_profile_settings']['enabled'])
        self.assertEqual(self.stored()[0],stored)

if __name__=='__main__':
    names=[n for n in unittest.defaultTestLoader.getTestCaseNames(Stage7) if n.startswith('test_J')]
    result=unittest.TextTestRunner(verbosity=2).run(unittest.TestSuite(Stage7(n) for n in names))
    if os.environ.get('GITHUB_ACTIONS')=='true':
        for case,trace in result.failures+result.errors:print('::error title='+case.id()+'::'+trace[-12000:].replace('%','%25').replace('\r','%0D').replace('\n','%0A'),flush=True)
    raise SystemExit(not result.wasSuccessful())
