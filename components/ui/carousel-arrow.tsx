import type { CSSProperties, Ref } from "react";
import { cn } from "@/lib/utils";

export type ArrowTone = "gold" | "navy";

/**
 * A bare carousel arrow at the window's edge, no disc or glow: a long shaft
 * and an open head, gold over navy and ink, navy over gold (`data-tone`).
 * Hidden until the carousel (`group/carousel`) is pointed at or focused.
 */
export function CarouselArrow({
  side,
  label,
  onClick,
  tone = "gold",
  ref,
}: {
  side: "prev" | "next";
  label: string;
  onClick: () => void;
  tone?: ArrowTone;
  ref?: Ref<HTMLButtonElement>;
}) {
  const prev = side === "prev";
  return (
    <button
      ref={ref}
      type="button"
      data-tone={tone}
      onClick={onClick}
      aria-label={label}
      className={cn(
        "group/arrow absolute top-1/2 z-20 grid size-12 -translate-y-1/2 place-items-center rounded-full",
        prev ? "left-1 sm:left-3 lg:left-5" : "right-1 sm:right-3 lg:right-5",
        "text-signal-orange data-[tone=navy]:text-bdnavy-900",
        "pointer-events-none scale-90 opacity-0 transition-[color,opacity,scale] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "group-hover/carousel:pointer-events-auto group-hover/carousel:scale-100 group-hover/carousel:opacity-100",
        "group-focus-within/carousel:pointer-events-auto group-focus-within/carousel:scale-100 group-focus-within/carousel:opacity-100",
        "[-webkit-tap-highlight-color:transparent] focus-visible:ring-2 focus-visible:ring-current focus-visible:outline-none motion-reduce:transition-none",
      )}
    >
      <svg
        viewBox="0 0 32 24"
        aria-hidden
        style={{ "--dir": prev ? -1 : 1 } as CSSProperties}
        className={cn(
          "arrow-nudge h-6 w-8 overflow-visible drop-shadow-[0_2px_6px_rgb(0_0_0/0.35)]",
          "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/arrow:scale-115 group-active/arrow:scale-100 motion-reduce:transition-none",
        )}
      >
        <path
          d={prev ? "M29 12H4M12 4l-8 8 8 8" : "M3 12h25M20 4l8 8-8 8"}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
