import { cn } from "@/lib/utils";

/**
 * Section heading for the story page: a small numbered Bangla kicker, a
 * large Bangla title with one word in the flag's red, and a lede.
 */
export function StoryHeading({
  index,
  kicker,
  title,
  accent,
  lede,
  invert = false,
  align = "left",
}: {
  index: string;
  kicker: string;
  title: string;
  /** A word inside `title` rendered in red. */
  accent?: string;
  lede?: string;
  invert?: boolean;
  align?: "left" | "center";
}) {
  const parts = accent && title.includes(accent) ? title.split(accent) : null;

  return (
    <div
      className={cn(
        "story-reveal mb-10 flex max-w-3xl flex-col gap-3",
        align === "center" && "mx-auto items-center text-center",
      )}
    >
      <span
        className={cn(
          "inline-flex items-center gap-2 font-mono text-xs font-bold tracking-[0.2em] uppercase",
          invert ? "text-signal-orange" : "text-bd-green",
        )}
      >
        <span className={cn("h-px w-8", invert ? "bg-signal-orange" : "bg-bd-green")} />
        {index} · <span className="font-bengali tracking-normal normal-case">{kicker}</span>
      </span>
      <h2
        className={cn(
          "font-bengali text-3xl leading-tight font-bold text-balance sm:text-4xl lg:text-5xl",
          invert ? "text-white" : "text-text-primary",
        )}
      >
        {parts ? (
          <>
            {parts[0]}
            <span className="text-national-crimson">{accent}</span>
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
            invert ? "text-white/80" : "text-text-secondary",
          )}
        >
          {lede}
        </p>
      )}
    </div>
  );
}
