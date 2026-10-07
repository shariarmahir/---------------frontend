"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, CalendarDays, DoorOpen, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { getDepartment } from "@/data/media/academy";
import { BATCH_MAX, CLASS_MINUTES, courseTimeline } from "@/lib/media/academy";
import { WEEKDAYS, batchIssues, classSessions, dhakaDay, roomName, slotOf, type Batch } from "@/lib/media/batch";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../../ui/button-styles";
import { selectClass } from "../../ui/field-styles";
import { DateText, Num } from "../../ui/numerals";
import { useTeacher } from "../desk/use-teacher";
import { updateAcademy } from "../use-academy";
import { useBatches } from "./use-batches";

const field = "h-11 w-full rounded-xl border border-m-ink/12 bg-white px-3.5 text-[15px] text-m-ink focus-visible:border-m-blue focus-visible:ring-3 focus-visible:ring-m-blue/15 focus-visible:outline-none";

/** A fresh, hard-to-guess salt for a new batch's video room. */
function salt(): string {
  const a = new Uint32Array(2);
  crypto.getRandomValues(a);
  return Array.from(a, (n) => n.toString(36)).join("");
}

/**
 * Opening a classroom: an academy picks a course, the day the batch starts,
 * and the one weekly class slot. The preview shows the five class days and
 * the project days; a clash with the teacher's own running batches stops it.
 * Once open, learners can choose this batch at checkout.
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

  if (!hydrated) return <Skeleton className="mx-auto h-96 max-w-5xl rounded-3xl bg-m-ink/6" />;

  if (!t.record || t.live.length === 0) {
    return (
      <section className="mx-auto max-w-xl rounded-3xl bg-white p-6 text-center shadow-m-tile ring-1 ring-m-ink/8 sm:p-8">
        <h1 className="text-2xl font-bold text-m-ink">আগে একাডেমি আর কোর্স</h1>
        <p className="mt-2 text-sm leading-relaxed text-m-ink/75">ক্লাসরুম খোলে প্যানেলের অনুমোদন পাওয়া কোর্সের জন্য। একাডেমি খুলতে আবেদন করুন, কোর্স বানান — অনুমোদনের পর এখানে প্রথম ব্যাচের ক্লাসরুম খুলবেন।</p>
        <Link href={t.record ? "/media/academy/classroom/new" : "/media/academy/teach"} className={mediaButton({ className: "mt-5" })}>
          {t.record ? "নতুন কোর্স বানান" : "একাডেমি খুলতে আবেদন"}
        </Link>
      </section>
    );
  }

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
    <div className="mx-auto max-w-5xl pb-12">
      <Link href="/media/academy/classroom" className="group mb-3 inline-flex min-h-8 items-center gap-1.5 text-sm font-semibold text-m-blue">
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" aria-hidden /> ক্লাসরুম
      </Link>
      <h1 className="text-[clamp(1.8rem,3.4vw,2.5rem)] leading-tight font-bold text-m-ink">নতুন ক্লাসরুম খুলুন</h1>
      <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-m-ink/75">
        প্রতিটি ব্যাচের নিজের ক্লাসরুম। একই কোর্স একাধিক সময়ে চালাতে পারেন — সকালের ব্যাচ, সন্ধ্যার ব্যাচ। প্রতি সপ্তাহে <Num value={CLASS_MINUTES} /> মিনিটের একটা লাইভ ক্লাস।
      </p>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            open();
          }}
          className="space-y-6 rounded-3xl bg-white p-5 shadow-m-tile ring-1 ring-m-ink/8 sm:p-7"
        >
          <div>
            <label htmlFor="oc-course" className="mb-1.5 block text-sm font-semibold text-m-ink">
              কোর্স
            </label>
            <select id="oc-course" value={course} onChange={(e) => setCourse(e.target.value)} className={selectClass}>
              {t.live.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.id} · {x.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="oc-starts" className="mb-1.5 block text-sm font-semibold text-m-ink">
                ব্যাচ শুরুর দিন
              </label>
              <input id="oc-starts" type="date" min={today} value={starts} onChange={(e) => setStarts(e.target.value)} className={field} />
            </div>
            <div>
              <label htmlFor="oc-time" className="mb-1.5 block text-sm font-semibold text-m-ink">
                ক্লাসের সময় (ঢাকা)
              </label>
              <input id="oc-time" type="time" step={300} value={time} onChange={(e) => setTime(e.target.value)} className={field} />
            </div>
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-m-ink">প্রতি সপ্তাহের ক্লাসের দিন</legend>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
              {WEEKDAYS.map((w, i) => (
                <label key={w} className={cn("grid h-11 cursor-pointer place-items-center rounded-xl text-sm font-semibold ring-1 transition-colors", day === i ? "bg-m-blue text-m-on ring-m-blue" : "bg-white text-m-ink/80 ring-m-ink/12 hover:ring-m-blue/40")}>
                  <input type="radio" name="oc-day" className="sr-only" checked={day === i} onChange={() => setDay(i)} />
                  {w.replace("বার", "")}
                </label>
              ))}
            </div>
          </fieldset>

          {tried && issues.length > 0 && (
            <ul role="alert" className="space-y-1.5 rounded-xl bg-m-red-soft p-3.5 text-sm font-semibold text-m-red">
              {issues.map((x) => (
                <li key={x} className="flex gap-2">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden /> {x}
                </li>
              ))}
            </ul>
          )}

          <button type="submit" className={mediaButton({ size: "lg", className: "h-13 w-full text-base sm:w-auto" })}>
            <DoorOpen aria-hidden /> ব্যাচ <Num value={n} />-এর ক্লাসরুম খুলুন
          </button>
        </form>

        <aside aria-label="পূর্বরূপ" className="space-y-4 lg:sticky lg:top-4">
          {c && (
            <div className="overflow-hidden rounded-3xl bg-white shadow-m-lift ring-1 ring-m-ink/8">
              <div className="relative aspect-video bg-m-ground">
                <Image src={c.image} alt="" fill sizes="22rem" className="object-cover" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgb(0_31_107/0.85))]" aria-hidden />
                <p className="absolute inset-x-4 bottom-3 text-white">
                  <span className="block text-xs font-semibold text-white/80">
                    ব্যাচ <Num value={n} /> · {slotOf(day, time)}
                  </span>
                  <span className="block font-bold">{c.title}</span>
                </p>
              </div>
              <div className="space-y-3 p-4">
                <p className="flex items-center gap-2 text-sm text-m-ink/75">
                  <UsersRound className="size-4 text-m-blue" aria-hidden /> সর্বোচ্চ <Num value={seats} /> জন · {dept?.kind === "team" ? "দলীয়" : "একক"} একাডেমি
                </p>
                {sessions.length > 0 ? (
                  <ol className="space-y-1.5 text-sm">
                    {sessions.map((s) => (
                      <li key={s.week} className="flex items-center justify-between gap-3 rounded-lg bg-m-ground px-3 py-2">
                        <span className="font-semibold text-m-ink">
                          সপ্তাহ <Num value={s.week} />
                        </span>
                        <span className="text-m-ink/70">
                          <DateText iso={s.at} time weekday />
                        </span>
                      </li>
                    ))}
                    <li className="flex items-center justify-between gap-3 rounded-lg bg-m-amber-soft px-3 py-2">
                      <span className="font-semibold text-m-ink">প্রজেক্ট ও প্যানেল</span>
                      <span className="text-m-ink/70">
                        <DateText iso={courseTimeline(starts).final.from} /> – <DateText iso={courseTimeline(starts).ends} />
                      </span>
                    </li>
                  </ol>
                ) : (
                  <p className="flex items-center gap-2 rounded-lg bg-m-ground px-3 py-3 text-sm text-m-ink/65">
                    <CalendarDays className="size-4 text-m-blue" aria-hidden /> শুরুর দিন আর সময় দিলে পাঁচটি ক্লাসের তারিখ এখানে দেখাবে।
                  </p>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
