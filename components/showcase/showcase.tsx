/*
 * The two halves of the products & services showcase, shared by the home
 * page and /products: Kandari-Lab's own healthcare products, and the four
 * services the same team builds for others. Content comes from
 * data/products.ts and data/services.ts; nothing here is written twice.
 */
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { btn } from "@/components/ui/section-kit";
import { getProduct, type Product } from "@/data/products";
import { services, type ServiceMotion } from "@/data/services";
import type { SceneKind } from "./motion-scene";
import { LabelText } from "@/components/brand/kandari-wordmark";
import { LABEL_TEXT } from "@/data/logo-text";
import { cn } from "@/lib/utils";
import { PosterGrid, type PosterFace, type PosterItem } from "./poster-grid";
import { ShowcaseCard, type CardTone } from "./showcase-card";

/** The button that leads from a section to its full page. */
export function TrackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    // The kit's gold outline on a solid navy fill (it stands on the black ground), filling gold when pointed at.
    // On a phone only the arrow shows (a 48px square level with the title); the words stay for screen readers.
    <Link href={href} className={cn(btn.goldOutline, "group shrink-0 bg-bdnavy-900 max-sm:w-12 max-sm:px-0")}>
      <span className="max-sm:sr-only">{children}</span> <Icon name="arrow_forward" className="text-lg transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
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
        <span className="block font-sans tabular-nums text-xs font-bold tracking-wider">The Golden Two Hours</span>
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
  swasti: { face: "cobalt", tagline: "A doctor's first opinion, in Bangla", scene: "voice", position: "50% 22%" },
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
        title: p.name,
        tagline: look.tagline,
        nameText: p.name,
        href: `/products/${p.slug}`,
        image: { src: p.image.src, alt: p.image.alt, position: look.position },
        scene: look.scene,
      },
    ];
  });
  // শিক্ষিতদের মিডিয়া — the skill-first social platform (CLAUDE.md §1), a
  // product of its own beside the healthcare line.
  items.push({
    id: "media",
    face: "navy",
    // The wordmark never wraps, so it scales with the card's width (the card body is a size
    // container): 24px wherever the card is wide enough, as on desktop, smaller on a phone's half-width card.
    title: <LabelText text={LABEL_TEXT.media} className="text-[min(1.5rem,13.5cqi)] leading-none" />,
    tagline: "Post a skill. Get verified. Get hired.",
    nameText: "শিক্ষিতদের মিডিয়া",
    href: "/media",
    scene: "media-reel",
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
 * service page, its picture the service's 3D film; on /products it goes
 * to the Kandari Profile sign-up, the one way to reach the team today.
 */
/** Each service's animated icon on the home page's cards (public/lordicon), with its still stand-in. */
const SERVICE_ICON: Record<string, { icon: string; fallback: string }> = {
  ai: { icon: "magic-wand", fallback: "smart_toy" },
  automation: { icon: "three-arrows-rotate", fallback: "precision_manufacturing" },
  iot: { icon: "internet-of-things", fallback: "sensors" },
  development: { icon: "html-code", fallback: "code" },
};

export function ServicesShowcase({ on = "home", poster }: { on?: "home" | "products"; poster?: boolean }) {
  // The home page's poster grid, in the palette's three fields (no two neighbours alike).
  if (poster) {
    const faces: PosterFace[] = ["ink", "cobalt", "navy", "cobalt"];
    return (
      <PosterGrid
        label="Services"
        items={services.map((s, i) => ({
          id: s.id,
          anchorId: `service-${s.id}`,
          face: faces[i % faces.length],
          title: s.poster.title,
          tagline: s.poster.tagline,
          nameText: s.name,
          href: on === "home" ? `/services/${s.id}` : "/#kandari-profile",
          iconScene: SERVICE_ICON[s.id],
        }))}
      />
    );
  }
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {services.map((s, i) => (
        <div key={s.id} id={`service-${s.id}`} className="story-reveal scroll-mt-header lg:scroll-mt-header-lg">
          <ShowcaseCard
            href={on === "home" ? `/services/${s.id}` : "/#kandari-profile"}
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

/** The close: one solid cobalt band with the way to reach the team. */
export function ShowcaseCta() {
  return (
    <div className="story-reveal mt-10 flex flex-col items-start justify-between gap-5 rounded-3xl bg-cobalt p-6 text-white ring-1 ring-white/12 sm:p-8 lg:flex-row lg:items-center">
      <div>
        <p className="font-grotesk text-2xl font-bold text-signal-orange sm:text-3xl">Have a problem worth solving?</p>
        <p className="mt-1 font-bengali text-sm font-semibold text-white/80">কারখানা, অফিস, খামার বা অ্যাপ — সমস্যাটা বলুন, আমরা সমাধান বানাব।</p>
      </div>
      <Link href="/#kandari-profile" className={cn(btn.gold, "shrink-0")}>
        Join Kandari Profile <Icon name="arrow_forward" className="text-lg" />
      </Link>
    </div>
  );
}
