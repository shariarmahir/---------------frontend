import { Icon } from "@/components/ui/icon";

/**
 * Reserved for the founder's own summary of the crisis and the shield.
 * Placeholder until that text is written — the page says so plainly.
 */
export function SummaryPlaceholder() {
  return (
    <section id="summary" aria-labelledby="summary-title" className="section-band scroll-mt-40 bg-[#fbf8f1]">
      <div className="mx-auto max-w-4xl px-gutter-x">
        <div className="relative rounded-3xl border-2 border-dashed border-bd-green/35 bg-white p-8 sm:p-12">
          <span className="absolute -top-3.5 left-8 rounded-full bg-signal-orange px-3 py-0.5 font-bengali text-xs font-bold text-text-primary">প্লেসহোল্ডার</span>
          <h2 id="summary-title" className="flex items-center gap-3 font-bengali text-2xl font-bold text-text-primary sm:text-3xl">
            <Icon name="summarize" className="text-[30px] text-bd-green" /> সারসংক্ষেপ
          </h2>
          <p className="mt-3 font-bengali text-base leading-relaxed text-text-secondary">
            সংকট, ঢাল আর নাগরিকের দায়িত্ব নিয়ে প্রতিষ্ঠাতার নিজের লেখা সারসংক্ষেপ এখানে বসবে।
          </p>
          <div aria-hidden className="mt-8 space-y-3">
            {[100, 94, 97, 72].map((w, i) => (
              <span key={i} className="block h-3 rounded-full bg-slate-100" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
