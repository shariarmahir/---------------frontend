"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export function AiSearch({ className }: { className?: string }) {
  const [query, setQuery] = useState("");

  return (
    <form
      role="search"
      onSubmit={(event) => event.preventDefault()}
      className={cn("group relative flex min-w-0 items-center", className)}
    >
      <label htmlFor="ai-ask" className="sr-only">
        আজকের বাংলাদেশ — AI Ask
      </label>

      <span className="pointer-events-none absolute left-space-sm flex items-center">
        <Icon
          name="auto_awesome"
          className="text-[16px] text-title transition-colors group-focus-within:text-primary"
        />
      </span>

      <input
        id="ai-ask"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="আজকের বাংলাদেশ"
        aria-label="আজকের বাংলাদেশ — AI Ask"
        className={cn(
          "h-9 w-full min-w-0 rounded-lg border border-border bg-slate-50 py-1",
          "pl-[1.875rem] pr-[3.25rem] font-sans text-body-sm text-slate-900",
          "placeholder:font-display placeholder:font-semibold placeholder:text-slate-500",
          "shadow-xs transition-all outline-none",
          "hover:border-primary/40 focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary",
        )}
      />

      <button
        type="submit"
        aria-label="Ask AI"
        className={cn(
          "absolute right-1 inline-flex h-7 shrink-0 items-center gap-0.5 rounded-md",
          "bg-primary px-space-xs font-code-telemetry text-label-sm font-bold text-primary-foreground",
          "transition-colors hover:bg-emerald-800",
        )}
      >
        <Icon name="search" className="text-[14px]" />
        <span className="hidden 2xl:inline">AI Ask</span>
      </button>
    </form>
  );
}
