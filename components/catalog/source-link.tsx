import type { Source } from "@/data/products";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/**
 * A citation link, in link blue with an "opens elsewhere" icon: publisher
 * and year, or with `full` the work's title first. On a coloured card pass
 * a text colour in `className`; the underline follows it.
 */
export function SourceLink({ source, full = false, className }: { source: Source; full?: boolean; className?: string }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      title={source.title}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md font-sans text-xs font-semibold text-link-blue underline decoration-current/40 underline-offset-4 transition-colors duration-200 hover:decoration-current focus-visible:ring-2 focus-visible:ring-link-blue focus-visible:outline-none",
        className,
      )}
    >
      <Icon name="open_in_new" className="text-sm!" />
      {full ? `${source.title} · ${source.publisher}, ${source.year}` : `${source.publisher} · ${source.year}`}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
