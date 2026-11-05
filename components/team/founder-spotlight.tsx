import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { SectionHeading, btn } from "@/components/ui/section-kit";
import { NAZRUL_MOTTO } from "@/data/navigation";
import { founder } from "@/data/team";

/**
 * The founder as the home page's CEO poster at full width: a cobalt field,
 * the portrait in its own frame (no fade), the gold role pill and name, the
 * motto on a navy plate, what he owns and what he does, and the two ways on.
 */
export function FounderSpotlight() {
  return (
    <section id="founder" aria-labelledby="founder-title" className="section-band mx-auto max-w-7xl px-gutter-x">
      <SectionHeading tone="dark" title="The core" lead="Where every signal at Kandari-Lab starts: the founder's vision for fixing Bangladesh one pixel at a time." />

      <article className="story-reveal group grid grid-cols-1 gap-6 rounded-3xl bg-cobalt p-3 text-white ring-1 ring-white/12 sm:gap-8 sm:p-4 lg:grid-cols-12 lg:items-stretch">
        <div className="relative aspect-4/5 w-full overflow-hidden rounded-2xl bg-bdnavy-900 sm:aspect-16/11 lg:col-span-5 lg:aspect-auto lg:min-h-136">
          {founder.photo && (
            <Image
              src={founder.photo}
              alt={`${founder.name}, ${founder.role}`}
              fill
              sizes="(min-width: 1024px) 520px, 100vw"
              quality={90}
              className="object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] motion-reduce:transition-none"
            />
          )}
        </div>

        <div className="flex flex-col gap-6 px-3 pb-5 sm:px-6 sm:pb-6 lg:col-span-7 lg:py-6 lg:pr-8 lg:pl-2">
          <div>
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-signal-orange px-3 py-1 font-sans text-xs font-bold text-text-primary">
              <Icon name="workspace_premium" className="text-base!" /> {founder.role}
            </span>
            <h2 id="founder-title" className="mt-4 font-grotesk text-3xl leading-tight font-bold tracking-tight text-signal-orange sm:text-4xl lg:text-5xl">
              {founder.name}
            </h2>
            <p className="mt-1 font-bengali text-base font-semibold text-white/85">{founder.roleBn}</p>
          </div>

          <p className="max-w-[62ch] font-sans text-base leading-relaxed text-white/90 sm:text-lg">{founder.about}</p>

          <blockquote className="rounded-2xl bg-bdnavy-900 px-5 py-4 ring-1 ring-white/12">
            <p className="font-bengali text-lg font-semibold text-signal-orange">{NAZRUL_MOTTO}</p>
            <footer className="mt-1 font-sans text-xs text-white/70">Kandari-Lab&apos;s motto, from Kazi Nazrul Islam&apos;s “Kandari Hushiyar”</footer>
          </blockquote>

          <div>
            <h3 className="font-grotesk text-sm font-bold text-signal-orange">What he owns</h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-3">
              {founder.focus.map((f) => (
                <li key={f} className="flex items-start gap-2 rounded-xl bg-bdnavy-900 px-3 py-2.5 font-sans text-sm leading-snug text-white ring-1 ring-white/12">
                  <Icon name="check_circle" filled className="mt-0.5 text-base! text-signal-orange" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <ul className="flex flex-wrap gap-2" aria-label="Skills">
            {founder.skills.map((s) => (
              <li key={s.label} className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-sans text-xs font-semibold text-white ring-1 ring-white/25 ring-inset">
                <Icon name={s.icon} className="text-base! text-signal-orange" />
                {s.label}
              </li>
            ))}
          </ul>

          <div className="mt-auto flex flex-wrap items-center gap-3 pt-1">
            <Link href={`/team/${founder.slug}`} className={btn.gold}>
              <Icon name="person" className="text-xl!" /> View profile
            </Link>
          </div>
        </div>
      </article>
    </section>
  );
}
