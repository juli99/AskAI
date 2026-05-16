import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useTranslation } from "react-i18next";
import App from "./App";
import { AuthProvider } from "./store/auth";
import { ThemeProvider } from "./store/theme";
import "./i18n";
import "./index.css";

const queryClient = new QueryClient();
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

function GoogleProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  return (
    <GoogleOAuthProvider clientId={googleClientId} key={i18n.language}>
      {children}
    </GoogleOAuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <GoogleProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthProvider>
              <App />
            </AuthProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </GoogleProvider>
    </ThemeProvider>
  </React.StrictMode>
);
