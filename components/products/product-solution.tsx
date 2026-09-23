import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { productAccents, type Product } from "@/data/products";
import { SectionHeading } from "./section-heading";

/** What the product does, then how a person moves through it. */
export function ProductSolution({ product }: { product: Product }) {
  const accent = productAccents[product.accent];

  return (
    <section id="solution" className="section-band mx-auto max-w-7xl scroll-mt-40 px-gutter-x">
      <SectionHeading
        kicker="সমাধান"
        title={`How ${product.name} solves it`}
        lede={product.coreSolve.detail}
        accentText={accent.text}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {product.capabilities.map((item) => (
          <div
            key={item.title}
            className="glass-card rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            style={{ "--card-accent": accent.cssVar } as React.CSSProperties}
          >
            <span className={`mb-4 inline-flex size-11 items-center justify-center rounded-xl ${accent.soft} ${accent.text}`}>
              <Icon name={item.icon} className="text-[24px]!" />
            </span>
            <h3 className="font-grotesk text-lg font-bold text-text-primary">{item.title}</h3>
            <p className="mt-1.5 font-sans text-sm leading-relaxed text-text-muted">{item.body}</p>
          </div>
        ))}
      </div>

      {/* How it works — numbered flow. */}
      <div className="mt-14 rounded-3xl border border-slate-200 bg-white p-6 shadow-elevated sm:p-8 lg:p-10">
        <h3 className="mb-8 font-grotesk text-xl font-bold text-text-primary uppercase sm:text-2xl">
          How it works <span className={`font-bengali normal-case ${accent.text}`}>· যেভাবে কাজ করে</span>
        </h3>
        <ol className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {product.steps.map((step, i) => (
            <li key={step.title} className="relative">
              {/* Connector to the next step on wide screens. */}
              {i < product.steps.length - 1 && (
                <span aria-hidden className="absolute top-6 left-14 hidden h-px w-[calc(100%-3rem)] border-t-2 border-dashed border-slate-200 lg:block" />
              )}
              <span className={`relative inline-flex size-12 items-center justify-center rounded-2xl font-grotesk text-lg font-bold text-white shadow-md ${accent.bg}`}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <h4 className="mt-4 font-grotesk text-lg font-bold text-text-primary">{step.title}</h4>
              <p className="mt-1 font-sans text-sm leading-relaxed text-text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/**
 * Before / after scenarios. These are illustrations of intended use, and
 * the chip says so — the photographs are context, not the people described.
 */
export function ProductScenarios({ product }: { product: Product }) {
  const accent = productAccents[product.accent];

  return (
    <section id="situations" className="section-band-tinted scroll-mt-40 border-y border-slate-200 bg-mint-subtle/70">
      <div className="mx-auto max-w-7xl px-gutter-x">
        <SectionHeading
          kicker="বাস্তব পরিস্থিতি"
          title="Real-life situations"
          lede="Everyday moments in rural Bangladesh — what happens today, and what changes with the product."
          accentText={accent.text}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {product.scenarios.map((s) => (
            <article
              key={s.title}
              className="glass-card flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              style={{ "--card-accent": accent.cssVar } as React.CSSProperties}
            >
              <div className="group relative aspect-video overflow-hidden">
                <Image
                  src={s.image}
                  alt={s.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
                <div aria-hidden className="absolute inset-0 bg-linear-to-t from-slate-950/75 to-transparent" />
                <span className="absolute top-3 left-3 rounded-full bg-white/95 px-2.5 py-1 font-mono text-[10px] font-bold tracking-wide text-slate-700 uppercase shadow-sm">
                  Illustrative scenario
                </span>
                <h3 className="absolute inset-x-0 bottom-0 p-5 font-grotesk text-xl font-bold text-white">
                  {s.title}
                </h3>
              </div>

              <div className="grid flex-1 grid-cols-1 sm:grid-cols-2">
                <div className="border-b border-slate-100 p-5 sm:border-r sm:border-b-0">
                  <span className="mb-2 inline-flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-wide text-national-crimson uppercase">
                    <Icon name="close" className="text-[14px]!" />
                    Today
                  </span>
                  <p className="font-sans text-sm leading-relaxed text-text-secondary">{s.without}</p>
                </div>
                <div className="bg-bd-green-light/60 p-5">
                  <span className="mb-2 inline-flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-wide text-bd-green uppercase">
                    <Icon name="check" className="text-[14px]!" />
                    With {product.name}
                  </span>
                  <p className="font-sans text-sm leading-relaxed text-text-primary">{s.withProduct}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Video slots. No footage exists yet, so each slot shows its poster, the
 * brief for what will be filmed, and an honest "coming soon" — never a
 * play button that plays nothing.
 */
export function ProductVideos({ product }: { product: Product }) {
  const accent = productAccents[product.accent];

  return (
    <section id="videos" className="section-band mx-auto max-w-7xl scroll-mt-40 px-gutter-x">
      <SectionHeading
        kicker="ভিডিও — সহজে বুঝুন"
        title="See it to understand it"
        lede="Short films on the problem, the product and the people it serves."
        accentText={accent.text}
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {product.videos.map((v, i) => (
          <figure
            key={v.title}
            className="glass-card flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            style={{ "--card-accent": accent.cssVar } as React.CSSProperties}
          >
            <div className="group relative aspect-video overflow-hidden bg-slate-900">
              <Image
                src={v.poster}
                alt={v.posterAlt}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover opacity-70 transition-all duration-700 group-hover:scale-[1.05] group-hover:opacity-85 motion-reduce:transition-none"
              />
              <div aria-hidden className="absolute inset-0 flex items-center justify-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-lg ring-4 ring-white/30 transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none">
                  <Icon name="play_arrow" filled className="text-[30px]!" />
                </span>
              </div>
              <span className="absolute top-3 left-3 rounded-md bg-slate-950/75 px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                EP {String(i + 1).padStart(2, "0")}
              </span>
              <span className="absolute top-3 right-3 rounded-md bg-signal-orange px-2 py-0.5 font-bengali text-[11px] font-bold text-white">
                শীঘ্রই আসছে
              </span>
            </div>
            <figcaption className="flex flex-1 flex-col gap-1 p-5">
              <span className={`font-bengali text-sm font-bold ${accent.text}`}>{v.titleBn}</span>
              <span className="font-grotesk text-lg font-bold text-text-primary">{v.title}</span>
              <span className="font-sans text-sm leading-relaxed text-text-muted">{v.brief}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
