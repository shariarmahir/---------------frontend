"use client";

import { Check } from "lucide-react";
import { LEVELS } from "@/lib/media/academy";
import { useHydrated } from "@/lib/media/store";
import { useAcademy } from "./use-academy";

/** "যোগ দিয়েছেন · অভিজ্ঞ" on a department the viewer belongs to. */
export function JoinedMark({ dept }: { dept: string }) {
  const hydrated = useHydrated();
  const admission = useAcademy((a) => a.admissions[dept]);
  if (!hydrated || !admission) return null;
  return (
    <span className="inline-flex h-6 items-center gap-1 rounded-md bg-bdgreen-500 px-2 text-xs font-bold text-text-primary">
      <Check className="size-3.5" strokeWidth={3} aria-hidden /> যোগ দিয়েছেন · {LEVELS[admission.level]}
    </span>
  );
}
