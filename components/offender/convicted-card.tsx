import { Icon } from "@/components/ui/icon";
import type { ConvictedOffender } from "@/data/offender-index";
import { cn } from "@/lib/utils";

const JUDGMENT_DATE = new Intl.DateTimeFormat("bn-BD", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/**
 * A conviction, in the same dossier-card shape as the pattern cards.
 *
 * This variant may name a person: a court ruled in open session and the
 * judgment is public record. It still carries no photograph — a name
 * attached to a published judgment is verifiable against that judgment,
 * whereas a face invites recognition of the wrong person on the street.
 *
 * An appeal flag is mandatory rather than decorative. A conviction under
 * appeal is not final, and a registry that hides that is misleading in
 * the direction that harms the person listed.
 */
export function ConvictedCard({ record }: { record: ConvictedOffender }) {
  const maxCount = Math.max(...record.offences.map((o) => o.count));

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-white transition-shadow hover:shadow-[0_1px_3px_rgba(14,42,30,0.06),0_8px_20px_rgba(7,32,22,0.08)]">
      <div aria-hidden className="h-1 w-full shrink-0 bg-bd-green" />

      <div className="flex flex-1 flex-col p-space-md">
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="mb-space-sm flex items-start gap-space-sm">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-lg border border-bdgreen-200 bg-bdgreen-50 text-bd-green">
            <Icon name="gavel" className="text-[30px]" />
          </span>

          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center justify-between gap-1">
              <span className="truncate font-mono text-[0.6875rem] font-bold tracking-wide text-bd-green">
                #{record.ref}
              </span>
              <span className="shrink-0 rounded border border-bdgreen-200 bg-bdgreen-50 px-1.5 py-0.5 font-mono text-[0.625rem] font-bold text-bd-green">
                দণ্ডপ্রাপ্ত
              </span>
            </div>

            <h3 className="truncate font-display text-body-md font-bold text-slate-900">
              {record.name}
            </h3>

            <div className="flex flex-col gap-0.5 font-sans text-body-sm text-slate-600">
              <span className="flex items-start gap-1">
                <Icon
                  name="account_balance"
                  className="mt-px shrink-0 text-[14px] text-slate-400"
                />
                <span className="line-clamp-2">{record.court}</span>
              </span>
              <span className="flex items-center gap-1">
                <Icon
                  name="tag"
                  className="shrink-0 text-[14px] text-slate-400"
                />
                {record.caseNo}
              </span>
            </div>
          </div>
        </div>

        {/* ── Offences ───────────────────────────────────────────── */}
        <div className="mb-space-sm rounded-lg border border-border bg-slate-50 p-space-sm">
          <div className="mb-2 flex items-center justify-between border-b border-border pb-1.5">
            <span className="flex items-center gap-1 font-display text-body-sm font-bold text-slate-900">
              <Icon name="balance" className="text-[18px] text-bd-green" />
              প্রমাণিত অপরাধ
            </span>
            <span className="rounded border border-bdgreen-200 bg-bdgreen-50 px-2 py-0.5 font-mono text-[0.6875rem] font-bold text-bd-green tabular-nums">
              {record.totalOffences} টি
            </span>
          </div>

          <ul className="flex flex-col gap-1.5">
            {record.offences.map((item, i) => (
              <li key={`${item.category}-${i}`} className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-1.5 font-sans text-body-sm text-slate-700">
                    <span className="size-1.5 shrink-0 rounded-full bg-bd-green" />
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
                <div
                  aria-hidden
                  className="h-1 w-full overflow-hidden rounded-full bg-slate-200"
                >
                  <div
                    className="h-full rounded-full bg-bd-green"
                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Sentence + statutes ────────────────────────────────── */}
        <div className="mt-auto flex flex-col gap-1.5">
          <div className="flex items-start gap-1 rounded-lg border border-border bg-slate-50 p-1.5">
            <Icon
              name="description"
              className="mt-px shrink-0 text-[16px] text-slate-400"
            />
            <span className="font-mono text-[0.6875rem] font-bold text-slate-700">
              ধারা: {record.statutes.join(", ")}
            </span>
          </div>

          <div className="flex items-start gap-1.5 rounded-lg border border-bdgreen-200 bg-bdgreen-50 px-2 py-1 font-sans text-[0.6875rem] font-semibold text-bd-green">
            <Icon name="lock" className="mt-px shrink-0 text-[14px]" />
            <span>দণ্ড: {record.sentence}</span>
          </div>

          {/* An appeal makes the conviction non-final. Always shown. */}
          {record.appealPending ? (
            <div className="flex items-start gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2 py-1 font-sans text-[0.6875rem] font-semibold text-amber-900">
              <Icon name="gavel" className="mt-px shrink-0 text-[14px]" />
              <span>আপিল বিচারাধীন — রায় চূড়ান্ত নয়</span>
            </div>
          ) : null}

          <p className="flex items-start gap-1 font-sans text-[0.625rem] leading-relaxed text-slate-500">
            <Icon name="source" className="mt-px shrink-0 text-[12px]" />
            <span className="min-w-0">
              {record.source} · রায়ের তারিখ:{" "}
              {JUDGMENT_DATE.format(new Date(record.judgmentDate))}
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-space-xs border-t border-border p-space-sm">
        <button
          type="button"
          disabled
          className="inline-flex items-center justify-center gap-1 rounded-md border border-border bg-slate-100 px-2 py-2 font-display text-[0.6875rem] font-semibold text-slate-500 disabled:cursor-not-allowed"
        >
          <Icon name="folder_open" className="text-[16px]" />
          রায়ের নথি
        </button>
        <button
          type="button"
          disabled
          className="inline-flex items-center justify-center gap-1 rounded-md border border-border bg-slate-100 px-2 py-2 font-display text-[0.6875rem] font-semibold text-slate-500 disabled:cursor-not-allowed"
        >
          <Icon name="flag" className="text-[16px]" />
          সংশোধন জানান
        </button>
      </div>
    </article>
  );
}
