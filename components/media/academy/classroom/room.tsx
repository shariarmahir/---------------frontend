"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BellRing,
  ClipboardCheck,
  FolderUp,
  Gamepad2,
  GraduationCap,
  Network,
  DoorOpen,
  FolderOpen,
  LayoutDashboard,
  Lock,
  MessagesSquare,
  PlayCircle,
  Radio,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { getCourse, getDepartment, rosterOf } from "@/data/media/academy";
import { DEMO_NOW } from "@/data/media/clock";
import { personOrThrow } from "@/data/media/users";
import { useAuth } from "@/lib/auth/client";
import type { ClassVideo, Course } from "@/lib/media/academy";
import { nextClass, type Batch } from "@/lib/media/batch";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { Tx } from "../../ui/language";
import { Band, BandTitle } from "../catalogue/band";
import { primaryBtn, secondaryBtn } from "../catalogue/buttons";
import { CatalogueNav } from "../catalogue/catalogue-nav";
import { CatalogueRoot } from "../catalogue/catalogue-root";
import { AttendanceSheet } from "../desk/attendance-sheet";
import { MaterialsDesk } from "../desk/materials-desk";
import { useTeacher } from "../desk/use-teacher";
import { useAcademy } from "../use-academy";
import { useVideos } from "../videos/use-videos";
import { BoardView, useBoard } from "./board-view";
import { Dashboard } from "./dashboard";
import { ExamsView, useExams, useLeader } from "./exams-view";
import { MindMap } from "./mind-map";
import { NotesView } from "./notes-view";
import { QuizView } from "./quiz-view";
import { Earnings } from "./earnings";
import { RoomChat } from "./room-chat";
import { LecturePanel } from "./room-panels";
import { RoomPlayer } from "./room-player";
import { teaches, useBatches } from "./use-batches";

type Tool = "dashboard" | "lessons" | "chat" | "board" | "exams" | "notes" | "map" | "quiz" | "attendance" | "materials" | "money";
/** The classroom's side menu: the board, the lessons and the batch chat for everyone, then the teacher's three desks. */
const TOOLS: { id: Tool; label: string; Icon: LucideIcon; teacher?: boolean }[] = [
  { id: "dashboard", label: "ড্যাশবোর্ড", Icon: LayoutDashboard },
  { id: "lessons", label: "পাঠ ও ফাইল", Icon: PlayCircle },
  { id: "chat", label: "ব্যাচের আড্ডা", Icon: MessagesSquare },
  { id: "board", label: "নোটিশ বোর্ড", Icon: BellRing },
  { id: "exams", label: "পরীক্ষা ও লিডার", Icon: GraduationCap },
  { id: "notes", label: "নোট ও ফাইল", Icon: FolderUp },
  { id: "map", label: "মাইন্ড ম্যাপ", Icon: Network },
  { id: "quiz", label: "খেলা ও কুইজ", Icon: Gamepad2 },
  { id: "attendance", label: "হাজিরা", Icon: ClipboardCheck, teacher: true },
  { id: "materials", label: "উপকরণ", Icon: FolderOpen, teacher: true },
  { id: "money", label: "আয়", Icon: Wallet, teacher: true },
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
    <CatalogueRoot className="classroom-room min-h-full">
      <CatalogueNav />
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
  const notices = useBoard(batch.id);
  const leaderId = useLeader(batch.id);
  const exams = useExams(batch.id);
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
  const tool: Tool = asked && TOOLS.some((x) => x.id === asked && (lead || !x.teacher)) ? asked : "dashboard";
  const setTool = (x: Tool) => router.replace(x === "dashboard" ? path : `${path}?tool=${x}`, { scroll: false });
  const dept = getDepartment(course.dept);
  const done = (w: number) => (lead ? Boolean(held[w]) : Boolean(enrollment?.attended.includes(w)));
  const roster = rosterOf({ id: course.id, enrolled: Math.min(batch.enrolled, 4) });
  const me = account?.name ?? t.person.nameBn;

  const teacher = personOrThrow(course.teacher);
  const people = [...roster, { id: "me", name: me }];
  const leader = people.find((p) => p.id === leaderId) ?? roster[0];

  const lesson = course.lessons.find((l) => l.week === week) ?? course.lessons[0];
  const asBatchCourse: Course = { ...course, id: batch.id, enrolled: batch.enrolled };

  return (
    <>
      <Band wide id="desk" rulerLabel="ক্লাসরুম" now>
        <div className="grid grid-cols-[minmax(0,1fr)] md:grid-cols-[13rem_minmax(0,1fr)] xl:grid-cols-[15rem_minmax(0,1fr)]">
          <aside className="min-w-0 border-b border-(--c-line) bg-(--c-bg-raised) md:min-h-[calc(100dvh-4rem)] md:border-r md:border-b-0">
            <nav aria-label="ক্লাসরুমের মেনু" className="no-scrollbar flex gap-1 overflow-x-auto p-3 md:sticky md:top-16 md:flex-col md:p-4">
              {TOOLS.filter((x) => lead || !x.teacher).map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTool(id)}
                  aria-current={tool === id ? "page" : undefined}
                  className={cn(
                    "flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-bold whitespace-nowrap transition-colors duration-150",
                    tool === id ? "bg-(--c-blue) text-white" : "text-(--c-muted) hover:bg-(--c-bg-sunken) hover:text-(--c-ink-strong)",
                  )}
                >
                  <Icon className="size-4.5" aria-hidden />
                  <Tx k={label} />
                </button>
              ))}
              <Link
                href={`/media/academy/classroom/${encodeURIComponent(batch.id)}/live`}
                className="flex shrink-0 items-center gap-3 rounded-xl bg-(--c-signal) px-3.5 py-2.5 text-sm font-bold whitespace-nowrap text-black md:mt-4"
              >
                <Radio className="size-4.5" aria-hidden />
                <Tx k={lead ? "লাইভ ক্লাস শুরু করুন" : "লাইভ ক্লাসে যোগ দিন"} />
              </Link>
              <Link
                href="/media/academy/classroom"
                className="flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold whitespace-nowrap text-(--c-muted) hover:bg-(--c-bg-sunken) hover:text-(--c-ink-strong)"
              >
                <DoorOpen className="size-4.5" aria-hidden />
                <Tx k="সব ক্লাসরুম" />
              </Link>
            </nav>
          </aside>

          <div key={tool} id="tool-panel" className="fade-in min-w-0">
            {tool === "dashboard" ? (
              <Dashboard
                batch={batch}
                course={course}
                current={next?.week ?? course.lessons.length + 1}
                done={done}
                me={me}
                photo={account?.photo ?? undefined}
                teacher={teacher.nameBn}
                leader={leader?.name}
                roster={roster}
                academy={dept?.academy.name}
                teacherView={lead}
                notices={notices}
                exams={exams}
                onOpenExams={() => setTool("exams")}

                onOpenBoard={() => setTool("board")}
                onOpenWeek={(w) => {
                  setWeek(w);
                  setTool("lessons");
                }}
                onOpenChat={() => setTool("chat")}
              />
            ) : tool === "attendance" ? (
              <div className="p-6 md:p-10">
                <AttendanceSheet key={batch.id} course={asBatchCourse} />
              </div>
            ) : tool === "materials" ? (
              <div className="p-6 md:p-10">
                <MaterialsDesk course={course} />
              </div>
            ) : tool === "money" ? (
              <Earnings course={course} batch={batch} />
            ) : tool === "chat" ? (
              <RoomChat batch={batch} pinner={lead} className="h-[80dvh] min-h-[28rem] xl:h-[calc(100dvh-4rem)]" />
            ) : tool === "board" ? (
              <BoardView batch={batch} course={course} lead={lead} me={me} />
            ) : tool === "exams" ? (
              <ExamsView batch={batch} lead={lead} me={me} roster={roster} />
            ) : tool === "notes" ? (
              <NotesView batch={batch} lead={lead} me={me} />
            ) : tool === "quiz" ? (
              <QuizView batch={batch} lead={lead} />
            ) : tool === "map" ? (
              <MindMap
                batch={batch}
                course={course}
                current={next?.week ?? course.lessons.length + 1}
                done={done}
                onOpenWeek={(w) => {
                  setWeek(w);
                  setTool("lessons");
                }}
              />
            ) : (
              <div className="grid grid-cols-1 gap-px bg-(--c-line) xl:h-[calc(100dvh-4rem)] xl:grid-cols-[minmax(0,1fr)_24rem]">
                <RoomPlayer key={week} batch={batch} course={course} lesson={lesson} video={videoOf(week)} teacher={lead} poster={course.image} className="xl:min-h-[24rem]" />
                <LecturePanel
                  course={course}
                  batch={batch}
                  week={week}
                  onWeek={setWeek}
                  videoOf={videoOf}
                  enrollment={mine ? enrollment : undefined}
                  className="max-h-[32rem] xl:max-h-none"
                />
              </div>
            )}
          </div>
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
