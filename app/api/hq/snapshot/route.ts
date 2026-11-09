import { NextResponse } from "next/server";
import { currentSession, fail, viewOf } from "@/lib/hq/server/session";

/** The member's view; `?v=` with the version they hold answers `{ same: true }` when nothing changed. */
export async function GET(req: Request) {
  const s = await currentSession();
  if (!s) return fail("Please sign in again.", 401);
  const v = Number(new URL(req.url).searchParams.get("v"));
  if (v && v === s.db.version) return NextResponse.json({ same: true, version: v });
  return NextResponse.json({ view: viewOf(s) }, { headers: { "Cache-Control": "no-store" } });
}
