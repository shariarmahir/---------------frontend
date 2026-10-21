"use client";

import Link from "next/link";
import { Check, Plus, Trash2, User, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { SKILLS } from "@/data/hq/people";
import { HqDialog } from "@/components/hq/dialog";
import { usePeople } from "@/components/hq/hooks";
import { Avatar, Countdown, FormField, hb, inputCls, Pill, selectCls, textareaCls, type Tone } from "@/components/hq/kit";
import { useAct, useHq, useNow } from "@/components/hq/provider";
import { can, KIND_LABEL, PRIORITY_LABEL, PRIORITY_ORDER, priorityFor, RISK_LABEL, STATUS_LABEL } from "@/lib/hq/rules";
import { basePoints } from "@/lib/hq/scoring";
import type { MilestoneKind, Priority, Task, TaskStatus } from "@/lib/hq/types";
import { cn } from "@/lib/utils";

export const PRIORITY_TONE: Record<Priority, Tone> = { immediate: "red", urgent: "red", today: "gold", tomorrow: "gold", "this-week": "navy", "next-week": "navy", later: "muted" };
export const STATUS_TONE: Record<TaskStatus, Tone> = { open: "muted", taken: "navy", "in-progress": "navy", submitted: "cobalt", "client-review": "cobalt", done: "gold", cancelled: "muted" };
export const MILESTONE_LABEL: Record<MilestoneKind, string> = { meeting: "Meeting", discussion: "Discussion", build: "Build", testing: "Testing", review: "Review", submit: "Submit", custom: "Milestone" };
export const BADGE_LABEL = { "quick-silver": "Quick Silver", "iron-man": "Iron Man", "man-of-the-day": "Man of the day", "luther-king": "Luther King", shield: "Shield", helper: "Helper" } as const;

/** A ticket on the board. */
export function TicketCard({ t, onTake, className, i = 0 }: { t: Task; onTake?: (t: Task) => void; className?: string; i?: number }) {
  const people = usePeople();
  const me = useHq((v) => v.me.person);
  const taker = t.takenBy ? people.get(t.takenBy) : undefined;
  const match = t.skills.some((s) => me.skills.includes(s));
  return (
    <article style={{ "--i": Math.min(i, 8) } as React.CSSProperties} className={cn("hq-rise group relative flex flex-col gap-3 rounded-2xl bg-bdnavy-900 p-4 ring-1 ring-white/12 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:ring-signal-orange/60 motion-reduce:hover:translate-y-0", className)}>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-white/55">{t.code}</span>
        <Pill tone={STATUS_TONE[t.status]} className="ml-auto">
          {STATUS_LABEL[t.status]}
        </Pill>
      </div>
      <Link href={`/hq/tasks/${t.id}`} className="font-grotesk text-base leading-snug font-bold text-white after:absolute after:inset-0 after:rounded-2xl hover:text-signal-orange focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-signal-orange">
        {t.title}
      </Link>
      <div className="flex flex-wrap gap-1.5">
        <Pill tone={PRIORITY_TONE[t.priority]}>{PRIORITY_LABEL[t.priority]}</Pill>
        <Pill tone={t.risk === "high" ? "ink" : "muted"}>{RISK_LABEL[t.risk]}</Pill>
        <Pill tone="muted" icon={t.mode === "team" ? Users : User}>
          {t.mode === "either" ? "Solo or team" : t.mode === "team" ? "Team" : "Solo"}
        </Pill>
        {t.kind !== "work" ? <Pill tone="cobalt">{KIND_LABEL[t.kind]}</Pill> : null}
      </div>
      {t.skills.length ? (
        <p className="text-xs text-white/60">
          {t.skills.map((s) => (
            <span key={s} className={cn("mr-2", me.skills.includes(s) && "font-semibold text-signal-orange")}>
              #{s}
            </span>
          ))}
        </p>
      ) : null}
      <div className="mt-auto flex items-center gap-2 border-t border-white/8 pt-3">
        {taker ? <Avatar person={taker} size="xs" /> : null}
        <Countdown to={t.due} />
        <span className="ml-auto font-grotesk text-sm font-bold text-signal-orange">{t.awarded ?? basePoints(t)} pts</span>
      </div>
      {onTake && t.status === "open" ? (
        <button type="button" onClick={() => onTake(t)} className={cn(hb.goldSm, "relative z-10", !match && "bg-white/10 text-white ring-1 ring-white/15")}>
          Take this ticket
        </button>
      ) : null}
    </article>
  );
}

/** Taking a ticket: alone, or for a team I lead. */
export function TakeDialog({ task, onClose }: { task: Task | null; onClose: () => void }) {
  const act = useAct();
  const me = useHq((v) => v.me.person);
  const teams = useHq((v) => v.teams);
  const mine = teams.filter((t) => t.status === "active" && t.leaderId === me.id);
  const [teamId, setTeamId] = useState("");
  if (!task) return null;
  const solo = task.mode !== "team";
  const team = task.mode !== "solo";
  return (
    <HqDialog
      open={Boolean(task)}
      onOpenChange={(o) => !o && onClose()}
      title={`Take ${task.code}`}
      description={task.title}
      size="sm"
      footer={
        <>
          {solo ? (
            <button type="button" className={hb.outline} onClick={() => act("tasks", "take", { id: task.id }, { ok: "It's yours — the clock is running" }).then(onClose, () => {})}>
              <User aria-hidden className="size-4" /> Take it solo
            </button>
          ) : null}
          {team && mine.length ? (
            <button type="button" disabled={!teamId} className={hb.gold} onClick={() => act("tasks", "take", { id: task.id, teamId }, { ok: "Your team took it" }).then(onClose, () => {})}>
              <Users aria-hidden className="size-4" /> Take for the team
            </button>
          ) : null}
        </>
      }
    >
      <div className="flex flex-col gap-4 text-sm text-white/80">
        <p>
          Due <Countdown to={task.due} />. Worth about <strong className="text-signal-orange">{basePoints(task)} points</strong> if it's on time and accurate — more if you submit early.
        </p>
        {team ? (
          mine.length ? (
            <FormField label="Take it for one of your teams">
              <select value={teamId} onChange={(e) => setTeamId(e.target.value)} className={selectCls}>
                <option value="">Choose a team…</option>
                {mine.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </FormField>
          ) : (
            <p className="rounded-xl bg-black/30 p-3 ring-1 ring-white/10">
              {task.mode === "team" ? "This ticket needs a team. " : ""}You don't lead an active team yet.{" "}
              <Link href="/hq/teams" className="font-semibold text-signal-orange underline">
                Propose a team
              </Link>
              .
            </p>
          )
        ) : null}
      </div>
    </HqDialog>
  );
}

function localInput(ms: number): string {
  const d = new Date(ms + 6 * 3600_000);
  return d.toISOString().slice(0, 16);
}
/** A datetime-local value (Dhaka wall clock) → ISO. */
export function fromLocalInput(s: string): string {
  return new Date(Date.parse(`${s}:00.000Z`) - 6 * 3600_000).toISOString();
}
export { localInput };

/** Publishing a ticket — or, without publish rights, a solo TaskBook task that a lead approves. */
export function NewTicketDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const act = useAct();
  const now = useNow(60_000);
  const me = useHq((v) => v.me.person);
  const clients = useHq((v) => v.clients);
  const publisher = can(me, "tasks.publish");
  const [f, setF] = useState(() => ({ title: "", brief: "", kind: "work", risk: "medium", mode: "either", due: localInput(Date.now() + 26 * 3600_000), estimateHours: 4, clientId: "", priority: "" as Priority | "" }));
  const [skills, setSkills] = useState<string[]>([]);
  const [ms, setMs] = useState<{ kind: MilestoneKind; title: string; at: string }[]>([]);
  const suggested = useMemo(() => priorityFor(fromLocalInput(f.due), now), [f.due, now]);
  const priority = f.priority || suggested;
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF((x) => ({ ...x, [k]: k === "estimateHours" ? Number(e.target.value) : e.target.value }));

  const submit = async () => {
    const id = await act<string>(
      "tasks",
      "publish",
      { ...f, priority, due: fromLocalInput(f.due), skills, clientId: f.clientId || undefined, milestones: ms.filter((m) => m.title.trim()).map((m) => ({ ...m, at: fromLocalInput(m.at) })) },
      { ok: publisher ? "Ticket published" : "Sent for approval" },
    ).catch(() => null);
    if (!id) return;
    onOpenChange(false);
    setF((x) => ({ ...x, title: "", brief: "" }));
    setSkills([]);
    setMs([]);
  };

  return (
    <HqDialog
      open={open}
      onOpenChange={onOpenChange}
      title={publisher ? "New task ticket" : "New TaskBook task"}
      description={publisher ? "Post it to the board; members take it by priority, timeline and skills." : "You don't publish tickets — this becomes your own solo task once a lead approves it."}
      size="lg"
      footer={
        <>
          <button type="button" onClick={() => onOpenChange(false)} className={hb.quiet}>
            Cancel
          </button>
          <button type="button" onClick={submit} disabled={f.title.trim().length < 3} className={hb.gold}>
            <Check aria-hidden className="size-4" /> {publisher ? "Publish ticket" : "Send for approval"}
          </button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Title" className="sm:col-span-2">
          <input value={f.title} onChange={set("title")} className={inputCls} placeholder="What needs doing?" autoFocus />
        </FormField>
        <FormField label="Brief" className="sm:col-span-2">
          <textarea value={f.brief} onChange={set("brief")} className={textareaCls} placeholder="Context, the definition of done, links…" />
        </FormField>
        <FormField label="Due" hint={`Suggested lane: ${PRIORITY_LABEL[suggested]}`}>
          <input type="datetime-local" value={f.due} onChange={set("due")} className={inputCls} />
        </FormField>
        <FormField label="Priority lane">
          <select value={f.priority} onChange={set("priority")} className={selectCls}>
            <option value="">Suggested: {PRIORITY_LABEL[suggested]}</option>
            {PRIORITY_ORDER.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABEL[p]}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Kind">
          <select value={f.kind} onChange={set("kind")} className={selectCls}>
            {Object.entries(KIND_LABEL).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Risk">
          <select value={f.risk} onChange={set("risk")} className={selectCls}>
            {Object.entries(RISK_LABEL).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Who can take it">
          <select value={f.mode} onChange={set("mode")} className={selectCls} disabled={!publisher}>
            <option value="either">Solo or team</option>
            <option value="solo">Solo only</option>
            <option value="team">Team only</option>
          </select>
        </FormField>
        <FormField label="Estimate (hours)">
          <input type="number" min={0.5} step={0.5} value={f.estimateHours} onChange={set("estimateHours")} className={inputCls} />
        </FormField>
        {clients.length ? (
          <FormField label="Client (optional)" className="sm:col-span-2">
            <select value={f.clientId} onChange={set("clientId")} className={selectCls}>
              <option value="">No client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.org}
                </option>
              ))}
            </select>
          </FormField>
        ) : null}
        <fieldset className="sm:col-span-2">
          <legend className="text-sm font-semibold text-white/85">Skills</legend>
          <SkillPicker value={skills} onChange={setSkills} />
        </fieldset>
        <fieldset className="sm:col-span-2">
          <legend className="mb-2 text-sm font-semibold text-white/85">Timeline milestones (optional)</legend>
          <div className="flex flex-col gap-2">
            {ms.map((m, i) => (
              <div key={i} className="grid grid-cols-[8rem_1fr] gap-2 sm:grid-cols-[8rem_1fr_13rem_auto]">
                <select aria-label="Milestone kind" value={m.kind} onChange={(e) => setMs((x) => x.map((y, j) => (j === i ? { ...y, kind: e.target.value as MilestoneKind } : y)))} className={selectCls}>
                  {Object.entries(MILESTONE_LABEL).map(([k, l]) => (
                    <option key={k} value={k}>
                      {l}
                    </option>
                  ))}
                </select>
                <input aria-label="Milestone title" value={m.title} onChange={(e) => setMs((x) => x.map((y, j) => (j === i ? { ...y, title: e.target.value } : y)))} className={inputCls} placeholder="e.g. Kick-off with the client" />
                <input aria-label="Milestone time" type="datetime-local" value={m.at} onChange={(e) => setMs((x) => x.map((y, j) => (j === i ? { ...y, at: e.target.value } : y)))} className={inputCls} />
                <button type="button" aria-label="Remove milestone" onClick={() => setMs((x) => x.filter((_, j) => j !== i))} className={hb.icon}>
                  <Trash2 aria-hidden className="size-4" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => setMs((x) => [...x, { kind: "meeting", title: "", at: f.due }])} className={cn(hb.quietSm, "self-start")}>
              <Plus aria-hidden className="size-3.5" /> Add a milestone
            </button>
          </div>
        </fieldset>
      </div>
    </HqDialog>
  );
}

export function SkillPicker({ value, onChange, options = SKILLS as readonly string[] }: { value: string[]; onChange: (v: string[]) => void; options?: readonly string[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {options.map((s) => {
        const on = value.includes(s);
        return (
          <button
            key={s}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? value.filter((x) => x !== s) : [...value, s])}
            className={cn("min-h-8 rounded-full px-3 text-xs font-semibold ring-1 transition-colors", on ? "bg-signal-orange text-text-primary ring-signal-orange" : "text-white/75 ring-white/15 hover:text-white")}
          >
            {s}
          </button>
        );
      })}
    </div>
  );
}

/** An animated ring: `value` 0–1. */
export function Ring({ value, size = 120, stroke = 10, tone = "gold", children, label }: { value: number; size?: number; stroke?: number; tone?: "gold" | "red" | "blue"; children?: React.ReactNode; label?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  const color = tone === "gold" ? "#e4b027" : tone === "red" ? "#ff6a5c" : "#8fa1e3";
  return (
    <div role="img" aria-label={label} className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.1)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v)} className="transition-[stroke-dashoffset] duration-1000 ease-out motion-reduce:transition-none" />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}
