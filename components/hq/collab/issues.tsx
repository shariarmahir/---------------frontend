"use client";

import Link from "next/link";
import { BookOpen, CheckCircle2, MessagesSquare, Plus, Search, TriangleAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { HqDialog } from "@/components/hq/dialog";
import { nameOf, usePeople } from "@/components/hq/hooks";
import { Avatar, AvatarStack, Empty, FormField, hb, inputCls, PageHead, Pill, textareaCls } from "@/components/hq/kit";
import { useAct, useHq, useNow } from "@/components/hq/provider";
import { ago, dateLabel } from "@/lib/hq/format";
import type { Issue } from "@/lib/hq/types";
import { cn } from "@/lib/utils";

const COLUMNS: { status: Issue["status"]; label: string; tone: string }[] = [
  { status: "open", label: "Open", tone: "bg-national-crimson" },
  { status: "discussing", label: "Discussing", tone: "bg-signal-orange" },
  { status: "solved", label: "Solved", tone: "bg-bdnavy-300" },
];

export function IssueBoard() {
  const issues = useHq((v) => v.issues);
  const [creating, setCreating] = useState(false);
  const [solving, setSolving] = useState<Issue | null>(null);
  const [q, setQ] = useState("");
  const lessons = useMemo(() => issues.filter((i) => i.status === "solved" && `${i.title} ${i.solution} ${i.lesson}`.toLowerCase().includes(q.toLowerCase())), [issues, q]);
  return (
    <>
      <PageHead
        title="Issue Board"
        lead="Raise a problem with the people it concerns; a private room opens for the discussion. Once it's solved, the lesson stays here for everyone."
        actions={
          <button type="button" onClick={() => setCreating(true)} className={hb.gold}>
            <Plus aria-hidden className="size-4" /> Raise an issue
          </button>
        }
      />
      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        {COLUMNS.map((col) => {
          const list = issues.filter((i) => i.status === col.status).sort((a, b) => b.at.localeCompare(a.at));
          return (
            <section key={col.status} aria-label={col.label} className="flex flex-col gap-3 rounded-2xl bg-white/[0.03] p-3 ring-1 ring-white/8">
              <header className="flex items-center gap-2 px-1">
                <span className={cn("size-2.5 rounded-full", col.tone)} />
                <h2 className="font-grotesk text-sm font-bold text-white">{col.label}</h2>
                <span className="ml-auto rounded-full bg-white/10 px-2 text-xs font-bold text-white/75">{list.length}</span>
              </header>
              {list.map((i, k) => (
                <IssueCard key={i.id} i={i} k={k} onSolve={() => setSolving(i)} />
              ))}
              {list.length === 0 ? <p className="py-6 text-center text-xs text-white/40">Empty</p> : null}
            </section>
          );
        })}
      </div>
      <section aria-labelledby="lessons">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h2 id="lessons" className="flex items-center gap-2 font-grotesk text-2xl font-bold text-signal-orange">
            <BookOpen aria-hidden className="size-6" /> Lessons learned
          </h2>
          <label className="relative ml-auto w-full sm:w-72">
            <span className="sr-only">Search lessons</span>
            <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/45" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search lessons…" className={cn(inputCls, "min-h-10 pl-9")} />
          </label>
        </div>
        {lessons.length === 0 ? <Empty title="No lessons yet" icon={BookOpen} /> : null}
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {lessons.map((i) => (
            <article key={i.id} className="hq-rise rounded-2xl bg-text-primary p-5 ring-1 ring-white/12">
              <p className="text-xs text-white/55">Solved {i.solvedAt ? dateLabel(i.solvedAt) : ""}</p>
              <h3 className="mt-1 font-grotesk text-lg font-bold text-white">{i.title}</h3>
              <p className="mt-3 text-sm text-white/75">
                <strong className="text-white">Solution: </strong>
                {i.solution}
              </p>
              <p className="mt-3 rounded-xl bg-signal-orange/10 p-3 text-sm text-signal-orange ring-1 ring-signal-orange/30">
                <strong>Lesson: </strong>
                {i.lesson}
              </p>
            </article>
          ))}
        </div>
      </section>
      <CreateIssue open={creating} onOpenChange={setCreating} />
      <SolveIssue issue={solving} onClose={() => setSolving(null)} />
    </>
  );
}

function IssueCard({ i, k, onSolve }: { i: Issue; k: number; onSolve: () => void }) {
  const act = useAct();
  const people = usePeople();
  const now = useNow(60_000);
  const me = useHq((v) => v.me.person);
  const involved = i.by === me.id || i.memberIds.includes(me.id) || me.level === "prime";
  return (
    <article style={{ "--i": Math.min(k, 8) } as React.CSSProperties} className="hq-rise flex flex-col gap-3 rounded-2xl bg-bdnavy-900 p-4 ring-1 ring-white/12">
      <div className="flex items-center gap-2">
        <Avatar person={people.get(i.by)} size="xs" />
        <span className="text-xs text-white/60">
          {nameOf(people, i.by)} · {ago(i.at, now)}
        </span>
        {i.status === "open" ? <TriangleAlert aria-hidden className="ml-auto size-4 text-crimson-bright" /> : i.status === "solved" ? <CheckCircle2 aria-hidden className="ml-auto size-4 text-signal-orange" /> : null}
      </div>
      <h3 className="font-grotesk font-bold text-white">{i.title}</h3>
      <p className="line-clamp-3 text-sm text-white/70">{i.detail}</p>
      <AvatarStack people={i.memberIds.map((id) => people.get(id)).filter((x): x is NonNullable<typeof x> => Boolean(x))} size="xs" />
      <div className="flex flex-wrap gap-2">
        {i.channelId && involved ? (
          <Link href={`/hq/chat?c=${i.channelId}`} className={hb.quietSm}>
            <MessagesSquare aria-hidden className="size-3.5" /> Discussion room
          </Link>
        ) : null}
        {involved && i.status === "open" ? (
          <button type="button" onClick={() => act("issues", "discuss", { id: i.id }, { quiet: true })} className={hb.quietSm}>
            Start discussing
          </button>
        ) : null}
        {involved && i.status !== "solved" ? (
          <button type="button" onClick={onSolve} className={hb.goldSm}>
            Mark solved
          </button>
        ) : null}
        {involved && i.status === "solved" ? (
          <button type="button" onClick={() => act("issues", "reopen", { id: i.id }, { ok: "Reopened" })} className={hb.quietSm}>
            Reopen
          </button>
        ) : null}
      </div>
      {i.status === "solved" ? <Pill tone="gold">Lesson recorded</Pill> : null}
    </article>
  );
}

function CreateIssue({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const act = useAct();
  const all = useHq((v) => v.people);
  const me = useHq((v) => v.me.person.id);
  const [f, setF] = useState({ title: "", detail: "" });
  const [pick, setPick] = useState<string[]>([]);
  return (
    <HqDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Raise an issue"
      size="lg"
      footer={
        <button type="button" disabled={f.title.trim().length < 3 || f.detail.trim().length < 5} onClick={() => act("issues", "create", { ...f, memberIds: pick }, { ok: "Issue raised — the room is open" }).then(() => { onOpenChange(false); setF({ title: "", detail: "" }); setPick([]); }, () => {})} className={hb.gold}>
          Raise issue
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        <FormField label="What's the problem?">
          <input value={f.title} onChange={(e) => setF((x) => ({ ...x, title: e.target.value }))} className={inputCls} />
        </FormField>
        <FormField label="Details">
          <textarea value={f.detail} onChange={(e) => setF((x) => ({ ...x, detail: e.target.value }))} className={textareaCls} />
        </FormField>
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-white/85">People who should discuss it</legend>
          <ul className="grid gap-1 sm:grid-cols-2">
            {all
              .filter((p) => p.status === "active" && p.id !== me)
              .map((p) => {
                const on = pick.includes(p.id);
                return (
                  <li key={p.id}>
                    <button type="button" aria-pressed={on} onClick={() => setPick((x) => (on ? x.filter((y) => y !== p.id) : [...x, p.id]))} className={cn("flex min-h-11 w-full items-center gap-2 rounded-xl px-2 text-left text-sm ring-1", on ? "bg-white/10 text-white ring-signal-orange" : "text-white/80 ring-transparent hover:bg-white/5")}>
                      <Avatar person={p} size="xs" /> {p.name}
                    </button>
                  </li>
                );
              })}
          </ul>
        </fieldset>
      </div>
    </HqDialog>
  );
}

function SolveIssue({ issue, onClose }: { issue: Issue | null; onClose: () => void }) {
  const act = useAct();
  const [f, setF] = useState({ solution: "", lesson: "" });
  return (
    <HqDialog
      open={Boolean(issue)}
      onOpenChange={(o) => !o && onClose()}
      title={`Solve: ${issue?.title ?? ""}`}
      footer={
        <button type="button" disabled={f.solution.trim().length < 5 || f.lesson.trim().length < 5} onClick={() => issue && act("issues", "solve", { id: issue.id, ...f }, { ok: "Solved — lesson saved" }).then(() => { setF({ solution: "", lesson: "" }); onClose(); }, () => {})} className={hb.gold}>
          Save
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        <FormField label="How was it solved?">
          <textarea value={f.solution} onChange={(e) => setF((x) => ({ ...x, solution: e.target.value }))} className={textareaCls} />
        </FormField>
        <FormField label="What did we learn?">
          <textarea value={f.lesson} onChange={(e) => setF((x) => ({ ...x, lesson: e.target.value }))} className={textareaCls} />
        </FormField>
      </div>
    </HqDialog>
  );
}
