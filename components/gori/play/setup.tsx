"use client";

import { Dices, Lock, Play } from "lucide-react";
import { useState } from "react";
import { randomSeed } from "@/lib/gori/rng";
import { defaultConfig, scenarioOf } from "@/lib/gori/sim/engine";
import { STRATEGIES, type StrategyId } from "@/lib/gori/sim/score";
import { configSchema, CONTEXTS, type SimConfig } from "@/lib/gori/sim/types";
import { cn } from "@/lib/utils";
import { useT } from "../provider";
import { useFeature } from "../shell";
import { useGori } from "../store";

const sc = scenarioOf("health-access");

const COLLECTIONS: { id: string; bn: string; note: string; patch: Partial<SimConfig> }[] = [
  { id: "monsoon", bn: "বর্ষার সহনশীলতা", note: "হাওর, ঘটনা বেশি", patch: { context: "haor", events: "high" } },
  { id: "coast", bn: "উপকূলের ঝুঁকি", note: "উপকূল, রক্ষণাবেক্ষণের চাপ বেশি", patch: { context: "coastal", maintenance: "high" } },
  { id: "hills", bn: "পাহাড়ের দূরত্ব", note: "পাহাড়, সংযোগ দুর্বল", patch: { context: "hill", assumptions: { connectivity: "low" } } },
  { id: "city", bn: "শহরের খরচের চাপ", note: "শহর, বাজেট কম", patch: { context: "urban", budget: "low" } },
];

const L = { low: "কম", mid: "মাঝারি", high: "বেশি" } as const;

export function Setup({ onStart }: { onStart: (c: SimConfig, strategy: StrategyId) => void }) {
  const [c, setC] = useState<SimConfig>(() => defaultConfig({ mode: "sandbox", seed: randomSeed() }));
  const strategyDefault = useGori((s) => s.settings.strategy);
  const [strategy, setStrategy] = useState<StrategyId>(strategyDefault);
  const regions = useFeature("regions");
  const future = useFeature("future");
  const { n } = useT();
  const valid = configSchema.safeParse(c);
  const set = (p: Partial<SimConfig>) => setC((x) => ({ ...x, ...p }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (valid.success) onStart(valid.data, strategy);
      }}
      className="space-y-6 rounded-2xl bg-text-primary ring-1 ring-white/12 p-5 text-white sm:p-7"
      aria-labelledby="setup-title"
    >
      <div>
        <h2 id="setup-title" className="font-bengali text-2xl font-bold text-signal-orange">স্যান্ডবক্স — দৃশ্যকল্প সাজান</h2>
        <p className="mt-1 font-bengali text-sm text-white/80">{sc.bn}। প্রতিটি বাছাই খেলার নিয়ম বদলায়; সংখ্যাগুলো খেলার সহগ।</p>
      </div>

      <fieldset>
        <legend className="font-bengali text-sm font-bold">মৌসুমি সংগ্রহ (খেলার কনফিগারেশন — কোনো চলমান ঘটনার দাবি নয়)</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {COLLECTIONS.map((col) => (
            <button
              key={col.id}
              type="button"
              disabled={!regions}
              onClick={() => set({ ...col.patch, assumptions: { ...c.assumptions, ...col.patch.assumptions } })}
              className="rounded-xl border border-white/15 bg-black ring-1 ring-white/12 px-3 py-2 text-left font-bengali text-sm disabled:opacity-50"
            >
              <span className="block font-semibold">{col.bn}</span>
              <span className="block text-xs text-white/65">{col.note}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="font-bengali text-sm font-bold">প্রেক্ষাপট {regions ? "" : "(বাকিগুলো স্তর ৩-এ খুলবে)"}</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {CONTEXTS.map((id) => {
            const ctx = sc.contexts.find((x) => x.id === id)!;
            const locked = !regions && id !== "rural";
            return (
              <label key={id} className={cn("flex cursor-pointer gap-2 rounded-xl border bg-black ring-1 ring-white/12 px-3 py-2.5 font-bengali", c.context === id ? "border-signal-orange ring-2 ring-signal-orange/30" : "border-white/15", locked && "cursor-not-allowed opacity-50")}>
                <input type="radio" name="context" className="mt-1 accent-signal-orange" checked={c.context === id} disabled={locked} onChange={() => set({ context: id })} />
                <span>
                  <span className="flex items-center gap-1 text-sm font-semibold">{ctx.bn} {locked && <Lock className="size-3.5" aria-hidden />}</span>
                  <span className="block text-xs text-white/65">{ctx.description}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Select label="শুরুর বাজেট" value={c.budget} onChange={(v) => set({ budget: v as SimConfig["budget"] })} options={[["low", `কম (${n(sc.budget.low.start)})`], ["mid", `মাঝারি (${n(sc.budget.mid.start)})`], ["high", `বেশি (${n(sc.budget.high.start)})`]]} />
        <Select label="কর্মী" value={c.workforce} onChange={(v) => set({ workforce: v as SimConfig["workforce"] })} options={[["low", `কম (${n(sc.workforce.low)})`], ["mid", `মাঝারি (${n(sc.workforce.mid)})`], ["high", `বেশি (${n(sc.workforce.high)})`]]} />
        <Select
          label="টার্নের দৈর্ঘ্য"
          value={String(c.turnMonths)}
          onChange={(v) => set({ turnMonths: Number(v) as 3 | 12, horizon: Number(v) === 12 ? Math.min(c.horizon, 12) : c.horizon })}
          options={[["3", "প্রান্তিক (৩ মাস)"], ...(future ? ([["12", "বছর (দীর্ঘমেয়াদি, কাল্পনিক)"]] as [string, string][]) : [])]}
        />
        <label className="font-bengali text-sm font-semibold">
          সময়সীমা: {n(c.horizon)} টার্ন
          <input type="range" min={4} max={c.turnMonths === 12 ? 12 : 24} value={c.horizon} onChange={(e) => set({ horizon: Number(e.target.value) })} className="mt-3 block w-full accent-signal-orange" />
        </label>
        <Select label="কাঠিন্য" value={c.difficulty} onChange={(v) => set({ difficulty: v as SimConfig["difficulty"] })} options={[["easy", "সহজ"], ["normal", "স্বাভাবিক"], ["hard", "কঠিন"]]} />
        <Select label="ঘটনার তীব্রতা" value={c.events} onChange={(v) => set({ events: v as SimConfig["events"] })} options={[["off", "বন্ধ"], ["low", "কম"], ["normal", "স্বাভাবিক"], ["high", "বেশি"]]} />
        <Select label="অংশীজনের জটিলতা" value={c.stakeholders} onChange={(v) => set({ stakeholders: v as SimConfig["stakeholders"] })} options={[["simple", "সরল (সমর্থন স্থির)"], ["full", "পূর্ণ (সমর্থন বদলায়)"]]} />
        <Select label="প্রমাণের প্রাপ্যতা" value={c.evidence} onChange={(v) => set({ evidence: v as SimConfig["evidence"] })} options={[["low", "কম — অনিশ্চয়তা বেশি"], ["mid", "মাঝারি"], ["high", "বেশি — অনিশ্চয়তা কম"]]} />
        <Select label="রক্ষণাবেক্ষণের চাপ" value={c.maintenance} onChange={(v) => set({ maintenance: v as SimConfig["maintenance"] })} options={[["low", "কম"], ["mid", "মাঝারি"], ["high", "বেশি"]]} />
      </div>

      <fieldset>
        <legend className="font-bengali text-sm font-bold">অনুমান — ফল এগুলোর ওপর নির্ভর করে</legend>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {sc.assumptions.map((a) => (
            <Select
              key={a.id}
              label={`${a.bn}${a.basis === "dossier" ? " (প্রতিবেদন-সমর্থিত প্রসঙ্গ)" : " (খেলার অনুমান)"}`}
              hint={a.description}
              value={c.assumptions[a.id] ?? "mid"}
              onChange={(v) => set({ assumptions: { ...c.assumptions, [a.id]: v as "low" | "mid" | "high" } })}
              options={(["low", "mid", "high"] as const).map((k) => [k, `${L[k]}: ${a.optionBn[k]}`])}
            />
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="কৌশল-প্রোফাইল (স্কোরের ওজন)"
          hint="খেলার পছন্দ — রাজনৈতিক পরিচয় নয়। বাছাই করা বিভাগের ওজন দ্বিগুণ হয়।"
          value={strategy}
          onChange={(v) => setStrategy(v as StrategyId)}
          options={STRATEGIES.map((s) => [s.id, s.bn])}
        />
        <div>
          <label htmlFor="seed" className="font-bengali text-sm font-semibold">বীজ (seed) — একই বীজে একই ঘটনা</label>
          <div className="mt-1 flex gap-2">
            <input
              id="seed"
              value={c.seed}
              onChange={(e) => set({ seed: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 24) })}
              className="h-11 min-w-0 flex-1 rounded-xl border border-white/15 bg-black ring-1 ring-white/12 px-3 font-mono text-sm"
              aria-invalid={!valid.success || undefined}
            />
            <button type="button" onClick={() => set({ seed: randomSeed() })} className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-white/15 bg-black ring-1 ring-white/12 px-3 font-bengali text-sm" aria-label="নতুন বীজ">
              <Dices className="size-4" aria-hidden /> এলোমেলো
            </button>
          </div>
          {!valid.success && <p className="mt-1 font-bengali text-xs text-crimson-bright">বীজে ৩–২৪টি ছোট হাতের ইংরেজি অক্ষর, সংখ্যা বা “-” দিন।</p>}
        </div>
      </div>

      <button type="submit" disabled={!valid.success} className="inline-flex h-12 items-center gap-2 rounded-xl bg-signal-orange px-6 font-bengali text-base font-bold disabled:opacity-40 text-text-primary">
        <Play className="size-5" aria-hidden /> খেলা শুরু
      </button>
    </form>
  );
}

function Select({ label, value, onChange, options, hint }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][]; hint?: string }) {
  const id = `s-${label.replace(/\s+/g, "-")}`;
  return (
    <div>
      <label htmlFor={id} className="font-bengali text-sm font-semibold">{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 block h-11 w-full rounded-xl border border-white/15 bg-black ring-1 ring-white/12 px-3 font-bengali text-sm">
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      {hint && <p className="mt-1 font-bengali text-xs leading-5 text-white/65">{hint}</p>}
    </div>
  );
}
