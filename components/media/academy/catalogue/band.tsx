import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { Num } from "../../ui/numerals";

/** "০১", "০২" — the band and card numbers are always two digits. */
export const twoDigits = (n: number) => <Num value={String(n).padStart(2, "0")} />;

/**
 * One band of the catalogue. A hairline runs edge to edge across its top;
 * the content sits in a framed column with a tick where the frame meets the
 * rule; and a running label — "০২ / সব বিভাগ" — sticks under the bar while
 * the band is on screen. `now` marks the band already arrived, for the first
 * screen, which must not wait for scripts to show. The ruler at the screen's
 * edge names the band by `data-ruler-label`.
 */
export function Band({
  id,
  n,
  label,
  rulerLabel,
  note,
  now,
  className,
  children,
}: {
  id: string;
  n?: number;
  label?: string;
  /** The name the ruler shows for this band, if not its label. */
  rulerLabel?: string;
  note?: React.ReactNode;
  now?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} data-choreo data-in={now || undefined} data-ruler-label={rulerLabel ?? label} className={cn("relative", className)}>
      <span aria-hidden data-draw-rule className="absolute inset-x-0 top-0 h-px origin-left bg-(--c-line)" />
      <div className="relative mx-auto max-w-7xl border-x border-(--c-line)">
        <span aria-hidden data-draw-tick className="tick z-31 -top-1.25 -left-1.5" style={{ "--i": 0 } as CSSProperties} />
        <span aria-hidden data-draw-tick className="tick z-31 -top-1.25 -right-1.25" style={{ "--i": 1 } as CSSProperties} />
        {label && (
          <div data-draw-eyebrow className="sticky top-16 z-30 border-y border-(--c-line) bg-(--c-bg)/60 backdrop-blur-md">
            <div className="flex items-center justify-between gap-4 px-6 py-3 md:px-10">
              <p className="hud text-(--c-muted)">
                {n !== undefined && (
                  <>
                    <span className="text-(--c-faint)">{twoDigits(n)}</span>
                    <span aria-hidden className="mx-2 text-(--c-faint)">
                      /
                    </span>
                  </>
                )}
                {label}
              </p>
              {note && <p className="hud hidden text-(--c-faint) sm:block">{note}</p>}
            </div>
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

/** The big band heading: wide display type, tight leading, one phrase in a lean colour. */
export function BandTitle({ as: Tag = "h2", now, className, children }: { as?: "h1" | "h2"; now?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <Tag data-reveal data-in={now || undefined} className={cn("display max-w-3xl text-4xl leading-[1.1] text-(--c-ink-strong) sm:text-5xl md:text-6xl", className)}>
      {children}
    </Tag>
  );
}

/** The word a heading turns on — "দক্ষ হাতের ছোট *বিশ্ববিদ্যালয়*।" — in serif italic, the instrument colour. */
export const Turn = ({ children }: { children: React.ReactNode }) => <span className="turn">{children}</span>;

/** The phrase a heading leans on, in the accent's ink. */
export const Lean = ({ children }: { children: React.ReactNode }) => <span className="text-(--c-accent-ink)">{children}</span>;
