"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, BadgeCheck, LockOpen, Scale, UserRoundSearch } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { board, getCourse } from "@/data/media/academy";
import { currentUser } from "@/data/media/users";
import { EXAMINER_GAP, MIN_ATTENDANCE, MIN_HOMEWORK, RUBRIC, VERDICTS, certificateId, finalResult, rubricTotal, type PanelMark } from "@/lib/media/academy";
import { markSchema } from "@/lib/media/schemas";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../../ui/button-styles";
import { DateText, Num } from "../../ui/numerals";
import { updateAcademy, useAcademy } from "../use-academy";

/** The next certificate serial for a course: one past the highest issued. */
function nextSerial(course: string): number {
  const serials = board.filter((s) => s.course === course && s.certificate).map((s) => Number(s.certificate!.slice(-4)));
  return Math.max(0, ...serials) + 1;
}

/**
 * Marking a final as the teacher-examiner. The rubric adds to 100; the
 * outside examiner's mark stays sealed until this one is in, so neither
 * leans on the other. Then the rules decide: averaged, or a third examiner.
 */
export function MarkSheet({ seatId }: { seatId: string }) {
  const hydrated = useHydrated();
  const saved = useAcademy((a) => a.marks[seatId]);
  const [scores, setScores] = useState<number[]>(() => RUBRIC.map(() => 0));
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string>();
  const [confirm, setConfirm] = useState(false);

  const seat = board.find((s) => s.id === seatId);
  const course = seat ? getCourse(seat.course) : undefined;

  if (!hydrated) return <Skeleton className="h-96 rounded-2xl bg-text-primary/40" />;
  if (!seat || !course || seat.marks || course.teacher !== currentUser.handle) {
    return (
      <div className="mx-auto max-w-md rounded-3xl bg-text-primary p-6 text-center ring-1 ring-white/12">
        <h1 className="text-xl font-bold text-white">এই ইন্টারভিউয়ে আপনি পরীক্ষক নন</h1>
        <p className="mt-2 text-sm text-white/75">শুধু নিজের কোর্সের ফাইনালে নম্বর দেওয়া যায়।</p>
        <Link href="/media/academy/panel" className={mediaButton({ variant: "primary", className: "mt-5" })}>প্যানেলে ফিরুন</Link>
      </div>
    );
  }

  const total = rubricTotal(scores);

  function submit() {
    const parsed = markSchema.safeParse({ scores, comment });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message);
      setConfirm(false);
      return;
    }
    const mark: PanelMark = { scores, total: rubricTotal(scores), comment: parsed.data.comment, at: new Date().toISOString() };
    updateAcademy((a) => ({ ...a, marks: { ...a.marks, [seatId]: mark } }));
    toast.success("নম্বর জমা হয়েছে", { description: "অন্য পরীক্ষকের নম্বর এখন খুলল।" });
  }

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/media/academy/panel" className="group mb-3 inline-flex min-h-8 items-center gap-1.5 text-sm font-semibold text-signal-orange">
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" aria-hidden /> প্যানেল মার্কিং
      </Link>
      <h1 className="text-2xl font-bold text-white sm:text-[2rem]">{seat.learner}-এর ফাইনাল</h1>
      <p className="mt-1 mb-6 text-sm text-white/80">{course.id} · {course.title} · <DateText iso={seat.at} time weekday /></p>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_25rem]">
        <section aria-label="শিক্ষার্থীর ফাইল" className="min-w-0 space-y-5">
          <div className="rounded-2xl bg-text-primary p-5 ring-1 ring-white/12 sm:p-6">
            <p className="flex items-center gap-2 text-sm font-semibold text-signal-orange"><UserRoundSearch className="size-4" aria-hidden /> প্রজেক্ট</p>
            <p className="mt-2 text-lg leading-snug font-bold text-white">{seat.project}</p>
            <p className="mt-3 text-sm text-white/75"><span className="font-semibold text-white/90">কোর্সের ফাইনাল:</span> {course.final}</p>
          </div>
          {seat.record && (
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/12">
              {[
                ["হাজিরা", seat.record.attendance, MIN_ATTENDANCE],
                ["হোমওয়ার্ক", seat.record.homework, MIN_HOMEWORK],
              ].map(([label, value, goal]) => (
                <div key={String(label)} className="bg-text-primary p-4">
                  <dt className="text-xs text-white/70">{label}</dt>
                  <dd className="text-2xl font-bold text-white tabular-nums"><Num value={Number(value)} />%</dd>
                  <dd className="text-xs text-white/60">লক্ষ্য <Num value={Number(goal) * 100} />% — {Number(value) >= Number(goal) * 100 ? "পূরণ" : "পূরণ হয়নি"}</dd>
                </div>
              ))}
            </dl>
          )}
          <div className="rounded-2xl bg-text-primary p-5 text-sm ring-1 ring-white/12">
            <p className="font-semibold text-white">প্যানেল</p>
            <ul className="mt-2 space-y-1 text-white/85">{seat.panel.map((p) => <li key={p}>{p}</li>)}</ul>
            <p className="mt-4 flex gap-2 text-xs leading-relaxed text-white/70">
              <Scale className="size-4 shrink-0 text-signal-orange" aria-hidden />
              দুজন আলাদা নম্বর দেন; কেউ অন্যজনেরটা আগে দেখেন না। ফারাক <Num value={EXAMINER_GAP} />-এর বেশি হলে তৃতীয় পরীক্ষক আসেন।
            </p>
          </div>
        </section>

        <aside className="lg:sticky lg:top-0 lg:self-start">
          {saved ? (
            <Outcome seat={seat} course={course.id} mark={saved} />
          ) : (
            <div className="rounded-2xl bg-text-primary ring-1 ring-signal-orange/40">
              <div className="flex items-end justify-between gap-3 border-b border-white/10 p-5">
                <div>
                  <p className="text-sm font-semibold text-signal-orange">আপনার নম্বর</p>
                  <p className="text-xs text-white/65">শিক্ষক-পরীক্ষক হিসেবে</p>
                </div>
                <p className="text-5xl leading-none font-bold text-white tabular-nums"><Num value={total} /><span className="text-lg text-white/60">/১০০</span></p>
              </div>
              <ol className="space-y-5 p-5">
                {RUBRIC.map((r, i) => (
                  <li key={r.id}>
                    <div className="flex items-baseline justify-between gap-3">
                      <label htmlFor={`rub-${r.id}`} className="font-semibold text-white">{r.bn}</label>
                      <span className="text-sm font-bold text-white tabular-nums"><Num value={scores[i]} /> / <Num value={r.max} /></span>
                    </div>
                    <p className="mt-0.5 text-xs text-white/65">{r.guide}</p>
                    <input
                      id={`rub-${r.id}`}
                      type="range"
                      min={0}
                      max={r.max}
                      step={1}
                      value={scores[i]}
                      onChange={(e) => setScores((s) => s.map((n, j) => (j === i ? Number(e.target.value) : n)))}
                      className="mt-2 w-full accent-signal-orange"
                    />
                  </li>
                ))}
              </ol>
              <div className="border-t border-white/10 p-5">
                <label htmlFor="mark-comment" className="font-semibold text-white">নম্বরের কারণ</label>
                <Textarea id="mark-comment" rows={4} value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} placeholder="কী ভালো ছিল, কোথায় ঘাটতি — শিক্ষার্থী এটা পড়ে শিখবে।" className="mt-2" />
                {error && <p role="alert" className="mt-2 text-sm text-crimson-bright">{error}</p>}
                {confirm ? (
                  <div className="mt-4 rounded-xl bg-black/40 p-3">
                    <p className="text-sm text-white/85">জমা দিলে আর বদলানো যায় না। <Num value={total} /> নম্বর নিশ্চিত?</p>
                    <div className="mt-3 flex gap-2">
                      <button type="button" onClick={submit} className={mediaButton({ variant: "primary", size: "sm" })}>হ্যাঁ, জমা দিন</button>
                      <button type="button" onClick={() => setConfirm(false)} className={mediaButton({ variant: "ghost", size: "sm" })}>আবার দেখি</button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => setConfirm(true)} className={mediaButton({ variant: "primary", className: "mt-4 w-full" })}>নম্বর জমা দিন</button>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function Outcome({ seat, course, mark }: { seat: (typeof board)[number]; course: string; mark: PanelMark }) {
  const other = seat.sealed;
  const result = other !== undefined ? finalResult([mark.total, other]) : undefined;
  const year = new Date(seat.at).getUTCFullYear();

  return (
    <div className="live-in space-y-4">
      <div className="rounded-2xl bg-text-primary p-5 ring-1 ring-white/12">
        <p className="flex items-center gap-2 text-sm font-semibold text-signal-orange"><LockOpen className="size-4" aria-hidden /> দুজনের নম্বর খুলল</p>
        <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[
            ["আপনি", mark.total],
            ["বহিরাগত", other],
            ["ফারাক", other !== undefined ? Math.abs(mark.total - other) : undefined],
          ].map(([k, v]) => (
            <div key={String(k)} className="rounded-xl bg-black/40 p-3">
              <dt className="text-xs text-white/65">{k}</dt>
              <dd className="mt-1 text-2xl font-bold text-white tabular-nums">{v === undefined ? "—" : <Num value={Number(v)} />}</dd>
            </div>
          ))}
        </dl>
      </div>

      {result && (
        <div className={cn("rounded-2xl p-5", result.verdict === "third-examiner" ? "bg-text-primary ring-1 ring-signal-orange/60" : result.verdict === "retake" ? "bg-text-primary ring-1 ring-white/12" : "bg-bd-green")}>
          <p className="text-sm font-semibold text-white/85">ফল</p>
          <p className="mt-1 text-2xl font-bold text-white">{VERDICTS[result.verdict]}</p>
          {result.verdict === "third-examiner" ? (
            <p className="mt-2 text-sm leading-relaxed text-white/85">দুজনের ফারাক <Num value={EXAMINER_GAP} />-এর বেশি — একজন তৃতীয় পরীক্ষক প্রজেক্টের রেকর্ডিং দেখে নম্বর দেবেন; তাঁর নম্বর যার কাছাকাছি, তার সাথে গড় হবে।</p>
          ) : result.verdict === "retake" ? (
            <p className="mt-2 text-sm leading-relaxed text-white/85">গড় <Num value={result.average} />। ফল প্রকাশ হবে না; শিক্ষার্থী আপনার মন্তব্য পড়ে ৩০ দিন পর আবার দিতে পারবে।</p>
          ) : (
            <>
              <p className="mt-2 text-sm text-white/90">গড় <Num value={result.average} /> — নাম প্রকাশ্য বোর্ডে উঠবে।</p>
              <p className="mt-3 flex items-center gap-2 rounded-xl bg-black/25 px-3 py-2 font-mono text-sm font-bold text-white">
                <BadgeCheck className="size-4 shrink-0" aria-hidden /> {certificateId(year, course, nextSerial(course))}
              </p>
            </>
          )}
        </div>
      )}

      <div className="rounded-2xl bg-text-primary p-5 text-sm ring-1 ring-white/12">
        <p className="font-semibold text-white">আপনার রুব্রিক</p>
        <ul className="mt-2 space-y-1">
          {RUBRIC.map((r, i) => (
            <li key={r.id} className="flex justify-between gap-3 text-white/85"><span>{r.bn}</span><span className="tabular-nums"><Num value={mark.scores[i]} /> / <Num value={r.max} /></span></li>
          ))}
        </ul>
        <p className="mt-3 border-t border-white/10 pt-3 leading-relaxed text-white/80">{mark.comment}</p>
      </div>
    </div>
  );
}
