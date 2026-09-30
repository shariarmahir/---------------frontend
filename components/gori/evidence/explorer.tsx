"use client";

import { useSearchParams } from "next/navigation";
import { Newspaper, Search, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { evidence, EVIDENCE_VERSION, type SourceType } from "@/data/gori/evidence";
import { moduleOf, modules } from "@/data/gori/modules";
import { newsItems } from "@/data/news-feed";
import { cn } from "@/lib/utils";
import { AgentAnswerView, useAgent } from "../ai-panel";
import { useT } from "../provider";
import { PixelMark } from "@/components/ui/section-kit";

const TYPE_BN: Record<SourceType, string> = {
  statistic: "পরিসংখ্যান",
  finding: "গবেষণার ফল",
  interpretation: "প্রতিবেদনের ব্যাখ্যা",
  mechanism: "কারণ-প্রক্রিয়া",
  indicator: "নজরদারি সূচক",
  rule: "প্রমাণের নিয়ম",
  unsupported: "অসমর্থিত দাবি",
};
const STATUS_BN = { verified: "প্রমাণিত", plausible: "সম্ভাব্য", unverified: "যাচাই বাকি", unsupported: "অসমর্থিত" } as const;

export function EvidenceExplorer() {
  const params = useSearchParams();
  const { n } = useT();
  const [q, setQ] = useState("");
  const [type, setType] = useState<SourceType | "all">("all");
  const [mod, setMod] = useState(params.get("module") ?? "all");
  const [claim, setClaim] = useState("");
  const [newsId, setNewsId] = useState(newsItems[0].id);
  const checker = useAgent();
  const interpreter = useAgent();

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return evidence.filter(
      (e) =>
        (type === "all" || e.sourceType === type) &&
        (mod === "all" || e.modules.includes(mod as never)) &&
        (!needle || [e.title, e.publisher, ...e.extractedClaims, ...e.keywords].join(" ").toLowerCase().includes(needle)),
    );
  }, [q, type, mod]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const e of evidence) c[e.status] = (c[e.status] ?? 0) + 1;
    return c;
  }, []);

  const field = "h-11 rounded-xl border border-white/15 bg-black ring-1 ring-white/12 px-3 font-bengali text-sm text-white";

  return (
    <div className="mx-auto max-w-340 px-4 py-8 sm:px-6 lg:px-8">
      <PixelMark tone="dark" className="mb-2" />
      <h1 className="font-bengali text-3xl font-bold text-signal-orange">প্রমাণ অনুসন্ধান</h1>
      <p className="mt-2 max-w-[72ch] font-bengali text-white/85">
        খেলার প্রতিটি দাবি আর AI-এর প্রতিটি উদ্ধৃতি এই {n(evidence.length)}টি রেকর্ড থেকে। সব রেকর্ড জাতীয় সমস্যা প্রতিবেদনে সংকলিত; প্রকাশক আছে, কিন্তু মূল নথির লিংক প্রতিবেদনে নেই — তাই এখানেও নেই, বানানো হয়নি। সংস্করণ {EVIDENCE_VERSION}।
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <section aria-labelledby="records-title">
          <h2 id="records-title" className="sr-only">রেকর্ড</h2>
          <div className="flex flex-wrap gap-2">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">খুঁজুন</span>
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/65" aria-hidden />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="যেমন: মূল্যস্ফীতি, দূষণ, ঘুষ" className={cn(field, "w-full pl-9")} />
            </label>
            <label>
              <span className="sr-only">ধরন</span>
              <select value={type} onChange={(e) => setType(e.target.value as SourceType | "all")} className={field}>
                <option value="all">সব ধরন</option>
                {Object.entries(TYPE_BN).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
            <label>
              <span className="sr-only">মডিউল</span>
              <select value={mod} onChange={(e) => setMod(e.target.value)} className={cn(field, "max-w-56")}>
                <option value="all">সব মডিউল</option>
                {modules.map((m) => <option key={m.code} value={m.code}>{m.code} {m.titleBn}</option>)}
              </select>
            </label>
          </div>
          <p className="mt-3 font-bengali text-sm text-white/80" aria-live="polite">{n(list.length)}টি রেকর্ড</p>
          <ul className="mt-2 space-y-2">
            {list.map((e) => (
              <li key={e.id} className={cn("rounded-xl bg-text-primary ring-1 ring-white/12 p-4 text-white", e.sourceType === "unsupported" && "ring-2 ring-national-crimson/50")}>
                <p className="flex flex-wrap items-center gap-2 font-bengali text-[11px]">
                  <span className="font-mono text-white/65">{e.id}</span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 font-semibold text-white">{TYPE_BN[e.sourceType]}</span>
                  <span className={cn("rounded-full px-2 py-0.5 font-semibold", e.status === "verified" ? "bg-bdgreen-500 text-text-primary" : e.status === "unsupported" ? "bg-national-crimson text-white" : "bg-signal-orange text-text-primary")}>{STATUS_BN[e.status]}</span>
                </p>
                <p className="mt-1 font-bengali font-semibold">{e.title}</p>
                <ul className="mt-1 list-disc pl-5 font-bengali text-sm text-white/80">
                  {e.extractedClaims.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
                <p className="mt-1.5 font-bengali text-xs text-white/65">
                  প্রকাশক: {e.publisher} · সংকলনের তারিখ {e.retrievalDate} · {e.reliabilityNotes}
                  {e.modules.length > 0 && ` · মডিউল: ${e.modules.map((m) => moduleOf(m)?.code).join(", ")}`}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <div className="space-y-5">
          <section className="rounded-2xl bg-text-primary ring-1 ring-white/12 p-5 text-white" aria-labelledby="checker-title">
            <h2 id="checker-title" className="flex items-center gap-2 font-bengali text-lg font-bold text-signal-orange"><ShieldCheck className="size-5 text-signal-orange" aria-hidden /> প্রমাণ যাচাইকারী</h2>
            <p className="mt-1 font-bengali text-sm text-white/80">একটি দাবি লিখুন — রেকর্ডের সাথে মিলিয়ে বলবে সমর্থিত, আংশিক, অসমর্থিত, না তথ্য নেই।</p>
            <label className="mt-3 block font-bengali text-sm font-semibold">
              দাবি
              <textarea value={claim} onChange={(e) => setClaim(e.target.value)} maxLength={500} rows={3} placeholder="যেমন: বাংলাদেশের সবাই ঘুষ দেয়।" className="mt-1 block w-full rounded-xl border border-white/15 bg-black ring-1 ring-white/12 px-3 py-2 text-sm" />
            </label>
            <button type="button" disabled={!claim.trim() || checker.status === "loading"} onClick={() => checker.ask({ agent: "evidence", claim: claim.trim(), ...(mod !== "all" ? { module: mod as never } : {}) })} className="mt-3 inline-flex h-11 items-center rounded-xl bg-signal-orange px-5 font-bengali text-sm font-bold disabled:opacity-40 text-text-primary">
              যাচাই করুন
            </button>
            <div className="mt-4"><AgentAnswerView answer={checker.answer} status={checker.status} /></div>
          </section>

          <section className="rounded-2xl bg-text-primary ring-1 ring-white/12 p-5 text-white" aria-labelledby="news-title">
            <h2 id="news-title" className="flex items-center gap-2 font-bengali text-lg font-bold text-signal-orange"><Newspaper className="size-5 text-bdorange-600" aria-hidden /> সংবাদ ব্যাখ্যাকারী</h2>
            <p className="mt-1 font-bengali text-sm text-white/80">সংবাদ সূচি এখনো নমুনা তথ্যে — আসল প্রকাশিত প্রতিবেদন নয়। ব্যাখ্যাকারী সেটা স্পষ্ট বলবে।</p>
            <label className="mt-3 block font-bengali text-sm font-semibold">
              খবর
              <select value={newsId} onChange={(e) => setNewsId(e.target.value)} className="mt-1 block h-11 w-full rounded-xl border border-white/15 bg-black ring-1 ring-white/12 px-3 text-sm">
                {newsItems.map((x) => <option key={x.id} value={x.id}>{x.headline}</option>)}
              </select>
            </label>
            <button type="button" disabled={interpreter.status === "loading"} onClick={() => interpreter.ask({ agent: "news", newsId })} className="mt-3 inline-flex h-11 items-center rounded-xl bg-black px-5 font-bengali text-sm font-bold text-white disabled:opacity-40">
              ব্যাখ্যা চাই
            </button>
            <div className="mt-4"><AgentAnswerView answer={interpreter.answer} status={interpreter.status} /></div>
          </section>

          <section className="rounded-2xl border border-white/10 p-5" aria-labelledby="review-title">
            <h2 id="review-title" className="font-bengali text-lg font-bold text-signal-orange">উৎস পর্যালোচনা (অ্যাডমিন — শুধু পড়া)</h2>
            <dl className="mt-3 grid grid-cols-2 gap-3 font-bengali text-sm">
              {Object.entries(counts).map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-white/80">{STATUS_BN[k as keyof typeof STATUS_BN]}</dt>
                  <dd className="text-xl font-bold">{n(v)}</dd>
                </div>
              ))}
              <div>
                <dt className="text-xs text-white/80">মূল লিংক বাকি</dt>
                <dd className="text-xl font-bold text-signal-orange">{n(evidence.filter((e) => !e.url).length)}</dd>
              </div>
            </dl>
            <p className="mt-3 font-bengali text-xs leading-5 text-white/80">
              রেকর্ড যোগ, সম্পাদনা আর পর্যালোচকের সই — সার্ভার ও অ্যাডমিন ভূমিকা যুক্ত হলে (TODO backend)। মডারেশন কনসোলও তখন।
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
