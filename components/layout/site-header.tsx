"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type CSSProperties } from "react";
import { motion, useReducedMotion, type Transition } from "framer-motion";
import { ShieldCheck, X } from "lucide-react";
import { Dialog } from "radix-ui";
import { AccountMenu, AccountSheetLinks, loginHref } from "@/components/auth/account-menu";
import { RecordDialog } from "@/components/record/record-dialog";
import { Icon } from "@/components/ui/icon";
import { SignalSeam } from "@/components/ui/section-kit";
import { useAuth } from "@/lib/auth/client";
import { LabelText } from "@/components/brand/kandari-wordmark";
import { LABEL_TEXT } from "@/data/logo-text";
import { NAZRUL_MOTTO, navLinksFor, type NavLink } from "@/data/navigation";
import { cn } from "@/lib/utils";

/*
 * A full-width navy bar, flush with the top of the window, its contents held
 * to the page's content column (CLAUDE.md §4.1). The logo stands on its own
 * gold plate, spanning both rows from lg. Row one: the civic actions, the
 * feed and the account, right-aligned. Row two (lg and up): the section
 * tabs on the left, log in / sign up (or the profile) on the right, so both
 * rows run edge to edge. Between them a hairline with a gold light running
 * along it. Below lg the second row folds into the pop-up menu.
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
      <span className="text-crimson-bright">{link.accentWord}</span>
      {after.join(link.accentWord)}
    </span>
  );
}

/** "বাংলাদেশ সমস্যা ও সমাধান" in the label face. */
function DeshLabel({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-[0.3em]", className)}>
      <LabelText text={LABEL_TEXT.bangladesh} />
      <LabelText text={LABEL_TEXT.issue} />
      <LabelText text={LABEL_TEXT.solution} />
    </span>
  );
}

/**
 * A Material Symbol for each tab, matched on the link's path or anchor so
 * every page's nav set gets one without the data carrying it. Most specific
 * patterns first; a link with no match shows its label alone.
 */
const TAB_ICONS: [pattern: RegExp, icon: string][] = [
  [/#overview-mission$/, "flag"],
  [/#national-index$/, "monitoring"],
  [/kandari-profile$/, "badge"],
  [/\/products\/aponjon/, "watch"],
  [/\/products\/swasti/, "smartphone"],
  [/\/products\/smart-pharmacy/, "local_pharmacy"],
  [/\/products/, "inventory_2"],
  [/\/research\/contents/, "toc"],
  [/\/research\/submit/, "upload_file"],
  [/\/research\/changes/, "history"],
  [/\/research/, "science"],
  [/\/team#founder/, "person"],
  [/\/team#members/, "diversity_3"],
  [/\/team#fellowship/, "school"],
  [/\/team/, "groups"],
  [/\/bangladesh\/crisis/, "crisis_alert"],
  [/\/bangladesh\/shield/, "shield"],
  [/\/bangladesh\/problems/, "grid_view"],
  [/\/bangladesh\/solutions/, "lightbulb"],
  [/\/bangladesh/, "history_edu"],
  [/\/cholo-bangladesh-gori\/mission/, "flag"],
  [/\/cholo-bangladesh-gori\/play/, "sports_esports"],
  [/\/cholo-bangladesh-gori\/lab/, "science"],
  [/\/cholo-bangladesh-gori\/evidence/, "fact_check"],
  [/\/cholo-bangladesh-gori\/progress/, "trending_up"],
  [/\/cholo-bangladesh-gori/, "sports_esports"],
  [/#day$/, "schedule"],
  [/#divisions$/, "map"],
  [/#rights$/, "gavel"],
  [/#responsibility$/, "handshake"],
  [/#self-check$/, "self_improvement"],
];

const tabIcon = (href: string) => TAB_ICONS.find(([pattern]) => pattern.test(href))?.[1];

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
      sizes="(min-width: 1024px) 113px, (min-width: 640px) 73px, 66px"
      priority={priority}
      // The artwork's own 1600:967 ratio, reserved before load so nothing shifts.
      className={cn("aspect-1600/967 w-auto shrink-0 object-contain", className)}
    />
  );
}

/**
 * Header logo on its own gold plate. The artwork's "Kandari" green and
 * "Lab." black sink into the navy bar; on its own gold they read as they
 * were drawn, the way the footer shows them. Below lg it sits in the single
 * 64px row; from lg it stands in its own column spanning both rows.
 */
function BrandLockup() {
  return (
    <Link
      href="/"
      title="Kandari-Lab Homepage"
      className="group flex min-w-0 shrink-0 items-center rounded-xl bg-signal-orange px-2.5 py-1 shadow-[0_8px_20px_-10px_rgb(0_0_0/0.6)] select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-bdnavy-900 lg:rounded-2xl lg:px-4 lg:py-2"
    >
      <BrandLogo
        priority
        className="h-9 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100 sm:h-10 lg:h-15"
      />
    </Link>
  );
}

/**
 * The right end of the tab row: log in and sign up while signed out (gold
 * for the sign-up), the profile once signed in.
 */
function AuthActions() {
  const { ready, account } = useAuth();
  const pathname = usePathname();
  const quiet =
    "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-bold whitespace-nowrap text-white transition-colors duration-200 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none";

  if (ready && account) {
    return (
      <Link href="/account" className={cn(quiet, "ring-1 ring-white/20")}>
        <Icon name="account_circle" className="text-[18px] text-signal-orange" />
        My Profile
      </Link>
    );
  }
  return (
    <>
      <Link href={loginHref(pathname)} className={quiet}>
        <Icon name="login" className="text-[18px] text-signal-orange" />
        Log in
      </Link>
      <Link
        href="/signup"
        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-signal-orange px-4 text-sm font-bold whitespace-nowrap text-bdnavy-900 transition-[filter,translate] duration-200 hover:-translate-y-px hover:brightness-105 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-bdnavy-900 focus-visible:outline-none motion-reduce:hover:translate-y-0"
      >
        <Icon name="person_add" className="text-[18px]" />
        Sign up
      </Link>
    </>
  );
}

/**
 * Section tabs: no fill and no pill, just a bold gold icon and label on the
 * navy. The current tab is pointed out by a gold bar sitting on the header's
 * bottom edge; it springs from tab to tab and a light runs along it. On
 * hover or focus a faint bar grows from the centre of the tab under the
 * pointer, previewing where the gold one would go.
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
  const reduce = useReducedMotion();
  const slide: Transition = reduce
    ? { duration: 0 }
    : { type: "spring", stiffness: 420, damping: 34, mass: 0.8 };

  return (
    <ul className="flex h-full items-stretch gap-1 xl:gap-3">
      {links.map((link) => {
        const isActive = activeHref === link.href;
        const icon = tabIcon(link.href);
        return (
          <li key={link.href} className="flex">
            <a
              href={link.href}
              onClick={() => onPick(link.href)}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "group relative flex items-center gap-2 px-3 text-[15px] leading-none font-bold whitespace-nowrap text-signal-orange xl:px-3.5",
                "transition-[color,filter] duration-200 hover:brightness-110",
                "focus-visible:outline-none focus-visible:after:absolute focus-visible:after:inset-x-1 focus-visible:after:inset-y-2 focus-visible:after:rounded-md focus-visible:after:ring-2 focus-visible:after:ring-signal-orange",
              )}
            >
              {icon ? (
                <Icon
                  name={icon}
                  filled={isActive}
                  className="text-[21px] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-px"
                />
              ) : null}
              <NavLabel link={link} compact />

              {/* The membership link carries an ID tag; keep it on that one link only. */}
              {link.href === "#kandari-profile" ? (
                <span className="rounded bg-signal-orange px-1.5 py-0.5 font-mono text-[9.5px] font-bold text-bdnavy-900 uppercase">
                  ID
                </span>
              ) : null}

              {/* Hover preview: a faint bar grows out from the centre. */}
              {!isActive ? (
                <span
                  aria-hidden
                  className="absolute inset-x-3 bottom-0 h-0.75 origin-center scale-x-0 rounded-t-full bg-signal-orange/35 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none xl:inset-x-3.5"
                />
              ) : null}

              {/* The pointer: one gold bar that springs between tabs. */}
              {isActive ? (
                <motion.span
                  layoutId="nav-bar"
                  transition={slide}
                  aria-hidden
                  className="nav-bar absolute inset-x-3 bottom-0 h-0.75 rounded-t-full bg-signal-orange xl:inset-x-3.5"
                />
              ) : null}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export function SiteHeader() {
  // The section nav is per-page: the home sections do not exist on the
  // other pages, so linking to them there would scroll nowhere.
  const pathname = usePathname();
  const navLinks = navLinksFor(pathname);
  const inDesh = pathname === "/bangladesh" || pathname.startsWith("/bangladesh/");

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
  // Signed out on a wide screen, log in / sign up sit in the tab row; the round sign-in face is for phones.
  const { ready, account } = useAuth();
  const signedIn = ready && Boolean(account);

  return (
    // Full width and flush with the top, in the cards' navy. Inside, one grid:
    // the logo in its own column (spanning both rows from lg), the action
    // row top right, the section tabs under it from the logo's edge.
    <div className="fixed inset-x-0 top-0 z-40">
      <header className="header-bar relative isolate w-full text-white">
        <div className="mx-auto grid w-full max-w-384 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 px-gutter-x lg:grid-rows-[4rem_3.5rem] lg:gap-x-10 xl:gap-x-14">
          {/* Brand — one 64px row below lg, both rows from lg. */}
          <div className="flex h-16 items-center lg:row-span-2 lg:h-full">
            <BrandLockup />
          </div>

          {/* ── Row 1 — civic actions, feed, account ──────────────────── */}
          {/* Below lg the bar keeps only the profile face and the menu
              button; the feed and the recorder live in the pop-up menu. */}
          <div className="flex h-16 min-w-0 items-center justify-end gap-2 sm:gap-3">
              {/* Civic actions: quiet text buttons, the protest link in solid
                  red (urgency, CLAUDE.md §4.1) and the country page as the
                  one white button. Desktop only; below lg they live in the
                  pop-up menu. */}
              <div className="hidden items-center gap-1 lg:flex xl:gap-2">
                <button type="button" onClick={() => setRecordOpen(true)} className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none">
                  <span className="relative flex size-2.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-75 motion-reduce:hidden" />
                    <span className="relative inline-flex size-2.5 rounded-full bg-red-500 ring-2 ring-red-100" />
                  </span>
                  <span className="max-[1279px]:sr-only">Record</span>
                </button>

                <Link
                  href="/protibad"
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-national-crimson px-3.5 text-white transition-colors duration-200 hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                >
                  <ProtestGlyph className="size-4" />
                  <LabelText text={LABEL_TEXT.protibad} className="text-[16px] leading-none" />
                </Link>

                {/* Civic rights and responsibilities (/nagorik). */}
                <Link
                  href="/nagorik"
                  title="নাগরিক অধিকার ও দায়িত্ব — দিনের হিসাব, অধিকার, প্রত্যেকের দায়িত্ব"
                  aria-current={pathname === "/nagorik" ? "page" : undefined}
                  className={cn("inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none", pathname === "/nagorik" && "bg-white/10 ring-1 ring-white")}
                >
                  <ShieldCheck className="size-4" aria-hidden />
                  <LabelText text={LABEL_TEXT.nagorik} className="text-[16px] leading-none" />
                </Link>

                {/* বাংলাদেশ সমস্যা ও সমাধান — the country page (/bangladesh).
                    No prefetch: prefetching /bangladesh preloads its carousel
                    stylesheet on every page, which then sits unused and
                    raises a console "preloaded but not used" warning. */}
                <Link
                  href="/bangladesh"
                  prefetch={false}
                  title="বাংলাদেশ সমস্যা ও সমাধান — ইতিহাস, সংকট, ৩২টি সমস্যা ও সমাধান"
                  aria-current={inDesh ? "page" : undefined}
                  className={cn(
                    "inline-flex h-10 items-center rounded-lg bg-white px-4 whitespace-nowrap text-bdnavy-900 transition-colors duration-200 hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-bdnavy-900 focus-visible:outline-none",
                    inDesh && "ring-2 ring-signal-orange",
                  )}
                >
                  <DeshLabel className="text-[16px] leading-none" />
                </Link>
              </div>

              {/* A hairline between the civic actions and the personal pair. */}
              <span aria-hidden className="hidden h-7 w-px bg-white/15 lg:block" />

              {/* Feed link: the Bangla name over a small gold line. */}
              <Link
                href="/media"
                className="hidden h-12 shrink-0 flex-col items-start justify-center rounded-lg px-3 leading-tight transition-colors duration-200 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none lg:flex"
              >
                <LabelText text={LABEL_TEXT.media} className="text-[16px] leading-none text-white" />
                <span className="mt-1 font-sans text-xs font-medium whitespace-nowrap text-signal-orange">Prioritize your joy.</span>
              </Link>

              {/* Account — the signed-in avatar menu; signed out, a sign-in face on phones only. */}
              <AccountMenu className={signedIn ? undefined : "lg:hidden"} />

              {/* Mobile menu — the nav row below is desktop-only. A short gold
                  pop-up that opens from the button's corner, items rising in
                  one after another (keyframes: menu-* in globals.css). */}
              <Dialog.Root>
                <Dialog.Trigger
                  aria-label="Open navigation menu"
                  className="flex size-10 shrink-0 items-center justify-center rounded-md text-white transition-[background-color,scale] duration-200 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none active:scale-90 lg:hidden"
                >
                  <Icon name="menu" className="text-[26px]" />
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay className="menu-veil fixed inset-0 z-50 bg-black/55 lg:hidden" />
                  <Dialog.Content
                    aria-describedby={undefined}
                    onOpenAutoFocus={(e) => {
                      // Focus the panel, not the close button, so no ring shows on open.
                      e.preventDefault();
                      (e.currentTarget as HTMLElement).focus();
                    }}
                    className="menu-pop fixed top-3 right-3 z-50 flex max-h-[calc(100dvh-1.5rem)] w-[min(21rem,calc(100vw-1.5rem))] flex-col gap-2.5 overflow-y-auto rounded-3xl bg-bdnavy-900 p-3.5 text-white ring-1 ring-white/12 shadow-[0_28px_60px_-18px_rgb(0_0_0/0.7)] focus:outline-none lg:hidden"
                  >
                    <div className="menu-item flex items-center justify-between" style={{ "--i": 0 } as CSSProperties}>
                      <Dialog.Title className="rounded-xl bg-signal-orange px-2.5 py-1">
                        <BrandLogo className="h-9" />
                      </Dialog.Title>
                      <Dialog.Close
                        aria-label="Close menu"
                        className="flex size-10 items-center justify-center rounded-xl bg-text-primary text-signal-orange transition-[background-color,scale] duration-200 hover:bg-bdnavy-700 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none active:scale-90"
                      >
                        <X className="size-5" aria-hidden />
                      </Dialog.Close>
                    </div>

                    {/* The feed and the recorder, moved off the phone bar. */}
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                      <Dialog.Close asChild>
                        <Link
                          href="/media"
                          style={{ "--i": 1 } as CSSProperties}
                          className="menu-item flex min-h-14 flex-col items-center justify-center rounded-2xl bg-text-primary px-3 py-2 text-center leading-tight shadow-ink [-webkit-tap-highlight-color:transparent] transition-[background-color,scale] duration-200 hover:bg-bdnavy-700 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none active:scale-95"
                        >
                          <LabelText text={LABEL_TEXT.media} className="text-[17px] leading-none text-signal-orange" />
                          <span className="mt-1 font-sans text-xs font-semibold text-white/85">Prioritize your joy.</span>
                        </Link>
                      </Dialog.Close>
                      <Dialog.Close asChild>
                        <button
                          type="button"
                          onClick={() => setRecordOpen(true)}
                          style={{ "--i": 2 } as CSSProperties}
                          className="menu-item flex min-h-14 flex-col items-center justify-center gap-1.5 rounded-2xl bg-text-primary px-4 py-2 font-sans text-xs font-bold text-white shadow-ink [-webkit-tap-highlight-color:transparent] transition-[background-color,scale] duration-200 hover:bg-bdnavy-700 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none active:scale-95"
                        >
                          <span className="relative flex size-3">
                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-national-crimson opacity-75 motion-reduce:hidden" />
                            <span className="relative inline-flex size-3 rounded-full bg-national-crimson ring-2 ring-white/80" />
                          </span>
                          Record
                        </button>
                      </Dialog.Close>
                    </div>

                    <nav className="grid grid-cols-2 gap-2">
                      {navLinks.map((link, i) => (
                        <Dialog.Close asChild key={link.href}>
                          <a
                            href={link.href}
                            onClick={() => setActiveHref(link.href)}
                            style={{ "--i": i + 3 } as CSSProperties}
                            className={cn(
                              "menu-item flex min-h-11 items-center justify-center rounded-xl px-3 py-2 text-center text-sm transition-[background-color,scale] duration-200 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none active:scale-95",
                              activeHref === link.href
                                ? "bg-signal-orange font-bold text-text-primary shadow-ink"
                                : "bg-white/[0.07] font-medium text-white ring-1 ring-white/20 hover:bg-white/12",
                            )}
                          >
                            <NavLabel link={link} />
                          </a>
                        </Dialog.Close>
                      ))}
                    </nav>

                    <Dialog.Close asChild>
                      <Link
                        href="/bangladesh"
                        prefetch={false}
                        style={{ "--i": navLinks.length + 3 } as CSSProperties}
                        className="menu-item flex items-center justify-center gap-2 rounded-full bg-signal-orange px-3.5 py-2.5 font-bengali text-sm font-bold text-bdnavy-900 transition-[scale] duration-200 active:scale-95"
                      >
                        <DeshLabel className="text-[16px] leading-none" />
                      </Link>
                    </Dialog.Close>

                    <div className="grid grid-cols-2 gap-2">
                      <Dialog.Close asChild>
                        <Link
                          href="/protibad"
                          style={{ "--i": navLinks.length + 4 } as CSSProperties}
                          className="menu-item flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-national-crimson px-3 py-2 font-bengali text-sm font-bold text-white transition-[scale] duration-200 active:scale-95"
                        >
                          <ProtestGlyph className="size-3.5" />
                          <LabelText text={LABEL_TEXT.protibad} className="text-[17px] leading-none" />
                        </Link>
                      </Dialog.Close>
                      <Dialog.Close asChild>
                        <Link
                          href="/nagorik"
                          style={{ "--i": navLinks.length + 5 } as CSSProperties}
                          className="menu-item flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-3 py-2 ring-1 ring-white/35 transition-[background-color,scale] duration-200 hover:bg-white/10 active:scale-95"
                        >
                          <ShieldCheck className="size-4 shrink-0" aria-hidden />
                          <LabelText text={LABEL_TEXT.nagorik} className="text-[17px] leading-none" />
                        </Link>
                      </Dialog.Close>
                    </div>

                    <div className="menu-item" style={{ "--i": navLinks.length + 6 } as CSSProperties}>
                      <AccountSheetLinks onGold wrap={(node) => <Dialog.Close asChild>{node}</Dialog.Close>} />
                    </div>

                    <p
                      className="menu-item px-1 font-bengali text-xs font-semibold text-white/75"
                      style={{ "--i": navLinks.length + 7 } as CSSProperties}
                    >
                      {NAZRUL_MOTTO}
                    </p>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
          </div>

          {/* ── Row 2 (lg and up) — the section tabs, their gold pointer on
              the bar's bottom edge, and the account actions at the right
              end; over it, the running hairline that parts the rows. ───── */}
          <div className="relative col-start-2 hidden h-full items-stretch justify-between gap-6 lg:flex">
            <SignalSeam className="top-0" />
            <nav aria-label="Sections" className="no-scrollbar -ml-3 min-w-0 overflow-x-auto xl:-ml-3.5">
              <SectionNav links={navLinks} activeHref={activeHref} onPick={setActiveHref} />
            </nav>
            <div className="flex shrink-0 items-center gap-2">
              <AuthActions />
            </div>
          </div>
        </div>
      </header>

      <RecordDialog open={recordOpen} onOpenChange={setRecordOpen} />
    </div>
  );
}
