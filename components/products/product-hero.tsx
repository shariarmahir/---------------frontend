import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { SignalSeam, btn } from "@/components/ui/section-kit";
import type { Product } from "@/data/products";
import { cn } from "@/lib/utils";
import { ProductArt } from "./product-art";

/** In-page anchors, in page order. Each id is rendered by a product section. */
const JUMP_LINKS = [
  { href: "#problem", label: "সমস্যা" },
  { href: "#core", label: "মূল সমস্যা ও সমাধান" },
  { href: "#solution", label: "সমাধান" },
  { href: "#situations", label: "বাস্তব পরিস্থিতি" },
  { href: "#videos", label: "ভিডিও" },
  { href: "#benefits", label: "বাংলাদেশের লাভ" },
  { href: "#growth", label: "প্রবৃদ্ধি" },
  { href: "#research", label: "গবেষণা" },
];

/**
 * Product hero, in the home page's language: an ink band with the product's
 * looping motion graphic running behind the copy, a gold primary action, the
 * photograph unframed on the right and a gold pulse on the seam below.
 */
export function ProductHero({ product }: { product: Product }) {
  const portrait = product.image.ratio === "3/4";

  return (
    <section className="relative isolate overflow-hidden bg-text-primary text-white">
      {/* Motion graphic behind the copy (decorative). */}
      <ProductArt
        slug={product.slug}
        className="absolute -bottom-2 left-0 -z-10 w-[130%] max-w-none text-signal-orange opacity-[0.16] sm:w-[90%] lg:w-[62%]"
      />

      <div className="mx-auto max-w-7xl px-gutter-x pt-8 pb-10 lg:pt-12 lg:pb-14">
        {/* Breadcrumb. */}
        <nav aria-label="Breadcrumb" className="mb-6 font-mono text-xs text-white/65">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-signal-orange hover:underline">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href="/products" className="hover:text-signal-orange hover:underline">
                Products
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="font-semibold text-white">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="story-reveal space-y-5 lg:col-span-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-signal-orange px-3 py-1 font-mono text-[11px] font-bold tracking-wide text-text-primary uppercase">
                {product.category}
              </span>
              {/* Stage is stated plainly: none of these products ship yet. */}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-mono text-[11px] font-semibold text-white/85 ring-1 ring-white/20">
                <span className="size-1.5 animate-pulse rounded-full bg-signal-orange motion-reduce:animate-none" />
                {product.stage}
              </span>
            </div>

            <h1 className="font-grotesk text-4xl leading-[1.05] font-bold tracking-tight text-white uppercase sm:text-5xl lg:text-6xl">
              {product.name}
              <span className="mt-1 block font-bengali text-signal-orange normal-case">{product.nameBn}</span>
            </h1>

            <p className="font-grotesk text-xl font-semibold text-white sm:text-2xl">{product.tagline}</p>
            <p className="max-w-xl font-sans text-base leading-relaxed text-white/80">{product.summary}</p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/#kandari-profile" className={btn.gold}>
                <Icon name="notifications" className="text-lg" />
                Get early access
              </Link>
              <a href="#research" className={btn.ghost}>
                <Icon name="science" className="text-lg" />
                See the research
              </a>
            </div>
          </div>

          <div className="story-reveal lg:col-span-5">
            <div
              className={cn(
                "group relative mx-auto overflow-hidden rounded-3xl shadow-[0_30px_60px_-28px_rgb(0_0_0/0.8)]",
                "transition-[translate,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                portrait ? "aspect-3/4 max-w-90" : "aspect-4/3",
              )}
            >
              <Image
                src={product.image.src}
                alt={product.image.alt}
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
                quality={90}
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            </div>
          </div>
        </div>

        {/* Jump links. Scrolls sideways on phones rather than wrapping into
            a tall block above the content. */}
        <nav aria-label="On this page" className="mt-10">
          <ul className="no-scrollbar -mx-gutter-x flex gap-2 overflow-x-auto px-gutter-x pb-1">
            {JUMP_LINKS.map((link) => (
              <li key={link.href} className="shrink-0">
                <a
                  href={link.href}
                  className="inline-flex rounded-full bg-white/10 px-3.5 py-1.5 font-bengali text-xs font-semibold whitespace-nowrap text-white ring-1 ring-white/20 transition-[background-color,color,scale] duration-200 hover:bg-signal-orange hover:text-text-primary hover:ring-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none active:scale-95"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <SignalSeam className="bottom-0" />
    </section>
  );
}
