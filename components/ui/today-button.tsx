import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * "আজকের বাংলাদেশ" — today's national readout.
 *
 * Routes to /ajker-bangladesh, the national news index. Reading what is
 * being reported today and asking a question are two different intents, so
 * they are two different controls.
 *
 * `w-fit` matters: the button sits in a flex row beside the logo, where a
 * bare `inline-flex` gets stretched by the parent and the pill runs on past
 * its text.
 */
export function TodayButton({ className }: { className?: string }) {
  return (
    <a
      href="/ajker-bangladesh"
      className={cn(
        "group relative isolate inline-flex w-fit shrink-0 items-center gap-space-xs",
        "overflow-hidden rounded-full border border-border bg-white",
        "py-1.5 pr-space-md pl-1.5",
        "font-display text-label-md font-bold whitespace-nowrap text-slate-900",
        "shadow-xs transition-all duration-300",
        "hover:-translate-y-px hover:border-primary/40 hover:text-primary hover:shadow-sm",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none",
        className,
      )}
    >
      {/* Newspaper backdrop: ruled column lines that scroll upward like a
          page of newsprint, under a soft paper tint. Decorative only, and
          held behind the label by z-index rather than opacity so the text
          keeps its contrast. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-full"
      >
        {/* Paper tint. */}
        <span className="absolute inset-0 bg-linear-to-r from-orange-50/70 via-white to-emerald-50/60" />

        {/* Scrolling newsprint lines. */}
        <span className="animate-newsprint absolute inset-x-0 -top-full h-[300%] opacity-[0.16]">
          <span className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,transparent_0px,transparent_3px,currentColor_3px,currentColor_4px)] text-slate-900" />
        </span>

        {/* Column rules, to read as newspaper columns rather than a texture. */}
        <span className="absolute inset-y-0 left-1/3 w-px bg-slate-900/10" />
        <span className="absolute inset-y-0 left-2/3 w-px bg-slate-900/10" />

        {/* Headline sweep — a highlight passing across, like a ticker. */}
        <span className="animate-news-sweep absolute inset-y-0 -left-1/2 w-1/2 bg-linear-to-r from-transparent via-white/70 to-transparent" />
      </span>

      {/* Bangladesh map mark, on a tinted disc so the transparent PNG has a
          defined edge against the white pill. */}
      <span className="relative flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 transition-colors duration-300 group-hover:bg-emerald-100">
        <Image
          src="/icons/map.png"
          alt=""
          aria-hidden
          width={512}
          height={512}
          className="size-5 object-contain transition-transform duration-300 group-hover:scale-110"
        />
      </span>
      <span className="relative">আজকের বাংলাদেশ</span>
    </a>
  );
}
