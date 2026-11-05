import { NextResponse } from "next/server";
import { z } from "zod";
import { logAudit } from "@/lib/hq/server/audit";
import { verifyPassword } from "@/lib/hq/server/crypto";
import { clearCookies, currentSession, fail, requestMeta } from "@/lib/hq/server/session";
import { mutate } from "@/lib/hq/server/store";

/**
 * Re-enrolling a face: the member confirms their password, the saved face
 * signature is cleared and they're signed out; the next sign-in enrols a
 * new face with three captures.
 */
export async function POST(req: Request) {
  const s = await currentSession();
  if (!s) return fail("Please sign in again.", 401);
  const parsed = z.object({ password: z.string().min(1).max(200) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("Enter your password.");
  if (!verifyPassword(parsed.data.password, s.account.salt, s.account.passHash)) return fail("That password is incorrect.", 401);
  const meta = await requestMeta();
  await mutate((d) => {
    const a = d.accounts.find((x) => x.id === s.account.id);
    if (a) {
      a.face = null;
      a.faceAt = null;
      a.epoch += 1;
    }
    logAudit(d, { kind: "face-enrolled", actor: s.person.id, ...meta, detail: "reset — new face at next sign-in" });
    return null;
  });
  const res = NextResponse.json({ ok: true });
  clearCookies(res);
  return res;
}
