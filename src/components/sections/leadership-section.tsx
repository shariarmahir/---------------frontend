import { Icon } from "@/components/ui/icon";
import { executives, researchLeads } from "@/data/leadership";
import { cn } from "@/lib/utils";

const AVATAR_TONE = {
  primary: "bg-emerald-700 text-white",
  emerald: "border border-emerald-200 bg-emerald-100 text-primary",
  signal: "border border-orange-200 bg-orange-100 text-signal",
} as const;

const ROLE_TONE = {
  primary: "text-primary",
  emerald: "text-signal",
  signal: "text-signal",
} as const;

export function LeadershipSection() {
  return (
    <section
      id="founder-vision"
      className="w-full border-b border-border bg-white py-space-xl"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-space-xl px-gutter">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-space-xs text-center">
          <span className="font-code-telemetry text-label-sm font-bold uppercase text-primary">
            THE SCIENTIFIC CORPS
          </span>
          <h2 className="font-display text-headline-lg-mobile font-bold tracking-tight text-slate-900 sm:text-headline-lg">
            Executive Leadership &amp; Principal Scientists
          </h2>
          <p className="font-body-md text-body-md text-slate-600">
            Driven by obsessive Bangladeshi engineers, roboticists, and clinical
            researchers committed to national self-reliance.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
          {executives.map((executive) => (
            <article
              key={executive.name}
              className="flex flex-col gap-space-md rounded-2xl border border-border bg-slate-50 p-space-md shadow-xs transition-all hover:border-emerald-300 hover:bg-emerald-50/20"
            >
              <div className="flex items-center gap-space-md">
                <div
                  className={cn(
                    "flex size-16 shrink-0 items-center justify-center rounded-full font-display text-headline-md font-bold shadow-xs",
                    AVATAR_TONE[executive.tone],
                  )}
                >
                  {executive.initials}
                </div>
                <div>
                  <h3 className="font-display text-headline-sm font-bold text-slate-900">
                    {executive.name}
                  </h3>
                  <span
                    className={cn(
                      "block font-code-telemetry text-label-sm font-bold",
                      ROLE_TONE[executive.tone],
                    )}
                  >
                    {executive.role}
                  </span>
                  <span className="block font-body-sm text-body-sm text-slate-600">
                    {executive.discipline}
                  </span>
                </div>
              </div>

              <blockquote className="font-body-sm text-body-sm italic leading-relaxed text-slate-700">
                &ldquo;{executive.quote}&rdquo;
              </blockquote>

              <div className="flex flex-wrap items-center gap-space-sm pt-space-xs font-label-sm text-label-sm text-slate-500">
                <span className="flex items-center gap-1 font-medium">
                  <Icon name="verified" className="text-[16px] text-primary" />
                  {executive.tags[0]}
                </span>
                <span>•</span>
                <span className="font-medium">{executive.tags[1]}</span>
              </div>
            </article>
          ))}
        </div>

        <div className="flex flex-col gap-space-md rounded-2xl border border-border bg-slate-50 p-space-lg shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-space-sm">
            <div>
              <h3 className="font-display text-headline-sm font-bold text-slate-900">
                Principal R&amp;D Engineering Leads
              </h3>
              <p className="font-body-sm text-body-sm text-slate-600">
                The technical minds engineering our firmware, algorithms, and
                mechatronic chassis.
              </p>
            </div>
            <span className="rounded-sm border border-border bg-white px-space-sm py-1 font-code-telemetry text-label-sm font-bold text-primary shadow-xs">
              DIVISION LEADS
            </span>
          </div>

          <div className="grid grid-cols-2 gap-space-sm sm:grid-cols-3 lg:grid-cols-5">
            {researchLeads.map((lead) => (
              <div
                key={lead.name}
                className="flex flex-col gap-space-xs rounded-lg border border-border bg-white p-space-sm shadow-xs"
              >
                <span className="font-display text-label-md font-bold text-slate-900">
                  {lead.name}
                </span>
                <span className="font-code-telemetry text-label-sm font-semibold text-primary">
                  {lead.role}
                </span>
                <span className="font-body-sm text-body-sm text-slate-600">
                  {lead.focus}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-space-lg rounded-2xl border border-border bg-gradient-to-r from-emerald-50 via-white to-orange-50 p-space-lg shadow-md lg:flex-row">
          <div className="flex max-w-2xl flex-col gap-space-xs">
            <div className="flex w-fit items-center gap-space-xs rounded-sm bg-title px-space-sm py-0.5 font-code-telemetry text-label-sm font-bold text-white shadow-xs">
              <Icon name="school" className="text-[16px]" />
              <span>COHORT 2025 APPOINTMENTS OPEN</span>
            </div>
            <h3 className="font-display text-headline-md font-bold text-slate-900">
              Join the Kandari R&amp;D Fellowships
            </h3>
            <p className="font-body-md text-body-md leading-relaxed text-slate-600">
              A prestigious 2.5-month high-impact paid engineering fellowship.
              Work on physical hardware, cleanroom silicon design, or
              multi-dialect medical LLMs in Dhaka.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-space-md">
            <a
              href="/login"
              className="rounded-lg bg-title px-space-lg py-3 font-display text-label-md font-bold text-white shadow-sm transition-colors hover:bg-signal"
            >
              Apply for Fellowship
            </a>
            <a
              href="#rnd-innovations"
              className="rounded-lg border border-border bg-white px-space-md py-3 font-label-md text-label-md font-semibold text-slate-800 shadow-xs transition-colors hover:bg-slate-50"
            >
              Curriculum Details
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
