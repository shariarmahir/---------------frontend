"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowUpRight, BookOpenText, CalendarDays, Check, FileStack, ListTodo, Microscope, Newspaper, PenLine, Printer, Rocket, Vote, X } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import type { Post } from "@/data/media/types";
import { currentUser } from "@/data/media/users";
import { canShare, checklist, chosenTopic, readiness, type Check as CheckItem, type ResearchProject } from "@/lib/media/research-project";
import { SHARE_KINDS, shareCaption, shareTags, type SharedRef } from "@/lib/media/showcase";
import { newId, updateMedia, useHydrated, useMediaState } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { editClassroom, useMe } from "../classroom/use-classroom";
import { editLab } from "../classroom/use-lab";
import { mediaButton } from "../ui/button-styles";
import { EmptyState } from "../ui/empty-state";
import { Num } from "../ui/numerals";
import { ResearchPaper } from "./paper";
import { bdToday, editProject, roomClock, useProject } from "./use-research";
import { FilesStep, Guide, PlanStep, TasksStep, TopicStep, WriteStep, type StepProps } from "./workspace-steps";

const STEPS = [
  { key: "topic", bn: "বিষয় বাছাই", Icon: Vote },
  { key: "plan", bn: "সময়সূচি", Icon: CalendarDays },
  { key: "tasks", bn: "কাজ ভাগ", Icon: ListTodo },
  { key: "files", bn: "ফাইল ও ডেটা", Icon: FileStack },
  { key: "write", bn: "লেখা", Icon: PenLine },
  { key: "share", bn: "শেয়ার ও প্রকাশ", Icon: Rocket },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

/** Is the viewer in the room this research came from (as a member or its teacher)? */
function useInRoom(p: ResearchProject | undefined, meId?: string): boolean {
  const room = useMediaState((s) => (p ? (p.from.kind === "lab" ? s.labs[p.from.id] : s.classrooms[p.from.id]) : undefined));
  return Boolean(room && meId && (room.members.some((m) => m.id === meId) || room.teacherId === meId));
}

/** A research, open inside its room's উদ্ভাবন tab; `onBack` returns to the list. */
export function ResearchWorkspace({ id, onBack }: { id: string; onBack: () => void }) {
  const hydrated = useHydrated();
  const me = useMe();
  const p = useProject(id);
  const inRoom = useInRoom(p, me?.id);
  const [picked, setPicked] = useState<StepKey | null>(null);
  const [paper, setPaper] = useState(false);

  if (!hydrated) return <Skeleton className="h-[40rem] rounded-3xl" />;
  if (!p) return <EmptyState icon="posts" title="গবেষণাটি পাওয়া যায়নি" body="এটি হয়তো অন্য ব্রাউজারে শুরু হয়েছিল।" action={<button type="button" onClick={onBack} className={mediaButton()}>ফিরে যান</button>} />;
  if (paper) return <ResearchPaper p={p} onBack={() => setPaper(false)} />;

  const now = roomClock(p.from);
  const today = bdToday(now);
  const inTeam = Boolean(me && p.members.some((m) => m.id === me.id));
  const lead = me?.id === p.leadId;
  const checks = checklist(p);
  const done = (k: StepKey) => (k === "share" ? Boolean(p.shared?.researchId || p.shared?.postId) : checks.find((c) => c.key === k)!.done);
  const step: StepKey = picked ?? STEPS.find((s) => !done(s.key))?.key ?? "share";
  const topic = chosenTopic(p);
  const pct = readiness(p);
  const name = (mid: string) => p.members.find((m) => m.id === mid)?.name ?? (mid === me?.id ? me.name : "সদস্য");
  const props: StepProps = { p, meId: me?.id, inTeam, lead, today, now, edit: (fn) => editProject(p.id, fn), name };
  const r = 30;
  const c = 2 * Math.PI * r;

  return (
    <div className="space-y-6">
      <button type="button" onClick={onBack} className="inline-flex min-h-8 items-center gap-1.5 text-sm font-semibold text-m-blue">
        <ArrowLeft className="size-4" aria-hidden /> উদ্ভাবনে ফিরুন
      </button>

      <section className="live-in grid gap-5 overflow-hidden rounded-3xl bg-m-card p-5 ring-1 ring-m-ink/10 sm:p-7 md:grid-cols-[minmax(0,1fr)_auto] md:items-center shadow-m-tile">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-m-blue"><Microscope className="size-4" aria-hidden /> দলের গবেষণা</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-balance text-m-ink sm:text-3xl">{topic?.title ?? "বিষয় এখনো ঠিক হয়নি — ভোট চলছে"}</h1>
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="দল">
            {p.members.map((m) => (
              <li key={m.id} className={cn("inline-flex min-h-8 items-center gap-1.5 rounded-full py-0.5 pr-3 pl-0.5 text-xs font-semibold", m.id === me?.id ? "bg-m-yellow text-m-ink" : "bg-m-ink/4 text-m-ink ring-1 ring-m-ink/9")}>
                <span className={cn("flex size-7 items-center justify-center rounded-full text-xs font-bold", m.id === me?.id ? "bg-m-card text-m-blue" : "bg-m-ink/8")}>{Array.from(m.name)[0]}</span>
                {m.id === me?.id ? "আপনি" : m.name.split(/\s+/)[0]}
                {m.id === p.leadId && <span className="opacity-70">· লিড</span>}
              </li>
            ))}
          </ul>
          {!inTeam && me && inRoom && (
            <button
              type="button"
              onClick={() => editProject(p.id, (x) => ({ ...x, members: [...x.members, { id: me.id, name: me.name }] })) && toast.success("গবেষণা দলে যোগ দিলেন", { description: "এখন ভোট দিতে, কাজ নিতে আর লিখতে পারবেন।" })}
              className={mediaButton({ variant: "primary", className: "mt-4" })}
            >
              দলে যোগ দিন
            </button>
          )}
          {!inTeam && !inRoom && <p className="mt-4 text-xs text-m-ink/55">শুধু দেখছেন — অংশ নিতে আগে এই {p.from.kind === "lab" ? "ল্যাবে" : "ক্লাসে"} যোগ দিন।</p>}
        </div>
        <figure className="flex items-center gap-3 md:flex-col md:text-center">
          <div className="relative size-24">
            <svg viewBox="0 0 80 80" className="size-full -rotate-90" aria-hidden>
              <circle cx="40" cy="40" r={r} fill="none" stroke="rgb(255 255 255 / 0.12)" strokeWidth="8" />
              <circle cx="40" cy="40" r={r} fill="none" stroke="var(--color-signal-orange)" strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} className="meter-fill" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-m-ink"><Num value={pct} />%</span>
          </div>
          <figcaption className="text-xs font-semibold text-m-ink/70">শেয়ারের জন্য প্রস্তুত</figcaption>
        </figure>
      </section>

      <nav aria-label="গবেষণার ধাপ" className="rounded-2xl bg-m-card p-1.5 ring-1 ring-m-ink/10 shadow-m-tile">
        <ol className="flex gap-1 overflow-x-auto scrollbar-none">
          {STEPS.map((s, i) => {
            const on = s.key === step;
            const ok = done(s.key);
            return (
              <li key={s.key} className="flex shrink-0 items-center">
                <button
                  type="button"
                  onClick={() => setPicked(s.key)}
                  aria-current={on ? "step" : undefined}
                  className={cn("flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold whitespace-nowrap transition-colors", on ? "bg-m-yellow text-m-ink" : "text-m-ink/75 hover:text-m-ink")}
                >
                  <span className={cn("flex size-6 items-center justify-center rounded-full text-xs", ok ? "bg-m-blue-soft text-m-ink" : on ? "bg-m-card text-m-blue" : "bg-m-ink/6")}>
                    {ok ? <Check className="size-3.5" aria-label="শেষ" /> : <Num value={i + 1} />}
                  </span>
                  {s.bn}
                </button>
                {i < STEPS.length - 1 && <span className={cn("mx-0.5 h-0.5 w-4", ok ? "bg-m-blue-soft" : "bg-m-ink/8")} aria-hidden />}
              </li>
            );
          })}
        </ol>
      </nav>

      <div key={step} className="live-in">
        {step === "topic" && <TopicStep {...props} />}
        {step === "plan" && <PlanStep {...props} />}
        {step === "tasks" && <TasksStep {...props} />}
        {step === "files" && <FilesStep {...props} />}
        {step === "write" && <WriteStep {...props} />}
        {step === "share" && <ShareStep {...props} checks={checks} onGo={setPicked} onPaper={() => { if (!p.shared?.paperAt) editProject(p.id, (x) => ({ ...x, shared: { ...x.shared, paperAt: new Date().toISOString() } })); setPaper(true); }} />}
      </div>
    </div>
  );
}

const CHECK_STEP: Record<CheckItem["key"], StepKey> = { topic: "topic", plan: "plan", tasks: "tasks", files: "files", write: "write" };

/** Record a share on the room it came from, so its উদ্ভাবন tab lists it too. */
function noteOnRoom(p: ResearchProject, ref: SharedRef) {
  const add = <R extends { shares?: SharedRef[] }>(r: R) => ({ ...r, shares: [ref, ...(r.shares ?? []).filter((s) => s.id !== ref.id)] });
  return p.from.kind === "lab" ? editLab(p.from.id, add) : editClassroom(p.from.id, add);
}

function ShareStep({ p, inTeam, checks, onGo, onPaper }: StepProps & { checks: CheckItem[]; onGo: (k: StepKey) => void; onPaper: () => void }) {
  const ready = canShare(p);
  const complete = checks.every((c) => c.done);
  const topic = chosenTopic(p);
  const team = p.members.map((m) => m.name);
  const input = {
    kind: "research" as const,
    title: topic?.title ?? "",
    question: p.write.question,
    method: p.write.method,
    finding: [p.write.result, p.write.conclusion].filter((s) => s.trim()).join("\n\n"),
    team,
    from: p.from,
  };

  function toFeed() {
    const at = new Date().toISOString();
    const post: Post = {
      id: newId("p"),
      kind: "project",
      topic: "research",
      author: currentUser.handle,
      category: SHARE_KINDS.research.category,
      createdAt: at,
      caption: shareCaption(input),
      media: [],
      tags: shareTags(input),
      stats: { likes: 0, shares: 0, views: 0 },
      comments: [],
      from: p.from,
    };
    const ok = updateMedia((s) => ({ ...s, posts: [post, ...s.posts] })) && editProject(p.id, (x) => ({ ...x, shared: { ...x.shared, postId: post.id } }));
    if (!ok) return toast.error("এই ব্রাউজারে আর জায়গা নেই");
    noteOnRoom(p, { id: `sh-${p.id}`, kind: "research", title: input.title, team, at, postId: post.id });
    toast.success("ফিডে শেয়ার হলো", { description: "সবাই দেখবে, মন্তব্য করবে।" });
  }

  return (
    <div className="space-y-5">
      <Guide title="শেয়ার ও প্রকাশ" tips={["প্রশ্ন আর ফলাফল লেখা হলেই ফিডে দেওয়া যায় — দলের নামে, সবাই দেখবে।","সব ধাপ শেষ হলে প্রকাশনার কপি প্রিন্ট বা পিডিএফ করে শিক্ষক, মেলা বা জার্নালে পাঠান।"]} />
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {checks.map((c) => (
          <li key={c.key}>
            <button type="button" onClick={() => onGo(CHECK_STEP[c.key])} className={cn("flex h-full w-full items-start gap-2 rounded-xl p-3 text-left text-sm ring-1 transition-colors", c.done ? "bg-m-blue/13 text-m-ink ring-m-blue/60" : "bg-m-card text-m-ink/80 ring-m-ink/10 hover:ring-m-blue/50")}>
              {c.done ? <Check className="mt-0.5 size-4 shrink-0 text-m-green" aria-hidden /> : <X className="mt-0.5 size-4 shrink-0 text-m-red" aria-hidden />}
              {c.bn}
            </button>
          </li>
        ))}
      </ul>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="flex flex-col gap-3 rounded-2xl bg-m-yellow p-5 text-m-ink">
          <Newspaper className="size-6" aria-hidden />
          <h3 className="text-lg font-bold">ফিডে শেয়ার</h3>
          <p className="text-sm text-m-ink/80">দলের নামে পোস্ট — কেউ হয়তো ডেটা দেবে, কেউ যোগ দিতে চাইবে।</p>
          <div className="mt-auto flex flex-wrap gap-2">
            {p.shared?.postId ? (
              <Link href={`/media/post/${p.shared.postId}`} className={mediaButton({ variant: "tile", size: "sm" })}>ফিডে দেখুন <ArrowUpRight aria-hidden /></Link>
            ) : (
              <button type="button" disabled={!ready || !inTeam} onClick={toFeed} className={mediaButton({ variant: "tile", size: "sm" })}>ফিডে শেয়ার করুন</button>
            )}
          </div>
        </article>
        <article className="flex flex-col gap-3 rounded-2xl bg-m-card p-5 text-m-ink ring-1 ring-m-ink/10 shadow-m-tile">
          <BookOpenText className="size-6 text-m-blue" aria-hidden />
          <h3 className="text-lg font-bold">প্রকাশনা</h3>
          <p className="text-sm text-m-ink/75">{complete ? "গবেষণাপত্রের কাঠামোয় সাজানো কপি — প্রিন্ট বা পিডিএফ করুন।" : "সব ধাপ শেষ হলে গবেষণাপত্রের কপি তৈরি হবে।"}</p>
          <div className="mt-auto">
            {complete ? (
              <button type="button" onClick={onPaper} className={mediaButton({ variant: "outline", size: "sm" })}>
                <Printer aria-hidden /> প্রকাশনার কপি
              </button>
            ) : (
              <span className="text-xs font-semibold text-m-ink/55"><Num value={checks.filter((c) => c.done).length} />/<Num value={checks.length} /> ধাপ শেষ</span>
            )}
          </div>
        </article>
      </div>
      {!ready && <p className="text-sm text-m-ink/60">শেয়ারের আগে বিষয় চূড়ান্ত করুন আর লেখায় প্রশ্ন ও ফলাফল দিন।</p>}
    </div>
  );
}
