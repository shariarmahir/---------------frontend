"use client";

import { useMemo, useSyncExternalStore } from "react";
import { libraryArticles } from "@/data/research/library";
import { activeAccountId, subscribeAuth } from "@/lib/auth/client";
import { engagementOf, pointsOf, type Article, type Engagement, type ReactionKind, type TalkNote } from "./core";

/**
 * The viewer's own গবেষণাকোষ activity: what they submitted (waiting for
 * review), their comments, reactions, shares, citations and saves. Kept in
 * this browser per Kandari account until a backend exists; signed out,
 * nothing is read or saved. Selectors return values already in the state.
 */
export interface ResearchState {
  mine: Article[];
  /** Comments and replies the viewer wrote, by article slug. */
  talk: Record<string, TalkNote[]>;
  /** One reaction per article. */
  reactions: Record<string, ReactionKind>;
  /** Channels each article was shared to ("feed", "facebook" …), each counted once. */
  shared: Record<string, Record<string, true>>;
  /** Articles whose citation the viewer copied. */
  cited: Record<string, true>;
  /** Articles saved to read later. */
  saved: Record<string, true>;
  /** Comments the viewer liked: `${slug}:${commentId}`. */
  noteLikes: Record<string, true>;
}

const EMPTY: ResearchState = Object.freeze({ mine: [], talk: {}, reactions: {}, shared: {}, cited: {}, saved: {}, noteLikes: {} }) as ResearchState;
const BASE = "kandari-research-v1";

let state: ResearchState = EMPTY;
let scope: string | null = null;
let loaded = false;
const listeners = new Set<() => void>();

const keyFor = (id: string | null) => (id ? `${BASE}:${id}` : null);

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  scope = keyFor(activeAccountId());
  state = EMPTY;
  if (!scope) return;
  try {
    const raw = window.localStorage.getItem(scope);
    if (raw) state = { ...EMPTY, ...(JSON.parse(raw) as Partial<ResearchState>) };
  } catch {
    // Blocked or broken storage: start empty.
  }
}

const emit = () => listeners.forEach((l) => l());

function reload() {
  loaded = false;
  load();
  emit();
}

let unsubscribeAuth: (() => void) | null = null;
const onStorage = (e: StorageEvent) => e.key === scope && reload();

function subscribe(l: () => void) {
  if (!loaded) {
    load();
    queueMicrotask(emit);
  }
  if (listeners.size === 0) {
    window.addEventListener("storage", onStorage);
    unsubscribeAuth = subscribeAuth(() => keyFor(activeAccountId()) !== scope && reload());
  }
  listeners.add(l);
  return () => {
    listeners.delete(l);
    if (listeners.size === 0) {
      window.removeEventListener("storage", onStorage);
      unsubscribeAuth?.();
      unsubscribeAuth = null;
    }
  };
}

export function useResearch<T>(select: (s: ResearchState) => T): T {
  return useSyncExternalStore(subscribe, () => select(state), () => select(EMPTY));
}

/** Apply a change; false when there is no account or the browser would not save it. */
export function updateResearch(fn: (s: ResearchState) => ResearchState): boolean {
  load();
  if (!scope) return false;
  const next = fn(state);
  try {
    window.localStorage.setItem(scope, JSON.stringify(next));
  } catch {
    return false;
  }
  state = next;
  emit();
  return true;
}

/** The samples plus the viewer's own submissions. */
export function useLibrary(): Article[] {
  const mine = useResearch((s) => s.mine);
  return useMemo(() => [...mine, ...libraryArticles], [mine]);
}

/** Each article's engagement and points, with the viewer's own reactions, comments, shares and citation counted in. */
export function useScores(): { engagement: (a: Article) => Engagement; points: (a: Article) => number } {
  const talk = useResearch((s) => s.talk);
  const reactions = useResearch((s) => s.reactions);
  const shared = useResearch((s) => s.shared);
  const cited = useResearch((s) => s.cited);
  return useMemo(() => {
    const engagement = (a: Article) =>
      engagementOf(a, { reaction: reactions[a.slug], comments: talk[a.slug]?.length ?? 0, shares: Object.keys(shared[a.slug] ?? {}).length, cited: Boolean(cited[a.slug]) });
    return { engagement, points: (a: Article) => pointsOf(engagement(a)) };
  }, [talk, reactions, shared, cited]);
}

/** Record that the viewer shared an article to a channel; true if it was saved. */
export const markShared = (slug: string, channel: string) =>
  updateResearch((s) => ({ ...s, shared: { ...s.shared, [slug]: { ...s.shared[slug], [channel]: true } } }));

/** Flip a slug key in one of the yes/no maps. */
export function toggleIn(key: "cited" | "saved" | "noteLikes", id: string): boolean {
  return updateResearch((s) => {
    const next = { ...s[key] };
    if (next[id]) delete next[id];
    else next[id] = true;
    return { ...s, [key]: next };
  });
}
