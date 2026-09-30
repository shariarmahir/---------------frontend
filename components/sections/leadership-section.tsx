import Image from "next/image";
import type { CSSProperties } from "react";
import { CardDetails, TapCard } from "@/components/ui/card-details";
import { Icon } from "@/components/ui/icon";
import { SectionHeading, btn } from "@/components/ui/section-kit";
import { cn } from "@/lib/utils";

/**
 * Executives are poster cards: a solid colour field (the Pixel-Map palette),
 * the portrait bleeding off the top and fading into the colour, name and
 * role set on the colour below: gold for the CEO, green for the COO,
 * orange for the CMO. Mahir's is his own photograph
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
    surface: "bg-signal-orange text-text-primary",
    fade: "to-signal-orange",
    glow: "var(--color-signal-orange)",
    // The title is a solid pill so it reads as a label, not body copy.
    pill: "bg-text-primary text-signal-orange",
  },
  {
    name: "Sadman bin Arif",
    photo: "/team/sadman-bin-arif.jpg",
    role: "Executive Governance",
    short: "COO",
    title: "Chief Operating Officer",
    blurb:
      "Orchestrating 64-district smart pharmacy scaling, government telemetry compliance, and supply chain logistics.",
    surface: "bg-bd-green text-white",
    fade: "to-bd-green",
    glow: "var(--color-bd-green)",
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
    surface: "bg-bdorange-600 text-text-primary",
    fade: "to-bdorange-600",
    glow: "var(--color-bdorange-600)",
    pill: "bg-text-primary text-signal-orange",
  },
];

/**
 * The three functional leads are solid colour cards like the Pixel-Map ones,
 * staggered against the executive row above (green under gold, gold under
 * green, ink under orange).
 */
const LEADS = [
  {
    title: "Concept & Clinical User Empathy",
    people: "Istiake Ahmed, Safia Mubassara Ruzba, Jamil Hossan",
    note: "User empathy, ergonomic medical casing, product semantics.",
    surface: "bg-bd-green text-white",
    glow: "var(--color-bd-green)",
  },
  {
    title: "Sensors & Embedded Systems",
    people: "Janassor Ahmed, Sharul Bhuiya, Safia Mubassara Ruzba",
    note: "Micro-soldering, LiDAR circuits, low-power telemetry & antenna RF.",
    surface: "bg-signal-orange text-text-primary",
    glow: "var(--color-signal-orange)",
  },
  {
    title: "Fullstack, AI & SWASTI Mobile",
    people: "Luban Ahmed, Shabbin Ahmed",
    note: "Bengali RAG models, Flutter app core, real-time WebSockets & CNNs.",
    // Ink on the black ground keeps its edge with a faint white ring.
    surface: "bg-text-primary text-white ring-1 ring-white/12",
    glow: "var(--color-bdgreen-500)",
  },
];

export function LeadershipSection() {
  return (
    <section id="leadership" className="section-band mx-auto max-w-7xl px-gutter-x">
      <SectionHeading
        tone="dark"
        title={<>Foundership &amp; Engineering Command</>}
        lead="Led by home-grown researchers, robotics specialists, and software architects determined to establish national hardware sovereignty."
      />

      {/* Executive row. */}
      <ul className="mb-4 grid grid-cols-3 gap-2 sm:mb-6 sm:gap-5">
        {EXECUTIVES.map((exec) => (
          <li key={exec.name} className="story-reveal flex">
            <TapCard
              label={exec.name}
              hint={<span className="font-mono text-[10px] font-bold uppercase opacity-90">{exec.short}</span>}
              style={{ "--glow": exec.glow } as CSSProperties}
              className={cn(
                "group flex w-full flex-col overflow-hidden rounded-2xl shadow-sm sm:rounded-3xl",
                "[-webkit-tap-highlight-color:transparent] touch-manipulation transition-[translate,scale,rotate,transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-2 hover:shadow-[0_28px_48px_-22px_var(--glow)] active:-translate-y-2 active:shadow-[0_28px_48px_-22px_var(--glow)] active:scale-[0.98] active:duration-150 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                exec.surface,
              )}
            >
              {/* Portrait, fading into the card colour at its foot. */}
              <div className="relative aspect-square w-full overflow-hidden">
                <Image
                  src={exec.photo}
                  alt={`${exec.name}, ${exec.title}`}
                  fill
                  sizes="(min-width: 1280px) 400px, 33vw"
                  quality={90}
                  className="object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 motion-reduce:transition-none"
                />
                <div aria-hidden className={cn("absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-b from-transparent", exec.fade)} />
              </div>

              <div className="relative -mt-5 flex flex-1 flex-col px-2.5 pb-1 sm:-mt-8 sm:px-6 sm:pb-6">
                <span className={cn("mb-2 w-fit rounded-full px-2 py-0.5 font-mono text-[9px] leading-tight font-bold uppercase sm:mb-3 sm:px-3 sm:py-1 sm:text-[11px]", exec.pill)}>
                  {exec.title}
                </span>
                <h3 className="font-grotesk text-[0.85rem] leading-tight font-bold sm:text-xl">{exec.name}</h3>
                <CardDetails>
                  <p className="mt-1 font-mono text-[9px] leading-tight font-semibold uppercase opacity-80 sm:text-xs">{exec.role}</p>
                  <p className="mt-2 font-sans text-[11px] leading-snug sm:mt-3 sm:text-sm sm:leading-relaxed">{exec.blurb}</p>
                </CardDetails>
              </div>
            </TapCard>
          </li>
        ))}
      </ul>

      {/* Functional leads. */}
      <ul className="grid grid-cols-3 gap-2 sm:gap-5">
        {LEADS.map((lead) => (
          <li key={lead.title} className="story-reveal flex">
            <TapCard
              label={lead.title}
              style={{ "--glow": lead.glow } as CSSProperties}
              className={cn(
                "flex w-full flex-col gap-1.5 rounded-2xl p-3 shadow-sm sm:gap-2 sm:rounded-3xl sm:p-6",
                "[-webkit-tap-highlight-color:transparent] touch-manipulation transition-[translate,scale,rotate,transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-2 hover:shadow-[0_28px_48px_-22px_var(--glow)] active:-translate-y-2 active:shadow-[0_28px_48px_-22px_var(--glow)] active:scale-[0.98] active:duration-150 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                lead.surface,
              )}
            >
              <h4 className="font-grotesk text-[0.85rem] leading-tight font-bold sm:text-lg">{lead.title}</h4>
              <CardDetails className="flex flex-col gap-1.5 sm:h-full sm:gap-2">
                <p className="font-sans text-[11px] leading-snug font-medium sm:text-sm">{lead.people}</p>
                <p className="mt-auto pt-2 font-mono text-[10px] leading-snug opacity-80 sm:pt-3 sm:text-xs">{lead.note}</p>
              </CardDetails>
            </TapCard>
          </li>
        ))}
      </ul>

      {/* Fellowship strip — gold, with the action in ink. */}
      <div className="story-reveal relative isolate mt-6 flex flex-col items-start justify-between gap-4 overflow-hidden rounded-3xl bg-signal-orange p-5 text-text-primary shadow-tile sm:flex-row sm:items-center sm:p-6">
        <div className="flex items-center gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-text-primary text-signal-orange shadow-ink">
            <Icon name="school" className="text-2xl" />
          </span>
          <div>
            <span className="block font-grotesk text-sm font-bold uppercase sm:text-base">R&amp;D Fellowship Cohort</span>
            <p className="font-sans text-xs text-text-primary/80 sm:text-sm">
              4–5 Research Fellows &amp; Paid Innovation Interns engaged in
              active cleanroom silicon trials.
            </p>
          </div>
        </div>

        <a href="/signup?role=researcher" className={cn(btn.ink, "shrink-0 px-5 py-2.5")}>
          Apply for Fellowship
        </a>
      </div>
    </section>
  );
}
