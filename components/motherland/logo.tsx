import { LOGO_ART } from "@/data/motherland-art";
import { cn } from "@/lib/utils";

/**
 * The logo: MOTHERLAND, whose O is the flag's red sun, as vector art that matches the
 * hero's Bangla title (scripts/motherland-art.py). It takes the colour of the text around
 * it; a class sets its width.
 */
export function Logo({ className }: { className?: string }) {
  const { width, height, d, sun } = LOGO_ART;
  return (
    <svg role="img" aria-label="Motherland" viewBox={`0 0 ${width} ${height}`} fill="currentColor" className={cn("block h-auto", className)}>
      <path fillRule="evenodd" d={d} />
      <circle cx={sun.cx} cy={sun.cy} r={sun.r} className="fill-ml-red" />
    </svg>
  );
}
