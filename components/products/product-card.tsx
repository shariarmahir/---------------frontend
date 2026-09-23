import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { productAccents, type Product } from "@/data/products";

/**
 * The one product card (CLAUDE.md §8) — used for SWASTI, Aponjon, the
 * Smart Pharmacy and any future sector's product. It reads only from the
 * `Product` shape, so nothing here is healthcare-specific.
 */
export function ProductCard({ product }: { product: Product }) {
  const accent = productAccents[product.accent];
  const lead = product.stats[0];

  return (
    <Link
      href={`/products/${product.slug}`}
      className="glass-card group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm focus-visible:ring-3 focus-visible:ring-signal-orange/50 focus-visible:outline-none"
      style={{ "--card-accent": accent.cssVar } as React.CSSProperties}
    >
      <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
        <Image
          src={product.image.src}
          alt={product.image.alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 font-mono text-[10px] font-bold tracking-wide text-slate-700 uppercase shadow-sm">
          {product.stage}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <span className={`font-mono text-[11px] font-bold tracking-wide uppercase ${accent.text}`}>
          {product.category}
        </span>
        <h3 className="font-grotesk text-2xl font-bold text-text-primary uppercase">
          {product.name} <span className={`font-bengali normal-case ${accent.text}`}>{product.nameBn}</span>
        </h3>
        <p className="font-sans text-sm leading-relaxed text-text-secondary">{product.tagline}</p>

        {/* One sourced number that frames why the product exists. */}
        <div className={`mt-auto rounded-xl border p-3 ${accent.border} ${accent.soft}`}>
          <span className={`font-grotesk text-2xl font-bold tabular-nums ${accent.text}`}>{lead.value}</span>
          <p className="font-sans text-xs text-text-secondary">
            {lead.label} <span className="text-text-muted">— {lead.source.publisher}, {lead.source.year}</span>
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 pt-1 font-grotesk text-sm font-bold text-text-primary uppercase">
          Explore {product.name}
          <Icon name="arrow_forward" className={`transition-transform group-hover:translate-x-1 motion-reduce:transition-none ${accent.text}`} />
        </span>
      </div>
    </Link>
  );
}
