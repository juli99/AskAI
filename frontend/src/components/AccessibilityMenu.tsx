import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAccessibility, type FontScale } from "../store/accessibility";

const FONT_OPTIONS: FontScale[] = ["normal", "large", "xlarge"];

export default function AccessibilityMenu() {
  const { t } = useTranslation();
  const {
    fontScale,
    highContrast,
    underlineLinks,
    setFontScale,
    toggleHighContrast,
    toggleUnderlineLinks,
    reset,
  } = useAccessibility();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={t("a11y.label")}
        title={t("a11y.label")}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="12" cy="4" r="2" />
          <path d="M4 8h16v2H14v11h-2v-6h-0l0 6h-2V10H4z" />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={t("a11y.label")}
          className="absolute z-30 mt-1 w-64 rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-800 ltr:right-0 rtl:left-0"
        >
          <div className="mb-3">
            <div className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              {t("a11y.fontSize")}
            </div>
            <div className="flex gap-1">
              {FONT_OPTIONS.map((opt) => {
                const selected = opt === fontScale;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setFontScale(opt)}
                    className={`flex-1 rounded-md border px-2 py-1.5 text-sm transition ${
                      selected
                        ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {t(`a11y.fontSizeOptions.${opt}`)}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="mb-2 flex items-center justify-between text-sm text-slate-700 dark:text-slate-200">
            <span>{t("a11y.highContrast")}</span>
            <input
              type="checkbox"
              checked={highContrast}
              onChange={toggleHighContrast}
              className="h-4 w-4 accent-blue-600"
            />
          </label>

          <label className="mb-3 flex items-center justify-between text-sm text-slate-700 dark:text-slate-200">
            <span>{t("a11y.underlineLinks")}</span>
            <input
              type="checkbox"
              checked={underlineLinks}
              onChange={toggleUnderlineLinks}
              className="h-4 w-4 accent-blue-600"
            />
          </label>

          <button
            type="button"
            onClick={reset}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {t("a11y.reset")}
          </button>
        </div>
      )}
    </div>
  );
}
