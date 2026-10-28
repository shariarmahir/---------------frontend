"use client";

import { type FormEvent, type ReactNode, useId, useMemo, useRef, useState } from "react";
import { Dialog } from "radix-ui";
import { Icon } from "@/components/ui/icon";
import { close, forward, resolve } from "@/lib/command/actions";
import { safeTitleBn } from "@/lib/command/privacy";
import { CATEGORY_META } from "@/lib/command/routing";
import { filterCases, isOpen } from "@/lib/command/selectors";
import { commandAct, perWorld, useCommand, useResolvedToday } from "@/lib/command/store";
import type { Case, Status, World } from "@/lib/command/types";
import { cn } from "@/lib/utils";
import { CaseDrawer, useSelectedCase } from "./case-drawer";
import { CaseTable } from "./case-table";
import { Bn, CONTROL, Kpi, Panel, SearchField, SelectField, Skeleton, cb, focusRing, num } from "./kit";
import { CommandPage } from "./shell";
import { useSearchBox, useUrlFilters } from "./url-filters";

/**
 * /protibad/command/other: complaints that belong to another body (ACC, land
 * office, DoE, DIFE …). The desk forwards each new case to its agency, marks
 * it resolved when the agency confirms action, then closes it. Filters live
 * in the URL (?status=&agency=&q=). Uses useSearchParams: render it inside
 * <Suspense>.
 */

/* ───────────── agencies ───────────── */

interface Agency {
  name: string;
  /** The complaint kinds this body receives. */
  kinds: { label: string; labelBn: string }[];
}

/** Every agency in CATEGORY_META (English name), in the order the categories list them. */
const AGENCIES: Agency[] = (() => {
  const out: Agency[] = [];
  for (const m of Object.values(CATEGORY_META)) {
    if (m.dept !== "other" || !m.agency) continue;
    const kind = { label: m.label, labelBn: m.labelBn };
    const found = out.find((a) => a.name === m.agency);
    if (found) found.kinds.push(kind);
    else out.push({ name: m.agency, kinds: [kind] });
  }
  return out;
})();

const agencyOf = (c: Case): string => c.agency ?? CATEGORY_META[c.category].agency ?? "Unassigned";

/* ───────────── selectors ───────────── */

const selectOther = perWorld((w: World) => w.cases.filter((c) => c.dept === "other"));
const selectStats = perWorld((w: World) => {
  let fresh = 0;
  let forwarded = 0;
  let toClose = 0;
  for (const c of w.cases) {
    if (c.dept !== "other") continue;
    if (c.status === "new") fresh++;
    else if (c.status === "acknowledged") forwarded++;
    else if (c.status === "resolved") toClose++;
  }
  return { fresh, forwarded, toClose };
});
const selectByAgency = perWorld((w: World) => {
  const counts = new Map<string, number>(AGENCIES.map((a) => [a.name, 0]));
  for (const c of w.cases) if (c.dept === "other" && isOpen(c)) counts.set(agencyOf(c), (counts.get(agencyOf(c)) ?? 0) + 1);
  return [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
});

/* ───────────── filters ───────────── */

const OPEN = "open";
const ALL = "all";
const STATUS_OPTIONS = [
  { value: OPEN, label: "Open and to close" },
  { value: "new", label: "New, not forwarded" },
  { value: "acknowledged", label: "Forwarded" },
  { value: "resolved", label: "Resolved, to close" },
  { value: "closed", label: "Closed" },
  { value: ALL, label: "All statuses" },
];
const AGENCY_OPTIONS = [{ value: "", label: "All agencies" }, ...AGENCIES.map((a) => ({ value: a.name, label: a.name }))];
const DEFAULTS = { status: OPEN };

/* ───────────── dialogs ───────────── */

/** Puts focus back on the case's action after a change (its button may have been replaced, or the row may have left the list). */
function refocusRow(id: string): void {
  requestAnimationFrame(() => {
    const visible = (el: Element) => (el as HTMLElement).offsetParent !== null;
    const pick = (sel: string) => [...document.querySelectorAll(sel)].find(visible) as HTMLElement | undefined;
    (pick(`[data-row-action="${id}"]`) ?? pick(`[data-case-open="${id}"]`) ?? pick("[data-row-action]") ?? document.getElementById("oq-queue"))?.focus();
  });
}

function ActionDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange(open: boolean): void;
  trigger: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/70 transition-opacity duration-200 starting:opacity-0 motion-reduce:transition-none" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 z-[80] flex max-h-[calc(100dvh-2rem)] w-[min(30rem,calc(100vw-1.5rem))] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 overflow-y-auto rounded-2xl bg-bdnavy-900 p-5 text-white ring-1 ring-white/12 transition-[opacity,scale] duration-200 starting:scale-95 starting:opacity-0 motion-reduce:transition-none"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Dialog.Title className="font-grotesk text-lg font-bold text-signal-orange">{title}</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm leading-relaxed text-white/70">{description}</Dialog.Description>
            </div>
            <Dialog.Close aria-label="Close" className={cb.icon}>
              <Icon name="close" className="text-[20px]" />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function CaseLine({ c }: { c: Case }) {
  return (
    <p className="flex min-w-0 flex-col gap-0.5 rounded-xl bg-black/30 px-3.5 py-2.5 ring-1 ring-white/10">
      <span className="font-mono text-xs font-semibold text-white/85">{c.id}</span>
      <Bn className="truncate text-sm font-semibold text-white">{safeTitleBn(c)}</Bn>
    </p>
  );
}

function ErrorLine({ error }: { error: string | null }) {
  return error ? (
    <p role="alert" className="flex items-start gap-2 text-sm font-semibold text-white/85">
      <span aria-hidden="true" className="inline-flex shrink-0">
        <Icon name="error" className="text-[18px] text-crimson-bright" />
      </span>
      {error}
    </p>
  ) : null;
}

/** Forward: choose the agency (the case's own is chosen already) and send the case on. */
function ForwardAction({ c, onDone }: { c: Case; onDone(message: string): void }) {
  const uid = useId();
  const own = agencyOf(c);
  const [open, setOpen] = useState(false);
  const [agency, setAgency] = useState(own);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err = commandAct((w, t) => forward(w, c.id, t, agency));
    setError(err);
    if (err) return;
    setOpen(false);
    onDone(`Case ${c.id} forwarded to ${agency}`);
    refocusRow(c.id);
  };

  return (
    <ActionDialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) {
          setAgency(own);
          setError(null);
        }
      }}
      trigger={
        <button type="button" data-row-action={c.id} className={cb.goldSm}>
          <Icon name="forward_to_inbox" className="text-[16px]" />
          Forward
        </button>
      }
      title="Forward this case"
      description="Choose the agency that should handle it. It starts with the one that normally receives this kind of complaint."
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <CaseLine c={c} />
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-semibold text-white/90">Agency</legend>
          {AGENCIES.map((a) => {
            const on = agency === a.name;
            return (
              <label
                key={a.name}
                className={cn(
                  "flex min-h-11 cursor-pointer items-start gap-3 rounded-xl px-3.5 py-2.5 ring-1 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-signal-orange motion-reduce:transition-none",
                  on ? "bg-white/10 ring-signal-orange" : "bg-black/30 ring-white/10 hover:bg-white/6",
                )}
              >
                <input type="radio" name={`${uid}-agency`} value={a.name} checked={on} onChange={() => setAgency(a.name)} className="mt-1 size-4 shrink-0 accent-signal-orange" />
                <span className="flex min-w-0 flex-col">
                  <span className="text-sm font-semibold text-white">
                    {a.name}
                    {a.name === own ? <span className="ml-2 text-xs font-normal text-white/65">usual agency</span> : null}
                  </span>
                  <span className="text-xs text-white/65">{a.kinds.map((k) => k.label).join(", ")}</span>
                </span>
              </label>
            );
          })}
        </fieldset>
        <ErrorLine error={error} />
        <div className="flex flex-wrap justify-end gap-2">
          <Dialog.Close className={cb.quiet}>Cancel</Dialog.Close>
          <button type="submit" className={cb.gold}>
            <Icon name="send" className="text-[18px]" />
            Forward to agency
          </button>
        </div>
      </form>
    </ActionDialog>
  );
}

/** Resolve: the agency confirmed action; a short note says what was done. */
function ResolveAction({ c, onDone }: { c: Case; onDone(message: string): void }) {
  const uid = useId();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err = commandAct((w, t) => resolve(w, c.id, t, note));
    setError(err);
    if (err) return;
    setOpen(false);
    onDone(`Case ${c.id} resolved`);
    refocusRow(c.id);
  };

  return (
    <ActionDialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) {
          setNote("");
          setError(null);
        }
      }}
      trigger={
        <button type="button" data-row-action={c.id} className={cb.outlineSm}>
          <Icon name="task_alt" className="text-[16px]" />
          Resolve
        </button>
      }
      title="Resolve this case"
      description={`Record what ${c.agency ?? "the agency"} confirmed. The case can be closed after that.`}
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <CaseLine c={c} />
        <label htmlFor={`${uid}-note`} className="-mb-2 text-sm font-semibold text-white/90">
          Resolution note
        </label>
        <textarea
          id={`${uid}-note`}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="What the agency confirmed or did"
          className={cn(CONTROL, "min-h-20 py-2.5 leading-relaxed lg:min-h-20")}
        />
        <ErrorLine error={error} />
        <div className="flex flex-wrap justify-end gap-2">
          <Dialog.Close className={cb.quiet}>Cancel</Dialog.Close>
          <button type="submit" className={cb.gold}>
            <Icon name="check" className="text-[18px]" />
            Mark resolved
          </button>
        </div>
      </form>
    </ActionDialog>
  );
}

/** Close: a resolved case is filed away. */
function CloseAction({ c, onDone }: { c: Case; onDone(message: string): void }) {
  const [error, setError] = useState<string | null>(null);
  return (
    <>
      <button
        type="button"
        data-row-action={c.id}
        className={cb.quietSm}
        onClick={() => {
          const err = commandAct((w, t) => close(w, c.id, t));
          setError(err);
          if (!err) {
            onDone(`Case ${c.id} closed`);
            refocusRow(c.id);
          }
        }}
      >
        <Icon name="inventory" className="text-[16px]" />
        Close
      </button>
      {error ? (
        <p role="alert" className="text-xs font-semibold text-white/85">
          {error}
        </p>
      ) : null}
    </>
  );
}

function RowActions({ c, onDone }: { c: Case; onDone(message: string): void }) {
  switch (c.status) {
    case "new":
      return <ForwardAction c={c} onDone={onDone} />;
    case "acknowledged":
      return <ResolveAction c={c} onDone={onDone} />;
    case "resolved":
      return <CloseAction c={c} onDone={onDone} />;
    default:
      return <span className="text-sm text-white/65">—</span>;
  }
}

/* ───────────── by agency ───────────── */

function ByAgency({ agency, onPick }: { agency: string; onPick(name: string): void }) {
  const rows = useCommand(selectByAgency);
  const total = rows?.reduce((s, r) => s + r.count, 0) ?? 0;
  const max = Math.max(1, ...(rows ?? []).map((r) => r.count));
  return (
    <Panel title="Open by agency" icon="account_balance" sub="Choose an agency to show only its cases in the queue">
      {rows === null ? (
        <div aria-hidden="true" className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : total === 0 ? (
        <p className="py-6 text-center text-sm text-white/65">No open cases right now.</p>
      ) : (
        <ul aria-label="Open cases by agency" className="grid gap-x-8 gap-y-1 md:grid-cols-2">
          {rows.map((r) => {
            const on = agency === r.name;
            const share = Math.round((r.count / total) * 100);
            return (
              <li key={r.name}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => onPick(on ? "" : r.name)}
                  className={cn(
                    "grid min-h-11 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white/6 motion-reduce:transition-none",
                    focusRing,
                    on && "bg-white/8 ring-1 ring-signal-orange",
                  )}
                >
                  <span className="truncate text-sm font-semibold text-white">{r.name}</span>
                  <span className="flex items-baseline gap-2 tabular-nums">
                    <span className="font-grotesk text-sm font-bold text-white">{num(r.count)}</span>
                    <span className="text-xs text-white/65">{share}%</span>
                  </span>
                  <span aria-hidden="true" className="col-span-2 h-1.5 overflow-hidden rounded-full bg-white/8">
                    <span className="block h-full rounded-full bg-bdnavy-300 transition-[width] duration-200 motion-reduce:transition-none" style={{ width: `${(r.count / max) * 100}%` }} />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

/* ───────────── the page ───────────── */

export function OtherQueue() {
  const [selected, setSelected] = useSelectedCase();
  const filters = useUrlFilters(DEFAULTS);
  const { params, setParams } = filters;
  const stats = useCommand(selectStats);
  const resolvedToday = useResolvedToday("other");
  const [done, setDone] = useState("");
  const queue = useRef<HTMLDivElement>(null);

  const statusParam = params.get("status");
  const status = STATUS_OPTIONS.some((o) => o.value === statusParam) ? (statusParam ?? OPEN) : OPEN;
  const agencyParam = params.get("agency");
  const agency = AGENCY_OPTIONS.some((o) => o.value === agencyParam) ? (agencyParam ?? "") : "";
  const qUrl = params.get("q")?.trim() ?? "";
  const [text, setText, clearText] = useSearchBox(qUrl, filters);
  const filtered = status !== OPEN || agency !== "" || qUrl !== "";

  const select = useMemo(
    () =>
      perWorld((w: World) =>
        // The default view is every case not yet closed, so a resolved case waits there for its Close button.
        filterCases(w, { dept: "other", status: status === ALL || status === OPEN ? undefined : (status as Status), q: qUrl || undefined }).filter(
          (c) => (status !== OPEN || c.status !== "closed") && (!agency || agencyOf(c) === agency),
        ),
      ),
    [status, agency, qUrl],
  );
  const cases = useCommand(select);
  const all = useCommand(selectOther);
  const key = [status, agency, qUrl].join("|");
  const v = (x: number | undefined) => (x === undefined ? <Skeleton className="h-7 w-14" /> : num(x));

  return (
    <CommandPage
      title="Other agencies"
      subtitle="Complaints that belong to another body, such as the Anti-Corruption Commission, the land office or the Department of Environment. Forward each new case to its agency, mark it resolved when the agency confirms action, then close it."
    >
      <section aria-label="Key figures" className="overflow-hidden rounded-2xl bg-bdnavy-900 ring-1 ring-white/12">
        <dl className="grid grid-cols-2 sm:grid-cols-4 [&>div]:border-white/10 max-sm:[&>div:nth-child(-n+2)]:border-b max-sm:[&>div:nth-child(odd)]:border-r sm:[&>div:not(:last-child)]:border-r">
          <Kpi label="New" icon="fiber_new" value={v(stats?.fresh)} sub={stats ? "Waiting to be forwarded" : null} />
          <Kpi label="Forwarded" icon="forward_to_inbox" value={v(stats?.forwarded)} sub={stats ? "With the agency" : null} />
          <Kpi label="To close" icon="inventory" value={v(stats?.toClose)} sub={stats ? "Resolved, not yet closed" : null} />
          <Kpi label="Resolved today" icon="check_circle" value={v(resolvedToday ?? undefined)} sub={stats ? "Since midnight, Dhaka" : null} />
        </dl>
      </section>

      <p role="status" className="sr-only">
        {done}
      </p>

      <ByAgency agency={agency} onPick={(name) => setParams({ agency: name })} />

      <Panel
        id="oq-panel"
        title="Queue"
        icon="forward_to_inbox"
        sub="Critical first, then newest. A new case is forwarded, a forwarded one resolved, a resolved one closed. Closed cases are under All statuses."
        action={
          cases ? (
            <span className="rounded-full bg-white/8 px-2.5 py-1 text-xs font-semibold text-white/85 tabular-nums ring-1 ring-white/12">{num(cases.length)} shown</span>
          ) : null
        }
      >
        <form role="search" aria-label="Filter other-agency cases" onSubmit={(e) => e.preventDefault()} className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-[minmax(0,12rem)_minmax(0,18rem)_minmax(0,1fr)_auto] xl:items-end">
          <SelectField label="Status" value={status} onChange={(s) => setParams({ status: s })} options={STATUS_OPTIONS} />
          <SelectField label="Agency" value={agency} onChange={(a) => setParams({ agency: a })} options={AGENCY_OPTIONS} />
          <SearchField label="Search" value={text} onChange={setText} placeholder="Case number or place" className="col-span-2 xl:col-span-1" />
          <button
            type="button"
            aria-disabled={!filtered && text === ""}
            onClick={() => {
              if (!filtered && text === "") return;
              clearText();
              setParams({ status: OPEN, agency: "", q: "" });
            }}
            className={cn(cb.quietSm, "col-span-2 aria-disabled:pointer-events-none aria-disabled:opacity-50 md:col-span-1")}
          >
            <Icon name="filter_alt_off" className="text-[16px]" />
            Clear filters
          </button>
        </form>
        {/* Focus lands here when the case it was on has left the list. */}
        <div id="oq-queue" ref={queue} tabIndex={-1} className="outline-none">
          <CaseTable
            key={key}
            cases={cases}
            onOpen={setSelected}
            columns={["id", "category", "agency", "status", "age"]}
            caption="Other-agency cases"
            rowActions={{ label: "Action", render: (c) => <RowActions c={c} onDone={setDone} /> }}
            empty={filtered ? "No cases match these filters." : all && all.length > 0 ? "Nothing waiting. New complaints for other agencies will appear here." : "No cases for other agencies yet."}
          />
        </div>
      </Panel>

      <p className="flex items-center gap-2 text-xs text-white/65">
        <Icon name="info" className="text-[16px]" />
        Agencies are named for demonstration; no complaint is actually sent to them.
      </p>

      <CaseDrawer caseId={selected} onClose={() => setSelected(null)} />
    </CommandPage>
  );
}

export function OtherQueueFallback() {
  return (
    <CommandPage title="Other agencies" subtitle="Loading the queue…">
      <Skeleton className="h-28 w-full rounded-2xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
      <Skeleton className="h-96 w-full rounded-2xl" />
    </CommandPage>
  );
}
