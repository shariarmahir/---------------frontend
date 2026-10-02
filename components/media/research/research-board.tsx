"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, FlaskConical, GraduationCap, Microscope, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PixelMark } from "@/components/ui/section-kit";
import { sampleResearch } from "@/data/media/research";
import { STAGES, roomHref, type ResearchEntry, type ResearchStage } from "@/lib/media/showcase";
import { useMediaState } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { chipClass } from "../ui/field-styles";
import { Ago } from "../ui/numerals";

export interface FeedResearch {
  id: string;
  title: string;
  author: string;
  at: string;
}

const STAGE_CLS: Record<ResearchStage, string> = {
  idea: "bg-white text-text-primary",
  running: "bg-signal-orange text-text-primary",
  done: "bg-bd-green text-white",
};

type Source = "all" | "classroom" | "lab";

export function ResearchBoard({ fromFeed }: { fromFeed: FeedResearch[] }) {
  const mine = useMediaState((s) => s.research);
  const myPosts = useMediaState((s) => s.posts);
  const [source, setSource] = useState<Source>("all");
  const [stage, setStage] = useState<ResearchStage | "all">("all");
  const [q, setQ] = useState("");

  const all = useMemo(() => [...mine, ...sampleResearch.filter((r) => !mine.some((m) => m.id === r.id))], [mine]);
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const shown = all.filter(
    (r) =>
      (source === "all" || r.from.kind === source) &&
      (stage === "all" || r.stage === stage) &&
      words.every((w) => [r.title, r.question, r.finding, r.method ?? "", r.from.name, ...r.team, ...r.tags].join(" ").toLowerCase().includes(w)),
  );
  const imageOf = (r: ResearchEntry) => r.image ?? myPosts.find((p) => p.id === r.postId)?.media[0]?.src;
  const feedOnly = [
    ...myPosts.filter((p) => p.topic === "research" && !all.some((r) => r.postId === p.id)).map((p) => ({ id: p.id, title: p.caption.split("\n")[0], author: "আপনি", at: p.createdAt, live: true })),
    ...fromFeed.map((f) => ({ ...f, live: false })),
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="live-in overflow-hidden rounded-3xl bg-text-primary p-5 ring-1 ring-white/12 sm:p-8">
        <PixelMark tone="dark" />
        <div className="mt-4">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight text-balance text-white sm:text-4xl">
              ক্লাস থেকে <span className="text-signal-orange">গবেষণা</span>
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-white/75">ক্লাসরুম আর ল্যাবের দল যে প্রশ্নের পেছনে লেগেছে — তাদের পদ্ধতি, ফলাফল আর পরের ধাপ। সবার জন্য খোলা; কাজে লাগলে নিজের এলাকায় আবার যাচাই করুন।</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/media/classroom" className={mediaButton({ variant: "primary", size: "lg" })}><Microscope aria-hidden /> দলের গবেষণা জমা দিন</Link>
              <Link href="/media?t=research" className={mediaButton({ variant: "outline", size: "lg" })}>ফিডে গবেষণা পোস্ট</Link>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-3">
        <label className="relative block">
          <span className="sr-only">গবেষণা খুঁজুন</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-white/55" aria-hidden />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="বিষয়, দল, ক্লাস বা ট্যাগ দিয়ে খুঁজুন" className="pl-10" />
        </label>
        <div className="flex flex-wrap gap-2">
          {([["all", "সব"], ["classroom", "ক্লাসরুম থেকে"], ["lab", "ল্যাব থেকে"]] as const).map(([k, label]) => (
            <button key={k} type="button" aria-pressed={source === k} onClick={() => setSource(k)} className={chipClass(source === k)}>{label}</button>
          ))}
          <span className="mx-1 w-px self-stretch bg-white/12" aria-hidden />
          {(["all", ...Object.keys(STAGES)] as (ResearchStage | "all")[]).map((k) => (
            <button key={k} type="button" aria-pressed={stage === k} onClick={() => setStage(k)} className={chipClass(stage === k)}>{k === "all" ? "সব ধাপ" : STAGES[k]}</button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="rounded-2xl bg-text-primary p-8 text-center text-sm text-white/65 ring-1 ring-white/12">এই খোঁজে কোনো গবেষণা নেই। ফিল্টার বদলান, অথবা আপনার দলের কাজটাই প্রথম হোক।</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {shown.map((r) => {
            const img = imageOf(r);
            const RoomIcon = r.from.kind === "lab" ? FlaskConical : GraduationCap;
            return (
              <li key={r.id} id={r.id} className="story-reveal flex scroll-mt-28 flex-col overflow-hidden rounded-2xl bg-text-primary ring-1 ring-white/12 target:ring-2 target:ring-signal-orange">
                {img && <Image src={img} alt="" width={640} height={360} unoptimized className="aspect-video w-full object-cover" />}
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                    <span className={cn("rounded-full px-2.5 py-0.5", STAGE_CLS[r.stage])}>{STAGES[r.stage]}</span>
                    <Link href={roomHref(r.from)} className="inline-flex items-center gap-1 text-white/70 hover:text-signal-orange"><RoomIcon className="size-3.5" aria-hidden /> {r.from.name}</Link>
                    <span className="ml-auto font-medium text-white/50"><Ago iso={r.at} live={mine.some((m) => m.id === r.id)} /></span>
                  </div>
                  <h2 className="text-lg leading-snug font-bold text-white">{r.title}</h2>
                  {r.question && <p className="text-sm leading-relaxed text-white/80"><span className="font-bold text-signal-orange">প্রশ্ন · </span>{r.question}</p>}
                  {r.method && (
                    <details className="group text-sm text-white/75">
                      <summary className="cursor-pointer font-bold text-white/85 marker:text-signal-orange">পদ্ধতি</summary>
                      <p className="mt-1 leading-relaxed">{r.method}</p>
                    </details>
                  )}
                  <p className="rounded-xl bg-bd-green/25 p-3 text-sm leading-relaxed text-white ring-1 ring-bd-green/60"><span className="font-bold text-bdgreen-500">ফলাফল · </span>{r.finding}</p>
                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
                    {r.team.map((t) => <span key={t} className="rounded-full bg-white/8 px-2.5 py-1 text-xs font-semibold text-white/85 ring-1 ring-white/10">{t}</span>)}
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm font-bold">
                    {r.postId && <Link href={`/media/post/${r.postId}`} className="inline-flex items-center gap-1 text-signal-orange hover:underline">ফিডে আলোচনা <ArrowUpRight className="size-4" aria-hidden /></Link>}
                    <Link href={roomHref(r.from)} className="inline-flex items-center gap-1 text-white/75 hover:text-signal-orange">দলের পাতায় <ArrowUpRight className="size-4" aria-hidden /></Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {feedOnly.length > 0 && (
        <section aria-labelledby="feed-research" className="space-y-3">
          <h2 id="feed-research" className="text-xl font-bold text-white">ফিডের গবেষণা পোস্ট</h2>
          <ul className="divide-y divide-white/10 rounded-2xl bg-text-primary ring-1 ring-white/12">
            {feedOnly.map((f) => (
              <li key={f.id}>
                <Link href={`/media/post/${f.id}`} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/5">
                  <Microscope className="size-4.5 shrink-0 text-signal-orange" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-white">{f.title}</span>
                    <span className="text-xs text-white/55">{f.author} · <Ago iso={f.at} live={f.live} /></span>
                  </span>
                  <ArrowUpRight className="size-4 shrink-0 text-white/55" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
