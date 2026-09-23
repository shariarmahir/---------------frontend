import { Icon } from "@/components/ui/icon";
import { CrimeReportConsole } from "@/components/crime/crime-report-console";
import {
  crimeCategories,
  crimeRecords,
  crimeTiers,
  type CrimeRecord,
} from "@/data/crime-index";
import { cn } from "@/lib/utils";

/**
 * The case ledger — the same records as the grid, read as a docket.
 *
 * The reference's version of this table is a wanted list with mugshots.
 * This one is a case ledger: the identity column shows a name only where
 * a court has ruled, and otherwise shows the accused count and the stage,
 * which is the information that actually tracks a case. A wanted notice
 * belongs to the issuing police authority, not to this page.
 */
function IdentityCell({ record }: { record: CrimeRecord }) {
  if (record.status === "convicted") {
    return (
      <div className="flex flex-col">
        <span className="font-display text-body-sm font-bold text-slate-900">
          {record.offenderName}
        </span>
        <span className="font-mono text-[0.625rem] text-slate-500">
          {record.court}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <span className="flex items-center gap-1 font-sans text-body-sm font-semibold text-slate-700">
        <Icon name="person_off" className="text-[14px] text-slate-400" />
        পরিচয় প্রকাশ করা হয়নি
      </span>
      <span className="font-mono text-[0.625rem] text-slate-500">
        {record.accusedCount} অভিযুক্ত
      </span>
    </div>
  );
}

function StatusCell({ record }: { record: CrimeRecord }) {
  if (record.status === "convicted") {
    return (
      <span className="inline-block rounded border border-bdgreen-200 bg-bdgreen-50 px-2 py-1 font-mono text-[0.6875rem] font-semibold text-bd-green">
        দণ্ডপ্রাপ্ত — {record.sentence}
      </span>
    );
  }
  return (
    <span className="inline-block rounded border border-amber-300 bg-amber-50 px-2 py-1 font-mono text-[0.6875rem] font-semibold text-amber-800">
      {record.stage}
    </span>
  );
}

export function CrimeLedger() {
  const byDate = [...crimeRecords].sort(
    (a, b) => +new Date(b.occurredAt) - +new Date(a.occurredAt),
  );

  return (
    <section
      className="w-full px-gutter py-space-lg"
      aria-labelledby="crime-ledger-title"
    >
      <div className="mx-auto grid max-w-360 grid-cols-1 gap-space-lg lg:grid-cols-12">
        {/* ── Ledger ────────────────────────────────────────────── */}
        <div className="flex flex-col gap-space-sm lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-space-sm">
            <div className="flex items-center gap-2">
              <Icon name="folder_open" className="text-[22px] text-bd-green" />
              <h2
                id="crime-ledger-title"
                className="font-display text-headline-sm font-bold text-slate-900"
              >
                মামলার নথি ও চলমান অবস্থা
              </h2>
            </div>
            <span className="rounded border border-border bg-white px-2.5 py-0.5 font-mono text-label-xs text-slate-600">
              উৎস: আদালত ও থানার নথি
            </span>
          </div>

          <div className="w-full overflow-x-auto rounded-xl border border-border bg-white">
            <table className="w-full border-collapse text-left font-sans text-body-sm">
              <caption className="sr-only">
                আজকের নথিভুক্ত মামলার তালিকা — অপরাধ, ধারা, স্থান ও আইনি
                অবস্থা। দোষী সাব্যস্ত না হওয়া পর্যন্ত কারও পরিচয় দেখানো হয় না।
              </caption>
              <thead>
                <tr className="border-b border-border bg-slate-50 font-mono text-[0.6875rem] text-slate-600 uppercase">
                  <th scope="col" className="p-3 font-semibold">
                    অপরাধ
                  </th>
                  <th scope="col" className="p-3 font-semibold">
                    পরিচয়
                  </th>
                  <th scope="col" className="p-3 font-semibold">
                    ধারা
                  </th>
                  <th scope="col" className="p-3 font-semibold">
                    থানা ও জেলা
                  </th>
                  <th scope="col" className="p-3 font-semibold">
                    আইনি অবস্থা
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {byDate.map((record) => {
                  const category = crimeCategories.find(
                    (c) => c.id === record.category,
                  );
                  const tier =
                    crimeTiers.find((t) => t.id === category?.tier) ??
                    crimeTiers[0];

                  return (
                    <tr key={record.id} className="transition-colors hover:bg-slate-50">
                      <td className="p-3 align-top">
                        <div className="flex flex-col gap-1">
                          <span
                            className={cn(
                              "w-fit rounded border px-1.5 py-0.5 font-mono text-[0.625rem] font-bold",
                              tier.chip,
                            )}
                          >
                            {category?.banglaLabel}
                          </span>
                          <span className="line-clamp-2 max-w-[26ch] text-slate-700">
                            {record.headline}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 align-top">
                        <IdentityCell record={record} />
                      </td>
                      <td className="p-3 align-top">
                        <span className="font-mono text-[0.6875rem] font-bold text-slate-700">
                          {category?.statute ?? "—"}
                        </span>
                      </td>
                      <td className="p-3 align-top">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">
                            {record.location.thana}
                          </span>
                          <span className="font-mono text-[0.625rem] text-slate-500">
                            {record.location.district}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 align-top">
                        <StatusCell record={record} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="flex items-start gap-1.5 font-sans text-[0.6875rem] text-slate-600">
            <Icon name="info" className="mt-px shrink-0 text-[14px]" />
            <span className="max-w-[80ch]">
              মামলার অবস্থা পরিবর্তিত হতে পারে। খালাস বা অব্যাহতির তথ্য
              পাওয়ামাত্র সংশ্লিষ্ট রেকর্ড হালনাগাদ বা অপসারণ করা হয়।
            </span>
          </p>
        </div>

        {/* ── Report console ────────────────────────────────────── */}
        <div className="lg:col-span-4">
          <CrimeReportConsole />
        </div>
      </div>
    </section>
  );
}
