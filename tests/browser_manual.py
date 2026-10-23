"""Verify the visual manual dialog, 19 chapters, local photos and mobile usability."""
import functools
import os
import shutil
import threading
import unittest
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*_): pass
class TestManual(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT.parent)))
        cls.thread=threading.Thread(target=cls.server.serve_forever,daemon=True);cls.thread.start()
        cls.url=f'http://127.0.0.1:{cls.server.server_port}/{ROOT.name}/'
        cls.pw=sync_playwright().start()
        binary=os.environ.get('CCIP_CHROMIUM') or shutil.which('chromium') or shutil.which('chromium-browser')
        cls.browser=cls.pw.chromium.launch(**({'executable_path':binary} if binary else {}))
    @classmethod
    def tearDownClass(cls):
        cls.browser.close();cls.pw.stop();cls.server.shutdown();cls.server.server_close();cls.thread.join()
    def test_dialog_chapters_screenshots_and_mobile(self):
        for width in (390,1440):
            with self.subTest(width=width):
                context=self.browser.new_context(viewport={'width':width,'height':850})
                page=context.new_page();errors=[]
                page.on('pageerror',lambda error:errors.append(str(error)))
                page.goto(self.url)
                page.locator('#manual-open').click()
                self.assertTrue(page.locator('#user-manual').is_visible())
                frame=page.frame_locator('#manual-frame')
                frame.locator('#nav-select').wait_for()
                self.assertEqual(frame.locator('.chapter').count(),19)
                frame.locator('#nav-select').select_option('7')
                self.assertTrue(frame.locator('#cap-7').is_visible())
                src=frame.locator('#cap-7 img[src]').first.get_attribute('src')
                self.assertTrue(src.startswith('./manual-images/'),src)
                self.assertEqual(page.locator('#manual-frame').get_attribute('src'),'./downloads/Manual_Visual_CCIP_Interactivo.html')
                self.assertLessEqual(page.locator('#user-manual').bounding_box()['width'],width+1)
                page.locator('#manual-close').click()
                self.assertFalse(page.locator('#user-manual').is_visible())
                page.locator('#manual-open').click()
                page.keyboard.press('Escape')
                self.assertFalse(page.locator('#user-manual').is_visible())
                self.assertEqual(errors,[])
                context.close()
if __name__=='__main__':unittest.main()
