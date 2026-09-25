"use client";

import Link from "next/link";
import { BookOpen, Check, Coffee, Hammer, Handshake, Sprout, type LucideIcon } from "lucide-react";
import { updateMedia, useHydrated, useMediaState } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { Num } from "../ui/numerals";
import { useMinutesToday } from "./usage";

/** Learn → Connect → Create → Apply → Relax: a day on the platform, then off it. */
export const planSteps: { id: string; bn: string; hint: string; href: string; Icon: LucideIcon }[] = [
  { id: "learn", bn: "শিখুন", hint: "২০ মিনিট — একটা শিক্ষা পোস্ট", href: "/media?t=education", Icon: BookOpen },
  { id: "connect", bn: "যুক্ত হোন", hint: "১০ মিনিট — একটা টিম বা মানুষ", href: "/media/teams", Icon: Handshake },
  { id: "create", bn: "বানান", hint: "২০ মিনিট — কাজের প্রমাণ দিন", href: "/media/post/new", Icon: Hammer },
  { id: "apply", bn: "প্রয়োগ করুন", hint: "অফলাইনে — উদ্যোগ বা কাজ", href: "/media/events", Icon: Sprout },
  { id: "relax", bn: "বিশ্রাম", hint: "অ্যাপ বন্ধ করুন, পরিবারের সাথে সময়", href: "/media/notes", Icon: Coffee },
];

function todayKey() {
  return new Date().toLocaleDateString("en-CA");
}

export function toggleStep(id: string) {
  const date = todayKey();
  updateMedia((s) => {
    const done: Record<string, true> = s.plan.date === date ? { ...s.plan.done } : {};
    if (done[id]) delete done[id];
    else done[id] = true;
    return { ...s, plan: { date, done } };
  });
}

export function DailyPlan({ compact }: { compact?: boolean }) {
  const hydrated = useHydrated();
  const plan = useMediaState((s) => s.plan);
  const minutes = useMinutesToday();
  const done = hydrated && plan.date === todayKey() ? plan.done : {};
  const count = Object.keys(done).length;

  return (
    <section aria-labelledby="plan-title" className="rounded-2xl border border-card-border bg-white p-4 sm:p-5">
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="plan-title" className="text-base font-bold text-text-primary">আজকের পরিকল্পনা</h2>
        <span className="text-xs text-text-muted">
          <Num value={count} />/<Num value={planSteps.length} /> · আজ <Num value={minutes} /> মিনিট
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100" aria-hidden>
        <div className="h-full rounded-full bg-bd-green transition-[width] duration-500" style={{ width: `${(count / planSteps.length) * 100}%` }} />
      </div>
      <ol className={cn("mt-3", compact ? "space-y-1" : "space-y-1.5")}>
        {planSteps.map(({ id, bn, hint, href, Icon }) => {
          const on = Boolean(done[id]);
          return (
            <li key={id} className="flex items-center gap-2.5">
              <button
                type="button"
                role="checkbox"
                aria-checked={on}
                aria-label={`${bn} — সম্পন্ন`}
                onClick={() => toggleStep(id)}
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-lg border-2 transition-colors",
                  on ? "border-bd-green bg-bd-green text-white" : "border-card-border text-transparent hover:border-bd-green/50",
                )}
              >
                <Check className="size-4" strokeWidth={3} aria-hidden />
              </button>
              <Link href={href} className="group flex min-h-10 min-w-0 flex-1 items-center gap-2 rounded-lg px-1 hover:bg-slate-50">
                <Icon className={cn("size-4.5 shrink-0", on ? "text-text-muted" : "text-bd-green")} aria-hidden />
                <span className="min-w-0">
                  <span className={cn("block text-sm font-semibold", on ? "text-text-muted line-through" : "text-text-primary group-hover:text-bd-green")}>{bn}</span>
                  {!compact && <span className="block truncate text-xs text-text-muted">{hint}</span>}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
      {count === planSteps.length && (
        <p className="fade-in mt-3 rounded-xl bg-bd-green-light px-3 py-2 text-sm font-semibold text-bd-green-dark">চমৎকার দিন! এবার অ্যাপ বন্ধ করে বিশ্রাম নিন।</p>
      )}
    </section>
  );
}
