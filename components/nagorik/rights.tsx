import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { ARTICLE_21, CIVIC_LAWS, HELPLINES, RIGHTS } from "@/data/nagorik";
import { toAsciiDigits } from "@/lib/bangla";

/** The citizen's rights under the Constitution, the duty that comes with them, and where to go for justice. */
export function Rights() {
  return (
    <section id="rights" aria-labelledby="rights-title" className="section-band scroll-mt-40 bg-[#fbf8f1]">
      <div className="mx-auto max-w-7xl px-gutter-x">
        <div className="story-reveal max-w-3xl">
          <h2 id="rights-title" className="font-bengali text-3xl leading-tight font-bold text-balance text-text-primary sm:text-4xl">
            আপনার <span className="text-bd-green">অধিকার</span> — সংবিধানে লেখা, আদালতে বলবৎযোগ্য
          </h2>
          <p className="mt-3 font-bengali text-lg leading-relaxed text-text-secondary">
            বাংলাদেশের সংবিধানের তৃতীয় ভাগের মৌলিক অধিকার। অধিকার জানলে কেউ ঠকাতে পারে না — আর অধিকারের সাথেই আসে কর্তব্য।
          </p>
        </div>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {RIGHTS.map((r) => (
            <li key={r.article}>
              <Card className="glass-card h-full flex-row gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-base ring-0">
                <span className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl bg-bd-green text-white">
                  <Icon name={r.icon} className="text-[22px]" />
                </span>
                <div>
                  <p className="font-bengali text-xs font-semibold text-bd-green">অনুচ্ছেদ {r.article}</p>
                  <h3 className="font-bengali text-lg font-bold text-text-primary">{r.title}</h3>
                  <p className="mt-1 font-bengali text-[15px] leading-relaxed text-text-secondary">{r.body}</p>
                </div>
              </Card>
            </li>
          ))}
        </ul>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <blockquote className="rounded-3xl bg-bdgreen-950 p-7 text-white sm:p-9">
            <p className="font-bengali text-sm font-semibold text-signal-orange">সংবিধান, অনুচ্ছেদ ২১ — নাগরিক ও সরকারি কর্মচারীর কর্তব্য</p>
            <p className="mt-4 font-bengali text-xl leading-relaxed font-semibold">“{ARTICLE_21.citizen}”</p>
            <p className="mt-4 font-bengali text-base leading-relaxed text-emerald-50/85">“{ARTICLE_21.servant}”</p>
          </blockquote>

          <div className="rounded-3xl border border-slate-200 bg-white p-7">
            <h3 className="flex items-center gap-2 font-bengali text-xl font-bold text-text-primary">
              <Icon name="gavel" className="text-[24px] text-bd-green" /> ন্যায়বিচারের পথ — আইনজীবী ছাড়াও
            </h3>
            <ul className="mt-4 space-y-4">
              {CIVIC_LAWS.map((l) => (
                <li key={l.name}>
                  <p className="font-bengali text-base font-bold text-text-primary">{l.name}</p>
                  <p className="font-bengali text-[15px] leading-relaxed text-text-secondary">{l.use}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <h3 className="mt-12 font-bengali text-2xl font-bold text-text-primary">জাতীয় হেল্পলাইন — মুখস্থ রাখুন, অন্যকেও জানান</h3>
        <ul className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {HELPLINES.map((h) => (
            <li key={h.number}>
              <a
                href={`tel:${toAsciiDigits(h.number)}`}
                className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-bd-green/40 hover:shadow-[0_12px_24px_-14px_rgb(0_103_71/0.5)] focus-visible:ring-2 focus-visible:ring-bd-green/40 focus-visible:outline-none motion-reduce:hover:translate-y-0"
              >
                <Icon name={h.icon} className="text-[24px] text-bd-green" />
                <span className="mt-2 font-bengali text-3xl font-bold text-text-primary">{h.number}</span>
                <span className="font-bengali text-sm font-bold text-text-primary">{h.name}</span>
                <span className="mt-0.5 font-bengali text-xs text-text-muted">{h.when}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
