import test from 'node:test';
import assert from 'node:assert/strict';
import { readHistory, loadHistoryState, saveHistoryItem, deleteHistoryItem, renameHistoryItem, storageKey } from '../src/history.js';
const record = { module: 'secado', level: 'advanced', date: '2026-10-13T10:00:00.000Z', inputs: { throughput: 50, startT: '-20' } };
const storage = data => ({ getItem(key) { assert.equal(key, storageKey); return JSON.stringify(data); } });
test('historial valida estructura, módulo, nivel, fecha y cantidades', () => {
  const bad = [null, 1, {}, { ...record, module: '__proto__' }, { ...record, level: 'toString' }, { ...record, date: 'no fecha' }, { ...record, inputs: [] }];
  const good = { ...record, inputs: { ...record.inputs, targetT: '<script>', arbitrary: 'no', bulkDensity: false, specificHeat: [] } };
  assert.deepEqual(readHistory(storage([...bad, good])), [{ ...record, inputs: { ...record.inputs, targetT: '<script>' } }]);
});
test('historial corrupto o almacenamiento bloqueado permite iniciar', () => {
  assert.deepEqual(readHistory({ getItem() { throw Error('denegado'); } }), []);
  assert.deepEqual(readHistory({ getItem() { return '{'; } }), []);
  assert.deepEqual(readHistory(storage({})), []);
});
test('historial conserva entradas válidas de versiones previas y límite de 60', () => {
  const items = Array.from({ length: 70 }, () => record);
  assert.equal(readHistory(storage(items)).length, 60);
  assert.deepEqual(readHistory(storage([record])), [record]);
});

test('historial conserva fórmulas/resultados guardados al leer registros anteriores', () => {
  const item = { ...record, metrics: [{ label: 'Masa', value: 150, unit: 'kg', formula: 'Q × t', precision: 2 }], warnings: [], notes: ['Nominal'] };
  assert.deepEqual(readHistory(storage([item])), [item]);
});

const memory = (data = []) => {
  let raw = typeof data === 'string' ? data : JSON.stringify(data);
  return {getItem: () => raw, setItem: (_key,value) => {raw=value;}};
};
test('renombrar por ID conserva snapshots y creación, actualiza solo nombre y modificación', () => {
 const store=memory([{...record,metrics:[{value:150}],material:{source:'Original'}},record]);
 const before=loadHistoryState(store).items;
 renameHistoryItem(store,before[0].id,'  Molde piloto  ','2026-10-16T12:00:00Z');
 assert.deepEqual(JSON.parse(store.getItem()),[{...before[0],name:'Molde piloto',updated_at:'2026-10-16T12:00:00Z'},before[1]]);
 const unchanged=store.getItem();
 for(const name of ['', ' ', 'a'.repeat(121), null])assert.throws(()=>renameHistoryItem(store,before[0].id,name));
 assert.throws(()=>renameHistoryItem(store,'missing','Otro'));
 assert.equal(store.getItem(),unchanged);
});
test('migración preserva campos originales, entradas desconocidas, resultados e IDs al reabrir', () => {
 const legacy={...record,inputs:{...record.inputs,unknown:'001.23456789'},extra:{a:1},metrics:[{value:1.23456789}],warnings:['Histórica']};
 const store=memory([legacy,null,legacy]);
 const first=loadHistoryState(store);assert.equal(first.error,null);assert.equal(first.items.length,2);
 assert.notEqual(first.items[0].id,first.items[1].id);
 for(const item of first.items){const {id,created_at,updated_at,...raw}=item;assert.deepEqual(raw,legacy);assert.equal(created_at,record.date);assert.equal(updated_at,record.date);}
 assert.equal(JSON.parse(store.getItem())[1],null);
 assert.deepEqual(loadHistoryState(store),first);
});
test('IDs duplicados antiguos se reparan sin colisionar ni cambiar resultados',()=>{
 const store=memory([{...record,id:'duplicate'},{...record,id:'duplicate'}]);
 const items=loadHistoryState(store).items;assert.notEqual(items[0].id,items[1].id);assert.deepEqual(loadHistoryState(store).items,items);
});
test('fallo de migración no cambia bytes y sus IDs provisorios son deterministas',()=>{
 const raw=JSON.stringify([record]);const store={getItem:()=>raw,setItem(){throw Error('quota');}};
 const a=loadHistoryState(store),b=loadHistoryState(store);assert.equal(a.error,'storage');assert.deepEqual(a,b);assert.equal(store.getItem(),raw);
});
test('guardar nombres duplicados crea IDs distintos, sobrescribir conserva identidad y creación',()=>{
 const store=memory();const a=saveHistoryItem(store,record,{name:'Igual'}),b=saveHistoryItem(store,record,{name:'Igual'});
 assert.notEqual(a.id,b.id);
 const c=saveHistoryItem(store,{...record,date:'2026-10-16T13:00:00Z',inputs:{throughput:70},extra:'nuevo'},{overwriteId:a.id});
 assert.equal(c.created_at,a.created_at);assert.equal(c.updated_at,'2026-10-16T13:00:00Z');assert.equal(c.name,a.name);assert.equal(c.id,a.id);
 assert.equal(loadHistoryState(store).items.length,2);assert.deepEqual(loadHistoryState(store).items[0],b);
 const before=store.getItem();assert.throws(()=>saveHistoryItem(store,{...record,module:'costos'},{overwriteId:a.id}),{code:'wrong_process'});assert.equal(store.getItem(),before);
});
test('eliminar por ID funciona tras reordenar; solo elimina uno',()=>{
 const store=memory();const a=saveHistoryItem(store,record,{name:'Igual'}),b=saveHistoryItem(store,record,{name:'Igual'});
 store.setItem(storageKey,JSON.stringify(loadHistoryState(store).items.reverse()));
 deleteHistoryItem(store,b.id);assert.deepEqual(loadHistoryState(store).items,[a]);
 assert.throws(()=>deleteHistoryItem(store,b.id),{code:'not_found'});deleteHistoryItem(store,a.id);assert.deepEqual(loadHistoryState(store).items,[]);
});
test('60 registros bloquean nueva alta sin truncar ni impedir sobrescritura',()=>{
 const store=memory(Array.from({length:65},()=>record));const before=loadHistoryState(store);const raw=store.getItem();
 assert.throws(()=>saveHistoryItem(store,record,{name:'61'}),{code:'limit'});assert.equal(store.getItem(),raw);
 saveHistoryItem(store,record,{overwriteId:before.items[0].id});assert.equal(JSON.parse(store.getItem()).length,65);
});
test('JSON corrupto, permisos, cuota y escrituras ignoradas no informan éxito ni borran registros',()=>{
 for(const raw of ['{','{}']){const store=memory(raw);assert.equal(loadHistoryState(store).error,'corrupt');assert.throws(()=>saveHistoryItem(store,record,{name:'x'}),{code:'corrupt'});assert.equal(store.getItem(),raw);}
 const seeded=memory();const item=saveHistoryItem(seeded,record,{name:'x'}),raw=seeded.getItem();
 for(const setItem of [()=>{throw Error('quota');},()=>{}]){
  const store={getItem:()=>raw,setItem};
  for(const action of [()=>saveHistoryItem(store,record,{name:'y'}),()=>saveHistoryItem(store,{...record,date:"2026-10-17T00:00:00Z"},{overwriteId:item.id}),()=>renameHistoryItem(store,item.id,'y'),()=>deleteHistoryItem(store,item.id)])assert.throws(action);
  assert.equal(store.getItem(),raw);
 }
 assert.equal(loadHistoryState({getItem(){throw Error('blocked');}}).error,'storage');
});
test('cambio concurrente entre lectura y escritura aborta sin sobrescribir otra pestaña',()=>{
 let reads=0;const store={getItem(){return ++reads===1?'[]':'[null]';},setItem(){assert.fail('no debe escribir');}};
 assert.throws(()=>saveHistoryItem(store,record,{name:'x'}),{code:'changed'});
});

test('sobrescritura conserva campos adicionales no presentes en el snapshot actual',()=>{
 const store=memory([{...record,id:'a',future_metadata:{source:'original'}}]);
 const item=saveHistoryItem(store,{...record,date:'2026-10-17T00:00:00Z',inputs:{throughput:80}},{overwriteId:'a'});
 assert.deepEqual(item.future_metadata,{source:'original'});assert.equal(item.inputs.throughput,80);
});
