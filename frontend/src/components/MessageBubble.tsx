import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Message } from "../types";
import { formatIsraelTime } from "../utils/time";

export default function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const time = formatIsraelTime(message.created_at);
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
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
    </div>
  );
}
