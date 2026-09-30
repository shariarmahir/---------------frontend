"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Award, GitCompareArrows, Lightbulb, RotateCcw, Save, Shuffle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { ACHIEVEMENTS, challengeKey, derivedAchievements, grant, recordRun, type AchievementId } from "@/lib/gori/progression";
import { randomSeed } from "@/lib/gori/rng";
import { diagnose } from "@/lib/gori/sim/report";
import { CATEGORIES, PENALTY_RULES, scoreRun, STRATEGIES } from "@/lib/gori/sim/score";
import type { RunResult, ScenarioDef } from "@/lib/gori/sim/types";
import { trimPlan, verifyRun } from "@/lib/gori/sim/verify";
import { cn } from "@/lib/utils";
import { useT } from "../provider";
import { BASE } from "../shell";
import { useGori, type Game } from "../store";
import { periodLabel } from "./use-game";

export function FinalReport({ sc, run, game }: { sc: ScenarioDef; run: RunResult; game: Game }) {
  const router = useRouter();
  const { n } = useT();
  const setProgress = useGori((s) => s.setProgress);
  const setResult = useGori((s) => s.setResult);
  const post = useGori((s) => s.post);
  const saveRun = useGori((s) => s.saveRun);
  const startGame = useGori((s) => s.startGame);
  const notify = useGori((s) => s.settings.notifications);
  const score = useMemo(() => scoreRun(run, game.strategy), [run, game.strategy]);
  const lessons = useMemo(() => diagnose(run), [run]);
  const [name, setName] = useState("");
  const done = useRef(false);

  // Score on the server, credit once.
  useEffect(() => {
    if (game.result || done.current) return;
    done.current = true;
    const plan = trimPlan(game.plan);
    (async () => {
      let v: { runKey: string; total: number };
      let verified = false;
      try {
        const res = await fetch("/api/gori/runs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ config: game.config, plan, strategy: game.strategy }) });
        if (!res.ok) throw new Error(String(res.status));
        v = (await res.json()) as { runKey: string; total: number };
        verified = true;
      } catch {
        v = verifyRun(game.config, plan, game.strategy);
      }
      const at = new Date().toISOString();
      let gained = 0;
      let fresh: AchievementId[] = [];
      setProgress((p) => {
        const r = recordRun(p, challengeKey(game.config.scenario, game.config.mode, game.config.context), v.runKey, v.total, at);
        gained = r.xpGained;
        const earned: AchievementId[] = [...derivedAchievements(r.progress)];
        if (run.turns.some((t) => t.actions.some((a) => a.ok && a.action.type === "launch" && a.action.scale === "pilot"))) earned.push("first-pilot");
        if (run.turns.some((t) => t.events.some((e) => e.mitigation >= 0.5))) earned.push("shield");
        if (score.categories.evidence >= 80) earned.push("evidence");
        if ((run.turns.at(-1)?.vars.equity ?? 0) - run.start.vars.equity >= 10) earned.push("equity");
        const g = grant(r.progress, earned, at);
        fresh = g.fresh;
        return g.progress;
      });
      setResult({ runKey: v.runKey, total: v.total, verified });
      const end = run.turns.at(-1)!;
      post(`খেলায়: কাল্পনিক “${sc.bn}”-এ সেবা সূচক ${n(run.start.outcomeIndex)} থেকে ${n(end.outcomeIndex)}; BD-001 মানচিত্রে পুনর্গঠন সর্বোচ্চ ${n(v.total)}% পর্যন্ত (সিমুলেশন)।`);
      if (notify) {
        toast.success(gained ? `+${n(gained)} XP` : "স্কোর রেকর্ড হলো", { description: gained ? "এই চ্যালেঞ্জে আপনার সেরা ফল।" : "আগের সেরা ফল বেশি বা একই খেলা — নতুন XP নেই।" });
        for (const id of fresh) toast(`পদক: ${ACHIEVEMENTS.find((a) => a.id === id)?.bn}`);
      }
    })();
  }, [game, run, score, sc, setProgress, setResult, post, n, notify]);

  const chart = [{ t: "শুরু", v: run.start.outcomeIndex }, ...run.turns.map((x) => ({ t: periodLabel(run.config, x.turn), v: x.outcomeIndex }))];
  const weights = score.weights;
  const strategy = STRATEGIES.find((s) => s.id === game.strategy)!;

  return (
    <div className="space-y-5 text-white">
      <section className="rounded-2xl bg-black ring-1 ring-white/12 p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-bengali text-sm text-white/65">পরিকল্পনার স্কোর — কৌশল: {strategy.bn}</p>
            <p className="font-bengali text-6xl leading-none font-extrabold text-signal-orange tabular-nums">{n(score.total)}</p>
            <p className="mt-2 font-bengali text-sm text-white/80">
              মোট = ওজনসহ গড় {n(score.weighted)} − শাস্তি {n(score.penaltyTotal)}। স্কোর এই খেলার পরিকল্পনা মাপে — কোনো মানুষের নৈতিকতা, রাজনীতি বা যোগ্যতা নয়।
            </p>
          </div>
          <p className="font-bengali text-sm text-white/80">
            সেবা সূচক (খেলার): {n(run.start.outcomeIndex)} → <strong className="text-white">{n(run.turns.at(-1)!.outcomeIndex)}</strong>
            <br />
            {game.result ? (game.result.verified ? "সার্ভারে পুনরায় চালিয়ে যাচাই করা স্কোর" : "সার্ভারে পৌঁছানো যায়নি — স্থানীয়ভাবে হিসাব") : "যাচাই হচ্ছে…"}
          </p>
        </div>

        <div className="mt-6 h-56" role="img" aria-label={`সেবা সূচক টার্ন অনুযায়ী: ${chart.map((c) => `${c.t} ${c.v}`).join(", ")}`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chart} margin={{ top: 8, right: 16, bottom: 0, left: -12 }}>
              <CartesianGrid stroke="#e3e8e5" vertical={false} />
              <XAxis dataKey="t" tick={{ fontSize: 11, fill: "#5c6b64" }} tickLine={false} axisLine={{ stroke: "#cfd8d3" }} interval="preserveStartEnd" />
              <YAxis domain={[(v: number) => Math.floor(v - 2), (v: number) => Math.ceil(v + 2)]} allowDecimals={false} tickFormatter={(v) => n(Math.round(Number(v)))} tick={{ fontSize: 11, fill: "#5c6b64" }} tickLine={false} axisLine={false} width={44} />
              <Tooltip formatter={(v) => [n(Number(v)), "সেবা সূচক"]} contentStyle={{ fontFamily: "var(--font-bengali)", borderRadius: 10, border: "1px solid #e3e8e5" }} />
              <Line type="monotone" dataKey="v" stroke="#00875a" strokeWidth={2} dot={{ r: 4, fill: "#00875a", stroke: "#f7f8f3", strokeWidth: 2 }} activeDot={{ r: 6 }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl bg-black ring-1 ring-white/12 p-5">
          <h3 className="font-bengali text-base font-bold">বিভাগ অনুযায়ী</h3>
          <ul className="mt-3 space-y-3">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <div className="flex items-baseline justify-between gap-3 font-bengali text-sm">
                  <span className="font-semibold">
                    {c.bn} {weights[c.id] > 1 && <span className="ml-1 rounded bg-bdorange-600 px-1.5 text-[11px] text-text-primary">ওজন ২×</span>}
                  </span>
                  <span className="font-bold tabular-nums">{n(score.categories[c.id])}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10" aria-hidden>
                  <div className="h-full rounded-full bg-bdgreen-500" style={{ width: `${score.categories[c.id]}%` }} />
                </div>
                <p className="mt-0.5 font-bengali text-[11px] text-white/65">{c.how}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="space-y-5">
          <section className="rounded-2xl bg-black ring-1 ring-white/12 p-5">
            <h3 className="font-bengali text-base font-bold">শাস্তি (নথিভুক্ত নিয়ম)</h3>
            {score.penalties.length ? (
              <ul className="mt-2 space-y-1 font-bengali text-sm">
                {score.penalties.map((p) => (
                  <li key={p.id} className="flex justify-between gap-3">
                    <span>{p.bn} × {n(p.count)}</span>
                    <span className="font-bold text-crimson-bright tabular-nums">−{n(p.points)}</span>
                  </li>
                ))}
                {score.penalties.reduce((s, p) => s + p.points, 0) > PENALTY_RULES.cap && <li className="text-xs text-white/65">সর্বোচ্চ শাস্তি {n(PENALTY_RULES.cap)}।</li>}
              </ul>
            ) : (
              <p className="mt-2 font-bengali text-sm text-white/65">কোনো শাস্তি নেই।</p>
            )}
          </section>

          <section className="rounded-2xl bg-black ring-1 ring-white/12 p-5">
            <h3 className="flex items-center gap-2 font-bengali text-base font-bold">
              <Lightbulb className="size-5 text-bdorange-600" aria-hidden /> ব্যর্থতা থেকে কী শেখা যায়
            </h3>
            {lessons.length ? (
              <ul className="mt-2 space-y-2.5">
                {lessons.map((l, i) => (
                  <li key={i} className="font-bengali text-sm">
                    <span className="font-semibold">{l.bn}:</span> <span className="text-white/80">{l.detail}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 font-bengali text-sm text-white/65">বড় কোনো দুর্বলতা পাওয়া যায়নি — অন্য প্রেক্ষাপট বা কঠিন মাত্রায় চেষ্টা করুন।</p>
            )}
          </section>
        </div>
      </div>

      <section className="rounded-2xl bg-black ring-1 ring-white/12 p-5">
        <h3 className="font-bengali text-base font-bold">সংরক্ষণ আর পুনরায় খেলা</h3>
        <p className="mt-1 font-bengali text-xs text-white/65">
          বীজ {run.config.seed} · নিয়ম {run.ruleset} · ইঞ্জিন {run.engine} — একই বীজ আর একই সিদ্ধান্তে ফল হুবহু একই হবে।
        </p>
        <form
          className="mt-3 flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!game.result) return;
            saveRun({
              runKey: game.result.runKey,
              name: name.trim() || `${sc.contexts.find((c) => c.id === run.config.context)?.bn} · ${strategy.bn} · ${run.config.seed}`,
              config: run.config,
              plan: trimPlan(run.plan),
              strategy: game.strategy,
              total: game.result.total,
              finalIndex: run.turns.at(-1)!.outcomeIndex,
              verified: game.result.verified,
              savedAt: new Date().toISOString(),
            });
            toast.success("সংরক্ষিত — তুলনা পাতায় দেখুন");
          }}
        >
          <label htmlFor="run-name" className="sr-only">নাম</label>
          <input id="run-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="নাম (ঐচ্ছিক) — যেমন: প্রথমে তথ্য" className="h-11 min-w-0 flex-1 rounded-xl border border-white/15 px-3 font-bengali text-sm" />
          <button type="submit" disabled={!game.result} className="inline-flex h-11 items-center gap-2 rounded-xl bg-black px-4 font-bengali text-sm font-bold text-white disabled:opacity-40">
            <Save className="size-4" aria-hidden /> সংরক্ষণ
          </button>
        </form>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => startGame({ ...run.config })} className="inline-flex h-11 items-center gap-2 rounded-xl bg-signal-orange px-4 font-bengali text-sm font-bold text-text-primary">
            <RotateCcw className="size-4" aria-hidden /> একই বীজে নতুন কৌশল
          </button>
          <button type="button" onClick={() => startGame({ ...run.config, seed: randomSeed() })} className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/20 px-4 font-bengali text-sm font-semibold">
            <Shuffle className="size-4" aria-hidden /> নতুন বীজ
          </button>
          <Link href={`${BASE}/compare`} className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/20 px-4 font-bengali text-sm font-semibold">
            <GitCompareArrows className="size-4" aria-hidden /> কৌশল তুলনা
          </Link>
          <button type="button" onClick={() => router.push(BASE)} className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/20 px-4 font-bengali text-sm font-semibold">
            <Award className="size-4" aria-hidden /> জাতীয় মানচিত্রে দেখুন
          </button>
        </div>
      </section>
      <p className={cn("font-bengali text-xs text-white/80")}>এই ফল একটি কাল্পনিক ইউনিয়নের খেলার মডেলে — বাস্তব স্বাস্থ্যব্যবস্থার পূর্বাভাস নয়।</p>
    </div>
  );
}
