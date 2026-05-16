import { KeyboardEvent, useState } from "react";
import { useTranslation } from "react-i18next";

type Props = {
  onSend: (content: string) => void;
  disabled?: boolean;
  isGenerating?: boolean;
  onStop?: () => void;
};

export default function MessageInput({ onSend, disabled, isGenerating, onStop }: Props) {
  const { t } = useTranslation();
  const [text, setText] = useState("");

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled || isGenerating) return;
    onSend(trimmed);
    setText("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="border-t border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          disabled={isGenerating}
          placeholder={t("chat.inputPlaceholder")}
          className="flex-1 resize-none rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
        {isGenerating && onStop ? (
          <button
            type="button"
            onClick={onStop}
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-700"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
            <span>{t("chat.stop")}</span>
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={disabled || !text.trim()}
            className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {t("chat.send")}
          </button>
        )}
      </div>
    </div>
  );
}
