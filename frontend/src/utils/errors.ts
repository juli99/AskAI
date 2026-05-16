import type { TFunction } from "i18next";

const BACKEND_ERROR_MAP: Record<string, string> = {
  "Email already registered": "errors.emailAlreadyRegistered",
  "Invalid credentials": "errors.invalidCredentials",
  "Invalid Google token": "errors.invalidGoogleToken",
  "Conversation not found": "errors.conversationNotFound",
  "Invalid id": "errors.invalidId",
  "Email not verified": "errors.emailNotVerified",
  "Email already verified": "errors.emailAlreadyVerified",
  "No active verification code. Please request a new one.": "errors.verifyNoActiveCode",
  "Verification code expired. Please request a new one.": "errors.verifyExpired",
  "Too many attempts. Please request a new code.": "errors.verifyTooManyAttempts",
  "Incorrect verification code": "errors.verifyWrongCode",
  "Failed to send verification email": "errors.verifyEmailSendFailed",
  "Email service is not configured on the server": "errors.emailServiceUnavailable",
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
