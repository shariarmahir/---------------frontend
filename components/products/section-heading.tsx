import { cn } from "@/lib/utils";

/**
 * Heading block shared by every product section: the uppercase grotesk
 * title the landing page uses, and an optional lede.
 */
export function SectionHeading({
  title,
  lede,
  align = "left",
  invert = false,
}: {
  title: string;
  lede?: string;
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
