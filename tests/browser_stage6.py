"""Etapa 6: pruebas reales de navegador, sin aportes públicos ni publicación."""
import unittest
import json
import os
from browser_stage2 import Stage2, ARTIFACTS
from browser_smoke import BrowserSmoke

class Stage6(Stage2):
    def test_H01_variant_optin_and_units(self):
        self.page.locator('#machine-select option').nth(1).wait_for(state='attached')
        self.page.locator('#machine-select').select_option('arburg-allrounder-370s-700-290-s30')
        self.assertEqual(self.page.locator('#field-screwD').input_value(),'')
        self.page.locator('#machine-confirm').check()
        self.assertEqual(self.page.locator('#field-screwD').input_value(),'30')
        self.assertEqual(self.page.locator('#field-screwMaxStroke').input_value(),'150')
        self.page.locator('#level').select_option('advanced')
        self.page.locator('#field-method').select_option('volume')
        self.page.locator('#field-partVolume').fill('110')
        self.page.locator('#field-projectedArea').fill('100')
        self.page.locator('#field-cavityPressure').fill('100')
        self.page.locator('#field-clampFactor').fill('1')
        self.page.locator('#calculate').click()
        self.assertEqual(self.page.locator('[data-machine-status="above_published_limit"]').count(),3)
        self.assertIn('110.00 / 106 cm³',self.page.locator('#machine-assessment').inner_text())
        self.assertIn('1000.00 / 700 kN',self.page.locator('#machine-assessment').inner_text())
        self.page.locator('#field-screwD').fill('35')
        self.page.locator('#calculate').click()
        self.assertIn('Sin resultados',self.page.locator('#machine-assessment').inner_text())
    def test_H02_series_no_autofill_and_language(self):
        self.select_process('extrusion')
        self.page.locator('#machine-select option').nth(1).wait_for(state='attached')
        self.page.locator('#machine-select').select_option('battenfeld-cincinnati-uniex-series')
        self.assertEqual(self.page.locator('#machine-confirm').count(),0)
        self.assertIn('Rango de serie',self.page.locator('#machine-panel').inner_text())
        self.page.locator('#language').select_option('en')
        self.assertIn('Series/model range',self.page.locator('#machine-panel').inner_text())
        self.select_process('secado')
        self.page.locator('#machine-select').select_option('motan-luxor-hd-lhd30')
        self.page.locator('#machine-datasheet').evaluate('(el)=>el.open=true')
        self.assertIn('Nominal hopper volume',self.page.locator('#machine-panel').inner_text())
    def test_H03_snapshot_saved_and_mobile(self):
        self.page.locator('#machine-select option').nth(1).wait_for(state='attached')
        self.page.locator('#machine-select').select_option('arburg-allrounder-370s-700-290-s30')
        self.page.locator('#machine-confirm').check()
        self.page.locator('#calculate').click()
        info=self.page.evaluate("async()=>{const {prepareExport}=await import('./src/export-data.js');return typeof prepareExport==='function'}")
        self.assertTrue(info)
        for width in [320,360,390,768,1024,1440]:
            self.page.set_viewport_size({'width':width,'height':850})
            overflow=self.page.evaluate("""()=>({
              viewport:innerWidth, scroll:document.documentElement.scrollWidth,
              offenders:[...document.querySelectorAll('body *')].filter(el=>{
                if(!el.getClientRects().length)return false;
                const r=el.getBoundingClientRect();
                return r.right>innerWidth+1 && r.width>0;
              }).slice(0,20).map(el=>{const r=el.getBoundingClientRect();return {
                tag:el.tagName,id:el.id,cl:typeof el.className==='string'?el.className:'',
                width:Math.round(r.width),right:Math.round(r.right),scrollWidth:el.scrollWidth,
                text:(el.textContent||'').trim().slice(0,95)
              }})
            })""")
            self.assertLessEqual(overflow['scroll'],width+1,(width,overflow))
        self.select_process('extrusion')
        self.select_process('inyeccion')
        self.assertTrue(self.page.locator('#machine-confirm').is_checked())

    def equipment(self,id):
        self.page.locator('#machine-select option').nth(1).wait_for(state='attached')
        self.page.locator('#machine-manufacturer').select_option('')
        self.page.locator('#machine-select').select_option(id)

    def test_H04_real_saved_exports_freeze_machine_variant_sources_and_results(self):
        self.equipment('arburg-allrounder-370s-700-290-s30');self.page.locator('#machine-confirm').check()
        self.page.locator('#field-method').select_option('volume');self.page.locator('#field-partVolume').fill('110');self.save_case('Synthetic machine snapshot; not industrial')
        record=self.stored()[0];self.assertEqual(record['machine']['profile']['specifications']['shot_volume_cm3']['value'],106)
        self.equipment('moiron-m2-i');self.page.locator('#field-partVolume').fill('1');self.page.locator('#calculate').click()
        for lang in ['es','en']:
            self.page.locator('#language').select_option(lang)
            book=self.check_excel(self.download('xlsx',True),record,lang);evidence=str(list(book.worksheets[3].values))
            self.assertIn(record['machine']['profile']['source']['sha256'],evidence);self.assertIn('machine_snapshot.profile.configuration',evidence)
            text,_=self.check_pdf(self.download('pdf',True),lang);self.assertIn('arburg.com',text);self.assertIn('machine_snapshot',text)
            js=json.loads(self.download('json',True).read_text());self.assertEqual(js['machine'],record['machine']);self.assertEqual(js['machine_assessment'],record['machine_assessment']);self.assertEqual(js['metrics'],record['metrics']);self.assertEqual(js['inputs'],record['inputs'])
        self.assertEqual(self.stored()[0],record)
        self.page.locator('[data-history]').first.click();self.assertEqual(self.page.locator('#machine-select').input_value(),record['machine']['id']);self.assertTrue(self.page.locator('#machine-confirm').is_checked())

    def test_H05_manufacturer_manual_override_deselect_and_process_session(self):
        self.page.locator('#machine-manufacturer option').nth(1).wait_for(state='attached')
        self.page.locator('#machine-manufacturer').select_option('Moiron')
        options=self.page.locator('#machine-select option').all_text_contents();self.assertTrue(all('Moiron' in s for s in options[1:]));self.assertGreaterEqual(len(options),3)
        self.page.locator('#machine-select').select_option('moiron-m2-i');self.page.locator('#machine-confirm').check()
        self.page.locator('#field-screwD').fill('17');self.page.locator('#machine-select').select_option('');self.assertEqual(self.page.locator('#field-screwD').input_value(),'17')
        self.page.locator('#machine-select').select_option('moiron-m2-ii');self.page.locator('#machine-confirm').check();self.assertEqual(self.page.locator('#field-screwD').input_value(),'17')
        self.select_process('pelicula');self.select_process('inyeccion');self.assertEqual(self.page.locator('#machine-select').input_value(),'moiron-m2-ii');self.assertEqual(self.page.locator('#field-screwD').input_value(),'17')

    def test_H06_priorities_density_independence_and_film_geometry(self):
        self.equipment('moiron-m2-i');self.page.locator('#machine-confirm').check();self.page.locator('#field-partMass').fill('12')
        self.page.locator('#calculate').click();self.save_case('Synthetic Moiron mass without density');record=self.stored()[0]
        mass=next(m for m in record['metrics'] if m['label']=='Shot calculado (masa)');self.assertEqual(mass['value'],12)
        self.assertIsNone(next(m for m in record['metrics'] if m['label']=='Shot calculado (volumen)')['value']);self.assertEqual(self.page.locator('#field-screwMaxStroke').input_value(),'')
        self.select_process('pelicula');self.equipment('xihua-xh-430b-25');self.page.locator('#machine-confirm').check();self.assertEqual(self.page.locator('#field-dieDiameter').input_value(),'25')
        self.page.locator('#field-layflat').fill('100');self.page.locator('#calculate').click();self.save_case('Synthetic XH monolayer geometry')
        record=self.stored()[0];bur=next(m for m in record['metrics'] if m['label']=='Relación de soplado (BUR)');self.assertAlmostEqual(bur['value'],8/3.141592653589793)
        self.assertEqual(record['machine']['profile']['specifications']['layer_count']['value'],1)
        self.equipment('xihua-xh-430b-25-3');self.page.locator('#machine-confirm').check();self.assertEqual(self.page.locator('#field-dieDiameter').input_value(),'30')

    def test_H07_responsive_bilingual_all_machine_details_and_levels(self):
        cases=[('inyeccion','moiron-m2-i'),('extrusion','xihua-xh433-45'),('pelicula','xihua-xh-430b-25'),('soplado','kautex-kbb40'),('termoformado','kiefel-kmd642speed'),('secado','motan-luxor-hd-lhd30')]
        for lang in ['es','en']:
            self.page.locator('#language').select_option(lang)
            for process,id in cases:
                self.select_process(process);self.equipment(id)
                for level in ['basic','technical','advanced']:self.page.locator('#level').select_option(level);self.assertEqual(self.page.locator('#machine-select').input_value(),id)
                self.page.locator('#machine-datasheet').evaluate('(el)=>el.open=true');self.page.locator('#machine-confirm').check();self.assertTrue(self.page.locator('#machine-datasheet').evaluate('(el)=>el.open'))
                for width in [320,360,390,768,1024,1440]:
                    self.page.set_viewport_size({'width':width,'height':950});self.assert_layout()
                    if process in ['inyeccion','pelicula']:self.page.locator('#machine-panel').scroll_into_view_if_needed();self.page.screenshot(path=str(ARTIFACTS/f'maquinaria-{process}-{lang}-{width}.png'),full_page=width in [360,1440])
                self.assertIn('Machine manufacturer' if lang=='en' else 'Fabricante de maquinaria',self.page.locator('#machine-panel').inner_text())

    def test_H08_mould_limits_do_not_use_bottle_dimensions(self):
        self.select_process('soplado');self.equipment('kautex-kbb40');self.page.locator('#machine-confirm').check();self.page.locator('#calculate').click()
        self.assertEqual(self.page.locator('[data-machine-status]').count(),0)
        field=self.page.locator('#machine-operation-moldWidth');field.evaluate('(el)=>el.closest("details").open=true');field.fill('700');self.page.locator('#machine-operation-moldLength').fill('400');self.page.locator('#calculate').click()
        self.assertEqual(self.page.locator('[data-machine-status="above_published_limit"]').count(),1)
        field.fill('500');self.assertEqual(self.page.locator('[data-machine-status]').count(),0);self.page.locator('#calculate').click();self.assertEqual(self.page.locator('[data-machine-status="above_published_limit"]').count(),0)

    def test_H09_cost_reuse_preserves_manual_input_and_never_uses_installed_power(self):
        self.equipment('moiron-m2-i');self.page.locator('#field-partMass').fill('12');self.save_case('Synthetic injection source')
        source=self.stored()[0];self.select_process('costos');self.page.locator('#level').select_option('advanced');self.page.locator('#field-powerKw').fill('4');self.page.locator('#field-cavities').fill('5')
        self.page.locator('#machine-cost-source').select_option(source['id']);self.page.locator('#machine-reuse').click()
        self.assertEqual(self.page.locator('#field-partMass').input_value(),'12');self.assertEqual(self.page.locator('#field-powerKw').input_value(),'4');self.assertEqual(self.page.locator('#field-cavities').input_value(),'5')
        self.equipment('arburg-allrounder-370s-700-290-s30')
        self.save_case('Synthetic cost reuse');record=self.stored()[0];self.assertEqual(record['machine']['reused_from']['id'],source['id']);self.assertEqual(record['machine']['reused_from']['applied'],{'partMass':'12'});self.assertFalse(record['machine']['reused_from']['installed_power_used_as_consumption']);self.assertEqual(self.stored()[1],source)
        self.assertEqual(self.page.locator('#machine-cost-source option').count(),3)

    def test_H10_user_supplied_sources_remain_distinct_and_do_not_create_fake_limits(self):
        self.equipment('moiron-page104-16mm-100kn');self.page.locator('#machine-confirm').check();self.assertEqual(self.page.locator('#field-screwD').input_value(),'16');self.assertEqual(self.page.locator('#field-screwMaxStroke').input_value(),'')
        self.page.locator('#machine-datasheet').evaluate('(el)=>el.open=true');self.assertIn('135 mm',self.page.locator('#machine-panel').inner_text());self.save_case('Moiron page 104 distinct configuration')
        record=self.stored()[0];self.assertEqual(record['machine']['profile']['specifications']['clamp_force_kN']['value'],100);self.assertNotIn('max_injection_pressure_bar',record['machine']['profile']['specifications'])
        self.page.locator('#machine-panel').scroll_into_view_if_needed();self.page.screenshot(path=str(ARTIFACTS/'moiron-page104-16mm.png'))
        self.select_process('pelicula');self.equipment('dongguan-xihua-xh430b-2-2kw');self.page.locator('#machine-confirm').check();self.page.locator('#machine-datasheet').evaluate('(el)=>el.open=true')
        self.page.locator('#field-filmGauge').fill('250');self.page.locator('#calculate').click();self.save_case('Xihua supplier listing distinct configuration');record=self.stored()[0]
        specs=record['machine']['profile']['specifications'];self.assertEqual(specs['motor_installed_kW']['value'],2.2);self.assertEqual(specs['film_min_thickness_um']['value'],20);self.assertEqual(specs['film_max_thickness_um']['value'],200)
        self.assertNotIn('film_max_layflat_mm',specs);self.assertNotIn('bubble_max_diameter_mm',specs);self.assertEqual(self.page.locator('[data-machine-status="above_published_limit"]').count(),1)
        self.page.locator('#machine-panel').scroll_into_view_if_needed();self.page.screenshot(path=str(ARTIFACTS/'xh-listing-discrepancy.png'))

    def test_H11_drying_nominal_hopper_and_installed_power_remain_separate(self):
        self.fill_case('secado',{'throughput':50,'residence':4,'bulkDensity':.7,'startT':25,'targetT':80,'specificHeat':2},'advanced')
        self.equipment('motan-luxor-hd-lhd30');self.page.locator('#machine-confirm').check();self.page.locator('#calculate').click();self.save_case('Synthetic drying machine screening')
        r=self.stored()[0];self.assertEqual(r['inputs']['throughput'],'50');checks=r['machine_assessment']['checks']
        self.assertEqual(next(c for c in checks if c['key']=='hopper_nominal_L')['status'],'above_published_limit');self.assertFalse(any(c['key']=='connected_power_kW' for c in checks));self.assertFalse(r['drying_assessment']['machine_capacity_certified'])
        self.assertIn('hot_air_surface_only',r['machine_assessment']['notes'])

    def test_H12_thermoforming_keeps_forming_tool_sheet_and_bfs_limits_distinct(self):
        self.select_process('termoformado');self.equipment('kiefel-kmd642speed');self.page.locator('#level').select_option('advanced');self.page.locator('#machine-confirm').check()
        self.page.locator('#field-blankW').fill('650');self.page.locator('#field-blankL').fill('480');self.page.locator('#field-cycleSec').fill('1.25')
        self.page.locator('#machine-operation-formingHeight').evaluate('(el)=>el.closest("details").open=true');self.page.locator('#machine-operation-formingHeight').fill('130')
        self.page.locator('#machine-forming-mode').select_option('standard');self.page.locator('#calculate').click();self.save_case('Synthetic thermoforming standard mode');r=self.stored()[0]
        checks=r['machine_assessment']['checks'];self.assertEqual(next(c for c in checks if c['key']=='sheet_max_width_mm')['status'],'within_published_limit');self.assertEqual(next(c for c in checks if c['key']=='forming_max_height_mm')['status'],'above_published_limit')
        self.assertEqual(next(c for c in checks if c['key']=='max_cycle_cpm')['actual'],48);self.assertFalse(any(c['key']=='sheet_max_length_mm' for c in checks))
        self.page.locator('#machine-forming-mode').select_option('BFS');self.page.locator('#calculate').click();self.assertEqual(self.page.locator('[data-machine-status="above_published_limit"]').count(),2)
        self.page.locator('#machine-panel').scroll_into_view_if_needed();self.page.screenshot(path=str(ARTIFACTS/'termoformado-bfs-limites.png'))

    def test_H13_every_catalog_record_is_selectable_and_can_be_cleared(self):
        catalog=json.loads((__import__('pathlib').Path(__file__).resolve().parents[1]/'src/data/machines.v1.json').read_text())
        for m in catalog['machines']:
            self.select_process(m['process']);self.equipment(m['id']);self.assertEqual(self.page.locator('#machine-select').input_value(),m['id']);self.assertIn(m['model'],self.page.locator('#machine-panel').inner_text())
            self.page.locator('#machine-select').select_option('');self.assertEqual(self.page.locator('#machine-confirm').count(),0)

    def test_H14_language_preserves_current_machine_comparison_without_recalculation(self):
        self.equipment('arburg-allrounder-370s-700-290-s30');self.page.locator('#machine-confirm').check();self.page.locator('#field-method').select_option('volume');self.page.locator('#field-partVolume').fill('110');self.page.locator('#calculate').click()
        self.assertEqual(self.page.locator('[data-machine-status="above_published_limit"]').count(),2)
        self.page.locator('#language').select_option('en');self.assertEqual(self.page.locator('[data-machine-status="above_published_limit"]').count(),2);self.assertIn('Calculated shot volume',self.page.locator('#machine-assessment').inner_text())
        self.page.locator('#language').select_option('es');self.assertEqual(self.page.locator('[data-machine-status="above_published_limit"]').count(),2)

    def test_H15_save_basic_restores_hidden_machine_inputs_and_manual_origin(self):
        self.equipment('arburg-allrounder-370s-700-290-s30');self.page.locator('#machine-confirm').check();self.page.locator('#field-screwD').fill('35')
        self.page.locator('#level').select_option('basic');self.save_case('Synthetic basic snapshot retaining machine fields');record=self.stored()[0]
        self.assertNotIn('screwD',record['inputs']);self.assertEqual(record['machine']['used_fields'],{});self.assertEqual(record['calculation_metadata']['retained_inputs']['screwD'],'35');self.assertEqual(record['calculation_metadata']['input_origins']['screwD'],'manual')
        self.page.locator('#reset').click();self.page.locator('[data-history]').first.click();self.page.locator('#level').select_option('advanced')
        self.assertEqual(self.page.locator('#field-screwD').input_value(),'35');self.assertEqual(self.page.locator('#field-screwMaxStroke').input_value(),'150');self.assertTrue(self.page.locator('#machine-confirm').is_checked());self.assertEqual(self.stored()[0],record)

if __name__=='__main__':
    names=[x for x in unittest.defaultTestLoader.getTestCaseNames(Stage6) if x.startswith('test_H')]
    suite=unittest.TestSuite(Stage6(name) for name in names)
    result=unittest.TextTestRunner(verbosity=2).run(suite)
    if os.environ.get('GITHUB_ACTIONS')=='true':
        for case,trace in result.failures+result.errors:
            message=trace[-12000:].replace('%','%25').replace('\r','%0D').replace('\n','%0A')
            print(f'::error file=tests/browser_stage6.py,title={case.id()}::{message}',flush=True)
    raise SystemExit(not result.wasSuccessful())
