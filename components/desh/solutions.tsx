import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { BRAVERY, DUTY_COLUMNS, FOUNDER_QUOTE, LET_GO, RESOURCES } from "@/data/desh";
import { cn } from "@/lib/utils";

/** What we already have — the case that the country is not short of means. */
export function SolutionResources() {
  return (
    <section id="resources" aria-labelledby="resources-title" className="section-band scroll-mt-40 bg-[#fbf8f1]">
      <div className="mx-auto max-w-7xl px-gutter-x">
        <div className="story-reveal max-w-3xl">
          <h2 id="resources-title" className="font-bengali text-3xl leading-tight font-bold text-balance text-text-primary sm:text-4xl">
            আমাদের <span className="text-bd-green">যথেষ্ট</span> আছে
          </h2>
          <p className="mt-3 font-bengali text-lg leading-relaxed text-text-secondary">সমাধান বিদেশ থেকে আমদানি করার দরকার নেই। মানুষ, মাটি, নদী আর একসাথে দাঁড়ানোর ইতিহাস — এগুলোই শুরুর পুঁজি।</p>
        </div>
        <ul className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {RESOURCES.map((r) => (
            <li key={r.title} className="story-reveal border-t-2 border-bd-green pt-5">
              <Icon name={r.icon} className="text-[32px] text-bd-green" />
              <h3 className="mt-3 font-bengali text-xl font-bold text-text-primary">{r.title}</h3>
              <p className="mt-2 font-bengali text-[15px] leading-relaxed text-text-secondary">{r.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** The habits to drop, the living-cost spiral first. */
export function SolutionLetGo() {
  const [key, ...rest] = LET_GO;
  return (
    <section id="let-go" aria-labelledby="letgo-title" className="section-band scroll-mt-40 bg-white">
      <div className="mx-auto max-w-7xl px-gutter-x">
        <div className="story-reveal max-w-3xl">
          <h2 id="letgo-title" className="font-bengali text-3xl leading-tight font-bold text-balance text-text-primary sm:text-4xl">
            যা <span className="text-national-crimson">ছাড়তে</span> হবে
          </h2>
          <p className="mt-3 font-bengali text-lg leading-relaxed text-text-secondary">সমস্যার বড় অংশ আমাদের নিজেদের অভ্যাসে। কয়েকটি মৌলিক ভুল শুধরালেই অনেক কিছু বদলায়।</p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <article className="relative overflow-hidden rounded-3xl bg-national-crimson p-8 text-white sm:p-10">
            <span className="rounded-full bg-white/15 px-3 py-1 font-bengali text-xs font-bold">সবচেয়ে জরুরি</span>
            <h3 className="mt-5 font-bengali text-3xl leading-tight font-bold sm:text-4xl">{key.habit}</h3>
            <p className="mt-4 font-bengali text-lg leading-relaxed text-white/90">{key.cost}</p>
            <div className="mt-6 rounded-2xl bg-white p-5 text-text-primary">
              <p className="flex items-center gap-2 font-bengali text-sm font-bold text-bd-green-dark">
                <Icon name="swap_horiz" className="text-[20px]" /> বদলে যা করব
              </p>
              <p className="mt-2 font-bengali text-[15px] leading-relaxed">{key.instead}</p>
            </div>
          </article>

          <ul className="flex flex-col gap-4">
            {rest.map((h) => (
              <li key={h.id} className="rounded-2xl border border-slate-200 p-5">
                <h3 className="font-bengali text-xl font-bold text-national-crimson line-through decoration-2">{h.habit}</h3>
                <p className="mt-2 font-bengali text-[15px] leading-relaxed text-text-secondary">{h.cost}</p>
                <p className="mt-3 flex items-start gap-2 font-bengali text-[15px] leading-relaxed font-semibold text-bd-green-dark">
                  <Icon name="arrow_forward" className="mt-0.5 text-[18px]" /> {h.instead}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** Who does what — the state, the citizen, and everyone for each other. */
export function SolutionDuties() {
  return (
    <section id="duties" aria-labelledby="duties-title" className="section-band-tinted scroll-mt-40 bg-mint-subtle">
      <div className="mx-auto max-w-7xl px-gutter-x">
        <div className="story-reveal max-w-3xl">
          <h2 id="duties-title" className="font-bengali text-3xl leading-tight font-bold text-balance text-text-primary sm:text-4xl">
            কে কী করবে
          </h2>
          <p className="mt-3 font-bengali text-lg leading-relaxed text-text-secondary">
            রাষ্ট্রের দায় রাষ্ট্রকেই নিতে হবে — কিন্তু সেই অপেক্ষায় বসে থাকলে আমাদের এলাকা আরও পিছিয়ে যাবে। তিনটি হাত একসাথে কাজ করলে সমাধান টেকে।
          </p>
        </div>
        <ul className="mt-10 grid gap-5 lg:grid-cols-3">
          {DUTY_COLUMNS.map((d, i) => (
            <li key={d.id}>
              <Card
                style={{ "--card-accent": i === 2 ? "var(--color-signal-orange)" : "var(--color-bd-green)" } as React.CSSProperties}
                className="glass-card block h-full rounded-3xl border border-slate-200 bg-white p-7 text-base ring-0"
              >
                <Icon name={d.icon} className={cn("text-[34px]", i === 2 ? "text-amber-600" : "text-bd-green")} />
                <h3 className="mt-3 font-bengali text-2xl font-bold text-text-primary">{d.who}</h3>
                <p className="mt-2 font-bengali text-[15px] leading-relaxed text-text-secondary">{d.lead}</p>
                <ul className="mt-5 space-y-2.5">
                  {d.items.map((it) => (
                    <li key={it} className="flex items-start gap-2.5 font-bengali text-[15px] leading-snug text-text-primary">
                      <span aria-hidden className="mt-1.5 size-2 shrink-0 rounded-xs bg-bd-green" />
                      {it}
                    </li>
                  ))}
                </ul>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Mahir's words, then the bravery close and where to act next. */
export function SolutionClose() {
  return (
    <section aria-labelledby="close-title" className="relative isolate overflow-hidden bg-bdgreen-950 text-white">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(50%_60%_at_50%_0%,rgb(228_176_39/0.22),transparent_70%)]" />
      <div className="mx-auto max-w-5xl px-gutter-x py-20 text-center sm:py-28">
        <figure>
          <blockquote className="font-bengali text-2xl leading-relaxed font-semibold text-balance sm:text-3xl">“{FOUNDER_QUOTE.text}”</blockquote>
          <p lang="en" className="mx-auto mt-4 max-w-2xl font-sans text-sm text-emerald-50/60 italic">
            “{FOUNDER_QUOTE.original}”
          </p>
          <figcaption className="mt-5 font-bengali text-base text-signal-orange">
            — {FOUNDER_QUOTE.author}, {FOUNDER_QUOTE.role}
          </figcaption>
        </figure>

        <h2 id="close-title" className="mx-auto mt-16 max-w-3xl font-bengali text-3xl leading-tight font-bold text-balance sm:text-5xl">
          {BRAVERY.title.split(BRAVERY.accent)[0]}
          <span className="text-national-crimson">{BRAVERY.accent}</span>
          {BRAVERY.title.split(BRAVERY.accent)[1]}
        </h2>
        <p className="mx-auto mt-5 max-w-2xl font-bengali text-lg leading-relaxed text-emerald-50/85">{BRAVERY.body}</p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/nagorik"
            className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-signal-orange px-6 font-bengali text-base font-bold text-text-primary shadow-[0_10px_30px_-10px_rgb(228_176_39/0.8)] transition-[filter] hover:brightness-95 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
          >
            <Icon name="how_to_reg" className="text-[20px]" /> নাগরিক দায়িত্ব ও অধিকার
          </Link>
          <Link
            href="/cholo-bangladesh-gori/mission"
            className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/30 px-6 font-bengali text-base font-bold text-white transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
          >
            <Icon name="extension" className="text-[20px]" /> চলো বাংলাদেশ গড়ি
          </Link>
          <Link
            href="/protibad"
            className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/30 px-6 font-bengali text-base font-bold text-white transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
          >
            <Icon name="campaign" className="text-[20px]" /> অন্যায়ের প্রতিবাদ করুন
          </Link>
        </div>
      </div>
    </section>
  );
}
