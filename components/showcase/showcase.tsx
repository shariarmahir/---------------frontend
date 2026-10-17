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
import { LabelText } from "@/components/brand/kandari-wordmark";
import { LABEL_TEXT } from "@/data/logo-text";
import { cn } from "@/lib/utils";
import { PosterGrid, type PosterFace, type PosterItem } from "./poster-grid";
import { ShowcaseCard, type CardTone } from "./showcase-card";

/** The outlined pill that leads from a section to its full page. */
export function TrackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-5 font-grotesk text-sm font-bold text-signal-orange ring-1 ring-signal-orange/45",
        "transition-colors duration-200 hover:bg-signal-orange hover:text-text-primary",
        "focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none",
      )}
    >
      {children} <Icon name="arrow_forward" className="text-[18px] transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
    </Link>
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

/**
 * The home page's product posters: the three healthcare products, each
 * photo with its own motion layer, then শিক্ষিতদের মিডিয়া, whose picture
 * plays a short film of its core loop. Poster copy is short on purpose: the
 * face carries a name and one line, the panel the rest.
 */
const PRODUCT_POSTERS: Record<string, Pick<PosterItem, "face" | "tagline" | "scene"> & { position?: string }> = {
  aponjon: { face: "navy", tagline: "Catch the silent warning early", scene: "ecg", position: "62% 50%" },
  swasti: { face: "gold", tagline: "A doctor's first opinion, in Bangla", scene: "voice", position: "50% 22%" },
  "smart-pharmacy": { face: "ink", tagline: "The village drug shop, now a clinic", scene: "grid", position: "50% 45%" },
};

function productPosters(): PosterItem[] {
  const items: PosterItem[] = ["aponjon", "swasti", "smart-pharmacy"].flatMap((slug) => {
    const p = getProduct(slug);
    const look = PRODUCT_POSTERS[slug];
    if (!p || !look) return [];
    return [
      {
        id: p.slug,
        anchorId: p.slug === "swasti" ? "swasti-section" : undefined,
        face: look.face,
        title: p.name.toUpperCase(),
        tagline: look.tagline,
        name: `${p.name} · ${p.nameBn}`,
        nameText: p.name,
        pitch: p.tagline,
        href: `/products/${p.slug}`,
        image: { src: p.image.src, alt: p.image.alt, position: look.position },
        scene: look.scene,
        note: `${p.category} · ${p.stage}`,
      },
    ];
  });
  // শিক্ষিতদের মিডিয়া — the skill-first social platform (CLAUDE.md §1), a
  // product of its own beside the healthcare line.
  items.push({
    id: "media",
    face: "navy",
    // The wordmark never wraps, so it scales with the card's width (the card body is a size container).
    title: <LabelText text={LABEL_TEXT.media} className="text-[min(1.75rem,11cqw)] leading-none" />,
    tagline: "Post a skill. Get verified. Get hired.",
    name: <LabelText text={LABEL_TEXT.media} className="leading-none" />,
    nameText: "শিক্ষিতদের মিডিয়া",
    pitch: "The skill-first social platform: show what you can do, rate yourself, let the community verify it, and get hired at fair pay.",
    href: "/media",
    scene: "media-reel",
    note: "Members only · Prioritize your joy.",
  });
  return items;
}

/** Healthcare products: Aponjon, SWASTI and the Smart Pharmacy, three cards of one size. */
export function ProductsShowcase({ poster }: { poster?: boolean }) {
  if (poster) return <PosterGrid label="Products" items={productPosters()} />;
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
    poster,
  });
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {aponjon && (
        <div className="story-reveal">
          <ShowcaseCard {...card(aponjon, "ink", poster ? undefined : <GoldenTwoHours />)} priority />
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
 * The four services, four across on wide screens. On the home page each card opens its
 * block on /products; on /products, where the reader already is, it goes
 * to the Kandari Profile sign-up, the one way to reach the team today.
 */
export function ServicesShowcase({ on = "home", poster }: { on?: "home" | "products"; poster?: boolean }) {
  // The home page's poster grid, in the palette's three fields (no two neighbours alike).
  if (poster) {
    const faces: PosterFace[] = ["ink", "gold", "navy", "gold"];
    return (
      <PosterGrid
        label="Services"
        items={services.map((s, i) => ({
          id: s.id,
          anchorId: `service-${s.id}`,
          face: faces[i % faces.length],
          title: s.poster.title,
          tagline: s.poster.tagline,
          name: s.name,
          nameText: s.name,
          pitch: s.pitch,
          href: on === "home" ? `/products#service-${s.id}` : "/#kandari-profile",
          image: s.image,
          note: s.image.credit,
        }))}
      />
    );
  }
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
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
            poster={poster}
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
      <Link
        href="/#kandari-profile"
        className="inline-flex h-13 shrink-0 items-center gap-2 rounded-2xl bg-text-primary px-6 font-grotesk text-sm font-bold text-white uppercase transition-[translate,background-color] duration-200 hover:-translate-y-0.5 hover:bg-black motion-reduce:hover:translate-y-0"
      >
        Join Kandari Profile <Icon name="arrow_forward" className="text-[18px] text-signal-orange" />
      </Link>
    </div>
  );
}
