"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { HandHeart, LifeBuoy, Plus, Scale } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { HqDialog } from "@/components/hq/dialog";
import { nameOf, usePeople } from "@/components/hq/hooks";
import { Avatar, AvatarStack, Countdown, Empty, FormField, hb, inputCls, PageHead, Pill, Seg, selectCls, textareaCls, type Tone } from "@/components/hq/kit";
import { useAct, useHq, useNow } from "@/components/hq/provider";
import { ago } from "@/lib/hq/format";
import type { HelpRequest } from "@/lib/hq/types";
import { SkillPicker } from "./shared";

const STATUS: Record<HelpRequest["status"], { label: string; tone: Tone }> = { open: { label: "Open", tone: "red" }, helping: { label: "Someone's helping", tone: "gold" }, solved: { label: "Solved", tone: "navy" }, expired: { label: "Expired", tone: "muted" } };

/** Help requests: ask, and everyone with the matching skills hears it. */
export function HelpCenter() {
  const help = useHq((v) => v.help);
  const me = useHq((v) => v.me.person.id);
  const act = useAct();
  const params = useSearchParams();
  const router = useRouter();
  const [tab, setTab] = useState<"me" | "mine" | "all">("me");
  const asking = params.get("new") === "1";
  const setAsking = (o: boolean) => router.replace(o ? "/hq/help?new=1" : "/hq/help", { scroll: false });
  const list = useMemo(() => {
    const l = tab === "me" ? help.filter((h) => h.capable.includes(me) && h.by !== me) : tab === "mine" ? help.filter((h) => h.by === me) : help;
    return [...l].sort((a, b) => Number(a.status === "solved" || a.status === "expired") - Number(b.status === "solved" || b.status === "expired") || b.at.localeCompare(a.at));
  }, [help, tab, me]);

  // Opening the page counts as seeing the open requests you're capable of answering.
  const marked = useRef(new Set<string>());
  useEffect(() => {
    for (const h of help) {
      if (h.status === "open" && h.capable.includes(me) && !h.seen.includes(me) && !marked.current.has(h.id)) {
        marked.current.add(h.id);
        act("tasks", "help.seen", { id: h.id }, { quiet: true }).catch(() => {});
      }
    }
  }, [help, me, act]);

  return (
    <>
      <PageHead
        title="Help Requests"
        lead="Stuck? Ask — everyone whose skills match hears it at once. Helping earns points; the third solved request earns the Helper badge."
        actions={
          <button type="button" onClick={() => setAsking(true)} className={hb.gold}>
            <Plus aria-hidden className="size-4" /> Ask for help
          </button>
        }
      />
      <p className="mb-5 flex items-start gap-2 rounded-2xl bg-text-primary p-4 text-sm leading-relaxed text-white/80 ring-1 ring-white/12">
        <Scale aria-hidden className="mt-0.5 size-4 shrink-0 text-signal-orange" />
        <span>
          The rule: if capable members saw a request and nobody helped — or said why — before its deadline, it goes to the{" "}
          <Link href="/hq/shongbidhan" className="font-semibold text-signal-orange underline">
            Shongbidhan
          </Link>{" "}
          (Part Ga, Article 1, Section 301). Every accused member can answer before a verdict.
        </span>
      </p>
      <Seg
        label="Requests"
        value={tab}
        onChange={setTab}
        className="mb-5"
        options={[
          { value: "me", label: "Asking me", count: help.filter((h) => h.capable.includes(me) && h.by !== me && h.status === "open").length },
          { value: "mine", label: "My requests", count: help.filter((h) => h.by === me).length },
          { value: "all", label: "Everyone's" },
        ]}
      />
      {list.length === 0 ? <Empty icon={LifeBuoy} title="Nothing here" /> : null}
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {list.map((h, i) => (
          <HelpCard key={h.id} h={h} i={i} />
        ))}
      </div>
      <AskDialog open={asking} onOpenChange={setAsking} />
    </>
  );
}

function HelpCard({ h, i }: { h: HelpRequest; i: number }) {
  const act = useAct();
  const people = usePeople();
  const now = useNow(60_000);
  const me = useHq((v) => v.me.person);
  const s = STATUS[h.status];
  return (
    <article style={{ "--i": Math.min(i, 8) } as React.CSSProperties} className="hq-rise flex flex-col gap-3 rounded-2xl bg-bdnavy-900 p-5 ring-1 ring-white/12">
      <div className="flex items-center gap-3">
        <Avatar person={people.get(h.by)} size="md" />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-white">{nameOf(people, h.by)}</span>
          <span className="block text-xs text-white/55">{ago(h.at, now)}</span>
        </span>
        <Pill tone={s.tone}>{s.label}</Pill>
      </div>
      <h2 className="font-grotesk text-lg leading-snug font-bold text-signal-orange">{h.title}</h2>
      {h.detail ? <p className="text-sm leading-relaxed text-white/80">{h.detail}</p> : null}
      <p className="text-xs text-white/60">{h.skills.map((x) => `#${x}`).join(" ")}</p>
      <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
        <span className="flex items-center gap-2">
          <AvatarStack people={h.capable.map((id) => people.get(id)).filter((x): x is NonNullable<typeof x> => Boolean(x))} size="xs" max={5} /> {h.capable.length} capable · {h.seen.length} saw it
        </span>
        {h.status === "open" ? <Countdown to={h.deadline} className="ml-auto" /> : null}
      </div>
      {h.helperId ? (
        <p className="flex items-center gap-2 text-sm text-white/85">
          <HandHeart aria-hidden className="size-4 text-signal-orange" /> {nameOf(people, h.helperId)} {h.status === "solved" ? "helped" : "is helping"}
        </p>
      ) : null}
      <div className="mt-auto flex flex-wrap gap-2 pt-1">
        {h.status === "open" && h.by !== me.id ? (
          <button type="button" onClick={() => act("tasks", "help.offer", { id: h.id }, { ok: "Thank you — they've been told" })} className={hb.goldSm}>
            <HandHeart aria-hidden className="size-3.5" /> I'll help
          </button>
        ) : null}
        {h.status === "helping" && (h.by === me.id || h.helperId === me.id) ? (
          <button type="button" onClick={() => act("tasks", "help.solve", { id: h.id }, { ok: "Marked solved" })} className={hb.goldSm}>
            Mark solved
          </button>
        ) : null}
        {h.by === me.id && h.status === "open" ? (
          <button type="button" onClick={() => act("tasks", "help.cancel", { id: h.id }, { ok: "Withdrawn" })} className={hb.quietSm}>
            Withdraw
          </button>
        ) : null}
        {h.taskId ? (
          <Link href={`/hq/tasks/${h.taskId}`} className={hb.quietSm}>
            Open the task
          </Link>
        ) : null}
      </div>
    </article>
  );
}

function AskDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const act = useAct();
  const tasks = useHq((v) => v.tasks);
  const me = useHq((v) => v.me.person.id);
  const mine = tasks.filter((t) => t.takenBy === me && ["taken", "in-progress"].includes(t.status));
  const [f, setF] = useState({ title: "", detail: "", taskId: "", hours: 24 });
  const [skills, setSkills] = useState<string[]>([]);
  return (
    <HqDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Ask for help"
      description="Everyone whose skills match is notified."
      size="lg"
      footer={
        <button
          type="button"
          disabled={f.title.trim().length < 3 || skills.length === 0}
          onClick={async () => {
            const r = await act<{ capable: number }>("tasks", "help.ask", { ...f, taskId: f.taskId || undefined, skills }).catch(() => null);
            if (!r) return;
            onOpenChange(false);
            setF({ title: "", detail: "", taskId: "", hours: 24 });
            setSkills([]);
          }}
          className={hb.gold}
        >
          <LifeBuoy aria-hidden className="size-4" /> Send to capable members
        </button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="What do you need?" className="sm:col-span-2">
          <input value={f.title} onChange={(e) => setF((x) => ({ ...x, title: e.target.value }))} className={inputCls} />
        </FormField>
        <FormField label="Details" className="sm:col-span-2">
          <textarea value={f.detail} onChange={(e) => setF((x) => ({ ...x, detail: e.target.value }))} className={textareaCls} />
        </FormField>
        <FormField label="For a task (optional)">
          <select value={f.taskId} onChange={(e) => setF((x) => ({ ...x, taskId: e.target.value }))} className={selectCls}>
            <option value="">No task</option>
            {mine.map((t) => (
              <option key={t.id} value={t.id}>
                {t.code} {t.title}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Deadline">
          <select value={f.hours} onChange={(e) => setF((x) => ({ ...x, hours: Number(e.target.value) }))} className={selectCls}>
            {[2, 6, 12, 24, 48, 72].map((h) => (
              <option key={h} value={h}>
                In {h} hours
              </option>
            ))}
          </select>
        </FormField>
        <fieldset className="sm:col-span-2">
          <legend className="text-sm font-semibold text-white/85">Skills needed</legend>
          <SkillPicker value={skills} onChange={setSkills} />
        </fieldset>
      </div>
    </HqDialog>
  );
}
