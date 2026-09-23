import { Icon } from "@/components/ui/icon";
import { crimeStats } from "@/data/crime-index";

const TODAY_EN = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(new Date());

/**
 * The page's opening band: provenance strip, title, and the five headline
 * counts.
 *
 * The counts are a row of readouts rather than five identical cards —
 * they are one reading of the same feed at different cuts, so they share
 * a surface and are separated by rules instead of each floating in its
 * own box.
 */
export function CrimeMasthead() {
  return (
    <section className="w-full border-b border-border bg-linear-to-b from-white to-bdgreen-50/40 px-gutter pt-space-md pb-space-lg">
      <div className="mx-auto flex max-w-360 flex-col gap-space-md">
        {/* ── Provenance strip ──────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-space-md font-mono text-label-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-x-space-sm gap-y-2">
            <span className="inline-flex items-center gap-1.5 rounded border border-amber-300 bg-amber-50 px-2 py-0.5 font-bold text-amber-800">
              <span className="size-1.5 rounded-full bg-signal-orange" />
              দৈনিক অপরাধ ফিড
            </span>
            <span aria-hidden className="text-slate-300">
              •
            </span>
            <span className="hidden sm:inline">
              শ্রেণিবিন্যাস: প্রকাশ্য নথি
            </span>
            <span aria-hidden className="hidden text-slate-300 sm:inline">
              •
            </span>
            <span className="font-semibold text-bd-green">
              উৎস: আদালত ও থানার নথি
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-space-sm">
            <span className="rounded border border-border bg-white px-2 py-0.5">
              {TODAY_EN}
            </span>
          </div>
        </div>

        {/* ── Title + counts ────────────────────────────────────── */}
        <div className="grid grid-cols-1 items-start gap-space-lg lg:grid-cols-12">
          <div className="flex flex-col gap-space-sm lg:col-span-7">
            <span className="inline-flex w-fit items-center gap-1.5 rounded border border-bdgreen-200 bg-bdgreen-50 px-2.5 py-1 font-mono text-label-xs font-semibold text-bd-green">
              <Icon name="videocam" className="text-[16px]" />
              নাগরিক প্রমাণ ও যাচাইকৃত নথির ফিড
            </span>

            <h1 className="font-display text-headline-lg-mobile font-bold tracking-tight text-slate-900 sm:text-headline-lg">
              দৈনন্দিন অপরাধ ও বেআইনি কার্যক্রম{" "}
              <span className="text-bd-green">পর্যবেক্ষণ ডাটাবেস</span>
            </h1>

            <p className="max-w-[68ch] font-sans text-body-md text-slate-600">
              ৬৪ জেলার যাচাইকৃত ঘটনা, নাগরিক ডিজিটাল প্রমাণ, ঘটনাস্থলের
              অবস্থান ও বাংলাদেশ দণ্ডবিধি ১৮৬০ অনুযায়ী চিহ্নিত ধারা — প্রতিদিন
              হালনাগাদ।
            </p>
          </div>

          {/* Counts. One surface, divided — not five floating cards. */}
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3 lg:col-span-5">
            <Stat
              label="আজকের নথিভুক্ত"
              value={crimeStats.filedToday}
              unit="টি"
              note={crimeStats.filedDelta}
              noteClass="text-bd-green"
            />
            <Stat
              label="তদন্তাধীন কেস"
              value={crimeStats.underInvestigation}
              unit="টি"
              note="ভেরিফিকেশন চলছে"
              valueClass="text-amber-700"
            />
            <Stat
              label="অভিযুক্ত / গ্রেপ্তার"
              value={crimeStats.chargedOrArrested}
              unit="জন"
              note="আইনি প্রক্রিয়াধীন"
              valueClass="text-bd-green"
            />

            {/* Emergency. The one place crimson is earned on this row:
                it is an action the reader may need right now. */}
            <a
              href="tel:999"
              className="group col-span-2 flex items-center justify-between gap-space-sm bg-red-50 p-space-sm transition-colors hover:bg-red-100 sm:col-span-3"
            >
              <span className="flex flex-col">
                <span className="font-mono text-label-xs font-medium text-red-800">
                  জাতীয় জরুরি সেবা — পুলিশ, অ্যাম্বুলেন্স, ফায়ার
                </span>
                <span className="font-sans text-[0.6875rem] text-red-700">
                  গড় রেসপন্স: {crimeStats.emergencyResponseAvg}
                </span>
              </span>
              <span className="flex items-center gap-1.5 rounded-lg bg-national-crimson px-space-sm py-1 font-display text-headline-sm font-bold text-white transition-transform group-hover:scale-105">
                <Icon name="emergency" className="text-[18px]" filled />
                ৯৯৯
              </span>
            </a>
          </dl>
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  unit,
  note,
  valueClass = "text-slate-900",
  noteClass = "text-slate-500",
}: {
  label: string;
  value: string;
  unit: string;
  note: string;
  valueClass?: string;
  noteClass?: string;
}) {
  return (
    <div className="flex flex-col bg-white p-space-sm">
      <dt className="font-mono text-[0.6875rem] font-medium text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 flex flex-col">
        <span
          className={`font-display text-headline-sm font-bold tabular-nums ${valueClass}`}
        >
          {value}
          <span className="ml-1 font-sans text-body-sm font-medium text-slate-500">
            {unit}
          </span>
        </span>
        <span className={`font-mono text-[0.625rem] ${noteClass}`}>{note}</span>
      </dd>
    </div>
  );
}
