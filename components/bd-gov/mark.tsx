import { SITE } from "@/data/bd-gov";
import { cn } from "@/lib/utils";

/**
 * The guide's wordmark, drawn like Genius's: "guide" in heavy letters
 * whose i alone is gold, a square stem under a round dot. Navy on white,
 * white on the navy footer.
 */
export function Mark({ tone = "navy", className }: { tone?: "navy" | "white"; className?: string }) {
  return (
    <span
      role="img"
      aria-label={SITE.name}
      className={cn(
        "inline-block font-(family-name:--font-montserrat) leading-none font-black tracking-[-0.045em] whitespace-nowrap select-none",
        tone === "white" ? "text-white" : "text-gv-navy",
        className,
      )}
    >
      <span aria-hidden>
        gu
        <span className="relative mx-[0.035em] inline-block h-[0.54em] w-[0.19em] rounded-[0.025em] bg-gv-gold">
          <span className="absolute bottom-[calc(100%+0.07em)] left-1/2 size-[0.27em] -translate-x-1/2 rounded-full bg-gv-gold" />
        </span>
        de
      </span>
    </span>
  );
}
