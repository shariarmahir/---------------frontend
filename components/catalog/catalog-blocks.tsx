import Image from "next/image";
import type { ReactNode } from "react";
import { FilmFrame, type FilmId } from "@/components/films/motion-film";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/** Photo size in the hero's art, by how many share the row. */
const ART_SIZE = ["size-56 xl:size-64", "size-44 xl:size-52", "size-36 xl:size-44", "size-32 xl:size-40"];

/**
 * The opening band of every catalogue page, after banglalink.net's offer
 * pages: a short navy band under the header, the title and one line on the
 * left; on the right, round photos or 3D films in front of a cobalt disc
 * that sits off-centre behind them. Below md the art is dropped and the
 * band is text alone.
 */
export function PageHero({
  title,
  lead,
  leadLang,
  art,
  children,
}: {
  title: ReactNode;
  lead: string;
  leadLang?: "bn";
  art: ({ src: string; alt: string } | { film: FilmId })[];
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-t border-white/10 bg-bdnavy-900">
      <div className="mx-auto grid min-h-72 max-w-7xl items-center gap-8 px-gutter-x py-10 md:grid-cols-[minmax(0,1fr)_auto] lg:min-h-80">
        <div className="flex flex-col items-start gap-4">
          <h1 className="font-grotesk text-4xl leading-[1.1] font-bold tracking-tight text-balance text-white sm:text-5xl">{title}</h1>
          <p lang={leadLang} className={cn("max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg", leadLang === "bn" ? "font-bengali" : "font-sans")}>
            {lead}
          </p>
          {children ? <div className="mt-2 flex flex-wrap gap-3">{children}</div> : null}
        </div>

        <div aria-hidden className="relative hidden items-center justify-end md:flex">
          <span className="absolute top-1/2 right-0 size-52 -translate-y-1/2 rounded-full bg-cobalt xl:size-60" />
          <div className="relative flex -space-x-10 pr-12">
            {art.map((item, i) => (
              <div
                key={"film" in item ? item.film : item.src}
                style={{ animationDelay: `${i * 90}ms` }}
                className={cn("catalog-fade relative shrink-0 overflow-hidden rounded-full bg-text-primary ring-4 ring-bdnavy-900", ART_SIZE[Math.min(art.length, 4) - 1])}
              >
                {"film" in item ? (
                  <FilmFrame film={item.film} className="absolute inset-0" />
                ) : (
                  <Image src={item.src} alt="" fill priority sizes="256px" className="object-cover" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * A full-width cobalt band of short promises, drifting slowly sideways.
 * The list is drawn twice so the loop has no seam; the copy is hidden
 * from screen readers, and under reduced motion it is dropped and the
 * first list wraps in place.
 */
export function FeatureStrip({ items, label }: { items: { icon: string; label: string }[]; label: string }) {
  const row = (copy: boolean) => (
    <ul aria-hidden={copy || undefined} className="flex shrink-0 items-center gap-12 pr-12">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-3 font-grotesk text-base font-bold whitespace-nowrap text-white">
          <Icon name={item.icon} className="text-2xl text-signal-orange" />
          {item.label}
        </li>
      ))}
    </ul>
  );

  return (
    <section aria-label={label} className="overflow-hidden bg-cobalt py-4">
      <div className="catalog-marquee flex w-max">
        {row(false)}
        {row(true)}
      </div>
    </section>
  );
}
