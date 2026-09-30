import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/ui/section-kit";
import type { Product } from "@/data/products";
import { cn } from "@/lib/utils";
import { LIFT, glowStyle, surfaceAt } from "./surfaces";
import { SourceLink } from "./source-link";

/**
 * The problem, in two parts: the published numbers first (every one
 * sourced), then what those numbers look like on the ground.
 */
export function ProductProblem({ product }: { product: Product }) {
  return (
    <section id="problem" className="section-band-tinted mx-auto max-w-7xl scroll-mt-40 px-gutter-x">
      <SectionHeading
        tone="dark"
        kicker="সমস্যা — সংখ্যায়"
        title="The problem, in real numbers"
        lead="Published national data — every figure links to its source."
      />

      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-[repeat(4,minmax(0,1fr))]">
        {product.stats.map((stat, i) => {
          const tone = surfaceAt(i);
          return (
            <li key={stat.label} className="story-reveal flex">
              <div
                style={glowStyle(tone.glow)}
                className={cn("flex w-full flex-col justify-between gap-4 rounded-2xl p-4 shadow-sm sm:rounded-3xl sm:p-6", LIFT, tone.card)}
              >
                <div>
                  <span className="block font-grotesk text-3xl font-bold tracking-tight tabular-nums sm:text-4xl">{stat.value}</span>
                  <p className="mt-2 font-sans text-xs leading-snug sm:text-sm">{stat.label}</p>
                </div>
                <SourceLink source={stat.source} className="text-current/80 hover:text-current" />
              </div>
            </li>
          );
        })}
      </ul>

      {/* On the ground. */}
      <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
        <figure className="story-reveal lg:col-span-5">
          <div className="group relative aspect-4/5 overflow-hidden rounded-3xl shadow-[0_30px_60px_-28px_rgb(0_0_0/0.8)] lg:aspect-auto lg:h-full lg:min-h-112">
            <Image
              src={product.problemImage.src}
              alt={product.problemImage.alt}
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
            <div aria-hidden className="absolute inset-0 bg-linear-to-t from-text-primary/90 via-text-primary/10 to-transparent" />
            <figcaption className="absolute inset-x-0 bottom-0 p-6 font-sans text-sm leading-relaxed font-medium text-white">
              {product.problemImage.caption}
            </figcaption>
          </div>
        </figure>

        <div className="lg:col-span-7">
          <h3 className="story-reveal mb-5 font-grotesk text-xl font-bold text-signal-orange uppercase sm:text-2xl">
            What it looks like on the ground
          </h3>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {product.problems.map((item) => (
              <li key={item.title} className="story-reveal flex">
                {/* Ink card, red icon plate: red is kept for urgency, and these are the urgent things. */}
                <div
                  style={glowStyle("var(--color-national-crimson)")}
                  className={cn("w-full rounded-2xl bg-text-primary p-5 text-white shadow-sm ring-1 ring-white/12", LIFT)}
                >
                  <span className="mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-national-crimson text-white">
                    <Icon name={item.icon} className="text-[22px]!" />
                  </span>
                  <h4 className="font-grotesk text-base font-bold">{item.title}</h4>
                  <p className="mt-1.5 font-sans text-sm leading-relaxed text-white/80">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** Core problem beside core solve — the page's thesis in two panels, on a green band. */
export function ProductCore({ product }: { product: Product }) {
  return (
    <section id="core" className="section-band-tinted relative isolate scroll-mt-40 overflow-hidden bg-bd-green text-white">
      <div className="mx-auto max-w-7xl px-gutter-x">
        <SectionHeading tone="dark" kicker="মূল সমস্যা → মূল সমাধান" title="The core problem — and the core fix" />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div
            style={glowStyle("var(--color-national-crimson)")}
            className={cn("story-reveal rounded-3xl bg-text-primary p-7 text-white ring-1 ring-white/12 sm:p-9", LIFT)}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-national-crimson px-3 py-1 font-mono text-[11px] font-bold tracking-wide text-white uppercase">
              <Icon name="error" className="text-[14px]!" />
              Core problem
            </span>
            <p className="mt-5 font-grotesk text-2xl leading-snug font-bold sm:text-3xl">{product.coreProblem.statement}</p>
            <p className="mt-4 font-sans text-base leading-relaxed text-white/80">{product.coreProblem.detail}</p>
          </div>

          <div
            style={glowStyle("var(--color-signal-orange)")}
            className={cn("story-reveal rounded-3xl bg-signal-orange p-7 text-text-primary sm:p-9", LIFT)}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-text-primary px-3 py-1 font-mono text-[11px] font-bold tracking-wide text-signal-orange uppercase">
              <Icon name="check_circle" className="text-[14px]!" />
              Core solve
            </span>
            <p className="mt-5 font-grotesk text-2xl leading-snug font-bold sm:text-3xl">{product.coreSolve.statement}</p>
            <p className="mt-4 font-sans text-base leading-relaxed">{product.coreSolve.detail}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
