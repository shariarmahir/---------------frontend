"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  ArrowDown,
  Brain,
  Briefcase,
  Calculator,
  ChefHat,
  Dumbbell,
  Hand,
  HandHeart,
  Heart,
  House,
  Laptop,
  Palette,
  RotateCcw,
  Sparkles,
  Store,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { academies, courses, departments } from "@/data/media/academy";
import { SCHOOLS, type Goal, type Like, type School, type Talent } from "@/lib/media/academy";
import { GOALS, LIKES, TALENTS, type FinderAnswers } from "@/lib/media/journey";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { Num } from "../../ui/numerals";
import { EXPLORE_EVENT, type ExploreAsk } from "../shell/academy-header";
import { updateAcademy, useAcademy } from "../use-academy";
import { AcademyCard } from "./academy-card";
import { academyFit, factsOf } from "./facts";

const GOAL_ICON: Record<Goal, LucideIcon> = { job: Briefcase, business: Store, home: House, joy: Heart };
const LIKE_ICON: Record<Like, LucideIcon> = { machines: Wrench, computers: Laptop, art: Palette, food: ChefHat, people: HandHeart, body: Dumbbell, numbers: Calculator };
const TALENT_ICON: Record<Talent, LucideIcon> = { hands: Hand, mind: Brain, art: Sparkles, body: Activity };

const FACTS = new Map(academies.map((a) => [a.id, factsOf(a)]));
const SCHOOL_LIST = (Object.keys(SCHOOLS) as School[]).filter((s) => departments.some((d) => d.school === s));
const EMPTY: FinderAnswers = {};

/**
 * "একাডেমি খুঁজুন" — the academy's first view. A blue hero asks three easy
 * questions (the dream, what one likes, where one's talent lies), then the
 * academies follow, best match first, with a field filter. The answers are
 * kept on this device so the academy's own pages can speak to them.
 */
export function FinderView() {
  const reduce = useReducedMotion();
  const hydrated = useHydrated();
  const saved = useAcademy((a) => a.finder ?? EMPTY);
  const answers = hydrated ? saved : EMPTY;
  const [school, setSchool] = useState<School | null>(null);
  const answered = Object.keys(answers).length;

  // The header's "অন্বেষণ" menu can pick a field, or ask for every academy.
  useEffect(() => {
    const on = (e: Event) => {
      const ask = (e as CustomEvent<ExploreAsk>).detail;
      setSchool("school" in ask ? ask.school : null);
    };
    window.addEventListener(EXPLORE_EVENT, on);
    return () => window.removeEventListener(EXPLORE_EVENT, on);
  }, []);

  const set = <K extends keyof FinderAnswers>(k: K, v: FinderAnswers[K]) =>
    updateAcademy((a) => {
      const next = { ...(a.finder ?? {}) };
      if (next[k] === v) delete next[k];
      else next[k] = v;
      return { ...a, finder: next };
    });

  const ranked = useMemo(() => {
    const list = academies
      .filter((a) => !school || a.departments.some((d) => d.school === school))
      .map((a) => ({ a, f: FACTS.get(a.id)!, match: academyFit(a, answers) }));
    return list.sort((x, y) => y.match - x.match || y.f.graduates - x.f.graduates);
  }, [answers, school]);
  const matched = ranked.filter((r) => r.match > 0).length;

  return (
    <>
      {/* Hero: the promise on the left, the three questions on the right. */}
      <section aria-labelledby="finder-title" className="blue-band relative -mx-3 -mt-6 overflow-hidden sm:-mx-6">
        <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-m-yellow/15 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 pt-10 pb-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-12 lg:pt-14 lg:pb-16">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs font-bold text-white ring-1 ring-white/25">
              <span className="size-1.5 rounded-full bg-m-yellow" aria-hidden /> ধাপ ১ · একাডেমি খুঁজুন
            </p>
            <h1 id="finder-title" className="mt-4 text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.08] font-bold text-balance">
              আপনার স্বপ্নের <span className="text-m-yellow">একাডেমি</span> খুঁজুন
            </h1>
            <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-white/88">
              বিশ্ববিদ্যালয়ের মতোই — একাডেমি বাছুন, বিভাগ আর কোর্স বেছে ভর্তি হোন, রুটিনে ক্লাস করুন, পরীক্ষা দিয়ে সনদ নিন। শুধু চল্লিশ দিনে, দেশের পেশাদারদের হাতে-কলমে।
            </p>
            <dl className="mt-7 grid max-w-lg grid-cols-3 gap-3">
              {[
                [academies.length, "একাডেমি"],
                [departments.length, "বিভাগ"],
                [courses.length, "কোর্স"],
              ].map(([n, label]) => (
                <div key={label} className="flex flex-col-reverse rounded-2xl bg-white/10 px-3 py-3 ring-1 ring-white/20 backdrop-blur">
                  <dt className="mt-1 text-xs font-semibold text-white/75">{label}</dt>
                  <dd className="text-2xl leading-none font-bold sm:text-3xl">
                    <Num value={n as number} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-[1.8rem] bg-white p-5 text-m-ink shadow-[0_40px_80px_-30px_rgb(0_0_0/0.55)] sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">তিন প্রশ্নে আপনার একাডেমি</h2>
                <p className="mt-0.5 text-sm text-m-ink/60">যেটা মনে আসে সেটাই চাপুন — ভুল বলে কিছু নেই।</p>
              </div>
              {answered > 0 && (
                <button type="button" onClick={() => updateAcademy((a) => ({ ...a, finder: {} }))} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-m-ink/65 ring-1 ring-m-ink/10 hover:text-m-ink">
                  <RotateCcw className="size-3.5" aria-hidden /> আবার
                </button>
              )}
            </div>
            <Question n={1} title="আপনার স্বপ্ন কী?" options={GOALS} icons={GOAL_ICON} value={answers.goal} onPick={(v) => set("goal", v)} />
            <Question n={2} title="কী নিয়ে কাজ করতে ভালো লাগে?" options={LIKES} icons={LIKE_ICON} value={answers.like} onPick={(v) => set("like", v)} />
            <Question n={3} title="আপনার প্রতিভা কোথায়?" options={TALENTS} icons={TALENT_ICON} value={answers.talent} onPick={(v) => set("talent", v)} />
            <a href="#academies" className="mt-5 flex h-12 items-center justify-center gap-2 rounded-2xl bg-m-yellow text-[15px] font-bold text-m-ink shadow-m-tile transition-transform hover:-translate-y-0.5 motion-reduce:transition-none">
              {answered ? (
                <>
                  <Num value={matched} />টি একাডেমি আপনার সাথে মেলে — দেখুন
                </>
              ) : (
                "সব একাডেমি দেখুন"
              )}
              <ArrowDown className="size-4.5" aria-hidden />
            </a>
          </div>
        </div>
      </section>

      {/* The academies. */}
      <section id="academies" aria-labelledby="academies-title" className="mx-auto max-w-7xl scroll-mt-24 pt-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="academies-title" className="text-[clamp(1.5rem,3vw,2.1rem)] leading-tight font-bold text-m-ink">
              {answered ? "আপনার জন্য একাডেমি" : "দেশের একাডেমিগুলো"}
            </h2>
            <p className="mt-1 text-[15px] text-m-ink/65">{answered ? "সবচেয়ে মিলে যাওয়াটা আগে। কার্ডে চাপলে একাডেমির পুরো পরিচয়।" : "প্রতিটি একাডেমির নিজের শিক্ষক, বিভাগ আর কোর্স — একটায় চাপুন, চিনে নিন।"}</p>
          </div>
        </div>
        <div role="group" aria-label="ধারা" className="mt-5 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[null, ...SCHOOL_LIST].map((s) => (
            <button
              key={s ?? "all"}
              type="button"
              aria-pressed={school === s}
              onClick={() => setSchool(s)}
              className={cn("h-10 shrink-0 rounded-full px-4 text-sm font-semibold transition-colors", school === s ? "bg-m-ink text-m-on" : "bg-white text-m-ink/75 ring-1 ring-m-ink/10 hover:ring-m-blue/40")}
            >
              {s ? SCHOOLS[s] : "সব ধারা"}
            </button>
          ))}
        </div>
        <motion.ul layout={!reduce} className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence initial={false}>
            {ranked.map(({ a, f, match }) => (
              <motion.li key={a.id} layout={!reduce} initial={reduce ? false : { opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.25 }}>
                <AcademyCard academy={a} facts={f} match={answered ? match : undefined} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </section>
    </>
  );
}

function Question<K extends string>({ n, title, options, icons, value, onPick }: { n: number; title: string; options: Record<K, string>; icons: Record<K, LucideIcon>; value?: K; onPick: (v: K) => void }) {
  return (
    <fieldset className="mt-5">
      <legend className="mb-2.5 flex items-center gap-2 text-sm font-bold text-m-ink">
        <span className={cn("grid size-6 place-items-center rounded-full text-[11px]", value ? "bg-m-green text-m-on" : "bg-m-blue text-m-on")}>
          <Num value={n} />
        </span>
        {title}
      </legend>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(options) as K[]).map((k) => {
          const Icon: LucideIcon = icons[k];
          const on = value === k;
          return (
            <button
              key={k}
              type="button"
              aria-pressed={on}
              onClick={() => onPick(k)}
              className={cn(
                "inline-flex h-10 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition-[background-color,box-shadow,transform] duration-200 active:scale-95 motion-reduce:transition-none",
                on ? "bg-m-blue text-m-on shadow-m-tile" : "bg-m-ground text-m-ink/80 ring-1 ring-m-ink/8 hover:bg-m-blue-soft hover:text-m-blue",
              )}
            >
              <Icon className="size-4" aria-hidden /> {options[k]}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
