"""Etapa 6: pruebas reales de navegador, sin aportes públicos ni publicación."""
import unittest
from browser_smoke import BrowserSmoke

class Stage6(BrowserSmoke):
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
        self.assertIn('Supera',self.page.locator('#machine-assessment').inner_text())
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
        self.page.locator('#machine-panel details').evaluate('(el)=>el.open=true')
        self.assertIn('Nominal hopper volume',self.page.locator('#machine-panel').inner_text())
    def test_H03_snapshot_saved_and_mobile(self):
        self.page.locator('#machine-select option').nth(1).wait_for(state='attached')
        self.page.locator('#machine-select').select_option('arburg-allrounder-370s-700-290-s30')
        self.page.locator('#machine-confirm').check()
        self.page.locator('#calculate').click()
        info=self.page.evaluate("async()=>{const {prepareExport}=await import('./src/export-data.js');return typeof prepareExport==='function'}")
        self.assertTrue(info)
        for width in [360,390,768,1440]:
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

if __name__=='__main__':
    names=[x for x in unittest.defaultTestLoader.getTestCaseNames(Stage6) if x.startswith('test_H')]
    suite=unittest.TestSuite(Stage6(name) for name in names)
    result=unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(not result.wasSuccessful())
