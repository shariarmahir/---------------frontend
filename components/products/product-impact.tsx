import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { SectionHeading, SignalSeam, btn } from "@/components/ui/section-kit";
import { products, type Product } from "@/data/products";
import { cn } from "@/lib/utils";
import { LIFT, glowStyle, surfaceAt } from "./surfaces";
import { SourceLink } from "./source-link";

/** Who in Bangladesh gains, grouped by audience — on a gold band. */
export function ProductBenefits({ product }: { product: Product }) {
  return (
    <section id="benefits" className="section-band-tinted relative isolate scroll-mt-40 overflow-hidden bg-signal-orange text-text-primary">
      <div className="mx-auto max-w-7xl px-gutter-x">
        {/* Ink title on the gold band: gold text would vanish here. */}
        <div className="story-reveal mb-10 flex max-w-3xl flex-col gap-3">
          <span aria-hidden className="flex items-center gap-1.5 py-1">
            <span className="size-2.5 rounded-[3px] bg-text-primary" />
            <span className="size-2.5 rounded-[3px] bg-bd-green" />
            <span className="size-2.5 rounded-[3px] bg-white" />
          </span>
          <span className="font-bengali text-sm font-bold">বাংলাদেশের লাভ</span>
          <h2 className="font-grotesk text-2xl font-bold tracking-tight text-balance uppercase sm:text-3xl lg:text-4xl">
            What Bangladesh gains
          </h2>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-[repeat(4,minmax(0,1fr))]">
          {product.benefits.map((b, i) => {
            const green = i % 2 === 0;
            return (
              <li key={b.title} className="story-reveal flex">
                <div
                  style={glowStyle(green ? "var(--color-bd-green)" : "var(--color-text-primary)")}
                  className={cn(
                    "group flex w-full flex-col rounded-2xl p-4 text-white shadow-sm sm:rounded-3xl sm:p-6",
                    LIFT,
                    green ? "bg-bd-green" : "bg-text-primary",
                  )}
                >
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-signal-orange text-text-primary transition-transform duration-300 group-hover:-rotate-6 motion-reduce:transition-none motion-reduce:group-hover:rotate-0">
                      <Icon name={b.icon} className="text-[22px]!" />
                    </span>
                    <span className="rounded-full bg-white/10 px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wide text-white uppercase ring-1 ring-white/25">
                      {b.audience}
                    </span>
                  </div>
                  <h3 className="font-grotesk text-base font-bold sm:text-lg">{b.title}</h3>
                  <p className="mt-1.5 font-sans text-xs leading-relaxed text-white/80 sm:text-sm">{b.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** Roadmap. Every target is a plan, and is labelled as one. */
export function ProductGrowth({ product }: { product: Product }) {
  return (
    <section id="growth" className="section-band-tinted mx-auto max-w-7xl scroll-mt-40 px-gutter-x">
      <SectionHeading
        tone="dark"
        kicker="প্রবৃদ্ধির পথ"
        title="Growth roadmap"
        lead="From first pilot to national reach. Targets are plans, not results."
      />

      <ol className="relative grid grid-cols-1 gap-4 md:grid-cols-[repeat(2,minmax(0,1fr))] lg:grid-cols-[repeat(4,minmax(0,1fr))]">
        {product.growth.map((p, i) => {
          // The first phase is where we are: gold. The rest are ink, still to come.
          const now = i === 0;
          return (
            <li key={p.phase} className="story-reveal flex">
              <div
                style={glowStyle(now ? "var(--color-signal-orange)" : "var(--color-bdgreen-500)")}
                className={cn(
                  "flex w-full flex-col rounded-3xl p-6 shadow-sm",
                  LIFT,
                  now ? "bg-signal-orange text-text-primary" : "bg-text-primary text-white ring-1 ring-white/12",
                )}
              >
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className={cn(
                      "inline-flex size-9 items-center justify-center rounded-full font-grotesk text-sm font-bold",
                      now ? "bg-text-primary text-signal-orange" : "bg-white/10 text-white ring-1 ring-white/30",
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="font-mono text-xs font-bold tracking-wide uppercase opacity-80">{p.phase}</span>
                </div>
                <h3 className="font-grotesk text-lg font-bold">{p.title}</h3>
                <p className={cn("mt-1.5 flex-1 font-sans text-sm leading-relaxed", !now && "text-white/80")}>{p.body}</p>
                <p className="mt-4 border-t border-current/20 pt-3 font-mono text-[11px]">
                  TARGET: <strong className={now ? undefined : "text-signal-orange"}>{p.target}</strong>
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/** Research summary with sourced key findings — a green band. */
export function ProductResearch({ product }: { product: Product }) {
  const sources = Array.from(
    new Map(
      [...product.stats.map((s) => s.source), ...product.research.findings.map((f) => f.source)].map(
        (s) => [s.url, s],
      ),
    ).values(),
  );

  return (
    <section id="research" className="section-band-tinted relative isolate scroll-mt-40 overflow-hidden bg-bd-green text-white">
      <SignalSeam className="top-0" />
      <div className="mx-auto max-w-7xl px-gutter-x">
        <SectionHeading tone="dark" kicker="গবেষণা সারসংক্ষেপ" title="Research summary" />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="story-reveal space-y-4 lg:col-span-5">
            {product.research.summary.map((para) => (
              <p key={para.slice(0, 32)} className="font-sans text-base leading-relaxed text-white/90">
                {para}
              </p>
            ))}
          </div>

          <ul className="grid grid-cols-1 gap-3 lg:col-span-7">
            {product.research.findings.map((f, i) => {
              // Never green: the band is green. Gold, orange, ink, repeat.
              const tone = surfaceAt(1 + (i % 3));
              return (
                <li key={f.text} className="story-reveal flex">
                  <div
                    style={glowStyle(tone.glow)}
                    className={cn("flex w-full gap-4 rounded-2xl p-5 shadow-sm", LIFT, tone.card)}
                  >
                    <span className={cn("inline-flex size-10 shrink-0 items-center justify-center rounded-xl", tone.tile)}>
                      <Icon name="insights" className="text-[22px]!" />
                    </span>
                    <div className="flex flex-col gap-2">
                      <p className="font-sans text-sm leading-relaxed font-medium">{f.text}</p>
                      <SourceLink source={f.source} className="text-current/80 hover:text-current" />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Full reference list. */}
        <details className="group mt-10 rounded-2xl bg-text-primary p-5 text-white ring-1 ring-white/12">
          <summary className="flex cursor-pointer list-none items-center justify-between font-grotesk text-sm font-bold text-signal-orange uppercase focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none">
            Sources ({sources.length})
            <Icon name="expand_more" className="transition-transform group-open:rotate-180 motion-reduce:transition-none" />
          </summary>
          <ol className="mt-4 list-decimal space-y-2 pl-5 font-sans text-sm text-white/85">
            {sources.map((s) => (
              <li key={s.url}>
                {s.publisher} ({s.year}). <em>{s.title}</em>.{" "}
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="break-all text-signal-orange underline-offset-2 hover:underline">
                  {s.url}
                </a>
              </li>
            ))}
          </ol>
          <p className="mt-4 font-sans text-xs text-white/70">
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
    <section className="section-band-tinted mx-auto max-w-7xl px-gutter-x">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div
          style={glowStyle("var(--color-signal-orange)")}
          className={cn("story-reveal relative overflow-hidden rounded-3xl bg-signal-orange p-8 text-text-primary sm:p-10 lg:col-span-7", LIFT)}
        >
          <span className="font-bengali text-sm font-bold">যোগ দিন</span>
          <h2 className="mt-2 font-grotesk text-2xl font-bold uppercase sm:text-3xl">Be first to use {product.name}</h2>
          <p className="mt-3 max-w-lg font-sans text-base leading-relaxed">
            Join Kandari Profile for pilot invitations, research updates and early releases.
          </p>
          <Link href="/#kandari-profile" className={cn(btn.ink, "mt-6")}>
            Join Kandari Profile
            <Icon name="arrow_forward" className="text-lg text-signal-orange" />
          </Link>
        </div>

        <ul className="flex flex-col gap-4 lg:col-span-5">
          {others.map((p, i) => {
            const tone = surfaceAt(i === 0 ? 0 : 3);
            return (
              <li key={p.slug} className="story-reveal flex flex-1">
                <Link
                  href={`/products/${p.slug}`}
                  style={glowStyle(tone.glow)}
                  className={cn(
                    "group flex w-full items-center justify-between gap-4 rounded-2xl p-5 shadow-sm focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none",
                    LIFT,
                    tone.card,
                  )}
                >
                  <div>
                    <span className="font-mono text-[10px] font-bold tracking-wide uppercase opacity-80">{p.category}</span>
                    <p className="font-grotesk text-lg font-bold">
                      {p.name} <span className="font-bengali">{p.nameBn}</span>
                    </p>
                  </div>
                  <Icon name="arrow_forward" className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
