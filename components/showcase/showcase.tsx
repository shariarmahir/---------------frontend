/*
 * The two halves of the products & services showcase, shared by the home
 * page and /products: Kandari-Lab's own healthcare products, and the four
 * services the same team builds for others. Content comes from
 * data/products.ts and data/services.ts; nothing here is written twice.
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { btn } from "@/components/ui/section-kit";
import { getProduct, type Product } from "@/data/products";
import { services, type ServiceMotion } from "@/data/services";
import type { SceneKind } from "./motion-scene";
import { LabelText } from "@/components/brand/kandari-wordmark";
import { LABEL_TEXT } from "@/data/logo-text";
import { cn } from "@/lib/utils";
import type { PosterLive } from "./card-live";
import { PosterGrid, type PosterFace, type PosterItem } from "./poster-grid";
import type { ServiceSceneKind } from "./service-scenes";
import { ShowcaseCard, type CardTone } from "./showcase-card";

/** The button that leads from a section to its full page. */
export function TrackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    // The kit's gold outline on a solid navy fill (it stands on the black ground), filling gold when pointed at.
    // On a phone only the arrow shows (a 48px square level with the title); the words stay for screen readers.
    <Link href={href} className={cn(btn.goldOutline, "group shrink-0 bg-bdnavy-900 max-sm:w-12 max-sm:px-0")}>
      <span className="max-sm:sr-only">{children}</span>{" "}
      <Icon name="arrow_forward" className="text-lg transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
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
 * photo with its own motion layer, then চেতনা, whose picture
 * plays a short film of its core loop. Poster copy is short on purpose: the
 * face carries only the name and its arrow over the full film (Mahir, 2026-10-30), the page the rest.
 */
const PRODUCT_POSTERS: Record<string, Pick<PosterItem, "face" | "tagline" | "scene" | "live"> & { position?: string; title?: ReactNode }> = {
  aponjon: {
    face: "navy",
    tagline: "Catch the silent warning early",
    scene: "ecg",
    position: "62% 50%",
    // Mahir's own 3D film (2026-10-29): the wearable on a wrist, lighting up with holographic vitals;
    // 1280 x 720, 8 s, served faststart (lossless), master in media-src/device-master.mp4. Drawn at
    // 2.3 x the frame's width, it covers the card on the device, which keeps to the film's middle.
    live: { film: "/services/device.mp4", still: "/services/device-poster.webp", ratio: 1280 / 720, fit: "frame", zoom: 2.3 },
  },
  swasti: {
    face: "cobalt",
    tagline: "A doctor's first opinion, in Bangla",
    scene: "voice",
    position: "50% 22%",
    // Mahir's own 3D film of the app (2026-10-29, replacing a Pinterest pin the same day): the My
    // Wellness screen, a turning phone, a glass health dashboard; 720 x 1280, 8 s, served faststart
    // (lossless), master in media-src/app-master.mp4. Upright, so it covers the card at its width
    // (a little over, for the sway) and only its top and bottom fall outside.
    live: { film: "/services/app.mp4", still: "/services/app-poster.webp", ratio: 720 / 1280, fit: "frame", zoom: 1.04 },
  },
  "smart-pharmacy": {
    face: "ink",
    tagline: "The village drug shop, now a clinic",
    scene: "grid",
    position: "50% 45%",
    // Its name on the card, in Bangla (Mahir, 2026-10-30): "primary health care and solutions centre".
    title: (
      <span lang="bn" className="block font-bengali text-lg leading-snug sm:text-xl">
        প্রাথমিক স্বাস্থ্য চিকিৎসা ও সমাধান কেন্দ্র
      </span>
    ),
    // Mahir's own 3D film (2026-10-29, replacing his kiosk film of the same day): a pharmacist and an
    // elderly villager at a touch kiosk in the চেতনা smart-pharmacy hub; 1280 x 720, 8 s, served
    // faststart (lossless), master in media-src/pharmacist-master.mp4. Drawn at 2.3 x the frame's
    // width, it covers the card on the two of them, who keep to the film's middle.
    live: { film: "/services/pharmacist.mp4", still: "/services/pharmacist-poster.webp", ratio: 1280 / 720, fit: "frame", zoom: 2.3 },
  },
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
        title: look.title ?? p.name,
        tagline: look.tagline,
        nameText: p.name,
        href: `/products/${p.slug}`,
        // A card with its own film plays that in place of the product photo and its motion layer.
        ...(look.live ? { live: look.live } : { image: { src: p.image.src, alt: p.image.alt, position: look.position }, scene: look.scene }),
      },
    ];
  });
  // চেতনা — the skill-first social platform (CLAUDE.md §1), a
  // product of its own beside the healthcare line.
  items.push({
    id: "media",
    face: "navy",
    // Bangla needs the taller line, or the vowel signs' loops are cut.
    title: <LabelText text={LABEL_TEXT.media} className="text-xl leading-snug sm:text-2xl" />,
    tagline: "Post a skill. Get verified. Get hired.",
    nameText: "চেতনা",
    href: "/media",
    // Mahir's own 3D film (2026-10-29), in place of the core-loop reel: people sharing their skills,
    // a flute player, a saree weaver with her sales, a city linked up; 1280 x 720, 8 s, served
    // faststart (lossless), master in media-src/social-master.mp4. Its people stand left of centre,
    // so the film is centred at 42% of its width, drawn at 2.3 x the frame's width to cover the card.
    live: { film: "/services/social.mp4", still: "/services/social-poster.webp", ratio: 1280 / 720, fit: "frame", zoom: 2.3, focusX: 42 },
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
/** Each service's motion graphic on the home page's cards (service-scenes.tsx). */
const SERVICE_GRAPHIC: Record<string, ServiceSceneKind> = { ai: "brain", automation: "factory", iot: "robot", development: "interface" };

/**
 * Each service card's 3D film (card-live.tsx), from Mahir's Pinterest pins (2026-10-29): AI
 * Agents 1004513891901845831, Automation 479985272806394993, Smart IoT 1104367139852946423 (a floating robot; replaced 127578601938104776),
 * Development 323625923239494423 (a turning cube of app windows; replaced 551761391871257750 the
 * same day). Every pin is a film inside a story pin (the top-level
 * `is_video` says no); these are Pinterest's largest MP4s and their first frames.
 */
const SERVICE_LIVE: Record<string, PosterLive> = {
  ai: {
    film: "https://v1.pinimg.com/videos/iht/expMp4/25/a2/06/25a2063496b6ef0dd4b25979f01a0853_720w.mp4",
    still: "https://i.pinimg.com/videos/thumbnails/originals/25/a2/06/25a2063496b6ef0dd4b25979f01a0853.0000000.jpg",
    ratio: 736 / 414,
    fit: "subject",
    position: "57% 50%",
    at: "50% 56%",
  },
  automation: {
    film: "https://v1.pinimg.com/videos/mc/720p/8e/c9/6b/8ec96b86e75b58b0059d35b479e4bcfe.mp4",
    still: "https://i.pinimg.com/videos/thumbnails/originals/8e/c9/6b/8ec96b86e75b58b0059d35b479e4bcfe.0000000.jpg",
    ratio: 1,
    fit: "frame",
    zoom: 1.12,
  },
  iot: {
    film: "https://v1.pinimg.com/videos/mc/720p/44/17/da/4417da43e61fb4ef3fd13917fd21a505.mp4",
    still: "https://i.pinimg.com/videos/thumbnails/originals/44/17/da/4417da43e61fb4ef3fd13917fd21a505.0000000.jpg",
    ratio: 800 / 600,
    fit: "frame",
    // The robot keeps to the middle 40% of the film, whose ground changes colour as it plays:
    // drawn at 1.75 x the frame's width, the film covers the card's height and the robot stays whole.
    zoom: 1.75,
  },
  development: {
    film: "https://v1.pinimg.com/videos/mc/720p/9a/20/71/9a2071b6fc630dacb2fe9f040390577d.mp4",
    still: "https://i.pinimg.com/videos/thumbnails/originals/9a/20/71/9a2071b6fc630dacb2fe9f040390577d.0000000.jpg",
    ratio: 1280 / 960,
    fit: "frame",
    // Drawn at 1.75 x the frame's width, the film covers the card's height (as the robot's does) and
    // the cube, in the middle 60% of the film, fills the card; only the film's black sides are cut.
    zoom: 1.75,
    // The film's own black, behind it where the sway parts the layers.
    ground: "#000",
  },
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
          serviceScene: SERVICE_GRAPHIC[s.id],
          live: SERVICE_LIVE[s.id],
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
