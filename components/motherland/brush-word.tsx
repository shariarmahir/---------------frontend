import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * A word dressed like the logo: its brush face (Knewave), a thin rim under the fill, each letter
 * zooming in after the one before (quicker than the logo's), and with `loop` the logo's soft zoom
 * running through the letters again and again (motherland.css, .ml-brush and .ml-logo). Purely a
 * picture of the word: put the word itself in the link's accessible name.
 */
export function BrushWord({ text, loop, className }: { text: string; loop?: boolean; className?: string }) {
  return (
    <span aria-hidden data-loop={loop ? "" : undefined} className={cn("ml-logo ml-brush inline-flex font-ml-brush whitespace-pre", className)}>
      {[...text].map((ch, i) => (
        <span key={i} className="ml-logo-zoom inline-block" style={{ "--i": i } as CSSProperties}>
          <span className="ml-logo-wave inline-block">{ch}</span>
        </span>
      ))}
    </span>
  );
}
