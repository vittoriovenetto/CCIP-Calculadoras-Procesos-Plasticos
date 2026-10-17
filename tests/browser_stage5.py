"""Etapa 5 technical audit: real UI, strict evidence, numeric results and files."""
import json
import os
import unittest
from browser_stage2 import Stage2, ARTIFACTS
from browser_smoke import MATERIALS

class Stage5(Stage2):
    values={'throughput':50,'residence':4,'bulkDensity':.7,'startT':25,'targetT':80,'specificHeat':2}
    def dry(self):
        self.select_process('secado');self.page.locator('#level').select_option('advanced');self.grade('basf-ultramid-b3s-r03')
    def valid_case(self):
        self.fill_case('secado',self.values,'advanced')
    def test_H01_nine_grades_assumptions_and_manual_persistence(self):
        self.select_process('secado');self.page.locator('#level').select_option('advanced')
        eligible=[m for m in MATERIALS if m['properties'].get('drying_time') and m['properties'].get('drying_temperature')]
        self.assertEqual(len(eligible),9)
        for m in eligible:
            self.select_grade(m);p=m['properties'];duration=p['drying_time']['value'] if p['drying_time']['value'] is not None else p['drying_time']['range'][1]
            self.assertEqual(float(self.page.locator('#field-residence').input_value()),duration)
            self.assertEqual(float(self.page.locator('#field-targetT').input_value()),p['drying_temperature']['value'])
            self.assertEqual(self.page.locator('#field-throughput').input_value(),'');self.assertEqual(self.page.locator('#field-specificHeat').input_value(),'')
            self.assertEqual(self.page.locator('#field-startT').input_value(),'25')
            self.assertIn('supuesto operativo',self.page.locator('#provenance-startT').inner_text())
        self.grade('covestro-makrolon-2405');self.page.locator('#field-residence').fill('2.5')
        for level in ['basic','technical','advanced']:
            self.page.locator('#level').select_option(level);self.assertEqual(self.page.locator('#field-residence').input_value(),'2.5')
        self.grade('basf-ultramid-b3s-r03');self.assertEqual(self.page.locator('#field-residence').input_value(),'2.5')
        self.page.locator('#field-throughput').fill('40');self.page.locator('#calculate').click();self.save_case('Synthetic range selection')
        saved=self.stored()[0];self.assertTrue(saved['material']['used_fields']['residence']['manual_selection']);self.assertEqual(saved['metrics'][0]['value'],100)
        self.assertEqual(saved['drying_assessment']['assumed_start_temperature_C'],25)
    def test_H02_point_cp_or_unconfirmed_bulk_remain_pending_and_raw_inputs_survive(self):
        self.dry()
        for key,value in self.values.items():self.page.locator('#field-'+key).fill(str(value))
        self.page.locator('#calculate').click();self.save_case('Synthetic pending evidence')
        r=self.stored()[0];self.assertEqual(r['metrics'][0]['value'],200);self.assertIsNone(r['metrics'][1]['value']);self.assertIsNone(r['metrics'][2]['value'])
        self.assertEqual(r['inputs']['specificHeat'],'2');self.assertEqual(r['calculation_inputs']['specificHeat'],'');self.assertNotIn('specificHeat',r['material']['used_fields'])
        self.assertIn('Cp puntual',self.page.locator('#drying-calculation-status').inner_text())
        self.document_drying(self.values,'advanced')
        self.help('specificHeat');self.page.locator('#manual-thermodynamic').evaluate('(el)=>el.open=true')
        self.page.locator('#material-cpDefinition').select_option('point_measurement');self.page.locator('#material-cpEvidenceConfirmed').check();self.page.keyboard.press('Escape')
        self.page.locator('#calculate').click();self.save_case('Synthetic point Cp')
        self.assertIsNone(self.stored()[0]['metrics'][2]['value'])
    def test_H03_valid_mean_and_changes_invalidate_confirmation(self):
        self.valid_case();self.save_case('Synthetic mean evidence');r=self.stored()[0]
        self.assertEqual(r['metrics'][0]['value'],200);self.assertAlmostEqual(r['metrics'][1]['value'],200/.7);self.assertAlmostEqual(r['metrics'][2]['value'],55/36)
        self.assertTrue(r['drying_assessment']['cp_valid_for_sensible_estimate']);self.assertFalse(r['drying_assessment']['machine_capacity_certified'])
        self.page.locator('#field-specificHeat').fill('2.1');self.page.locator('#calculate').click();self.save_case('Changed Cp requires evidence');self.assertIsNone(self.stored()[0]['metrics'][2]['value'])
        self.assertFalse(self.stored()[0]['material']['context']['cpEvidenceConfirmed'])
        self.page.locator('#field-specificHeat').fill('2');self.document_drying(self.values,'advanced')
        self.page.locator('#field-targetT').fill('70');self.page.locator('#calculate').click();self.save_case('Changed exact interval');self.assertIsNone(self.stored()[0]['metrics'][2]['value'])
    def test_H04_saved_exports_evidence_and_history_are_immutable(self):
        self.valid_case();self.save_case('Synthetic mean evidence, not industrial');r=self.stored()[0]
        for lang in ['es','en']:
            self.page.locator('#language').select_option(lang)
            book=self.check_excel(self.download('xlsx',True),r,lang)
            evidence=str(list(book.worksheets[3].values));self.assertIn('drying_assessment.cp_details.definition',evidence);self.assertIn('mean_over_interval',evidence);self.assertIn('machine_capacity_certified',evidence)
            pdf=self.download('pdf',True);text,_=self.check_pdf(pdf,lang);self.assertIn('mean_over_interval',text);self.assertIn('drying_assessment',text)
            js=json.loads(self.download('json',True).read_text());self.assertEqual(js['drying_assessment'],r['drying_assessment']);self.assertEqual(js['inputs'],r['inputs'])
        self.page.locator('#field-specificHeat').fill('999');self.assertEqual(self.stored()[0],r)
        self.page.locator('[data-history]').first.click();self.assertEqual(self.page.locator('#field-specificHeat').input_value(),'2');self.assertEqual(self.stored()[0],r)
        self.page.locator('#save').click();self.page.locator('#save-mode').select_option('overwrite');self.page.locator('#save-overwrite-confirm').check();self.page.locator('#save-cancel').click();self.assertEqual(self.stored()[0],r)
    def test_H05_responsive_bilingual_and_evidence_popup(self):
        self.valid_case()
        for lang in ['es','en']:
            self.page.locator('#language').select_option(lang)
            for width in [320,360,390,768,1024,1440]:
                self.page.set_viewport_size({'width':width,'height':950});self.page.locator('#calculate').click();self.open_results();self.assert_layout()
                self.page.screenshot(path=str(ARTIFACTS/f'secado-{lang}-{width}.png'),full_page=True)
                self.help('specificHeat');self.page.locator('#manual-thermodynamic').evaluate('(el)=>el.open=true')
                popup=self.page.locator('#hint-specificHeat').bounding_box();self.assertGreaterEqual(popup['x'],-1);self.assertLessEqual(popup['x']+popup['width'],width+1)
                self.assertIn('Definition of documented Cp' if lang=='en' else 'Definición del Cp documentado',self.page.locator('#hint-specificHeat').inner_text())
                if width in [320,1440]:self.page.screenshot(path=str(ARTIFACTS/f'cp-evidencia-{lang}-{width}.png'))
                self.page.keyboard.press('Escape')
    def test_H06_invalid_temperatures_and_equal_temperatures(self):
        self.valid_case()
        for start,end,expected in [(25,25,0),(80,25,None),(-273.15,80,None)]:
            for key,value in [('startT',start),('targetT',end)]:self.page.locator('#field-'+key).fill(str(value))
            # A documented constant approximation may cover a zero-width heating interval.
            self.help('specificHeat');self.page.locator('#manual-thermodynamic').evaluate('(el)=>el.open=true')
            self.page.locator('#material-cpMinC').fill('0');self.page.locator('#material-cpMaxC').fill('90');self.page.locator('#material-cpDefinition').select_option('constant_approximation');self.page.locator('#material-cpEvidenceConfirmed').check();self.page.keyboard.press('Escape')
            self.page.locator('#calculate').click();self.save_case('Synthetic edge temperature');self.assertEqual(self.stored()[0]['metrics'][2]['value'],expected)
            if expected==0:self.assertIn('Cp constante',self.page.locator('#drying-calculation-status').inner_text())

    def test_H07_save_at_basic_retains_advanced_inputs_evidence_and_origin(self):
        self.valid_case();self.page.locator('#level').select_option('basic');self.save_case('Synthetic basic snapshot with retained advanced state');record=self.stored()[0]
        self.assertNotIn('specificHeat',record['inputs']);self.assertEqual(record['calculation_metadata']['retained_inputs']['specificHeat'],'2')
        self.assertNotIn('specificHeat',record['material']['used_fields']);self.assertEqual(record['material']['field_states']['specificHeat']['value'],'2')
        self.page.locator('#reset').click();self.page.locator('[data-history]').first.click();self.page.locator('#level').select_option('advanced')
        self.assertEqual(self.page.locator('#field-specificHeat').input_value(),'2');self.assertEqual(self.page.locator('#field-bulkDensity').input_value(),'0.7')
        self.page.locator('#calculate').click();self.save_case('Synthetic recovered advanced state');r=self.stored()[0]
        self.assertAlmostEqual(r['metrics'][1]['value'],200/.7);self.assertAlmostEqual(r['metrics'][2]['value'],55/36)
        self.assertEqual(self.stored()[1],record)

    def test_H08_restore_other_process_does_not_retain_drying_messages(self):
        self.save_case('Injection snapshot before drying');injection=self.stored()[0]
        self.dry();self.save_case('Drying pending evidence');self.assertIn('pendientes',self.page.locator('#drying-calculation-status').inner_text())
        self.page.locator('[data-history="'+injection['id']+'"]').click()
        self.assertTrue(self.page.locator('#drying-calculation-status').is_hidden());self.assertEqual(self.page.locator('#drying-calculation-status').inner_text(),'')
        self.assertEqual(self.stored()[1],injection)

if __name__=='__main__':
    suite=unittest.TestSuite(Stage5(name) for name in unittest.defaultTestLoader.getTestCaseNames(Stage5) if name.startswith('test_H'))
    result=unittest.TextTestRunner(verbosity=2).run(suite)
    # Keep failures visible through the Checks API when external log storage is unavailable.
    if os.environ.get('GITHUB_ACTIONS')=='true':
        for case,trace in result.failures+result.errors:
            message=trace[-12000:].replace('%','%25').replace('\r','%0D').replace('\n','%0A')
            print(f'::error file=tests/browser_stage5.py,title={case.id()}::{message}',flush=True)
    raise SystemExit(not result.wasSuccessful())
