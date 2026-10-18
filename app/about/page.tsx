/*
 * THESIS: the page is the pixel map being repaired. It opens on a photograph
 * that arrives as a few solid blocks and resolves to full sharpness, then
 * tells the company as one chapter scroll; it refuses the about-page
 * template of timeline, team grid and icon cards.
 * OWN-WORLD: the home page's: pitch-black ground; each charter topic a
 * full-width band in the field it wears on the home page (navy, ink, gold)
 * with its own motion graphic; gold headings; kit buttons only.
 * STORY: what is broken → the challenge accepted → why no vision → the
 * mission → the unending goal → each product as problem/repair → impact →
 * values → join Kandari Profile.
 * FIRST VIEWPORT: claim and summary left with the gold Join action, the
 * resolving photograph right, the chapter index under both.
 * FORM: chapter scroll, chosen by Mahir (2026-10-18); no concept roll, the
 * world is inherited.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Chapter } from "@/components/about/chapter";
import { PixelResolve } from "@/components/about/pixel-resolve";
import { Solve } from "@/components/about/solve";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CHARTER_TOPIC } from "@/components/sections/charter-looks";
import { Icon } from "@/components/ui/icon";
import { SectionHeading, btn } from "@/components/ui/section-kit";
import { ABOUT_SUMMARY, VALUES } from "@/data/about";
import { charterSlides } from "@/data/charter";

export const metadata: Metadata = {
  title: "About Us | কাণ্ডারী-ল্যাব",
  description:
    "Who Kandari-Lab is: the problem we see in Bangladesh, the challenge we accepted, our mission and our unending goal, the products and services that answer them, and the values we hold to.",
};

const slide = (id: string) => charterSlides.find((s) => s.id === id)!;
const STORY = ["problem", "challenge", "vision", "mission", "goal"].map(slide);
const IMPACT = slide("impact");

/** The chapter index under the hero: every stop on the page, in order. */
const INDEX = [
  ...STORY.map((s) => ({ href: `#${s.id}`, ...CHARTER_TOPIC[s.id] })),
  { href: "#solutions", name: "Solutions", icon: "construction" },
  { href: "#impact", ...CHARTER_TOPIC.impact },
  { href: "#values", name: "Values", icon: "favorite" },
];

/** What a Kandari Profile gives a member today (CLAUDE.md §1 and §7). */
const MEMBERSHIP = [
  { icon: "notifications_active", text: "New research and product releases, the day they land." },
  { icon: "tune", text: "Follow only the sectors and products you care about." },
  { icon: "groups", text: "Your way into শিক্ষিতদের মিডিয়া, our members-only skills platform." },
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="relative w-full bg-black pt-header lg:pt-header-lg">
        {/* The claim, and the photograph repairing itself. */}
        <section aria-labelledby="about-title" className="mx-auto max-w-7xl px-gutter-x pt-12 pb-16 lg:pt-20 lg:pb-24">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
            <div className="hero-rise flex flex-col gap-6">
              <p className="font-grotesk text-sm font-bold text-signal-orange">About Kandari-Lab</p>
              <h1 id="about-title" className="font-grotesk text-4xl leading-[1.05] font-bold tracking-tight text-balance text-white sm:text-5xl xl:text-7xl">
                We repair Bangladesh, <span className="text-signal-orange">one pixel at a time.</span>
              </h1>
              <p className="max-w-[60ch] text-base leading-relaxed text-white/80 lg:text-lg">{ABOUT_SUMMARY}</p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="#join" className={btn.gold}>
                  Join Kandari Profile
                  <Icon name="arrow_forward" className="text-lg" />
                </Link>
                <Link href="#problem" className={btn.goldOutline}>
                  Read our story
                </Link>
              </div>
            </div>

            <PixelResolve
              src="/hero/Hero-10.jpg"
              alt="ভোরের কুয়াশায় দুই প্রবীণ একে অপরকে পানি এগিয়ে দিচ্ছেন"
              sizes="(min-width: 1024px) 600px, 100vw"
              position={[0.5, 0.28]}
              className="aspect-4/5 rounded-3xl ring-1 ring-white/12 sm:aspect-5/4 lg:aspect-4/5"
            />
          </div>

          <nav aria-label="On this page" className="mt-14 border-t border-white/12 pt-6">
            <ul className="flex gap-x-6 gap-y-3 overflow-x-auto pb-2 [scrollbar-width:none] lg:flex-wrap lg:overflow-visible">
              {INDEX.map((item) => (
                <li key={item.href} className="shrink-0">
                  <Link
                    href={item.href}
                    className="group/idx flex min-h-11 items-center gap-2 rounded-md font-grotesk text-sm font-bold text-white/80 transition-colors duration-300 hover:text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
                  >
                    <Icon name={item.icon} className="text-xl text-signal-orange" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </section>

        {/* The story, one solid band per chapter, the graphic switching sides. */}
        {STORY.map((s, i) => (
          <Chapter key={s.id} slide={s} flip={i % 2 === 1} />
        ))}

        <Solve />

        {/* Its charts carry their own source line: dossier scenarios, not Kandari-Lab results. */}
        <Chapter slide={IMPACT} />

        {/* What we hold to: four statements, set like a manifesto. */}
        <section id="values" aria-labelledby="values-title" className="section-band scroll-mt-header lg:scroll-mt-header-lg">
          <div className="mx-auto max-w-7xl px-gutter-x">
            <SectionHeading
              tone="dark"
              title={<span id="values-title">What we hold to</span>}
              lead="Four rules for every product, service and line of research we take on."
            />
            <ul className="grid gap-x-16 gap-y-12 sm:grid-cols-2">
              {VALUES.map((v) => (
                <li key={v.title} className="story-reveal group/value border-t-2 border-signal-orange pt-6">
                  <Icon
                    name={v.icon}
                    className="text-4xl! text-signal-orange transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/value:-rotate-6 motion-reduce:transition-none"
                  />
                  <h3 className="mt-4 font-grotesk text-3xl leading-tight font-bold tracking-tight text-white">{v.title}</h3>
                  <p className="mt-3 max-w-[48ch] text-lg leading-relaxed text-white/80">{v.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* The close: the way in, and what it gives. (The footer below carries the motto.) */}
        <section id="join" aria-labelledby="join-title" className="mx-auto max-w-7xl scroll-mt-header px-gutter-x pb-seam lg:scroll-mt-header-lg">
          <div className="story-reveal grid gap-10 overflow-hidden rounded-3xl bg-signal-orange p-6 text-text-primary shadow-tile sm:p-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-16 lg:p-14">
            <div className="flex flex-col gap-4">
              <h2 id="join-title" className="font-grotesk text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
                Join Kandari Profile
              </h2>
              <p className="text-base leading-relaxed text-text-primary/80">
                Free to join, always. Hear first about new research and product releases, and help choose the next pixel we fix.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/signup" className={btn.navy}>
                  Join Kandari Profile
                  <Icon name="arrow_forward" className="text-lg" />
                </Link>
                <Link href="/team" className={btn.navyOutline}>
                  Meet the crew
                </Link>
              </div>
            </div>
            <ul className="flex flex-col gap-5 border-text-primary/15 lg:border-l lg:pl-12">
              {MEMBERSHIP.map((m) => (
                <li key={m.icon} className="flex gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-bdnavy-900 text-signal-orange">
                    <Icon name={m.icon} className="text-2xl" />
                  </span>
                  <p className="self-center text-base leading-relaxed font-semibold">{m.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
