import { Icon } from "@/components/ui/icon";
import {
  caseStages,
  riskBands,
  type OffenderPattern,
} from "@/data/offender-index";
import { cn } from "@/lib/utils";

/**
 * One anonymised offence pattern, in the reference's dossier-card shape.
 *
 * ── Where the mugshot was ────────────────────────────────────────────
 *
 * The reference put a 24×28 mugshot here with a "রেড অ্যালার্ট" flag.
 * This card puts the cluster reference and its offence volume in that
 * slot instead. The photograph was never carrying analytical weight —
 * it identified a person the state has not convicted, next to the
 * neighbourhoods they frequent. The counts, categories, statutes and
 * areas below are the entire useful content of the reference card, and
 * they are all still here.
 */
export function OffenderCard({ pattern }: { pattern: OffenderPattern }) {
  const risk = riskBands.find((r) => r.id === pattern.risk) ?? riskBands[0];
  const stage = caseStages[pattern.stage];
  const maxCount = Math.max(...pattern.breakdown.map((b) => b.count));

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-white transition-shadow hover:shadow-[0_1px_3px_rgba(14,42,30,0.06),0_8px_20px_rgba(7,32,22,0.08)]">
      {/* Risk accent bar, as in the reference. */}
      <div aria-hidden className={cn("h-1 w-full shrink-0", risk.bar)} />

      <div className="flex flex-1 flex-col p-space-md">
        {/* ── Header: reference block replaces the mugshot ───────── */}
        <div className="mb-space-sm flex items-start gap-space-sm">
          <div
            className={cn(
              "flex size-16 shrink-0 flex-col items-center justify-center rounded-lg border",
              risk.chip,
            )}
          >
            <span className="font-display text-headline-sm leading-none font-bold tabular-nums">
              {pattern.totalOffences}
            </span>
            <span className="font-mono text-[0.5625rem] font-bold">
              নথিভুক্ত
            </span>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center justify-between gap-1">
              <span className="truncate font-mono text-[0.6875rem] font-bold tracking-wide text-bd-green">
                #{pattern.ref}
              </span>
              <span
                className={cn(
                  "shrink-0 rounded border px-1.5 py-0.5 font-mono text-[0.625rem] font-bold",
                  risk.chip,
                )}
              >
                {risk.banglaLabel}
              </span>
            </div>

            {/* The card's title is the case cluster, not a person. */}
            <h3 className="font-display text-body-md leading-snug font-bold text-slate-900">
              কেস ক্লাস্টার — {pattern.thana}
            </h3>

            <div className="flex flex-col gap-0.5">
              <span className="flex items-start gap-1 font-sans text-body-sm text-slate-600">
                <Icon
                  name="location_on"
                  className="mt-px shrink-0 text-[14px] text-slate-400"
                />
                <span className="line-clamp-1">
                  {pattern.areas.join(" · ")}, {pattern.district}
                </span>
              </span>
              <span className="flex items-center gap-1 font-sans text-body-sm text-slate-600">
                <Icon
                  name="schedule"
                  className="shrink-0 text-[14px] text-slate-400"
                />
                {pattern.activeMonths} মাস ধরে সক্রিয় নথি
              </span>
            </div>
          </div>
        </div>

        {/* ── Offence breakdown ──────────────────────────────────── */}
        <div className="mb-space-sm rounded-lg border border-border bg-slate-50 p-space-sm">
          <div className="mb-2 flex items-center justify-between border-b border-border pb-1.5">
            <span className="flex items-center gap-1 font-display text-body-sm font-bold text-slate-900">
              <Icon name="gavel" className={cn("text-[18px]", risk.text)} />
              অপরাধের পৃথক গণনা
            </span>
            <span
              className={cn(
                "rounded border px-2 py-0.5 font-mono text-[0.6875rem] font-bold tabular-nums",
                risk.chip,
              )}
            >
              {pattern.totalOffences} টি
            </span>
          </div>

          <ul className="flex flex-col gap-1.5">
            {pattern.breakdown.map((item, i) => (
              <li key={`${item.category}-${i}`} className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-1.5 font-sans text-body-sm text-slate-700">
                    <span
                      className={cn(
                        "size-1.5 shrink-0 rounded-full",
                        risk.dot,
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </span>
                  <span
                    className={cn(
                      "shrink-0 rounded border border-border bg-white px-2 py-0.5 font-mono text-[0.6875rem] font-bold tabular-nums",
                      item.tone,
                    )}
                  >
                    {item.count} বার
                  </span>
                </div>
                {/* A proportion bar the reference only implied. It makes
                    the dominant offence legible without reading numbers. */}
                <div
                  aria-hidden
                  className="h-1 w-full overflow-hidden rounded-full bg-slate-200"
                >
                  <div
                    className={cn("h-full rounded-full", risk.bar)}
                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Statutes + stage ───────────────────────────────────── */}
        <div className="mt-auto flex flex-col gap-1.5">
          <div className="flex items-start gap-1 rounded-lg border border-border bg-slate-50 p-1.5">
            <Icon
              name="description"
              className="mt-px shrink-0 text-[16px] text-slate-400"
            />
            <span className="font-mono text-[0.6875rem] font-bold text-slate-700">
              ধারা: {pattern.statutes.join(", ")}
            </span>
          </div>

          <div
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-2 py-1 font-sans text-[0.6875rem] font-semibold",
              stage.chip,
            )}
          >
            <Icon name="balance" className="shrink-0 text-[14px]" />
            <span>{stage.bangla} — দোষী সাব্যস্ত হয়নি</span>
          </div>

          {/* How the cluster was linked. The reference asserted guilt;
              this states the evidentiary basis instead. */}
          <p className="flex items-start gap-1 font-sans text-[0.625rem] leading-relaxed text-slate-500">
            <Icon name="hub" className="mt-px shrink-0 text-[12px]" />
            <span className="min-w-0">
              সংযুক্তির ভিত্তি: {pattern.linkedBy}
            </span>
          </p>
        </div>
      </div>

      {/* ── Actions ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-space-xs border-t border-border p-space-sm">
        <button
          type="button"
          disabled
          className="inline-flex items-center justify-center gap-1 rounded-md border border-border bg-slate-100 px-2 py-2 font-display text-[0.6875rem] font-semibold text-slate-500 disabled:cursor-not-allowed"
        >
          <Icon name="folder_open" className="text-[16px]" />
          কেস ফাইল
        </button>
        <a
          href="tel:999"
          className="inline-flex items-center justify-center gap-1 rounded-md bg-bd-green px-2 py-2 font-display text-[0.6875rem] font-semibold text-white transition-colors hover:bg-bdgreen-900 focus-visible:ring-3 focus-visible:ring-bd-green/30 focus-visible:outline-none"
        >
          <Icon name="call" className="text-[16px]" />
          ৯৯৯ এ জানান
        </a>
      </div>
    </article>
  );
}
