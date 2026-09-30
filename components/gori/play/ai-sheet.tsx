"use client";

import { Bot } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { AgentRequest } from "@/lib/gori/ai/agents";
import type { ScenarioDef } from "@/lib/gori/sim/types";
import { trimPlan } from "@/lib/gori/sim/verify";
import { cn } from "@/lib/utils";
import { AgentAnswerView, useAgent } from "../ai-panel";
import type { Game } from "../store";

type Tab = "coach" | "systems" | "reviewer" | "research" | "evidence";

const TABS: { id: Tab; bn: string }[] = [
  { id: "coach", bn: "কোচ" },
  { id: "systems", bn: "সিস্টেম বিশ্লেষক" },
  { id: "reviewer", bn: "পর্যালোচক" },
  { id: "research", bn: "গবেষণা" },
  { id: "evidence", bn: "প্রমাণ যাচাই" },
];

/** The AI analysis drawer for the command centre. */
export function AiSheet({ sc, game }: { sc: ScenarioDef; game: Game }) {
  const [tab, setTab] = useState<Tab>("coach");
  const [variable, setVariable] = useState(sc.variables[0].id);
  const [claim, setClaim] = useState("");
  const agent = useAgent();
  const played = game.turn;
  const sim = { config: game.config, plan: trimPlan(game.plan.slice(0, Math.max(played, 1))), turn: Math.max(0, played - 1) };
  const needsTurn = (tab === "systems" || tab === "reviewer" || tab === "coach") && played === 0;

  function ask() {
    let req: AgentRequest;
    if (tab === "coach") req = { agent: "coach", ...sim };
    else if (tab === "systems") req = { agent: "systems", ...sim, variable };
    else if (tab === "reviewer") req = { agent: "reviewer", target: { kind: "turn", ...sim } };
    else if (tab === "research") req = { agent: "research", module: "BD-001" };
    else req = { agent: "evidence", module: "BD-001", claim: claim.trim() };
    void agent.ask(req);
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/10 px-3.5 font-bengali text-sm font-semibold text-white hover:bg-white/10">
          <Bot className="size-4 text-signal-orange" aria-hidden /> AI বিশ্লেষণ
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto bg-text-primary ring-1 ring-white/12 p-0 sm:max-w-lg">
        <SheetHeader className="border-b border-white/10 p-5">
          <SheetTitle className="font-bengali text-lg text-white">AI বিশ্লেষণ</SheetTitle>
          <SheetDescription className="font-bengali text-sm text-white/80">
            উত্তর শুধু খেলার প্রমাণ-রেকর্ড আর আপনার খেলার পুনরায় চালানো ফল থেকে। AI ভুল করতে পারে; সূত্র দেখে যাচাই করুন।
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 p-5">
          <div role="tablist" aria-label="সহকারী" className="flex flex-wrap gap-1.5">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={cn("rounded-full px-3 py-1.5 font-bengali text-sm font-semibold", tab === t.id ? "bg-black text-white" : "bg-black ring-1 ring-white/12 text-white/80 hover:text-white")}
              >
                {t.bn}
              </button>
            ))}
          </div>

          {tab === "systems" && (
            <label className="block font-bengali text-sm font-semibold text-white">
              কোন সূচক কেন বদলাল?
              <select value={variable} onChange={(e) => setVariable(e.target.value)} className="mt-1 block h-10 w-full rounded-lg border border-white/15 bg-black ring-1 ring-white/12 px-2 text-sm">
                {sc.variables.map((v) => <option key={v.id} value={v.id}>{v.bn}</option>)}
              </select>
            </label>
          )}
          {tab === "evidence" && (
            <label className="block font-bengali text-sm font-semibold text-white">
              যাচাই করতে চান এমন একটি দাবি
              <textarea value={claim} onChange={(e) => setClaim(e.target.value)} maxLength={500} rows={3} placeholder="যেমন: চিকিৎসার খরচ কমলে বেশি মানুষ ক্লিনিকে আসে।" className="mt-1 block w-full rounded-lg border border-white/15 bg-black ring-1 ring-white/12 px-3 py-2 text-sm" />
            </label>
          )}

          <button
            type="button"
            onClick={ask}
            disabled={agent.status === "loading" || needsTurn || (tab === "evidence" && !claim.trim())}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-signal-orange px-5 font-bengali text-sm font-bold text-text-primary disabled:opacity-40"
          >
            জিজ্ঞাসা করুন
          </button>
          {needsTurn && <p className="font-bengali text-xs text-white/65">অন্তত একটি টার্ন চালানোর পর এই সহকারী কাজ করবে।</p>}
          {agent.error && <p className="font-bengali text-sm text-crimson-bright" role="alert">{agent.error}</p>}
          <AgentAnswerView answer={agent.answer} status={agent.status} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
