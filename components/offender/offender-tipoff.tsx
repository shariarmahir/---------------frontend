import { Icon } from "@/components/ui/icon";

/**
 * The tip-off band.
 *
 * ── Why the anonymity promise is gone ────────────────────────────────
 *
 * The reference read "১০০% এনক্রিপ্টেড পরিচয় গোপনীয়তা" and "আপনার
 * ডিভাইসের আইপি বা পরিচয় সংরক্ষণ করা হয় না" over a form with no
 * backend. The person most likely to trust that sentence is someone
 * reporting an organised syndicate — the one user on this page facing
 * real physical danger. Promising them anonymity we cannot deliver is
 * the most harmful copy on the site.
 *
 * So the band routes to ৯৯৯ and the police's own reporting channels,
 * which do have the infrastructure, and says plainly that Kandari-Lab's
 * own intake is not open yet.
 *
 * TODO(backend): before any in-house intake ships it needs transport
 * encryption, EXIF/GPS stripping, no IP retention, a stated retention
 * window, and a named authority that receives reports.
 */
export function OffenderTipoff() {
  return (
    <section className="relative w-full overflow-hidden bg-bdgreen-900 px-gutter py-space-xl">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -bottom-16 size-96 rounded-full bg-bd-green/30 blur-3xl"
      />

      <div className="relative mx-auto flex max-w-360 flex-col items-start justify-between gap-space-lg lg:flex-row lg:items-center">
        <div className="flex items-start gap-space-md">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-signal-orange text-white shadow-lg">
            <Icon name="shield_person" className="text-[32px]" />
          </span>
          <div className="flex flex-col gap-1.5">
            <span className="w-fit rounded border border-bdgreen-200/40 bg-bdgreen-800 px-2 py-0.5 font-mono text-[0.625rem] font-bold text-bdgreen-100">
              আইনশৃঙ্খলা বাহিনীকে সহায়তা করুন
            </span>
            <h2 className="font-display text-headline-sm font-bold tracking-tight text-white">
              অপরাধের তথ্য জানাতে চান?
            </h2>
            <p className="max-w-[68ch] font-sans text-body-md text-bdgreen-100">
              জরুরি বা চলমান ঘটনার তথ্য সরাসরি ৯৯৯ নম্বরে জানান — এটি
              রাষ্ট্রীয় জরুরি সেবা, সার্বক্ষণিক চালু। কাণ্ডারী-ল্যাবের নিজস্ব
              গোপন তথ্য গ্রহণের ব্যবস্থা এখনো চালু হয়নি; পরিচয় সুরক্ষার
              পূর্ণ ব্যবস্থা সম্পন্ন হওয়ার আগে আমরা তথ্য নেওয়া শুরু করব না।
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-space-sm sm:flex-row lg:w-auto">
          <a
            href="tel:999"
            className="inline-flex w-full items-center justify-center gap-space-xs rounded-xl bg-national-crimson px-space-lg py-space-md font-display text-label-md font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5 focus-visible:ring-3 focus-visible:ring-white/50 focus-visible:outline-none active:translate-y-0 sm:w-auto"
          >
            <Icon name="call" className="text-[24px]" />
            জরুরি হটলাইন ৯৯৯
          </a>
          <a
            href="tel:13219"
            className="inline-flex w-full items-center justify-center gap-space-xs rounded-xl border border-bdgreen-200/40 bg-bdgreen-800 px-space-lg py-space-md font-display text-label-md font-bold text-white transition-colors hover:bg-bdgreen-700 focus-visible:ring-3 focus-visible:ring-white/50 focus-visible:outline-none sm:w-auto"
          >
            <Icon name="computer" className="text-[24px]" />
            সাইবার ক্রাইম ১৩২১৯
          </a>
        </div>
      </div>
    </section>
  );
}
