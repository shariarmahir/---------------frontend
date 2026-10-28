import { Section } from "@/components/bangladesh-landing/kit";
import { Icon } from "@/components/ui/icon";
import { historyEras, type HistoryEra } from "@/data/bangladesh-history";
import { cn } from "@/lib/utils";
import { StoryCarousel } from "./story-carousel";

/**
 * 2,500 years in eight eras. A ruler of the eras leads to each one; every
 * era is the text beside its photographs, sides alternating, the photos
 * held in view on wide screens while the text is read.
 */
export function BdHistory() {
  return (
    <Section
      id="history"
      title="2,500 years, from Pundranagar to Victory Day"
      lede="Ancient cities, the learning of the Pala kings, the splendour of the sultans and the Mughals, colonial exploitation, blood shed for a language and the Liberation War of 1971: our story in eight eras."
    >
      <nav aria-label="Eras" className="story-reveal">
        <ol className="grid grid-cols-2 gap-x-4 sm:grid-cols-4 xl:grid-cols-8">
          {historyEras.map((e) => (
            <li key={e.id} className="flex">
              <a
                href={`#era-${e.id}`}
                className="group flex min-h-11 w-full flex-col border-t-2 border-white/12 pt-3 pb-4 transition-colors hover:border-signal-orange focus-visible:border-signal-orange focus-visible:outline-none motion-reduce:transition-none"
              >
                <span className="font-grotesk text-sm font-bold text-bdnavy-300 tabular-nums transition-colors group-hover:text-signal-orange motion-reduce:transition-none">
                  {e.number}
                </span>
                <span className="mt-1 text-sm leading-snug font-semibold text-white">{e.era}</span>
                <span className="text-xs text-white/65">{e.years}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <ol className="mt-8 lg:mt-12">
        {historyEras.map((e, i) => (
          <Era key={e.id} era={e} flip={i % 2 === 1} />
        ))}
      </ol>
    </Section>
  );
}

function Era({ era: e, flip }: { era: HistoryEra; flip: boolean }) {
  return (
    <li
      id={`era-${e.id}`}
      className="grid scroll-mt-header grid-cols-1 gap-8 border-t border-white/12 py-12 lg:scroll-mt-header-lg lg:grid-cols-2 lg:gap-16 lg:py-20"
    >
      <div className={cn("story-reveal", flip && "lg:order-2")}>
        <div className="flex items-center gap-5">
          <span aria-hidden className="font-grotesk text-5xl leading-none font-bold text-bdnavy-300 tabular-nums lg:text-7xl">
            {e.number}
          </span>
          <p className="flex flex-col">
            <span className="text-base font-semibold text-white">{e.era}</span>
            <span className="text-sm text-white/65">{e.years}</span>
          </p>
        </div>

        <h3 className="mt-6 font-grotesk text-2xl leading-tight font-bold text-balance text-signal-orange sm:text-3xl">
          {e.title}
        </h3>
        <p className="mt-4 text-lg leading-relaxed text-white">{e.lede}</p>
        <div className="mt-4 space-y-4">
          {e.paragraphs.map((para) => (
            <p key={para.slice(0, 32)} className="text-base leading-relaxed text-white/80">
              {para}
            </p>
          ))}
        </div>

        {e.quote && (
          <figure className="mt-8 border-l-2 border-signal-orange pl-5">
            <blockquote className="font-grotesk text-xl leading-snug font-semibold text-white">“{e.quote.text}”</blockquote>
            <figcaption className="mt-2 text-sm text-white/65">{e.quote.by}</figcaption>
          </figure>
        )}

        <dl className="mt-8 grid gap-px overflow-hidden rounded-2xl bg-white/12 ring-1 ring-white/12 sm:grid-cols-3">
          {e.facts.map((f) => (
            <div key={f.label} className="flex flex-col bg-bdnavy-900 px-4 py-3">
              <dt className="text-sm text-white/65">{f.label}</dt>
              <dd className="order-first mb-1 text-base leading-snug font-semibold text-white">{f.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-4 flex gap-4 rounded-2xl bg-text-primary p-5 ring-1 ring-white/12">
          <Icon name="travel_explore" className="text-2xl! text-signal-orange" />
          <div>
            <h4 className="text-sm font-semibold text-signal-orange">See it today</h4>
            <p className="mt-1 text-sm leading-relaxed text-white/80">{e.today}</p>
          </div>
        </div>
      </div>

      <div className={cn("story-reveal self-start lg:sticky lg:top-[calc(var(--spacing-header-lg)+2rem)]", flip && "lg:order-1")}>
        <StoryCarousel photos={e.photos} label={`${e.title}: photographs`} />
      </div>
    </li>
  );
}
