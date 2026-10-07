"use client";

import { ArrowLeft, Printer } from "lucide-react";
import { FILE_KINDS, SECTIONS, chosenTopic, type ResearchProject } from "@/lib/media/research-project";
import { mediaButton } from "../ui/button-styles";
import { DateText } from "../ui/numerals";
import { roomClock } from "./use-research";

/** The research laid out as a paper: white page, plain type, ready to print or save as PDF. */
export function ResearchPaper({ p, onBack }: { p: ResearchProject; onBack: () => void }) {
  const topic = chosenTopic(p);
  const date = roomClock(p.from).toISOString();
  const [question, ...rest] = SECTIONS;
  const order = [rest[0], question, ...rest.slice(1)];

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <button type="button" onClick={onBack} className="inline-flex min-h-8 items-center gap-1.5 text-sm font-semibold text-m-blue"><ArrowLeft className="size-4" aria-hidden /> গবেষণায় ফিরুন</button>
        <button type="button" onClick={() => window.print()} className={mediaButton({ variant: "primary" })}><Printer aria-hidden /> প্রিন্ট বা পিডিএফ</button>
      </div>
      <article className="rounded-2xl bg-m-canvas px-6 py-10 font-sans text-m-ink shadow-m-lift ring-1 ring-m-ink/8 sm:px-14 print:rounded-none print:px-0 print:py-0 print:shadow-none">
        <header className="border-b-2 border-m-blue pb-6 text-center">
          <p className="text-xs font-bold tracking-widest text-m-blue uppercase">গবেষণাপত্র · {p.from.kind === "lab" ? "ল্যাব" : "ক্লাসরুম"}</p>
          <h1 className="mt-3 text-2xl leading-snug font-bold text-balance sm:text-3xl">{topic?.title}</h1>
          <p className="mt-3 text-sm">{p.members.map((m) => m.name).join(", ")}</p>
          <p className="mt-1 text-sm text-m-ink/70">{p.from.name} · <DateText iso={date} /></p>
        </header>
        {p.write.result && (
          <section className="mt-6 rounded-lg bg-m-blue/5 p-4">
            <h2 className="text-sm font-bold text-m-blue">সারসংক্ষেপ</h2>
            <p className="mt-1 text-[15px] leading-relaxed">{p.write.question} {p.write.result}</p>
          </section>
        )}
        {order.map((s, i) => (
          <section key={s.key} className="mt-6">
            <h2 className="text-lg font-bold">{i + 1}. {s.key === "background" ? "ভূমিকা ও পটভূমি" : s.bn}</h2>
            <p className="mt-2 text-[15px] leading-relaxed whitespace-pre-line">{p.write[s.key]}</p>
          </section>
        ))}
        <section className="mt-6">
          <h2 className="text-lg font-bold">{order.length + 1}. কাজের সময়রেখা</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {[...p.milestones].sort((a, b) => a.date.localeCompare(b.date)).map((m) => (
              <li key={m.id} className="flex justify-between gap-4 border-b border-m-ink/10 py-1"><span>{m.title}</span><span className="text-m-ink/70"><DateText iso={m.date} />{m.done ? " ✓" : ""}</span></li>
            ))}
          </ul>
        </section>
        {p.files.length > 0 && (
          <section className="mt-6">
            <h2 className="text-lg font-bold">{order.length + 2}. সংযুক্তি ও ডেটা</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {p.files.map((f) => <li key={f.id}>{FILE_KINDS[f.kind]}: {f.url ? <a href={f.url} className="break-all text-m-blue underline">{f.url}</a> : f.name}</li>)}
            </ul>
          </section>
        )}
        <footer className="mt-10 border-t border-m-ink/15 pt-4 text-center text-xs text-m-ink/60">শিক্ষিতদের মিডিয়া · গবেষণা কর্মশালায় দল মিলে তৈরি</footer>
      </article>
    </div>
  );
}
