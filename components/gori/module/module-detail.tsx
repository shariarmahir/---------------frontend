"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Gamepad2, Search } from "lucide-react";
import { crossCutting, moduleOf, neighboursOf, type ModuleCode } from "@/data/gori/modules";
import { evidenceBn, pointOf, themeBn, urgencyBn } from "@/data/gori/puzzles";
import { restoration } from "@/lib/gori/progression";
import { retrieve } from "@/lib/gori/retrieval";
import { randomSeed } from "@/lib/gori/rng";
import { cn } from "@/lib/utils";
import { AgentAnswerView, useAgent } from "../ai-panel";
import { useT } from "../provider";
import { BASE } from "../shell";
import { useGori, useHydrated } from "../store";
import { EvidenceCheck } from "./evidence-check";
import { PixelMark } from "@/components/ui/section-kit";

export function ModuleDetail({ code }: { code: ModuleCode }) {
  const m = moduleOf(code)!;
  const point = pointOf(m.n);
  const router = useRouter();
  const progress = useGori((s) => s.progress);
  const startMode = useGori((s) => s.startMode);
  const hydrated = useHydrated();
  const { n } = useT();
  const nb = neighboursOf(code);
  const records = retrieve({ module: code, limit: 6 }).map((r) => r.record);
  const share = hydrated ? restoration(progress)[m.n - 1] : 0;
  const themesHere = crossCutting.filter((c) => c.modules.includes(code));
  const research = useAgent();
  const prev = m.n > 1 ? `BD-${String(m.n - 1).padStart(3, "0")}` : null;
  const next = m.n < 32 ? `BD-${String(m.n + 1).padStart(3, "0")}` : null;

  return (
    <div className="mx-auto max-w-340 px-4 py-8 sm:px-6 lg:px-8">
      <nav aria-label="মডিউল" className="flex flex-wrap justify-between gap-2 font-bengali text-sm">
        <Link href={BASE} className="inline-flex min-h-10 items-center gap-1 text-white/80 hover:text-white"><ArrowLeft className="size-4" aria-hidden /> জাতীয় মানচিত্র</Link>
        <span className="flex gap-3">
          {prev && <Link href={`${BASE}/module/${prev}`} className="inline-flex min-h-10 items-center px-1 text-white/80 hover:text-white">← {prev}</Link>}
          {next && <Link href={`${BASE}/module/${next}`} className="inline-flex min-h-10 items-center px-1 text-white/80 hover:text-white">{next} →</Link>}
        </span>
      </nav>

      <header className="mt-5">
        <p className="flex flex-wrap gap-2 font-bengali text-xs">
          <span className="rounded-full bg-signal-orange px-2.5 py-1 font-bold text-text-primary">{m.code}</span>
          <span className="rounded-full bg-white/10 px-2.5 py-1">{themeBn[m.theme]}</span>
          <span className={cn("rounded-full px-2.5 py-1", point.urgency === "very-high" ? "bg-national-crimson text-white" : "bg-white/10")}>{urgencyBn[point.urgency]}</span>
          <span className="rounded-full bg-white/10 px-2.5 py-1">{evidenceBn[point.status]}</span>
        </p>
        <PixelMark tone="dark" className="mb-2" />
        <h1 className="mt-3 font-bengali text-3xl font-bold text-white sm:text-4xl">{m.titleBn}</h1>
        <p className="text-sm text-white/80">{m.titleEn}</p>
        <p className="mt-3 max-w-[70ch] font-bengali text-base leading-7 text-white/85">
          প্রতিবেদনের ব্যাখ্যা: {point.interpretation}। <span className="text-white/80">{point.statusNote}।</span>
        </p>
        <p className="mt-3 font-bengali text-sm text-white/80">মানচিত্রে পুনর্গঠন: {n(Math.round(share * 100))}%</p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          {m.simulation === "full" ? (
            <section className="rounded-2xl bg-bd-green p-5 text-white">
              <h2 className="font-bengali text-xl font-bold text-signal-orange">পূর্ণ সিমুলেশন খেলা যায়</h2>
              <p className="mt-1 font-bengali text-sm text-white/85">কাল্পনিক ইউনিয়নে কারণ-মানচিত্র, ১১টি হস্তক্ষেপ, সীমিত বাজেট, অংশীজন আর ঘটনা।</p>
              <button
                type="button"
                onClick={() => {
                  startMode("campaign", randomSeed());
                  router.push(`${BASE}/play`);
                }}
                className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-signal-orange px-5 font-bengali font-bold text-text-primary"
              >
                <Gamepad2 className="size-5" aria-hidden /> অভিযান শুরু
              </button>
            </section>
          ) : (
            <p className="rounded-2xl border border-white/15 px-5 py-4 font-bengali text-sm text-white/80">
              এই মডিউলের পূর্ণ সিমুলেশন এখনো তৈরি হয়নি (পরবর্তী ধাপ)। এখন প্রমাণ-পরীক্ষা খেলুন — ফল জাতীয় মানচিত্রে এই মডিউলের পিক্সেল পরিষ্কার করবে।
            </p>
          )}
          <EvidenceCheck n={m.n} />
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl bg-text-primary ring-1 ring-white/12 p-5 text-white">
            <h2 className="font-bengali text-lg font-bold text-signal-orange">প্রমাণ</h2>
            <ul className="mt-3 space-y-2">
              {records.map((e) => (
                <li key={e.id} className={cn("rounded-xl bg-black ring-1 ring-white/12 px-3.5 py-2.5 font-bengali text-sm", e.sourceType === "unsupported" && "border border-national-crimson/40")}>
                  <span className="font-semibold">{e.title}</span>
                  <span className="block text-white/80">{e.extractedClaims.slice(0, 2).join(" · ")}</span>
                  <span className="block text-xs text-white/65">{e.publisher} · {e.reliabilityNotes}</span>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => research.ask({ agent: "research", module: code })} disabled={research.status === "loading"} className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-black px-4 font-bengali text-sm font-bold text-white disabled:opacity-50">
              <Search className="size-4" aria-hidden /> গবেষণা সহকারীকে জিজ্ঞাসা করুন
            </button>
            <div className="mt-4">
              <AgentAnswerView answer={research.answer} status={research.status} />
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 p-5">
            <h2 className="font-bengali text-lg font-bold text-signal-orange">নির্ভরতা (খেলার অনুমানসহ)</h2>
            <div className="mt-3 grid gap-4 font-bengali text-sm sm:grid-cols-2">
              {([["যার ওপর নির্ভর করে", nb.upstream.map((l) => ({ c: l.from, l }))], ["যাকে প্রভাবিত করে", nb.downstream.map((l) => ({ c: l.to, l }))]] as const).map(([title, list]) => (
                <div key={title}>
                  <p className="text-xs font-semibold text-white/80">{title}</p>
                  <ul className="mt-1 space-y-2">
                    {list.length ? (
                      list.map(({ c, l }) => (
                        <li key={c}>
                          <Link href={`${BASE}/module/${c}`} className="inline-block py-0.5 font-semibold text-white hover:underline">{moduleOf(c)?.titleBn}</Link>
                          <span className="block text-xs text-white/80">{l.basis === "dossier" ? "প্রতিবেদনের প্রক্রিয়া" : "খেলার অনুমান"} · আস্থা {l.confidence === "high" ? "উচ্চ" : l.confidence === "medium" ? "মাঝারি" : "নিম্ন"} — {l.note}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-white/80">নেই</li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
            {themesHere.length > 0 && (
              <p className="mt-4 font-bengali text-xs text-white/80">আন্তঃখাত বিষয়: {themesHere.map((t) => t.bn).join(", ")}</p>
            )}
          </section>
          <Link href={`${BASE}/evidence?module=${code}`} className="inline-flex min-h-10 items-center gap-2 font-bengali text-sm font-semibold text-signal-orange hover:underline">
            প্রমাণ অনুসন্ধানে সব রেকর্ড <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
