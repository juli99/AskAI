import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createConversation,
  deleteConversation,
  listConversations,
  listMessages,
  sendMessage,
} from "../api/chat";
import MessageBubble from "../components/MessageBubble";
import MessageInput from "../components/MessageInput";
import { useAuth } from "../store/auth";
import type { Conversation, Message } from "../types";

export default function ChatPage() {
  const { user, logout } = useAuth();
  const qc = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  const conversationsQuery = useQuery({
    queryKey: ["conversations"],
    queryFn: listConversations,
  });

  const messagesQuery = useQuery({
    queryKey: ["messages", activeId],
    queryFn: () => listMessages(activeId!),
    enabled: !!activeId,
  });

  useEffect(() => {
    if (!activeId && conversationsQuery.data && conversationsQuery.data.length > 0) {
      setActiveId(conversationsQuery.data[0].id);
    }
  }, [activeId, conversationsQuery.data]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesQuery.data]);

  const newConv = useMutation({
    mutationFn: createConversation,
    onSuccess: (conv: Conversation) => {
      qc.setQueryData<Conversation[]>(["conversations"], (prev) => [conv, ...(prev ?? [])]);
      setActiveId(conv.id);
    },
  });

  const send = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => sendMessage(id, content),
    onSuccess: (resp) => {
      qc.setQueryData<Message[]>(["messages", resp.conversation.id], (prev) => [
        ...(prev ?? []),
        resp.user_message,
        resp.assistant_message,
      ]);
      qc.setQueryData<Conversation[]>(["conversations"], (prev) => {
        const others = (prev ?? []).filter((c) => c.id !== resp.conversation.id);
        return [resp.conversation, ...others];
      });
    },
  });

  const removeConv = useMutation({
    mutationFn: (id: string) => deleteConversation(id),
    onSuccess: (_, id) => {
      qc.setQueryData<Conversation[]>(["conversations"], (prev) =>
        (prev ?? []).filter((c) => c.id !== id)
      );
      if (activeId === id) setActiveId(null);
    },
  });

  const handleSend = async (content: string) => {
    let id = activeId;
    if (!id) {
      const conv = await newConv.mutateAsync();
      id = conv.id;
    }
    send.mutate({ id, content });
  };

  return (
    <div className="flex h-full">
      <aside className="flex w-64 flex-col border-l border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-4">
          <button
            onClick={() => newConv.mutate()}
            className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + שיחה חדשה
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversationsQuery.data?.map((c) => (
            <div
              key={c.id}
              className={`group flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-3 text-sm ${
                c.id === activeId ? "bg-slate-100" : "hover:bg-slate-50"
              }`}
            >
              <button onClick={() => setActiveId(c.id)} className="flex-1 truncate text-right">
                {c.title}
              </button>
              <button
                onClick={() => removeConv.mutate(c.id)}
                className="hidden text-xs text-red-500 hover:text-red-700 group-hover:block"
                title="מחק"
              >
                מחק
              </button>
            </div>
          ))}
          {conversationsQuery.data?.length === 0 && (
            <div className="p-4 text-center text-xs text-slate-400">אין שיחות עדיין</div>
          )}
        </div>
        <div className="border-t border-slate-200 p-3 text-xs text-slate-500">
          <div className="mb-2 truncate">{user?.display_name} ({user?.email})</div>
          <button onClick={logout} className="text-blue-600 hover:underline">
            יציאה
          </button>
        </div>
      </aside>

      <main className="flex flex-1 flex-col">
        <header className="border-b border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700">
          AskAI
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto p-6">
          {!activeId && (
            <div className="flex h-full items-center justify-center text-slate-400">
              צור שיחה חדשה או בחר שיחה קיימת מהרשימה
            </div>
          )}
          {activeId && messagesQuery.isLoading && (
            <div className="text-center text-slate-400">טוען…</div>
          )}
          {activeId &&
            messagesQuery.data?.map((m) => <MessageBubble key={m.id} message={m} />)}
          {send.isPending && (
            <div className="text-sm text-slate-400">AI חושב…</div>
          )}
          <div ref={endRef} />
        </div>

        <MessageInput onSend={handleSend} disabled={send.isPending || newConv.isPending} />
      </main>
    </div>
  );
}
