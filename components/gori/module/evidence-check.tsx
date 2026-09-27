"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, RotateCcw, Share2, Star, TrendingUp, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { puzzleOf, type Answer } from "@/data/gori/puzzles";
import { ACHIEVEMENTS, derivedAchievements, grant, nationalBest, recordQuiz } from "@/lib/gori/progression";
import { meterDelta, scoreOf, starsOf, xpFor } from "@/lib/gori/quiz";
import { cn } from "@/lib/utils";
import { AgentAnswerView, useAgent } from "../ai-panel";
import { useT } from "../provider";
import { useGori } from "../store";

type Choice = Answer | "";

export function Stars({ count, size = "md" }: { count: number; size?: "sm" | "md" | "lg" }) {
  const reduce = useReducedMotion();
  const cls = size === "lg" ? "size-8" : size === "sm" ? "size-3.5" : "size-5";
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`৩টির মধ্যে ${count}টি তারা`}>
      {[0, 1, 2].map((i) => (
        <motion.span key={i} initial={reduce ? false : { scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 + i * 0.1 }}>
          <Star className={cn(cls, i < count ? "fill-signal-orange text-signal-orange" : "fill-transparent text-slate-300")} aria-hidden />
        </motion.span>
      ))}
    </span>
  );
}

/** The module's evidence-check mini-game: four proposals, হ্যাঁ/না, judged by the dossier. */
export function EvidenceCheck({ n: moduleN }: { n: number }) {
  const p = puzzleOf(moduleN)!;
  const progress = useGori((s) => s.progress);
  const setProgress = useGori((s) => s.setProgress);
  const post = useGori((s) => s.post);
  const { n } = useT();
  const [choices, setChoices] = useState<Choice[]>(() => p.decisions.map(() => ""));
  const [error, setError] = useState(false);
  const [result, setResult] = useState<{ answers: Answer[]; score: number; deltas: ReturnType<typeof meterDelta>; xp: number } | null>(null);
  const [idea, setIdea] = useState(progress.quiz.ideas[moduleN] ?? "");
  const agent = useAgent();
  const best = progress.quiz.best[moduleN];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const missing = choices.findIndex((c) => c === "");
    if (missing >= 0) {
      setError(true);
      document.getElementById(`q-${moduleN}-${missing}`)?.focus();
      return;
    }
    const answers = choices as Answer[];
    const score = scoreOf(p, answers);
    const before = nationalBest(progress);
    const next = recordQuiz(progress, moduleN, answers, score);
    const deltas = meterDelta(before, nationalBest(next));
    const xp = Math.max(0, xpFor(moduleN, score) - xpFor(moduleN, best ?? 0));
    const g = grant(next, derivedAchievements(next), new Date().toISOString());
    setProgress(() => g.progress);
    for (const id of g.fresh) toast(`নতুন পদক: ${ACHIEVEMENTS.find((a) => a.id === id)?.bn}`);
    if (score >= 75 && (best ?? 0) < 75) post(`খেলায়: “${p.title}” মডিউল পুনর্গঠিত — মানচিত্রে নতুন পিক্সেল সবুজ (সিমুলেশন)।`);
    setResult({ answers, score, deltas, xp });
    void agent.ask({ agent: "reviewer", target: { kind: "quiz", n: moduleN, answers, idea: idea.trim() || undefined } });
  }

  async function share() {
    if (!result) return;
    const url = `${window.location.origin}/cholo-bangladesh-gori/module/${`BD-${String(moduleN).padStart(3, "0")}`}`;
    const text = `“চলো বাংলাদেশ গড়ি”-তে “${p.title}” প্রমাণ-পরীক্ষায় ${n(result.score)}/১০০ পেয়েছি। তুমিও চেষ্টা করো:`;
    try {
      if (navigator.share) await navigator.share({ title: "চলো বাংলাদেশ গড়ি", text, url });
      else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        toast.success("কপি হয়েছে");
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") toast.error("শেয়ার করা যায়নি");
    }
  }

  return (
    <section aria-labelledby="check-title" className="rounded-2xl bg-white p-5 text-gori-ink sm:p-7">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="check-title" className="font-bengali text-xl font-bold">প্রমাণ-পরীক্ষা: আপনি নীতিনির্ধারক</h2>
        {best !== undefined && (
          <p className="flex items-center gap-2 font-bengali text-sm text-gori-ink-soft">
            সেরা {n(best)} <Stars count={starsOf(best)} size="sm" />
          </p>
        )}
      </div>
      <p className="mt-1 font-bengali text-sm text-gori-ink-soft">{p.brief}</p>
      {p.fact && (
        <figure className="mt-3 rounded-xl bg-mint-subtle px-4 py-3">
          <blockquote className="font-bengali text-sm font-medium">{p.fact.text}</blockquote>
          <figcaption className="mt-1 font-bengali text-xs text-gori-mute">সূত্র: {p.fact.source}</figcaption>
        </figure>
      )}

      {!result ? (
        <form onSubmit={submit} noValidate className="mt-5">
          <ol className="divide-y divide-slate-100 rounded-xl border border-slate-200">
            {p.decisions.map((d, i) => {
              const id = `q-${moduleN}-${i}`;
              const v = choices[i];
              const invalid = error && v === "";
              return (
                <li key={i} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <label htmlFor={id} className="font-bengali text-[15px] leading-6">
                    <span className="mr-2 font-bold text-gori-mute">{n(i + 1)}.</span>
                    {d.q}
                  </label>
                  <select
                    id={id}
                    value={v}
                    aria-invalid={invalid || undefined}
                    onChange={(e) => setChoices(choices.map((c, j) => (j === i ? (e.target.value as Choice) : c)))}
                    className={cn(
                      "h-11 w-full shrink-0 rounded-xl border px-3 font-bengali text-[15px] font-semibold sm:w-36",
                      v === "yes" ? "border-bd-green bg-bd-green-light text-bd-green-dark" : v === "no" ? "border-slate-400 bg-slate-100" : invalid ? "border-national-crimson" : "border-slate-300 text-gori-mute",
                    )}
                  >
                    <option value="" disabled>বাছাই করুন</option>
                    <option value="yes">হ্যাঁ</option>
                    <option value="no">না</option>
                  </select>
                </li>
              );
            })}
          </ol>
          {error && choices.includes("") && <p role="alert" className="mt-3 font-bengali text-sm font-semibold text-national-crimson">চারটি প্রস্তাবেই “হ্যাঁ” বা “না” বেছে নিন।</p>}
          <label htmlFor={`idea-${moduleN}`} className="mt-4 block font-bengali text-sm font-semibold">আপনার নিজের সমাধান-ভাবনা (ঐচ্ছিক, এই ব্রাউজারেই থাকে)</label>
          <textarea id={`idea-${moduleN}`} value={idea} onChange={(e) => setIdea(e.target.value)} maxLength={600} rows={2} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-bengali text-sm" />
          <button type="submit" className="mt-4 inline-flex h-12 items-center gap-2 rounded-xl bg-signal-orange px-6 font-bengali font-bold">
            সিদ্ধান্ত জমা দিন <ArrowRight className="size-5" aria-hidden />
          </button>
        </form>
      ) : (
        <div className="mt-5 space-y-5">
          <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-gori-deep px-5 py-4 text-white">
            <Stars count={starsOf(result.score)} size="lg" />
            <p className="font-bengali">
              <strong className="block text-lg">{result.score >= 75 ? "মডিউল পুনর্গঠিত" : "প্রমাণ অন্য পথ দেখাচ্ছে"}</strong>
              স্কোর {n(result.score)}/১০০{result.xp ? ` · +${n(result.xp)} XP` : " · নতুন XP নেই (সেরা ফল আগের মতো)"}
            </p>
          </div>
          <ol className="space-y-2">
            {p.decisions.map((d, i) => {
              const ok = result.answers[i] === d.answer;
              return (
                <li key={i} className={cn("flex gap-3 rounded-xl p-3.5 font-bengali", ok ? "bg-bd-green-light/70" : "bg-orange-50")}>
                  <span className={cn("mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-white", ok ? "bg-bd-green" : "bg-bdorange-600")}>
                    {ok ? <Check className="size-4" aria-label="ঠিক" /> : <X className="size-4" aria-label="ভুল" />}
                  </span>
                  <div>
                    <p className="text-[15px] font-semibold">{d.q}</p>
                    <p className="text-xs text-gori-mute">আপনি: {result.answers[i] === "yes" ? "হ্যাঁ" : "না"} · প্রমাণ অনুযায়ী: {d.answer === "yes" ? "হ্যাঁ" : "না"}</p>
                    <p className="mt-1 text-sm text-gori-ink-soft">{d.why}</p>
                  </div>
                </li>
              );
            })}
          </ol>
          {result.deltas.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 font-bengali text-base font-bold"><TrendingUp className="size-5 text-bd-green" aria-hidden /> জাতীয় খেলার সূচক যেখানে বদলাল</h3>
              <ul className="mt-2 flex flex-wrap gap-2">
                {result.deltas.map((d) => (
                  <li key={d.id} className="rounded-full border border-bd-green/25 px-3 py-1.5 font-bengali text-sm">
                    {d.bn} {n(d.from)} → <strong className="text-bd-green">{n(d.to)}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="rounded-2xl bg-gori-cream p-4">
            <h3 className="mb-2 font-bengali text-sm font-bold">পর্যালোচকের মতামত</h3>
            <AgentAnswerView answer={agent.answer} status={agent.status} />
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => { setResult(null); setChoices(p.decisions.map(() => "")); setError(false); }} className="inline-flex h-11 items-center gap-2 rounded-xl border border-bd-green/40 px-4 font-bengali text-sm font-semibold text-bd-green">
              <RotateCcw className="size-4" aria-hidden /> আবার খেলুন
            </button>
            <button type="button" onClick={share} className="inline-flex h-11 items-center gap-2 rounded-xl px-4 font-bengali text-sm font-semibold text-gori-ink-soft hover:bg-slate-100">
              <Share2 className="size-4" aria-hidden /> শেয়ার
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
