"use client";

import Link from "next/link";
import { ArrowDown, ArrowLeft, ArrowUp, Award, Briefcase, Check, KeyRound, Mail, Phone, Search, ShieldCheck, Sparkles, UserPlus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { SKILLS } from "@/data/hq/people";
import { HqDialog } from "@/components/hq/dialog";
import { nameOf, useInOffice, usePeople, useToday } from "@/components/hq/hooks";
import { Avatar, AvatarStack, Empty, FormField, hb, inputCls, PageHead, Panel, Pill, selectCls, textareaCls } from "@/components/hq/kit";
import { useAct, useHq } from "@/components/hq/provider";
import { BADGE_LABEL, Ring } from "@/components/hq/tasks/shared";
import { RolePanel, RoleRecord } from "./role-record";
import { dateLabel } from "@/lib/hq/format";
import { ASSIGNABLE_LEVELS, can, DEPT_LABEL, dhakaDay, LEVEL_LABEL, LEVEL_ORDER, num, taka } from "@/lib/hq/rules";
import { rankFor, RANKS, seasonOf } from "@/lib/hq/scoring";
import type { Dept, Level, Person } from "@/lib/hq/types";
import { cn } from "@/lib/utils";

function useSeasonPoints(): Map<string, number> {
  const points = useHq((v) => v.points);
  const today = useToday();
  return useMemo(() => {
    const s = seasonOf(today);
    const m = new Map<string, number>();
    for (const e of points) if (dhakaDay(e.at) >= s.start && dhakaDay(e.at) <= s.end) m.set(e.personId, (m.get(e.personId) ?? 0) + e.points);
    return m;
  }, [points, today]);
}

export function Directory() {
  const v = useHq();
  const act = useAct();
  const inOffice = useInOffice();
  const season = useSeasonPoints();
  const me = v.me.person;
  const [q, setQ] = useState("");
  const [dept, setDept] = useState<Dept | "">("");
  const [level, setLevel] = useState<Level | "">("");
  const [adding, setAdding] = useState(false);
  const list = v.people.filter((p) => (!dept || p.dept === dept) && (!level || p.level === level) && `${p.name} ${p.nameBn} ${p.handle} ${p.designation} ${p.skills.join(" ")}`.toLowerCase().includes(q.toLowerCase()));
  const pendingApps = v.applications.filter((a) => a.status === "pending").length;
  return (
    <>
      <PageHead
        title="People"
        lead={`${v.people.filter((p) => p.status === "active").length} Kandaris, ${inOffice.size} in the office now. Every Kandari is connected to every other — the whole lab is one brain.`}
        actions={
          can(me, "people.manage") ? (
            <>
              {pendingApps ? (
                <Link href="/hq/approvals" className={hb.outline}>
                  {pendingApps} ID {pendingApps === 1 ? "application" : "applications"}
                </Link>
              ) : null}
              <button type="button" onClick={() => setAdding(true)} className={hb.gold}>
                <UserPlus aria-hidden className="size-4" /> Add member
              </button>
            </>
          ) : null
        }
      />
      <div className="mb-5 flex flex-wrap gap-2">
        <label className="relative w-full sm:w-72">
          <span className="sr-only">Search people</span>
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/45" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, skill, username…" className={cn(inputCls, "min-h-10 pl-9")} />
        </label>
        <select aria-label="Department" value={dept} onChange={(e) => setDept(e.target.value as Dept | "")} className={cn(selectCls, "min-h-10 w-auto")}>
          <option value="">Every department</option>
          {Object.entries(DEPT_LABEL).map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </select>
        <select aria-label="Level" value={level} onChange={(e) => setLevel(e.target.value as Level | "")} className={cn(selectCls, "min-h-10 w-auto")}>
          <option value="">Every level</option>
          {LEVEL_ORDER.map((l) => (
            <option key={l} value={l}>
              {LEVEL_LABEL[l]}
            </option>
          ))}
        </select>
      </div>
      {list.length === 0 ? <Empty icon={Users} title="Nobody matches" /> : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {list.map((p, i) => {
          const connected = me.connections.includes(p.id);
          const asked = me.asked.includes(p.id);
          const pts = season.get(p.id) ?? 0;
          return (
            <article key={p.id} style={{ "--i": Math.min(i, 10) } as React.CSSProperties} className={cn("hq-rise relative flex flex-col items-center gap-3 rounded-3xl bg-bdnavy-900 p-6 text-center ring-1 ring-white/12 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:ring-signal-orange/60 motion-reduce:hover:translate-y-0", p.status !== "active" && "opacity-60")}>
              <Avatar person={p} size="xl" online={inOffice.has(p.id)} />
              <Link href={`/hq/people/${p.id}`} className="font-grotesk text-lg font-bold text-white after:absolute after:inset-0 hover:text-signal-orange">
                {p.name}
              </Link>
              <p className="-mt-2 text-sm text-white/65">{p.designation}</p>
              <div className="flex flex-wrap justify-center gap-1.5">
                <Pill tone={p.level === "prime" ? "gold" : "navy"}>{LEVEL_LABEL[p.level]}</Pill>
                <Pill>{DEPT_LABEL[p.dept]}</Pill>
                {p.status !== "active" ? <Pill tone="red">{p.status}</Pill> : null}
                {!p.hasAccount ? <Pill tone="muted">No sign-in yet</Pill> : null}
              </div>
              <p className="line-clamp-1 text-xs text-white/55">{p.skills.map((s) => `#${s}`).join(" ")}</p>
              <p className="text-xs text-white/60">
                {rankFor(pts).label} · <span className="font-bold text-signal-orange">{num(pts)} pts</span>
              </p>
              {p.id !== me.id ? (
                <button
                  type="button"
                  disabled={connected || asked}
                  onClick={() => act("me", "connect", { personId: p.id }, { ok: "Connection request sent" })}
                  className={cn("relative z-10", connected ? hb.quietSm : hb.outlineSm)}
                >
                  {connected ? (
                    <>
                      <Check aria-hidden className="size-3.5" /> Connected
                    </>
                  ) : asked ? (
                    "Requested"
                  ) : (
                    "Connect"
                  )}
                </button>
              ) : (
                <Pill tone="gold">You</Pill>
              )}
            </article>
          );
        })}
      </div>
      {can(me, "people.manage") ? <AddMember open={adding} onOpenChange={setAdding} /> : null}
    </>
  );
}

function AddMember({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const act = useAct();
  const [f, setF] = useState({ name: "", nameBn: "", handle: "kandari@", designation: "", level: "member" as Level, dept: "dev" as Dept });
  const [skills, setSkills] = useState<string[]>([]);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF((x) => ({ ...x, [k]: e.target.value }));
  return (
    <HqDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add a member"
      description="Creates their record now; they apply for their sign-in at /hq/apply and you link the application to this record."
      size="lg"
      footer={
        <button type="button" disabled={f.name.trim().length < 2 || !/^kandari@[a-z0-9]+-[a-z0-9]+$/.test(f.handle) || f.designation.trim().length < 2} onClick={() => act("people", "add", { ...f, nameBn: f.nameBn || f.name, skills }, { ok: "Member added" }).then(() => onOpenChange(false), () => {})} className={hb.gold}>
          Add member
        </button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Full name">
          <input value={f.name} onChange={set("name")} className={inputCls} />
        </FormField>
        <FormField label="Name in Bangla (optional)">
          <input value={f.nameBn} onChange={set("nameBn")} className={inputCls} lang="bn" />
        </FormField>
        <FormField label="Username" hint="kandari@name-dept">
          <input value={f.handle} onChange={set("handle")} className={cn(inputCls, "font-mono")} />
        </FormField>
        <FormField label="Designation">
          <input value={f.designation} onChange={set("designation")} className={inputCls} placeholder="e.g. Firmware Engineer" />
        </FormField>
        <FormField label="Level">
          <select value={f.level} onChange={set("level")} className={selectCls}>
            {ASSIGNABLE_LEVELS.map((l) => (
              <option key={l} value={l}>
                {LEVEL_LABEL[l]}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Department">
          <select value={f.dept} onChange={set("dept")} className={selectCls}>
            {Object.entries(DEPT_LABEL).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
        </FormField>
        <fieldset className="sm:col-span-2">
          <legend className="text-sm font-semibold text-white/85">Skills</legend>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {SKILLS.map((s) => {
              const on = skills.includes(s);
              return (
                <button key={s} type="button" aria-pressed={on} onClick={() => setSkills((x) => (on ? x.filter((y) => y !== s) : [...x, s]))} className={cn("min-h-8 rounded-full px-3 text-xs font-semibold ring-1", on ? "bg-signal-orange text-text-primary ring-signal-orange" : "text-white/75 ring-white/15")}>
                  {s}
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>
    </HqDialog>
  );
}

export function Profile({ id }: { id: string }) {
  const v = useHq();
  const act = useAct();
  const people = usePeople();
  const inOffice = useInOffice();
  const season = useSeasonPoints();
  const p = v.people.find((x) => x.id === id);
  const [designing, setDesigning] = useState(false);
  const [wage, setWage] = useState("");
  if (!p) return <Empty title="Member not found" action={<Link href="/hq/people" className={hb.gold}>Everyone</Link>} />;
  const me = v.me.person;
  const manage = can(me, "people.manage") && p.id !== me.id;
  const pts = season.get(p.id) ?? 0;
  const rank = rankFor(pts);
  const next = RANKS[RANKS.findIndex((r) => r.id === rank.id) + 1];
  const badges = v.badges.filter((b) => b.personId === p.id);
  const teams = v.teams.filter((t) => t.leaderId === p.id || t.memberIds.includes(p.id));
  const done = v.tasks.filter((t) => t.status === "done" && (t.takenBy === p.id || (t.teamId && teams.some((tm) => tm.id === t.teamId)))).sort((a, b) => (b.submittedAt ?? "").localeCompare(a.submittedAt ?? "")).slice(0, 6);
  const connections = p.connections.map((c) => people.get(c)).filter((x): x is Person => Boolean(x));
  const seesWage = me.level === "prime" || can(me, "hr.manage");

  return (
    <div className="flex flex-col gap-5">
      <Link href="/hq/people" className="inline-flex min-h-10 items-center gap-1.5 self-start text-sm font-semibold text-white/65 hover:text-signal-orange">
        <ArrowLeft aria-hidden className="size-4" /> People
      </Link>
      <header className="hq-rise flex flex-col gap-6 rounded-3xl bg-bdnavy-900 p-6 ring-1 ring-white/12 sm:p-8 lg:flex-row lg:items-center">
        <Avatar person={p} size="xl" online={inOffice.has(p.id)} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-grotesk text-3xl font-bold text-signal-orange sm:text-4xl">{p.name}</h1>
            <Pill tone={p.level === "prime" ? "gold" : "navy"}>{LEVEL_LABEL[p.level]}</Pill>
            {p.status !== "active" ? <Pill tone="red">{p.status}</Pill> : null}
          </div>
          {p.nameBn && p.nameBn !== p.name ? (
            <p lang="bn" className="mt-1 text-white/70">
              {p.nameBn}
            </p>
          ) : null}
          <p className="mt-2 text-lg text-white">{p.designation}</p>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/60">
            <span className="font-mono">{p.memberId}</span>
            <span className="font-mono">{p.handle}</span>
            <span>{DEPT_LABEL[p.dept]}</span>
            <span>Joined {dateLabel(p.joinedAt, { year: true })}</span>
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {p.email ? (
              <a href={`mailto:${p.email}`} className={hb.quietSm}>
                <Mail aria-hidden className="size-3.5" /> Email
              </a>
            ) : null}
            {p.phone ? (
              <a href={`tel:${p.phone}`} className={hb.quietSm}>
                <Phone aria-hidden className="size-3.5" /> Call
              </a>
            ) : null}
            {manage ? (
              <button type="button" onClick={() => setDesigning(true)} className={hb.goldSm}>
                <Briefcase aria-hidden className="size-3.5" /> Designation
              </button>
            ) : null}
            {v.me.isPrime && p.level !== "prime" ? (
              <Link href={`/hq/access?p=${p.id}`} className={hb.outlineSm}>
                <KeyRound aria-hidden className="size-3.5" /> Access
              </Link>
            ) : null}
          </div>
        </div>
        <Ring value={next ? (pts - rank.min) / (next.min - rank.min) : 1} size={140} label={`${rank.label}, ${pts} points`}>
          <span>
            <span className="block font-grotesk text-2xl font-bold text-white">{num(pts)}</span>
            <span className="block text-xs text-signal-orange">{rank.label}</span>
          </span>
        </Ring>
      </header>

      <RoleRecord p={p} />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <RolePanel p={p} className="xl:col-span-7" />
        <div className="flex flex-col gap-5 xl:col-span-5">
          <Panel title="Skills" icon={Sparkles}>
            <div className="flex flex-wrap gap-1.5">
              {p.skills.map((s) => (
                <Pill key={s} tone="navy">
                  {s}
                </Pill>
              ))}
            </div>
            {p.learning.length ? (
              <>
                <p className="mt-4 mb-2 text-xs font-semibold text-white/60">Learning</p>
                <div className="flex flex-wrap gap-1.5">
                  {p.learning.map((s) => (
                    <Pill key={s} tone="cobalt">
                      {s}
                    </Pill>
                  ))}
                </div>
              </>
            ) : null}
          </Panel>
          <Panel title="Teams" icon={Users}>
            {teams.length === 0 ? <p className="text-sm text-white/70">Not in a team.</p> : null}
            <ul className="flex flex-col gap-2">
              {teams.map((t) => (
                <li key={t.id}>
                  <Link href={`/hq/teams/${t.id}`} className="flex items-center gap-2 text-sm font-semibold text-white hover:text-signal-orange">
                    {t.name} {t.leaderId === p.id ? <Pill tone="gold">Leader</Pill> : null}
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
        <Panel title="Badges" icon={Award} field="ink" className="xl:col-span-6">
          {badges.length === 0 ? <p className="text-sm text-white/60">No badges yet.</p> : null}
          <ul className="flex flex-col gap-2">
            {badges.map((b) => (
              <li key={b.id} className="flex items-center gap-2 text-sm">
                <Pill tone="gold">{BADGE_LABEL[b.kind]}</Pill>
                <span className="min-w-0 flex-1 truncate text-white/70">{b.note}</span>
                <span className="text-xs text-white/45">{dateLabel(b.day)}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Recent work" icon={Briefcase} className="xl:col-span-6">
          {done.length === 0 ? <p className="text-sm text-white/60">No finished tasks yet.</p> : null}
          <ul className="flex flex-col gap-2">
            {done.map((t) => (
              <li key={t.id}>
                <Link href={`/hq/tasks/${t.id}`} className="flex items-center gap-3 rounded-xl bg-black/25 px-3 py-2.5 ring-1 ring-white/8 hover:bg-black/40">
                  <span className="font-mono text-xs text-white/50">{t.code}</span>
                  <span className="min-w-0 flex-1 truncate text-sm text-white">{t.title}</span>
                  <span className="font-mono text-xs font-bold text-signal-orange">+{t.awarded ?? 0}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Designation history" icon={ShieldCheck} field="ink" className="xl:col-span-6">
          {p.history.length === 0 ? <p className="text-sm text-white/60">Joined as {p.designation}. No changes yet.</p> : null}
          <ol className="relative ml-2 flex flex-col gap-4 border-l-2 border-white/10 pl-5">
            {[...p.history].reverse().map((h, i) => {
              const up = LEVEL_ORDER.indexOf(h.toLevel) < LEVEL_ORDER.indexOf(h.fromLevel);
              const down = LEVEL_ORDER.indexOf(h.toLevel) > LEVEL_ORDER.indexOf(h.fromLevel);
              return (
                <li key={i} className="relative">
                  <span className={cn("absolute top-1 -left-[1.72rem] grid size-4 place-items-center rounded-full ring-4 ring-text-primary", up ? "bg-signal-orange" : down ? "bg-national-crimson" : "bg-bdnavy-300")} />
                  <p className="flex items-center gap-1 text-sm font-semibold text-white">
                    {up ? <ArrowUp aria-hidden className="size-3.5 text-signal-orange" /> : down ? <ArrowDown aria-hidden className="size-3.5 text-crimson-bright" /> : null}
                    {h.to} · {LEVEL_LABEL[h.toLevel]}
                  </p>
                  <p className="text-xs text-white/55">
                    from {h.from} · {dateLabel(h.at, { year: true })} · by {nameOf(people, h.by)}
                  </p>
                  {h.note ? <p className="mt-1 text-sm text-white/75">{h.note}</p> : null}
                </li>
              );
            })}
          </ol>
        </Panel>
        <Panel title={`Connections (${connections.length})`} icon={Users} className="xl:col-span-6">
          <AvatarStack people={connections} max={14} size="md" />
        </Panel>
        {manage || (seesWage && p.id !== me.id) ? (
          <Panel title="Administration" icon={KeyRound} field="cobalt" className="xl:col-span-6">
            <div className="flex flex-col gap-4">
              {seesWage ? (
                <form onSubmit={(e) => { e.preventDefault(); act("people", "wage", { personId: p.id, wage: Number(wage) }, { ok: "Wage saved" }).then(() => setWage(""), () => {}); }} className="flex flex-wrap items-end gap-2">
                  <FormField label={`Monthly wage${p.wage ? ` (now ${taka(p.wage)})` : " (not set)"}`} hint="Used only for the Shongbidhan's legal fine cap" className="flex-1">
                    <input type="number" min={0} value={wage} onChange={(e) => setWage(e.target.value)} className={inputCls} />
                  </FormField>
                  <button type="submit" disabled={!wage} className={hb.gold}>
                    Save
                  </button>
                </form>
              ) : null}
              {manage ? (
                <FormField label="Status">
                  <select value={p.status} onChange={(e) => act("people", "status", { personId: p.id, status: e.target.value }, { ok: "Status updated" })} className={selectCls} disabled={p.level === "prime"}>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="left">Left the company</option>
                  </select>
                </FormField>
              ) : null}
            </div>
          </Panel>
        ) : null}
      </div>
      {manage ? <DesignationDialog key={p.id + p.history.length} p={p} open={designing} onOpenChange={setDesigning} /> : null}
    </div>
  );
}

function DesignationDialog({ p, open, onOpenChange }: { p: Person; open: boolean; onOpenChange: (o: boolean) => void }) {
  const act = useAct();
  const [designation, setDesignation] = useState(p.designation);
  const [level, setLevel] = useState<Level>(p.level);
  const [note, setNote] = useState("");
  const from = LEVEL_ORDER.indexOf(p.level);
  const to = LEVEL_ORDER.indexOf(level);
  return (
    <HqDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Designation — ${p.name}`}
      description="Promote, demote or retitle. They're told, and it's kept in their history."
      footer={
        <button type="button" disabled={designation.trim().length < 2} onClick={() => act("people", "designation", { personId: p.id, designation, level, note: note || undefined }, { ok: to < from ? "Promoted" : to > from ? "Level changed" : "Designation saved" }).then(() => onOpenChange(false), () => {})} className={to > from ? hb.danger : hb.gold}>
          {to < from ? "Promote" : to > from ? "Demote" : "Save"}
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        <FormField label="Designation">
          <input value={designation} onChange={(e) => setDesignation(e.target.value)} className={inputCls} />
        </FormField>
        {p.level === "prime" ? (
          <p className="text-sm text-white/65">The super prime admin&apos;s level never changes; only the designation can be retitled.</p>
        ) : (
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-white/85">Level ladder</legend>
          <ol className="flex flex-col gap-1.5">
            {ASSIGNABLE_LEVELS.map((l) => {
              const i = LEVEL_ORDER.indexOf(l);
              return (
                <li key={l}>
                  <button type="button" aria-pressed={level === l} onClick={() => setLevel(l)} className={cn("flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm ring-1 transition-colors", level === l ? "bg-signal-orange text-text-primary ring-signal-orange" : l === p.level ? "text-white ring-white/30" : "text-white/75 ring-white/10 hover:bg-white/5")}>
                    <span className="font-mono text-xs">{i + 1}</span>
                    <span className="flex-1 font-semibold">{LEVEL_LABEL[l]}</span>
                    {l === p.level ? <span className="text-xs">current</span> : null}
                    {level === l && i < from ? <ArrowUp aria-hidden className="size-4" /> : level === l && i > from ? <ArrowDown aria-hidden className="size-4" /> : null}
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="mt-2 text-xs text-white/55">Changing the level resets their access to that level&apos;s preset; permissions the prime admin added by hand stay.</p>
        </fieldset>
        )}
        <FormField label="Note to them (optional)">
          <textarea value={note} onChange={(e) => setNote(e.target.value)} className={cn(textareaCls, "min-h-20")} />
        </FormField>
      </div>
    </HqDialog>
  );
}
