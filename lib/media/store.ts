"use client";

import { useSyncExternalStore } from "react";
import type { CategoryId, CivicReport, Comment, CommunityEvent, Job, Listing, Message, Post, Sponsor, Team, Txn } from "@/data/media/types";
import { activeAccountId, subscribeAuth } from "@/lib/auth/client";
import type { Classroom } from "./classroom";
import type { CrimePost } from "./crime";
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
 * Each Kandari account has its own copy (keyed by account id), so signing
 * out and in as someone else never shows the last person's likes, wallet or
 * messages. Signed out, nothing is read or saved.
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
  /** Classrooms the viewer created or joined, by id (a joined sample is copied here). */
  classrooms: Record<string, Classroom>;
  /** অপরাধ বার্তা: the viewer's own posts, and the posts they witnessed or flagged. */
  crimePosts: CrimePost[];
  crimeWitness: Record<string, true>;
  crimeFlags: Record<string, true>;
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

const BASE_KEY = "shikkhitoder-media-v2";

/** The demo founder keeps the original key, so earlier saved activity stays his. */
function keyFor(accountId: string | null): string | null {
  if (!accountId) return null;
  return accountId === "acc-mahir" ? BASE_KEY : `${BASE_KEY}:${accountId}`;
}

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
  classrooms: {},
  crimePosts: [],
  crimeWitness: {},
  crimeFlags: {},
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
/** Storage key of the account the state was loaded for. */
let scope: string | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  scope = keyFor(activeAccountId());
  state = initialState;
  if (!scope) return;
  try {
    const raw = window.localStorage.getItem(scope);
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
  if (!scope) return false;
  try {
    window.localStorage.setItem(scope, JSON.stringify(state));
    return true;
  } catch {
    // The change still applies for this visit.
    return false;
  }
}

function reload() {
  loaded = false;
  load();
  emit();
}

function onStorage(e: StorageEvent) {
  if (e.key && e.key === scope) reload();
}

/** Another account signed in (or out): switch to its copy. */
function onAuthChange() {
  if (loaded && keyFor(activeAccountId()) !== scope) reload();
}

let unsubscribeAuth: (() => void) | null = null;

function subscribe(listener: () => void) {
  if (!loaded) {
    load();
    queueMicrotask(emit);
  }
  if (listeners.size === 0) {
    window.addEventListener("storage", onStorage);
    unsubscribeAuth = subscribeAuth(onAuthChange);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener("storage", onStorage);
      unsubscribeAuth?.();
      unsubscribeAuth = null;
    }
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
export function toggleKey<K extends "liked" | "commentLikes" | "following" | "joinedEvents" | "confirmedReports" | "solutionVotes" | "crimeWitness" | "crimeFlags">(key: K, id: string) {
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
