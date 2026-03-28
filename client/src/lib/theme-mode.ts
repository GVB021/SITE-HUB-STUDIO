const THEME_STORAGE_KEY = "vhub_theme_preference";

export type Theme = "light" | "dark" | "system";

export function getTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {}
  return "light";
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
    root.style.colorScheme = "dark";
  } else {
    root.classList.remove("dark");
    root.style.colorScheme = "light";
  }
  try { localStorage.setItem(THEME_STORAGE_KEY, theme); } catch {}
}

export function initThemeMode() {
  applyTheme(getTheme());

  // Re-apply theme on navigation
  const originalPushState = window.history.pushState;
  window.history.pushState = function(...args) {
    originalPushState.apply(this, args);
    applyTheme(getTheme());
  };

  const originalReplaceState = window.history.replaceState;
  window.history.replaceState = function(...args) {
    originalReplaceState.apply(this, args);
    applyTheme(getTheme());
  };

  window.addEventListener("popstate", () => applyTheme(getTheme()));
}

export function toggleTheme(): Theme {
  const current = getTheme();
  return current === "light" ? "dark" : "light";
}
