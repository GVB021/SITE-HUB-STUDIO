import { Moon, Sun } from "lucide-react";
import { toggleTheme, applyTheme, type Theme } from "../../../lib/theme-mode";
import { useState, useEffect } from "react";

export function ThemeTogglePill() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const root = document.documentElement;
    const isDark = root.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const handleToggle = () => {
    const newTheme = toggleTheme();
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  return (
    <div className="flex items-center gap-2 rounded-full px-2 py-1 bg-background border border-border/60 shadow-sm">
      <button
        type="button"
        onClick={handleToggle}
        className="h-9 px-4 rounded-full hover:bg-black/5 transition-colors flex items-center gap-2"
        title={theme === "light" ? "Mudar para tema escuro" : "Mudar para tema claro"}
      >
        {theme === "light" ? (
          <>
            <Moon className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold tracking-wider">Escuro</span>
          </>
        ) : (
          <>
            <Sun className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold tracking-wider">Claro</span>
          </>
        )}
      </button>
    </div>
  );
}
