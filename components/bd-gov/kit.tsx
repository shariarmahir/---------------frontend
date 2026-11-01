import Image from "next/image";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { CardIcon } from "@/components/ui/card-icon";
import { Icon } from "@/components/ui/icon";
import { Mark } from "@/components/bd-gov/mark";
import type { GovCard, GovLink, Photo } from "@/data/bd-gov";
import { cn } from "@/lib/utils";

/*
 * BD Guide's building blocks: usa.gov's page plan (a 1124px column, a
 * Merriweather title over a heavy rule, a photo band with a "Most popular"
 * box, a serif lede, a band of cards) worn in MOTHERLAND's manner: white
 * rounded tiles on a paper ground, a colourful animated icon, and a lift
 * on hover. No gold bars anywhere: gold is kept for small accents.
 */

export const CONTAINER = "mx-auto w-full max-w-289 px-4";

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
        <h1 className="font-gv-serif text-[1.95rem] leading-[1.2] font-bold text-gv-green">{title}</h1>
      </div>
      <section aria-label="Most popular" className="relative isolate mt-3 overflow-hidden border-t-10 border-gv-green bg-gv-navy pt-56 pb-8 sm:pt-64 lg:py-10">
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
      <p className="mt-6 font-gv-serif text-[1.04rem] leading-normal">{children}</p>
    </div>
  );
}

/** Where a tile leads: the guide's own pages and sections, or an official site. */
const isOfficial = (href: string) => /^https?:/.test(href);

const TILE_ACCENTS = [
  { art: "text-gv-navy" },
  { art: "text-sky-600" },
  { art: "text-amber-500" },
  { art: "text-gv-green" },
  { art: "text-gv-gold" },
  { art: "text-indigo-500" },
];

/** A light service tile with a bold navy-and-gold action and colorful artwork. */
export function Tile({
  title,
  text,
  sub,
  href,
  icon,
  symbol,
  accentIndex = 0,
}: {
  title: string;
  text?: string;
  sub?: string;
  href: string;
  icon?: string;
  symbol?: string;
  accentIndex?: number;
}) {
  const accent = TILE_ACCENTS[accentIndex % TILE_ACCENTS.length];

  return (
    <GovAnchor
      href={href}
      className="group relative isolate flex min-h-72 h-full w-full flex-col overflow-hidden rounded-2xl bg-white p-5 text-left shadow-[0_2px_8px_rgb(11_24_73/0.05),0_16px_34px_-26px_rgb(11_24_73/0.28)] ring-1 ring-gv-navy/10 transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_18px_38px_-22px_rgb(11_24_73/0.25)] hover:ring-gv-gold/60 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gv-green motion-reduce:transition-none motion-reduce:hover:translate-y-0 lg:aspect-square lg:min-h-[21rem] sm:p-6"
    >
      <span aria-hidden className="grid size-14 shrink-0 place-items-center text-gv-navy sm:size-16">
        {icon ? (
          <CardIcon name={`gov/${icon}`} fallback={symbol ?? "circle"} size={54} delay={3200} />
        ) : symbol ? (
          <Icon name={symbol} className="text-[3.25rem]!" />
        ) : null}
      </span>
      {isOfficial(href) ? (
        <span className="absolute top-6 right-5 text-[0.52rem] font-bold tracking-[0.12em] text-gv-gold">
          OFFICIAL SERVICE
        </span>
      ) : (
        <Mark className="absolute top-6 right-5 text-[0.65rem]" />
      )}
      <span className="relative z-10 mt-auto max-w-[85%] pb-1">
        {sub ? (
          <span lang="bn" className="mb-1 block font-bengali text-sm text-gv-ink/65">
            {sub}
          </span>
        ) : null}
        <span className="font-gv-serif text-[1.16rem] leading-snug font-bold text-gv-navy text-balance">{title}</span>
        {text ? <span className="mt-2 block text-[0.96rem] leading-snug text-gv-ink/80 text-pretty">{text}</span> : null}
      </span>
      <span className="relative z-10 mt-5 flex min-h-12 w-full items-center justify-between rounded-full bg-gv-navy py-1.5 pr-2 pl-5 text-[0.95rem] font-bold text-white shadow-[0_6px_14px_-8px_rgb(11_24_73/0.7)] transition-colors group-hover:bg-gv-green">
        <span>{isOfficial(href) ? "Visit official site" : "Explore"}</span>
        <span aria-hidden className="grid size-9 place-items-center rounded-full bg-gv-gold text-gv-navy transition-transform group-hover:translate-x-0.5">
          <Icon name={isOfficial(href) ? "north_east" : "arrow_forward"} className="text-[1.25rem]! font-bold" />
        </span>
      </span>
      <svg aria-hidden viewBox="0 0 160 120" className={cn("pointer-events-none absolute right-0 bottom-14 h-28 w-36 opacity-[0.13] transition-transform duration-500 group-hover:scale-105", accent.art)}>
        {accentIndex % 3 === 0 ? (
          <g fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M75 125C92 95 113 87 121 62s18-42 45-53" />
            <path d="M90 128c16-28 37-36 45-61s18-42 44-53" />
            <path d="M106 130c16-28 36-36 44-61s17-42 43-53" />
            <path d="M122 132c15-28 35-36 43-61s17-42 42-53" />
          </g>
        ) : accentIndex % 3 === 1 ? (
          <g fill="currentColor">
            {Array.from({ length: 24 }, (_, i) => (
              <circle key={i} cx={82 + (i % 6) * 14} cy={58 + Math.floor(i / 6) * 14} r={2 + ((i + 1) % 3)} />
            ))}
          </g>
        ) : (
          <g fill="none" stroke="currentColor" strokeWidth="4">
            <path d="m60 126 78-78 78 78" />
            <path d="m78 126 60-60 60 60" />
            <path d="m96 126 42-42 42 42" />
            <path d="m114 126 24-24 24 24" />
          </g>
        )}
      </svg>
    </GovAnchor>
  );
}

/** A band of tiles on the paper ground, two to four across. */
export function CardGroup({ cards, label, columns = 3, className }: { cards: GovCard[]; label: string; columns?: 3 | 4; className?: string }) {
  return (
    <div className={cn("bg-gv-card-ground py-6 sm:py-8 lg:py-10", className)}>
      <ul aria-label={label} className={cn(CONTAINER, "grid gap-4 sm:grid-cols-2 lg:gap-5", columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3")}>
        {cards.map((c, index) => (
          <li key={c.title} className="flex">
            <Tile {...c} accentIndex={index} />
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
