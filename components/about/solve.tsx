import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { SectionHeading, btn } from "@/components/ui/section-kit";
import { products } from "@/data/products";
import { services } from "@/data/services";
import { cn } from "@/lib/utils";

/**
 * How Kandari-Lab answers the problem: each product as a pair, the broken
 * pixel on ink beside the repair on a solid field, then the four services,
 * the same skills offered to others. Every line comes from data/products.ts
 * and data/services.ts.
 */

const SOLVE_FIELDS = [
  { card: "bg-signal-orange text-text-primary", muted: "text-text-primary/80", accent: "text-bdnavy-900", button: btn.navy },
  { card: "bg-bdnavy-900 text-white", muted: "text-white/80", accent: "text-signal-orange", button: btn.gold },
];

export function Solve() {
  return (
    <section id="solutions" aria-labelledby="solutions-title" className="section-band scroll-mt-header lg:scroll-mt-header-lg">
      <div className="mx-auto max-w-7xl px-gutter-x">
        <SectionHeading
          tone="dark"
          title={<span id="solutions-title">From broken pixel to working product</span>}
          lead="Every product starts from one failure people live with. Here is the failure, and what we are building to fix it."
        />

        <ol className="flex flex-col gap-6">
          {products.map((p, i) => {
            const field = SOLVE_FIELDS[i % SOLVE_FIELDS.length];
            return (
              <li key={p.slug} className="story-reveal">
                <article
                  aria-labelledby={`solve-${p.slug}`}
                  className="group/pair relative grid overflow-hidden rounded-3xl shadow-[0_30px_60px_-36px_rgb(0_0_0/0.9)] lg:grid-cols-2"
                >
                  {/* The broken pixel. */}
                  <div className="flex flex-col gap-4 bg-text-primary p-6 text-white ring-1 ring-white/12 ring-inset sm:p-10">
                    <p className="flex items-center gap-2 font-grotesk text-sm font-bold text-signal-orange">
                      <Icon name="broken_image" className="text-xl" />
                      The problem
                    </p>
                    <p className="font-grotesk text-2xl leading-snug font-bold text-balance sm:text-3xl">{p.coreProblem.statement}</p>
                    <p className="max-w-[60ch] text-base leading-relaxed text-white/80">{p.coreProblem.detail}</p>
                    {/* The broken pixel in grey, the repair beside it in colour. */}
                    <figure className="mt-auto pt-2">
                      <div className="relative aspect-video overflow-hidden rounded-2xl">
                        <Image
                          src={p.problemImage.src}
                          alt={p.problemImage.alt}
                          fill
                          sizes="(min-width: 1024px) 560px, 100vw"
                          className="object-cover grayscale transition-[filter] duration-700 group-hover/pair:grayscale-0 motion-reduce:transition-none"
                        />
                      </div>
                      <figcaption className="mt-3 text-sm leading-relaxed text-white/65">{p.problemImage.caption}</figcaption>
                    </figure>
                  </div>

                  {/* The hinge between the two halves. */}
                  <span
                    aria-hidden
                    className="absolute top-1/2 left-1/2 z-10 hidden size-14 -translate-1/2 place-items-center rounded-full bg-black text-signal-orange ring-4 ring-black/40 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/pair:rotate-[-8deg] motion-reduce:transition-none lg:grid"
                  >
                    <Icon name="arrow_forward" className="text-2xl" />
                  </span>

                  {/* The repair. */}
                  <div className={cn("flex flex-col gap-4 p-6 sm:p-10", field.card)}>
                    <div className="relative aspect-video overflow-hidden rounded-2xl">
                      <Image
                        src={p.image.src}
                        alt={p.image.alt}
                        fill
                        sizes="(min-width: 1024px) 560px, 100vw"
                        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/pair:scale-105 motion-reduce:transition-none motion-reduce:group-hover/pair:scale-100"
                      />
                    </div>
                    <p className={cn("flex flex-wrap items-baseline gap-x-2 font-grotesk text-sm font-bold", field.accent)}>
                      <span>Solved by</span>
                      <span id={`solve-${p.slug}`} className="text-xl">
                        {p.name}
                      </span>
                      <span lang="bn" className="font-bengali text-base">
                        {p.nameBn}
                      </span>
                    </p>
                    <p className="font-grotesk text-2xl leading-snug font-bold text-balance sm:text-3xl">{p.coreSolve.statement}</p>
                    <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
                      <Link href={`/products/${p.slug}`} className={field.button}>
                        Explore {p.name}
                        <Icon name="arrow_forward" className="text-lg" />
                      </Link>
                      <span className={cn("text-sm font-semibold", field.muted)}>{p.stage}</span>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>

        {/* The services: the same skills, offered to others. */}
        <div className="mt-20">
          <h3 className="story-reveal font-grotesk text-2xl font-bold tracking-tight text-signal-orange sm:text-3xl">The same skills, built for you</h3>
          <p className="story-reveal mt-3 max-w-3xl text-base leading-relaxed text-white/80">
            What we build for our own products, we build for factories, offices, farms and apps. Each service runs on work already inside SWASTI and Aponjon.
          </p>
          <ul className="mt-8 border-t border-white/12">
            {services.map((s) => (
              <li key={s.id} className="story-reveal border-b border-white/12">
                <Link
                  href={`/products#service-${s.id}`}
                  className="group/svc grid gap-x-8 gap-y-2 rounded-2xl px-4 py-6 transition-colors duration-300 hover:bg-bdnavy-900 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none sm:px-6 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto] md:items-center motion-reduce:transition-none"
                >
                  <span className="flex items-center gap-3 font-grotesk text-xl font-bold text-white sm:text-2xl">
                    <Icon name={s.icon} className="text-2xl text-signal-orange" />
                    {s.name}
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="text-base leading-relaxed text-white/80">{s.pitch}</span>
                    <span className="flex items-start gap-1.5 text-sm leading-relaxed text-white/65">
                      <Icon name="verified" className="mt-0.5 text-base text-signal-orange" />
                      {s.proof}
                    </span>
                  </span>
                  <Icon
                    name="arrow_outward"
                    className="hidden text-2xl text-signal-orange transition-transform duration-300 group-hover/svc:translate-x-1 group-hover/svc:-translate-y-1 motion-reduce:transition-none md:block"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
