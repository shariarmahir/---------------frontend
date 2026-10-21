import { NextResponse } from "next/server";
import { z } from "zod";
import { LOCK_AFTER, LOCK_MS, logAudit } from "@/lib/hq/server/audit";
import { verifyPassword } from "@/lib/hq/server/crypto";
import { devFaceBypass, fail, requestMeta, setPending, setSession } from "@/lib/hq/server/session";
import { mutate, readDb } from "@/lib/hq/server/store";

const body = z.object({ id: z.string().trim().min(3).max(120), password: z.string().min(1).max(200) });

/**
 * Step one of signing in: username (or email) and password. A right
 * password never signs in by itself: it leads to the face check, or to the
 * first face enrolment.
 */
export async function POST(req: Request) {
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("Enter your username and password.");
  const ident = parsed.data.id.toLowerCase();
  const meta = await requestMeta();
  const db = await readDb();
  const acc = db.accounts.find((a) => a.email === ident || a.handle === ident);

  if (acc?.lockedUntil && Date.parse(acc.lockedUntil) > Date.now()) {
    const mins = Math.ceil((Date.parse(acc.lockedUntil) - Date.now()) / 60_000);
    return fail(`Too many failed attempts. Try again in ${mins} min.`, 429);
  }

  const ok = verifyPassword(parsed.data.password, acc?.salt ?? "", acc?.passHash ?? "");
  if (!acc || !ok) {
    await mutate((d) => {
      const a = acc && d.accounts.find((x) => x.id === acc.id);
      if (a) {
        a.failures += 1;
        if (a.failures >= LOCK_AFTER) {
          a.lockedUntil = new Date(Date.now() + LOCK_MS).toISOString();
          a.failures = 0;
          logAudit(d, { kind: "locked", actor: a.personId, ...meta, detail: "password" });
        }
      }
      logAudit(d, { kind: "login-fail", actor: acc?.personId, ...meta, detail: acc ? "wrong password" : `unknown ${ident.slice(0, 60)}` });
    });
    return fail("Username or password is incorrect.", 401);
  }

  const person = db.people.find((p) => p.id === acc.personId);
  if (!person || person.status !== "active") return fail("This account is currently disabled. Please talk to HR or the prime admin.", 403);

  const bypass = await devFaceBypass();
  const { db: next } = await mutate((d) => {
    const a = d.accounts.find((x) => x.id === acc.id)!;
    a.failures = 0;
    a.lockedUntil = null;
    if (bypass) {
      a.lastLoginAt = new Date().toISOString();
      logAudit(d, { kind: "login", actor: a.personId, ...meta, detail: "face check skipped (development)" });
    }
    return null;
  });
  const fresh = next.accounts.find((a) => a.id === acc.id)!;

  if (bypass) {
    const res = NextResponse.json({ next: "in" });
    setSession(res, fresh, true);
    return res;
  }
  const stage = fresh.face ? "face" : "enroll";
  const res = NextResponse.json({ next: stage, name: person.nameBn });
  setPending(res, fresh, stage);
  return res;
}
