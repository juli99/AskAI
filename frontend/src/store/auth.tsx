import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { TOKEN_KEY } from "../api/client";
import { fetchMe } from "../api/auth";
import type { AuthResponse, User } from "../types";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  setSession: (auth: AuthResponse) => void;
  setUser: (user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    fetchMe()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const setSession = useCallback((auth: AuthResponse) => {
    localStorage.setItem(TOKEN_KEY, auth.access_token);
    setUser(auth.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, setSession, setUser, logout }),
    [user, loading, setSession, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
