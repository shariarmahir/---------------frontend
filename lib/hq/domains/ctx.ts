/**
 * The context every HQ action runs in. Actions are plain functions
 * `(ctx, payload) => result` that change `ctx.db` in place; the server runs
 * them on a copy and saves only when they don't throw. Each domain file
 * (tasks.ts, chat.ts…) exports `actions`, and may export `onDecide` to apply
 * an approval of its kind. Throw `HqError` with a plain-English message for
 * anything the member should read.
 */
import { can } from "../rules.ts";
import type { Approval, AuditEntry, HqDb, Notice, Perm, Person, RequestKind } from "../types.ts";

export class HqError extends Error {
  readonly status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export interface Ctx {
  db: HqDb;
  me: Person;
  now: number;
  nowIso: string;
  /** A fresh id, "t-k3j9x2". */
  id(prefix: string): string;
  /** The next serial for a prefix, starting at 1. */
  next(prefix: string): number;
  /** Throws unless the member holds the permission (the prime admin always does). */
  need(perm: Perm): void;
  person(id: string): Person;
  notify(to: string | string[], n: Omit<Notice, "id" | "to" | "at" | "read">): void;
  audit(e: Omit<AuditEntry, "id" | "at" | "actor">): void;
  /** Files a request in the approvals inbox, decided by holders of `perm`. */
  ask(a: Omit<Approval, "id" | "by" | "at" | "status">): Approval;
}

export type Action = (ctx: Ctx, payload: unknown) => unknown;
/** `extra`: what the decider filled in on the approval (e.g. the designation for an approved applicant). */
export type Decide = (ctx: Ctx, approval: Approval, accepted: boolean, extra: Record<string, unknown>) => void;

export interface Domain {
  actions: Record<string, Action>;
  /** Applies an accepted or rejected approval of these kinds. */
  onDecide?: Partial<Record<RequestKind, Decide>>;
}

export function makeCtx(db: HqDb, me: Person, now: number, rand: () => number = Math.random): Ctx {
  const nowIso = new Date(now).toISOString();
  const ctx: Ctx = {
    db,
    me,
    now,
    nowIso,
    id: (prefix) => `${prefix}-${now.toString(36).slice(-4)}${Math.floor(rand() * 36 ** 5).toString(36).padStart(5, "0")}`,
    next: (prefix) => {
      const n = (db.seq[prefix] ?? 0) + 1;
      db.seq[prefix] = n;
      return n;
    },
    need: (perm) => {
      if (!can(me, perm)) throw new HqError("You don't have permission to do this.", 403);
    },
    person: (id) => {
      const p = db.people.find((x) => x.id === id);
      if (!p) throw new HqError("That member wasn't found.", 404);
      return p;
    },
    notify: (to, n) => {
      for (const t of Array.isArray(to) ? to : [to]) {
        if (t === me.id && n.kind !== "system" && n.kind !== "badge") continue;
        db.notices.push({ id: ctx.id("n"), to: t, at: nowIso, read: false, ...n });
      }
      if (db.notices.length > 5000) db.notices = db.notices.slice(-4000);
    },
    audit: (e) => {
      db.audit.push({ id: ctx.id("a"), at: nowIso, actor: me.id, ...e });
      if (db.audit.length > 5000) db.audit = db.audit.slice(-4000);
    },
    ask: (a) => {
      const ap: Approval = { id: ctx.id("ap"), by: me.id, at: nowIso, status: "pending", ...a };
      db.approvals.push(ap);
      const deciders = db.people.filter((p) => p.status === "active" && p.id !== me.id && can(p, a.perm)).map((p) => p.id);
      ctx.notify(deciders, { kind: "approval", title: `Approval needed: ${a.title}`, body: a.detail, href: "/hq/approvals" });
      return ap;
    },
  };
  return ctx;
}

/** Narrow an unknown payload with a zod-like parser and turn its failure into a readable error. */
export function parse<T>(schema: { safeParse(v: unknown): { success: true; data: T } | { success: false; error: { issues: { path: PropertyKey[]; message: string }[] } } }, payload: unknown): T {
  const r = schema.safeParse(payload);
  if (!r.success) {
    const first = r.error.issues[0];
    throw new HqError(`Some details are invalid${first ? ` (${first.path.join(".")}: ${first.message})` : ""}.`);
  }
  return r.data;
}

export function find<T extends { id: string }>(list: T[], id: string, what = "This item"): T {
  const x = list.find((i) => i.id === id);
  if (!x) throw new HqError(`${what} wasn't found.`, 404);
  return x;
}
