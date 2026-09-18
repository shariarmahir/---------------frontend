import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export function BangladeshButton({
  href = "#overview-mission",
  className,
  ...props
}: ComponentPropsWithoutRef<"a">) {
  return (
    <a
      href={href}
      aria-label="বাংলাদেশ"
      {...props}
      className={cn(
        "group relative inline-flex shrink-0 items-center gap-space-xs overflow-hidden rounded-lg",
        "border-2 border-primary/25 bg-linear-to-br from-emerald-50 via-white to-orange-50",
        "px-space-sm py-1.5 shadow-[0_2px_8px_-2px_rgba(0,103,71,0.25)] sm:px-space-md sm:py-space-xs",
        "transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/60",
        "hover:shadow-[0_6px_20px_-4px_rgba(0,103,71,0.45)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        className,
      )}
    >
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/80 to-transparent transition-transform duration-[900ms] ease-out group-hover:translate-x-full" />

      <span className="relative flex size-2.5 shrink-0 items-center justify-center">
        <span className="absolute size-2.5 animate-ping rounded-full bg-crimson/50" />
        <span className="relative size-2 rounded-full bg-crimson shadow-[0_0_6px_rgba(218,41,28,0.8)]" />
      </span>

      <span className="relative font-display text-label-md font-extrabold tracking-tight whitespace-nowrap">
        <span className="text-primary drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]">
          বাংলা
        </span>
        <span className="text-crimson drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]">
          দেশ
        </span>
      </span>

      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] bg-linear-to-r from-primary via-title to-crimson" />
    </a>
  );
}
