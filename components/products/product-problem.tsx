import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { productAccents, type Product } from "@/data/products";
import { SectionHeading } from "./section-heading";
import { SourceLink } from "./source-link";

/**
 * The problem, in two parts: the published numbers first (every one
 * sourced), then what those numbers look like on the ground.
 */
export function ProductProblem({ product }: { product: Product }) {
  const accent = productAccents[product.accent];

  return (
    <section id="problem" className="section-band mx-auto max-w-7xl scroll-mt-40 px-gutter-x">
      <SectionHeading
        kicker="সমস্যা — সংখ্যায়"
        title="The problem, in real numbers"
        lede="Published national data — every figure links to its source."
        accentText={accent.text}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {product.stats.map((stat) => (
          <div
            key={stat.label}
            className="glass-card flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            style={{ "--card-accent": accent.cssVar } as React.CSSProperties}
          >
            <div>
              <span className={`block font-grotesk text-4xl font-bold tracking-tight tabular-nums ${accent.text}`}>
                {stat.value}
              </span>
              <p className="mt-2 font-sans text-sm leading-snug text-text-secondary">
                {stat.label}
              </p>
            </div>
            <SourceLink source={stat.source} />
          </div>
        ))}
      </div>

      {/* On the ground. */}
      <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
        <figure className="lg:col-span-5">
          <div className="group relative aspect-4/5 overflow-hidden rounded-3xl shadow-elevated lg:aspect-auto lg:h-full lg:min-h-[28rem]">
            <Image
              src={product.problemImage.src}
              alt={product.problemImage.alt}
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
            <div aria-hidden className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
            <figcaption className="absolute inset-x-0 bottom-0 p-6 font-sans text-sm leading-relaxed font-medium text-white">
              {product.problemImage.caption}
            </figcaption>
          </div>
        </figure>

        <div className="lg:col-span-7">
          <h3 className="mb-5 font-grotesk text-xl font-bold text-text-primary uppercase sm:text-2xl">
            What it looks like on the ground
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {product.problems.map((item) => (
              <div
                key={item.title}
                className="glass-card rounded-2xl border border-red-100 bg-white p-5 shadow-xs"
                style={{ "--card-accent": "var(--color-national-crimson)" } as React.CSSProperties}
              >
                <span className="mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-red-50 text-national-crimson">
                  <Icon name={item.icon} className="text-[22px]!" />
                </span>
                <h4 className="font-grotesk text-base font-bold text-text-primary">
                  {item.title}
                </h4>
                <p className="mt-1.5 font-sans text-sm leading-relaxed text-text-muted">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Core problem beside core solve — the page's thesis in two panels. */
export function ProductCore({ product }: { product: Product }) {
  return (
    <section id="core" className="section-band-tinted scroll-mt-40 bg-bd-green-dark">
      <div className="mx-auto max-w-7xl px-gutter-x">
        <SectionHeading
          kicker="মূল সমস্যা → মূল সমাধান"
          title="The core problem — and the core fix"
          invert
        />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div
            className="glass-card rounded-3xl border border-white/10 bg-white/[0.06] p-7 sm:p-9"
            style={{ "--card-accent": "var(--color-national-crimson)" } as React.CSSProperties}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-national-crimson px-3 py-1 font-mono text-[11px] font-bold tracking-wide text-white uppercase">
              <Icon name="error" className="text-[14px]!" />
              Core problem
            </span>
            <p className="mt-5 font-grotesk text-2xl leading-snug font-bold text-white sm:text-3xl">
              {product.coreProblem.statement}
            </p>
            <p className="mt-4 font-sans text-base leading-relaxed text-white/75">
              {product.coreProblem.detail}
            </p>
          </div>

          <div
            className="glass-card rounded-3xl border border-signal-orange/40 bg-white p-7 sm:p-9"
            style={{ "--card-accent": "var(--color-signal-orange)" } as React.CSSProperties}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-signal-orange px-3 py-1 font-mono text-[11px] font-bold tracking-wide text-white uppercase">
              <Icon name="check_circle" className="text-[14px]!" />
              Core solve
            </span>
            <p className="mt-5 font-grotesk text-2xl leading-snug font-bold text-text-primary sm:text-3xl">
              {product.coreSolve.statement}
            </p>
            <p className="mt-4 font-sans text-base leading-relaxed text-text-secondary">
              {product.coreSolve.detail}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
