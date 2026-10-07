"use client";

import { useState } from "react";
import { CheckCircle2, FilePenLine, Plus, Sparkles, Trash2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { scorePaper, type Paper, type Question } from "@/lib/media/classroom";
import { newId } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { Panel } from "../ui/layout";
import { Num } from "../ui/numerals";
import type { ClassTab } from "./room";
import { editClassroom, nameOf, withAssess } from "./use-classroom";

const LETTERS = ["ক", "খ", "গ", "ঘ"];

export const PapersTab: ClassTab = ({ room, me, member, leader }) => {
  const [taking, setTaking] = useState<string | null>(null);
  const [building, setBuilding] = useState(false);
  const paper = room.papers.find((p) => p.id === taking);

  if (paper && me) return <TakePaper paper={paper} onDone={(score) => {
    editClassroom(room.id, (r) => withAssess({ ...r, papers: r.papers.map((p) => (p.id === paper.id ? { ...p, scores: { ...p.scores, [me.id]: Math.max(score, p.scores[me.id] ?? 0) } } : p)) }, me.id));
  }} onClose={() => setTaking(null)} />;

  if (building && me) return <BuildPaper leader={leader} onCancel={() => setBuilding(false)} onSave={(p) => {
    editClassroom(room.id, (r) => ({ ...r, papers: [{ ...p, by: me.id }, ...r.papers.map((x) => (p.daily ? { ...x, daily: undefined } : x))] }));
    setBuilding(false);
    toast.success("প্রশ্নপত্র তৈরি হলো", { description: "নিজে দিয়ে দেখুন, ক্লাসও দিতে পারবে।" });
  }} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-m-blue-soft p-5 text-m-ink">
        <p>
          <span className="flex items-center gap-2 text-lg font-bold"><FilePenLine className="size-5 text-m-blue" aria-hidden /> নিজের প্রশ্নপত্র বানান</span>
          <span className="text-sm text-m-ink/80">বই, বিসিএস বা যেকোনো টপিক থেকে — নিজেই উত্তর ঠিক করুন, নিজেই যাচাই করুন।</span>
        </p>
        {member && <button type="button" onClick={() => setBuilding(true)} className={mediaButton({ variant: "primary" })}><Plus aria-hidden /> নতুন প্রশ্নপত্র</button>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {room.papers.map((p) => {
          const mine = me ? p.scores[me.id] : undefined;
          return (
            <article key={p.id} className="story-reveal flex flex-col gap-3 rounded-2xl bg-m-card p-5 ring-1 ring-m-ink/10 transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_44px_-26px_var(--color-signal-orange)] shadow-m-tile">
              <div className="flex items-center gap-2 text-xs font-bold">
                {p.daily && <span className="inline-flex items-center gap-1 rounded-full bg-m-yellow px-2.5 py-0.5 text-m-ink"><Sparkles className="size-3.5" aria-hidden /> আজকের মূল্যায়ন</span>}
                <span className="ml-auto font-medium text-m-ink/55">{nameOf(room, p.by)}</span>
              </div>
              <h3 className="text-lg font-bold text-m-ink">{p.title}</h3>
              <p className="text-sm text-m-ink/70"><Num value={p.questions.length} />টি প্রশ্ন · <Num value={Object.keys(p.scores).length} /> জন দিয়েছে</p>
              <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                {mine !== undefined ? <span className="text-sm font-bold text-m-blue">আপনার সেরা: <Num value={mine} />%</span> : <span className="text-sm text-m-ink/60">এখনো দেননি</span>}
                {member && <button type="button" onClick={() => setTaking(p.id)} className={mediaButton({ variant: mine === undefined ? "primary" : "outline", size: "sm" })}>{mine === undefined ? "পরীক্ষা দিন" : "আবার দিন"}</button>}
              </div>
            </article>
          );
        })}
      </div>
      {!member && <p className="text-sm text-m-ink/70">প্রশ্নপত্র দিতে বা বানাতে আগে ক্লাসে যোগ দিন।</p>}
    </div>
  );
};

function TakePaper({ paper, onDone, onClose }: { paper: Paper; onDone: (score: number) => void; onClose: () => void }) {
  const [picks, setPicks] = useState<(number | undefined)[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const answered = picks.filter((p) => p !== undefined).length;

  return (
    <Panel title={paper.title} action={<button type="button" onClick={onClose} className={mediaButton({ variant: "ghost", size: "sm" })}>ফিরে যান</button>}>
      {score !== null && (
        <div className={cn("live-in mb-5 rounded-2xl p-5 text-center", score >= 80 ? "bg-m-yellow text-m-ink" : score >= 50 ? "bg-m-blue-soft text-m-ink" : "bg-m-red-soft text-m-ink")}>
          <p className="text-5xl font-bold"><Num value={score} />%</p>
          <p className="mt-1 font-semibold">{score >= 80 ? "দারুণ! ক্লাসকে সাহায্য করুন।" : score >= 50 ? "ভালো — ভুলগুলো আরেকবার দেখুন।" : "চিন্তা নেই — র‍্যাংকিং ট্যাবে একজন বাডি পাবেন।"}</p>
        </div>
      )}
      <ol className="space-y-5">
        {paper.questions.map((q, i) => (
          <li key={i}>
            <p className="mb-2 font-semibold text-m-ink"><Num value={i + 1} />. {q.q}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {q.options.map((o, k) => {
                const picked = picks[i] === k;
                const reveal = score !== null && (k === q.answer || picked);
                return (
                  <button
                    key={k}
                    type="button"
                    disabled={score !== null}
                    onClick={() => setPicks((p) => Object.assign([...p], { [i]: k }))}
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold ring-1 transition-[background-color,scale,color] duration-150 enabled:active:scale-[0.98]",
                      reveal && k === q.answer ? "bg-m-blue-soft text-m-ink ring-m-blue" : reveal ? "bg-m-red text-m-on ring-m-red" : picked ? "bg-m-yellow text-m-ink ring-m-blue" : "text-m-ink ring-m-ink/13 enabled:hover:bg-m-ink/3",
                    )}
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-white/45 text-xs">{LETTERS[k]}</span>
                    <span className="flex-1">{o}</span>
                    {reveal && (k === q.answer ? <CheckCircle2 className="size-4.5" aria-label="সঠিক" /> : <XCircle className="size-4.5" aria-label="ভুল" />)}
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ol>
      {score === null && (
        <button
          type="button"
          disabled={answered < paper.questions.length}
          onClick={() => {
            const s = scorePaper(paper.questions, picks);
            setScore(s);
            onDone(s);
          }}
          className={mediaButton({ variant: "primary", size: "lg", className: "mt-6 w-full" })}
        >
          জমা দিন ({<Num value={answered} />}/{<Num value={paper.questions.length} />})
        </button>
      )}
    </Panel>
  );
}

const blank = (): Question => ({ q: "", options: ["", "", "", ""], answer: 0 });

function BuildPaper({ leader, onSave, onCancel }: { leader: boolean; onSave: (p: Paper) => void; onCancel: () => void }) {
  const [title, setTitle] = useState("");
  const [qs, setQs] = useState<Question[]>([blank()]);
  const [daily, setDaily] = useState(false);
  const ready = title.trim().length >= 3 && qs.every((q) => q.q.trim() && q.options.every((o) => o.trim()));
  const set = (i: number, patch: Partial<Question>) => setQs((all) => all.map((q, k) => (k === i ? { ...q, ...patch } : q)));

  return (
    <Panel title="নিজের প্রশ্নপত্র" action={<button type="button" onClick={onCancel} className={mediaButton({ variant: "ghost", size: "sm" })}>বাতিল</button>}>
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="প্রশ্নপত্রের নাম — যেমন: অধ্যায় ৯ মডেল টেস্ট" aria-label="প্রশ্নপত্রের নাম" />
      <ol className="mt-5 space-y-4">
        {qs.map((q, i) => (
          <li key={i} className="live-in rounded-2xl bg-white/65 p-4 ring-1 ring-m-ink/9">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-sm font-bold text-m-blue">প্রশ্ন <Num value={i + 1} /></span>
              {qs.length > 1 && (
                <button type="button" onClick={() => setQs((all) => all.filter((_, k) => k !== i))} className={mediaButton({ variant: "ghost", size: "icon-sm", className: "ml-auto" })} aria-label="প্রশ্ন মুছুন">
                  <Trash2 aria-hidden />
                </button>
              )}
            </div>
            <Input value={q.q} onChange={(e) => set(i, { q: e.target.value })} placeholder="প্রশ্ন লিখুন" aria-label={`প্রশ্ন ${i + 1}`} />
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {q.options.map((o, k) => (
                <label key={k} className="flex items-center gap-2">
                  <input type="radio" name={`ans-${i}`} checked={q.answer === k} onChange={() => set(i, { answer: k })} className="size-4 shrink-0 accent-m-blue" aria-label={`সঠিক উত্তর ${LETTERS[k]}`} />
                  <Input value={o} onChange={(e) => set(i, { options: q.options.map((x, j) => (j === k ? e.target.value : x)) })} placeholder={`বিকল্প ${LETTERS[k]}`} />
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-m-ink/60">বাম পাশের গোল বোতামে সঠিক উত্তর বেছে দিন।</p>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => setQs((all) => [...all, blank()])} className={mediaButton({ variant: "quiet" })}><Plus aria-hidden /> আরেকটি প্রশ্ন</button>
        {leader && (
          <label className="flex items-center gap-2 text-sm text-m-ink/80">
            <input type="checkbox" checked={daily} onChange={(e) => setDaily(e.target.checked)} className="size-4 accent-m-blue" /> আজকের মূল্যায়ন হিসেবে দিন
          </label>
        )}
        <button type="button" disabled={!ready} onClick={() => onSave({ id: newId("q"), title: title.trim(), by: "", questions: qs, scores: {}, daily: daily || undefined })} className={mediaButton({ variant: "primary", className: "ml-auto" })}>
          সেভ করুন
        </button>
      </div>
    </Panel>
  );
}
