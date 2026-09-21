"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
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
    // today, but an explicit rung keeps the stack unambiguous.
    <div
      ref={panelRef}
      className="fixed right-4 bottom-4 z-30 lg:right-6 lg:bottom-6"
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
          "border border-border bg-white shadow-xl",
          "animate-nav-card-in",
        )}
      >
        <div className="flex items-center justify-between gap-space-sm border-b border-border bg-linear-to-r from-emerald-50 to-orange-50 px-space-md py-space-sm">
          <span className="flex items-center gap-space-xs font-display text-label-md font-bold text-primary">
            <Icon name="auto_awesome" className="text-[18px] text-title" />
            AI Ask
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close AI Ask"
            className="flex size-7 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-white hover:text-slate-900"
          >
            <Icon name="close" className="text-[16px]" />
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
                "h-10 w-full rounded-lg border border-border bg-slate-50 pr-10 pl-space-sm",
                "font-sans text-body-sm text-slate-900 transition-all outline-none",
                "placeholder:text-slate-500",
                "focus:border-primary focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,103,71,0.12)]",
              )}
            />
            <button
              type="submit"
              aria-label="Ask"
              className="absolute right-1 flex size-8 items-center justify-center rounded-lg bg-primary text-white transition-colors hover:bg-emerald-800"
            >
              <Icon name="search" className="text-[16px]" />
            </button>
          </div>

          <span className="font-label-sm text-label-sm text-slate-500">
            জিজ্ঞাসার উদাহরণ
          </span>
          <div className="flex flex-col gap-1">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setQuery(s)}
                className={cn(
                  "rounded-lg border border-border bg-white px-space-sm py-1.5 text-left",
                  "font-sans text-body-sm text-slate-600 transition-colors",
                  "hover:border-primary/40 hover:bg-emerald-50 hover:text-primary",
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
        className={cn(
          "group ml-auto flex items-center gap-space-xs rounded-full bg-primary",
          "px-space-md py-space-sm font-display text-label-md font-bold text-white",
          "shadow-lg transition-all duration-300",
          "hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-xl active:scale-95",
          "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none",
        )}
      >
        <Icon
          name={open ? "close" : "search"}
          className="text-[18px] transition-transform duration-300 group-hover:scale-110"
        />
        <span className="hidden sm:inline">AI Ask</span>
      </button>
    </div>
  );
}
