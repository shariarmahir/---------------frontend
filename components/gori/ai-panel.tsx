"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bot, CheckCircle2, CircleHelp, Loader2, ShieldAlert, WifiOff, XCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AGENTS,
  buildContext,
  finalizeAnalysis,
  offlineAnalysis,
  offlineModeration,
  type AgentAnswer,
  type AgentRequest,
} from "@/lib/gori/ai/agents";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "done";

/** Local answer when the request itself cannot reach the server. */
function localAnswer(req: AgentRequest): AgentAnswer {
  if (req.agent === "moderation") return { agent: "moderation", mode: "offline", moderation: offlineModeration(req.text) };
  const ctx = buildContext(req);
  return { agent: req.agent, mode: "offline", ...finalizeAnalysis(offlineAnalysis(req, ctx), ctx) };
}

export function useAgent() {
  const [status, setStatus] = useState<Status>("idle");
  const [answer, setAnswer] = useState<AgentAnswer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ctrl = useRef<AbortController | null>(null);

  const ask = useCallback(async (req: AgentRequest) => {
    ctrl.current?.abort();
    const c = new AbortController();
    ctrl.current = c;
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/gori/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(req), signal: c.signal });
      if (res.status === 400) {
        const j = (await res.json()) as { error?: string };
        setError(j.error ?? "অনুরোধ ঠিক নেই।");
        setStatus("idle");
        return null;
      }
      if (!res.ok) throw new Error(String(res.status));
      const a = (await res.json()) as AgentAnswer;
      setAnswer(a);
      setStatus("done");
      return a;
    } catch {
      if (c.signal.aborted) return null;
      const a = localAnswer(req);
      setAnswer(a);
      setStatus("done");
      return a;
    }
  }, []);

  useEffect(() => () => ctrl.current?.abort(), []);
  return { status, answer, error, ask };
}

const VERDICT = {
  supported: { bn: "সমর্থিত", icon: CheckCircle2, cls: "bg-emerald-100 text-emerald-900" },
  partly: { bn: "আংশিক সমর্থিত", icon: CircleHelp, cls: "bg-amber-100 text-amber-900" },
  unsupported: { bn: "অসমর্থিত", icon: XCircle, cls: "bg-red-100 text-red-900" },
  unknown: { bn: "প্রমাণে তথ্য নেই", icon: CircleHelp, cls: "bg-gori-ink/10 text-gori-ink" },
} as const;

const SECTIONS = [
  ["assumptions", "অনুমান"],
  ["effects", "সম্ভাব্য প্রভাব"],
  ["limitations", "সীমাবদ্ধতা"],
  ["alternatives", "বিকল্প ব্যাখ্যা"],
  ["questions", "যা খুঁজে দেখা দরকার"],
] as const;

export function AgentAnswerView({ answer, status }: { answer: AgentAnswer | null; status: Status }) {
  return (
    <div aria-live="polite" aria-busy={status === "loading"} className="text-gori-ink">
      <AnimatePresence mode="wait" initial={false}>
        {status === "loading" ? (
          <motion.p key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 font-bengali text-sm text-gori-ink-soft">
            <Loader2 className="size-4 animate-spin" aria-hidden /> প্রমাণ খুঁজে বিশ্লেষণ হচ্ছে…
          </motion.p>
        ) : answer ? (
          <motion.div key={JSON.stringify(answer).length} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-bengali text-[11px] font-bold", answer.mode === "claude" ? "bg-signal-orange/20 text-[#8a4b00]" : "bg-gori-ink/8 text-gori-ink-soft")}>
                {answer.mode === "claude" ? <Bot className="size-3.5" aria-hidden /> : <WifiOff className="size-3.5" aria-hidden />}
                {answer.mode === "claude" ? "Claude · লাইভ" : "অফলাইন বিশ্লেষণ (নিয়মভিত্তিক)"}
              </span>
              <span className="font-bengali text-[11px] text-gori-mute">{AGENTS.find((a) => a.id === answer.agent)?.bn}</span>
            </div>

            {answer.agent === "moderation" ? (
              <div className="font-bengali">
                <p className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold", answer.moderation.verdict === "allow" ? "bg-emerald-100 text-emerald-900" : answer.moderation.verdict === "review" ? "bg-amber-100 text-amber-900" : "bg-red-100 text-red-900")}>
                  <ShieldAlert className="size-4" aria-hidden />
                  {answer.moderation.verdict === "allow" ? "প্রকাশযোগ্য" : answer.moderation.verdict === "review" ? "মানুষের পর্যালোচনা দরকার" : "প্রকাশ করা যাবে না"}
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gori-ink-soft">
                  {answer.moderation.reasons.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            ) : (
              <>
                {answer.analysis.verdict !== "none" && (
                  <Verdict v={answer.analysis.verdict} />
                )}
                <p className="font-bengali text-[15px] leading-7">{answer.analysis.summary}</p>
                {answer.analysis.evidenceUsed.length > 0 && (
                  <Section title="ব্যবহৃত প্রমাণ">
                    {answer.analysis.evidenceUsed.map((e) => (
                      <li key={e.id}>
                        <span className="font-mono text-[11px] text-gori-mute">{e.id}</span> — {e.how}
                      </li>
                    ))}
                  </Section>
                )}
                {SECTIONS.map(([k, title]) =>
                  answer.analysis[k].length ? (
                    <Section key={k} title={title}>
                      {answer.analysis[k].map((x, i) => <li key={i}>{x}</li>)}
                    </Section>
                  ) : null,
                )}
                <div>
                  <h4 className="font-bengali text-xs font-bold text-gori-mute">সূত্র</h4>
                  {answer.sources.length ? (
                    <ul className="mt-1 space-y-1.5">
                      {answer.sources.map((s) => (
                        <li key={s.id} className="rounded-lg bg-white px-3 py-2 font-bengali text-xs">
                          <span className="font-semibold text-gori-ink">{s.title}</span>
                          <span className="block text-gori-mute">
                            {s.publisher} · {s.status === "unsupported" ? "অসমর্থিত দাবি (সতর্কতা)" : s.status} · {s.reliabilityNotes}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1 font-bengali text-xs text-gori-mute">কোনো সূত্র উদ্ধৃত হয়নি।</p>
                  )}
                  {answer.dropped.length > 0 && (
                    <p className="mt-1.5 font-bengali text-[11px] text-national-crimson">{answer.dropped.length}টি অজানা সূত্র বাদ দেওয়া হয়েছে — যাচাই করা যায়নি।</p>
                  )}
                </div>
              </>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function Verdict({ v }: { v: keyof typeof VERDICT }) {
  const x = VERDICT[v];
  return (
    <p className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-bengali text-sm font-bold", x.cls)}>
      <x.icon className="size-4" aria-hidden /> {x.bn}
    </p>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="font-bengali text-xs font-bold text-gori-mute">{title}</h4>
      <ul className="mt-1 list-disc space-y-1 pl-5 font-bengali text-sm leading-6 text-gori-ink-soft">{children}</ul>
    </div>
  );
}
