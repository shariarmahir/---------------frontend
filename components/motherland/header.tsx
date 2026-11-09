"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { TOPICS, TOPIC_PAGES, type TopicId } from "@/data/motherland";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import { BrushWord } from "./brush-word";
import { Logo } from "./logo";

/** The utility bar's links: the rest of Kandari-Lab, one step away. নাগরিক দায়িত্ব is "Civic Duty" in English. */
const UTILITY = [
  { label: "Kandari Lab", href: "/", icon: "home" },
  { label: "Civic Duty", href: "/nagorik", icon: "verified_user" },
  { label: "Research", href: "/research", icon: "local_library" },
];
const RESEARCH = UTILITY[2];
const SIGN_IN = { label: "Sign up or log in", href: "/login?next=/bangladesh" };

/** "Research" holds a second once its letters are in, then the Genius mark holds a second, and round again (Mahir, 2026-11-07). */
const RESEARCH_TURN = 2000;
const GENIUS_TURN = 1600;

/** Research, in the research segment's blue, taking turns with that segment's own mark, Genius. */
function ResearchMark() {
  const reduced = useReducedMotion();
  const [genius, setGenius] = useState(false);
  const [round, setRound] = useState(0);

  useEffect(() => {
    if (reduced) return;
    let timer = 0;
    const turn = (toGenius: boolean) => {
      timer = window.setTimeout(
        () => {
          setGenius(toGenius);
          if (!toGenius) setRound((r) => r + 1);
          turn(!toGenius);
        },
        toGenius ? RESEARCH_TURN : GENIUS_TURN,
      );
    };
    turn(true);
    return () => window.clearTimeout(timer);
  }, [reduced]);

  return (
    <span aria-hidden className="grid items-center">
      <span className={cn("transition-opacity duration-200 [grid-area:1/1]", genius ? "opacity-0" : "opacity-100")}>
        <BrushWord key={round} text={RESEARCH.label} className="text-ml-genius [--ml-brush-rim:white]" />
      </span>
      {genius && (
        // eslint-disable-next-line @next/next/no-img-element -- a small still mark; the image optimiser adds nothing here
        <img src="/research/genius-still.png" alt="" width={600} height={219} className="ml-logo-zoom ml-genius-edge h-[1.2rem] w-auto [--i:0] [--ml-zoom-length:0.55s] [--ml-zoom-start:0ms] [grid-area:1/1]" />
      )}
    </span>
  );
}

/** The way to BD Guide, the government guide: a button beside the sign-in button. */
const GOV = { label: "Gov", href: "/bangladesh/government" };

/** The topic whose section crosses the middle of the screen. */
function useCurrentTopic() {
  const [current, setCurrent] = useState<TopicId | null>(null);
  useEffect(() => {
    const sections = TOPICS.map((t) => document.getElementById(t.id)).filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const id = e.target.id as TopicId;
          setCurrent((c) => (e.isIntersecting ? id : c === id ? null : c));
        }
      },
      { rootMargin: "-45% 0px -54% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);
  return current;
}

/**
 * MOTHERLAND's own header, in place of the site's: a slim utility bar over
 * the main bar, see-through over the film and solid white once the page
 * moves. From xl the topics sit in the bar, each one opening its own page, and
 * the one in view or being read is underlined; below xl they open from the
 * menu button.
 */
export function MotherlandHeader({ topic, solid: alwaysSolid }: { /** On a category page, the category: its tab is marked and the tabs go to pages. */ topic?: TopicId; /** For a page with no dark opening: white from the start. */ solid?: boolean }) {
  const onLanding = usePathname() === "/bangladesh";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const inView = useCurrentTopic();
  const current = topic ?? inView;
  const menuButton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const solid = alwaysSolid || !onLanding || scrolled || open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.style.overflow = "hidden";
    panel.current?.querySelector("a")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const button = menuButton.current;
    return () => {
      root.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      button?.focus();
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-colors duration-300 print:hidden", solid ? "text-ml-ink" : "text-white")}>
      <a
        href="#main"
        className="sr-only rounded-full bg-signal-orange px-5 py-2 font-semibold text-ml-ink focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-10"
      >
        Skip to content
      </a>

      <div className={cn("hidden h-9 text-white transition-colors duration-300 lg:block", solid ? "bg-ml-ink" : "bg-black/30 backdrop-blur-sm")}>
        <nav aria-label="Kandari-Lab" className="flex h-full items-stretch justify-end px-6 text-sm font-semibold">
          <ul className="flex items-center gap-7 pr-2 text-[0.95rem]">
            {UTILITY.map((l) => (
              <li key={l.href}>
                <Link href={l.href} aria-label={l.label} className="block rounded-sm transition-transform duration-200 hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                  {l === RESEARCH ? <ResearchMark /> : <BrushWord text={l.label} loop className="text-ml-yellow" />}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div
        className={cn(
          "transition-[background-color,box-shadow] duration-300",
          solid ? "bg-white shadow-[0_1px_0_rgb(15_42_32/0.1)]" : "bg-linear-to-b from-black/45 to-transparent",
        )}
      >
        <div className="flex h-16 items-center gap-6 px-5 lg:h-22 lg:px-6 xl:max-2xl:gap-3">
          <Link
            href={onLanding ? "#top" : "/bangladesh"}
            onClick={close}
            aria-label="MotherLand home"
            className={cn("shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current lg:ml-5", solid ? "text-ml-navy [--ml-logo-dot:var(--color-ml-yellow)] [--ml-logo-mother:var(--color-ml-flag)] [--ml-logo-rim-width:56px] [--ml-logo-rim:var(--color-signal-orange)]" : "text-white")}
          >
            <Logo loop className="w-[9rem] [--ml-wave-zoom:1.3] lg:w-[12rem]" />
          </Link>

          <nav aria-label="Topics" className="hidden flex-1 xl:block">
            <ul className="flex items-center justify-center 2xl:gap-2">
              {TOPICS.map((t) => (
                <li key={t.id}>
                  <Link
                    href={TOPIC_PAGES[t.id]}
                    aria-current={topic === t.id ? "page" : undefined}
                    className="group relative block rounded-sm px-1 py-2 text-[0.82rem] font-semibold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-current 2xl:px-2.5 2xl:text-[0.95rem]"
                  >
                    {t.tab}
                    <span
                      aria-hidden
                      className={cn(
                        "absolute inset-x-2 -bottom-0.5 h-0.75 origin-left rounded-full bg-signal-orange transition-transform duration-300 group-hover:scale-x-100 motion-reduce:transition-none",
                        current === t.id ? "scale-x-100" : "scale-x-0",
                      )}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <Link
              href={GOV.href}
              title="Government guide"
              className={cn(
                "hidden min-h-11 shrink-0 items-center justify-center gap-2 rounded-full px-5 font-semibold whitespace-nowrap ring-2 transition-colors duration-300 ring-inset focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current sm:inline-flex xl:max-2xl:size-11 xl:max-2xl:px-0",
                solid ? "text-ml-green ring-ml-green hover:bg-ml-green hover:text-white" : "ring-white hover:bg-white hover:text-ml-ink",
              )}
            >
              <Icon name="account_balance" className="text-lg" />
              <span className="xl:max-2xl:sr-only">{GOV.label}</span>
            </Link>
            <Link
              href={SIGN_IN.href}
              onClick={close}
              title={SIGN_IN.label}
              className="grid size-11 shrink-0 place-items-center rounded-full bg-ml-yellow text-ml-navy transition-colors duration-300 hover:bg-signal-orange focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
            >
              {/* A solid figure: the icon font is loaded outline-only. */}
              <svg aria-hidden viewBox="0 0 24 24" className="size-6" fill="currentColor">
                <circle cx="12" cy="7.5" r="4.5" />
                <path d="M3.5 21c0-4.4 3.8-7.5 8.5-7.5s8.5 3.1 8.5 7.5c0 .6-.4 1-1 1h-15c-.6 0-1-.4-1-1Z" />
              </svg>
              <span className="sr-only">{SIGN_IN.label}</span>
            </Link>
            <button
              ref={menuButton}
              type="button"
              aria-expanded={open}
              aria-controls="ml-menu"
              onClick={() => setOpen((o) => !o)}
              className="grid size-11 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-current xl:hidden"
            >
              <Icon name={open ? "close" : "menu"} className="text-3xl" />
              <span className="sr-only">{open ? "Close the menu" : "Open the menu"}</span>
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div
          id="ml-menu"
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-x-0 top-16 bottom-0 overflow-y-auto bg-white px-6 pt-4 pb-10 lg:top-31 xl:hidden"
        >
          <ul className="grid gap-1 sm:grid-cols-2">
            {TOPICS.map((t) => (
              <li key={t.id}>
                <Link href={TOPIC_PAGES[t.id]} onClick={close} aria-current={topic === t.id ? "page" : undefined} className="block border-b border-ml-ink/10 py-3 font-ml-sans font-extrabold text-3xl hover:text-ml-green">
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={onLanding ? "#join" : "/bangladesh#join"} onClick={close} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-signal-orange px-7 font-semibold text-ml-ink">
              <Icon name="bolt" className="text-lg" />
              Join with us
            </a>
            <Link href={GOV.href} className="inline-flex min-h-12 items-center gap-2 rounded-full px-7 font-semibold text-ml-green ring-2 ring-ml-green ring-inset">
              <Icon name="account_balance" className="text-lg" />
              Government guide
            </Link>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold lg:hidden">
            {[...UTILITY, { label: SIGN_IN.label, href: SIGN_IN.href, icon: "login" }].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="flex items-center gap-1.5 hover:text-ml-green">
                  <Icon name={l.icon} className="text-base" />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
