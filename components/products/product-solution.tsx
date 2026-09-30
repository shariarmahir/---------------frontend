import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { SectionHeading, SignalSeam } from "@/components/ui/section-kit";
import type { Product } from "@/data/products";
import { cn } from "@/lib/utils";
import { LIFT, glowStyle, surfaceAt } from "./surfaces";

/** What the product does, then how a person moves through it. */
export function ProductSolution({ product }: { product: Product }) {
  return (
    <section id="solution" className="section-band-tinted mx-auto max-w-7xl scroll-mt-40 px-gutter-x">
      <SectionHeading
        tone="dark"
        kicker="সমাধান"
        title={`How ${product.name} solves it`}
        lead={product.coreSolve.detail}
      />

      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-[repeat(3,minmax(0,1fr))]">
        {product.capabilities.map((item, i) => {
          const tone = surfaceAt(i);
          return (
            <li key={item.title} className="story-reveal flex">
              <div
                style={glowStyle(tone.glow)}
                className={cn("group w-full rounded-2xl p-4 shadow-sm sm:rounded-3xl sm:p-6", LIFT, tone.card)}
              >
                <span
                  className={cn(
                    "mb-4 inline-flex size-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:-rotate-6 motion-reduce:transition-none motion-reduce:group-hover:rotate-0",
                    tone.tile,
                  )}
                >
                  <Icon name={item.icon} className="text-[24px]!" />
                </span>
                <h3 className="font-grotesk text-base font-bold sm:text-lg">{item.title}</h3>
                <p className="mt-1.5 font-sans text-xs leading-relaxed sm:text-sm">{item.body}</p>
              </div>
            </li>
          );
        })}
      </ul>

      {/* How it works — a numbered flow on an ink panel. */}
      <div className="story-reveal mt-14 rounded-3xl bg-text-primary p-6 text-white ring-1 ring-white/12 sm:p-8 lg:p-10">
        <h3 className="mb-8 font-grotesk text-xl font-bold text-signal-orange uppercase sm:text-2xl">
          How it works <span className="font-bengali text-white normal-case">· যেভাবে কাজ করে</span>
        </h3>
        <ol className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))]">
          {product.steps.map((step, i) => {
            const tone = surfaceAt(i);
            return (
              <li key={step.title} className="relative">
                {/* Connector to the next step on wide screens: a gold pulse runs along it. */}
                {i < product.steps.length - 1 && (
                  <span aria-hidden className="absolute top-6 left-14 hidden w-[calc(100%-3rem)] lg:block">
                    <SignalSeam className="relative" />
                  </span>
                )}
                <span
                  className={cn(
                    "relative inline-flex size-12 items-center justify-center rounded-2xl font-grotesk text-lg font-bold shadow-md",
                    tone.card.replace(" ring-1 ring-white/12", ""),
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h4 className="mt-4 font-grotesk text-lg font-bold">{step.title}</h4>
                <p className="mt-1 font-sans text-sm leading-relaxed text-white/75">{step.body}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/**
 * Before / after scenarios. These are illustrations of intended use, and
 * the chip says so — the photographs are context, not the people described.
 * On an ink band: "Today" in the urgency red, "With the product" in green.
 */
export function ProductScenarios({ product }: { product: Product }) {
  return (
    <section id="situations" className="section-band-tinted relative isolate scroll-mt-40 overflow-hidden bg-text-primary text-white">
      <SignalSeam className="top-0" />
      <div className="mx-auto max-w-7xl px-gutter-x">
        <SectionHeading
          tone="dark"
          kicker="বাস্তব পরিস্থিতি"
          title="Real-life situations"
          lead="Everyday moments in rural Bangladesh — what happens today, and what changes with the product."
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[repeat(2,minmax(0,1fr))]">
          {product.scenarios.map((s) => (
            <article
              key={s.title}
              style={glowStyle("var(--color-signal-orange)")}
              className={cn("story-reveal flex flex-col overflow-hidden rounded-3xl bg-black shadow-sm ring-1 ring-white/12", LIFT)}
            >
              <div className="group relative aspect-video overflow-hidden">
                <Image
                  src={s.image}
                  alt={s.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
                <div aria-hidden className="absolute inset-0 bg-linear-to-t from-text-primary/90 to-transparent" />
                <span className="absolute top-3 left-3 rounded-full bg-signal-orange px-2.5 py-1 font-mono text-[10px] font-bold tracking-wide text-text-primary uppercase shadow-sm">
                  Illustrative scenario
                </span>
                <h3 className="absolute inset-x-0 bottom-0 p-5 font-grotesk text-xl font-bold text-white">{s.title}</h3>
              </div>

              <div className="grid flex-1 grid-cols-1 sm:grid-cols-2">
                <div className="bg-national-crimson p-5 text-white">
                  <span className="mb-2 inline-flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-wide uppercase">
                    <Icon name="close" className="text-[14px]!" />
                    Today
                  </span>
                  <p className="font-sans text-sm leading-relaxed">{s.without}</p>
                </div>
                <div className="bg-bd-green p-5 text-white">
                  <span className="mb-2 inline-flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-wide text-signal-orange uppercase">
                    <Icon name="check" className="text-[14px]!" />
                    With {product.name}
                  </span>
                  <p className="font-sans text-sm leading-relaxed">{s.withProduct}</p>
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
  return (
    <section id="videos" className="section-band-tinted mx-auto max-w-7xl scroll-mt-40 px-gutter-x">
      <SectionHeading
        tone="dark"
        kicker="ভিডিও — সহজে বুঝুন"
        title="See it to understand it"
        lead="Short films on the problem, the product and the people it serves."
      />

      <ul className="grid grid-cols-1 gap-5 md:grid-cols-[repeat(3,minmax(0,1fr))]">
        {product.videos.map((v, i) => {
          const tone = surfaceAt(i);
          return (
            <li key={v.title} className="story-reveal flex">
              <figure
                style={glowStyle(tone.glow)}
                className={cn("flex w-full flex-col overflow-hidden rounded-3xl shadow-sm", LIFT, tone.card)}
              >
                <div className="group relative aspect-video overflow-hidden bg-text-primary">
                  <Image
                    src={v.poster}
                    alt={v.posterAlt}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover opacity-75 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05] group-hover:opacity-90 motion-reduce:transition-none"
                  />
                  <div aria-hidden className="absolute inset-0 flex items-center justify-center">
                    <span className="flex size-14 items-center justify-center rounded-full bg-signal-orange text-text-primary shadow-lg transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none">
                      <Icon name="play_arrow" filled className="text-[30px]!" />
                    </span>
                  </div>
                  <span className="absolute top-3 left-3 rounded-md bg-text-primary px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                    EP {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="absolute top-3 right-3 rounded-md bg-signal-orange px-2 py-0.5 font-bengali text-[11px] font-bold text-text-primary">
                    শীঘ্রই আসছে
                  </span>
                </div>
                <figcaption className="flex flex-1 flex-col gap-1 p-5">
                  <span className="font-bengali text-sm font-bold">{v.titleBn}</span>
                  <span className="font-grotesk text-lg font-bold">{v.title}</span>
                  <span className="font-sans text-sm leading-relaxed">{v.brief}</span>
                </figcaption>
              </figure>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
