import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Message } from "../types";

export default function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
          isUser ? "bg-blue-600 text-white" : "bg-white text-slate-900 border border-slate-200"
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
                <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded text-xs font-mono">
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className="bg-slate-100 text-slate-800 p-2 rounded my-2 overflow-x-auto text-xs">
                  {children}
                </pre>
              ),
              a: ({ children, href }) => (
                <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  {children}
                </a>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-r-2 border-slate-300 pr-2 my-1 text-slate-600 italic">
                  {children}
                </blockquote>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-2">
                  <table className="border-collapse border border-slate-300 text-xs">{children}</table>
                </div>
              ),
              th: ({ children }) => (
                <th className="border border-slate-300 px-2 py-1 bg-slate-100 font-bold">{children}</th>
              ),
              td: ({ children }) => <td className="border border-slate-300 px-2 py-1">{children}</td>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}
