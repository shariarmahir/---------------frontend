"use client";

import { useMemo, useSyncExternalStore } from "react";
import { libraryArticles } from "@/data/research/library";
import { activeAccountId, subscribeAuth } from "@/lib/auth/client";
import { engagementOf, NOTE_REACTIONS, pointsOf, sanitizeOwn, withTracking, type Article, type NoteReaction, type Engagement, type ReactionKind, type TalkNote } from "./core";

/**
 * The viewer's own Genius activity: what they submitted (waiting for
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
  /** The viewer's reaction on comments, by `${slug}:${commentId}`. */
  noteReacts: Record<string, NoteReaction>;
}

const EMPTY: ResearchState = Object.freeze({ mine: [], talk: {}, reactions: {}, shared: {}, cited: {}, saved: {}, noteReacts: {} }) as ResearchState;
const BASE = "kandari-research-v1";

let state: ResearchState = EMPTY;
let scope: string | null = null;
let loaded = false;
const listeners = new Set<() => void>();

const keyFor = (id: string | null) => (id ? `${BASE}:${id}` : null);

const isMap = (x: unknown): x is Record<string, never> => Boolean(x) && typeof x === "object" && !Array.isArray(x);

/** Comment reactions, keeping only known kinds; likes saved before reactions existed become "like". */
function reactsOf(x: Partial<ResearchState> & { noteLikes?: unknown }): Record<string, NoteReaction> {
  const out: Record<string, NoteReaction> = {};
  if (isMap(x.noteLikes)) for (const k of Object.keys(x.noteLikes)) out[k] = "like";
  if (isMap(x.noteReacts)) for (const [k, v] of Object.entries(x.noteReacts as Record<string, unknown>)) if (typeof v === "string" && Object.hasOwn(NOTE_REACTIONS, v)) out[k] = v as NoteReaction;
  return out;
}

/** Saved state, checked: browser storage can be edited by anything on the device, so every part falls back to empty. */
function parseState(v: unknown): ResearchState {
  const x = isMap(v) ? (v as Partial<ResearchState> & { noteLikes?: unknown }) : {};
  const note = (n: unknown) => isMap(n) && ["id", "by", "at", "text"].every((k) => typeof (n as Record<string, unknown>)[k] === "string");
  const talk = isMap(x.talk) ? Object.fromEntries(Object.entries(x.talk as Record<string, unknown>).map(([slug, list]) => [slug, Array.isArray(list) ? list.filter(note) : []])) : {};
  return {
    mine: sanitizeOwn(x.mine),
    talk: talk as ResearchState["talk"],
    reactions: isMap(x.reactions) ? x.reactions : {},
    shared: isMap(x.shared) ? x.shared : {},
    cited: isMap(x.cited) ? x.cited : {},
    saved: isMap(x.saved) ? x.saved : {},
    noteReacts: reactsOf(x),
  };
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  scope = keyFor(activeAccountId());
  state = EMPTY;
  if (!scope) return;
  try {
    const raw = window.localStorage.getItem(scope);
    if (raw) state = parseState(JSON.parse(raw));
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
  // Uploads made before tracking numbers existed get theirs here, after the library's.
  return useMemo(() => withTracking([...mine, ...libraryArticles]), [mine]);
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
export function toggleIn(key: "cited" | "saved", id: string): boolean {
  return updateResearch((s) => {
    const next = { ...s[key] };
    if (next[id]) delete next[id];
    else next[id] = true;
    return { ...s, [key]: next };
  });
}

/** React to a comment; the same reaction again takes it back. True if it was saved. */
export function reactToNote(slug: string, id: string, kind: NoteReaction): boolean {
  const key = `${slug}:${id}`;
  return updateResearch((s) => {
    const noteReacts = { ...s.noteReacts };
    if (noteReacts[key] === kind) delete noteReacts[key];
    else noteReacts[key] = kind;
    return { ...s, noteReacts };
  });
}

/** Change the text of one of the viewer's own comments. */
export const editNote = (slug: string, id: string, text: string) =>
  updateResearch((s) => ({ ...s, talk: { ...s.talk, [slug]: (s.talk[slug] ?? []).map((n) => (n.id === id ? { ...n, text, edited: new Date().toISOString() } : n)) } }));

/** Delete one of the viewer's own comments, with the replies under it. */
export const deleteNote = (slug: string, id: string) =>
  updateResearch((s) => ({ ...s, talk: { ...s.talk, [slug]: (s.talk[slug] ?? []).filter((n) => n.id !== id && n.parent !== id) } }));
