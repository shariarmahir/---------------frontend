/**
 * Sign-in state for কাণ্ডারী HQ. Two httpOnly cookies, both HMAC-signed:
 *   hq_pending — the password was right; the face check (or first
 *                enrolment) comes next. Five minutes.
 *   hq_session — signed in, face verified. Twelve hours.
 * The session carries the account's epoch, so "sign out everywhere" ends
 * every copy. proxy.ts only checks the cookie exists (optimistic); this
 * file is where it is actually verified.
 */
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { DOMAINS, type DomainName } from "@/lib/hq/domains";
import { HqError, makeCtx } from "@/lib/hq/domains/ctx";
import type { Account, HqDb, Person } from "@/lib/hq/types";
import { viewFor } from "@/lib/hq/view";
import { readToken, signToken } from "./crypto";
import { mutate, readDb } from "./store";

export const SESSION_COOKIE = "hq_session";
export const PENDING_COOKIE = "hq_pending";
export const SESSION_MS = 12 * 60 * 60_000;
export const PENDING_MS = 5 * 60_000;

interface SessionToken {
  a: string;
  e: number;
  x: number;
  /** Face check skipped (development only). */
  b?: 1;
}
export interface PendingToken {
  a: string;
  x: number;
  /** "face": verify against the enrolled signature; "enroll": first time. */
  s: "face" | "enroll";
}

const cookieBase = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/" };

export function setSession(res: NextResponse, acc: Account, bypass = false): void {
  const token = signToken({ a: acc.id, e: acc.epoch, x: Date.now() + SESSION_MS, ...(bypass ? { b: 1 } : {}) });
  res.cookies.set(SESSION_COOKIE, token, { ...cookieBase, maxAge: SESSION_MS / 1000 });
  res.cookies.delete(PENDING_COOKIE);
}

export function setPending(res: NextResponse, acc: Account, stage: PendingToken["s"]): void {
  res.cookies.set(PENDING_COOKIE, signToken({ a: acc.id, x: Date.now() + PENDING_MS, s: stage }), { ...cookieBase, maxAge: PENDING_MS / 1000 });
}

export function clearCookies(res: NextResponse): void {
  res.cookies.delete(SESSION_COOKIE);
  res.cookies.delete(PENDING_COOKIE);
}

export async function pendingToken(): Promise<PendingToken | null> {
  return readToken<PendingToken>((await cookies()).get(PENDING_COOKIE)?.value);
}

export interface Signed {
  db: HqDb;
  account: Account;
  person: Person;
}

/** The signed-in member, or null (bad or expired cookie, ended session, suspended member). */
export async function currentSession(): Promise<Signed | null> {
  const t = readToken<SessionToken>((await cookies()).get(SESSION_COOKIE)?.value);
  if (!t) return null;
  const db = await readDb();
  const account = db.accounts.find((a) => a.id === t.a);
  if (!account || account.epoch !== t.e) return null;
  const person = db.people.find((p) => p.id === account.personId);
  if (!person || person.status !== "active") return null;
  return { db, account, person };
}

/** Development-only shortcut for automated screenshots: needs the env flag AND the request header. */
export async function devFaceBypass(): Promise<boolean> {
  if (process.env.NODE_ENV === "production" || process.env.HQ_DEV_FACE_BYPASS !== "1") return false;
  return (await headers()).get("x-hq-dev-bypass") === "1";
}

export async function requestMeta(): Promise<{ ip?: string; ua?: string }> {
  const h = await headers();
  return { ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || undefined, ua: h.get("user-agent")?.slice(0, 160) || undefined };
}

export function viewOf(s: Signed, db: HqDb = s.db) {
  const person = db.people.find((p) => p.id === s.person.id) ?? s.person;
  const account = db.accounts.find((a) => a.id === s.account.id) ?? s.account;
  return viewFor(db, person, Date.now(), Boolean(account.face));
}

export function fail(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/** Runs one domain action as the signed-in member and answers with their fresh view. */
export async function runAction(domain: string, action: string, payload: unknown): Promise<NextResponse> {
  const s = await currentSession();
  if (!s) return fail("Please sign in again.", 401);
  const d = (DOMAINS as Record<string, (typeof DOMAINS)[DomainName]>)[domain];
  const fn = d?.actions[action];
  if (!fn) return fail("No such action.", 404);
  try {
    const { db, result } = await mutate((draft) => {
      const me = draft.people.find((p) => p.id === s.person.id)!;
      return fn(makeCtx(draft, me, Date.now()), payload);
    });
    return NextResponse.json({ result: result ?? null, view: viewOf(s, db) });
  } catch (e) {
    if (e instanceof HqError) return fail(e.message, e.status);
    console.error("[hq] action failed", domain, action, e);
    return fail("That didn't work. Please try again.", 500);
  }
}
