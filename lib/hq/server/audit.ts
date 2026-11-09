import type { AuditEntry, HqDb } from "@/lib/hq/types";

/** Appends to the security log inside a `mutate` (sign-in routes have no member context yet). */
export function logAudit(db: HqDb, e: Omit<AuditEntry, "id" | "at">): void {
  db.audit.push({ id: `a-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`, at: new Date().toISOString(), ...e });
  if (db.audit.length > 5000) db.audit = db.audit.slice(-4000);
}

export const LOCK_AFTER = 5;
export const LOCK_MS = 5 * 60_000;
