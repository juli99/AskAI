import { api } from "./client";
import type { Conversation, Message, RegenerateResponse, SendMessageResponse } from "../types";

export async function listConversations(query?: string): Promise<Conversation[]> {
  const params = query?.trim() ? { q: query.trim() } : undefined;
  const { data } = await api.get<Conversation[]>("/chat/conversations", { params });
  return data;
}

export async function createConversation(): Promise<Conversation> {
  const { data } = await api.post<Conversation>("/chat/conversations");
  return data;
}

export async function listMessages(conversationId: string): Promise<Message[]> {
  const { data } = await api.get<Message[]>(`/chat/conversations/${conversationId}/messages`);
  return data;
}

export async function sendMessage(
  conversationId: string,
  content: string,
  signal?: AbortSignal
): Promise<SendMessageResponse> {
  const { data } = await api.post<SendMessageResponse>(
    `/chat/conversations/${conversationId}/messages`,
    { content },
    { signal }
  );
  return data;
}

export async function deleteConversation(conversationId: string): Promise<void> {
  await api.delete(`/chat/conversations/${conversationId}`);
}

export async function regenerateLastResponse(
  conversationId: string,
  signal?: AbortSignal
): Promise<RegenerateResponse> {
  const { data } = await api.post<RegenerateResponse>(
    `/chat/conversations/${conversationId}/regenerate`,
    undefined,
    { signal }
  );
  return data;
}
