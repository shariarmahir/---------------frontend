"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Menu, Newspaper, Search, X } from "lucide-react";
import { NEWS_SECTIONS, newsHref, type NewsSection } from "@/lib/media/news-sections";
import { cn } from "@/lib/utils";

/*
 * The paper's section menu, after The Daily Star's: one row under the
 * masthead that sticks under the platform's top bar. Each section opens its
 * sub-sections on hover, focus or a click; at the right sit search, the
 * বাংলা switch (only Bangla stories), the e-paper, today's news and the
 * full menu. On a section's own pages a second row lists its sub-sections.
 * Below lg the sections scroll sideways and the full menu holds the rest.
 * Sentence case throughout (no capitals), gold for the current place.
 */

const LANG_COOKIE = "np-lang";
const YEAR = 60 * 60 * 24 * 365;

const linkBase = "rounded-md focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none";

function activeSection(pathname: string): NewsSection | undefined {
  const slug = pathname.split("/")[3];
  return NEWS_SECTIONS.find((s) => s.slug === slug);
}

/** One section with its dropdown (lg). */
function SectionMenu({ section, current, open, onOpen, onClose }: { section: NewsSection; current: boolean; open: boolean; onOpen: () => void; onClose: () => void }) {
  const panel = useId();
  const intent = useRef(0);
  useEffect(() => () => window.clearTimeout(intent.current), []);
  return (
    <li
      className="relative"
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        window.clearTimeout(intent.current);
        intent.current = window.setTimeout(onOpen, 120);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        window.clearTimeout(intent.current);
        intent.current = window.setTimeout(onClose, 160);
      }}
    >
      <span className="flex h-12 items-center">
        <Link
          href={newsHref.section(section.slug)}
          aria-current={current ? "page" : undefined}
          className={cn("flex h-full items-center pl-3 font-grotesk text-sm font-bold whitespace-nowrap transition-colors", current ? "text-signal-orange" : "text-white hover:text-signal-orange", linkBase)}
        >
          {section.bn}
        </Link>
        <button
          type="button"
          onClick={() => (open ? onClose() : onOpen())}
          aria-expanded={open}
          aria-controls={panel}
          aria-label={`${section.bn}: বিভাগগুলো`}
          className={cn("grid h-full w-7 place-items-center text-white/60 hover:text-signal-orange", linkBase)}
        >
          <ChevronDown className={cn("size-3.5 transition-transform duration-200 motion-reduce:transition-none", open && "rotate-180")} aria-hidden />
        </button>
      </span>
      {/* The gold bar on the current section. */}
      {current ? <span aria-hidden className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-signal-orange" /> : null}

      <div
        id={panel}
        hidden={!open}
        className="absolute top-full left-0 z-40 w-64 rounded-b-2xl bg-bdnavy-900 p-2 shadow-[0_24px_48px_-20px_rgb(0_0_0/0.9)] ring-1 ring-white/12"
      >
        <Link href={newsHref.section(section.slug)} onClick={onClose} className={cn("flex min-h-10 items-center rounded-lg px-3 font-grotesk text-sm font-bold text-signal-orange hover:bg-white/8", linkBase)}>
          সব {section.bn}
        </Link>
        <ul>
          {section.subs.map((sub) => (
            <li key={sub.slug}>
              <Link href={newsHref.sub(section.slug, sub.slug)} onClick={onClose} className={cn("flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold text-white/85 hover:bg-white/8 hover:text-white", linkBase)}>
                {sub.bn}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

export function SectionNav({ lang }: { lang: "all" | "bn" }) {
  const pathname = usePathname();
  const router = useRouter();
  const current = activeSection(pathname);
  const subSlug = current ? pathname.split("/")[4] : undefined;
  const [open, setOpen] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [searching, setSearching] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const drawerId = useId();

  // Close everything when the page changes (set during render, React's pattern for state that follows a prop).
  const [seen, setSeen] = useState(pathname);
  if (seen !== pathname) {
    setSeen(pathname);
    setOpen(null);
    setDrawer(false);
    setSearching(false);
  }

  // Escape or a press outside closes a dropdown or the search.
  useEffect(() => {
    if (!open && !searching) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
        setSearching(false);
      }
    };
    const away = (e: PointerEvent) => {
      if (!rowRef.current?.contains(e.target as Node)) {
        setOpen(null);
        setSearching(false);
      }
    };
    document.addEventListener("keydown", key);
    document.addEventListener("pointerdown", away);
    return () => {
      document.removeEventListener("keydown", key);
      document.removeEventListener("pointerdown", away);
    };
  }, [open, searching]);

  // The drawer keeps the page still behind it and closes on Escape.
  useEffect(() => {
    if (!drawer) return;
    const key = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(false);
    document.addEventListener("keydown", key);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = prev;
    };
  }, [drawer]);

  useEffect(() => {
    if (searching) searchRef.current?.focus();
  }, [searching]);

  const toggleLang = () => {
    const next = lang === "bn" ? "all" : "bn";
    document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=${YEAR}; samesite=lax`;
    router.refresh();
  };

  const util = cn("inline-flex h-12 items-center gap-1.5 px-2.5 font-grotesk text-sm font-bold whitespace-nowrap transition-colors", linkBase);

  return (
    <>
      <div ref={rowRef} className="sticky top-16 z-30 -mx-3 border-y border-white/12 bg-black px-3 lg:-mx-6 lg:px-6 print:hidden">
        <nav aria-label="নাগরিক জীবনের বিভাগ" className="flex items-center gap-2">
          {/* Sections: dropdowns from lg, a sideways row below it. */}
          <ul className="-ml-3 hidden min-w-0 flex-1 items-center lg:flex">
            {NEWS_SECTIONS.map((s) => (
              <SectionMenu key={s.slug} section={s} current={current?.slug === s.slug} open={open === s.slug} onOpen={() => setOpen(s.slug)} onClose={() => setOpen((o) => (o === s.slug ? null : o))} />
            ))}
          </ul>
          <ul className="-ml-3 flex min-w-0 flex-1 items-center overflow-x-auto [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
            {NEWS_SECTIONS.map((s) => (
              <li key={s.slug} className="relative shrink-0">
                <Link
                  href={newsHref.section(s.slug)}
                  aria-current={current?.slug === s.slug ? "page" : undefined}
                  className={cn("flex h-12 items-center px-3 font-grotesk text-sm font-bold whitespace-nowrap", current?.slug === s.slug ? "text-signal-orange" : "text-white", linkBase)}
                >
                  {s.bn}
                </Link>
                {current?.slug === s.slug ? <span aria-hidden className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-signal-orange" /> : null}
              </li>
            ))}
          </ul>

          {/* The tools at the right. */}
          <div className="flex shrink-0 items-center border-l border-white/12 pl-1">
            {searching ? (
              <form action={newsHref.search()} role="search" className="flex h-12 items-center gap-1">
                <label htmlFor="np-search" className="sr-only">খবর খুঁজুন</label>
                <input
                  ref={searchRef}
                  id="np-search"
                  name="q"
                  type="search"
                  placeholder="শিরোনাম খুঁজুন"
                  className="h-9 w-44 rounded-lg bg-white/8 px-3 text-sm text-white ring-1 ring-white/15 placeholder:text-white/45 focus:ring-2 focus:ring-signal-orange focus:outline-none sm:w-56"
                />
                <button type="button" onClick={() => setSearching(false)} aria-label="খোঁজা বন্ধ করুন" className={cn("grid size-9 place-items-center text-white/70 hover:text-white", linkBase)}>
                  <X className="size-4" aria-hidden />
                </button>
              </form>
            ) : (
              <button type="button" onClick={() => setSearching(true)} aria-label="খবর খুঁজুন" className={cn(util, "text-white hover:text-signal-orange")}>
                <Search className="size-4.5" aria-hidden />
              </button>
            )}
            <button
              type="button"
              onClick={toggleLang}
              aria-pressed={lang === "bn"}
              title={lang === "bn" ? "শুধু বাংলা খবর দেখাচ্ছে — সব ভাষায় ফিরুন" : "শুধু বাংলা খবর দেখুন"}
              className={cn(util, "hidden sm:inline-flex", lang === "bn" ? "text-signal-orange" : "text-white hover:text-signal-orange")}
            >
              {lang === "bn" ? <span aria-hidden className="size-1.5 rounded-full bg-signal-orange" /> : null}
              বাংলা
            </button>
            <Link href={newsHref.epaper} aria-current={pathname === newsHref.epaper ? "page" : undefined} className={cn(util, "hidden xl:inline-flex", pathname === newsHref.epaper ? "text-signal-orange" : "text-white hover:text-signal-orange")}>
              ই-পেপার
            </Link>
            <Link href={newsHref.today} aria-current={pathname === newsHref.today ? "page" : undefined} className={cn(util, "hidden md:inline-flex", pathname === newsHref.today ? "text-signal-orange" : "text-white hover:text-signal-orange")}>
              আজকের খবর
            </Link>
            <button type="button" onClick={() => setDrawer(true)} aria-expanded={drawer} aria-controls={drawerId} aria-label="সব বিভাগ" className={cn(util, "text-white hover:text-signal-orange")}>
              <Menu className="size-5" aria-hidden />
            </button>
          </div>
        </nav>

        {/* On a section's pages: its sub-sections, the current one gold. */}
        {current ? (
          <nav aria-label={`${current.bn}: বিভাগ`} className="-mx-3 border-t border-white/10 px-3 lg:-mx-6 lg:px-6">
            <ul className="-ml-3 flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {current.subs.map((sub) => {
                const on = sub.slug === subSlug;
                return (
                  <li key={sub.slug} className="shrink-0">
                    <Link
                      href={newsHref.sub(current.slug, sub.slug)}
                      aria-current={on ? "page" : undefined}
                      className={cn("flex h-11 items-center px-3 text-[13px] font-semibold whitespace-nowrap transition-colors", on ? "text-signal-orange" : "text-white/70 hover:text-white", linkBase)}
                    >
                      {sub.bn}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        ) : null}
      </div>

      {/* The full menu: every section and sub-section, and the tools the narrow row hides. */}
      {drawer ? (
        <div className="fixed inset-0 z-50 print:hidden" role="dialog" aria-modal="true" aria-label="সব বিভাগ" id={drawerId}>
          <button type="button" aria-label="মেনু বন্ধ করুন" onClick={() => setDrawer(false)} className="absolute inset-0 bg-black/70" />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col overflow-y-auto bg-bdnavy-900 ring-1 ring-white/12">
            <div className="sticky top-0 flex items-center justify-between gap-3 border-b border-white/12 bg-bdnavy-900 px-5 py-3">
              <span className="font-grotesk text-xl font-extrabold text-signal-orange">নাগরিক জীবন</span>
              <button type="button" autoFocus onClick={() => setDrawer(false)} aria-label="মেনু বন্ধ করুন" className={cn("grid size-11 place-items-center rounded-xl bg-signal-orange text-text-primary", linkBase)}>
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 border-b border-white/12 p-5">
              <Link href={newsHref.today} className={cn("flex min-h-11 items-center justify-center gap-2 rounded-xl bg-signal-orange px-3 font-grotesk text-sm font-bold text-text-primary", linkBase)}>
                <Newspaper className="size-4" aria-hidden /> আজকের খবর
              </Link>
              <Link href={newsHref.epaper} className={cn("flex min-h-11 items-center justify-center rounded-xl px-3 font-grotesk text-sm font-bold text-signal-orange ring-2 ring-signal-orange ring-inset", linkBase)}>
                ই-পেপার
              </Link>
              <button type="button" onClick={toggleLang} aria-pressed={lang === "bn"} className={cn("col-span-2 flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 font-grotesk text-sm font-bold ring-1 ring-white/15 ring-inset", lang === "bn" ? "text-signal-orange" : "text-white", linkBase)}>
                {lang === "bn" ? "শুধু বাংলা খবর দেখাচ্ছে — সব ভাষায় ফিরুন" : "শুধু বাংলা খবর দেখুন"}
              </button>
            </div>
            <ul className="grid grid-cols-1 gap-6 p-5 sm:grid-cols-2">
              {NEWS_SECTIONS.map((s) => (
                <li key={s.slug}>
                  <Link href={newsHref.section(s.slug)} className={cn("font-grotesk text-base font-bold text-signal-orange hover:text-white", linkBase)}>
                    {s.bn}
                  </Link>
                  <ul className="mt-2 space-y-0.5">
                    {s.subs.map((sub) => (
                      <li key={sub.slug}>
                        <Link href={newsHref.sub(s.slug, sub.slug)} className={cn("flex min-h-9 items-center text-sm text-white/80 hover:text-white", linkBase)}>
                          {sub.bn}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
