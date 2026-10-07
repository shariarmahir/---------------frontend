"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CalendarClock, ClipboardCheck, DoorOpen, ListChecks, MonitorPlay, Plus, Radio, ShieldAlert, UsersRound } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { board, getCourse, getDepartment } from "@/data/media/academy";
import { DEMO_NOW } from "@/data/media/clock";
import { useAuth } from "@/lib/auth/client";
import { freeClassDone, payoutOf, type Course } from "@/lib/media/academy";
import { BATCH_STAGES, batchStage, nextClass, slotOf, type Batch } from "@/lib/media/batch";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../../ui/button-styles";
import { DateText, Num, Taka } from "../../ui/numerals";
import { PersonAvatar } from "../../ui/person";
import { useTeacher } from "../desk/use-teacher";
import { TierBadge, standingOf } from "../parts";
import { useAcademy } from "../use-academy";
import { useVideos } from "../videos/use-videos";
import { useBatches, useMyRooms } from "./use-batches";

type Tab = "learn" | "teach";
const NO_WEEKS: Record<number, string[]> = {};

/**
 * Every classroom the viewer belongs to. "শিখছি": the batches they joined,
 * each a door into its room. "শেখাচ্ছি": the academy's side — open a
 * classroom for a new batch, today's jobs, and each batch's room, roll call
 * and money. This is where the old teacher's desk lives now.
 */
export function ClassroomHub() {
  const hydrated = useHydrated();
  const { account } = useAuth();
  const t = useTeacher();
  const rooms = useMyRooms();
  const [tab, setTab] = useState<Tab | null>(null);

  if (!hydrated) return <Skeleton className="mx-auto h-96 max-w-6xl rounded-3xl bg-m-ink/6" />;

  const shown: Tab = tab ?? (rooms.length || !t.record ? "learn" : "teach");
  const first = (account?.name ?? t.person.nameBn).trim().split(/\s+/)[0];

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <section className="blue-band relative overflow-hidden rounded-3xl px-5 py-7 shadow-m-lift sm:px-8 sm:py-9">
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white/80">হ্যালো, {first}</p>
            <h1 className="mt-1 text-[clamp(1.9rem,4vw,2.9rem)] leading-tight font-bold">আপনার ক্লাসরুম</h1>
            <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-white/85">প্রতিটি ব্যাচের নিজের ঘর — লাইভ ক্লাস, রেকর্ডিং, উপকরণ আর ব্যাচের আড্ডা এক জায়গায়।</p>
          </div>
          <div role="tablist" aria-label="ক্লাসরুম" className="inline-flex rounded-full bg-white/12 p-1 ring-1 ring-white/25 backdrop-blur">
            {(["learn", "teach"] as const).map((k) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={shown === k}
                onClick={() => setTab(k)}
                className={cn("h-10 rounded-full px-5 text-sm font-bold transition-colors", shown === k ? "bg-white text-m-blue shadow-m-tile" : "text-white/85 hover:text-white")}
              >
                {k === "learn" ? "শিখছি" : "শেখাচ্ছি"}
                {k === "learn" && rooms.length > 0 && (
                  <span className={cn("ml-1.5 rounded-full px-1.5 text-xs", shown === k ? "bg-m-blue-soft" : "bg-white/20")}>
                    <Num value={rooms.length} />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div role="tabpanel">{shown === "learn" ? <LearnRooms rooms={rooms} /> : <TeachRooms />}</div>
    </div>
  );
}

/* ── শিখছি ─────────────────────────────────────────────────────────── */

function LearnRooms({ rooms }: { rooms: { batch: Batch; course: Course }[] }) {
  if (rooms.length === 0) {
    return (
      <section className="grid place-items-center rounded-3xl bg-white px-6 py-16 text-center shadow-m-tile ring-1 ring-m-ink/8">
        <span className="grid size-16 place-items-center rounded-2xl bg-m-blue-soft text-m-blue">
          <DoorOpen className="size-7" aria-hidden />
        </span>
        <h2 className="mt-4 text-xl font-bold text-m-ink">এখনো কোনো ক্লাসরুমে নেই</h2>
        <p className="mt-1 max-w-sm text-[15px] text-m-ink/70">কোনো কোর্সে ভর্তি হলে সেই ব্যাচের ক্লাসরুম এখানে খুলবে।</p>
        <Link href="/media/academy/departments" className={mediaButton({ className: "mt-6" })}>
          কোর্স বেছে নিন <ArrowRight aria-hidden />
        </Link>
      </section>
    );
  }
  return (
    <ul className="grid gap-5 md:grid-cols-2">
      {rooms.map(({ batch, course }) => (
        <li key={batch.id}>
          <RoomCard batch={batch} course={course} />
        </li>
      ))}
    </ul>
  );
}

/** A classroom's door: the course picture, the batch's slot, where it stands, and the next class. */
function RoomCard({ batch, course, teacher }: { batch: Batch; course: Course; teacher?: boolean }) {
  const stage = batchStage(batch, DEMO_NOW);
  const next = nextClass(batch, DEMO_NOW);
  const held = Object.keys(useAcademy((a) => a.attendance[batch.id] ?? NO_WEEKS)).length;
  const href = `/media/academy/classroom/${encodeURIComponent(batch.id)}`;
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-m-tile ring-1 ring-m-ink/8 transition-shadow duration-300 hover:shadow-m-lift">
      <div className="relative aspect-[16/7] overflow-hidden bg-m-ground">
        <Image src={course.image} alt="" fill sizes="(min-width: 768px) 34rem, 92vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgb(0_31_107/0.82))]" aria-hidden />
        <span className={cn("absolute top-3 left-3 rounded-full px-2.5 py-1 text-xs font-bold", stage === "running" ? "bg-m-yellow text-m-ink" : "bg-white/90 text-m-blue")}>{BATCH_STAGES[stage]}</span>
        <div className="absolute inset-x-4 bottom-3 text-white">
          <p className="text-xs font-semibold text-white/80">{getDepartment(course.dept)?.academy.name}</p>
          <h3 className="line-clamp-1 text-lg font-bold">{course.title}</h3>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span className="font-bold text-m-ink">
            ব্যাচ <Num value={batch.n} />
          </span>
          <span className="font-semibold text-m-blue">{slotOf(batch.day, batch.time)}</span>
          <span className="inline-flex items-center gap-1 text-m-ink/65">
            <UsersRound className="size-3.5" aria-hidden /> <Num value={batch.enrolled} />/<Num value={batch.seats} />
          </span>
        </p>
        <div className="flex gap-1" aria-label={`${course.lessons.length}টির মধ্যে ${held}টি ক্লাস হয়েছে`}>
          {course.lessons.map((l, i) => (
            <span key={l.week} className={cn("h-1.5 flex-1 rounded-full", i < held ? "bg-m-blue" : "bg-m-ink/8")} />
          ))}
        </div>
        <p className="flex items-center gap-2 text-sm text-m-ink/75">
          <CalendarClock className="size-4 shrink-0 text-m-blue" aria-hidden />
          {next ? (
            <span>
              সপ্তাহ <Num value={next.week} />-এর ক্লাস · <DateText iso={next.at} time weekday />
            </span>
          ) : stage === "upcoming" ? (
            <span>
              শুরু <DateText iso={batch.starts} />
            </span>
          ) : (
            <span>ক্লাসের সপ্তাহ শেষ — প্রজেক্ট আর প্যানেল</span>
          )}
        </p>
        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          <Link href={href} className={mediaButton({ variant: "green", size: "sm" })}>
            <DoorOpen aria-hidden /> ক্লাসরুমে ঢুকুন
          </Link>
          <Link href={`${href}/live`} className={mediaButton({ variant: "outline", size: "sm" })}>
            <Radio aria-hidden /> {teacher ? "লাইভ শুরু করুন" : "লাইভে যোগ দিন"}
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ── শেখাচ্ছি ───────────────────────────────────────────────────────── */

function TeachRooms() {
  const t = useTeacher();
  const all = useBatches();
  const attendance = useAcademy((a) => a.attendance);
  const marks = useAcademy((a) => a.marks);
  const application = useAcademy((a) => a.application);
  const videos = useVideos();

  if (!t.record) {
    return (
      <section className="mx-auto max-w-xl rounded-3xl bg-white p-6 text-center shadow-m-tile ring-1 ring-m-ink/8 sm:p-8">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-m-blue-soft text-m-blue">
          <DoorOpen className="size-7" aria-hidden />
        </span>
        <h2 className="mt-4 text-2xl font-bold text-m-ink">ক্লাসরুম খোলে প্যানেল ইন্টারভিউয়ের পর</h2>
        <p className="mt-2 text-sm leading-relaxed text-m-ink/75">
          {application ? "আপনার আবেদন জমা আছে। প্যানেল পাস করলে কোর্স বানিয়ে প্রথম ব্যাচের ক্লাসরুম খুলবেন — তারপর ভর্তি শুরু।" : "একাডেমি খুলতে আবেদন করুন — নমুনা ক্লাস আর প্যানেল ইন্টারভিউয়ের পর প্রথম ক্লাসরুম আপনার।"}
        </p>
        <Link href="/media/academy/teach" className={mediaButton({ className: "mt-5" })}>
          {application ? "আবেদনের অবস্থা" : "একাডেমি খুলতে আবেদন"} <ArrowRight aria-hidden />
        </Link>
      </section>
    );
  }

  const { points, tier } = standingOf(t.record);
  const mine = all.filter((b) => t.live.some((c) => c.id === b.course));
  const held = (b: Batch) => Object.keys(attendance[b.id] ?? {}).length;
  const students = mine.reduce((n, b) => n + b.enrolled, 0);
  const money = mine.reduce(
    (m, b) => {
      const c = getCourse(b.course)!;
      const p = payoutOf({ ...c, enrolled: b.enrolled }, held(b));
      return { released: m.released + p.released, waiting: m.waiting + p.waiting };
    },
    { released: 0, waiting: 0 },
  );
  const toMark = board.filter((s) => !s.marks && getCourse(s.course)?.teacher === t.handle && !marks[s.id]);
  const rollCalls = mine
    .filter((b) => batchStage(b, DEMO_NOW) === "running")
    .map((b) => ({ batch: b, course: getCourse(b.course)!, lesson: getCourse(b.course)!.lessons.find((l) => !attendance[b.id]?.[l.week]) }))
    .filter((x) => x.lesson);
  const noNext = t.live.filter((c) => !mine.some((b) => b.course === c.id && batchStage(b, DEMO_NOW) === "upcoming"));

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-center gap-5 rounded-3xl bg-white p-5 shadow-m-tile ring-1 ring-m-ink/8 sm:p-6">
        <PersonAvatar person={t.person} size="xl" className="ring-4 ring-m-blue-soft" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-m-blue">{t.depts.map((d) => d.academy.name).join(" · ")}</p>
          <h2 className="text-2xl leading-tight font-bold text-m-ink">{t.person.nameBn}</h2>
          <p className="mt-1.5 flex flex-wrap items-center gap-2 text-sm font-semibold text-m-ink/75">
            <TierBadge tier={tier} /> <Num value={points.total} /> পয়েন্ট · {t.record.title}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/media/academy/classroom/open" className={mediaButton({ size: "lg" })}>
            <Plus aria-hidden /> নতুন ক্লাসরুম খুলুন
          </Link>
          <Link href="/media/academy/classroom/new" className={mediaButton({ variant: "outline", size: "lg" })}>
            নতুন কোর্স
          </Link>
        </div>
      </section>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["খোলা ক্লাসরুম", <Num key="b" value={mine.filter((b) => batchStage(b, DEMO_NOW) !== "done").length} />, "সব কোর্সের ব্যাচ মিলিয়ে"],
          ["শিক্ষার্থী", <Num key="s" value={students} />, "সব ব্যাচে"],
          ["আয় ছাড় হয়েছে", <Taka key="r" amount={money.released} />, "প্রতি ক্লাসে সেই সপ্তাহের ভাগ"],
          ["এসক্রোতে অপেক্ষায়", <Taka key="w" amount={money.waiting} />, "বাকি ক্লাস হলে ছাড় পাবে"],
        ].map(([k, v, hint]) => (
          <div key={String(k)} className="rounded-2xl bg-white p-4 shadow-m-tile ring-1 ring-m-ink/8 sm:p-5">
            <dt className="text-xs font-semibold text-m-ink/65">{k}</dt>
            <dd className="mt-1 text-2xl font-bold text-m-ink tabular-nums">{v}</dd>
            <dd className="mt-0.5 text-xs text-m-ink/55">{hint}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="today">
        <h2 id="today" className="mb-3 text-lg font-bold text-m-ink">
          আজকের কাজ
        </h2>
        <ul className="divide-y divide-m-ink/8 overflow-hidden rounded-2xl bg-white shadow-m-tile ring-1 ring-m-ink/8">
          {noNext.map((c) => (
            <Task key={`open-${c.id}`} href={`/media/academy/classroom/open?course=${encodeURIComponent(c.id)}`} Icon={Plus} title={`${c.title} — পরের ব্যাচের ক্লাসরুম খুলুন`} sub="ক্লাসরুম খোলা না থাকলে নতুন কেউ ভর্তি হতে পারে না" />
          ))}
          {t.live.length > 0 && !freeClassDone(videos, t.handle, DEMO_NOW.toISOString()) && <Task href="/media/academy/videos?upload=1" Icon={MonitorPlay} title="এ সপ্তাহের বিনামূল্যের ক্লাস ভিডিও তুলুন" sub="প্রতি সপ্তাহে একটা, সবার জন্য — সপ্তাহ শেষ শুক্রবার রাতে" />}
          {rollCalls.map(({ batch, course, lesson }) => (
            <Task key={batch.id} href={`/media/academy/classroom/${encodeURIComponent(batch.id)}?tool=attendance`} Icon={ListChecks} title={`সপ্তাহ ${lesson!.week}-এর হাজিরা নিন — ${lesson!.title}`} sub={`${course.id} · ব্যাচ ${batch.n}`} />
          ))}
          {toMark.length > 0 && <Task href="/media/academy/panel" Icon={ClipboardCheck} title={`${toMark.length}টি ফাইনাল ইন্টারভিউয়ে নম্বর দেওয়া বাকি`} />}
          {t.record.complaints.open > 0 && <Task Icon={ShieldAlert} title={`${t.record.complaints.open}টি অভিযোগ প্যানেলের কাছে — আপনার বক্তব্য চাওয়া হবে`} sub="কে লিখেছেন, তা দেখানো হয় না" />}
        </ul>
      </section>

      {t.live.map((c) => {
        const own = mine.filter((b) => b.course === c.id).sort((a, b) => a.starts.localeCompare(b.starts));
        return (
          <section key={c.id} aria-labelledby={`c-${c.id}`}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 id={`c-${c.id}`} className="text-lg font-bold text-m-ink">
                <span className="mr-2 font-mono text-sm text-m-blue">{c.id}</span>
                {c.title}
              </h2>
              <Link href={`/media/academy/classroom/open?course=${encodeURIComponent(c.id)}`} className={mediaButton({ variant: "ghost", size: "sm" })}>
                <Plus aria-hidden /> নতুন ব্যাচ
              </Link>
            </div>
            <ul className="grid gap-5 md:grid-cols-2">
              {own.map((b) => (
                <li key={b.id}>
                  <RoomCard batch={b} course={c} teacher />
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {t.drafts.length > 0 && (
        <section aria-labelledby="drafts">
          <h2 id="drafts" className="mb-3 text-lg font-bold text-m-ink">
            প্যানেলের অনুমোদনের অপেক্ষায়
          </h2>
          <ul className="space-y-3">
            {t.drafts.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-4 rounded-2xl bg-white p-3 shadow-m-tile ring-1 ring-m-ink/8 sm:p-4">
                <span className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-xl bg-m-ground">
                  <Image src={c.image} alt="" fill sizes="7rem" className="object-cover" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-xs font-bold text-m-blue">{c.id}</span>
                  <span className="block truncate font-semibold text-m-ink">{c.title}</span>
                  <span className="text-xs text-m-ink/65">প্যানেল ৭২ ঘণ্টায় দেখবে · অনুমোদনের পর প্রথম ক্লাসরুম খুলবেন</span>
                </span>
                <Link href={`/media/academy/classroom/${encodeURIComponent(c.id)}`} className={mediaButton({ variant: "quiet", size: "sm" })}>
                  উপকরণ যোগ করুন
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Task({ href, Icon, title, sub }: { href?: string; Icon: typeof Plus; title: string; sub?: string }) {
  const body = (
    <>
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-m-blue-soft text-m-blue">
        <Icon className="size-4.5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-m-ink group-hover:text-m-blue">{title}</span>
        {sub && <span className="text-xs text-m-ink/60">{sub}</span>}
      </span>
      {href && <ArrowRight className="size-4 shrink-0 text-m-ink/50 transition-transform group-hover:translate-x-0.5" aria-hidden />}
    </>
  );
  return (
    <li>
      {href ? (
        <Link href={href} className="group flex items-center gap-3 px-4 py-3.5 hover:bg-m-ink/3 sm:px-5">
          {body}
        </Link>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3.5 sm:px-5">{body}</div>
      )}
    </li>
  );
}
