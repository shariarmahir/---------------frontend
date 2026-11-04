import type { Metadata } from "next";
import Image from "next/image";
import { CardStack } from "@/components/motherland/card-stack";
import { Band, CardGrid, IntroFill, Moment } from "@/components/motherland/blocks";
import { Facts, MoreCategories, PageHero } from "@/components/motherland/category";
import { anton, montserrat } from "@/components/motherland/fonts";
import { MotherlandFooter } from "@/components/motherland/footer";
import { CrowdBoard, GeoMap } from "@/components/motherland/geo-map";
import { GuideTabs } from "@/components/motherland/guide-tabs";
import { MotherlandHeader } from "@/components/motherland/header";
import { BAND_Y, COLUMN, SectionHead, pill } from "@/components/motherland/kit";
import { Quiz } from "@/components/motherland/quiz";
import { SideTab } from "@/components/motherland/side-tab";
import { TripPlanner } from "@/components/motherland/trip-planner";
import { WeekFilm } from "@/components/motherland/week-film";
import { TRAVEL_INTRO } from "@/data/motherland-pages";
import { categoryFor } from "@/data/motherland-categories";
import { GEOGRAPHY, HELP, MUST_SEE, OLD_STACK, PLACES, SEASONS, STORIES, filmOfWeek, placeById, topTen, travelCredits, type MapPlace } from "@/data/motherland-travel";
import { dhakaClock, seasonAt, weekNumber } from "@/lib/motherland-crowd";
import { cn } from "@/lib/utils";
import { place, type Card } from "@/data/motherland-blocks";
import "../motherland.css";

export const metadata: Metadata = {
  title: "Geography & Travel | MOTHERLAND",
  description: "See how beautiful Bangladesh is: this week's film, the top ten places to go now, very old places almost no one visits, hidden gems, when the country looks its best, and a real map you can add to.",
  openGraph: { title: "Geography & Travel | MOTHERLAND", description: "How beautiful Bangladesh is, and how to see it well.", images: ["/motherland/places/puthia.jpg"] },
};

/** Rebuilt through the day, so the film, the Top 10 and the season change without a new deploy. */
export const revalidate = 3600;

/** A place as a detailed card, the same as every other page's, with its way onto the map. */
function placeCard(p: MapPlace): Card {
  return {
    title: p.name,
    meta: p.era ? `${p.district}, ${p.era}` : p.district,
    text: p.text,
    picture: p.picture,
    cta: { label: "Find it on the map", href: `#place=${p.id}` },
  };
}

export const viewport = { themeColor: "#0b1849" };

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
    <div className={cn(anton.variable, montserrat.variable, "ml ml-light w-full bg-ml-ground font-ml-sans text-ml-ink")}>
      <noscript>
        <style>{".ml-rise .ml-word > span { translate: none !important; } .ml-reveal { opacity: 1 !important; translate: none !important; } .ml-reveal .ml-wipe { clip-path: none !important; } .ml-reveal .ml-settle { transform: none !important; }"}</style>
      </noscript>
      <MotherlandHeader topic="travel" />
      <main id="main">
        <PageHero
          id="travel-title"
          name="Geography & Travel"
          lede="The world's largest river delta, from cloud hills to coral sand. You have no idea how beautiful it is. Come and see."
          media={<WeekFilm film={film.film} />}
          parts={[
            { id: "top-ten", title: "Top 10 this week" },
            { id: "map", title: "Open the map" },
            { id: "plan", title: "Plan your trip" },
            { id: MUST_SEE.gem.id, title: "Hidden gems" },
          ]}
        />

        <Facts facts={GEOGRAPHY} />
        <IntroFill text={TRAVEL_INTRO} />

        <Band id="top-ten" tone="navy" title="Top 10 this week" lede="Ten places at their best right now, in order. The list changes with the season.">
          <CardGrid cards={top.map(placeCard)} tone="navy" numbered />
        </Band>

        <section id={MUST_SEE.antique.id} aria-labelledby="antique-title" className="scroll-mt-(--ml-header) bg-ml-ground">
          <h2 id="antique-title" className="sr-only">
            {MUST_SEE.antique.title}
          </h2>
          <CardStack cards={stack} tone="navy" />
        </section>

        <Band id="more-old" tone="paper" title={MUST_SEE.antique.title} lede={MUST_SEE.antique.lede}>
          <CardGrid cards={moreOld.map(placeCard)} tone="paper" columns={moreOld.length % 4 === 0 ? 4 : 3} />
        </Band>

        <section id="seasons" aria-labelledby="seasons-title" className={cn("scroll-mt-(--ml-header) bg-ml-navy text-white", BAND_Y)}>
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
                  <span aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-ml-navy via-ml-navy/40 to-transparent" />
                  {s.pick || s.id === season.id ? <span className={cn("absolute top-3 left-3 rounded-full px-2.5 py-1 text-xs font-bold", s.pick ? "bg-signal-orange text-ml-navy" : "bg-white text-ml-navy")}>{s.pick ? "Best time" : "Right now"}</span> : null}
                  <h3 className="font-ml-display text-[clamp(1.6rem,2.1vw,2.25rem)] leading-none tracking-[0.01em] uppercase">{s.name}</h3>
                  <p className="mt-1.5 text-sm font-semibold">{s.months}</p>
                  <p className="mt-1 text-sm leading-snug text-white/85">{s.looks}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <Band id={MUST_SEE.gem.id} tone="white" title={MUST_SEE.gem.title} lede={MUST_SEE.gem.lede}>
          <CardGrid cards={gems.map(placeCard)} tone="white" columns={gems.length % 4 === 0 ? 4 : 3} />
        </Band>

        <CrowdBoard />

        <section id="prepare" aria-labelledby="prepare-title" className={cn("scroll-mt-(--ml-header) bg-white", BAND_Y)}>
          <div className={cn(COLUMN, "flex flex-col gap-8")}>
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

        <Band id={divisions.id} tone="paper" title={divisions.title} lede={divisions.lede}>
          <CardGrid cards={divisions.stories} tone="paper" columns={4} />
        </Band>

        <Moment
          id="share-a-story"
          title="Been somewhere no one has seen? Tell us."
          text="Write a short memory of your trip, pin it on the travel wall, and earn XP and badges."
          picture={place("birishiri", "The china-clay hills and green pools of Birishiri")}
          cta={{ label: "Share your short tour story", href: STORIES.href }}
        />

        <Quiz questions={category.quiz} name={category.name} />

        <MoreCategories current="travel" />

        <GeoMap />

        <TripPlanner />
      </main>
      <SideTab href="/bangladesh#join" />
      <MotherlandFooter narrow credits={travelCredits()} onLanding={false} />
    </div>
  );
}
