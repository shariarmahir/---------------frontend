"use client";

import { Bot, Dices, HandHeart, Network, Play, Plus, Radar, ScrollText, ShieldCheck, User, Wrench, X } from "lucide-react";
import { useState } from "react";
import { DIFFICULTIES, ROLES, RULES, type Difficulty, type RoleId } from "@/data/gori/mission";
import { validateConfig, type MissionConfig, type Seat } from "@/lib/gori/mission/engine";
import { PLAYER_COLOR } from "@/lib/gori/mission/layout";
import { bn } from "@/lib/gori/mission/narrate";
import { randomSeed } from "@/lib/gori/rng";
import { cn } from "@/lib/utils";
import { useGori } from "../store";

export const ROLE_ICON: Record<RoleId, typeof Bot> = {
  organizer: HandHeart,
  researcher: ScrollText,
  coordinator: Network,
  engineer: Wrench,
  guardian: ShieldCheck,
  analyst: Radar,
};

const BOT_NAMES = ["বট মন্ত্রী অনন্যা", "বট মন্ত্রী রাফি", "বট মন্ত্রী তৃষা"];

export function MissionSetup({ onStart }: { onStart: (c: MissionConfig) => void }) {
  const me = useGori((s) => s.settings.name);
  const [seats, setSeats] = useState<Seat[]>(() => [
    { name: me || "আপনি", role: "organizer", bot: false },
    { name: BOT_NAMES[0], role: "engineer", bot: true },
    { name: BOT_NAMES[1], role: "researcher", bot: true },
  ]);
  const [difficulty, setDifficulty] = useState<Difficulty>("intro");
  const [seed, setSeed] = useState(() => randomSeed());
  const config: MissionConfig = { seed: seed.trim() || "kandari", difficulty, seats: seats.map((s) => ({ ...s, name: s.name.trim() || "খেলোয়াড়" })) };
  const err = validateConfig(config);
  const taken = new Set(seats.map((s) => s.role));

  const patch = (i: number, p: Partial<Seat>) => setSeats((xs) => xs.map((x, j) => (j === i ? { ...x, ...p } : x)));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!err) onStart(config);
      }}
      className="mx-auto grid max-w-340 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-12 lg:px-8"
      aria-labelledby="mission-setup-title"
    >
      <div className="lg:col-span-7">
        <h2 id="mission-setup-title" className="font-bengali text-2xl font-bold text-white">দল সাজান</h2>
        <p className="mt-1 font-bengali text-sm text-emerald-100/80">
          ২–৪ জন, এক ডিভাইসে পালা করে। খালি আসনে AI বট মন্ত্রী খেলবে — আপনার সহযোদ্ধা, সবাই একসাথে জেতে বা হারে। খেলা শেষে প্রত্যেকের অবদান আলাদা করে দেখানো হয়।
        </p>
        <ol className="mt-5 space-y-3">
          {seats.map((s, i) => (
            <li key={i} className="rounded-2xl bg-gori-panel p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full font-bengali text-base font-extrabold text-gori-ink" style={{ background: PLAYER_COLOR[i] }} aria-hidden>
                  {bn(i + 1)}
                </span>
                <label className="min-w-40 flex-1">
                  <span className="sr-only">খেলোয়াড় {bn(i + 1)}-এর নাম</span>
                  <input
                    value={s.name}
                    onChange={(e) => patch(i, { name: e.target.value.slice(0, 24) })}
                    className="h-11 w-full rounded-xl border border-white/15 bg-black/20 px-3 font-bengali text-white placeholder:text-white/40 focus:border-signal-orange focus:outline-none"
                    placeholder="নাম"
                  />
                </label>
                <div role="radiogroup" aria-label={`খেলোয়াড় ${bn(i + 1)}: মানুষ না বট`} className="flex rounded-xl bg-black/25 p-1">
                  {[false, true].map((bot) => (
                    <button
                      key={String(bot)}
                      type="button"
                      role="radio"
                      aria-checked={s.bot === bot}
                      onClick={() => patch(i, { bot, name: bot && !s.bot ? BOT_NAMES[i % 3] : !bot && s.bot ? (i === 0 && me) || `খেলোয়াড় ${bn(i + 1)}` : s.name })}
                      className={cn("inline-flex h-9 items-center gap-1.5 rounded-lg px-3 font-bengali text-sm font-semibold", s.bot === bot ? "bg-gori-cream text-gori-ink" : "text-emerald-50/80 hover:text-white")}
                    >
                      {bot ? <Bot className="size-4" aria-hidden /> : <User className="size-4" aria-hidden />}
                      {bot ? "AI বট" : "মানুষ"}
                    </button>
                  ))}
                </div>
                {seats.length > 2 && (
                  <button type="button" onClick={() => setSeats((xs) => xs.filter((_, j) => j !== i))} className="inline-flex size-9 items-center justify-center rounded-lg text-emerald-100/70 hover:bg-white/10 hover:text-white" aria-label={`খেলোয়াড় ${bn(i + 1)} সরান`}>
                    <X className="size-4" aria-hidden />
                  </button>
                )}
              </div>
              <fieldset className="mt-3">
                <legend className="sr-only">ভূমিকা</legend>
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                  {ROLES.map((r) => {
                    const Icon = ROLE_ICON[r.id];
                    const on = s.role === r.id;
                    const busy = !on && taken.has(r.id);
                    return (
                      <label
                        key={r.id}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 font-bengali text-sm transition-colors has-focus-visible:ring-2 has-focus-visible:ring-signal-orange",
                          on ? "border-signal-orange bg-signal-orange/15 text-white" : busy ? "cursor-not-allowed border-white/5 text-white/35" : "border-white/10 text-emerald-50/85 hover:border-white/30",
                        )}
                      >
                        <input type="radio" name={`role-${i}`} className="sr-only" checked={on} disabled={busy} onChange={() => patch(i, { role: r.id })} />
                        <Icon className="size-4 shrink-0" aria-hidden />
                        {r.bn}
                      </label>
                    );
                  })}
                </div>
                <p className="mt-2 font-bengali text-[13px] leading-6 text-emerald-100/80">{ROLES.find((r) => r.id === s.role)!.power}</p>
              </fieldset>
            </li>
          ))}
        </ol>
        {seats.length < 4 && (
          <button
            type="button"
            onClick={() => {
              const role = ROLES.find((r) => !taken.has(r.id))!.id;
              setSeats((xs) => [...xs, { name: BOT_NAMES[xs.length % 3], role, bot: true }]);
            }}
            className="mt-3 inline-flex h-11 items-center gap-2 rounded-xl border border-dashed border-white/25 px-4 font-bengali text-sm font-semibold text-emerald-50/90 hover:border-white/50 hover:text-white"
          >
            <Plus className="size-4" aria-hidden /> আসন যোগ করুন
          </button>
        )}
      </div>

      <div className="space-y-5 lg:col-span-5">
        <fieldset className="rounded-2xl bg-gori-cream p-5 text-gori-ink">
          <legend className="float-left mb-3 w-full font-bengali text-lg font-bold">কঠিনতা</legend>
          <div className="clear-both space-y-2">
            {(Object.keys(DIFFICULTIES) as Difficulty[]).map((d) => (
              <label key={d} className={cn("flex cursor-pointer items-start gap-3 rounded-xl border-2 px-3.5 py-2.5 has-focus-visible:ring-2 has-focus-visible:ring-bd-green", difficulty === d ? "border-bd-green bg-white" : "border-transparent hover:bg-white/60")}>
                <input type="radio" name="difficulty" checked={difficulty === d} onChange={() => setDifficulty(d)} className="mt-1.5 accent-bd-green" />
                <span className="font-bengali">
                  <strong className="block">{DIFFICULTIES[d].bn}</strong>
                  <span className="text-sm text-gori-ink-soft">{DIFFICULTIES[d].body}</span>
                </span>
              </label>
            ))}
          </div>
          <label className="mt-4 block font-bengali text-sm font-semibold">
            বীজ (একই বীজে একই ডেক — বন্ধুর সাথে একই চ্যালেঞ্জ খেলুন)
            <span className="mt-1.5 flex gap-2">
              <input value={seed} onChange={(e) => setSeed(e.target.value.slice(0, 24))} className="h-11 min-w-0 flex-1 rounded-xl border border-gori-ink/20 bg-white px-3 font-mono text-sm" />
              <button type="button" onClick={() => setSeed(randomSeed())} className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-gori-ink/20 px-3 font-bengali text-sm font-semibold hover:bg-white" aria-label="নতুন বীজ">
                <Dices className="size-4" aria-hidden />
              </button>
            </span>
          </label>
        </fieldset>

        <section aria-labelledby="how-title" className="rounded-2xl border border-white/10 p-5 font-bengali text-sm leading-7 text-emerald-50/90">
          <h3 id="how-title" className="text-base font-bold text-white">কীভাবে জিতবেন</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 marker:text-signal-orange">
            <li>প্রতি পালায় {bn(RULES.actionsPerTurn)}টি অ্যাকশন: চলাচল, চাপ কমানো, সমন্বয় কেন্দ্র বানানো, কার্ড দেওয়া-নেওয়া, সংস্কার।</li>
            <li>একই স্তম্ভের {bn(RULES.reformCards)}টি কার্ড নিয়ে কেন্দ্রে গেলে সেই স্তম্ভের জাতীয় সংস্কার চালু হয়। চারটি সংস্কার = জয়।</li>
            <li>কোনো মডিউলে {bn(RULES.maxPressure)}-এর বেশি চাপ এলে সেটি ভাঙে, আর যাদের সে খাওয়ায় তাদের সবার উপর চাপ ছড়ায় — শৃঙ্খলে শৃঙ্খলে।</li>
            <li>মূল কারণ (যাদের কেউ খাওয়ায় না) ঠিক রাখলে পুরো শৃঙ্খল শান্ত থাকে। মডিউলে চাপ দিলে ‘ভাঙলে কী হবে’ দেখা যায় — আগে ভাবুন।</li>
            <li>হার: বারবার ভাঙনে জনআস্থা শেষ, অথবা কার্ডের ডেক ফুরিয়ে সময় শেষ।</li>
          </ul>
          <p className="mt-3 text-xs text-emerald-100/70">সংযোগগুলো জাতীয় প্রতিবেদনের যুক্তি বা খেলার অনুমান (ড্যাশ দেওয়া রেখা)। খেলার ফল বাস্তব পূর্বাভাস নয়।</p>
        </section>

        {err && <p role="alert" className="font-bengali text-sm font-semibold text-signal-orange">{err}</p>}
        <button type="submit" disabled={!!err} className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-signal-orange font-bengali text-lg font-extrabold text-gori-ink transition-transform hover:-translate-y-0.5 disabled:opacity-50">
          <Play className="size-5" aria-hidden /> মিশন শুরু
        </button>
      </div>
    </form>
  );
}
