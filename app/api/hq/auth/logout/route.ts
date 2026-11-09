import { NextResponse } from "next/server";
import { logAudit } from "@/lib/hq/server/audit";
import { clearCookies, currentSession, requestMeta } from "@/lib/hq/server/session";
import { mutate } from "@/lib/hq/server/store";

/** Signs out here; `{ everywhere: true }` also ends every other session of this account. */
export async function POST(req: Request) {
  const s = await currentSession();
  const everywhere = Boolean(((await req.json().catch(() => ({}))) as { everywhere?: boolean }).everywhere);
  if (s) {
    const meta = await requestMeta();
    await mutate((d) => {
      const a = d.accounts.find((x) => x.id === s.account.id);
      if (a && everywhere) a.epoch += 1;
      logAudit(d, { kind: "logout", actor: s.person.id, ...meta, detail: everywhere ? "everywhere" : undefined });
      return null;
    });
  }
  const res = NextResponse.json({ ok: true });
  clearCookies(res);
  return res;
}
