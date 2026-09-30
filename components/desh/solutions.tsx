import Link from "next/link";
import { StoryHeading } from "@/components/bangladesh/story-heading";
import { Icon } from "@/components/ui/icon";
import { SignalSeam, btn } from "@/components/ui/section-kit";
import { LIFT, glowStyle, surfaceAt } from "@/components/ui/surfaces";
import { BRAVERY, DUTY_COLUMNS, FOUNDER_QUOTE, LET_GO, RESOURCES } from "@/data/desh";
import { cn } from "@/lib/utils";

/** What we already have — the case that the country is not short of means. */
export function SolutionResources() {
  return (
    <section id="resources" aria-labelledby="resources-title" className="section-band-tinted scroll-mt-40 bg-black">
      <div className="mx-auto max-w-7xl px-gutter-x">
        <StoryHeading
          id="resources-title"
          index="০১"
          kicker="আমাদের পুঁজি"
          title="আমাদের যথেষ্ট আছে"
          accent="যথেষ্ট"
          lede="সমাধান বিদেশ থেকে আমদানি করার দরকার নেই। মানুষ, মাটি, নদী আর একসাথে দাঁড়ানোর ইতিহাস — এগুলোই শুরুর পুঁজি।"
        />
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-[repeat(2,minmax(0,1fr))] lg:grid-cols-[repeat(3,minmax(0,1fr))]">
          {RESOURCES.map((r, i) => {
            const tone = surfaceAt(i + (i >= 4 ? 1 : 0));
            return (
              <li key={r.title} className="story-reveal flex">
                <div style={glowStyle(tone.glow)} className={cn("group w-full rounded-3xl p-6 shadow-sm", LIFT, tone.card)}>
                  <span
                    className={cn(
                      "flex size-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:-rotate-6 motion-reduce:transition-none motion-reduce:group-hover:rotate-0",
                      tone.tile,
                    )}
                  >
                    <Icon name={r.icon} className="text-[28px]" />
                  </span>
                  <h3 className="mt-4 font-bengali text-xl font-bold">{r.title}</h3>
                  <p className="mt-2 font-bengali text-[15px] leading-relaxed">{r.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** The habits to drop, the living-cost spiral first — on an ink band. */
export function SolutionLetGo() {
  const [key, ...rest] = LET_GO;
  return (
    <section id="let-go" aria-labelledby="letgo-title" className="section-band-tinted relative isolate scroll-mt-40 overflow-hidden bg-text-primary text-white">
      <SignalSeam className="top-0" />
      <div className="mx-auto max-w-7xl px-gutter-x">
        <StoryHeading
          id="letgo-title"
          index="০২"
          kicker="ছাড়তে হবে"
          title="যা ছাড়তে হবে"
          accent="ছাড়তে"
          lede="সমস্যার বড় অংশ আমাদের নিজেদের অভ্যাসে। কয়েকটি মৌলিক ভুল শুধরালেই অনেক কিছু বদলায়।"
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <article
            style={glowStyle("var(--color-national-crimson)")}
            className={cn("story-reveal relative overflow-hidden rounded-3xl bg-national-crimson p-8 text-white sm:p-10", LIFT)}
          >
            <span className="rounded-full bg-white/15 px-3 py-1 font-bengali text-xs font-bold">সবচেয়ে জরুরি</span>
            <h3 className="mt-5 font-bengali text-3xl leading-tight font-bold sm:text-4xl">{key.habit}</h3>
            <p className="mt-4 font-bengali text-lg leading-relaxed text-white/90">{key.cost}</p>
            <div className="mt-6 rounded-2xl bg-text-primary p-5 text-white ring-1 ring-white/12">
              <p className="flex items-center gap-2 font-bengali text-sm font-bold text-signal-orange">
                <Icon name="swap_horiz" className="text-[20px]" /> বদলে যা করব
              </p>
              <p className="mt-2 font-bengali text-[15px] leading-relaxed">{key.instead}</p>
            </div>
          </article>

          <ul className="flex flex-col gap-4">
            {rest.map((h, i) => {
              const tone = surfaceAt(i === 0 ? 1 : 0);
              return (
                <li key={h.id} className="story-reveal flex">
                  <div style={glowStyle(tone.glow)} className={cn("w-full rounded-3xl p-5 shadow-sm", LIFT, tone.card)}>
                    <h3 className="font-bengali text-xl font-bold line-through decoration-national-crimson decoration-2">{h.habit}</h3>
                    <p className="mt-2 font-bengali text-[15px] leading-relaxed">{h.cost}</p>
                    <p className="mt-3 flex items-start gap-2 rounded-xl bg-text-primary p-3 font-bengali text-[15px] leading-relaxed font-semibold text-white ring-1 ring-white/12">
                      <Icon name="arrow_forward" className="mt-0.5 shrink-0 text-[18px] text-signal-orange" /> {h.instead}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** Who does what — the state, the citizen, and everyone for each other. */
export function SolutionDuties() {
  return (
    <section id="duties" aria-labelledby="duties-title" className="section-band-tinted scroll-mt-40 bg-black">
      <div className="mx-auto max-w-7xl px-gutter-x">
        <StoryHeading
          id="duties-title"
          index="০৩"
          kicker="দায়িত্ব"
          title="কে কী করবে"
          lede="রাষ্ট্রের দায় রাষ্ট্রকেই নিতে হবে — কিন্তু সেই অপেক্ষায় বসে থাকলে আমাদের এলাকা আরও পিছিয়ে যাবে। তিনটি হাত একসাথে কাজ করলে সমাধান টেকে।"
        />
        <ul className="grid gap-5 lg:grid-cols-[repeat(3,minmax(0,1fr))]">
          {DUTY_COLUMNS.map((d, i) => {
            const tone = surfaceAt(i);
            return (
              <li key={d.id} className="story-reveal flex">
                <div style={glowStyle(tone.glow)} className={cn("group w-full rounded-3xl p-7 shadow-sm", LIFT, tone.card)}>
                  <span
                    className={cn(
                      "flex size-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:-rotate-6 motion-reduce:transition-none motion-reduce:group-hover:rotate-0",
                      tone.tile,
                    )}
                  >
                    <Icon name={d.icon} className="text-[34px]" />
                  </span>
                  <h3 className="mt-4 font-bengali text-2xl font-bold">{d.who}</h3>
                  <p className="mt-2 font-bengali text-[15px] leading-relaxed">{d.lead}</p>
                  <ul className="mt-5 space-y-2.5">
                    {d.items.map((it) => (
                      <li key={it} className="flex items-start gap-2.5 font-bengali text-[15px] leading-snug">
                        <span aria-hidden className="mt-1.5 size-2 shrink-0 rounded-xs bg-current" />
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** Mahir's words, then the bravery close and where to act next — a green band. */
export function SolutionClose() {
  return (
    <section aria-labelledby="close-title" className="relative isolate overflow-hidden bg-bd-green text-white">
      <SignalSeam className="top-0" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(50%_60%_at_50%_0%,rgb(228_176_39/0.28),transparent_70%)]" />
      <div className="mx-auto max-w-5xl px-gutter-x py-20 text-center sm:py-28">
        <figure className="story-reveal">
          <blockquote className="font-bengali text-2xl leading-relaxed font-semibold text-balance sm:text-3xl">“{FOUNDER_QUOTE.text}”</blockquote>
          <p lang="en" className="mx-auto mt-4 max-w-2xl font-sans text-sm text-white/70 italic">
            “{FOUNDER_QUOTE.original}”
          </p>
          <figcaption className="mt-5 font-bengali text-base text-signal-orange">
            — {FOUNDER_QUOTE.author}, {FOUNDER_QUOTE.role}
          </figcaption>
        </figure>

        <h2 id="close-title" className="story-reveal mx-auto mt-16 max-w-3xl font-bengali text-3xl leading-tight font-bold text-balance text-signal-orange sm:text-5xl">
          {BRAVERY.title.split(BRAVERY.accent)[0]}
          <span className="text-white">{BRAVERY.accent}</span>
          {BRAVERY.title.split(BRAVERY.accent)[1]}
        </h2>
        <p className="mx-auto mt-5 max-w-2xl font-bengali text-lg leading-relaxed text-white/90">{BRAVERY.body}</p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/nagorik" className={cn(btn.gold, "font-bengali text-base normal-case")}>
            <Icon name="how_to_reg" className="text-[20px]" /> নাগরিক দায়িত্ব ও অধিকার
          </Link>
          <Link href="/cholo-bangladesh-gori/mission" className={cn(btn.ink, "font-bengali text-base normal-case")}>
            <Icon name="extension" className="text-[20px] text-signal-orange" /> চলো বাংলাদেশ গড়ি
          </Link>
          <Link href="/protibad" className={cn(btn.ghost, "font-bengali text-base normal-case")}>
            <Icon name="campaign" className="text-[20px]" /> অন্যায়ের প্রতিবাদ করুন
          </Link>
        </div>
      </div>
    </section>
  );
}
