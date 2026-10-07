import Link from "next/link";
import type { CSSProperties } from "react";
import { BadgeCheck, Briefcase, FlaskConical, GraduationCap, Hash, Library, Megaphone, Newspaper, NotebookPen, Store, UserRound, UsersRound, Wallet, type LucideIcon } from "lucide-react";
import { posts } from "@/data/media/posts";
import { isRated } from "@/data/media/topics";
import { currentUser, people } from "@/data/media/users";
import { skillStatus } from "@/lib/media/skill";
import { cn } from "@/lib/utils";
import { Compact, Num } from "../ui/numerals";
import { Panel } from "../ui/layout";
import { PersonAvatar, PersonLine } from "../ui/person";
import { Stars } from "../ui/trust";
import { DailyPlan } from "../wellbeing/daily-plan";

/** Every room of the platform, one tap away. */
const ROOMS: { href: string; label: string; Icon: LucideIcon; tone: string; note?: string }[] = [
  { href: "/media/academy", label: "কাণ্ডারী তৈরি একাডেমি", note: "সবার আমি ছাত্র · ভর্তি বিনামূল্যে", Icon: Library, tone: "col-span-2 bg-signal-orange text-text-primary" },
  { href: "/research", label: "গবেষণাকোষ", Icon: FlaskConical, tone: "bg-signal-orange text-text-primary" },
  { href: "/media/market", label: "বাজার", Icon: Store, tone: "bg-bd-green text-white" },
  { href: "/media/jobs", label: "কাজ", Icon: Briefcase, tone: "bg-white text-text-primary" },
  { href: "/media/classroom", label: "ক্লাসরুম", Icon: GraduationCap, tone: "bg-signal-orange text-text-primary" },
  { href: "/media/together", label: "টিম · উদ্যোগ", Icon: UsersRound, tone: "bg-bdorange-600 text-text-primary" },
  { href: "/media/civic", label: "নাগরিক বার্তা", Icon: Megaphone, tone: "bg-white text-text-primary" },
  { href: "/media/news", label: "নাগরিক জীবন", Icon: Newspaper, tone: "bg-bd-green text-white" },
  { href: "/media/people", label: "মানুষ", Icon: UserRound, tone: "bg-signal-orange text-text-primary" },
];

const t = (d: number, dur: number) => ({ "--d": d, "--dur": dur }) as CSSProperties;

export function FeedRail() {
  const needsEyes = posts.filter(isRated).filter((p) => skillStatus(p.skill.self, p.skill.communityAvg, p.skill.raters) !== "verified").slice(0, 3);
  const top = people
    .flatMap((p) => p.skills.map((s) => ({ p, s })))
    .filter(({ s }) => skillStatus(s.self, s.communityAvg, s.raters) === "verified")
    .sort((a, b) => b.s.raters - a.s.raters)
    .slice(0, 4);
  const verified = currentUser.skills.filter((s) => skillStatus(s.self, s.communityAvg, s.raters) === "verified").length;
  const tags = Object.entries(posts.flatMap((p) => p.tags).reduce<Record<string, number>>((m, x) => ({ ...m, [x]: (m[x] ?? 0) + 1 }), {}))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <div className="space-y-4 pb-6">
      {/* The viewer, and the three places they keep returning to. */}
      <section aria-label="আপনি" className="overflow-hidden rounded-3xl border border-white/12 bg-text-primary">
        <div className="h-14 bg-bd-green" />
        <div className="-mt-8 px-4 pb-4">
          <Link href="/media/me" className="inline-block rounded-full ring-4 ring-text-primary">
            <PersonAvatar person={currentUser} size="lg" />
          </Link>
          <p className="mt-2 flex items-center gap-1 text-base font-bold text-white">
            {currentUser.nameBn} {currentUser.idVerified && <BadgeCheck className="size-4.5 text-signal-orange" aria-label="এনআইডি যাচাইকৃত" />}
          </p>
          <p className="line-clamp-1 text-xs text-white/65">{currentUser.headline}</p>
          <dl className="mt-3 grid grid-cols-3 gap-1 rounded-2xl bg-white/5 p-2 text-center">
            {[
              ["অনুসারী", <Compact key="f" n={currentUser.followers} />],
              ["যাচাইকৃত দক্ষতা", <Num key="v" value={verified} />],
              ["সম্পন্ন কাজ", <Num key="j" value={currentUser.jobsDone} />],
            ].map(([label, value]) => (
              <div key={label as string} className="flex flex-col-reverse">
                <dt className="text-[10px] leading-tight text-white/60">{label}</dt>
                <dd className="text-base font-bold text-signal-orange">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-3 grid grid-cols-3 gap-1.5">
            {[
              { href: "/media/me", label: "প্রোফাইল", Icon: UserRound },
              { href: "/media/dashboard", label: "মাটির ব্যাংক", Icon: Wallet },
              { href: "/media/notes", label: "নোট", Icon: NotebookPen },
            ].map(({ href, label, Icon }) => (
              <Link key={href} href={href} className="flex flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-semibold text-white/85 transition-colors hover:bg-white/10 hover:text-white">
                <Icon className="size-4.5 text-signal-orange" aria-hidden /> {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <DailyPlan compact />

      <Panel title="সব জায়গা এক নজরে">
        <ul className="grid grid-cols-2 gap-2">
          {ROOMS.map(({ href, label, note, Icon, tone }) => (
            <li key={href} className={note ? "col-span-2" : undefined}>
              <Link href={href} className={cn("group flex min-h-16 flex-col justify-between gap-1 rounded-2xl p-3 text-sm font-bold transition-[translate] duration-300 hover:-translate-y-0.5 motion-reduce:transition-none", tone)}>
                <Icon className="size-5 transition-transform group-hover:-rotate-6 motion-reduce:transition-none" aria-hidden />
                {label}
                {note && <span className="text-xs font-semibold">{note}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </Panel>

      {/* An ad space the reader can take: a boosted listing shows in the feed and the বাজার. */}
      <section aria-label="বিজ্ঞাপনের জায়গা" className="ms-root relative overflow-hidden rounded-3xl bg-signal-orange p-4 text-text-primary">
        <svg aria-hidden viewBox="0 0 60 60" className="absolute -top-2 -right-2 size-24">
          {[0, 700, 1400].map((d) => (
            <circle key={d} cx="30" cy="30" r="14" className="ms-ring fill-none stroke-text-primary" strokeWidth="1.5" style={t(d, 2.1)} />
          ))}
        </svg>
        <span className="relative grid size-10 place-items-center rounded-xl bg-text-primary text-signal-orange">
          <Megaphone className="size-5" aria-hidden />
        </span>
        <p className="relative mt-3 text-xs font-bold text-text-primary/70">বিজ্ঞাপনের জায়গা</p>
        <p className="relative text-lg leading-snug font-bold">আপনার পণ্য বা সেবা এখানে দেখান</p>
        <p className="relative mt-1 text-xs leading-relaxed text-text-primary/75">বাজারে লিস্টিং দিন, তারপর ‘আমার লিস্টিং’ থেকে ম্যাচ বুস্ট চালু করুন — ফিড আর বাজারে আগে দেখাবে, ‘স্পন্সরড’ লেখাসহ।</p>
        <div className="relative mt-3 flex gap-2">
          <Link href="/media/market/new" className="inline-flex min-h-9 items-center rounded-xl bg-text-primary px-3 text-sm font-bold text-white hover:bg-black">লিস্টিং দিন</Link>
          <Link href="/media/market" className="inline-flex min-h-9 items-center rounded-xl px-3 text-sm font-bold ring-1 ring-text-primary/30 hover:bg-text-primary/10">আমার লিস্টিং</Link>
        </div>
      </section>

      <Panel title="আপনার চোখ দরকার" action={<Link href="/media?tab=verify" className="text-xs font-semibold text-signal-orange hover:underline">সব</Link>}>
        <ul className="space-y-3">
          {needsEyes.map((p) => {
            const a = people.find((x) => x.handle === p.author)!;
            return (
              <li key={p.id}>
                <Link href={`/media/post/${p.id}`} className="group -m-2 block rounded-xl p-2 hover:bg-white/10">
                  <span className="block text-sm font-semibold text-white group-hover:text-signal-orange">{p.skill.name}</span>
                  <span className="mt-0.5 flex items-center gap-2 text-xs text-white/65">
                    {a.nameBn} · দাবি <Num value={p.skill.self} />★ · <Num value={p.skill.raters} /> জন
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Panel>

      <Panel title="চলছে">
        <ul className="flex flex-wrap gap-1.5">
          {tags.map(([tag, n]) => (
            <li key={tag}>
              <Link href={`/media/search?q=${encodeURIComponent(tag.replace(/^#/, ""))}`} className="inline-flex min-h-8 items-center gap-1 rounded-full bg-white/5 px-2.5 text-xs font-semibold text-white/85 ring-1 ring-white/10 hover:text-signal-orange hover:ring-signal-orange/40">
                <Hash className="size-3 text-signal-orange" aria-hidden />
                {tag.replace(/^#/, "").replaceAll("_", " ")}
                {n > 1 && <span className="text-white/45"><Num value={n} /></span>}
              </Link>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="শীর্ষ যাচাইকৃত" action={<Link href="/media/people" className="text-xs font-semibold text-signal-orange hover:underline">সবাই</Link>}>
        <ul className="space-y-3">
          {top.map(({ p, s }) => (
            <li key={`${p.handle}-${s.skill}`} className="flex items-center justify-between gap-2">
              <PersonLine person={p} size="sm" meta={s.skill} />
              <span className="flex shrink-0 flex-col items-end">
                <Stars value={s.communityAvg} size={11} />
                <span className="text-[11px] text-white/65">
                  <Num value={s.raters} /> জন
                </span>
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
