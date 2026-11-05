import { Icon } from "@/components/ui/icon";
import { helplines, type Helpline } from "@/data/complaints";
import { cn } from "@/lib/utils";
import { Bn, focusRing } from "./kit";

/**
 * The verified national helplines (data/complaints.ts) for the Emergency desk,
 * the Women safety page and the case drawer. Only 999 and 109 are shown: they
 * are the official shortcodes for these pages' cases, and no other number is
 * ever invented here (CLAUDE.md: an unverified number is worse than none).
 */

const pick = (n: string): Helpline => {
  const h = helplines.find((x) => x.number === n);
  if (!h) throw new Error(`Helpline ${n} is missing from data/complaints.ts`);
  return h;
};

/** 999 (police, fire, ambulance) and 109 (women and children), in that order. */
export const EMERGENCY_LINES: readonly Helpline[] = [pick("999"), pick("109")];

/** One helpline: the number large, its English and Bangla names, and what it is for. */
function Line({ h, compact }: { h: Helpline; compact?: boolean }) {
  return (
    <li>
      <a
        href={`tel:${h.number}`}
        className={cn(
          "group flex items-center gap-3 rounded-xl bg-black/30 ring-1 ring-white/10 transition-colors hover:bg-black/45 motion-reduce:transition-none",
          compact ? "px-3 py-2.5" : "px-3.5 py-3",
          focusRing,
        )}
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-bdnavy-900 text-signal-orange ring-1 ring-white/12">
          <Icon name={h.icon} className="text-[20px]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-sm font-semibold text-white">{h.label}</span>
            <Bn className="text-xs text-white/65">{h.labelBn}</Bn>
          </span>
          {compact ? null : <span className="mt-0.5 block text-xs leading-snug text-white/65">{h.note}</span>}
        </span>
        <span className="font-grotesk text-2xl leading-none font-bold text-white tabular-nums group-hover:text-signal-orange">
          <span className="sr-only">Call </span>
          {h.number}
        </span>
      </a>
    </li>
  );
}

export function HelplineList({ compact, className }: { compact?: boolean; className?: string }) {
  return (
    <ul aria-label="National helplines" className={cn("flex flex-col gap-2", className)}>
      {EMERGENCY_LINES.map((h) => (
        <Line key={h.number} h={h} compact={compact} />
      ))}
    </ul>
  );
}

/** The One-Stop Crisis Centre: named without a number (none is verified here). */
export function OccNote({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-start gap-3 rounded-xl bg-black/30 px-3.5 py-3 ring-1 ring-white/10", className)}>
      <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-lg bg-bdnavy-900 text-signal-orange ring-1 ring-white/12">
        <Icon name="local_hospital" className="text-[20px]" />
      </span>
      <p className="min-w-0 text-sm leading-snug text-white">
        <span className="font-semibold">One-Stop Crisis Centre (OCC)</span>
        <Bn className="ml-1.5 text-xs text-white/65">ওয়ান-স্টপ ক্রাইসিস সেন্টার</Bn>
        <span className="mt-0.5 block text-xs leading-snug text-white/65">
          At government medical college hospitals: medical care, police help, legal and counselling support for women and children in one place.
        </span>
      </p>
    </div>
  );
}
