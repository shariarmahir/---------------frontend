"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/lib/auth/client";
import { FIELDS, KINDS, type FieldId, type ResearchKind } from "@/lib/research/core";
import { useLibrary, useResearch } from "@/lib/research/store";
import { ArticleItem, bn, bnDate, articleHref } from "./ui";

/** সূচিপত্র: every article by field, with the viewer's own submissions and saved reading first. */
export function ContentsView() {
  const { account } = useAuth();
  const list = useLibrary();
  const mine = useResearch((s) => s.mine);
  const saved = useResearch((s) => s.saved);
  const published = list.filter((a) => a.status === "published");
  const keep = published.filter((a) => saved[a.slug]);
  const fields = (Object.keys(FIELDS) as FieldId[]).map((f) => [f, published.filter((a) => a.field === f).sort((x, y) => y.published.localeCompare(x.published))] as const);

  return (
    <div className="space-y-12">
      <header>
        <p className="text-sm font-bold text-signal-orange">সব গবেষণা, বিষয় ধরে</p>
        <h1 className="font-wiki mt-1 text-[clamp(2.2rem,5vw,3.4rem)] leading-tight font-bold text-white">সূচিপত্র</h1>
        <p className="mt-3 text-[15px] text-white/65">{bn(published.length)}টি প্রকাশিত নিবন্ধ — {(Object.keys(KINDS) as ResearchKind[]).map((k) => `${KINDS[k].bn} ${bn(published.filter((a) => a.kind === k).length)}`).join(" · ")}</p>
        <nav aria-label="বিষয়ক্ষেত্রে যান" className="mt-5 flex flex-wrap gap-2">
          {fields.map(([f, l]) => (
            <a key={f} href={`#${f}`} className="inline-flex h-10 items-center gap-1.5 rounded-full bg-white/[0.05] px-3.5 text-sm font-semibold text-white ring-1 ring-white/12 transition-colors hover:bg-white hover:text-text-primary">
              <Icon name={FIELDS[f].icon} className="text-[17px] text-signal-orange" /> {FIELDS[f].bn} <span className="text-white/45">{bn(l.length)}</span>
            </a>
          ))}
        </nav>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <section id="mine" aria-labelledby="mine-title" className="scroll-mt-56 rounded-[1.75rem] bg-bd-green p-6 text-white">
          <h2 id="mine-title" className="font-wiki flex items-center gap-2 text-2xl font-bold"><Icon name="folder_shared" className="text-[24px] text-signal-orange" /> আমার জমা</h2>
          {!account ? (
            <p className="mt-3 text-sm text-white/80"><Link href="/login?next=/research/contents%23mine" className="font-bold text-signal-orange hover:underline">সাইন ইন করুন</Link> — আপনার জমা দেওয়া গবেষণা এখানে দেখাবে।</p>
          ) : mine.length === 0 ? (
            <p className="mt-3 text-sm text-white/80">এখনো কিছু জমা দেননি। <Link href="/research/submit" className="font-bold text-signal-orange hover:underline">প্রথম গবেষণা প্রকাশ করুন →</Link></p>
          ) : (
            <ul className="mt-4 space-y-2">
              {mine.map((a) => (
                <li key={a.slug}>
                  <Link href={articleHref(a)} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-white/10 px-4 py-3 transition-colors hover:bg-white/15">
                    <span className="font-semibold">{a.title}</span>
                    <span className="text-xs text-white/65">{bnDate(a.published)}</span>
                    <span className="ml-auto rounded-full bg-signal-orange px-2.5 py-0.5 text-xs font-bold text-text-primary">{a.status === "review" ? "পর্যালোচনার অপেক্ষায়" : "প্রকাশিত"}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section aria-labelledby="saved-title" className="rounded-[1.75rem] bg-white/[0.04] p-6 ring-1 ring-white/10">
          <h2 id="saved-title" className="font-wiki flex items-center gap-2 text-2xl font-bold text-white"><Icon name="bookmark" className="text-[24px] text-signal-orange" filled /> পরে পড়ব</h2>
          {keep.length === 0 ? (
            <p className="mt-3 text-sm text-white/60">কোনো নিবন্ধে “সংরক্ষণ” চাপলে এখানে জমা থাকবে।</p>
          ) : (
            <ul className="mt-4 space-y-1.5">
              {keep.map((a) => <li key={a.slug}><Link href={articleHref(a)} className="font-semibold text-white hover:text-signal-orange">{a.title}</Link></li>)}
            </ul>
          )}
        </section>
      </div>

      {fields.map(([f, l]) => (
        <section key={f} id={f} aria-labelledby={`${f}-title`} className="story-reveal scroll-mt-56">
          <h2 id={`${f}-title`} className="font-wiki flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-white/10 pb-3 text-2xl font-bold text-white sm:text-[1.75rem]">
            <span className="grid size-10 place-items-center rounded-xl bg-signal-orange text-text-primary"><Icon name={FIELDS[f].icon} className="text-[22px]" /></span>
            {FIELDS[f].bn}
            <span lang="en" className="text-sm font-normal text-white/40">{FIELDS[f].en} · {bn(l.length)}</span>
          </h2>
          {l.length === 0 ? (
            <p className="mt-4 text-sm text-white/55">এই ক্ষেত্রে এখনো নিবন্ধ নেই। <Link href="/research/submit" className="font-bold text-signal-orange hover:underline">প্রথমটি আপনার হোক</Link>।</p>
          ) : (
            <ul className="mt-2 divide-y divide-white/8">{l.map((a) => <li key={a.slug}><ArticleItem a={a} /></li>)}</ul>
          )}
        </section>
      ))}
    </div>
  );
}
