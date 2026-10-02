import { createHash } from "node:crypto";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { IMAGE_TYPES, MAX_FILES, offlineQuestion, offlineReply, questionBrief, type TutorFile, type TutorTurn } from "@/lib/media/tutor";

/**
 * POST /media/api/tutor — the classroom's AI study helper, streamed as plain
 * text. A body with `task: "question"` instead asks it to build one clear
 * question for the teacher out of a student's rough draft (Discussion Room).
 *
 * Claude answers when a key is configured (ANTHROPIC_API_KEY or
 * ANTHROPIC_AUTH_TOKEN); with no key, when rate-limited, or when the API
 * fails before its first word, the offline helper answers instead. The
 * `X-Tutor-Mode` header says which one spoke. Members only: proxy.ts guards
 * /media/*.
 *
 * TODO(backend): per-account limits and usage logs once accounts live on a server.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "claude-opus-5-5";
const WINDOW_MS = 60_000;
const PER_WINDOW = 15;
const hits = new Map<string, number[]>();

function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > PER_WINDOW;
}

const file = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("image"), name: z.string().max(200), media: z.enum(IMAGE_TYPES), data: z.string().max(3_000_000) }),
  z.object({ kind: z.literal("pdf"), name: z.string().max(200), media: z.literal("application/pdf"), data: z.string().max(4_200_000) }),
  z.object({ kind: z.literal("text"), name: z.string().max(200), media: z.string().max(100), data: z.string().max(40_000) }),
]);

const schema = z.object({
  turns: z
    .array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().max(12_000), files: z.array(file).max(MAX_FILES).optional() }))
    .min(1)
    .max(13)
    .refine((t) => t[0].role === "user" && t.at(-1)!.role === "user", "কথোপকথন শিক্ষার্থী দিয়ে শুরু ও শেষ হবে"),
  context: z.object({ room: z.string().max(200).optional(), level: z.string().max(60).optional(), subject: z.string().max(100).optional(), parent: z.boolean().optional() }).optional(),
  numerals: z.enum(["bn", "latn"]).optional(),
});

const questionSchema = z.object({
  task: z.literal("question"),
  question: z.object({
    draft: z.string().max(1000),
    room: z.string().max(200).optional(),
    subject: z.string().max(100).optional(),
    teacher: z.string().max(120).optional(),
    lastTeacher: z.string().max(1000).optional(),
  }),
});

type Context = z.infer<typeof schema>["context"];

const QUESTION_SYSTEM = [
  "You help a student write ONE clear question to their teacher in a class discussion thread, inside শিক্ষিতদের মিডিয়া's classroom (Bangladesh, school to university).",
  "Reply with the question only: no preface, no quotation marks, no markdown, no explanation.",
  "Write in the language of the student's draft; default to simple, polite Bangla. Address the teacher by the title in their name (স্যার or ম্যাডাম) when there is one, otherwise 'শ্রদ্ধেয় শিক্ষক'.",
  "Shape it in two to four short sentences: what the student is working on, what they already understood or tried, and exactly where they are stuck.",
  "Use only what the draft and the class details say. Never invent marks, mistakes, attempts or facts about the student. Where the draft is silent about what they tried or where they are stuck, leave a short blank written as [ ] for the student to fill in.",
  "If the draft is empty, use the teacher's latest message as the topic and leave [ ] blanks.",
].join("\n");

function system(ctx: Context): string {
  const where = [ctx?.room && `ক্লাস: ${ctx.room}`, ctx?.level && `স্তর: ${ctx.level}`, ctx?.subject && `বিষয়: ${ctx.subject}`].filter(Boolean).join(" · ");
  return [
    "You are the study helper inside শিক্ষিতদের মিডিয়া's classroom, a free learning platform for students in Bangladesh, from school to university and job exams.",
    "Answer in the language the student writes in; default to clear, simple Bangla. Use Bangla digits in Bangla answers.",
    "Teach, don't just hand over answers: explain step by step, check understanding, and offer a short practice question when it helps. If they ask you to check their work, check it and point to the exact mistake.",
    "Files may be attached: photos of a textbook or notebook, PDFs, or text read out of Word and PowerPoint files. Work from what they contain; if something is unreadable, say so plainly.",
    "Write plain text for a small chat panel: short paragraphs and simple numbered or bulleted lines. No markdown headings, tables or bold markers. Write maths inline (x² + 5x + 6 = 0).",
    "Keep to learning. For health, legal or safety questions give general guidance and point to a teacher, parent or professional. Never invent facts about the student's class, marks or teacher.",
    ctx?.parent ? "The person asking is a parent watching their child's class: help them understand the topic and how to support the child." : "",
    where ? `The student has this class open — ${where}.` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function blocks(t: TutorTurn): Anthropic.ContentBlockParam[] {
  const out: Anthropic.ContentBlockParam[] = [];
  for (const f of t.files ?? []) {
    if (f.kind === "image") out.push({ type: "image", source: { type: "base64", media_type: f.media as (typeof IMAGE_TYPES)[number], data: f.data } });
    else if (f.kind === "pdf") out.push({ type: "document", title: f.name, source: { type: "base64", media_type: "application/pdf", data: f.data } });
    else out.push({ type: "document", title: f.name, source: { type: "text", media_type: "text/plain", data: f.data || "(ফাঁকা ফাইল)" } });
  }
  out.push({ type: "text", text: t.text.trim() || "এই ফাইলগুলো বুঝিয়ে দিন।" });
  return out;
}

const headers = (mode: "claude" | "offline") => ({ "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Tutor-Mode": mode });

/** One request, whichever task: what to ask Claude, and what to say without it. */
interface Job {
  system: string;
  messages: Anthropic.MessageParam[];
  maxTokens: number;
  fallback: () => string;
}

const offline = (job: Job) => new Response(job.fallback(), { headers: headers("offline") });

function studyJob(data: z.infer<typeof schema>): Job {
  const last = data.turns.at(-1)!;
  return {
    system: system(data.context),
    messages: data.turns.map((t) => ({ role: t.role, content: t.role === "user" ? blocks(t) : t.text })),
    maxTokens: 2048,
    fallback: () => offlineReply(last.text, (last.files ?? []) as TutorFile[], data.numerals),
  };
}

function questionJob(q: z.infer<typeof questionSchema>["question"]): Job {
  return {
    system: QUESTION_SYSTEM,
    messages: [{ role: "user", content: questionBrief(q) }],
    maxTokens: 500,
    fallback: () => offlineQuestion(q),
  };
}

export async function POST(request: Request) {
  const ip = createHash("sha256").update(request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local").digest("hex").slice(0, 16);
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "অনুরোধটি পড়া যায়নি।" }, { status: 400 });
  }
  const asked = questionSchema.safeParse(body);
  const parsed = asked.success ? null : schema.safeParse(body);
  if (!asked.success && !parsed?.success) return Response.json({ error: "অনুরোধের তথ্য ঠিক নেই।" }, { status: 400 });
  const task = asked.success ? "question" : "study";
  const job = asked.success ? questionJob(asked.data.question) : studyJob(parsed!.data!);

  const hasKey = !!(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
  if (!hasKey || limited(ip)) {
    console.info(`[media/tutor] ${JSON.stringify({ task, mode: "offline", reason: hasKey ? "rate-limit" : "no-key", ip })}`);
    return offline(job);
  }

  const client = new Anthropic({ timeout: 90_000, maxRetries: 1 });
  const stream = client.messages.stream({ model: MODEL, max_tokens: job.maxTokens, system: job.system, messages: job.messages });
  const events = stream[Symbol.asyncIterator]();

  // Wait for the first words, so a failure before any text can still fall back to the offline helper.
  let first = "";
  try {
    for (;;) {
      const next = await events.next();
      if (next.done) break;
      const ev = next.value;
      if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
        first = ev.delta.text;
        break;
      }
    }
  } catch (err) {
    const why = err instanceof Anthropic.APIError ? `api ${err.status}` : err instanceof Error ? err.message : "unknown";
    console.info(`[media/tutor] ${JSON.stringify({ task, mode: "offline", reason: why, ip })}`);
    return offline(job);
  }
  if (!first) return offline(job);

  const enc = new TextEncoder();
  const body$ = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(enc.encode(first));
    },
    async pull(controller) {
      try {
        const next = await events.next();
        if (next.done) {
          console.info(`[media/tutor] ${JSON.stringify({ task, mode: "claude", ip })}`);
          controller.close();
          return;
        }
        const ev = next.value;
        if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") controller.enqueue(enc.encode(ev.delta.text));
      } catch {
        controller.enqueue(enc.encode("\n\n(সংযোগ কেটে গেছে — আবার জিজ্ঞেস করুন।)"));
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });
  return new Response(body$, { headers: headers("claude") });
}
