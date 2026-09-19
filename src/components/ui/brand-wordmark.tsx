import { cn } from "@/lib/utils";

/**
 * National status, in the same three-colour language the rest of the UI uses.
 *
 * The wordmark is not decoration — it reports the live posture of the national
 * index, so the colour has to mean something. `ল্যাব` carries the state while
 * `কাণ্ডারী` stays orange, the brand constant.
 */
export type BrandStatus = "stable" | "watch" | "critical";

/** `ল্যাব` colour per status — green steady, orange watch, red critical. */
const STATUS_TEXT: Record<BrandStatus, string> = {
  stable: "text-primary",
  watch: "text-signal",
  critical: "text-crimson",
};

/** The two trailing dots take the same state colour. */
const STATUS_DOT: Record<BrandStatus, string> = {
  stable: "bg-primary",
  watch: "bg-signal",
  critical: "bg-crimson",
};

const STATUS_LABEL: Record<BrandStatus, string> = {
  stable: "national status stable",
  watch: "national status elevated",
  critical: "national status critical",
};

export interface BrandWordmarkProps {
  /** Live posture; drives the `ল্যাব` colour and the dots. */
  status?: BrandStatus;
  /** Font size for both lines. Kept as one value so the block stays square. */
  className?: string;
}

/**
 * Two-line brand wordmark: `কাণ্ডারী` above `ল্যাব..`.
 *
 * Both lines share one font size and a 1.02 leading so the stacked block
 * matches the logo mark's height, letting the two sit as a single lockup.
 * The two dots after `ল্যাব` pulse in sequence as a live-signal tell.
 */
export function BrandWordmark({
  status = "critical",
  className,
}: BrandWordmarkProps) {
  return (
    <span
      // `leading` is set inline rather than as a utility: tailwind-merge
      // treats it as conflicting with the `font-display` type token and
      // drops the class, which silently breaks the logo-height match.
      style={{ lineHeight: 1.02 }}
      className={cn(
        "group/mark flex shrink-0 flex-col font-display font-extrabold tracking-tight",
        className,
      )}
    >
      {/* Line 1 — brand constant, always orange. */}
      <span className="text-title transition-colors duration-500">
        কাণ্ডারী
      </span>

      {/* Line 2 — status-coloured, with the live dots. */}
      <span className="flex items-end gap-[0.15em]">
        <span
          className={cn(
            "transition-colors duration-500",
            STATUS_TEXT[status],
          )}
        >
          ল্যাব
        </span>

        {/* Two dots, sized from the font so they scale with the wordmark. */}
        <span
          className="mb-[0.18em] flex items-end gap-[0.12em]"
          role="img"
          aria-label={STATUS_LABEL[status]}
        >
          {[0, 1].map((i) => (
            <span
              key={i}
              className={cn(
                "animate-brand-dot size-[0.16em] rounded-full transition-colors duration-500",
                STATUS_DOT[status],
              )}
              style={{ animationDelay: `${i * 260}ms` }}
            />
          ))}
        </span>
      </span>
    </span>
  );
}
