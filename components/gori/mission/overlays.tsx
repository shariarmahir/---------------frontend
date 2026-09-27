"use client";

import { motion } from "framer-motion";
import { Crown, Flame, RotateCcw, Shuffle, Trophy, UsersRound, Zap } from "lucide-react";
import { useEffect } from "react";
import { codeOf } from "@/data/gori/modules";
import { DIFFICULTIES, pillarOf, roleDef } from "@/data/gori/mission";
import { contribution, scoreMission, type LoggedEvent, type MissionState } from "@/lib/gori/mission/engine";
import { PLAYER_COLOR } from "@/lib/gori/mission/layout";
import { bn, titleOf } from "@/lib/gori/mission/narrate";
import { cn } from "@/lib/utils";
import { PillarGlyph } from "./hud";
import { ROLE_ICON } from "./setup";

/** The crisis phase, card by card: what hit, what broke, what the guardian stopped. */
export function CrisisReveal({ batch, reduce, pace, onDone }: { batch: LoggedEvent[]; reduce: boolean; pace: number; onDone: () => void }) {
  const rows = batch.filter((e) => e.type === "escalation" || e.type === "collapse" || (e.type === "pressure" && e.source !== "setup") || e.type === "quiet");
  const escalation = batch.some((e) => e.type === "escalation");
  const collapses = batch.filter((e) => e.type === "collapse").length;
  const step = reduce ? 0 : 0.28 * pace;
  const hold = (reduce ? 1800 : 2200 + rows.length * step * 1000) * Math.max(0.6, pace);

  useEffect(() => {
    const t = window.setTimeout(onDone, hold);
    return () => window.clearTimeout(t);
  }, [hold, onDone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/45 p-4"
      onClick={onDone}
      role="dialog"
      aria-modal="false"
      aria-labelledby="crisis-title"
    >
      <motion.div
        initial={reduce ? false : { scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className={cn("w-full max-w-md rounded-2xl p-5 font-bengali shadow-2xl", escalation ? "bg-national-crimson text-white" : "bg-gori-cream text-gori-ink")}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="crisis-title" className="flex items-center gap-2 text-xl font-extrabold">
          {escalation ? <Zap className="size-6" aria-hidden /> : <Flame className="size-6 text-national-crimson" aria-hidden />}
          {escalation ? "মহাসংকট!" : "সংকট-পর্ব"}
          {collapses > 0 && <span className="ml-auto rounded-full bg-black/80 px-2.5 py-0.5 text-xs text-white">{bn(collapses)}টি ভাঙন</span>}
        </h2>
        <ol className="mt-3 max-h-[50vh] space-y-1 overflow-y-auto text-sm">
          {rows.map((e, i) => (
            <motion.li key={e.seq} initial={reduce ? false : { opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * step }} className="flex items-center gap-2">
              {e.type === "quiet" && <span>শান্ত প্রান্তিক — এবার কোনো সংকট নেই।</span>}
              {e.type === "escalation" && (
                <span className="font-bold">
                  বড় ধাক্কা: {codeOf(e.n)} {titleOf(e.n)} — পুরোনো সংকটগুলো ডেকের উপরে ফিরল
                </span>
              )}
              {e.type === "pressure" && (
                <>
                  <PillarGlyph id={pillarOf(e.n)} />
                  <strong>{codeOf(e.n)}</strong>
                  <span className="truncate">{titleOf(e.n)}</span>
                  <span className={cn("ml-auto shrink-0 font-bold", e.blocked ? "text-emerald-700" : escalation ? "" : "text-national-crimson")}>
                    {e.blocked === "guardian" ? "ঠেকানো গেছে" : e.blocked === "restored" ? "সুস্থ — বসেনি" : `${e.source === "cascade" ? "ঢেউ " : ""}+${bn(e.amount)}`}
                  </span>
                </>
              )}
              {e.type === "collapse" && (
                <span className={cn("w-full rounded-lg px-2 py-1 font-bold", escalation ? "bg-black/30" : "bg-national-crimson text-white")}>
                  ভাঙন: {codeOf(e.n)} {titleOf(e.n)}
                </span>
              )}
            </motion.li>
          ))}
        </ol>
        <button type="button" onClick={onDone} className={cn("mt-4 h-10 w-full rounded-xl font-bold", escalation ? "bg-white text-national-crimson" : "bg-gori-ink text-white")} autoFocus>
          চালিয়ে যান
        </button>
      </motion.div>
    </motion.div>
  );
}

/** Pass-and-play: hand the device to the next person. */
export function Handoff({ state, player, onReady }: { state: MissionState; player: number; onReady: () => void }) {
  const p = state.players[player];
  const Icon = ROLE_ICON[p.role];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-30 flex items-center justify-center bg-gori-deep/85 p-4 backdrop-blur-sm" role="dialog" aria-labelledby="handoff-title">
      <motion.div initial={{ scale: 0.92 }} animate={{ scale: 1 }} className="w-full max-w-sm rounded-3xl bg-gori-cream p-6 text-center font-bengali text-gori-ink">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full text-2xl font-extrabold" style={{ background: PLAYER_COLOR[player] }}>
          {bn(player + 1)}
        </span>
        <h2 id="handoff-title" className="mt-3 text-2xl font-extrabold">{p.name}-এর পালা</h2>
        <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-gori-ink-soft">
          <Icon className="size-4" aria-hidden /> {roleDef(p.role).bn} · {codeOf(p.at)}
        </p>
        <p className="mt-2 text-sm text-gori-ink-soft">ডিভাইসটি {p.name}-কে দিন।</p>
        <button type="button" onClick={onReady} autoFocus className="mt-5 h-12 w-full rounded-2xl bg-signal-orange text-lg font-extrabold">
          আমি প্রস্তুত
        </button>
      </motion.div>
    </motion.div>
  );
}

export function EndScreen({ state, credited, onAgain, onSameSeed, onNewTeam }: { state: MissionState; credited: { xp: number; verified: boolean } | null; onAgain: () => void; onSameSeed: () => void; onNewTeam: () => void }) {
  const win = state.outcome?.result === "win";
  const score = scoreMission(state);
  const ranked = state.players.map((p, i) => ({ p, i, c: contribution(p.stats) })).sort((a, b) => b.c - a.c);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-40 overflow-y-auto bg-gori-deep/90 p-4 backdrop-blur-sm" role="dialog" aria-labelledby="end-title">
      <motion.div initial={{ y: 30, scale: 0.96 }} animate={{ y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 22 }} className="mx-auto my-6 max-w-2xl rounded-3xl bg-gori-cream p-6 font-bengali text-gori-ink sm:p-8">
        <p className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold", win ? "bg-bd-green text-white" : "bg-national-crimson text-white")}>
          {win ? <Trophy className="size-4" aria-hidden /> : <Flame className="size-4" aria-hidden />}
          {DIFFICULTIES[state.config.difficulty].bn} · বীজ {state.config.seed}
        </p>
        <h2 id="end-title" className="mt-3 text-3xl font-extrabold sm:text-4xl">
          {win ? "মিশন সফল — চারটি জাতীয় সংস্কার চালু!" : state.outcome?.reason === "trust" ? "জনআস্থা ফুরিয়ে গেল" : "সময় ফুরিয়ে গেল"}
        </h2>
        <p className="mt-2 text-[15px] leading-7 text-gori-ink-soft">
          {win
            ? `${bn(state.turn)} পালায়, ${bn(state.collapses)}টি ভাঙন সয়ে। মূল কারণগুলো শান্ত রাখা আর কার্ড এক হাতে জমানোই ছিল চাবিকাঠি।`
            : state.outcome?.reason === "trust"
              ? "ভাঙনগুলো শৃঙ্খলে ছড়িয়েছে। পরেরবার ‘ভাঙলে কী হবে?’ দেখে আগে মূল কারণ আর বেশি-খাওয়ানো মডিউলগুলো সামলান।"
              : "সংস্কারের কার্ড সময়মতো এক হাতে জমেনি। কার্ড দেওয়া-নেওয়া আর সমন্বয় কেন্দ্র দিয়ে চলাচল দ্রুত করুন।"}
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <section aria-labelledby="score-title" className="rounded-2xl bg-white p-4">
            <h3 id="score-title" className="flex items-baseline justify-between font-bold">
              স্কোর <span className="text-3xl font-extrabold text-bd-green">{bn(score.total)}</span>
            </h3>
            <ul className="mt-2 space-y-1 text-sm">
              {score.parts.map((p) => (
                <li key={p.id} className="flex justify-between gap-2">
                  <span className="text-gori-ink-soft">{p.bn}</span>
                  <span className="font-semibold">{bn(p.points)}</span>
                </li>
              ))}
            </ul>
            {credited && (
              <p className="mt-3 rounded-lg bg-bd-green/10 px-2.5 py-1.5 text-xs text-bd-green">
                {credited.xp > 0 ? `+${bn(credited.xp)} XP` : "XP আগের সেরা স্কোরেই গোনা আছে"} · {credited.verified ? "খেলাটি পুনরায় চালিয়ে যাচাই করা হয়েছে" : "যাচাই বাকি"}
              </p>
            )}
          </section>
          <section aria-labelledby="mvp-title" className="rounded-2xl bg-white p-4">
            <h3 id="mvp-title" className="flex items-center gap-1.5 font-bold">
              <UsersRound className="size-4" aria-hidden /> কে কী করলেন
            </h3>
            <ol className="mt-2 space-y-2 text-sm">
              {ranked.map(({ p, i, c }, k) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-extrabold" style={{ background: PLAYER_COLOR[i] }}>
                    {bn(i + 1)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="flex items-center gap-1">
                      {p.name} {k === 0 && c > 0 && <Crown className="size-4 text-signal-orange" aria-label="সবচেয়ে বেশি অবদান" />}
                    </strong>
                    <span className="block text-xs text-gori-ink-soft">
                      চাপ কমালেন {bn(p.stats.treated)} · সংস্কার {bn(p.stats.reforms)} · কেন্দ্র {bn(p.stats.hubs)} · কার্ড দিলেন {bn(p.stats.shared)} · ঠেকালেন {bn(p.stats.prevented)}
                    </span>
                  </span>
                  <span className="font-bold">{bn(c)}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button type="button" onClick={onAgain} className="inline-flex h-12 items-center gap-2 rounded-2xl bg-signal-orange px-5 font-extrabold">
            <Shuffle className="size-5" aria-hidden /> একই দল, নতুন ডেক
          </button>
          <button type="button" onClick={onSameSeed} className="inline-flex h-12 items-center gap-2 rounded-2xl border-2 border-bd-green px-4 font-bold text-bd-green hover:bg-white">
            <RotateCcw className="size-5" aria-hidden /> একই বীজে আবার
          </button>
          <button type="button" onClick={onNewTeam} className="inline-flex h-12 items-center gap-2 rounded-2xl px-4 font-semibold text-gori-ink-soft hover:bg-white">
            নতুন দল সাজান
          </button>
        </div>
        <p className="mt-4 text-xs text-gori-mute">খেলার মডেল — কোনো ফল বাস্তব জাতীয় উন্নয়নের পূর্বাভাস বা দাবি নয়।</p>
      </motion.div>
    </motion.div>
  );
}
