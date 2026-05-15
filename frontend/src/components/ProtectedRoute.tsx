import { Navigate } from "react-router-dom";
import { useAuth } from "../store/auth";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-full items-center justify-center text-slate-500">טוען…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
