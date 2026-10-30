import { Icon } from "@/components/ui/icon";
import type { EvidenceStatus as Status } from "@/data/amar-bangladesh";
import { cn } from "@/lib/utils";

/** How well the evidence holds: an icon and a word, never colour alone. */
export const EVIDENCE: Record<Status, { label: string; icon: string; text: string }> = {
  verified: { label: "Verified", icon: "verified", text: "text-signal-orange" },
  plausible: { label: "Plausible", icon: "help", text: "text-bdnavy-300" },
  unverified: { label: "Unverified", icon: "pending", text: "text-white/65" },
};

export function EvidenceStatus({ status, className }: { status: Status; className?: string }) {
  const e = EVIDENCE[status];
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-semibold", e.text, className)}>
      <Icon name={e.icon} className="text-base!" />
      {e.label}
    </span>
  );
}
