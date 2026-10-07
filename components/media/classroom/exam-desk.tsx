"use client";

import { useState } from "react";
import { CheckCircle2, Eye, EyeOff, FilePenLine, GraduationCap, ListOrdered, Plus, Trash2, Trophy, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PixelMark } from "@/components/ui/section-kit";
import { Textarea } from "@/components/ui/textarea";
import { QUESTION_KINDS, canSeePaper, mcqTotal, questionProblem, scoreMcq, totalMarks, type ExamPaper, type ExamQuestion, type QuestionKind } from "@/lib/media/exam-paper";
import { daysUntil } from "@/lib/media/lab";
import { newId } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { choiceClass, selectClass, toNumber } from "../ui/field-styles";
import { DateText, Num, useFormat } from "../ui/numerals";

export interface DeskExam {
  id: string;
  title: string;
  date: string;
  time?: string;
  kind: string;
  syllabus?: string;
  paper?: ExamPaper;
}

const LETTERS = ["ক", "খ", "গ", "ঘ"];
const at = (date: string, time?: string) => `${date}T${time && /^\d{2}:\d{2}$/.test(time) ? time : "00:00"}:00+06:00`;

export function ExamDesk({ exams, kinds, now, meId, member, manager, teacher, teacherName, name, onAdd, onPaper }: {
  exams: DeskExam[];
  kinds: Record<string, string>;
  now: Date;
  meId?: string;
  member: boolean;
  /** Leader or teacher: may add exam dates. */
  manager: boolean;
  /** Only the teacher writes and releases papers. */
  teacher: boolean;
  teacherName?: string;
  name: (id: string) => string;
  onAdd: (e: Omit<DeskExam, "id">) => boolean;
  onPaper: (id: string, paper: ExamPaper) => boolean;
}) {
  const [adding, setAdding] = useState(false);
  const [building, setBuilding] = useState<string | null>(null);
  const [viewing, setViewing] = useState<string | null>(null);
  const sorted = [...exams].sort((a, b) => a.date.localeCompare(b.date));
  const built = exams.find((e) => e.id === building);
  const viewed = exams.find((e) => e.id === viewing);

  return (
    <section aria-labelledby="desk-title" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="desk-title" className="text-xl font-bold text-m-ink">পরীক্ষা ও প্রশ্নপত্র</h2>
          <p className="text-sm text-m-ink/65">
            {teacher ? "আপনি শিক্ষক — প্রশ্ন বানান, সময় হলে প্রকাশ করুন, বহুনির্বাচনির ফল এখানেই দেখুন।" : `প্রশ্নপত্র বানান শিক্ষক${teacherName ? ` (${teacherName})` : ""}; প্রকাশ হলে এখানে আসবে।`}
          </p>
        </div>
        {manager && (
          <button type="button" onClick={() => setAdding(true)} className={mediaButton({ variant: teacher ? "primary" : "outline" })}>
            <Plus aria-hidden /> পরীক্ষা যোগ করুন
          </button>
        )}
      </div>

      {sorted.length === 0 ? (
        <p className="rounded-2xl bg-m-card p-5 text-sm text-m-ink/65 ring-1 ring-m-ink/10 shadow-m-tile">কোনো পরীক্ষার তারিখ এখনো দেওয়া হয়নি।</p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {sorted.map((x) => {
            const days = daysUntil(x.date, now);
            const p = x.paper;
            const seen = canSeePaper(p, teacher);
            const mine = meId ? p?.mcq?.[meId] : undefined;
            return (
              <li key={x.id} className={cn("story-reveal flex flex-col gap-3 rounded-2xl p-4 ring-1", days >= 0 && days <= 7 ? "bg-m-yellow text-m-ink ring-m-blue" : "bg-m-card text-m-ink ring-m-ink/10", days < 0 && "opacity-70")}>
                <div className="flex items-start gap-4">
                  <span className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl bg-white/45 text-center leading-none">
                    <span className="text-lg font-bold">{days < 0 ? "✓" : <Num value={days} />}</span>
                    {days >= 0 && <span className="mt-0.5 text-[10px] font-semibold">দিন</span>}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold">{x.title}</span>
                    <span className="block text-xs opacity-80">{kinds[x.kind] ?? x.kind} · <DateText iso={at(x.date, x.time)} time={Boolean(x.time)} weekday /></span>
                    {x.syllabus && <span className="block text-xs opacity-80">সিলেবাস: {x.syllabus}</span>}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                  {!p ? (
                    <span className="rounded-full bg-white/45 px-2.5 py-1">প্রশ্নপত্র তৈরি হয়নি</span>
                  ) : (
                    <>
                      <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1", p.released ? "bg-m-blue-soft text-m-ink" : "bg-white/50")}>
                        {p.released ? <Eye className="size-3.5" aria-hidden /> : <EyeOff className="size-3.5" aria-hidden />} {p.released ? "প্রকাশিত" : "গোপন"}
                      </span>
                      <span className="rounded-full bg-white/45 px-2.5 py-1"><Num value={p.questions.length} />টি প্রশ্ন · <Num value={totalMarks(p.questions)} /> নম্বর{p.duration ? <> · <Num value={p.duration} /> মিনিট</> : null}</span>
                    </>
                  )}
                  {mine !== undefined && p && <span className="rounded-full bg-m-card px-2.5 py-1 text-m-blue">আমার বহুনির্বাচনি: <Num value={mine} />/<Num value={mcqTotal(p.questions)} /></span>}
                </div>
                <div className="mt-auto flex flex-wrap gap-2">
                  {teacher && (
                    <>
                      <button type="button" onClick={() => setBuilding(x.id)} className={mediaButton({ variant: "tile", size: "sm" })}><FilePenLine aria-hidden /> {p ? "প্রশ্ন সাজান" : "প্রশ্ন বানান"}</button>
                      {p && (
                        <button
                          type="button"
                          onClick={() => onPaper(x.id, { ...p, released: !p.released }) && toast.success(p.released ? "প্রশ্নপত্র আবার গোপন" : "প্রশ্নপত্র প্রকাশ হলো", { description: p.released ? "শিক্ষার্থীরা আর দেখবে না।" : "এখন সবাই দেখবে ও বহুনির্বাচনি দিতে পারবে।" })}
                          className={mediaButton({ variant: "quiet", size: "sm" })}
                        >
                          {p.released ? <EyeOff aria-hidden /> : <Eye aria-hidden />} {p.released ? "লুকান" : "প্রকাশ করুন"}
                        </button>
                      )}
                    </>
                  )}
                  {seen && (
                    <button type="button" onClick={() => setViewing(x.id)} className={mediaButton({ variant: teacher ? "quiet" : "primary", size: "sm" })}>
                      {teacher ? <><Trophy aria-hidden /> প্রশ্ন ও ফল</> : <><ListOrdered aria-hidden /> {mine === undefined && member ? "প্রশ্নপত্র ও পরীক্ষা" : "প্রশ্নপত্র দেখুন"}</>}
                    </button>
                  )}
                  {!teacher && p && !p.released && <span className="text-xs opacity-75">শিক্ষক প্রকাশ করলে প্রশ্ন দেখা যাবে।</span>}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {manager && <AddExam open={adding} onOpenChange={setAdding} kinds={kinds} onAdd={onAdd} />}
      {teacher && built && <PaperBuilder key={built.id} exam={built} onClose={() => setBuilding(null)} onSave={(paper) => onPaper(built.id, paper)} />}
      {viewed?.paper && (
        <PaperView
          key={viewed.id}
          exam={viewed}
          paper={viewed.paper}
          teacher={teacher}
          canTake={member && !teacher && Boolean(meId)}
          name={name}
          onClose={() => setViewing(null)}
          onScore={(score) => meId && onPaper(viewed.id, { ...viewed.paper!, mcq: { ...viewed.paper!.mcq, [meId]: score } })}
        />
      )}
    </section>
  );
}

const label = "mb-1.5 block text-sm font-semibold text-m-ink";

function AddExam({ open, onOpenChange, kinds, onAdd }: { open: boolean; onOpenChange: (o: boolean) => void; kinds: Record<string, string>; onAdd: (e: Omit<DeskExam, "id">) => boolean }) {
  const first = Object.keys(kinds)[0];
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState(first);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [syllabus, setSyllabus] = useState("");
  const [tried, setTried] = useState(false);
  const ok = title.trim().length >= 3 && Boolean(date);
  return (
    <Dialog open={open} onOpenChange={(o) => { if (o) { setTitle(""); setKind(first); setDate(""); setSyllabus(""); setTried(false); } onOpenChange(o); }}>
      <DialogContent className="rounded-3xl font-sans sm:max-w-lg">
        <DialogHeader>
          <PixelMark tone="dark" />
          <DialogTitle className="text-xl font-bold text-m-ink">পরীক্ষা যোগ করুন</DialogTitle>
          <DialogDescription>তারিখ দিলে সবার কাউন্টডাউন শুরু; প্রশ্নপত্র শিক্ষক পরে বানাবেন।</DialogDescription>
        </DialogHeader>
        <form
          noValidate
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setTried(true);
            if (!ok) return;
            if (onAdd({ title: title.trim(), kind, date, time: time || undefined, syllabus: syllabus.trim() || undefined })) {
              toast.success("পরীক্ষা যোগ হলো");
              onOpenChange(false);
            }
          }}
        >
          <label className="block">
            <span className={label}>নাম *</span>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="যেমন: অর্ধবার্ষিক গণিত" aria-invalid={tried && title.trim().length < 3} />
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(kinds).map(([k, bn]) => (
              <label key={k} className={choiceClass(kind === k)}>
                <input type="radio" name="exam-kind" className="sr-only" checked={kind === k} onChange={() => setKind(k)} />
                {bn}
              </label>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block"><span className={label}>তারিখ *</span><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-invalid={tried && !date} /></label>
            <label className="block"><span className={label}>সময়</span><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></label>
          </div>
          <label className="block"><span className={label}>সিলেবাস</span><Input value={syllabus} onChange={(e) => setSyllabus(e.target.value)} placeholder="যেমন: অধ্যায় ৯–১১" /></label>
          {tried && !ok && <p className="text-xs font-semibold text-m-red">নাম আর তারিখ দিন।</p>}
          <button type="submit" className={mediaButton({ variant: "primary", size: "lg", className: "w-full" })}>যোগ করুন</button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const blank = (kind: QuestionKind): ExamQuestion => ({ id: newId("q"), kind, q: "", marks: kind === "mcq" ? 1 : kind === "short" ? 2 : 5, ...(kind === "mcq" ? { options: ["", "", "", ""] } : {}) });

/** The teacher writes the paper: questions of three kinds, marks, time, and whether students may see it. */
function PaperBuilder({ exam, onClose, onSave }: { exam: DeskExam; onClose: () => void; onSave: (p: ExamPaper) => boolean }) {
  const [qs, setQs] = useState<ExamQuestion[]>(exam.paper?.questions ?? [blank("mcq")]);
  const [duration, setDuration] = useState(exam.paper?.duration ?? 30);
  const [instructions, setInstructions] = useState(exam.paper?.instructions ?? "");
  const [released, setReleased] = useState(Boolean(exam.paper?.released));
  const [tried, setTried] = useState(false);
  const { num } = useFormat();
  const set = (id: string, patch: Partial<ExamQuestion>) => setQs((all) => all.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  const bad = qs.map(questionProblem);

  function save() {
    setTried(true);
    if (qs.length === 0 || bad.some(Boolean)) return;
    const paper: ExamPaper = { ...exam.paper, questions: qs.map((q) => ({ ...q, q: q.q.trim(), options: q.options?.map((o) => o.trim()) })), duration: duration || undefined, instructions: instructions.trim() || undefined, released };
    if (onSave(paper)) {
      toast.success("প্রশ্নপত্র সংরক্ষণ হলো", { description: released ? "প্রকাশিত — শিক্ষার্থীরা দেখছে।" : "গোপন আছে — সময় হলে প্রকাশ করুন।" });
      onClose();
    } else toast.error("এই ব্রাউজারে আর জায়গা নেই");
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[94dvh] overflow-y-auto rounded-3xl font-sans sm:max-w-2xl">
        <DialogHeader>
          <PixelMark tone="dark" />
          <DialogTitle className="text-xl font-bold text-m-ink">প্রশ্নপত্র — {exam.title}</DialogTitle>
          <DialogDescription>
            মোট <Num value={totalMarks(qs)} /> নম্বর · বহুনির্বাচনি <Num value={mcqTotal(qs)} /> নম্বর (এখানেই মূল্যায়ন), বাকিটা খাতায়।
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-[8rem_minmax(0,1fr)]">
          <label className="block"><span className={label}>সময় (মিনিট)</span><Input inputMode="numeric" value={duration ? num(duration) : ""} onChange={(e) => setDuration(toNumber(e.target.value))} /></label>
          <label className="block"><span className={label}>নির্দেশনা</span><Input value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="যেমন: সব প্রশ্নের উত্তর দিতে হবে" /></label>
        </div>
        <ol className="space-y-3">
          {qs.map((q, i) => (
            <li key={q.id} className={cn("space-y-3 rounded-2xl bg-m-ink/3 p-3 ring-1", tried && bad[i] ? "ring-m-red" : "ring-m-ink/9")}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-m-yellow text-xs font-bold text-m-ink"><Num value={i + 1} /></span>
                <select value={q.kind} onChange={(e) => { const k = e.target.value as QuestionKind; set(q.id, { kind: k, options: k === "mcq" ? q.options ?? ["", "", "", ""] : undefined, answer: k === "mcq" ? q.answer : undefined }); }} className={cn(selectClass, "h-9 w-auto")} aria-label="প্রশ্নের ধরন">
                  {(Object.keys(QUESTION_KINDS) as QuestionKind[]).map((k) => <option key={k} value={k}>{QUESTION_KINDS[k]}</option>)}
                </select>
                <label className="flex items-center gap-1.5 text-sm text-m-ink/80">
                  নম্বর
                  <Input inputMode="numeric" value={q.marks ? num(q.marks) : ""} onChange={(e) => set(q.id, { marks: toNumber(e.target.value) })} className="h-9 w-16" aria-label="নম্বর" />
                </label>
                <button type="button" onClick={() => setQs((all) => all.filter((x) => x.id !== q.id))} className={mediaButton({ variant: "ghost", size: "icon-sm", className: "ml-auto" })} aria-label="প্রশ্ন মুছুন"><Trash2 aria-hidden /></button>
              </div>
              <Textarea rows={2} value={q.q} onChange={(e) => set(q.id, { q: e.target.value })} placeholder="প্রশ্ন লিখুন" aria-label="প্রশ্ন" />
              {q.kind === "mcq" && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {(q.options ?? []).map((o, k) => (
                    <label key={k} className={cn("flex items-center gap-2 rounded-xl px-2 py-1 ring-1", q.answer === k ? "bg-m-blue/15 ring-m-blue" : "ring-m-ink/9")}>
                      <input type="radio" name={`ans-${q.id}`} checked={q.answer === k} onChange={() => set(q.id, { answer: k })} className="size-4 accent-m-blue" aria-label={`${LETTERS[k]} সঠিক উত্তর`} />
                      <span className="text-sm font-bold text-m-ink/80">{LETTERS[k]}</span>
                      <Input value={o} onChange={(e) => set(q.id, { options: q.options!.map((x, j) => (j === k ? e.target.value : x)) })} className="h-9 border-0 bg-transparent" aria-label={`অপশন ${LETTERS[k]}`} />
                    </label>
                  ))}
                </div>
              )}
              {tried && bad[i] && <p className="text-xs font-semibold text-m-red">{bad[i]}</p>}
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(QUESTION_KINDS) as QuestionKind[]).map((k) => (
            <button key={k} type="button" onClick={() => setQs((all) => [...all, blank(k)])} className={mediaButton({ variant: "quiet", size: "sm" })}><Plus aria-hidden /> {QUESTION_KINDS[k]}</button>
          ))}
        </div>
        <label className="flex items-center gap-2 rounded-xl bg-m-ink/3 p-3 text-sm text-m-ink ring-1 ring-m-ink/9">
          <input type="checkbox" checked={released} onChange={(e) => setReleased(e.target.checked)} className="size-4 accent-m-blue" />
          এখনই প্রকাশ করুন — শিক্ষার্থীরা প্রশ্ন দেখবে ও বহুনির্বাচনি দিতে পারবে
        </label>
        {tried && qs.length === 0 && <p className="text-xs font-semibold text-m-red">অন্তত একটি প্রশ্ন দিন।</p>}
        <button type="button" onClick={save} className={mediaButton({ variant: "primary", size: "lg", className: "w-full" })}>সংরক্ষণ করুন</button>
      </DialogContent>
    </Dialog>
  );
}

/** The paper as a student sees it — MCQ answered here — or, for the teacher, with answers and results. */
function PaperView({ exam, paper, teacher, canTake, name, onClose, onScore }: {
  exam: DeskExam; paper: ExamPaper; teacher: boolean; canTake: boolean; name: (id: string) => string; onClose: () => void; onScore: (score: number) => unknown;
}) {
  const [picks, setPicks] = useState<(number | undefined)[]>([]);
  const [done, setDone] = useState<number | null>(null);
  const { num } = useFormat();
  const mcqs = paper.questions.filter((q) => q.kind === "mcq").length;
  const reveal = teacher || done !== null;
  const results = Object.entries(paper.mcq ?? {}).sort((a, b) => b[1] - a[1]);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[94dvh] overflow-y-auto rounded-3xl font-sans sm:max-w-2xl">
        <DialogHeader>
          <PixelMark tone="dark" />
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-m-ink"><GraduationCap className="size-5 text-m-blue" aria-hidden /> {exam.title}</DialogTitle>
          <DialogDescription>
            পূর্ণমান <Num value={totalMarks(paper.questions)} />{paper.duration ? <> · সময় <Num value={paper.duration} /> মিনিট</> : null}
            {paper.instructions && <span className="mt-1 block">{paper.instructions}</span>}
          </DialogDescription>
        </DialogHeader>
        <ol className="space-y-4">
          {paper.questions.map((q, i) => (
            <li key={q.id} className="rounded-2xl bg-m-ink/3 p-4 ring-1 ring-m-ink/9">
              <p className="flex gap-2 text-[15px] font-semibold text-m-ink">
                <span className="text-m-blue"><Num value={i + 1} />.</span>
                <span className="flex-1 whitespace-pre-line">{q.q}</span>
                <span className="shrink-0 text-xs font-bold text-m-ink/60">[<Num value={q.marks} />] · {QUESTION_KINDS[q.kind]}</span>
              </p>
              {q.kind === "mcq" && (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {q.options!.map((o, k) => {
                    const right = reveal && k === q.answer;
                    const wrong = done !== null && picks[i] === k && k !== q.answer;
                    return (
                      <button
                        key={k}
                        type="button"
                        disabled={!canTake || done !== null}
                        onClick={() => setPicks((p) => { const n = [...p]; n[i] = k; return n; })}
                        className={cn(
                          "flex min-h-10 items-center gap-2 rounded-xl px-3 text-left text-sm ring-1 transition-colors disabled:cursor-default",
                          right ? "bg-m-blue-soft text-m-ink ring-m-blue" : wrong ? "bg-m-red text-m-on ring-m-red" : picks[i] === k ? "bg-m-yellow text-m-ink ring-m-blue" : "text-m-ink/85 ring-m-ink/10 hover:ring-m-ink/26",
                        )}
                      >
                        <span className="font-bold">{LETTERS[k]}</span> {o}
                        {right && <CheckCircle2 className="ml-auto size-4" aria-label="সঠিক" />}
                        {wrong && <XCircle className="ml-auto size-4" aria-label="ভুল" />}
                      </button>
                    );
                  })}
                </div>
              )}
              {q.kind !== "mcq" && <p className="mt-2 text-xs text-m-ink/55">খাতায় লিখে জমা দিন।</p>}
            </li>
          ))}
        </ol>

        {canTake && mcqs > 0 && done === null && (
          <button
            type="button"
            onClick={() => {
              const s = scoreMcq(paper.questions, picks);
              setDone(s);
              onScore(s);
              toast.success(`বহুনির্বাচনিতে ${num(s)}/${num(mcqTotal(paper.questions))}`, { description: "সঠিক উত্তর সবুজ, ভুল লাল।" });
            }}
            className={mediaButton({ variant: "primary", size: "lg", className: "w-full" })}
          >
            বহুনির্বাচনি জমা দিন (<Num value={picks.filter((p) => p !== undefined).length} />/<Num value={mcqs} />)
          </button>
        )}
        {done !== null && (
          <p className="rounded-xl bg-m-blue-soft p-4 text-center font-bold text-m-ink">আপনার বহুনির্বাচনি: <Num value={done} />/<Num value={mcqTotal(paper.questions)} /> — বাকি অংশ শিক্ষক খাতা দেখে দেবেন।</p>
        )}
        {teacher && (
          <div className="rounded-2xl bg-m-card p-4 ring-1 ring-m-ink/10 shadow-m-tile">
            <h3 className="mb-2 flex items-center gap-2 font-bold text-m-ink"><Trophy className="size-4 text-m-blue" aria-hidden /> বহুনির্বাচনির ফল</h3>
            {results.length === 0 ? (
              <p className="text-sm text-m-ink/60">এখনো কেউ দেয়নি।</p>
            ) : (
              <ul className="divide-y divide-m-ink/9 text-sm">
                {results.map(([id, s]) => (
                  <li key={id} className="flex items-center justify-between py-2 text-m-ink"><span>{name(id)}</span><span className="font-bold text-m-blue"><Num value={s} />/<Num value={mcqTotal(paper.questions)} /></span></li>
                ))}
              </ul>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
