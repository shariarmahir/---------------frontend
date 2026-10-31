"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { TOPICS, type TopicId } from "@/data/motherland";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

/** The utility bar's links: the rest of Kandari-Lab, one step away. */
const UTILITY = [
  { label: "Kandari-Lab", href: "/", icon: "home" },
  { label: "নাগরিক দায়িত্ব", href: "/nagorik", icon: "verified_user" },
  { label: "Research", href: "/research", icon: "local_library" },
];

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
 * moves. From xl the eleven topics sit in the bar and the one in view is
 * underlined; below xl they open from the menu button.
 */
export function MotherlandHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const current = useCurrentTopic();
  const menuButton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const solid = scrolled || open;

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
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-colors duration-300", solid ? "text-ml-ink" : "text-white")}>
      <a
        href="#main"
        className="sr-only rounded-full bg-signal-orange px-5 py-2 font-semibold text-ml-ink focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-10"
      >
        Skip to content
      </a>

      <div className={cn("hidden h-9 text-white transition-colors duration-300 lg:block", solid ? "bg-ml-ink" : "bg-black/30 backdrop-blur-sm")}>
        <nav aria-label="Kandari-Lab" className="flex h-full items-stretch justify-end px-6 text-sm font-semibold">
          <ul className="flex items-center gap-6 pr-6">
            {UTILITY.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="flex items-center gap-1.5 rounded-sm hover:text-signal-orange focus-visible:outline-2 focus-visible:outline-white">
                  <Icon name={l.icon} className="text-base" />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/login?next=/bangladesh"
            className="flex items-center gap-1.5 border-l border-white/25 pl-5 hover:text-signal-orange focus-visible:outline-2 focus-visible:outline-white"
          >
            Sign in
            <Icon name="chevron_right" className="text-lg" />
          </Link>
        </nav>
      </div>

      <div
        className={cn(
          "transition-[background-color,box-shadow] duration-300",
          solid ? "bg-white shadow-[0_1px_0_rgb(15_42_32/0.1)]" : "bg-linear-to-b from-black/45 to-transparent",
        )}
      >
        <div className="flex h-16 items-center gap-6 px-5 lg:h-22 lg:px-6">
          <Link
            href="#top"
            onClick={close}
            className={cn("shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current", solid && "text-ml-green")}
          >
            <Logo className="text-[0.85rem] lg:text-[1.05rem]" />
          </Link>

          <nav aria-label="Topics" className="hidden flex-1 xl:block">
            <ul className="flex items-center justify-center 2xl:gap-2">
              {TOPICS.map((t) => (
                <li key={t.id}>
                  <a
                    href={`#${t.id}`}
                    aria-current={current === t.id ? "true" : undefined}
                    className="group relative block rounded-sm px-2 py-2 text-[0.88rem] font-semibold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-current 2xl:px-2.5 2xl:text-[0.95rem]"
                  >
                    {t.tab}
                    <span
                      aria-hidden
                      className={cn(
                        "absolute inset-x-2 -bottom-0.5 h-0.75 origin-left rounded-full bg-signal-orange transition-transform duration-300 group-hover:scale-x-100 motion-reduce:transition-none",
                        current === t.id ? "scale-x-100" : "scale-x-0",
                      )}
                    />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <a
              href="#join"
              onClick={close}
              className={cn(
                "hidden min-h-11 items-center gap-2 rounded-full px-6 font-semibold transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current sm:inline-flex",
                solid ? "bg-ml-ink text-white hover:bg-ml-green" : "bg-ml-ground text-ml-ink hover:bg-signal-orange",
              )}
            >
              <Icon name="bolt" className="text-lg" />
              Join with us
            </a>
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
                <a href={`#${t.id}`} onClick={close} className="block border-b border-ml-ink/10 py-3 font-ml-display text-3xl uppercase hover:text-ml-green">
                  {t.name}
                </a>
              </li>
            ))}
          </ul>
          <a href="#join" onClick={close} className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-signal-orange px-7 font-semibold text-ml-ink">
            <Icon name="bolt" className="text-lg" />
            Join with us
          </a>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold lg:hidden">
            {[...UTILITY, { label: "Sign in", href: "/login?next=/bangladesh", icon: "login" }].map((l) => (
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
