import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

type Theme = "light" | "dark";
const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void } | null>(null);
const KEY = "okytes:theme";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("light", theme === "light");
  root.classList.toggle("dark", theme === "dark");
  root.dataset["theme"] = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "light" ? "#f7f9fc" : "#05080f");
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const manual = useRef(false);
  useEffect(() => {
    const system = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      let stored: string | null = null;
      try {
        stored = localStorage.getItem(KEY);
      } catch {
        /* Use system preference if storage is unavailable. */
      }
      manual.current = stored === "light" || stored === "dark";
      const next = manual.current ? (stored as Theme) : system.matches ? "dark" : "light";
      applyTheme(next);
      setTheme(next);
    };
    const onSystem = () => {
      if (!manual.current) {
        const next = system.matches ? "dark" : "light";
        applyTheme(next);
        setTheme(next);
      }
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === KEY || event.key === null) sync();
    };
    sync();
    system.addEventListener("change", onSystem);
    window.addEventListener("storage", onStorage);
    return () => {
      system.removeEventListener("change", onSystem);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    manual.current = true;
    applyTheme(next);
    setTheme(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* Keep the selection for this page session. */
    }
  };
  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme requires ThemeProvider");
  return context;
}
