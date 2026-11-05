"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarClock,
  Check,
  ChevronDown,
  CircleDollarSign,
  FileText,
  Handshake,
  History,
  LayoutGrid,
  List,
  Mail,
  MessagesSquare,
  MoreHorizontal,
  NotebookPen,
  PartyPopper,
  Pencil,
  Percent,
  Phone,
  Plus,
  Star,
  Trash2,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import { DropdownMenu as DM } from "radix-ui";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/hq/data-table";
import { HqDialog } from "@/components/hq/dialog";
import { nameOf, usePeople, useToday } from "@/components/hq/hooks";
import { Avatar, Empty, FormField, hb, inputCls, PageHead, Panel, Pill, Progress, Seg, selectCls, Stat, textareaCls, type Tone } from "@/components/hq/kit";
import { useAct, useHq, useNow } from "@/components/hq/provider";
import { docTotals } from "@/lib/hq/finance";
import { dateLabel } from "@/lib/hq/format";
import { can, dhakaDay, num, STAGE_LABEL, STAGE_ORDER, taka } from "@/lib/hq/rules";
import { seasonOf } from "@/lib/hq/scoring";
import type { Client, Doc, Project, Stage } from "@/lib/hq/types";
import { cn } from "@/lib/utils";

/**
 * The client CRM: a pipeline from first contact to the client's review.
 * Confirming a client opens its project and HR room at once (business
 * domain). Everyone with `clients.view` reads it; `clients.manage` moves and
 * edits; members only ever receive their own clients (lib/hq/view.ts).
 */

/** The stages a deal moves through; "lost" sits apart. */
const FLOW: Stage[] = STAGE_ORDER.filter((s) => s !== "lost");
const OPEN: Stage[] = ["lead", "first-meeting", "proposal"];
const WON: Stage[] = ["confirmed", "in-progress", "delivered", "reviewed"];
const DAY = 86_400_000;
/** A deal that hasn't moved in this many days needs a follow-up; past STALE it's urgent. */
const FOLLOW_UP = 7;
const STALE = 14;
const PEEK = 5;

const STAGE_DOT: Record<Stage, string> = {
  lead: "bg-white/45",
  "first-meeting": "bg-bdnavy-300",
  proposal: "bg-bdnavy-400",
  confirmed: "bg-signal-orange",
  "in-progress": "bg-signal-orange",
  delivered: "bg-cobalt ring-1 ring-white/40",
  reviewed: "bg-white",
  lost: "bg-national-crimson",
};
const STAGE_TONE: Record<Stage, Tone> = { lead: "muted", "first-meeting": "navy", proposal: "navy", confirmed: "gold", "in-progress": "gold", delivered: "cobalt", reviewed: "white", lost: "red" };
const PROJECT_TONE: Record<Project["status"], Tone> = { setup: "navy", running: "gold", delivered: "cobalt", closed: "muted" };
const DOC_TONE: Record<Doc["status"], Tone> = { draft: "muted", sent: "navy", paid: "gold", void: "red" };
const PROJECT_LABEL: Record<Project["status"], string> = { setup: "Setting up", running: "Running", delivered: "Delivered", closed: "Closed" };
const DOC_LABEL: Record<Doc["kind"], string> = { quotation: "Quotation", invoice: "Invoice", challan: "Challan", "mushok-6.3": "Mushok 6.3", contract: "Contract", receipt: "Receipt" };

const daysIn = (c: Client, now: number) => Math.max(0, Math.floor((now - Date.parse(c.stageAt)) / DAY));
const needsFollowUp = (c: Client, now: number) => OPEN.includes(c.stage) && daysIn(c, now) >= FOLLOW_UP;
const nextStage = (s: Stage): Stage | undefined => (s === "lost" ? undefined : FLOW[FLOW.indexOf(s) + 1]);

function Stars({ score, size = "sm" }: { score: number; size?: "sm" | "md" }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`Rated ${score} out of 5`}>
      {Array.from({ length: 5 }, (_, k) => (
        <Star key={k} aria-hidden className={cn(size === "sm" ? "size-3.5" : "size-5", k < Math.round(score) ? "fill-signal-orange text-signal-orange" : "text-white/25")} />
      ))}
    </span>
  );
}

/** Moves a client: the next stage in one click, any stage from the menu. */
function StageMenu({ client: c, compact }: { client: Client; compact?: boolean }) {
  const act = useAct();
  const move = (stage: Stage) => act("business", "client.stage", { id: c.id, stage }, { ok: `${c.org}: ${STAGE_LABEL[stage]}` }).catch(() => {});
  const next = nextStage(c.stage);
  return (
    <div className="relative z-10 flex items-center gap-1.5">
      {next ? (
        <button type="button" onClick={() => move(next)} className={cn(hb.quietSm, compact ? "flex-1 justify-between" : "")}>
          {STAGE_LABEL[next]} <ArrowRight aria-hidden className="size-3.5" />
        </button>
      ) : c.stage === "lost" ? (
        <button type="button" onClick={() => move("lead")} className={cn(hb.quietSm, compact ? "flex-1" : "")}>
          Reopen as lead
        </button>
      ) : null}
      <DM.Root>
        <DM.Trigger aria-label={`Move ${c.org} to another stage`} className={hb.iconSm}>
          <MoreHorizontal aria-hidden className="size-4" />
        </DM.Trigger>
        <DM.Portal>
          <DM.Content align="end" sideOffset={6} className="hq z-70 w-52 rounded-2xl bg-bdnavy-900 p-1.5 text-white shadow-2xl ring-1 ring-white/15">
            <DM.Label className="px-3 py-1.5 text-xs text-white/55">Move to</DM.Label>
            {STAGE_ORDER.map((s) => (
              <DM.Item
                key={s}
                disabled={s === c.stage}
                onSelect={() => move(s)}
                className={cn("flex min-h-10 cursor-pointer items-center gap-2.5 rounded-xl px-3 text-sm font-semibold outline-none data-disabled:cursor-default data-disabled:opacity-50 data-highlighted:bg-white/8", s === "lost" ? "text-crimson-bright" : "data-highlighted:text-signal-orange")}
              >
                <span aria-hidden className={cn("size-2.5 rounded-full", STAGE_DOT[s])} />
                {STAGE_LABEL[s]}
                {s === c.stage ? <Check aria-hidden className="ml-auto size-4 text-signal-orange" /> : null}
              </DM.Item>
            ))}
          </DM.Content>
        </DM.Portal>
      </DM.Root>
    </div>
  );
}

/* ───────────────────────── the board ───────────────────────── */

export function ClientsBoard() {
  const clients = useHq((v) => v.clients);
  const me = useHq((v) => v.me.person);
  const people = usePeople();
  const router = useRouter();
  const now = useNow(60_000);
  const today = useToday();
  const [creating, setCreating] = useState(false);
  const [view, setView] = useState<"pipeline" | "list">("pipeline");
  const manager = can(me, "clients.manage");
  const season = seasonOf(today);

  const k = useMemo(() => {
    const open = clients.filter((c) => OPEN.includes(c.stage));
    const won = clients.filter((c) => WON.includes(c.stage));
    const lost = clients.filter((c) => c.stage === "lost");
    const wonSeason = won.filter((c) => dhakaDay(c.stageAt) >= season.start || dhakaDay(c.createdAt) >= season.start);
    const sum = (list: Client[]) => list.reduce((s, c) => s + c.value, 0);
    return {
      open: sum(open),
      openCount: open.length,
      wonSeason: sum(wonSeason),
      wonSeasonCount: wonSeason.length,
      conversion: won.length + lost.length ? Math.round((won.length / (won.length + lost.length)) * 100) : null,
      decided: won.length + lost.length,
      average: won.length ? Math.round(sum(won) / won.length) : 0,
      followUps: clients.filter((c) => needsFollowUp(c, now)),
      byStage: Object.fromEntries(STAGE_ORDER.map((s) => [s, clients.filter((c) => c.stage === s)])) as Record<Stage, Client[]>,
    };
  }, [clients, now, season.start]);
  const maxStage = Math.max(1, ...FLOW.map((s) => k.byStage[s].reduce((t, c) => t + c.value, 0)));

  const columns = useMemo<ColumnDef<Client, unknown>[]>(
    () => [
      {
        id: "org",
        header: "Client",
        accessorFn: (c) => `${c.org} ${c.name}`,
        cell: ({ row: { original: c } }) => (
          <span className="block min-w-48">
            <span className="block font-semibold text-white">{c.org}</span>
            <span className="block text-xs text-white/55">{c.name}</span>
          </span>
        ),
      },
      { id: "stage", header: "Stage", accessorFn: (c) => STAGE_ORDER.indexOf(c.stage), cell: ({ row: { original: c } }) => <Pill tone={STAGE_TONE[c.stage]}>{STAGE_LABEL[c.stage]}</Pill> },
      { id: "value", header: "Value", accessorFn: (c) => c.value, cell: ({ row: { original: c } }) => <span className="font-mono font-bold text-signal-orange tabular-nums">{taka(c.value, { compact: true })}</span> },
      { id: "sector", header: "Sector", accessorKey: "sector" },
      { id: "manager", header: "Manager", accessorFn: (c) => (c.managerId ? nameOf(people, c.managerId) : "HR"), cell: ({ getValue }) => <span className="whitespace-nowrap text-white/80">{String(getValue())}</span> },
      {
        id: "days",
        header: "In stage",
        accessorFn: (c) => daysIn(c, now),
        cell: ({ row: { original: c } }) => {
          const d = daysIn(c, now);
          return <span className={cn("whitespace-nowrap tabular-nums", OPEN.includes(c.stage) && d > STALE ? "font-bold text-crimson-bright" : "text-white/70")}>{d === 0 ? "Today" : `${d} d`}</span>;
        },
      },
      { id: "created", header: "Added", accessorFn: (c) => c.createdAt, cell: ({ row: { original: c } }) => <span className="whitespace-nowrap text-white/60">{dateLabel(c.createdAt, { now })}</span> },
    ],
    [people, now],
  );

  return (
    <>
      <PageHead
        title="Client CRM"
        lead="Every client from the first call to their review. Confirming a client opens its project and HR room at once."
        actions={
          <>
            <Seg
              label="View"
              value={view}
              onChange={setView}
              options={[
                { value: "pipeline", label: <><LayoutGrid aria-hidden className="size-3.5" /> Pipeline</> },
                { value: "list", label: <><List aria-hidden className="size-3.5" /> List</> },
              ]}
            />
            {manager ? (
              <button type="button" onClick={() => setCreating(true)} className={hb.gold}>
                <Plus aria-hidden className="size-4" /> New client
              </button>
            ) : null}
          </>
        }
      />

      <section aria-label="Pipeline numbers" className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Open pipeline" value={taka(k.open, { compact: true })} icon={CircleDollarSign} sub={`${k.openCount} deals before a yes`} />
        <Stat label="Won this season" value={taka(k.wonSeason, { compact: true })} icon={Trophy} field="cobalt" sub={`${k.wonSeasonCount} confirmed · ${season.label}`} />
        <Stat label="Conversion" value={k.conversion === null ? "—" : `${k.conversion}%`} icon={Percent} field="ink" sub={k.decided ? `of ${k.decided} decided deals` : "No deal decided yet"} />
        <Stat label="Average deal" value={k.average ? taka(k.average, { compact: true }) : "—"} icon={TrendingUp} sub="Won deals" />
        <Stat
          label="Need a follow-up"
          value={k.followUps.length}
          icon={CalendarClock}
          field="ink"
          className="col-span-2 lg:col-span-1"
          sub={k.followUps.length ? <span className={k.followUps.some((c) => daysIn(c, now) > STALE) ? "text-crimson-bright" : undefined}>Quiet for {FOLLOW_UP}+ days</span> : "Every deal is moving"}
        />
      </section>

      <Panel title="Stage by stage" icon={Handshake} sub={`${clients.length} clients · ${k.byStage.lost.length} lost`} className="mt-5">
        <ol className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4 xl:grid-cols-7">
          {FLOW.map((s, i) => {
            const list = k.byStage[s];
            const total = list.reduce((t, c) => t + c.value, 0);
            return (
              <li key={s} className="flex min-w-0 flex-col gap-1.5">
                <span className="flex items-center gap-2 text-xs font-semibold text-white/70">
                  <span aria-hidden className={cn("size-2 rounded-full", STAGE_DOT[s])} />
                  <span className="truncate">
                    {i + 1}. {STAGE_LABEL[s]}
                  </span>
                </span>
                <span className="flex items-baseline gap-2">
                  <span className="font-grotesk text-2xl leading-none font-bold text-white tabular-nums">{list.length}</span>
                  <span className="truncate font-mono text-xs font-bold text-signal-orange">{taka(total, { compact: true })}</span>
                </span>
                <Progress value={(total / maxStage) * 100} className="h-1.5" label={`${STAGE_LABEL[s]}: ${taka(total)}`} />
              </li>
            );
          })}
        </ol>
      </Panel>

      {clients.length === 0 ? (
        <Empty
          icon={Handshake}
          title="No clients yet"
          className="mt-5"
          action={
            manager ? (
              <button type="button" onClick={() => setCreating(true)} className={hb.gold}>
                <Plus aria-hidden className="size-4" /> Add the first client
              </button>
            ) : null
          }
        >
          Add a lead after the first call; log the meeting and it starts at the first-meeting stage.
        </Empty>
      ) : view === "pipeline" ? (
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {STAGE_ORDER.map((s) => (
            <StageColumn key={s} stage={s} list={k.byStage[s]} manager={manager} now={now} />
          ))}
        </div>
      ) : (
        <Panel title="All clients" icon={List} className="mt-5">
          <DataTable
            data={clients}
            columns={columns}
            search="Search clients, people, sectors…"
            onRow={(c) => router.push(`/hq/clients/${c.id}`)}
            csv={{ name: "kandari-clients", row: (c) => ({ organisation: c.org, contact: c.name, phone: c.contact.phone, email: c.contact.email, sector: c.sector, stage: STAGE_LABEL[c.stage], value: c.value, manager: c.managerId ? nameOf(people, c.managerId) : "", source: c.source, added: dhakaDay(c.createdAt) }) }}
          />
        </Panel>
      )}

      {manager ? <ClientDialog open={creating} onOpenChange={setCreating} /> : null}
    </>
  );
}

function StageColumn({ stage, list, manager, now }: { stage: Stage; list: Client[]; manager: boolean; now: number }) {
  const [all, setAll] = useState(false);
  const [openLost, setOpenLost] = useState(false);
  const lost = stage === "lost";
  const sorted = useMemo(() => [...list].sort((a, b) => (OPEN.includes(stage) ? a.stageAt.localeCompare(b.stageAt) : b.stageAt.localeCompare(a.stageAt))), [list, stage]);
  const shown = all ? sorted : sorted.slice(0, PEEK);
  const total = list.reduce((s, c) => s + c.value, 0);
  const collapsed = lost && !openLost;
  return (
    <section aria-label={STAGE_LABEL[stage]} className={cn("flex min-w-0 flex-col gap-3 rounded-2xl p-3 ring-1", lost ? "bg-black ring-national-crimson/30" : "bg-white/3 ring-white/10")}>
      <header className="flex items-center gap-2 px-1 pt-0.5">
        <span aria-hidden className={cn("size-2.5 shrink-0 rounded-full", STAGE_DOT[stage])} />
        <h2 className="truncate font-grotesk text-sm font-bold text-white">{STAGE_LABEL[stage]}</h2>
        <span className="rounded-full bg-white/10 px-2 text-xs font-bold text-white/80 tabular-nums">{list.length}</span>
        <span className="ml-auto font-mono text-xs font-bold text-signal-orange">{taka(total, { compact: true })}</span>
      </header>
      {lost ? (
        <button type="button" onClick={() => setOpenLost((o) => !o)} aria-expanded={openLost} className={cn(hb.quietSm, "w-full justify-between")}>
          {openLost ? "Hide lost deals" : list.length ? `Show ${list.length} lost` : "No lost deals"}
          <ChevronDown aria-hidden className={cn("size-3.5 transition-transform motion-reduce:transition-none", openLost && "rotate-180")} />
        </button>
      ) : null}
      {!collapsed ? (
        <>
          {list.length === 0 && !lost ? <p className="rounded-xl border border-dashed border-white/12 px-3 py-6 text-center text-xs text-white/45">No clients here</p> : null}
          <ul className="flex flex-col gap-2.5">
            {shown.map((c, i) => (
              <li key={c.id}>
                <ClientCard client={c} manager={manager} now={now} i={i} />
              </li>
            ))}
          </ul>
          {list.length > PEEK ? (
            <button type="button" onClick={() => setAll((a) => !a)} aria-expanded={all} className="min-h-9 rounded-xl text-xs font-semibold text-white/70 ring-1 ring-white/12 hover:bg-white/5 hover:text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none">
              {all ? "Show fewer" : `Show all ${list.length}`}
            </button>
          ) : null}
        </>
      ) : null}
    </section>
  );
}

function ClientCard({ client: c, manager, now, i }: { client: Client; manager: boolean; now: number; i: number }) {
  const people = usePeople();
  const days = daysIn(c, now);
  const stale = OPEN.includes(c.stage) && days > STALE;
  const quiet = OPEN.includes(c.stage) && days >= FOLLOW_UP;
  const done = c.onboarding.filter((o) => o.done).length;
  const showOnboarding = ["confirmed", "in-progress", "delivered"].includes(c.stage) && c.onboarding.length > 0;
  const crew = [c.managerId, c.leadId].filter((x, j, a): x is string => Boolean(x) && a.indexOf(x) === j);
  return (
    <article
      style={{ "--i": Math.min(i, 6) } as React.CSSProperties}
      className="group hq-rise relative flex flex-col gap-3 rounded-2xl bg-bdnavy-900 p-4 ring-1 ring-white/12 transition-[box-shadow,translate] duration-200 focus-within:ring-2 focus-within:ring-signal-orange hover:-translate-y-0.5 hover:ring-signal-orange/60 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <Link href={`/hq/clients/${c.id}`} className="block font-grotesk leading-snug font-bold text-white outline-none group-hover:text-signal-orange after:absolute after:inset-0 after:rounded-2xl">
            {c.org}
          </Link>
          <p className="mt-0.5 truncate text-xs text-white/60">{c.name}</p>
        </div>
        {c.sector ? <Pill tone="navy" className="max-w-28 truncate">{c.sector}</Pill> : null}
      </div>

      <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-1.5">
        <p className="font-mono text-lg leading-none font-bold whitespace-nowrap text-signal-orange tabular-nums">{taka(c.value, { compact: true })}</p>
        {c.review ? (
          <Stars score={c.review.score} />
        ) : (
          <p className={cn("text-xs whitespace-nowrap tabular-nums", stale ? "font-bold text-crimson-bright" : quiet ? "font-semibold text-white/80" : "text-white/55")}>
            {days === 0 ? "Moved today" : `In stage ${days} ${days === 1 ? "day" : "days"}`}
          </p>
        )}
      </div>

      {showOnboarding ? (
        <div>
          <p className="mb-1 flex justify-between text-xs text-white/60">
            <span>Onboarding</span>
            <span className="tabular-nums">
              {done}/{c.onboarding.length}
            </span>
          </p>
          <Progress value={(done / c.onboarding.length) * 100} className="h-1.5" label={`Onboarding ${done} of ${c.onboarding.length}`} />
        </div>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-white/8 pt-3">
        <div className="flex items-center gap-2">
          {crew.length ? (
            <span className="flex -space-x-2" aria-label={`Handled by ${crew.map((x) => nameOf(people, x)).join(" and ")}`}>
              {crew.map((x) => (
                <Avatar key={x} person={people.get(x)} size="xs" className="ring-2 ring-bdnavy-900" />
              ))}
            </span>
          ) : (
            <span className="text-xs whitespace-nowrap text-white/50">With HR</span>
          )}
          <span className="min-w-0 truncate text-xs text-white/55">{crew.length ? crew.map((x) => nameOf(people, x).split(" ")[0]).join(" · ") : null}</span>
          {c.sample ? <Pill className="ml-auto">Sample</Pill> : null}
        </div>
        {manager ? <StageMenu client={c} compact /> : null}
      </div>
    </article>
  );
}

/* ───────────────────────── new / edit ───────────────────────── */

function ClientDialog({ open, onOpenChange, client }: { open: boolean; onOpenChange: (o: boolean) => void; client?: Client }) {
  const act = useAct();
  const router = useRouter();
  const all = useHq((v) => v.people);
  const teams = useHq((v) => v.teams);
  const active = useMemo(() => all.filter((p) => p.status === "active"), [all]);
  const liveTeams = useMemo(() => teams.filter((t) => t.status === "active"), [teams]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [f, setF] = useState({
    name: client?.name ?? "",
    org: client?.org ?? "",
    contactName: client?.contact.name ?? "",
    phone: client?.contact.phone ?? "",
    email: client?.contact.email ?? "",
    sector: client?.sector ?? "Healthcare",
    stage: client?.stage ?? ("lead" as Stage),
    value: client?.value ?? 0,
    source: client?.source ?? "",
    notes: client?.notes ?? "",
    managerId: client?.managerId ?? "",
    teamId: client?.teamId ?? "",
    firstMeeting: "",
  });
  const set = (key: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF((x) => ({ ...x, [key]: key === "value" ? Number(e.target.value) : e.target.value }));
  const save = () => {
    const contact = { name: f.contactName || f.name, phone: f.phone, email: f.email };
    const team = liveTeams.find((t) => t.id === f.teamId);
    const p = client
      ? act("business", "client.edit", { id: client.id, name: f.name, org: f.org, contact, sector: f.sector, value: f.value, source: f.source, notes: f.notes, managerId: f.managerId || null, teamId: f.teamId || null, leadId: team ? team.leaderId : undefined }, { ok: "Saved" })
      : act("business", "client.create", { name: f.name, org: f.org, contact, sector: f.sector, stage: f.stage, value: f.value, source: f.source, notes: f.notes, managerId: f.managerId || undefined, firstMeeting: f.firstMeeting || undefined }, { ok: "Client added" });
    p.then(() => onOpenChange(false), () => {});
  };
  const remove = () => {
    if (!client) return;
    act("business", "client.remove", { id: client.id }, { ok: `${client.org} removed` }).then(() => {
      onOpenChange(false);
      router.push("/hq/clients");
    }, () => {});
  };
  return (
    <HqDialog
      open={open}
      onOpenChange={(o) => {
        setConfirmDelete(false);
        onOpenChange(o);
      }}
      title={client ? `Edit ${client.org}` : "New client"}
      description={client ? undefined : "Who they are, what the deal is worth and who looks after them."}
      size="lg"
      footer={
        <>
          {client ? (
            <button type="button" onClick={() => (confirmDelete ? remove() : setConfirmDelete(true))} className={cn(confirmDelete ? hb.danger : hb.quiet, "mr-auto")}>
              <Trash2 aria-hidden className="size-4" /> {confirmDelete ? "Delete for good" : "Delete"}
            </button>
          ) : null}
          <button type="button" onClick={() => onOpenChange(false)} className={hb.quiet}>
            Cancel
          </button>
          <button type="button" disabled={f.org.trim().length < 2 || f.name.trim().length < 2} onClick={save} className={hb.gold}>
            {client ? "Save changes" : "Add client"}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-3 font-grotesk text-sm font-bold text-signal-orange">The client</legend>
          <FormField label="Organisation">
            <input value={f.org} onChange={set("org")} className={inputCls} placeholder="Bogura Diagnostic Centre" />
          </FormField>
          <FormField label="Client name" hint="The name the deal is known by">
            <input value={f.name} onChange={set("name")} className={inputCls} placeholder="Dr. Rahman" />
          </FormField>
          <FormField label="Contact person">
            <input value={f.contactName} onChange={set("contactName")} className={inputCls} placeholder="Same as the client name" />
          </FormField>
          <FormField label="Sector">
            <input value={f.sector} onChange={set("sector")} className={inputCls} />
          </FormField>
          <FormField label="Phone">
            <input value={f.phone} onChange={set("phone")} className={inputCls} inputMode="tel" placeholder="01XXXXXXXXX" />
          </FormField>
          <FormField label="Email">
            <input value={f.email} onChange={set("email")} className={inputCls} type="email" />
          </FormField>
        </fieldset>

        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-3 font-grotesk text-sm font-bold text-signal-orange">The deal</legend>
          <FormField label="Value (৳)">
            <input type="number" min={0} value={f.value || ""} onChange={set("value")} className={inputCls} />
          </FormField>
          {!client ? (
            <FormField label="Stage">
              <select value={f.stage} onChange={set("stage")} className={selectCls}>
                {STAGE_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {STAGE_LABEL[s]}
                  </option>
                ))}
              </select>
            </FormField>
          ) : null}
          <FormField label="Source">
            <input value={f.source} onChange={set("source")} className={inputCls} placeholder="Referral, website, conference…" />
          </FormField>
          <FormField label="Client manager">
            <select value={f.managerId} onChange={set("managerId")} className={selectCls}>
              <option value="">Not assigned (HR handles it)</option>
              {active.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </FormField>
          {client ? (
            <FormField label="Delivery team" hint="Its leader becomes the client's team lead">
              <select value={f.teamId} onChange={set("teamId")} className={selectCls}>
                <option value="">No team yet</option>
                {liveTeams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </FormField>
          ) : null}
        </fieldset>

        {!client ? (
          <FormField label="First meeting done? Log it here" hint="It starts the client at the first-meeting stage, with this as the first note">
            <textarea value={f.firstMeeting} onChange={set("firstMeeting")} className={cn(textareaCls, "min-h-20")} placeholder="What they need, who decides, the next step…" />
          </FormField>
        ) : null}
        <FormField label="Notes">
          <textarea value={f.notes} onChange={set("notes")} className={textareaCls} />
        </FormField>
      </div>
    </HqDialog>
  );
}

/* ───────────────────────── one client ───────────────────────── */

interface Moment {
  id: string;
  at: string;
  title: string;
  body?: string;
  icon: typeof History;
}

/** Notes are logged as "Label (YYYY-MM-DD): text" paragraphs, newest first. */
function parseNotes(notes: string): { day?: string; label?: string; text: string }[] {
  return notes
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const m = /^([^():\n]{2,40}) \((\d{4}-\d{2}-\d{2})\):\s*([\s\S]*)$/.exec(p);
      return m ? { label: m[1], day: m[2], text: m[3] } : { text: p };
    });
}

export function ClientPage({ id }: { id: string }) {
  const v = useHq();
  const act = useAct();
  const people = usePeople();
  const now = useNow(60_000);
  const today = useToday();
  const [editing, setEditing] = useState(false);
  const [item, setItem] = useState("");
  const [note, setNote] = useState("");
  const [review, setReview] = useState({ score: 4.5, text: "" });
  const c = v.clients.find((x) => x.id === id);
  const projects = useMemo(() => v.projects.filter((p) => p.clientId === id), [v.projects, id]);
  const docs = useMemo(() => v.docs.filter((d) => d.clientId === id).sort((a, b) => b.date.localeCompare(a.date)), [v.docs, id]);

  const timeline = useMemo(() => {
    if (!c) return [];
    const out: Moment[] = [{ id: "created", at: c.createdAt, title: "Added to the CRM", body: c.source ? `Source: ${c.source}` : undefined, icon: Plus }];
    if (c.stageAt !== c.createdAt) out.push({ id: "stage", at: c.stageAt, title: `Moved to ${STAGE_LABEL[c.stage]}`, icon: ArrowRight });
    for (const p of projects) {
      out.push({ id: `p-${p.id}`, at: `${p.start}T04:00:00.000Z`, title: `Project opened: ${p.title}`, body: `Budget ${taka(p.budget)}, due ${dateLabel(p.due, { year: true })}`, icon: Building2 });
      if (p.handedOver) out.push({ id: `h-${p.id}`, at: p.handedOver.at, title: "Handed over by HR", body: `To ${p.handedOver.to.map((x) => nameOf(people, x)).join(", ")}`, icon: Users });
    }
    for (const d of docs) out.push({ id: `d-${d.id}`, at: d.at, title: `${DOC_LABEL[d.kind]} ${d.number}`, body: `${taka(docTotals(d).total)} · ${d.status}`, icon: FileText });
    if (c.review) out.push({ id: "review", at: c.review.at, title: `Client review: ${c.review.score}/5`, body: c.review.text || undefined, icon: Star });
    return out.sort((a, b) => b.at.localeCompare(a.at));
  }, [c, projects, docs, people]);

  if (!c) return <Empty title="Client not found" icon={Handshake} action={<Link href="/hq/clients" className={hb.gold}>All clients</Link>}>It may have been removed, or it isn&apos;t one of yours.</Empty>;

  const manager = can(v.me.person, "clients.manage");
  const team = c.teamId ? v.teams.find((t) => t.id === c.teamId) : undefined;
  const stageIdx = FLOW.indexOf(c.stage);
  const lost = c.stage === "lost";
  const days = daysIn(c, now);
  const notes = parseNotes(c.notes);
  const done = c.onboarding.filter((x) => x.done).length;
  const billed = docs.filter((d) => d.kind === "invoice" && d.status !== "void").reduce((s, d) => s + docTotals(d).total, 0);
  const paid = docs.filter((d) => d.kind === "invoice" && d.status === "paid").reduce((s, d) => s + docTotals(d).total, 0);
  const move = (stage: Stage) => act("business", "client.stage", { id: c.id, stage }, { ok: `${c.org}: ${STAGE_LABEL[stage]}` }).catch(() => {});
  const addNote = (e: React.FormEvent) => {
    e.preventDefault();
    const text = note.trim();
    if (text.length < 2) return;
    act("business", "client.edit", { id: c.id, notes: `Note (${today}): ${text}\n\n${c.notes}`.trim().slice(0, 8000) }, { ok: "Note logged" }).then(() => setNote(""), () => {});
  };

  return (
    <div className="flex flex-col gap-5">
      <Link href="/hq/clients" className="inline-flex min-h-10 items-center gap-1.5 self-start rounded-lg text-sm font-semibold text-white/65 hover:text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none">
        <ArrowLeft aria-hidden className="size-4" /> Client CRM
      </Link>

      <header className="hq-rise flex flex-col gap-6 rounded-3xl bg-bdnavy-900 p-5 ring-1 ring-white/12 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-cobalt ring-1 ring-white/12 sm:size-16">
            <Building2 aria-hidden className="size-7 text-signal-orange sm:size-8" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-grotesk text-2xl leading-tight font-bold text-signal-orange sm:text-3xl">{c.org}</h1>
              <Pill tone={STAGE_TONE[c.stage]}>{STAGE_LABEL[c.stage]}</Pill>
              {c.sample ? <Pill>Sample</Pill> : null}
            </div>
            <p className="mt-1.5 text-sm text-white/75 sm:text-base">
              {c.name}
              {c.contact.name && c.contact.name !== c.name ? ` · contact ${c.contact.name}` : ""} · {c.sector} · client since {dateLabel(c.createdAt, { year: true })}
            </p>
            <p className={cn("mt-1 text-xs", OPEN.includes(c.stage) && days > STALE ? "font-bold text-crimson-bright" : "text-white/55")}>
              {days === 0 ? "Moved to this stage today" : `${days} ${days === 1 ? "day" : "days"} at this stage`}
              {needsFollowUp(c, now) ? " — time for a follow-up" : ""}
            </p>
          </div>
          <div className="flex flex-col gap-4 lg:items-end">
            <div className="lg:text-right">
              <p className="text-xs text-white/60">Deal value</p>
              <p className="font-mono text-3xl leading-tight font-bold text-signal-orange tabular-nums">{taka(c.value)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {c.contact.phone ? (
                <a href={`tel:${c.contact.phone}`} className={hb.quietSm}>
                  <Phone aria-hidden className="size-3.5" /> Call
                </a>
              ) : null}
              {c.contact.email ? (
                <a href={`mailto:${c.contact.email}`} className={hb.quietSm}>
                  <Mail aria-hidden className="size-3.5" /> Email
                </a>
              ) : null}
              {manager ? (
                <button type="button" onClick={() => setEditing(true)} className={hb.outlineSm}>
                  <Pencil aria-hidden className="size-3.5" /> Edit
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div>
          <ol aria-label="Pipeline stage" className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {FLOW.map((s, i) => {
              const passed = !lost && i < stageIdx;
              const current = !lost && i === stageIdx;
              const body = (
                <>
                  <span aria-hidden className={cn("h-1 w-full rounded-full", passed || current ? "bg-signal-orange" : "bg-white/12")} />
                  <span className={cn("flex items-center gap-1.5 text-xs font-semibold", current ? "text-signal-orange" : passed ? "text-white/85" : "text-white/50")}>
                    {passed ? <Check aria-hidden className="size-3.5 text-signal-orange" /> : <span className="font-mono tabular-nums">{i + 1}</span>}
                    <span className="truncate">{STAGE_LABEL[s]}</span>
                  </span>
                </>
              );
              const cls = cn("flex w-full flex-col gap-2 rounded-xl px-2.5 py-2 text-left", current ? "bg-black/35 ring-1 ring-signal-orange/50" : "ring-1 ring-transparent");
              return (
                <li key={s} aria-current={current ? "step" : undefined}>
                  {manager && !current ? (
                    <button type="button" onClick={() => move(s)} className={cn(cls, "transition-colors hover:bg-white/6 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none")} aria-label={`Move to ${STAGE_LABEL[s]}`}>
                      {body}
                    </button>
                  ) : (
                    <div className={cls}>{body}</div>
                  )}
                </li>
              );
            })}
          </ol>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {lost ? <Pill tone="red">This deal was lost</Pill> : null}
            {manager ? (
              lost ? (
                <button type="button" onClick={() => move("lead")} className={hb.quietSm}>
                  Reopen as lead
                </button>
              ) : (
                <>
                  {nextStage(c.stage) ? (
                    <button type="button" onClick={() => move(nextStage(c.stage)!)} className={hb.goldSm}>
                      Move to {STAGE_LABEL[nextStage(c.stage)!]} <ArrowRight aria-hidden className="size-3.5" />
                    </button>
                  ) : null}
                  {OPEN.includes(c.stage) ? (
                    <button type="button" onClick={() => move("lost")} className={hb.quietSm}>
                      Mark lost
                    </button>
                  ) : null}
                </>
              )
            ) : null}
            {c.stage === "proposal" && manager ? <span className="text-xs text-white/55">Confirming opens the project and the HR room.</span> : null}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-5 xl:col-span-8">
          <Panel title="Notes & history" icon={History} sub={`${notes.length} ${notes.length === 1 ? "note" : "notes"} · ${timeline.length} events`}>
            {manager ? (
              <form onSubmit={addNote} className="mb-5 flex flex-col gap-2 sm:flex-row">
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Log a call, meeting or next step…" aria-label="New note" className={inputCls} maxLength={1000} />
                <button type="submit" disabled={note.trim().length < 2} className={cn(hb.gold, "shrink-0")}>
                  <NotebookPen aria-hidden className="size-4" /> Log note
                </button>
              </form>
            ) : null}
            <div className={cn("grid gap-6", notes.length > 0 && "lg:grid-cols-2")}>
              {notes.length > 0 ? (
                <section aria-label="Notes">
                  <h3 className="mb-3 text-sm font-semibold text-white/85">Notes</h3>
                  <ul className="flex flex-col gap-3">
                    {notes.map((n, i) => (
                      <li key={i} className="rounded-xl bg-black/25 px-3.5 py-3 ring-1 ring-white/8">
                        {n.label ? (
                          <p className="mb-1 text-xs font-semibold text-signal-orange">
                            {n.label} · {dateLabel(n.day!, { now })}
                          </p>
                        ) : null}
                        <p className="text-sm leading-relaxed whitespace-pre-line text-white/85">{n.text}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
              <section aria-label="History">
                <h3 className="mb-3 text-sm font-semibold text-white/85">History</h3>
                <ol className="relative flex flex-col gap-4 border-l border-white/12 pl-5">
                  {timeline.map((m) => (
                    <li key={m.id} className="relative">
                      <span aria-hidden className="absolute top-0.5 left-[-1.95rem] grid size-5 place-items-center rounded-full bg-bdnavy-900 ring-1 ring-white/25">
                        <m.icon className="size-3 text-signal-orange" />
                      </span>
                      <p className="text-sm font-semibold text-white">{m.title}</p>
                      {m.body ? <p className="mt-0.5 line-clamp-2 text-xs text-white/60">{m.body}</p> : null}
                      <p className="mt-0.5 text-xs text-white/45">{dateLabel(m.at, { now })}</p>
                    </li>
                  ))}
                </ol>
              </section>
            </div>
          </Panel>

          <Panel title="Projects" icon={Building2} field="ink" sub={projects.length ? `${projects.length} ${projects.length === 1 ? "project" : "projects"}` : undefined}>
            {projects.length === 0 ? (
              <Empty title="No project yet" icon={Building2} className="py-6">
                The project and its HR room open the moment the client is confirmed.
              </Empty>
            ) : (
              <ul className="flex flex-col gap-3">
                {projects.map((p) => {
                  const span = Math.max(1, Date.parse(p.due) - Date.parse(p.start));
                  const elapsed = Math.min(100, Math.max(0, ((now - Date.parse(p.start)) / span) * 100));
                  const late = Date.parse(`${p.due}T18:00:00.000Z`) < now && (p.status === "running" || p.status === "setup");
                  const pTeam = p.teamId ? v.teams.find((t) => t.id === p.teamId) : undefined;
                  return (
                    <li key={p.id} className="flex flex-col gap-3 rounded-xl bg-black/25 p-4 ring-1 ring-white/8">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="min-w-0 flex-1 font-semibold text-white">{p.title}</p>
                        <Pill tone={late ? "red" : PROJECT_TONE[p.status]}>{late ? "Past due" : PROJECT_LABEL[p.status]}</Pill>
                        {p.channelId ? (
                          <Link href={`/hq/chat?c=${p.channelId}`} className={hb.quietSm}>
                            <MessagesSquare aria-hidden className="size-3.5" /> Room
                          </Link>
                        ) : null}
                      </div>
                      <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                        <div>
                          <dt className="text-xs text-white/55">Budget</dt>
                          <dd className="font-mono font-bold text-signal-orange">{taka(p.budget, { compact: true })}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-white/55">Dates</dt>
                          <dd className="text-white/85">
                            {dateLabel(p.start, { now })} → {dateLabel(p.due, { now })}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-white/55">Team</dt>
                          <dd className="truncate text-white/85">{pTeam ? <Link href={`/hq/teams/${pTeam.id}`} className="text-signal-orange hover:underline">{pTeam.name}</Link> : "Not set"}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-white/55">Handover</dt>
                          <dd className="text-white/85">{p.handedOver ? dateLabel(p.handedOver.at, { now }) : "Still with HR"}</dd>
                        </div>
                      </dl>
                      {p.status === "running" || p.status === "setup" ? <Progress value={elapsed} tone={late ? "red" : "gold"} className="h-1.5" label={`${Math.round(elapsed)}% of the project time used`} /> : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <Panel
            title="Documents"
            icon={FileText}
            sub={docs.length ? `Invoiced ${taka(billed, { compact: true })} · paid ${taka(paid, { compact: true })}` : undefined}
            action={can(v.me.person, "hr.manage") ? <Link href="/hq/hr" className={hb.quietSm}>Document centre</Link> : null}
          >
            {docs.length === 0 ? (
              <p className="text-sm text-white/55">No quotation, invoice or challan yet.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-white/8">
                {docs.map((d) => (
                  <li key={d.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5 first:pt-0 last:pb-0">
                    <span className="w-28 shrink-0 text-sm font-semibold text-white">{DOC_LABEL[d.kind]}</span>
                    <span className="font-mono text-xs text-white/60">{d.number}</span>
                    <span className="text-xs text-white/50">{dateLabel(d.date, { now })}</span>
                    <span className="ml-auto font-mono text-sm font-bold text-signal-orange tabular-nums">{taka(docTotals(d).total)}</span>
                    <Pill tone={DOC_TONE[d.status]} className="capitalize">
                      {d.status}
                    </Pill>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="flex min-w-0 flex-col gap-5 xl:col-span-4">
          <Panel title="People" icon={Users} field="cobalt">
            <dl className="flex flex-col gap-4 text-sm">
              <div>
                <dt className="text-xs text-white/65">Contact</dt>
                <dd className="mt-0.5 font-semibold text-white">{c.contact.name || c.name}</dd>
                {c.contact.phone ? (
                  <dd>
                    <a href={`tel:${c.contact.phone}`} className="text-white/85 hover:text-signal-orange">
                      {c.contact.phone}
                    </a>
                  </dd>
                ) : null}
                {c.contact.email ? (
                  <dd className="break-all">
                    <a href={`mailto:${c.contact.email}`} className="text-white/85 hover:text-signal-orange">
                      {c.contact.email}
                    </a>
                  </dd>
                ) : null}
              </div>
              {[
                { label: "Client manager", id: c.managerId, empty: "HR until someone is assigned" },
                { label: "Team lead", id: c.leadId, empty: "Not set yet" },
              ].map((r) => (
                <div key={r.label}>
                  <dt className="text-xs text-white/65">{r.label}</dt>
                  <dd className="mt-1">
                    {r.id ? (
                      <Link href={`/hq/people/${r.id}`} className="flex items-center gap-2.5 rounded-lg hover:text-signal-orange">
                        <Avatar person={people.get(r.id)} size="sm" />
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-white">{nameOf(people, r.id)}</span>
                          <span className="block truncate text-xs text-white/60">{people.get(r.id)?.designation}</span>
                        </span>
                      </Link>
                    ) : (
                      <span className="text-white/70">{r.empty}</span>
                    )}
                  </dd>
                </div>
              ))}
              <div>
                <dt className="text-xs text-white/65">Delivery team</dt>
                <dd className="mt-0.5">
                  {team ? (
                    <Link href={`/hq/teams/${team.id}`} className="font-semibold text-signal-orange hover:underline">
                      {team.name} · {team.memberIds.length + 1} people
                    </Link>
                  ) : (
                    <span className="text-white/70">No team yet</span>
                  )}
                </dd>
              </div>
            </dl>
          </Panel>

          <Panel title="Onboarding" icon={Check} sub={c.onboarding.length ? `${done} of ${c.onboarding.length} done` : "A checklist for a smooth start"}>
            {c.onboarding.length ? <Progress value={(done / c.onboarding.length) * 100} className="mb-4 h-1.5" label="Onboarding progress" /> : null}
            {c.onboarding.length === 0 && !manager ? <p className="text-sm text-white/55">No steps yet.</p> : null}
            <ul className="flex flex-col gap-1">
              {c.onboarding.map((o) => (
                <li key={o.id} className="group flex min-h-10 items-center gap-2.5">
                  <button
                    type="button"
                    disabled={!manager}
                    onClick={() => act("business", "client.onboard", { id: c.id, toggle: o.id }, { quiet: true })}
                    aria-label={o.done ? `Mark "${o.item}" not done` : `Mark "${o.item}" done`}
                    className={cn("grid size-6 shrink-0 place-items-center rounded-md ring-2 focus-visible:outline-none focus-visible:ring-signal-orange", o.done ? "bg-signal-orange ring-signal-orange" : "ring-white/40 hover:ring-signal-orange")}
                  >
                    {o.done ? <Check aria-hidden className="size-4 text-text-primary" /> : null}
                  </button>
                  <span className={cn("min-w-0 flex-1 text-sm", o.done ? "text-white/50 line-through" : "text-white")}>{o.item}</span>
                  {manager ? (
                    <button type="button" onClick={() => act("business", "client.onboard", { id: c.id, remove: o.id }, { quiet: true })} aria-label={`Remove ${o.item}`} className={cn(hb.iconSm, "sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100")}>
                      <Trash2 aria-hidden className="size-3.5" />
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
            {manager ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (item.trim().length < 2) return;
                  act("business", "client.onboard", { id: c.id, add: item }, { quiet: true }).then(() => setItem(""), () => {});
                }}
                className="mt-3 flex gap-2"
              >
                <input value={item} onChange={(e) => setItem(e.target.value)} placeholder="Add a step…" aria-label="New onboarding step" className={cn(inputCls, "min-h-10")} />
                <button type="submit" className={hb.goldSm}>
                  Add
                </button>
              </form>
            ) : null}
          </Panel>

          <Panel title="Client review" icon={Star} field="ink" sub="A 4.5+ rating earns the team leader Iron Man">
            {c.review ? (
              <>
                <p className="flex flex-wrap items-center gap-3">
                  <Stars score={c.review.score} size="md" />
                  <span className="font-grotesk text-2xl font-bold text-white tabular-nums">{num(c.review.score)}/5</span>
                </p>
                {c.review.text ? <p className="mt-3 text-sm leading-relaxed text-white/85">“{c.review.text}”</p> : null}
                <p className="mt-2 text-xs text-white/50">{dateLabel(c.review.at, { year: true })}</p>
                <Link href="/hq/wall" className={cn(hb.outlineSm, "mt-4")}>
                  <PartyPopper aria-hidden className="size-3.5" /> Write the success story
                </Link>
              </>
            ) : manager && ["in-progress", "delivered", "reviewed"].includes(c.stage) ? (
              <div className="flex flex-col gap-3">
                <label className="flex flex-col gap-2 text-sm text-white/85">
                  <span className="flex items-center justify-between">
                    Rating <span className="font-mono font-bold text-signal-orange">{review.score.toFixed(1)}/5</span>
                  </span>
                  <input type="range" min={0} max={5} step={0.1} value={review.score} onChange={(e) => setReview((x) => ({ ...x, score: Number(e.target.value) }))} className="accent-signal-orange" />
                </label>
                <textarea value={review.text} onChange={(e) => setReview((x) => ({ ...x, text: e.target.value }))} placeholder="What the client said" aria-label="Client's words" className={cn(textareaCls, "min-h-20")} />
                <button type="button" onClick={() => act("business", "client.review", { id: c.id, ...review }, { ok: "Review saved" })} className={hb.gold}>
                  Save review
                </button>
              </div>
            ) : (
              <p className="text-sm text-white/65">The client rates the work once it is delivered.</p>
            )}
          </Panel>
        </div>
      </div>
      {manager ? <ClientDialog key={c.id} open={editing} onOpenChange={setEditing} client={c} /> : null}
    </div>
  );
}
