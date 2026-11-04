import { MORE_VOICES, WOMEN_POWER } from "@/data/motherland-people";
import { cn } from "@/lib/utils";
import { COLUMN } from "./kit";

/*
 * More of the people who make Bangladesh proud, and a roll of the women who
 * opened doors — set as type, not portraits, since these are honoured by name
 * and legacy. Light and navy dress, no politicians.
 */

export function PeopleExtra() {
  return (
    <>
      <section aria-labelledby="more-voices" className="scroll-mt-(--ml-header) bg-ml-ground py-20 text-ml-ink sm:py-28" id="more-voices">
        <div className={cn(COLUMN, "flex flex-col gap-10")}>
          <div className="flex flex-col gap-4">
            <h2 id="more-voices" className="font-ml-display text-[clamp(2.5rem,6.6vw,6rem)] leading-[1.02] tracking-[0.01em] uppercase">
              More voices we are proud of
            </h2>
            <p className="max-w-2xl text-lg leading-relaxed text-ml-ink/80 sm:text-xl">
              Painters and engineers, singers and scientists — people whose work still shapes how the country sees itself and how the world sees it.
            </p>
          </div>
          <ul className="grid gap-x-12 gap-y-8 sm:grid-cols-2">
            {MORE_VOICES.map((v) => (
              <li key={v.name} className="flex flex-col gap-1.5 border-t border-ml-ink/12 pt-5">
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <h3 className="font-ml-display text-[clamp(1.4rem,2.2vw,1.9rem)] leading-none tracking-[0.01em] uppercase">{v.name}</h3>
                  {v.years ? <span className="text-sm font-semibold text-ml-ink/50">{v.years}</span> : null}
                </div>
                <p className="text-sm font-semibold text-ml-green">{v.field}</p>
                <p className="leading-snug text-pretty text-ml-ink/80">{v.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="women-power" className="scroll-mt-(--ml-header) bg-ml-navy py-20 text-white sm:py-28" id="women-power">
        <div className={cn(COLUMN, "flex flex-col gap-10")}>
          <div className="flex flex-col gap-4">
            <h2 id="women-power" className="font-ml-display text-[clamp(2.5rem,6.6vw,6rem)] leading-[1.02] tracking-[0.01em] uppercase">
              Women who opened doors
            </h2>
            <p className="max-w-2xl text-lg leading-relaxed text-white/80 sm:text-xl">
              From a reformer who imagined a world run by women to the millions who built a modern economy, Bangladesh has been carried forward by its women.
            </p>
          </div>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WOMEN_POWER.map((w) => (
              <li key={w.name} className="flex flex-col gap-2 rounded-2xl bg-white/5 p-6 ring-1 ring-white/12">
                <h3 className="font-ml-display text-[clamp(1.3rem,1.9vw,1.7rem)] leading-tight tracking-[0.01em] text-signal-orange uppercase">{w.name}</h3>
                <p className="text-sm font-semibold text-white/60">{w.field}</p>
                <p className="leading-snug text-pretty text-white/85">{w.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
