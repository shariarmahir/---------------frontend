import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { CardDetails, TapCard, TapCue } from "@/components/ui/card-details";
import { Icon } from "@/components/ui/icon";
import { TrackLink } from "@/components/showcase/showcase";
import { SectionHeading, btn } from "@/components/ui/section-kit";
import { cn } from "@/lib/utils";

/**
 * Executives are poster cards: a solid colour field (the Pixel-Map palette),
 * the portrait bleeding off the top and fading into the colour, name and
 * role set on the colour below: gold for the CEO, ink for the COO, navy
 * for the CMO. Mahir's is his own photograph
 * (public/team); the other two are stock mock-ups to replace with real
 * portraits.
 */
const EXECUTIVES = [
  {
    name: "Mahir Shariar Mahin",
    photo: "/team/mahir_shariar_mahin.png",
    role: "Founder & Team Leader",
    short: "Founder & CEO",
    title: "Chief Executive Officer",
    blurb:
      "Spearheading native deep-tech roadmaps, hardware prototyping, and national clinical integration protocols.",
    surface: "bg-cobalt text-white ring-1 ring-white/12",
    fade: "to-cobalt",
    glow: "var(--color-cobalt)",
    // The title is a solid pill so it reads as a label, not body copy.
    pill: "bg-signal-orange text-text-primary",
    heading: "text-signal-orange",
  },
  {
    name: "Sadman bin Arif",
    photo: "/team/sadman-bin-arif.jpg",
    role: "Executive Governance",
    short: "COO",
    title: "Chief Operating Officer",
    blurb:
      "Orchestrating 64-district smart pharmacy scaling, government telemetry compliance, and supply chain logistics.",
    surface: "bg-text-primary text-white ring-1 ring-white/12",
    fade: "to-text-primary",
    glow: "var(--color-signal-orange)",
    pill: "bg-signal-orange text-text-primary",
  },
  {
    name: "Nabeel Shadad",
    photo: "/team/nabeel-shadad.jpg",
    role: "Strategic Expansion",
    short: "CMO",
    title: "Chief Marketing Officer",
    blurb:
      "Leading international hardware partnerships, medical institutional adoption, and public narrative momentum.",
    surface: "bg-bdnavy-900 text-white ring-1 ring-white/12",
    fade: "to-bdnavy-900",
    glow: "var(--color-bdnavy-400)",
    pill: "bg-signal-orange text-text-primary",
  },
];

/**
 * Per field for the functional leads: the card, its icon tile (the
 * contrasting colour), the name chips and the hairline over the skills.
 * Ink and navy keep their edge on the black ground with a faint white ring.
 */
const LEAD_LOOKS = {
  navy: {
    surface: "bg-bdnavy-900 text-white ring-1 ring-white/12",
    tile: "bg-signal-orange text-text-primary",
    chip: "bg-white/8 ring-white/15",
    rule: "border-white/12",
    glow: "var(--color-bdnavy-400)",
    heading: "",
  },
  cobalt: {
    surface: "bg-cobalt text-white ring-1 ring-white/12",
    tile: "bg-signal-orange text-text-primary",
    chip: "bg-white/8 ring-white/15",
    rule: "border-white/12",
    glow: "var(--color-cobalt)",
    // White, not gold: these titles are 16–18px, and gold on cobalt (3.9:1) holds only for large text.
    heading: "",
  },
  ink: {
    surface: "bg-text-primary text-white ring-1 ring-white/12",
    tile: "bg-signal-orange text-text-primary",
    chip: "bg-white/8 ring-white/15",
    rule: "border-white/12",
    glow: "var(--color-signal-orange)",
    heading: "",
  },
};

/**
 * The three functional leads, staggered against the executive row above
 * (navy under cobalt, cobalt under ink, ink under navy).
 */
const LEADS = [
  {
    title: "Concept & Clinical User Empathy",
    icon: "psychology",
    people: ["Istiake Ahmed", "Safia Mubassara Ruzba", "Jamil Hossan"],
    note: "User empathy, ergonomic medical casing, product semantics.",
    look: LEAD_LOOKS.navy,
  },
  {
    title: "Sensors & Embedded Systems",
    icon: "memory",
    people: ["Janassor Ahmed", "Sharul Bhuiya", "Safia Mubassara Ruzba"],
    note: "Micro-soldering, LiDAR circuits, low-power telemetry & antenna RF.",
    look: LEAD_LOOKS.cobalt,
  },
  {
    title: "Fullstack, AI & SWASTI Mobile",
    icon: "code",
    people: ["Luban Ahmed", "Shabbin Ahmed"],
    note: "Bengali RAG models, Flutter app core, real-time WebSockets & CNNs.",
    look: LEAD_LOOKS.ink,
  },
];

export function LeadershipSection() {
  return (
    <section id="leadership" className="section-band mx-auto max-w-384 px-gutter-x">
      {/* The way to the whole crew sits top-right, as on the products section. */}
      <div className="mb-8 grid gap-x-12 gap-y-4 sm:mb-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <SectionHeading
          tone="dark"
          className="mb-0 sm:mb-0"
          title={<>Foundership &amp; Engineering Command</>}
          lead="Led by home-grown researchers, robotics specialists, and software architects determined to establish national hardware sovereignty."
        />
        <div className="story-reveal">
          <TrackLink href="/team">Meet the Crew</TrackLink>
        </div>
      </div>

      {/*
        * Executive row. A phone swipes through three full portrait cards (the
        * next one peeking, the row bleeding to the screen's sides); from sm up
        * they sit three across, the portraits cropped to one 4:3 frame (3:2 from lg) so the
        * row stays inside a screen. The scroll reveal lives on the list so a
        * card waiting off to the side is never left hidden.
        */}
      <ul
        aria-label="Executives"
        className={cn(
          "story-reveal no-scrollbar -mx-gutter-x mb-4 flex snap-x snap-mandatory scroll-px-gutter-x items-start gap-3 overflow-x-auto px-gutter-x pt-2 pb-3",
          "sm:mx-0 sm:mb-5 sm:grid sm:grid-cols-3 sm:items-stretch sm:gap-5 sm:overflow-visible sm:px-0 sm:pt-0 sm:pb-0",
        )}
      >
        {EXECUTIVES.map((exec) => (
          <li key={exec.name} className="flex w-[74%] max-w-72 shrink-0 snap-start sm:w-auto sm:max-w-none">
            <TapCard
              label={exec.name}
              hintClassName="px-5 pb-5"
              hint={
                <span className="flex items-center justify-between gap-2 font-sans text-sm font-bold opacity-90">
                  {exec.short}
                  <TapCue />
                </span>
              }
              style={{ "--glow": exec.glow } as CSSProperties}
              className={cn(
                "group flex w-full flex-col overflow-hidden rounded-2xl shadow-sm sm:rounded-3xl",
                "[-webkit-tap-highlight-color:transparent] touch-manipulation transition-[translate,scale,rotate,transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-2 hover:shadow-[0_28px_48px_-22px_var(--glow)] active:-translate-y-2 active:shadow-[0_28px_48px_-22px_var(--glow)] active:scale-[0.98] active:duration-150 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                exec.surface,
              )}
            >
              {/* Portrait, fading into the card colour at its foot. */}
              <div className="relative aspect-square w-full overflow-hidden sm:aspect-4/3 lg:aspect-3/2">
                <Image
                  src={exec.photo}
                  alt={`${exec.name}, ${exec.title}`}
                  fill
                  sizes="(min-width: 1280px) 400px, (min-width: 640px) 33vw, 290px"
                  quality={90}
                  className="object-cover object-top sm:object-[50%_20%] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 motion-reduce:transition-none"
                />
                <div aria-hidden className={cn("absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-b from-transparent", exec.fade)} />
              </div>

              <div className="relative -mt-8 flex flex-1 flex-col px-5 pb-1 sm:px-4 sm:pb-5 lg:px-6 lg:pb-6">
                <span className={cn("mb-3 w-fit rounded-full px-3 py-1 font-sans tabular-nums text-xs leading-tight font-bold", exec.pill)}>
                  {exec.title}
                </span>
                <h3 className={cn("font-grotesk text-xl leading-tight font-bold", "heading" in exec && exec.heading)}>{exec.name}</h3>
                <CardDetails>
                  <p className="mt-1 font-sans tabular-nums text-xs leading-tight font-semibold opacity-80">{exec.role}</p>
                  <p className="mt-3 pb-4 font-sans text-sm leading-relaxed sm:pb-0">{exec.blurb}</p>
                </CardDetails>
              </div>
            </TapCard>
          </li>
        ))}
      </ul>

      {/* Functional leads: one compact row each on a phone (tap for the team), three across from sm. */}
      <ul className="story-reveal grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-5">
        {LEADS.map(({ look, ...lead }) => (
          <li key={lead.title} className="flex">
            <TapCard
              label={lead.title}
              style={{ "--glow": look.glow } as CSSProperties}
              className={cn(
                "group flex w-full flex-col rounded-2xl px-4 py-3 shadow-sm sm:rounded-3xl sm:p-5 xl:p-6",
                "[-webkit-tap-highlight-color:transparent] touch-manipulation transition-[translate,scale,rotate,transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-2 hover:shadow-[0_28px_48px_-22px_var(--glow)] active:-translate-y-2 active:shadow-[0_28px_48px_-22px_var(--glow)] active:scale-[0.98] active:duration-150 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                look.surface,
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-xl sm:size-11",
                    "transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-rotate-6 motion-reduce:transition-none motion-reduce:group-hover:rotate-0",
                    look.tile,
                  )}
                >
                  <Icon name={lead.icon} className="text-2xl" />
                </span>
                <h4 className={cn("flex-1 font-grotesk text-base leading-tight font-bold text-balance sm:flex-initial sm:text-base lg:text-lg", look.heading)}>{lead.title}</h4>
                <TapCue className="opacity-80" />
              </div>
              <CardDetails grow className="flex flex-col">
                <ul aria-label="Team" className="mt-4 flex flex-wrap gap-1.5 sm:mt-5">
                  {lead.people.map((person) => (
                    <li key={person} className={cn("rounded-full px-2.5 py-1 text-xs font-medium ring-1", look.chip)}>
                      {person}
                    </li>
                  ))}
                </ul>
                <p className={cn("mt-4 border-t pt-3 font-sans tabular-nums text-xs leading-snug opacity-80 sm:mt-auto sm:pt-4", look.rule)}>{lead.note}</p>
              </CardDetails>
            </TapCard>
          </li>
        ))}
      </ul>

      {/* Fellowship strip — cobalt, gold carrying the title and the action. */}
      <div className="story-reveal relative isolate mt-6 sm:mt-5 flex flex-col items-start justify-between gap-4 overflow-hidden rounded-3xl bg-cobalt p-5 text-white shadow-tile ring-1 ring-white/12 sm:flex-row sm:items-center sm:p-6">
        <div className="flex items-center gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-signal-orange text-text-primary">
            <Icon name="school" className="text-2xl" />
          </span>
          <div>
            <span className="block font-grotesk text-xl font-bold text-signal-orange">R&amp;D Fellowship Cohort</span>
            <p className="font-sans text-xs text-white/80 sm:text-sm">
              2.5-month cohorts on the lab&apos;s early-stage research. High
              performers are converted to paid roles.
            </p>
          </div>
        </div>

        <Link href="/team/fellowship" className={cn(btn.gold, "shrink-0")}>
          Explore the Fellowship
        </Link>
      </div>
    </section>
  );
}
