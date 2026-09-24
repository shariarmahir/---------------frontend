import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SectionHeading } from "@/components/products/section-heading";
import { MemberAvatar } from "@/components/team/member-avatar";
import { MemberCard } from "@/components/team/member-card";
import { NeuralBrain } from "@/components/team/neural-brain";
import { Icon } from "@/components/ui/icon";
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

  return (
    <>
      <SiteHeader />
      <main className="relative w-full bg-[#fcfdfd] pt-header lg:pt-header-lg">
        {/* Hero — same band height as the other page heroes. */}
        <section className="hero-band relative isolate flex items-center overflow-hidden bg-slate-950">
          <div
            aria-hidden
            className="absolute inset-0 -z-10"
            style={{ background: `radial-gradient(circle at 20% 50%, ${dept.color}66, transparent 55%), radial-gradient(circle at 90% 10%, rgb(255 145 0 / 0.18), transparent 45%)` }}
          />
          <NeuralBrain className="absolute top-1/2 right-[-10%] -z-10 h-[130%] w-auto max-w-none -translate-y-1/2 opacity-50" />

          <div className="mx-auto flex w-full max-w-7xl flex-col items-start gap-8 px-gutter-x py-12 sm:flex-row sm:items-center">
            <div className="relative shrink-0">
              <span
                className="block rounded-full p-1"
                style={{ background: `linear-gradient(135deg, ${dept.color}, #ff9100)`, boxShadow: `0 0 50px ${dept.color}88` }}
              >
                <MemberAvatar member={m} className="size-28 sm:size-36 lg:size-40" textClassName="text-4xl lg:text-5xl" />
              </span>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-2.5 py-0.5 font-bengali text-[10px] whitespace-nowrap text-white/80 backdrop-blur-sm">
                ছবি শীঘ্রই
              </span>
            </div>

            <div className="min-w-0">
              <Link
                href="/team"
                className="inline-flex items-center gap-1 font-mono text-xs font-bold tracking-widest text-white/60 uppercase transition-colors hover:text-signal-orange"
              >
                <Icon name="arrow_back" className="text-[16px]!" />
                All team
              </Link>
              <h1 className="mt-3 font-grotesk text-4xl leading-[1.05] font-bold tracking-tight text-white uppercase sm:text-5xl lg:text-6xl">
                {m.name}
              </h1>
              <p className="mt-2 font-sans text-lg font-semibold text-signal-orange">
                {m.role} <span className="font-bengali font-normal text-white/70">· {m.roleBn}</span>
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {m.depts.map((id) => (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 font-mono text-[11px] font-bold tracking-wide text-white uppercase backdrop-blur-md"
                  >
                    <Icon name={departments[id].icon} className="text-[14px]!" />
                    {departments[id].label}
                  </span>
                ))}
                {!isFounder && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-signal-orange/40 bg-signal-orange/10 px-3 py-1 font-mono text-[11px] font-bold tracking-wide text-signal-orange uppercase">
                    <Icon name="neurology" className="text-[14px]!" />
                    Signal from {founder.name.split(" ")[0]}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="bg-grid-subtle">
          <section className="section-band mx-auto grid max-w-7xl grid-cols-1 gap-8 px-gutter-x lg:grid-cols-12">
            {/* About and focus. */}
            <div className="flex flex-col gap-6 lg:col-span-7">
              <div className="glass-card rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9" style={{ "--card-accent": dept.color } as React.CSSProperties}>
                <span className={cn("font-mono text-xs font-bold tracking-widest uppercase", dept.text)}>About</span>
                <p className="mt-3 font-sans text-lg leading-relaxed text-text-primary">{m.about}</p>

                <h2 className="mt-8 font-grotesk text-sm font-bold tracking-wide text-text-primary uppercase">What they own</h2>
                <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {m.focus.map((f) => (
                    <li key={f} className={cn("flex items-start gap-2 rounded-xl px-3 py-2.5 font-sans text-sm text-text-secondary", dept.soft)}>
                      <Icon name="check_circle" filled className={cn("mt-0.5 text-[16px]!", dept.text)} />
                      {f}
                    </li>
                  ))}
                </ul>

                <h2 className="mt-8 font-grotesk text-sm font-bold tracking-wide text-text-primary uppercase">Works on</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {m.works.map((w) => (
                    <li key={w} className="rounded-full border border-slate-200 bg-white px-3 py-1 font-sans text-xs font-semibold text-text-secondary">
                      {w}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="flex items-start gap-2 rounded-2xl bg-amber-50 px-4 py-3 font-sans text-xs leading-relaxed text-amber-900">
                <Icon name="info" className="mt-0.5 shrink-0 text-[16px]!" />
                This profile describes the role and the team&apos;s work. A photo and a fuller personal bio will be added.
              </p>
            </div>

            {/* Skills and signal path. */}
            <aside className="flex flex-col gap-6 lg:col-span-5">
              <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <h2 className="font-grotesk text-sm font-bold tracking-wide text-text-primary uppercase">Skills</h2>
                <ul className="mt-4 grid grid-cols-2 gap-3">
                  {m.skills.map((s) => (
                    <li
                      key={s.label}
                      className="group flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white hover:shadow-md motion-reduce:hover:translate-y-0"
                    >
                      <span
                        className={cn("flex size-11 items-center justify-center rounded-xl transition-transform group-hover:scale-110 motion-reduce:group-hover:scale-100", dept.soft, dept.text)}
                      >
                        <Icon name={s.icon} className="text-[24px]!" />
                      </span>
                      <span className="font-sans text-sm font-semibold text-text-primary">{s.label}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl bg-slate-950 p-7 text-white">
                <h2 className="font-mono text-xs font-bold tracking-widest text-signal-orange uppercase">Signal path</h2>
                <ol className="mt-4 flex flex-col gap-3">
                  {(isFounder
                    ? [{ key: "core", label: founder.name, sub: "The core — where every signal starts" }]
                    : [
                        { key: "core", label: founder.name, sub: founder.role },
                        { key: "dept", label: dept.label, sub: dept.labelBn },
                        { key: "me", label: m.name, sub: m.role },
                      ]
                  ).map((step, idx, arr) => (
                    <li key={step.key} className="flex items-center gap-3">
                      <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold", idx === arr.length - 1 ? "bg-signal-orange text-slate-950" : "bg-white/10 text-white")}>
                        {idx + 1}
                      </span>
                      <span>
                        <span className="block font-sans text-sm font-semibold">{step.label}</span>
                        <span className="block font-sans text-xs text-white/60">{step.sub}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>
          </section>

          {peers.length > 0 && (
            <section className="section-band-tinted border-y border-slate-200 bg-mint-subtle/70">
              <div className="mx-auto max-w-7xl px-gutter-x">
                <SectionHeading
                  kicker={isFounder ? "সংকেত পৌঁছায় সবার কাছে" : "একই কক্ষপথে"}
                  title={isFounder ? "The signal reaches" : `More from ${dept.label}`}
                />
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {peers.map((p) => (
                    <MemberCard key={p.slug} member={p} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Previous / next member. */}
          <nav aria-label="More team members" className="section-band mx-auto grid max-w-7xl grid-cols-2 gap-4 px-gutter-x">
            {[
              { p: prev, dir: "Previous", icon: "arrow_back", align: "items-start text-left" },
              { p: next, dir: "Next", icon: "arrow_forward", align: "items-end text-right" },
            ].map(({ p, dir, icon, align }) => (
              <Link
                key={dir}
                href={`/team/${p.slug}`}
                className={cn(
                  "glass-card group flex flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs focus-visible:ring-3 focus-visible:ring-signal-orange/50 focus-visible:outline-none",
                  align,
                )}
              >
                <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold tracking-widest text-text-muted uppercase">
                  {dir === "Previous" && <Icon name={icon} className="text-[14px]!" />}
                  {dir}
                  {dir === "Next" && <Icon name={icon} className="text-[14px]!" />}
                </span>
                <span className="font-grotesk text-base font-bold text-text-primary group-hover:text-bd-green sm:text-lg">{p.name}</span>
                <span className="font-sans text-xs text-text-secondary">{p.role}</span>
              </Link>
            ))}
          </nav>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
