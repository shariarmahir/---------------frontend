"use client";

import { MotionConfig } from "framer-motion";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { translate, num, type Key } from "./i18n";
import { hydrateGori, useGori } from "./store";

const TEXT_SIZE = { md: "", lg: "112.5%", xl: "125%" } as const;

/** Loads saved state and applies the accessibility settings to the whole game. */
export function GoriProvider({ children }: { children: React.ReactNode }) {
  const settings = useGori((s) => s.settings);

  useEffect(() => {
    hydrateGori();
  }, []);

  // Text size scales rem units, so it has to sit on <html>; restored on leave.
  useEffect(() => {
    const root = document.documentElement;
    const before = root.style.fontSize;
    root.style.fontSize = TEXT_SIZE[settings.textSize];
    return () => {
      root.style.fontSize = before;
    };
  }, [settings.textSize]);

  useEffect(() => {
    document.documentElement.lang = settings.language === "en" ? "en" : "bn";
    return () => {
      document.documentElement.lang = "bn";
    };
  }, [settings.language]);

  return (
    <MotionConfig reducedMotion={settings.motion === "reduce" ? "always" : "user"}>
      <div data-gori-contrast={settings.contrast} data-gori-density={settings.density} className="contents">
        {children}
      </div>
      <Toaster position="bottom-center" />
    </MotionConfig>
  );
}

export function useT() {
  const lang = useGori((s) => s.settings.language);
  return { lang, t: (k: Key) => translate(lang, k), n: (v: number | string) => num(v, lang) };
}
