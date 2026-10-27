import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      data-analytics-event="theme_change"
      data-analytics-label="Theme toggle"
      onClick={toggleTheme}
      aria-label="Toggle light and dark theme"
      aria-pressed={theme === "light"}
      title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-accent"
    >
      <Sun className="theme-dark-art h-4 w-4" aria-hidden />
      <Moon className="theme-light-art h-4 w-4" aria-hidden />
    </button>
  );
}
