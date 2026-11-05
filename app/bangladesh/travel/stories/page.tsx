import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Band } from "@/components/motherland/blocks";
import { PageHero } from "@/components/motherland/category";
import { mlFonts } from "@/components/motherland/fonts";
import { MotherlandFooter } from "@/components/motherland/footer";
import { MotherlandHeader } from "@/components/motherland/header";
import { BAND_Y, COLUMN, DISPLAY, LEDE, pill } from "@/components/motherland/kit";
import { SideTab } from "@/components/motherland/side-tab";
import { WallExample } from "@/components/motherland/travel-wall";
import { Icon } from "@/components/ui/icon";
import { STORIES_FILM } from "@/data/motherland-deep";
import { STORIES, placeById } from "@/data/motherland-travel";
import { cn } from "@/lib/utils";
import "../../motherland.css";

export const metadata: Metadata = {
  alternates: { canonical: "/bangladesh/travel/stories" },
  title: "Travel stories | MOTHERLAND",
  description: "Write a short memory of your trip to Bangladesh, pin it on the travel wall, earn XP and badges, and compete for the week's top ten.",
};

/**
 * The travel stories page. Writing needs a Kandari Profile, and the accounts
 * that make it work come with the auth work (Mahir, 2026-11-04), so nothing
 * here is real yet: no invented stories, the top ten says it is waiting for the
 * first one, and the one pin on the wall says it is an example.
 */
export default function TravelStoriesPage() {
  const first = placeById("nafakhum")!.picture;
  return (
    <div className={cn(mlFonts, "ml ml-light w-full bg-ml-ground font-ml-sans text-ml-ink")}>
      <noscript>
        <style>{".ml-rise .ml-word > span { translate: none !important; }"}</style>
      </noscript>
      <MotherlandHeader topic="travel" />
      <main id="main">
        <PageHero id="stories-title" name={STORIES.title} film={STORIES_FILM} />

        <Band id="top-ten" tone="paper" title="Top 10 this week" lede="Only ten stories are published each week, chosen for the story and the images.">
          <article className="grid overflow-hidden rounded-[1.25rem] bg-white ring-1 ring-ml-navy/8 lg:grid-cols-2">
            <div className="relative aspect-video lg:aspect-auto lg:min-h-80">
              <Image src={first.src} alt={first.alt} fill sizes="(min-width: 1024px) 45vw, 90vw" className="object-cover" style={{ objectPosition: first.focus }} />
            </div>
            <div className="flex flex-col items-start justify-center gap-4 p-6 sm:p-10">
              <h3 className="font-ml-display text-3xl leading-tight tracking-[0.01em] uppercase">No stories yet</h3>
              <p className="text-lg leading-relaxed text-ml-navy/80">All ten places are open. Create your Kandari Profile and yours can be the first one here.</p>
              <Link href={STORIES.signup} className={pill.onLight}>
                Write the first story
              </Link>
            </div>
          </article>
        </Band>

        <section aria-labelledby="wall-title" className={cn(BAND_Y, "bg-ml-navy text-white")}>
          <div className={cn(COLUMN, "grid items-center gap-10 lg:grid-cols-2 lg:gap-12")}>
            <div className="flex flex-col items-start gap-5">
              <h2 id="wall-title" className={DISPLAY}>
                The travel wall
              </h2>
              <p className={cn(LEDE, "text-white/85")}>Every story is one small pin at the place it happened. The note stays closed until someone opens it, so the map fills slowly with people who actually went.</p>
              <p className="text-white/70">The wall is empty for now. The one pin here is an example to show how a note opens.</p>
            </div>
            <WallExample />
          </div>
        </section>

        <Band id="how-it-works" tone="white" title="How it works">
          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STORIES.steps.map((s, i) => (
              <li key={s.title} className="flex flex-col gap-2 rounded-[1.25rem] bg-ml-ground p-6">
                <span className="font-ml-display text-3xl leading-none text-ml-navy">{i + 1}</span>
                <h3 className="mt-1 text-lg leading-snug font-bold">{s.title}</h3>
                <p className="leading-relaxed text-ml-navy/80">{s.text}</p>
              </li>
            ))}
          </ol>
        </Band>

        <section aria-labelledby="badges-title" className={cn(BAND_Y, "bg-ml-navy text-white")}>
          <div className={cn(COLUMN, "grid gap-10 lg:grid-cols-[3fr_2fr] lg:gap-14")}>
            <div className="flex flex-col gap-8">
              <h2 id="badges-title" className={DISPLAY}>
                Badges
              </h2>
              <ul className="grid gap-4 sm:grid-cols-2 sm:[&>li:last-child:nth-child(odd)]:col-span-2">
                {STORIES.badges.map((b) => (
                  <li key={b.title} className="flex gap-4 rounded-[1.25rem] bg-white/8 p-5">
                    <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-full bg-signal-orange text-ml-navy">
                      <Icon name={b.icon} className="text-xl" />
                    </span>
                    <span>
                      <span className="block leading-snug font-bold">{b.title}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-white/80">{b.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-8">
              <h2 className={DISPLAY}>XP</h2>
              <ul className="flex flex-col divide-y divide-white/15 border-y border-white/15">
                {STORIES.xp.map((x) => (
                  <li key={x.label} className="flex items-baseline justify-between gap-6 py-3">
                    <span>{x.label}</span>
                    <span className="font-ml-display text-2xl text-signal-orange">{x.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <Band id="rules" tone="white" title="The rules">
          <ul className="grid gap-x-12 gap-y-3 text-lg leading-relaxed sm:grid-cols-2">
            {STORIES.rules.map((r) => (
              <li key={r} className="flex gap-3">
                <Icon name="check" className="mt-1 text-xl text-ml-navy" />
                {r}
              </li>
            ))}
          </ul>
          <Link href={STORIES.signup} className={cn(pill.onLight, "self-start")}>
            Create your Kandari Profile
          </Link>
        </Band>
      </main>
      <SideTab href="/bangladesh#join" />
      <MotherlandFooter />
    </div>
  );
}
