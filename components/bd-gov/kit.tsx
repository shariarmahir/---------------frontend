import Image from "next/image";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { CardIcon } from "@/components/ui/card-icon";
import { Icon } from "@/components/ui/icon";
import type { GovCard, GovLink, Photo } from "@/data/bd-gov";
import { cn } from "@/lib/utils";

/*
 * BD Guide's building blocks: usa.gov's page plan (a 1124px column, a
 * Merriweather title over a heavy rule, a photo band with a "Most popular"
 * box, a serif lede, a band of cards) worn in MOTHERLAND's manner: white
 * rounded tiles on a paper ground, a colourful animated icon, and a lift
 * on hover. No gold bars anywhere: gold is kept for small accents.
 */

export const CONTAINER = "mx-auto w-full max-w-340 px-4 sm:px-6";

/** Site links route inside the app; everything else is an official page. */
export function GovAnchor({ href, ...rest }: ComponentProps<"a"> & { href: string }) {
  return href.startsWith("/") ? <Link href={href} {...rest} /> : <a href={href} {...rest} />;
}

export const LINK = "text-gv-navy underline underline-offset-2 hover:text-gv-navy hover:decoration-2 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gv-green";

export function Crumbs({ trail }: { trail: GovLink[] }) {
  return (
    <nav aria-label="Breadcrumbs" className={cn(CONTAINER, "mt-7 mb-4")}>
      <ol className="flex flex-wrap items-center gap-x-1 text-base leading-6">
        {trail.map((c, i) => (
          <li key={c.label} className="flex items-center gap-1">
            {i < trail.length - 1 ? (
              <>
                <GovAnchor href={c.href} className={LINK}>
                  {c.label}
                </GovAnchor>
                <svg aria-hidden viewBox="0 0 24 24" className="size-4 fill-current text-gv-ink/50">
                  <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                </svg>
              </>
            ) : (
              <span aria-current="page">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** The photo's licence line, small in the corner of its band. */
export function PhotoCredit({ photo, className }: { photo: Photo; className?: string }) {
  const { author, license, sourceUrl } = photo.credit;
  return (
    <a href={sourceUrl} className={cn("absolute right-3 bottom-2 rounded-sm bg-black/45 px-2 py-0.5 text-xs text-white/85 backdrop-blur-sm hover:text-white", className)}>
      Photo: {author}, {license}
    </a>
  );
}

/**
 * The page title over its green rule, then the photo band: the landmark
 * stands whole on the right, and Kandari navy fades in from the left to
 * carry the box of the most-used links.
 */
export function TitleHero({ title, hero, popular }: { title: string; hero: Photo; popular: GovLink[] }) {
  return (
    <>
      <div className={CONTAINER}>
        <h1 className="font-gv-serif text-[clamp(2rem,3.4vw,3rem)] leading-[1.15] font-bold text-gv-navy">{title}</h1>
      </div>
      <section aria-label="Most popular" className="relative isolate mt-4 overflow-hidden bg-gv-navy pt-56 pb-8 sm:pt-64 lg:py-10">
        <div className="absolute inset-x-0 top-0 -z-10 h-72 sm:h-80 lg:inset-y-0 lg:left-[28%] lg:h-auto">
          <Image src={hero.src} alt={hero.alt} fill priority sizes="(min-width: 1024px) 72vw, 100vw" className="object-cover" style={{ objectPosition: hero.focus }} />
        </div>
        <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-gv-navy from-35% to-transparent to-70% lg:bg-linear-to-r lg:from-28% lg:via-gv-navy/50 lg:via-40% lg:to-55%" />
        <div className={CONTAINER}>
          <div className="w-full rounded-2xl bg-gv-navy p-8 text-white shadow-[0_24px_48px_-12px_rgb(0_0_0/0.5)] ring-1 ring-white/15 sm:w-92">
            <h2 className="font-gv-serif text-[1.34rem] leading-[1.2] font-bold text-gv-gold">Most popular</h2>
            <ul className="mt-[1.13rem] list-disc space-y-3 pl-10 marker:text-gv-gold">
              {popular.map((l) => (
                <li key={l.label}>
                  <GovAnchor
                    href={l.href}
                    className="text-white underline decoration-white/40 underline-offset-[3px] hover:text-gv-gold hover:decoration-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gv-gold"
                  >
                    {l.label}
                  </GovAnchor>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <PhotoCredit photo={hero} />
      </section>
    </>
  );
}

export function Intro({ children }: { children: ReactNode }) {
  return (
    <div className={CONTAINER}>
      <p className="mt-8 max-w-[70ch] text-[1.2rem] leading-relaxed">{children}</p>
    </div>
  );
}

/** Where a tile leads: the guide's own pages and sections, or an official site. */
const isOfficial = (href: string) => /^https?:/.test(href);

/** A topic: its icon, its name and a line about it. The whole card is the link. */
export function Tile({ title, text, sub, href, icon, symbol }: { title: string; text?: string; sub?: string; href: string; icon?: string; symbol?: string }) {
  return (
    <GovAnchor
      href={href}
      className="group flex h-full w-full flex-col rounded-xl bg-white p-5 text-left shadow-[0_1px_2px_rgb(11_24_73/0.05)] ring-1 ring-gv-navy/10 transition-shadow duration-200 hover:shadow-[0_14px_30px_-18px_rgb(11_24_73/0.4)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gv-green"
    >
      <span aria-hidden className="grid size-12 shrink-0 place-items-center text-gv-navy">
        {icon ? <CardIcon name={`gov/${icon}`} fallback={symbol ?? "circle"} size={44} delay={3200} /> : symbol ? <Icon name={symbol} className="text-[2.5rem]!" /> : null}
      </span>
      {sub ? (
        <span lang="bn" className="mt-3 block font-bengali text-sm text-gv-ink/70">
          {sub}
        </span>
      ) : null}
      <span className={cn("font-gv-serif text-[1.16rem] leading-snug font-bold text-balance text-gv-navy", !sub && "mt-3")}>{title}</span>
      {text ? <span className="mt-2 block text-[0.98rem] leading-snug text-pretty text-gv-ink/85">{text}</span> : null}
      <span className="mt-auto pt-4 font-semibold text-gv-green underline-offset-4 group-hover:underline">{isOfficial(href) ? "Visit official site" : "Explore"}</span>
    </GovAnchor>
  );
}

/** A band of tiles on the paper ground, two to four across. */
export function CardGroup({ cards, label, columns = 3, className }: { cards: GovCard[]; label: string; columns?: 3 | 4; className?: string }) {
  return (
    <div className={cn("bg-gv-card-ground py-6 sm:py-8 lg:py-10", className)}>
      <ul aria-label={label} className={cn(CONTAINER, "grid gap-4 sm:grid-cols-2 lg:gap-5", columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3")}>
        {cards.map((c) => (
          <li key={c.title} className="flex">
            <Tile {...c} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Looking({ before, label, href }: { before: string; label: string; href: string }) {
  return (
    <p className={cn(CONTAINER, "mt-[1.13rem] text-[1.13rem]")}>
      <strong>{before}</strong>{" "}
      <GovAnchor href={href} className={LINK}>
        {label}
      </GovAnchor>
    </p>
  );
}

/** A content section's heading, in the system's serif. */
export function SectionTitle({ id, children, className }: { id: string; children: ReactNode; className?: string }) {
  return (
    <h2 id={id} className={cn("scroll-mt-6 font-gv-serif text-[1.75rem] leading-tight font-bold text-gv-ink", className)}>
      {children}
    </h2>
  );
}

/** A plain list of official links, two or three across. */
export function LinkList({ links, label }: { links: GovLink[]; label: string }) {
  return (
    <ul aria-label={label} className="mt-6 grid gap-x-8 gap-y-3 text-[1.13rem] sm:grid-cols-2 lg:grid-cols-3">
      {links.map((l) => (
        <li key={l.label}>
          <GovAnchor href={l.href} className={LINK}>
            {l.label}
          </GovAnchor>
        </li>
      ))}
    </ul>
  );
}
