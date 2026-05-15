import type { TFunction } from "i18next";

const BACKEND_ERROR_MAP: Record<string, string> = {
  "Email already registered": "errors.emailAlreadyRegistered",
  "Invalid credentials": "errors.invalidCredentials",
  "Invalid Google token": "errors.invalidGoogleToken",
  "Conversation not found": "errors.conversationNotFound",
  "Invalid id": "errors.invalidId",
};

export function translateError(
  err: unknown,
  t: TFunction,
  fallbackKey = "errors.unknownError",
): string {
  const anyErr = err as {
    response?: { status?: number; data?: { detail?: string } };
    message?: string;
    code?: string;
  };

  if (anyErr?.code === "ERR_NETWORK") {
    return t("errors.networkError");
  }
  if (anyErr?.response?.status === 401) {
    return t("errors.unauthorized");
  }

  const detail = anyErr?.response?.data?.detail;
  if (typeof detail === "string") {
    const mapped = BACKEND_ERROR_MAP[detail];
    if (mapped) return t(mapped);

    if (detail.startsWith("AI provider error:")) {
      return t("errors.aiProviderError", { detail: detail.replace(/^AI provider error:\s*/, "") });
    }

    return detail;
  }

  return t(fallbackKey);
}
