import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { resendVerification, verifyEmail } from "../api/auth";
import { useAuth } from "../store/auth";
import { translateError } from "../utils/errors";

export default function VerifyEmailPage() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  if (!user) return <Navigate to="/login" replace />;
  if (user.is_email_verified) return <Navigate to="/chat" replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      const { user: verified } = await verifyEmail(code.trim());
      setUser(verified);
      navigate("/chat", { replace: true });
    } catch (err) {
      setError(translateError(err, t, "errors.verifyFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const onResend = async () => {
    setError(null);
    setInfo(null);
    setResending(true);
    try {
      await resendVerification();
      setInfo(t("verify.resentInfo"));
    } catch (err) {
      setError(translateError(err, t, "errors.resendFailed"));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-md dark:bg-slate-800">
        <h1 className="mb-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {t("verify.title")}
        </h1>
        <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
          {t("verify.subtitle", { email: user.email })}
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t("verify.codeLabel")}
            </label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              minLength={4}
              maxLength={10}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-center text-lg tracking-[0.4em] text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            />
          </div>
          {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}
          {info && <div className="text-sm text-green-600 dark:text-green-400">{info}</div>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? t("verify.submitting") : t("verify.submit")}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={onResend}
            disabled={resending}
            className="text-blue-600 hover:underline disabled:opacity-50 dark:text-blue-400"
          >
            {resending ? t("verify.resending") : t("verify.resend")}
          </button>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
            className="text-slate-500 hover:underline dark:text-slate-400"
          >
            {t("verify.signOut")}
          </button>
        </div>
      </div>
    </div>
  );
}
