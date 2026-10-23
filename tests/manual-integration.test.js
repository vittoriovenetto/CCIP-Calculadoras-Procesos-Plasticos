import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('Manual visual opens inside CCIP',()=>{
 const html=read('index.html'),js=read('src/manual-dialog.js');
 assert.match(html,/id="manual-open"/);
 assert.match(html,/id="manual-frame"/);
 assert.match(html,/data-src="\.\/downloads\/Manual_Visual_CCIP_Interactivo\.html"/);
 assert.match(html,/sandbox="allow-scripts[^"]+"/);
 assert.match(js,/dialog\.showModal\(\)/);
 assert.match(js,/dialog\?\.close\(\)/);
 assert.doesNotMatch(html,/Manual de uso en preparación/);
});
test('Manual includes 19 chapters and only local screenshots from the real app',()=>{
 const html=read('downloads/Manual_Visual_CCIP_Interactivo.html');
 assert.equal((html.match(/class="chapter"/g)||[]).length,19);
 const shots=[...html.matchAll(/\.\/manual-images\/(ux-[\w-]+\.png)/g)].map(x=>x[1]);
 assert.ok(shots.length>=11);
 assert.doesNotMatch(html,/raw\.githubusercontent\.com/);
 const files=new Set(readdirSync(new URL('../downloads/manual-images/',import.meta.url)));
 for(const name of shots)assert.ok(files.has(name),'Screenshot missing: '+name);
});
