/*
 * The two halves of the products & services showcase, shared by the home
 * page and /products: Kandari-Lab's own healthcare products, and the four
 * services the same team builds for others. Content comes from
 * data/products.ts and data/services.ts; nothing here is written twice.
 */
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { getProduct, type Product } from "@/data/products";
import { services, type ServiceMotion } from "@/data/services";
import type { SceneKind } from "./motion-scene";
import { ShowcaseCard, type CardTone } from "./showcase-card";

/** A track's header: a big index, the English and Bangla names, and a link out. */
export function TrackHead({ n, title, titleBn, href, link }: { n: string; title: string; titleBn: string; href: string; link: string }) {
  return (
    <div className="story-reveal mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-white/12 pb-4">
      <div className="flex items-end gap-4">
        <span className="font-grotesk text-5xl leading-none font-extrabold text-signal-orange sm:text-6xl">{n}</span>
        <span>
          <span className="block font-grotesk text-xl font-bold text-white uppercase sm:text-2xl">{title}</span>
          <span className="block font-bengali text-sm font-semibold text-white/65">{titleBn}</span>
        </span>
      </div>
      <Link href={href} className="group inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 font-grotesk text-sm font-bold text-white ring-1 ring-white/20 transition-colors hover:bg-white hover:text-text-primary">
        {link} <Icon name="arrow_forward" className="text-[18px] transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
      </Link>
    </div>
  );
}

const PRODUCT_SCENE: Record<string, SceneKind> = { aponjon: "ecg", swasti: "voice", "smart-pharmacy": "grid" };

const caps = (p: Product) => p.capabilities.slice(0, 4).map((c) => ({ title: c.title, body: c.body }));

/** The Golden Two Hours: urgency, so the brand red, solid (CLAUDE.md §4.1). */
function GoldenTwoHours() {
  return (
    <div className="flex gap-3 rounded-2xl bg-national-crimson p-4 text-white">
      <span className="relative mt-1 flex size-3 shrink-0">
        <span className="absolute inset-0 animate-ping rounded-full bg-white/70 motion-reduce:hidden" />
        <span className="relative size-3 rounded-full bg-white" />
      </span>
      <p className="text-sm leading-relaxed">
        <span className="block font-mono text-xs font-bold tracking-wider uppercase">The Golden Two Hours</span>
        Built to catch cardio-pulmonary risk early, so a patient reaches care inside the two-hour window that most changes survival.
      </p>
    </div>
  );
}

/** Healthcare products: Aponjon wide, then SWASTI and the Smart Pharmacy side by side. */
export function ProductsShowcase() {
  const aponjon = getProduct("aponjon");
  const swasti = getProduct("swasti");
  const pharmacy = getProduct("smart-pharmacy");
  const card = (p: Product, tone: CardTone, extra?: React.ReactNode) => ({
    href: `/products/${p.slug}`,
    image: { src: p.image.src, alt: p.image.alt },
    scene: PRODUCT_SCENE[p.slug] ?? "grid",
    eyebrow: `${p.category} · ${p.stage}`,
    title: p.name,
    titleBn: p.nameBn,
    body: p.tagline,
    items: caps(p),
    cta: `Explore ${p.name}`,
    tone,
    extra,
  });
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {aponjon && (
        <div className="story-reveal lg:col-span-2">
          <ShowcaseCard {...card(aponjon, "ink", <GoldenTwoHours />)} layout="wide" priority />
        </div>
      )}
      {swasti && (
        <div id="swasti-section" className="story-reveal scroll-mt-header lg:scroll-mt-header-lg">
          <ShowcaseCard {...card(swasti, "gold")} />
        </div>
      )}
      {pharmacy && (
        <div className="story-reveal">
          <ShowcaseCard {...card(pharmacy, "green")} />
        </div>
      )}
    </div>
  );
}

const SERVICE_SCENE: Record<ServiceMotion, SceneKind> = { neural: "neural", factory: "factory", signal: "signal", code: "code" };
const SERVICE_TONES: CardTone[] = ["green", "ink", "gold", "white"];

/**
 * The four services, two by two. On the home page each card opens its
 * block on /products; on /products, where the reader already is, it goes
 * to the Kandari Profile sign-up, the one way to reach the team today.
 */
export function ServicesShowcase({ on = "home" }: { on?: "home" | "products" }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {services.map((s, i) => (
        <div key={s.id} id={`service-${s.id}`} className="story-reveal scroll-mt-header lg:scroll-mt-header-lg">
          <ShowcaseCard
            href={on === "home" ? `/products#service-${s.id}` : "/#kandari-profile"}
            image={s.image}
            scene={SERVICE_SCENE[s.motion]}
            eyebrow={`Service ${String(i + 1).padStart(2, "0")}`}
            title={s.name}
            titleBn={s.nameBn}
            body={s.pitch}
            bodyBn={s.pitchBn}
            items={s.builds}
            proof={s.proof}
            cta={on === "home" ? "See the service" : "Start a project"}
            tone={SERVICE_TONES[i % SERVICE_TONES.length]}
          />
        </div>
      ))}
    </div>
  );
}

/** The close: one solid gold band with the way to reach the team. */
export function ShowcaseCta() {
  return (
    <div className="story-reveal mt-10 flex flex-col items-start justify-between gap-5 rounded-[2rem] bg-signal-orange p-6 text-text-primary sm:p-8 lg:flex-row lg:items-center">
      <div>
        <p className="font-grotesk text-2xl font-bold uppercase sm:text-3xl">Have a problem worth solving?</p>
        <p className="mt-1 font-bengali text-[15px] font-semibold text-text-primary/80">কারখানা, অফিস, খামার বা অ্যাপ — সমস্যাটা বলুন, আমরা সমাধান বানাব।</p>
      </div>
      <Link href="/#kandari-profile" className="inline-flex h-13 shrink-0 items-center gap-2 rounded-2xl bg-text-primary px-6 font-grotesk text-sm font-bold text-white uppercase transition-[translate,background-color] duration-200 hover:-translate-y-0.5 hover:bg-black motion-reduce:hover:translate-y-0">
        Join Kandari Profile <Icon name="arrow_forward" className="text-[18px] text-signal-orange" />
      </Link>
    </div>
  );
}
