"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Card } from "@/components/bangladesh-landing/kit";
import { Icon } from "@/components/ui/icon";
import { btn } from "@/components/ui/section-kit";
import type { EvidenceStatus, Urgency } from "@/data/amar-bangladesh";
import { EVIDENCE, URGENCY, type Advice } from "@/data/bangladesh-problems";
import { cn } from "@/lib/utils";

export interface PixelProblem {
  n: number;
  title: string;
  interpretation: string;
  theme: string;
  urgency: Urgency;
  status: EvidenceStatus;
  statusNote: string;
  brief: string;
  fact?: { text: string; source: string };
  doThis: Advice[];
  avoid: Advice[];
}

const URGENCIES: Urgency[] = ["very-high", "high", "medium-high", "medium"];
const STATUSES: EvidenceStatus[] = ["verified", "plausible", "unverified"];

/** The pixel's fill by urgency: red only for the most urgent, then gold, navy tint and an empty square. */
const PIXEL: Record<Urgency, string> = {
  "very-high": "bg-national-crimson text-white",
  high: "bg-signal-orange text-text-primary",
  "medium-high": "bg-bdnavy-300 text-text-primary",
  medium: "text-white ring-1 ring-white/65 ring-inset",
};

const CHIP =
  "inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold ring-1 ring-inset transition-colors focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none motion-reduce:transition-none";

const LINK_BUTTON =
  "inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 text-sm font-bold text-signal-orange transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none motion-reduce:transition-none";

function subscribeHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

/** "#p-12" → 12, from the rural wall and from other chapters' links. */
function hashProblem(hash: string): number | null {
  const m = /^#p-(\d{1,2})$/.exec(hash);
  return m ? Number(m[1]) : null;
}

/**
 * The register of 32 problems: filters (urgency, evidence, theme), the
 * grid of problem cards, and one problem's evidence and path in a side
 * sheet (a modal dialog) that steps through the filtered set. A link to
 * "#p-n" opens problem n.
 */
export function ProblemPixelsView({ items }: { items: PixelProblem[] }) {
  const [urgency, setUrgency] = useState<Urgency | null>(null);
  const [status, setStatus] = useState<EvidenceStatus | null>(null);
  const [theme, setTheme] = useState<string | null>(null);
  const hash = useSyncExternalStore(subscribeHash, () => window.location.hash, () => "");
  const [picked, setPicked] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  const visible = items.filter(
    (x) => (!urgency || x.urgency === urgency) && (!status || x.status === status) && (!theme || x.theme === theme),
  );
  const themes = [...new Set(items.map((x) => x.theme))].sort();
  const filtered = Boolean(urgency || status || theme);
  const openN = picked ?? hashProblem(hash);
  const open = items.find((x) => x.n === openN);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (!open) {
      if (d.open) d.close();
      return;
    }
    if (!d.open) d.showModal();
    const root = document.documentElement;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = "";
    };
  }, [open]);

  function close() {
    setPicked(null);
    if (hashProblem(window.location.hash)) history.replaceState(history.state, "", window.location.pathname + window.location.search);
  }

  function clear() {
    setUrgency(null);
    setStatus(null);
    setTheme(null);
  }

  const count = (pred: (x: PixelProblem) => boolean) => items.filter(pred).length;

  return (
    <div>
      <div className="flex flex-wrap items-end gap-x-10 gap-y-5">
        <FilterGroup legend="Urgency">
          <Chip on={!urgency} onClick={() => setUrgency(null)} label="All" count={items.length} />
          {URGENCIES.map((u) => (
            <Chip
              key={u}
              on={urgency === u}
              onClick={() => setUrgency(u)}
              label={URGENCY[u].short}
              count={count((x) => x.urgency === u)}
              mark={<span aria-hidden className={cn("size-3 rounded-xs", PIXEL[u])} />}
            />
          ))}
        </FilterGroup>
        <FilterGroup legend="Evidence">
          <Chip on={!status} onClick={() => setStatus(null)} label="All" count={items.length} />
          {STATUSES.map((s) => (
            <Chip
              key={s}
              on={status === s}
              onClick={() => setStatus(s)}
              label={EVIDENCE[s].short}
              count={count((x) => x.status === s)}
              mark={<Icon name={EVIDENCE[s].icon} className={cn("text-lg!", status === s ? "text-text-primary" : EVIDENCE[s].tone)} />}
            />
          ))}
        </FilterGroup>
        <div className="flex w-full flex-col gap-2 sm:w-64">
          <label htmlFor="problem-theme" className="text-sm font-semibold text-white/80">
            Theme
          </label>
          <span className="relative">
            <select
              id="problem-theme"
              value={theme ?? ""}
              onChange={(e) => setTheme(e.target.value || null)}
              className="min-h-11 w-full appearance-none rounded-full bg-bdnavy-900 py-2 pr-11 pl-4 text-sm font-semibold text-white ring-1 ring-white/12 ring-inset [color-scheme:dark] focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
            >
              <option value="">All themes ({items.length})</option>
              {themes.map((t) => (
                <option key={t} value={t}>
                  {t} ({count((x) => x.theme === t)})
                </option>
              ))}
            </select>
            <Icon name="expand_more" className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-xl! text-signal-orange" />
          </span>
        </div>
      </div>

      <div className="mt-8 flex min-h-11 flex-wrap items-center justify-between gap-3 border-t border-white/12 pt-5">
        <p aria-live="polite" className="text-sm text-white/80">
          Showing <span className="font-semibold text-white">{visible.length}</span> of {items.length} problems
        </p>
        {filtered ? (
          <button type="button" onClick={clear} className={LINK_BUTTON}>
            <Icon name="close" className="text-lg!" />
            Clear filters
          </button>
        ) : null}
      </div>

      {visible.length ? (
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {visible.map((x) => (
            <li key={x.n} id={`p-${x.n}`} className="scroll-mt-header lg:scroll-mt-header-lg">
              <ProblemCard problem={x} onOpen={() => setPicked(x.n)} />
            </li>
          ))}
        </ul>
      ) : (
        <Card className="mt-5 flex flex-col items-start gap-4">
          <p className="text-base text-white/80">No problem matches all three filters.</p>
          <button type="button" onClick={clear} className={cn(btn.goldOutline, "bg-transparent")}>
            Clear filters
          </button>
        </Card>
      )}

      <dialog
        ref={dialog}
        aria-labelledby="problem-sheet-title"
        onClose={close}
        onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
        className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-full max-w-2xl overflow-hidden bg-black p-0 text-white ring-1 ring-white/12 backdrop:bg-black/75 sm:rounded-l-3xl motion-safe:transition-[translate] motion-safe:duration-500 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:starting:open:translate-x-full"
      >
        {open ? (
          <ProblemSheet
            problem={open}
            total={items.length}
            ring={visible.some((x) => x.n === open.n) ? visible : items}
            onStep={setPicked}
            onClose={() => dialog.current?.close()}
          />
        ) : null}
      </dialog>
    </div>
  );
}


function FilterGroup({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-sm font-semibold text-white/80">{legend}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

function Chip({ on, onClick, label, count, mark }: { on: boolean; onClick: () => void; label: string; count: number; mark?: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(CHIP, on ? "bg-signal-orange text-text-primary ring-signal-orange" : "bg-bdnavy-900 text-white ring-white/12 hover:ring-signal-orange")}
    >
      {mark}
      {label}
      <span className={cn("tabular-nums", on ? "text-text-primary/80" : "text-white/65")}>{count}</span>
    </button>
  );
}

/** A problem's pixel: its number on its urgency colour. */
function Pixel({ problem, className }: { problem: PixelProblem; className?: string }) {
  return (
    <span aria-hidden className={cn("grid size-12 shrink-0 place-items-center rounded-lg font-grotesk text-lg font-bold", PIXEL[problem.urgency], className)}>
      {problem.n}
    </span>
  );
}

/** Evidence status and urgency, each as a mark and words. */
function Readings({ problem, className }: { problem: PixelProblem; className?: string }) {
  const e = EVIDENCE[problem.status];
  return (
    <dl className={cn("flex flex-col gap-2 text-sm text-white/80", className)}>
      <div className="flex items-center gap-2">
        <dt className="sr-only">Evidence</dt>
        <Icon name={e.icon} className={cn("text-lg!", e.tone)} />
        <dd>{e.label}</dd>
      </div>
      <div className="flex items-center gap-2">
        <dt className="sr-only">Urgency</dt>
        <span aria-hidden className="grid size-4.5 place-items-center">
          <span className={cn("size-3 rounded-xs", PIXEL[problem.urgency])} />
        </span>
        <dd>{URGENCY[problem.urgency].label}</dd>
      </div>
    </dl>
  );
}

/**
 * One problem in the grid. The whole card opens its sheet (the button
 * stretches over it).
 */
function ProblemCard({ problem, onOpen }: { problem: PixelProblem; onOpen: () => void }) {
  const { n, title, interpretation, theme } = problem;
  return (
    <Card className="group relative flex h-full flex-col p-6 has-[button:focus-visible]:ring-2 has-[button:focus-visible]:ring-signal-orange sm:p-6">
      <div className="flex items-center gap-3">
        <Pixel problem={problem} />
        <p className="text-sm text-white/65">
          Problem {n} · {theme}
        </p>
      </div>
      <h3 className="mt-5 font-grotesk text-lg leading-snug font-bold text-balance text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-white/80">{interpretation}</p>
      <Readings problem={problem} className="mt-5" />
      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={onOpen}
          className="flex min-h-11 items-center gap-1.5 text-sm font-bold text-signal-orange after:absolute after:inset-0 after:rounded-3xl focus-visible:outline-none"
        >
          Evidence and path<span className="sr-only">: {title}</span>
          <Icon name="arrow_forward" className="text-lg! transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
        </button>
      </div>
    </Card>
  );
}

/** The side sheet: one problem's evidence, its brief, what to do and avoid; steps through `ring`. */
function ProblemSheet({
  problem,
  total,
  ring,
  onStep,
  onClose,
}: {
  problem: PixelProblem;
  total: number;
  ring: PixelProblem[];
  onStep: (n: number) => void;
  onClose: () => void;
}) {
  const body = useRef<HTMLDivElement>(null);
  const { n, title, interpretation, theme, status, statusNote, brief, fact, doThis, avoid } = problem;
  const i = ring.findIndex((x) => x.n === n);
  const prev = ring[(i - 1 + ring.length) % ring.length];
  const next = ring[(i + 1) % ring.length];
  const e = EVIDENCE[status];

  function step(to: PixelProblem) {
    onStep(to.n);
    body.current?.scrollTo({ top: 0 });
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-4 border-b border-white/12 px-gutter-x py-4 sm:px-8">
        <Pixel problem={problem} />
        <p className="flex-1 text-sm text-white/65">
          Problem {n} of {total} · {theme}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="grid size-11 place-items-center rounded-full bg-bdnavy-900 text-white ring-1 ring-white/12 transition-colors hover:text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none motion-reduce:transition-none"
        >
          <Icon name="close" className="text-2xl!" />
          <span className="sr-only">Close</span>
        </button>
      </header>

      <div ref={body} className="flex-1 overflow-y-auto overscroll-contain px-gutter-x py-8 sm:px-8">
        <h2 id="problem-sheet-title" className="font-grotesk text-2xl leading-tight font-bold tracking-tight text-balance text-signal-orange sm:text-3xl">
          {title}
        </h2>
        <p className="sr-only" aria-live="polite">
          Problem {n}: {title}
        </p>
        <p className="mt-3 text-lg leading-relaxed text-white/80">{interpretation}</p>
        <Readings problem={problem} className="mt-5" />

        <p className="mt-8 text-base leading-relaxed text-white">{brief}</p>
        {fact ? (
          <figure className="mt-5 rounded-2xl bg-text-primary p-5 ring-1 ring-white/12">
            <blockquote className="flex gap-3 text-base leading-relaxed text-white">
              <Icon name="fact_check" className="shrink-0 text-2xl! text-signal-orange" />
              <p>{fact.text}</p>
            </blockquote>
            <figcaption className="mt-2 pl-9 text-xs text-white/65">Source: {fact.source}</figcaption>
          </figure>
        ) : null}

        <section aria-labelledby="sheet-evidence" className="mt-5 rounded-2xl bg-bdnavy-900 p-5 ring-1 ring-white/12">
          <h3 id="sheet-evidence" className="flex items-center gap-2 font-grotesk text-base font-bold text-white">
            <Icon name={e.icon} className={cn("text-xl!", e.tone)} />
            How sure we are: {e.short.toLowerCase()}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-white/80">{statusNote}</p>
        </section>

        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          <AdviceList title="Do this" icon="task_alt" tone="text-signal-orange" items={doThis} />
          <AdviceList title="Avoid" icon="block" tone="text-crimson-bright" items={avoid} />
        </div>
      </div>

      {ring.length > 1 ? (
        <nav aria-label="Other problems" className="grid grid-cols-2 gap-3 border-t border-white/12 px-gutter-x py-3 sm:px-8">
          <StepButton to={prev} dir="prev" onStep={step} />
          <StepButton to={next} dir="next" onStep={step} />
        </nav>
      ) : null}
    </div>
  );
}

function AdviceList({ title, icon, tone, items }: { title: string; icon: string; tone: string; items: Advice[] }) {
  return (
    <section>
      <h3 className={cn("flex items-center gap-2 font-grotesk text-lg font-bold", tone)}>
        <Icon name={icon} className="text-2xl!" />
        {title}
      </h3>
      <ul className="mt-4 flex flex-col gap-5">
        {items.map((d) => (
          <li key={d.text} className="border-l-2 border-white/12 pl-4">
            <p className="text-base leading-snug font-semibold text-white">{d.text}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-white/80">{d.why}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function StepButton({ to, dir, onStep }: { to: PixelProblem; dir: "prev" | "next"; onStep: (to: PixelProblem) => void }) {
  const next = dir === "next";
  return (
    <button
      type="button"
      onClick={() => onStep(to)}
      className={cn(
        "flex min-h-14 items-center gap-2 rounded-xl px-3 text-left text-sm text-white/80 transition-colors hover:bg-bdnavy-900 hover:text-white focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none motion-reduce:transition-none",
        next && "flex-row-reverse text-right",
      )}
    >
      <Icon name={next ? "arrow_forward" : "arrow_back"} className="shrink-0 text-xl! text-signal-orange" />
      <span className="min-w-0">
        <span className="block font-semibold text-white">{next ? "Next" : "Previous"}: problem {to.n}</span>
        <span className="block truncate">{to.title}</span>
      </span>
    </button>
  );
}
