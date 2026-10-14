// Los números de formulario y API comparten una única conversión estricta.
export const isBlank = x => x == null || (typeof x === "string" && !x.trim());
export const n = x => {
  if (isBlank(x) || !["number", "string"].includes(typeof x)) return NaN;
  const value = Number(x);
  return Number.isFinite(value) ? value : NaN;
};
export const pos = x => n(x) > 0;
export const nonneg = x => Number.isFinite(n(x)) && n(x) >= 0;
export const usable = (...xs) => xs.every(pos);
export const ratio = (a, b) => nonneg(a) && pos(b) ? n(a) / n(b) : NaN;
export const optional = (v, fallback) => isBlank(v) ? fallback : n(v);
