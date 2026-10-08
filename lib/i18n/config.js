export const locales = ["au", "en", "nz", "fr", "es", "de"];
export const defaultLocale = "au";

export const localeLabels = {
  au: { name: "Australia", flag: "🇦🇺" },
  en: { name: "English", flag: "🇬🇧" },
  nz: { name: "New Zealand", flag: "🇳🇿" },
  fr: { name: "Français", flag: "🇫🇷" },
  es: { name: "Español", flag: "🇪🇸" },
  de: { name: "Deutsch", flag: "🇩🇪" },
};

export function isValidLocale(locale) {
  return locales.includes(locale);
}
