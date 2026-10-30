import { fail, runAction } from "@/lib/hq/server/session";

/** `{ domain, action, payload }` → the domain's action, as the signed-in member. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { domain?: unknown; action?: unknown; payload?: unknown } | null;
  if (!body || typeof body.domain !== "string" || typeof body.action !== "string") return fail("The request wasn't understood.");
  return runAction(body.domain, body.action, body.payload ?? {});
}
