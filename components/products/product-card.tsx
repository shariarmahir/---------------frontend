import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import type { Product } from "@/data/products";
import { cn } from "@/lib/utils";

/**
 * Solid colour fields, the home page's Pixel-Map palette in its order:
 * green, gold, orange, then ink. Ink text on gold and orange, white on
 * green and ink (white on gold or orange would fall under 4.5:1). Ink
 * cards carry a faint ring so they keep an edge on the black ground.
 */
const SURFACES = [
  { card: "bg-bd-green text-white", pill: "bg-signal-orange text-text-primary", glow: "var(--color-bd-green)" },
  { card: "bg-signal-orange text-text-primary", pill: "bg-text-primary text-signal-orange", glow: "var(--color-signal-orange)" },
  { card: "bg-bdorange-600 text-text-primary", pill: "bg-text-primary text-signal-orange", glow: "var(--color-bdorange-600)" },
  { card: "bg-text-primary text-white ring-1 ring-white/12", pill: "bg-signal-orange text-text-primary", glow: "var(--color-bdgreen-500)" },
];

/**
 * The one product card (CLAUDE.md §8) — used for SWASTI, Aponjon, the
 * Smart Pharmacy and any future sector's product. It reads only from the
 * `Product` shape, so nothing here is healthcare-specific; `index` only
 * picks which colour field the card sits on.
 */
export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const tone = SURFACES[index % SURFACES.length];
  const lead = product.stats[0];

  return (
    <Link
      href={`/products/${product.slug}`}
      style={{ "--glow": tone.glow } as CSSProperties}
      className={cn(
        "group flex h-full w-full flex-col overflow-hidden rounded-3xl shadow-sm",
        "[-webkit-tap-highlight-color:transparent] touch-manipulation transition-[translate,scale,rotate,transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:-translate-y-2 hover:shadow-[0_28px_48px_-22px_var(--glow)] active:-translate-y-2 active:scale-[0.98] active:shadow-[0_28px_48px_-22px_var(--glow)] active:duration-150",
        "focus-visible:ring-3 focus-visible:ring-white focus-visible:outline-none",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:translate-y-0 motion-reduce:active:scale-100",
        tone.card,
      )}
    >
      <div className="relative aspect-4/3 overflow-hidden">
        <Image
          src={product.image.src}
          alt={product.image.alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05] group-active:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <span className={cn("absolute top-3 left-3 rounded-full px-3 py-1 font-mono text-[10px] font-bold tracking-wide uppercase shadow-sm", tone.pill)}>
          {product.stage}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <span className="font-mono text-[11px] font-bold tracking-wide uppercase opacity-80">{product.category}</span>
        <h3 className="font-grotesk text-2xl font-bold uppercase">
          {product.name} <span className="font-bengali normal-case">{product.nameBn}</span>
        </h3>
        <p className="font-sans text-sm leading-relaxed">{product.tagline}</p>

        {/* One sourced number that frames why the product exists. */}
        <div className="mt-auto rounded-xl bg-text-primary p-3 text-white ring-1 ring-white/12">
          <span className="font-grotesk text-2xl font-bold text-signal-orange tabular-nums">{lead.value}</span>
          <p className="font-sans text-xs text-white/80">
            {lead.label} <span className="text-white/60">— {lead.source.publisher}, {lead.source.year}</span>
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 pt-1 font-grotesk text-sm font-bold uppercase">
          Explore {product.name}
          <Icon name="arrow_forward" className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
        </span>
      </div>
    </Link>
  );
}
