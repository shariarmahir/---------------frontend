"use client";

import Link from "next/link";
import { Activity, Brain, Briefcase, Calculator, ChefHat, Dumbbell, Hand, HandHeart, Heart, HelpCircle, House, Laptop, Palette, Sparkles, Store, Wrench, type LucideIcon } from "lucide-react";
import { academies } from "@/data/media/academy";
import type { Goal, Like, Talent } from "@/lib/media/academy";
import { GOALS, LIKES, TALENTS, type FinderAnswers } from "@/lib/media/journey";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { Num } from "../../ui/numerals";
import { AssetCard, AssetGrid, actionClass, frameClass } from "../catalogue/asset-card";
import { toneStyle } from "../catalogue/tones";
import { academyFit } from "../finder/facts";
import { updateAcademy, useAcademy } from "../use-academy";

const GOAL_ICON: Record<Goal, LucideIcon> = { job: Briefcase, business: Store, home: House, joy: Heart };
const LIKE_ICON: Record<Like, LucideIcon> = { machines: Wrench, computers: Laptop, art: Palette, food: ChefHat, people: HandHeart, body: Dumbbell, numbers: Calculator };
const TALENT_ICON: Record<Talent, LucideIcon> = { hands: Hand, mind: Brain, art: Sparkles, body: Activity };

const EMPTY: FinderAnswers = {};

interface Question<K extends string> {
  key: keyof FinderAnswers;
  title: string;
  hint: string;
  options: Record<K, string>;
  icons: Record<K, LucideIcon>;
  tone: number;
}

const QUESTIONS = [
  { key: "goal", title: "আপনার স্বপ্ন কী?", hint: "যেটা মনে আসে, সেটাই — ভুল বলে কিছু নেই।", options: GOALS, icons: GOAL_ICON, tone: 0 } satisfies Question<Goal>,
  { key: "like", title: "কী নিয়ে কাজ করতে ভালো লাগে?", hint: "যে কাজে সময় কোথা দিয়ে যায়, টের পান না।", options: LIKES, icons: LIKE_ICON, tone: 3 } satisfies Question<Like>,
  { key: "talent", title: "আপনার প্রতিভা কোথায়?", hint: "লোকে আপনাকে কীসের জন্য ডাকে?", options: TALENTS, icons: TALENT_ICON, tone: 4 } satisfies Question<Talent>,
] as Question<string>[];

/**
 * The three questions as three cards: the frame shows the answer picked (or
 * a question mark), the options sit under the question, and the button goes
 * to the academies, which put the best-suited first once there are answers. Picking an answer
 * again takes it back. Kept on this device for the academy's other pages.
 */
export function FinderCards() {
  const hydrated = useHydrated();
  const saved = useAcademy((a) => a.finder ?? EMPTY);
  const answers = hydrated ? saved : EMPTY;
  const answered = Object.keys(answers).length > 0;
  const matched = academies.filter((a) => academyFit(a, answers) > 0).length;

  const pick = (key: keyof FinderAnswers, value: string) =>
    updateAcademy((a) => {
      const next: Record<string, string> = { ...(a.finder ?? {}) };
      if (next[key] === value) delete next[key];
      else next[key] = value;
      return { ...a, finder: next as FinderAnswers };
    });

  return (
    <AssetGrid count={QUESTIONS.length}>
      {QUESTIONS.map((q, i) => {
        const chosen = answers[q.key] as string | undefined;
        const Chosen = chosen ? q.icons[chosen] : null;
        return (
          <li key={q.key} className="bg-(--c-bg)">
            <AssetCard
              kind={{ icon: HelpCircle, label: "প্রশ্ন" }}
              n={i + 1}
              style={toneStyle(q.tone)}
              className="tone"
              frame={
                <div className={frameClass} aria-live="polite">
                  {Chosen && chosen ? (
                    <span className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                      <span className="grid size-20 place-items-center rounded-[1.4rem] bg-(--c-app) text-black drop-shadow-[0_6px_14px_rgba(0,0,0,0.28)] transition-transform duration-500 group-hover/frame:scale-[1.04]">
                        <Chosen className="size-10" strokeWidth={1.75} aria-hidden />
                      </span>
                      <span className="display text-2xl text-(--c-ink-strong)">{q.options[chosen]}</span>
                    </span>
                  ) : (
                    <span className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <span aria-hidden className="turn text-8xl leading-none">?</span>
                      <span className="hud text-(--c-faint)">এখনো বাছেননি</span>
                    </span>
                  )}
                </div>
              }
              title={q.title}
              text={q.hint}
              extra={
                <ul className="mt-4 flex flex-wrap gap-1.5" aria-label={q.title}>
                  {Object.entries(q.options).map(([k, label]) => {
                    const Icon = q.icons[k];
                    const on = chosen === k;
                    return (
                      <li key={k}>
                        <button
                          type="button"
                          aria-pressed={on}
                          onClick={() => pick(q.key, k)}
                          className={cn(
                            "inline-flex items-center gap-1.5 border px-2.5 py-1.5 text-sm transition-colors duration-150",
                            on ? "border-transparent bg-(--c-app) font-semibold text-black" : "border-(--c-line) text-(--c-muted) hover:border-transparent hover:bg-(--c-invert-bg) hover:text-(--c-invert-fg)",
                          )}
                        >
                          <Icon className="size-3.5" aria-hidden />
                          {label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              }
              action={
                <Link href="/media/academy/academies" className={actionClass}>
                  {answered ? "মিলে যাওয়া একাডেমি" : "সব একাডেমি দেখুন"}
                  <span className="font-normal opacity-60">{answered ? <><Num value={matched} />টি মিলেছে</> : <><Num value={academies.length} />টি</>}</span>
                </Link>
              }
            />
          </li>
        );
      })}
    </AssetGrid>
  );
}
