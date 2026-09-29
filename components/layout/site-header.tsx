"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, useReducedMotion, type Transition } from "framer-motion";
import { Puzzle, ShieldCheck } from "lucide-react";
import { AccountMenu, AccountSheetLinks } from "@/components/auth/account-menu";
import { NewsTicker } from "@/components/layout/news-ticker";
import { RecordDialog } from "@/components/record/record-dialog";
import { Icon } from "@/components/ui/icon";
import { NavIndicators } from "@/components/ui/nav-indicators";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LabelText } from "@/components/brand/kandari-wordmark";
import { LABEL_TEXT } from "@/data/logo-text";
import { NAZRUL_MOTTO, navLinksFor, type NavLink } from "@/data/navigation";
import { cn } from "@/lib/utils";

/*
 * Direction: the header is a solid gold card (the action colour, like the
 * home page's "Rural Tele-Network" pillar) under an ink telemetry strip.
 * Ink text reads at ~8.9:1 on the gold; green and red text do not (≈3.5:1
 * and 2.4:1), so anything carrying them — the logo, the country label, the
 * live readout — sits on its own white tile, the way each pillar card sets
 * its icon on a contrasting tile.
 */

/**
 * A nav label with one word lifted into the alert colour.
 *
 * Split rather than `dangerouslySetInnerHTML`: the label is data, and the
 * accent is presentation, so the two stay separate. The accent is purely
 * visual, so the text still reads as one string to assistive tech.
 */
function NavLabel({ link, compact }: { link: NavLink; compact?: boolean }) {
  // In the bar, laptop widths get the condensed label so the civic actions stay on screen.
  if (compact && link.shortLabel !== link.label && !link.accentWord) {
    return (
      <span>
        <span className="max-[1439px]:hidden">{link.label}</span>
        <span className="min-[1440px]:hidden">{link.shortLabel}</span>
      </span>
    );
  }
  if (!link.accentWord || !link.label.includes(link.accentWord)) {
    return <span>{link.label}</span>;
  }
  const [before, ...after] = link.label.split(link.accentWord);
  return (
    <span>
      {before}
      <span className="text-national-crimson">{link.accentWord}</span>
      {after.join(link.accentWord)}
    </span>
  );
}

/** "বাংলাদেশ সমস্যা ও সমাধান" in the label face — problem in the flag's red. */
function DeshLabel({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-[0.3em]", className)}>
      <LabelText text={LABEL_TEXT.bangladesh} className="text-bd-green" />
      <LabelText text={LABEL_TEXT.issue} className="text-national-crimson" />
      <LabelText text={LABEL_TEXT.solution} className="text-bd-green" />
    </span>
  );
}

/** Loudspeaker glyph for the protest link. */
function ProtestGlyph({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path
        d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * The nav link matching a pathname, or null for links that only point at
 * in-page anchors.
 *
 * Exact path match, longest first: "/products" must not claim the tab
 * while the reader is on "/products/swasti", and when several links share
 * one path (the "/bangladesh#…" set) the first in declaration order wins.
 */
function matchNavHref(pathname: string, links: NavLink[]): string | null {
  const best = links
    .map((link) => ({ link, path: link.href.split("#")[0] }))
    .filter(({ path }) => path !== "" && pathname === path)
    .sort((a, b) => b.path.length - a.path.length)[0];
  return best?.link.href ?? null;
}

/**
 * Brand logo — the Kandari Lab logo image alone (public/logo/kandari-logo.png,
 * a web-sized copy of the 19531×11812 master logo.png). The artwork carries
 * the name itself. Own component so the header and mobile menu share it.
 */
export function BrandLogo({ className, priority = false }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src="/logo/kandari-logo.png"
      alt="কাণ্ডারী-ল্যাব (Kandari Lab)"
      width={1600}
      height={967}
      sizes="(min-width: 1024px) 120px, (min-width: 640px) 93px, 80px"
      priority={priority}
      // The artwork's own 1600:967 ratio, reserved before load so nothing shifts.
      className={cn("aspect-1600/967 w-auto shrink-0 object-contain", className)}
    />
  );
}

/**
 * Header logo on a white tile — the artwork's gold fist would vanish into
 * the gold bar otherwise. Tile padding plus logo height equals the old
 * bare logo (56 / 64 / 80px), so --spacing-header in globals.css still holds.
 */
function BrandLockup() {
  return (
    <Link
      href="/"
      title="Kandari-Lab Homepage"
      className="group flex min-w-0 shrink-0 items-center rounded-xl bg-white p-1 shadow-tile ring-1 ring-text-primary/10 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] select-none hover:-translate-y-0.5 hover:-rotate-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-text-primary motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:rotate-0"
    >
      <BrandLogo priority className="h-12 sm:h-14 lg:h-18" />
    </Link>
  );
}

/**
 * Section links with two sliding pills: an ink pill that marks the current
 * section and a faint one that follows the pointer (or keyboard focus)
 * from link to link.
 */
function SectionNav({
  links,
  activeHref,
  onPick,
}: {
  links: NavLink[];
  activeHref: string;
  onPick: (href: string) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const reduce = useReducedMotion();
  const slide: Transition = reduce
    ? { duration: 0 }
    : { type: "spring", stiffness: 480, damping: 38, mass: 0.7 };

  return (
    <ul className="flex items-center space-x-0.5 xl:space-x-1.5" onMouseLeave={() => setHovered(null)}>
      {links.map((link) => {
        const isActive = activeHref === link.href;
        return (
          <li key={link.href}>
            <a
              href={link.href}
              onClick={() => onPick(link.href)}
              onMouseEnter={() => setHovered(link.href)}
              onFocus={() => setHovered(link.href)}
              onBlur={() => setHovered(null)}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "relative isolate flex items-center rounded-lg px-2 py-1.5 text-sm transition-colors duration-200 xl:px-3",
                "focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:outline-none",
                isActive ? "font-bold text-signal-orange" : "font-medium text-text-primary",
              )}
            >
              {hovered === link.href && !isActive ? (
                <motion.span
                  layoutId="nav-hover"
                  transition={slide}
                  aria-hidden
                  className="absolute inset-0 -z-10 rounded-lg bg-text-primary/10"
                />
              ) : null}
              {isActive ? (
                <motion.span
                  layoutId="nav-active"
                  transition={slide}
                  aria-hidden
                  className="absolute inset-0 -z-10 rounded-lg bg-text-primary shadow-ink"
                />
              ) : null}

              <NavLabel link={link} compact />

              {/* The membership link carries an ID tag; keep it on that one link only. */}
              {link.href === "#kandari-profile" ? (
                <span
                  className={cn(
                    "ml-1.5 rounded px-1.5 py-0.5 font-mono text-[9.5px] font-bold uppercase",
                    isActive ? "bg-signal-orange/20 text-signal-orange" : "bg-text-primary/10 text-text-primary",
                  )}
                >
                  ID
                </span>
              ) : null}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/** Level 1 readouts, set in light ink on the dark strip. */
function TelemetryReadouts() {
  return (
    <div className="hidden shrink-0 items-center gap-4 font-mono text-xs md:flex">
      <div className="hidden items-center gap-1.5 border-r border-white/15 pr-4 font-sans text-[10px] text-white/70 xl:flex">
        <span className="mr-1 inline-flex h-3 items-end gap-0.5" aria-hidden>
          {["h-1.5", "h-2", "h-2.5", "h-3"].map((h, i) => (
            <span
              key={h}
              className={cn("header-bar w-0.5 rounded-xs bg-emerald-400", h)}
              style={{ animationDelay: `${i * 120}ms` }}
            />
          ))}
        </span>
        <span>SYNC: 24ms</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-sans text-[11px] font-medium text-white/75 sm:text-xs">
          Golden 2-Hours Critical Response Protocol:
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-emerald-300">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-80 motion-reduce:hidden" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
          </span>
          ONLINE
        </span>
      </div>

      <span className="h-3.5 w-px bg-white/20" aria-hidden />

      <div className="flex items-center gap-1.5 font-sans font-semibold">
        <span className="size-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/25" aria-hidden />
        <span className="text-[11px] tracking-tight text-white/75">BD GRID:</span>
        <span className="rounded bg-signal-orange px-1.5 py-0.5 font-mono text-xs font-bold text-text-primary tabular-nums">
          99.98%
        </span>
      </div>
    </div>
  );
}

export function SiteHeader() {
  // The section nav is per-page: the home sections do not exist on the
  // other pages, so linking to them there would scroll nowhere.
  const pathname = usePathname();
  const navLinks = navLinksFor(pathname);

  // Which link the current page corresponds to, recomputed each render
  // so client-side navigation between two nav pages moves the highlight.
  const pathHref = matchNavHref(pathname, navLinks);

  // In-page anchor clicks (Mission, Products…) track their own
  // highlight. Storing the pathname alongside the clicked href lets a
  // route change discard it during render, without an effect — which
  // also keeps this clear of `react-hooks/set-state-in-effect`.
  const [clicked, setClicked] = useState<{ href: string; path: string } | null>(null);
  const clickedHref = clicked?.path === pathname ? clicked.href : null;
  const activeHref = clickedHref ?? pathHref ?? navLinks[0].href;
  const setActiveHref = (href: string) => setClicked({ href, path: pathname });
  const [recordOpen, setRecordOpen] = useState(false);
  const onGori = pathname.startsWith("/cholo-bangladesh-gori");

  return (
    // The card floats inset from the page edges, so the fixed wrapper is the
    // full-width track and the <header> inside it is the card. Padding here
    // rather than on the card keeps the rounded corners clear of the viewport.
    <div className="fixed inset-x-0 top-0 z-40 px-3 py-2 sm:px-6 sm:py-2.5">
      <header className="header-gold relative isolate mx-auto w-full max-w-[1360px] overflow-hidden rounded-2xl text-text-primary ring-1 ring-text-primary/15">
        {/* ── Level 1 — ink telemetry strip ───────────────────────────── */}
        <div className="relative bg-text-primary px-4 py-1.5 font-mono text-[11px] tracking-tight text-white/75 sm:px-6 lg:px-8">
          {/* Single row: the ticker takes whatever width the readouts leave.
              Below md the readouts step aside so the ticker has room to be
              read — a marquee squeezed to 100px is just motion. */}
          <div className="flex items-center justify-between gap-x-4">
            <NewsTicker />
            <TelemetryReadouts />
          </div>

          {/* A signal pulse running along the seam between strip and card. */}
          <span aria-hidden className="absolute inset-x-0 bottom-0 h-px overflow-hidden bg-white/10">
            <span className="signal-run absolute inset-y-0 left-0 w-1/4 bg-linear-to-r from-transparent via-signal-orange to-transparent" />
          </span>
        </div>

        {/* ── Level 2 — brand, live metric, conversion ────────────────── */}
        <div className="px-4 py-1.5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            {/* Left cluster — logo tile, country pill. `min-w-0` so it
                yields to the action cluster on narrow screens. */}
            <div className="flex min-w-0 items-center gap-3.5 sm:gap-5 lg:gap-6">
              <BrandLockup />

              <span aria-hidden className="hidden h-9 w-px bg-linear-to-b from-transparent via-text-primary/30 to-transparent sm:block" />

              {/* বাংলাদেশ সমস্যা ও সমাধান — the country page (/bangladesh). */}
              {/* No prefetch: prefetching /bangladesh preloads its carousel
                  stylesheet on every page, which then sits unused and
                  raises a console "preloaded but not used" warning. */}
              <Link
                href="/bangladesh"
                prefetch={false}
                title="বাংলাদেশ সমস্যা ও সমাধান — ইতিহাস, সংকট, ৩২টি সমস্যা ও সমাধান"
                aria-current={pathname === "/bangladesh" ? "page" : undefined}
                className={cn(
                  "hidden items-center rounded-full bg-white px-3.5 py-1.5 whitespace-nowrap shadow-tile ring-1 ring-text-primary/10 select-none md:flex",
                  "transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-tile-lift",
                  "focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                  pathname === "/bangladesh" && "ring-2 ring-bd-green",
                )}
              >
                <DeshLabel className="text-[16px] leading-none" />
              </Link>
            </div>

            {/* Centre — the live national readout, auto-rotating. `shrink-0`
                so the two side clusters absorb any shortfall instead. */}
            <NavIndicators className="hidden shrink-0 lg:flex" />

            {/* Right cluster — feed, account, mobile menu. */}
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              {/* Feed link: an ink tile, Bangla name above the tagline. */}
              <Link
                href="/media"
                className={cn(
                  "hidden h-10 shrink-0 flex-col items-center justify-center rounded-xl bg-text-primary px-3 text-center leading-tight min-[400px]:flex sm:px-4",
                  "shadow-ink transition-[transform,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  "hover:-translate-y-0.5 hover:bg-bd-green-dark focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                )}
              >
                <LabelText text={LABEL_TEXT.media} className="text-[14px] leading-none text-signal-orange sm:text-[15px]" />
                <span className="font-sans text-[11px] font-semibold whitespace-nowrap text-white/85 sm:text-xs">
                  Prioritize your joy.
                </span>
              </Link>

              {/* Account — sign-in link, or the signed-in avatar menu. */}
              <AccountMenu className="hidden sm:flex" />

              {/* Mobile menu — the nav row below is desktop-only. */}
              <Sheet>
                <SheetTrigger
                  aria-label="Open navigation menu"
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-text-primary text-signal-orange transition-colors hover:bg-bd-green-dark focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none lg:hidden"
                >
                  <Icon name="menu" className="text-[20px]" />
                </SheetTrigger>
                <SheetContent side="right" className="gap-0 overflow-y-auto p-space-lg">
                  <SheetTitle>
                    <BrandLogo className="h-14" />
                  </SheetTitle>

                  <nav className="mt-space-md flex flex-col gap-space-xs">
                    {navLinks.map((link) => (
                      <SheetClose asChild key={link.href}>
                        <a
                          href={link.href}
                          onClick={() => setActiveHref(link.href)}
                          className={cn(
                            "rounded-lg border px-space-md py-space-sm text-sm font-medium transition-colors",
                            activeHref === link.href
                              ? "border-text-primary bg-text-primary text-signal-orange"
                              : "border-slate-200 bg-slate-50 text-text-primary hover:border-signal-orange hover:bg-signal-orange/15",
                          )}
                        >
                          <NavLabel link={link} />
                        </a>
                      </SheetClose>
                    ))}
                  </nav>

                  <SheetClose asChild>
                    <Link
                      href="/bangladesh"
                      prefetch={false}
                      className="mt-space-md flex items-center justify-center gap-2 rounded-full border border-bd-green/20 bg-bd-green-light px-3.5 py-2 font-bengali text-sm font-bold"
                    >
                      <Image src="/icons/map.png" alt="" aria-hidden width={512} height={512} className="size-6 shrink-0 object-contain" />
                      <DeshLabel className="text-[17px] leading-none" />
                    </Link>
                  </SheetClose>

                  <SheetClose asChild>
                    <Link
                      href="/protibad"
                      className="mt-space-sm flex items-center justify-center gap-1.5 rounded-lg border-t border-white/20 bg-linear-to-r from-red-600 to-rose-700 px-3.5 py-2 font-bengali text-sm font-bold text-white shadow-red-glow"
                    >
                      <ProtestGlyph className="size-3.5" />
                      <LabelText text={LABEL_TEXT.protibad} className="text-[18px] leading-none" />
                    </Link>
                  </SheetClose>

                  <SheetClose asChild>
                    <Link
                      href="/nagorik"
                      className="mt-space-sm flex items-center justify-center gap-2 rounded-lg border border-bd-green/25 bg-white px-3.5 py-2 text-bd-green"
                    >
                      <ShieldCheck className="size-4" aria-hidden />
                      <LabelText text={LABEL_TEXT.nagorik} className="text-[18px] leading-none" />
                    </Link>
                  </SheetClose>

                  <SheetClose asChild>
                    <Link
                      href="/cholo-bangladesh-gori"
                      className="mt-space-sm flex items-center justify-center gap-2 rounded-lg bg-linear-to-r from-bd-green to-bdgreen-800 px-3.5 py-2 text-white"
                    >
                      <Puzzle className="size-4 text-signal-orange" aria-hidden />
                      <LabelText text={LABEL_TEXT.gori} className="text-[18px] leading-none" />
                    </Link>
                  </SheetClose>

                  <AccountSheetLinks wrap={(node) => <SheetClose asChild>{node}</SheetClose>} />

                  <p className="mt-space-lg font-bengali text-xs font-semibold text-bdgreen-900">{NAZRUL_MOTTO}</p>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* ── Level 3 — section navigation + civic actions ────────────── */}
        <nav className="no-scrollbar hidden overflow-x-auto border-t border-text-primary/10 bg-text-primary/[0.04] px-4 py-1 sm:px-6 lg:block lg:px-8">
          <div className="flex min-w-max items-center justify-between gap-3 xl:gap-6">
            <SectionNav links={navLinks} activeHref={activeHref} onPick={setActiveHref} />

            {/* Right — record, protest, civic duty, the game. */}
            <div className="flex items-center gap-2 xl:gap-3">
              <button
                type="button"
                onClick={() => setRecordOpen(true)}
                className="group inline-flex items-center gap-2 rounded-full bg-white px-2.5 py-1.5 text-xs font-semibold tracking-tight text-text-primary shadow-xs ring-1 ring-text-primary/10 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:ring-red-400 focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:outline-none motion-reduce:hover:translate-y-0 xl:px-3.5"
              >
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-75 motion-reduce:hidden" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-red-600 ring-2 ring-red-100" />
                </span>
                <span className="font-sans max-[1439px]:sr-only">Record</span>
              </button>

              <Link
                href="/protibad"
                className="inline-flex items-center gap-1.5 rounded-lg border-t border-white/20 bg-linear-to-r from-red-600 to-rose-700 px-2.5 py-1.5 font-bengali text-xs font-bold text-white shadow-red-glow transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:from-red-700 hover:to-rose-800 focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:outline-none active:translate-y-0 motion-reduce:hover:translate-y-0 xl:px-3.5"
              >
                <ProtestGlyph className="size-3.5 text-white" />
                <LabelText text={LABEL_TEXT.protibad} className="text-[16px] leading-none" />
              </Link>

              {/* Civic rights and responsibilities (/nagorik). */}
              <Link
                href="/nagorik"
                title="নাগরিক অধিকার ও দায়িত্ব — দিনের হিসাব, অধিকার, প্রত্যেকের দায়িত্ব"
                aria-current={pathname === "/nagorik" ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1.5 text-bd-green shadow-xs ring-1 ring-text-primary/10 transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-bd-green-light focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:outline-none motion-reduce:hover:translate-y-0 xl:px-3.5",
                  pathname === "/nagorik" && "ring-2 ring-bd-green",
                )}
              >
                <ShieldCheck className="size-3.5" aria-hidden />
                <LabelText text={LABEL_TEXT.nagorik} className="text-[15px] leading-none" />
              </Link>

              {/* The 32 problems above, as a game: solve them. */}
              <Link
                href="/cholo-bangladesh-gori"
                title="চলো বাংলাদেশ গড়ি — ৩২টি বাস্তব সমস্যার ধাঁধা"
                aria-current={onGori ? "page" : undefined}
                className={cn(
                  "group inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-bd-green to-bdgreen-800 px-2.5 py-1.5 text-white shadow-ink transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:from-bd-green-dark hover:to-bd-green focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:outline-none motion-reduce:hover:translate-y-0 xl:px-3.5",
                  onGori && "ring-2 ring-text-primary",
                )}
              >
                <Puzzle className="size-3.5 text-signal-orange transition-transform duration-300 group-hover:rotate-12 motion-reduce:transition-none" aria-hidden />
                <LabelText text={LABEL_TEXT.gori} className="text-[15px] leading-none" />
              </Link>
            </div>
          </div>
        </nav>

        {/* A slow gloss that crosses the card now and then (decorative). */}
        <span aria-hidden className="header-sheen" />
      </header>

      <RecordDialog open={recordOpen} onOpenChange={setRecordOpen} />
    </div>
  );
}
