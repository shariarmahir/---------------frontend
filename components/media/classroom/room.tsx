"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Copy, Crown, GraduationCap, KeyRound, LogIn, Settings2, UserRoundCheck } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { sampleClassroom } from "@/data/media/classroom";
import { DEMO_NOW } from "@/data/media/clock";
import { LEVELS, examAlert, nextExam, syllabusProgress } from "@/lib/media/classroom";
import { roleOf } from "@/lib/media/notices";
import { isFull } from "@/lib/media/teamwork";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { EmptyState } from "../ui/empty-state";
import { Num } from "../ui/numerals";
import { BoardTab, ChallengeTab } from "./board";
import { PapersTab } from "./papers";
import { RankingTab } from "./ranking";
import { NoticeBoard } from "./notice-board";
import { TeamSettingsDialog } from "./team-settings";
import { DutyTab, ExamTab, ShowTab } from "./team-tabs";
import { PlanTab, TodayTab } from "./today-plan";
import { bdToday } from "../research/use-research";
import { classNow, editClassroom, joinClassroom, nameOf, useClassroom, useMe, type RoomProps } from "./use-classroom";

const TABS = [
  { key: "today", label: "আজ", Tab: TodayTab },
  { key: "plan", label: "রুটিন ও সিলেবাস", Tab: PlanTab },
  { key: "duty", label: "দায়িত্বের পালা", Tab: DutyTab },
  { key: "board", label: "নোট বোর্ড", Tab: BoardTab },
  { key: "challenge", label: "চ্যালেঞ্জ", Tab: ChallengeTab },
  { key: "show", label: "উদ্ভাবন", Tab: ShowTab },
  { key: "exam", label: "পরীক্ষা", Tab: ExamTab },
  { key: "papers", label: "প্রশ্নপত্র", Tab: PapersTab },
  { key: "ranking", label: "র‍্যাংকিং", Tab: RankingTab },
] as const;

export type TabKey = (typeof TABS)[number]["key"];

export function ClassroomRoom({ id }: { id: string }) {
  const hydrated = useHydrated();
  const me = useMe();
  const { room, joined } = useClassroom(id);
  const [tab, setTab] = useState<TabKey>("today");
  const reduce = useReducedMotion();

  if (!room) {
    return hydrated ? (
      <EmptyState icon="posts" title="ক্লাসরুম পাওয়া যায়নি" body="লিংকটি পুরোনো, অথবা ক্লাসটি অন্য অ্যাকাউন্টে তৈরি।" action={<Link href="/media/classroom" className={mediaButton()}>সব ক্লাসরুম</Link>} />
    ) : (
      <Skeleton className="h-72 rounded-3xl" />
    );
  }

  const member = joined && Boolean(me && (room.members.some((m) => m.id === me.id) || room.teacherId === me.id));
  const role = roleOf(room, me?.id, member);
  const props: RoomProps = { room, me, member, leader: role === "leader" || role === "teacher", teacher: role === "teacher", role };
  const Active = TABS.find((t) => t.key === tab)!.Tab;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="space-y-6 print:hidden">
        <Hero {...props} />
        <NoticeBoard
          notices={room.notices ?? []}
          role={role}
          meId={me?.id}
          name={(nid) => nameOf(room, nid)}
          today={bdToday(classNow(room.id))}
          subjects={[...new Set(room.routine.map((s) => s.subject).filter(Boolean))]}
          // Notes saved by older versions may have no title.
          items={[...room.notes.filter((n) => n.kind === "homework").map((n) => n.title), ...room.exams.map((e) => e.title)].filter(Boolean)}
          onChange={(fn) => editClassroom(room.id, (r) => ({ ...r, notices: fn(r.notices ?? []) }))}
        />
      </div>

      <nav aria-label="ক্লাসরুমের অংশ" className="sticky top-[var(--sticky-top,4rem)] z-30 -mx-3 bg-white/90 px-3 py-2 backdrop-blur-md sm:mx-0 sm:rounded-2xl sm:px-2 print:hidden">
        <ul className="flex gap-1 overflow-x-auto scrollbar-none">
          {TABS.map((t) => (
            <li key={t.key} className="shrink-0">
              <button
                type="button"
                onClick={() => setTab(t.key)}
                aria-current={tab === t.key ? "page" : undefined}
                className={cn(
                  "relative isolate min-h-10 rounded-xl px-4 text-sm font-bold whitespace-nowrap [-webkit-tap-highlight-color:transparent] transition-[color,scale] duration-200 active:scale-95",
                  tab === t.key ? "text-m-ink" : "text-m-ink/75 hover:text-m-ink",
                )}
              >
                {tab === t.key && (
                  <motion.span
                    layoutId="class-tab"
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 40, mass: 0.7 }}
                    className="absolute inset-0 -z-10 rounded-xl bg-m-yellow shadow-[0_10px_24px_-14px_var(--color-signal-orange)]"
                    aria-hidden
                  />
                )}
                {t.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div key={tab} className="live-in">
        <Active {...props} onTab={setTab} />
      </div>
    </div>
  );
}

function Hero({ room, me, member, leader, teacher }: RoomProps) {
  const [settings, setSettings] = useState(false);
  const full = isFull(room.members.length, room.maxMembers);
  const progress = syllabusProgress(room.topics);
  const next = nextExam(room.exams, DEMO_NOW);
  return (
    <section className="live-in overflow-hidden rounded-3xl bg-m-yellow text-m-ink shadow-[0_30px_70px_-40px_var(--color-signal-orange)]">
      <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0 space-y-4">
          <Link href="/media/classroom" className="group inline-flex items-center gap-1.5 text-sm font-bold">
            <ArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-1" aria-hidden /> সব ক্লাসরুম
          </Link>
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="inline-flex items-center gap-1 rounded-full bg-m-card px-2.5 py-1 text-m-blue">
              <GraduationCap className="size-3.5" aria-hidden /> {LEVELS[room.level].bn}
            </span>
            {sampleClassroom(room.id) && <span className="rounded-full bg-m-card/10 px-2.5 py-1 ring-1 ring-m-ink/25">নমুনা ক্লাস</span>}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">{room.name}</h1>
          <p className="text-sm font-semibold text-m-ink/80">{room.institution}</p>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-m-card px-3 py-2 font-bold text-m-ink">
              <Crown className="size-4 text-m-blue" aria-hidden /> সিআর: {nameOf(room, room.leaderId)}
            </span>
            {room.teacher && (
              <span className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 font-semibold ring-1 ring-m-ink/35">
                <UserRoundCheck className="size-4" aria-hidden /> শিক্ষক: {room.teacher.name} · {room.teacher.subject}
              </span>
            )}
            <CodeChip code={room.code} />
            {leader && room.teacherCode && !teacher && <CodeChip code={room.teacherCode} label="শিক্ষক কোড" />}
            <span className={cn("inline-flex items-center rounded-xl px-3 py-2 font-semibold", full ? "bg-m-card text-m-blue" : "ring-1 ring-m-ink/35")}>
              <Num value={room.members.length} />{room.maxMembers ? <>/<Num value={room.maxMembers} /></> : null}&nbsp;জন{full && " · পূর্ণ"}
            </span>
            {leader && (
              <button type="button" onClick={() => setSettings(true)} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 font-bold ring-1 ring-m-ink/35 transition-[background-color,scale] duration-200 hover:bg-m-card/10 active:scale-95">
                <Settings2 className="size-4" aria-hidden /> সেটিংস
              </button>
            )}
          </div>
          {!member && me && (
            <button
              type="button"
              disabled={full}
              onClick={() => joinClassroom(room.id, me) && toast.success("ক্লাসে যোগ দিলেন", { description: "নোট, চ্যালেঞ্জ আর প্রশ্নপত্রে এখন অংশ নিতে পারবেন, দায়িত্বের পালাতেও নাম উঠবে।" })}
              className={mediaButton({ variant: "tile", size: "lg" })}
            >
              <LogIn aria-hidden /> {full ? "ক্লাস পূর্ণ — সিআরকে বলুন" : "এই ক্লাসে যোগ দিন"}
            </button>
          )}
          {leader && (
            <TeamSettingsDialog
              open={settings}
              onOpenChange={setSettings}
              kind="classroom"
              name={room.name}
              maxMembers={room.maxMembers}
              members={room.members}
              leaderId={room.leaderId}
              canPickLeader={teacher}
              onSave={(d) =>
                editClassroom(room.id, (r) => ({
                  ...r,
                  name: d.name,
                  leaderId: d.leaderId ?? r.leaderId,
                  maxMembers: d.maxMembers,
                  members: d.members.map((m) => r.members.find((x) => x.id === m.id) ?? { ...m, stats: { notes: 0, solved: 0, helped: 0, assess: 0 } }),
                }))
              }
            />
          )}
          {teacher ? (
            <p className="text-xs font-bold text-m-ink/75">আপনি এই ক্লাসের শিক্ষক — প্রশ্নপত্র, পরীক্ষা, নোটিশ আর সেটিংস সবই আপনার হাতে।</p>
          ) : leader ? (
            <p className="text-xs font-bold text-m-ink/75">আপনি এই ক্লাসের লিডার — রুটিন, সিলেবাস আর পরীক্ষা আপনি সাজান। শিক্ষককে “শিক্ষক কোড” দিন।</p>
          ) : null}
          {leader && !room.teacher && <p className="rounded-xl bg-m-red px-3 py-2 text-sm font-bold text-m-on">শিক্ষক যোগ করা বাধ্যতামূলক — র‍্যাংকিং ট্যাবের “শিক্ষকের নজরে” থেকে যোগ করুন।</p>}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Meter
            value={next ? Math.max(0, 100 - next.days * 3) : 0}
            big={next ? <Num value={next.days} /> : "—"}
            unit={next ? "দিন বাকি" : "পরীক্ষা নেই"}
            caption={next?.exam.title ?? "রুটিনে পরীক্ষা যোগ করুন"}
            tone={next && examAlert(next.days) !== "calm" ? "alert" : "ink"}
          />
          <Meter value={progress} big={<><Num value={progress} />%</>} unit="সিলেবাস শেষ" caption={`${room.topics.filter((t) => t.done).length}/${room.topics.length} টপিক`} tone="green" />
        </div>
      </div>
    </section>
  );
}

/** A ring that fills on load: exam countdown or syllabus meter. */
function Meter({ value, big, unit, caption, tone }: { value: number; big: React.ReactNode; unit: string; caption: string; tone: "ink" | "green" | "alert" }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const fill = { ink: "var(--color-text-primary)", green: "var(--color-bd-green)", alert: "var(--color-national-crimson)" }[tone];
  return (
    <figure className="flex w-36 flex-col items-center rounded-2xl bg-m-card p-3 text-center text-m-ink shadow-m-ink sm:w-40">
      <div className="relative size-28">
        <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden>
          <circle cx="60" cy="60" r={r} fill="none" stroke="rgb(255 255 255 / 0.12)" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke={tone === "ink" ? "var(--color-signal-orange)" : fill}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - Math.min(100, value) / 100)}
            className="meter-fill"
          />
        </svg>
        <span className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl leading-none font-bold">{big}</span>
          <span className="mt-1 text-[11px] text-m-ink/70">{unit}</span>
        </span>
      </div>
      <figcaption className={cn("mt-2 line-clamp-2 text-xs font-semibold", tone === "alert" ? "text-m-red" : "text-m-ink/80")}>{caption}</figcaption>
    </figure>
  );
}

function CodeChip({ code, label }: { code: string; label?: string }) {
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard?.writeText(code).then(() => toast.success(`${label ?? "ক্লাস কোড"} কপি হলো`, { description: code }), () => {})}
      className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 font-mono font-bold tracking-widest ring-1 ring-m-ink/35 transition-[background-color,scale] duration-200 hover:bg-m-card/10 active:scale-95"
      title={`${label ?? "ক্লাস কোড"} কপি করুন`}
    >
      {label ? <KeyRound className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
      {label && <span className="font-sans text-xs tracking-normal">{label}</span>} {code}
    </button>
  );
}

export type ClassTab = (props: RoomProps & { onTab: (t: TabKey) => void }) => React.ReactNode;
