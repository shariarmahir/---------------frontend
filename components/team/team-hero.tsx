import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { SolarSystem, type OrbitConfig } from "@/components/ui/solar-system";
import { crew, departments, founder, type OrbitRing } from "@/data/team";
import { MemberAvatar } from "./member-avatar";
import { NeuralBrain } from "./neural-brain";

const RINGS: { ring: OrbitRing; name: string; speed: number }[] = [
  { ring: "inner", name: "Leadership", speed: 34 },
  { ring: "mid", name: "Idea, Creative & Client", speed: 52 },
  { ring: "outer", name: "Engineering — IoT & AI", speed: 74 },
];

const orbits: OrbitConfig[] = RINGS.map(({ ring, name, speed }) => ({
  id: ring,
  name,
  radius: ring,
  speed,
  items: crew
    .filter((m) => m.ring === ring)
    .map((m) => ({
      id: m.slug,
      label: m.name,
      sublabel: m.role,
      color: departments[m.depts[0]].color,
      href: `/team/${m.slug}`,
      ariaLabel: `${m.name}, ${m.role} — view profile`,
      avatar: <MemberAvatar member={m} className="size-8 ring-1 ring-white/20 lg:size-9" textClassName="text-[11px]" />,
    })),
}));

/** The founder at the centre: the "sun" every signal leaves from. */
function Core() {
  return (
    <Link
      href={`/team/${founder.slug}`}
      aria-label={`${founder.name}, ${founder.role} — view profile`}
      className="group relative flex flex-col items-center focus-visible:outline-none"
    >
      <span aria-hidden className="orbit-core-glow absolute top-1/2 left-1/2 -mt-[62px] -ml-[62px] size-[124px] rounded-full bg-signal-orange/30 blur-xl sm:-mt-[80px] sm:-ml-[80px] sm:size-[160px]" />
      <span className="relative rounded-full bg-linear-to-br from-signal-orange via-amber-300 to-bd-green p-[3px] shadow-[0_0_40px_rgb(255_145_0/0.45)] transition-transform duration-300 group-hover:scale-105 group-focus-visible:scale-105">
        <MemberAvatar member={founder} className="size-16 sm:size-[88px] lg:size-[96px]" textClassName="text-xl sm:text-2xl" />
        <span className="absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full bg-slate-950 text-signal-orange ring-2 ring-signal-orange/60 sm:size-8">
          <Icon name="neurology" className="text-[16px]! sm:text-[18px]!" />
        </span>
      </span>
      <span className="mt-2 rounded-full border border-white/15 bg-slate-950/80 px-3 py-1 text-center backdrop-blur-md">
        <span className="block font-grotesk text-[11px] font-bold whitespace-nowrap text-white sm:text-xs">{founder.name}</span>
        <span className="block font-mono text-[9px] tracking-wider whitespace-nowrap text-signal-orange uppercase sm:text-[10px]">
          {founder.role}
        </span>
      </span>
    </Link>
  );
}

export function TeamHero() {
  return (
    <section id="orbit" className="relative isolate scroll-mt-40 overflow-hidden bg-slate-950">
      {/* Backdrop: the brain the signal rises from, a green floor glow and a faint grid. */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_60%,rgb(0_103_71/0.35),transparent_65%)]" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.07]"
        style={{
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
      <NeuralBrain className="absolute top-[58%] left-1/2 -z-10 h-[88%] w-auto max-w-none -translate-1/2 opacity-80 sm:h-[92%]" />

      <div className="mx-auto max-w-7xl px-gutter-x pt-14 text-center sm:pt-16 lg:pt-20">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 font-mono text-[11px] font-semibold tracking-widest text-white/80 uppercase backdrop-blur-md">
          <span className="size-1.5 rounded-full bg-signal-orange shadow-[0_0_8px_#ff9100]" />
          <span className="font-bengali text-xs tracking-normal normal-case">আমাদের দল</span> · The crew
        </span>
        <h1 className="mx-auto mt-5 max-w-4xl font-grotesk text-4xl leading-[1.05] font-bold tracking-tight text-white uppercase sm:text-5xl lg:text-6xl">
          One signal. <span className="text-signal-orange">Every builder.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl font-sans text-base leading-relaxed text-white/75 sm:text-lg">
          Every idea at Kandari-Lab starts as a signal from the founder&apos;s vision and travels out to
          every desk, bench and line of code. Point at a member to pause the orbit; tap or click to open their profile.
        </p>
      </div>

      <SolarSystem core={<Core />} orbits={orbits} className="mx-auto -mt-2 max-w-[980px] sm:-mt-4" />

      {/* Ring legend. */}
      <div className="mx-auto max-w-7xl px-gutter-x pt-6 pb-12 sm:pt-8 lg:pb-16">
        <ul className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {RINGS.map(({ ring, name }, i) => (
            <li
              key={ring}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[11px] text-white/75 backdrop-blur-md"
            >
              <span className="font-bold text-signal-orange">0{i + 1}</span>
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
