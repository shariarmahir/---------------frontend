import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/ui/section-kit";
import { helplines } from "@/data/complaints";

/**
 * The free national helplines, one tap to call (Mahir, 2026-10-29). Someone
 * arriving mid-crisis should reach 999 without reading anything, so the row
 * sits straight under the hero. Every card is the same navy field with the
 * number in gold; the two lines open day and night say so. Numbers are
 * official shortcodes only (data/complaints.ts), never an unverified
 * station line.
 */
export function HelplineStrip() {
  return (
    <section id="helplines" aria-labelledby="helplines-title" className="section-band w-full scroll-mt-40 bg-black">
      <div className="mx-auto max-w-384 px-gutter-x">
        <SectionHeading
          tone="dark"
          title={<span id="helplines-title">In danger? Call first.</span>}
          lead="Free national helplines. Tap a number to call it."
        />
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {helplines.map((h) => (
            <li key={h.number} className="story-reveal flex">
              <a
                href={`tel:${h.number}`}
                className="group flex w-full flex-col gap-3 rounded-2xl bg-bdnavy-900 p-4 text-white ring-1 ring-white/12 ring-inset [-webkit-tap-highlight-color:transparent] transition-[translate,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[0_18px_36px_-20px_rgb(228_176_39/0.6)] hover:ring-signal-orange/60 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-5"
              >
                <span className="flex items-center justify-between">
                  <Icon name={h.icon} className="text-2xl text-bdnavy-300" />
                  <Icon
                    name="call"
                    className="text-xl text-signal-orange transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-12 motion-reduce:transition-none"
                  />
                </span>
                <span className="font-grotesk text-3xl leading-none font-bold text-signal-orange tabular-nums sm:text-4xl">{h.number}</span>
                <span>
                  <span className="block font-sans text-sm font-bold">{h.label}</span>
                  <span className="mt-1 block font-sans text-xs leading-snug text-white/65">{h.note}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
        <p className="story-reveal mt-5 flex items-start gap-2 font-sans text-sm leading-relaxed text-white/65">
          <Icon name="info" className="mt-0.5 shrink-0 text-lg text-bdnavy-300" />
          Kandari is not a government agency. This page helps you find the right office, write a clear complaint and keep evidence; nothing written here
          reaches an office by itself.
        </p>
      </div>
    </section>
  );
}
