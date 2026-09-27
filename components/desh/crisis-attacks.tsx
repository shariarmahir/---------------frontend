import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { CRISIS_ATTACKS } from "@/data/desh";
import { toBanglaDigits } from "@/lib/bangla";

/**
 * The national crisis, as the attacks an ordinary household feels — each
 * paired with the shield a citizen can raise today, and the dossier
 * problem it belongs to.
 */
export function CrisisAttacks() {
  return (
    <section id="attacks" aria-labelledby="attacks-title" className="section-band scroll-mt-40 bg-[#fbf8f1]">
      <div className="mx-auto max-w-7xl px-gutter-x">
        <div className="story-reveal max-w-3xl">
          <h2 id="attacks-title" className="font-bengali text-3xl leading-tight font-bold text-balance text-text-primary sm:text-4xl">
            দেশের ওপর <span className="text-national-crimson">আক্রমণ</span> — আর প্রতিটির বিপরীতে একটি ঢাল
          </h2>
          <p className="mt-3 font-bengali text-lg leading-relaxed text-text-secondary">
            সংকট দূরের কোনো শব্দ নয়; এগুলো প্রতিদিন আমাদের ঘরে ঢোকে। সরকার এখনই সব সামলাতে পারছে না — তাই নিজের এলাকা, নিজের শহর আর নিজের দেশ রক্ষার প্রথম দায় আমাদের নিজেদের।
          </p>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CRISIS_ATTACKS.map((a) => (
            <li key={a.id}>
              <Card
                style={{ "--card-accent": "var(--color-national-crimson)" } as React.CSSProperties}
                className="glass-card h-full gap-0 rounded-2xl border border-slate-200 bg-white p-5 text-base ring-0"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-national-crimson/10 text-national-crimson">
                    <Icon name={a.icon} className="text-[22px]" />
                  </span>
                  <h3 className="font-bengali text-lg leading-snug font-bold text-text-primary">{a.threat}</h3>
                </div>
                <p className="mt-3 font-bengali text-[15px] leading-relaxed text-text-secondary">{a.feels}</p>
                <div className="mt-4 flex-1 border-t border-dashed border-slate-200 pt-4">
                  <p className="flex items-start gap-2 font-bengali text-[15px] leading-relaxed text-bd-green-dark">
                    <Icon name="shield" filled className="mt-0.5 text-[18px] text-bd-green" />
                    <span>{a.shield}</span>
                  </p>
                </div>
                <a
                  href={`#p-${a.problem}`}
                  className="mt-4 self-start rounded font-bengali text-sm font-semibold text-bd-green hover:underline focus-visible:ring-2 focus-visible:ring-bd-green/30 focus-visible:outline-none"
                >
                  সমস্যা #{toBanglaDigits(a.problem)} দেখুন →
                </a>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
