"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, DoorOpen, Lock, Radio, UsersRound } from "lucide-react";
import { departments, getCourse, getDepartment, rosterOf } from "@/data/media/academy";
import { DEMO_NOW } from "@/data/media/clock";
import { personOrThrow } from "@/data/media/users";
import { useAuth } from "@/lib/auth/client";
import type { ClassVideo, Course } from "@/lib/media/academy";
import { BATCH_STAGES, batchStage, nextClass, slotOf, type Batch } from "@/lib/media/batch";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { Num } from "../../ui/numerals";
import { PersonAvatar } from "../../ui/person";
import { Band, BandTitle } from "../catalogue/band";
import { primaryBtn, secondaryBtn } from "../catalogue/buttons";
import { CatalogueFooter } from "../catalogue/catalogue-footer";
import { CatalogueNav } from "../catalogue/catalogue-nav";
import { CatalogueRoot } from "../catalogue/catalogue-root";
import { CatalogueRuler } from "../catalogue/ruler";
import { TabStrip } from "../catalogue/tab-strip";
import { toneStyle } from "../catalogue/tones";
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
const TOOLS: { id: Tool; label: string }[] = [
  { id: "room", label: "ক্লাসরুম" },
  { id: "attendance", label: "হাজিরা" },
  { id: "materials", label: "উপকরণ" },
  { id: "money", label: "আয়" },
];
const NO_WEEKS: Record<number, string[]> = {};

/**
 * A batch's classroom, in the catalogue's frame: the course and batch with
 * the way into the live class, then the room as four ruled cells — the
 * syllabus down the left, the week's recording across the top, the batch's
 * chat and the lecture panel beneath. Its learners and its academy's
 * teachers may come in; the course's lead teacher also gets the roll call,
 * the materials and the money as tabs.
 */
export function ClassroomRoom({ id }: { id: string }) {
  const hydrated = useHydrated();
  const t = useTeacher();
  const all = useBatches();
  const batch = all.find((b) => b.id === id);
  const draft = t.drafts.find((c) => c.id === id);
  const course = batch && getCourse(batch.course);

  return (
    <CatalogueRoot className="min-h-full">
      <CatalogueNav />
      <CatalogueRuler />
      {!hydrated ? (
        <Band id="room" n={1} label="ক্লাসরুম" now>
          <span aria-hidden className="block h-[40rem] animate-pulse bg-(--c-bg-sunken)" />
        </Band>
      ) : draft ? (
        <DraftRoom course={draft} />
      ) : !batch || !course ? (
        <Closed title="এই ক্লাসরুম পাওয়া গেল না" body="লিংকটা পুরোনো হতে পারে, বা ব্যাচটা এই ডিভাইসে খোলা হয়নি।" />
      ) : (
        <Room batch={batch} course={course} />
      )}
      <CatalogueFooter />
    </CatalogueRoot>
  );
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
    const other = enrollment && (enrollment.batch ?? course.id) !== batch.id ? (enrollment.batch ?? course.id) : null;
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
    <>
      <Band id="intro" n={1} label="ক্লাসরুম" now note={dept?.academy.name}>
        <div style={toneStyle(departments.findIndex((d) => d.id === course.dept))} className="tone flex flex-wrap items-end justify-between gap-8 px-6 py-10 md:px-10 md:py-12">
          <div className="min-w-0">
            <Link href="/media/academy/classroom" data-reveal data-in className="hud group inline-flex items-center gap-1.5 text-(--c-muted) hover:text-(--c-ink-strong)">
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" aria-hidden /> সব ক্লাসরুম
            </Link>
            <BandTitle as="h1" now className="mt-5 text-3xl sm:text-4xl md:text-5xl">
              {course.title}
            </BandTitle>
            <p data-reveal data-in className="hud mt-4 flex flex-wrap items-center gap-2">
              <span className="bg-(--c-app) px-2 py-0.5 font-bold text-black">
                ব্যাচ <Num value={batch.n} />
              </span>
              <span className="text-(--c-app-ink)">{slotOf(batch.day, batch.time)}</span>
              <span className={cn("px-1.5 py-0.5 font-bold", stage === "running" ? "bg-(--c-signal) text-black" : "border border-(--c-line) text-(--c-muted)")}>{BATCH_STAGES[stage]}</span>
              {lead ? <span className="text-(--c-faint)">আপনি শিক্ষক</span> : member && !mine ? <span className="text-(--c-faint)">একাডেমির সদস্য</span> : null}
            </p>
          </div>
          <div data-reveal data-in className="flex flex-wrap items-center gap-5">
            <span className="flex items-center gap-3">
              <span className="flex -space-x-2" aria-hidden>
                <PersonAvatar person={personOrThrow(course.teacher)} size="sm" className="ring-2 ring-(--c-bg)" />
                {roster.map((s) => (
                  <PersonAvatar key={s.id} person={{ nameBn: s.name, initials: s.name.slice(0, 1), tone: "green" }} size="sm" className="ring-2 ring-(--c-bg)" />
                ))}
              </span>
              <span className="hud inline-flex items-center gap-1 text-(--c-muted)">
                <UsersRound className="size-3.5" aria-hidden /> <Num value={batch.enrolled} />/<Num value={batch.seats} />
              </span>
            </span>
            <Link href={`/media/academy/classroom/${encodeURIComponent(batch.id)}/live`} className={primaryBtn}>
              <Radio className="size-4" aria-hidden /> {lead ? "লাইভ ক্লাস শুরু করুন" : "লাইভ ক্লাসে যোগ দিন"}
            </Link>
          </div>
        </div>
        {lead && <TabStrip label="শিক্ষকের কাজ" idBase="tool" value={tool} onChange={setTool} tabs={TOOLS} className="border-t" />}
      </Band>

      <Band
        id="desk"
        n={2}
        label={TOOLS.find((x) => x.id === tool)!.label}
        note={
          <>
            সপ্তাহ <Num value={week} /> · {lesson.title}
          </>
        }
      >
        <div id="tool-panel" role={lead ? "tabpanel" : undefined}>
          {tool === "attendance" ? (
            <div className="p-6 md:p-10">
              <AttendanceSheet key={batch.id} course={asBatchCourse} />
            </div>
          ) : tool === "materials" ? (
            <div className="p-6 md:p-10">
              <MaterialsDesk course={course} />
            </div>
          ) : tool === "money" ? (
            <Earnings course={course} batch={batch} />
          ) : (
            <div className="grid gap-px bg-(--c-line) xl:h-[calc(100dvh-8rem)] xl:min-h-[46rem] xl:grid-cols-[19rem_minmax(0,1fr)_21rem] xl:grid-rows-[minmax(0,1.15fr)_minmax(0,1fr)]">
              <SyllabusRail name={first} course={course} batch={batch} week={week} onWeek={setWeek} done={done} videos={course.lessons.length} className="order-3 max-h-[40rem] xl:order-none xl:row-span-2 xl:max-h-none" />
              <RoomPlayer key={week} batch={batch} course={course} lesson={lesson} video={videoOf(week)} teacher={lead} poster={course.image} className="order-1 xl:order-none xl:col-span-2" />
              <RoomChat batch={batch} className="order-4 xl:order-none" />
              <LecturePanel course={course} batch={batch} week={week} onWeek={setWeek} videoOf={videoOf} enrollment={mine ? enrollment : undefined} className="order-2 max-h-[32rem] xl:order-none xl:max-h-none" />
            </div>
          )}
        </div>
      </Band>
    </>
  );
}

/** A draft waiting for the panel: only its materials, until it is approved and a classroom opens. */
function DraftRoom({ course }: { course: Course }) {
  return (
    <>
      <Band id="intro" n={1} label="অনুমোদনের অপেক্ষায়" now note={<span className="font-mono">{course.id}</span>}>
        <div className="px-6 py-12 md:px-10 md:py-16">
          <Link href="/media/academy/classroom" data-reveal data-in className="hud group inline-flex items-center gap-1.5 text-(--c-muted) hover:text-(--c-ink-strong)">
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" aria-hidden /> সব ক্লাসরুম
          </Link>
          <BandTitle as="h1" now className="mt-5 text-3xl sm:text-4xl md:text-5xl">
            {course.title}
          </BandTitle>
          <p data-reveal data-in className="mt-5 max-w-2xl leading-relaxed text-(--c-muted)">
            প্যানেল ৭২ ঘণ্টার মধ্যে পাঠক্রম দেখে অনুমোদন দেবে। তারপর প্রথম ব্যাচের ক্লাসরুম খুলবেন — সেখান থেকেই ভর্তি শুরু। এর মধ্যে উপকরণ তৈরি রাখুন।
          </p>
        </div>
      </Band>
      <Band id="materials" n={2} label="উপকরণ">
        <div className="p-6 md:p-10">
          <MaterialsDesk course={course} />
        </div>
      </Band>
    </>
  );
}

function Closed({ title, body, action }: { title: string; body: string; action?: { href: string; label: string } }) {
  return (
    <Band id="closed" n={1} label="ক্লাসরুম" now>
      <div className="flex flex-col items-center px-6 py-24 text-center">
        <span className="grid size-14 place-items-center border border-(--c-line) text-(--c-accent-ink)">
          <Lock className="size-6" aria-hidden />
        </span>
        <h1 className="display mt-6 max-w-xl text-3xl text-(--c-ink-strong)">{title}</h1>
        <p className="mt-3 max-w-md text-(--c-muted)">{body}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {action && (
            <Link href={action.href} className={primaryBtn}>
              {action.label}
            </Link>
          )}
          <Link href="/media/academy/classroom" className={secondaryBtn}>
            <DoorOpen className="size-4" aria-hidden /> সব ক্লাসরুম
          </Link>
        </div>
      </div>
    </Band>
  );
}
