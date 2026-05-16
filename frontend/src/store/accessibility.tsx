import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type FontScale = "normal" | "large" | "xlarge";

export type AccessibilityState = {
  fontScale: FontScale;
  highContrast: boolean;
  underlineLinks: boolean;
};

const DEFAULT_STATE: AccessibilityState = {
  fontScale: "normal",
  highContrast: false,
  underlineLinks: false,
};

const STORAGE_KEY = "askai.a11y";

function load(): AccessibilityState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return DEFAULT_STATE;
  }
}

function applyState(state: AccessibilityState) {
  const root = document.documentElement;
  root.classList.remove("a11y-font-normal", "a11y-font-large", "a11y-font-xlarge");
  root.classList.add(`a11y-font-${state.fontScale}`);
  root.classList.toggle("a11y-high-contrast", state.highContrast);
  root.classList.toggle("a11y-underline-links", state.underlineLinks);
}

type ContextValue = AccessibilityState & {
  setFontScale: (s: FontScale) => void;
  toggleHighContrast: () => void;
  toggleUnderlineLinks: () => void;
  reset: () => void;
};

const AccessibilityContext = createContext<ContextValue | null>(null);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AccessibilityState>(() => load());

  useEffect(() => {
    applyState(state);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const setFontScale = useCallback(
    (fontScale: FontScale) => setState((s) => ({ ...s, fontScale })),
    []
  );
  const toggleHighContrast = useCallback(
    () => setState((s) => ({ ...s, highContrast: !s.highContrast })),
    []
  );
  const toggleUnderlineLinks = useCallback(
    () => setState((s) => ({ ...s, underlineLinks: !s.underlineLinks })),
    []
  );
  const reset = useCallback(() => setState(DEFAULT_STATE), []);

  const value = useMemo(
    () => ({ ...state, setFontScale, toggleHighContrast, toggleUnderlineLinks, reset }),
    [state, setFontScale, toggleHighContrast, toggleUnderlineLinks, reset]
  );

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibility(): ContextValue {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility must be used within AccessibilityProvider");
  return ctx;
}
