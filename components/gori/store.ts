"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { emptyProgress, type Progress } from "@/lib/gori/progression";
import { presetFor } from "@/lib/gori/sim/engine";
import type { StrategyId } from "@/lib/gori/sim/score";
import type { Action, Mode, Plan, SimConfig } from "@/lib/gori/sim/types";
import type { Lang } from "./i18n";

/**
 * All game state, kept in this browser (localStorage "kandari-gori-v3").
 * The simulation itself is never stored: a game is (config, plan, turn) and
 * every screen replays it through the pure engine.
 *
 * TODO(backend): accounts and server persistence (Prompt V3 §14–15).
 */

export interface Settings {
  name: string;
  avatar: number;
  language: Lang;
  textSize: "md" | "lg" | "xl";
  contrast: "normal" | "high";
  motion: "system" | "reduce";
  detail: "simple" | "advanced";
  density: "comfortable" | "compact";
  speed: "slow" | "normal" | "fast";
  strategy: StrategyId;
  learning: "guided" | "free";
  notifications: boolean;
  openAll: boolean;
}

export const defaultSettings: Settings = {
  name: "",
  avatar: 0,
  language: "bn",
  textSize: "md",
  contrast: "normal",
  motion: "system",
  detail: "simple",
  density: "comfortable",
  speed: "normal",
  strategy: "balanced",
  learning: "guided",
  notifications: true,
  openAll: false,
};

export interface Game {
  config: SimConfig;
  plan: Plan;
  /** Turns already run. */
  turn: number;
  strategy: StrategyId;
  startedAt: string;
  /** Campaign steps the player has acknowledged (brief read, stakeholders met…). */
  flags: string[];
  /** The player's own hypothesised links — shown on the map, never fed to the model. */
  userEdges: { from: string; to: string; sign: 1 | -1 }[];
  /** Set once the finished run has been scored and credited. */
  result?: { runKey: string; total: number; verified: boolean };
}

export interface SavedRun {
  runKey: string;
  name: string;
  config: SimConfig;
  plan: Plan;
  strategy: StrategyId;
  total: number;
  finalIndex: number;
  verified: boolean;
  savedAt: string;
}

export interface LabRecord {
  id: string;
  hypothesis: {
    statement: string;
    mechanism: string;
    intervention: string;
    variable: string;
    direction: "up" | "down";
    confounders: string[];
    assumptions: Record<string, "low" | "mid" | "high">;
    horizon: number;
    evidenceLevel: "dossier" | "assumption" | "untested";
    falsification: string;
  };
  seed: string;
  trials: number;
  engine: string;
  ruleset: string;
  result: { baseline: { mean: number; p10: number; p90: number }; treated: { mean: number; p10: number; p90: number }; diff: { mean: number; p10: number; p90: number }; verdict: "supported" | "refuted" | "inconclusive" };
  conclusion: string;
  at: string;
}

export interface ForgeScenario {
  id: string;
  name: string;
  description: string;
  config: SimConfig;
  moderation: { verdict: "allow" | "review" | "block"; reasons: string[]; mode: "claude" | "offline" } | null;
  createdAt: string;
}

interface State {
  settings: Settings;
  progress: Progress;
  game: Game | null;
  runs: SavedRun[];
  lab: LabRecord[];
  forge: ForgeScenario[];
  /** Bulletin lines the player's own progress produced — simulated, labelled so. */
  bulletin: { at: string; text: string }[];
  setSettings: (s: Partial<Settings>) => void;
  setProgress: (fn: (p: Progress) => Progress) => void;
  startGame: (config: SimConfig, strategy?: StrategyId) => void;
  startMode: (mode: Mode, seed: string) => void;
  /** Replays a saved run to its end; re-crediting is a no-op because its run key is already counted. */
  loadRun: (config: SimConfig, plan: Plan, strategy: StrategyId) => void;
  setDraft: (actions: Action[]) => void;
  playTurn: () => void;
  rewind: () => void;
  setResult: (r: Game["result"]) => void;
  flag: (id: string) => void;
  addUserEdge: (e: Game["userEdges"][number]) => void;
  endGame: () => void;
  saveRun: (r: SavedRun) => void;
  removeRun: (runKey: string) => void;
  addLab: (r: LabRecord) => void;
  saveForge: (f: ForgeScenario) => void;
  removeForge: (id: string) => void;
  post: (text: string) => void;
}

export const useGori = create<State>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      progress: emptyProgress,
      game: null,
      runs: [],
      lab: [],
      forge: [],
      bulletin: [],
      setSettings: (s) => set((st) => ({ settings: { ...st.settings, ...s } })),
      setProgress: (fn) => set((st) => ({ progress: fn(st.progress) })),
      startGame: (config, strategy) => set((st) => ({ game: { config, plan: [], turn: 0, strategy: strategy ?? st.settings.strategy, startedAt: new Date().toISOString(), flags: [], userEdges: [] } })),
      startMode: (mode, seed) => set((st) => ({ game: { config: presetFor(mode, seed), plan: [], turn: 0, strategy: st.settings.strategy, startedAt: new Date().toISOString(), flags: [], userEdges: [] } })),
      loadRun: (config, plan, strategy) =>
        set({ game: { config, plan, turn: config.horizon, strategy, startedAt: new Date().toISOString(), flags: ["brief", "stakeholders"], userEdges: [] } }),
      setDraft: (actions) =>
        set((st) => {
          if (!st.game || st.game.result) return {};
          const plan = [...st.game.plan];
          while (plan.length < st.game.turn) plan.push([]);
          plan[st.game.turn] = actions;
          return { game: { ...st.game, plan } };
        }),
      playTurn: () =>
        set((st) => {
          if (!st.game || st.game.turn >= st.game.config.horizon) return {};
          const plan = [...st.game.plan];
          while (plan.length <= st.game.turn) plan.push([]);
          return { game: { ...st.game, plan, turn: st.game.turn + 1 } };
        }),
      rewind: () =>
        set((st) => {
          if (!st.game || st.game.turn === 0) return {};
          const turn = st.game.turn - 1;
          // The undone turn's choices become the draft again; later turns are dropped.
          return { game: { ...st.game, turn, plan: st.game.plan.slice(0, turn + 1), result: undefined } };
        }),
      setResult: (result) => set((st) => (st.game ? { game: { ...st.game, result } } : {})),
      flag: (id) => set((st) => (st.game && !st.game.flags.includes(id) ? { game: { ...st.game, flags: [...st.game.flags, id] } } : {})),
      addUserEdge: (e) =>
        set((st) =>
          st.game && !st.game.userEdges.some((x) => x.from === e.from && x.to === e.to) ? { game: { ...st.game, userEdges: [...st.game.userEdges, e] } } : {},
        ),
      endGame: () => set({ game: null }),
      saveRun: (r) => set((st) => ({ runs: [r, ...st.runs.filter((x) => x.runKey !== r.runKey)].slice(0, 30) })),
      removeRun: (runKey) => set((st) => ({ runs: st.runs.filter((r) => r.runKey !== runKey) })),
      addLab: (r) => set((st) => ({ lab: [r, ...st.lab].slice(0, 40) })),
      saveForge: (f) => set((st) => ({ forge: [f, ...st.forge.filter((x) => x.id !== f.id)].slice(0, 30) })),
      removeForge: (id) => set((st) => ({ forge: st.forge.filter((f) => f.id !== id) })),
      post: (text) => set((st) => ({ bulletin: [{ at: new Date().toISOString(), text }, ...st.bulletin].slice(0, 30) })),
    }),
    {
      name: "kandari-gori-v3",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({ settings: s.settings, progress: s.progress, game: s.game, runs: s.runs, lab: s.lab, forge: s.forge, bulletin: s.bulletin }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<State>;
        return {
          ...current,
          ...p,
          settings: { ...defaultSettings, ...p.settings },
          progress: { ...emptyProgress, ...p.progress, quiz: { ...emptyProgress.quiz, ...p.progress?.quiz } },
        };
      },
    },
  ),
);

/** Loads saved state once, and brings over progress from the earlier version of the game. */
export function hydrateGori() {
  if (useGori.persist.hasHydrated()) return;
  void Promise.resolve(useGori.persist.rehydrate()).then(() => {
    try {
      const old = window.localStorage.getItem("kandari-gori-v1");
      const st = useGori.getState();
      if (old && !Object.keys(st.progress.quiz.best).length) {
        const v1 = JSON.parse(old) as { best?: Record<number, number>; answers?: Record<number, ("yes" | "no")[]>; ideas?: Record<number, string> };
        st.setProgress((p) => ({ ...p, quiz: { best: v1.best ?? {}, answers: v1.answers ?? {}, ideas: v1.ideas ?? {} } }));
      }
    } catch {
      // Old progress unreadable — start fresh.
    }
  });
}

export function useHydrated(): boolean {
  return useSyncExternalStore(
    (cb) => useGori.persist.onFinishHydration(cb),
    () => useGori.persist.hasHydrated(),
    () => false,
  );
}
