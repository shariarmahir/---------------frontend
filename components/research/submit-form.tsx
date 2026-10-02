"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/lib/auth/client";
import { buildArticle, draftProblems, FIELDS, KINDS, LEVELS, LIMITS, type Article, type Draft, type DraftProblems, type FieldId, type Level, type ResearchKind } from "@/lib/research/core";
import { updateResearch, useLibrary } from "@/lib/research/store";
import { cn } from "@/lib/utils";
import { articleHref, bn } from "./ui";

const START: Draft["sections"] = [
  { heading: "ভূমিকা", body: "" },
  { heading: "পদ্ধতি", body: "" },
  { heading: "ফলাফল", body: "" },
  { heading: "আলোচনা", body: "" },
];

const field = "w-full rounded-xl border border-card-border bg-white px-3.5 py-2.5 text-[15px] text-text-primary placeholder:text-text-muted focus:border-bd-green focus:ring-2 focus:ring-bd-green/20 focus:outline-none aria-invalid:border-national-crimson";
const label = "mb-1.5 block text-sm font-bold text-text-primary";

function Err({ show, msg }: { show: boolean; msg?: string }) {
  return show && msg ? <span role="alert" className="mt-1 block text-xs font-semibold text-national-crimson">{msg}</span> : null;
}

/** Publish a thesis, paper, innovation or project: it waits for review, then joins the library. */
export function SubmitForm() {
  const router = useRouter();
  const { ready, account } = useAuth();
  const library = useLibrary();
  const pick = useRef<HTMLInputElement>(null);
  const [d, setD] = useState<Draft>({
    title: "", titleEn: "", kind: "", field: "", level: "", authors: "", institution: "", supervisor: "", year: String(new Date().getFullYear()), district: "", summary: "", keywords: "", sections: START, references: "", agree: false,
  });
  const [file, setFile] = useState<Article["file"]>();
  const [tried, setTried] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const thisYear = new Date().getFullYear();
  const p: DraftProblems = draftProblems(d, thisYear);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));

  // Start the author and institution from the account, once it is known.
  if (account && !seeded) {
    setSeeded(true);
    setD((x) => ({ ...x, authors: x.authors || account.name, institution: x.institution || (account.institution ?? "") }));
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.type !== "application/pdf") return toast.error("শুধু পিডিএফ ফাইল দেওয়া যাবে");
    if (f.size > LIMITS.fileBytes) return toast.error("পিডিএফ ১.৫ MB-এর বেশি", { description: "ছোট করে দিন — বা পূর্ণ লেখার লিংক তথ্যসূত্রে দিন।" });
    const reader = new FileReader();
    reader.onload = () => setFile({ name: f.name, size: f.size, url: String(reader.result) });
    reader.onerror = () => toast.error("ফাইলটি পড়া গেল না");
    reader.readAsDataURL(f);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTried(true);
    if (!account) return toast.error("প্রকাশ করতে সাইন ইন করুন");
    if (Object.keys(p).length > 0) {
      toast.error("কয়েকটি ঘর বাকি", { description: Object.values(p)[0] });
      document.querySelector("[aria-invalid=true]")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const article = buildArticle(d, { now: new Date(), taken: new Set(library.map((a) => a.slug)), owner: account.id, ownerName: account.name, file });
    if (!updateResearch((s) => ({ ...s, mine: [article, ...s.mine] }))) return toast.error("এই ব্রাউজারে আর জায়গা নেই", { description: "পিডিএফ ছাড়া আবার চেষ্টা করুন।" });
    toast.success("জমা হলো — পর্যালোচনার অপেক্ষায়", { description: "পর্যালোচনা শেষে সবার জন্য প্রকাশ হবে।" });
    router.push(articleHref(article));
  }

  if (ready && !account) {
    return (
      <div className="rounded-3xl bg-paper p-6 text-text-primary sm:p-8">
        <h2 className="font-wiki text-2xl font-bold">প্রকাশ করতে সাইন ইন করুন</h2>
        <p className="mt-2 text-[15px] text-text-secondary">পড়া সবার জন্য খোলা। প্রকাশ করতে একটি কাণ্ডারী অ্যাকাউন্ট লাগে — যাতে প্রতিটি লেখার পেছনে একজন সত্যিকারের মানুষ থাকেন।</p>
        <Link href="/login?next=/research/submit" className="mt-5 inline-flex h-12 items-center gap-2 rounded-2xl bg-signal-orange px-5 text-sm font-bold text-text-primary"><Icon name="login" className="text-[20px]" /> সাইন ইন</Link>
      </div>
    );
  }

  const show = (k: keyof DraftProblems) => tried && Boolean(p[k]);
  const choice = (on: boolean) => cn("flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold ring-2 transition-colors", on ? "bg-signal-orange/15 text-text-primary ring-signal-orange" : "bg-white text-text-secondary ring-card-border hover:ring-bd-green/50");

  return (
    <form onSubmit={submit} noValidate className="space-y-6 rounded-3xl bg-paper p-5 text-text-primary sm:p-8">
      <fieldset className="space-y-4">
        <legend className="font-wiki mb-2 border-b border-card-border pb-1 text-xl font-bold">১. পরিচয়</legend>
        <label className="block">
          <span className={label}>শিরোনাম *</span>
          <input className={field} value={d.title} maxLength={LIMITS.title[1]} onChange={(e) => set("title", e.target.value)} placeholder="যেমন: স্মার্টফোনে আর্সেনিক মাপার সহজ কিট" aria-invalid={show("title")} />
          <Err show={show("title")} msg={p.title} />
        </label>
        <label className="block">
          <span className={label}>ইংরেজি শিরোনাম (ঐচ্ছিক)</span>
          <input lang="en" className={field} value={d.titleEn} maxLength={LIMITS.title[1]} onChange={(e) => set("titleEn", e.target.value)} placeholder="A low-cost smartphone arsenic test" />
        </label>
        <div>
          <span className={label}>ধরন *</span>
          <div role="radiogroup" aria-invalid={show("kind")} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(Object.keys(KINDS) as ResearchKind[]).map((k) => (
              <label key={k} className={choice(d.kind === k)}>
                <input type="radio" name="kind" className="sr-only" checked={d.kind === k} onChange={() => set("kind", k)} />
                <Icon name={KINDS[k].icon} className="text-[18px] text-bd-green" /> {KINDS[k].bn}
              </label>
            ))}
          </div>
          <Err show={show("kind")} msg={p.kind} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={label}>বিষয়ক্ষেত্র *</span>
            <select className={field} value={d.field} onChange={(e) => set("field", e.target.value as FieldId)} aria-invalid={show("field")}>
              <option value="">বাছুন</option>
              {(Object.keys(FIELDS) as FieldId[]).map((f) => <option key={f} value={f}>{FIELDS[f].bn}</option>)}
            </select>
            <Err show={show("field")} msg={p.field} />
          </label>
          <label className="block">
            <span className={label}>পর্যায় *</span>
            <select className={field} value={d.level} onChange={(e) => set("level", e.target.value as Level)} aria-invalid={show("level")}>
              <option value="">বাছুন</option>
              {(Object.keys(LEVELS) as Level[]).map((l) => <option key={l} value={l}>{LEVELS[l]}</option>)}
            </select>
            <Err show={show("level")} msg={p.level} />
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-wiki mb-2 border-b border-card-border pb-1 text-xl font-bold">২. কারা, কোথায়</legend>
        <label className="block">
          <span className={label}>লেখক * <span className="font-normal text-text-muted">(কমা দিয়ে আলাদা করুন, সর্বোচ্চ ৮ জন)</span></span>
          <input className={field} value={d.authors} onChange={(e) => set("authors", e.target.value)} aria-invalid={show("authors")} />
          <Err show={show("authors")} msg={p.authors} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={label}>প্রতিষ্ঠান ও বিভাগ *</span>
            <input className={field} value={d.institution} onChange={(e) => set("institution", e.target.value)} placeholder="বিশ্ববিদ্যালয়, কলেজ বা স্কুল" aria-invalid={show("institution")} />
            <Err show={show("institution")} msg={p.institution} />
          </label>
          <label className="block">
            <span className={label}>তত্ত্বাবধায়ক</span>
            <input className={field} value={d.supervisor} onChange={(e) => set("supervisor", e.target.value)} placeholder="শিক্ষকের নাম ও পদ" />
          </label>
          <label className="block">
            <span className={label}>সাল *</span>
            <input className={field} inputMode="numeric" value={d.year} onChange={(e) => set("year", e.target.value)} aria-invalid={show("year")} />
            <Err show={show("year")} msg={p.year} />
          </label>
          <label className="block">
            <span className={label}>জেলা (যেখানে কাজ হয়েছে)</span>
            <input className={field} value={d.district} onChange={(e) => set("district", e.target.value)} />
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-wiki mb-2 border-b border-card-border pb-1 text-xl font-bold">৩. লেখা</legend>
        <label className="block">
          <span className={label}>সারসংক্ষেপ * <span className="font-normal text-text-muted">— কী প্রশ্ন, কীভাবে, কী পেলেন ({bn(d.summary.trim().length)}/{bn(LIMITS.summary[1])})</span></span>
          <textarea rows={4} className={field} value={d.summary} maxLength={LIMITS.summary[1] + 50} onChange={(e) => set("summary", e.target.value)} aria-invalid={show("summary")} />
          <Err show={show("summary")} msg={p.summary} />
        </label>
        <div className="space-y-3" aria-invalid={show("sections")}>
          <p className={label}>অংশগুলো * <span className="font-normal text-text-muted">— তথ্যসূত্রের নম্বর লেখায় বন্ধনীতে দিন: [১], [২]</span></p>
          {d.sections.map((s, i) => (
            <div key={i} className="rounded-2xl border border-card-border bg-white p-3">
              <div className="flex items-center gap-2">
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-text-primary text-xs font-bold text-signal-orange">{bn(i + 1)}</span>
                <input aria-label={`অংশ ${i + 1}-এর শিরোনাম`} className={cn(field, "font-wiki py-2 font-bold")} value={s.heading} maxLength={LIMITS.heading[1]} onChange={(e) => set("sections", d.sections.map((x, j) => (j === i ? { ...x, heading: e.target.value } : x)))} placeholder="অংশের শিরোনাম" />
                {d.sections.length > 2 && (
                  <button type="button" onClick={() => set("sections", d.sections.filter((_, j) => j !== i))} className="grid size-10 shrink-0 place-items-center rounded-xl text-text-muted hover:bg-mint-subtle hover:text-national-crimson" aria-label={`অংশ ${i + 1} সরান`}>
                    <Icon name="delete" className="text-[20px]" />
                  </button>
                )}
              </div>
              <textarea aria-label={`অংশ ${i + 1}-এর লেখা`} rows={4} className={cn(field, "mt-2")} value={s.body} maxLength={LIMITS.body[1] + 100} onChange={(e) => set("sections", d.sections.map((x, j) => (j === i ? { ...x, body: e.target.value } : x)))} placeholder="এক লাইন ফাঁকা রেখে নতুন অনুচ্ছেদ" />
            </div>
          ))}
          {d.sections.length < LIMITS.sections[1] && (
            <button type="button" onClick={() => set("sections", [...d.sections, { heading: "", body: "" }])} className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-white px-4 text-sm font-bold text-bd-green ring-1 ring-card-border hover:ring-bd-green">
              <Icon name="add" className="text-[18px]" /> আরেকটি অংশ
            </button>
          )}
          <Err show={show("sections")} msg={p.sections} />
        </div>
        <label className="block">
          <span className={label}>তথ্যসূত্র <span className="font-normal text-text-muted">— প্রতি লাইনে একটি; লিংক থাকলে সাথে দিন</span></span>
          <textarea rows={4} className={cn(field, "font-mono text-sm")} value={d.references} onChange={(e) => set("references", e.target.value)} placeholder={"বাংলাদেশ পরিসংখ্যান ব্যুরো, জনশুমারি ২০২২ https://bbs.gov.bd\nলেখক (সাল)। শিরোনাম। জার্নাল।"} aria-invalid={show("references")} />
          <Err show={show("references")} msg={p.references} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={label}>মূলশব্দ <span className="font-normal text-text-muted">(কমা দিয়ে, সর্বোচ্চ ৮টি)</span></span>
            <input className={field} value={d.keywords} onChange={(e) => set("keywords", e.target.value)} placeholder="পানি, আর্সেনিক, স্বাস্থ্য" aria-invalid={show("keywords")} />
            <Err show={show("keywords")} msg={p.keywords} />
          </label>
          <div>
            <span className={label}>পূর্ণ লেখা (পিডিএফ, ঐচ্ছিক)</span>
            {file ? (
              <p className="flex items-center gap-2 rounded-xl border border-card-border bg-white px-3 py-2.5 text-sm">
                <Icon name="picture_as_pdf" className="text-[20px] text-bd-green" /> <span className="min-w-0 flex-1 truncate">{file.name}</span>
                <button type="button" onClick={() => setFile(undefined)} className="text-xs font-bold text-text-muted hover:text-text-primary">সরান</button>
              </p>
            ) : (
              <button type="button" onClick={() => pick.current?.click()} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-card-border bg-white text-sm font-bold text-bd-green hover:border-bd-green">
                <Icon name="upload_file" className="text-[20px]" /> পিডিএফ বাছুন (১.৫ MB পর্যন্ত)
              </button>
            )}
            <input ref={pick} type="file" accept="application/pdf" className="sr-only" tabIndex={-1} onChange={onFile} />
          </div>
        </div>
      </fieldset>

      <div className="space-y-4 border-t border-card-border pt-5">
        <label className={cn("flex cursor-pointer items-start gap-3 rounded-2xl p-3 ring-2", show("agree") ? "ring-national-crimson" : "ring-card-border")}>
          <input type="checkbox" checked={d.agree} onChange={(e) => set("agree", e.target.checked)} className="mt-1 size-4 accent-bd-green" aria-invalid={show("agree")} />
          <span className="text-sm leading-relaxed text-text-secondary">আমি নিশ্চিত করছি, কাজটি আমার (বা সহলেখকেরা প্রকাশে রাজি), তথ্য বানানো নয়, অন্যের লেখা বা ছবি সূত্র ছাড়া নেওয়া হয়নি, আর অংশগ্রহণকারীদের ব্যক্তিগত তথ্য প্রকাশ করা হয়নি।</span>
        </label>
        <Err show={show("agree")} msg={p.agree} />
        <button type="submit" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-signal-orange px-6 text-base font-bold text-text-primary shadow-tile transition-[translate] duration-200 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 sm:w-auto">
          <Icon name="send" className="text-[20px]" /> পর্যালোচনার জন্য জমা দিন
        </button>
        <p className="text-xs text-text-muted">এখন জমা দেওয়া লেখা এই ব্রাউজারে রাখা হয় আর শুধু আপনি দেখতে পান। কাণ্ডারী-ল্যাবের সার্ভার চালু হলে পর্যালোচনার পর তা সবার জন্য প্রকাশ হবে।</p>
      </div>
    </form>
  );
}
