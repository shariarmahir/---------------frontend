import { cn } from "@/lib/utils";

/**
 * Heading block shared by every product section: a Bangla kicker in the
 * product's accent, the uppercase grotesk title the landing page uses,
 * and an optional lede.
 */
export function SectionHeading({
  kicker,
  title,
  lede,
  accentText = "text-bd-green",
  align = "left",
  invert = false,
}: {
  kicker: string;
  title: string;
  lede?: string;
  accentText?: string;
  align?: "left" | "center";
  invert?: boolean;
}) {
  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-2",
        align === "center" && "items-center text-center",
      )}
    >
      <span
        className={cn(
          "font-bengali text-sm font-bold tracking-wide",
          invert ? "text-signal-orange" : accentText,
        )}
      >
        {kicker}
      </span>
      <h2
        className={cn(
          "font-grotesk text-2xl font-bold tracking-tight text-balance uppercase sm:text-3xl lg:text-4xl",
          invert ? "text-white" : "text-text-primary",
        )}
      >
        {title}
      </h2>
      {lede && (
        <p
          className={cn(
            "max-w-2xl font-sans text-base leading-relaxed",
            invert ? "text-white/80" : "text-text-secondary",
          )}
        >
          {lede}
        </p>
      )}
    </div>
  );
}
