import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { formatIsraelTime } from "../utils/time";

export default function Clock() {
  const { t } = useTranslation();
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const tick = () => setNow(new Date());
    const msUntilNextMinute = 60_000 - (Date.now() % 60_000);
    const timeout = window.setTimeout(() => {
      tick();
      const interval = window.setInterval(tick, 60_000);
      (timeout as unknown as { interval?: number }).interval = interval;
    }, msUntilNextMinute);
    return () => {
      window.clearTimeout(timeout);
      const interval = (timeout as unknown as { interval?: number }).interval;
      if (interval) window.clearInterval(interval);
    };
  }, []);

  return (
    <div
      aria-label={t("clock.label")}
      title={t("clock.label")}
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
    >
      <svg className="h-4 w-4 text-slate-500 dark:text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
      <span className="tabular-nums">{formatIsraelTime(now)}</span>
    </div>
  );
}
