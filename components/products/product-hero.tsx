import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { productAccents, type Product } from "@/data/products";
import { cn } from "@/lib/utils";

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

export function ProductHero({ product }: { product: Product }) {
  const accent = productAccents[product.accent];
  const portrait = product.image.ratio === "3/4";

  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-linear-to-b from-mint-subtle to-white">
      <div className="mx-auto max-w-7xl px-gutter-x pt-8 pb-10 lg:pt-12 lg:pb-14">
        {/* Breadcrumb. */}
        <nav aria-label="Breadcrumb" className="mb-6 font-mono text-xs text-slate-500">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-bd-green hover:underline">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href="/products" className="hover:text-bd-green hover:underline">
                Products
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="font-semibold text-slate-700">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="space-y-5 lg:col-span-7">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-full border px-3 py-1 font-mono text-[11px] font-bold tracking-wide uppercase",
                  accent.border,
                  accent.soft,
                  accent.text,
                )}
              >
                {product.category}
              </span>
              {/* Stage is stated plainly: none of these products ship yet. */}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 font-mono text-[11px] font-semibold text-slate-600">
                <span className="size-1.5 animate-pulse rounded-full bg-signal-orange" />
                {product.stage}
              </span>
            </div>

            <h1 className="font-grotesk text-4xl leading-[1.05] font-bold tracking-tight text-text-primary uppercase sm:text-5xl lg:text-6xl">
              {product.name}
              <span className={cn("mt-1 block font-bengali normal-case", accent.text)}>
                {product.nameBn}
              </span>
            </h1>

            <p className="font-grotesk text-xl font-semibold text-text-primary sm:text-2xl">
              {product.tagline}
            </p>
            <p className="max-w-xl font-sans text-base leading-relaxed text-text-secondary">
              {product.summary}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/#kandari-profile"
                className="inline-flex items-center gap-2 rounded-xl bg-signal-orange px-6 py-3.5 font-grotesk text-sm font-bold text-white uppercase shadow-glow-orange transition-all hover:-translate-y-0.5 hover:bg-bdorange-600 focus-visible:ring-3 focus-visible:ring-signal-orange/40 focus-visible:outline-none"
              >
                <Icon name="notifications" className="text-lg" />
                Get early access
              </Link>
              <a
                href="#research"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-bd-green px-6 py-3 font-grotesk text-sm font-bold text-bd-green uppercase transition-all hover:-translate-y-0.5 hover:bg-bd-green hover:text-white focus-visible:ring-3 focus-visible:ring-bd-green/30 focus-visible:outline-none"
              >
                <Icon name="science" className="text-lg" />
                See the research
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div
              className={cn(
                "group relative mx-auto overflow-hidden rounded-3xl shadow-elevated",
                portrait ? "aspect-3/4 max-w-[360px]" : "aspect-4/3",
              )}
            >
              <Image
                src={product.image.src}
                alt={product.image.alt}
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
                quality={90}
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
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
                  className="inline-flex rounded-full border border-slate-200 bg-white px-3.5 py-1.5 font-bengali text-xs font-semibold whitespace-nowrap text-slate-700 shadow-2xs transition-colors hover:border-bd-green hover:text-bd-green focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
