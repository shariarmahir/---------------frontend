"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/icon";
import { allChecks, checksOf, ROADMAP_KINDS, stepsFor, type RoadmapKind, type RoadmapStep } from "@/data/research/roadmap";
import { cn } from "@/lib/utils";
import { articleHref, BTN, BTN_GOLD, COLUMN, H1, LINK, PANEL, PANEL_COBALT, TITLE } from "./kit";

/*
 * Progress lives in this browser only (localStorage): it is a reader's own
 * checklist, not shared data. Every read and write is guarded, so a private
 * window or blocked storage simply starts from nothing.
 */
const KEY = "genius-roadmap-v1";
const EVENT = "genius-roadmap";

interface Saved {
  kind: RoadmapKind;
  done: string[];
}

function read(): string {
  try {
    return window.localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

function write(next: Saved) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* Storage is blocked: the ticks last until the page closes. */
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

function parse(raw: string): Saved {
  try {
    const v = JSON.parse(raw) as Partial<Saved>;
    return { kind: v.kind && Object.hasOwn(ROADMAP_KINDS, v.kind) ? v.kind : "paper", done: Array.isArray(v.done) ? v.done.filter((x) => typeof x === "string").slice(0, 500) : [] };
  } catch {
    return { kind: "paper", done: [] };
  }
}

export interface StepProgress {
  step: RoadmapStep;
  n: number;
  of: number;
}

/** The reader's roadmap: chosen kind, its route, ticked checks, and the next step to work on. */
export function useRoadmap() {
  const raw = useSyncExternalStore(subscribe, read, () => "");
  const saved = useMemo(() => parse(raw), [raw]);
  const route = useMemo(() => stepsFor(saved.kind), [saved.kind]);
  const checks = useMemo(() => allChecks(saved.kind), [saved.kind]);
  const done = useMemo(() => new Set(saved.done.filter((d) => checks.includes(d))), [saved.done, checks]);
  const steps: StepProgress[] = useMemo(
    () =>
      route.map((step) => {
        const list = checksOf(step, saved.kind);
        return { step, n: list.filter((c) => done.has(`${step.id}:${c.id}`)).length, of: list.length };
      }),
    [route, saved.kind, done],
  );
  const next = steps.find((s) => s.n < s.of) ?? null;
  return {
    kind: saved.kind,
    done,
    steps,
    next,
    count: done.size,
    total: checks.length,
    setKind: (kind: RoadmapKind) => write({ ...saved, kind }),
    toggle: (key: string) => write({ ...saved, done: done.has(key) ? saved.done.filter((d) => d !== key) : [...saved.done, key] }),
    reset: () => write({ kind: saved.kind, done: [] }),
  };
}

/** One segment per step on the route, each filling with that step's share of checks done. */
export function RouteBar({ steps, className }: { steps: StepProgress[]; className?: string }) {
  return (
    <span aria-hidden className={cn("flex gap-1", className)}>
      {steps.map(({ step, n, of }) => (
        <span key={step.id} className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15">
          <span className="block h-full origin-left rounded-full bg-signal-orange transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none" style={{ transform: `scaleX(${of ? n / of : 0})` }} />
        </span>
      ))}
    </span>
  );
}

/** The five kinds as a row of choices; the route and its checks follow the one picked. */
export function KindPicker({ kind, setKind, name, className }: { kind: RoadmapKind; setKind: (k: RoadmapKind) => void; name: string; className?: string }) {
  return (
    <div role="radiogroup" aria-label="What are you writing?" className={cn("flex flex-wrap gap-2", className)}>
      {(Object.keys(ROADMAP_KINDS) as RoadmapKind[]).map((k) => {
        const on = kind === k;
        return (
          <label
            key={k}
            className={cn(
              "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl px-3.5 text-sm font-semibold ring-1 ring-inset transition-[background-color,color,box-shadow] duration-300 has-focus-visible:ring-2 has-focus-visible:ring-white motion-reduce:transition-none",
              on ? "bg-signal-orange text-text-primary ring-signal-orange" : "text-white ring-white/25 hover:ring-signal-orange",
            )}
          >
            <input type="radio" name={name} className="sr-only" checked={on} onChange={() => setKind(k)} />
            <Icon name={ROADMAP_KINDS[k].icon} filled={on} className={cn("text-xl", !on && "text-signal-orange")} />
            {ROADMAP_KINDS[k].label}
          </label>
        );
      })}
    </div>
  );
}

function StandardLinks({ links }: { links: NonNullable<RoadmapStep["links"]> }) {
  return (
    <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
      {links.map((l) => (
        <li key={l.url} className="text-sm font-semibold">
          <a href={l.url} target="_blank" rel="noopener noreferrer" className={cn(LINK, "inline-flex items-center gap-1")}>
            {l.label} <Icon name="open_in_new" className="text-base" />
          </a>
        </li>
      ))}
    </ul>
  );
}

function Tools({ tools }: { tools: NonNullable<RoadmapStep["tools"]> }) {
  return (
    <ul className="mt-3 space-y-1">
      {tools.map((t) => (
        <li key={t.url + t.label}>
          <Link href={t.url} className="group flex items-start gap-2.5 rounded-lg py-1.5 text-sm font-semibold text-white transition-colors hover:text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none">
            <Icon name={t.icon} className="text-xl text-signal-orange" />
            <span className="underline decoration-white/25 underline-offset-4 transition-colors group-hover:decoration-signal-orange">{t.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * /research/workspace/start: start a research paper, thesis, innovation,
 * project or idea and take it, step by step, to the standard international
 * journals and examiners expect, ending with exactly what Genius's upload
 * form asks for. Each step has checks to tick (kept in this browser), the
 * standard reviewers apply with links to the official sources, and the
 * Genius pages that help.
 */
export function RoadmapView() {
  const { kind, done, steps, next, count, total, setKind, toggle, reset } = useRoadmap();
  const finished = total > 0 && count === total;

  return (
    <div className={cn(COLUMN, "py-10 lg:py-14")}>
      <header className="hero-rise max-w-3xl">
        <h1 className={H1}>Start your research, step by step</h1>
        <p className="mt-4 text-lg leading-relaxed text-white/80">
          From a real question to a publication international journals and examiners accept, and on to Genius. Each step lists what to do, names the standard reviewers will hold you to, and points to the Genius pages that help.
        </p>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[20rem_minmax(0,1fr)] lg:items-start">
        <aside aria-label="Your progress" className={cn(PANEL, "p-6 lg:sticky lg:top-[calc(var(--research-top)+1.5rem)] lg:max-h-[calc(100vh-var(--research-top)-3rem)] lg:overflow-y-auto")}>
          <p className="font-grotesk text-sm font-bold text-signal-orange">Your progress</p>
          <p className="mt-1 font-grotesk text-3xl font-bold text-white tabular-nums" aria-live="polite">
            {count} <span className="text-base font-semibold text-white/65">of {total} checks</span>
          </p>
          <RouteBar steps={steps} className="mt-3" />

          <fieldset className="mt-6">
            <legend className="font-grotesk text-sm font-bold text-signal-orange">I am writing</legend>
            <KindPicker kind={kind} setKind={setKind} name="roadmap-kind" className="mt-3" />
            <p className="mt-3 text-xs leading-relaxed text-white/65">{ROADMAP_KINDS[kind].note}</p>
          </fieldset>

          <nav aria-label="Steps" className="mt-6 border-t border-white/12 pt-5">
            <ol className="space-y-0.5">
              {steps.map(({ step, n, of }, i) => {
                const complete = n === of;
                const current = next?.step.id === step.id;
                return (
                  <li key={step.id}>
                    <a href={`#step-${step.id}`} aria-current={current ? "step" : undefined} className={cn("flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors hover:text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none", current ? "font-semibold text-white" : "text-white/80")}>
                      <span className={cn("grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold tabular-nums", complete ? "bg-signal-orange text-text-primary" : current ? "text-signal-orange ring-2 ring-signal-orange" : "text-white/80 ring-1 ring-white/25")}>
                        {complete ? <Icon name="check" className="text-base" /> : i + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{step.title}</span>
                    </a>
                  </li>
                );
              })}
            </ol>
          </nav>
          {count > 0 && (
            <button type="button" onClick={reset} className="mt-5 inline-flex items-center gap-1.5 rounded-md text-sm font-semibold text-white/65 transition-colors hover:text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none">
              <Icon name="restart_alt" className="text-lg" /> Clear my ticks
            </button>
          )}
          <p className="mt-4 text-xs leading-relaxed text-white/65">Your ticks are kept in this browser only.</p>
        </aside>

        <div className="min-w-0">
          <ol className="space-y-6">
            {steps.map(({ step: s, n, of }, i) => {
              const list = checksOf(s, kind);
              const complete = n === of;
              const current = next?.step.id === s.id;
              return (
                <li key={s.id} id={`step-${s.id}`} className="story-reveal">
                  <article aria-labelledby={`step-${s.id}-title`} className={cn(PANEL, "p-6 transition-shadow duration-500 sm:p-8", current && "ring-2 ring-signal-orange")}>
                    <header className="flex items-start gap-4">
                      <span aria-hidden className={cn("grid size-12 shrink-0 place-items-center rounded-2xl font-grotesk text-lg font-bold tabular-nums", complete ? "bg-signal-orange text-text-primary" : current ? "bg-signal-orange text-text-primary" : "bg-black/30 text-signal-orange ring-1 ring-white/15 ring-inset")}>
                        {complete ? <Icon name="check" className="text-2xl" /> : i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-x-1.5 text-xs font-semibold text-bdnavy-300">
                          <Icon name={s.icon} className="text-base" /> Step {i + 1} of {steps.length} · {n} of {of} done
                        </p>
                        <h2 id={`step-${s.id}-title`} className={cn(TITLE, "mt-1 text-xl leading-snug sm:text-2xl")}>{s.title}</h2>
                        <p className="mt-2 text-base leading-relaxed text-white/80">{s.goal}</p>
                      </div>
                    </header>

                    <ul className="mt-6 space-y-1">
                      {list.map((c) => {
                        const key = `${s.id}:${c.id}`;
                        const on = done.has(key);
                        return (
                          <li key={key}>
                            <label className="flex cursor-pointer items-start gap-3 rounded-xl px-2 py-2 text-sm leading-relaxed transition-colors hover:bg-black/20 has-focus-visible:ring-2 has-focus-visible:ring-signal-orange">
                              <input type="checkbox" checked={on} onChange={() => toggle(key)} className="mt-0.5 size-4.5 shrink-0 accent-signal-orange" />
                              <span className={cn("transition-colors", on ? "text-white/65 line-through decoration-white/30" : "text-white/80")}>{c.text}</span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>

                    <div className={cn("mt-6 grid gap-6 border-t border-white/12 pt-5", s.tools && "md:grid-cols-[minmax(0,1fr)_16rem]")}>
                      <div>
                        <p className="flex items-center gap-1.5 font-grotesk text-sm font-bold text-signal-orange">
                          <Icon name="workspace_premium" className="text-lg" /> The standard
                        </p>
                        <p className="mt-2 max-w-[70ch] text-sm leading-relaxed text-white/80">{s.standard}</p>
                        {s.links && <StandardLinks links={s.links} />}
                      </div>
                      {s.tools && (
                        <div className="md:border-l md:border-white/12 md:pl-6">
                          <p className="flex items-center gap-1.5 font-grotesk text-sm font-bold text-signal-orange">
                            <Icon name="auto_awesome" className="text-lg" /> On Genius
                          </p>
                          <Tools tools={s.tools} />
                        </div>
                      )}
                    </div>
                  </article>
                </li>
              );
            })}
          </ol>

          <section aria-labelledby="ready-title" className={cn(PANEL_COBALT, "story-reveal mt-8 flex flex-col gap-6 p-6 sm:p-8 md:flex-row md:items-center md:justify-between")}>
            <div className="max-w-xl">
              <h2 id="ready-title" className={cn(TITLE, "text-2xl")}>{finished ? "Every check is done" : "Ready to publish?"}</h2>
              <p className="mt-2 text-base leading-relaxed text-white/80">Upload the work to Genius for review. See how a finished work is laid out in the Save the Crow &amp; Falcon proposal.</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Link href="/research/submit" className={BTN_GOLD}><Icon name="upload" className="text-xl" /> Upload research</Link>
              <Link href={articleHref({ slug: "save-the-crow-and-falcon" })} className={BTN}>See an example</Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
