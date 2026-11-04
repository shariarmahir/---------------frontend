import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CardStack } from "@/components/motherland/card-stack";
import { Facts, MoreCategories } from "@/components/motherland/category";
import { anton, montserrat } from "@/components/motherland/fonts";
import { MotherlandFooter } from "@/components/motherland/footer";
import { CrowdBoard, GeoMap } from "@/components/motherland/geo-map";
import { GuideTabs } from "@/components/motherland/guide-tabs";
import { MotherlandHeader } from "@/components/motherland/header";
import { COLUMN, LEDE, SectionHead, pill } from "@/components/motherland/kit";
import { PhotoCard, firstSentence } from "@/components/motherland/photo-card";
import { Quiz } from "@/components/motherland/quiz";
import { Rail } from "@/components/motherland/rail";
import { SideTab } from "@/components/motherland/side-tab";
import { TripPlanner } from "@/components/motherland/trip-planner";
import { WeekFilm } from "@/components/motherland/week-film";
import { Icon } from "@/components/ui/icon";
import { categoryFor } from "@/data/motherland-categories";
import { GEOGRAPHY, HELP, MUST_SEE, OLD_STACK, PLACES, SEASONS, SOURCES, STORIES, TRAVEL_CHECKED, filmOfWeek, placeById, topTen, travelCredits } from "@/data/motherland-travel";
import { dhakaClock, seasonAt, weekNumber } from "@/lib/motherland-crowd";
import { cn } from "@/lib/utils";
import "../motherland.css";

export const metadata: Metadata = {
  title: "Geography & Travel | MOTHERLAND",
  description: "See how beautiful Bangladesh is: this week's film, the top ten places to go now, very old places almost no one visits, hidden gems, when the country looks its best, and a real map you can add to.",
  openGraph: { title: "Geography & Travel | MOTHERLAND", description: "How beautiful Bangladesh is, and how to see it well.", images: ["/motherland/places/puthia.jpg"] },
};

/** Rebuilt through the day, so the film, the Top 10 and the season change without a new deploy. */
export const revalidate = 3600;

const CARD = "w-[min(82vw,26rem)] shrink-0 snap-start";

/**
 * Geography & Travel, after visittheusa.com in MOTHERLAND's dress: the film,
 * the week's ten places, full-screen old places, when the country looks best,
 * hidden gems, then everything needed to go, ending on the map.
 */
export default function GeographyTravelPage() {
  const category = categoryFor("travel")!;
  const divisions = category.subcategories.find((s) => s.id === "eight-divisions")!;
  const now = new Date();
  const week = weekNumber(now);
  const film = filmOfWeek(week);
  const top = topTen(dhakaClock(now).month, week);
  const season = seasonAt(now, SEASONS);
  const stackIds = new Set(OLD_STACK.map((o) => o.id));
  const stack = OLD_STACK.map(({ id, art }) => {
    const p = placeById(id)!;
    return { art, title: p.name, text: p.text, cta: { label: "Find it on the map", href: `#place=${id}` }, picture: p.picture };
  });
  const moreOld = PLACES.filter((p) => p.kind === "antique" && !stackIds.has(p.id));
  const gems = PLACES.filter((p) => p.kind === "gem");

  return (
    <div className={cn(anton.variable, montserrat.variable, "ml w-full bg-ml-navy font-ml-sans text-ml-ink")}>
      <noscript>
        <style>{".ml-rise .ml-word > span { translate: none !important; }"}</style>
      </noscript>
      <MotherlandHeader topic="travel" />
      <main id="main">
        <section aria-labelledby="travel-title" className="relative isolate flex min-h-svh flex-col justify-end overflow-hidden bg-ml-navy text-white">
          <WeekFilm film={film.film} />
          <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-black/85 via-black/35 to-black/25" />
          <div className={cn(COLUMN, "flex flex-col items-start gap-6 pt-36 pb-14 lg:pb-20")}>
            <Link href="/bangladesh" className="rounded-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              MOTHERLAND
            </Link>
            <h1 id="travel-title" className="font-ml-display text-[clamp(3.5rem,11.5vw,11rem)] leading-[0.98] tracking-[0.01em] text-balance uppercase">
              Geography &amp; Travel
            </h1>
            <p className={cn(LEDE, "text-white/90")}>The world&apos;s largest river delta, from cloud hills to coral sand. You have no idea how beautiful it is. Come and see.</p>
            <nav aria-label="On this page">
              <ul className="flex flex-wrap gap-3">
                <li>
                  <a href="#map" className={pill.onDark}>
                    <Icon name="map" className="text-xl" />
                    Open the map
                  </a>
                </li>
                <li>
                  <a href="#top-ten" className={pill.white}>
                    Top 10 this week
                  </a>
                </li>
                <li>
                  <a href="#seasons" className={pill.white}>
                    When it looks best
                  </a>
                </li>
                <li>
                  <a href="#hidden-gems" className={pill.white}>
                    Hidden gems
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </section>

        <Facts facts={GEOGRAPHY} />

        <TripPlanner />

        <section id="top-ten" aria-labelledby="top-title" className="scroll-mt-(--ml-header) bg-ml-navy py-20 text-white sm:py-28">
          <Rail label="Top 10 places this week" head={<SectionHead id="top-title" tone="dark" title="Top 10 this week" lede="Ten places at their best right now, in order. Choose one and go." />}>
            {top.map((p, i) => (
              <li key={p.id} className={CARD}>
                <PhotoCard picture={p.picture} rank={i + 1} title={p.name} tag={p.district} href={`#place=${p.id}`} />
              </li>
            ))}
          </Rail>
        </section>

        <section id={MUST_SEE.antique.id} aria-labelledby="antique-title" className="scroll-mt-(--ml-header) bg-ml-navy">
          <h2 id="antique-title" className="sr-only">
            {MUST_SEE.antique.title}
          </h2>
          <CardStack cards={stack} tone="navy" />
        </section>

        <section aria-labelledby="more-old-title" className="bg-ml-ground py-20 sm:py-28">
          <Rail label="More very old places" head={<SectionHead id="more-old-title" title={MUST_SEE.antique.title} lede={MUST_SEE.antique.lede} />}>
            {moreOld.map((p) => (
              <li key={p.id} className={CARD}>
                <PhotoCard picture={p.picture} title={p.name} tag={`${p.district}, ${p.era}`} text={firstSentence(p.text)} href={`#place=${p.id}`} />
              </li>
            ))}
          </Rail>
        </section>

        <section id="seasons" aria-labelledby="seasons-title" className="scroll-mt-(--ml-header) bg-ml-navy py-14 text-white sm:py-16">
          <div className={cn(COLUMN, "flex flex-col gap-8")}>
            <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-3">
              <h2 id="seasons-title" className="font-ml-display text-[clamp(2.25rem,4.4vw,4rem)] leading-[1.02] tracking-[0.01em] uppercase">
                When Bangladesh looks best
              </h2>
              <p className="text-lg font-semibold text-signal-orange">Mid-October to mid-February</p>
            </div>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {SEASONS.map((s) => (
                <li key={s.id} className={cn("relative isolate flex aspect-4/5 flex-col justify-end overflow-hidden rounded-2xl p-4 lg:p-5", s.pick ? "ring-3 ring-signal-orange" : "ring-1 ring-white/15")}>
                  <Image src={s.picture.src} alt={s.picture.alt} fill sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw" className="-z-20 object-cover" style={{ objectPosition: s.picture.focus }} />
                  <span aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-black/90 via-black/30 to-transparent" />
                  {s.pick || s.id === season.id ? (
                    <span className={cn("absolute top-3 left-3 rounded-full px-2.5 py-1 text-xs font-bold", s.pick ? "bg-signal-orange text-ml-ink" : "bg-white text-ml-ink")}>{s.pick ? (s.id === season.id ? "Best time, now" : "Best time") : "Now"}</span>
                  ) : null}
                  <h3 className="font-ml-display text-[clamp(1.6rem,2.1vw,2.25rem)] leading-none tracking-[0.01em] uppercase">{s.name}</h3>
                  <p className="mt-1.5 text-sm font-semibold">{s.months}</p>
                  <p className="mt-1 text-sm leading-snug text-white/85">{s.looks}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id={MUST_SEE.gem.id} aria-labelledby="gems-title" className="scroll-mt-(--ml-header) bg-ml-navy py-20 text-white sm:py-28">
          <Rail label="Hidden gems of Bangladesh" head={<SectionHead id="gems-title" tone="dark" title={MUST_SEE.gem.title} lede={MUST_SEE.gem.lede} />}>
            {gems.map((p) => (
              <li key={p.id} className={CARD}>
                <PhotoCard picture={p.picture} title={p.name} tag={p.district} text={firstSentence(p.text)} href={`#place=${p.id}`} />
              </li>
            ))}
          </Rail>
        </section>

        <CrowdBoard />

        <section id="prepare" aria-labelledby="prepare-title" className="scroll-mt-(--ml-header) bg-white py-20 sm:py-28">
          <div className={cn(COLUMN, "flex flex-col gap-10")}>
            <SectionHead id="prepare-title" title="Know before you go" lede="Each landscape has its own way of going wrong. Here is what to watch for and what to carry." />
            <GuideTabs />
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-2xl bg-ml-navy p-6 text-white sm:p-8">
              <h3 className="text-xl font-bold">If something goes wrong</h3>
              <ul className="flex flex-wrap gap-3">
                {HELP.map((h) => (
                  <li key={h.tel}>
                    <a href={`tel:${h.tel}`} className={pill.onDark}>
                      {h.shown ?? h.tel}, {h.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id={divisions.id} aria-labelledby="divisions-title" className="scroll-mt-(--ml-header) bg-ml-ground py-20 sm:py-28">
          <Rail label={divisions.title} head={<SectionHead id="divisions-title" title={divisions.title} lede={divisions.lede} />}>
            {divisions.stories.map((d) => (
              <li key={d.title} className={CARD}>
                <PhotoCard picture={d.picture} title={d.title} text={d.text} />
              </li>
            ))}
          </Rail>
        </section>

        <section aria-labelledby="stories-band" className="relative isolate overflow-hidden bg-ml-navy py-24 text-white sm:py-36">
          <Image src="/motherland/places/birishiri.jpg" alt="" fill sizes="100vw" className="-z-20 object-cover" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-black/65" />
          <div className={cn(COLUMN, "flex flex-col items-start gap-6")}>
            <h2 id="stories-band" className="max-w-5xl font-ml-display text-[clamp(2.75rem,7vw,6.5rem)] leading-[1.02] tracking-[0.01em] uppercase">
              Been somewhere no one has seen? Tell us.
            </h2>
            <p className="max-w-2xl text-lg leading-relaxed text-white/90 sm:text-xl">Write a short memory of your trip, pin it on the travel wall, earn XP and badges, and compete for this week&apos;s top ten. The best stories represent Bangladesh to the world.</p>
            <Link href={STORIES.href} className={pill.onDark}>
              <Icon name="edit_note" className="text-xl" />
              Share your short tour story
            </Link>
          </div>
        </section>

        <Quiz questions={category.quiz} name={category.name} />

        <MoreCategories current="travel" />

        <GeoMap />
      </main>
      <SideTab href="/bangladesh#join" />
      <MotherlandFooter narrow credits={travelCredits()} onLanding={false}>
        <details className="open:order-last open:basis-full">
          <summary className="cursor-pointer font-semibold hover:text-white focus-visible:outline-2 focus-visible:outline-white">Sources, checked {TRAVEL_CHECKED}</summary>
          <ul className="mt-3 grid gap-x-8 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {SOURCES.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline decoration-white/25 underline-offset-4 hover:text-white">
                  {s.name}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </details>
      </MotherlandFooter>
    </div>
  );
}
