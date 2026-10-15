import { modules, levels } from "./schema.js";

export const storageKey = "ccip-calculators-web-v1";
export function readHistory(storage) {
  try {
    const items = JSON.parse(storage.getItem(storageKey) || "[]");
    if (!Array.isArray(items)) return [];
    return items.filter(item => item && modules.some(m => m.id === item.module) &&
      Object.hasOwn(levels, item.level) && typeof item.date === "string" &&
      Number.isFinite(Date.parse(item.date)) && item.inputs &&
      typeof item.inputs === "object" && !Array.isArray(item.inputs))
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
