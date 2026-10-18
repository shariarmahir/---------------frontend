import Image from "next/image";
import Link from "next/link";
import { FilmFrame, type FilmId } from "@/components/films/motion-film";
import { apps } from "@/data/apps";
import { products } from "@/data/products";
import { services } from "@/data/services";
import { cn } from "@/lib/utils";

export interface CatalogItem {
  href: string;
  name: string;
  body: string;
  /** `position` picks the part of the picture the crop keeps, e.g. "left top" for a screenshot. */
  image?: { src: string; alt: string; position?: string };
  /** A 3D film in place of the photo. */
  film?: FilmId;
  /** Photo credit, kept on the picture as its tooltip rather than as a line on the card. */
  credit?: string;
}

const healthItems: CatalogItem[] = products.map((p) => ({
  href: `/products/${p.slug}`,
  name: p.name,
  body: p.tagline,
  image: { src: p.image.src, alt: p.image.alt },
}));

/**
 * শিক্ষিতদের মিডিয়া, the skill-first social platform: a product of its own
 * beside the health line (CLAUDE.md §1), as on the home page. It has no
 * product shot, so a Nakshi Kantha stands for "show what you can make".
 */
const media = apps.find((a) => a.id === "media");
const mediaItem: CatalogItem[] = media
  ? [
      {
        href: media.action.href,
        name: media.name,
        body: media.tagline,
        image: { src: "/media/kantha-full.webp", alt: "সোনারগাঁও লোকশিল্প জাদুঘরে প্রদর্শিত একটি নকশিকাঁথা" },
        credit: "ছবি: Nahid Sultan, CC BY-SA 4.0, উইকিমিডিয়া কমন্স",
      },
    ]
  : [];

/** Every Kandari-Lab product: the three for health, then the media platform. */
export const productItems: CatalogItem[] = [...healthItems, ...mediaItem];

export const serviceItems: CatalogItem[] = services.map((s) => ({
  href: `/services/${s.id}`,
  name: s.name,
  body: s.pitch,
  film: s.film,
}));

const EASE = "duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";

/**
 * One product or service as a single navy card: the photo, or a 3D film,
 * flush along the top, then the name in gold and its promise. The whole card is the link,
 * so it carries no arrow; under the pointer it lifts, the photo eases in
 * and the name takes a gold underline.
 */
export function CatalogCard({
  item,
  sizes,
  ratio = "landscape",
  className,
}: {
  item: CatalogItem;
  sizes: string;
  /** The photo's shape: 4:3, or square where the shelf wants it taller. */
  ratio?: "landscape" | "square";
  className?: string;
}) {
  return (
    <Link
      href={item.href}
      className={cn(
        "group flex flex-col overflow-hidden rounded-3xl bg-bdnavy-900 ring-1 ring-white/12 transition-[translate,box-shadow] hover:-translate-y-1.5 hover:shadow-tile-lift focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none motion-reduce:hover:translate-y-0",
        EASE,
        className,
      )}
    >
      <div title={item.credit} className={cn("relative overflow-hidden bg-text-primary", ratio === "square" ? "aspect-square" : "aspect-4/3")}>
        {item.film ? (
          <FilmFrame film={item.film} className="absolute inset-0" />
        ) : item.image ? (
          <Image
            src={item.image.src}
            alt={item.image.alt}
            fill
            sizes={sizes}
            style={item.image.position ? { objectPosition: item.image.position } : undefined}
            className={cn("object-cover transition-[scale] group-hover:scale-105 motion-reduce:group-hover:scale-100", EASE)}
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-6">
        <h3 className="font-grotesk text-xl font-bold text-signal-orange decoration-2 underline-offset-4 group-hover:underline">{item.name}</h3>
        <p className="font-sans text-sm leading-relaxed text-white/80">{item.body}</p>
      </div>
    </Link>
  );
}
