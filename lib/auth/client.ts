"use client";

import { useSyncExternalStore } from "react";
import { SESSION_COOKIE, type Account } from "@/data/auth";
import * as core from "./core";
import type { AccountPatch, AuthDb, AuthError, OtpPurpose, Session, SignupInput } from "./core";
import { toBanglaDigits } from "./validate";

/**
 * The browser side of the mock account gateway. The whole AuthDb (accounts,
 * session, pending codes) is kept in localStorage and read through
 * useSyncExternalStore, like lib/media/store.ts: server render and
 * hydration see "not ready", the saved state arrives right after.
 *
 * A marker cookie mirrors "signed in" so proxy.ts can redirect before a
 * protected page renders; the browser copy stays the source of truth.
 * Swap this module for real API calls when a backend exists — the exported
 * functions are the contract the pages use.
 */

const STORAGE_KEY = "kandari-auth-v1";
/** Long enough to show a busy state, short enough not to annoy. */
const LATENCY_MS = 450;

export interface AuthSnapshot {
  /** False until the saved state has been read in the browser. */
  ready: boolean;
  account: Account | null;
  session: Session | null;
}

const SERVER_SNAPSHOT: AuthSnapshot = Object.freeze({ ready: false, account: null, session: null });

let db: AuthDb = core.seed();
let loaded = false;
let snapshot: AuthSnapshot = SERVER_SNAPSHOT;
const listeners = new Set<() => void>();

function rand(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;
}

function syncCookie(account: Account | null) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  if (account && db.session) {
    const maxAge = Math.max(0, Math.floor((db.session.expiresAt - Date.now()) / 1000));
    document.cookie = `${SESSION_COOKIE}=1; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
  } else {
    document.cookie = `${SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
  }
}

/** Rebuild the snapshot and tell subscribers. */
function commit() {
  const account = core.currentAccount(db, Date.now());
  if (!account && db.session) db = core.signOut(db); // expired or deleted
  snapshot = { ready: true, account, session: account ? db.session : null };
  syncCookie(account);
  for (const l of listeners) l();
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const saved = raw ? core.parseDb(JSON.parse(raw)) : null;
    if (saved) db = saved;
  } catch {
    // Blocked or corrupt storage: start from the demo accounts.
  }
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Private mode or full storage: the change holds for this visit only.
  }
}

function onStorage(e: StorageEvent) {
  if (e.key !== STORAGE_KEY) return;
  loaded = false;
  db = core.seed();
  load();
  commit();
}

/** Subscribe to sign-in changes (this tab and others). */
let commitQueued = false;

export function subscribeAuth(listener: () => void): () => void {
  // Publish once after the first subscribe. Keyed on the snapshot, not on
  // `loaded`: activeAccountId() may already have loaded the data (the media
  // store reads it first) without anything having been published.
  if (snapshot === SERVER_SNAPSHOT && !commitQueued) {
    commitQueued = true;
    load();
    queueMicrotask(() => {
      commitQueued = false;
      commit();
    });
  }
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

export function useAuth(): AuthSnapshot {
  return useSyncExternalStore(subscribeAuth, () => snapshot, () => SERVER_SNAPSHOT);
}

/** The signed-in account id, read outside React (the media store scopes by it). */
export function activeAccountId(): string | null {
  load();
  return core.currentAccount(db, Date.now())?.id ?? null;
}

/** Early check for the sign-up form; the gateway checks again on submit. */
export function isEmailTaken(email: string): boolean {
  load();
  return !!core.findByEmail(db, email);
}

/* ── Actions ───────────────────────────────────────────────────────── */

export type ActionResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: AuthError; message: string; retryIn?: number; attemptsLeft?: number };

function messageFor(r: Extract<core.Result<unknown>, { ok: false }>): string {
  const base = core.AUTH_ERROR_BN[r.error];
  if (r.attemptsLeft !== undefined) return `${base} আর ${toBanglaDigits(r.attemptsLeft)} বার চেষ্টা করা যাবে।`;
  if (r.retryIn !== undefined) {
    const wait = r.retryIn >= 60 ? `${toBanglaDigits(Math.ceil(r.retryIn / 60))} মিনিট` : `${toBanglaDigits(r.retryIn)} সেকেন্ড`;
    return `${base} (${wait})`;
  }
  return base;
}

async function run<T>(op: (db: AuthDb, now: number) => core.Result<T>): Promise<ActionResult<T>> {
  await new Promise((r) => window.setTimeout(r, LATENCY_MS));
  load();
  const r = op(db, Date.now());
  db = r.db;
  persist();
  commit();
  if (r.ok) return { ok: true, value: r.value };
  return { ok: false, error: r.error, message: messageFor(r), retryIn: r.retryIn, attemptsLeft: r.attemptsLeft };
}

/** Sends a code. Mock: the code comes back so the page can show the "SMS". */
export const requestOtp = (phone: string, purpose: OtpPurpose) => run((d, now) => core.requestOtp(d, phone, purpose, now, rand));
export const verifyOtp = (phone: string, code: string) => run((d, now) => core.verifyOtp(d, phone, code, now));
export const passwordLogin = (identifier: string, password: string) => run((d, now) => core.passwordLogin(d, identifier, password, now));
/** Mock: the token comes back so the page can show the "email". */
export const requestLink = (email: string) => run((d, now) => core.requestLink(d, email, now, rand));
export const consumeLink = (token: string) => run((d, now) => core.consumeLink(d, token, now));
export const register = (input: SignupInput) => run((d, now) => core.register(d, input, now, rand));
export const updateAccount = (patch: AccountPatch) => run((d, now) => core.updateAccount(d, now, patch));
export const changePassword = (current: string, next: string) => run((d, now) => core.changePassword(d, now, current, next));

let signedOutHereAt = 0;

/** Deletes the signed-in account (password re-checked) and signs out everywhere. */
export function deleteAccount(password: string) {
  return run((d, now) => {
    const r = core.deleteAccount(d, now, password);
    // Set before subscribers hear about it, so the route guard stands aside.
    if (r.ok) signedOutHereAt = now;
    return r;
  });
}

/** Signs out here and in every open tab. The caller decides where to go next. */
export function signOut() {
  load();
  signedOutHereAt = Date.now();
  db = core.signOut(db);
  persist();
  commit();
}

/**
 * True right after this tab signed out on purpose. The route guard then
 * leaves navigation to the sign-out button instead of sending the visitor
 * to /login.
 */
export function justSignedOutHere(): boolean {
  return Date.now() - signedOutHereAt < 3000;
}

/** Restores the demo accounts and signs out — for testers. */
export function resetDemoAccounts() {
  signedOutHereAt = Date.now();
  db = core.seed();
  loaded = true;
  persist();
  commit();
}
