export type User = {
  id: string;
  email: string;
  display_name: string;
  is_email_verified: boolean;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

export type Conversation = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export type SendMessageResponse = {
  user_message: Message;
  assistant_message: Message;
  conversation: Conversation;
};

export type RegenerateResponse = {
  replaced_message_id: string;
  assistant_message: Message;
  conversation: Conversation;
};
