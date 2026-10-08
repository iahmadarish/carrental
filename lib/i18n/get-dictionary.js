import { isValidLocale, defaultLocale } from "./config";
import extra from "./dictionaries/extra-en";

const dictionaries = {
  au: () => import("./dictionaries/au").then((m) => m.default),
  en: () => import("./dictionaries/en").then((m) => m.default),
  fr: () => import("./dictionaries/fr").then((m) => m.default),
  es: () => import("./dictionaries/es").then((m) => m.default),
  nz: () => import("./dictionaries/nz").then((m) => m.default),
  de: () => import("./dictionaries/de").then((m) => m.default),
};

function isObj(v) {
  return v && typeof v === "object" && !Array.isArray(v);
}

/** Deep-merge `over` onto `base` (arrays and strings from `over` win). */
export function mergeDeep(base, over) {
  if (!isObj(base) || !isObj(over)) return over ?? base;
  const out = { ...base };
  for (const [k, v] of Object.entries(over)) out[k] = isObj(v) && isObj(base[k]) ? mergeDeep(base[k], v) : v;
  return out;
}

/**
 * Every locale is layered on top of English, so new sections (auth, account,
 * booking, home extras) always exist — untranslated keys simply show in English.
 */
export async function getDictionary(locale) {
  const key = isValidLocale(locale) ? locale : defaultLocale;
  const en = mergeDeep(await dictionaries.en(), extra);
  if (key === "en") return en;
  return mergeDeep(en, await dictionaries[key]());
}
