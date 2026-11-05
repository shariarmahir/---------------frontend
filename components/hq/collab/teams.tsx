"use client";

import Link from "next/link";
import { ArrowLeft, Check, ClipboardList, Crown, LogOut, Mail, MessagesSquare, Plus, Send, ShieldAlert, StickyNote, Trash2, UserPlus, Users, X } from "lucide-react";
import { useMemo, useState } from "react";
import { HqDialog } from "@/components/hq/dialog";
import { nameOf, useInOffice, usePeople } from "@/components/hq/hooks";
import { Avatar, AvatarStack, Countdown, Empty, FormField, hb, inputCls, PageHead, Panel, Pill, Progress, selectCls, textareaCls, type Tone } from "@/components/hq/kit";
import { useAct, useHq, useNow } from "@/components/hq/provider";
import { ago, clockLabel, dateLabel } from "@/lib/hq/format";
import { countWords, DECLINE_MIN_WORDS, dhakaDay, num, STATUS_LABEL } from "@/lib/hq/rules";
import type { Sticky, Team } from "@/lib/hq/types";
import { cn } from "@/lib/utils";

const TEAM_TONE: Record<Team["status"], Tone> = { active: "gold", pending: "cobalt", archived: "muted", rejected: "red" };
const TEAM_STATUS: Record<Team["status"], string> = { active: "Active", pending: "Waiting for approval", archived: "Archived", rejected: "Not approved" };

export function TeamsPage() {
  const teams = useHq((v) => v.teams);
  const me = useHq((v) => v.me.person.id);
  const points = useHq((v) => v.points);
  const people = usePeople();
  const [creating, setCreating] = useState(false);
  const [declining, setDeclining] = useState<Team | null>(null);
  const act = useAct();
  const invites = teams.filter((t) => t.status === "active" && t.invites.some((i) => i.personId === me && i.status === "pending"));
  const mine = teams.filter((t) => t.leaderId === me || t.memberIds.includes(me));
  const others = teams.filter((t) => !mine.includes(t) && t.status !== "rejected");
  const teamPoints = (t: Team) => points.filter((e) => e.taskId && t.taskIds.includes(e.taskId)).reduce((s, e) => s + e.points, 0);

  const card = (t: Team, i: number) => {
    const crew = [t.leaderId, ...t.memberIds].map((id) => people.get(id)).filter((x): x is NonNullable<typeof x> => Boolean(x));
    return (
      <Link key={t.id} href={`/hq/teams/${t.id}`} style={{ "--i": Math.min(i, 8) } as React.CSSProperties} className="hq-rise flex flex-col gap-4 rounded-2xl bg-bdnavy-900 p-5 ring-1 ring-white/12 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:ring-signal-orange/60 motion-reduce:hover:translate-y-0">
        <div className="flex items-start gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-signal-orange font-grotesk text-xl font-bold text-text-primary">{t.name.charAt(0)}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-grotesk text-lg font-bold text-white">{t.name}</span>
            <span className="block text-xs text-white/60">Led by {nameOf(people, t.leaderId)}</span>
          </span>
          <Pill tone={TEAM_TONE[t.status]}>{TEAM_STATUS[t.status]}</Pill>
        </div>
        <p className="line-clamp-2 text-sm text-white/75">{t.purpose}</p>
        <div className="mt-auto flex items-center gap-3 text-xs text-white/60">
          <AvatarStack people={crew} size="sm" />
          <span>{crew.length} people</span>
          <span className="ml-auto">{t.taskIds.length} tasks · {num(teamPoints(t))} pts</span>
        </div>
      </Link>
    );
  };

  return (
    <>
      <PageHead
        title="Teams"
        lead="A team leader proposes a team and invites people; it opens once approved. Declining an invitation needs a reasoned note of at least 150 words."
        actions={
          <button type="button" onClick={() => setCreating(true)} className={hb.gold}>
            <Plus aria-hidden className="size-4" /> Propose a team
          </button>
        }
      />
      {invites.length ? (
        <section aria-label="Invitations" className="mb-6 flex flex-col gap-3">
          {invites.map((t) => (
            <div key={t.id} className="hq-rise flex flex-wrap items-center gap-3 rounded-2xl bg-cobalt p-4 ring-1 ring-white/15">
              <UserPlus aria-hidden className="size-5 text-signal-orange" />
              <p className="min-w-0 flex-1 text-sm text-white">
                <strong>{nameOf(people, t.leaderId)}</strong> invited you to <strong>{t.name}</strong> — {t.purpose}
              </p>
              <button type="button" onClick={() => act("teams", "respond", { id: t.id, accept: true }, { ok: `Welcome to ${t.name}` })} className={hb.goldSm}>
                <Check aria-hidden className="size-3.5" /> Accept
              </button>
              <button type="button" onClick={() => setDeclining(t)} className={hb.quietSm}>
                Decline
              </button>
            </div>
          ))}
        </section>
      ) : null}
      <h2 className="mb-3 font-grotesk text-xl font-bold text-white">My teams</h2>
      {mine.length === 0 ? <Empty icon={Users} title="You're not in a team yet" className="mb-6">Accept an invitation, or propose a team of your own.</Empty> : null}
      <div className="mb-8 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{mine.map(card)}</div>
      <h2 className="mb-3 font-grotesk text-xl font-bold text-white">All teams</h2>
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{others.map(card)}</div>
      {others.length === 0 ? <p className="text-sm text-white/55">No other teams.</p> : null}
      <CreateTeam open={creating} onOpenChange={setCreating} />
      <DeclineDialog team={declining} onClose={() => setDeclining(null)} />
    </>
  );
}

function CreateTeam({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const act = useAct();
  const all = useHq((v) => v.people);
  const clients = useHq((v) => v.clients);
  const me = useHq((v) => v.me.person.id);
  const [f, setF] = useState({ name: "", purpose: "", clientId: "" });
  const [invite, setInvite] = useState<string[]>([]);
  return (
    <HqDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Propose a team"
      description="You'll lead it. It opens — and the invitations go out — once someone who approves teams says yes."
      size="lg"
      footer={
        <button type="button" disabled={f.name.trim().length < 2 || f.purpose.trim().length < 5} onClick={() => act("teams", "create", { ...f, clientId: f.clientId || undefined, invite }, { ok: "Sent for approval" }).then(() => onOpenChange(false), () => {})} className={hb.gold}>
          <Send aria-hidden className="size-4" /> Send for approval
        </button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Team name">
          <input value={f.name} onChange={(e) => setF((x) => ({ ...x, name: e.target.value }))} className={inputCls} />
        </FormField>
        <FormField label="Client (optional)">
          <select value={f.clientId} onChange={(e) => setF((x) => ({ ...x, clientId: e.target.value }))} className={selectCls}>
            <option value="">No client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.org}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Purpose" className="sm:col-span-2">
          <textarea value={f.purpose} onChange={(e) => setF((x) => ({ ...x, purpose: e.target.value }))} className={textareaCls} />
        </FormField>
        <fieldset className="sm:col-span-2">
          <legend className="mb-2 text-sm font-semibold text-white/85">Invite ({invite.length})</legend>
          <ul className="grid gap-1 sm:grid-cols-2">
            {all
              .filter((p) => p.status === "active" && p.id !== me)
              .map((p) => {
                const on = invite.includes(p.id);
                return (
                  <li key={p.id}>
                    <button type="button" aria-pressed={on} onClick={() => setInvite((x) => (on ? x.filter((y) => y !== p.id) : [...x, p.id]))} className={cn("flex min-h-12 w-full items-center gap-3 rounded-xl px-2 text-left ring-1", on ? "bg-white/10 ring-signal-orange" : "ring-transparent hover:bg-white/5")}>
                      <Avatar person={p} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-white">{p.name}</span>
                        <span className="block truncate text-xs text-white/55">{p.skills.slice(0, 4).join(", ")}</span>
                      </span>
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

function DeclineDialog({ team, onClose }: { team: Team | null; onClose: () => void }) {
  const act = useAct();
  const people = usePeople();
  const [reason, setReason] = useState("");
  const words = countWords(reason);
  const leader = team ? people.get(team.leaderId) : undefined;
  return (
    <HqDialog
      open={Boolean(team)}
      onOpenChange={(o) => !o && onClose()}
      title={`Decline ${team?.name ?? ""}`}
      description="Kandari Lab's rule: say why, with evidence, in at least 150 words. Your leader reads it."
      size="lg"
      footer={
        <>
          {leader?.email ? (
            <a href={`mailto:${leader.email}?subject=${encodeURIComponent(`About joining ${team?.name}`)}&body=${encodeURIComponent(reason)}`} className={hb.quiet}>
              <Mail aria-hidden className="size-4" /> Also send by email
            </a>
          ) : null}
          <button type="button" disabled={words < DECLINE_MIN_WORDS} onClick={() => team && act("teams", "respond", { id: team.id, accept: false, reason }, { ok: "Your reason was sent to the leader" }).then(onClose, () => {})} className={hb.gold}>
            Decline with this reason
          </button>
        </>
      }
    >
      <textarea value={reason} onChange={(e) => setReason(e.target.value)} className={cn(textareaCls, "min-h-64")} placeholder="Why you can't join now — your current commitments, timing, evidence — and how you could help instead." aria-label="Your reason" />
      <div className="mt-3 flex items-center gap-3">
        <Progress value={(words / DECLINE_MIN_WORDS) * 100} tone={words >= DECLINE_MIN_WORDS ? "gold" : "navy"} className="flex-1" label="Word count" />
        <span className={cn("font-mono text-sm font-bold", words >= DECLINE_MIN_WORDS ? "text-signal-orange" : "text-white/70")}>
          {words} of {DECLINE_MIN_WORDS} words
        </span>
      </div>
    </HqDialog>
  );
}

/* ───────────── the team leader's console ───────────── */

const STICKY: Record<Sticky["level"], string> = { crisis: "bg-national-crimson text-white", urgent: "bg-bdnavy-900 text-white ring-2 ring-signal-orange", info: "bg-cobalt text-white" };

export function TeamConsole({ id }: { id: string }) {
  const v = useHq();
  const act = useAct();
  const now = useNow(60_000);
  const people = usePeople();
  const inOffice = useInOffice();
  const t = v.teams.find((x) => x.id === id);
  const [inviting, setInviting] = useState(false);
  const [sticky, setSticky] = useState({ text: "", level: "urgent" as Sticky["level"] });
  const [update, setUpdate] = useState("");
  const [openReason, setOpenReason] = useState<string | null>(null);
  const tasks = useMemo(() => v.tasks.filter((x) => x.teamId === id), [v.tasks, id]);
  if (!t) return <Empty title="Team not found" action={<Link href="/hq/teams" className={hb.gold}>All teams</Link>} />;
  const me = v.me.person;
  const leader = t.leaderId === me.id || me.level === "prime";
  const member = leader || t.memberIds.includes(me.id);
  const crew = [t.leaderId, ...t.memberIds];
  const client = t.clientId ? v.clients.find((c) => c.id === t.clientId) : undefined;
  const points = v.points.filter((e) => e.taskId && tasks.some((x) => x.id === e.taskId)).reduce((s, e) => s + e.points, 0);
  const schedule = [
    ...tasks.filter((x) => !["done", "cancelled"].includes(x.status)).map((x) => ({ id: x.id, at: x.due, title: `${x.code} due: ${x.title}`, href: `/hq/tasks/${x.id}` })),
    ...tasks.flatMap((x) => x.milestones.filter((m) => !m.done).map((m) => ({ id: m.id, at: m.at, title: `${m.title} (${x.code})`, href: `/hq/tasks/${x.id}` }))),
    ...v.events.filter((e) => e.teamId === id).map((e) => ({ id: e.id, at: e.start, title: e.title, href: "/hq/calendar" })),
  ]
    .filter((x) => Date.parse(x.at) > now - 86400_000)
    .sort((a, b) => a.at.localeCompare(b.at))
    .slice(0, 8);
  const reports = crew.map((pid) => v.reports.filter((r) => r.personId === pid).sort((a, b) => b.day.localeCompare(a.day))[0]).filter(Boolean);

  return (
    <div className="flex flex-col gap-5">
      <Link href="/hq/teams" className="inline-flex min-h-10 items-center gap-1.5 self-start text-sm font-semibold text-white/65 hover:text-signal-orange">
        <ArrowLeft aria-hidden className="size-4" /> Teams
      </Link>
      <header className="hq-rise flex flex-col gap-4 rounded-3xl bg-bdnavy-900 p-6 ring-1 ring-white/12 lg:flex-row lg:items-center">
        <span className="grid size-16 shrink-0 place-items-center rounded-3xl bg-signal-orange font-grotesk text-3xl font-bold text-text-primary">{t.name.charAt(0)}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-grotesk text-3xl font-bold text-signal-orange">{t.name}</h1>
            <Pill tone={TEAM_TONE[t.status]}>{TEAM_STATUS[t.status]}</Pill>
          </div>
          <p className="mt-1 text-white/75">{t.purpose}</p>
          <p className="mt-2 text-sm text-white/60">
            Led by <strong className="text-white">{nameOf(people, t.leaderId)}</strong>
            {client ? ` · Client: ${client.org}` : ""} · {num(points)} team points
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {t.channelId && member ? (
            <Link href={`/hq/chat?c=${t.channelId}`} className={hb.gold}>
              <MessagesSquare aria-hidden className="size-4" /> Team chat
            </Link>
          ) : null}
          {leader && t.status === "active" ? (
            <button type="button" onClick={() => setInviting(true)} className={hb.outline}>
              <UserPlus aria-hidden className="size-4" /> Invite
            </button>
          ) : null}
          {member && !leader ? (
            <button type="button" onClick={() => act("teams", "leave", { id: t.id }, { ok: "You left the team" })} className={hb.quiet}>
              <LogOut aria-hidden className="size-4" /> Leave
            </button>
          ) : null}
          {leader && t.status === "active" ? (
            <button type="button" onClick={() => act("teams", "archive", { id: t.id }, { ok: "Team archived" })} className={hb.quiet}>
              Archive
            </button>
          ) : null}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <Panel title="Emergency sticky notes" icon={StickyNote} className="xl:col-span-7" sub="Crisis notes alert the whole team">
          {member ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (sticky.text.trim().length < 2) return;
                act("teams", "sticky.add", { id: t.id, ...sticky }, { ok: "Pinned" }).then(() => setSticky((x) => ({ ...x, text: "" })), () => {});
              }}
              className="mb-4 flex flex-col gap-2 sm:flex-row"
            >
              <input value={sticky.text} onChange={(e) => setSticky((x) => ({ ...x, text: e.target.value }))} placeholder="Pin a note for the team…" aria-label="Sticky note" className={inputCls} />
              <select value={sticky.level} onChange={(e) => setSticky((x) => ({ ...x, level: e.target.value as Sticky["level"] }))} aria-label="Level" className={cn(selectCls, "sm:w-36")}>
                <option value="info">Info</option>
                <option value="urgent">Urgent</option>
                <option value="crisis">Crisis</option>
              </select>
              <button type="submit" className={hb.gold}>
                Pin
              </button>
            </form>
          ) : null}
          <ul className="grid gap-3 sm:grid-cols-2">
            {[...t.stickies]
              .sort((a, b) => Number(a.resolved) - Number(b.resolved) || b.at.localeCompare(a.at))
              .map((s) => (
                <li key={s.id} className={cn("relative flex min-h-28 flex-col gap-2 rounded-2xl p-4 shadow-lg transition-opacity", STICKY[s.level], s.resolved && "opacity-45")}>
                  <span className="flex items-center gap-2 text-xs font-bold">
                    {s.level === "crisis" ? <ShieldAlert aria-hidden className="size-4" /> : null}
                    {s.level === "crisis" ? "Crisis" : s.level === "urgent" ? "Urgent" : "Note"} · {nameOf(people, s.by)} · {ago(s.at, now)}
                  </span>
                  <p className={cn("text-sm font-semibold", s.resolved && "line-through")}>{s.text}</p>
                  {member ? (
                    <button type="button" onClick={() => act("teams", "sticky.resolve", { id: t.id, sid: s.id }, { quiet: true })} className="mt-auto self-start rounded-lg bg-black/25 px-2.5 py-1 text-xs font-bold hover:bg-black/40">
                      {s.resolved ? "Reopen" : "Resolved"}
                    </button>
                  ) : null}
                </li>
              ))}
          </ul>
          {t.stickies.length === 0 ? <p className="text-sm text-white/55">No notes.</p> : null}
        </Panel>

        <Panel title="Members" icon={Users} className="xl:col-span-5">
          <ul className="flex flex-col gap-2">
            {crew.map((pid) => {
              const p = people.get(pid);
              return (
                <li key={pid} className="flex items-center gap-3">
                  <Avatar person={p} size="md" online={inOffice.has(pid)} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-white">
                      {p?.name} {pid === t.leaderId ? <Crown aria-hidden className="size-3.5 text-signal-orange" /> : null}
                    </span>
                    <span className="block truncate text-xs text-white/55">{p?.skills.slice(0, 4).join(", ")}</span>
                  </span>
                  {leader && pid !== t.leaderId ? (
                    <button type="button" onClick={() => act("teams", "remove", { id: t.id, personId: pid }, { ok: "Removed" })} aria-label={`Remove ${p?.name}`} className={hb.iconSm}>
                      <Trash2 aria-hidden className="size-3.5" />
                    </button>
                  ) : null}
                </li>
              );
            })}
          </ul>
          {t.invites.length ? (
            <div className="mt-4 border-t border-white/8 pt-3">
              <p className="mb-2 text-xs font-semibold text-white/60">Invitations</p>
              <ul className="flex flex-col gap-1.5">
                {t.invites.map((inv) => (
                  <li key={inv.personId + inv.at} className="text-sm">
                    <span className="flex items-center gap-2">
                      <span className="min-w-0 flex-1 truncate text-white/85">{nameOf(people, inv.personId)}</span>
                      <Pill tone={inv.status === "accepted" ? "gold" : inv.status === "declined" ? "red" : "muted"}>{inv.status}</Pill>
                      {inv.reason ? (
                        <button type="button" onClick={() => setOpenReason(openReason === inv.personId ? null : inv.personId)} className="text-xs font-semibold text-signal-orange underline">
                          {openReason === inv.personId ? "Hide reason" : "Reason"}
                        </button>
                      ) : null}
                    </span>
                    {openReason === inv.personId ? <p className="mt-2 rounded-xl bg-black/30 p-3 text-xs leading-relaxed text-white/80">{inv.reason}</p> : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Panel>

        <Panel title="Team tasks" icon={ClipboardList} className="xl:col-span-7">
          {tasks.length === 0 ? <p className="text-sm text-white/55">No tasks yet — the leader takes tickets for the team on the board.</p> : null}
          <ul className="flex flex-col gap-2">
            {tasks.map((x) => {
              const done = x.milestones.filter((m) => m.done).length;
              return (
                <li key={x.id}>
                  <Link href={`/hq/tasks/${x.id}`} className="block rounded-xl bg-black/25 px-4 py-3 ring-1 ring-white/8 hover:bg-black/40">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-white/50">{x.code}</span>
                      <span className="min-w-0 flex-1 truncate font-semibold text-white">{x.title}</span>
                      <Pill tone={x.status === "done" ? "gold" : "navy"}>{STATUS_LABEL[x.status]}</Pill>
                      {x.status !== "done" ? <Countdown to={x.due} /> : null}
                    </span>
                    {x.milestones.length ? <Progress value={(done / x.milestones.length) * 100} className="mt-2 h-1.5" label="Milestones" /> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel title="Schedule" icon={ClipboardList} field="ink" className="xl:col-span-5">
          {schedule.length === 0 ? <p className="text-sm text-white/55">Nothing scheduled.</p> : null}
          <ol className="relative ml-2 flex flex-col gap-3 border-l-2 border-white/10 pl-5">
            {schedule.map((s) => (
              <li key={s.id} className="relative">
                <span className={cn("absolute top-1.5 -left-[1.72rem] size-3 rounded-full ring-4 ring-text-primary", Date.parse(s.at) < now ? "bg-national-crimson" : "bg-signal-orange")} />
                <span className="block font-mono text-xs text-signal-orange">
                  {dateLabel(s.at)} · {clockLabel(s.at)}
                </span>
                <Link href={s.href} className="text-sm text-white hover:text-signal-orange">
                  {s.title}
                </Link>
              </li>
            ))}
          </ol>
        </Panel>

        {client || t.clientUpdates.length ? (
          <Panel title="Client updates" icon={Send} field="cobalt" className="xl:col-span-6">
            {leader ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  act("teams", "client.update", { id: t.id, text: update }, { ok: "Logged" }).then(() => setUpdate(""), () => {});
                }}
                className="mb-3 flex gap-2"
              >
                <input value={update} onChange={(e) => setUpdate(e.target.value)} placeholder="What did you tell the client?" aria-label="Client update" className={inputCls} />
                <button type="submit" disabled={update.trim().length < 3} className={hb.gold}>
                  Log
                </button>
              </form>
            ) : null}
            <ul className="flex flex-col gap-2">
              {[...t.clientUpdates].reverse().map((u) => (
                <li key={u.id} className="rounded-xl bg-black/25 p-3 text-sm text-white/85">
                  {u.text}
                  <span className="mt-1 block text-xs text-white/55">
                    {nameOf(people, u.by)} · {ago(u.at, now)}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        ) : null}

        <Panel title="Latest daily reports" icon={ClipboardList} className={client || t.clientUpdates.length ? "xl:col-span-6" : "xl:col-span-12"}>
          {reports.length === 0 ? <p className="text-sm text-white/55">No reports yet.</p> : null}
          <ul className="grid gap-3 sm:grid-cols-2">
            {reports.map((r) => (
              <li key={r!.id} className="rounded-xl bg-black/25 p-3 ring-1 ring-white/8">
                <span className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Avatar person={people.get(r!.personId)} size="xs" /> {nameOf(people, r!.personId)}
                  <span className="ml-auto text-xs font-normal text-white/50">{r!.day === dhakaDay(now) ? "Today" : dateLabel(r!.day)}</span>
                </span>
                <p className="mt-2 text-sm text-white/80">{r!.done}</p>
                {r!.blockers ? <p className="mt-1 text-xs text-crimson-bright">Blocked: {r!.blockers}</p> : null}
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <InviteDialog team={t} open={inviting} onOpenChange={setInviting} />
    </div>
  );
}

function InviteDialog({ team, open, onOpenChange }: { team: Team; open: boolean; onOpenChange: (o: boolean) => void }) {
  const act = useAct();
  const all = useHq((v) => v.people);
  const [pick, setPick] = useState<string[]>([]);
  const free = all.filter((p) => p.status === "active" && p.id !== team.leaderId && !team.memberIds.includes(p.id) && !team.invites.some((i) => i.personId === p.id && i.status === "pending"));
  return (
    <HqDialog open={open} onOpenChange={onOpenChange} title={`Invite to ${team.name}`} size="sm" footer={<button type="button" disabled={!pick.length} onClick={() => act("teams", "invite", { id: team.id, personIds: pick }, { ok: "Invitations sent" }).then(() => { setPick([]); onOpenChange(false); }, () => {})} className={hb.gold}>Send {pick.length || ""} invitations</button>}>
      <ul className="flex flex-col gap-1">
        {free.map((p) => {
          const on = pick.includes(p.id);
          return (
            <li key={p.id}>
              <button type="button" aria-pressed={on} onClick={() => setPick((x) => (on ? x.filter((y) => y !== p.id) : [...x, p.id]))} className={cn("flex min-h-11 w-full items-center gap-3 rounded-xl px-2 text-left", on ? "bg-white/10" : "hover:bg-white/5")}>
                <Avatar person={p} size="sm" />
                <span className="min-w-0 flex-1 truncate text-sm text-white">{p.name}</span>
                {on ? <Check aria-hidden className="size-4 text-signal-orange" /> : <X aria-hidden className="size-4 text-transparent" />}
              </button>
            </li>
          );
        })}
      </ul>
      {free.length === 0 ? <p className="text-sm text-white/60">Everyone is already in or invited.</p> : null}
    </HqDialog>
  );
}
