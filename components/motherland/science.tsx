import Image from "next/image";
import { SCIENCE } from "@/data/motherland";
import { cn } from "@/lib/utils";
import { ANCHOR, SectionHead } from "./kit";
import { Rail } from "./rail";

/** Science & Tech: the reference site's article row, one card per thing Bangladesh built. */
export function Science() {
  return (
    <section id="science" aria-labelledby="science-title" className={cn(ANCHOR, "py-24 sm:py-32")}>
      <Rail label="What Bangladesh builds" head={<SectionHead id="science-title" title={SCIENCE.title} lede={SCIENCE.lede} cta={SCIENCE.cta} />}>
        {SCIENCE.articles.map((a) => (
          <li key={a.title} className="w-[min(82vw,26rem)] shrink-0 snap-start">
            <article className="group flex flex-col gap-4">
              <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-ml-mist">
                <Image
                  src={a.picture.src}
                  alt={a.picture.alt}
                  fill
                  sizes="26rem"
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-hover:scale-105 motion-reduce:transition-none"
                  style={{ objectPosition: a.picture.focus }}
                />
              </div>
              <h3 className="mt-2 text-2xl font-bold tracking-tight text-ml-ink">{a.title}</h3>
              <p className="leading-relaxed text-ml-ink/80">{a.text}</p>
            </article>
          </li>
        ))}
      </Rail>
    </section>
  );
}
