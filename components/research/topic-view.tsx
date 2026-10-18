"use client";

/*
 * One track or subject field of গবেষণাকোষ, as a Coursera browse page: the
 * topic's head, (for the real-time track) the national dossier's 32
 * problems with the work done on each, then every published work in the
 * topic as cards, and the other topics to move to.
 */
import Link from "next/link";
import { useMemo } from "react";
import { Icon } from "@/components/ui/icon";
import { btn } from "@/components/ui/section-kit";
import { sourcePoints } from "@/data/amar-bangladesh";
import { FIELDS, type FieldId } from "@/lib/research/core";
import { useLibrary } from "@/lib/research/store";
import { findTrack, inTopic, isFieldId, problemCode, problemCoverage, TRACKS } from "@/lib/research/tracks";
import { cn } from "@/lib/utils";
import { ResearchCard } from "./cards";
import { articleHref, bn, SectionHead } from "./ui";

const URGENCY_BN: Record<string, string> = { "very-high": "খুব জরুরি", high: "জরুরি", "medium-high": "মাঝারি", medium: "মাঝারি" };

/** The dossier's 32 problems, each with the published work that speaks to it (or a way to start it). */
function ProblemMap() {
  const list = useLibrary();
  const coverage = useMemo(() => problemCoverage(list, sourcePoints.map((p) => p.n)), [list]);
  const covered = coverage.filter((p) => p.articles.length > 0).length;
  return (
    <section aria-labelledby="problem-map" className="space-y-6">
      <SectionHead id="problem-map" title="দেশের ৩২টি সমস্যা, এই মুহূর্তে" />
      <p className="-mt-3 max-w-3xl text-base leading-relaxed text-white/80">
        {bn(sourcePoints.length)}টির মধ্যে {bn(covered)}টি নিয়ে গবেষণা আছে, {bn(sourcePoints.length - covered)}টি অপেক্ষায়। নতুন গবেষণা প্রকাশ হলেই মানচিত্র বদলায়।
      </p>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {coverage.map(({ n, articles }) => {
          const p = sourcePoints.find((x) => x.n === n)!;
          const done = articles.length > 0;
          return (
            <li key={n} className={cn("flex flex-col gap-2 rounded-2xl p-4 ring-1 ring-white/12 ring-inset", done ? "bg-bdnavy-900" : "bg-text-primary")}>
              <span className="flex items-center justify-between gap-2 text-xs font-bold">
                <span className="text-signal-orange tabular-nums">{problemCode(n)}</span>
                <span className={cn(p.urgency === "very-high" ? "text-crimson-bright" : "text-white/65")}>{URGENCY_BN[p.urgency]}</span>
              </span>
              <span lang="en" className="text-sm leading-snug font-bold text-white">
                {p.topic}
              </span>
              {done ? (
                <span className="mt-auto flex flex-col gap-1 pt-1">
                  {articles.slice(0, 2).map((a) => (
                    <Link key={a.slug} href={articleHref(a)} className="line-clamp-1 text-sm font-semibold text-signal-orange hover:underline">
                      {a.title}
                    </Link>
                  ))}
                  {articles.length > 2 && <span className="text-xs text-white/65">আরও {bn(articles.length - 2)}টি</span>}
                </span>
              ) : (
                <Link href="/research/submit" className="mt-auto inline-flex items-center gap-1 pt-1 text-sm font-bold text-white/80 hover:text-signal-orange">
                  <Icon name="upload_file" className="text-lg" /> গবেষণার অপেক্ষায় — আপলোড করুন
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function TopicView({ id }: { id: string }) {
  const list = useLibrary();
  const track = findTrack(id);
  const field = isFieldId(id) ? FIELDS[id as FieldId] : undefined;
  const articles = useMemo(() => inTopic(list, id), [list, id]);
  const title = track?.bn ?? field?.bn ?? "";
  const icon = track?.icon ?? field?.icon ?? "category";
  const blurb = track?.blurb ?? `${field?.bn ?? ""} বিষয়ের থিসিস, গবেষণাপত্র, উদ্ভাবন আর প্রকল্প।`;

  return (
    <div className="space-y-16">
      <header className="live-in space-y-5">
        <nav aria-label="অবস্থান" className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-white/65">
          <Link href="/research" className="hover:text-white">
            গবেষণাকোষ
          </Link>
          <Icon name="chevron_right" className="text-base" />
          <Link href="/research#categories" className="hover:text-white">
            {track ? "গবেষণার ধারা" : "বিষয়ক্ষেত্র"}
          </Link>
        </nav>
        <div className="flex flex-col gap-6 rounded-3xl bg-bdnavy-900 p-7 ring-1 ring-white/12 ring-inset sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-5">
            <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-signal-orange text-text-primary">
              <Icon name={icon} className="text-4xl!" />
            </span>
            <div className="min-w-0">
              <h1 className="text-3xl leading-tight font-bold text-signal-orange sm:text-4xl">{title}</h1>
              {track && (
                <p lang="en" className="mt-1 text-sm font-semibold text-white/65">
                  {track.en}
                </p>
              )}
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/80">{blurb}</p>
              <p className="mt-3 text-sm font-bold text-white">{articles.length > 0 ? `${bn(articles.length)}টি প্রকাশিত গবেষণা` : "এখনো কোনো প্রকাশিত গবেষণা নেই"}</p>
            </div>
          </div>
          <Link href="/research/submit" className={cn(btn.gold, "shrink-0")}>
            <Icon name="upload_file" className="text-xl" /> এই ধারায় আপলোড করুন
          </Link>
        </div>
      </header>

      {id === "bd-live" && <ProblemMap />}

      <section aria-labelledby="topic-works" className="space-y-6">
        <SectionHead id="topic-works" title={id === "bd-live" ? "দেশের সমস্যা নিয়ে গবেষণা" : "এই ধারার গবেষণা"} />
        {articles.length > 0 ? (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {articles.map((a) => (
              <li key={a.slug}>
                <ResearchCard a={a} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-start gap-4 rounded-3xl bg-cobalt p-7 ring-1 ring-white/12 ring-inset sm:p-9">
            <h3 className="text-2xl font-bold text-signal-orange">প্রথম গবেষণাটি আপনার হোক</h3>
            <p className="max-w-2xl text-base leading-relaxed text-white/80">
              {id === "global"
                ? "বৈশ্বিক বা তুলনামূলক গবেষণা জমা দেওয়ার সময় “পরিসর” ঘরে “বৈশ্বিক” বাছুন — পর্যালোচনার পর এখানে দেখা যাবে।"
                : "এই ধারায় জমা দিলে পর্যালোচনার পর এখানে দেখা যাবে।"}
            </p>
            <Link href="/research/submit" className={btn.gold}>
              <Icon name="upload_file" className="text-xl" /> গবেষণা আপলোড করুন
            </Link>
          </div>
        )}
      </section>

      <section aria-labelledby="other-topics" className="space-y-5">
        <SectionHead id="other-topics" title="অন্য ধারা ও বিষয়" />
        <ul className="flex flex-wrap gap-2">
          {[...TRACKS.map((t) => ({ id: t.id, bn: t.bn, icon: t.icon })), ...(Object.keys(FIELDS) as FieldId[]).map((f) => ({ id: f, bn: FIELDS[f].bn, icon: FIELDS[f].icon }))]
            .filter((t) => t.id !== id)
            .map((t) => (
              <li key={t.id}>
                <Link
                  href={`/research/topic/${t.id}`}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-bold text-white ring-1 ring-white/20 transition-colors hover:bg-signal-orange hover:text-text-primary hover:ring-signal-orange"
                >
                  <Icon name={t.icon} className="text-lg text-signal-orange" /> {t.bn}
                </Link>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
