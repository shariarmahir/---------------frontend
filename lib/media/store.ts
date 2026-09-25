"use client";

import { useSyncExternalStore } from "react";
import type { CategoryId, CivicReport, Comment, CommunityEvent, Job, Listing, Message, Post, Sponsor, Team, Txn } from "@/data/media/types";
import type { Negotiation } from "./negotiation";

/**
 * The viewer's own activity: likes, comments, ratings, posts, negotiations,
 * orders, wallet rows, onboarding. Held in memory and mirrored to
 * localStorage; read via useSyncExternalStore, so server render and
 * hydration see the empty state and the saved state arrives right after
 * (useHydrated() tells skeletons when).
 *
 * Selectors must return a value already in the state or a primitive —
 * never a freshly built object/array.
 *
 * Swap for API calls when a backend exists; keep useMediaState/updateMedia.
 */

export interface MyRating {
  stars: number;
  verdict: "verify" | "challenge";
  reason: string;
  at: string;
}

export interface MyThread {
  id: string;
  with: string;
  kind: "hire" | "offer";
  subject: string;
  listingId?: string;
  ask: number;
  floor: number;
  brief?: string;
  deadline?: string;
  at: string;
}

export interface MyProfile {
  displayName: string;
  handle: string;
  district: string;
  headline: string;
  bio: string;
  categories: CategoryId[];
  docType: "nid" | "passport";
  verifiedAt: string;
}

export interface MyNote {
  id: string;
  text: string;
  color: "yellow" | "green" | "orange" | "blue";
  /** "Best work of the day" — shown on the profile. */
  best: boolean;
  pinned: boolean;
  at: string;
}

export interface MyEntry {
  summary: string;
  link: string;
  team: string;
  at: string;
}

export interface Privacy {
  /** Show only the district, never the area, on the profile. */
  districtOnly: boolean;
  /** Who can start a conversation. */
  messages: "everyone" | "verified" | "following";
  /** New civic reports default to anonymous. */
  anonymousReports: boolean;
  /** Hide follower counts and likes (less comparison, calmer feed). */
  hideCounts: boolean;
  /** Suggest a break after this many minutes (0 = off). */
  breakAfter: number;
}

export const defaultPrivacy: Privacy = { districtOnly: false, messages: "verified", anonymousReports: true, hideCounts: false, breakAfter: 30 };

export interface MediaState {
  /* community */
  applied: Record<string, string>;
  myJobs: Job[];
  joinedEvents: Record<string, true>;
  myEvents: CommunityEvent[];
  sponsorships: Record<string, Sponsor[]>;
  /** Team id → join request sent or member. */
  teamStatus: Record<string, "requested" | "member">;
  myTeams: Team[];
  confirmedReports: Record<string, true>;
  myReports: CivicReport[];
  mySolutions: Record<string, CivicReport["solutions"]>;
  solutionVotes: Record<string, true>;
  entries: Record<string, MyEntry>;
  notes: MyNote[];
  seenNotices: Record<string, true>;
  privacy: Privacy;
  /** Today's Learn → Connect → Create → Apply → Relax steps, keyed by date. */
  plan: { date: string; done: Record<string, true> };

  liked: Record<string, true>;
  /** `${postId}:${commentId}` */
  commentLikes: Record<string, true>;
  /** Top-level comments the viewer added, per post. */
  comments: Record<string, Comment[]>;
  /** Replies the viewer added, per `${postId}:${commentId}`. */
  replies: Record<string, Comment[]>;
  ratings: Record<string, MyRating>;
  following: Record<string, true>;
  posts: Post[];
  listings: Listing[];
  threads: MyThread[];
  negotiations: Record<string, Negotiation>;
  messages: Record<string, Message[]>;
  /** Deals whose escrow the buyer has released after delivery. */
  released: Record<string, true>;
  /** Conversations the viewer has opened (clears their unread count). */
  read: Record<string, true>;
  txns: Txn[];
  profile: MyProfile | null;
}

const STORAGE_KEY = "shikkhitoder-media-v2";

const initialState: MediaState = Object.freeze({
  applied: {},
  myJobs: [],
  joinedEvents: {},
  myEvents: [],
  sponsorships: {},
  teamStatus: {},
  myTeams: [],
  confirmedReports: {},
  myReports: [],
  mySolutions: {},
  solutionVotes: {},
  entries: {},
  notes: [],
  seenNotices: {},
  privacy: defaultPrivacy,
  plan: { date: "", done: {} },
  liked: {},
  commentLikes: {},
  comments: {},
  replies: {},
  ratings: {},
  following: {},
  posts: [],
  listings: [],
  threads: [],
  negotiations: {},
  messages: {},
  released: {},
  read: {},
  txns: [],
  profile: null,
}) as MediaState;

let state: MediaState = initialState;
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<MediaState>;
      state = { ...initialState, ...saved, privacy: { ...defaultPrivacy, ...saved.privacy } };
    }
  } catch {
    // Blocked or corrupt storage: keep the empty state.
  }
}

/** False when the browser refused to save (private mode, storage full). */
function persist(): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    // The change still applies for this visit.
    return false;
  }
}

function onStorage(e: StorageEvent) {
  if (e.key !== STORAGE_KEY) return;
  loaded = false;
  state = initialState;
  load();
  emit();
}

function subscribe(listener: () => void) {
  if (!loaded) {
    load();
    queueMicrotask(emit);
  }
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

export function useMediaState<T>(select: (s: MediaState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => select(state),
    () => select(initialState),
  );
}

/** False during server render and hydration; true once saved state is read. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => loaded,
    () => false,
  );
}

/** Apply a change; returns false if it could not be saved for next visit. */
export function updateMedia(fn: (s: MediaState) => MediaState): boolean {
  load();
  state = fn(state);
  const saved = persist();
  emit();
  return saved;
}

export function resetMedia(): void {
  state = initialState;
  persist();
  emit();
}

export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Toggle a key in a Record<string, true> slice. */
export function toggleKey<K extends "liked" | "commentLikes" | "following" | "joinedEvents" | "confirmedReports" | "solutionVotes">(key: K, id: string) {
  updateMedia((s) => {
    const next: Record<string, true> = { ...s[key] };
    if (next[id]) delete next[id];
    else next[id] = true;
    return { ...s, [key]: next };
  });
}

/** Mark a conversation as opened; a no-op when it already is. */
export function markRead(threadId: string) {
  if (state.read[threadId]) return;
  updateMedia((s) => ({ ...s, read: { ...s.read, [threadId]: true } }));
}
