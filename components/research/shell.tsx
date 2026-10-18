"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useId, useRef, useState, useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/icon";
import { btn } from "@/components/ui/section-kit";
import { cn } from "@/lib/utils";
import { useDismiss } from "./actions";
import { CONTENT_TYPES, GeniusLogo, MENU, MENU_ITEM } from "./kit";

const BROWSE = [
  { href: "/research/subjects", title: "By subject", sub: "Theses, papers, projects and ideas" },
  { href: "/research/titles", title: "By title", sub: "Every work, A to Z" },
  { href: "/research/institutions", title: "Institutions" },
  { href: "/research/collections", title: "Collections" },
  { href: "/research/images", title: "Images and figures" },
];

const subscribeWide = (cb: () => void) => {
  const m = window.matchMedia("(min-width: 768px)");
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
/** True from md up; false on the server and on phones, whose short placeholder is the safe default. */
const useWide = () => useSyncExternalStore(subscribeWide, () => window.matchMedia("(min-width: 768px)").matches, () => false);

/**
 * The library's one search: "All Content", the field and a gold Search
 * button in a navy bar whose hairline turns gold while you type, like the
 * footer's email bar. It lives in the tool bar on every page and goes to
 * /research/search. On phones the type menu folds away and the button keeps
 * only its icon.
 */
export function SearchBar({ defaultValue = "", defaultType = "", id }: { defaultValue?: string; defaultType?: string; id: string }) {
  const wide = useWide();
  return (
    <form role="search" action="/research/search" className="flex h-12 w-full items-stretch rounded-2xl bg-bdnavy-900 p-1 ring-1 ring-white/15 transition-shadow focus-within:ring-2 focus-within:ring-signal-orange">
      <label htmlFor={`${id}-type`} className="sr-only">Content type</label>
      <span className="relative hidden shrink-0 md:block">
        <select
          id={`${id}-type`}
          name="type"
          defaultValue={defaultType}
          className="h-full appearance-none rounded-xl bg-transparent pr-9 pl-3.5 text-sm font-semibold text-white transition-colors hover:text-signal-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-signal-orange [&>option]:bg-bdnavy-900"
        >
          {CONTENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <Icon name="expand_more" className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-xl text-signal-orange" />
      </span>
      <span aria-hidden className="my-1.5 hidden w-px bg-white/15 md:block" />
      <label htmlFor={id} className="sr-only">Search Genius</label>
      <input
        id={id}
        name="q"
        type="search"
        defaultValue={defaultValue}
        maxLength={200}
        placeholder={wide ? "Search theses, papers, projects and ideas" : "Search"}
        className="min-w-0 flex-1 bg-transparent px-3 text-base text-white placeholder:text-white/65 focus:outline-none md:px-4"
      />
      <button type="submit" aria-label="Search" className={cn(btn.gold, "min-h-0 shrink-0 px-3 py-0 md:px-5")}>
        <Icon name="search" className="text-xl" /> <span aria-hidden className="hidden md:inline">Search</span>
      </button>
    </form>
  );
}

/** The bar's search, holding the current query on the results page. */
function BarSearch() {
  const p = useSearchParams();
  const onResults = usePathname() === "/research/search";
  const q = onResults ? (p.get("q") ?? "") : "";
  const type = onResults ? (p.get("type") ?? "") : "";
  return <SearchBar id="bar-q" defaultValue={q} defaultType={type} key={`${q}|${type}`} />;
}

/** A tool-bar link in the header's tab style: gold icon, white label, a gold bar on the bar's bottom edge under the current one. */
const TAB = "relative flex h-11 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold whitespace-nowrap text-white/80 transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none";
const ON = "text-white after:absolute after:inset-x-2.5 after:-bottom-2.5 after:h-0.5 after:rounded-full after:bg-signal-orange";

function BrowseMenu() {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const pathname = usePathname();
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, close, box);
  const on = BROWSE.some((b) => pathname.startsWith(b.href));
  const advanced = pathname.startsWith("/research/advanced-search");
  return (
    <div ref={box} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls={menuId} className={cn(TAB, (on || open) && ON)}>
        <Icon name="travel_explore" className="text-xl text-signal-orange" /> <span className="sr-only md:not-sr-only">Browse</span>
        <Icon name="expand_more" className={cn("text-xl transition-transform duration-300 motion-reduce:transition-none", open && "rotate-180")} />
      </button>
      {open && (
        <ul id={menuId} className={cn(MENU, "top-full left-0 w-72 max-w-[calc(100vw-2rem)]")}>
          {BROWSE.map((b) => (
            <li key={b.href}>
              <Link href={b.href} onClick={close} aria-current={pathname.startsWith(b.href) ? "page" : undefined} className={cn(MENU_ITEM, "flex-col gap-0.5 aria-[current=page]:text-signal-orange")}>
                <span className="font-semibold">{b.title}</span>
                {b.sub && <span className="text-white/65">{b.sub}</span>}
              </Link>
            </li>
          ))}
          {/* Below lg the bar has no room for its own Advanced Search tab. */}
          <li className="border-t border-white/12 lg:hidden">
            <Link href="/research/advanced-search" onClick={close} aria-current={advanced ? "page" : undefined} className={cn(MENU_ITEM, "items-center font-semibold aria-[current=page]:text-signal-orange")}>
              <Icon name="manage_search" className="text-xl text-signal-orange" /> Advanced Search
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
}

/**
 * The library's tool bar, pinned under the site header so it never scrolls
 * away: the animated Genius logo (home), Browse and Advanced Search, and
 * the search on the right. One 64px row at every width (the sticky offsets
 * in globals.css count on it); the header's second row already carries
 * Research, Subjects, Collections, Workspace and Upload, so the bar holds
 * only what the header lacks.
 */
function ToolBar() {
  const pathname = usePathname();
  const home = pathname === "/research";
  const advanced = pathname.startsWith("/research/advanced-search");
  return (
    <div className="sticky top-header z-30 border-b border-white/12 bg-black lg:top-header-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-gutter-x sm:gap-3">
        <Link href="/research" aria-label="Genius home" aria-current={home ? "page" : undefined} className="shrink-0 rounded-lg p-1 transition-transform duration-300 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none motion-reduce:transition-none">
          <GeniusLogo priority className="h-7 sm:h-9" />
        </Link>
        <span aria-hidden className="hidden h-7 w-px bg-white/15 sm:block" />
        <nav aria-label="Library" className="flex shrink-0 items-center gap-1">
          <BrowseMenu />
          <Link href="/research/advanced-search" aria-current={advanced ? "page" : undefined} className={cn(TAB, "hidden lg:flex", advanced && ON)}>
            <Icon name="manage_search" className="text-xl text-signal-orange" /> Advanced Search
          </Link>
        </nav>
        <div className="ml-auto min-w-0 flex-1 lg:max-w-2xl">
          <Suspense fallback={<SearchBar id="bar-q" />}>
            <BarSearch />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

/** The library's frame: the slim tool bar over the page. The site footer closes it (app/research/layout.tsx). */
export function ResearchShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolBar />
      <div className="min-h-[60vh]">{children}</div>
    </>
  );
}
