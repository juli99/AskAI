import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GoogleLogin } from "@react-oauth/google";
import { login, loginWithGoogle } from "../api/auth";
import { useAuth } from "../store/auth";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { translateError } from "../utils/errors";

export default function LoginPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const auth = await login(email, password);
      setSession(auth);
      navigate("/chat", { replace: true });
    } catch (err) {
      setError(translateError(err, t, "errors.loginFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-full items-center justify-center p-6">
      <div className="absolute top-4 ltr:right-4 rtl:left-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-md">
        <h1 className="mb-6 text-2xl font-semibold">{t("auth.login.title")}</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {t("auth.login.email")}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {t("auth.login.password")}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? t("auth.login.submitting") : t("auth.login.submit")}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-sm text-slate-400">
          <div className="h-px flex-1 bg-slate-200" />
          <span>{t("common.or")}</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            key={i18n.language}
            locale={i18n.language === "he" ? "iw" : "en"}
            onSuccess={async (cred) => {
              if (!cred.credential) return;
              try {
                const auth = await loginWithGoogle(cred.credential);
                setSession(auth);
                navigate("/chat", { replace: true });
              } catch (err) {
                setError(translateError(err, t, "errors.googleLoginFailed"));
              }
            }}
            onError={() => setError(t("errors.googleLoginFailed"))}
          />
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          {t("auth.login.noAccount")}{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            {t("auth.login.signupLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
