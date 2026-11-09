import { ABOUT } from "@/data/motherland";
import { cn } from "@/lib/utils";
import { COLUMN, DISPLAY, NextPage } from "./kit";
import { RiseText } from "./rise-text";
import { ScrollFill } from "./scroll-fill";

/**
 * About Bangladesh, straight after the film's wave edge (so it starts close under it, just clear
 * of the welcome bar): the country in one paragraph that inks itself in as it is read, the six facts a first-time visitor asks for on a
 * full-width gold band, then the question the whole page is for.
 */
export function About() {
  return (
    <section aria-labelledby="about-title" className="pt-10 pb-14 sm:pt-12 sm:pb-20 lg:pt-14 lg:pb-24">
      <h2 id="about-title" className="sr-only">
        About Bangladesh
      </h2>
      <div className={COLUMN}>
        <ScrollFill text={ABOUT.text} className="font-ml-title text-[clamp(1.6rem,3.4vw,3rem)] leading-[1.35] font-bold tracking-[-0.01em]" />
      </div>

      <div className="mt-16 bg-signal-orange lg:mt-24">
        <dl className={cn(COLUMN, "grid grid-cols-2 gap-y-8 py-10 sm:grid-cols-3 lg:grid-cols-6 lg:divide-x lg:divide-ml-ink/15 lg:py-12")}>
          {ABOUT.facts.map((f) => (
            <div key={f.label} className="flex flex-col items-center gap-1.5 px-3 text-center">
              <dt className="text-sm font-semibold text-ml-ink/75">{f.label}</dt>
              <dd className="text-xl font-bold text-balance text-ml-ink">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className={cn(COLUMN, "mt-24 flex flex-col items-center gap-8 text-center lg:mt-36")}>
        <RiseText text={ABOUT.question} className={cn(DISPLAY, "text-ml-ink")} />
        <NextPage cta={ABOUT.cta} />
      </div>
    </section>
  );
}
