import { createHmac } from "node:crypto";
import { z } from "zod";
import { STRATEGIES } from "@/lib/gori/sim/score";
import { configSchema, planSchema } from "@/lib/gori/sim/types";
import { verifyRun } from "@/lib/gori/sim/verify";

/**
 * POST /api/gori/runs — replays a run on the server and returns its
 * authoritative score and run key. The client never reports its own score:
 * XP is credited from this answer.
 *
 * With GORI_SIGNING_SECRET set, the answer carries an HMAC receipt.
 * TODO(backend): accounts and server-side progress storage — until then the
 * browser holds progress, so receipts prove a score was computed by this
 * server but cannot stop someone editing their own browser storage.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  config: configSchema,
  plan: planSchema,
  strategy: z.enum(STRATEGIES.map((s) => s.id) as [string, ...string[]]),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "অনুরোধটি পড়া যায়নি।" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "খেলার তথ্য ঠিক নেই।" }, { status: 400 });
  const { config, plan, strategy } = parsed.data;
  const v = verifyRun(config, plan, strategy as (typeof STRATEGIES)[number]["id"]);
  const secret = process.env.GORI_SIGNING_SECRET;
  const receipt = secret ? createHmac("sha256", secret).update(`${v.runKey}:${v.total}:${strategy}:${v.ruleset}`).digest("hex") : null;
  return Response.json({ ...v, strategy, receipt }, { headers: { "Cache-Control": "no-store" } });
}
