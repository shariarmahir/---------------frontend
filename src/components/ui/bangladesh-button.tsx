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
        "border border-emerald-200 bg-white px-space-md py-space-xs shadow-xs",
        "transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        className,
      )}
    >
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-emerald-100/70 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

      <span className="relative flex size-2 shrink-0 items-center justify-center">
        <span className="absolute size-2 animate-ping rounded-full bg-crimson/60" />
        <span className="relative size-1.5 rounded-full bg-crimson" />
      </span>

      <span className="relative font-display text-label-md font-extrabold tracking-tight whitespace-nowrap">
        <span className="text-primary">বাংলা</span>
        <span className="text-crimson">দেশ</span>
      </span>

      <span className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 bg-linear-to-r from-primary to-crimson transition-transform duration-300 group-hover:scale-x-100" />
    </a>
  );
}
