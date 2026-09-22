import { Icon } from "@/components/ui/icon";

const EXECUTIVES = [
  {
    tag: "[ Chief Executive Officer ]",
    tagClass: "text-signal-orange",
    name: "Mahir Shariar Mahin",
    role: "Founder & Team Leader",
    roleClass: "text-bd-green",
    blurb:
      "Spearheading native deep-tech roadmaps, hardware prototyping, and national clinical integration protocols.",
    division: "DIV: HARDWARE ARCH & STRATEGY",
    hoverBorder: "hover:border-signal-orange/60",
  },
  {
    tag: "[ Chief Operating Officer ]",
    tagClass: "text-bd-green",
    name: "Sadman bin Arif",
    role: "Executive Governance",
    roleClass: "text-text-muted",
    blurb:
      "Orchestrating 64-district smart pharmacy scaling, government telemetry compliance, and supply chain logistics.",
    division: "DIV: FIELD OPERATIONS & SUPPLY",
    hoverBorder: "hover:border-bd-green/60",
  },
  {
    tag: "[ Chief Marketing Officer ]",
    tagClass: "text-teal-700",
    name: "Nabeel Shadad",
    role: "Strategic Expansion",
    roleClass: "text-text-muted",
    blurb:
      "Leading international hardware partnerships, medical institutional adoption, and public narrative momentum.",
    division: "DIV: PARTNERSHIPS & ECOSYSTEM",
    hoverBorder: "hover:border-teal-500/60",
  },
];

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
    tagClass: "text-bd-green",
    title: "Sensors & Embedded Systems",
    people: "Janassor Ahmed, Sharul Bhuiya, Safia Mubassara Ruzba",
    note: "Micro-soldering, LiDAR circuits, low-power telemetry & antenna RF.",
  },
  {
    tag: "[ AI & Software Systems ]",
    tagClass: "text-teal-700",
    title: "Fullstack, AI & SWASTI Mobile",
    people: "Luban Ahmed, Shabbin Ahmed",
    note: "Bengali RAG models, Flutter app core, real-time WebSockets & CNNs.",
  },
];

export function LeadershipSection() {
  return (
    <section
      id="leadership"
      className="section-band mx-auto max-w-7xl px-gutter-x"
    >
      <div className="mb-10 flex flex-col gap-2">
        <span className="w-fit rounded border border-orange-200 bg-orange-50 px-2.5 py-1 font-mono text-xs font-bold tracking-wider text-signal-orange uppercase">
          [ 08 // Core architects &amp; governance ]
        </span>
        <h2 className="font-grotesk text-2xl font-bold tracking-tight text-text-primary uppercase sm:text-3xl lg:text-4xl">
          Foundership &amp; Engineering Command
        </h2>
        <p className="max-w-2xl font-sans text-base text-text-secondary">
          Led by home-grown researchers, robotics specialists, and software
          architects determined to establish national hardware sovereignty.
        </p>
      </div>

      {/* Executive row. */}
      <div className="-m-3 mb-6 flex flex-wrap">
        {EXECUTIVES.map((exec) => (
          <div key={exec.name} className="flex w-full p-3 sm:w-1/3">
            <div
              className={`flex w-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-elevated ${exec.hoverBorder}`}
            >
              <div>
                <span
                  className={`mb-1 block font-mono text-xs font-bold uppercase ${exec.tagClass}`}
                >
                  {exec.tag}
                </span>
                <h3 className="font-grotesk text-xl font-bold text-text-primary">
                  {exec.name}
                </h3>
                <p
                  className={`mt-1 font-mono text-xs font-semibold uppercase ${exec.roleClass}`}
                >
                  {exec.role}
                </p>
                <p className="mt-3 font-sans text-sm leading-relaxed text-text-secondary">
                  {exec.blurb}
                </p>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-3 font-mono text-[11px] text-text-muted">
                {exec.division}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Functional leads. */}
      <div className="-m-3 flex flex-wrap">
        {LEADS.map((lead) => (
          <div key={lead.tag} className="flex w-full p-3 md:w-1/3">
            <div className="w-full space-y-2 rounded-2xl border border-emerald-100 bg-mint-subtle p-5 shadow-xs">
              <span
                className={`block font-mono text-xs font-bold uppercase ${lead.tagClass}`}
              >
                {lead.tag}
              </span>
              <h4 className="font-grotesk text-base font-bold text-text-primary">
                {lead.title}
              </h4>
              <p className="font-sans text-sm font-medium text-text-secondary">
                {lead.people}
              </p>
              <div className="pt-2 font-mono text-xs text-text-muted">
                {lead.note}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fellowship banner. */}
      <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:p-6">
        <div className="flex items-center gap-4">
          <Icon
            name="school"
            className="shrink-0 text-3xl text-signal-orange"
          />
          <div>
            <span className="block font-grotesk text-sm font-bold text-text-primary uppercase sm:text-base">
              R&amp;D Fellowship Cohort
            </span>
            <p className="font-sans text-xs text-text-secondary sm:text-sm">
              4–5 Research Fellows &amp; Paid Innovation Interns engaged in
              active cleanroom silicon trials.
            </p>
          </div>
        </div>

        <a
          href="/login"
          className="shrink-0 rounded-xl bg-bd-green px-5 py-2.5 font-mono text-xs font-bold text-white uppercase shadow-sm transition-colors hover:bg-bd-green-dark"
        >
          Apply for Fellowship
        </a>
      </div>
    </section>
  );
}
