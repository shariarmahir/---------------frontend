"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, CalendarClock, Check, Compass, PencilLine, Plus, Share2, Target, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Team } from "@/data/media/types";
import { goalProgress, goalState, MAX_GOALS, MISSION_MAX, missionProblem, sortGoals, TITLE_MAX, toggleGoal, validDay, type GoalState, type TeamGoal, type TeamRoom } from "@/lib/media/team-room";
import { newId, useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { DateText, Num, useNumerals } from "../ui/numerals";
import { bdToday } from "../research/use-research";
import { editTeamRoom, shareTeamPost } from "./use-team-room";

const STATE_CHIP: Record<GoalState, { bn: string; cls: string }> = {
  done: { bn: "পূরণ হয়েছে", cls: "bg-bd-green text-white" },
  late: { bn: "সময় পেরিয়েছে", cls: "bg-national-crimson text-white" },
  soon: { bn: "এই সপ্তাহে", cls: "bg-signal-orange text-text-primary" },
  open: { bn: "চলছে", cls: "bg-white/10 text-white/80" },
};

/** "১৫ নভেম্বর" for a caption built in code. */
function useDay() {
  const { numerals } = useNumerals();
  return (day: string) =>
    new Intl.DateTimeFormat(numerals === "bn" ? "bn-BD" : "bn-BD-u-nu-latn", { day: "numeric", month: "long", timeZone: "Asia/Dhaka" }).format(new Date(`${day}T00:00:00+06:00`));
}

export function MissionGoalsTab({ team, room, canEdit }: { team: Team; room: TeamRoom; canEdit: boolean }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
      <Mission team={team} room={room} canEdit={canEdit} />
      <Goals team={team} room={room} canEdit={canEdit} />
    </div>
  );
}

function Mission({ team, room, canEdit }: { team: Team; room: TeamRoom; canEdit: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(room.mission);
  const [tried, setTried] = useState(false);
  const problem = missionProblem(draft);

  function save(e: React.FormEvent) {
    e.preventDefault();
    setTried(true);
    if (problem) return;
    const text = draft.trim();
    // A changed mission is a new one: the old feed post no longer speaks for it.
    editTeamRoom(team.id, (r) => ({ ...r, mission: text, missionPostId: text === r.mission ? r.missionPostId : undefined }));
    setEditing(false);
    toast.success("মিশন রাখা হলো");
  }

  function share() {
    const postId = shareTeamPost(team, { kind: "mission", title: "আমাদের মিশন", body: room.mission });
    if (!postId || !editTeamRoom(team.id, (r) => ({ ...r, missionPostId: postId }))) return toast.error("এই ব্রাউজারে আর জায়গা নেই");
    toast.success("মিশন ফিডে গেল", { action: { label: "দেখুন", onClick: () => router.push(`/media/post/${postId}`) } });
  }

  return (
    <section aria-labelledby="mission-title" className="relative isolate overflow-hidden rounded-3xl bg-signal-orange p-5 text-text-primary shadow-[0_30px_70px_-40px_var(--color-signal-orange)] sm:p-7 lg:sticky lg:top-[calc(var(--sticky-top,4rem)+4.5rem)]">
      <Compass className="pointer-events-none absolute -right-6 -bottom-8 -z-10 size-44 text-text-primary/8 motion-safe:animate-[spin_60s_linear_infinite]" aria-hidden />
      <h2 id="mission-title" className="flex items-center gap-2 text-sm font-bold tracking-wide"><Compass className="size-4.5" aria-hidden /> আমাদের মিশন</h2>
      {editing ? (
        <form onSubmit={save} noValidate className="mt-4 space-y-3">
          <label className="block">
            <span className="sr-only">মিশন</span>
            <Textarea rows={4} maxLength={MISSION_MAX} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="কেন এই দল — কী বদলাতে চান, কার জন্য" className="!bg-text-primary text-white" aria-invalid={tried && Boolean(problem)} />
          </label>
          {tried && problem && <p className="text-xs font-bold">{problem}</p>}
          <div className="flex flex-wrap gap-2">
            <button type="submit" className={mediaButton({ variant: "tile" })}><Check aria-hidden /> রাখুন</button>
            <button type="button" onClick={() => { setEditing(false); setDraft(room.mission); setTried(false); }} className="inline-flex h-11 items-center rounded-xl px-4 text-sm font-bold ring-1 ring-text-primary/35 hover:bg-text-primary/10">বাতিল</button>
          </div>
        </form>
      ) : room.mission ? (
        <blockquote className="mt-4 text-xl leading-snug font-bold text-balance sm:text-2xl">“{room.mission}”</blockquote>
      ) : (
        <p className="mt-4 text-lg font-bold text-text-primary/75">{canEdit ? "দলের মিশন এখনো লেখা হয়নি — এক-দুই বাক্যে লিখুন, কেন এই দল।" : "দলটা মিশন লিখলে এখানে দেখা যাবে।"}</p>
      )}
      {!editing && (canEdit || room.missionPostId) && (
        <div className="mt-5 flex flex-wrap gap-2">
          {canEdit && (
            <button type="button" onClick={() => { setDraft(room.mission); setEditing(true); }} className={mediaButton({ variant: "tile", size: "sm" })}>
              <PencilLine aria-hidden /> {room.mission ? "বদলান" : "মিশন লিখুন"}
            </button>
          )}
          {room.missionPostId ? (
            <Link href={`/media/post/${room.missionPostId}`} className="inline-flex h-9 items-center gap-1 rounded-xl px-3 text-sm font-bold ring-1 ring-text-primary/35 hover:bg-text-primary/10">ফিডে দেখুন <ArrowUpRight className="size-4" aria-hidden /></Link>
          ) : canEdit && room.mission ? (
            <button type="button" onClick={share} className="inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm font-bold ring-1 ring-text-primary/35 transition-colors hover:bg-text-primary/10"><Share2 className="size-4" aria-hidden /> ফিডে শেয়ার</button>
          ) : null}
        </div>
      )}
    </section>
  );
}

function Goals({ team, room, canEdit }: { team: Team; room: TeamRoom; canEdit: boolean }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const day = useDay();
  const today = bdToday(new Date());
  const { done, total, pct } = goalProgress(room.goals);
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [error, setError] = useState("");

  function add(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (t.length < 4) return setError("লক্ষ্যটা অন্তত ৪ অক্ষরে লিখুন।");
    if (due && !validDay(due)) return setError("তারিখটা ঠিক নেই।");
    if (room.goals.length >= MAX_GOALS) return setError(`সর্বোচ্চ ${MAX_GOALS}টি লক্ষ্য — পূরণ হওয়া কোনোটা সরান।`);
    const goal: TeamGoal = { id: newId("g"), title: t, done: false, ...(due ? { due } : {}) };
    editTeamRoom(team.id, (r) => ({ ...r, goals: [...r.goals, goal] }));
    setTitle("");
    setDue("");
    setError("");
  }

  function flip(g: TeamGoal) {
    editTeamRoom(team.id, (r) => toggleGoal(r, g.id, new Date().toISOString()));
    if (!g.done) toast.success("লক্ষ্য পূরণ!", { description: "দলের সবাইকে জানাতে “ফিডে শেয়ার” চাপুন।" });
  }

  function share(g: TeamGoal) {
    const body = g.done
      ? "আমরা লক্ষ্যটা পূরণ করেছি — যাঁরা পাশে ছিলেন, সবাইকে ধন্যবাদ।"
      : `এটাই এখন আমাদের লক্ষ্য${g.due ? `, শেষ দিন ${day(g.due)}` : ""}। সাহায্য করতে পারলে টিম রুমে আসুন।`;
    const postId = shareTeamPost(team, { kind: "goal", title: g.done ? `পূরণ: ${g.title}` : g.title, body });
    if (!postId || !editTeamRoom(team.id, (r) => ({ ...r, goals: r.goals.map((x) => (x.id === g.id ? { ...x, postId } : x)) }))) return toast.error("এই ব্রাউজারে আর জায়গা নেই");
    toast.success("লক্ষ্য ফিডে গেল", { action: { label: "দেখুন", onClick: () => router.push(`/media/post/${postId}`) } });
  }

  return (
    <section aria-labelledby="goals-title" className="space-y-4 rounded-3xl bg-text-primary p-5 ring-1 ring-white/12 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="goals-title" className="flex items-center gap-2 text-xl font-bold text-white"><Target className="size-5 text-signal-orange" aria-hidden /> লক্ষ্য</h2>
        <p className="text-sm font-semibold text-white/70"><Num value={done} />/<Num value={total} /> পূরণ</p>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="লক্ষ্য পূরণ">
        <div className="h-full rounded-full bg-gradient-to-r from-bd-green to-signal-orange transition-[width] duration-700" style={{ width: `${pct}%` }} />
      </div>

      {room.goals.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/12 p-5 text-center text-sm text-white/65">{canEdit ? "প্রথম লক্ষ্যটা লিখুন — মাপা যায় এমন, তারিখসহ।" : "এখনো কোনো লক্ষ্য নেই।"}</p>
      ) : (
        <ul className="space-y-2">
          {sortGoals(room.goals).map((g) => {
            const state = hydrated ? goalState(g, today) : g.done ? "done" : "open";
            return (
              <li key={g.id} className={cn("live-in flex items-start gap-3 rounded-2xl p-3 ring-1 transition-colors", g.done ? "bg-bd-green/15 ring-bd-green/40" : "bg-white/4 ring-white/10")}>
                {canEdit ? (
                  <button type="button" onClick={() => flip(g)} aria-pressed={g.done} aria-label={g.done ? `${g.title} — আবার খুলুন` : `${g.title} — পূরণ হয়েছে`} className={cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg ring-2 transition-[background-color,scale] duration-200 active:scale-90", g.done ? "bg-bd-green text-white ring-bd-green" : "text-transparent ring-white/30 hover:ring-signal-orange")}>
                    <Check className="size-4" strokeWidth={3} aria-hidden />
                  </button>
                ) : (
                  <span className={cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg", g.done ? "bg-bd-green text-white" : "ring-2 ring-white/20")} aria-hidden>{g.done && <Check className="size-4" strokeWidth={3} />}</span>
                )}
                <div className="min-w-0 flex-1">
                  <p className={cn("font-semibold", g.done ? "text-white/70 line-through decoration-bd-green decoration-2" : "text-white")}>{g.title}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                    <span className={cn("rounded-full px-2 py-0.5 font-bold", STATE_CHIP[state].cls)}>{STATE_CHIP[state].bn}</span>
                    {g.due && !g.done && <span className="inline-flex items-center gap-1 text-white/65"><CalendarClock className="size-3.5" aria-hidden /><DateText iso={g.due} /></span>}
                    {g.done && g.doneAt && <span className="text-white/60"><DateText iso={g.doneAt} /></span>}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {g.postId ? (
                    <Link href={`/media/post/${g.postId}`} className="grid size-8 place-items-center rounded-lg text-signal-orange hover:bg-white/10" title="ফিডে দেখুন"><ArrowUpRight className="size-4" aria-hidden /><span className="sr-only">ফিডে দেখুন</span></Link>
                  ) : canEdit ? (
                    <button type="button" onClick={() => share(g)} className="grid size-8 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-signal-orange" title="ফিডে শেয়ার"><Share2 className="size-4" aria-hidden /><span className="sr-only">ফিডে শেয়ার</span></button>
                  ) : null}
                  {canEdit && (
                    <button type="button" onClick={() => editTeamRoom(team.id, (r) => ({ ...r, goals: r.goals.filter((x) => x.id !== g.id) }))} className="grid size-8 place-items-center rounded-lg text-white/45 hover:bg-white/10 hover:text-white" title="সরান">
                      <Trash2 className="size-4" aria-hidden /><span className="sr-only">লক্ষ্য সরান</span>
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {canEdit && room.goals.length < MAX_GOALS && (
        <form onSubmit={add} noValidate className="space-y-2 border-t border-white/10 pt-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="min-w-0 flex-1">
              <span className="sr-only">নতুন লক্ষ্য</span>
              <Input value={title} maxLength={TITLE_MAX} onChange={(e) => { setTitle(e.target.value); setError(""); }} placeholder="নতুন লক্ষ্য — যেমন: ১০০ জন ব্যবহারকারী" />
            </label>
            <label className="sm:w-44">
              <span className="sr-only">শেষ তারিখ (ঐচ্ছিক)</span>
              <Input type="date" value={due} min={hydrated ? today : undefined} onChange={(e) => { setDue(e.target.value); setError(""); }} />
            </label>
            <button type="submit" className={mediaButton({ variant: "primary" })}><Plus aria-hidden /> যোগ</button>
          </div>
          {error && <p role="alert" className="text-xs font-semibold text-crimson-bright">{error}</p>}
        </form>
      )}
    </section>
  );
}
