"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, Banknote, ClipboardList, DoorOpen, FolderOpen, LayoutGrid, Lock, Radio, UsersRound } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getCourse, getDepartment, rosterOf } from "@/data/media/academy";
import { DEMO_NOW } from "@/data/media/clock";
import { useAuth } from "@/lib/auth/client";
import type { ClassVideo, Course } from "@/lib/media/academy";
import { BATCH_STAGES, batchStage, nextClass, slotOf, type Batch } from "@/lib/media/batch";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../../ui/button-styles";
import { Num } from "../../ui/numerals";
import { PersonAvatar } from "../../ui/person";
import { personOrThrow } from "@/data/media/users";
import { AttendanceSheet } from "../desk/attendance-sheet";
import { MaterialsDesk } from "../desk/materials-desk";
import { useTeacher } from "../desk/use-teacher";
import { useAcademy } from "../use-academy";
import { useVideos } from "../videos/use-videos";
import { Earnings } from "./earnings";
import { RoomChat } from "./room-chat";
import { LecturePanel, SyllabusRail } from "./room-panels";
import { RoomPlayer } from "./room-player";
import { teaches, useBatches } from "./use-batches";

type Tool = "room" | "attendance" | "materials" | "money";
const TOOLS: { id: Tool; label: string; Icon: typeof LayoutGrid }[] = [
  { id: "room", label: "ক্লাসরুম", Icon: LayoutGrid },
  { id: "attendance", label: "হাজিরা", Icon: ClipboardList },
  { id: "materials", label: "উপকরণ", Icon: FolderOpen },
  { id: "money", label: "আয়", Icon: Banknote },
];
const NO_WEEKS: Record<number, string[]> = {};

/**
 * A batch's classroom, laid out like a course site's learning dashboard:
 * the syllabus down the left, the week's recording across the top with the
 * next live class, the batch's chat and the lecture panel beneath. Its
 * learners and its academy's teachers may come in; the course's lead
 * teacher also gets the roll call, the materials and the money here.
 */
export function ClassroomRoom({ id }: { id: string }) {
  const hydrated = useHydrated();
  const t = useTeacher();
  const all = useBatches();
  const batch = all.find((b) => b.id === id);
  const draft = t.drafts.find((c) => c.id === id);

  if (!hydrated) return <Skeleton className="mx-auto h-[40rem] max-w-[96rem] rounded-[2rem] bg-m-ink/6" />;
  if (draft) return <DraftRoom course={draft} />;
  const course = batch && getCourse(batch.course);
  if (!batch || !course) return <Closed title="এই ক্লাসরুম পাওয়া গেল না" body="লিংকটা পুরোনো হতে পারে, বা ব্যাচটা এই ডিভাইসে খোলা হয়নি।" />;
  return <Room batch={batch} course={course} />;
}

function Room({ batch, course }: { batch: Batch; course: Course }) {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const { account } = useAuth();
  const t = useTeacher();
  const enrollment = useAcademy((a) => a.enrolled[course.id]);
  const held = useAcademy((a) => a.attendance[batch.id] ?? NO_WEEKS);
  const videos = useVideos();
  const lead = course.teacher === t.handle;
  const member = teaches(course);
  const mine = Boolean(enrollment) && (enrollment!.batch ?? course.id) === batch.id;
  const next = nextClass(batch, DEMO_NOW);
  const [week, setWeek] = useState(next?.week ?? 1);

  const videoOf = useMemo(() => {
    const own = videos.filter((v) => v.course === course.id && !v.short);
    return (w: number): ClassVideo | undefined => own.find((v) => v.week === w && v.href) ?? own.find((v) => v.week === w);
  }, [videos, course.id]);

  if (!member && !mine) {
    const other = enrollment && (enrollment.batch ?? course.id) !== batch.id ? enrollment.batch ?? course.id : null;
    return (
      <Closed
        title="এই ক্লাসরুম ব্যাচের শিক্ষার্থী আর শিক্ষকদের"
        body={other ? "আপনি এই কোর্সের অন্য ব্যাচে আছেন — নিজের ক্লাসরুমে যান।" : "কোর্সে ভর্তি হলে আপনার ব্যাচের ক্লাসরুম খুলবে।"}
        action={other ? { href: `/media/academy/classroom/${encodeURIComponent(other)}`, label: "আমার ক্লাসরুম" } : { href: `/media/academy/course/${course.id}`, label: "কোর্সটা দেখুন" }}
      />
    );
  }

  const asked = params.get("tool") as Tool | null;
  const tool: Tool = lead && asked && TOOLS.some((x) => x.id === asked) ? asked : "room";
  const setTool = (x: Tool) => router.replace(x === "room" ? path : `${path}?tool=${x}`, { scroll: false });
  const stage = batchStage(batch, DEMO_NOW);
  const dept = getDepartment(course.dept);
  const done = (w: number) => (lead ? Boolean(held[w]) : Boolean(enrollment?.attended.includes(w)));
  const roster = rosterOf({ id: course.id, enrolled: Math.min(batch.enrolled, 4) });
  const first = (account?.name ?? t.person.nameBn).trim().split(/\s+/)[0];
  const lesson = course.lessons.find((l) => l.week === week) ?? course.lessons[0];
  const asBatchCourse: Course = { ...course, id: batch.id, enrolled: batch.enrolled };

  return (
    <div className="mx-auto max-w-[96rem] pb-10">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <Link href="/media/academy/classroom" className="group inline-flex min-h-8 items-center gap-1.5 text-sm font-semibold text-m-blue">
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" aria-hidden /> ক্লাসরুম
          </Link>
          <p className="text-sm font-semibold text-m-ink/60">{dept?.academy.name}</p>
          <h1 className="text-[clamp(1.5rem,2.6vw,2.1rem)] leading-tight font-bold text-m-ink">{course.title}</h1>
          <p className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full bg-m-ink px-2.5 py-0.5 font-bold text-m-on">
              ব্যাচ <Num value={batch.n} />
            </span>
            <span className="font-semibold text-m-blue">{slotOf(batch.day, batch.time)}</span>
            <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", stage === "running" ? "bg-m-amber-soft text-m-gold" : "bg-white text-m-ink/70 ring-1 ring-m-ink/10")}>{BATCH_STAGES[stage]}</span>
            {lead ? <span className="text-xs font-semibold text-m-ink/55">আপনি শিক্ষক</span> : member && !mine ? <span className="text-xs font-semibold text-m-ink/55">একাডেমির সদস্য</span> : null}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2">
            <span className="flex -space-x-2" aria-hidden>
              <PersonAvatar person={personOrThrow(course.teacher)} size="sm" className="ring-2 ring-m-ground" />
              {roster.map((s) => (
                <PersonAvatar key={s.id} person={{ nameBn: s.name, initials: s.name.slice(0, 1), tone: "green" }} size="sm" className="ring-2 ring-m-ground" />
              ))}
            </span>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-m-ink/65">
              <UsersRound className="size-4" aria-hidden /> <Num value={batch.enrolled} />/<Num value={batch.seats} />
            </span>
          </span>
          <Link href={`/media/academy/classroom/${encodeURIComponent(batch.id)}/live`} className={mediaButton({ className: "h-11" })}>
            <Radio aria-hidden /> {lead ? "লাইভ ক্লাস শুরু করুন" : "লাইভ ক্লাসে যোগ দিন"}
          </Link>
        </div>
      </header>

      {lead && (
        <div role="tablist" aria-label="শিক্ষকের কাজ" className="mb-4 inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-white p-1 shadow-m-tile ring-1 ring-m-ink/8 scrollbar-none">
          {TOOLS.map(({ id, label, Icon }) => (
            <button key={id} type="button" role="tab" aria-selected={tool === id} onClick={() => setTool(id)} className={cn("inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors", tool === id ? "bg-m-blue text-m-on" : "text-m-ink/75 hover:text-m-ink")}>
              <Icon className="size-4" aria-hidden /> {label}
            </button>
          ))}
        </div>
      )}

      {tool === "attendance" ? (
        <AttendanceSheet key={batch.id} course={asBatchCourse} />
      ) : tool === "materials" ? (
        <MaterialsDesk course={course} />
      ) : tool === "money" ? (
        <Earnings course={course} batch={batch} />
      ) : (
        // The frame: one glassy sheet holding the four parts.
        <div className="rounded-[2rem] bg-white/55 p-2 shadow-m-lift ring-1 ring-white backdrop-blur-sm sm:p-2.5">
          <div className="grid gap-2 sm:gap-2.5 xl:h-[calc(100dvh-15rem)] xl:min-h-[42rem] xl:grid-cols-[19rem_minmax(0,1fr)_21rem] xl:grid-rows-[minmax(0,1.1fr)_minmax(0,1fr)]">
            <SyllabusRail name={first} course={course} batch={batch} week={week} onWeek={setWeek} done={done} videos={course.lessons.length} className="order-3 max-h-[40rem] xl:order-none xl:row-span-2 xl:max-h-none" />
            <RoomPlayer key={week} batch={batch} course={course} lesson={lesson} video={videoOf(week)} teacher={lead} poster={course.image} className="order-1 xl:order-none xl:col-span-2" />
            <RoomChat batch={batch} className="order-4 xl:order-none" />
            <LecturePanel course={course} batch={batch} week={week} onWeek={setWeek} videoOf={videoOf} enrollment={mine ? enrollment : undefined} className="order-2 max-h-[32rem] xl:order-none xl:max-h-none" />
          </div>
        </div>
      )}
    </div>
  );
}

/** A draft waiting for the panel: only its materials, until it is approved and a classroom opens. */
function DraftRoom({ course }: { course: Course }) {
  return (
    <div className="mx-auto max-w-5xl pb-10">
      <Link href="/media/academy/classroom" className="group mb-3 inline-flex min-h-8 items-center gap-1.5 text-sm font-semibold text-m-blue">
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" aria-hidden /> ক্লাসরুম
      </Link>
      <p className="font-mono text-sm font-bold text-m-blue">{course.id}</p>
      <h1 className="text-2xl font-bold text-balance text-m-ink sm:text-[2rem] sm:leading-tight">{course.title}</h1>
      <p className="my-5 rounded-2xl bg-white p-4 text-sm leading-relaxed text-m-ink/80 shadow-m-tile ring-1 ring-m-blue/30">প্যানেল ৭২ ঘণ্টার মধ্যে পাঠক্রম দেখে অনুমোদন দেবে। তারপর প্রথম ব্যাচের ক্লাসরুম খুলবেন — সেখান থেকেই ভর্তি শুরু। এর মধ্যে উপকরণ তৈরি রাখুন।</p>
      <MaterialsDesk course={course} />
    </div>
  );
}

function Closed({ title, body, action }: { title: string; body: string; action?: { href: string; label: string } }) {
  return (
    <section className="mx-auto mt-6 grid max-w-md place-items-center rounded-3xl bg-white px-6 py-12 text-center shadow-m-tile ring-1 ring-m-ink/8">
      <span className="grid size-14 place-items-center rounded-2xl bg-m-blue-soft text-m-blue">
        <Lock className="size-6" aria-hidden />
      </span>
      <h1 className="mt-4 text-xl font-bold text-m-ink">{title}</h1>
      <p className="mt-1.5 text-[15px] text-m-ink/70">{body}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {action && (
          <Link href={action.href} className={mediaButton()}>
            {action.label}
          </Link>
        )}
        <Link href="/media/academy/classroom" className={mediaButton({ variant: "outline" })}>
          <DoorOpen aria-hidden /> সব ক্লাসরুম
        </Link>
      </div>
    </section>
  );
}
