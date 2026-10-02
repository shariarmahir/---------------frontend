"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Icon } from "@/components/ui/icon";
import { counts, feedIntent, FIELDS, POINTS, reactionTotal, readMinutes, topFields, topResearchers, trending, waterfall, type Article } from "@/lib/research/core";
import { useLibrary, useScores } from "@/lib/research/store";
import { cn } from "@/lib/utils";
import { articleHref, Avatar, bn, bnDate, bnNum, byline, FieldChip, KindChip, SectionHead, StatusChips } from "./ui";

/** Points, reactions, comments and shares in one quiet row. */
function Metrics({ a, onGold }: { a: Article; onGold?: boolean }) {
  const { engagement, points } = useScores();
  const e = engagement(a);
  const items = [
    { icon: "bolt", value: points(a), label: "পয়েন্ট" },
    { icon: "favorite", value: reactionTotal(e), label: "প্রতিক্রিয়া" },
    { icon: "forum", value: e.comments, label: "মন্তব্য" },
    { icon: "share", value: e.shares, label: "শেয়ার" },
  ];
  return (
    <span className={cn("flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold", onGold ? "text-text-primary/75" : "text-white/55")}>
      {items.map((m, i) => (
        <span key={m.label} className={cn("inline-flex items-center gap-1", i === 0 && (onGold ? "text-text-primary" : "text-signal-orange"))} title={m.label}>
          <Icon name={m.icon} className="text-[16px]" /> {bnNum(m.value)} <span className="sr-only">{m.label}</span>
        </span>
      ))}
    </span>
  );
}

/** The cover: the editors' pinned paper on a solid gold board, its own chart drawn small as the motif. */
export function CoverStory() {
  const a = useLibrary().find((x) => x.pinned && x.status === "published");
  if (!a) return null;
  return <Cover a={a} />;
}

function Cover({ a }: { a: Article }) {
  const fig = a.sections.flatMap((s) => s.figures ?? []).find((f) => f.kind === "waterfall");
  const bars = fig ? waterfall(fig.rows) : [];
  const max = Math.max(1, ...bars.map((b) => b.end));
  return (
    <article aria-labelledby="cover-title" className="relative flex flex-col overflow-hidden rounded-[2rem] bg-signal-orange p-6 text-text-primary sm:p-8">
      <p className="flex flex-wrap items-center gap-2 text-sm font-bold">
        <span className="inline-flex items-center gap-1 rounded-full bg-text-primary px-3 py-1 text-xs text-signal-orange"><Icon name="workspace_premium" className="text-[16px]" /> সম্পাদকের নির্বাচন</span>
        {a.preprint ? "নতুন ওয়ার্কিং পেপার" : "নির্বাচিত গবেষণা"} · {bnDate(a.published)}
      </p>
      <h2 id="cover-title" className="font-wiki mt-4 text-[1.65rem] leading-[1.25] font-bold text-balance sm:text-[2.05rem]">
        <Link href={articleHref(a)} className="hover:underline hover:decoration-2 hover:underline-offset-4">{a.title}</Link>
      </h2>
      {a.titleEn && <p lang="en" className="mt-2 line-clamp-2 text-sm font-semibold text-text-primary/70">{a.titleEn}</p>}

      {fig && (
        <figure className="mt-6 rounded-2xl bg-text-primary p-4 text-white" aria-label={fig.title}>
          <figcaption className="flex items-baseline justify-between gap-3 text-xs font-semibold text-white/70">
            <span className="line-clamp-1">{fig.title}</span>
            <span className="shrink-0 font-bold text-signal-orange">{bnNum(bars[0]?.end ?? 0)} → {bnNum(bars[bars.length - 1]?.end ?? 0)}</span>
          </figcaption>
          <ul className="mt-3 space-y-1.5" aria-hidden>
            {bars.map((b, i) => (
              <li key={b.row.label} className="relative h-2">
                <span
                  className={cn("research-grow-now absolute inset-y-0 rounded-[3px]", b.row.total ? "bg-white" : b.row.accent ? "bg-signal-orange" : "bg-white/35")}
                  style={{ left: `${(b.start / max) * 100}%`, width: `${Math.max(0.6, ((b.end - b.start) / max) * 100)}%`, ["--i" as string]: i }}
                />
              </li>
            ))}
          </ul>
          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-white/65">
            <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-[2px] bg-white" />মোট দাম</span>
            <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-[2px] bg-white/35" />খরচের ধাপ</span>
            <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-[2px] bg-signal-orange" />সবচেয়ে বড় দুটি</span>
          </p>
        </figure>
      )}

      <div className="mt-6 flex items-center gap-3">
        <Avatar name={a.authors[0].name} className="ring-signal-orange" />
        <p className="min-w-0 text-sm leading-snug">
          <span className="block font-bold">{byline(a)}</span>
          <span className="block text-text-primary/70">{a.institution} · {bn(readMinutes(a))} মিনিটের পড়া</span>
        </p>
      </div>
      <div className="mt-4"><Metrics a={a} onGold /></div>
      <div className="mt-6 flex flex-wrap gap-2 sm:mt-auto sm:pt-6">
        <Link href={articleHref(a)} className="inline-flex h-12 items-center gap-2 rounded-2xl bg-text-primary px-5 text-sm font-bold text-white transition-colors hover:bg-black">
          পুরো গবেষণা পড়ুন <Icon name="arrow_forward" className="text-[18px]" />
        </Link>
        <Link href={feedIntent(a)} className="inline-flex h-12 items-center gap-2 rounded-2xl px-4 text-sm font-bold ring-2 ring-text-primary/80 transition-colors hover:bg-text-primary hover:text-white">
          <Icon name="dynamic_feed" className="text-[18px]" /> ফিডে শেয়ার
        </Link>
      </div>
    </article>
  );
}

/** The library in four numbers, the viewer's own activity included. */
export function LiveStats() {
  const list = useLibrary();
  const { points } = useScores();
  const c = counts(list);
  const total = list.filter((a) => a.status === "published").reduce((s, a) => s + points(a), 0);
  const stats = [
    { value: c.articles, label: "প্রকাশিত নিবন্ধ" },
    { value: c.authors, label: "গবেষক" },
    { value: c.institutions, label: "প্রতিষ্ঠান" },
    { value: total, label: "মোট পয়েন্ট" },
  ];
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="bg-black px-4 py-4">
          <dt className="text-xs font-semibold text-white/55">{s.label}</dt>
          <dd className="font-wiki mt-1 text-3xl font-bold text-white">{bnNum(s.value)}</dd>
        </div>
      ))}
    </dl>
  );
}

/** শীর্ষ বিষয়ক্ষেত্র: every field ranked by the points its research has earned. */
export function TopFields() {
  const list = useLibrary();
  const { points } = useScores();
  const ranked = useMemo(() => topFields(list, points), [list, points]);
  const max = Math.max(1, ranked[0]?.points ?? 1);
  return (
    <section aria-labelledby="top-fields" className="space-y-5">
      <SectionHead id="top-fields" eyebrow="পাঠকের সাড়া ধরে" title="শীর্ষ বিষয়ক্ষেত্র" />
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ranked.map((f, i) => {
          const lead = i === 0 && f.points > 0;
          return (
            <li key={f.field}>
              <Link
                href={`/research/contents#${f.field}`}
                className={cn(
                  "group flex h-full items-center gap-4 rounded-2xl p-4 transition-[translate,box-shadow,background-color] duration-200 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0",
                  lead ? "bg-bd-green text-white" : "bg-white/[0.04] text-white ring-1 ring-white/10 hover:bg-white/[0.07] hover:ring-signal-orange/50",
                )}
              >
                <span className={cn("font-wiki w-9 shrink-0 text-3xl font-bold", lead ? "text-signal-orange" : "text-white/25 group-hover:text-signal-orange")}>{bn(String(i + 1).padStart(2, "0"))}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 font-bold">
                    <Icon name={FIELDS[f.field].icon} className={cn("text-[20px]", lead ? "text-white" : "text-signal-orange")} /> {FIELDS[f.field].bn}
                  </span>
                  <span className={cn("mt-1 block text-xs font-semibold", lead ? "text-white/80" : "text-white/55")}>
                    {bn(f.articles)}টি নিবন্ধ · {bnNum(f.points)} পয়েন্ট
                  </span>
                  <span className={cn("mt-2.5 block h-1.5 overflow-hidden rounded-full", lead ? "bg-white/25" : "bg-white/10")}>
                    <span className={cn("block h-full rounded-full", lead ? "bg-signal-orange" : "bg-signal-orange/80")} style={{ width: `${(f.points / max) * 100}%` }} />
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/** ট্রেন্ডিং: the research readers are reacting to, sharing and citing most. */
export function Trending({ n = 6 }: { n?: number }) {
  const list = useLibrary();
  const { points } = useScores();
  const top = useMemo(() => trending(list, points, n), [list, points, n]);
  return (
    <section aria-labelledby="trending" className="space-y-4">
      <SectionHead id="trending" eyebrow="এই মুহূর্তে সবচেয়ে বেশি সাড়া" title="ট্রেন্ডিং গবেষণা" />
      <ol className="divide-y divide-white/10 rounded-[1.75rem] bg-white/[0.03] ring-1 ring-white/10">
        {top.map((a, i) => (
          <li key={a.slug}>
            <Link href={articleHref(a)} className="group grid grid-cols-[2.75rem_minmax(0,1fr)] gap-3 p-4 transition-colors first:rounded-t-[1.75rem] last:rounded-b-[1.75rem] hover:bg-white/[0.05] sm:grid-cols-[3.5rem_minmax(0,1fr)] sm:p-5">
              <span className="font-wiki text-3xl leading-none font-bold text-white/25 transition-colors group-hover:text-signal-orange sm:text-4xl">{bn(String(i + 1).padStart(2, "0"))}</span>
              <span className="min-w-0">
                <span className="flex flex-wrap gap-1.5"><KindChip article={a} /><FieldChip article={a} /><StatusChips article={a} /></span>
                <span className="font-wiki mt-2 block text-lg leading-snug font-bold text-white transition-colors group-hover:text-signal-orange sm:text-xl">{a.title}</span>
                <span className="mt-1 block truncate text-sm text-white/55">{byline(a, 2)} · {a.institution.split(",")[0]}</span>
                <span className="mt-2.5 block"><Metrics a={a} /></span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** শীর্ষ গবেষক: the people behind the most-engaged work. */
export function TopResearchers({ n = 6 }: { n?: number }) {
  const list = useLibrary();
  const { points } = useScores();
  const people = useMemo(() => topResearchers(list, points).slice(0, n), [list, points, n]);
  return (
    <section aria-labelledby="researchers" className="space-y-4">
      <SectionHead id="researchers" eyebrow="পয়েন্টের হিসাবে" title="শীর্ষ গবেষক" />
      <ol className="space-y-2">
        {people.map((p, i) => (
          <li key={p.name} className="flex items-center gap-3 rounded-2xl bg-white/[0.04] p-3 ring-1 ring-white/10">
            <span className={cn("grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold", i === 0 ? "bg-signal-orange text-text-primary" : "text-white/60 ring-1 ring-white/20")}>{bn(i + 1)}</span>
            <Avatar name={p.name} className="size-9 text-xs" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-white">{p.name}</span>
              <span className="block truncate text-xs text-white/50">{p.institution.split(",")[0]} · {bn(p.articles)}টি নিবন্ধ</span>
            </span>
            <span className="text-right">
              <span className="font-wiki block text-lg leading-none font-bold text-signal-orange">{bnNum(p.points)}</span>
              <span className="text-[11px] text-white/45">পয়েন্ট</span>
            </span>
          </li>
        ))}
      </ol>
      <div className="rounded-2xl bg-white p-4 text-text-primary">
        <p className="flex items-center gap-2 font-bold"><Icon name="bolt" className="text-[20px] text-bd-green" /> পয়েন্ট কীভাবে আসে</p>
        <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-text-secondary">
          <li>প্রতিক্রিয়া <strong className="text-text-primary">+{bn(POINTS.reaction)}</strong></li>
          <li>মন্তব্য <strong className="text-text-primary">+{bn(POINTS.comment)}</strong></li>
          <li>উদ্ধৃতি কপি <strong className="text-text-primary">+{bn(POINTS.cite)}</strong></li>
          <li>প্রতিটি মাধ্যমে শেয়ার <strong className="text-text-primary">+{bn(POINTS.share)}</strong></li>
          <li className="col-span-2">গবেষকের প্রতিটি প্রকাশিত নিবন্ধ <strong className="text-text-primary">+{bn(POINTS.article)}</strong></li>
        </ul>
      </div>
    </section>
  );
}
