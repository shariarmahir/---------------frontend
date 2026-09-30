import { StoryHeading } from "@/components/bangladesh/story-heading";
import { Icon } from "@/components/ui/icon";
import { LIFT, glowStyle, surfaceAt } from "@/components/ui/surfaces";
import { ARTICLE_21, CIVIC_LAWS, HELPLINES, RIGHTS } from "@/data/nagorik";
import { toAsciiDigits } from "@/lib/bangla";
import { cn } from "@/lib/utils";

/**
 * The citizen's rights under the Constitution, the duty that comes with
 * them, and where to go for justice — solid colour cards on the black ground,
 * lifting on hover and on touch.
 */
export function Rights() {
  return (
    <section id="rights" aria-labelledby="rights-title" className="section-band scroll-mt-40 bg-black">
      <div className="mx-auto max-w-7xl px-gutter-x">
        <StoryHeading
          id="rights-title"
          index="০৩"
          kicker="অধিকার"
          title="আপনার অধিকার — সংবিধানে লেখা, আদালতে বলবৎযোগ্য"
          accent="অধিকার"
          lede="বাংলাদেশের সংবিধানের তৃতীয় ভাগের মৌলিক অধিকার। অধিকার জানলে কেউ ঠকাতে পারে না — আর অধিকারের সাথেই আসে কর্তব্য।"
        />

        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-[repeat(2,minmax(0,1fr))] sm:gap-4 lg:grid-cols-[repeat(3,minmax(0,1fr))]">
          {RIGHTS.map((r, i) => {
            const tone = surfaceAt(i + Math.floor(i / 4));
            return (
              <li key={r.article} className="story-reveal flex">
                <div style={glowStyle(tone.glow)} className={cn("group flex w-full gap-4 rounded-3xl p-5 shadow-sm", LIFT, tone.card)}>
                  <span
                    className={cn(
                      "flex size-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:-rotate-6 motion-reduce:transition-none motion-reduce:group-hover:rotate-0",
                      tone.tile,
                    )}
                  >
                    <Icon name={r.icon} className="text-[24px]" />
                  </span>
                  <div>
                    <p className="font-bengali text-xs font-bold opacity-80">অনুচ্ছেদ {r.article}</p>
                    <h3 className="font-bengali text-lg font-bold">{r.title}</h3>
                    <p className="mt-1 font-bengali text-[15px] leading-relaxed">{r.body}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <blockquote style={glowStyle("var(--color-bd-green)")} className={cn("story-reveal rounded-3xl bg-bd-green p-7 text-white shadow-sm sm:p-9", LIFT)}>
            <p className="font-bengali text-sm font-bold text-signal-orange">সংবিধান, অনুচ্ছেদ ২১ — নাগরিক ও সরকারি কর্মচারীর কর্তব্য</p>
            <p className="mt-4 font-bengali text-xl leading-relaxed font-semibold">“{ARTICLE_21.citizen}”</p>
            <p className="mt-4 font-bengali text-base leading-relaxed text-white/90">“{ARTICLE_21.servant}”</p>
          </blockquote>

          <div className="story-reveal rounded-3xl bg-text-primary p-7 text-white ring-1 ring-white/12">
            <h3 className="flex items-center gap-2 font-bengali text-xl font-bold text-signal-orange">
              <Icon name="gavel" className="text-[24px]" /> ন্যায়বিচারের পথ — আইনজীবী ছাড়াও
            </h3>
            <ul className="mt-4 space-y-4">
              {CIVIC_LAWS.map((l) => (
                <li key={l.name} className="border-l-2 border-signal-orange pl-4">
                  <p className="font-bengali text-base font-bold">{l.name}</p>
                  <p className="font-bengali text-[15px] leading-relaxed text-white/80">{l.use}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <h3 className="story-reveal mt-14 font-bengali text-2xl font-bold text-signal-orange">জাতীয় হেল্পলাইন — মুখস্থ রাখুন, অন্যকেও জানান</h3>
        <ul className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {HELPLINES.map((h, i) => {
            const tone = surfaceAt(i + Math.floor(i / 4));
            return (
              <li key={h.number} className="story-reveal flex">
                <a
                  href={`tel:${toAsciiDigits(h.number)}`}
                  style={glowStyle(tone.glow)}
                  className={cn("group flex w-full flex-col rounded-2xl p-4 shadow-sm focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none", LIFT, tone.card)}
                >
                  <Icon name={h.icon} className="text-[24px]" />
                  <span className="mt-2 font-bengali text-3xl font-bold">{h.number}</span>
                  <span className="font-bengali text-sm font-bold">{h.name}</span>
                  <span className="mt-0.5 font-bengali text-xs opacity-85">{h.when}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
