"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV, SITE } from "@/data/bd-gov";
import { cn } from "@/lib/utils";
import { CONTAINER } from "./kit";
import { Mark } from "./mark";

function Flag() {
  return (
    <svg aria-hidden viewBox="0 0 10 6" className="h-[0.7rem] w-4 shrink-0">
      <rect width="10" height="6" className="fill-gv-green" />
      <circle cx="4.5" cy="3" r="2" className="fill-gv-sun" />
    </svg>
  );
}

function SearchForm({ id, className }: { id: string; className?: string }) {
  return (
    <form role="search" action="/bangladesh/government/national-portal" method="get" className={cn("flex h-11", className)}>
      <label htmlFor={id} className="sr-only">
        {SITE.search.label}
      </label>
      <input
        id={id}
        type="search"
        name="q"
        className="h-full min-w-0 flex-1 border border-r-0 border-gv-ink/45 bg-white px-2 text-base focus-visible:outline-3 focus-visible:outline-offset-0 focus-visible:outline-gv-green lg:w-62 lg:flex-none"
      />
      <button type="submit" className="grid w-11 place-items-center bg-gv-gold text-gv-ink hover:bg-[#d4a01c] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gv-green">
        <svg aria-hidden viewBox="0 0 24 24" className="size-4 fill-current">
          <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14" />
        </svg>
        <span className="sr-only">Search</span>
      </button>
    </form>
  );
}

const NAV_LINK = "block text-[0.93rem] leading-[1.1] font-bold text-gv-navy focus-visible:outline-3 focus-visible:outline-offset-0 focus-visible:outline-gv-green";

/**
 * usa.gov's extended header: the grey banner with its "Here's how you know"
 * drawer (here it says plainly that this is not a government site), the
 * mint alert, the mark beside the language button, phone and search, and
 * the seven categories on their own ruled row. Below lg the categories
 * and search open from the Menu button.
 */
export function GovHeader() {
  const pathname = usePathname();
  const [howOpen, setHowOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const isCurrent = (href: string) => !href.includes("#") && href === pathname;

  return (
    <header id="top">
      <a href="#main" className="sr-only bg-white p-3 text-gv-navy underline focus:not-sr-only focus:absolute focus:z-50">
        Skip to main content
      </a>

      <section aria-label={SITE.banner} className="bg-gv-paper text-[0.8rem] leading-[1.5]">
        <div className={cn(CONTAINER, "flex flex-wrap items-center gap-x-2 gap-y-1 py-4")}>
          <Flag />
          <p>{SITE.banner}</p>
          <button
            type="button"
            aria-expanded={howOpen}
            aria-controls="gv-how"
            onClick={() => setHowOpen((o) => !o)}
            className="inline-flex items-center gap-0.5 text-gv-navy underline focus-visible:outline-3 focus-visible:outline-gv-green"
          >
            {SITE.bannerToggle}
            <svg aria-hidden viewBox="0 0 24 24" className={cn("size-3.5 fill-current transition-transform", howOpen && "rotate-180")}>
              <path d="M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z" />
            </svg>
          </button>
        </div>
        {howOpen && (
          <div id="gv-how" className={cn(CONTAINER, "grid gap-6 pt-2 pb-6 text-base sm:grid-cols-2")}>
            {SITE.howYouKnow.map((h) => (
              <p key={h.title}>
                <strong className="block">{h.title}</strong>
                {h.text}
              </p>
            ))}
          </div>
        )}
      </section>

      <div className="bg-gv-gold py-2.5 text-[1.13rem]">
        <p className={CONTAINER}>
          {SITE.alert.before}{" "}
          <a href={`tel:${SITE.alert.info}`} className="text-gv-navy underline">
            {SITE.alert.info}
          </a>{" "}
          {SITE.alert.middle}{" "}
          <a href={`tel:${SITE.alert.emergency}`} className="text-gv-navy underline">
            {SITE.alert.emergency}
          </a>{" "}
          {SITE.alert.after}
        </p>
      </div>

      <div className={cn(CONTAINER, "flex items-start justify-between gap-6 py-2")}>
        <Link href="/bangladesh/government" className="self-center rounded-sm pt-1 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gv-green">
          <Mark className="text-[2.6rem] lg:text-[4.1rem]" />
        </Link>

        <div className="hidden flex-col items-end gap-2 lg:flex">
          <a
            href={SITE.language.href}
            lang={SITE.language.lang}
            className="inline-flex h-11 items-center rounded-[0.25rem] bg-gv-navy px-5 font-bengali text-[0.95rem] font-bold text-white hover:bg-gv-green focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gv-green"
          >
            {SITE.language.label}
          </a>
          <div className="flex items-center gap-4">
            <a href={`tel:${SITE.phone.tel}`} className="border-r border-gv-line pr-3 text-[1.13rem] hover:underline">
              {SITE.phone.label}
            </a>
            <SearchForm id="gv-search" />
          </div>
        </div>

        <button
          type="button"
          aria-expanded={menuOpen}
          aria-controls="gv-menu"
          onClick={() => setMenuOpen((o) => !o)}
          className="mt-2 h-11 rounded-[0.25rem] bg-gv-navy px-4 text-[0.95rem] font-bold text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gv-green lg:hidden"
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
      </div>

      <nav aria-label="Primary" className="hidden border-y border-gv-line lg:block">
        <ul className={cn(CONTAINER, "flex flex-wrap")}>
          {NAV.map((l, i) => (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={isCurrent(l.href) ? "page" : undefined}
                className={cn(NAV_LINK, "px-3 py-[0.7rem] hover:underline aria-[current=page]:underline aria-[current=page]:decoration-gv-green aria-[current=page]:decoration-4 aria-[current=page]:underline-offset-[0.6rem]", i === 0 && "pl-0")}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {menuOpen && (
        <div id="gv-menu" className="border-y border-gv-line lg:hidden">
          <div className={cn(CONTAINER, "flex flex-col gap-5 py-5")}>
            <SearchForm id="gv-search-menu" />
            <ul className="divide-y divide-gv-line border-y border-gv-line">
              {NAV.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} onClick={() => setMenuOpen(false)} aria-current={isCurrent(l.href) ? "page" : undefined} className={cn(NAV_LINK, "py-3 aria-[current=page]:underline")}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-4">
              <a href={SITE.language.href} lang={SITE.language.lang} className="inline-flex h-11 items-center rounded-[0.25rem] bg-gv-navy px-5 font-bengali font-bold text-white">
                {SITE.language.label}
              </a>
              <a href={`tel:${SITE.phone.tel}`} className="text-gv-navy underline">
                {SITE.phone.label}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
