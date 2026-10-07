"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * The course site's sticky row of section links under the top bar. The
 * section in view is underlined; a click scrolls to it inside the academy's
 * own scrolling page.
 */
export function CourseTabs({ tabs }: { tabs: { id: string; label: string }[] }) {
  const [on, setOn] = useState(tabs[0]?.id);

  useEffect(() => {
    const root = document.getElementById("academy-main");
    const seen = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) seen.set(en.target.id, en.isIntersecting ? en.boundingClientRect.top : Infinity);
        // The topmost section still on screen wins.
        const top = tabs.map((t) => [t.id, seen.get(t.id) ?? Infinity] as const).filter(([, y]) => y !== Infinity).sort((a, b) => a[1] - b[1])[0];
        if (top) setOn(top[0]);
      },
      { root, rootMargin: "-140px 0px -45% 0px" },
    );
    for (const t of tabs) {
      const el = document.getElementById(t.id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [tabs]);

  function go(id: string) {
    const el = document.getElementById(id);
    const root = document.getElementById("academy-main");
    if (!el || !root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.scrollTo({ top: el.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop - 128, behavior: reduce ? "auto" : "smooth" });
    setOn(id);
  }

  return (
    <nav aria-label="কোর্সের অংশ" className="sticky top-10 z-20 border-b border-m-ink/10 bg-white/92 backdrop-blur-xl">
      <ul className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 scrollbar-none sm:gap-3 sm:px-6">
        {tabs.map((t) => (
          <li key={t.id} className="shrink-0">
            <a
              href={`#${t.id}`}
              onClick={(e) => {
                e.preventDefault();
                go(t.id);
              }}
              aria-current={on === t.id ? "location" : undefined}
              className={cn("relative flex h-12 items-center px-2 text-[15px] font-semibold transition-colors", on === t.id ? "text-m-blue" : "text-m-ink/70 hover:text-m-ink")}
            >
              {t.label}
              <span aria-hidden className={cn("absolute inset-x-1 bottom-0 h-[3px] rounded-t-full bg-m-blue transition-opacity duration-200", on === t.id ? "opacity-100" : "opacity-0")} />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
