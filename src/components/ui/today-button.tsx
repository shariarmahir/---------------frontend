import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * "আজকের বাংলাদেশ" — today's national readout.
 *
 * Previously the placeholder text of the AI search input; it is now its own
 * destination, because reading today's state and asking a question are two
 * different intents that were sharing one control.
 *
 * `w-fit` matters: the button sits in a flex row beside the logo, where a
 * bare `inline-flex` gets stretched by the parent and the pill runs on past
 * its text.
 */
export function TodayButton({ className }: { className?: string }) {
  return (
    <a
      href="#national-index"
      className={cn(
        "group inline-flex w-fit shrink-0 items-center gap-space-xs rounded-full",
        "border border-border bg-white py-1.5 pr-space-md pl-1.5",
        "font-display text-label-md font-bold whitespace-nowrap text-slate-900",
        "shadow-xs transition-all duration-300",
        "hover:-translate-y-px hover:border-primary/40 hover:text-primary hover:shadow-sm",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none",
        className,
      )}
    >
      {/* Bangladesh map mark, on a tinted disc so the transparent PNG has a
          defined edge against the white pill. */}
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 transition-colors duration-300 group-hover:bg-emerald-100">
        <Image
          src="/icons/map.png"
          alt=""
          aria-hidden
          width={512}
          height={512}
          className="size-5 object-contain transition-transform duration-300 group-hover:scale-110"
        />
      </span>
      আজকের বাংলাদেশ
    </a>
  );
}
