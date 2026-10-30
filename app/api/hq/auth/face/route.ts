import { NextResponse } from "next/server";
import { LOCK_AFTER, LOCK_MS, logAudit } from "@/lib/hq/server/audit";
import { enrolFace, FACE_MATCH, faceDistance, validDescriptor } from "@/lib/hq/server/crypto";
import { fail, pendingToken, requestMeta, setSession } from "@/lib/hq/server/session";
import { mutate } from "@/lib/hq/server/store";

/**
 * Step two: the face. The browser turns the front camera's frames into
 * 128-number signatures (face-api, components/hq/face-camera.tsx); only
 * those numbers reach the server, never a photo. First sign-in enrols three
 * captures; afterwards one capture must sit within FACE_MATCH of them.
 */
export async function POST(req: Request) {
  const pending = await pendingToken();
  if (!pending) return fail("Your sign-in step expired. Enter your username and password again.", 401);
  const input = (await req.json().catch(() => null)) as { descriptor?: unknown; captures?: unknown } | null;
  const meta = await requestMeta();

  if (pending.s === "enroll") {
    const captures = Array.isArray(input?.captures) ? (input!.captures as number[][]) : [];
    const face = enrolFace(captures);
    if (!face) return fail("The face wasn't clear, or the three captures didn't match. Face the light, look straight ahead and try again.");
    const { db } = await mutate((d) => {
      const a = d.accounts.find((x) => x.id === pending.a);
      if (!a) throw new Error("account gone");
      a.face = face;
      a.faceAt = new Date().toISOString();
      a.lastLoginAt = a.faceAt;
      logAudit(d, { kind: "face-enrolled", actor: a.personId, ...meta });
      logAudit(d, { kind: "login", actor: a.personId, ...meta, detail: "first sign-in, face enrolled" });
      return null;
    });
    const res = NextResponse.json({ next: "in" });
    setSession(res, db.accounts.find((a) => a.id === pending.a)!);
    return res;
  }

  if (!validDescriptor(input?.descriptor)) return fail("No face was found. Look straight at the camera.");
  const descriptor = input!.descriptor as number[];
  const { db, result } = await mutate((d) => {
    const a = d.accounts.find((x) => x.id === pending.a);
    if (!a?.face) return { ok: false, distance: 1, locked: false };
    const distance = faceDistance(a.face, descriptor);
    const ok = distance <= FACE_MATCH;
    if (ok) {
      a.failures = 0;
      a.lastLoginAt = new Date().toISOString();
      logAudit(d, { kind: "face-ok", actor: a.personId, ...meta, detail: `distance ${distance.toFixed(3)}` });
      logAudit(d, { kind: "login", actor: a.personId, ...meta });
      return { ok, distance, locked: false };
    }
    a.failures += 1;
    logAudit(d, { kind: "face-fail", actor: a.personId, ...meta, detail: `distance ${distance.toFixed(3)}` });
    let locked = false;
    if (a.failures >= LOCK_AFTER) {
      a.failures = 0;
      a.lockedUntil = new Date(Date.now() + LOCK_MS).toISOString();
      logAudit(d, { kind: "locked", actor: a.personId, ...meta, detail: "face" });
      locked = true;
    }
    return { ok, distance, locked };
  });
  if (!result.ok) {
    const res = fail(result.locked ? "Your face didn't match several times. Try again in five minutes." : "Your face didn't match. Face the light, look straight ahead and try again.", result.locked ? 429 : 401);
    if (result.locked) res.cookies.delete("hq_pending");
    return res;
  }
  const res = NextResponse.json({ next: "in" });
  setSession(res, db.accounts.find((a) => a.id === pending.a)!);
  return res;
}
