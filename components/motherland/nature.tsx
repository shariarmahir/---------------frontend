import Image from "next/image";
import { NATURE } from "@/data/motherland";
import { cn } from "@/lib/utils";
import { ANCHOR, SectionHead } from "./kit";
import { Rail } from "./rail";

/** Animals & Nature: square photographs in a row, like the reference site's social wall, each named on the picture. */
export function Nature() {
  return (
    <section id="nature" aria-labelledby="nature-title" className={cn(ANCHOR, "py-24 sm:py-32")}>
      <Rail label="Wildlife and nature of Bangladesh" head={<SectionHead id="nature-title" title={NATURE.title} lede={NATURE.lede} cta={NATURE.cta} />}>
        {NATURE.wild.map((w) => (
          <li key={w.name} className="w-[min(80vw,22rem)] shrink-0 snap-start">
            <figure className="group relative aspect-square overflow-hidden rounded-2xl bg-ml-mist">
              <Image
                src={w.picture.src}
                alt={w.picture.alt}
                fill
                sizes="22rem"
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-hover:scale-105 motion-reduce:transition-none"
                style={{ objectPosition: w.picture.focus }}
              />
              <figcaption className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 bg-linear-to-t from-black/80 via-black/45 to-transparent p-6 pt-20 text-white">
                <span className="font-ml-display text-3xl tracking-[0.01em] uppercase">{w.name}</span>
                <span className="text-[0.95rem] leading-snug text-white/90">{w.note}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </Rail>
    </section>
  );
}
