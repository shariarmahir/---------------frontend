"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { THEME_COOKIE, type MediaTheme } from "@/lib/media/theme";

const ThemeContext = createContext<{ theme: MediaTheme; toggleTheme: () => void } | null>(null);

export function useMediaTheme() {
  const c = useContext(ThemeContext);
  if (!c) throw new Error("useMediaTheme outside MediaThemeShell");
  return c;
}

/**
 * The media frame in the viewer's theme. One switch for the whole platform,
 * the academy included; the choice is a cookie, so the next visit opens in it
 * without a flash.
 */
export function MediaThemeShell({ initial, className, children }: { initial: MediaTheme; className?: string; children: React.ReactNode }) {
  const [theme, setTheme] = useState(initial);
  const toggleTheme = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    setTheme(next);
  }, [theme]);
  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      <div data-theme={theme} className={className}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useMediaTheme();
  const label = theme === "dark" ? "আলো থিমে যান" : "অন্ধকার থিমে যান";
  return (
    <button type="button" onClick={toggleTheme} aria-label={label} title={label} className={className}>
      {theme === "dark" ? <Sun aria-hidden /> : <Moon aria-hidden />}
    </button>
  );
}
