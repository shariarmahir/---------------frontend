import { SealCheck, SealWarning, IdentificationCard } from "@phosphor-icons/react/ssr";
import { CircleDashed, Hourglass } from "lucide-react";
import { skillStatus, type SkillStatus } from "@/lib/media/skill";
import { cn } from "@/lib/utils";
import { Num } from "./numerals";

/**
 * Trust signals — the one place colour and motion are spent. Phosphor
 * duotone seals mark verification; everything else in the app uses lucide.
 */

/** Small seal after a name: identity checked with NID/passport. */
export function IdSeal({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <span title="এনআইডি/পাসপোর্ট দিয়ে পরিচয় যাচাইকৃত — এক ব্যক্তি, এক অ্যাকাউন্ট" className={cn("inline-flex shrink-0 text-bd-green", className)}>
      <SealCheck size={size} weight="duotone" aria-hidden />
      <span className="sr-only">পরিচয় যাচাইকৃত</span>
    </span>
  );
}

export function IdBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-bd-green-light py-1 pr-3 pl-1.5 text-xs font-semibold text-bd-green-dark">
      <IdentificationCard size={18} weight="duotone" aria-hidden />
      এনআইডি যাচাইকৃত
    </span>
  );
}

const statusInfo: Record<SkillStatus, { bn: string; className: string; hint: string }> = {
  verified: { bn: "কমিউনিটি যাচাইকৃত", className: "bg-bd-green text-white", hint: "৫+ জনের রেটিং দাবির আধা তারার মধ্যে" },
  challenged: { bn: "চ্যালেঞ্জড", className: "bg-red-50 text-national-crimson ring-1 ring-red-200", hint: "কমিউনিটির রেটিং দাবির চেয়ে ১.৫+ তারা কম" },
  rated: { bn: "যাচাই চলছে", className: "bg-slate-100 text-slate-700", hint: "আরও রেটিং দরকার" },
  unrated: { bn: "যাচাই বাকি", className: "bg-amber-50 text-amber-900 ring-1 ring-amber-200", hint: "এখনো কেউ রেটিং দেয়নি" },
};

export function StatusBadge({ status, size = "md" }: { status: SkillStatus; size?: "sm" | "md" }) {
  const s = statusInfo[status];
  const icon =
    status === "verified" ? (
      <SealCheck size={size === "sm" ? 14 : 16} weight="duotone" aria-hidden />
    ) : status === "challenged" ? (
      <SealWarning size={size === "sm" ? 14 : 16} weight="duotone" aria-hidden />
    ) : status === "rated" ? (
      <Hourglass className="size-3.5" aria-hidden />
    ) : (
      <CircleDashed className="size-3.5" aria-hidden />
    );
  return (
    <span
      title={s.hint}
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold whitespace-nowrap",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        s.className,
        status === "verified" && "seal-shine",
      )}
    >
      {icon}
      {s.bn}
    </span>
  );
}

/** Read-only stars with partial fill for averages. */
export function Stars({ value, size = 16, animate }: { value: number; size?: number; animate?: boolean }) {
  return (
    <span className="inline-flex items-center" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span
            key={i}
            className={cn("relative inline-block", animate && "star-in")}
            style={{ width: size, height: size, ["--i" as string]: i }}
          >
            <svg viewBox="0 0 24 24" width={size} height={size} className="absolute inset-0 text-slate-200">
              <path fill="currentColor" d="M12 2.5l2.9 6.1 6.6.8-4.9 4.5 1.3 6.6L12 17.3 6.1 20.5l1.3-6.6L2.5 9.4l6.6-.8z" />
            </svg>
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <svg viewBox="0 0 24 24" width={size} height={size} className="text-amber-400">
                <path fill="currentColor" d="M12 2.5l2.9 6.1 6.6.8-4.9 4.5 1.3 6.6L12 17.3 6.1 20.5l1.3-6.6L2.5 9.4l6.6-.8z" />
              </svg>
            </span>
          </span>
        );
      })}
    </span>
  );
}

/**
 * The claim and the verdict, side by side and never merged into one number.
 */
export function RatingPair({
  self,
  communityAvg,
  raters,
  compact,
  animate,
}: {
  self: number;
  communityAvg: number;
  raters: number;
  compact?: boolean;
  animate?: boolean;
}) {
  const status = skillStatus(self, communityAvg, raters);
  const challenged = status === "challenged";
  return (
    <div className={cn("flex flex-wrap items-stretch gap-2", compact && "gap-1.5")}>
      <div className={cn("flex min-w-0 flex-1 flex-col rounded-xl border border-orange-200 bg-orange-50/70", compact ? "px-2.5 py-1.5" : "px-3 py-2")}>
        <span className="text-[11px] font-semibold text-orange-900">নিজের দাবি</span>
        <span className="flex items-center gap-1.5">
          <span className={cn("font-bold tabular-nums text-text-primary", compact ? "text-base" : "text-xl")}>
            <Num value={self} decimals={1} />
          </span>
          <Stars value={self} size={compact ? 12 : 14} />
        </span>
      </div>
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col rounded-xl border",
          challenged ? "border-red-200 bg-red-50/60" : "border-bd-green/25 bg-bd-green-light/60",
          compact ? "px-2.5 py-1.5" : "px-3 py-2",
        )}
      >
        <span className={cn("text-[11px] font-semibold", challenged ? "text-national-crimson" : "text-bd-green-dark")}>
          কমিউনিটি · <Num value={raters} /> জন
        </span>
        <span className="flex items-center gap-1.5">
          <span className={cn("font-bold tabular-nums", challenged ? "text-national-crimson" : "text-bd-green-dark", compact ? "text-base" : "text-xl")}>
            {raters > 0 ? <Num value={communityAvg} decimals={1} /> : "—"}
          </span>
          {raters > 0 && <Stars value={communityAvg} size={compact ? 12 : 14} animate={animate} />}
        </span>
      </div>
      {!compact && (
        <div className="flex w-full items-center">
          <StatusBadge status={status} />
        </div>
      )}
    </div>
  );
}
