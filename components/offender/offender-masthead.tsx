import { Icon } from "@/components/ui/icon";
import { offenderStats } from "@/data/offender-index";

/**
 * The page's opening band: title, provenance, and the four headline
 * readouts.
 *
 * Every figure counts CASES or CLUSTERS. The reference's headline was
 * "মোট চিহ্নিত অপরাধী: ৮,৯৪০ জন" — counting unconvicted people as
 * criminals in the largest number on the page. The same data is here as
 * "খোলা কেস ক্লাস্টার", which is what the number actually measures.
 */
export function OffenderMasthead() {
  return (
    <section className="w-full border-b border-border bg-white px-gutter pt-space-md pb-space-lg">
      <div className="mx-auto flex max-w-360 flex-col gap-space-md">
        <div className="flex flex-col justify-between gap-space-md lg:flex-row lg:items-end">
          <div className="flex items-start gap-space-sm">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-bd-green text-white">
              <Icon name="badge" className="text-[22px]" />
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-space-xs">
                <span className="font-mono text-label-xs font-bold tracking-wider text-bd-green uppercase">
                  অপরাধ প্যাটার্ন ও দণ্ড রেজিস্ট্রি
                </span>
                <span className="rounded border border-bdgreen-200 bg-bdgreen-50 px-1.5 py-0.5 font-mono text-[0.625rem] font-bold text-bd-green">
                  যাচাইকৃত নথি
                </span>
              </div>
              <h1 className="font-display text-headline-lg-mobile font-bold tracking-tight text-slate-900 sm:text-headline-lg">
                আজকের <span className="text-national-crimson">অপরাধী</span>{" "}
                সূচক
              </h1>
              <p className="max-w-[72ch] font-sans text-body-md text-slate-600">
                পুনরাবৃত্ত অপরাধের ধরন, এলাকাভিত্তিক ক্লাস্টার ও আদালতে
                দণ্ডপ্রাপ্তদের প্রকাশ্য রেকর্ড — থানার এজাহার, অভিযোগপত্র ও
                প্রকাশিত রায় থেকে সংগৃহীত।
              </p>
            </div>
          </div>

          {/* Telemetry chips. */}
          <div className="flex flex-wrap items-center gap-space-xs">
            <Chip
              icon="folder_open"
              label="খোলা কেস ক্লাস্টার"
              value={offenderStats.openClusters}
              unit="টি"
            />
            <Chip
              icon="search"
              label="তদন্তাধীন"
              value={offenderStats.underInvestigation}
              unit="টি"
              tone="amber"
            />
            <Chip
              icon="gavel"
              label="দণ্ডপ্রাপ্ত"
              value={offenderStats.convictions}
              unit="জন"
              tone="green"
            />
          </div>
        </div>

        {/* Standing notice. The single most important element on this
            page: it is what separates a pattern index from a watchlist. */}
        <div className="flex flex-col gap-space-xs rounded-xl border border-amber-300 bg-amber-50 p-space-md">
          <span className="flex items-center gap-1.5 font-sans text-label-md font-bold text-amber-900">
            <Icon name="balance" className="text-[18px]" filled />
            এই পাতায় কোনো অভিযুক্তের নাম বা ছবি নেই
          </span>
          <p className="max-w-[86ch] font-sans text-[0.8125rem] leading-relaxed text-amber-900">
            তদন্তাধীন, বিচারাধীন, পরোয়ানাভুক্ত বা জামিনপ্রাপ্ত — কোনো
            অবস্থাতেই কারও পরিচয় প্রকাশ করা হয় না। আদালতে দোষী সাব্যস্ত
            হওয়ার আগে কাউকে “অপরাধী” হিসেবে চিহ্নিত করা আইনত মানহানিকর, এবং
            ভুল শনাক্তকরণ থেকে নিরপরাধ মানুষ গণপিটুনির শিকার হয়।
          </p>
          <p className="max-w-[86ch] font-sans text-[0.8125rem] leading-relaxed text-amber-900">
            <strong>প্যাটার্ন ভিউ</strong> দেখায় অপরাধের ধরন ও পুনরাবৃত্তি —
            ব্যক্তি নয়, কেস ক্লাস্টার। <strong>দণ্ডপ্রাপ্ত রেজিস্ট্রি</strong>{" "}
            কেবল রায় হয়ে যাওয়া মামলা দেখায়, আদালত ও মামলা নম্বরসহ।
          </p>
        </div>
      </div>
    </section>
  );
}

function Chip({
  icon,
  label,
  value,
  unit,
  tone = "slate",
}: {
  icon: string;
  label: string;
  value: string;
  unit: string;
  tone?: "slate" | "amber" | "green";
}) {
  const tones = {
    slate: "border-border bg-slate-50 text-slate-900",
    amber: "border-amber-300 bg-amber-50 text-amber-900",
    green: "border-bdgreen-200 bg-bdgreen-50 text-bd-green",
  } as const;

  return (
    <div
      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 ${tones[tone]}`}
    >
      <Icon name={icon} className="text-[16px] opacity-70" />
      <span className="font-mono text-[0.6875rem] opacity-80">{label}:</span>
      <span className="font-display text-body-md font-bold tabular-nums">
        {value}
        <span className="ml-0.5 font-sans text-[0.6875rem] font-medium opacity-70">
          {unit}
        </span>
      </span>
    </div>
  );
}
