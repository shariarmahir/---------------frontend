"use client";

import { FlaskConical, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { Area, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { grant, recordLab } from "@/lib/gori/progression";
import { randomSeed } from "@/lib/gori/rng";
import { defaultConfig, scenarioOf } from "@/lib/gori/sim/engine";
import { runExperiment, type ExperimentResult } from "@/lib/gori/sim/lab";
import { ENGINE_VERSION, RULESET_VERSION, type SimConfig } from "@/lib/gori/sim/types";
import { cn } from "@/lib/utils";
import { useT } from "../provider";
import { LockedNotice, useFeature } from "../shell";
import { useGori, useHydrated, type LabRecord } from "../store";
import { PixelMark } from "@/components/ui/section-kit";

const sc = scenarioOf("health-access");
const CONFOUNDERS = [
  { id: "events", bn: "ঘটনা (বন্যা, দাম, প্রকোপ)", how: "একই বীজে দুই পক্ষে হুবহু একই — নিয়ন্ত্রিত।" },
  { id: "true-effect", bn: "হস্তক্ষেপের আসল প্রভাব", how: "বীজ থেকে একবার নির্ধারিত — প্রতিটি জোড়ায় একই।" },
  { id: "stakeholders", bn: "অংশীজনের সমর্থন", how: "হস্তক্ষেপ নিজেই সমর্থন বদলাতে পারে — এটা প্রক্রিয়ার অংশ, নিয়ন্ত্রিত নয়।" },
  { id: "budget", bn: "বাজেট ও কর্মী", how: "দুই পক্ষে একই শুরু; হস্তক্ষেপ খরচ করে — বিনিময় হিসেবে দেখুন।" },
];
const VERDICT = { supported: "সমর্থিত (খেলার মডেলে)", refuted: "বাতিল (খেলার মডেলে)", inconclusive: "অনির্ণীত" } as const;

export function Lab() {
  const hydrated = useHydrated();
  const open = useFeature("lab");
  const records = useGori((s) => s.lab);
  const addLab = useGori((s) => s.addLab);
  const setProgress = useGori((s) => s.setProgress);
  const { n } = useT();

  const [statement, setStatement] = useState("");
  const [mechanism, setMechanism] = useState("");
  const [intervention, setIntervention] = useState("chw");
  const [scale, setScale] = useState<"pilot" | "full">("full");
  const [variable, setVariable] = useState("equity");
  const [direction, setDirection] = useState<"up" | "down">("up");
  const [confounders, setConfounders] = useState<string[]>(["events", "true-effect"]);
  const [assumptions, setAssumptions] = useState<SimConfig["assumptions"]>({});
  const [horizon, setHorizon] = useState(8);
  const [evidenceLevel, setEvidenceLevel] = useState<LabRecord["hypothesis"]["evidenceLevel"]>("assumption");
  const [falsification, setFalsification] = useState("১০–৯০% পরিসরে পার্থক্য শূন্য ছুঁলে বা উল্টো দিকে গেলে অনুমানটি টেকে না।");
  const [trials, setTrials] = useState(30);
  const [seed, setSeed] = useState(() => randomSeed());
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ r: ExperimentResult; config: SimConfig } | null>(null);
  const [conclusion, setConclusion] = useState("");

  if (!hydrated) return null;
  if (!open) return <div className="px-4 py-12"><LockedNotice feature="lab" /></div>;

  const def = sc.interventions.find((i) => i.id === intervention)!;
  const v = sc.variables.find((x) => x.id === variable)!;
  const valid = statement.trim().length >= 10 && mechanism.trim().length >= 10 && falsification.trim().length >= 10 && /^[a-z0-9-]{3,24}$/.test(seed);

  function run() {
    setBusy(true);
    setTimeout(() => {
      const config = defaultConfig({ mode: "lab", seed, horizon, assumptions });
      setResult({ r: runExperiment(config, { intervention, scale, variable, direction, trials }), config });
      setBusy(false);
    }, 30);
  }

  function save() {
    if (!result) return;
    const at = new Date().toISOString();
    const rec: LabRecord = {
      id: `${seed}:${intervention}>${variable}:${at}`,
      hypothesis: { statement, mechanism, intervention, variable, direction, confounders, assumptions, horizon, evidenceLevel, falsification },
      seed,
      trials,
      engine: ENGINE_VERSION,
      ruleset: RULESET_VERSION,
      result: { baseline: result.r.baseline, treated: result.r.treated, diff: result.r.diff, verdict: result.r.verdict },
      conclusion: conclusion.trim(),
      at,
    };
    addLab(rec);
    let xp = 0;
    setProgress((p) => {
      const l = recordLab(p, `${intervention}>${variable}`, at);
      xp = l.xpGained;
      return grant(l.progress, ["scientist"], at).progress;
    });
    toast.success("পরীক্ষা নথিভুক্ত হলো", { description: xp ? `+${n(xp)} XP — নতুন প্রশ্নের জন্য` : "একই প্রশ্ন আগেও পরীক্ষা করেছেন — নতুন XP নেই।" });
  }

  const field = "mt-1 block w-full rounded-xl border border-white/15 bg-black ring-1 ring-white/12 px-3 font-bengali text-sm";

  return (
    <div className="mx-auto max-w-340 px-4 py-8 sm:px-6 lg:px-8">
      <PixelMark tone="dark" className="mb-2" />
      <h1 className="flex items-center gap-3 font-bengali text-3xl font-bold text-signal-orange"><FlaskConical className="size-8" aria-hidden /> বিজ্ঞানাগার</h1>
      <p className="mt-2 max-w-[70ch] font-bengali text-white/85">
        একটি অনুমান লিখুন, তারপর একই বীজে “কিছু না করা” আর “হস্তক্ষেপ” অনেকবার চালান। প্রতিটি জোড়া একই ঘটনা আর একই আসল প্রভাবের মুখোমুখি হয়, তাই পার্থক্যটা হস্তক্ষেপেরই। ফল খেলার মডেলের ভেতরে — মডেলটি বাস্তবের সাথে যাচাই করা হয়নি।
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <form
          className="space-y-4 rounded-2xl bg-text-primary ring-1 ring-white/12 p-5 text-white"
          onSubmit={(e) => {
            e.preventDefault();
            if (valid) run();
          }}
          aria-label="অনুমান"
        >
          <label className="block font-bengali text-sm font-semibold">
            অনুমান (একটি বাক্যে)
            <textarea value={statement} onChange={(e) => setStatement(e.target.value)} rows={2} maxLength={300} placeholder="যেমন: স্বাস্থ্যকর্মী প্রশিক্ষণ দূরের পরিবারের সমতা বাড়ায়।" className={cn(field, "py-2")} />
          </label>
          <label className="block font-bengali text-sm font-semibold">
            প্রক্রিয়া — কীভাবে কাজ করবে বলে ভাবছেন
            <textarea value={mechanism} onChange={(e) => setMechanism(e.target.value)} rows={2} maxLength={300} placeholder="যেমন: ঘরে ঘরে পরামর্শ আর রেফারেল দূরত্বের বাধা কমায়।" className={cn(field, "py-2")} />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="font-bengali text-sm font-semibold">
              স্বাধীন চলক: হস্তক্ষেপ
              <select value={intervention} onChange={(e) => setIntervention(e.target.value)} className={cn(field, "h-11")}>
                {sc.interventions.map((i) => <option key={i.id} value={i.id}>{i.bn}</option>)}
              </select>
            </label>
            <label className="font-bengali text-sm font-semibold">
              পরিসর
              <select value={scale} onChange={(e) => setScale(e.target.value as "pilot" | "full")} className={cn(field, "h-11")}>
                <option value="pilot">পাইলট</option>
                <option value="full">পূর্ণ</option>
              </select>
            </label>
            <label className="font-bengali text-sm font-semibold">
              নির্ভরশীল চলক: যা মাপবেন
              <select value={variable} onChange={(e) => setVariable(e.target.value)} className={cn(field, "h-11")}>
                {sc.variables.map((x) => <option key={x.id} value={x.id}>{x.bn}</option>)}
              </select>
            </label>
            <label className="font-bengali text-sm font-semibold">
              প্রত্যাশিত দিক
              <select value={direction} onChange={(e) => setDirection(e.target.value as "up" | "down")} className={cn(field, "h-11")}>
                <option value="up">বাড়বে</option>
                <option value="down">কমবে</option>
              </select>
            </label>
          </div>

          <fieldset>
            <legend className="font-bengali text-sm font-semibold">বিভ্রান্তিকর উপাদান (confounders)</legend>
            <ul className="mt-1 space-y-1.5">
              {CONFOUNDERS.map((c) => (
                <li key={c.id}>
                  <label className="flex gap-2 font-bengali text-sm">
                    <input type="checkbox" className="mt-1 accent-signal-orange" checked={confounders.includes(c.id)} onChange={(e) => setConfounders(e.target.checked ? [...confounders, c.id] : confounders.filter((x) => x !== c.id))} />
                    <span>{c.bn}<span className="block text-xs text-white/65">{c.how}</span></span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>

          <fieldset>
            <legend className="font-bengali text-sm font-semibold">অনুমানের মান</legend>
            <div className="mt-1 grid gap-2 sm:grid-cols-2">
              {sc.assumptions.map((a) => (
                <label key={a.id} className="font-bengali text-xs text-white/65">
                  {a.bn}
                  <select value={assumptions[a.id] ?? "mid"} onChange={(e) => setAssumptions({ ...assumptions, [a.id]: e.target.value as "low" | "mid" | "high" })} className={cn(field, "h-10")}>
                    {(["low", "mid", "high"] as const).map((k) => <option key={k} value={k}>{a.optionBn[k]}</option>)}
                  </select>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="font-bengali text-sm font-semibold">
              সময়: {n(horizon)} প্রান্তিক
              <input type="range" min={4} max={16} value={horizon} onChange={(e) => setHorizon(Number(e.target.value))} className="mt-3 block w-full accent-signal-orange" />
            </label>
            <label className="font-bengali text-sm font-semibold">
              প্রমাণের স্তর
              <select value={evidenceLevel} onChange={(e) => setEvidenceLevel(e.target.value as LabRecord["hypothesis"]["evidenceLevel"])} className={cn(field, "h-11")}>
                <option value="dossier">প্রতিবেদনে প্রক্রিয়া আছে</option>
                <option value="assumption">খেলার অনুমান</option>
                <option value="untested">একেবারে নতুন ধারণা</option>
              </select>
            </label>
            <label className="font-bengali text-sm font-semibold">
              ট্রায়াল
              <select value={trials} onChange={(e) => setTrials(Number(e.target.value))} className={cn(field, "h-11")}>
                {[10, 30, 60].map((t) => <option key={t} value={t}>{n(t)}টি বীজ</option>)}
              </select>
            </label>
          </div>
          <label className="block font-bengali text-sm font-semibold">
            খণ্ডনের শর্ত — কোন ফলে অনুমান ভুল প্রমাণ হবে
            <textarea value={falsification} onChange={(e) => setFalsification(e.target.value)} rows={2} maxLength={300} className={cn(field, "py-2")} />
          </label>
          <label className="block font-bengali text-sm font-semibold">
            বীজ
            <input value={seed} onChange={(e) => setSeed(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 24))} className={cn(field, "h-11 font-mono")} />
          </label>
          <button type="submit" disabled={!valid || busy} className="inline-flex h-12 items-center gap-2 rounded-xl bg-signal-orange px-6 font-bengali font-bold disabled:opacity-40 text-text-primary">
            {busy ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <FlaskConical className="size-5" aria-hidden />} পরীক্ষা চালান
          </button>
          {!valid && <p className="font-bengali text-xs text-white/65">অনুমান, প্রক্রিয়া আর খণ্ডনের শর্ত অন্তত এক বাক্যে লিখুন।</p>}
        </form>

        <div className="space-y-5">
          {result ? (
            <section className="rounded-2xl bg-text-primary ring-1 ring-white/12 p-5 text-white" aria-live="polite">
              <p className={cn("inline-flex rounded-full px-3 py-1 font-bengali text-sm font-bold", result.r.verdict === "supported" ? "bg-bdgreen-500 text-text-primary" : result.r.verdict === "refuted" ? "bg-national-crimson text-white" : "bg-white/10 text-white")}>
                {VERDICT[result.r.verdict]}
              </p>
              {!result.r.launchOk && <p className="mt-2 font-bengali text-sm text-crimson-bright">হস্তক্ষেপটি শুরুতেই চালু করা যায়নি ({def.requires?.note}) — তাই কোনো পার্থক্য নেই।</p>}
              <p className="mt-3 font-bengali text-sm leading-6">
                {n(trials)}টি জোড়ায় {v.bn}: কিছু না করলে গড় {n(result.r.baseline.mean)}, {def.bn} চালালে গড় {n(result.r.treated.mean)}। পার্থক্যের ১০–৯০% পরিসর {n(result.r.diff.p10)} থেকে {n(result.r.diff.p90)}।
              </p>
              <div className="mt-4 h-64" role="img" aria-label={`${v.bn}: ভিত্তি বনাম হস্তক্ষেপ, প্রান্তিক অনুযায়ী গড় ও ১০–৯০% পরিসর`}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={result.r.series.map((s) => ({ ...s, baseBand: [s.baseLo, s.baseHi], treatBand: [s.treatLo, s.treatHi] }))} margin={{ top: 8, right: 16, bottom: 0, left: -12 }}>
                    <CartesianGrid stroke="#e3e8e5" vertical={false} />
                    <XAxis dataKey="turn" tickFormatter={(t) => n(t)} tick={{ fontSize: 11, fill: "#5c6b64" }} tickLine={false} axisLine={{ stroke: "#cfd8d3" }} label={{ value: "প্রান্তিক", position: "insideBottomRight", offset: -2, fontSize: 11, fill: "#5c6b64" }} />
                    <YAxis tickFormatter={(v) => n(Math.round(Number(v)))} allowDecimals={false} tick={{ fontSize: 11, fill: "#5c6b64" }} tickLine={false} axisLine={false} width={44} domain={[(v: number) => Math.floor(v - 2), (v: number) => Math.ceil(v + 2)]} />
                    <Tooltip
                      formatter={(val, name) => [Array.isArray(val) ? `${n(Number(val[0]))}–${n(Number(val[1]))}` : n(Number(val)), name]}
                      labelFormatter={(t) => `প্রান্তিক ${n(Number(t))}`}
                      contentStyle={{ borderRadius: 10, border: "1px solid #e3e8e5" }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area dataKey="baseBand" name="ভিত্তির পরিসর" stroke="none" fill="#3651c9" fillOpacity={0.12} legendType="none" isAnimationActive={false} />
                    <Area dataKey="treatBand" name="হস্তক্ষেপের পরিসর" stroke="none" fill="#00875a" fillOpacity={0.15} legendType="none" isAnimationActive={false} />
                    <Line dataKey="base" name="কিছু না করা (গড়)" stroke="#3651c9" strokeWidth={2} dot={false} isAnimationActive={false} />
                    <Line dataKey="treat" name={`${def.bn} (গড়)`} stroke="#00875a" strokeWidth={2} dot={false} isAnimationActive={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <details className="mt-3 font-bengali text-sm">
                <summary className="cursor-pointer font-semibold">টেবিল হিসেবে দেখুন</summary>
                <table className="mt-2 w-full text-xs">
                  <thead><tr className="text-left text-white/65"><th className="py-1">প্রান্তিক</th><th>ভিত্তি (১০–৯০%)</th><th>হস্তক্ষেপ (১০–৯০%)</th></tr></thead>
                  <tbody>
                    {result.r.series.map((s) => (
                      <tr key={s.turn} className="border-t border-white/12"><td className="py-1">{n(s.turn)}</td><td>{n(s.base)} ({n(s.baseLo)}–{n(s.baseHi)})</td><td>{n(s.treat)} ({n(s.treatLo)}–{n(s.treatHi)})</td></tr>
                    ))}
                  </tbody>
                </table>
              </details>
              <p className="mt-3 font-bengali text-xs text-white/65">বীজ {seed} · নিয়ম {RULESET_VERSION} · ইঞ্জিন {ENGINE_VERSION} · একই ইনপুটে ফল হুবহু পুনরুৎপাদনযোগ্য। সম্পর্ক (correlation) নয় — মডেলের ভেতরে কারণ দেখানো; বাস্তবে প্রমাণ দরকার।</p>
              <label className="mt-4 block font-bengali text-sm font-semibold">
                আপনার উপসংহার ও অনিশ্চয়তা
                <textarea value={conclusion} onChange={(e) => setConclusion(e.target.value)} rows={3} maxLength={600} className={cn(field, "py-2")} />
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={save} className="inline-flex h-11 items-center gap-2 rounded-xl bg-black px-4 font-bengali text-sm font-bold text-white">নথিভুক্ত করুন</button>
                <button type="button" disabled title="সার্ভার যুক্ত হলে চালু হবে" className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/20 px-4 font-bengali text-sm text-white/65 opacity-60">
                  <Send className="size-4" aria-hidden /> সহকর্মী পর্যালোচনায় পাঠান (শীঘ্রই)
                </button>
              </div>
            </section>
          ) : (
            <p className="rounded-2xl border border-white/15 p-6 font-bengali text-white/80">অনুমান লিখে পরীক্ষা চালালে ফল এখানে দেখাবে।</p>
          )}

          {records.length > 0 && (
            <section className="rounded-2xl border border-white/10 p-5">
              <h2 className="font-bengali text-lg font-bold text-signal-orange">নথিভুক্ত পরীক্ষা</h2>
              <ul className="mt-2 divide-y divide-white/10">
                {records.slice(0, 10).map((r) => (
                  <li key={r.id} className="py-2.5 font-bengali text-sm">
                    <p className="font-semibold">{r.hypothesis.statement}</p>
                    <p className="text-xs text-white/80">
                      {VERDICT[r.result.verdict]} · পার্থক্য {n(r.result.diff.p10)} থেকে {n(r.result.diff.p90)} · বীজ {r.seed} · {n(r.trials)} ট্রায়াল
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
