import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { productAccents, products, type Product } from "@/data/products";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./section-heading";
import { SourceLink } from "./source-link";

/** Who in Bangladesh gains, grouped by audience. */
export function ProductBenefits({ product }: { product: Product }) {
  const accent = productAccents[product.accent];

  return (
    <section id="benefits" className="section-band-tinted scroll-mt-40 border-y border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-gutter-x">
        <SectionHeading
          kicker="বাংলাদেশের লাভ"
          title="What Bangladesh gains"
          accentText={accent.text}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {product.benefits.map((b) => (
            <div
              key={b.title}
              className="glass-card flex flex-col rounded-2xl border border-emerald-100 bg-mint-subtle p-6"
              style={{ "--card-accent": "var(--color-bd-green)" } as React.CSSProperties}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-bd-green text-white">
                  <Icon name={b.icon} className="text-[22px]!" />
                </span>
                <span className="rounded-full border border-emerald-200 bg-white px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wide text-bd-green uppercase">
                  {b.audience}
                </span>
              </div>
              <h3 className="font-grotesk text-lg font-bold text-text-primary">{b.title}</h3>
              <p className="mt-1.5 font-sans text-sm leading-relaxed text-text-muted">{b.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Roadmap. Every target is a plan, and is labelled as one. */
export function ProductGrowth({ product }: { product: Product }) {
  const accent = productAccents[product.accent];

  return (
    <section id="growth" className="section-band mx-auto max-w-7xl scroll-mt-40 px-gutter-x">
      <SectionHeading
        kicker="প্রবৃদ্ধির পথ"
        title="Growth roadmap"
        lede="From first pilot to national reach. Targets are plans, not results."
        accentText={accent.text}
      />

      <ol className="relative grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {product.growth.map((p, i) => (
          <li
            key={p.phase}
            className="glass-card relative flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            style={{ "--card-accent": accent.cssVar } as React.CSSProperties}
          >
            <div className="mb-4 flex items-center gap-3">
              <span
                className={cn(
                  "inline-flex size-9 items-center justify-center rounded-full font-grotesk text-sm font-bold",
                  i === 0 ? cn(accent.bg, "text-white") : "border-2 border-slate-200 text-slate-500",
                )}
              >
                {i + 1}
              </span>
              <span className="font-mono text-xs font-bold tracking-wide text-slate-500 uppercase">
                {p.phase}
              </span>
            </div>
            <h3 className="font-grotesk text-lg font-bold text-text-primary">{p.title}</h3>
            <p className="mt-1.5 flex-1 font-sans text-sm leading-relaxed text-text-muted">{p.body}</p>
            <p className="mt-4 border-t border-slate-100 pt-3 font-mono text-[11px] text-slate-500">
              TARGET: <strong className={accent.text}>{p.target}</strong>
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Research summary with sourced key findings. */
export function ProductResearch({ product }: { product: Product }) {
  const accent = productAccents[product.accent];
  const sources = Array.from(
    new Map(
      [...product.stats.map((s) => s.source), ...product.research.findings.map((f) => f.source)].map(
        (s) => [s.url, s],
      ),
    ).values(),
  );

  return (
    <section id="research" className="section-band-tinted scroll-mt-40 border-y border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-gutter-x">
        <SectionHeading
          kicker="গবেষণা সারসংক্ষেপ"
          title="Research summary"
          accentText={accent.text}
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-5">
            {product.research.summary.map((para) => (
              <p key={para.slice(0, 32)} className="font-sans text-base leading-relaxed text-text-secondary">
                {para}
              </p>
            ))}
          </div>

          <ul className="grid grid-cols-1 gap-3 lg:col-span-7">
            {product.research.findings.map((f) => (
              <li
                key={f.text}
                className="glass-card flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
                style={{ "--card-accent": accent.cssVar } as React.CSSProperties}
              >
                <Icon name="insights" className={`mt-0.5 shrink-0 text-[22px]! ${accent.text}`} />
                <div className="flex flex-col gap-2">
                  <p className="font-sans text-sm leading-relaxed font-medium text-text-primary">{f.text}</p>
                  <SourceLink source={f.source} />
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Full reference list. */}
        <details className="group mt-10 rounded-2xl border border-slate-200 bg-white p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between font-grotesk text-sm font-bold text-text-primary uppercase">
            Sources ({sources.length})
            <Icon name="expand_more" className="transition-transform group-open:rotate-180 motion-reduce:transition-none" />
          </summary>
          <ol className="mt-4 list-decimal space-y-2 pl-5 font-sans text-sm text-text-secondary">
            {sources.map((s) => (
              <li key={s.url}>
                {s.publisher} ({s.year}). <em>{s.title}</em>.{" "}
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="break-all text-bd-green underline-offset-2 hover:underline">
                  {s.url}
                </a>
              </li>
            ))}
          </ol>
          <p className="mt-4 font-sans text-xs text-text-muted">
            Figures checked against each source in September 2026. Product
            targets on this page are Kandari-Lab plans, not measured results.
          </p>
        </details>
      </div>
    </section>
  );
}

/** Closing CTA plus links to the other products. */
export function ProductNext({ product }: { product: Product }) {
  const others = products.filter((p) => p.slug !== product.slug);

  return (
    <section className="section-band mx-auto max-w-7xl px-gutter-x">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="relative overflow-hidden rounded-3xl bg-bd-green p-8 text-white shadow-elevated sm:p-10 lg:col-span-7">
          <span className="font-bengali text-sm font-bold text-signal-orange">যোগ দিন</span>
          <h2 className="mt-2 font-grotesk text-2xl font-bold uppercase sm:text-3xl">
            Be first to use {product.name}
          </h2>
          <p className="mt-3 max-w-lg font-sans text-base leading-relaxed text-white/80">
            Join Kandari Profile for pilot invitations, research updates and
            early releases.
          </p>
          <Link
            href="/#kandari-profile"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-signal-orange px-6 py-3.5 font-grotesk text-sm font-bold text-white uppercase shadow-glow-orange transition-all hover:-translate-y-0.5 hover:bg-bdorange-600 focus-visible:ring-3 focus-visible:ring-white/50 focus-visible:outline-none"
          >
            Join Kandari Profile
            <Icon name="arrow_forward" className="text-lg" />
          </Link>
        </div>

        <div className="flex flex-col gap-4 lg:col-span-5">
          {others.map((p) => {
            const a = productAccents[p.accent];
            return (
              <Link
                key={p.slug}
                href={`/products/${p.slug}`}
                className="glass-card group flex flex-1 items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
                style={{ "--card-accent": a.cssVar } as React.CSSProperties}
              >
                <div>
                  <span className="font-mono text-[10px] font-bold tracking-wide text-slate-500 uppercase">
                    {p.category}
                  </span>
                  <p className="font-grotesk text-lg font-bold text-text-primary">
                    {p.name} <span className={`font-bengali ${a.text}`}>{p.nameBn}</span>
                  </p>
                </div>
                <Icon name="arrow_forward" className={`transition-transform group-hover:translate-x-1 motion-reduce:transition-none ${a.text}`} />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
