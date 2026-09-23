import type { Source } from "@/data/products";
import { Icon } from "@/components/ui/icon";

/** Compact citation: publisher and year, linking to the dataset itself. */
export function SourceLink({ source }: { source: Source }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      title={source.title}
      className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold tracking-wide text-slate-500 uppercase underline-offset-2 hover:text-bd-green hover:underline focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
    >
      <Icon name="link" className="text-[12px]!" />
      {source.publisher} · {source.year}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
