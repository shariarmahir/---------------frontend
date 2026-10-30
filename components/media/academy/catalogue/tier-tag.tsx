import { TIERS, type Tier } from "@/lib/media/academy";
import { cn } from "@/lib/utils";

const LOOK: Record<Tier, string> = {
  lead: "bg-(--c-signal) text-black",
  skilled: "border border-(--c-accent-ink) text-(--c-accent-ink)",
  new: "border border-(--c-line-strong) text-(--c-muted)",
  review: "border border-(--c-bad) text-(--c-bad)",
};

/** A teacher's standing as a square tag: lead in yellow, skilled in blue, new plain, under review in red. */
export function TierTag({ tier, className }: { tier: Tier; className?: string }) {
  return <span className={cn("hud inline-flex h-6 items-center px-2 font-bold whitespace-nowrap", LOOK[tier], className)}>{TIERS[tier]}</span>;
}
