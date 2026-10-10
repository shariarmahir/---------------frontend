"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, CalendarDays, DoorOpen, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { getDepartment } from "@/data/media/academy";
import { BATCH_MAX, CLASS_MINUTES, DEPT_KINDS, courseTimeline } from "@/lib/media/academy";
import { WEEKDAYS, batchIssues, classSessions, dhakaDay, roomName, slotOf, type Batch } from "@/lib/media/batch";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { DateText, Num } from "../../ui/numerals";
import { Band, BandTitle, Turn } from "../catalogue/band";
import { primaryBtn } from "../catalogue/buttons";
import { CatalogueNav } from "../catalogue/catalogue-nav";
import { CatalogueRoot } from "../catalogue/catalogue-root";
import { fieldClass, labelClass } from "../catalogue/fields";
import { CatalogueRuler } from "../catalogue/ruler";
import { useTeacher } from "../desk/use-teacher";
import { updateAcademy } from "../use-academy";
import { useBatches } from "./use-batches";

/** A plain field in the catalogue's dress (these are native inputs, not the shared ones). */
const field = cn(fieldClass, "border-(--c-line-strong) bg-(--c-bg-sunken) text-(--c-ink-strong) focus-visible:border-(--c-signal)");

/** A fresh, hard-to-guess salt for a new batch's video room. */
function salt(): string {
  const a = new Uint32Array(2);
  crypto.getRandomValues(a);
  return Array.from(a, (n) => n.toString(36)).join("");
}

/**
 * Opening a classroom, in the catalogue's bands: an academy picks a course,
 * the day the batch starts, and the one weekly class slot. Beside it the
 * preview shows the five class days and the project days; a clash with the
 * teacher's own running batches stops it. Once open, learners can choose
 * this batch at checkout.
 */
export function OpenClassroom({ initialCourse }: { initialCourse?: string }) {
  const hydrated = useHydrated();
  const router = useRouter();
  const t = useTeacher();
  const all = useBatches();
  const today = dhakaDay(new Date());
  const [course, setCourse] = useState(initialCourse && t.live.some((c) => c.id === initialCourse) ? initialCourse : (t.live[0]?.id ?? ""));
  const [starts, setStarts] = useState("");
  const [day, setDay] = useState(6);
  const [time, setTime] = useState("19:00");
  const [tried, setTried] = useState(false);

  const c = t.live.find((x) => x.id === course);
  const mine = useMemo(() => all.filter((b) => t.live.some((x) => x.id === b.course)), [all, t.live]);
  const issues = batchIssues({ starts, day, time }, mine, today);
  const sessions = issues.length === 0 ? classSessions({ starts, day, time }) : [];
  const dept = c ? getDepartment(c.dept) : undefined;
  const seats = c && dept ? Math.min(c.seats, BATCH_MAX[dept.kind]) : 0;
  const n = c ? Math.max(0, ...all.filter((b) => b.course === c.id).map((b) => b.n)) + 1 : 1;

  function open() {
    setTried(true);
    if (!c || issues.length) return;
    const id = `${c.id}-B${n}`;
    const batch: Batch = { id, course: c.id, n, starts, day, time, seats, enrolled: 0, room: roomName(id, salt()), opened: new Date().toISOString() };
    if (!updateAcademy((a) => ({ ...a, batches: [...(a.batches ?? []), batch] }))) {
      toast.error("এই ব্রাউজারে সংরক্ষণ হয়নি");
      return;
    }
    toast.success(`ব্যাচ ${n}-এর ক্লাসরুম খোলা হলো`, { description: "এখন থেকে চেকআউটে শিক্ষার্থীরা এই ব্যাচ বেছে নিতে পারবে।" });
    router.push(`/media/academy/classroom/${encodeURIComponent(id)}`);
  }

  return (
    <CatalogueRoot className="min-h-full">
      <CatalogueNav />
      <CatalogueRuler />

      <Band id="intro" n={1} label="ক্লাসরুম খুলুন" now note="প্রতিটি ব্যাচের নিজের ঘর">
        <div className="px-6 py-12 md:px-10 md:py-16">
          <Link href="/media/academy/classroom" data-reveal data-in className="hud group inline-flex items-center gap-1.5 text-(--c-muted) hover:text-(--c-ink-strong)">
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" aria-hidden /> সব ক্লাসরুম
          </Link>
          <BandTitle as="h1" now className="mt-6">
            নতুন <Turn>ক্লাসরুম</Turn> খুলুন।
          </BandTitle>
          <p data-reveal data-in className="mt-5 max-w-2xl text-lg leading-relaxed text-(--c-muted)">
            একই কোর্স একাধিক সময়ে চালাতে পারেন — সকালের ব্যাচ, সন্ধ্যার ব্যাচ। প্রতি সপ্তাহে <Num value={CLASS_MINUTES} /> মিনিটের একটা লাইভ ক্লাস।
          </p>
        </div>
      </Band>

      {!hydrated ? (
        <Band id="form" n={2} label="ব্যাচ">
          <span aria-hidden className="block h-96 animate-pulse bg-(--c-bg-sunken)" />
        </Band>
      ) : !t.record || t.live.length === 0 ? (
        <Band id="form" n={2} label="ব্যাচ" note="প্যানেলের অনুমোদনের পর">
          <div className="flex flex-col items-center px-6 py-20 text-center">
            <h2 className="display text-3xl text-(--c-ink-strong)">
              আগে একাডেমি আর <Turn>কোর্স</Turn>।
            </h2>
            <p className="mt-3 max-w-lg leading-relaxed text-(--c-muted)">ক্লাসরুম খোলে প্যানেলের অনুমোদন পাওয়া কোর্সের জন্য। একাডেমি খুলতে আবেদন করুন, কোর্স বানান — অনুমোদনের পর এখানে প্রথম ব্যাচের ক্লাসরুম খুলবেন।</p>
            <Link href={t.record ? "/media/academy/classroom/new" : "/media/academy/teach"} className={cn(primaryBtn, "mt-8")}>
              {t.record ? "নতুন কোর্স বানান" : "একাডেমি খুলতে আবেদন"}
            </Link>
          </div>
        </Band>
      ) : (
        <Band
          id="form"
          n={2}
          label="ব্যাচ"
          note={
            <>
              ব্যাচ <Num value={n} />
            </>
          }
        >
          <div className="grid gap-px bg-(--c-line) lg:grid-cols-[minmax(0,1fr)_24rem]">
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                open();
              }}
              className="space-y-7 bg-(--c-bg) p-6 md:p-10"
            >
              <div>
                <label htmlFor="oc-course" className={cn(labelClass, "mb-2 block")}>
                  কোর্স
                </label>
                <select id="oc-course" value={course} onChange={(e) => setCourse(e.target.value)} className={field}>
                  {t.live.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.id} · {x.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="oc-starts" className={cn(labelClass, "mb-2 block")}>
                    ব্যাচ শুরুর দিন
                  </label>
                  <input id="oc-starts" type="date" min={today} value={starts} onChange={(e) => setStarts(e.target.value)} className={field} />
                </div>
                <div>
                  <label htmlFor="oc-time" className={cn(labelClass, "mb-2 block")}>
                    ক্লাসের সময় (ঢাকা)
                  </label>
                  <input id="oc-time" type="time" step={300} value={time} onChange={(e) => setTime(e.target.value)} className={field} />
                </div>
              </div>

              <fieldset>
                <legend className={cn(labelClass, "mb-3")}>প্রতি সপ্তাহের ক্লাসের দিন</legend>
                <div className="grid grid-cols-4 gap-px border border-(--c-line) bg-(--c-line) sm:grid-cols-7">
                  {WEEKDAYS.map((w, i) => (
                    <label
                      key={w}
                      className={cn(
                        "grid h-12 cursor-pointer place-items-center text-sm font-semibold transition-colors duration-150 has-focus-visible:outline-2 has-focus-visible:-outline-offset-2 has-focus-visible:outline-(--c-signal)",
                        day === i ? "bg-(--c-invert-bg) text-(--c-invert-fg)" : "bg-(--c-bg) text-(--c-muted) hover:text-(--c-ink-strong)",
                      )}
                    >
                      <input type="radio" name="oc-day" className="sr-only" checked={day === i} onChange={() => setDay(i)} />
                      {w.replace("বার", "")}
                    </label>
                  ))}
                </div>
              </fieldset>

              {tried && issues.length > 0 && (
                <ul role="alert" className="space-y-1.5 border-l-4 border-(--c-bad) bg-(--c-bg-sunken) p-4 text-sm font-semibold text-(--c-bad)">
                  {issues.map((x) => (
                    <li key={x} className="flex gap-2">
                      <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden /> {x}
                    </li>
                  ))}
                </ul>
              )}

              <button type="submit" className={cn(primaryBtn, "h-13 w-full text-base sm:w-auto")}>
                <DoorOpen className="size-4.5" aria-hidden /> ব্যাচ <Num value={n} />
                -এর ক্লাসরুম খুলুন
              </button>
            </form>

            <aside aria-label="পূর্বরূপ" className="bg-(--c-bg)">
              {c && (
                <div className="lg:sticky lg:top-24">
                  <div className="relative aspect-video bg-(--c-bg-sunken)">
                    <Image src={c.image} alt="" fill sizes="24rem" className="object-cover" />
                    <span className="hud absolute bottom-3 left-3 bg-(--c-invert-bg) px-2 py-1 font-bold text-(--c-invert-fg)">
                      ব্যাচ <Num value={n} /> · {slotOf(day, time)}
                    </span>
                  </div>
                  <div className="space-y-4 p-6">
                    <p className="display text-lg text-(--c-ink-strong)">{c.title}</p>
                    <p className="hud flex items-center gap-2 text-(--c-muted)">
                      <UsersRound className="size-3.5 text-(--c-accent-ink)" aria-hidden /> সর্বোচ্চ <Num value={seats} /> জন · {dept && DEPT_KINDS[dept.kind]}
                    </p>
                    {sessions.length > 0 ? (
                      <ol className="border-t border-(--c-line) text-sm">
                        {sessions.map((s) => (
                          <li key={s.week} className="flex items-center justify-between gap-3 border-b border-(--c-line) py-2.5">
                            <span className="font-semibold text-(--c-ink-strong)">
                              সপ্তাহ <Num value={s.week} />
                            </span>
                            <span className="hud text-(--c-muted)">
                              <DateText iso={s.at} time weekday />
                            </span>
                          </li>
                        ))}
                        <li className="flex items-center justify-between gap-3 border-b border-(--c-line) py-2.5">
                          <span className="font-semibold text-(--c-signal)">প্রজেক্ট ও প্যানেল</span>
                          <span className="hud text-(--c-muted)">
                            <DateText iso={courseTimeline(starts).final.from} /> – <DateText iso={courseTimeline(starts).ends} />
                          </span>
                        </li>
                      </ol>
                    ) : (
                      <p className="flex items-start gap-2 border border-(--c-line) px-3 py-3 text-sm text-(--c-muted)">
                        <CalendarDays className="mt-0.5 size-4 shrink-0 text-(--c-accent-ink)" aria-hidden /> শুরুর দিন আর সময় দিলে পাঁচটি ক্লাসের তারিখ এখানে দেখাবে।
                      </p>
                    )}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </Band>
      )}

    </CatalogueRoot>
  );
}
