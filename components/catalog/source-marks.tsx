import { Icon } from "@/components/ui/icon";
import { SOURCE_MARKS } from "@/data/catalog";
import { cn } from "@/lib/utils";

/**
 * A row of coloured source wordmarks, after the brand strip at the foot of
 * booking.com: each organisation in its own colour, with a small symbol or
 * on a colour tile. Pass the publisher strings actually cited; only the
 * organisations they name are drawn.
 */
export function SourceMarks({ publishers }: { publishers: string[] }) {
  const marks = SOURCE_MARKS.filter((mark) => publishers.some((p) => mark.match.test(p)));
  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-9 gap-y-5">
      {marks.map((mark) => (
        <li key={mark.id} title={mark.name} className="flex items-center transition-transform duration-300 ease-out hover:-translate-y-0.5 motion-reduce:transition-none">
          <span className="sr-only">{mark.name}</span>
          {mark.icon ? (
            <span aria-hidden className="flex items-center gap-1.5 font-grotesk text-xl font-bold tracking-tight" style={{ color: mark.color }}>
              <Icon name={mark.icon} filled className="text-2xl" />
              {mark.label}
            </span>
          ) : (
            <span
              aria-hidden
              className={cn(
                "rounded-md px-3 py-1.5 font-grotesk text-base font-bold text-white",
                // Spaced capitals read as a logotype; mixed case stays tight.
                mark.label === mark.label.toUpperCase() ? "tracking-widest" : "tracking-tight",
              )}
              style={{ backgroundColor: mark.color }}
            >
              {mark.label}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
