/*
 * THESIS: two and a half months inside the lab, on a problem Bangladesh
 * still lives with, and a paid role at the end for those who carry it.
 * OWN-WORLD: the team page's: pitch-black ground, cobalt, navy and ink
 * fields, gold titles and actions, the gold pulse on the seams.
 * FIRST VIEWPORT: the claim and the gold Apply on the left, the cohort
 * dial on the right, the navy proof strip closing it.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, type CSSProperties } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ApplyForm } from "@/components/team/apply-form";
import { CohortDial } from "@/components/team/cohort-dial";
import { MemberAvatar } from "@/components/team/member-avatar";
import { Icon } from "@/components/ui/icon";
import { SectionHeading, SignalSeam, btn } from "@/components/ui/section-kit";
import { FAQ, LOOK_FOR, PHASES, TRACKS, trackTeam } from "@/data/fellowship";
import { departments, deptOrder, fellowship } from "@/data/team";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "R&D Fellowship | কাণ্ডারী-ল্যাব",
  description: `Kandari-Lab's R&D Fellowship: ${fellowship.cycle} on the lab's real research, from a wearable for the blind to health AI in Bangla. High performers are converted to paid roles.`,
};

/** Track cards take the three fields in turn. */
const FIELDS = ["bg-cobalt", "bg-bdnavy-900", "bg-text-primary", "bg-cobalt"];

const LINK = "rounded-sm font-semibold text-signal-orange underline decoration-signal-orange/40 underline-offset-4 transition-colors hover:decoration-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none";

export default function FellowshipPage() {
  const facts = [
    { label: "One cohort", value: fellowship.cycle },
    { label: "Research tracks", value: String(TRACKS.length) },
    { label: "Teams to learn from", value: String(deptOrder.length) },
    { label: "For high performers", value: "Paid roles" },
  ];

  return (
    <>
      <SiteHeader />
      <main className="relative w-full bg-black pt-header text-white lg:pt-header-lg">
        {/* Hero */}
        <section aria-labelledby="fellowship-title" className="relative w-full">
          <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-gutter-x py-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:py-20">
            <div className="flex flex-col items-start gap-6">
              <h1 id="fellowship-title" className="hero-rise max-w-[15ch] font-grotesk text-4xl leading-[1.06] font-bold tracking-tight text-balance text-white sm:text-5xl xl:text-6xl" style={{ "--d": "80ms" } as CSSProperties}>
                R&amp;D Fellowship: <span className="text-signal-orange">build what Bangladesh needs.</span>
              </h1>
              <p className="hero-rise max-w-[50ch] font-sans text-lg leading-relaxed text-white/80" style={{ "--d": "160ms" } as CSSProperties}>
                {fellowship.cycle} inside Kandari-Lab&apos;s research, on a problem the country still lives with: a wearable for the blind, waste turned into soil, health AI in Bangla, or vital signs on a wrist. High performers are converted to paid roles.
              </p>
              <div className="hero-rise flex flex-wrap gap-3" style={{ "--d": "240ms" } as CSSProperties}>
                <Link href="#apply" className={btn.gold}>
                  <Icon name="send" className="text-xl!" /> Apply for the next cohort
                </Link>
                <Link href="#tracks" className={btn.goldOutline}>
                  See the tracks
                </Link>
              </div>
            </div>
            <div className="hero-rise" style={{ "--d": "200ms" } as CSSProperties}>
              <CohortDial />
            </div>
          </div>

          <div className="relative w-full bg-bdnavy-900">
            <SignalSeam className="top-0" />
            <dl className="mx-auto grid max-w-7xl grid-cols-2 px-gutter-x lg:grid-cols-4">
              {facts.map((s, i) => (
                <div key={s.label} className={cn("flex flex-col gap-1 py-6 lg:px-8", i % 2 === 1 && "pl-5 max-lg:border-l max-lg:border-white/10", i > 1 && "max-lg:border-t max-lg:border-white/10", i > 0 ? "lg:border-l lg:border-white/10" : "lg:pl-0")}>
                  <dt className="font-sans text-sm text-bdnavy-200">{s.label}</dt>
                  <dd className="font-grotesk text-2xl font-bold text-signal-orange sm:text-3xl">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Tracks */}
        <section id="tracks" aria-labelledby="tracks-title" className="section-band mx-auto max-w-7xl px-gutter-x">
          <SectionHeading tone="dark" title={<span id="tracks-title">Four research tracks</span>} lead="Each track is a real project at the lab. Pick the one whose problem you want to carry for a cohort." />
          <ul className="grid gap-5 md:grid-cols-2">
            {TRACKS.map((t, i) => {
              const people = trackTeam(t);
              return (
                <li key={t.id} className="story-reveal flex">
                  <article aria-labelledby={`track-${t.id}`} className={cn("flex w-full flex-col rounded-3xl p-6 ring-1 ring-white/12 sm:p-8", FIELDS[i])}>
                    <div className="flex items-start justify-between gap-4">
                      <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-signal-orange text-text-primary">
                        <Icon name={t.icon} className="text-3xl!" />
                      </span>
                      <span className={cn("rounded-full px-3 py-1 font-sans text-xs font-bold", t.status === "In research" ? "text-white ring-1 ring-white/30 ring-inset" : "bg-signal-orange text-text-primary")}>{t.status}</span>
                    </div>
                    <h3 id={`track-${t.id}`} className="mt-6 font-grotesk text-2xl font-bold text-signal-orange">{t.title}</h3>
                    <p className="mt-1 font-sans text-sm font-semibold text-white/75">{t.project}</p>
                    <p className="mt-4 font-sans text-base leading-relaxed text-white/90">{t.summary}</p>

                    <h4 className="mt-6 font-grotesk text-sm font-bold text-white">You would work on</h4>
                    <ul className="mt-3 space-y-2">
                      {t.work.map((w) => (
                        <li key={w} className="flex items-start gap-2.5 font-sans text-sm leading-relaxed text-white/85">
                          <Icon name="check_circle" filled className="mt-0.5 text-base! text-signal-orange" /> {w}
                        </li>
                      ))}
                    </ul>

                    <ul aria-label="Skills you would use" className="mt-5 flex flex-wrap gap-1.5">
                      {t.skills.map((s) => (
                        <li key={s} className="rounded-full px-2.5 py-1 font-sans text-xs font-semibold text-white/90 ring-1 ring-white/20 ring-inset">{s}</li>
                      ))}
                    </ul>

                    <div className="mt-auto flex flex-col gap-4 border-t border-white/12 pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-sans text-xs text-white/65">Who you would work with</p>
                        {people.length > 0 ? (
                          <div className="mt-2 flex items-center gap-3">
                            <span className="flex -space-x-2">
                              {people.slice(0, 5).map((m) => (
                                <Link key={m.slug} href={`/team/${m.slug}`} aria-label={`${m.name}, ${m.role}`} title={m.name} className="rounded-full ring-2 ring-black transition-transform hover:z-10 hover:-translate-y-0.5 focus-visible:z-10 focus-visible:ring-signal-orange focus-visible:outline-none motion-reduce:transition-none">
                                  <MemberAvatar member={m} className="size-9" textClassName="text-xs" sizes="36px" />
                                </Link>
                              ))}
                            </span>
                            <span className="font-sans text-sm text-white/85">{people.length} on this project</span>
                          </div>
                        ) : (
                          <p className="mt-1 font-sans text-sm font-semibold text-white/85">{t.depts.map((d) => departments[d].label).join(" and ")} teams</p>
                        )}
                        {t.research && (
                          <Link href={`/research/${t.research}`} className={cn(LINK, "mt-3 inline-flex items-center gap-1 font-sans text-sm")}>
                            Read the research so far
                          </Link>
                        )}
                      </div>
                      <Link href={`/team/fellowship?track=${t.id}#apply`} className={cn(btn.goldOutline, "shrink-0")}>
                        Choose this track
                      </Link>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </section>

        {/* How a cohort runs */}
        <section aria-labelledby="cycle-title" className="section-band-tinted relative isolate overflow-hidden bg-text-primary">
          <SignalSeam className="top-0" />
          <div className="mx-auto max-w-7xl px-gutter-x">
            <SectionHeading tone="dark" title={<span id="cycle-title">How a cohort runs</span>} lead={`${fellowship.cycle}, about ten weeks, from a problem to a demo.`} />
            <ol className="relative grid gap-8 lg:grid-cols-4 lg:gap-6">
              <span aria-hidden className="pointer-events-none absolute top-7 bottom-7 left-7 w-px overflow-hidden bg-white/15 lg:right-[12.5%] lg:bottom-auto lg:left-[12.5%] lg:h-px lg:w-auto">
                <span className="signal-path-run absolute inset-x-0 top-0 h-1/4 bg-signal-orange lg:inset-x-auto lg:inset-y-0 lg:left-0 lg:h-auto lg:w-1/4" />
              </span>
              {PHASES.map((p, i) => (
                <li key={p.title} className="story-reveal relative grid grid-cols-[3.5rem_minmax(0,1fr)] items-start gap-4 lg:flex lg:flex-col lg:items-center lg:gap-0 lg:text-center">
                  <span className={cn("relative z-10 grid size-14 place-items-center rounded-2xl", i === PHASES.length - 1 ? "bg-signal-orange text-text-primary" : i % 2 === 0 ? "bg-cobalt text-signal-orange" : "bg-bdnavy-900 text-signal-orange ring-1 ring-white/15")}>
                    <Icon name={p.icon} className="text-3xl!" />
                  </span>
                  <div className="lg:mt-5">
                    <p className="font-sans text-sm font-semibold text-signal-orange">{p.weeks}</p>
                    <h3 className="mt-1 font-grotesk text-lg font-bold text-white">{p.title}</h3>
                    <p className="mt-1.5 max-w-[34ch] font-sans text-sm leading-relaxed text-white/75 lg:mx-auto">{p.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Who we look for */}
        <section aria-labelledby="look-title" className="section-band mx-auto max-w-7xl px-gutter-x">
          <SectionHeading tone="dark" title={<span id="look-title">Who we look for</span>} lead="Not a grade or a degree: a problem you care about, and proof that you can build." />
          <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {LOOK_FOR.map((l) => (
              <li key={l.title} className="story-reveal border-t-2 border-signal-orange pt-5">
                <Icon name={l.icon} className="text-3xl! text-signal-orange" />
                <h3 className="mt-3 font-grotesk text-lg font-bold text-white">{l.title}</h3>
                <p className="mt-1.5 font-sans text-sm leading-relaxed text-white/75">{l.body}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Apply */}
        <section id="apply" aria-labelledby="apply-title" className="section-band-tinted relative isolate bg-text-primary">
          <SignalSeam className="top-0" />
          <div className="mx-auto grid max-w-7xl gap-10 px-gutter-x lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start">
            <div className="lg:sticky lg:top-[calc(var(--spacing-header-lg)+2rem)]">
              <h2 id="apply-title" className="story-reveal font-grotesk text-3xl leading-tight font-bold tracking-tight text-balance text-signal-orange sm:text-4xl">
                Apply for the next cohort
              </h2>
              <p className="story-reveal mt-4 max-w-md font-sans text-base leading-relaxed text-white/80">
                One short form: who you are, the track you want, why, and one thing you built. We read every application before a cohort is chosen, and announce each call on Kandari Profile.
              </p>
              <ul className="story-reveal mt-6 space-y-3 font-sans text-sm text-white/85">
                <li className="flex items-start gap-2.5"><Icon name="schedule" className="mt-0.5 text-lg! text-signal-orange" /> Takes about five minutes</li>
                <li className="flex items-start gap-2.5"><Icon name="swap_horiz" className="mt-0.5 text-lg! text-signal-orange" /> Change your track until the call closes</li>
                <li className="flex items-start gap-2.5"><Icon name="workspace_premium" className="mt-0.5 text-lg! text-signal-orange" /> High performers are converted to paid roles</li>
              </ul>
            </div>
            <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-bdnavy-900 motion-reduce:animate-none" aria-label="Loading" />}>
              <ApplyForm />
            </Suspense>
          </div>
        </section>

        {/* Questions */}
        <section aria-labelledby="faq-title" className="section-band mx-auto max-w-4xl px-gutter-x">
          <SectionHeading tone="dark" title={<span id="faq-title">Questions</span>} />
          <div className="border-t border-white/12">
            {FAQ.map((f) => (
              <details key={f.q} className="group border-b border-white/12">
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 rounded-lg py-4 font-grotesk text-lg font-bold text-white transition-colors select-none hover:text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <Icon name="expand_more" className="shrink-0 text-2xl! text-signal-orange transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-open:rotate-180 motion-reduce:transition-none" />
                </summary>
                <p className="live-in max-w-[65ch] pb-6 font-sans text-base leading-relaxed text-white/80">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
