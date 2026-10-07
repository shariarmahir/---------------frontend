import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Search, ShieldAlert } from "lucide-react";
import { MyFinals } from "@/components/media/academy/my-finals";
import { mediaButton } from "@/components/media/ui/button-styles";
import { PageHeader, Panel } from "@/components/media/ui/layout";
import { DateText, Num } from "@/components/media/ui/numerals";
import { board, getCourse } from "@/data/media/academy";
import { DISTINCTION, EXAMINER_GAP, MIN_ATTENDANCE, MIN_HOMEWORK, PASS_MARK, VERDICTS, finalResult } from "@/lib/media/academy";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "ফাইনাল ও সার্টিফিকেট · একাডেমি" };

const RULES = [
  { title: "কে বসতে পারেন", body: <>অন্তত <Num value={MIN_ATTENDANCE * 100} />% ক্লাসে হাজিরা, <Num value={MIN_HOMEWORK * 100} />% হোমওয়ার্ক আর ফাইনাল প্রজেক্ট জমা। অভিজ্ঞতার স্বীকৃতি পেলে শুধু প্রজেক্ট।</> },
  { title: "দুই পরীক্ষক", body: <>শিক্ষক আর একজন বহিরাগত পেশাদার আলাদা নম্বর দেন। দুজনের ফারাক <Num value={EXAMINER_GAP} />-এর বেশি হলে তৃতীয় পরীক্ষক আসেন।</> },
  { title: "ফল", body: <><Num value={DISTINCTION} />+ কৃতিত্বের সাথে, <Num value={PASS_MARK} />+ উত্তীর্ণ। এর নিচে হলে ফল প্রকাশ হয় না — ৩০ দিন পর আবার চেষ্টা।</> },
  { title: "সার্টিফিকেট", body: "KTA আইডিসহ, যে কেউ এই পাতায় যাচাই করতে পারেন। এটা দক্ষতার শিল্প-যাচাই, সরকারি ডিগ্রি নয়।" },
];

const passes = board.filter((s) => s.certificate).sort((a, b) => b.at.localeCompare(a.at));
const upcoming = board.filter((s) => !s.marks).sort((a, b) => a.at.localeCompare(b.at));

export default async function ExamPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const raw = (await searchParams).id?.trim().toUpperCase().slice(0, 40) ?? "";
  const found = raw ? passes.find((s) => s.certificate === raw) : undefined;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        back={{ href: "/media/academy", label: "একাডেমি" }}
        title="ফাইনাল ও সার্টিফিকেট"
        subtitle="কোর্স শেষ মানেই পাস নয়। সত্যিকারের একটা কাজ বানিয়ে পেশাদারদের প্যানেলের সামনে ব্যাখ্যা করতে হয় — ইন্টারভিউটাই ফাইনাল, আর তা সবার জন্য খোলা।"
      />

      <ol className="mb-10 grid gap-px overflow-hidden rounded-2xl bg-white/12 sm:grid-cols-2 lg:grid-cols-4">
        {RULES.map((r) => (
          <li key={r.title} className="bg-black p-5">
            <h2 className="font-bold text-signal-orange">{r.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-white/85">{r.body}</p>
          </li>
        ))}
      </ol>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-10">
          <section id="board" aria-labelledby="board-title" className="scroll-mt-24">
            <h2 id="board-title" className="text-xl font-bold text-white">প্রকাশ্য ইন্টারভিউ বোর্ড</h2>
            <p className="mt-1 mb-4 text-sm text-white/75">সামনের প্যানেল আর সাম্প্রতিক উত্তীর্ণরা। নিয়োগকর্তারা এখান থেকেই দক্ষ মানুষ খোঁজেন।</p>

            <h3 className="mb-2 text-sm font-semibold text-signal-orange">সামনের ইন্টারভিউ</h3>
            <ul className="mb-8 divide-y divide-white/10 overflow-hidden rounded-2xl bg-text-primary ring-1 ring-white/12">
              {upcoming.map((s) => (
                <li key={s.id} className="grid gap-1 p-4 sm:grid-cols-[14rem_minmax(0,1fr)] sm:gap-4">
                  <span className="text-sm font-semibold text-white/85"><DateText iso={s.at} time weekday /></span>
                  <span className="min-w-0">
                    <span className="block font-semibold text-white">{s.learner} <span className="font-normal text-white/65">· {s.district}</span></span>
                    <Link href={`/media/academy/course/${s.course}`} className="block text-sm text-signal-orange hover:underline">{getCourse(s.course)?.title}</Link>
                    <span className="mt-1 block text-sm text-white/80">প্রজেক্ট: {s.project}</span>
                    <span className="mt-1 block text-xs text-white/65">প্যানেল: {s.panel.join(" · ")}</span>
                  </span>
                </li>
              ))}
            </ul>

            <h3 className="mb-2 text-sm font-semibold text-signal-orange">উত্তীর্ণ</h3>
            <ul className="grid gap-4 sm:grid-cols-2">
              {passes.map((s) => {
                const { average, verdict } = finalResult(s.marks!);
                return (
                  <li key={s.id} className="flex flex-col rounded-2xl bg-text-primary p-5 ring-1 ring-white/12">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-white">{s.learner}</p>
                        <p className="text-sm text-white/75">{getCourse(s.course)?.title}</p>
                      </div>
                      <span className={cn("rounded-md px-2 py-1 text-xs font-bold whitespace-nowrap", verdict === "distinction" ? "bg-signal-orange text-text-primary" : "bg-bd-green text-white")}>{VERDICTS[verdict]}</span>
                    </div>
                    <p className="mt-3 text-sm text-white/80">{s.project}</p>
                    <p className="mt-2 text-xs text-white/65">
                      গড় <Num value={average} /> · পরীক্ষক <Num value={s.marks!.length} /> জন{s.marks!.length > 2 && " (তৃতীয় পরীক্ষকসহ)"} · <DateText iso={s.at} />
                    </p>
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
                      <Link href={`/media/academy/exam?id=${s.certificate}#verify`} className="font-mono text-xs font-bold text-signal-orange hover:underline">{s.certificate}</Link>
                      <Link href="/media/jobs" className={mediaButton({ variant: "quiet", size: "sm" })}>কাজে ডাকুন</Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-0 lg:self-start">
          <Panel title="আমার ফাইনাল">
            <MyFinals />
          </Panel>

          <Panel title="সার্টিফিকেট যাচাই" as="section">
            <form id="verify" action="/media/academy/exam#verify" role="search" className="flex scroll-mt-28 gap-2">
              <label className="sr-only" htmlFor="cert-id">সার্টিফিকেট আইডি</label>
              <input id="cert-id" name="id" defaultValue={raw} placeholder="KTA-2026-…" autoComplete="off" spellCheck={false} className="h-11 min-w-0 flex-1 rounded-lg border border-white/15 bg-black px-3 font-mono text-sm uppercase focus-visible:border-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange/25 focus-visible:outline-none" />
              <button type="submit" className={mediaButton({ variant: "primary", size: "icon" })} aria-label="যাচাই করুন"><Search aria-hidden /></button>
            </form>
            {raw && (found ? (
              <div className="mt-4 rounded-xl bg-bd-green p-4 text-sm text-white">
                <p className="flex items-center gap-2 font-bold"><BadgeCheck className="size-5" aria-hidden /> আসল সার্টিফিকেট</p>
                <p className="mt-1">{found.learner} · {getCourse(found.course)?.title}</p>
                <p className="mt-0.5 text-white/85">{VERDICTS[finalResult(found.marks!).verdict]} · <DateText iso={found.at} /></p>
              </div>
            ) : (
              <p className="mt-4 flex gap-2 text-sm text-crimson-bright"><ShieldAlert className="size-5 shrink-0" aria-hidden /> এই আইডির কোনো সার্টিফিকেট নেই — নকল হতে পারে।</p>
            ))}
          </Panel>
        </aside>
      </div>
    </div>
  );
}
