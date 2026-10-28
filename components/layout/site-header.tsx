"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type CSSProperties } from "react";
import { MotionConfig, motion, type Transition } from "framer-motion";
import { X } from "lucide-react";
import { Dialog, DropdownMenu } from "radix-ui";
import { AccountMenu, AccountSheetLinks, loginHref } from "@/components/auth/account-menu";
import { OPEN_RECORDER_EVENT } from "@/components/record/open-recorder";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/lib/auth/client";
import { LabelText } from "@/components/brand/kandari-wordmark";
import { LABEL_TEXT } from "@/data/logo-text";
import { NAZRUL_MOTTO, navLinksFor, type NavLink } from "@/data/navigation";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

/**
 * A header link: a route goes through next/link (prefetched, no full reload, the
 * header and hero film stay mounted); a #section link stays a plain anchor for
 * the smooth scroller (smooth-scroll.tsx), which handles those clicks itself.
 */
function NavAnchor({ href, ...props }: React.ComponentProps<"a"> & { href: string }) {
  return href.includes("#") ? <a href={href} {...props} /> : <Link href={href} {...props} />;
}

const RecordDialog = dynamic(() => import("@/components/record/record-dialog").then((m) => m.RecordDialog), { ssr: false });

/*
 * A full-width navy bar, flush with the top of the window, its contents held
 * to the page's content column (CLAUDE.md §4.1). The logo stands on its own
 * gold plate, spanning both rows from lg. Row one: the civic actions, the
 * feed and the account, right-aligned. Row two (lg and up): the section
 * tabs on the left, log in / sign up (or the profile) on the right, so both
 * rows run edge to edge. Between them a plain hairline. Below lg the second row folds into the pop-up menu.
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
        <span className="max-[1440px]:hidden">{link.label}</span>
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

/**
 * A Material Symbol for each tab, matched on the link's path or anchor so
 * every page's nav set gets one without the data carrying it. Most specific
 * patterns first; a link with no match shows its label alone.
 */
const TAB_ICONS: [pattern: RegExp, icon: string][] = [
  [/^\/#top$/, "home"],
  [/^\/nagorik$/, "verified_user"],
  [/#mission$/, "flag"],
  [/^\/about/, "info"],
  [/kandari-profile$/, "badge"],
  [/\/products\/aponjon/, "watch"],
  [/\/products\/swasti/, "smartphone"],
  [/\/products\/smart-pharmacy/, "local_pharmacy"],
  [/\/products/, "inventory_2"],
  [/^\/media/, "groups"],
  [/\/services\/ai/, "neurology"],
  [/\/services\/automation/, "precision_manufacturing"],
  [/\/services\/iot/, "sensors"],
  [/\/services\/development/, "code_blocks"],
  [/services/, "engineering"],
  // Genius: one icon per tab, so Research, Subjects, Collections and Workspace never share the flask.
  [/\/research\/subjects/, "category"],
  [/\/research\/collections/, "collections_bookmark"],
  [/\/research\/workspace/, "dashboard"],
  [/\/research\/titles/, "sort_by_alpha"],
  [/\/research\/institutions/, "account_balance"],
  [/\/research\/images/, "photo_library"],
  [/\/research\/advanced-search/, "manage_search"],
  [/\/research\/submit/, "upload_file"],
  [/^\/research$/, "local_library"],
  [/\/research/, "science"],
  [/\/team#founder/, "person"],
  [/\/team#members/, "diversity_3"],
  [/\/team\/fellowship/, "school"],
  [/\/team/, "groups"],
  [/\/bangladesh\/history/, "history_edu"],
  [/\/bangladesh\/crisis/, "crisis_alert"],
  [/\/bangladesh\/shield/, "shield"],
  [/\/bangladesh\/problems/, "grid_view"],
  [/\/bangladesh\/solutions/, "lightbulb"],
  [/\/bangladesh/, "map"],
  [/#day$/, "schedule"],
  [/#justice$/, "balance"],
  [/#rights$/, "gavel"],
  [/#responsibility$/, "handshake"],
  [/#pledge$/, "self_improvement"],
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
 * while the reader is on "/products/swasti". When several links share one
 * path, the page itself wins over its in-page sections ("/#top", Home,
 * over "/#mission"), then declaration order.
 */
function matchNavHref(pathname: string, links: NavLink[]): string | null {
  const isPage = (href: string) => !href.includes("#") || href.endsWith("#top");
  const best = links
    .map((link) => ({ link, path: link.href.split("#")[0] }))
    // The page itself, or failing that the section it sits in (/services/automation/alliance-dyer → /services/automation).
    .filter(({ path }) => path !== "" && (pathname === path || (path !== "/" && pathname.startsWith(`${path}/`))))
    .sort((a, b) => b.path.length - a.path.length || Number(isPage(b.link.href)) - Number(isPage(a.link.href)))[0];
  return best?.link.href ?? null;
}

/**
 * Scroll-spy for the tabs that point at sections of the current page
 * ("/#mission", "/#kandari-profile" on the home page): the one whose
 * section crosses the middle of the window, or null when none does. Each
 * report also hands the highlight back from a clicked tab to the scroll,
 * so the bar follows the page once a jump has landed.
 */
function useSectionSpy(pathname: string, links: NavLink[], onReport: () => void) {
  const [spy, setSpy] = useState<{ href: string | null; path: string }>({ href: null, path: pathname });

  useEffect(() => {
    const targets = links.flatMap((link) => {
      const [path, hash] = link.href.split("#");
      if (!hash || hash === "top" || (path !== "" && path !== pathname)) return [];
      const el = document.getElementById(hash);
      return el ? [{ href: link.href, el }] : [];
    });
    if (!targets.length) return;

    const visible = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const target = targets.find((t) => t.el === entry.target);
          if (!target) continue;
          if (entry.isIntersecting) visible.add(target.href);
          else visible.delete(target.href);
        }
        setSpy({ href: targets.find((t) => visible.has(t.href))?.href ?? null, path: pathname });
        onReport();
      },
      // A thin band across the middle of the window.
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const t of targets) io.observe(t.el);
    return () => io.disconnect();
    // `onReport` only clears a click; a fresh closure each render need not re-observe.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, links]);

  return spy.path === pathname ? spy.href : null;
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
 * Header logo, bare on the navy: no plate, the mark itself large and traced
 * in a gold outline with a soft lift (`.logo-on-navy`), so the "Kandari"
 * green and "Lab." black hold their edge. Below lg it sits in the single
 * 64px row; from lg it stands in its own column spanning both rows, 76px
 * tall in the 120px bar.
 */
function BrandLockup() {
  return (
    <Link
      href="/"
      title="Kandari-Lab Homepage"
      className="group flex min-w-0 shrink-0 items-center rounded-lg select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:ring-offset-4 focus-visible:ring-offset-bdnavy-900"
    >
      <BrandLogo
        priority
        className="logo-on-navy h-11 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100 lg:h-19"
      />
    </Link>
  );
}

/**
 * The right end of the tab row: log in and sign up while signed out (gold
 * for the sign-up); once signed in, the account itself, picture and first
 * name, opening the account menu.
 */
function AuthActions() {
  const { ready, account } = useAuth();
  const pathname = usePathname();
  const quiet =
    "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-bold whitespace-nowrap text-white transition-colors duration-200 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none";

  if (ready && account) return <AccountMenu variant="chip" />;
  return (
    <>
      <Link href={loginHref(pathname)} className={quiet}>
        <Icon name="login" className="text-lg text-signal-orange" />
        Log in
      </Link>
      <Link
        href="/signup"
        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-signal-orange px-4 text-sm font-bold whitespace-nowrap text-bdnavy-900 transition-[filter,translate] duration-200 hover:-translate-y-px hover:brightness-105 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-bdnavy-900 focus-visible:outline-none motion-reduce:hover:translate-y-0"
      >
        <Icon name="person_add" className="text-lg" />
        Sign up
      </Link>
    </>
  );
}

/** A tab's gold bar: the current one springs between tabs; the others grow a faint preview under the pointer. */
function TabBar({ active, slide }: { active: boolean; slide: Transition }) {
  return active ? (
    <motion.span
      layoutId="nav-bar"
      transition={slide}
      aria-hidden
      className="nav-bar absolute inset-x-3 bottom-0 h-0.75 rounded-t-full bg-signal-orange xl:inset-x-3.5"
    />
  ) : (
    <span
      aria-hidden
      className="absolute inset-x-3 bottom-0 h-0.75 origin-center scale-x-0 rounded-t-full bg-signal-orange/35 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100 group-data-[state=open]:scale-x-100 motion-reduce:transition-none xl:inset-x-3.5"
    />
  );
}

const TAB =
  "group relative flex items-center px-1 min-[1100px]:px-2 text-sm leading-none font-bold whitespace-nowrap text-signal-orange xl:px-3.5 focus-visible:outline-none focus-visible:after:absolute focus-visible:after:inset-x-1 focus-visible:after:inset-y-2 focus-visible:after:rounded-md focus-visible:after:ring-2 focus-visible:after:ring-signal-orange";

/**
 * A tab's face, the icon and its label as one piece: it zooms straight up
 * under the pointer or keyboard focus and pops once when the tab becomes
 * the current one (`nav-tab-face` in globals.css).
 */
function TabFace({ link, active, children }: { link: NavLink; active: boolean; children?: React.ReactNode }) {
  const icon = tabIcon(link.href);
  return (
    <span className={cn("nav-tab-face flex items-center gap-2", active && "nav-tab-face-on")}>
      {icon ? <Icon name={icon} filled={active} className="text-xl" /> : null}
      <NavLabel link={link} compact />
      {children}
    </span>
  );
}

/**
 * Section tabs: no fill and no pill, just a bold gold icon and label on the
 * navy. The current tab is pointed out by a gold bar sitting on the header's
 * bottom edge; it springs from tab to tab and a light runs along it. On
 * hover or focus a faint bar grows from the centre of the tab under the
 * pointer, previewing where the gold one would go. A tab with `children`
 * opens a small navy menu of them instead (Services, on the product pages).
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
    // The bar already honours reduced motion itself (`slide` above), so Framer's own handling is off:
    // same result, without its development warning on every load for those visitors.
    <MotionConfig reducedMotion="never">
      <ul className="flex h-full items-stretch gap-1 xl:gap-3">
      {links.map((link) => {
        if (link.children) {
          const isActive = link.children.some((child) => child.href === activeHref);
          return (
            <li key={link.href} className="flex">
              <DropdownMenu.Root modal={false}>
                <DropdownMenu.Trigger className={TAB} aria-current={isActive ? "true" : undefined}>
                  <TabFace link={link} active={isActive}>
                    <Icon
                      name="expand_more"
                      className="text-lg transition-transform duration-300 group-data-[state=open]:rotate-180 motion-reduce:transition-none"
                    />
                  </TabFace>
                  <TabBar active={isActive} slide={slide} />
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="start"
                    sideOffset={6}
                    collisionPadding={12}
                    className="menu-pop z-60 min-w-64 rounded-2xl bg-bdnavy-900 p-2 text-white shadow-[0_28px_60px_-18px_rgb(0_0_0/0.8)] ring-1 ring-white/12"
                  >
                    {link.children.map((child) => (
                      <DropdownMenu.Item key={child.href} asChild>
                        <NavAnchor
                          href={child.href}
                          onClick={() => onPick(child.href)}
                          className={cn(
                            "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-3 text-sm font-semibold outline-none select-none transition-colors duration-150 data-highlighted:bg-white/10 data-highlighted:text-signal-orange",
                            isBangla(child.label) && "font-bengali text-base",
                            child.href === activeHref && "text-signal-orange",
                          )}
                        >
                          <Icon name={tabIcon(child.href) ?? "arrow_forward"} className="text-xl text-signal-orange" />
                          {child.label}
                        </NavAnchor>
                      </DropdownMenu.Item>
                    ))}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </li>
          );
        }

        const isActive = activeHref === link.href;
        return (
          <li key={link.href} className="flex">
            <NavAnchor href={link.href} onClick={() => onPick(link.href)} aria-current={isActive ? "true" : undefined} className={TAB}>
              <TabFace link={link} active={isActive} />
              <TabBar active={isActive} slide={slide} />
            </NavAnchor>
          </li>
        );
      })}
      </ul>
    </MotionConfig>
  );
}

const isBangla = (s: string) => /[ঀ-৿]/.test(s);

/**
 * The National TV Wall: the country's live dashboard (/tv-wall). Gold on the
 * navy bar beside প্রতিবাদ; red stays for harm, so no live dot here.
 */
function TvWallLink({ className }: { className?: string }) {
  const pathname = usePathname();
  const current = pathname?.startsWith("/tv-wall");
  return (
    <Link
      href="/tv-wall"
      aria-current={current ? "page" : undefined}
      className={cn(
        "group inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-3 font-bengali text-sm font-bold ring-2 ring-signal-orange ring-inset transition-colors duration-200 focus-visible:ring-white focus-visible:outline-none",
        current ? "bg-signal-orange text-text-primary" : "text-signal-orange hover:bg-signal-orange hover:text-text-primary",
        className,
      )}
    >
      <Icon name="connected_tv" className="text-xl!" />
      <span className="whitespace-nowrap">
        <span className="max-xl:hidden">জাতীয় </span>টিভি ওয়াল
      </span>
    </Link>
  );
}

/**
 * প্রতিবাদ, in the alert red (CLAUDE.md §4.1), as a small menu: raise a
 * protest on its page, or start recording evidence right away.
 */
function ProtestMenu({ onRecord }: { onRecord: () => void }) {
  const item =
    "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-3 text-sm font-semibold outline-none select-none transition-colors duration-150 data-highlighted:bg-white/10";
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger className="group inline-flex h-10 items-center gap-1.5 rounded-lg bg-national-crimson px-3.5 text-white transition-colors duration-200 hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none data-[state=open]:bg-red-700">
        <ProtestGlyph className="size-4" />
        <LabelText text={LABEL_TEXT.protibad} className="text-base leading-none" />
        <Icon
          name="expand_more"
          className="text-lg transition-transform duration-300 group-data-[state=open]:rotate-180 motion-reduce:transition-none"
        />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={8}
          collisionPadding={12}
          className="menu-pop z-60 min-w-56 rounded-2xl bg-bdnavy-900 p-2 text-white shadow-[0_28px_60px_-18px_rgb(0_0_0/0.8)] ring-1 ring-white/12"
        >
          <DropdownMenu.Item asChild>
            <Link href="/protibad" className={item}>
              <ProtestGlyph className="size-5 text-national-crimson" />
              <span className="font-bengali text-base">প্রতিবাদ জানান</span>
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item className={item} onSelect={onRecord}>
            <span className="relative flex size-5 items-center justify-center">
              <span className="absolute inline-flex size-3 animate-ping rounded-full bg-red-400 opacity-75 motion-reduce:hidden" />
              <span className="relative inline-flex size-3 rounded-full bg-red-500 ring-2 ring-red-100" />
            </span>
            Record
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export function SiteHeader() {
  // The section nav is per-page: the home sections do not exist on the
  // other pages, so linking to them there would scroll nowhere.
  const pathname = usePathname();
  const navLinks = navLinksFor(pathname);

  // Which link the current page corresponds to, recomputed each render
  // so client-side navigation between two nav pages moves the highlight.
  const pathHref = matchNavHref(pathname, navLinks.flatMap((link) => [link, ...(link.children ?? [])]));

  // In-page anchor clicks (Mission, Products…) track their own
  // highlight. Storing the pathname alongside the clicked href lets a
  // route change discard it during render, without an effect — which
  // also keeps this clear of `react-hooks/set-state-in-effect`.
  const [clicked, setClicked] = useState<{ href: string; path: string } | null>(null);
  const clickedHref = clicked?.path === pathname ? clicked.href : null;
  // On the home page the bar also follows the sections in view.
  const spyHref = useSectionSpy(pathname, navLinks, () => setClicked(null));
  const activeHref = clickedHref ?? spyHref ?? pathHref ?? navLinks[0].href;
  const setActiveHref = (href: string) => setClicked({ href, path: pathname });
  const [recordOpen, setRecordOpen] = useState(false);
  // The recorder's code loads on first use and then stays mounted, so its saved files survive closing it.
  const [recorderUsed, setRecorderUsed] = useState(false);
  if (recordOpen && !recorderUsed) setRecorderUsed(true);
  useEffect(() => {
    const open = () => setRecordOpen(true);
    window.addEventListener(OPEN_RECORDER_EVENT, open);
    return () => window.removeEventListener(OPEN_RECORDER_EVENT, open);
  }, []);

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

          {/* ── Row 1 — protest menu, feed, account ───────────────────── */}
          {/* Below lg the bar keeps only the profile face and the menu
              button; the feed and the recorder live in the pop-up menu. */}
          <div className="flex h-16 min-w-0 items-center justify-end gap-2 sm:gap-3">
              {/* The protest menu, in the alert red (CLAUDE.md §4.1): raise a
                  protest, or start recording. Desktop only; below lg it
                  lives in the pop-up menu. */}
              <TvWallLink className="hidden lg:inline-flex" />
              <div className="hidden lg:flex">
                <ProtestMenu onRecord={() => setRecordOpen(true)} />
              </div>

              {/* A hairline between the civic actions and the personal pair. */}
              <span aria-hidden className="hidden h-7 w-px bg-white/15 lg:block" />

              {/* Feed link: the Bangla name over a small gold line. */}
              <Link
                href="/media"
                className="hidden h-12 shrink-0 flex-col items-start justify-center rounded-lg px-3 leading-tight transition-colors duration-200 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none lg:flex"
              >
                <LabelText text={LABEL_TEXT.media} className="text-base leading-none text-white" />
                <span className="mt-1 font-sans text-xs font-medium whitespace-nowrap text-signal-orange">Prioritize your joy.</span>
              </Link>

              {/* Log in and Sign up, or the signed-in face and first name (desktop). */}
              <span aria-hidden className="hidden h-7 w-px bg-white/15 lg:block" />
              <div className="hidden shrink-0 items-center gap-2 lg:flex">
                <AuthActions />
              </div>

              {/* Account on phones (avatar menu or sign-in face); from lg it lives at the end of the tab row. */}
              <AccountMenu className="lg:hidden" />

              {/* Mobile menu — the nav row below is desktop-only. A short gold
                  pop-up that opens from the button's corner, items rising in
                  one after another (keyframes: menu-* in globals.css). */}
              <Dialog.Root>
                <Dialog.Trigger
                  aria-label="Open navigation menu"
                  className="flex size-10 shrink-0 items-center justify-center rounded-md text-white transition-[background-color,scale] duration-200 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none active:scale-90 lg:hidden"
                >
                  <Icon name="menu" className="text-2xl" />
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
                      <Dialog.Title>
                        <BrandLogo className="logo-on-navy h-10" />
                      </Dialog.Title>
                      <Dialog.Close
                        aria-label="Close menu"
                        className="flex size-10 items-center justify-center rounded-xl bg-text-primary text-signal-orange transition-[background-color,scale] duration-200 hover:bg-bdnavy-700 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none active:scale-90"
                      >
                        <X className="size-5" aria-hidden />
                      </Dialog.Close>
                    </div>

                    <Dialog.Close asChild>
                      <Link
                        href="/tv-wall"
                        style={{ "--i": 1 } as CSSProperties}
                        className="menu-item flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-signal-orange px-3 font-bengali text-base font-bold text-text-primary transition-[scale] duration-200 active:scale-95"
                      >
                        <Icon name="connected_tv" className="text-xl!" />
                        জাতীয় টিভি ওয়াল
                      </Link>
                    </Dialog.Close>

                    {/* The feed and the recorder, moved off the phone bar. */}
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                      <Dialog.Close asChild>
                        <Link
                          href="/media"
                          style={{ "--i": 1 } as CSSProperties}
                          className="menu-item flex min-h-14 flex-col items-center justify-center rounded-2xl bg-text-primary px-3 py-2 text-center leading-tight shadow-ink [-webkit-tap-highlight-color:transparent] transition-[background-color,scale] duration-200 hover:bg-bdnavy-700 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none active:scale-95"
                        >
                          <LabelText text={LABEL_TEXT.media} className="text-base leading-none text-signal-orange" />
                          <span className="mt-1 font-sans text-xs font-semibold text-white/80">Prioritize your joy.</span>
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
                      {/* A menu tab shows its first page here. */}
                      {navLinks.flatMap((link) => link.children?.slice(0, 1) ?? [link]).map((link, i) => (
                        <Dialog.Close asChild key={link.href}>
                          <NavAnchor
                            href={link.href}
                            onClick={() => setActiveHref(link.href)}
                            style={{ "--i": i + 3 } as CSSProperties}
                            className={cn(
                              "menu-item flex min-h-11 items-center justify-center rounded-xl px-3 py-2 text-center text-sm transition-[background-color,scale] duration-200 odd:last:col-span-2 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none active:scale-95",
                              activeHref === link.href
                                ? "bg-signal-orange font-bold text-text-primary shadow-ink"
                                : "bg-white/7 font-medium text-white ring-1 ring-white/20 hover:bg-white/12",
                            )}
                          >
                            <NavLabel link={link} />
                          </NavAnchor>
                        </Dialog.Close>
                      ))}
                    </nav>

                    <div className="grid gap-2">
                      <Dialog.Close asChild>
                        <Link
                          href="/protibad"
                          style={{ "--i": navLinks.length + 3 } as CSSProperties}
                          className="menu-item flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-national-crimson px-3 py-2 font-bengali text-sm font-bold text-white transition-[scale] duration-200 active:scale-95"
                        >
                          <ProtestGlyph className="size-3.5" />
                          <LabelText text={LABEL_TEXT.protibad} className="text-base leading-none" />
                        </Link>
                      </Dialog.Close>
                    </div>

                    <div className="menu-item" style={{ "--i": navLinks.length + 4 } as CSSProperties}>
                      <AccountSheetLinks onNavy wrap={(node) => <Dialog.Close asChild>{node}</Dialog.Close>} />
                    </div>

                    <p
                      className="menu-item px-1 font-bengali text-xs font-semibold text-white/80"
                      style={{ "--i": navLinks.length + 5 } as CSSProperties}
                    >
                      {NAZRUL_MOTTO}
                    </p>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
          </div>

          {/* ── Row 2 (lg and up) — the section tabs and their gold pointer
              on the bar's bottom edge; over it, the still hairline that
              parts the rows (Mahir, 2026-10-25: the running light is gone). ── */}
          <div className="relative col-start-2 hidden h-full items-stretch gap-6 lg:flex">
            {/* The seam: one quiet hairline from the logo (reaching back across
                the column gap) to the bar's far edge. */}
            <span aria-hidden className="pointer-events-none absolute top-0 right-0 -left-10 h-px bg-white/12 xl:-left-14" />
            <nav aria-label="Sections" className="no-scrollbar -ml-2 min-w-0 overflow-x-auto xl:-ml-3.5">
              <SectionNav links={navLinks} activeHref={activeHref} onPick={setActiveHref} />
            </nav>
          </div>
        </div>
      </header>

      {recorderUsed && <RecordDialog open={recordOpen} onOpenChange={setRecordOpen} />}
    </div>
  );
}
