import { modules, levels } from "./schema.js";

export const storageKey = "ccip-calculators-web-v1";
const validDate = value => typeof value === 'string' && Number.isFinite(Date.parse(value));
const validRecord = item => item && modules.some(m => m.id === item.module) &&
  Object.hasOwn(levels, item.level) && validDate(item.date) && item.inputs &&
  typeof item.inputs === 'object' && !Array.isArray(item.inputs);
const clone = value => JSON.parse(JSON.stringify(value));
export class HistoryError extends Error {
  constructor(code) { super(code); this.code = code; }
}
const validName = name => {
  if (typeof name !== 'string' || !name.trim() || name.trim().length > 120) throw new HistoryError('name');
  return name.trim();
};
function parseStorage(storage) {
  const text = storage.getItem(storageKey);
  let raw;
  try { raw = JSON.parse(text || '[]'); } catch { throw new HistoryError('corrupt'); }
  if (!Array.isArray(raw)) throw new HistoryError('corrupt');
  return { text, raw };
}
function stableLegacyId(item, index) {
  const text = JSON.stringify(item);
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
  return `legacy-${index}-${(hash >>> 0).toString(16)}`;
}
function migrate(raw) {
  const reserved = new Set(raw.filter(validRecord).map(x => x.id).filter(x => typeof x === 'string' && x));
  const seen = new Set();
  return raw.map((item, index) => {
    if (!validRecord(item)) return item; // Preservar también entradas desconocidas/corruptas, sin borrarlas.
    let id = typeof item.id === 'string' && item.id ? item.id : '';
    if (!id || seen.has(id)) {
      id = stableLegacyId(item, index);
      while (reserved.has(id) || seen.has(id)) id += '-1';
    }
    seen.add(id);
    return { ...item, id, created_at: validDate(item.created_at) ? item.created_at : item.date,
      updated_at: validDate(item.updated_at) ? item.updated_at : item.date };
  });
}
function persist(storage, raw, before) {
  if (storage.getItem(storageKey) !== before) throw new HistoryError('changed');
  const encoded = JSON.stringify(raw);
  storage.setItem(storageKey, encoded); // Escritura atómica de localStorage; no tocar UI antes de completarla.
  if (storage.getItem(storageKey) !== encoded) throw new HistoryError('storage');
}
export function loadHistoryState(storage) {
  let raw = [];
  try {
    const parsed = parseStorage(storage);
    raw = migrate(parsed.raw);
    if (JSON.stringify(raw) !== JSON.stringify(parsed.raw)) persist(storage, raw, parsed.text);
    return { items: raw.filter(validRecord).slice(0, 60).map(clone), error: null };
  } catch (error) {
    return { items: raw.filter(validRecord).slice(0, 60).map(clone), error: error.code || 'storage' };
  }
}
export function saveHistoryItem(storage, snapshot, { name, overwriteId = null } = {}) {
  if (!validRecord(snapshot)) throw new HistoryError('invalid');
  const { raw: original, text } = parseStorage(storage), raw = migrate(original);
  let item;
  if (overwriteId !== null) {
    const index = raw.findIndex(x => validRecord(x) && x.id === overwriteId);
    if (index < 0) throw new HistoryError('not_found');
    if (raw[index].module !== snapshot.module) throw new HistoryError('wrong_process');
    item = { ...raw[index], ...clone(snapshot), id: raw[index].id, name: raw[index].name,
      created_at: raw[index].created_at, updated_at: snapshot.date };
    raw[index] = item;
  } else {
    if (raw.filter(validRecord).length >= 60) throw new HistoryError('limit');
    const ids = new Set(raw.filter(validRecord).map(x => x.id));
    let id;
    do { id = crypto.randomUUID(); } while (ids.has(id));
    item = { ...clone(snapshot), id, name: validName(name), created_at: snapshot.date, updated_at: snapshot.date };
    raw.unshift(item);
  }
  persist(storage, raw, text);
  return clone(item);
}
export function renameHistoryItem(storage, id, name, now = new Date().toISOString()) {
  if (!validDate(now)) throw new HistoryError('invalid');
  const { raw: original, text } = parseStorage(storage), raw = migrate(original);
  const index = raw.findIndex(x => validRecord(x) && x.id === id);
  if (index < 0) throw new HistoryError('not_found');
  raw[index] = { ...raw[index], name: validName(name), updated_at: now };
  persist(storage, raw, text);
}
export function deleteHistoryItem(storage, id) {
  const { raw: original, text } = parseStorage(storage), raw = migrate(original);
  const index = raw.findIndex(x => validRecord(x) && x.id === id);
  if (index < 0) throw new HistoryError('not_found');
  raw.splice(index, 1);
  persist(storage, raw, text);
}
export function readHistory(storage) {
  try {
    const items = JSON.parse(storage.getItem(storageKey) || "[]");
    if (!Array.isArray(items)) return [];
    return items.filter(validRecord)
      .slice(0, 60).map(item => {
        const module = modules.find(m => m.id === item.module);
        const inputs = {};
        for (const field of module.fields) {
          const value = item.inputs[field.key];
          if (typeof value === "string" || (typeof value === "number" && Number.isFinite(value))) {
            inputs[field.key] = value;
          }
        }
        return { ...item, inputs };
      });
  } catch {
    return [];
  }
}
