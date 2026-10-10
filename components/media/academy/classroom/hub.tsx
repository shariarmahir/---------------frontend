"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ArrowUpRight, CalendarClock, ClipboardCheck, DoorOpen, ListChecks, MonitorPlay, Plus, Radio, ShieldAlert, UsersRound } from "lucide-react";
import { board, departments, getCourse, getDepartment } from "@/data/media/academy";
import { DEMO_NOW } from "@/data/media/clock";
import { useAuth } from "@/lib/auth/client";
import { TIERS, freeClassDone, payoutOf, type Course } from "@/lib/media/academy";
import { BATCH_STAGES, batchStage, nextClass, slotOf, type Batch } from "@/lib/media/batch";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { DateText, Num, Taka } from "../../ui/numerals";
import { PersonAvatar } from "../../ui/person";
import { actionClass, frameClass } from "../catalogue/asset-card";
import { Band, BandTitle, Turn, twoDigits } from "../catalogue/band";
import { primaryBtn, secondaryBtn } from "../catalogue/buttons";
import { CatalogueNav } from "../catalogue/catalogue-nav";
import { CatalogueRoot } from "../catalogue/catalogue-root";
import { CatalogueRuler } from "../catalogue/ruler";
import { TabStrip } from "../catalogue/tab-strip";
import { toneStyle } from "../catalogue/tones";
import { useTeacher } from "../desk/use-teacher";
import { standingOf } from "../parts";
import { useAcademy } from "../use-academy";
import { useVideos } from "../videos/use-videos";
import { useBatches, useMyRooms } from "./use-batches";

type Tab = "learn" | "teach";
const NO_WEEKS: Record<number, string[]> = {};
const toneOf = (c: Course) => departments.findIndex((d) => d.id === c.dept);

/**
 * ক্লাস — step seven: every classroom the viewer belongs to, in the
 * catalogue's bands. "শিখছি": the batches they joined, each a door into its
 * room. "শেখাচ্ছি": the academy's side — open a classroom for a new batch,
 * today's jobs, the money, and each batch's room.
 */
export function ClassroomHub() {
  const hydrated = useHydrated();
  const { account } = useAuth();
  const t = useTeacher();
  const rooms = useMyRooms();
  const [tab, setTab] = useState<Tab | null>(null);
  const shown: Tab = tab ?? (rooms.length || !t.record ? "learn" : "teach");
  const first = (account?.name ?? t.person.nameBn).trim().split(/\s+/)[0];

  return (
    <CatalogueRoot className="min-h-full">
      <CatalogueNav />
      <CatalogueRuler />

      <Band id="intro" n={1} label="ক্লাস" now note={hydrated ? <>হ্যালো, {first}</> : undefined}>
        <div className="px-6 py-14 md:px-10 md:py-20">
          <BandTitle as="h1" now>
            আপনার <Turn>ক্লাসরুম</Turn>।
          </BandTitle>
          <p data-reveal data-in className="mt-5 max-w-xl text-lg leading-relaxed text-(--c-muted)">
            প্রতিটি ব্যাচের নিজের ঘর — লাইভ ক্লাস, রেকর্ডিং, উপকরণ আর ব্যাচের আড্ডা এক জায়গায়।
          </p>
        </div>
        {hydrated && (
          <TabStrip
            label="ক্লাসরুম"
            idBase="hub"
            value={shown}
            onChange={setTab}
            className="border-t"
            tabs={[
              { id: "learn", label: "শিখছি", count: rooms.length },
              { id: "teach", label: "শেখাচ্ছি" },
            ]}
          />
        )}
      </Band>

      {!hydrated ? (
        <Band id="rooms" n={2} label="ক্লাসরুম">
          <span aria-hidden className="block h-80 animate-pulse bg-(--c-bg-sunken)" />
        </Band>
      ) : (
        <div id="hub-panel" role="tabpanel" aria-labelledby={`hub-${shown}`}>
          {shown === "learn" ? <LearnRooms rooms={rooms} /> : <TeachRooms />}
        </div>
      )}

    </CatalogueRoot>
  );
}

/* ── শিখছি ─────────────────────────────────────────────────────────── */

function LearnRooms({ rooms }: { rooms: { batch: Batch; course: Course }[] }) {
  if (rooms.length === 0) {
    return (
      <Band id="rooms" n={2} label="ক্লাসরুম" note="ভর্তির পর খোলে">
        <div className="flex flex-col items-center px-6 py-20 text-center md:py-28">
          <span className="grid size-16 place-items-center border border-(--c-line) text-(--c-accent-ink)">
            <DoorOpen className="size-7" aria-hidden />
          </span>
          <h2 className="display mt-6 text-3xl text-(--c-ink-strong)">
            এখনো কোনো <Turn>ক্লাসরুমে</Turn> নেই।
          </h2>
          <p className="mt-3 max-w-sm leading-relaxed text-(--c-muted)">কোনো কোর্সে ভর্তি হলে সেই ব্যাচের ক্লাসরুম এখানে খুলবে।</p>
          <Link href="/media/academy/courses" className={cn(primaryBtn, "mt-8")}>
            কোর্স দেখুন <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </Band>
    );
  }
  return (
    <Band
      id="rooms"
      n={2}
      label="ক্লাসরুম"
      note={
        <>
          <Num value={rooms.length} />
          টি ব্যাচে আছেন
        </>
      }
    >
      <RoomGrid>
        {rooms.map(({ batch, course }, i) => (
          <RoomCard key={batch.id} batch={batch} course={course} n={i + 1} />
        ))}
      </RoomGrid>
    </Band>
  );
}

/** Rooms two to a row, ruled; an odd last room leaves a blank beside it rather than a hole. */
function RoomGrid({ children }: { children: React.ReactNode[] }) {
  return (
    <ul data-reveal-group className="grid grid-cols-1 gap-px bg-(--c-line) md:grid-cols-2">
      {children}
      {children.length % 2 === 1 && <li aria-hidden className="hidden bg-(--c-bg) md:block" />}
    </ul>
  );
}

/** A classroom's door: the course picture, the batch's slot, how many classes are behind it, and the next one. */
function RoomCard({ batch, course, n, teacher }: { batch: Batch; course: Course; n: number; teacher?: boolean }) {
  const stage = batchStage(batch, DEMO_NOW);
  const next = nextClass(batch, DEMO_NOW);
  const held = Object.keys(useAcademy((a) => a.attendance[batch.id] ?? NO_WEEKS)).length;
  const href = `/media/academy/classroom/${encodeURIComponent(batch.id)}`;
  return (
    <li data-reveal style={toneStyle(toneOf(course))} className="tone flex flex-col bg-(--c-bg)">
      <div className="flex items-center justify-between gap-4 border-b border-(--c-line) px-6 py-2.5">
        <p className="hud flex items-center gap-2 text-(--c-muted)">
          <span className="bg-(--c-app) px-1.5 font-bold text-black">{twoDigits(n)}</span>
          {getDepartment(course.dept)?.academy.name}
        </p>
        <p className={cn("hud px-1.5 font-bold", stage === "running" ? "bg-(--c-signal) text-black" : "border border-(--c-line) text-(--c-muted)")}>{BATCH_STAGES[stage]}</p>
      </div>
      <Link href={href} aria-label={`${course.title} — ক্লাসরুমে ঢুকুন`} className={cn(frameClass, "aspect-16/7")}>
        <Image src={course.image} alt="" fill sizes="(min-width: 768px) 40rem, 94vw" className="object-cover transition-transform duration-500 group-hover/frame:scale-[1.02] motion-reduce:transition-none" />
      </Link>
      <div className="flex flex-1 flex-col px-6 py-5">
        <h3 className="display text-xl leading-snug text-(--c-ink-strong)">{course.title}</h3>
        <p className="hud mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-(--c-faint)">
          <span className="text-(--c-app-ink)">
            ব্যাচ <Num value={batch.n} /> · {slotOf(batch.day, batch.time)}
          </span>
          <span className="inline-flex items-center gap-1">
            <UsersRound className="size-3.5" aria-hidden /> <Num value={batch.enrolled} />/<Num value={batch.seats} />
          </span>
        </p>
        <div className="mt-4 flex gap-px" aria-label={`${course.lessons.length}টির মধ্যে ${held}টি ক্লাস হয়েছে`}>
          {course.lessons.map((l, i) => (
            <span key={l.week} className={cn("h-1.5 flex-1", i < held ? "bg-(--c-app)" : "bg-(--c-line)")} />
          ))}
        </div>
        <p className="mt-4 flex items-center gap-2 text-sm text-(--c-muted)">
          <CalendarClock className="size-4 shrink-0 text-(--c-accent-ink)" aria-hidden />
          {next ? (
            <span>
              সপ্তাহ <Num value={next.week} />
              -এর ক্লাস · <DateText iso={next.at} time weekday />
            </span>
          ) : stage === "upcoming" ? (
            <span>
              শুরু <DateText iso={batch.starts} />
            </span>
          ) : (
            <span>ক্লাসের সপ্তাহ শেষ — প্রজেক্ট আর প্যানেল</span>
          )}
        </p>
        <div className="mt-auto grid gap-2 pt-5 sm:grid-cols-2">
          <Link href={href} className={cn(primaryBtn, "h-10 w-full")}>
            <DoorOpen className="size-4" aria-hidden /> ক্লাসরুমে ঢুকুন
          </Link>
          <Link href={`${href}/live`} className={actionClass}>
            <Radio className="size-4" aria-hidden /> {teacher ? "লাইভ শুরু করুন" : "লাইভে যোগ দিন"}
          </Link>
        </div>
      </div>
    </li>
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
      <Band id="teach" n={2} label="শেখানো" note="প্যানেল ইন্টারভিউয়ের পর">
        <div className="flex flex-col items-center px-6 py-20 text-center md:py-28">
          <span className="grid size-16 place-items-center border border-(--c-line) text-(--c-accent-ink)">
            <DoorOpen className="size-7" aria-hidden />
          </span>
          <h2 className="display mt-6 max-w-xl text-3xl text-(--c-ink-strong)">
            ক্লাসরুম খোলে <Turn>প্যানেলের</Turn> পর।
          </h2>
          <p className="mt-3 max-w-md leading-relaxed text-(--c-muted)">
            {application ? "আপনার আবেদন জমা আছে। প্যানেল পাস করলে কোর্স বানিয়ে প্রথম ব্যাচের ক্লাসরুম খুলবেন — তারপর ভর্তি শুরু।" : "একাডেমি খুলতে আবেদন করুন — নমুনা ক্লাস আর প্যানেল ইন্টারভিউয়ের পর প্রথম ক্লাসরুম আপনার।"}
          </p>
          <Link href="/media/academy/teach" className={cn(primaryBtn, "mt-8")}>
            {application ? "আবেদনের অবস্থা" : "একাডেমি খুলতে আবেদন"} <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </Band>
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
  const freeDue = t.live.length > 0 && !freeClassDone(videos, t.handle, DEMO_NOW.toISOString());
  const jobs = noNext.length + rollCalls.length + (freeDue ? 1 : 0) + (toMark.length ? 1 : 0) + (t.record.complaints.open ? 1 : 0);

  return (
    <>
      <Band id="teach" n={2} label="শেখানো" note={t.depts.map((d) => d.academy.name).join(" · ")}>
        <div className="flex flex-wrap items-center gap-6 px-6 py-8 md:px-10">
          <PersonAvatar person={t.person} size="xl" className="ring-2 ring-(--c-line-strong)" />
          <div className="min-w-0 flex-1">
            <h2 className="display text-3xl text-(--c-ink-strong)">{t.person.nameBn}</h2>
            <p className="hud mt-2 flex flex-wrap items-center gap-2 text-(--c-muted)">
              <span className="bg-(--c-signal) px-1.5 font-bold text-black">{TIERS[tier]}</span>
              <Num value={points.total} /> পয়েন্ট · {t.record.title}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/media/academy/classroom/open" className={primaryBtn}>
              <Plus className="size-4" aria-hidden /> নতুন ক্লাসরুম
            </Link>
            <Link href="/media/academy/classroom/new" className={secondaryBtn}>
              নতুন কোর্স
            </Link>
          </div>
        </div>
        <dl data-reveal-group className="grid grid-cols-2 gap-px border-t border-(--c-line) bg-(--c-line) lg:grid-cols-4">
          {[
            ["খোলা ক্লাসরুম", <Num key="b" value={mine.filter((b) => batchStage(b, DEMO_NOW) !== "done").length} />, "সব কোর্সের ব্যাচ মিলিয়ে"],
            ["শিক্ষার্থী", <Num key="s" value={students} />, "সব ব্যাচে"],
            ["আয় ছাড় হয়েছে", <Taka key="r" amount={money.released} />, "প্রতি ক্লাসে সেই সপ্তাহের ভাগ"],
            ["এসক্রোতে অপেক্ষায়", <Taka key="w" amount={money.waiting} />, "বাকি ক্লাস হলে ছাড় পাবে"],
          ].map(([k, v, hint]) => (
            <div key={String(k)} data-reveal className="flex flex-col-reverse bg-(--c-bg) px-6 py-6 md:px-8">
              <dd className="hud mt-1 text-(--c-faint)">{hint}</dd>
              <dt className="hud mt-2 text-(--c-muted)">{k}</dt>
              <dd className="display text-3xl leading-none text-(--c-ink-strong) tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
      </Band>

      <Band
        id="today"
        n={3}
        label="আজকের কাজ"
        note={
          jobs ? (
            <>
              <Num value={jobs} />
              টি বাকি
            </>
          ) : (
            "সব শেষ"
          )
        }
      >
        <ul>
          {noNext.map((c) => (
            <Task key={`open-${c.id}`} href={`/media/academy/classroom/open?course=${encodeURIComponent(c.id)}`} Icon={Plus} title={`${c.title} — পরের ব্যাচের ক্লাসরুম খুলুন`} sub="ক্লাসরুম খোলা না থাকলে নতুন কেউ ভর্তি হতে পারে না" />
          ))}
          {freeDue && <Task href="/media/academy/videos?upload=1" Icon={MonitorPlay} title="এ সপ্তাহের বিনামূল্যের ক্লাস ভিডিও তুলুন" sub="প্রতি সপ্তাহে একটা, সবার জন্য — সপ্তাহ শেষ শুক্রবার রাতে" />}
          {rollCalls.map(({ batch, course, lesson }) => (
            <Task key={batch.id} href={`/media/academy/classroom/${encodeURIComponent(batch.id)}?tool=attendance`} Icon={ListChecks} title={`সপ্তাহ ${lesson!.week}-এর হাজিরা নিন — ${lesson!.title}`} sub={`${course.id} · ব্যাচ ${batch.n}`} />
          ))}
          {toMark.length > 0 && <Task href="/media/academy/panel" Icon={ClipboardCheck} title={`${toMark.length}টি ফাইনাল ইন্টারভিউয়ে নম্বর দেওয়া বাকি`} />}
          {t.record.complaints.open > 0 && <Task Icon={ShieldAlert} title={`${t.record.complaints.open}টি অভিযোগ প্যানেলের কাছে — আপনার বক্তব্য চাওয়া হবে`} sub="কে লিখেছেন, তা দেখানো হয় না" />}
          {jobs === 0 && <li className="px-6 py-6 text-(--c-muted) md:px-10">আজ কিছু বাকি নেই।</li>}
        </ul>
      </Band>

      {t.live.map((c, i) => {
        const own = mine.filter((b) => b.course === c.id).sort((a, b) => a.starts.localeCompare(b.starts));
        return (
          <Band key={c.id} id={`c-${c.id}`} n={4 + i} label={c.id} note={c.title}>
            {own.length > 0 ? (
              <RoomGrid>
                {own.map((b, j) => (
                  <RoomCard key={b.id} batch={b} course={c} n={j + 1} teacher />
                ))}
              </RoomGrid>
            ) : (
              <p className="px-6 py-8 text-(--c-muted) md:px-10">এই কোর্সের কোনো ক্লাসরুম খোলা নেই।</p>
            )}
            <div className="border-t border-(--c-line) px-6 py-4 md:px-10">
              <Link href={`/media/academy/classroom/open?course=${encodeURIComponent(c.id)}`} className="hud inline-flex items-center gap-1.5 font-bold text-(--c-accent-ink) underline-offset-4 hover:underline">
                <Plus className="size-3.5" aria-hidden /> নতুন ব্যাচ খুলুন
              </Link>
            </div>
          </Band>
        );
      })}

      {t.drafts.length > 0 && (
        <Band id="drafts" n={4 + t.live.length} label="অনুমোদনের অপেক্ষায়" note="প্যানেল ৭২ ঘণ্টায় দেখবে">
          <ul>
            {t.drafts.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-5 border-b border-(--c-line) px-6 py-5 last:border-b-0 md:px-10">
                <span className="relative aspect-video w-28 shrink-0 overflow-hidden bg-(--c-bg-sunken)">
                  <Image src={c.image} alt="" fill sizes="7rem" className="object-cover" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="hud block font-mono text-(--c-accent-ink)">{c.id}</span>
                  <span className="display block truncate text-lg text-(--c-ink-strong)">{c.title}</span>
                  <span className="hud text-(--c-faint)">অনুমোদনের পর প্রথম ক্লাসরুম খুলবেন</span>
                </span>
                <Link href={`/media/academy/classroom/${encodeURIComponent(c.id)}`} className={cn(secondaryBtn, "h-10 px-4")}>
                  উপকরণ যোগ করুন
                </Link>
              </li>
            ))}
          </ul>
        </Band>
      )}
    </>
  );
}

function Task({ href, Icon, title, sub }: { href?: string; Icon: typeof Plus; title: string; sub?: string }) {
  const body = (
    <>
      <span className="grid size-10 shrink-0 place-items-center border border-(--c-line) text-(--c-accent-ink)">
        <Icon className="size-4.5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-(--c-ink-strong)">{title}</span>
        {sub && <span className="hud text-(--c-faint)">{sub}</span>}
      </span>
      {href && <ArrowUpRight className="size-4 shrink-0 text-(--c-muted) transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />}
    </>
  );
  return (
    <li className="border-b border-(--c-line) last:border-b-0">
      {href ? (
        <Link href={href} className="group flex items-center gap-4 px-6 py-4 transition-colors duration-150 hover:bg-(--c-bg-raised) md:px-10">
          {body}
        </Link>
      ) : (
        <div className="flex items-center gap-4 px-6 py-4 md:px-10">{body}</div>
      )}
    </li>
  );
}
