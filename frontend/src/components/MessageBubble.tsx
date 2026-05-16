import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTranslation } from "react-i18next";
import type { Message } from "../types";
import { formatIsraelTime } from "../utils/time";

type Props = {
  message: Message;
  canRegenerate?: boolean;
  onRegenerate?: () => void;
  regenerating?: boolean;
};

export default function MessageBubble({ message, canRegenerate, onRegenerate, regenerating }: Props) {
  const { t } = useTranslation();
  const isUser = message.role === "user";
  const time = formatIsraelTime(message.created_at);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore clipboard failures
    }
  };

  return (
    <div className={`group flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="flex max-w-[75%] flex-col">
        <div
          className={`rounded-2xl px-4 py-2 text-sm shadow-sm ${
            isUser
              ? "bg-blue-600 text-white"
              : "bg-white text-slate-900 border border-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700"
          }`}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="ml-2">{children}</li>,
                h1: ({ children }) => <h1 className="text-lg font-bold mb-2 mt-1">{children}</h1>,
                h2: ({ children }) => <h2 className="text-base font-bold mb-2 mt-1">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-bold mb-1 mt-1">{children}</h3>,
                code: ({ children }) => (
                  <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded text-xs font-mono dark:bg-slate-700 dark:text-slate-200">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-slate-100 text-slate-800 p-2 rounded my-2 overflow-x-auto text-xs dark:bg-slate-700 dark:text-slate-200">
                    {children}
                  </pre>
                ),
                a: ({ children, href }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline dark:text-blue-400">
                    {children}
                  </a>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-r-2 border-slate-300 pr-2 my-1 text-slate-600 italic dark:border-slate-600 dark:text-slate-400">
                    {children}
                  </blockquote>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-2">
                    <table className="border-collapse border border-slate-300 text-xs dark:border-slate-600">{children}</table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border border-slate-300 px-2 py-1 bg-slate-100 font-bold dark:border-slate-600 dark:bg-slate-700">{children}</th>
                ),
                td: ({ children }) => <td className="border border-slate-300 px-2 py-1 dark:border-slate-600">{children}</td>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
          <div
            className={`mt-1 text-[10px] tabular-nums ltr:text-right rtl:text-left ${
              isUser ? "text-blue-100" : "text-slate-400 dark:text-slate-500"
            }`}
          >
            {time}
          </div>
        </div>

        {!isUser && (
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 opacity-0 transition-opacity group-hover:opacity-100 dark:text-slate-400">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-700"
              title={t("chat.copy")}
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>{copied ? t("chat.copied") : t("chat.copy")}</span>
            </button>

            {canRegenerate && (
              <button
                type="button"
                onClick={onRegenerate}
                disabled={regenerating}
                className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-700"
                title={t("chat.regenerate")}
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M23 4v6h-6" />
                  <path d="M1 20v-6h6" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
                  <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14" />
                </svg>
                <span>{regenerating ? t("chat.regenerating") : t("chat.regenerate")}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
