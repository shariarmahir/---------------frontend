"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, LogOut, Menu, Moon, ShoppingBag, Sun, X } from "lucide-react";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { Num } from "../../ui/numerals";
import { useAcademy } from "../use-academy";
import { useCatalogue } from "./catalogue-root";

const ROAD = [
  { href: "/media/academy", label: "একাডেমি খুঁজুন" },
  { href: "/media/academy/routine", label: "রুটিন" },
  { href: "/media/academy/classroom", label: "ক্লাস" },
  { href: "/media/academy/exam", label: "পরীক্ষা" },
  { href: "/media/academy/graduation", label: "সমাবর্তন" },
];
const MORE = [
  { href: "/media/academy/videos", label: "বিনামূল্যের ক্লাস ভিডিও" },
  { href: "/media/academy/teach", label: "একাডেমি খুলুন" },
  { href: "/media/academy/classroom/open", label: "ক্লাসরুম খুলুন" },
  { href: "/media/academy/panel", label: "প্যানেল মার্কিং" },
];
/** Set apart after a rule, like the reference's "Craft Apps": the catalogue of every department. */
const FEATURED = { href: "/media/academy/departments", label: "বিভাগ বাছুন" };

/** The academy's front page matches only itself; every other stop, its own pages too. */
const isAt = (href: string, path: string) => (href === "/media/academy" ? path === href : path === href || path.startsWith(`${href}/`));

/** A bar link: muted until hovered, when its label turns into an inverted block. */
const link = "group flex h-full items-center px-2.5 hud whitespace-nowrap text-(--c-muted) hover:text-(--c-ink)";
const pill = "flex items-center gap-1.5 px-1.5 py-0.5 group-hover:bg-(--c-invert-bg) group-hover:text-(--c-invert-fg)";
/** A square icon cell at the bar's right end. */
const cell = "relative flex w-12 items-center justify-center border-l border-(--c-line) text-(--c-muted) transition-colors duration-150 hover:bg-(--c-invert-bg) hover:text-(--c-invert-fg)";

/**
 * The catalogue's bar, ruled like the page: the mark in its own cell, the
 * road's stops as small labels that invert under the pointer (the page you
 * are on stays inverted), the department catalogue set apart after a rule, and at the right admission, the cart, the theme switch and
 * the way back to one's classes. Phones fold the links into a menu.
 */
export function CatalogueNav() {
  const path = usePathname();
  const { theme, toggleTheme } = useCatalogue();
  const hydrated = useHydrated();
  const inCart = useAcademy((s) => s.cart.length);
  const [more, setMore] = useState(false);
  const [menu, setMenu] = useState(false);
  const moreBox = useRef<HTMLLIElement>(null);
  const moreId = useId();
  const menuId = useId();

  // The "আরও" list closes on a click elsewhere or Escape.
  useEffect(() => {
    if (!more && !menu) return;
    const away = (e: PointerEvent) => {
      if (more && !moreBox.current?.contains(e.target as Node)) setMore(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMore(false);
      setMenu(false);
    };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [more, menu]);

  const themeLabel = theme === "dark" ? "আলো থিমে যান" : "অন্ধকার থিমে যান";
  const themeButton = (
    <button type="button" onClick={toggleTheme} aria-label={themeLabel} title={themeLabel} className={cell}>
      {theme === "dark" ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
    </button>
  );

  return (
    <nav aria-label="একাডেমি" className="sticky top-0 z-50 w-full border-b border-(--c-line) bg-(--c-bg)/95 backdrop-blur-sm">
      <div className="flex h-12 items-stretch justify-between">
        <div className="flex min-w-0 items-stretch">
          <Link href="/media/academy" className="flex items-center border-r border-(--c-line) px-4 transition-opacity hover:opacity-70 sm:px-5">
            <Image src="/logo/kandari-logo.png" alt="কাণ্ডারী তৈরি একাডেমি" width={1600} height={967} sizes="64px" className="h-7 w-auto" priority />
          </Link>
          <ul className="hidden min-w-0 items-stretch lg:flex">
            {ROAD.map((r) => {
              const on = isAt(r.href, path);
              return (
                <li key={r.href} className="flex items-stretch">
                  <Link href={r.href} aria-current={on ? "page" : undefined} className={cn(link, on && "text-(--c-ink)")}>
                    <span className={cn(pill, on && "bg-(--c-invert-bg) text-(--c-invert-fg)")}>{r.label}</span>
                  </Link>
                </li>
              );
            })}
            <li ref={moreBox} className="relative flex items-stretch">
              <button type="button" aria-expanded={more} aria-controls={moreId} onClick={() => setMore((m) => !m)} className={cn(link, more && "text-(--c-ink)")}>
                <span className={cn(pill, more && "bg-(--c-invert-bg) text-(--c-invert-fg)")}>
                  আরও
                  <ChevronDown className={cn("size-3.5 transition-transform duration-200", more && "rotate-180")} aria-hidden />
                </span>
              </button>
              {more && (
                <ul id={moreId} className="absolute top-full left-0 min-w-56 border border-(--c-line) bg-(--c-bg) py-2 shadow-[0_24px_48px_-24px_rgb(0_0_0/0.6)]">
                  {MORE.map((m) => (
                    <li key={m.href}>
                      <Link href={m.href} onClick={() => setMore(false)} className="block px-4 py-2 text-sm text-(--c-muted) transition-colors hover:bg-(--c-invert-bg) hover:text-(--c-invert-fg)">
                        {m.label}
                      </Link>
                    </li>
                  ))}
                  <li className="mt-2 border-t border-(--c-line) pt-2">
                    <Link href="/media" className="flex items-center gap-2 px-4 py-2 text-sm text-(--c-muted) transition-colors hover:bg-(--c-invert-bg) hover:text-(--c-invert-fg)">
                      <LogOut className="size-4" aria-hidden />
                      একাডেমি থেকে বের হন
                    </Link>
                  </li>
                </ul>
              )}
            </li>
            <li className="ml-1.5 flex items-stretch border-l border-(--c-line) pl-1.5">
              <Link href={FEATURED.href} aria-current={isAt(FEATURED.href, path) ? "page" : undefined} className={cn(link, "text-(--c-ink)")}>
                <span className={cn(pill, isAt(FEATURED.href, path) && "bg-(--c-invert-bg) text-(--c-invert-fg)")}>{FEATURED.label}</span>
              </Link>
            </li>
          </ul>
        </div>

        <div className="flex shrink-0 items-stretch">
          <div className="hidden items-stretch md:flex">
            <Link href="/media/academy/checkout" className={link}>
              <span className={pill}>ভর্তি</span>
            </Link>
            <Link href="/media/academy/checkout" aria-label="কোর্সের ঝুড়ি" className={cell}>
              <ShoppingBag className="size-4" aria-hidden />
              {hydrated && inCart > 0 && (
                <span className="absolute top-2 right-2 grid size-4 place-items-center bg-(--c-signal) text-[10px] font-bold text-black">
                  <Num value={inCart} />
                </span>
              )}
            </Link>
            {themeButton}
            <Link href="/media/academy/classroom" className="flex h-full items-center border-l border-(--c-line) bg-(--c-invert-bg) px-5 text-sm font-bold whitespace-nowrap text-(--c-invert-fg) transition-opacity duration-150 hover:opacity-80">
              আমার শেখা
            </Link>
          </div>
          <div className="flex items-stretch md:hidden">{themeButton}</div>
          <div className="flex items-stretch lg:hidden">
            <button type="button" aria-expanded={menu} aria-controls={menuId} onClick={() => setMenu((m) => !m)} className={cell}>
              <span className="sr-only">{menu ? "মেনু বন্ধ করুন" : "মেনু খুলুন"}</span>
              {menu ? <X className="size-4.5" aria-hidden /> : <Menu className="size-4.5" aria-hidden />}
            </button>
          </div>
        </div>
      </div>

      {menu && (
        <div id={menuId} className="max-h-[calc(100dvh-3rem)] overflow-y-auto border-t border-(--c-line) bg-(--c-bg) lg:hidden">
          <ul className="grid gap-px bg-(--c-line)">
            {[FEATURED, ...ROAD, { href: "/media/academy/checkout", label: "ভর্তি" }, { href: "/media/academy/classroom", label: "আমার শেখা" }, ...MORE, { href: "/media", label: "একাডেমি থেকে বের হন" }].map((m) => (
              <li key={m.href + m.label}>
                <Link
                  href={m.href}
                  onClick={() => setMenu(false)}
                  aria-current={isAt(m.href, path) ? "page" : undefined}
                  className={cn("block bg-(--c-bg) px-5 py-3.5 text-base transition-colors hover:bg-(--c-invert-bg) hover:text-(--c-invert-fg)", isAt(m.href, path) ? "font-bold text-(--c-ink-strong)" : "text-(--c-muted)")}
                >
                  {m.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
