"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Puzzle } from "lucide-react";
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
 * a web-sized copy of the 19531×11812 master logo.png). The earlier emblem +
 * typeset wordmark + tagline lockup is retired: the new artwork carries the
 * name itself. Own component so the header and mobile menu share it.
 */
export function BrandLogo({ className, priority = false }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src="/logo/kandari-logo.png"
      alt="কাণ্ডারী-ল্যাব (Kandari Lab)"
      width={1600}
      height={967}
      sizes="(min-width: 1024px) 133px, (min-width: 640px) 106px, 93px"
      priority={priority}
      // The artwork's own 1600:967 ratio, reserved before load so nothing shifts.
      className={cn("aspect-1600/967 w-auto shrink-0 object-contain", className)}
    />
  );
}

/**
 * Header logo. The mark is dense (fist + two-line name), so it runs larger
 * than a plain wordmark would: 56px on phones, 64px on tablets, 80px on
 * desktop, where "Kandari" renders ~22px tall — legible at a glance. The
 * level-2 row is sized by it; --spacing-header in globals.css follows.
 */
function BrandLockup() {
  return (
    <Link href="/" title="Kandari-Lab Homepage" className="group flex min-w-0 items-center select-none focus:outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-signal-orange">
      <BrandLogo priority className="h-14 transition-transform duration-200 group-hover:scale-[1.03] sm:h-16 lg:h-20" />
    </Link>
  );
}

export function SiteHeader() {
  // The section nav is per-page: the home sections do not exist on the
  // news index, so linking to them there would scroll nowhere.
  const pathname = usePathname();
  const navLinks = navLinksFor(pathname);

  // Which link the current page corresponds to, recomputed each render
  // so client-side navigation between two nav pages moves the highlight.
  const pathHref = matchNavHref(pathname, navLinks);

  // In-page anchor clicks (Mission, Products…) track their own
  // highlight. Storing the pathname alongside the clicked href lets a
  // route change discard it during render, without an effect — which
  // also keeps this clear of `react-hooks/set-state-in-effect`.
  const [clicked, setClicked] = useState<{ href: string; path: string } | null>(
    null,
  );
  const clickedHref = clicked?.path === pathname ? clicked.href : null;
  const activeHref = clickedHref ?? pathHref ?? navLinks[0].href;
  const setActiveHref = (href: string) => setClicked({ href, path: pathname });
  const [recordOpen, setRecordOpen] = useState(false);

  return (
    // The card floats inset from the page edges, so the fixed wrapper is the
    // full-width track and the <header> inside it is the card. Padding here
    // rather than on the card keeps the rounded corners clear of the viewport.
    <div className="fixed inset-x-0 top-0 z-40 px-3 py-2 sm:px-6 sm:py-2.5">
      <header
        className={cn(
          "glass-surface-ultra mx-auto w-full max-w-[1360px] overflow-hidden",
          "rounded-2xl border border-slate-200/90 shadow-master-navbar",
          "transition-all duration-300 hover:border-slate-300/80",
        )}
      >
        {/* ── Level 1 — lattice telemetry strip ───────────────────────── */}
        <div className="border-b border-slate-100/90 bg-white/75 px-4 py-1.5 font-mono text-[11px] tracking-tight text-slate-600 sm:px-6 lg:px-8">
          {/* Single row: the ticker takes whatever width the readouts leave.
              Below md the readouts step aside so the ticker has room to be
              read — a marquee squeezed to 100px is just motion. */}
          <div className="flex items-center justify-between gap-x-4">
            <NewsTicker />

            {/* Protocol + grid readouts. */}
            <div className="hidden shrink-0 items-center space-x-4 font-mono text-xs md:flex">
              <div className="hidden items-center space-x-1.5 border-r border-slate-200/70 pr-4 font-sans text-[10px] text-slate-600 xl:flex">
                <span className="mr-1 inline-flex h-3 items-end gap-0.5">
                  <span className="h-1.5 w-0.5 rounded-xs bg-emerald-500" />
                  <span className="h-2 w-0.5 rounded-xs bg-emerald-500" />
                  <span className="h-2.5 w-0.5 rounded-xs bg-emerald-500" />
                  <span className="h-3 w-0.5 rounded-xs bg-emerald-500" />
                </span>
                <span>SYNC: 24ms</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="font-sans text-[11px] font-medium text-slate-600 sm:text-xs">
                  Golden 2-Hours Critical Response Protocol:
                </span>
                <span className="inline-flex items-center space-x-1 rounded-full border border-emerald-300/70 bg-emerald-50/90 px-2 py-0.5 text-[10px] font-bold text-emerald-800 shadow-[0_1px_3px_rgba(5,150,105,0.12)]">
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-80" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-emerald-600" />
                  </span>
                  <span className="tracking-wide">• ONLINE</span>
                </span>
              </div>

              <span className="font-sans text-slate-300 select-none">|</span>

              <div className="flex items-center space-x-1.5 font-sans font-semibold text-slate-700">
                <span className="size-2 rounded-full bg-emerald-600 ring-2 ring-emerald-100" />
                <span className="text-[11px] tracking-tight text-slate-600">
                  • BD GRID:
                </span>
                <span className="rounded border border-emerald-200/60 bg-emerald-50/60 px-1.5 py-0.5 font-mono text-xs font-bold tracking-normal text-bdgreen-900 tabular-nums">
                  99.98%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Level 2 — brand, live metric, conversion ────────────────── */}
        <div className="bg-white/70 px-4 py-1.5 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            {/* Left cluster — emblem+wordmark, today's pill. `min-w-0` so it
                yields to the action cluster instead of pushing it off the
                card on narrow screens. */}
            <div className="flex min-w-0 items-center space-x-3.5 sm:space-x-5 lg:space-x-6">
              <BrandLockup />

              <div className="hidden h-8 w-px bg-linear-to-b from-transparent via-slate-200 to-transparent sm:block" />

              {/* বাংলাদেশ — the country story page (/bangladesh). */}
              {/* No prefetch: prefetching /bangladesh preloads its carousel
                  stylesheet on every page, which then sits unused and
                  raises a console "preloaded but not used" warning. */}
              <Link
                href="/bangladesh"
                prefetch={false}
                title="বাংলাদেশ — Bangladesh story, nature, history & culture"
                className="frosted-pill-bangladesh group hidden cursor-pointer items-center rounded-full px-3.5 py-1.5 transition-all duration-200 select-none md:flex"
              >
                <span className="flex items-center text-[17px] leading-none">
                  <LabelText text={LABEL_TEXT.bangladesh} className="text-bd-green" />
                </span>
              </Link>
            </div>

            {/* Centre — the live national readout, auto-rotating. `shrink-0`
                so it keeps its full width and the two side clusters absorb
                any shortfall instead of squeezing the reading. */}
            <NavIndicators className="hidden shrink-0 lg:flex" />

            {/* Right cluster — tribute line, account, mobile menu. */}
            <div className="flex shrink-0 items-center space-x-2 sm:space-x-3">
              {/* Feed link — a quiet outlined pill, not a conversion CTA:
                  Bangla name on top, English tagline beneath. */}
              <Link
                href="/media"
                className="hidden h-10 shrink-0 flex-col items-center justify-center rounded-xl border border-primary/30 px-3 text-center leading-tight transition-colors duration-200 hover:bg-emerald-50 min-[400px]:flex sm:px-4"
              >
                <LabelText text={LABEL_TEXT.media} className="text-[14px] leading-none text-primary sm:text-[15px]" />
                <span className="font-sans text-[11px] font-semibold whitespace-nowrap text-primary sm:text-xs">
                  Prioritize your joy.
                </span>
              </Link>

              {/* Account — sign-in link, or the signed-in avatar menu. */}
              <AccountMenu className="hidden sm:flex" />

              {/* Mobile menu — the nav row below is desktop-only. */}
              <Sheet>
                <SheetTrigger
                  aria-label="Open navigation menu"
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100/90 text-slate-700 transition-colors hover:bg-slate-200/80 lg:hidden"
                >
                  <Icon name="menu" className="text-[20px]" />
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="gap-0 overflow-y-auto p-space-lg"
                >
                  <SheetTitle>
                    <BrandLogo className="h-14" />
                  </SheetTitle>

                  <nav className="mt-space-md flex flex-col gap-space-xs">
                    {navLinks.map((link) => (
                      <SheetClose asChild key={link.href}>
                        <a
                          href={link.href}
                          onClick={() => setActiveHref(link.href)}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-space-md py-space-sm text-sm font-medium text-slate-900 transition-colors hover:border-emerald-300 hover:text-bdgreen-900"
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
                      className="frosted-pill-bangladesh mt-space-md flex items-center justify-center gap-2 rounded-full px-3.5 py-2 font-bengali text-sm font-bold text-slate-800"
                    >
                      <Image
                        src="/icons/map.png"
                        alt=""
                        aria-hidden
                        width={512}
                        height={512}
                        className="size-6 shrink-0 object-contain"
                      />
                      <span className="text-[18px] leading-none">
                        <LabelText text={LABEL_TEXT.bangladesh} className="text-bd-green" />
                      </span>
                    </Link>
                  </SheetClose>

                  <SheetClose asChild>
                    <Link
                      href="/protibad"
                      className="mt-space-sm flex items-center justify-center gap-1.5 rounded-lg border-t border-white/20 bg-linear-to-r from-red-600 to-rose-700 px-3.5 py-2 font-bengali text-sm font-bold text-white shadow-red-glow"
                    >
                      <svg
                        aria-hidden
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="size-3.5"
                      >
                        <path
                          d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <LabelText text={LABEL_TEXT.protibad} className="text-[18px] leading-none" />
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

                  <p className="mt-space-lg font-bengali text-xs font-semibold text-bdgreen-900">
                    {NAZRUL_MOTTO}
                  </p>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* ── Level 3 — section navigation + civic actions ────────────── */}
        <nav className="no-scrollbar hidden overflow-x-auto border-t border-slate-200/80 bg-white/85 px-4 py-1 backdrop-blur-md sm:px-6 lg:block lg:px-8">
          <div className="flex min-w-max items-center justify-between gap-6">
            <ul className="flex items-center space-x-1 lg:space-x-1.5">
              {navLinks.map((link) => {
                const isActive = activeHref === link.href;
                return (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={() => setActiveHref(link.href)}
                      className={cn(
                        "relative flex items-center rounded-lg px-3 py-1.5 text-sm transition-all duration-150",
                        isActive
                          ? "bg-slate-100/80 px-3.5 font-bold text-slate-900"
                          : "font-medium text-slate-600 hover:bg-slate-100/60 hover:text-slate-900",
                      )}
                    >
                      <NavLabel link={link} compact />

                      {/* The membership link carries an ID tag; keep it on
                          that one link only. */}
                      {link.href === "#kandari-profile" ? (
                        <span className="ml-1.5 rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[9.5px] font-bold text-slate-600 uppercase transition-colors group-hover:bg-emerald-50 group-hover:text-emerald-700">
                          ID
                        </span>
                      ) : null}

                      {isActive ? (
                        <span className="active-tab-glow absolute inset-x-3.5 bottom-0 h-[2.5px] rounded-full" />
                      ) : null}
                    </a>
                  </li>
                );
              })}
            </ul>

            {/* Right — record, protest, national issue tracker. */}
            <div className="flex items-center space-x-2.5 sm:space-x-3">
              <button
                type="button"
                onClick={() => setRecordOpen(true)}
                className="group inline-flex items-center space-x-2 rounded-full border border-slate-300/90 bg-white px-3.5 py-1.5 text-xs font-semibold tracking-tight text-slate-700 shadow-xs transition-all duration-150 hover:border-red-400 hover:bg-red-50/40"
              >
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-red-600 ring-2 ring-red-100" />
                </span>
                <span className="font-sans group-hover:text-red-700 max-[1439px]:sr-only">
                  Record
                </span>
              </button>

              <Link
                href="/protibad"
                className="inline-flex transform cursor-pointer items-center space-x-1.5 rounded-lg border-t border-white/20 bg-linear-to-r from-red-600 to-rose-700 px-3.5 py-1.5 font-bengali text-xs font-bold text-white shadow-red-glow transition-all duration-150 hover:-translate-y-0.5 hover:from-red-700 hover:to-rose-800 active:translate-y-0"
              >
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="size-3.5 text-white"
                >
                  <path
                    d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <LabelText text={LABEL_TEXT.protibad} className="text-[16px] leading-none" />
              </Link>

              <Link
                href="/amar-bangladesh"
                title="National Critical Matrix Issue Tracker"
                className="inline-flex cursor-pointer items-center space-x-2 rounded-full border border-rose-200/90 bg-linear-to-r from-rose-50/90 to-red-50/60 px-3.5 py-1.5 font-bengali text-xs font-semibold text-slate-800 shadow-xs transition-all duration-200 hover:border-rose-300 hover:bg-rose-100/60"
              >
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-red-600" />
                </span>
                <LabelText text={LABEL_TEXT.issueLead} className="text-[15px] leading-none text-slate-800" />
                <span className="rounded border border-red-200/60 bg-red-100/80 px-1.5 py-0.5 text-[15px] leading-none text-red-700">
                  <LabelText text={LABEL_TEXT.issue} />
                </span>
              </Link>

              {/* The 32 problems above, as a game: solve them. */}
              <Link
                href="/cholo-bangladesh-gori"
                title="চলো বাংলাদেশ গড়ি — ৩২টি বাস্তব সমস্যার ধাঁধা"
                aria-current={pathname.startsWith("/cholo-bangladesh-gori") ? "page" : undefined}
                className={cn(
                  "group inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-bd-green to-bdgreen-800 px-3.5 py-1.5 text-white shadow-[0_4px_12px_-4px_rgb(0_103_71/0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:from-bd-green-dark hover:to-bd-green",
                  pathname.startsWith("/cholo-bangladesh-gori") && "ring-2 ring-signal-orange ring-offset-1",
                )}
              >
                <Puzzle className="size-3.5 text-signal-orange transition-transform duration-300 group-hover:rotate-12" aria-hidden />
                <LabelText text={LABEL_TEXT.gori} className="text-[15px] leading-none" />
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <RecordDialog open={recordOpen} onOpenChange={setRecordOpen} />
    </div>
  );
}
