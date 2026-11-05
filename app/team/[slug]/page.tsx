/*
 * A builder's profile, in the landing page's world (Mahir, 2026-10-19): the
 * black hero with the member's face at the centre of its own small orbit,
 * the navy proof strip, then cobalt, navy and ink cards for what they own
 * and what they can do, their team as cards, and a pager to the next
 * builder. Gold carries the titles; no uppercase, gradients or glows.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { MemberAvatar } from "@/components/team/member-avatar";
import { MemberCard } from "@/components/team/member-card";
import { Icon } from "@/components/ui/icon";
import { SectionHeading, SignalSeam } from "@/components/ui/section-kit";
import { LIFT, glowStyle } from "@/components/ui/surfaces";
import { crew, departments, founder, getMember, team } from "@/data/team";
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

const RING_NAME = { core: "The core", inner: "Leadership", mid: "Idea & client", outer: "Engineering" } as const;

/** Cards take the landing page's three fields in turn, with gold on their tiles. */
const CARD_FIELDS = [
  { card: "bg-cobalt text-white ring-1 ring-white/12", glow: "var(--color-cobalt)" },
  { card: "bg-bdnavy-900 text-white ring-1 ring-white/12", glow: "var(--color-bdnavy-400)" },
  { card: "bg-text-primary text-white ring-1 ring-white/12", glow: "var(--color-signal-orange)" },
];
const fieldAt = (i: number) => CARD_FIELDS[i % CARD_FIELDS.length];

export default async function MemberProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = getMember(slug);
  if (!m) notFound();

  const dept = departments[m.depts[0]];
  const isFounder = m.slug === founder.slug;
  const peers = isFounder ? crew : crew.filter((p) => p.slug !== m.slug && p.depts.some((d) => m.depts.includes(d)));
  const i = team.findIndex((p) => p.slug === m.slug);
  const prev = team[(i - 1 + team.length) % team.length];
  const next = team[(i + 1) % team.length];

  const stats = [
    { label: "Orbit", value: RING_NAME[m.ring] },
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
          <div className="hero-band relative isolate flex w-full items-center overflow-hidden bg-black">
            <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-gutter-x py-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
              <div className="flex min-w-0 flex-col items-start gap-4">
                <span className="w-fit rounded-full bg-signal-orange px-3 py-1 font-sans text-xs font-bold text-text-primary">{m.role}</span>
                <h1 id="member-title" className="hero-rise font-grotesk text-4xl leading-[1.05] font-bold tracking-tight text-balance text-white sm:text-5xl lg:text-6xl">
                  {m.name}
                </h1>
              </div>

              {/* The member at the centre of their own small orbit. */}
              <div className="relative mx-auto grid size-64 place-items-center sm:size-72 lg:size-80" aria-hidden>
                <span className="orbit-halo absolute inset-12 rounded-full border-2 border-signal-orange" />
                <span className="orbit-spin absolute inset-4 rounded-full border-[3px] border-transparent border-t-signal-orange border-l-signal-orange" />
                <span className="orbit-spin-rev absolute inset-0 rounded-full border-2 border-transparent border-r-bdnavy-300 border-b-bdnavy-300" />
                <span className="absolute inset-0 rounded-full border border-white/10" />
                <span className="relative rounded-full bg-signal-orange p-1">
                  <MemberAvatar member={m} className="size-36 sm:size-40 lg:size-48" textClassName="text-5xl lg:text-6xl" sizes="200px" />
                </span>
                {!m.photo && (
                  <span className="absolute bottom-6 rounded-full bg-black px-2.5 py-0.5 font-sans text-xs text-white/85 ring-1 ring-white/20">Photo soon</span>
                )}
              </div>
            </div>
          </div>

          <div className="relative w-full bg-bdnavy-900">
            <SignalSeam className="top-0" />
            <dl className="mx-auto grid max-w-7xl grid-cols-2 px-gutter-x lg:grid-cols-4">
              {stats.map((s, k) => (
                <div key={s.label} className={cn("flex flex-col gap-1 py-6 lg:px-8", k % 2 === 1 && "pl-5 max-lg:border-l max-lg:border-white/10", k > 1 && "max-lg:border-t max-lg:border-white/10", k > 0 ? "lg:border-l lg:border-white/10" : "lg:pl-0")}>
                  <dt className="font-sans text-sm text-bdnavy-200">{s.label}</dt>
                  <dd className="font-grotesk text-xl font-bold text-signal-orange sm:text-2xl">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="section-band mx-auto grid max-w-7xl grid-cols-1 gap-6 px-gutter-x lg:grid-cols-12">
          {/* About, what they own, what they work on. */}
          <div className="flex flex-col gap-6 lg:col-span-7">
            <div className="story-reveal rounded-3xl bg-text-primary p-6 text-white ring-1 ring-white/12 sm:p-9">
              <h2 className="font-grotesk text-2xl font-bold tracking-tight text-signal-orange">About</h2>
              <p className="mt-3 font-sans text-lg leading-relaxed text-white/90">{m.about}</p>

              <h2 className="mt-8 font-grotesk text-base font-bold text-signal-orange">Works on</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {m.works.map((w) => (
                  <li key={w} className="rounded-full bg-signal-orange px-3 py-1 font-sans text-xs font-bold text-text-primary">
                    {w}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="story-reveal mb-4 font-grotesk text-xl font-bold tracking-tight text-signal-orange">What they own</h2>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {m.focus.map((f, k) => {
                  const t = fieldAt(k);
                  return (
                    <li key={f} className="story-reveal flex">
                      <div style={glowStyle(t.glow)} className={cn("group flex w-full flex-col gap-3 rounded-3xl p-5", LIFT, t.card)}>
                        <Icon name="check_circle" filled className="text-2xl! text-signal-orange" />
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
              <h2 className="story-reveal mb-4 font-grotesk text-xl font-bold tracking-tight text-signal-orange">Skills</h2>
              <ul className="grid grid-cols-2 gap-3">
                {m.skills.map((s, k) => {
                  const t = fieldAt(k + 1);
                  return (
                    <li key={s.label} className="story-reveal flex">
                      <div style={glowStyle(t.glow)} className={cn("group flex w-full flex-col gap-3 rounded-2xl p-4", LIFT, t.card)}>
                        <span className="flex size-11 items-center justify-center rounded-xl bg-signal-orange text-text-primary transition-transform duration-300 group-hover:-rotate-6 motion-reduce:transition-none motion-reduce:group-hover:rotate-0">
                          <Icon name={s.icon} className="text-[24px]!" />
                        </span>
                        <span className="font-sans text-sm font-bold">{s.label}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="story-reveal rounded-3xl bg-bdnavy-900 p-6 text-white ring-1 ring-white/12 sm:p-7">
              <h2 className="font-grotesk text-base font-bold text-signal-orange">Signal path</h2>
              <ol className="mt-4 flex flex-col gap-3">
                {path.map((step, idx) => (
                  <li key={step.key} className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-xl font-grotesk text-sm font-bold",
                        idx === path.length - 1 ? "bg-signal-orange text-text-primary" : "bg-cobalt text-white",
                      )}
                    >
                      {idx + 1}
                    </span>
                    <span>
                      <span className="block font-sans text-sm font-bold">{step.label}</span>
                      <span className="block font-sans text-xs text-white/75">{step.sub}</span>
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

        {/* Previous / next builder: navy back, cobalt forward, gold names. */}
        <nav aria-label="More team members" className="section-band mx-auto grid max-w-7xl grid-cols-2 gap-3 px-gutter-x sm:gap-4">
          {[
            { p: prev, dir: "Previous", icon: "arrow_back", card: "bg-bdnavy-900 text-white ring-1 ring-white/12 items-start text-left", glow: "var(--color-bdnavy-400)" },
            { p: next, dir: "Next", icon: "arrow_forward", card: "bg-cobalt text-white ring-1 ring-white/12 items-end text-right", glow: "var(--color-cobalt)" },
          ].map(({ p, dir, icon, card, glow }) => (
            <Link
              key={dir}
              href={`/team/${p.slug}`}
              style={glowStyle(glow)}
              className={cn("group flex flex-col gap-1 rounded-3xl p-5 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none sm:p-6", LIFT, card)}
            >
              <span className="inline-flex items-center gap-1 font-sans text-sm font-semibold text-white/75">
                {dir === "Previous" && <Icon name={icon} className="text-[14px]! transition-transform group-hover:-translate-x-1" />}
                {dir}
                {dir === "Next" && <Icon name={icon} className="text-[14px]! transition-transform group-hover:translate-x-1" />}
              </span>
              <span className="font-grotesk text-base font-bold text-signal-orange sm:text-xl">{p.name}</span>
              <span className="font-sans text-xs text-white/75">{p.role}</span>
            </Link>
          ))}
        </nav>
      </main>
      <SiteFooter />
    </>
  );
}
