import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../store/auth";

type Props = {
  children: React.ReactNode;
  requireVerified?: boolean;
};

export default function ProtectedRoute({ children, requireVerified = true }: Props) {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  if (loading) return <div className="flex h-full items-center justify-center text-slate-500 dark:text-slate-400">{t("chat.loading")}</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requireVerified && !user.is_email_verified) return <Navigate to="/verify-email" replace />;
  return <>{children}</>;
}
