"use client";

import { AnimatePresence, useReducedMotion } from "framer-motion";
import { Box, Gauge, Lightbulb, Loader2, LogOut, Map as MapIcon, SkipForward, Undo2 } from "lucide-react";
import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { codeOf } from "@/data/gori/modules";
import { PILLARS, roleDef, type PolicyId } from "@/data/gori/mission";
import { botStep, suggest, type Hint } from "@/lib/gori/mission/bot";
import { cascadePreview, missionKey, NODES, type LoggedEvent, type MissionAction, type MissionConfig, type MissionState } from "@/lib/gori/mission/engine";
import { bn, narrate, titleOf } from "@/lib/gori/mission/narrate";
import { challengeKey, grant, recordRun } from "@/lib/gori/progression";
import { randomSeed } from "@/lib/gori/rng";
import { cn } from "@/lib/utils";
import { useGori } from "../store";
import Board2D from "./board-2d";
import type { Pulse } from "./board-types";
import { DiscardDialog, PeekDialog, PolicyDialog } from "./dialogs";
import { Hand, Log, PillarGlyph, PlayersPanel, StatusBar } from "./hud";
import { NodePanel } from "./node-panel";
import { CrisisReveal, EndScreen, Handoff } from "./overlays";
import { MissionSetup } from "./setup";
import { hydrateMission, useMission, useMissionHydrated } from "./store";

const Board3D = dynamic(() => import("./board-3d"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center gap-2 font-bengali text-sm text-emerald-100/80">
      <Loader2 className="size-4 animate-spin" aria-hidden /> ৩D বোর্ড লোড হচ্ছে…
    </div>
  ),
});

const DELAY = { slow: 1200, normal: 700, fast: 260 } as const;
const PACE = { slow: 1.4, normal: 1, fast: 0.6 } as const;

/* ------------------------------------------------------------------ *
 * 3D capability (CLAUDE.md §6: 3D only on capable devices)
 * ------------------------------------------------------------------ */

let capable: boolean | null = null;
function detect3D(): boolean {
  if (capable !== null) return capable;
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    const cores = navigator.hardwareConcurrency ?? 8;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    capable = !!gl && window.innerWidth >= 768 && cores >= 4 && memory >= 4;
  } catch {
    capable = false;
  }
  return capable;
}
const noop = () => () => {};
const useCan3D = () => useSyncExternalStore(noop, detect3D, () => false);

class BoardBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/* ------------------------------------------------------------------ */

export function MissionGame() {
  useEffect(() => {
    hydrateMission();
  }, []);
  const hydrated = useMissionHydrated();
  const state = useMission((s) => s.state);
  const start = useMission((s) => s.start);

  if (!hydrated) return <div className="h-[70vh]" aria-busy="true" />;
  if (!state) return <MissionSetup onStart={start} />;
  return <MissionTable state={state} />;
}

function MissionTable({ state }: { state: MissionState }) {
  const act = useMission((s) => s.act);
  const undo = useMission((s) => s.undo);
  const undoable = useMission((s) => s.undoable);
  const quit = useMission((s) => s.quit);
  const start = useMission((s) => s.start);
  const board = useMission((s) => s.board);
  const setBoard = useMission((s) => s.setBoard);
  const speed = useMission((s) => s.speed);
  const setSpeed = useMission((s) => s.setSpeed);
  const setProgress = useGori((s) => s.setProgress);
  const motionSetting = useGori((s) => s.settings.motion);
  const systemReduce = useReducedMotion();
  const reduce = !!systemReduce || motionSetting === "reduce";
  const can3D = useCan3D();
  const use3D = board === "3d" || (board === "auto" && can3D);

  const actor = state.phase === "discard" && state.discard ? state.discard.player : state.current;
  const actorP = state.players[actor];
  const humans = state.players.filter((p) => !p.bot).length;

  const [selected, setSelected] = useState(() => state.players[state.current].at);
  const [hover, setHover] = useState<number | null>(null);
  const [preview, setPreview] = useState(false);
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [reveal, setReveal] = useState<LoggedEvent[] | null>(null);
  const [handoff, setHandoff] = useState<number | null>(null);
  const [policy, setPolicy] = useState<PolicyId | null>(null);
  const [peek, setPeek] = useState(false);
  const [hint, setHint] = useState<Hint | null>(null);
  const [cardSel, setCardSel] = useState<number | null>(null);
  const [announce, setAnnounce] = useState("");
  const [credit, setCredit] = useState<{ xp: number; verified: boolean } | null>(null);

  /** Apply an action, then turn its new events into board effects and announcements. */
  const run = useCallback(
    (a: MissionAction) => {
      const before = useMission.getState().state;
      if (!before) return;
      try {
        act(a);
      } catch {
        return;
      }
      const after = useMission.getState().state!;
      const fresh = after.events.slice(before.events.length);
      setHint(null);
      setCardSel(null);
      setPolicy(null);
      setPeek(false);

      const ps: Pulse[] = fresh.flatMap((e): Pulse[] =>
        e.type === "collapse" ? [{ key: e.seq, n: e.n, kind: "collapse" }] : e.type === "treat" ? [{ key: e.seq, n: e.n, kind: "treat" }] : e.type === "reform" ? [{ key: e.seq, n: 1, kind: "reform" }] : [],
      );
      if (ps.length) {
        setPulses((p) => [...p, ...ps]);
        window.setTimeout(() => setPulses((p) => p.filter((x) => !ps.includes(x))), 1900);
      }
      if (fresh.some((e) => e.type === "crisis" || e.type === "escalation" || e.type === "quiet")) setReveal(fresh);

      const moved = [...fresh].reverse().find((e) => e.type === "move");
      if (moved && moved.type === "move") setSelected(moved.to);
      const turn = [...fresh].reverse().find((e) => e.type === "turn");
      if (turn && turn.type === "turn" && !after.outcome) {
        const p = after.players[turn.player];
        setSelected(p.at);
        setPreview(false);
        if (!p.bot && humans > 1) setHandoff(turn.player);
      }
      const lines = fresh.filter((e) => ["collapse", "reform", "restored", "over", "escalation", "turn"].includes(e.type)).map((e) => narrate(after, e));
      if (lines.length) setAnnounce(lines.filter(Boolean).join(" "));
    },
    [act, humans],
  );

  const busy = !!reveal || handoff !== null || !!state.outcome || policy !== null || peek;

  // Bots take their turns, one visible action at a time.
  useEffect(() => {
    if (busy || !actorP.bot) return;
    const t = window.setTimeout(() => {
      const s = useMission.getState().state;
      if (s && !s.outcome) run(botStep(s));
    }, DELAY[speed]);
    return () => window.clearTimeout(t);
  }, [state, busy, actorP.bot, speed, run]);

  // A finished game is replayed on the server; XP comes from its answer.
  const outcome = state.outcome;
  useEffect(() => {
    if (!outcome) return;
    const { config, actions, credited, setCredited } = useMission.getState();
    if (!config) return;
    const key = missionKey(config, actions);
    if (credited === key) return;
    let alive = true;
    void (async () => {
      let verified = false;
      let total = 0;
      let runKey = key;
      try {
        const r = await fetch("/api/gori/mission", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ config, actions }) });
        if (r.ok) {
          const j = (await r.json()) as { total: number; runKey: string };
          total = j.total;
          runKey = j.runKey;
          verified = true;
        }
      } catch {
        // Offline: the game stands, XP waits for a verified replay.
      }
      if (!alive) return;
      let xp = 0;
      if (verified) {
        const at = new Date().toISOString();
        setProgress((p) => {
          const r = recordRun(p, challengeKey("mission", config.difficulty, "all"), runKey, total, at);
          xp = r.xpGained;
          return outcome.result === "win" ? grant(r.progress, ["mission"], at).progress : r.progress;
        });
        setCredited(key);
      }
      setCredit({ xp, verified });
    })();
    return () => {
      alive = false;
    };
  }, [outcome, setProgress]);

  const me = !actorP.bot && state.phase === "actions" && !state.outcome && handoff === null ? state.current : null;
  const highlight = preview ? cascadePreview(state, selected) : null;
  const boardProps = { state, current: actor, selected, focus: hover, highlight, pulses, reduce, onSelect: setSelected, onHover: setHover };

  // Start the scrolling phone board centred on the map.
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
  }, [use3D]);

  const restart = (config: MissionConfig) => {
    setCredit(null);
    setReveal(null);
    setHandoff(null);
    start(config);
    setSelected(1);
  };

  const hintNow = () => {
    const h = suggest(state);
    setHint(h);
    if (h && "to" in h.action && typeof h.action.to === "number") setSelected(h.action.to);
  };

  return (
    <div className="relative">
      <StatusBar state={state} />

      <div className="mx-auto grid max-w-400 gap-4 px-3 py-4 sm:px-6 xl:grid-cols-[250px_minmax(0,1fr)_360px]">
        <aside className="order-3 space-y-5 xl:order-1" aria-label="দল ও ঘটনা">
          <PlayersPanel state={state} actor={actor} onSelect={setSelected} />
          <Log state={state} />
        </aside>

        <div className="order-1 min-w-0 space-y-3 xl:order-2">
          {/* Turn bar */}
          <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-gori-panel px-3 py-2.5 font-bengali">
            <p className="mr-auto text-sm text-emerald-50/90">
              <strong className="text-base text-white">{actorP.name}</strong> · {roleDef(actorP.role).bn}
              {state.phase === "discard" ? " · হাতের কার্ড কমাতে হবে" : ` · অ্যাকশন বাকি ${bn(state.actionsLeft)}`}
              {actorP.bot && !state.outcome && (
                <span className="ml-2 inline-flex items-center gap-1 text-emerald-200">
                  <Loader2 className="size-3.5 animate-spin" aria-hidden /> AI ভাবছে…
                </span>
              )}
            </p>
            {me !== null && (
              <>
                <button type="button" onClick={hintNow} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-amber-300 px-3 text-sm font-bold text-gori-ink hover:bg-amber-200">
                  <Lightbulb className="size-4" aria-hidden /> পরামর্শ
                </button>
                <button type="button" onClick={undo} disabled={!undoable} className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-40" title="এই পালার শেষ অ্যাকশন ফিরিয়ে নিন (কার্ড ওঠার আগে)">
                  <Undo2 className="size-4" aria-hidden /> ফিরিয়ে নিন
                </button>
                <button type="button" onClick={() => run({ type: "end" })} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white/10 px-3 text-sm font-bold text-white hover:bg-white/20">
                  <SkipForward className="size-4" aria-hidden /> পালা শেষ{state.actionsLeft > 0 ? ` (${bn(state.actionsLeft)} বাদ)` : ""}
                </button>
              </>
            )}
            <span className="mx-1 hidden h-6 w-px bg-white/15 sm:block" aria-hidden />
            <div role="radiogroup" aria-label="বোর্ড" className="flex rounded-lg bg-black/25 p-0.5">
              {(["3d", "2d"] as const).map((b) => (
                <button key={b} type="button" role="radio" aria-checked={use3D === (b === "3d")} onClick={() => setBoard(b)} className={cn("inline-flex h-8 items-center gap-1 rounded-md px-2.5 text-xs font-bold", use3D === (b === "3d") ? "bg-gori-cream text-gori-ink" : "text-emerald-50/80 hover:text-white")}>
                  {b === "3d" ? <Box className="size-3.5" aria-hidden /> : <MapIcon className="size-3.5" aria-hidden />}
                  {b === "3d" ? "৩D" : "২D"}
                </button>
              ))}
            </div>
            <label className="inline-flex items-center gap-1 text-xs text-emerald-50/80">
              <Gauge className="size-3.5" aria-hidden />
              <span className="sr-only">বটের গতি</span>
              <select value={speed} onChange={(e) => setSpeed(e.target.value as typeof speed)} className="h-8 rounded-md bg-black/25 px-1.5 text-xs text-white">
                <option value="slow">ধীরে</option>
                <option value="normal">স্বাভাবিক</option>
                <option value="fast">দ্রুত</option>
              </select>
            </label>
            <button
              type="button"
              onClick={() => {
                if (window.confirm("মিশন ছেড়ে দেবেন? এই খেলা মুছে যাবে।")) quit();
              }}
              className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs text-emerald-50/70 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="size-3.5" aria-hidden /> ছাড়ুন
            </button>
          </div>

          {hint && (
            <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-amber-100 px-4 py-3 font-bengali text-sm text-gori-ink" role="status">
              <Lightbulb className="size-5 shrink-0 text-amber-700" aria-hidden />
              <p className="min-w-0 flex-1 leading-6">
                <strong>পরামর্শ:</strong> {hint.reason} <span className="text-gori-ink-soft">(বটের হিসাব — ভুলও হতে পারে)</span>
              </p>
              <button type="button" onClick={() => run(hint.action)} className="h-9 rounded-lg bg-gori-ink px-3 font-bold text-white">
                এটাই করুন
              </button>
              <button type="button" onClick={() => setHint(null)} className="h-9 rounded-lg px-2 text-gori-ink-soft hover:bg-white">
                থাক
              </button>
            </div>
          )}

          <div className={cn("relative overflow-hidden rounded-2xl border border-white/10 bg-black/30", use3D ? "h-[62vh] min-h-105 max-h-190" : "max-h-190 w-full")}>
            {use3D ? (
              <BoardBoundary fallback={<Board2D {...boardProps} />}>
                <Board3D {...boardProps} />
              </BoardBoundary>
            ) : (
              // On phones the 2D board is wider than the screen and scrolls, so every module is a finger-sized target.
              <div ref={scroller} className="no-scrollbar overflow-x-auto">
                <div className="aspect-820/660 min-w-160 md:min-w-0">
                  <Board2D {...boardProps} />
                </div>
              </div>
            )}
            <Legend className="max-md:hidden" hint={use3D ? "টেনে ঘোরান · স্ক্রলে জুম · মডিউলে চাপ দিন" : "মডিউলে চাপ দিন বা ট্যাব দিয়ে বাছুন"} />
            <AnimatePresence>{reveal && <CrisisReveal batch={reveal} reduce={reduce} pace={PACE[speed]} onDone={() => setReveal(null)} />}</AnimatePresence>
          </div>
          <Legend className="static md:hidden" hint={use3D ? "টেনে ঘোরান · দুই আঙুলে জুম" : "বোর্ড পাশে সরিয়ে দেখুন · মডিউলে চাপ দিন"} />

          <Hand
            state={state}
            player={me ?? actor}
            selectedCard={cardSel}
            onCard={(i) => {
              const c = state.players[me ?? actor].hand[i];
              setCardSel(i);
              if (c.kind === "node") setSelected(c.n);
              else if (c.kind === "policy" && me !== null) setPolicy(c.id);
            }}
          />
        </div>

        <aside className="order-2 space-y-3 xl:order-3" aria-label="নির্বাচিত মডিউল">
          <label className="block font-bengali text-xs font-semibold text-emerald-100/80">
            মডিউল বাছুন (কিবোর্ডে)
            <select value={selected} onChange={(e) => setSelected(Number(e.target.value))} className="mt-1 h-10 w-full rounded-xl border border-white/15 bg-gori-panel px-2 text-sm text-white">
              {NODES.map((n) => (
                <option key={n} value={n}>
                  {codeOf(n)} {titleOf(n)} {state.pressure[n] ? `(চাপ ${bn(state.pressure[n])})` : ""}
                </option>
              ))}
            </select>
          </label>
          <NodePanel state={state} n={selected} me={me} preview={preview} onPreview={setPreview} onSelect={setSelected} onAct={run} onPeek={() => setPeek(true)} />
        </aside>
      </div>

      <PolicyDialog state={state} id={policy} selected={selected} onAct={run} onClose={() => setPolicy(null)} />
      <PeekDialog state={state} open={peek} onAct={run} onClose={() => setPeek(false)} />
      <DiscardDialog state={state} onAct={run} onPolicy={setPolicy} />

      <AnimatePresence>{handoff !== null && !state.outcome && <Handoff state={state} player={handoff} onReady={() => setHandoff(null)} />}</AnimatePresence>
      {state.outcome && !reveal && (
        <EndScreen
          state={state}
          credited={credit}
          onAgain={() => restart({ ...state.config, seed: randomSeed() })}
          onSameSeed={() => restart(state.config)}
          onNewTeam={() => quit()}
        />
      )}

      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
    </div>
  );
}

/** What the marks on the board mean — shapes and colours never stand alone. */
function Legend({ hint, className }: { hint: string; className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute right-2 bottom-2 left-2 flex flex-wrap items-end justify-between gap-2 font-bengali text-[11px] text-emerald-50/85", className)}>
      <p className="text-emerald-100/60">{hint}</p>
      <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-black/45 px-2.5 py-1.5">
        {PILLARS.map((p) => (
          <li key={p.id} className="flex items-center gap-1">
            <PillarGlyph id={p.id} className="size-3" /> {p.bn}
          </li>
        ))}
        <li className="flex items-center gap-1">
          <span className="block size-2.5 rounded-[2px] bg-national-crimson" aria-hidden /> চাপ
        </li>
        <li className="flex items-center gap-1">
          <span className="block h-2.5 w-3 rounded-[2px] bg-amber-300" aria-hidden /> কেন্দ্র
        </li>
        <li className="flex items-center gap-1">
          <span className="block w-4 border-t-2 border-dashed border-emerald-100/80" aria-hidden /> খেলার অনুমান
        </li>
      </ul>
    </div>
  );
}
