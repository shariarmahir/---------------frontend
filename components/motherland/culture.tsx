import Image from "next/image";
import { CULTURE } from "@/data/motherland";
import { cn } from "@/lib/utils";
import { ANCHOR, SectionHead } from "./kit";
import { Rail } from "./rail";

/**
 * Arts & Culture: the reference site's floating images, tall cards that
 * stand across a paper-to-green split, each captioned with its craft.
 */
export function Culture() {
  return (
    <section
      id="culture"
      aria-labelledby="culture-title"
      className={cn(ANCHOR, "bg-[linear-gradient(to_top,var(--color-ml-deep)_21rem,var(--color-ml-ground)_21rem)] pt-24 pb-16 sm:pt-32 lg:bg-[linear-gradient(to_top,var(--color-ml-deep)_27rem,var(--color-ml-ground)_27rem)]")}
    >
      <Rail label="Arts and crafts of Bangladesh" head={<SectionHead id="culture-title" title={CULTURE.title} lede={CULTURE.lede} cta={CULTURE.cta} />}>
        {CULTURE.crafts.map((c) => (
          <li key={c.name} className="w-[min(80vw,25.5rem)] shrink-0 snap-start">
            <figure className="group relative aspect-408/620 overflow-hidden rounded-2xl bg-ml-ink ring-1 ring-black/10">
              <Image
                src={c.picture.src}
                alt={c.picture.alt}
                fill
                sizes="25.5rem"
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-hover:scale-105 motion-reduce:transition-none"
                style={{ objectPosition: c.picture.focus }}
              />
              <figcaption className="absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-linear-to-t from-black/85 via-black/45 to-transparent p-6 pt-24 text-white">
                <span className="text-xl font-bold">{c.name}</span>
                <span className="text-[0.95rem] leading-snug text-white/85">{c.note}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </Rail>
    </section>
  );
}
