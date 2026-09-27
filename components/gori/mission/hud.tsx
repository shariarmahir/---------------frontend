"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Flame, Hourglass, Layers, ShieldAlert, Sparkles as SparkleIcon, Zap } from "lucide-react";
import { useState } from "react";
import { codeOf } from "@/data/gori/modules";
import { DIFFICULTIES, PILLARS, pillarOf, policyDef, roleDef, RULES } from "@/data/gori/mission";
import { cardsOf, crisisRate, reformNeed, trustOf, type Card, type MissionState } from "@/lib/gori/mission/engine";
import { PILLAR_COLOR, PILLAR_SHAPE, PLAYER_COLOR } from "@/lib/gori/mission/layout";
import { bn, narrate, titleOf } from "@/lib/gori/mission/narrate";
import { cn } from "@/lib/utils";
import { ROLE_ICON } from "./setup";

/* ------------------------------------------------------------------ */

export function PillarGlyph({ id, className }: { id: keyof typeof PILLAR_SHAPE; className?: string }) {
  const c = PILLAR_COLOR[id];
  return (
    <svg viewBox="-10 -10 20 20" className={cn("size-3.5 shrink-0", className)} aria-hidden>
      {PILLAR_SHAPE[id] === "sphere" && <circle r={8} fill={c} />}
      {PILLAR_SHAPE[id] === "box" && <rect x={-7} y={-7} width={14} height={14} rx={2} fill={c} />}
      {PILLAR_SHAPE[id] === "octa" && <path d="M0 -9 L9 0 L0 9 L-9 0 Z" fill={c} />}
      {PILLAR_SHAPE[id] === "cone" && <path d="M0 -9 L9 7 L-9 7 Z" fill={c} />}
    </svg>
  );
}

/** Trust, crisis rate, reforms, time. */
export function StatusBar({ state }: { state: MissionState }) {
  const trust = trustOf(state);
  const turnsLeft = Math.floor(state.playerDeck.length / 2);
  const [pile, setPile] = useState(false);
  return (
    <div className="border-b border-white/10 bg-black/20">
      <div className="no-scrollbar relative mx-auto flex max-w-400 items-center gap-x-6 gap-y-2 overflow-x-auto px-4 py-2.5 font-bengali text-sm text-emerald-50/90 sm:px-6">
        <div className="flex shrink-0 items-center gap-2" title="প্রতিটি ভাঙনে এক ঘর কমে; শূন্য হলে মিশন ব্যর্থ">
          <ShieldAlert className="size-4 text-national-crimson" aria-hidden />
          <span className="font-semibold">জনআস্থা</span>
          <span className="flex gap-0.5" role="meter" aria-valuemin={0} aria-valuemax={trust} aria-valuenow={Math.max(0, trust - state.collapses)} aria-label="জনআস্থা">
            {Array.from({ length: trust }, (_, i) => (
              <motion.span
                key={i}
                initial={false}
                animate={{ scale: i < trust - state.collapses ? 1 : 0.7 }}
                className={cn("block h-3.5 w-2.5 rounded-sm", i < trust - state.collapses ? "bg-emerald-300" : "bg-national-crimson/70")}
              />
            ))}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2" title="প্রতি পালার শেষে এতগুলো সংকট-কার্ড উঠবে; প্রতিটি মহাসংকটে বাড়ে">
          <Flame className="size-4 text-signal-orange" aria-hidden />
          <span className="font-semibold">সংকট-হার</span>
          <span className="flex items-center gap-1">
            {RULES.rate.map((r, i) => (
              <span key={i} className={cn("flex size-5 items-center justify-center rounded text-[11px] font-bold", i === Math.min(state.escalations, RULES.rate.length - 1) ? "bg-signal-orange text-gori-ink" : i < state.escalations ? "bg-white/10 text-white/40" : "bg-white/5 text-white/60")}>
                {bn(r)}
              </span>
            ))}
          </span>
          <span className="sr-only">এখন প্রতি পালায় {bn(crisisRate(state))}টি</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Zap className="size-4 text-amber-300" aria-hidden />
          <span className="font-semibold">মহাসংকট</span>
          <span>
            {bn(state.escalations)}/{bn(DIFFICULTIES[state.config.difficulty].escalations)}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2" title="ডেক ফুরোলে সময় শেষ">
          <Hourglass className="size-4 text-sky-300" aria-hidden />
          <span className="font-semibold">সময়</span>
          <span>≈ {bn(turnsLeft)} পালা</span>
        </div>
        <ul className="flex shrink-0 items-center gap-1.5" aria-label="জাতীয় সংস্কার">
          {PILLARS.map((p) => {
            const st = state.reforms[p.id];
            return (
              <li key={p.id} className={cn("flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold", st === "open" ? "border-white/15 text-emerald-50/80" : "border-transparent text-gori-ink")} style={st !== "open" ? { background: PILLAR_COLOR[p.id] } : undefined}>
                <PillarGlyph id={p.id} className={st !== "open" ? "opacity-0" : ""} />
                {p.bn}
                {st === "reformed" && <CheckCircle2 className="size-3.5" aria-label="সংস্কার চালু" />}
                {st === "restored" && <SparkleIcon className="size-3.5" aria-label="পুরোপুরি সুস্থ" />}
              </li>
            );
          })}
        </ul>
        <div className="relative ml-auto shrink-0">
          <button type="button" onClick={() => setPile((v) => !v)} aria-expanded={pile} className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold hover:bg-white/10">
            <Layers className="size-4" aria-hidden /> ফিরে আসতে পারে: {bn(state.crisisDiscard.length)}
          </button>
          {pile && (
            <div className="absolute right-0 z-30 mt-1 w-72 rounded-xl bg-gori-cream p-3 text-gori-ink shadow-2xl">
              <p className="text-xs leading-5 text-gori-ink-soft">বাতিল সংকট-স্তূপ। প্রতিটি মহাসংকটে এগুলো ফেঁটে ডেকের উপরে ফেরে — তাই এরাই আগামী পালাগুলোর সবচেয়ে সম্ভাব্য সংকট।</p>
              <ul className="mt-2 max-h-56 space-y-1 overflow-y-auto text-[13px]">
                {state.crisisDiscard.map((n) => (
                  <li key={n} className="flex items-center gap-2">
                    <PillarGlyph id={pillarOf(n)} />
                    <span className="font-semibold">{codeOf(n)}</span>
                    <span className="truncate">{titleOf(n)}</span>
                    <span className="ml-auto shrink-0 text-national-crimson">{"■".repeat(state.pressure[n])}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function PlayersPanel({ state, actor, onSelect }: { state: MissionState; actor: number; onSelect: (n: number) => void }) {
  return (
    <ol className="space-y-2" aria-label="খেলোয়াড়">
      {state.players.map((p, i) => {
        const Icon = ROLE_ICON[p.role];
        const active = i === actor && !state.outcome;
        return (
          <li key={i} className={cn("rounded-xl border p-3 transition-colors", active ? "border-signal-orange bg-signal-orange/10" : "border-white/10 bg-gori-panel")} aria-current={active ? "step" : undefined}>
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full font-bengali text-sm font-extrabold text-gori-ink" style={{ background: PLAYER_COLOR[i] }}>
                {bn(i + 1)}
              </span>
              <div className="min-w-0 flex-1 font-bengali">
                <p className="truncate text-sm font-bold text-white">
                  {p.name} {p.bot && <span className="ml-1 rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-100">AI</span>}
                </p>
                <p className="flex items-center gap-1 text-xs text-emerald-100/80" title={roleDef(p.role).power}>
                  <Icon className="size-3.5" aria-hidden /> {roleDef(p.role).bn}
                </p>
              </div>
              <button type="button" onClick={() => onSelect(p.at)} className="shrink-0 rounded-md bg-black/25 px-2 py-1 font-bengali text-xs font-semibold text-white hover:bg-black/40" aria-label={`${p.name} আছেন ${codeOf(p.at)} ${titleOf(p.at)} — বোর্ডে দেখুন`}>
                {codeOf(p.at)}
              </button>
            </div>
            {active && state.phase === "actions" && (
              <p className="mt-2 flex items-center gap-1.5 font-bengali text-xs text-emerald-50/90">
                অ্যাকশন বাকি
                {Array.from({ length: RULES.actionsPerTurn }, (_, k) => (
                  <span key={k} className={cn("block size-2.5 rounded-full", k < state.actionsLeft ? "bg-signal-orange" : "bg-white/15")} />
                ))}
                <span className="sr-only">{bn(state.actionsLeft)}</span>
              </p>
            )}
            <div className="mt-2 flex items-center gap-2 font-bengali text-[11px] text-emerald-100/75">
              <span>হাতে {bn(p.hand.length)}/{bn(RULES.handLimit)}</span>
              <span className="flex items-center gap-1.5">
                {PILLARS.map((pl) => {
                  const c = cardsOf(p, pl.id).length;
                  return c ? (
                    <span key={pl.id} className="flex items-center gap-0.5" title={`${pl.bn}: ${bn(c)}/${bn(reformNeed(p))}`}>
                      <PillarGlyph id={pl.id} className="size-3" />
                      {bn(c)}
                    </span>
                  ) : null;
                })}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------------------------------------------ */

export function CardFace({ card, small }: { card: Card; small?: boolean }) {
  if (card.kind === "policy")
    return (
      <span className="flex h-full flex-col">
        <span className="font-bengali text-[11px] font-semibold text-amber-900/80">নীতি-কার্ড</span>
        <span className={cn("font-bengali leading-tight font-extrabold", small ? "text-sm" : "text-base")}>{policyDef(card.id).bn}</span>
        {!small && <span className="mt-1 line-clamp-3 font-bengali text-[11px] leading-4 text-gori-ink-soft">{policyDef(card.id).body}</span>}
      </span>
    );
  if (card.kind === "escalation") return <span className="font-bengali font-bold">মহাসংকট</span>;
  const pillar = pillarOf(card.n);
  return (
    <span className="flex h-full flex-col">
      <span className="flex items-center gap-1.5 font-bengali text-[11px] font-semibold text-gori-ink-soft">
        <PillarGlyph id={pillar} /> {PILLARS.find((p) => p.id === pillar)!.bn}
      </span>
      <span className={cn("font-extrabold", small ? "text-sm" : "text-lg")}>{codeOf(card.n)}</span>
      {!small && <span className="line-clamp-2 font-bengali text-xs leading-4 text-gori-ink-soft">{titleOf(card.n)}</span>}
    </span>
  );
}

export function Hand({ state, player, onCard, selectedCard }: { state: MissionState; player: number; onCard: (i: number) => void; selectedCard: number | null }) {
  const p = state.players[player];
  return (
    <section aria-label={`${p.name}-এর হাতের কার্ড`} className="min-w-0">
      <h3 className="mb-2 font-bengali text-sm font-bold text-white">
        {p.name}-এর হাত <span className="font-normal text-emerald-100/75">· {bn(p.hand.length)}/{bn(RULES.handLimit)} · কার্ডে চাপ দিন</span>
      </h3>
      <ul className="no-scrollbar relative flex gap-2 overflow-x-auto pb-2">
        <AnimatePresence initial={false}>
          {p.hand.map((c, i) => (
            <motion.li
              key={`${c.kind}-${c.kind === "node" ? c.n : c.kind === "policy" ? c.id : i}`}
              layout
              initial={{ opacity: 0, y: 30, rotate: -4 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, y: -30, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className="shrink-0"
            >
              <button
                type="button"
                onClick={() => onCard(i)}
                aria-pressed={selectedCard === i}
                className={cn(
                  "relative h-32 w-32 overflow-hidden rounded-xl p-2.5 pl-3.5 text-left text-gori-ink shadow-[0_8px_20px_-12px_rgb(0_0_0/0.8)] transition-transform hover:-translate-y-1.5 focus-visible:-translate-y-1.5 focus-visible:outline-2 focus-visible:outline-signal-orange",
                  c.kind === "policy" ? "bg-amber-100" : "bg-gori-cream",
                  selectedCard === i && "-translate-y-2 ring-3 ring-signal-orange",
                )}
              >
                <span className={cn("absolute inset-y-0 left-0 w-1.5", c.kind !== "node" && "bg-signal-orange")} style={c.kind === "node" ? { background: PILLAR_COLOR[pillarOf(c.n)] } : undefined} aria-hidden />
                <CardFace card={c} />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export function Log({ state }: { state: MissionState }) {
  const lines = state.events
    .slice(-80)
    .map((e) => ({ e, text: narrate(state, e) }))
    .filter((x): x is { e: (typeof state.events)[number]; text: string } => !!x.text)
    .slice(-40)
    .reverse();
  return (
    <section aria-label="ঘটনার খাতা">
      <h3 className="mb-2 font-bengali text-sm font-bold text-white">ঘটনার খাতা</h3>
      <ol className="max-h-72 space-y-1 overflow-y-auto pr-1 font-bengali text-[13px] leading-5">
        {lines.map(({ e, text }) => (
          <li
            key={e.seq}
            className={cn(
              e.type === "collapse" || e.type === "escalation" ? "font-semibold text-red-300" : e.type === "reform" || e.type === "restored" || e.type === "over" ? "font-semibold text-amber-200" : e.type === "turn" ? "pt-1 text-emerald-200/70" : "text-emerald-50/85",
            )}
          >
            {text}
          </li>
        ))}
      </ol>
    </section>
  );
}
