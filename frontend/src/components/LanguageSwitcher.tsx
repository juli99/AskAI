import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { changeLanguage, currentLanguage, SUPPORTED_LANGUAGES, type Language } from "../i18n";

const LABEL: Record<Language, string> = {
  he: "עברית",
  en: "English",
};

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const active = (i18n.language as Language) || currentLanguage();

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handlePick = (lang: Language) => {
    changeLanguage(lang);
    setOpen(false);
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("language.label")}
        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 focus:border-blue-500 focus:outline-none"
      >
        <span>{LABEL[active]}</span>
        <svg
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-20 mt-1 min-w-[7rem] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg ltr:right-0 rtl:left-0"
        >
          {SUPPORTED_LANGUAGES.map((lang) => {
            const selected = lang === active;
            return (
              <li key={lang} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => handlePick(lang)}
                  className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-sm hover:bg-slate-50 ${
                    selected ? "font-medium text-blue-600" : "text-slate-700"
                  }`}
                >
                  <span>{LABEL[lang]}</span>
                  {selected && (
                    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path
                        d="M3.5 8.5l3 3 6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
