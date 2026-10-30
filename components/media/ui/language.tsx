"use client";

import { useRouter } from "next/navigation";
import { createContext, Fragment, useCallback, useContext, useMemo, useState } from "react";
import { LANG_COOKIE, translate, type Lang } from "@/lib/media/language";
import { useNumerals } from "./numerals";

const LanguageContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: "bn", setLang: () => {} });

/** Sits inside the numerals provider: English brings Latin digits, Bangla brings Bangla ones. */
export function LanguageProvider({ initial, children }: { initial: Lang; children: React.ReactNode }) {
  const router = useRouter();
  const { setNumerals } = useNumerals();
  const [lang, set] = useState<Lang>(initial);

  const setLang = useCallback(
    (next: Lang) => {
      set(next);
      document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.lang = next;
      setNumerals(next === "en" ? "latn" : "bn");
      // Server-rendered parts read the cookie, so they are drawn again.
      router.refresh();
    },
    [router, setNumerals],
  );

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLang = () => useContext(LanguageContext);

/** The translator for a client component. */
export function useT() {
  const { lang } = useLang();
  return useCallback((bn: string) => translate(lang, bn), [lang]);
}

/**
 * A line of text in the visitor's language, usable from server components.
 * `k` is the Bangla line; where it has a number or a link in the middle, write
 * `{0}`, `{1}` there and pass the pieces as `v`: "প্রতিটি কোর্স {0} দিনের".
 */
export function Tx({ k, v = [] }: { k: string; v?: React.ReactNode[] }) {
  const t = useT();
  return (
    <>
      {t(k)
        .split(/\{(\d+)\}/)
        .map((part, i) => (i % 2 ? <Fragment key={i}>{v[Number(part)]}</Fragment> : part))}
    </>
  );
}
