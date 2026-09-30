/*
 * A builder's profile, in the home page's world: the home hero's band with
 * the member's face at the centre of its own small orbit, the ink proof
 * strip, then solid colour cards for what they own and what they can do,
 * their team as poster cards, and a green / gold pager to the next builder.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { MemberAvatar } from "@/components/team/member-avatar";
import { MemberCard } from "@/components/team/member-card";
import { Icon } from "@/components/ui/icon";
import { PixelMark, SectionHeading, SignalSeam } from "@/components/ui/section-kit";
import { LIFT, glowStyle, surfaceAt } from "@/components/ui/surfaces";
import { crew, departments, founder, getMember, team, toneOf } from "@/data/team";
import { cn } from "@/lib/utils";

export const dynamicParams = false;

export function generateStaticParams() {
  return team.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const m = getMember(slug);
  if (!m) return {};
  return {
    title: `${m.name} — ${m.role} | কাণ্ডারী-ল্যাব`,
    description: m.about,
  };
}

const RING_NAME = { core: "The core", inner: "Orbit 01 · Leadership", mid: "Orbit 02 · Idea & Client", outer: "Orbit 03 · Engineering" } as const;

export default async function MemberProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = getMember(slug);
  if (!m) notFound();

  const dept = departments[m.depts[0]];
  const tone = toneOf(m);
  const isFounder = m.slug === founder.slug;
  const peers = isFounder ? crew : crew.filter((p) => p.slug !== m.slug && p.depts.some((d) => m.depts.includes(d)));
  const i = team.findIndex((p) => p.slug === m.slug);
  const prev = team[(i - 1 + team.length) % team.length];
  const next = team[(i + 1) % team.length];

  const stats = [
    { label: "Orbit", value: RING_NAME[m.ring].split(" · ")[0] },
    { label: "Department", value: m.depts.length > 1 ? `${m.depts.length} teams` : dept.label },
    { label: "Core skills", value: String(m.skills.length) },
    { label: "Works on", value: `${m.works.length} programmes` },
  ];

  const path = isFounder
    ? [{ key: "core", label: founder.name, sub: "The core — where every signal starts" }]
    : [
        { key: "core", label: founder.name, sub: founder.role },
        { key: "dept", label: dept.label, sub: dept.labelBn },
        { key: "me", label: m.name, sub: m.role },
      ];

  return (
    <>
      <SiteHeader />
      <main className="relative w-full bg-black pt-header lg:pt-header-lg">
        {/* Hero — the home hero's band. */}
        <section aria-labelledby="member-title" className="relative w-full">
          <div className="hero-band relative isolate flex w-full items-center overflow-hidden bg-text-primary">
            <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-gutter-x py-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
              <div className="flex min-w-0 flex-col items-start gap-4">
                <Link
                  href="/team"
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-white/10 px-3.5 font-mono text-xs font-bold tracking-widest text-white uppercase ring-1 ring-white/20 [-webkit-tap-highlight-color:transparent] transition-[background-color,scale] duration-200 hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none active:scale-95"
                >
                  <Icon name="arrow_back" className="text-[16px]!" />
                  All team
                </Link>
                <PixelMark tone="dark" className="mt-2" />
                <span className={cn("w-fit rounded-full px-3 py-1 font-mono text-[11px] font-bold uppercase", tone.surface)}>{m.role}</span>
                <h1 id="member-title" className="font-grotesk text-4xl leading-[1.05] font-bold tracking-tight text-white uppercase sm:text-5xl lg:text-6xl">
                  {m.name}
                </h1>
                <p className="font-bengali text-lg font-semibold text-signal-orange">{m.roleBn}</p>
                <div className="flex flex-wrap gap-2">
                  {m.depts.map((id) => (
                    <span key={id} className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[11px] font-bold tracking-wide uppercase", departments[id].surface)}>
                      <Icon name={departments[id].icon} className="text-[14px]!" />
                      {departments[id].label}
                    </span>
                  ))}
                  {!isFounder && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black px-3 py-1 font-mono text-[11px] font-bold tracking-wide text-signal-orange uppercase ring-1 ring-signal-orange/60">
                      <Icon name="neurology" className="text-[14px]!" />
                      Signal from {founder.name.split(" ")[0]}
                    </span>
                  )}
                </div>
              </div>

              {/* The member at the centre of their own small orbit. */}
              <div className="relative mx-auto grid size-64 place-items-center sm:size-72 lg:size-80" aria-hidden>
                <span className="orbit-halo absolute inset-12 rounded-full border-2 border-signal-orange" />
                <span className="orbit-spin absolute inset-4 rounded-full border-[3px] border-transparent border-t-signal-orange border-l-signal-orange" style={{ filter: "drop-shadow(0 0 6px var(--color-signal-orange))" }} />
                <span className="orbit-spin-rev absolute inset-0 rounded-full border-2 border-transparent border-r-bdgreen-500 border-b-bdgreen-500" style={{ filter: "drop-shadow(0 0 6px var(--color-bdgreen-500))" }} />
                <span className="absolute inset-0 rounded-full border border-white/10" />
                <span className="relative rounded-full p-1" style={{ background: tone.color, boxShadow: `0 0 60px -6px ${tone.color}` }}>
                  <MemberAvatar member={m} className="size-36 sm:size-40 lg:size-48" textClassName="text-5xl lg:text-6xl" sizes="200px" />
                </span>
                {!m.photo && (
                  <span className="absolute bottom-6 rounded-full bg-black px-2.5 py-0.5 font-bengali text-[10px] text-white/85 ring-1 ring-white/20">ছবি শীঘ্রই</span>
                )}
              </div>
            </div>
          </div>

          <div className="relative w-full bg-text-primary">
            <SignalSeam className="top-0" />
            <dl className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-white/10 lg:grid-cols-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col items-center gap-1 px-space-sm py-space-md text-center max-lg:nth-[2n+1]:border-l-0 max-lg:nth-[n+3]:border-t max-lg:nth-[n+3]:border-white/10"
                >
                  <dt className="font-mono text-label-xs font-medium tracking-widest text-white/65 uppercase">{s.label}</dt>
                  <dd className="font-grotesk text-base font-bold text-signal-orange sm:text-xl">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="section-band mx-auto grid max-w-7xl grid-cols-1 gap-6 px-gutter-x lg:grid-cols-12">
          {/* About, what they own, what they work on. */}
          <div className="flex flex-col gap-6 lg:col-span-7">
            <div className="story-reveal rounded-3xl bg-text-primary p-6 text-white ring-1 ring-white/12 sm:p-9">
              <PixelMark tone="dark" />
              <h2 className="mt-3 font-grotesk text-2xl font-bold tracking-tight text-signal-orange uppercase">About</h2>
              <p className="mt-3 font-sans text-lg leading-relaxed text-white/90">{m.about}</p>

              <h2 className="mt-8 font-mono text-xs font-bold tracking-widest text-white/80 uppercase">Works on</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {m.works.map((w) => (
                  <li key={w} className="rounded-full bg-signal-orange px-3 py-1 font-sans text-xs font-bold text-text-primary">
                    {w}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="story-reveal mb-4 font-grotesk text-xl font-bold tracking-tight text-signal-orange uppercase">What they own</h2>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {m.focus.map((f, k) => {
                  const t = surfaceAt(k);
                  return (
                    <li key={f} className="story-reveal flex">
                      <div style={glowStyle(t.glow)} className={cn("group flex w-full flex-col gap-3 rounded-3xl p-5 shadow-sm", LIFT, t.card)}>
                        <span className={cn("flex size-10 items-center justify-center rounded-xl font-grotesk text-sm font-bold", t.tile)}>0{k + 1}</span>
                        <span className="font-sans text-[15px] leading-snug font-semibold">{f}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {!m.photo && (
              <p className="flex items-start gap-2 rounded-2xl bg-text-primary px-4 py-3 font-sans text-xs leading-relaxed text-white/80 ring-1 ring-white/12">
                <Icon name="info" className="mt-0.5 shrink-0 text-[16px]! text-signal-orange" />
                This profile describes the role and the team&apos;s work. A photo and a fuller personal bio will be added.
              </p>
            )}
          </div>

          {/* Skills and the signal path. */}
          <aside className="flex flex-col gap-6 lg:col-span-5">
            <div>
              <h2 className="story-reveal mb-4 font-grotesk text-xl font-bold tracking-tight text-signal-orange uppercase">Skills</h2>
              <ul className="grid grid-cols-2 gap-3">
                {m.skills.map((s, k) => {
                  const t = surfaceAt(k + 1);
                  return (
                    <li key={s.label} className="story-reveal flex">
                      <div style={glowStyle(t.glow)} className={cn("group flex w-full flex-col gap-3 rounded-2xl p-4 shadow-sm", LIFT, t.card)}>
                        <span
                          className={cn(
                            "flex size-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:-rotate-6 motion-reduce:transition-none motion-reduce:group-hover:rotate-0",
                            t.tile,
                          )}
                        >
                          <Icon name={s.icon} className="text-[24px]!" />
                        </span>
                        <span className="font-sans text-sm font-bold">{s.label}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="story-reveal rounded-3xl bg-bd-green p-6 text-white sm:p-7">
              <h2 className="font-mono text-xs font-bold tracking-widest text-signal-orange uppercase">Signal path</h2>
              <ol className="mt-4 flex flex-col gap-3">
                {path.map((step, idx) => (
                  <li key={step.key} className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-xl font-grotesk text-sm font-bold",
                        idx === path.length - 1 ? "bg-signal-orange text-text-primary" : "bg-text-primary text-white",
                      )}
                    >
                      {idx + 1}
                    </span>
                    <span>
                      <span className="block font-sans text-sm font-bold">{step.label}</span>
                      <span className="block font-sans text-xs text-white/80">{step.sub}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </section>

        {peers.length > 0 && (
          <section className="section-band-tinted relative isolate overflow-hidden bg-text-primary">
            <SignalSeam className="top-0" />
            <div className="mx-auto max-w-7xl px-gutter-x">
              <SectionHeading
                tone="dark"
                kicker={isFounder ? "সংকেত পৌঁছায় সবার কাছে" : "একই কক্ষপথে"}
                title={isFounder ? "The signal reaches" : `More from ${dept.label}`}
              />
              <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-5">
                {peers.map((p) => (
                  <li key={p.slug} className="story-reveal flex">
                    <MemberCard member={p} />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Previous / next builder — green back, gold forward. */}
        <nav aria-label="More team members" className="section-band mx-auto grid max-w-7xl grid-cols-2 gap-3 px-gutter-x sm:gap-4">
          {[
            { p: prev, dir: "Previous", icon: "arrow_back", card: "bg-bd-green text-white items-start text-left", glow: "var(--color-bd-green)" },
            { p: next, dir: "Next", icon: "arrow_forward", card: "bg-signal-orange text-text-primary items-end text-right", glow: "var(--color-signal-orange)" },
          ].map(({ p, dir, icon, card, glow }) => (
            <Link
              key={dir}
              href={`/team/${p.slug}`}
              style={glowStyle(glow)}
              className={cn("group flex flex-col gap-1 rounded-3xl p-5 shadow-sm focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none sm:p-6", LIFT, card)}
            >
              <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold tracking-widest uppercase opacity-85">
                {dir === "Previous" && <Icon name={icon} className="text-[14px]! transition-transform group-hover:-translate-x-1" />}
                {dir}
                {dir === "Next" && <Icon name={icon} className="text-[14px]! transition-transform group-hover:translate-x-1" />}
              </span>
              <span className="font-grotesk text-base font-bold sm:text-xl">{p.name}</span>
              <span className="font-sans text-xs opacity-85">{p.role}</span>
            </Link>
          ))}
        </nav>
      </main>
      <SiteFooter />
    </>
  );
}
