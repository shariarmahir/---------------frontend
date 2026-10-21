"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpenCheck, Check, ClipboardList, GraduationCap, ListTodo, NotebookPen, Pin, Plus, Sparkles, Trash2, Trophy, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { HqDialog } from "@/components/hq/dialog";
import { useToday } from "@/components/hq/hooks";
import { Countdown, Empty, FIELD, FormField, hb, inputCls, PageHead, Panel, PanelLink, Pill, Progress, selectCls, textareaCls } from "@/components/hq/kit";
import { useAct, useHq, useNow } from "@/components/hq/provider";
import { clockLabel, dateLabel } from "@/lib/hq/format";
import { dhakaDay, num, PRIORITY_LABEL } from "@/lib/hq/rules";
import { isAdvance, QUICK_SILVER_STREAK, rankFor, RANKS, seasonOf } from "@/lib/hq/scoring";
import type { PersonalNote } from "@/lib/hq/types";
import { cn } from "@/lib/utils";
import { BADGE_LABEL, PRIORITY_TONE, Ring, TicketCard } from "./shared";

const MOODS = ["😫", "😕", "😐", "🙂", "🤩"];

export function TaskBook() {
  const v = useHq();
  const now = useNow(60_000);
  const today = useToday();
  const params = useSearchParams();
  const router = useRouter();
  const me = v.me.person;
  const myTeams = useMemo(() => new Set(v.teams.filter((t) => t.leaderId === me.id || t.memberIds.includes(me.id)).map((t) => t.id)), [v.teams, me.id]);
  const mine = useMemo(() => v.tasks.filter((t) => t.takenBy === me.id || (t.teamId && myTeams.has(t.teamId))), [v.tasks, me.id, myTeams]);
  const active = mine.filter((t) => ["taken", "in-progress", "submitted", "client-review"].includes(t.status)).sort((a, b) => a.due.localeCompare(b.due));
  const submitted = mine.filter((t) => t.takenBy === me.id && t.submittedAt).sort((a, b) => b.submittedAt!.localeCompare(a.submittedAt!));
  let streak = 0;
  for (const t of submitted) {
    if (!isAdvance(t)) break;
    streak++;
  }
  // Runs of early submissions count up to the hat-trick, then start again.
  streak = streak === 0 ? 0 : ((streak - 1) % QUICK_SILVER_STREAK) + 1;
  const season = seasonOf(today);
  const points = v.points.filter((e) => e.personId === me.id && dhakaDay(e.at) >= season.start && dhakaDay(e.at) <= season.end).reduce((s, e) => s + e.points, 0);
  const rank = rankFor(points);
  const next = RANKS[RANKS.findIndex((r) => r.id === rank.id) + 1];
  const badges = v.badges.filter((b) => b.personId === me.id);
  const pins = active.flatMap((t) => t.milestones.filter((m) => dhakaDay(m.at) === today).map((m) => ({ ...m, task: t }))).sort((a, b) => a.at.localeCompare(b.at));
  const matches = v.tasks.filter((t) => t.status === "open" && t.skills.some((s) => me.skills.includes(s))).slice(0, 4);
  const report = v.reports.find((r) => r.personId === me.id && r.day === today);
  const noteOpen = params.get("note") === "1";
  const [editing, setEditing] = useState<PersonalNote | "new" | null>(null);
  const [learning, setLearning] = useState(false);

  return (
    <>
      <PageHead
        title="My TaskBook"
        lead="Your tasks, your timeline, your points. Submit early three times in a row to earn Quick Silver."
        actions={
          <>
            <button type="button" onClick={() => setLearning(true)} className={hb.outline}>
              <GraduationCap aria-hidden className="size-4" /> Request a learning project
            </button>
            <Link href="/hq/tasks" className={hb.gold}>
              <Plus aria-hidden className="size-4" /> Take a ticket
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-6 xl:grid-cols-12">
        <Panel title="Season" icon={Trophy} sub={season.label} field="cobalt" className="md:col-span-3 xl:col-span-4">
          <div className="flex items-center gap-5">
            <Ring value={next ? (points - rank.min) / (next.min - rank.min) : 1} size={120} label={`Rank progress: ${rank.label}`}>
              <span>
                <span className="block font-grotesk text-2xl font-bold text-white">{num(points)}</span>
                <span className="block text-xs text-white/70">points</span>
              </span>
            </Ring>
            <div>
              <p className="font-grotesk text-2xl font-bold text-signal-orange">{rank.label}</p>
              <p className="mt-1 text-sm text-white/75">{next ? `${num(next.min - points)} to ${next.label}` : "Top rank"}</p>
              <p className="mt-2 text-xs text-white/55">Ranks are re-earned every six months.</p>
            </div>
          </div>
        </Panel>

        <Panel title="Quick Silver streak" icon={Zap} className="md:col-span-3 xl:col-span-4">
          <div className="flex items-center gap-3">
            {Array.from({ length: QUICK_SILVER_STREAK }, (_, i) => (
              <span key={i} className={cn("grid size-14 place-items-center rounded-2xl ring-2 transition-colors", i < streak ? "bg-signal-orange text-text-primary ring-signal-orange" : "text-white/30 ring-white/15")}>
                <Zap aria-hidden className="size-6" />
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm text-white/75">{streak >= QUICK_SILVER_STREAK ? "Hat-trick! Keep the run going." : `${streak} of ${QUICK_SILVER_STREAK} early submissions in a row.`}</p>
          <p className="mt-1 text-xs text-white/55">At least an hour before the due time counts as early.</p>
        </Panel>

        <Panel title="Badges" icon={Sparkles} field="ink" className="md:col-span-6 xl:col-span-4">
          {badges.length === 0 ? (
            <p className="text-sm text-white/65">No badges yet — your first Quick Silver is three early submissions away.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {badges.map((b) => (
                <li key={b.id}>
                  <Pill tone="gold">
                    {BADGE_LABEL[b.kind]} · {dateLabel(b.day)}
                  </Pill>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="My active tasks" icon={ClipboardList} className="md:col-span-6 xl:col-span-8">
          {active.length === 0 ? (
            <Empty title="Nothing on your desk" icon={ClipboardList} action={<Link href="/hq/tasks" className={hb.goldSm}>Find a ticket</Link>} />
          ) : (
            <ul className="flex flex-col gap-2">
              {active.map((t) => {
                const done = t.milestones.filter((m) => m.done).length;
                return (
                  <li key={t.id}>
                    <Link href={`/hq/tasks/${t.id}`} className="grid gap-2 rounded-xl bg-black/25 px-4 py-3 ring-1 ring-white/8 transition-colors hover:bg-black/40 sm:grid-cols-[1fr_auto] sm:items-center">
                      <span className="min-w-0">
                        <span className="flex items-center gap-2">
                          <span className="font-mono text-xs text-white/50">{t.code}</span>
                          <Pill tone={PRIORITY_TONE[t.priority]}>{PRIORITY_LABEL[t.priority]}</Pill>
                          {t.status === "submitted" ? <Pill tone="cobalt">In review</Pill> : null}
                          {t.approval === "pending" ? <Pill tone="gold">Awaiting approval</Pill> : null}
                        </span>
                        <span className="mt-1 block truncate font-semibold text-white">{t.title}</span>
                        {t.milestones.length ? <Progress value={(done / t.milestones.length) * 100} className="mt-2 h-1.5" label={`${done} of ${t.milestones.length} milestones`} /> : null}
                      </span>
                      <Countdown to={t.due} className="sm:text-right" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel title="Today's timeline" icon={BookOpenCheck} field="ink" className="md:col-span-6 xl:col-span-4">
          {pins.length === 0 ? (
            <p className="text-sm text-white/60">No milestones today.</p>
          ) : (
            <ol className="relative ml-2 flex flex-col gap-4 border-l-2 border-white/10 pl-5">
              {pins.map((p) => (
                <li key={p.id} className="relative">
                  <span className={cn("absolute top-1 -left-[1.72rem] size-3 rounded-full ring-4 ring-text-primary", p.done ? "bg-signal-orange" : Date.parse(p.at) < now ? "bg-national-crimson" : "bg-bdnavy-300")} />
                  <span className="block font-mono text-xs text-signal-orange">{clockLabel(p.at)}</span>
                  <Link href={`/hq/tasks/${p.task.id}`} className="block text-sm font-semibold text-white hover:text-signal-orange">
                    {p.title}
                  </Link>
                  <span className="block text-xs text-white/55">{p.task.code}</span>
                </li>
              ))}
            </ol>
          )}
        </Panel>

        <DailyReport report={report} taskIds={active.map((t) => t.id)} className="md:col-span-6 xl:col-span-7" />

        <Todos className="md:col-span-6 xl:col-span-5" />

        <Panel
          title="Notes"
          icon={NotebookPen}
          className="md:col-span-6 xl:col-span-12"
          action={
            <button type="button" onClick={() => setEditing("new")} className={hb.quietSm}>
              <Plus aria-hidden className="size-3.5" /> New note
            </button>
          }
        >
          {v.notes.length === 0 ? <p className="text-sm text-white/60">No notes yet.</p> : null}
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[...v.notes]
              .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.at.localeCompare(a.at))
              .map((n) => (
                <li key={n.id}>
                  <button type="button" onClick={() => setEditing(n)} className={cn("flex h-full min-h-32 w-full flex-col gap-2 rounded-2xl p-4 text-left ring-1 ring-white/12 transition-transform hover:-translate-y-0.5 motion-reduce:hover:translate-y-0", FIELD[n.color])}>
                    <span className="flex items-center gap-2 font-grotesk font-bold text-signal-orange">
                      {n.pinned ? <Pin aria-hidden className="size-3.5" /> : null}
                      {n.title || "Untitled"}
                    </span>
                    <span className="line-clamp-5 text-sm whitespace-pre-line text-white/80">{n.body}</span>
                  </button>
                </li>
              ))}
          </ul>
        </Panel>

        <Panel title="Tickets for your skills" icon={Sparkles} className="md:col-span-6 xl:col-span-12" action={<PanelLink href="/hq/tasks">Task board</PanelLink>}>
          {matches.length === 0 ? <p className="text-sm text-white/60">No open tickets match your skills right now.</p> : null}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {matches.map((t, i) => (
              <TicketCard key={t.id} t={t} i={i} />
            ))}
          </div>
        </Panel>
      </div>

      <NoteDialog
        key={editing === "new" || noteOpen ? "new" : (editing?.id ?? "none")}
        note={noteOpen ? "new" : editing}
        onClose={() => {
          setEditing(null);
          if (noteOpen) router.replace("/hq/taskbook", { scroll: false });
        }}
      />
      <LearningDialog open={learning} onOpenChange={setLearning} learning={me.learning} />
    </>
  );
}

function DailyReport({ report, taskIds, className }: { report?: { done: string; blockers: string; tomorrow: string; mood: number; score?: number }; taskIds: string[]; className?: string }) {
  const act = useAct();
  const [f, setF] = useState({ done: report?.done ?? "", blockers: report?.blockers ?? "", tomorrow: report?.tomorrow ?? "", mood: report?.mood ?? 4 });
  return (
    <Panel title="Daily report" icon={ClipboardList} sub={report ? `Sent today${report.score !== undefined ? ` · scored ${report.score}/10` : ""}` : "Not sent yet today"} className={className}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          act("tasks", "report.submit", { ...f, taskIds }, { ok: report ? "Report updated" : "Report sent (+2 points)" }).catch(() => {});
        }}
        className="grid gap-3 sm:grid-cols-2"
      >
        <FormField label="What I did today" className="sm:col-span-2">
          <textarea required value={f.done} onChange={(e) => setF((x) => ({ ...x, done: e.target.value }))} className={textareaCls} />
        </FormField>
        <FormField label="Blockers">
          <textarea value={f.blockers} onChange={(e) => setF((x) => ({ ...x, blockers: e.target.value }))} className={cn(textareaCls, "min-h-20")} />
        </FormField>
        <FormField label="Tomorrow">
          <textarea value={f.tomorrow} onChange={(e) => setF((x) => ({ ...x, tomorrow: e.target.value }))} className={cn(textareaCls, "min-h-20")} />
        </FormField>
        <fieldset className="sm:col-span-2">
          <legend className="text-sm font-semibold text-white/85">Mood</legend>
          <div className="mt-2 flex gap-2">
            {MOODS.map((m, i) => (
              <button key={m} type="button" aria-pressed={f.mood === i + 1} aria-label={`Mood ${i + 1} of 5`} onClick={() => setF((x) => ({ ...x, mood: i + 1 }))} className={cn("grid size-11 place-items-center rounded-xl text-xl ring-1 transition-transform", f.mood === i + 1 ? "scale-110 bg-signal-orange/20 ring-signal-orange" : "ring-white/12 hover:bg-white/5")}>
                {m}
              </button>
            ))}
          </div>
        </fieldset>
        <button type="submit" className={cn(hb.gold, "sm:col-span-2 sm:justify-self-start")}>
          <Check aria-hidden className="size-4" /> {report ? "Update report" : "Send report"}
        </button>
      </form>
    </Panel>
  );
}

function Todos({ className }: { className?: string }) {
  const act = useAct();
  const todos = useHq((v) => v.todos);
  const [text, setText] = useState("");
  const [urgent, setUrgent] = useState(false);
  const sorted = [...todos].sort((a, b) => Number(a.done) - Number(b.done) || Number(Boolean(b.urgent)) - Number(Boolean(a.urgent)));
  return (
    <Panel title="To-do list" icon={ListTodo} sub={`${todos.filter((t) => !t.done).length} left`} className={className}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!text.trim()) return;
          await act("me", "todo.add", { text, urgent }, { quiet: true }).catch(() => {});
          setText("");
          setUrgent(false);
        }}
        className="mb-3 flex gap-2"
      >
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a to-do…" aria-label="New to-do" className={inputCls} />
        <button type="button" aria-pressed={urgent} onClick={() => setUrgent((x) => !x)} className={cn(hb.quietSm, "min-h-11", urgent && "bg-national-crimson text-white ring-national-crimson hover:bg-national-crimson hover:text-white")}>
          Urgent
        </button>
        <button type="submit" aria-label="Add" className={cn(hb.gold, "px-3")}>
          <Plus aria-hidden className="size-4" />
        </button>
      </form>
      <ul className="flex max-h-80 flex-col gap-1.5 overflow-y-auto">
        {sorted.map((t) => (
          <li key={t.id} className="group flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-white/5">
            <button type="button" onClick={() => act("me", "todo.toggle", { id: t.id }, { quiet: true })} aria-label={t.done ? `Mark "${t.text}" not done` : `Mark "${t.text}" done`} className={cn("grid size-6 shrink-0 place-items-center rounded-md ring-2", t.done ? "bg-signal-orange ring-signal-orange" : "ring-white/40")}>
              {t.done ? <Check aria-hidden className="size-4 text-text-primary" /> : null}
            </button>
            <span className={cn("min-w-0 flex-1 text-sm", t.done ? "text-white/40 line-through" : "text-white")}>{t.text}</span>
            {t.urgent && !t.done ? <Pill tone="red">Urgent</Pill> : null}
            <button type="button" onClick={() => act("me", "todo.remove", { id: t.id }, { quiet: true })} aria-label={`Delete "${t.text}"`} className={cn(hb.iconSm, "opacity-100 sm:opacity-0 sm:group-hover:opacity-100")}>
              <Trash2 aria-hidden className="size-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function NoteDialog({ note, onClose }: { note: PersonalNote | "new" | null; onClose: () => void }) {
  const act = useAct();
  const existing = note && note !== "new" ? note : null;
  const [f, setF] = useState({ title: existing?.title ?? "", body: existing?.body ?? "", pinned: existing?.pinned ?? false, color: existing?.color ?? ("navy" as PersonalNote["color"]) });
  return (
    <HqDialog
      open={note !== null}
      onOpenChange={(o) => !o && onClose()}
      title={existing ? "Edit note" : "New note"}
      footer={
        <>
          {existing ? (
            <button type="button" onClick={() => act("me", "note.remove", { id: existing.id }, { ok: "Note deleted" }).then(onClose, () => {})} className={hb.quiet}>
              <Trash2 aria-hidden className="size-4" /> Delete
            </button>
          ) : null}
          <button type="button" onClick={() => act("me", "note.save", { ...f, id: existing?.id }, { ok: "Note saved" }).then(onClose, () => {})} className={hb.gold}>
            Save
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <FormField label="Title">
          <input value={f.title} onChange={(e) => setF((x) => ({ ...x, title: e.target.value }))} className={inputCls} autoFocus />
        </FormField>
        <FormField label="Note">
          <textarea value={f.body} onChange={(e) => setF((x) => ({ ...x, body: e.target.value }))} className={cn(textareaCls, "min-h-40")} />
        </FormField>
        <div className="flex flex-wrap items-center gap-3">
          {(["navy", "ink", "cobalt"] as const).map((c) => (
            <button key={c} type="button" aria-pressed={f.color === c} aria-label={`${c} note`} onClick={() => setF((x) => ({ ...x, color: c }))} className={cn("size-9 rounded-xl ring-2", FIELD[c], f.color === c ? "ring-signal-orange" : "ring-white/15")} />
          ))}
          <label className="ml-auto flex items-center gap-2 text-sm text-white/80">
            <input type="checkbox" checked={f.pinned} onChange={(e) => setF((x) => ({ ...x, pinned: e.target.checked }))} className="size-4 accent-[#e4b027]" /> Pin to the top
          </label>
        </div>
      </div>
    </HqDialog>
  );
}

function LearningDialog({ open, onOpenChange, learning }: { open: boolean; onOpenChange: (o: boolean) => void; learning: string[] }) {
  const act = useAct();
  const [skill, setSkill] = useState(learning[0] ?? "");
  const [idea, setIdea] = useState("");
  return (
    <HqDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Request a weekly learning project"
      description="A one-week solo project to learn a new skill. A lead approves it, then it appears in your TaskBook."
      size="sm"
      footer={
        <button type="button" disabled={!skill || idea.trim().length < 5} onClick={() => act("tasks", "learn", { skill, idea }, { ok: "Sent for approval" }).then(() => onOpenChange(false), () => {})} className={hb.gold}>
          Send request
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        <FormField label="Skill to learn" hint={learning.length ? undefined : "Add skills you're learning in Settings."}>
          <input list="learning-skills" value={skill} onChange={(e) => setSkill(e.target.value)} className={selectCls} />
          <datalist id="learning-skills">
            {learning.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </FormField>
        <FormField label="Project idea">
          <textarea value={idea} onChange={(e) => setIdea(e.target.value)} className={textareaCls} placeholder="What will you build or study this week?" />
        </FormField>
      </div>
    </HqDialog>
  );
}
