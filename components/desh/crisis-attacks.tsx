import { StoryHeading } from "@/components/bangladesh/story-heading";
import { Icon } from "@/components/ui/icon";
import { LIFT, glowStyle, surfaceAt } from "@/components/ui/surfaces";
import { CRISIS_ATTACKS } from "@/data/desh";
import { toBanglaDigits } from "@/lib/bangla";
import { cn } from "@/lib/utils";

/**
 * The national crisis, as the attacks an ordinary household feels — each
 * paired with the shield a citizen can raise today, and the dossier
 * problem it belongs to. Solid colour cards, like the home page's tiles.
 */
export function CrisisAttacks() {
  return (
    <section id="attacks" aria-labelledby="attacks-title" className="section-band-tinted scroll-mt-40 bg-black">
      <div className="mx-auto max-w-7xl px-gutter-x">
        <StoryHeading
          id="attacks-title"
          index="০১"
          kicker="আক্রমণ"
          title="দেশের ওপর আক্রমণ — আর প্রতিটির বিপরীতে একটি ঢাল"
          accent="আক্রমণ"
          lede="সংকট দূরের কোনো শব্দ নয়; এগুলো প্রতিদিন আমাদের ঘরে ঢোকে। সরকার এখনই সব সামলাতে পারছে না — তাই নিজের এলাকা, নিজের শহর আর নিজের দেশ রক্ষার প্রথম দায় আমাদের নিজেদের।"
        />

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-[repeat(2,minmax(0,1fr))] lg:grid-cols-[repeat(4,minmax(0,1fr))]">
          {CRISIS_ATTACKS.map((a, i) => {
            const tone = surfaceAt(i + (i >= 4 ? 1 : 0));
            return (
              <li key={a.id} className="story-reveal flex">
                <div
                  style={glowStyle(tone.glow)}
                  className={cn("group flex w-full flex-col rounded-3xl p-5 shadow-sm", LIFT, tone.card)}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:-rotate-6 motion-reduce:transition-none motion-reduce:group-hover:rotate-0",
                        tone.tile,
                      )}
                    >
                      <Icon name={a.icon} className="text-[22px]" />
                    </span>
                    <h3 className="font-bengali text-lg leading-snug font-bold">{a.threat}</h3>
                  </div>
                  <p className="mt-3 font-bengali text-[15px] leading-relaxed">{a.feels}</p>
                  {/* The shield, on an ink tile so it reads on any colour. */}
                  <div className="mt-4 flex-1 rounded-xl bg-text-primary p-3 text-white ring-1 ring-white/12">
                    <p className="flex items-start gap-2 font-bengali text-[15px] leading-relaxed">
                      <Icon name="shield" filled className="mt-0.5 shrink-0 text-[18px] text-signal-orange" />
                      <span>{a.shield}</span>
                    </p>
                  </div>
                  <a
                    href={`/bangladesh/problems#p-${a.problem}`}
                    className="mt-4 self-start rounded font-bengali text-sm font-bold underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-current focus-visible:outline-none"
                  >
                    সমস্যা #{toBanglaDigits(a.problem)} দেখুন →
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
