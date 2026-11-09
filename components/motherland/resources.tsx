import Image from "next/image";
import { RESOURCES } from "@/data/motherland";
import { cn } from "@/lib/utils";
import { ANCHOR, BAND_Y, COLUMN, SectionHead } from "./kit";

/**
 * Capability & Resources: what Bangladesh was born with. The heading and
 * its button across the top; under it a misty river at dawn and six
 * figures, side by side at the same height, from the soil and the
 * sea to the people working abroad.
 */
export function Resources() {
  return (
    <section id="resources" aria-labelledby="resources-title" className={cn(ANCHOR, BAND_Y)}>
      <div className={cn(COLUMN, "flex flex-col gap-12 lg:gap-16")}>
        <SectionHead id="resources-title" title={RESOURCES.title} lede={RESOURCES.lede} cta={RESOURCES.cta} />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-8">
          <div className="relative aspect-4/3 overflow-hidden rounded-[1.25rem] bg-ml-mist lg:aspect-auto">
            <Image src={RESOURCES.picture.src} alt={RESOURCES.picture.alt} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" style={{ objectPosition: RESOURCES.picture.focus }} />
          </div>

          <ul className="grid gap-px overflow-hidden rounded-[1.25rem] bg-ml-ink/10 ring-1 ring-ml-ink/10 sm:grid-cols-2">
            {RESOURCES.items.map((r) => (
              <li key={r.label} className="flex flex-col gap-3 bg-white p-7 sm:p-8">
                <p className="font-ml-display text-[clamp(2.5rem,3.4vw,3.25rem)] leading-[1.1] tracking-[0.01em] text-ml-green">{r.value}</p>
                <h3 className="text-lg font-bold text-ml-ink">{r.label}</h3>
                <p className="leading-relaxed text-ml-ink/80">{r.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
