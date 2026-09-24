import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { NAZRUL_MOTTO } from "@/data/navigation";
import { founder } from "@/data/team";
import { MemberAvatar } from "./member-avatar";
import { NeuralBrain } from "./neural-brain";

/** The founder, given the room the orbit's centre implies. */
export function FounderSpotlight() {
  return (
    <section id="founder" className="section-band mx-auto max-w-7xl scroll-mt-40 px-gutter-x">
      <div
        className="glass-card grid grid-cols-1 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm lg:grid-cols-12"
        style={{ "--card-accent": "var(--color-signal-orange)" } as React.CSSProperties}
      >
        {/* Portrait — placeholder. */}
        <div className="relative flex min-h-[20rem] items-center justify-center overflow-hidden bg-slate-950 lg:col-span-5">
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_50%_110%,rgb(255_145_0/0.45),transparent_60%),radial-gradient(circle_at_10%_0%,rgb(0_103_71/0.6),transparent_55%)]" />
          <NeuralBrain id="brain-core-founder" className="absolute inset-0 size-full opacity-60" />
          <div className="relative flex flex-col items-center">
            <span className="rounded-full bg-linear-to-br from-signal-orange via-amber-300 to-bd-green p-1 shadow-[0_0_60px_rgb(255_145_0/0.4)]">
              <MemberAvatar member={founder} className="size-36 sm:size-44" textClassName="text-5xl" />
            </span>
            <span className="mt-4 rounded-full bg-white/10 px-3 py-1 font-bengali text-xs text-white/80 backdrop-blur-sm">
              প্রোফাইল ছবি শীঘ্রই যোগ হবে
            </span>
          </div>
          <span className="absolute top-5 left-5 inline-flex items-center gap-1.5 rounded-full bg-signal-orange px-3 py-1 font-mono text-[10px] font-bold tracking-widest text-slate-950 uppercase">
            <Icon name="neurology" className="text-[14px]!" />
            The core
          </span>
        </div>

        <div className="flex flex-col gap-6 p-7 sm:p-10 lg:col-span-7">
          <div>
            <span className="font-bengali text-sm font-bold text-signal-orange">{founder.roleBn}</span>
            <h2 className="mt-1 font-grotesk text-3xl leading-tight font-bold tracking-tight text-text-primary uppercase sm:text-4xl lg:text-5xl">
              {founder.name}
            </h2>
            <p className="mt-1 font-mono text-xs font-bold tracking-widest text-bd-green uppercase">{founder.role}</p>
          </div>

          <p className="font-sans text-base leading-relaxed text-text-secondary sm:text-lg">{founder.about}</p>

          <blockquote className="rounded-2xl border-l-4 border-signal-orange bg-orange-50 px-5 py-4">
            <p className="font-bengali text-lg font-semibold text-text-primary">{NAZRUL_MOTTO}</p>
            <footer className="mt-1 font-sans text-xs text-text-muted">Kandari-Lab&apos;s motto — from Kazi Nazrul Islam&apos;s “Kandari Hushiyar”</footer>
          </blockquote>

          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {founder.focus.map((f) => (
              <li key={f} className="flex items-start gap-2 rounded-xl bg-mint-subtle px-3 py-2.5 font-sans text-sm text-text-secondary">
                <Icon name="check_circle" filled className="mt-0.5 text-[16px]! text-bd-green" />
                {f}
              </li>
            ))}
          </ul>

          <ul className="flex flex-wrap gap-2" aria-label="Skills">
            {founder.skills.map((s) => (
              <li
                key={s.label}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-sans text-xs font-semibold text-text-secondary transition-all hover:-translate-y-0.5 hover:border-signal-orange/50 hover:text-text-primary motion-reduce:hover:translate-y-0"
              >
                <Icon name={s.icon} className="text-[16px]! text-signal-orange" />
                {s.label}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href={`/team/${founder.slug}`}
              className="btn-shimmer inline-flex items-center gap-2 rounded-xl bg-signal-orange px-6 py-3 font-grotesk text-sm font-bold text-white uppercase shadow-glow-orange transition-all hover:-translate-y-0.5 hover:bg-bdorange-600 focus-visible:ring-3 focus-visible:ring-signal-orange/40 focus-visible:outline-none motion-reduce:hover:translate-y-0"
            >
              View profile
              <Icon name="arrow_forward" className="text-[18px]!" />
            </Link>
            <Link
              href="#members"
              className="inline-flex items-center gap-2 rounded-xl border border-bd-green/40 px-6 py-3 font-grotesk text-sm font-bold text-bd-green uppercase transition-colors hover:bg-bd-green-light focus-visible:ring-3 focus-visible:ring-bd-green/30 focus-visible:outline-none"
            >
              Meet the crew
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
