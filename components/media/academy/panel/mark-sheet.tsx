"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, BadgeCheck, LockOpen, Scale, UserRoundSearch } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { board, getCourse } from "@/data/media/academy";
import { currentUser } from "@/data/media/users";
import { EXAMINER_GAP, MIN_ATTENDANCE, MIN_HOMEWORK, RUBRIC, VERDICTS, certificateId, finalResult, rubricTotal, type PanelMark } from "@/lib/media/academy";
import { markSchema } from "@/lib/media/schemas";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { DateText, Num } from "../../ui/numerals";
import { Band, BandTitle, Turn } from "../catalogue/band";
import { primaryBtn, secondaryBtn } from "../catalogue/buttons";
import { CatalogueNav } from "../catalogue/catalogue-nav";
import { CatalogueRoot } from "../catalogue/catalogue-root";
import { CatalogueRuler } from "../catalogue/ruler";
import { updateAcademy, useAcademy } from "../use-academy";

/** The next certificate serial for a course: one past the highest issued. */
function nextSerial(course: string): number {
  const serials = board.filter((s) => s.course === course && s.certificate).map((s) => Number(s.certificate!.slice(-4)));
  return Math.max(0, ...serials) + 1;
}

const head = "hud text-(--c-faint)";

/**
 * Marking a final as the teacher-examiner, in the catalogue's bands. The
 * rubric adds to 100; the outside examiner's mark stays sealed until this
 * one is in, so neither leans on the other. Then the rules decide:
 * averaged, or a third examiner.
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
  const allowed = Boolean(seat && course && !seat.marks && course.teacher === currentUser.handle);
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
    <CatalogueRoot className="min-h-full">
      <CatalogueNav />
      <CatalogueRuler />

      {!hydrated ? (
        <Band id="mark" n={1} label="নম্বর দিন" now>
          <span aria-hidden className="block h-96 animate-pulse bg-(--c-bg-sunken)" />
        </Band>
      ) : !allowed || !seat || !course ? (
        <Band id="mark" n={1} label="নম্বর দিন" now>
          <div className="flex flex-col items-center px-6 py-24 text-center">
            <h1 className="display text-3xl text-(--c-ink-strong)">এই ইন্টারভিউয়ে আপনি পরীক্ষক নন</h1>
            <p className="mt-3 text-(--c-muted)">শুধু নিজের কোর্সের ফাইনালে নম্বর দেওয়া যায়।</p>
            <Link href="/media/academy/panel" className={cn(primaryBtn, "mt-8")}>
              প্যানেলে ফিরুন
            </Link>
          </div>
        </Band>
      ) : (
        <>
          <Band id="intro" n={1} label="নম্বর দিন" now note={<span className="font-mono">{course.id}</span>}>
            <div className="px-6 py-12 md:px-10 md:py-16">
              <Link href="/media/academy/panel" data-reveal data-in className="hud group inline-flex items-center gap-1.5 text-(--c-muted) hover:text-(--c-ink-strong)">
                <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" aria-hidden /> প্যানেল মার্কিং
              </Link>
              <BandTitle as="h1" now className="mt-6">
                {seat.learner}-এর <Turn>ফাইনাল</Turn>।
              </BandTitle>
              <p data-reveal data-in className="hud mt-4 text-(--c-muted)">
                {course.title} · <DateText iso={seat.at} time weekday />
              </p>
            </div>
          </Band>

          <Band
            id="file"
            n={2}
            label="ফাইল ও নম্বর"
            note={
              <>
                রুব্রিক · <Num value={100} />
              </>
            }
          >
            <div className="grid gap-px bg-(--c-line) lg:grid-cols-[minmax(0,1fr)_26rem]">
              <section aria-label="শিক্ষার্থীর ফাইল" className="flex min-w-0 flex-col gap-px">
                <div className="bg-(--c-bg) p-6 md:p-10">
                  <p className={cn(head, "flex items-center gap-2")}>
                    <UserRoundSearch className="size-3.5" aria-hidden /> প্রজেক্ট
                  </p>
                  <p className="display mt-3 text-2xl leading-snug text-(--c-ink-strong)">{seat.project}</p>
                  <p className="mt-4 text-sm leading-relaxed text-(--c-muted)">
                    <span className="font-semibold text-(--c-ink)">কোর্সের ফাইনাল:</span> {course.final}
                  </p>
                </div>
                {seat.record && (
                  <dl className="grid grid-cols-2 gap-px">
                    {[
                      ["হাজিরা", seat.record.attendance, MIN_ATTENDANCE],
                      ["হোমওয়ার্ক", seat.record.homework, MIN_HOMEWORK],
                    ].map(([label, value, goal]) => {
                      const met = Number(value) >= Number(goal) * 100;
                      return (
                        <div key={String(label)} className="flex flex-col bg-(--c-bg) p-6 md:p-8">
                          <dt className={head}>{label}</dt>
                          <dd className={cn("display mt-3 text-4xl leading-none", met ? "text-(--c-good)" : "text-(--c-ink-strong)")}>
                            <Num value={Number(value)} />%
                          </dd>
                          <dd className="hud mt-2 text-(--c-faint)">
                            লক্ষ্য <Num value={Number(goal) * 100} />% — {met ? "পূরণ" : "পূরণ হয়নি"}
                          </dd>
                        </div>
                      );
                    })}
                  </dl>
                )}
                <div className="flex-1 bg-(--c-bg) p-6 md:p-10">
                  <p className={head}>প্যানেল</p>
                  <ul className="mt-3 space-y-1 text-(--c-ink)">
                    {seat.panel.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                  <p className="mt-5 flex gap-2 text-sm leading-relaxed text-(--c-muted)">
                    <Scale className="mt-0.5 size-4 shrink-0 text-(--c-accent-ink)" aria-hidden />
                    দুজন আলাদা নম্বর দেন; কেউ অন্যজনেরটা আগে দেখেন না। ফারাক <Num value={EXAMINER_GAP} />
                    -এর বেশি হলে তৃতীয় পরীক্ষক আসেন।
                  </p>
                </div>
              </section>

              <aside className="bg-(--c-bg)">
                {saved ? (
                  <Outcome seat={seat} course={course.id} mark={saved} />
                ) : (
                  <div>
                    <div className="flex items-end justify-between gap-3 border-b border-(--c-line) px-6 py-5">
                      <div>
                        <p className={head}>আপনার নম্বর</p>
                        <p className="mt-1 text-xs text-(--c-muted)">শিক্ষক-পরীক্ষক হিসেবে</p>
                      </div>
                      <p className="display text-6xl leading-none text-(--c-signal) tabular-nums">
                        <Num value={total} />
                        <span className="text-xl text-(--c-faint)">
                          /<Num value={100} />
                        </span>
                      </p>
                    </div>
                    <ol className="space-y-6 px-6 py-6">
                      {RUBRIC.map((r, i) => (
                        <li key={r.id}>
                          <div className="flex items-baseline justify-between gap-3">
                            <label htmlFor={`rub-${r.id}`} className="font-semibold text-(--c-ink-strong)">
                              {r.bn}
                            </label>
                            <span className="hud text-(--c-ink-strong)">
                              <Num value={scores[i]} /> / <Num value={r.max} />
                            </span>
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-(--c-muted)">{r.guide}</p>
                          <input id={`rub-${r.id}`} type="range" min={0} max={r.max} step={1} value={scores[i]} onChange={(e) => setScores((s) => s.map((n, j) => (j === i ? Number(e.target.value) : n)))} className="mt-3 w-full accent-(--c-signal)" />
                        </li>
                      ))}
                    </ol>
                    <div className="border-t border-(--c-line) px-6 py-6">
                      <label htmlFor="mark-comment" className="font-semibold text-(--c-ink-strong)">
                        নম্বরের কারণ
                      </label>
                      <Textarea id="mark-comment" rows={4} value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} placeholder="কী ভালো ছিল, কোথায় ঘাটতি — শিক্ষার্থী এটা পড়ে শিখবে।" className="mt-3" />
                      {error && (
                        <p role="alert" className="mt-2 text-sm text-(--c-bad)">
                          {error}
                        </p>
                      )}
                      {confirm ? (
                        <div className="mt-5 border-l-4 border-(--c-signal) bg-(--c-bg-sunken) p-4">
                          <p className="text-sm text-(--c-ink)">
                            জমা দিলে আর বদলানো যায় না। <Num value={total} /> নম্বর নিশ্চিত?
                          </p>
                          <div className="mt-4 flex gap-2">
                            <button type="button" onClick={submit} className={cn(primaryBtn, "h-10 px-4")}>
                              হ্যাঁ, জমা দিন
                            </button>
                            <button type="button" onClick={() => setConfirm(false)} className={cn(secondaryBtn, "h-10 px-4")}>
                              আবার দেখি
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button type="button" onClick={() => setConfirm(true)} className={cn(primaryBtn, "mt-5 w-full")}>
                          নম্বর জমা দিন
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </Band>
        </>
      )}

    </CatalogueRoot>
  );
}

function Outcome({ seat, course, mark }: { seat: (typeof board)[number]; course: string; mark: PanelMark }) {
  const other = seat.sealed;
  const result = other !== undefined ? finalResult([mark.total, other]) : undefined;
  const year = new Date(seat.at).getUTCFullYear();

  return (
    <div>
      <div className="border-b border-(--c-line) px-6 py-6">
        <p className={cn(head, "flex items-center gap-2")}>
          <LockOpen className="size-3.5" aria-hidden /> দুজনের নম্বর খুলল
        </p>
        <dl className="mt-4 grid grid-cols-3 gap-px border border-(--c-line) bg-(--c-line) text-center">
          {[
            ["আপনি", mark.total],
            ["বহিরাগত", other],
            ["ফারাক", other !== undefined ? Math.abs(mark.total - other) : undefined],
          ].map(([k, v]) => (
            <div key={String(k)} className="bg-(--c-bg) p-3">
              <dt className="hud text-(--c-faint)">{k}</dt>
              <dd className="display mt-1 text-3xl text-(--c-ink-strong)">{v === undefined ? "—" : <Num value={Number(v)} />}</dd>
            </div>
          ))}
        </dl>
      </div>

      {result && (
        <div className={cn("border-b border-(--c-line) px-6 py-6", result.verdict !== "third-examiner" && result.verdict !== "retake" && "bg-(--c-bg-raised)")}>
          <p className={head}>ফল</p>
          <p className={cn("display mt-2 text-3xl", result.verdict === "retake" ? "text-(--c-ink-strong)" : result.verdict === "third-examiner" ? "text-(--c-accent-ink)" : "text-(--c-good)")}>{VERDICTS[result.verdict]}</p>
          {result.verdict === "third-examiner" ? (
            <p className="mt-3 text-sm leading-relaxed text-(--c-ink)">
              দুজনের ফারাক <Num value={EXAMINER_GAP} />
              -এর বেশি — একজন তৃতীয় পরীক্ষক প্রজেক্টের রেকর্ডিং দেখে নম্বর দেবেন; তাঁর নম্বর যার কাছাকাছি, তার সাথে গড় হবে।
            </p>
          ) : result.verdict === "retake" ? (
            <p className="mt-3 text-sm leading-relaxed text-(--c-ink)">
              গড় <Num value={result.average} />। ফল প্রকাশ হবে না; শিক্ষার্থী আপনার মন্তব্য পড়ে ৩০ দিন পর আবার দিতে পারবে।
            </p>
          ) : (
            <>
              <p className="mt-3 text-sm text-(--c-ink)">
                গড় <Num value={result.average} /> — নাম প্রকাশ্য বোর্ডে উঠবে।
              </p>
              <p className="mt-4 flex items-center gap-2 border border-(--c-good) px-3 py-2 font-mono text-sm font-bold text-(--c-good)">
                <BadgeCheck className="size-4 shrink-0" aria-hidden /> {certificateId(year, course, nextSerial(course))}
              </p>
            </>
          )}
        </div>
      )}

      <div className="px-6 py-6 text-sm">
        <p className={head}>আপনার রুব্রিক</p>
        <ul className="mt-3 border-t border-(--c-line)">
          {RUBRIC.map((r, i) => (
            <li key={r.id} className="flex justify-between gap-3 border-b border-(--c-line) py-2 text-(--c-ink)">
              <span>{r.bn}</span>
              <span className="hud tabular-nums">
                <Num value={mark.scores[i]} /> / <Num value={r.max} />
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 leading-relaxed text-(--c-muted)">{mark.comment}</p>
      </div>
    </div>
  );
}
