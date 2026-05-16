import { api } from "./client";
import type { AuthResponse, User } from "../types";

export async function register(email: string, password: string, displayName: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/register", {
    email,
    password,
    display_name: displayName,
  });
  return data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
  return data;
}

export async function loginWithGoogle(idToken: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/google", { id_token: idToken });
  return data;
}

export async function fetchMe(): Promise<User> {
  const { data } = await api.get<User>("/users/me");
  return data;
}

export async function verifyEmail(code: string): Promise<{ user: User }> {
  const { data } = await api.post<{ user: User }>("/auth/verify-email", { code });
  return data;
}

export async function resendVerification(): Promise<void> {
  await api.post("/auth/resend-verification");
}
