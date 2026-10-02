"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Copy, Crown, GraduationCap, LogIn, UserRoundCheck } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { sampleClassroom } from "@/data/media/classroom";
import { DEMO_NOW } from "@/data/media/clock";
import { LEVELS, examAlert, nextExam, syllabusProgress } from "@/lib/media/classroom";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { EmptyState } from "../ui/empty-state";
import { Num } from "../ui/numerals";
import { BoardTab, ChallengeTab } from "./board";
import { PapersTab } from "./papers";
import { RankingTab } from "./ranking";
import { PlanTab, TodayTab } from "./today-plan";
import { joinClassroom, nameOf, useClassroom, useMe, type RoomProps } from "./use-classroom";

const TABS = [
  { key: "today", label: "আজ", Tab: TodayTab },
  { key: "plan", label: "রুটিন ও সিলেবাস", Tab: PlanTab },
  { key: "board", label: "নোট বোর্ড", Tab: BoardTab },
  { key: "challenge", label: "চ্যালেঞ্জ", Tab: ChallengeTab },
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

  const member = joined && Boolean(me && room.members.some((m) => m.id === me.id));
  const props: RoomProps = { room, me, member, leader: member && room.leaderId === me?.id };
  const Active = TABS.find((t) => t.key === tab)!.Tab;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Hero {...props} />

      <nav aria-label="ক্লাসরুমের অংশ" className="sticky top-16 z-30 -mx-3 bg-black/85 px-3 py-2 backdrop-blur-md sm:mx-0 sm:rounded-2xl sm:px-2">
        <ul className="flex gap-1 overflow-x-auto scrollbar-none">
          {TABS.map((t) => (
            <li key={t.key} className="shrink-0">
              <button
                type="button"
                onClick={() => setTab(t.key)}
                aria-current={tab === t.key ? "page" : undefined}
                className={cn(
                  "relative isolate min-h-10 rounded-xl px-4 text-sm font-bold whitespace-nowrap [-webkit-tap-highlight-color:transparent] transition-[color,scale] duration-200 active:scale-95",
                  tab === t.key ? "text-text-primary" : "text-white/75 hover:text-white",
                )}
              >
                {tab === t.key && (
                  <motion.span
                    layoutId="class-tab"
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 40, mass: 0.7 }}
                    className="absolute inset-0 -z-10 rounded-xl bg-signal-orange shadow-[0_10px_24px_-14px_var(--color-signal-orange)]"
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

function Hero({ room, me, member, leader }: RoomProps) {
  const progress = syllabusProgress(room.topics);
  const next = nextExam(room.exams, DEMO_NOW);
  return (
    <section className="live-in overflow-hidden rounded-3xl bg-signal-orange text-text-primary shadow-[0_30px_70px_-40px_var(--color-signal-orange)]">
      <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0 space-y-4">
          <Link href="/media/classroom" className="group inline-flex items-center gap-1.5 text-sm font-bold">
            <ArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-1" aria-hidden /> সব ক্লাসরুম
          </Link>
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="inline-flex items-center gap-1 rounded-full bg-text-primary px-2.5 py-1 text-signal-orange">
              <GraduationCap className="size-3.5" aria-hidden /> {LEVELS[room.level].bn}
            </span>
            {sampleClassroom(room.id) && <span className="rounded-full bg-text-primary/10 px-2.5 py-1 ring-1 ring-text-primary/25">নমুনা ক্লাস</span>}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">{room.name}</h1>
          <p className="text-sm font-semibold text-text-primary/80">{room.institution}</p>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-text-primary px-3 py-2 font-bold text-white">
              <Crown className="size-4 text-signal-orange" aria-hidden /> সিআর: {nameOf(room, room.leaderId)}
            </span>
            {room.teacher && (
              <span className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 font-semibold ring-1 ring-text-primary/35">
                <UserRoundCheck className="size-4" aria-hidden /> {room.teacher.name} · {room.teacher.subject}
              </span>
            )}
            <CodeChip code={room.code} />
          </div>
          {!member && me && (
            <button
              type="button"
              onClick={() => joinClassroom(room.id, me) && toast.success("ক্লাসে যোগ দিলেন", { description: "নোট, চ্যালেঞ্জ আর প্রশ্নপত্রে এখন অংশ নিতে পারবেন।" })}
              className={mediaButton({ variant: "tile", size: "lg" })}
            >
              <LogIn aria-hidden /> এই ক্লাসে যোগ দিন
            </button>
          )}
          {leader && <p className="text-xs font-bold text-text-primary/75">আপনি এই ক্লাসের লিডার — রুটিন, সিলেবাস আর পরীক্ষা আপনি সাজান।</p>}
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
    <figure className="flex w-36 flex-col items-center rounded-2xl bg-text-primary p-3 text-center text-white shadow-ink sm:w-40">
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
          <span className="mt-1 text-[11px] text-white/70">{unit}</span>
        </span>
      </div>
      <figcaption className={cn("mt-2 line-clamp-2 text-xs font-semibold", tone === "alert" ? "text-crimson-bright" : "text-white/80")}>{caption}</figcaption>
    </figure>
  );
}

function CodeChip({ code }: { code: string }) {
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard?.writeText(code).then(() => toast.success("কোড কপি হলো", { description: code }), () => {})}
      className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 font-mono font-bold tracking-widest ring-1 ring-text-primary/35 transition-[background-color,scale] duration-200 hover:bg-text-primary/10 active:scale-95"
      title="ক্লাস কোড কপি করুন"
    >
      <Copy className="size-4" aria-hidden /> {code}
    </button>
  );
}

export type ClassTab = (props: RoomProps & { onTab: (t: TabKey) => void }) => React.ReactNode;
