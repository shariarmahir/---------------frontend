/**
 * কাণ্ডারী HQ's database until the FastAPI + Postgres backend exists: one
 * JSON document on the server's disk (`.hq-data/db.json`, git-ignored, or
 * HQ_DATA_DIR). Writes go one at a time through a queue onto a copy, and
 * are saved atomically (temp file + rename), so a failed action changes
 * nothing. Works on a dev machine or a VPS; a serverless host (Vercel) has
 * no lasting disk, so deploy HQ only with the real backend or a VPS.
 *
 * The prime admin's account comes from the environment (HQ_PRIME_EMAIL,
 * HQ_PRIME_PASSWORD_HASH, see scripts/hq-hash.mjs). So do the demo sign-ins
 * (HQ_DEMO_PASSWORD, ./demo.ts). A host without them uses the public test
 * sign-ins in ./test-access.ts.
 */
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { PRIME_ID } from "@/data/hq/people";
import { emptyDb, seedDb } from "@/lib/hq/seed";
import type { HqDb } from "@/lib/hq/types";
import { syncDemo } from "./demo";
import { TEST_PRIME_EMAIL, TEST_PRIME_HASH } from "./test-access";

// Vercel's functions can only write to /tmp: HQ runs there for testing, but
// each instance keeps its own copy and loses it on a cold start.
export const DATA_DIR = process.env.HQ_DATA_DIR || (process.env.VERCEL ? path.join(os.tmpdir(), "hq-data") : path.join(process.cwd(), ".hq-data"));
const FILE = path.join(DATA_DIR, "db.json");

interface Cache {
  db?: HqDb;
  mtime?: number;
  envKey?: string;
  queue: Promise<unknown>;
}
const g = globalThis as unknown as { __hqStore?: Cache };
const cache: Cache = (g.__hqStore ??= { queue: Promise.resolve() });

/** Fills collections a newer version added, so an older file keeps working. */
function upgrade(raw: Partial<HqDb>): HqDb {
  const base = emptyDb(Date.now());
  const db = { ...base, ...raw } as HqDb;
  for (const key of Object.keys(base) as (keyof HqDb)[]) {
    if (Array.isArray(base[key]) && !Array.isArray(db[key])) (db as unknown as Record<string, unknown>)[key] = [];
  }
  db.accounts = db.accounts.map((a) => ({ ...a, epoch: a.epoch ?? 0 }));
  return db;
}

/**
 * "scrypt:<salt>:<hash>" from scripts/hq-hash.mjs (no "$": Next expands it
 * in .env files); the built-in test sign-in when neither variable is set.
 */
function primeSecret(): { email: string; salt: string; hash: string } | null {
  const unset = !process.env.HQ_PRIME_EMAIL?.trim() && !process.env.HQ_PRIME_PASSWORD_HASH?.trim();
  const email = (unset ? TEST_PRIME_EMAIL : process.env.HQ_PRIME_EMAIL)?.trim().toLowerCase();
  const packed = (unset ? TEST_PRIME_HASH : process.env.HQ_PRIME_PASSWORD_HASH)?.trim();
  if (!email || !packed) return null;
  const [scheme, salt, hash] = packed.split(":");
  if (scheme !== "scrypt" || !salt || !hash) return null;
  return { email, salt, hash };
}

/** Keeps the prime admin's account in step with the environment (changing it there rotates the password). */
function bootstrapPrime(db: HqDb): boolean {
  const secret = primeSecret();
  if (!secret) return false;
  const person = db.people.find((p) => p.id === PRIME_ID);
  if (!person) return false;
  const acc = db.accounts.find((a) => a.personId === PRIME_ID);
  if (acc) {
    if (acc.email === secret.email && acc.salt === secret.salt && acc.passHash === secret.hash) return false;
    Object.assign(acc, { email: secret.email, salt: secret.salt, passHash: secret.hash, failures: 0, lockedUntil: null });
    return true;
  }
  db.accounts.push({
    id: "acc-prime",
    personId: PRIME_ID,
    email: secret.email,
    handle: person.handle,
    passHash: secret.hash,
    salt: secret.salt,
    face: null,
    faceAt: null,
    failures: 0,
    lockedUntil: null,
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
    epoch: 0,
  });
  person.email = secret.email;
  person.hasAccount = true;
  return true;
}

async function save(db: HqDb): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${FILE}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db), "utf8");
  await fs.rename(tmp, FILE);
  cache.mtime = (await fs.stat(FILE)).mtimeMs;
}

async function load(): Promise<HqDb> {
  let stat: { mtimeMs: number } | null = null;
  try {
    stat = await fs.stat(FILE);
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
  }
  // The environment can change under a running server (a new password hash).
  const envKey = `${process.env.HQ_PRIME_EMAIL ?? ""}|${process.env.HQ_PRIME_PASSWORD_HASH ?? ""}|${process.env.HQ_DEMO_PASSWORD ?? ""}`;
  // Re-read when someone else changed the file (another process, or a reset).
  if (cache.db && stat && stat.mtimeMs === cache.mtime && cache.envKey === envKey) return cache.db;
  let db: HqDb;
  if (stat) {
    db = cache.db && stat.mtimeMs === cache.mtime ? cache.db : upgrade(JSON.parse(await fs.readFile(FILE, "utf8")) as Partial<HqDb>);
    cache.mtime = stat.mtimeMs;
    const prime = bootstrapPrime(db);
    const demo = syncDemo(db);
    if (prime || demo) await save(db);
  } else {
    db = seedDb(Date.now());
    bootstrapPrime(db);
    syncDemo(db);
    await save(db);
  }
  cache.db = db;
  cache.envKey = envKey;
  return db;
}

/** The current database (read-only use: don't change what this returns). */
export function readDb(): Promise<HqDb> {
  // Reads wait behind queued writes so they never see half a change.
  const p = cache.queue.then(load, load);
  return p;
}

/**
 * Runs a change on a copy and saves it when `fn` returns; if `fn` throws,
 * nothing is saved and the error reaches the caller.
 */
export function mutate<T>(fn: (db: HqDb) => T | Promise<T>): Promise<{ db: HqDb; result: T }> {
  const run = cache.queue.then(async () => {
    const current = await load();
    const draft = structuredClone(current);
    const result = await fn(draft);
    draft.version = current.version + 1;
    await save(draft);
    cache.db = draft;
    return { db: draft, result };
  });
  cache.queue = run.catch(() => undefined);
  return run;
}

/** Wipes the database back to day one (the prime admin's reset; dev scripts delete the file instead). */
export function resetDb(samples: boolean): Promise<{ db: HqDb; result: null }> {
  return mutate((db) => {
    const fresh = seedDb(Date.now(), { samples });
    // Accounts, face enrolments, the demo people and the face-lock switch survive a reset.
    fresh.accounts = db.accounts;
    fresh.people.push(...db.people.filter((p) => p.demo));
    fresh.faceLock = db.faceLock;
    for (const p of fresh.people) p.hasAccount = db.accounts.some((a) => a.personId === p.id);
    Object.assign(db, fresh, { version: db.version });
    return null;
  });
}
