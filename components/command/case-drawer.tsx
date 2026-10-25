"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Dialog } from "radix-ui";
import { type FormEvent, type ReactNode, useCallback, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { acknowledge, addNote, arrive, close, dispatch, escalate, forward, reopen, resolve } from "@/lib/command/actions";
import { ACK_WINDOW_MS } from "@/lib/command/engine";
import { haversineKm, rankUnits } from "@/lib/command/geo";
import { CATEGORY_META } from "@/lib/command/routing";
import { bdDay } from "@/lib/command/selectors";
import { commandAct, useCase, useCommand } from "@/lib/command/store";
import type { ActionResult, AlertOutcome, Case, TimelineKind, Unit, World } from "@/lib/command/types";
import { cn } from "@/lib/utils";
import {
  Bn,
  CategoryChip,
  DIVISIONS,
  EmptyState,
  OverduePill,
  SeverityPill,
  Skeleton,
  StatusPill,
  UNIT_KIND_LABEL,
  cb,
  dhakaDateTime,
  dhakaHm,
  dhakaTime,
  focusRing,
  formatMin,
  mmss,
  timeAgo,
} from "./kit";
import { MapView } from "./map-view";

/* ───────────── selection in the URL ───────────── */

/**
 * The open case, kept in `?case=<id>` so a case link can be shared. Uses
 * useSearchParams: render the caller inside <Suspense>.
 */
export function useSelectedCase(): [string | null, (id: string | null) => void] {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const id = params.get("case");
  const setId = useCallback(
    (next: string | null) => {
      const q = new URLSearchParams(params.toString());
      if (next) q.set("case", next);
      else q.delete("case");
      const s = q.toString();
      router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );
  return [id, setId];
}

/* ───────────── the drawer ───────────── */

/**
 * The case sheet: a right-side Radix dialog. Open while `caseId` is set; Escape, the close button or the backdrop call `onClose`.
 * Give the controls that open a case `data-case-open={id}` so focus can find its way back after the list re-rendered.
 */
export function CaseDrawer({ caseId, onClose }: { caseId: string | null; onClose(): void }) {
  // Radix returns focus only to a Dialog.Trigger; this sheet opens from rows,
  // markers and links, so remember what had focus and hand it back on close
  // (or the row for the same case, if the list re-rendered meanwhile).
  const returnTo = useRef<HTMLElement | null>(null);
  const lastId = useRef<string | null>(null);
  const onOpenAutoFocus = () => {
    lastId.current = caseId;
    const a = document.activeElement;
    returnTo.current = a instanceof HTMLElement && a !== document.body ? a : null;
  };
  const onCloseAutoFocus = (e: Event) => {
    e.preventDefault();
    const id = lastId.current;
    const shown = (x: HTMLElement | null | undefined) => (x && x.isConnected && x.getClientRects().length > 0 ? x : null);
    const el =
      shown(returnTo.current) ??
      (id ? [...document.querySelectorAll<HTMLElement>(`[data-case-open="${CSS.escape(id)}"]`)].find((x) => shown(x)) : undefined) ??
      document.getElementById("command-main");
    if (!el) return;
    el.focus({ preventScroll: true });
    // "nearest" scrolls the page and any scrolling list only if the row is out of view.
    if (el.id !== "command-main") el.scrollIntoView({ block: "nearest" });
  };
  return (
    <Dialog.Root open={caseId !== null} onOpenChange={(o) => (o ? undefined : onClose())}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/60 transition-opacity duration-200 starting:opacity-0 motion-reduce:transition-none" />
        <Dialog.Content
          aria-describedby={undefined}
          onOpenAutoFocus={onOpenAutoFocus}
          onCloseAutoFocus={onCloseAutoFocus}
          className="fixed inset-y-0 right-0 z-[71] flex w-full max-w-[38rem] flex-col bg-bdnavy-900 text-white shadow-[-24px_0_48px_-12px_rgb(0_0_0/0.6)] ring-1 ring-white/12 transition-[translate,opacity] duration-200 ease-out focus:outline-none starting:translate-x-6 starting:opacity-0 motion-reduce:transition-none"
        >
          {caseId ? <DrawerBody key={caseId} caseId={caseId} /> : <Dialog.Title className="sr-only">Case</Dialog.Title>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const selectNow = (w: World) => w.now;
const selectUnits = (w: World) => w.units;

function CloseButton() {
  return (
    <Dialog.Close aria-label="Close case" className={cb.icon}>
      <Icon name="close" className="text-[22px]" />
    </Dialog.Close>
  );
}

function DrawerBody({ caseId }: { caseId: string }) {
  const c = useCase(caseId);
  if (c === null) {
    return (
      <>
        <div className="flex items-start justify-between gap-3 border-b border-white/10 p-5">
          <div className="flex flex-1 flex-col gap-3">
            <Dialog.Title className="sr-only">Loading case {caseId}</Dialog.Title>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-7 w-3/4" />
          </div>
          <CloseButton />
        </div>
        <div className="flex flex-col gap-4 p-5">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-52 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </>
    );
  }
  if (c === undefined) {
    return (
      <>
        <div className="flex items-center justify-between gap-3 border-b border-white/10 p-5">
          <Dialog.Title className="font-grotesk text-lg font-bold text-signal-orange">{caseId}</Dialog.Title>
          <CloseButton />
        </div>
        <div className="p-5">
          <EmptyState icon="inventory_2" title="This case has been archived.">
            Closed cases leave the live board after a while to keep it fast. It is no longer in this demo.
          </EmptyState>
        </div>
      </>
    );
  }
  return <CaseSheet c={c} />;
}

function CaseSheet({ c }: { c: Case }) {
  const now = useCommand(selectNow) ?? c.reportedAt;
  const units = useCommand(selectUnits);
  const byId = useMemo(() => new Map((units ?? []).map((u) => [u.id, u])), [units]);
  const unit = c.assignedUnitId ? byId.get(c.assignedUnitId) : undefined;
  const home = c.homeId ? byId.get(c.homeId) : undefined;
  const pendingUnitId = c.alerts.find((a) => a.outcome === "pending")?.unitId;
  const alerted = !unit && pendingUnitId ? byId.get(pendingUnitId) : undefined;
  const meta = CATEGORY_META[c.category];
  const div = DIVISIONS[c.place.division];

  return (
    <>
      <header className="flex items-start gap-3 border-b border-white/10 px-5 pt-4 pb-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-semibold text-white/80">{c.id}</span>
            <SeverityPill severity={c.severity} />
            <StatusPill status={c.status} />
            {c.overdue && c.status !== "resolved" && c.status !== "closed" ? <OverduePill /> : null}
          </div>
          <Dialog.Title asChild>
            <h2 lang="bn" tabIndex={-1} data-case-title="" className="mt-3 font-bengali focus:outline-none text-xl leading-snug font-bold text-balance text-signal-orange sm:text-2xl">
              {c.titleBn}
            </h2>
          </Dialog.Title>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/60">
            <CategoryChip category={c.category} english />
            <span className="tabular-nums">
              Reported {timeAgo(c.reportedAt, now)} · {dhakaDateTime(c.reportedAt)}
            </span>
          </p>
        </div>
        <CloseButton />
      </header>

      <div className="flex-1 overflow-y-auto overscroll-contain">
        <Actions c={c} units={units ?? []} now={now} />

        <Section title="Place" icon="location_on">
          <p className="text-sm leading-relaxed text-white">
            <Bn className="font-semibold">{c.place.areaBn}</Bn>
            <span className="text-white/65">
              {" "}
              · {c.place.district} · {div.label} division
            </span>
          </p>
          <p lang="bn" className="mt-2 font-bengali text-sm leading-relaxed text-white/80">
            {c.summaryBn}
          </p>
          <MiniMap c={c} units={units} />
        </Section>

        <Section title={c.dept === "other" ? "Receiving body" : "Assigned unit"} icon={c.dept === "other" ? "account_balance" : "local_police"}>
          {c.dept === "other" ? (
            <p className="text-sm text-white">
              {c.agency ?? meta.agency ?? "Not chosen yet"}
              <span className="block pt-1 text-xs text-white/60">Other-agency cases are forwarded to the body that handles them, then closed when it confirms action.</span>
            </p>
          ) : (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-4">
              <Fact label="Unit" wide>
                {unit ? (
                  <>
                    {unit.name}
                    <span className="block text-xs text-white/55">
                      {UNIT_KIND_LABEL[unit.kind]} · {unit.status === "busy" ? "busy" : unit.status === "off-duty" ? "off duty" : "available"}
                    </span>
                  </>
                ) : alerted ? (
                  <>
                    {alerted.name}
                    <span className="block text-xs text-white/55">Alerted, waiting for an answer</span>
                  </>
                ) : (
                  <span className="text-white/60">Not assigned yet</span>
                )}
              </Fact>
              <Fact label="Distance">{c.distanceKm !== undefined ? `${c.distanceKm.toFixed(1)} km` : "—"}</Fact>
              <Fact label="ETA">{c.status === "on-scene" ? "On scene" : c.etaMin !== undefined ? `${c.etaMin} min` : "—"}</Fact>
              <Fact label={c.dept === "police" ? "Owning station" : "Owning office"} wide>
                {home ? (
                  <>
                    {home.name}
                    <span className="block text-xs text-white/55 tabular-nums">{haversineKm(c.place, home).toFixed(1)} km from the place</span>
                  </>
                ) : (
                  "—"
                )}
              </Fact>
              <Fact label="First response" wide>
                {c.firstAckAt !== undefined ? formatMin((c.firstAckAt - c.reportedAt) / 60_000) : <span className="text-white/60">Waiting</span>}
              </Fact>
            </dl>
          )}
        </Section>

        {c.dept !== "other" ? (
          <Section title="Alert log" icon="notifications" count={c.alerts.length}>
            {c.alerts.length === 0 ? (
              <p className="text-sm text-white/60">No unit has been alerted yet.</p>
            ) : (
              <ol className="flex flex-col divide-y divide-white/8">
                {c.alerts.map((a, i) => {
                  const u = byId.get(a.unitId);
                  const left = a.at + ACK_WINDOW_MS[c.severity] - now;
                  return (
                    <li key={`${a.unitId}-${a.at}-${i}`} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                      <span className="w-6 shrink-0 text-xs font-semibold text-white/45 tabular-nums">{i + 1}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-white">{u?.name ?? a.unitId}</span>
                        <span className="text-xs text-white/55 tabular-nums">Alerted {dhakaTime(a.at)}</span>
                      </span>
                      <AlertOutcomeTag outcome={a.outcome} left={left} />
                    </li>
                  );
                })}
              </ol>
            )}
          </Section>
        ) : null}

        <Section title="Timeline" icon="history" count={c.timeline.length}>
          <ol className="relative flex flex-col gap-3.5 before:absolute before:top-2 before:bottom-2 before:left-[0.6875rem] before:w-px before:bg-white/12">
            {c.timeline
              .slice()
              .reverse()
              .map((e, i) => (
                <li key={`${e.at}-${i}`} className="relative flex gap-3">
                  <span className="relative z-10 grid size-6 shrink-0 place-items-center rounded-full bg-bdnavy-900 ring-1 ring-white/20">
                    <Icon name={TIMELINE_ICON[e.kind]} className="text-[14px] text-bdnavy-300" />
                  </span>
                  <span className="min-w-0 flex-1 pt-0.5">
                    <span className="block text-sm leading-snug text-white">{e.text}</span>
                    <span className="mt-0.5 block text-xs text-white/55 tabular-nums">
                      {dhakaTime(e.at)} · {timeAgo(e.at, now)}
                      {e.by === "operator" ? " · by you" : ""}
                    </span>
                  </span>
                </li>
              ))}
          </ol>
        </Section>

        <Notes c={c} now={now} />
      </div>
    </>
  );
}

const TIMELINE_ICON: Record<TimelineKind, string> = {
  reported: "campaign",
  alerted: "notifications_active",
  acknowledged: "how_to_reg",
  dispatched: "directions_car",
  arrived: "location_on",
  resolved: "check_circle",
  closed: "inventory",
  escalated: "trending_up",
  note: "sticky_note_2",
  reopened: "replay",
  forwarded: "forward_to_inbox",
};

function AlertOutcomeTag({ outcome, left }: { outcome: AlertOutcome; left: number }) {
  if (outcome === "pending") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-white tabular-nums">
        <Icon name="hourglass_top" className="text-[14px] text-signal-orange" />
        {mmss(left)} left
      </span>
    );
  }
  const m = { acknowledged: ["Answered", "check"], "timed-out": ["No answer", "timer_off"], declined: ["Passed on", "redo"] }[outcome];
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-semibold", outcome === "acknowledged" ? "text-white" : "text-white/60")}>
      <Icon name={m[1]} className="text-[14px]" />
      {m[0]}
    </span>
  );
}

function Section({ title, icon, count, children }: { title: string; icon: string; count?: number; children: ReactNode }) {
  return (
    <section className="border-b border-white/10 px-5 py-5 last:border-b-0">
      <h3 className="mb-3 flex items-center gap-2 font-grotesk text-sm font-bold text-signal-orange">
        <Icon name={icon} className="text-[18px]" />
        {title}
        {count !== undefined ? <span className="rounded-full bg-white/8 px-1.5 text-xs font-semibold text-white/70 tabular-nums">{count}</span> : null}
      </h3>
      {children}
    </section>
  );
}

function Fact({ label, wide, children }: { label: string; wide?: boolean; children: ReactNode }) {
  return (
    <div className={cn("min-w-0", wide && "col-span-2")}>
      <dt className="text-xs text-white/55">{label}</dt>
      <dd className="mt-0.5 font-semibold text-white tabular-nums">{children}</dd>
    </div>
  );
}

function MiniMap({ c, units }: { c: Case; units: Unit[] | null }) {
  const cases = useMemo(() => [c], [c]);
  const deptUnits = useMemo(() => (units ?? []).filter((u) => u.dept === c.dept), [units, c.dept]);
  if (c.dept === "other") return null;
  return (
    <MapView
      className="mt-4 h-52 rounded-xl ring-1 ring-white/12 sm:h-60"
      cases={cases}
      units={deptUnits}
      selectedId={c.id}
      focus="selection"
      showUnits={c.dept === "police" ? ["station", "patrol"] : ["office", "team"]}
    />
  );
}

/* ───────────── actions ───────────── */

/** Applies an action; returns its error, or null once applied. */
type Run = (fn: (w: World, now: number) => ActionResult) => string | null;

/**
 * After an action the button that was pressed is usually gone (the status
 * moved on), so keyboard focus would fall to the dialog. Once React has drawn
 * the new state, put it on the first action button, else on the case title.
 */
function focusActions(): void {
  requestAnimationFrame(() => {
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
    const target = dialog?.querySelector<HTMLElement>("[data-case-actions] button") ?? dialog?.querySelector<HTMLElement>("[data-case-title]");
    target?.focus({ preventScroll: true });
  });
}

function Actions({ c, units, now }: { c: Case; units: Unit[]; now: number }) {
  // An error belongs to the status it was refused in; once the case moves on it no longer applies.
  const [failed, setFailed] = useState<{ status: Case["status"]; message: string } | null>(null);
  const error = failed && failed.status === c.status ? failed.message : null;
  const [resolving, setResolving] = useState(false);
  const [note, setNote] = useState("");
  const run: Run = (fn) => {
    const e = commandAct(fn);
    setFailed(e ? { status: c.status, message: e } : null);
    if (!e) focusActions();
    return e;
  };
  const id = c.id;
  const field = c.dept !== "other";
  const ranked = useMemo(() => (c.dept === "other" ? [] : rankUnits(c.place, units, c.dept).slice(0, 3)), [c.place, c.dept, units]);
  const canDispatch = field && (c.status === "new" || c.status === "alerted" || c.status === "acknowledged");
  const canResolve = c.status === "acknowledged" || c.status === "en-route" || c.status === "on-scene";
  const agency = c.agency ?? CATEGORY_META[c.category].agency ?? "District Commissioner's Office";
  const pending = c.alerts.find((a) => a.outcome === "pending");
  const left = pending ? pending.at + ACK_WINDOW_MS[c.severity] - now : 0;

  const buttons: ReactNode[] = [];
  const add = (key: string, primary: boolean, icon: string, label: string, onClick: () => void) =>
    buttons.push(
      <button key={key} type="button" onClick={onClick} className={buttons.length === 0 && primary ? cb.gold : cb.quiet}>
        <Icon name={icon} className="text-[18px]" />
        {label}
      </button>,
    );

  if (c.status === "alerted") add("ack", true, "how_to_reg", "Acknowledge", () => run((w, t) => acknowledge(w, id, t)));
  if (c.status === "new" && c.dept === "other") add("fwd", true, "forward_to_inbox", `Forward to ${agency}`, () => run((w, t) => forward(w, id, t, agency)));
  if (canDispatch) add("disp", true, "directions_car", "Dispatch nearest", () => run((w, t) => dispatch(w, id, t)));
  if (c.status === "alerted") add("esc", false, "trending_up", "Escalate now", () => run((w, t) => escalate(w, id, t)));
  if (c.status === "en-route") add("arr", true, "location_on", "Mark arrived", () => run((w, t) => arrive(w, id, t)));
  if (canResolve && !resolving) add("res", c.status === "on-scene", "check_circle", "Resolve…", () => setResolving(true));
  if (c.status === "resolved") add("close", true, "inventory", "Close case", () => run((w, t) => close(w, id, t)));
  if (c.status === "resolved" || c.status === "closed") add("reopen", c.status === "closed", "replay", "Reopen", () => run((w, t) => reopen(w, id, t)));

  const submitResolve = (e: FormEvent) => {
    e.preventDefault();
    if (run((w, t) => resolve(w, id, t, note)) === null) {
      setResolving(false);
      setNote("");
    }
  };

  return (
    <section aria-label="Actions" data-case-actions="" className="border-b border-white/10 bg-black/25 px-5 py-4">
      {c.status === "alerted" && pending ? (
        <p className={cn("mb-3 flex items-center gap-2 text-sm tabular-nums", c.severity === "critical" ? "text-crimson-bright" : "text-white/80")}>
          <Icon name="hourglass_top" className="shrink-0 text-[18px]" />
          <span>
            Escalates to the next unit in <strong className="font-grotesk">{mmss(left)}</strong> unless acknowledged.
          </span>
        </p>
      ) : null}
      {buttons.length ? <div className="flex flex-wrap gap-2">{buttons}</div> : <p className="text-sm text-white/60">No action needed from this status.</p>}

      {/* The note survives status changes from the simulation; the form hides only while resolving is not allowed. */}
      {resolving && canResolve ? (
        <form onSubmit={submitResolve} className="mt-4 flex flex-col gap-2">
          <label htmlFor={`resolve-${id}`} className="text-sm font-semibold text-white/85">
            Resolution note
          </label>
          <textarea
            id={`resolve-${id}`}
            autoFocus
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="What was done, for example: complainant safe, two suspects detained"
            className="min-h-20 w-full rounded-xl bg-black px-3.5 py-2.5 text-sm leading-relaxed text-white ring-1 ring-white/15 placeholder:text-white/40 focus:ring-2 focus:ring-signal-orange focus:outline-none"
          />
          <div className="flex flex-wrap gap-2">
            <button type="submit" className={cb.gold}>
              <Icon name="check_circle" className="text-[18px]" />
              Resolve case
            </button>
            <button
              type="button"
              onClick={() => {
                setResolving(false);
                focusActions();
              }}
              className={cb.quiet}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {error ? (
        <p role="alert" className="mt-3 flex items-start gap-2 text-sm font-semibold text-white/85">
          <Icon name="error" className="mt-px shrink-0 text-[18px] text-crimson-bright" />
          {error}
        </p>
      ) : null}

      {canDispatch && ranked.length > 0 ? (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold text-white/60">Nearest free units</p>
          <ul className="flex flex-col divide-y divide-white/8 rounded-xl bg-bdnavy-900 ring-1 ring-white/10">
            {ranked.map((r, i) => (
              <li key={r.unit.id} className="flex items-center gap-3 px-3 py-2">
                <span className="w-4 shrink-0 text-xs font-semibold text-white/45 tabular-nums">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-white">{r.unit.name}</span>
                  <span className="text-xs text-white/55 tabular-nums">
                    {UNIT_KIND_LABEL[r.unit.kind]} · {r.km.toFixed(1)} km · about {r.eta} min
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => run((w, t) => dispatch(w, id, t, r.unit.id))}
                  aria-label={`Dispatch ${r.unit.name}`}
                  className={cb.outlineSm}
                >
                  Dispatch
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

/* ───────────── notes ───────────── */

const FOLLOW_UPS = [
  { value: "", label: "No follow-up" },
  { value: "15", label: "In 15 minutes" },
  { value: "60", label: "In 1 hour" },
  { value: "240", label: "In 4 hours" },
  { value: "1440", label: "Tomorrow, same time" },
];

function Notes({ c, now }: { c: Case; now: number }) {
  const [text, setText] = useState("");
  const [follow, setFollow] = useState("");
  const [error, setError] = useState<string | null>(null);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const mins = follow ? Number(follow) : undefined;
    const err = commandAct((w, t) => addNote(w, c.id, t, text, mins === undefined ? undefined : t + mins * 60_000));
    setError(err);
    if (!err) {
      setText("");
      setFollow("");
    }
  };
  return (
    <Section title="Notes and follow-ups" icon="sticky_note_2" count={c.notes.length}>
      {c.notes.length ? (
        <ul className="mb-4 flex flex-col gap-2">
          {c.notes
            .slice()
            .reverse()
            .map((n, i) => {
              const late = n.followUpAt !== undefined && n.followUpAt < now;
              return (
                <li key={`${n.at}-${i}`} className="rounded-xl bg-black/30 px-3.5 py-3 ring-1 ring-white/10">
                  <p className="text-sm leading-relaxed text-white">{n.text}</p>
                  <p className="mt-1 flex flex-wrap gap-x-3 text-xs text-white/55 tabular-nums">
                    <span>{dhakaDateTime(n.at)}</span>
                    {n.followUpAt !== undefined ? (
                      <span className={cn("inline-flex items-center gap-1 font-semibold", late ? "text-crimson-bright" : "text-white/80")}>
                        <Icon name={late ? "alarm" : "event"} className="text-[14px]" />
                        {late ? `Follow-up was due ${dhakaHmOrDate(n.followUpAt, now)}` : `Follow up ${dhakaHmOrDate(n.followUpAt, now)}`}
                      </span>
                    ) : null}
                  </p>
                </li>
              );
            })}
        </ul>
      ) : null}
      <form onSubmit={submit} className="flex flex-col gap-2.5">
        <label htmlFor={`note-${c.id}`} className="text-sm font-semibold text-white/85">
          Add a note
        </label>
        <textarea
          id={`note-${c.id}`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          placeholder="Call made, person spoken to, what was agreed"
          className="min-h-20 w-full rounded-xl bg-black px-3.5 py-2.5 text-sm leading-relaxed text-white ring-1 ring-white/15 placeholder:text-white/40 focus:ring-2 focus:ring-signal-orange focus:outline-none"
        />
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className="text-xs font-semibold text-white/65">Follow-up</span>
            <select
              value={follow}
              onChange={(e) => setFollow(e.target.value)}
              className={cn("min-h-11 w-full rounded-xl bg-black px-3 text-sm text-white ring-1 ring-white/15 [color-scheme:dark]", focusRing, "focus:ring-2 focus:ring-signal-orange focus:outline-none")}
            >
              {FOLLOW_UPS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className={cb.outline}>
            <Icon name="add" className="text-[18px]" />
            Save note
          </button>
        </div>
        {error ? (
          <p role="alert" className="flex items-center gap-2 text-sm font-semibold text-white/85">
            <Icon name="error" className="shrink-0 text-[18px] text-crimson-bright" />
            {error}
          </p>
        ) : null}
      </form>
    </Section>
  );
}

/** "at 14:32" today, else "25 Oct, 14:32". */
function dhakaHmOrDate(t: number, now: number): string {
  return bdDay(t) === bdDay(now) ? `at ${dhakaHm(t)}` : dhakaDateTime(t);
}
