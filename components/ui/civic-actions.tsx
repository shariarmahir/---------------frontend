"use client";

import { useState } from "react";
import { RecordDialog } from "@/components/record/record-dialog";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/**
 * The two civic-action entry points that sit beside the logo.
 *
 * `Record` opens the evidence recorder — the evidence side. `প্রতিবাদ` opens
 * the complaint centre — the response side. They are deliberately a pair:
 * one captures a problem, the other raises it, so they share a shape and
 * differ only in weight.
 */
export function CivicActions({ className }: { className?: string }) {
  const [recordOpen, setRecordOpen] = useState(false);

  return (
    <div className={cn("items-center gap-space-xs", className)}>
      {/* Record — outlined, the quieter of the two. A button rather than a
          link: it opens the recorder over the current page instead of
          navigating away, so evidence can be captured without losing what
          the user was looking at. */}
      <button
        type="button"
        onClick={() => setRecordOpen(true)}
        className={cn(
          "group inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-emerald-300 bg-white",
          "px-space-sm py-1.5 font-sans text-[0.8125rem] font-semibold tracking-normal whitespace-nowrap text-primary",
          "shadow-xs transition-all duration-300",
          "hover:-translate-y-px hover:border-primary hover:bg-emerald-50 hover:shadow-sm",
          "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none",
        )}
      >
        <Icon
          name="fiber_manual_record"
          className="text-[14px] text-crimson transition-transform duration-300 group-hover:scale-110"
          filled
        />
        Record
      </button>

      {/* প্রতিবাদ — filled crimson, the louder call. Opens the complaint
          centre: categories mapped to the authority that handles them, the
          nearest police station, and the public complaint record. */}
      <a
        href="/protibad"
        className={cn(
          "group inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-crimson",
          "px-space-sm py-1.5 font-sans text-[0.8125rem] font-semibold tracking-normal whitespace-nowrap text-white",
          "shadow-sm transition-all duration-300",
          "hover:-translate-y-px hover:bg-red-700 hover:shadow-md",
          "focus-visible:ring-2 focus-visible:ring-crimson focus-visible:ring-offset-2 focus-visible:outline-none",
        )}
      >
        <Icon
          name="campaign"
          className="text-[15px] transition-transform duration-300 group-hover:scale-110"
          filled
        />
        প্রতিবাদ
      </a>

      <RecordDialog open={recordOpen} onOpenChange={setRecordOpen} />
    </div>
  );
}
