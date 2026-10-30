import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Fillet } from "@/components/research/kit";
import { Icon } from "@/components/ui/icon";
import { CHAPTERS, chapterById, type Chapter, type ChapterId, type Photo } from "@/data/bangladesh";
import { cn } from "@/lib/utils";
import { Card, COLUMN, LINK } from "./kit";

/** Header, the pitch-black page and footer: the landing page and every chapter. */
export function BangladeshShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="relative w-full bg-black pt-header text-white lg:pt-header-lg">{children}</main>
      <SiteFooter />
    </>
  );
}

/**
 * A chapter page: its hero, the content, then the previous and next
 * chapters. The site header's second row is the chapter bar and marks this
 * page on its own (data/navigation.ts, bangladeshNavLinks).
 */
export function ChapterShell({ chapter, children }: { chapter: ChapterId; children: ReactNode }) {
  const c = chapterById(chapter);
  return (
    <BangladeshShell>
      <ChapterHero chapter={c} />
      {children}
      <ChapterPager chapter={c} />
    </BangladeshShell>
  );
}

/**
 * The research home's hero, compact: the chapter's photograph edge to edge,
 * a black notch cut into its bottom-right corner holding the chapter number
 * and the gold title over its one-line lede. The credit sits under the photo
 * on narrow screens and in a black card on its bottom-left from lg.
 */
function ChapterHero({ chapter }: { chapter: Chapter }) {
  const { number, title, lede, photo } = chapter;
  return (
    <section aria-labelledby="chapter-title" className="relative">
      <div className="relative h-112 w-full overflow-hidden bg-bdnavy-900 sm:h-104">
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          priority
          sizes="100vw"
          quality={90}
          className="object-cover"
          style={{ objectPosition: photo.focus ?? "50% 50%" }}
        />
        <div className="absolute right-0 bottom-0 z-10 w-[calc(100%-1.5rem)] rounded-tl-3xl bg-black pt-5 pr-gutter-x pb-2 pl-5 sm:w-[min(44rem,calc(100%-3rem))] sm:pt-7 sm:pl-8 lg:w-auto lg:max-w-[min(48rem,58%)] lg:pt-9 lg:pl-10">
          <Fillet corner="br" className="-top-6 right-0 size-6" />
          <Fillet corner="br" className="bottom-0 -left-6 size-6" />
          <div className="flex items-start gap-4 sm:gap-6">
            <span aria-hidden className="hero-rise font-grotesk text-5xl leading-none font-bold text-bdnavy-300 tabular-nums lg:text-7xl">
              {number}
            </span>
            <div>
              <h1 id="chapter-title" className="hero-rise font-grotesk text-3xl leading-[1.15] font-bold tracking-tight text-balance text-signal-orange sm:text-4xl lg:text-5xl">
                <span className="sr-only">Chapter {number}: </span>
                {title}
              </h1>
              <p className="hero-rise mt-3 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg" style={{ "--d": "120ms" } as CSSProperties}>
                {lede}
              </p>
            </div>
          </div>
        </div>
      </div>
      <PhotoCredit photo={photo} className="px-gutter-x pt-3 lg:absolute lg:bottom-4 lg:left-gutter-x lg:z-10 lg:max-w-[calc(42%-4rem)] lg:rounded-2xl lg:bg-black lg:px-4 lg:py-3" />
    </section>
  );
}

/** A Commons photo's credit: author, licence and source, as the licence asks. */
export function PhotoCredit({ photo, className }: { photo: Photo; className?: string }) {
  if (!photo.credit) return null;
  const { author, license, licenseUrl, sourceUrl } = photo.credit;
  return (
    <p className={cn("flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-white/65", className)}>
      <span className="flex items-center gap-1.5">
        <Icon name="photo_camera" className="text-sm text-signal-orange" />
        Photo: {author}
      </span>
      <span aria-hidden>·</span>
      {licenseUrl ? (
        <a href={licenseUrl} target="_blank" rel="noopener noreferrer" className={LINK}>
          {license}
        </a>
      ) : (
        <span>{license}</span>
      )}
      <span aria-hidden>·</span>
      <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className={LINK}>
        Wikimedia Commons
      </a>
    </p>
  );
}

/**
 * Previous and next chapter at the foot of every chapter, so the five read
 * as one walk; the first leads back to the overview, and so does the last.
 */
function ChapterPager({ chapter }: { chapter: Chapter }) {
  const i = CHAPTERS.indexOf(chapter);
  const prev = CHAPTERS[i - 1];
  const next = CHAPTERS[i + 1];
  return (
    <nav aria-label="Chapters" className={cn(COLUMN, "section-band grid gap-4 sm:grid-cols-2")}>
      <PagerCard
        href={prev?.href ?? "/bangladesh"}
        line={prev ? `Previous: chapter ${prev.number}` : "Back to the overview"}
        title={prev?.title ?? "Bangladesh"}
      />
      <PagerCard
        next
        href={next?.href ?? "/bangladesh"}
        line={next ? `Next: chapter ${next.number}` : "Back to the overview"}
        title={next?.title ?? "Bangladesh"}
      />
    </nav>
  );
}

function PagerCard({ href, line, title, next }: { href: string; line: string; title: string; next?: boolean }) {
  const arrow = (
    <Icon
      name={next ? "arrow_forward" : "arrow_back"}
      className={cn("text-lg text-signal-orange transition-transform motion-reduce:transition-none", next ? "group-hover:translate-x-0.5" : "group-hover:-translate-x-0.5")}
    />
  );
  return (
    <Card href={href} surface={next ? "navy" : "ink"} className={cn("group flex min-h-28 flex-col justify-center gap-1.5", next && "sm:items-end sm:text-right")}>
      <span className="flex items-center gap-1.5 text-sm font-semibold text-white/80">
        {!next && arrow}
        {line}
        {next && arrow}
      </span>
      <span className="font-grotesk text-xl font-bold text-balance text-signal-orange sm:text-2xl">{title}</span>
    </Card>
  );
}
