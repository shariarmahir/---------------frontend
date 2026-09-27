"use client";

import { Award, Check, Lock } from "lucide-react";
import { puzzles } from "@/data/gori/puzzles";
import { ACHIEVEMENTS, LAB_XP, LEVELS, levelOf, PUZZLE_TARGET, PUZZLE_XP, simXp, totalXp, UNLOCKS } from "@/lib/gori/progression";
import { isSolved, quizXp } from "@/lib/gori/quiz";
import { scenarioOf } from "@/lib/gori/sim/engine";
import { cn } from "@/lib/utils";
import { useT } from "../provider";
import { useGori, useHydrated } from "../store";

const MODE_BN: Record<string, string> = { campaign: "অভিযান", sandbox: "স্যান্ডবক্স", lab: "বিজ্ঞানাগার", crisis: "সংকট", future: "ভবিষ্যৎ" };

export function ProgressView() {
  const hydrated = useHydrated();
  const p = useGori((s) => s.progress);
  const { n } = useT();
  if (!hydrated) return null;
  const xp = totalXp(p);
  const lv = levelOf(xp);
  const sc = scenarioOf("health-access");
  const solved = Object.values(p.quiz.best).filter(isSolved).length;
  const parts = [
    ["প্রমাণ-পরীক্ষা", quizXp(p.quiz.best), `${n(solved)}/৩২ মডিউল পুনর্গঠিত`],
    ["সিমুলেশন", simXp(p.sim), `${n(Object.keys(p.sim).length)}টি চ্যালেঞ্জ`],
    ["বিজ্ঞানাগার", Object.keys(p.lab).length * LAB_XP, `${n(Object.keys(p.lab).length)}টি প্রশ্ন`],
    ["কারণ-মানচিত্র", p.puzzleFound.length >= PUZZLE_TARGET ? PUZZLE_XP : 0, `${n(p.puzzleFound.length)}টি লুকোনো সম্পর্ক`],
  ] as const;

  return (
    <div className="mx-auto max-w-340 px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-bengali text-3xl font-bold text-signal-orange">অগ্রগতি ও অর্জন</h1>
      <p className="mt-2 max-w-[70ch] font-bengali text-emerald-50/85">
        স্তর শুধু খেলার বিষয়বস্তু আর শেখার সরঞ্জাম খোলে — কোনো বাস্তব কর্তৃত্ব বা যোগ্যতা নয়। XP আসে শেখা আর উন্নতি থেকে: একই খেলা বারবার চালালে, বা শুধু নতুন বীজ নিলে XP বাড়ে না। কোনো টানা-খেলার চাপ বা সময়সীমা নেই।
      </p>

      <section className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="rounded-2xl bg-gori-cream p-5 text-gori-ink">
          <p className="font-bengali text-sm text-gori-mute">স্তর {n(lv.number)}/৭</p>
          <p className="font-bengali text-3xl font-bold">{lv.bn}</p>
          <p className="text-sm text-gori-mute">{lv.en}</p>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(lv.progress * 100)} aria-label="পরের স্তরের দিকে">
            <div className="h-full rounded-full bg-signal-orange" style={{ width: `${lv.progress * 100}%` }} />
          </div>
          <p className="mt-1 font-bengali text-sm">{n(xp)} XP{lv.next ? ` · ${lv.next.bn} হতে ${n(lv.toNext)} XP` : ""}</p>
          <dl className="mt-4 space-y-2 font-bengali text-sm">
            {parts.map(([k, v, note]) => (
              <div key={k} className="flex items-baseline justify-between gap-3 border-t border-slate-200 pt-2">
                <dt>{k} <span className="text-xs text-gori-mute">— {note}</span></dt>
                <dd className="font-bold tabular-nums">{n(v)}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-2xl bg-gori-panel p-5">
          <h2 className="font-bengali text-lg font-bold">সাত স্তর — কী খোলে</h2>
          <ol className="mt-3 space-y-2">
            {LEVELS.map((l, i) => {
              const reached = lv.number > i;
              const opens = Object.values(UNLOCKS).filter((u) => u.level === i + 1).map((u) => u.bn);
              return (
                <li key={l.en} className={cn("flex gap-3 rounded-xl px-3 py-2 font-bengali", reached ? "bg-white/8" : "opacity-70")}>
                  <span className={cn("mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold", reached ? "bg-emerald-400 text-gori-deep" : "bg-white/10")}>
                    {reached ? <Check className="size-4" aria-label="পৌঁছেছেন" /> : n(i + 1)}
                  </span>
                  <span>
                    <span className="font-semibold">{l.bn}</span> <span className="text-xs text-emerald-100/70">{l.en} · {n(l.at)} XP</span>
                    {opens.length > 0 && <span className="block text-xs text-emerald-100/80">খোলে: {opens.join(", ")}</span>}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="mt-8" aria-labelledby="ach-title">
        <h2 id="ach-title" className="font-bengali text-xl font-bold">শেখার মাইলফলক</h2>
        <ul className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {ACHIEVEMENTS.map((a) => {
            const got = !!p.achievements[a.id];
            return (
              <li key={a.id} className={cn("flex items-center gap-3 rounded-xl px-4 py-3", got ? "bg-gori-cream text-gori-ink" : "bg-white/5")}>
                <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", got ? "bg-signal-orange text-gori-ink" : "bg-white/10 text-white/50")}>
                  {got ? <Award className="size-5" aria-hidden /> : <Lock className="size-4" aria-hidden />}
                </span>
                <span className="font-bengali">
                  <span className="block text-sm font-bold">{a.bn}</span>
                  <span className={cn("block text-xs", got ? "text-gori-mute" : "text-emerald-100/70")}>{got ? "অর্জিত" : a.hint}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 p-5">
          <h2 className="font-bengali text-lg font-bold">সিমুলেশনের সেরা ফল</h2>
          {Object.keys(p.sim).length ? (
            <table className="mt-2 w-full font-bengali text-sm">
              <thead><tr className="text-left text-xs text-emerald-100/70"><th className="py-1">চ্যালেঞ্জ</th><th>সেরা স্কোর</th></tr></thead>
              <tbody>
                {Object.entries(p.sim).map(([k, v]) => {
                  const [, mode, ctx] = k.split(":");
                  return (
                    <tr key={k} className="border-t border-white/10">
                      <td className="py-1.5">{MODE_BN[mode] ?? mode} · {sc.contexts.find((c) => c.id === ctx)?.bn}</td>
                      <td className="font-bold tabular-nums">{n(v.score)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="mt-2 font-bengali text-sm text-emerald-100/75">এখনো কোনো সিমুলেশন শেষ হয়নি।</p>
          )}
        </div>
        <div className="rounded-2xl border border-white/10 p-5">
          <h2 className="font-bengali text-lg font-bold">প্রমাণ-পরীক্ষা</h2>
          <p className="mt-1 font-bengali text-sm text-emerald-100/80">{n(Object.keys(p.quiz.best).length)}টি চেষ্টা, {n(solved)}টি পুনর্গঠিত (৭৫+)।</p>
          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="৩২টি মডিউল">
            {puzzles.map((q) => {
              const s = p.quiz.best[q.n];
              return (
                <li key={q.n} title={`${q.title}: ${s ?? "—"}`} className={cn("flex size-8 items-center justify-center rounded-md font-bengali text-xs font-bold", isSolved(s) ? "bg-emerald-400 text-gori-deep" : s !== undefined ? "bg-orange-400/40" : "bg-white/8 text-white/60")}>
                  {n(q.n)}
                  <span className="sr-only">{isSolved(s) ? "পুনর্গঠিত" : s !== undefined ? "চেষ্টা হয়েছে" : "বাকি"}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}
