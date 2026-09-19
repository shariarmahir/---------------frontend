import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

/** Today's date as "১৯ সেপ্টেম্বর" in Bengali digits and month name. */
function todayBengali(): string {
  const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  const BN_MONTHS = [
    "জানুয়ারি",
    "ফেব্রুয়ারি",
    "মার্চ",
    "এপ্রিল",
    "মে",
    "জুন",
    "জুলাই",
    "আগস্ট",
    "সেপ্টেম্বর",
    "অক্টোবর",
    "নভেম্বর",
    "ডিসেম্বর",
  ];
  const now = new Date();
  const day = String(now.getDate())
    .split("")
    .map((d) => BN_DIGITS[Number(d)])
    .join("");
  return `${day} ${BN_MONTHS[now.getMonth()]}`;
}

/**
 * Primary national CTA — "আমার বাংলাদেশ".
 *
 * No card chrome — the two-tone wordmark carries the identity directly on
 * the navbar surface: আমার in crimson, বাংলাদেশ in bottle green. The
 * subtitle line shows today's date and swaps to the national risk readout
 * on hover.
 */
export function BangladeshButton({
  href = "/amar-bangladesh",
  className,
  ...props
}: ComponentPropsWithoutRef<"a">) {
  return (
    <a
      href={href}
      aria-label="আমার বাংলাদেশ — জাতীয় সূচক"
      {...props}
      className={cn(
        "group relative inline-flex shrink-0 items-center gap-space-xs rounded-lg px-space-xs py-1",
        "transition-transform duration-300 hover:-translate-y-px",
        "focus-visible:ring-2 focus-visible:ring-title focus-visible:ring-offset-2 focus-visible:outline-none",
        className,
      )}
    >
      {/* Live status dot. */}
      <span className="relative flex size-2 shrink-0 items-center justify-center">
        <span className="absolute size-2 animate-ping rounded-full bg-crimson/50" />
        <span className="relative size-1.5 rounded-full bg-crimson shadow-[0_0_6px_rgba(218,41,28,0.7)]" />
      </span>

      <span className="relative flex flex-col leading-tight">
        <span className="font-display text-label-md font-extrabold tracking-tight whitespace-nowrap sm:text-headline-sm">
          <span className="text-crimson">আমার </span>
          <span className="text-primary">বাংলাদেশ</span>
        </span>
        <span className="font-code-telemetry text-[0.55rem] font-bold tracking-widest whitespace-nowrap text-slate-500 uppercase transition-colors duration-300 group-hover:text-crimson">
          <span className="group-hover:hidden">{todayBengali()}</span>
          <span className="hidden group-hover:inline">⚠ RISK: ELEVATED</span>
        </span>
      </span>
    </a>
  );
}
