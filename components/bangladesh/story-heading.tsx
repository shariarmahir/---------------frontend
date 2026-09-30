import { PixelMark } from "@/components/ui/section-kit";
import { cn } from "@/lib/utils";

/**
 * Section heading for the country pages, in the home page's language: the
 * three-pixel mark, a small numbered Bangla kicker, a large gold Bangla title
 * with one word in the flag's red, and a lede. `tone="gold"` is for a heading
 * set on a gold band, where gold text would vanish: ink instead.
 */
export function StoryHeading({
  id,
  index,
  kicker,
  title,
  accent,
  lede,
  tone = "dark",
  align = "left",
}: {
  /** Anchor / aria id for the h2. */
  id?: string;
  index: string;
  kicker: string;
  title: string;
  /** A word inside `title` rendered in red. */
  accent?: string;
  lede?: string;
  tone?: "dark" | "gold";
  align?: "left" | "center";
}) {
  const parts = accent && title.includes(accent) ? title.split(accent) : null;
  const onGold = tone === "gold";

  return (
    <div
      className={cn(
        "story-reveal mb-10 flex max-w-3xl flex-col gap-3",
        align === "center" && "mx-auto items-center text-center",
      )}
    >
      <PixelMark tone={onGold ? "light" : "dark"} />
      <span
        className={cn(
          "inline-flex items-center gap-2 font-mono text-xs font-bold tracking-[0.2em] uppercase",
          onGold ? "text-text-primary" : "text-white/80",
        )}
      >
        {index} · <span className="font-bengali tracking-normal normal-case">{kicker}</span>
      </span>
      <h2
        id={id}
        className={cn(
          "font-bengali text-3xl leading-tight font-bold text-balance sm:text-4xl lg:text-5xl",
          onGold ? "text-text-primary" : "text-signal-orange",
        )}
      >
        {parts ? (
          <>
            {parts[0]}
            <span className={onGold ? "text-national-crimson" : "text-white"}>{accent}</span>
            {parts.slice(1).join(accent)}
          </>
        ) : (
          title
        )}
      </h2>
      {lede && (
        <p
          className={cn(
            "font-bengali text-base leading-relaxed sm:text-lg",
            onGold ? "text-text-primary/85" : "text-white/80",
          )}
        >
          {lede}
        </p>
      )}
    </div>
  );
}
