"use client";

import { useEffect, useSyncExternalStore } from "react";
import { STALE_AFTER_MS, parseSaved, seedWorld } from "@/lib/command/generate";
import { resume, tick } from "@/lib/command/engine";
import { bdDate, isOpen, kpis, type Kpis } from "@/lib/command/selectors";
import type { ActionResult, Case, World } from "@/lib/command/types";

/**
 * The live demo world in the browser. Held in memory, mirrored to localStorage
 * and read through useSyncExternalStore: the server render and hydration see
 * `null` (callers render skeletons) and the world arrives right after.
 *
 * useCommandClock() — mounted once, in the dashboard layout — advances it once a
 * second while the tab is visible and the demo is not paused. A paused demo is
 * frozen: it is kept across reloads however old, and resume() shifts its
 * clocks; actions taken while paused are stamped with the frozen `now`.
 * A hidden tab, a closed page and a dashboard left by in-app navigation (the
 * clock unmounted) are implicit freezes: on return the world is resumed from its
 * `now`, or reseeded when that is more than 30 min old, and the user's `paused`
 * flag is left as it was. Every change is saved at most every 5 s, and on
 * `pagehide`.
 *
 * Selectors passed to useCommand must return a value already in the world or a
 * primitive — a fresh array/object per call makes React re-render forever. For
 * derived values wrap the function in perWorld(), which memoises it per world
 * object (a new world per tick or action), and create it ONCE, not inline:
 *
 *   // module level, no arguments
 *   const selectOpen = perWorld((w) => filterCases(w, { status: "open" }));
 *   const open = useCommand(selectOpen);
 *
 *   // with arguments: one memo per argument set
 *   const sel = useMemo(() => perWorld((w) => filterCases(w, { dept, homeId })), [dept, homeId]);
 *   const cases = useCommand(sel);
 */

const KEY = "kandari-command-v1";
const TICK_MS = 1000;
const SAVE_EVERY_MS = 5000;

/** Cases that left the world (pruned) after being resolved today, so "resolved today" doesn't level off. */
interface PrunedToday {
  /** Calendar day in Bangladesh, "YYYY-MM-DD". */
  day: string;
  count: number;
}

let world: World | null = null;
let prunedToday: PrunedToday = { day: "", count: 0 };
let loaded = false;
const listeners = new Set<() => void>();

/* ------------------------------------------------------------ persistence */

let lastSaved = 0;
let saveTimer: ReturnType<typeof setTimeout> | null = null;

function saveNow(): void {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  if (!world) return;
  lastSaved = Date.now();
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ world, prunedToday }));
  } catch {
    // Private mode or storage full: the demo still runs for this visit.
  }
}

/** Save now if the last save is 5 s old, else once the 5 s are up. */
function scheduleSave(): void {
  if (saveTimer) return;
  const wait = SAVE_EVERY_MS - (Date.now() - lastSaved);
  if (wait <= 0) saveNow();
  else saveTimer = setTimeout(saveNow, wait);
}

function readCounter(raw: string, day: string): PrunedToday {
  try {
    const p = (JSON.parse(raw) as { prunedToday?: unknown }).prunedToday as Partial<PrunedToday> | undefined;
    if (p && p.day === day && typeof p.count === "number" && Number.isInteger(p.count) && p.count >= 0) {
      return { day, count: p.count };
    }
  } catch {
    // Fall through to a fresh counter.
  }
  return { day, count: 0 };
}

const freshSeed = (): number => Date.now() & 0x7fffffff;

function load(): void {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  const now = Date.now();
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    // Blocked storage: start a fresh demo.
  }
  const saved = raw ? parseSaved(raw, now) : null;
  // The demo was frozen while the page was closed: a live saved world picks up
  // where it stopped (resume) instead of catching up. A user-paused one stays paused.
  world = saved ? (saved.paused ? saved : resume(saved, now)) : seedWorld(freshSeed(), now);
  prunedToday = saved && raw ? readCounter(raw, bdDate(now)) : { day: bdDate(now), count: 0 };
  if (!saved) saveNow();
  window.addEventListener("pagehide", saveNow);
  document.addEventListener("visibilitychange", onVisibility);
}

function emit(): void {
  for (const l of listeners) l();
}

function subscribe(listener: () => void): () => void {
  if (!loaded) {
    load();
    queueMicrotask(emit);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/* ------------------------------------------------------------------ clock */

let clockUsers = 0;
let timer: ReturnType<typeof setInterval> | null = null;

/** Count closed/resolved cases resolved today that the tick dropped from the world. */
function countPruned(prev: World, next: World, now: number): void {
  const day = bdDate(now);
  if (prunedToday.day !== day) prunedToday = { day, count: 0 };
  if (prev.cases === next.cases) return;
  const kept = new Set<string>();
  for (const c of next.cases) kept.add(c.id);
  let n = 0;
  for (const c of prev.cases) {
    if (!kept.has(c.id) && !isOpen(c) && c.resolvedAt !== undefined && bdDate(c.resolvedAt) === day) n++;
  }
  if (n) prunedToday = { day, count: prunedToday.count + n };
}

function step(): void {
  if (!world || world.paused || document.visibilityState !== "visible") return;
  const now = Date.now();
  const next = tick(world, now);
  countPruned(world, next, now);
  if (next === world) return;
  world = next;
  emit();
  scheduleSave();
}

/** Run the interval only while someone mounted the clock, the tab is visible and the demo isn't paused. */
function syncTimer(): void {
  const run = clockUsers > 0 && world !== null && !world.paused && document.visibilityState === "visible";
  if (run && !timer) {
    timer = setInterval(step, TICK_MS);
    step();
  } else if (!run && timer) {
    clearInterval(timer);
    timer = null;
  }
}

/** A brand-new demo world and an empty pruned-today counter. */
function reseed(now: number): void {
  world = seedWorld(freshSeed(), now);
  prunedToday = { day: bdDate(now), count: 0 };
}

/**
 * End an implicit freeze (hidden tab, clock remounted, an action with no clock
 * running). These freeze the demo like a pause without touching the user's
 * `paused` flag: a live world resumes from its `now`, so there is no burst of
 * arrivals or escalations; one older than STALE_AFTER_MS is reseeded, as a
 * reload would. A user-paused world is left for setPaused(false).
 */
function thaw(): void {
  if (!world || world.paused) return;
  const now = Date.now();
  if (now - world.now > STALE_AFTER_MS) {
    reseed(now);
    emit();
    saveNow();
    return;
  }
  const shifted = resume(world, now);
  if (shifted === world) return;
  world = shifted;
  emit();
  scheduleSave();
}

function onVisibility(): void {
  if (document.visibilityState === "hidden") saveNow();
  else thaw();
  syncTimer();
}

/** Mount once, in the dashboard layout: advances the world every second. Safe under StrictMode. */
export function useCommandClock(): void {
  useEffect(() => {
    load();
    // Back on the dashboard after in-app navigation: the world was frozen meanwhile.
    if (clockUsers++ === 0) thaw();
    syncTimer();
    return () => {
      clockUsers--;
      syncTimer();
    };
  }, []);
}

/* ---------------------------------------------------------------- reading */

/** Memoise a derived view per world object; use it for selectors that build arrays/objects. */
export function perWorld<T>(fn: (w: World) => T): (w: World) => T {
  const cache = new WeakMap<World, T>();
  return (w) => {
    if (cache.has(w)) return cache.get(w) as T;
    const v = fn(w);
    cache.set(w, v);
    return v;
  };
}

/** The world through `select`; null on the server and before the saved world is read. */
export function useCommand<T>(select: (w: World) => T): T | null {
  return useSyncExternalStore(
    subscribe,
    () => (world ? select(world) : null),
    () => null,
  );
}

/** False during server render and hydration; true once the world is in. */
export function useCommandReady(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => loaded && world !== null,
    () => false,
  );
}

/** The headline numbers at the world's clock, memoised per world. */
export const selectKpis: (w: World) => Kpis = perWorld((w) => kpis(w, w.now));

const caseIndex = perWorld((w) => new Map(w.cases.map((c) => [c.id, c])));
const GONE = "gone";

/**
 * One case by id: null when `id` is null or before hydration; undefined when the
 * case is no longer in the world (archived by pruning).
 */
export function useCase(id: string | null): Case | null | undefined {
  const c = useCommand((w) => (id === null ? null : (caseIndex(w).get(id) ?? GONE)));
  return c === GONE ? undefined : c;
}

/** Cases resolved today, including those already pruned from the world; null before hydration. */
export function useResolvedToday(): number | null {
  return useCommand((w) => selectKpis(w).resolvedToday + (prunedToday.day === bdDate(w.now) ? prunedToday.count : 0));
}

/* ---------------------------------------------------------------- writing */

/** Apply an action (see lib/command/actions); returns its error, or null once applied. */
export function commandAct(fn: (w: World, now: number) => ActionResult): string | null {
  load();
  if (!world) return "The dashboard is still loading.";
  // No clock running (user pause, or an implicit freeze): bring a live world up
  // to now first, then stamp with the world's own clock, so a later resume()
  // can never push these stamps past its `now`.
  const frozen = world.paused || timer === null;
  if (frozen) thaw();
  const now = frozen ? world.now : Date.now();
  const r = fn(world, now);
  if (!r.ok) return r.error;
  // Keep every stamp at or before world.now (the next tick still runs from here).
  world = r.world.now < now ? { ...r.world, now } : r.world;
  emit();
  scheduleSave();
  return null;
}

export function setPaused(p: boolean): void {
  load();
  if (!world || world.paused === p) return;
  // Pausing freezes the demo; resuming moves every simulated clock past the pause.
  world = p ? { ...world, paused: true } : resume(world, Date.now());
  emit();
  saveNow();
  syncTimer();
}

/** Start a fresh demo with a new seed. */
export function resetDemo(): void {
  load();
  reseed(Date.now());
  emit();
  saveNow();
  syncTimer();
}
