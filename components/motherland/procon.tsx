import { Icon } from "@/components/ui/icon";
import { PROCON } from "@/data/motherland";
import { cn } from "@/lib/utils";
import { ANCHOR, BAND_Y, COLUMN, SectionHead } from "./kit";

/**
 * Pro & Con: the reference site's question list on its dark band, under
 * the heading at the full width of the page. Each
 * question opens to the strongest case for and against, side by side;
 * one stays open at a time (the shared `name` makes them exclusive).
 */
export function ProCon() {
  return (
    <section id="procon" aria-labelledby="procon-title" className={cn(ANCHOR, BAND_Y, "bg-ml-ink text-white")}>
      <div className={cn(COLUMN, "flex flex-col gap-12 lg:gap-16")}>
        <SectionHead id="procon-title" tone="dark" title={PROCON.title} lede={PROCON.lede} cta={PROCON.cta} />

        <ul className="flex flex-col border-t border-white/15">
          {PROCON.debates.map((d, i) => (
            <li key={d.question} className="border-b border-white/15">
              <details name="procon" open={i === 0} className="ml-details group">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 rounded-sm py-7 text-xl font-semibold leading-snug focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:text-2xl [&::-webkit-details-marker]:hidden">
                  {d.question}
                  <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full ring-1 ring-white/30 transition-[rotate,background-color] duration-300 group-open:rotate-45 group-open:bg-signal-orange group-open:text-ml-ink group-open:ring-0">
                    <Icon name="add" className="text-2xl" />
                  </span>
                </summary>
                <div className="grid gap-4 pb-8 sm:grid-cols-2">
                  <Side kind="pro" text={d.pro} />
                  <Side kind="con" text={d.con} />
                </div>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Side({ kind, text }: { kind: "pro" | "con"; text: string }) {
  const pro = kind === "pro";
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white/6 p-6 ring-1 ring-white/10">
      <p className={cn("flex items-center gap-2 text-sm font-bold tracking-[0.12em] uppercase", pro ? "text-signal-orange" : "text-white/80")}>
        <Icon name={pro ? "thumb_up" : "thumb_down"} className="text-lg" />
        {pro ? "For" : "Against"}
      </p>
      <p className="leading-relaxed text-white/85">{text}</p>
    </div>
  );
}
