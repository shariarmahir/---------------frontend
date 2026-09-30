import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { SectionHeading, btn } from "@/components/ui/section-kit";
import { glowStyle } from "@/components/ui/surfaces";
import { NAZRUL_MOTTO } from "@/data/navigation";
import { founder } from "@/data/team";
import { cn } from "@/lib/utils";

/**
 * The founder, as the home page's CEO poster card at full width: a solid
 * gold field, the portrait on the left fading into the gold, the motto on an
 * ink plate, and the actions in ink so they hold on gold.
 */
export function FounderSpotlight() {
  return (
    <section id="founder" aria-labelledby="founder-title" className="section-band mx-auto max-w-7xl scroll-mt-40 px-gutter-x">
      <SectionHeading tone="dark" title="The core" lead="Where every signal at Kandari-Lab starts — the founder's vision for fixing Bangladesh one pixel at a time." />

      <article
        style={glowStyle("var(--color-signal-orange)")}
        className="story-reveal group grid grid-cols-1 overflow-hidden rounded-3xl bg-signal-orange text-text-primary shadow-[0_28px_60px_-34px_var(--glow)] transition-[box-shadow] duration-500 hover:shadow-[0_36px_70px_-30px_var(--glow)] lg:grid-cols-12"
      >
        {/* Portrait, fading into the gold (downward on phones, rightward from lg). */}
        <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[16/11] lg:col-span-5 lg:aspect-auto lg:min-h-[34rem]">
          {founder.photo && (
            <Image
              src={founder.photo}
              alt={`${founder.name}, ${founder.role}`}
              fill
              sizes="(min-width: 1024px) 520px, 100vw"
              quality={90}
              className="object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 motion-reduce:transition-none"
            />
          )}
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-b from-transparent to-signal-orange lg:inset-y-0 lg:right-0 lg:left-auto lg:h-full lg:w-1/4 lg:bg-linear-to-r" />
          <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-text-primary px-3 py-1 font-mono text-[10px] font-bold tracking-widest text-signal-orange uppercase">
            <Icon name="neurology" className="text-[14px]!" />
            The core
          </span>
        </div>

        <div className="relative -mt-10 flex flex-col gap-6 p-6 sm:p-10 lg:col-span-7 lg:mt-0">
          <div>
            <span className="w-fit rounded-full bg-text-primary px-3 py-1 font-mono text-[11px] font-bold text-signal-orange uppercase">Chief Executive Officer</span>
            <h2 id="founder-title" className="mt-3 font-grotesk text-3xl leading-tight font-bold tracking-tight uppercase sm:text-4xl lg:text-5xl">
              {founder.name}
            </h2>
            <p className="mt-1 font-bengali text-base font-semibold">{founder.roleBn}</p>
          </div>

          <p className="font-sans text-base leading-relaxed sm:text-lg">{founder.about}</p>

          <blockquote className="rounded-2xl bg-text-primary px-5 py-4 text-white">
            <p className="font-bengali text-lg font-semibold text-signal-orange">{NAZRUL_MOTTO}</p>
            <footer className="mt-1 font-sans text-xs text-white/75">Kandari-Lab&apos;s motto — from Kazi Nazrul Islam&apos;s “Kandari Hushiyar”</footer>
          </blockquote>

          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {founder.focus.map((f) => (
              <li key={f} className="flex items-start gap-2 rounded-xl bg-bd-green px-3 py-2.5 font-sans text-sm text-white">
                <Icon name="check_circle" filled className="mt-0.5 text-[16px]! text-signal-orange" />
                {f}
              </li>
            ))}
          </ul>

          <ul className="flex flex-wrap gap-2" aria-label="Skills">
            {founder.skills.map((s) => (
              <li
                key={s.label}
                className="inline-flex items-center gap-2 rounded-full bg-text-primary px-3 py-1.5 font-sans text-xs font-semibold text-white transition-[translate] duration-300 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
              >
                <Icon name={s.icon} className="text-[16px]! text-signal-orange" />
                {s.label}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link href={`/team/${founder.slug}`} className={btn.ink}>
              View profile
              <Icon name="arrow_forward" className="text-[18px]!" />
            </Link>
            <Link href="#members" className={cn(btn.ink, "bg-bd-green hover:bg-bd-green-dark")}>
              Meet the crew
            </Link>
          </div>
        </div>
      </article>
    </section>
  );
}
