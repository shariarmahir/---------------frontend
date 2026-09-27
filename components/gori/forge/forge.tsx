"use client";

import { useRouter } from "next/navigation";
import { Download, Hammer, Loader2, Play, Send, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { randomSeed } from "@/lib/gori/rng";
import { defaultConfig, scenarioOf } from "@/lib/gori/sim/engine";
import { configSummary } from "@/lib/gori/sim/report";
import { configSchema, CONTEXTS, type SimConfig } from "@/lib/gori/sim/types";
import { cn } from "@/lib/utils";
import { useAgent } from "../ai-panel";
import { useT } from "../provider";
import { BASE, LockedNotice, useFeature } from "../shell";
import { useGori, useHydrated } from "../store";

const sc = scenarioOf("health-access");

/**
 * Scenario forge — the player's own variants of the playable scenario.
 * Saved in this browser after an automated moderation check. Promotion to
 * other players needs a server and human review (TODO backend).
 */
export function Forge() {
  const hydrated = useHydrated();
  const open = useFeature("forge");
  const list = useGori((s) => s.forge);
  const saveForge = useGori((s) => s.saveForge);
  const removeForge = useGori((s) => s.removeForge);
  const startGame = useGori((s) => s.startGame);
  const router = useRouter();
  const { n } = useT();
  const moderator = useAgent();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [c, setC] = useState<SimConfig>(() => defaultConfig({ mode: "sandbox", seed: randomSeed() }));
  const set = (p: Partial<SimConfig>) => setC((x) => ({ ...x, ...p }));

  if (!hydrated) return null;
  if (!open) return <div className="px-4 py-12"><LockedNotice feature="forge" /></div>;

  const valid = name.trim().length >= 3 && description.trim().length >= 10 && configSchema.safeParse(c).success;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    const a = await moderator.ask({ agent: "moderation", text: `${name.trim()}\n${description.trim()}` });
    if (!a || a.agent !== "moderation") return;
    if (a.moderation.verdict === "block") {
      toast.error("সংরক্ষণ হয়নি", { description: a.moderation.reasons.join(" ") });
      return;
    }
    saveForge({ id: `${Date.now()}`, name: name.trim(), description: description.trim(), config: c, moderation: { ...a.moderation, mode: a.mode }, createdAt: new Date().toISOString() });
    toast.success("দৃশ্যকল্প সংরক্ষিত", { description: a.moderation.verdict === "review" ? "প্রকাশের আগে মানুষের পর্যালোচনা লাগবে।" : "এই ব্রাউজারে সংরক্ষিত।" });
    setName("");
    setDescription("");
  }

  function exportJson(id: string) {
    const f = list.find((x) => x.id === id);
    if (!f) return;
    const blob = new Blob([JSON.stringify({ format: "gori-scenario-1", ...f }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gori-scenario-${f.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const field = "mt-1 block w-full rounded-xl border border-gori-ink/15 bg-white px-3 font-bengali text-sm";
  const sel = (label: string, value: string, onChange: (v: string) => void, opts: [string, string][]) => (
    <label key={label} className="font-bengali text-sm font-semibold">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} className={cn(field, "h-11")}>
        {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );

  return (
    <div className="mx-auto max-w-340 px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="flex items-center gap-3 font-bengali text-3xl font-bold text-signal-orange"><Hammer className="size-8" aria-hidden /> দৃশ্যকল্প কারখানা</h1>
      <p className="mt-2 max-w-[70ch] font-bengali text-emerald-50/85">
        BD-001-এর মডেলে নিজের দৃশ্যকল্প সাজান — প্রেক্ষাপট, সম্পদ, ঘটনা, অনুমান। নাম আর বিবরণ মডারেশনে পরীক্ষা হয়। দৃশ্যকল্প আপাতত এই ব্রাউজারেই থাকে; অন্যদের জন্য প্রকাশ করতে সার্ভার আর মানুষের পর্যালোচনা লাগবে।
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <form onSubmit={save} className="space-y-4 rounded-2xl bg-gori-cream p-5 text-gori-ink" aria-label="নতুন দৃশ্যকল্প">
          <label className="block font-bengali text-sm font-semibold">
            নাম
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} className={cn(field, "h-11")} placeholder="যেমন: হাওরে বর্ষার আগে প্রস্তুতি" />
          </label>
          <label className="block font-bengali text-sm font-semibold">
            বিবরণ — কী শেখাতে চান
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={400} rows={3} className={cn(field, "py-2")} />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            {sel("প্রেক্ষাপট", c.context, (v) => set({ context: v as SimConfig["context"] }), CONTEXTS.map((id) => [id, sc.contexts.find((x) => x.id === id)!.bn]))}
            {sel("বাজেট", c.budget, (v) => set({ budget: v as SimConfig["budget"] }), [["low", "কম"], ["mid", "মাঝারি"], ["high", "বেশি"]])}
            {sel("কর্মী", c.workforce, (v) => set({ workforce: v as SimConfig["workforce"] }), [["low", "কম"], ["mid", "মাঝারি"], ["high", "বেশি"]])}
            {sel("ঘটনা", c.events, (v) => set({ events: v as SimConfig["events"] }), [["off", "বন্ধ"], ["low", "কম"], ["normal", "স্বাভাবিক"], ["high", "বেশি"]])}
            {sel("প্রমাণের প্রাপ্যতা", c.evidence, (v) => set({ evidence: v as SimConfig["evidence"] }), [["low", "কম"], ["mid", "মাঝারি"], ["high", "বেশি"]])}
            {sel("রক্ষণাবেক্ষণের চাপ", c.maintenance, (v) => set({ maintenance: v as SimConfig["maintenance"] }), [["low", "কম"], ["mid", "মাঝারি"], ["high", "বেশি"]])}
            {sel("কাঠিন্য", c.difficulty, (v) => set({ difficulty: v as SimConfig["difficulty"] }), [["easy", "সহজ"], ["normal", "স্বাভাবিক"], ["hard", "কঠিন"]])}
            {sel("অংশীজন", c.stakeholders, (v) => set({ stakeholders: v as SimConfig["stakeholders"] }), [["simple", "সরল"], ["full", "পূর্ণ"]])}
          </div>
          <label className="block font-bengali text-sm font-semibold">
            সময়সীমা: {n(c.horizon)} প্রান্তিক
            <input type="range" min={4} max={16} value={c.horizon} onChange={(e) => set({ horizon: Number(e.target.value) })} className="mt-2 block w-full accent-[#006747]" />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            {sc.assumptions.map((a) =>
              sel(a.bn, c.assumptions[a.id] ?? "mid", (v) => set({ assumptions: { ...c.assumptions, [a.id]: v as "low" | "mid" | "high" } }), (["low", "mid", "high"] as const).map((k) => [k, a.optionBn[k]])),
            )}
          </div>
          <button type="submit" disabled={!valid || moderator.status === "loading"} className="inline-flex h-12 items-center gap-2 rounded-xl bg-signal-orange px-6 font-bengali font-bold disabled:opacity-40">
            {moderator.status === "loading" ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <Hammer className="size-5" aria-hidden />} মডারেশন করে সংরক্ষণ
          </button>
          {!valid && <p className="font-bengali text-xs text-gori-mute">নাম (৩+ অক্ষর) আর বিবরণ (এক বাক্য) দিন।</p>}
        </form>

        <section aria-labelledby="mine-title">
          <h2 id="mine-title" className="font-bengali text-lg font-bold">আপনার দৃশ্যকল্প</h2>
          {list.length ? (
            <ul className="mt-3 space-y-3">
              {list.map((f) => (
                <li key={f.id} className="rounded-2xl bg-gori-panel p-4">
                  <p className="font-bengali font-bold">{f.name}</p>
                  <p className="font-bengali text-sm text-emerald-50/85">{f.description}</p>
                  <p className="mt-1 font-bengali text-xs text-emerald-100/70">{configSummary(sc, f.config)}</p>
                  {f.moderation && (
                    <p className={cn("mt-2 inline-flex rounded-full px-2.5 py-0.5 font-bengali text-xs font-semibold", f.moderation.verdict === "allow" ? "bg-emerald-900/60 text-emerald-100" : "bg-amber-900/60 text-amber-100")}>
                      মডারেশন ({f.moderation.mode === "claude" ? "Claude" : "অফলাইন ফিল্টার"}): {f.moderation.verdict === "allow" ? "প্রকাশযোগ্য" : "মানুষের পর্যালোচনা দরকার"}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => { startGame({ ...f.config, mode: "sandbox" }); router.push(`${BASE}/play`); }} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-signal-orange px-3 font-bengali text-sm font-bold text-gori-ink">
                      <Play className="size-4" aria-hidden /> খেলুন
                    </button>
                    <button type="button" onClick={() => exportJson(f.id)} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white/10 px-3 font-bengali text-sm">
                      <Download className="size-4" aria-hidden /> JSON
                    </button>
                    <button type="button" disabled title="সার্ভার আর মানুষের পর্যালোচনা যুক্ত হলে চালু হবে" className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white/5 px-3 font-bengali text-sm opacity-50">
                      <Send className="size-4" aria-hidden /> প্রকাশের জন্য জমা (শীঘ্রই)
                    </button>
                    <button type="button" onClick={() => removeForge(f.id)} className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 font-bengali text-sm hover:bg-white/10">
                      <Trash2 className="size-4" aria-hidden /> মুছুন
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 rounded-2xl border border-white/15 p-5 font-bengali text-sm text-emerald-100/80">এখনো কোনো দৃশ্যকল্প নেই।</p>
          )}
        </section>
      </div>
    </div>
  );
}
