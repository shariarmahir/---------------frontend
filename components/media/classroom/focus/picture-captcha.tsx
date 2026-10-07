"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Atom, Backpack, Bell, Book, Calculator, Check, FlaskConical, Globe, Lightbulb, Microscope, Palette, Pencil, RotateCw, Ruler, type LucideIcon } from "lucide-react";
import { ITEM_BN, makeCaptcha, solves, type Captcha, type CaptchaItem } from "@/lib/media/captcha";
import { cn } from "@/lib/utils";

const ICON: Record<CaptchaItem, LucideIcon> = {
  book: Book,
  pencil: Pencil,
  calculator: Calculator,
  microscope: Microscope,
  globe: Globe,
  flask: FlaskConical,
  ruler: Ruler,
  atom: Atom,
  bulb: Lightbulb,
  bell: Bell,
  backpack: Backpack,
  palette: Palette,
};

/**
 * Match the picture to come in: the gate's last step. A wrong tap shakes
 * and brings a new puzzle; the right one turns green and opens the door.
 * Disabled (with the reason) until the gate has what it needs.
 */
export function PictureCaptcha({ disabled, hint, opening = "ক্লাসরুম খুলছে…", onPass }: { disabled: boolean; hint?: string; opening?: string; onPass: () => void }) {
  const reduce = useReducedMotion();
  // The puzzle is made in the browser only: the gate's content is never server-rendered.
  const [puzzle, setPuzzle] = useState<Captcha>(() => makeCaptcha(Math.random));
  const [miss, setMiss] = useState(0);
  const [passed, setPassed] = useState<CaptchaItem | null>(null);
  const Target = ICON[puzzle.target];

  function pick(item: CaptchaItem) {
    if (disabled || passed) return;
    if (solves(puzzle, item)) {
      setPassed(item);
      window.setTimeout(onPass, reduce ? 150 : 550);
      return;
    }
    setMiss((m) => m + 1);
    setPuzzle(makeCaptcha(Math.random, puzzle.target));
  }

  return (
    <fieldset disabled={disabled} className="rounded-2xl bg-text-primary p-4 text-white disabled:opacity-60">
      <legend className="sr-only">ছবি মিলিয়ে ঢুকুন</legend>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold">ছবি মিলিয়ে ঢুকুন</p>
        <button
          type="button"
          onClick={() => {
            setMiss(0);
            setPuzzle(makeCaptcha(Math.random, puzzle.target));
          }}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <RotateCw className="size-3.5" aria-hidden /> নতুন ছবি
        </button>
      </div>

      <div className="mt-3 flex items-center justify-center gap-4 sm:gap-6">
        <div className="flex shrink-0 flex-col items-center gap-1.5">
          <span className="grid size-18 place-items-center rounded-2xl bg-signal-orange text-text-primary shadow-[0_12px_28px_-14px_var(--color-signal-orange)]">
            <Target className="size-10" strokeWidth={2} aria-hidden />
          </span>
          <span className="text-[11px] font-semibold text-white/70">এটা খুঁজুন</span>
        </div>

        <motion.div
          key={miss}
          role="group"
          aria-label={`${ITEM_BN[puzzle.target]} খুঁজুন`}
          animate={miss && !reduce ? { x: [0, -8, 8, -5, 5, 0] } : undefined}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-3 gap-2"
        >
          {puzzle.options.map(({ item, turn }) => {
            const Icon = ICON[item];
            const won = passed === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => pick(item)}
                aria-label={ITEM_BN[item]}
                className={cn(
                  "grid size-14 place-items-center rounded-xl ring-1 sm:size-16 transition-[background-color,box-shadow,scale] duration-200 active:scale-95 disabled:cursor-not-allowed",
                  won ? "bg-bd-green ring-bd-green" : "bg-white/6 ring-white/12 enabled:hover:bg-white/12 enabled:hover:ring-signal-orange/60",
                )}
              >
                {won ? <Check className="size-7 text-white" strokeWidth={3} aria-hidden /> : <Icon className="size-6 text-white sm:size-7" style={{ transform: `rotate(${turn}deg)` }} aria-hidden />}
              </button>
            );
          })}
        </motion.div>
      </div>

      <p aria-live="polite" className="mt-3 min-h-5 text-xs font-semibold">
        {passed ? (
          <span className="text-bdgreen-200">মিলেছে — {opening}</span>
        ) : disabled && hint ? (
          <span className="text-white/65">{hint}</span>
        ) : miss > 0 ? (
          <span className="text-signal-orange">মেলেনি — নতুন ছবি দিলাম, আবার চেষ্টা করুন।</span>
        ) : (
          <span className="text-white/65">বাঁ পাশের ছবির মতো একই ছবিতে চাপ দিন।</span>
        )}
      </p>
    </fieldset>
  );
}
