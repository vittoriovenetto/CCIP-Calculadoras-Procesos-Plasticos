import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const root=new URL('../src/vendor/',import.meta.url);
const manifest=JSON.parse(readFileSync(new URL('manifest.json',root)));
for(const dependency of manifest)for(const file of dependency.files)test(`dependencia local íntegra: ${file.file}`,()=>{
 const bytes=readFileSync(new URL(file.file,root));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256);
 if(file.bytes)assert.equal(bytes.length,file.bytes);
});
