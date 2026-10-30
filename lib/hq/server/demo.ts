/**
 * Demo sign-ins, one per level below the super prime admin
 * (data/hq/people.ts), for trying HQ as each role. They all share
 * HQ_DEMO_PASSWORD, or the built-in test password while it is unset; set it
 * to "off" and their accounts go and the demo people are marked "left".
 * Turn them off before the real team signs in: the sign-in page shows the
 * demo password to anyone who opens it.
 */
import { demoPeople, DEMO_LOGINS } from "../../../data/hq/people.ts";
import { LEVEL_LABEL } from "../rules.ts";
import type { HqDb, Level } from "../types.ts";
import { hashPassword, verifyPassword } from "./password.ts";
import { TEST_PASSWORD } from "./test-access.ts";

export function demoPassword(): string | null {
  const pw = process.env.HQ_DEMO_PASSWORD?.trim();
  if (!pw) return TEST_PASSWORD;
  return pw.toLowerCase() !== "off" && pw.length >= 8 ? pw : null;
}

/** What the sign-in page offers while demo sign-ins are on. */
export interface DemoOffer {
  password: string;
  logins: { level: Level; label: string; handle: string }[];
}

export function demoOffer(): DemoOffer | null {
  const password = demoPassword();
  if (!password) return null;
  return { password, logins: DEMO_LOGINS.map((d) => ({ level: d.level, label: LEVEL_LABEL[d.level], handle: d.handle })) };
}

/** Brings the demo people and accounts in step with the environment; true when it changed something. */
export function syncDemo(db: HqDb): boolean {
  const password = demoPassword();
  let changed = false;

  if (!password) {
    const before = db.accounts.length;
    db.accounts = db.accounts.filter((a) => !a.demo);
    if (db.accounts.length !== before) changed = true;
    for (const p of db.people) {
      if (p.demo && p.status === "active") {
        p.status = "left";
        p.hasAccount = false;
        changed = true;
      }
    }
    return changed;
  }

  // Demo seats that no longer exist lose their sign-in.
  const seats = demoPeople();
  const ids = new Set(seats.map((s) => s.id));
  const before = db.accounts.length;
  db.accounts = db.accounts.filter((a) => !a.demo || ids.has(a.personId));
  if (db.accounts.length !== before) changed = true;
  for (const p of db.people) {
    if (p.demo && !ids.has(p.id) && p.status === "active") {
      p.status = "left";
      p.hasAccount = false;
      changed = true;
    }
  }

  // One hash for every demo account; re-made only when the password changes.
  const first = db.accounts.find((a) => a.demo);
  const secret = first && verifyPassword(password, first.salt, first.passHash) ? { salt: first.salt, hash: first.passHash } : hashPassword(password);
  const at = new Date().toISOString();

  for (const seat of seats) {
    const person = db.people.find((p) => p.id === seat.id);
    if (!person) {
      db.people.push(seat);
      changed = true;
    } else if (person.status === "left") {
      // Back on after a pause; a member the prime admin suspended stays suspended.
      person.status = "active";
      person.hasAccount = true;
      changed = true;
    }
    const acc = db.accounts.find((a) => a.personId === seat.id);
    if (!acc) {
      db.accounts.push({
        id: `acc-${seat.id}`,
        personId: seat.id,
        email: seat.email!,
        handle: seat.handle,
        passHash: secret.hash,
        salt: secret.salt,
        face: null,
        faceAt: null,
        failures: 0,
        lockedUntil: null,
        createdAt: at,
        lastLoginAt: null,
        epoch: 0,
        demo: true,
      });
      changed = true;
    } else if (acc.salt !== secret.salt || acc.passHash !== secret.hash) {
      Object.assign(acc, { salt: secret.salt, passHash: secret.hash, failures: 0, lockedUntil: null });
      changed = true;
    }
  }
  return changed;
}
