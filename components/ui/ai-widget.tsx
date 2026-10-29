"use client";

import { useEffect, useRef, useState } from "react";
import { GuideAvatar } from "@/components/ui/guide-avatar";
import { Icon } from "@/components/ui/icon";
import { btn } from "@/components/ui/section-kit";
import { cn } from "@/lib/utils";

/** Starter prompts, so the empty panel is not a blank box. */
const SUGGESTIONS = [
  "আজ ঢাকার বাতাস কেমন?",
  "বাংলাদেশের বৈদেশিক ঋণ কত?",
  "কোন খাতে সবচেয়ে বেশি ক্ষতি হচ্ছে?",
];

/** What the guide says when he wakes: a hello, then what he can help with (spoken word by word). */
const HELLO = "হ্যালো! কাণ্ডারী-ল্যাবে স্বাগতম।";
const HELP = "আমি এই সাইটের গাইড। আমাদের পণ্য, গবেষণা, নাগরিক অধিকার বা কোনো অভিযোগ জানানো, যা জানতে চান জিজ্ঞেস করুন।";
const HELP_WORDS = HELP.split(" ");
/** How fast he speaks, one word at a time. */
const WORD_MS = 110;
/** How long he stays awake after the pointer leaves, and after a tap on a touch screen. */
const DOZE_MS = 600;
const TOUCH_AWAKE_MS = 9000;

/**
 * Floating AI assistant for the home screen.
 *
 * Split out of the old combined search bar: the navbar now carries only
 * "আজকের বাংলাদেশ" as a destination, and asking a question happens here, in
 * a panel with room for suggestions and answers rather than a 200px input.
 *
 * Its launcher is the site guide (Mahir, 2026-10-29), a young man drawn full
 * length (guide-avatar.tsx) asleep in the corner, half of him below the
 * screen's edge. Pointed at or focused he stands up, waves and says hello in
 * a speech bubble, word by word with his mouth moving, then what he can help
 * with; his eyes and head follow the pointer while he is up. A click opens
 * the question panel. On a touch screen the first tap wakes him and the
 * bubble's button opens the panel; he sits back down a little after the
 * pointer leaves or a tap elsewhere. A speaking voice comes later; the
 * bubble is his voice for now.
 *
 * No backend yet: submitting says so in the panel (and to screen readers).
 * TODO(backend): POST /api/v1/ask once FastAPI lands.
 */
export function AiWidget() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const [asked, setAsked] = useState(false);
  const [awake, setAwake] = useState(false);
  // How many words of HELP he has said; the whole sentence under reduced motion.
  const [said, setSaid] = useState(0);
  const doze = useRef(0);
  const lastPointer = useRef("mouse");
  const speaking = awake && !open;
  const talking = speaking && said < HELP_WORDS.length;

  const wake = (stayFor?: number) => {
    window.clearTimeout(doze.current);
    setAwake(true);
    if (stayFor) doze.current = window.setTimeout(() => setAwake(false), stayFor);
  };
  const sleepSoon = () => {
    window.clearTimeout(doze.current);
    doze.current = window.setTimeout(() => setAwake(false), DOZE_MS);
  };

  // He speaks word by word each time the bubble appears.
  useEffect(() => {
    if (!speaking) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let n = reduce ? HELP_WORDS.length - 1 : 0;
    const id = window.setInterval(() => {
      n += 1;
      setSaid(n);
      if (n >= HELP_WORDS.length) window.clearInterval(id);
    }, reduce ? 0 : WORD_MS);
    return () => {
      window.clearInterval(id);
      setSaid(0);
    };
  }, [speaking]);

  // A tap or click anywhere else, or Escape, sends him back to sleep.
  useEffect(() => {
    if (!awake || open) return;
    const onDown = (e: PointerEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) setAwake(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAwake(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [awake, open]);
  useEffect(() => () => window.clearTimeout(doze.current), []);

  // While he is up, his eyes (and a little of his head) turn toward the pointer.
  useEffect(() => {
    const el = launcherRef.current;
    if (!el) return;
    if (!(awake || open) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.removeProperty("--px");
      el.style.removeProperty("--py");
      el.style.removeProperty("--tilt");
      return;
    }
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height * 0.19);
        const d = Math.max(1, Math.hypot(dx, dy));
        el.style.setProperty("--px", ((dx / d) * 1.5).toFixed(2));
        el.style.setProperty("--py", ((dy / d) * 1.1).toFixed(2));
        el.style.setProperty("--tilt", `${(Math.max(-1, Math.min(1, dx / 400)) * 6).toFixed(1)}deg`);
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [awake, open]);

  /** Close; from the keyboard or the × button focus goes back to the launcher, so nobody loses their place. */
  const close = (refocus: boolean) => {
    setOpen(false);
    setAsked(false);
    if (refocus) launcherRef.current?.focus();
  };

  // Focus the field when the panel opens, and restore Escape-to-close.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      // Only while focus is in the widget: Escape in another dialog is that dialog's.
      if (e.key === "Escape" && panelRef.current?.contains(document.activeElement)) {
        setOpen(false);
        setAsked(false);
        launcherRef.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setAsked(false);
      }
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
      className="fixed right-[calc(1rem+env(safe-area-inset-right))] flex flex-col items-end bottom-[env(safe-area-inset-bottom)] z-30 lg:right-6"
    >
      {/* Panel. */}
      <div
        id="ai-widget-panel"
        role="dialog"
        aria-label="সাইট গাইড — জাতীয় তথ্য সহায়ক"
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
            <span className="font-bengali">সাইট গাইড</span>
          </span>
          <button
            type="button"
            onClick={() => close(true)}
            aria-label="Close the site guide"
            className="-mr-2 flex size-11 items-center justify-center rounded-full text-white/65 lg:mr-0 lg:size-7 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
          >
            <Icon name="close" className="text-base" />
          </button>
        </div>

        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            if (query.trim()) setAsked(true);
          }}
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
              onChange={(e) => {
                setQuery(e.target.value);
                setAsked(false);
              }}
              placeholder="জাতীয় তথ্য জিজ্ঞাসা করুন…"
              className={cn(
                // Below lg: 48px field, 44px submit and suggestion rows, for thumbs.
                "h-12 w-full rounded-lg bg-white/6 pr-13 pl-space-sm ring-1 ring-white/15 lg:h-10 lg:pr-10",
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

          {/* No answering service yet (see above): say so rather than do nothing. */}
          <p role="status" className="font-bengali text-body-sm text-white/80 empty:hidden">
            {asked ? "উত্তর দেওয়ার ব্যবস্থা শিগগিরই চালু হচ্ছে। আপাতত প্রশ্নটি এখানে থাকল।" : ""}
          </p>
          <span className="font-label-sm text-label-sm text-white/65">
            জিজ্ঞাসার উদাহরণ
          </span>
          <div className="flex flex-col gap-1">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setQuery(s);
                  setAsked(false);
                }}
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

      {/* The guide's greeting: a speech bubble over his shoulder while he is awake and the panel is shut. */}
      <div
        aria-hidden={!speaking}
        onPointerEnter={(e) => e.pointerType === "mouse" && wake()}
        onPointerLeave={(e) => e.pointerType === "mouse" && sleepSoon()}
        className={cn(
          "absolute right-0 bottom-full mb-3 w-[min(19rem,calc(100vw-2rem))] rounded-2xl rounded-br-md bg-white p-4 text-bdnavy-900 shadow-[0_18px_40px_-18px_rgb(0_0_0/0.7)] ring-1 ring-bdnavy-900/10",
          "origin-bottom-right transition-[opacity,scale,translate] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          speaking ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-2 scale-95 opacity-0",
        )}
      >
        <p className="font-bengali text-base leading-snug font-bold">{HELLO}</p>
        {/* Spoken word by word; screen readers get the whole sentence through the launcher's description. */}
        <p aria-hidden className="mt-1.5 min-h-[4.5em] font-bengali text-sm leading-relaxed text-bdnavy-900/80">
          {HELP_WORDS.map((w, i) => (
            <span key={i} className={cn("transition-opacity duration-200", i < said ? "opacity-100" : "opacity-0")}>
              {w}{" "}
            </span>
          ))}
        </p>
        <button
          type="button"
          tabIndex={speaking ? 0 : -1}
          onClick={() => setOpen(true)}
          className={cn(btn.gold, "mt-3 min-h-10 px-4 py-2 font-bengali text-sm")}
        >
          <Icon name="forum" className="text-lg" />
          প্রশ্ন করুন
        </button>
        {/* The bubble's tail, pointing at him. */}
        <span aria-hidden className="absolute right-10 -bottom-1.5 size-3 rotate-45 bg-white sm:right-12" />
      </div>

      {/* Launcher: the guide himself. */}
      <p id="guide-says" className="sr-only">
        {HELLO} {HELP}
      </p>
      <button
        ref={launcherRef}
        type="button"
        onPointerDown={(e) => (lastPointer.current = e.pointerType)}
        onPointerEnter={(e) => e.pointerType === "mouse" && wake()}
        onPointerLeave={(e) => e.pointerType === "mouse" && sleepSoon()}
        onFocus={() => wake()}
        onBlur={(e) => !panelRef.current?.contains(e.relatedTarget) && sleepSoon()}
        onClick={() => {
          // On a touch screen the first tap wakes him; the bubble's button (or a second tap) opens the panel.
          if (lastPointer.current !== "mouse" && !awake && !open) return wake(TOUCH_AWAKE_MS);
          if (open) close(false);
          else setOpen(true);
        }}
        aria-expanded={open}
        aria-controls="ai-widget-panel"
        aria-describedby="guide-says"
        aria-label={open ? "Close the site guide" : "Site guide: ask a question"}
        // Asleep, half of him is below the screen's edge; awake he stands up into full view.
        className={cn(
          "relative ml-auto block w-22 rounded-2xl transition-[translate] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none motion-reduce:transition-none sm:w-28",
          awake || open ? "translate-y-0" : "translate-y-[50%]",
        )}
      >
        <GuideAvatar awake={awake || open} talking={talking} waving={talking} />
      </button>
    </div>
  );
}
