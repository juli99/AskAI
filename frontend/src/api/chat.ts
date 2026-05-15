import { api } from "./client";
import type { Conversation, Message, SendMessageResponse } from "../types";

export async function listConversations(): Promise<Conversation[]> {
  const { data } = await api.get<Conversation[]>("/chat/conversations");
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

export async function sendMessage(conversationId: string, content: string): Promise<SendMessageResponse> {
  const { data } = await api.post<SendMessageResponse>(
    `/chat/conversations/${conversationId}/messages`,
    { content }
  );
  return data;
}

export async function deleteConversation(conversationId: string): Promise<void> {
  await api.delete(`/chat/conversations/${conversationId}`);
}
