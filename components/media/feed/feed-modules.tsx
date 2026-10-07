import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Briefcase, CalendarDays, FileUp, FlaskConical, GraduationCap, HandHeart, Library, MapPin, Megaphone, Plus, Star, Store, Trophy, UsersRound, Wifi, type LucideIcon } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { courses } from "@/data/media/academy";
import { challengeKindBn, challenges } from "@/data/media/challenges";
import { civicKindBn, civicReports, civicStatusBn } from "@/data/media/civic";
import { eventKindBn, events } from "@/data/media/events";
import { jobs } from "@/data/media/jobs";
import { listings } from "@/data/media/market";
import { SECTIONS } from "@/data/media/market-sections";
import { posts } from "@/data/media/posts";
import { topicOf } from "@/data/media/topics";
import { currentUser, getPerson } from "@/data/media/users";
import { libraryArticles } from "@/data/research/library";
import { FIELDS, KINDS, readMinutes } from "@/lib/research/core";
import { payUnitBn } from "@/lib/media/fair-pay";
import { cn } from "@/lib/utils";
import { SectionIcon } from "../market/section-icon";
import { Ago, DateText, Num, Taka } from "../ui/numerals";
import { PersonAvatar } from "../ui/person";
import { TOPIC_ICON } from "./topic-style";

/*
 * The feed is the front door to the whole platform, so between posts it
 * opens onto the other rooms: the বাজার, গবেষণাকোষ, jobs, and what the
 * community is doing. Each module shows a few real items and links to the
 * exact one (`#id` anchors on its page) and to the room itself.
 */

function Module({ Icon: Glyph, eyebrow, title, href, link, tone = "gold", children, extra }: { Icon: LucideIcon; eyebrow: string; title: string; href: string; link: string; tone?: "gold" | "green"; children: ReactNode; extra?: ReactNode }) {
  return (
    <section className="story-reveal overflow-hidden rounded-3xl bg-m-card shadow-m-tile ring-1 ring-m-ink/8">
      <header className="blue-band flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className={cn("grid size-11 shrink-0 place-items-center rounded-2xl shadow-[inset_0_1px_0_rgb(255_255_255/0.5)]", tone === "gold" ? "bg-m-yellow text-m-ink" : "bg-white/15 text-m-on ring-1 ring-white/25")}>
            <Glyph className="size-5.5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold text-m-yellow">{eyebrow}</p>
            <h2 className="truncate text-lg font-bold text-m-on">{title}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {extra}
          <Link href={href} className="group inline-flex min-h-9 items-center gap-1 rounded-full bg-white/12 px-3.5 text-sm font-semibold text-m-on ring-1 ring-white/30 transition-colors hover:bg-white hover:text-m-blue">
            {link} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
          </Link>
        </div>
      </header>
      {children}
    </section>
  );
}

const rail = "flex snap-x snap-mandatory gap-3 overflow-x-auto scrollbar-none";

/** Stories-style strip: today's most-loved photo and video posts, after a card to post your own. */
export function Highlights() {
  const picks = posts
    .filter((p) => p.media[0]?.src && (!p.audience || p.audience === "public"))
    .sort((a, b) => b.stats.likes - a.stats.likes)
    .slice(0, 8);
  const card = "relative block aspect-[9/14] w-28 shrink-0 snap-start overflow-hidden rounded-2xl ring-1 ring-m-ink/10 sm:w-32";
  return (
    <section aria-label="আজকের ঝলক" className="-mx-3 sm:mx-0">
      <ul className={cn(rail, "scroll-px-3 px-3 sm:scroll-px-0 sm:px-0")}>
        <li>
          <Link href="/media/post/new" className={cn(card, "group flex flex-col bg-m-card")}>
            <span className="relative grid flex-1 place-items-center bg-m-blue-soft">
              <PersonAvatar person={currentUser} size="lg" />
            </span>
            <span className="relative flex h-14 flex-col items-center justify-end pb-2 text-xs font-bold text-m-ink">
              <span className="absolute -top-4 grid size-8 place-items-center rounded-full bg-m-yellow text-m-ink ring-4 ring-m-card transition-transform group-hover:scale-110 motion-reduce:transition-none">
                <Plus className="size-4.5" aria-hidden />
              </span>
              পোস্ট করুন
            </span>
          </Link>
        </li>
        {picks.map((p) => {
          const a = getPerson(p.author);
          const T = TOPIC_ICON[topicOf(p).id];
          return (
            <li key={p.id}>
              <Link href={`/media/post/${p.id}`} className={cn(card, "group bg-m-canvas")}>
                <Image src={p.media[0].src!} alt={p.media[0].label} fill sizes="128px" className="object-cover transition-transform duration-700 group-hover:scale-110 motion-reduce:transition-none" />
                {a && (
                  <span className="absolute top-2 left-2 rounded-full ring-2 ring-m-blue">
                    <PersonAvatar person={a} size="sm" />
                  </span>
                )}
                <span className="absolute top-2 right-2 grid size-6 place-items-center rounded-full bg-m-card text-m-blue">
                  <T className="size-3.5" aria-hidden />
                </span>
                <span className="absolute inset-x-0 bottom-0 bg-m-card px-2 py-1.5 text-[11px] leading-tight font-bold text-m-ink">
                  <span className="block truncate">{a?.nameBn}</span>
                  <span className="block truncate font-medium text-m-ink/65">{p.media[0].label}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** বাজার: its sections, then featured and best-selling listings. */
export function MarketModule() {
  const items = [...listings].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || b.sold - a.sold).slice(0, 8);
  return (
    <Module Icon={Store} eyebrow="বাজার" title="আজ বাজারে যা পাওয়া যাচ্ছে" href="/media/market" link="বাজারে যান">
      <nav aria-label="বাজারের বিভাগ" className="mt-4">
        <ul className={cn(rail, "px-4 sm:px-5")}>
          {SECTIONS.map((s) => (
            <li key={s.id} className="shrink-0">
              <Link href={`/media/market?sec=${s.id}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-m-ink/10 px-3 text-sm font-semibold text-m-ink/85 transition-colors hover:border-m-blue hover:text-m-blue">
                <SectionIcon icon={s.icon} className="size-4 text-m-blue" />
                {s.bn}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <ul className={cn(rail, "scroll-px-4 p-4 sm:scroll-px-5 sm:p-5")}>
        {items.map((l) => {
          const seller = getPerson(l.seller);
          return (
            <li key={l.id} className="w-52 shrink-0 snap-start">
              <Link href={`/media/market/${l.id}`} className="group block h-full overflow-hidden rounded-2xl bg-m-canvas ring-1 ring-m-ink/10 transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_-20px_var(--color-signal-orange)] motion-reduce:transition-none">
                <span className="relative block aspect-4/3 overflow-hidden bg-m-ink/6">
                  {l.media.src ? (
                    <Image src={l.media.src} alt={l.media.label} fill sizes="208px" className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none" />
                  ) : (
                    <span className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-m-blue-soft px-3 text-center text-xs font-bold text-m-ink">
                      <Store className="size-7 text-m-blue" aria-hidden />
                      {l.media.label}
                    </span>
                  )}
                  {l.featured && <span className="absolute top-2 left-2 rounded-full bg-m-yellow px-2 py-0.5 text-[11px] font-bold text-m-ink">স্পন্সরড</span>}
                </span>
                <span className="block space-y-1 p-3">
                  <span className="line-clamp-2 min-h-10 text-sm leading-snug font-semibold text-m-ink">{l.title}</span>
                  <span className="flex items-baseline gap-1">
                    <span className="text-base font-bold text-m-blue">
                      <Taka amount={l.price} />
                    </span>
                    <span className="truncate text-[11px] text-m-ink/55">/ {l.unit}</span>
                  </span>
                  {seller && (
                    <span className="flex items-center gap-1 text-[11px] text-m-ink/65">
                      <Star className="size-3 fill-m-yellow text-m-gold" aria-hidden />
                      <Num value={l.rating} decimals={1} /> · <span className="truncate">{seller.nameBn}</span>
                    </span>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
        <li className="w-40 shrink-0 snap-start">
          <Link href="/media/market/new" className="flex h-full min-h-60 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-m-ink/17 p-4 text-center text-sm font-bold text-m-ink/85 transition-colors hover:border-m-blue hover:text-m-blue">
            <Plus className="size-7" aria-hidden /> আপনিও বিক্রি করুন
          </Link>
        </li>
      </ul>
    </Module>
  );
}

/** গবেষণাকোষ: the editors' pick large, then the newest. */
/** কাণ্ডারী তৈরি একাডেমি: the next classes, live or hands-on, and the free admission. */
export function AcademyModule() {
  const next = courses.filter((c) => c.nextLive).sort((a, b) => a.nextLive!.localeCompare(b.nextLive!)).slice(0, 6);
  return (
    <Module
      Icon={Library}
      eyebrow="কাণ্ডারী তৈরি একাডেমি"
      title="সবার আমি ছাত্র — সামনের ক্লাস"
      href="/media/academy"
      link="একাডেমি"
      extra={
        <Link href="/media/academy/departments" className="hidden min-h-9 items-center rounded-full bg-m-yellow px-3.5 text-sm font-semibold text-m-ink sm:inline-flex">
          ভর্তি বিনামূল্যে
        </Link>
      }
    >
      <ul className={cn(rail, "scroll-px-4 px-4 py-4 sm:scroll-px-5 sm:px-5")}>
        {next.map((c) => {
          const teacher = getPerson(c.teacher);
          return (
            <li key={c.id} className="w-60 shrink-0 snap-start">
              <Link href={`/media/academy/course/${c.id}`} className="group block overflow-hidden rounded-2xl bg-m-canvas ring-1 ring-m-ink/10 hover:ring-m-blue/50">
                <span className="relative block aspect-video">
                  <Image src={c.image} alt="" fill sizes="15rem" className="object-cover" />
                  <span className="absolute top-2 left-2 rounded bg-m-canvas px-1.5 py-0.5 font-mono text-[11px] font-bold text-m-blue">{c.id}</span>
                </span>
                <span className="block p-3">
                  <span className="line-clamp-2 text-sm font-semibold text-m-ink group-hover:text-m-blue">{c.title}</span>
                  <span className="mt-1 block truncate text-xs text-m-ink/70">{teacher?.nameBn}</span>
                  <span className="mt-2 block text-xs font-semibold text-m-blue"><DateText iso={c.nextLive!} time weekday /></span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Module>
  );
}

export function ResearchModule() {
  const pub = libraryArticles.filter((a) => a.status === "published");
  const lead = pub.find((a) => a.pinned) ?? pub[0];
  const rest = pub.filter((a) => a !== lead).sort((a, b) => b.published.localeCompare(a.published)).slice(0, 3);
  return (
    <Module
      Icon={FlaskConical}
      eyebrow="গবেষণাকোষ"
      title="দেশের প্রশ্ন, দেশের গবেষণা"
      href="/research"
      link="সব গবেষণা"
      tone="green"
      extra={
        <Link href="/research/submit" className="hidden min-h-9 items-center gap-1.5 rounded-full bg-m-yellow px-3.5 text-sm font-bold text-m-ink sm:inline-flex">
          <FileUp className="size-4" aria-hidden /> প্রকাশ করুন
        </Link>
      }
    >
      <div className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] sm:p-5">
        <Link href={`/research/${lead.slug}`} className="group flex flex-col overflow-hidden rounded-2xl bg-m-yellow text-m-ink">
          <span className="relative block aspect-16/10 overflow-hidden bg-m-blue-soft">
            {lead.image ? (
              <Image src={lead.image.src} alt={lead.image.caption} fill sizes="(min-width: 640px) 340px, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none" />
            ) : (
              <span className="absolute inset-0 grid place-items-center text-m-ink">
                <Icon name={FIELDS[lead.field].icon} className="text-7xl!" />
              </span>
            )}
            <span className="absolute top-2 left-2 rounded-full bg-m-card px-2.5 py-1 text-[11px] font-bold text-m-blue">{lead.pinned ? "সম্পাদকের নির্বাচন" : KINDS[lead.kind].bn}</span>
          </span>
          <span className="flex flex-1 flex-col gap-1.5 p-4">
            <span className="text-xs font-bold text-m-ink/70">{FIELDS[lead.field].bn}</span>
            <span className="line-clamp-3 text-lg leading-snug font-bold">{lead.title}</span>
            <span className="mt-auto text-xs font-semibold text-m-ink/75">
              {lead.authors[0]?.name} · <Num value={readMinutes(lead)} /> মিনিটের পড়া
            </span>
          </span>
        </Link>
        <ul className="flex flex-col gap-2">
          {rest.map((a) => (
            <li key={a.slug}>
              <Link href={`/research/${a.slug}`} className="group flex gap-3 rounded-2xl p-2.5 ring-1 ring-m-ink/9 transition-colors hover:bg-m-ink/3 hover:ring-m-ink/21">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-m-blue-soft text-m-ink">
                  <Icon name={FIELDS[a.field].icon} className="text-2xl!" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-bold text-m-blue">{FIELDS[a.field].bn}</span>
                  <span className="line-clamp-2 text-sm leading-snug font-semibold text-m-ink group-hover:text-m-blue">{a.title}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Module>
  );
}

/** Jobs that match the viewer's fields, every one with its pay stated. */
export function JobsModule() {
  const mine = jobs.filter((j) => currentUser.categories.includes(j.sector));
  const shown = (mine.length >= 3 ? mine : [...mine, ...jobs.filter((j) => !mine.includes(j))]).slice(0, 3);
  return (
    <Module
      Icon={Briefcase}
      eyebrow="কাজ"
      title="আপনার দক্ষতার সাথে মেলে"
      href="/media/jobs"
      link="সব কাজ"
      extra={
        <Link href="/media/jobs?st=1" className="hidden min-h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-white/85 ring-1 ring-white/30 hover:bg-white/12 hover:text-m-on sm:inline-flex">
          <GraduationCap className="size-4" aria-hidden /> শিক্ষার্থীদের
        </Link>
      }
    >
      <ul className="divide-y divide-m-ink/9 p-2 sm:p-3">
        {shown.map((j) => (
          <li key={j.id}>
            <Link href={`/media/jobs#${j.id}`} className="group flex items-center gap-3 rounded-2xl p-2.5 transition-colors hover:bg-m-ink/3 sm:p-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-m-ink text-base font-bold text-m-on">{j.org.slice(0, 1)}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold text-m-ink group-hover:text-m-blue">{j.title}</span>
                <span className="flex flex-wrap items-center gap-x-2 text-xs text-m-ink/65">
                  <span className="truncate">{j.org}</span>
                  <span className="inline-flex items-center gap-0.5"><MapPin className="size-3" aria-hidden /> {j.location}</span>
                  {j.remote && <span className="inline-flex items-center gap-0.5"><Wifi className="size-3" aria-hidden /> রিমোট</span>}
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-sm font-bold text-m-blue">
                  <Taka amount={j.pay.min} />
                  {j.pay.max > j.pay.min && <>–<Taka amount={j.pay.max} /></>}
                </span>
                <span className="block text-[11px] text-m-ink/55">{payUnitBn[j.pay.unit]}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Module>
  );
}

/** What the community is doing: an উদ্যোগ to join, a challenge to win, an area alert to confirm. */
export function CommunityModule() {
  const ev = [...events].sort((a, b) => b.joined / b.goal - a.joined / a.goal)[0];
  const ch = [...challenges].sort((a, b) => b.prize - a.prize)[0];
  const cv = civicReports.find((r) => r.status !== "solved" && r.severity === "high") ?? civicReports[0];
  const tile = "group flex flex-col gap-2 rounded-2xl p-4 transition-[translate] duration-300 hover:-translate-y-1 motion-reduce:transition-none";
  return (
    <Module Icon={UsersRound} eyebrow="কমিউনিটি" title="এখন যা হচ্ছে" href="/media/together" link="টিম · উদ্যোগ" tone="green">
      <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-5">
        <Link href={`/media/together?v=events#${ev.id}`} className={cn(tile, "bg-m-blue-soft text-m-ink")}>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-m-ink/80">
            <HandHeart className="size-4" aria-hidden /> উদ্যোগ · {eventKindBn[ev.kind]}
          </span>
          <span className="line-clamp-2 font-bold leading-snug">{ev.title}</span>
          <span className="mt-auto text-xs text-m-ink/80">
            <CalendarDays className="mr-1 inline size-3.5 align-[-2px]" aria-hidden />
            <DateText iso={ev.date} /> · {ev.district}
          </span>
          <span className="block h-1.5 overflow-hidden rounded-full bg-white/50">
            <span className="block h-full rounded-full bg-m-yellow" style={{ width: `${Math.min(100, Math.round((ev.joined / ev.goal) * 100))}%` }} />
          </span>
          <span className="text-xs font-semibold">
            <Num value={ev.joined} />/<Num value={ev.goal} /> জন যোগ দিয়েছেন
          </span>
        </Link>
        <Link href={`/media/together?v=challenges#${ch.id}`} className={cn(tile, "bg-m-yellow text-m-ink")}>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-m-ink/75">
            <Trophy className="size-4" aria-hidden /> চ্যালেঞ্জ · {challengeKindBn[ch.kind]}
          </span>
          <span className="line-clamp-2 font-bold leading-snug">{ch.title}</span>
          <span className="mt-auto text-2xl font-bold">
            <Taka amount={ch.prize} />
          </span>
          <span className="text-xs font-semibold text-m-ink/75">
            শেষ তারিখ <DateText iso={ch.deadline} /> · <Num value={ch.entries} />টি জমা
          </span>
        </Link>
        <Link href={`/media/civic#${cv.id}`} className={cn(tile, "bg-m-blue-night text-m-on")}>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-m-yellow">
            <Megaphone className="size-4" aria-hidden /> নাগরিক বার্তা · {civicKindBn[cv.kind]}
          </span>
          <span className="line-clamp-2 font-bold leading-snug">{cv.title}</span>
          <span className="mt-auto text-xs text-white/75">
            {cv.area}, {cv.district} · <Ago iso={cv.at} />
          </span>
          <span className="inline-flex w-fit items-center rounded-full bg-m-card px-2.5 py-1 text-xs font-bold text-m-ink">
            {civicStatusBn[cv.status]} · <Num value={cv.confirmations} /> জন
          </span>
        </Link>
      </div>
    </Module>
  );
}
