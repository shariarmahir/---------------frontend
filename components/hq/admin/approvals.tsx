"use client";

import { BadgeCheck, Check, Mail, Phone, X } from "lucide-react";
import { useState } from "react";
import { HqDialog } from "@/components/hq/dialog";
import { nameOf, usePeople } from "@/components/hq/hooks";
import { Avatar, Empty, FormField, hb, inputCls, PageHead, Pill, Seg, selectCls, textareaCls, type Tone } from "@/components/hq/kit";
import { useAct, useHq, useNow } from "@/components/hq/provider";
import { ago } from "@/lib/hq/format";
import { ASSIGNABLE_LEVELS, can, DEPT_LABEL, LEVEL_LABEL } from "@/lib/hq/rules";
import type { Approval, Level, RequestKind } from "@/lib/hq/types";
import { cn } from "@/lib/utils";

const KIND_LABEL: Record<RequestKind, string> = { application: "ID application", team: "Team", "solo-taskbook": "TaskBook", research: "Research", service: "Service", leave: "Leave", content: "Content", designation: "Designation" };
const KIND_TONE: Record<RequestKind, Tone> = { application: "gold", team: "cobalt", "solo-taskbook": "navy", research: "cobalt", service: "gold", leave: "navy", content: "muted", designation: "navy" };

export function Approvals() {
  const v = useHq();
  const act = useAct();
  const people = usePeople();
  const now = useNow(60_000);
  const me = v.me;
  const [kind, setKind] = useState<RequestKind | "all">("all");
  const [tab, setTab] = useState<"pending" | "decided">("pending");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [app, setApp] = useState<Approval | null>(null);
  const mine = (a: Approval) => me.isPrime || can(me.person, a.perm);
  const list = v.approvals
    .filter((a) => (kind === "all" || a.kind === kind) && (tab === "pending" ? a.status === "pending" : a.status !== "pending"))
    .sort((a, b) => b.at.localeCompare(a.at));
  const kinds = [...new Set(v.approvals.map((a) => a.kind))];
  const who = (a: Approval) => (a.kind === "application" ? v.applications.find((x) => x.id === a.refId)?.name ?? "Applicant" : nameOf(people, a.by));

  return (
    <>
      <PageHead title="Approvals" lead="Everything that waits on a yes or no — ID applications, new teams, solo TaskBooks, research, service requests, leave and content — in one inbox." />
      <div className="mb-5 flex flex-wrap gap-2">
        <Seg label="Status" value={tab} onChange={setTab} options={[{ value: "pending", label: "Pending", count: v.approvals.filter((a) => a.status === "pending").length }, { value: "decided", label: "Decided" }]} />
        <Seg label="Kind" value={kind} onChange={setKind} options={[{ value: "all" as const, label: "All" }, ...kinds.map((k) => ({ value: k, label: KIND_LABEL[k], count: v.approvals.filter((a) => a.kind === k && a.status === "pending").length }))]} />
      </div>
      {list.length === 0 ? <Empty icon={BadgeCheck} title={tab === "pending" ? "Nothing waiting" : "Nothing decided yet"} /> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        {list.map((a, i) => (
          <article key={a.id} style={{ "--i": Math.min(i, 8) } as React.CSSProperties} className="hq-rise flex flex-col gap-3 rounded-2xl bg-bdnavy-900 p-5 ring-1 ring-white/12">
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone={KIND_TONE[a.kind]}>{KIND_LABEL[a.kind]}</Pill>
              <span className="text-xs text-white/55">
                {who(a)} · {ago(a.at, now)}
              </span>
              {a.status !== "pending" ? (
                <Pill tone={a.status === "accepted" ? "gold" : "red"} className="ml-auto">
                  {a.status === "accepted" ? "Approved" : "Rejected"} by {nameOf(people, a.decidedBy)}
                </Pill>
              ) : null}
            </div>
            <h2 className="font-grotesk text-lg leading-snug font-bold text-white">{a.title}</h2>
            {a.detail ? <p className="text-sm leading-relaxed text-white/75">{a.detail}</p> : null}
            {a.note ? <p className="text-sm text-white/60">Note: {a.note}</p> : null}
            {a.status === "pending" && mine(a) && a.by !== me.person.id ? (
              a.kind === "application" ? (
                <button type="button" onClick={() => setApp(a)} className={cn(hb.gold, "self-start")}>
                  Review application
                </button>
              ) : (
                <div className="mt-auto flex flex-col gap-2">
                  <input value={notes[a.id] ?? ""} onChange={(e) => setNotes((x) => ({ ...x, [a.id]: e.target.value }))} placeholder="Note (optional)" aria-label="Note" className={cn(inputCls, "min-h-10")} />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => act("approvals", "decide", { id: a.id, accepted: true, note: notes[a.id] || undefined }, { ok: "Approved" })} className={hb.gold}>
                      <Check aria-hidden className="size-4" /> Approve
                    </button>
                    <button type="button" onClick={() => act("approvals", "decide", { id: a.id, accepted: false, note: notes[a.id] || undefined }, { ok: "Rejected" })} className={hb.quiet}>
                      <X aria-hidden className="size-4" /> Reject
                    </button>
                  </div>
                </div>
              )
            ) : a.status === "pending" ? (
              <p className="text-xs text-white/55">{a.by === me.person.id ? "Your request — waiting for someone else to decide." : "Someone with the right access will decide."}</p>
            ) : null}
          </article>
        ))}
      </div>
      <ApplicationDialog key={app?.id ?? "none"} approval={app} onClose={() => setApp(null)} />
    </>
  );
}

function ApplicationDialog({ approval, onClose }: { approval: Approval | null; onClose: () => void }) {
  const act = useAct();
  const v = useHq();
  const app = approval ? v.applications.find((a) => a.id === approval.refId) : undefined;
  const free = v.people.filter((p) => !p.hasAccount && !p.demo);
  const suggest = app ? free.find((p) => p.handle === app.handle || p.name.toLowerCase().split(" ")[0] === app.name.toLowerCase().split(" ")[0]) : undefined;
  const [f, setF] = useState({ personId: suggest?.id ?? "", designation: suggest?.designation ?? "Member", level: (suggest?.level ?? "member") as Level, note: "" });
  if (!approval || !app) return null;
  const decide = (accepted: boolean) => act("approvals", "decide", { id: approval.id, accepted, note: f.note || undefined, extra: accepted ? { personId: f.personId || undefined, designation: f.designation, level: f.level } : {} }, { ok: accepted ? `${app.name} can now sign in` : "Application rejected" }).then(onClose, () => {});
  return (
    <HqDialog
      open
      onOpenChange={(o) => !o && onClose()}
      title={`Application: ${app.name}`}
      size="lg"
      footer={
        <>
          <button type="button" onClick={() => decide(false)} className={hb.quiet}>
            Reject
          </button>
          <button type="button" disabled={f.designation.trim().length < 2} onClick={() => decide(true)} className={hb.gold}>
            <Check aria-hidden className="size-4" /> Approve & create sign-in
          </button>
        </>
      }
    >
      <div className="grid gap-5 md:grid-cols-2">
        <section className="flex flex-col gap-3 rounded-2xl bg-black/30 p-4 ring-1 ring-white/10">
          <div className="flex items-center gap-3">
            <Avatar person={{ name: app.name, photo: null }} size="lg" />
            <div>
              <p className="font-grotesk text-lg font-bold text-white">{app.name}</p>
              {app.nameBn && app.nameBn !== app.name ? <p lang="bn" className="text-sm text-white/65">{app.nameBn}</p> : null}
              <p className="font-mono text-xs text-signal-orange">{app.handle}</p>
            </div>
          </div>
          <p className="flex items-center gap-2 text-sm text-white/80">
            <Mail aria-hidden className="size-4 text-signal-orange" /> {app.email}
          </p>
          <p className="flex items-center gap-2 text-sm text-white/80">
            <Phone aria-hidden className="size-4 text-signal-orange" /> {app.phone}
          </p>
          <p className="text-sm text-white/80">Department: {DEPT_LABEL[app.dept]}</p>
          <div className="flex flex-wrap gap-1.5">
            {app.skills.map((s) => (
              <Pill key={s} tone="navy">
                {s}
              </Pill>
            ))}
          </div>
          {app.note ? <p className="text-sm text-white/75">“{app.note}”</p> : null}
          <p className="text-xs text-white/50">Password set at application{v.faceLock ? "; the face is checked at sign-in" : ""}.</p>
        </section>
        <section className="flex flex-col gap-4">
          <FormField label="Link to an existing team member" hint="Seeded members without a sign-in yet; leave empty to make a new member">
            <select value={f.personId} onChange={(e) => { const p = free.find((x) => x.id === e.target.value); setF((x) => ({ ...x, personId: e.target.value, designation: p?.designation ?? x.designation, level: p?.level ?? x.level })); }} className={selectCls}>
              <option value="">New member</option>
              {free.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.designation}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Designation">
            <input value={f.designation} onChange={(e) => setF((x) => ({ ...x, designation: e.target.value }))} className={inputCls} />
          </FormField>
          <FormField label="Level">
            <select value={f.level} onChange={(e) => setF((x) => ({ ...x, level: e.target.value as Level }))} className={selectCls}>
              {ASSIGNABLE_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {LEVEL_LABEL[l]}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Note (optional)">
            <textarea value={f.note} onChange={(e) => setF((x) => ({ ...x, note: e.target.value }))} className={cn(textareaCls, "min-h-20")} />
          </FormField>
        </section>
      </div>
    </HqDialog>
  );
}
