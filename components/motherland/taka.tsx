import Image from "next/image";
import { TAKA } from "@/data/motherland";
import { cn } from "@/lib/utils";
import { ANCHOR, COLUMN, SectionHead } from "./kit";

/**
 * Taka: the currency's sign drawn huge in the flag's green beside what it
 * is and where it comes from, the notes in use, then two stories of how
 * Bangladesh earns and lends.
 */
export function Taka() {
  return (
    <section id="taka" aria-labelledby="taka-title" className={cn(ANCHOR, "py-24 sm:py-32")}>
      <div className={COLUMN}>
        <div className="grid items-center gap-10 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-20">
          <p aria-hidden lang="bn" className="font-bengali text-[clamp(12rem,30vw,22rem)] leading-[0.8] font-bold text-ml-green">
            ৳
          </p>
          <div className="flex min-w-0 flex-col gap-8">
            <SectionHead id="taka-title" title={TAKA.title} lede={TAKA.text} cta={TAKA.cta} />
            <div>
              <p className="mb-3 text-sm font-semibold text-ml-green">Notes in use</p>
              <ul className="flex flex-wrap gap-2">
                {TAKA.notes.map((n) => (
                  <li key={n} className="rounded-full bg-white px-4 py-2 font-bold text-ml-ink tabular-nums ring-1 ring-ml-ink/10">
                    ৳{n.toLocaleString("en-US")}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <ul className="mt-16 grid gap-8 md:grid-cols-2 lg:mt-24">
          {TAKA.facts.map((f) => (
            <li key={f.title}>
              <article className="group grid h-full overflow-hidden rounded-3xl bg-white ring-1 ring-ml-ink/10 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
                <div className="relative aspect-4/3 overflow-hidden sm:aspect-auto">
                  <Image
                    src={f.picture.src}
                    alt={f.picture.alt}
                    fill
                    sizes="(min-width: 768px) 22rem, 100vw"
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-hover:scale-105 motion-reduce:transition-none"
                  />
                </div>
                <div className="flex flex-col gap-3 p-7 sm:p-8">
                  <h3 className="text-2xl font-bold tracking-tight text-ml-ink">{f.title}</h3>
                  <p className="leading-relaxed text-ml-ink/80">{f.text}</p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
