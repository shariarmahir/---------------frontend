import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Primary national CTA — "আমার বাংলাদেশ".
 *
 * White surface so the two-tone wordmark carries the identity on its own:
 * আমার in crimson, বাংলাদেশ in bottle green. Hover tints the card and deepens
 * the border while the subtitle swaps to the national risk readout.
 */
export function BangladeshButton({
  href = "#national-index",
  className,
  ...props
}: ComponentPropsWithoutRef<"a">) {
  return (
    <a
      href={href}
      aria-label="আমার বাংলাদেশ — জাতীয় ঝুঁকি সূচক"
      {...props}
      className={cn(
        "group relative inline-flex shrink-0 items-center gap-space-xs overflow-hidden rounded-lg",
        "border border-border bg-white px-space-sm py-1 sm:gap-space-sm sm:px-space-md sm:py-1.5",
        "shadow-[0_2px_10px_-3px_rgba(15,23,42,0.18)]",
        "transition-[transform,box-shadow,border-color] duration-300",
        "hover:-translate-y-px hover:border-primary/50",
        "hover:shadow-[0_4px_16px_-4px_rgba(0,103,71,0.35)]",
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
          <span className="group-hover:hidden">জাতীয় সূচক</span>
          <span className="hidden group-hover:inline">⚠ RISK: ELEVATED</span>
        </span>
      </span>

      {/* Theme-orange accent rule. */}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-title" />
    </a>
  );
}
