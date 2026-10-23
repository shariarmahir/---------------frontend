"use client";

import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CheckSquare,
  Code2,
  Download,
  FileUp,
  Flag,
  Heading,
  Link2,
  NotebookPen,
  Plus,
  Quote,
  Send,
  Share2,
  Star,
  Trash2,
  Type,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { HqDialog } from "@/components/hq/dialog";
import { nameOf, usePeople } from "@/components/hq/hooks";
import { Avatar, AvatarStack, Empty, FormField, hb, inputCls, Panel, Pill, selectCls, textareaCls } from "@/components/hq/kit";
import { fileUrl, uploadFile, useAct, useHq, useNow } from "@/components/hq/provider";
import { bytes, clockLabel, dateLabel, dateTimeLabel, duration } from "@/lib/hq/format";
import { can, KIND_LABEL, PRIORITY_LABEL, RISK_LABEL, STATUS_LABEL } from "@/lib/hq/rules";
import { accuracyFactor, basePoints, MERIT_LABEL, timingFactor } from "@/lib/hq/scoring";
import type { MeritKind, MilestoneKind, NoteBlock, NoteKind, Task } from "@/lib/hq/types";
import { cn } from "@/lib/utils";
import { fromLocalInput, localInput, MILESTONE_LABEL, PRIORITY_TONE, Ring, STATUS_TONE, TakeDialog } from "./shared";

export function TaskWindow({ id }: { id: string }) {
  const t = useHq((v) => v.tasks.find((x) => x.id === id));
  if (!t) {
    return <Empty title="Task not found" action={<Link href="/hq/tasks" className={hb.gold}>Back to the board</Link>}>It may have been removed, or it isn&apos;t visible to you.</Empty>;
  }
  return <Window t={t} />;
}

function Window({ t }: { t: Task }) {
  const act = useAct();
  const people = usePeople();
  const me = useHq((v) => v.me.person);
  const teams = useHq((v) => v.teams);
  const now = useNow(1000);
  const team = t.teamId ? teams.find((x) => x.id === t.teamId) : undefined;
  const workers = team ? [team.leaderId, ...team.memberIds] : t.takenBy ? [t.takenBy] : [];
  const isWorker = workers.includes(me.id) || me.level === "prime";
  const canWrite = isWorker || t.sharedWith.includes(me.id);
  const reviewer = can(me, "tasks.review") && !workers.includes(me.id);
  const [taking, setTaking] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const active = t.status === "taken" || t.status === "in-progress";

  const start = Date.parse(t.takenAt ?? t.createdAt);
  const end = Date.parse(t.due);
  const total = Math.max(1, end - start);
  const left = end - now;
  const elapsed = Math.min(1, Math.max(0, (now - start) / total));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link href="/hq/tasks" className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-white/65 hover:text-signal-orange">
          <ArrowLeft aria-hidden className="size-4" /> Task board
        </Link>
      </div>

      <header className="hq-rise grid gap-5 rounded-3xl bg-bdnavy-900 p-5 ring-1 ring-white/12 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm text-white/60">{t.code}</span>
            <Pill tone={STATUS_TONE[t.status]}>{STATUS_LABEL[t.status]}</Pill>
            <Pill tone={PRIORITY_TONE[t.priority]}>{PRIORITY_LABEL[t.priority]}</Pill>
            <Pill tone="muted">{RISK_LABEL[t.risk]}</Pill>
            <Pill tone="muted">{KIND_LABEL[t.kind]}</Pill>
            {t.approval === "pending" ? <Pill tone="gold">Waiting for approval</Pill> : null}
            {t.sample ? <Pill>Sample</Pill> : null}
          </div>
          <h1 className="mt-3 font-grotesk text-2xl leading-tight font-bold text-signal-orange sm:text-3xl">{t.title}</h1>
          {t.brief ? <p className="mt-3 max-w-3xl text-sm leading-relaxed whitespace-pre-line text-white/80 sm:text-base">{t.brief}</p> : null}
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/70">
            <span>
              Posted by <strong className="text-white">{nameOf(people, t.createdBy)}</strong> · {dateLabel(t.createdAt)}
            </span>
            <span>Due {dateTimeLabel(t.due)}</span>
            <span>Estimate {t.estimateHours} h</span>
            {t.skills.length ? <span>{t.skills.map((s) => `#${s}`).join(" ")}</span> : null}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {t.status === "open" ? (
              <button type="button" onClick={() => setTaking(true)} className={hb.gold}>
                Take this ticket
              </button>
            ) : null}
            {active && isWorker ? (
              <button type="button" onClick={() => act("tasks", "release", { id: t.id }, { ok: "Released back to the board" })} className={hb.quiet}>
                Release to the board
              </button>
            ) : null}
            {(t.createdBy === me.id || can(me, "tasks.publish")) && !["done", "cancelled"].includes(t.status) ? (
              <button type="button" onClick={() => act("tasks", "cancel", { id: t.id }, { ok: "Ticket cancelled" })} className={hb.quiet}>
                Cancel ticket
              </button>
            ) : null}
          </div>
        </div>
        <Ring value={left > 0 ? 1 - elapsed : 1} size={168} stroke={12} tone={left < 0 ? "red" : left < 6 * 3600_000 ? "gold" : "blue"} label={`Time left ${duration(left)}`}>
          <span>
            <span className={cn("block font-grotesk text-xl font-bold", left < 0 ? "text-crimson-bright" : "text-white")}>{duration(left).split(" ").slice(0, 2).join(" ")}</span>
            <span className="block text-xs text-white/60">{left < 0 ? "overdue" : "left"}</span>
          </span>
        </Ring>
      </header>

      <Timeline t={t} now={now} canEdit={isWorker && active} />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Notebook t={t} canWrite={canWrite && t.status !== "done" && t.status !== "cancelled"} />
        <aside className="flex flex-col gap-5">
          <PeoplePanel t={t} workers={workers} isWorker={isWorker} teamName={team?.name} />
          <PointsPanel t={t} now={now} />
          {active && isWorker ? <SubmitPanel t={t} now={now} onQuickSilver={() => setCelebrate(true)} /> : null}
          {t.submission ? (
            <Panel title="Submission" icon={Send} field="ink">
              <p className="text-sm whitespace-pre-line text-white/85">{t.submission.summary}</p>
              {t.submission.link ? (
                <a href={t.submission.link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-signal-orange underline">
                  <Link2 aria-hidden className="size-4" /> Open the link
                </a>
              ) : null}
              <p className="mt-2 text-xs text-white/55">Submitted {dateTimeLabel(t.submittedAt!)}</p>
            </Panel>
          ) : null}
          {t.status === "submitted" && reviewer ? <ReviewPanel t={t} workers={workers} /> : null}
          {(t.status === "client-review" || (t.status === "done" && t.clientId && !t.clientReview)) && (can(me, "clients.manage") || can(me, "tasks.review")) ? <ClientReviewPanel t={t} /> : null}
          <FilesPanel t={t} canWrite={canWrite} />
        </aside>
      </div>

      <TakeDialog key={taking ? "open" : "closed"} task={taking ? t : null} onClose={() => setTaking(false)} />
      {celebrate ? <QuickSilver onDone={() => setCelebrate(false)} /> : null}
    </div>
  );
}

/* ───────────── the timeline ───────────── */

function Timeline({ t, now, canEdit }: { t: Task; now: number; canEdit: boolean }) {
  const act = useAct();
  const [adding, setAdding] = useState(false);
  const [m, setM] = useState(() => ({ kind: "meeting" as MilestoneKind, title: "", at: localInput(Date.now() + 3 * 3600_000) }));
  const start = Date.parse(t.takenAt ?? t.createdAt);
  const end = Date.parse(t.due);
  const span = Math.max(1, end - start);
  const pos = (ms: number) => Math.max(0, Math.min(100, ((ms - start) / span) * 100));
  const pins = [...t.milestones].sort((a, b) => a.at.localeCompare(b.at));
  const nowPos = pos(now);

  return (
    <Panel
      title="Timeline"
      icon={Flag}
      sub={`${dateTimeLabel(start)} → ${dateTimeLabel(end)}`}
      action={
        canEdit ? (
          <button type="button" onClick={() => setAdding(true)} className={hb.quietSm}>
            <Plus aria-hidden className="size-3.5" /> Milestone
          </button>
        ) : null
      }
    >
      {/* Desktop: a horizontal track with pinpoints. */}
      <div className="relative mx-2 hidden h-32 sm:block">
        <div className="absolute top-14 right-0 left-0 h-1.5 rounded-full bg-white/10" />
        <div className="absolute top-14 left-0 h-1.5 rounded-full bg-signal-orange transition-[width] duration-1000" style={{ width: `${nowPos}%` }} />
        <div className="absolute top-11 -ml-2 flex flex-col items-center" style={{ left: `${nowPos}%` }}>
          <span className="relative grid size-4 place-items-center">
            <span className="absolute size-4 animate-ping rounded-full bg-signal-orange/60 motion-reduce:animate-none" />
            <span className="size-3 rounded-full bg-signal-orange ring-2 ring-black" />
          </span>
          <span className="mt-8 text-xs font-bold whitespace-nowrap text-signal-orange">Now</span>
        </div>
        {pins.map((p, i) => {
          const over = !p.done && Date.parse(p.at) < now;
          const x = pos(Date.parse(p.at));
          // Pins near the right end hang their label to the left, so it never leaves the panel.
          const right = x > 70;
          return (
            <div key={p.id} className={cn("absolute flex w-40 flex-col", right ? "items-end text-right" : "items-start", i % 2 ? "top-[4.6rem]" : "top-0")} style={{ left: `${x}%`, marginLeft: right ? "-9.25rem" : "-0.75rem" }}>
              {i % 2 ? null : <PinLabel p={p} over={over} />}
              <button
                type="button"
                disabled={!canEdit}
                onClick={() => act("tasks", "milestone.toggle", { id: t.id, mid: p.id }, { quiet: true })}
                aria-label={`${p.title}: ${p.done ? "done" : "mark done"}`}
                className={cn("my-1 grid size-6 place-items-center rounded-full ring-2 transition-colors", p.done ? "bg-signal-orange ring-signal-orange" : over ? "bg-national-crimson ring-national-crimson" : "bg-black ring-bdnavy-300", canEdit && "hover:scale-110")}
              >
                <span className={cn("size-2 rounded-full", p.done ? "bg-text-primary" : "bg-white")} />
              </button>
              {i % 2 ? <PinLabel p={p} over={over} /> : null}
            </div>
          );
        })}
      </div>
      {/* Phones: a vertical list. */}
      <ol className="flex flex-col gap-3 sm:hidden">
        {pins.map((p) => {
          const over = !p.done && Date.parse(p.at) < now;
          return (
            <li key={p.id} className="flex items-center gap-3">
              <button type="button" disabled={!canEdit} onClick={() => act("tasks", "milestone.toggle", { id: t.id, mid: p.id }, { quiet: true })} aria-label={`${p.title}: ${p.done ? "done" : "mark done"}`} className={cn("grid size-8 shrink-0 place-items-center rounded-full ring-2", p.done ? "bg-signal-orange ring-signal-orange" : over ? "ring-national-crimson" : "ring-bdnavy-300")} />
              <PinLabel p={p} over={over} />
            </li>
          );
        })}
      </ol>
      {pins.length === 0 ? <p className="text-sm text-white/55">No milestones yet{canEdit ? " — add meetings, discussions, testing and the submit date." : "."}</p> : null}
      {canEdit && pins.length ? (
        <p className="mt-2 text-xs text-white/50">Tap a pin to mark it done.</p>
      ) : null}

      <HqDialog
        open={adding}
        onOpenChange={setAdding}
        title="Add a milestone"
        size="sm"
        footer={
          <button
            type="button"
            disabled={!m.title.trim()}
            onClick={() => act("tasks", "milestone.add", { id: t.id, ...m, at: fromLocalInput(m.at) }, { ok: "Pinned to the timeline" }).then(() => setAdding(false), () => {})}
            className={hb.gold}
          >
            Add
          </button>
        }
      >
        <div className="flex flex-col gap-4">
          <FormField label="Kind">
            <select value={m.kind} onChange={(e) => setM((x) => ({ ...x, kind: e.target.value as MilestoneKind }))} className={selectCls}>
              {Object.entries(MILESTONE_LABEL).map(([k, l]) => (
                <option key={k} value={k}>
                  {l}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Title">
            <input value={m.title} onChange={(e) => setM((x) => ({ ...x, title: e.target.value }))} className={inputCls} />
          </FormField>
          <FormField label="When">
            <input type="datetime-local" value={m.at} onChange={(e) => setM((x) => ({ ...x, at: e.target.value }))} className={inputCls} />
          </FormField>
          {pins.length ? (
            <ul className="flex flex-col gap-1">
              {pins.map((p) => (
                <li key={p.id} className="flex items-center gap-2 text-sm text-white/75">
                  <span className="min-w-0 flex-1 truncate">{p.title}</span>
                  <button type="button" aria-label={`Remove ${p.title}`} onClick={() => act("tasks", "milestone.remove", { id: t.id, mid: p.id }, { quiet: true })} className={hb.iconSm}>
                    <Trash2 aria-hidden className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </HqDialog>
    </Panel>
  );
}

function PinLabel({ p, over }: { p: Task["milestones"][number]; over: boolean }) {
  return (
    <span className="block min-w-0">
      <span className={cn("block truncate text-xs font-bold", p.done ? "text-signal-orange" : over ? "text-crimson-bright" : "text-white")}>{p.title}</span>
      <span className="block text-xs text-white/55">
        {MILESTONE_LABEL[p.kind]} · {dateLabel(p.at)} {clockLabel(p.at)}
      </span>
    </span>
  );
}

/* ───────────── the notebook ───────────── */

const BLOCKS: { kind: NoteKind; label: string; icon: typeof Type }[] = [
  { kind: "text", label: "Text", icon: Type },
  { kind: "heading", label: "Heading", icon: Heading },
  { kind: "check", label: "Checklist item", icon: CheckSquare },
  { kind: "code", label: "Code", icon: Code2 },
  { kind: "quote", label: "Quote", icon: Quote },
  { kind: "link", label: "Link", icon: Link2 },
];

function Notebook({ t, canWrite }: { t: Task; canWrite: boolean }) {
  const act = useAct();
  const people = usePeople();
  const files = useHq((v) => v.files);
  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const add = (kind: NoteKind) => act("tasks", "note.add", { id: t.id, kind, text: "" }, { quiet: true });
  const upload = async (list: FileList | null) => {
    if (!list?.length) return;
    setBusy(true);
    try {
      for (const file of Array.from(list)) {
        const meta = await uploadFile(file);
        await act("tasks", "note.add", { id: t.id, kind: "file", text: meta.name, fileId: meta.id }, { quiet: true });
      }
    } catch {
      // uploadFile already showed the error
    }
    setBusy(false);
  };
  const done = t.notebook.filter((b) => b.kind === "check" && b.checked).length;
  const checks = t.notebook.filter((b) => b.kind === "check").length;

  return (
    <Panel title="Notebook" icon={NotebookPen} sub={checks ? `${done} of ${checks} checklist items done` : "Plans, notes, code and files for this task"} bodyClassName="flex flex-col gap-3">
      {t.notebook.length === 0 ? <Empty title="An empty notebook" icon={NotebookPen} className="py-8">{canWrite ? "Add your plan, checklists, code snippets and files below." : "Nothing written yet."}</Empty> : null}
      <ul className="flex flex-col gap-2">
        {t.notebook.map((b, i) => (
          <Block key={b.id} t={t} b={b} first={i === 0} last={i === t.notebook.length - 1} canWrite={canWrite} file={b.fileId ? files.find((f) => f.id === b.fileId) : undefined} author={nameOf(people, b.by)} />
        ))}
      </ul>
      {canWrite ? (
        <div className="flex flex-wrap gap-2 border-t border-white/8 pt-3">
          {BLOCKS.map((x) => (
            <button key={x.kind} type="button" onClick={() => add(x.kind)} className={hb.quietSm}>
              <x.icon aria-hidden className="size-3.5" /> {x.label}
            </button>
          ))}
          <button type="button" onClick={() => fileInput.current?.click()} disabled={busy} className={hb.outlineSm}>
            <FileUp aria-hidden className="size-3.5" /> {busy ? "Uploading…" : "Upload file"}
          </button>
          <input ref={fileInput} type="file" multiple hidden onChange={(e) => upload(e.target.files)} />
        </div>
      ) : null}
    </Panel>
  );
}

function Block({ t, b, first, last, canWrite, file, author }: { t: Task; b: NoteBlock; first: boolean; last: boolean; canWrite: boolean; file?: { id: string; name: string; type: string; size: number }; author: string }) {
  const act = useAct();
  const [text, setText] = useState(b.text);
  const [seen, setSeen] = useState(b.text);
  if (b.text !== seen) {
    setSeen(b.text);
    setText(b.text);
  }
  const save = () => text !== b.text && act("tasks", "note.edit", { id: t.id, bid: b.id, text }, { quiet: true });
  const field = cn("w-full resize-none rounded-lg bg-transparent px-2 py-1.5 text-white placeholder:text-white/30 focus:bg-black/40 focus:ring-1 focus:ring-signal-orange focus:outline-none", !canWrite && "pointer-events-none");
  const rows = Math.max(1, Math.min(14, text.split("\n").length));
  return (
    <li className="group flex items-start gap-2 rounded-xl px-1 py-1 hover:bg-white/[0.03]">
      {b.kind === "check" ? (
        <button
          type="button"
          disabled={!canWrite}
          onClick={() => act("tasks", "note.edit", { id: t.id, bid: b.id, checked: !b.checked }, { quiet: true })}
          aria-label={b.checked ? "Mark not done" : "Mark done"}
          className={cn("mt-2 grid size-5 shrink-0 place-items-center rounded-md ring-2", b.checked ? "bg-signal-orange ring-signal-orange" : "ring-white/40")}
        >
          {b.checked ? <span className="size-2 rounded-sm bg-text-primary" /> : null}
        </button>
      ) : null}
      <div className="min-w-0 flex-1">
        {b.kind === "file" && file ? (
          <div className="flex items-center gap-3 rounded-xl bg-black/30 p-2 ring-1 ring-white/10">
            {file.type.startsWith("image/") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fileUrl(file.id)} alt={file.name} className="h-16 w-24 rounded-lg object-cover" />
            ) : (
              <span className="grid h-12 w-12 place-items-center rounded-lg bg-white/10 text-xs font-bold text-white/70">{file.name.split(".").pop()?.slice(0, 4)}</span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-white">{file.name}</span>
              <span className="block text-xs text-white/55">{bytes(file.size)}</span>
            </span>
            <a href={fileUrl(file.id, true)} className={hb.iconSm} aria-label={`Download ${file.name}`}>
              <Download aria-hidden className="size-4" />
            </a>
          </div>
        ) : b.kind === "link" ? (
          <div className="flex items-center gap-2">
            <input value={text} onChange={(e) => setText(e.target.value)} onBlur={save} placeholder="https://…" aria-label="Link" className={cn(field, "text-sm text-bdnavy-300 underline")} />
            {/^https?:\/\//.test(text) ? (
              <a href={text} target="_blank" rel="noopener noreferrer" className={hb.iconSm} aria-label="Open link">
                <Link2 aria-hidden className="size-4" />
              </a>
            ) : null}
          </div>
        ) : (
          <textarea
            value={text}
            rows={rows}
            onChange={(e) => setText(e.target.value)}
            onBlur={save}
            aria-label={b.kind}
            placeholder={b.kind === "heading" ? "Heading" : b.kind === "code" ? "// code" : b.kind === "quote" ? "A quote or a key decision" : b.kind === "check" ? "A step" : "Write…"}
            className={cn(
              field,
              b.kind === "heading" && "font-grotesk text-lg font-bold text-signal-orange",
              b.kind === "code" && "rounded-lg bg-black/50 font-mono text-xs text-bdnavy-300 ring-1 ring-white/10",
              b.kind === "quote" && "border-l-2 border-signal-orange pl-3 text-white/80 italic",
              b.kind === "check" && b.checked && "text-white/50 line-through",
              b.kind === "text" && "text-sm leading-relaxed",
              b.kind === "check" && "text-sm",
            )}
          />
        )}
        <span className="block px-2 text-xs text-white/35 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">{author}</span>
      </div>
      {canWrite ? (
        <span className="flex shrink-0 flex-col gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          <button type="button" disabled={first} onClick={() => act("tasks", "note.move", { id: t.id, bid: b.id, dir: -1 }, { quiet: true })} aria-label="Move up" className={hb.iconSm}>
            <ArrowUp aria-hidden className="size-3.5" />
          </button>
          <button type="button" disabled={last} onClick={() => act("tasks", "note.move", { id: t.id, bid: b.id, dir: 1 }, { quiet: true })} aria-label="Move down" className={hb.iconSm}>
            <ArrowDown aria-hidden className="size-3.5" />
          </button>
          <button type="button" onClick={() => act("tasks", "note.remove", { id: t.id, bid: b.id }, { quiet: true })} aria-label="Delete block" className={hb.iconSm}>
            <Trash2 aria-hidden className="size-3.5" />
          </button>
        </span>
      ) : null}
    </li>
  );
}

/* ───────────── side panels ───────────── */

function PeoplePanel({ t, workers, isWorker, teamName }: { t: Task; workers: string[]; isWorker: boolean; teamName?: string }) {
  const act = useAct();
  const people = usePeople();
  const all = useHq((v) => v.people);
  const [sharing, setSharing] = useState(false);
  const [pick, setPick] = useState<string[]>(t.sharedWith);
  return (
    <Panel
      title={teamName ? `Team: ${teamName}` : "People"}
      icon={Users}
      action={
        isWorker && t.status !== "open" ? (
          <button
            type="button"
            onClick={() => {
              setPick(t.sharedWith);
              setSharing(true);
            }}
            className={hb.quietSm}
          >
            <Share2 aria-hidden className="size-3.5" /> Share
          </button>
        ) : null
      }
    >
      {workers.length === 0 ? <p className="text-sm text-white/60">Nobody has taken this ticket yet.</p> : null}
      <ul className="flex flex-col gap-2">
        {workers.map((w) => {
          const p = people.get(w);
          return (
            <li key={w} className="flex items-center gap-3">
              <Avatar person={p} size="sm" />
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{p?.name}</span>
              {w === t.takenBy ? <Pill tone="gold">{teamName ? "Leader" : "Taker"}</Pill> : null}
            </li>
          );
        })}
      </ul>
      {t.sharedWith.length ? (
        <div className="mt-4 flex items-center gap-3 border-t border-white/8 pt-3">
          <AvatarStack people={t.sharedWith.map((id) => people.get(id)).filter((x): x is NonNullable<typeof x> => Boolean(x))} />
          <span className="text-xs text-white/60">can write in the notebook</span>
        </div>
      ) : null}
      <HqDialog
        open={sharing}
        onOpenChange={setSharing}
        title="Share the notebook"
        description="They can read and write in this task's notebook and files."
        size="sm"
        footer={
          <button type="button" onClick={() => act("tasks", "share", { id: t.id, personIds: pick }, { ok: "Shared" }).then(() => setSharing(false), () => {})} className={hb.gold}>
            Save
          </button>
        }
      >
        <ul className="flex flex-col gap-1">
          {all
            .filter((p) => p.status === "active" && !workers.includes(p.id))
            .map((p) => {
              const on = pick.includes(p.id);
              return (
                <li key={p.id}>
                  <button type="button" aria-pressed={on} onClick={() => setPick((x) => (on ? x.filter((y) => y !== p.id) : [...x, p.id]))} className={cn("flex min-h-11 w-full items-center gap-3 rounded-xl px-2 text-left", on ? "bg-white/10" : "hover:bg-white/5")}>
                    <Avatar person={p} size="sm" />
                    <span className="min-w-0 flex-1 truncate text-sm text-white">{p.name}</span>
                    <span className={cn("size-5 rounded-md ring-2", on ? "bg-signal-orange ring-signal-orange" : "ring-white/30")} />
                  </button>
                </li>
              );
            })}
        </ul>
      </HqDialog>
    </Panel>
  );
}

function PointsPanel({ t, now }: { t: Task; now: number }) {
  const base = basePoints(t);
  const ifNow = Math.round(base * timingFactor(new Date(now).toISOString(), t.due));
  const pct = Math.round((timingFactor(new Date(now).toISOString(), t.due) - 1) * 100);
  return (
    <Panel title="Points" icon={Star} field="cobalt">
      {t.status === "done" ? (
        <>
          <p className="font-grotesk text-4xl font-bold text-white">{t.awarded} pts</p>
          <ul className="mt-3 flex flex-col gap-1 text-sm text-white/80">
            <li className="flex justify-between">
              <span>Ticket value</span>
              <span>{base}</span>
            </li>
            {t.submittedAt ? (
              <li className="flex justify-between">
                <span>Timing</span>
                <span>×{timingFactor(t.submittedAt, t.due).toFixed(2)}</span>
              </li>
            ) : null}
            {t.review ? (
              <li className="flex justify-between">
                <span>Accuracy {t.review.accuracy}/5</span>
                <span>×{accuracyFactor(t.review.accuracy).toFixed(2)}</span>
              </li>
            ) : null}
            {t.merits.map((m, i) => (
              <li key={i} className="flex justify-between">
                <span>{MERIT_LABEL[m.kind].label}</span>
                <span>+{m.points}</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <p className="text-sm text-white/75">Ticket value</p>
          <p className="font-grotesk text-4xl font-bold text-white">{base} pts</p>
          {t.status !== "open" && t.status !== "submitted" ? (
            <p className="mt-2 text-sm text-white/80">
              Submit now: <strong className={pct >= 0 ? "text-signal-orange" : "text-crimson-bright"}>{ifNow} pts ({pct >= 0 ? "+" : ""}{pct}%)</strong>
            </p>
          ) : null}
          <p className="mt-2 text-xs leading-relaxed text-white/60">Early: +10% per day (up to +30%). Late: −15% per day. Accuracy and merits are added at review. Three early submissions in a row = Quick Silver.</p>
        </>
      )}
    </Panel>
  );
}

function SubmitPanel({ t, now, onQuickSilver }: { t: Task; now: number; onQuickSilver: () => void }) {
  const act = useAct();
  const [summary, setSummary] = useState("");
  const [link, setLink] = useState("");
  const early = Date.parse(t.due) - now >= 3600_000;
  if (t.approval === "pending") return <Panel title="Submit" icon={Send}><p className="text-sm text-white/70">This TaskBook task is waiting for a lead&apos;s approval.</p></Panel>;
  return (
    <Panel title={early ? "Submit early" : "Submit"} icon={early ? Zap : Send}>
      <div className="flex flex-col gap-3">
        <FormField label="What did you deliver?">
          <textarea value={summary} onChange={(e) => setSummary(e.target.value)} className={textareaCls} placeholder="A short summary for the reviewer" />
        </FormField>
        <FormField label="Link (optional)">
          <input value={link} onChange={(e) => setLink(e.target.value)} className={inputCls} placeholder="https://…" />
        </FormField>
        <button
          type="button"
          disabled={summary.trim().length < 5}
          onClick={async () => {
            const r = await act<{ early: boolean; quickSilver: boolean }>("tasks", "submit", { id: t.id, summary, link, fileIds: t.fileIds }, { ok: early ? "Submitted early — nice!" : "Submitted for review" }).catch(() => null);
            if (r?.quickSilver) onQuickSilver();
          }}
          className={hb.gold}
        >
          <Send aria-hidden className="size-4" /> {early ? `Submit ${duration(Date.parse(t.due) - now).split(" ").slice(0, 2).join(" ")} early` : "Submit"}
        </button>
      </div>
    </Panel>
  );
}

function ReviewPanel({ t, workers }: { t: Task; workers: string[] }) {
  const act = useAct();
  const people = usePeople();
  const [score, setScore] = useState(4);
  const [accuracy, setAccuracy] = useState(4);
  const [note, setNote] = useState("");
  const [merits, setMerits] = useState<{ kind: MeritKind; points: number; to: string }[]>([]);
  const preview = useMemo(() => Math.round(basePoints(t) * timingFactor(t.submittedAt!, t.due) * accuracyFactor(accuracy)) + merits.reduce((s, m) => s + m.points, 0), [t, accuracy, merits]);
  return (
    <Panel title="Review" icon={Star} field="ink">
      <div className="flex flex-col gap-4">
        <Slider label="Overall score" value={score} onChange={setScore} />
        <Slider label="Accuracy" value={accuracy} onChange={setAccuracy} />
        <fieldset>
          <legend className="text-sm font-semibold text-white/85">Merits</legend>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(Object.keys(MERIT_LABEL) as MeritKind[]).map((k) => {
              const on = merits.some((m) => m.kind === k);
              return (
                <button
                  key={k}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setMerits((x) => (on ? x.filter((m) => m.kind !== k) : [...x, { kind: k, points: Math.round(MERIT_LABEL[k].max / 2), to: t.takenBy ?? workers[0] }]))}
                  className={cn("min-h-8 rounded-full px-3 text-xs font-semibold ring-1", on ? "bg-signal-orange text-text-primary ring-signal-orange" : "text-white/75 ring-white/15")}
                >
                  {MERIT_LABEL[k].label}
                </button>
              );
            })}
          </div>
          {merits.map((m) => (
            <div key={m.kind} className="mt-2 grid grid-cols-[1fr_5rem] gap-2">
              <select aria-label={`${MERIT_LABEL[m.kind].label} goes to`} value={m.to} onChange={(e) => setMerits((x) => x.map((y) => (y.kind === m.kind ? { ...y, to: e.target.value } : y)))} className={cn(selectCls, "min-h-9 text-xs")}>
                {workers.map((w) => (
                  <option key={w} value={w}>
                    {MERIT_LABEL[m.kind].label} → {nameOf(people, w)}
                  </option>
                ))}
              </select>
              <input aria-label="Points" type="number" min={1} max={MERIT_LABEL[m.kind].max} value={m.points} onChange={(e) => setMerits((x) => x.map((y) => (y.kind === m.kind ? { ...y, points: Number(e.target.value) } : y)))} className={cn(inputCls, "min-h-9 text-xs")} />
            </div>
          ))}
        </fieldset>
        <FormField label="Note">
          <textarea value={note} onChange={(e) => setNote(e.target.value)} className={textareaCls} />
        </FormField>
        <p className="text-sm text-white/80">
          Awards about <strong className="text-signal-orange">{preview} points</strong>.
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => act("tasks", "review", { id: t.id, score, accuracy, note, merits }, { ok: "Reviewed — points awarded" })} className={hb.gold}>
            Approve & award
          </button>
          {t.clientId ? (
            <button type="button" onClick={() => act("tasks", "review", { id: t.id, score, accuracy, note, merits, clientReview: true }, { ok: "Sent to the client" })} className={hb.outline}>
              Send to client
            </button>
          ) : null}
        </div>
      </div>
    </Panel>
  );
}

function ClientReviewPanel({ t }: { t: Task }) {
  const act = useAct();
  const [score, setScore] = useState(4.5);
  const [note, setNote] = useState("");
  return (
    <Panel title="Client review" icon={Star} field="cobalt">
      <div className="flex flex-col gap-3">
        <Slider label="Client rating" value={score} onChange={setScore} step={0.1} />
        <textarea value={note} onChange={(e) => setNote(e.target.value)} className={textareaCls} placeholder="What the client said" aria-label="Client's words" />
        <p className="text-xs text-white/65">4.5 or more on a team task makes the team leader an Iron Man.</p>
        <button type="button" onClick={() => act("tasks", "clientReview", { id: t.id, score, note }, { ok: "Client review saved" })} className={hb.gold}>
          Save client review
        </button>
      </div>
    </Panel>
  );
}

function FilesPanel({ t, canWrite }: { t: Task; canWrite: boolean }) {
  const act = useAct();
  const files = useHq((v) => v.files);
  const mine = t.fileIds.map((id) => files.find((f) => f.id === id)).filter((x): x is NonNullable<typeof x> => Boolean(x));
  const input = useRef<HTMLInputElement>(null);
  return (
    <Panel
      title="Files"
      icon={FileUp}
      action={
        canWrite ? (
          <>
            <button type="button" onClick={() => input.current?.click()} className={hb.quietSm}>
              <Plus aria-hidden className="size-3.5" /> Upload
            </button>
            <input
              ref={input}
              type="file"
              hidden
              multiple
              onChange={async (e) => {
                for (const file of Array.from(e.target.files ?? [])) {
                  const meta = await uploadFile(file).catch(() => null);
                  if (meta) await act("tasks", "file.attach", { id: t.id, fileId: meta.id }, { quiet: true }).catch(() => {});
                }
              }}
            />
          </>
        ) : null
      }
    >
      {mine.length === 0 ? <p className="text-sm text-white/55">No files yet.</p> : null}
      <ul className="flex flex-col gap-2">
        {mine.map((f) => (
          <li key={f.id} className="flex items-center gap-2">
            <span className="min-w-0 flex-1 truncate text-sm text-white">{f.name}</span>
            <span className="text-xs text-white/50">{bytes(f.size)}</span>
            <a href={fileUrl(f.id, true)} aria-label={`Download ${f.name}`} className={hb.iconSm}>
              <Download aria-hidden className="size-3.5" />
            </a>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function Slider({ label, value, onChange, step = 0.5 }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex justify-between text-sm font-semibold text-white/85">
        {label} <span className="font-mono text-signal-orange">{value.toFixed(1)} / 5</span>
      </span>
      <input type="range" min={0} max={5} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[#e4b027]" />
    </label>
  );
}

/** The Quick Silver hat-trick: a short burst of gold, then the badge. */
function QuickSilver({ onDone }: { onDone: () => void }) {
  return (
    <div role="dialog" aria-label="Quick Silver" className="fixed inset-0 z-[95] grid place-items-center bg-black/80 p-6" onClick={onDone}>
      <div className="hq-rise relative flex max-w-sm flex-col items-center gap-4 rounded-3xl bg-bdnavy-900 p-8 text-center ring-2 ring-signal-orange">
        {Array.from({ length: 14 }, (_, i) => (
          <span key={i} aria-hidden className="qs-spark absolute top-1/2 left-1/2 size-2 rounded-full bg-signal-orange" style={{ "--a": `${(i / 14) * 360}deg` } as React.CSSProperties} />
        ))}
        <Zap aria-hidden className="size-16 text-signal-orange" />
        <p className="font-grotesk text-3xl font-bold text-signal-orange">Quick Silver!</p>
        <p className="text-white/85">Three tasks submitted early in a row — a hat-trick. +25 points and today&apos;s badge are yours.</p>
        <button type="button" onClick={onDone} className={hb.gold}>
          <X aria-hidden className="size-4" /> Close
        </button>
      </div>
    </div>
  );
}
