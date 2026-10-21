"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { btn } from "@/components/ui/section-kit";
import { cn } from "@/lib/utils";

/** Starter prompts, so the empty panel is not a blank box. */
const SUGGESTIONS = [
  "আজ ঢাকার বাতাস কেমন?",
  "বাংলাদেশের বৈদেশিক ঋণ কত?",
  "কোন খাতে সবচেয়ে বেশি ক্ষতি হচ্ছে?",
];

/**
 * Floating AI assistant for the home screen.
 *
 * Split out of the old combined search bar: the navbar now carries only
 * "আজকের বাংলাদেশ" as a destination, and asking a question happens here, in
 * a panel with room for suggestions and answers rather than a 200px input.
 *
 * No backend yet — submitting is inert.
 * TODO(backend): POST /api/v1/ask once FastAPI lands.
 */
export function AiWidget() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus the field when the panel opens, and restore Escape-to-close.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) setOpen(false);
    };

    document.addEventListener("keydown", onKey);
    // Deferred so the opening click does not immediately close the panel.
    const t = window.setTimeout(
      () => document.addEventListener("click", onClick),
      0,
    );
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
      window.clearTimeout(t);
    };
  }, [open]);

  return (
    // z-30: below the header (z-40) and the Sheet overlay (z-50). The
    // launcher sits bottom-right and the header top, so they do not overlap
    // today, but an explicit rung keeps the stack unambiguous. Below lg it
    // keeps clear of the phone's home indicator and rounded corners.
    <div
      ref={panelRef}
      className="fixed right-[calc(1rem+env(safe-area-inset-right))] bottom-[calc(1rem+env(safe-area-inset-bottom))] z-30 lg:right-6 lg:bottom-6"
    >
      {/* Panel. */}
      <div
        id="ai-widget-panel"
        role="dialog"
        aria-label="AI Ask — জাতীয় তথ্য সহায়ক"
        aria-modal="false"
        hidden={!open}
        className={cn(
          "mb-space-sm w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl",
          "bg-bdnavy-900 text-white shadow-xl ring-1 ring-white/12",
          "animate-nav-card-in",
        )}
      >
        <div className="flex items-center justify-between gap-space-sm border-b border-white/10 px-space-md py-space-sm">
          <span className="flex items-center gap-space-xs font-display text-label-md font-bold text-signal-orange">
            <Icon name="auto_awesome" className="text-lg" />
            AI Ask
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close AI Ask"
            className="-mr-2 flex size-11 items-center justify-center rounded-full text-white/65 lg:mr-0 lg:size-7 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
          >
            <Icon name="close" className="text-base" />
          </button>
        </div>

        <form
          role="search"
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-col gap-space-sm p-space-md"
        >
          <label htmlFor="ai-widget-input" className="sr-only">
            জাতীয় তথ্য জিজ্ঞাসা করুন
          </label>
          <div className="relative flex items-center">
            <input
              id="ai-widget-input"
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="জাতীয় তথ্য জিজ্ঞাসা করুন…"
              className={cn(
                // Below lg: 48px field, 44px submit and suggestion rows, for thumbs.
                "h-12 w-full rounded-lg bg-white/[0.06] pr-13 pl-space-sm ring-1 ring-white/15 lg:h-10 lg:pr-10",
                "font-sans text-body-sm text-white transition-all outline-none",
                "placeholder:text-white/65",
                "focus:ring-2 focus:ring-signal-orange",
              )}
            />
            <button
              type="submit"
              aria-label="Ask"
              className="absolute right-0.5 flex size-11 items-center lg:right-1 lg:size-8 justify-center rounded-lg bg-signal-orange text-text-primary transition-colors hover:bg-signal-orange/85 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            >
              <Icon name="search" className="text-base" />
            </button>
          </div>

          <span className="font-label-sm text-label-sm text-white/65">
            জিজ্ঞাসার উদাহরণ
          </span>
          <div className="flex flex-col gap-1">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setQuery(s)}
                className={cn(
                  "min-h-11 rounded-lg px-space-sm py-1.5 text-left ring-1 ring-white/15 lg:min-h-0",
                  "font-sans text-body-sm text-white/80 transition-colors",
                  "hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Launcher. */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="ai-widget-panel"
        aria-label={open ? "Close AI Ask" : "Open AI Ask"}
        // The page's gold primary button; the ink ring keeps its edge when it floats over the gold footer.
        // Until the page column leaves a margin for it (from 115rem, ~1840px) a compact 52px round icon button, so it does not cover the content under it.
        className={cn(
          btn.gold,
          "group ml-auto flex ring-2 ring-text-primary focus-visible:ring-white focus-visible:ring-offset-black",
          "max-[115rem]:size-13 max-[115rem]:min-h-0 max-[115rem]:rounded-full max-[115rem]:p-0",
        )}
      >
        <Icon
          name={open ? "close" : "search"}
          className="text-lg transition-transform duration-300 group-hover:scale-110"
        />
        {/* Read by screen readers only below 115rem; the button's aria-label names it either way. */}
        <span className="sr-only min-[115rem]:not-sr-only">AI Ask</span>
      </button>
    </div>
  );
}
