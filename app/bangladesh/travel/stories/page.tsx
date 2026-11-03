import type { Metadata } from "next";
import Link from "next/link";
import { anton, montserrat } from "@/components/motherland/fonts";
import { MotherlandFooter } from "@/components/motherland/footer";
import { MotherlandHeader } from "@/components/motherland/header";
import { COLUMN, DISPLAY, LEDE, SectionHead, pill } from "@/components/motherland/kit";
import { SideTab } from "@/components/motherland/side-tab";
import { WallExample } from "@/components/motherland/travel-wall";
import { Icon } from "@/components/ui/icon";
import { STORIES, travelCredits } from "@/data/motherland-travel";
import { cn } from "@/lib/utils";
import "../../motherland.css";

export const metadata: Metadata = {
  title: "Travel stories | MOTHERLAND",
  description: "Write a short memory of your trip to Bangladesh, pin it on the travel wall, earn XP and badges, and compete for the week's top ten.",
};

/**
 * The travel stories page. Writing needs a Kandari Profile, and the accounts
 * that make it work come with the auth work (Mahir, 2026-11-04), so nothing
 * here is real yet: no invented stories, the ten places stand open, and the
 * one pin on the wall says it is an example.
 */
export default function TravelStoriesPage() {
  return (
    <div className={cn(anton.variable, montserrat.variable, "ml w-full bg-black font-ml-sans text-white")}>
      <noscript>
        <style>{".ml-rise .ml-word > span { translate: none !important; }"}</style>
      </noscript>
      <MotherlandHeader topic="travel" />
      <main id="main">
        <section aria-labelledby="stories-title" className="bg-black pt-[calc(var(--ml-header)+3rem)] pb-16 lg:pb-24">
          <div className={cn(COLUMN, "flex flex-col items-start gap-6")}>
            <Link href="/bangladesh/travel" className="rounded-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              Geography &amp; Travel
            </Link>
            <h1 id="stories-title" className="font-ml-display text-[clamp(3.5rem,11vw,10rem)] leading-[0.98] tracking-[0.01em] uppercase">
              {STORIES.title}
            </h1>
            <p className={cn(LEDE, "text-white/90")}>{STORIES.lede}</p>
            <Link href={STORIES.signup} className={pill.onDark}>
              <Icon name="edit_note" className="text-xl" />
              Create a profile to write your story
            </Link>
          </div>
        </section>

        <section aria-labelledby="top-ten" className="bg-ml-ground py-20 text-ml-ink sm:py-28">
          <div className={cn(COLUMN, "flex flex-col gap-12")}>
            <SectionHead id="top-ten" title="Top 10 this week" lede="Only ten stories are published each week, chosen for the story and the images. The first ten places are open." />
            <ol className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 10 }, (_, i) => (
                <li key={i} className="flex aspect-4/5 flex-col justify-between rounded-2xl bg-white p-5 ring-1 ring-ml-ink/10">
                  <span className="font-ml-display text-6xl leading-none text-ml-green">{i + 1}</span>
                  <span className="text-sm leading-snug text-ml-ink/70">Open for your story</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="wall-title" className="bg-black py-20 sm:py-28">
          <div className={cn(COLUMN, "grid items-center gap-12 lg:grid-cols-2")}>
            <div className="flex flex-col items-start gap-6">
              <h2 id="wall-title" className={DISPLAY}>
                The travel wall
              </h2>
              <p className={cn(LEDE, "text-white/85")}>Every story is one small pin at the place it happened. The note stays closed until someone opens it, so the map fills slowly with people who actually went.</p>
              <p className="text-white/70">The wall is empty for now. The one pin here is an example to show how a note opens.</p>
            </div>
            <WallExample />
          </div>
        </section>

        <section aria-labelledby="how-title" className="bg-white py-20 text-ml-ink sm:py-28">
          <div className={cn(COLUMN, "flex flex-col gap-12")}>
            <SectionHead id="how-title" title="How it works" />
            <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {STORIES.steps.map((s, i) => (
                <li key={s.title} className="flex flex-col gap-3 border-t-2 border-ml-ink pt-5">
                  <span className="font-ml-display text-4xl text-ml-green">{i + 1}</span>
                  <h3 className="text-xl leading-snug font-bold">{s.title}</h3>
                  <p className="leading-relaxed text-ml-ink/85">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="badges-title" className="bg-ml-ink py-20 sm:py-28">
          <div className={cn(COLUMN, "grid gap-12 lg:grid-cols-[3fr_2fr] lg:gap-16")}>
            <div className="flex flex-col gap-10">
              <h2 id="badges-title" className={DISPLAY}>
                Badges
              </h2>
              <ul className="grid gap-4 sm:grid-cols-2">
                {STORIES.badges.map((b) => (
                  <li key={b.title} className="flex gap-4 rounded-2xl bg-white/[.07] p-5">
                    <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-full bg-signal-orange text-ml-ink">
                      <Icon name={b.icon} className="text-2xl" />
                    </span>
                    <span>
                      <span className="block text-lg leading-snug font-bold">{b.title}</span>
                      <span className="mt-1 block leading-relaxed text-white/80">{b.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-10">
              <h2 className={DISPLAY}>XP</h2>
              <ul className="flex flex-col divide-y divide-white/15 border-y border-white/15">
                {STORIES.xp.map((x) => (
                  <li key={x.label} className="flex items-baseline justify-between gap-6 py-3.5">
                    <span>{x.label}</span>
                    <span className="font-ml-display text-3xl text-signal-orange">{x.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section aria-labelledby="rules-title" className="bg-white py-20 text-ml-ink sm:py-28">
          <div className={cn(COLUMN, "flex flex-col items-start gap-10")}>
            <SectionHead id="rules-title" title="The rules" />
            <ul className="grid gap-x-12 gap-y-4 text-lg leading-relaxed sm:grid-cols-2">
              {STORIES.rules.map((r) => (
                <li key={r} className="flex gap-3">
                  <Icon name="check" className="mt-1 text-xl text-ml-green" />
                  {r}
                </li>
              ))}
            </ul>
            <Link href={STORIES.signup} className={pill.onLight}>
              Create your Kandari Profile
            </Link>
          </div>
        </section>
      </main>
      <SideTab href="/bangladesh#join" />
      <MotherlandFooter credits={travelCredits()} onLanding={false} />
    </div>
  );
}
