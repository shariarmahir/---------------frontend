import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Band, Facts, MoreCategories } from "@/components/motherland/category";
import { anton, montserrat } from "@/components/motherland/fonts";
import { MotherlandFooter } from "@/components/motherland/footer";
import { CrowdBoard, GeoMap } from "@/components/motherland/geo-map";
import { MotherlandHeader } from "@/components/motherland/header";
import { COLUMN, LEDE, SectionHead, pill } from "@/components/motherland/kit";
import { Quiz } from "@/components/motherland/quiz";
import { SeasonMap } from "@/components/motherland/season-map";
import { SideTab } from "@/components/motherland/side-tab";
import { WeekFilm } from "@/components/motherland/week-film";
import { Icon } from "@/components/ui/icon";
import { categoryFor } from "@/data/motherland-categories";
import { GEOGRAPHY, GUIDES, HELP, MUST_SEE, PLACES, SOURCES, STORIES, TRAVEL_CHECKED, filmOfWeek, travelCredits, type MapPlace } from "@/data/motherland-travel";
import { weekNumber } from "@/lib/motherland-crowd";
import { cn } from "@/lib/utils";
import "../motherland.css";

export const metadata: Metadata = {
  title: "Geography & Travel | MOTHERLAND",
  description: "See how beautiful Bangladesh is: this week's film, very old places almost no one visits, hidden gems, the best time to come in each of the six seasons, and a real map you can add to.",
  openGraph: { title: "Geography & Travel | MOTHERLAND", description: "How beautiful Bangladesh is, and how to see it well.", images: ["/motherland/places/puthia.jpg"] },
};

/** Rebuilt through the day, so the film of the week changes on Sunday without a new deploy. */
export const revalidate = 3600;

/** A place in the must-see lists: the picture is the card, the map one click away. */
function PlaceCard({ place, large }: { place: MapPlace; large?: boolean }) {
  return (
    <a href={`#place=${place.id}`} className={cn("group relative isolate flex w-full items-end overflow-hidden rounded-2xl bg-ml-ink p-6 text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-signal-orange sm:p-7", large ? "aspect-4/5 sm:aspect-video" : "aspect-4/5")}>
      <Image src={place.picture.src} alt={place.picture.alt} fill sizes={large ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"} className="-z-20 object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none" style={{ objectPosition: place.picture.focus }} />
      <span aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-black/90 via-black/40 to-transparent" />
      <span className="flex max-w-2xl flex-col gap-2">
        <span className="text-sm font-semibold text-signal-orange">
          {place.district}
          {place.era ? `, ${place.era}` : ""}
        </span>
        <span className={cn("leading-tight font-bold text-balance", large ? "text-4xl" : "text-2xl")}>{place.name}</span>
        <span className="leading-relaxed text-pretty text-white/90">{place.text}</span>
      </span>
    </a>
  );
}

/**
 * Geography & Travel. It opens on the film of the week and ends on the map,
 * so everything between makes the visitor want to go, and the last thing they
 * meet is the place to choose where.
 */
export default function GeographyTravelPage() {
  const category = categoryFor("travel")!;
  const divisions = category.subcategories.find((s) => s.id === "eight-divisions")!;
  const antique = PLACES.filter((p) => p.kind === "antique");
  const gems = PLACES.filter((p) => p.kind === "gem");
  const week = filmOfWeek(weekNumber(new Date()));

  return (
    <div className={cn(anton.variable, montserrat.variable, "ml w-full bg-black font-ml-sans text-ml-ink")}>
      <noscript>
        <style>{".ml-rise .ml-word > span { translate: none !important; }"}</style>
      </noscript>
      <MotherlandHeader topic="travel" />
      <main id="main">
        <section aria-labelledby="travel-title" className="relative isolate flex min-h-svh flex-col justify-end overflow-hidden bg-ml-ink text-white">
          <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-black/85 via-black/35 to-black/25" />
          <div className={cn(COLUMN, "flex flex-col items-start gap-6 pt-36 pb-10 lg:pb-14")}>
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
                  <a href="#seasons" className={pill.white}>
                    Best time to come
                  </a>
                </li>
                <li>
                  <a href="#hidden-gems" className={pill.white}>
                    Hidden gems
                  </a>
                </li>
                <li>
                  <a href="#very-old" className={pill.white}>
                    Very old places
                  </a>
                </li>
              </ul>
            </nav>
            <div className="mt-2 flex items-center gap-3 border-t border-white/25 pt-5 sm:self-stretch">
              <WeekFilm film={week.film} />
              <p className="min-w-0 leading-snug">
                <span className="font-bold">Video of the week</span>
                <span className="block text-sm text-white/85 sm:inline sm:pl-2">
                  {week.caption}.{" "}
                  <a href={week.film.credit.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-white/40 underline-offset-4 hover:text-signal-orange">
                    Film: {week.film.credit.source}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </span>
              </p>
            </div>
          </div>
        </section>

        <Facts facts={GEOGRAPHY} />

        <section id={MUST_SEE.antique.id} aria-labelledby="antique-title" className="scroll-mt-(--ml-header) bg-ml-ground py-20 sm:py-28">
          <div className={cn(COLUMN, "flex flex-col gap-12")}>
            <SectionHead id="antique-title" title={MUST_SEE.antique.title} lede={MUST_SEE.antique.lede} />
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {antique.map((p, i) => (
                <li key={p.id} className={cn("flex", i % 6 === 0 && "sm:col-span-2")}>
                  <PlaceCard place={p} large={i % 6 === 0} />
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id={MUST_SEE.gem.id} aria-labelledby="gems-title" className="scroll-mt-(--ml-header) bg-ml-ink py-20 text-white sm:py-28">
          <div className={cn(COLUMN, "flex flex-col gap-12")}>
            <SectionHead id="gems-title" tone="dark" title={MUST_SEE.gem.title} lede={MUST_SEE.gem.lede} />
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {gems.map((p) => (
                <li key={p.id} className="flex">
                  <PlaceCard place={p} />
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="seasons" aria-labelledby="seasons-title" className="scroll-mt-(--ml-header) bg-ml-deep py-20 text-white sm:py-28">
          <div className={cn(COLUMN, "flex flex-col gap-12")}>
            <SectionHead id="seasons-title" tone="dark" title="Six seasons. When will you come?" lede="Bangladesh counts six seasons, not four. Mid-October to mid-February is the best time for most trips, and each of the others shows you something the rest can't." />
            <SeasonMap />
          </div>
        </section>

        <CrowdBoard />

        <section id="prepare" aria-labelledby="prepare-title" className="scroll-mt-(--ml-header) bg-white py-20 sm:py-28">
          <div className={cn(COLUMN, "flex flex-col gap-12")}>
            <SectionHead id="prepare-title" title="Know before you go" lede="Each landscape has its own way of going wrong. Here is what to watch for and what to carry." />
            <ul className="flex flex-col gap-6">
              {GUIDES.map((g, i) => (
                <li key={g.id} id={`prepare-${g.id}`} className="grid scroll-mt-[calc(var(--ml-header)+1rem)] overflow-hidden rounded-2xl bg-ml-ground lg:grid-cols-12">
                  <div className={cn("relative aspect-video lg:col-span-4 lg:aspect-auto", i % 2 === 1 && "lg:order-last")}>
                    <Image src={g.picture.src} alt={g.picture.alt} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" style={{ objectPosition: g.picture.focus }} />
                  </div>
                  <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8 lg:col-span-8 xl:p-10">
                    <div className="flex flex-col gap-2 sm:col-span-2">
                      <h3 className="font-ml-display text-4xl tracking-[0.01em] uppercase">{g.title}</h3>
                      <p className="max-w-3xl text-lg leading-relaxed text-ml-ink/85">{g.lede}</p>
                      <p className="font-semibold text-ml-green">{g.best}</p>
                    </div>
                    <div>
                      <h4 className="font-bold">Watch out for</h4>
                      <ul className="mt-2 list-disc space-y-2 pl-5 leading-relaxed text-ml-ink/85 marker:text-ml-red">
                        {g.watch.map((w) => (
                          <li key={w}>{w}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold">Carry</h4>
                      <ul className="mt-2 list-disc space-y-2 pl-5 leading-relaxed text-ml-ink/85 marker:text-ml-green">
                        {g.carry.map((c) => (
                          <li key={c}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-2xl bg-ml-ink p-6 text-white sm:p-8">
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

        <Band sub={divisions} index={0} />

        <section aria-labelledby="stories-band" className="relative isolate overflow-hidden bg-ml-ink py-24 text-white sm:py-36">
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
