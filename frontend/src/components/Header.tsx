import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";

type Props = {
  rightExtras?: React.ReactNode;
};

export default function Header({ rightExtras }: Props) {
  const { t } = useTranslation();
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 dark:border-slate-700 dark:bg-slate-900">
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
        {t("common.appName")}
      </span>
      <div className="flex items-center gap-2">
        {rightExtras}
        <ThemeToggle />
        <LanguageSwitcher />
      </div>
    </header>
  );
}
