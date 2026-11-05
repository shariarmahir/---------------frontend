import { TAKA } from "@/data/motherland";
import { cn } from "@/lib/utils";
import { Mosaic } from "./blocks";
import { ANCHOR, BAND_Y, COLUMN, SectionHead } from "./kit";

/** Taka: the currency's sign drawn huge beside what it is and where it comes from, the notes in use, then two stories of how Bangladesh earns and lends. */
export function Taka() {
  return (
    <section id="taka" aria-labelledby="taka-title" className={cn(ANCHOR, BAND_Y, "bg-signal-orange text-ml-navy")}>
      <div className={cn(COLUMN, "flex flex-col gap-10 lg:gap-14")}>
        <div className="grid items-center gap-10 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-20">
          <p aria-hidden lang="bn" className="font-bengali text-[clamp(10rem,22vw,18rem)] leading-[0.8] font-bold text-ml-navy">
            ৳
          </p>
          <div className="flex min-w-0 flex-col gap-8">
            <SectionHead id="taka-title" tone="gold" title={TAKA.title} cta={TAKA.cta} />
            <p className="max-w-3xl text-lg leading-relaxed text-ml-navy">{TAKA.text}</p>
            <div>
              <p className="mb-3 text-sm font-semibold">Notes in use</p>
              <ul className="flex flex-wrap gap-2">
                {TAKA.notes.map((n) => (
                  <li key={n} className="rounded-full bg-white px-4 py-2 font-bold tabular-nums">
                    ৳{n.toLocaleString("en-US")}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <Mosaic tone="gold" cards={TAKA.facts} />
      </div>
    </section>
  );
}
