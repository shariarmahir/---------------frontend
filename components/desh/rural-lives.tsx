import Image from "next/image";
import { LINK, Section } from "@/components/bangladesh-landing/kit";
import { Icon } from "@/components/ui/icon";
import { sourcePoints } from "@/data/amar-bangladesh";
import type { Credit } from "@/data/bangladesh";
import { RURAL_CAPTIONS } from "@/data/bangladesh-problems";
import { ruralStories } from "@/data/rural-life";
import { cn } from "@/lib/utils";

/* Wide tiles, placed so the four-column wall closes every row (2 + 1 + 1). */
const WIDE = new Set([0, 5, 6, 11]);

/**
 * The problems as lived: a wall of credited rural photographs, each with
 * the hardship it carries and a link that opens its problem in the register
 * below. A swipe rail on phones, a grid of wide and single tiles from sm.
 */
export function RuralLives() {
  return (
    <Section
      id="rural"
      title="Field, river and the people"
      lede="Behind every number is a face. The first blow of every problem lands on the people whose work keeps the country running. Under each photograph: the hardship it carries and the problem it belongs to, which is our reading of the scene, not a claim about the people in it."
    >
      <ul className="-mx-gutter-x flex snap-x snap-mandatory gap-3 overflow-x-auto px-gutter-x pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
        {ruralStories.map((s, i) => {
          const caption = RURAL_CAPTIONS[s.id];
          const problem = sourcePoints.find((p) => p.n === s.problem)!;
          const wide = WIDE.has(i);
          return (
            <li key={s.id} className={cn("w-[85%] shrink-0 snap-start sm:w-auto", wide && "sm:col-span-2")}>
              <figure className="flex h-full flex-col overflow-hidden rounded-3xl bg-text-primary ring-1 ring-white/12">
                <div className="relative h-56 sm:h-64 lg:h-72">
                  <Image
                    src={s.photo.src}
                    alt={caption.alt}
                    fill
                    sizes={wide ? "(min-width: 1024px) 50vw, (min-width: 640px) 100vw, 85vw" : "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 85vw"}
                    className="object-cover"
                  />
                </div>
                <figcaption className="flex flex-1 flex-col p-5 sm:p-6">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-white/80">
                    <Icon name="location_on" className="text-lg! text-signal-orange" />
                    {caption.place}
                  </p>
                  <p className="mt-2 font-grotesk text-lg leading-snug text-balance text-white">{caption.pain}</p>
                  <a
                    href={`#p-${s.problem}`}
                    className="group mt-auto self-start rounded-sm pt-4 pb-1 text-sm leading-6 font-bold text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
                  >
                    Problem {s.problem}: {problem.topic}
                    <Icon name="arrow_forward" className="ml-1 inline-block align-[-4px] text-lg! transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
                  </a>
                  {s.photo.credit ? <PhotoCredit credit={s.photo.credit} className="mt-2" /> : null}
                </figcaption>
              </figure>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

/** A Commons photo's credit: author, licence and source, as the licence asks. */
function PhotoCredit({ credit, className }: { credit: Credit; className?: string }) {
  return (
    <p className={cn("text-xs leading-relaxed text-white/65", className)}>
      Photo: {credit.author} ·{" "}
      {credit.licenseUrl ? (
        <a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer" className={LINK}>
          {credit.license}
        </a>
      ) : (
        credit.license
      )}{" "}
      ·{" "}
      <a href={credit.sourceUrl} target="_blank" rel="noopener noreferrer" className={LINK}>
        Wikimedia Commons<span className="sr-only"> (opens in a new tab)</span>
      </a>
    </p>
  );
}
