import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import {
  agentRequestSchema,
  analysisSchema,
  buildContext,
  finalizeAnalysis,
  moderationSchema,
  offlineAnalysis,
  offlineModeration,
  SYSTEM_PROMPT,
  userMessage,
  type AgentAnswer,
  type AgentRequest,
} from "@/lib/gori/ai/agents";
import { digest } from "@/lib/gori/rng";

/**
 * POST /api/gori/ai — the game's seven agents, one structured answer each.
 *
 * Uses Claude when a key is configured (ANTHROPIC_API_KEY or
 * ANTHROPIC_AUTH_TOKEN); otherwise, when rate-limited, or on any API error or
 * refusal, the offline agent answers in the same shape. `mode` in the body
 * says which one spoke.
 *
 * TODO(backend): persist the audit log, per-account rate limits and a human
 * review queue for "review" moderation verdicts (Prompt V3 §16, §18).
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "claude-opus-5";
const WINDOW_MS = 60_000;
const PER_WINDOW = 12;
const hits = new Map<string, number[]>();

function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > PER_WINDOW;
}

function audit(entry: Record<string, unknown>) {
  // No player text and no raw IP in the log.
  console.info(`[gori/ai] ${JSON.stringify({ ts: new Date().toISOString(), ...entry })}`);
}

function offline(req: AgentRequest): AgentAnswer {
  if (req.agent === "moderation") return { agent: "moderation", mode: "offline", moderation: offlineModeration(req.text) };
  const ctx = buildContext(req);
  return { agent: req.agent, mode: "offline", ...finalizeAnalysis(offlineAnalysis(req, ctx), ctx) };
}

export async function POST(request: Request) {
  const ip = digest(request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local");
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "অনুরোধটি পড়া যায়নি।" }, { status: 400 });
  }
  const parsed = agentRequestSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "অনুরোধের তথ্য ঠিক নেই।", issues: parsed.error.issues.slice(0, 3).map((i) => i.message) }, { status: 400 });
  const req = parsed.data;

  const hasKey = !!(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
  if (!hasKey || limited(ip)) {
    audit({ agent: req.agent, mode: "offline", reason: hasKey ? "rate-limit" : "no-key", ip });
    return Response.json(offline(req), { headers: { "Cache-Control": "no-store" } });
  }

  const ctx = buildContext(req);
  const client = new Anthropic({ timeout: 60_000, maxRetries: 1 });
  try {
    const common = {
      model: MODEL,
      max_tokens: 8000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default" as const,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user" as const, content: userMessage(req, ctx) }],
    };
    if (req.agent === "moderation") {
      const res = await client.beta.messages.parse({ ...common, output_config: { effort: "low", format: betaZodOutputFormat(moderationSchema) } });
      if (res.stop_reason === "refusal" || !res.parsed_output) throw new Error(`no parsed output (${res.stop_reason})`);
      // The offline filter still runs: a model "allow" never overrides a hard block on personal data.
      const hard = offlineModeration(req.text);
      const moderation = hard.verdict === "block" ? hard : res.parsed_output;
      audit({ agent: req.agent, mode: "claude", verdict: moderation.verdict, ip });
      return Response.json({ agent: "moderation", mode: "claude", moderation } satisfies AgentAnswer, { headers: { "Cache-Control": "no-store" } });
    }
    const res = await client.beta.messages.parse({ ...common, output_config: { effort: "low", format: betaZodOutputFormat(analysisSchema) } });
    if (res.stop_reason === "refusal" || !res.parsed_output) throw new Error(`no parsed output (${res.stop_reason})`);
    const done = finalizeAnalysis(res.parsed_output, ctx);
    audit({ agent: req.agent, mode: "claude", cited: done.sources.length, dropped: done.dropped.length, model: res.model, ip });
    return Response.json({ agent: req.agent, mode: "claude", ...done } satisfies AgentAnswer, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    const why = err instanceof Anthropic.APIError ? `api ${err.status}` : err instanceof Error ? err.message : "unknown";
    audit({ agent: req.agent, mode: "offline", reason: why, ip });
    return Response.json(offline(req), { headers: { "Cache-Control": "no-store" } });
  }
}
