import { Icon } from "@/components/ui/icon";
import {
  caseStages,
  offenderPatterns,
  offenderStats,
  riskBands,
} from "@/data/offender-index";
import { cn } from "@/lib/utils";

/**
 * The full datasheet view.
 *
 * The reference's table led with a "বায়োমেট্রিক ছবি" column of mugshots
 * and a "নাম ও পরিচিতি" column. Those two columns are replaced by the
 * cluster reference and its linking basis — the rest of the table
 * (offence totals, itemised counts, statutes, status, area) is intact,
 * because none of it ever depended on knowing who someone was.
 */
export function OffenderRegister() {
  return (
    <section
      className="w-full border-y border-border bg-bdgreen-50/40 px-gutter py-space-lg"
      aria-labelledby="offender-register-title"
    >
      <div className="mx-auto flex max-w-360 flex-col gap-space-md">
        <div className="flex flex-col justify-between gap-space-sm sm:flex-row sm:items-center">
          <div className="flex flex-col">
            <span className="font-mono text-label-xs font-bold tracking-wider text-bd-green uppercase">
              রেজিস্ট্রি ভিউ // ফুল ডেটাশিট
            </span>
            <h2
              id="offender-register-title"
              className="font-display text-headline-sm font-bold tracking-tight text-slate-900"
            >
              কেস ক্লাস্টারের পূর্ণাঙ্গ রেজিস্টার
            </h2>
          </div>

          <div className="flex items-center gap-space-xs">
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-1 rounded-md border border-border bg-slate-100 px-3 py-1.5 font-display text-[0.6875rem] font-semibold text-slate-500 disabled:cursor-not-allowed"
            >
              <Icon name="file_download" className="text-[16px]" />
              এক্সপোর্ট CSV
            </button>
            <span className="rounded-md border border-amber-300 bg-amber-50 px-2 py-1.5 font-mono text-[0.625rem] font-bold text-amber-800">
              ব্যাকএন্ড সংযোগের অপেক্ষায়
            </span>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">
                কেস ক্লাস্টারের পূর্ণাঙ্গ তালিকা — অপরাধ সংখ্যা, ধারা, এলাকা
                ও মামলার অবস্থা। কোনো ব্যক্তির নাম বা ছবি এই তালিকায় নেই।
              </caption>
              <thead>
                <tr className="border-b border-border bg-bdgreen-900 text-white">
                  <th
                    scope="col"
                    className="p-space-sm font-mono text-[0.625rem] font-semibold tracking-wider uppercase"
                  >
                    ক্লাস্টার আইডি
                  </th>
                  <th
                    scope="col"
                    className="p-space-sm font-mono text-[0.625rem] font-semibold tracking-wider uppercase"
                  >
                    কার্যক্রম এলাকা
                  </th>
                  <th
                    scope="col"
                    className="p-space-sm text-center font-mono text-[0.625rem] font-semibold tracking-wider uppercase"
                  >
                    মোট
                  </th>
                  <th
                    scope="col"
                    className="p-space-sm font-mono text-[0.625rem] font-semibold tracking-wider uppercase"
                  >
                    অপরাধের পৃথক তালিকা
                  </th>
                  <th
                    scope="col"
                    className="p-space-sm font-mono text-[0.625rem] font-semibold tracking-wider uppercase"
                  >
                    আইনি ধারা
                  </th>
                  <th
                    scope="col"
                    className="p-space-sm font-mono text-[0.625rem] font-semibold tracking-wider uppercase"
                  >
                    অবস্থা
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {offenderPatterns.map((p, i) => {
                  const risk =
                    riskBands.find((r) => r.id === p.risk) ?? riskBands[0];
                  const stage = caseStages[p.stage];
                  return (
                    <tr
                      key={p.ref}
                      className={cn(
                        "transition-colors hover:bg-bdgreen-50/60",
                        i % 2 === 1 && "bg-slate-50/60",
                      )}
                    >
                      <td className="p-space-sm align-top">
                        <div className="flex items-center gap-2">
                          <span
                            aria-hidden
                            className={cn(
                              "h-8 w-1 shrink-0 rounded-full",
                              risk.bar,
                            )}
                          />
                          <div className="flex min-w-0 flex-col">
                            <span className="font-mono text-[0.6875rem] font-bold text-bd-green">
                              #{p.ref}
                            </span>
                            <span className="font-sans text-[0.625rem] text-slate-500">
                              {p.activeMonths} মাস সক্রিয়
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-space-sm align-top">
                        <div className="flex flex-col">
                          <span className="font-sans text-body-sm font-medium text-slate-900">
                            {p.thana}
                          </span>
                          <span className="line-clamp-1 font-sans text-[0.625rem] text-slate-500">
                            {p.areas.join(", ")}
                          </span>
                        </div>
                      </td>
                      <td className="p-space-sm text-center align-top">
                        <span
                          className={cn(
                            "inline-block rounded border px-2 py-0.5 font-mono text-[0.6875rem] font-bold tabular-nums",
                            risk.chip,
                          )}
                        >
                          {p.totalOffences} টি
                        </span>
                      </td>
                      <td className="p-space-sm align-top">
                        <div className="flex max-w-xs flex-wrap gap-1">
                          {p.breakdown.map((b, j) => (
                            <span
                              key={`${b.category}-${j}`}
                              className="rounded border border-border bg-slate-50 px-1.5 py-0.5 font-sans text-[0.625rem] text-slate-700"
                            >
                              {b.label}: {b.count}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-space-sm align-top">
                        <span className="font-mono text-[0.625rem] text-slate-600">
                          {p.statutes.join(", ")}
                        </span>
                      </td>
                      <td className="p-space-sm align-top">
                        <span
                          className={cn(
                            "inline-block rounded border px-2 py-0.5 font-sans text-[0.625rem] font-bold",
                            stage.chip,
                          )}
                        >
                          {stage.bangla}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination. Inert until the feed is paged server-side. */}
          <div className="flex flex-wrap items-center justify-between gap-space-sm border-t border-border bg-slate-50 p-space-sm font-sans text-body-sm text-slate-600">
            <span>
              ১ – {offenderPatterns.length} পর্যন্ত প্রদর্শিত (মোট খোলা{" "}
              {offenderStats.openClusters} টি ক্লাস্টার)
            </span>
            <span className="font-mono text-[0.625rem] text-slate-500">
              পেজিনেশন ব্যাকএন্ড সংযোগের পর সক্রিয় হবে
            </span>
          </div>
        </div>

        <p className="flex items-start gap-1.5 font-sans text-[0.6875rem] text-slate-600">
          <Icon name="info" className="mt-px shrink-0 text-[14px]" />
          <span className="max-w-[92ch]">
            মামলার অবস্থা পরিবর্তিত হতে পারে। খালাস, অব্যাহতি বা আপিলের রায়
            পাওয়ামাত্র সংশ্লিষ্ট ক্লাস্টার হালনাগাদ বা অপসারণ করা হয়।
          </span>
        </p>
      </div>
    </section>
  );
}
