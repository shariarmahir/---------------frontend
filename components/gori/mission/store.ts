"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { apply, replay, setup, type MissionAction, type MissionConfig, type MissionState } from "@/lib/gori/mission/engine";

/**
 * The mission in this browser (localStorage "kandari-gori-mission-v1").
 * Only (config, actions) is stored; the state is rebuilt by replaying them
 * through the pure engine, so a save can never hold an impossible board.
 *
 * TODO(backend): online rooms. The engine is transport-agnostic — a room
 * would relay the same actions list between players.
 */

export type BoardMode = "auto" | "3d" | "2d";

interface MissionStore {
  config: MissionConfig | null;
  actions: MissionAction[];
  /** How many trailing actions can be undone (none across a draw or a peek). */
  undoable: number;
  /** Set once the finished game has been credited. */
  credited: string | null;
  board: BoardMode;
  speed: "slow" | "normal" | "fast";
  state: MissionState | null;
  start: (config: MissionConfig) => void;
  act: (a: MissionAction) => void;
  undo: () => void;
  quit: () => void;
  setCredited: (key: string) => void;
  setBoard: (b: BoardMode) => void;
  setSpeed: (s: MissionStore["speed"]) => void;
}

/** Actions after which undo would leak information or re-roll luck. */
const sealing = (prev: MissionState, next: MissionState, a: MissionAction) =>
  next.turn !== prev.turn || next.phase !== "actions" || prev.phase !== "actions" || a.type === "peek" || (a.type === "policy" && a.id === "forecast") || !!next.outcome;

export const useMission = create<MissionStore>()(
  persist(
    (set, get) => ({
      config: null,
      actions: [],
      undoable: 0,
      credited: null,
      board: "auto",
      speed: "normal",
      state: null,
      start: (config) => set({ config, actions: [], undoable: 0, credited: null, state: setup(config) }),
      act: (a) => {
        const { state, actions, undoable } = get();
        if (!state) return;
        const next = apply(state, a);
        set({ state: next, actions: [...actions, a], undoable: sealing(state, next, a) ? 0 : undoable + 1 });
      },
      undo: () => {
        const { config, actions, undoable } = get();
        if (!config || !undoable) return;
        const kept = actions.slice(0, -1);
        set({ actions: kept, undoable: undoable - 1, state: replay(config, kept) });
      },
      quit: () => set({ config: null, actions: [], undoable: 0, credited: null, state: null }),
      setCredited: (key) => set({ credited: key }),
      setBoard: (board) => set({ board }),
      setSpeed: (speed) => set({ speed }),
    }),
    {
      name: "kandari-gori-mission-v1",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({ config: s.config, actions: s.actions, undoable: s.undoable, credited: s.credited, board: s.board, speed: s.speed }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<MissionStore>;
        let state: MissionState | null = null;
        if (p.config) {
          try {
            state = replay(p.config, p.actions ?? []);
          } catch {
            // A save from an older ruleset that no longer replays: start over.
            return { ...current, board: p.board ?? "auto", speed: p.speed ?? "normal" };
          }
        }
        return { ...current, ...p, state };
      },
    },
  ),
);

export function hydrateMission() {
  if (!useMission.persist.hasHydrated()) void useMission.persist.rehydrate();
}

export function useMissionHydrated(): boolean {
  return useSyncExternalStore(
    (cb) => useMission.persist.onFinishHydration(cb),
    () => useMission.persist.hasHydrated(),
    () => false,
  );
}
