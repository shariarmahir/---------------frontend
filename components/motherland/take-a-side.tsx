"use client";

import { useState } from "react";
import type { Debate } from "@/data/motherland";
import { cn } from "@/lib/utils";

type Side = "pro" | "con";

/**
 * "Take a side and defend it": pick a side on each question and the page
 * shows your case, then the strongest case against it to answer. Nothing is
 * counted or sent anywhere; it is a prompt to think, not a poll.
 */
export function TakeASide({ debates, className }: { debates: Debate[]; className?: string }) {
  const [sides, setSides] = useState<Record<string, Side>>({});

  return (
    <ol className={cn("flex flex-col gap-6", className)}>
      {debates.map((d) => {
        const side = sides[d.question];
        const choose = (s: Side) => setSides((all) => ({ ...all, [d.question]: s }));
        const button = (s: Side, label: string) => (
          <button
            type="button"
            aria-pressed={side === s}
            onClick={() => choose(s)}
            className={cn(
              "inline-flex min-h-12 items-center justify-center rounded-full px-7 py-3 font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-green",
              side === s ? "bg-ml-green text-white" : "bg-signal-orange text-ml-ink hover:bg-ml-ink hover:text-white",
            )}
          >
            {label}
          </button>
        );
        return (
          <li key={d.question} className="grid gap-6 rounded-2xl bg-white p-6 ring-1 ring-ml-ink/10 sm:p-10 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col items-start gap-6">
              <h2 className="text-[clamp(1.5rem,2.4vw,2.25rem)] leading-tight font-bold text-balance">{d.question}</h2>
              <div className="flex flex-wrap gap-3">
                {button("pro", "I'm for it")}
                {button("con", "I'm against it")}
              </div>
            </div>
            {side ? (
              <div aria-live="polite" className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-bold text-ml-green">Your side</h3>
                  <p className="text-lg leading-relaxed">{side === "pro" ? d.pro : d.con}</p>
                </div>
                <div className="flex flex-col gap-1.5 rounded-xl bg-ml-ink p-5 text-white">
                  <h3 className="font-bold text-signal-orange">Now answer this</h3>
                  <p className="text-lg leading-relaxed">{side === "pro" ? d.con : d.pro}</p>
                </div>
              </div>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
