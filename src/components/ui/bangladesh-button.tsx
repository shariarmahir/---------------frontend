import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Primary national CTA — "বাংলাদেশের প্রধান বাস্তব সমস্যা".
 *
 * No card chrome: the two-tone wordmark carries the identity directly on the
 * navbar surface. The sentence reads in bottle green up to the final word,
 * and "সমস্যা" lands in crimson — the problem named in the colour of the
 * problem.
 *
 * No date and no risk readout. Both were decorative, and both forced this to
 * be a client component reading a clock, which is a hydration hazard for a
 * subtitle nobody acts on. Without them the component is static and renders
 * on the server.
 */
export function BangladeshButton({
  href = "/amar-bangladesh",
  className,
  ...props
}: ComponentPropsWithoutRef<"a">) {
  return (
    <a
      href={href}
      aria-label="বাংলাদেশের প্রধান বাস্তব সমস্যা — জাতীয় সূচক"
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

      {/* One line, so the button shares the navbar's baseline with every
          other control in the row. */}
      <span className="font-display text-label-md font-extrabold tracking-tight whitespace-nowrap">
        <span className="text-primary">বাংলাদেশের প্রধান বাস্তব </span>
        <span className="text-crimson">সমস্যা</span>
      </span>
    </a>
  );
}
