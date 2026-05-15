import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import he from "./locales/he.json";
import en from "./locales/en.json";

export const SUPPORTED_LANGUAGES = ["he", "en"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

const STORAGE_KEY = "askai.lang";

function getInitialLanguage(): Language {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "he" || stored === "en") return stored;
  return "he";
}

i18n.use(initReactI18next).init({
  resources: {
    he: { translation: he },
    en: { translation: en },
  },
  lng: getInitialLanguage(),
  fallbackLng: "he",
  interpolation: { escapeValue: false },
  returnNull: false,
});

function applyDirection(lang: Language) {
  const dir = lang === "he" ? "rtl" : "ltr";
  document.documentElement.lang = lang;
  document.documentElement.dir = dir;
}

applyDirection(getInitialLanguage());

export function changeLanguage(lang: Language) {
  localStorage.setItem(STORAGE_KEY, lang);
  i18n.changeLanguage(lang);
  applyDirection(lang);
}

export function currentLanguage(): Language {
  return (i18n.language as Language) || "he";
}

export default i18n;
