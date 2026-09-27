import { createHmac } from "node:crypto";
import { MISSION_ENGINE, missionKey, replay, scoreMission, type MissionAction, type MissionConfig } from "@/lib/gori/mission/engine";
import { missionRunSchema } from "@/lib/gori/mission/schema";
import { MISSION_VERSION } from "@/data/gori/mission";

/**
 * POST /api/gori/mission — replays a finished mission (config + actions)
 * through the same pure engine and returns the authoritative outcome,
 * score and run key. XP is credited from this answer, not from the client.
 * With GORI_SIGNING_SECRET set, the answer carries an HMAC receipt.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "অনুরোধটি পড়া যায়নি।" }, { status: 400 });
  }
  const parsed = missionRunSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "খেলার তথ্য ঠিক নেই।" }, { status: 400 });
  const config = parsed.data.config as MissionConfig;
  const actions = parsed.data.actions as MissionAction[];
  let state;
  try {
    state = replay(config, actions);
  } catch {
    return Response.json({ error: "এই চালগুলো নিয়ম মেনে পুনরায় চালানো যায় না।" }, { status: 422 });
  }
  if (!state.outcome) return Response.json({ error: "খেলা এখনো শেষ হয়নি।" }, { status: 422 });
  const runKey = missionKey(config, actions);
  const { total } = scoreMission(state);
  const secret = process.env.GORI_SIGNING_SECRET;
  const receipt = secret ? createHmac("sha256", secret).update(`mission:${runKey}:${total}:${MISSION_ENGINE}`).digest("hex") : null;
  return Response.json(
    { runKey, total, outcome: state.outcome, turns: state.turn, engine: MISSION_ENGINE, ruleset: MISSION_VERSION, receipt },
    { headers: { "Cache-Control": "no-store" } },
  );
}
