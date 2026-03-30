export type ThemeMode = "light" | "dark";

const storageKey = "vhub-theme";

export function getThemeModeFromDom(): ThemeMode {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function setThemeMode(mode: ThemeMode) {
  document.documentElement.classList.toggle("dark", mode === "dark");
  document.documentElement.style.colorScheme = mode;
  try {
    window.localStorage.setItem(storageKey, mode);
  } catch {
  }
}

export function initThemeMode() {
  let stored: string | null = null;
  try {
    stored = window.localStorage.getItem(storageKey);
  } catch {
  }
  const systemPrefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  const mode: ThemeMode = stored === "light" || stored === "dark" ? stored : systemPrefersDark ? "dark" : "light";
  document.documentElement.classList.toggle("dark", mode === "dark");
  document.documentElement.style.colorScheme = mode;
}

export function toggleThemeMode(): ThemeMode {
  const next: ThemeMode = getThemeModeFromDom() === "dark" ? "light" : "dark";
  setThemeMode(next);
  return next;
}

