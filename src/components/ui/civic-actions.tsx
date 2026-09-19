import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/**
 * The two civic-action entry points that sit beside the logo.
 *
 * `Record` opens the daily citizen submission — the evidence side. `প্রতিবাদ`
 * is the protest register — the response side. They are deliberately a pair:
 * one records a problem, the other raises it, so they share a shape and
 * differ only in weight.
 */
export function CivicActions({ className }: { className?: string }) {
  return (
    <div className={cn("items-center gap-space-xs", className)}>
      {/* Record — outlined, the quieter of the two. */}
      <a
        href="#daily-judgment"
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
      </a>

      {/* প্রতিবাদ — filled crimson, the louder call. No protest section
          exists yet, so this lands on the national index where the failing
          indicators are, rather than on a dead anchor.
          TODO: retarget once a dedicated protest register ships. */}
      <a
        href="#national-index"
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
    </div>
  );
}
