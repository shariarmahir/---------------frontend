import { Icon } from "@/components/ui/icon";
import { SectionHeading, btn, tileLift } from "@/components/ui/section-kit";
import { cn } from "@/lib/utils";

/**
 * Executives sit on white tiles, each marked by a solid monogram tile in
 * one of the three brand colours. Tag colours are the on-white variants
 * (amber-700 rather than the gold, which reads at ~2:1 on white).
 */
const EXECUTIVES = [
  {
    tag: "[ Chief Executive Officer ]",
    tagClass: "text-amber-700",
    monogram: "bg-signal-orange text-text-primary",
    name: "Mahir Shariar Mahin",
    role: "Founder & Team Leader",
    roleClass: "text-bd-green",
    blurb:
      "Spearheading native deep-tech roadmaps, hardware prototyping, and national clinical integration protocols.",
    division: "DIV: HARDWARE ARCH & STRATEGY",
  },
  {
    tag: "[ Chief Operating Officer ]",
    tagClass: "text-bd-green",
    monogram: "bg-bd-green text-white",
    name: "Sadman bin Arif",
    role: "Executive Governance",
    roleClass: "text-text-muted",
    blurb:
      "Orchestrating 64-district smart pharmacy scaling, government telemetry compliance, and supply chain logistics.",
    division: "DIV: FIELD OPERATIONS & SUPPLY",
  },
  {
    tag: "[ Chief Marketing Officer ]",
    tagClass: "text-teal-700",
    monogram: "bg-text-primary text-signal-orange",
    name: "Nabeel Shadad",
    role: "Strategic Expansion",
    roleClass: "text-text-muted",
    blurb:
      "Leading international hardware partnerships, medical institutional adoption, and public narrative momentum.",
    division: "DIV: PARTNERSHIPS & ECOSYSTEM",
  },
];

/** On the ink panel, so the light tints of each colour. */
const LEADS = [
  {
    tag: "[ Idea & Creative Leads ]",
    tagClass: "text-signal-orange",
    title: "Concept & Clinical User Empathy",
    people: "Istiake Ahmed, Safia Mubassara Ruzba, Jamil Hossan",
    note: "User empathy, ergonomic medical casing, product semantics.",
  },
  {
    tag: "[ IoT & Hardware Architecture ]",
    tagClass: "text-emerald-300",
    title: "Sensors & Embedded Systems",
    people: "Janassor Ahmed, Sharul Bhuiya, Safia Mubassara Ruzba",
    note: "Micro-soldering, LiDAR circuits, low-power telemetry & antenna RF.",
  },
  {
    tag: "[ AI & Software Systems ]",
    tagClass: "text-teal-300",
    title: "Fullstack, AI & SWASTI Mobile",
    people: "Luban Ahmed, Shabbin Ahmed",
    note: "Bengali RAG models, Flutter app core, real-time WebSockets & CNNs.",
  },
];

/** "Mahir Shariar Mahin" → "MM": first and last initials. */
function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export function LeadershipSection() {
  return (
    <section id="leadership" className="section-band mx-auto max-w-7xl px-gutter-x">
      <SectionHeading
        tone="dark"
        title={<>Foundership &amp; Engineering Command</>}
        lead="Led by home-grown researchers, robotics specialists, and software architects determined to establish national hardware sovereignty."
      />

      {/* Executive row. */}
      <ul className="mb-6 grid gap-5 sm:grid-cols-3">
        {EXECUTIVES.map((exec) => (
          <li key={exec.name} className="story-reveal flex">
            <article className={cn("group flex w-full flex-col justify-between rounded-3xl bg-white p-6 ring-1 ring-text-primary/10", tileLift)}>
              <div>
                <div className="mb-5 flex items-start justify-between gap-3">
                  <span
                    aria-hidden
                    className={cn(
                      "grid size-14 place-items-center rounded-2xl font-grotesk text-lg font-bold shadow-tile",
                      "transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-rotate-6 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:rotate-0 motion-reduce:group-hover:scale-100",
                      exec.monogram,
                    )}
                  >
                    {initials(exec.name)}
                  </span>
                  <span className={cn("pt-1 text-right font-mono text-xs font-bold uppercase", exec.tagClass)}>{exec.tag}</span>
                </div>
                <h3 className="font-grotesk text-xl font-bold text-text-primary">{exec.name}</h3>
                <p className={cn("mt-1 font-mono text-xs font-semibold uppercase", exec.roleClass)}>{exec.role}</p>
                <p className="mt-3 font-sans text-sm leading-relaxed text-text-secondary">{exec.blurb}</p>
              </div>

              <div className="mt-6 border-t border-text-primary/10 pt-3 font-mono text-[11px] text-text-muted">{exec.division}</div>
            </article>
          </li>
        ))}
      </ul>

      {/* Functional leads — one ink panel in three columns. */}
      <div className="story-reveal relative isolate overflow-hidden rounded-3xl bg-text-primary text-white ring-1 ring-white/12">
        <ul className="grid divide-y divide-white/10 md:grid-cols-3 md:divide-x md:divide-y-0">
          {LEADS.map((lead) => (
            <li key={lead.tag} className="space-y-2 p-6 transition-colors duration-300 hover:bg-white/4">
              <span className={cn("block font-mono text-xs font-bold uppercase", lead.tagClass)}>{lead.tag}</span>
              <h4 className="font-grotesk text-base font-bold">{lead.title}</h4>
              <p className="font-sans text-sm font-medium text-white/80">{lead.people}</p>
              <div className="pt-2 font-mono text-xs text-white/55">{lead.note}</div>
            </li>
          ))}
        </ul>
      </div>

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
