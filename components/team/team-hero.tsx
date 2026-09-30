import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { SignalSeam, btn } from "@/components/ui/section-kit";
import { SolarSystem, type OrbitConfig } from "@/components/ui/solar-system";
import { crew, deptOrder, fellowship, founder, toneOf, type OrbitRing } from "@/data/team";
import { MemberAvatar } from "./member-avatar";

/** Each ring is one solid theme colour: gold, orange, green — inside out. */
const RINGS: { ring: OrbitRing; name: string; speed: number; color: string }[] = [
  { ring: "inner", name: "Leadership", speed: 34, color: "var(--color-signal-orange)" },
  { ring: "mid", name: "Idea, Creative & Client", speed: 52, color: "var(--color-bdorange-600)" },
  { ring: "outer", name: "Engineering — IoT & AI", speed: 74, color: "var(--color-bdgreen-500)" },
];

const orbits: OrbitConfig[] = RINGS.map(({ ring, name, speed, color }) => ({
  id: ring,
  name,
  radius: ring,
  speed,
  color,
  items: crew
    .filter((m) => m.ring === ring)
    .map((m) => ({
      id: m.slug,
      label: m.name,
      sublabel: m.role,
      color: toneOf(m).color,
      href: `/team/${m.slug}`,
      ariaLabel: `${m.name}, ${m.role} — view profile`,
      avatar: <MemberAvatar member={m} className="size-8 lg:size-9" textClassName="text-[11px]" sizes="40px" />,
    })),
}));

/** The founder at the centre: the sun every signal leaves from. */
function Core() {
  return (
    <Link
      href={`/team/${founder.slug}`}
      aria-label={`${founder.name}, ${founder.role} — view profile`}
      className="group relative flex flex-col items-center [-webkit-tap-highlight-color:transparent] focus-visible:outline-none"
    >
      <span className="relative grid place-items-center">
        {/* Breathing gold halo, and two counter-rotating arcs — gold and green. */}
        <span aria-hidden className="orbit-halo absolute inset-0 rounded-full border-2 border-signal-orange" />
        <span aria-hidden className="orbit-spin absolute -inset-2.5 rounded-full border-[3px] border-transparent border-t-signal-orange border-l-signal-orange" />
        <span aria-hidden className="orbit-spin-rev absolute -inset-5 rounded-full border-2 border-transparent border-b-bdgreen-500 border-r-bdgreen-500" />
        <span className="relative rounded-full bg-signal-orange p-[3px] shadow-[0_0_48px_-4px_var(--color-signal-orange)] transition-[scale] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 group-focus-visible:scale-105 group-focus-visible:ring-2 group-focus-visible:ring-white">
          <MemberAvatar member={founder} className="size-16 sm:size-20 xl:size-24" textClassName="text-xl sm:text-2xl" sizes="96px" />
        </span>
      </span>
      <span className="mt-4 rounded-full bg-signal-orange px-3 py-1 text-center max-sm:hidden text-text-primary shadow-[0_10px_24px_-12px_var(--color-signal-orange)]">
        <span className="block font-grotesk text-[11px] font-bold whitespace-nowrap sm:text-xs">{founder.name}</span>
        <span className="block font-mono text-[9px] font-bold tracking-wider whitespace-nowrap uppercase sm:text-[10px]">{founder.role}</span>
      </span>
    </Link>
  );
}

/**
 * The /team hero, in the home hero's frame: the same `hero-band` height and
 * ink field, the claim on the left with the gold primary action, the
 * founder's galaxy on the right, and the ink proof strip with the header's
 * gold pulse closing the band.
 */
export function TeamHero() {
  const stats = [
    { label: "Builders", value: String(crew.length + 1) },
    { label: "Departments", value: String(deptOrder.length) },
    { label: "Orbits", value: String(RINGS.length) },
    { label: "Fellowship cycle", value: fellowship.cycle },
  ];

  return (
    <section id="orbit" aria-labelledby="team-title" className="relative w-full scroll-mt-40">
      <div className="hero-band relative isolate flex w-full items-center overflow-hidden bg-text-primary">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-2 px-gutter-x py-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:py-0">
          <div className="flex flex-col items-start gap-space-md">
            <h1 id="team-title" className="max-w-[18ch] font-grotesk text-3xl leading-[1.1] font-bold tracking-tight text-pretty text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08] xl:text-[3.25rem]">
              One signal. <span className="text-signal-orange">Every builder.</span>
            </h1>
            <p className="max-w-[46ch] font-sans text-body-md leading-relaxed text-white/85 lg:text-body-lg">
              Every idea at Kandari-Lab starts as a signal from the founder&apos;s vision and travels out to every desk, bench and line of
              code. Point at a planet to pause the galaxy; tap it to open a profile.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-space-xs">
              <Link href="#members" className={btn.gold}>
                <Icon name="groups" className="text-[18px]" />
                Meet the crew
              </Link>
              <Link href="#fellowship" className={btn.ghost}>
                <Icon name="school" className="text-[18px] text-bdgreen-500" />
                Join the fellowship
              </Link>
            </div>
          </div>

          <SolarSystem core={<Core />} orbits={orbits} className="mx-auto" />
        </div>
      </div>

      {/* Proof strip — the header's ink strip at full width, gold pulse on its seam. */}
      <div className="relative w-full bg-text-primary">
        <SignalSeam className="top-0" />
        <dl className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-white/10 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center gap-1 px-space-sm py-space-md text-center max-lg:nth-[2n+1]:border-l-0 max-lg:nth-[n+3]:border-t max-lg:nth-[n+3]:border-white/10"
            >
              <dt className="font-mono text-label-xs font-medium tracking-widest text-white/65 uppercase">{s.label}</dt>
              <dd className="font-grotesk text-lg font-bold text-signal-orange tabular-nums sm:text-xl">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
