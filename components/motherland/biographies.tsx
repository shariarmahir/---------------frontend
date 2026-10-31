import Image from "next/image";
import { BIOGRAPHIES } from "@/data/motherland";
import { cn } from "@/lib/utils";
import { ANCHOR, SectionHead } from "./kit";
import { Rail } from "./rail";

/** Biographies: a row of portraits on the deep green, each with a life in two lines. */
export function Biographies() {
  return (
    <section id="biographies" aria-labelledby="biographies-title" className={cn(ANCHOR, "bg-ml-deep py-24 text-white sm:py-32")}>
      <Rail
        label="People who shaped Bangladesh"
        head={<SectionHead id="biographies-title" tone="dark" title={BIOGRAPHIES.title} lede={BIOGRAPHIES.lede} cta={BIOGRAPHIES.cta} />}
      >
        {BIOGRAPHIES.lives.map((l) => (
          <li key={l.name} className="w-[min(72vw,19rem)] shrink-0 snap-start">
            <article className="group flex flex-col gap-4">
              <div className="relative aspect-3/4 overflow-hidden rounded-2xl bg-ml-ink ring-1 ring-white/10">
                <Image
                  src={l.picture.src}
                  alt={l.picture.alt}
                  fill
                  sizes="19rem"
                  className="object-cover grayscale-[35%] transition-[scale,filter] duration-700 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-hover:scale-105 group-hover:grayscale-0 motion-reduce:transition-none"
                  style={{ objectPosition: l.picture.focus }}
                />
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-xl font-bold tracking-tight">{l.name}</h3>
                <p className="shrink-0 text-sm text-white/65 tabular-nums">{l.years}</p>
              </div>
              <p className="text-[0.95rem] leading-relaxed text-white/80">{l.text}</p>
            </article>
          </li>
        ))}
      </Rail>
    </section>
  );
}
