"use client";

import { Heart, PartyPopper, Plus, Star } from "lucide-react";
import { useState } from "react";
import { HqDialog } from "@/components/hq/dialog";
import { nameOf, usePeople } from "@/components/hq/hooks";
import { Avatar, AvatarStack, Empty, FormField, hb, inputCls, PageHead, Pill, selectCls, textareaCls } from "@/components/hq/kit";
import { useAct, useHq, useNow } from "@/components/hq/provider";
import { ago, dateLabel } from "@/lib/hq/format";
import type { Story } from "@/lib/hq/types";
import { cn } from "@/lib/utils";

/** The celebration wall: delivered work told as a story — the challenge, the solution, why, and the moments. */
export function Wall() {
  const stories = useHq((v) => v.stories);
  const [writing, setWriting] = useState(false);
  const sorted = [...stories].sort((a, b) => b.at.localeCompare(a.at));
  return (
    <>
      <PageHead
        title="Celebration Wall"
        lead="Every delivery is a story: the challenge, the solution, why we chose it, and the moments on the way. Cheer your teammates on."
        actions={
          <button type="button" onClick={() => setWriting(true)} className={hb.gold}>
            <Plus aria-hidden className="size-4" /> Write a story
          </button>
        }
      />
      {sorted.length === 0 ? <Empty icon={PartyPopper} title="No stories yet" action={<button type="button" onClick={() => setWriting(true)} className={hb.goldSm}>Write the first one</button>} /> : null}
      <div className="columns-1 gap-5 md:columns-2 2xl:columns-3">
        {sorted.map((s, i) => (
          <StoryCard key={s.id} s={s} i={i} />
        ))}
      </div>
      <StoryDialog open={writing} onOpenChange={setWriting} />
    </>
  );
}

function StoryCard({ s, i }: { s: Story; i: number }) {
  const act = useAct();
  const people = usePeople();
  const now = useNow(60_000);
  const me = useHq((v) => v.me.person.id);
  const team = useHq((v) => (s.teamId ? v.teams.find((t) => t.id === s.teamId) : undefined));
  const task = useHq((v) => (s.taskId ? v.tasks.find((t) => t.id === s.taskId) : undefined));
  const client = useHq((v) => (s.clientId ? v.clients.find((c) => c.id === s.clientId) : undefined));
  const cheered = s.cheers.includes(me);
  const crew = team ? [team.leaderId, ...team.memberIds] : [s.by];
  return (
    <article style={{ "--i": Math.min(i, 6) } as React.CSSProperties} className={cn("hq-rise mb-5 break-inside-avoid overflow-hidden rounded-3xl ring-1 ring-white/12", i % 3 === 1 ? "bg-cobalt" : i % 3 === 2 ? "bg-text-primary" : "bg-bdnavy-900")}>
      <div className="p-6">
        <div className="flex items-center gap-3">
          <Avatar person={people.get(s.by)} size="md" />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-white">{nameOf(people, s.by)}</span>
            <span className="block text-xs text-white/60">
              {ago(s.at, now)}
              {team ? ` · ${team.name}` : ""}
            </span>
          </span>
          {s.sample ? <Pill>Sample</Pill> : null}
        </div>
        <h2 className="mt-4 font-grotesk text-xl leading-snug font-bold text-signal-orange">{s.title}</h2>
        <dl className="mt-4 flex flex-col gap-3 text-sm leading-relaxed">
          <div>
            <dt className="font-bold text-white">The challenge</dt>
            <dd className="text-white/80">{s.challenge}</dd>
          </div>
          <div>
            <dt className="font-bold text-white">The solution</dt>
            <dd className="text-white/80">{s.solution}</dd>
          </div>
          {s.why ? (
            <div>
              <dt className="font-bold text-white">Why this way</dt>
              <dd className="text-white/80">{s.why}</dd>
            </div>
          ) : null}
        </dl>
        {s.moments.length ? (
          <ol className="relative mt-5 ml-1.5 flex flex-col gap-3 border-l-2 border-signal-orange/40 pl-4">
            {s.moments.map((m, k) => (
              <li key={k} className="relative text-sm text-white/85">
                <span aria-hidden className="absolute top-1.5 -left-[1.38rem] size-2.5 rounded-full bg-signal-orange" />
                <span className="block text-xs text-white/55">{dateLabel(m.at)}</span>
                {m.text}
              </li>
            ))}
          </ol>
        ) : null}
        {client?.review || task?.clientReview ? (
          <p className="mt-4 flex items-center gap-1 text-sm text-white/85">
            {Array.from({ length: 5 }, (_, k) => (
              <Star key={k} aria-hidden className={cn("size-4", k < Math.round(client?.review?.score ?? task?.clientReview?.score ?? 0) ? "fill-signal-orange text-signal-orange" : "text-white/30")} />
            ))}
            <span className="ml-1">Client rating {client?.review?.score ?? task?.clientReview?.score}/5</span>
          </p>
        ) : null}
      </div>
      <footer className="flex items-center gap-3 border-t border-white/10 bg-black/20 px-6 py-3">
        <AvatarStack people={crew.map((id) => people.get(id)).filter((x): x is NonNullable<typeof x> => Boolean(x))} size="xs" />
        <button type="button" aria-pressed={cheered} onClick={() => act("tasks", "story.cheer", { id: s.id }, { quiet: true })} className={cn("ml-auto inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-bold ring-1 transition-all", cheered ? "bg-signal-orange text-text-primary ring-signal-orange" : "text-white ring-white/20 hover:bg-white/10")}>
          <Heart aria-hidden className={cn("size-4 transition-transform", cheered && "scale-125 fill-current")} /> {s.cheers.length} cheers
        </button>
      </footer>
    </article>
  );
}

function StoryDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const act = useAct();
  const tasks = useHq((v) => v.tasks);
  const done = tasks.filter((t) => t.status === "done");
  const [f, setF] = useState({ taskId: "", title: "", challenge: "", solution: "", why: "", moments: "" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF((x) => ({ ...x, [k]: e.target.value }));
  return (
    <HqDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Write a story for the wall"
      size="lg"
      footer={
        <button
          type="button"
          disabled={f.title.trim().length < 3 || f.challenge.trim().length < 5 || f.solution.trim().length < 5}
          onClick={() =>
            act("tasks", "story.create", { ...f, taskId: f.taskId || undefined, moments: f.moments.split("\n").map((m) => m.trim()).filter(Boolean) }, { ok: "On the wall!" }).then(() => {
              onOpenChange(false);
              setF({ taskId: "", title: "", challenge: "", solution: "", why: "", moments: "" });
            }, () => {})
          }
          className={hb.gold}
        >
          <PartyPopper aria-hidden className="size-4" /> Post to the wall
        </button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="From a finished task (optional)">
          <select value={f.taskId} onChange={(e) => {
            const t = done.find((x) => x.id === e.target.value);
            setF((x) => ({ ...x, taskId: e.target.value, title: x.title || (t ? t.title : "") }));
          }} className={selectCls}>
            <option value="">No task</option>
            {done.map((t) => (
              <option key={t.id} value={t.id}>
                {t.code} {t.title}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Title">
          <input value={f.title} onChange={set("title")} className={inputCls} />
        </FormField>
        <FormField label="The challenge" className="sm:col-span-2">
          <textarea value={f.challenge} onChange={set("challenge")} className={textareaCls} />
        </FormField>
        <FormField label="The solution" className="sm:col-span-2">
          <textarea value={f.solution} onChange={set("solution")} className={textareaCls} />
        </FormField>
        <FormField label="Why this solution" className="sm:col-span-2">
          <textarea value={f.why} onChange={set("why")} className={textareaCls} />
        </FormField>
        <FormField label="Moments (one per line)" className="sm:col-span-2">
          <textarea value={f.moments} onChange={set("moments")} className={textareaCls} placeholder={"Kick-off with the client\nFirst prototype working\nDelivered!"} />
        </FormField>
      </div>
    </HqDialog>
  );
}
