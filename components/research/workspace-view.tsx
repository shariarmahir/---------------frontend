"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/lib/auth/client";
import type { Article } from "@/lib/research/core";
import { toBibtex, toRis } from "@/lib/research/export";
import { updateResearch, useLibrary, useResearch } from "@/lib/research/store";
import { cn } from "@/lib/utils";
import { CiteButton, DownloadButton, saveFile } from "./actions";
import { ROADMAP_KINDS } from "@/data/research/roadmap";
import { articleHref, BTN, BTN_GOLD, BTN_SOLID, byline, COLUMN, contentHref, Cover, fmtDate, H1, H2, LINK, PANEL, plural, StatusTags, TITLE, TITLE_LINK, TypeLabel } from "./kit";
import { KindPicker, RouteBar, useRoadmap } from "./roadmap";

type Tab = "saved" | "uploads" | "cited";

const TABS: { id: Tab; label: string; icon: string; empty: string }[] = [
  { id: "saved", label: "Saved items", icon: "bookmark", empty: "Nothing saved yet. Use Save on any item to keep it here." },
  { id: "uploads", label: "My uploads", icon: "upload_file", empty: "You have not uploaded any research yet." },
  { id: "cited", label: "Cited", icon: "format_quote", empty: "Items whose citation you copy appear here." },
];

/**
 * The way into the research roadmap, as the Workspace's lead card: a cobalt
 * field that names the five kinds of work (picking one sets the route), a
 * bar with one segment per step, and the next step to work on; on wide
 * screens a navy rail lists the whole route, each step a link into the
 * guide. One button: start, or carry on where the reader stopped.
 */
function StartCard() {
  const { kind, setKind, steps, next, count, total } = useRoadmap();
  const started = count > 0;
  const nextIndex = next ? steps.findIndex((s) => s.step.id === next.step.id) : -1;
  const href = `/research/workspace/start${next ? `#step-${next.step.id}` : ""}`;
  return (
    <section aria-labelledby="start-title" className="hero-rise relative mt-8 grid overflow-hidden rounded-[2rem] bg-cobalt ring-1 ring-white/12 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="p-6 sm:p-10">
        <h2 id="start-title" className={cn(TITLE, "text-2xl leading-tight sm:text-3xl")}>Start a research, thesis, project or idea</h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/80">
          A guided route to the standard international journals and examiners accept: the question, the literature, the design, ethics, data, analysis, the write-up and integrity, then exactly what the Genius upload form asks for, and peer review.
        </p>

        <fieldset className="mt-7">
          <legend className="text-sm font-semibold text-white">What are you writing?</legend>
          <KindPicker kind={kind} setKind={setKind} name="start-kind" className="mt-3" />
          <p className="mt-3 text-sm text-white/80">{ROADMAP_KINDS[kind].note}</p>
        </fieldset>

        <div className="mt-7 max-w-xl">
          <RouteBar steps={steps} />
          <p className="mt-3 flex flex-wrap items-baseline gap-x-2 text-sm text-white/80" aria-live="polite">
            <span className="font-semibold text-white tabular-nums">{steps.length} steps · {count} of {total} checks done</span>
            {started && next && <span>Next: step {nextIndex + 1}, {next.step.title.toLowerCase()}</span>}
            {started && !next && <span>Every check is done: upload it.</span>}
          </p>
        </div>

        <Link href={started && !next ? "/research/submit" : href} className={cn(BTN_GOLD, "mt-7")}>
          {!started ? "Start step by step" : next ? `Continue at step ${nextIndex + 1}` : "Upload research"} <Icon name="arrow_forward" className="text-xl" />
        </Link>
      </div>

      <nav aria-label="The route" className="hidden border-l border-white/12 bg-bdnavy-900 p-8 lg:block">
        <p className="font-grotesk text-sm font-bold text-signal-orange">The route for {ROADMAP_KINDS[kind].label.toLowerCase()}</p>
        <ol className="relative mt-4 space-y-1 before:absolute before:top-3 before:bottom-3 before:left-3 before:w-px before:bg-white/15">
          {steps.map(({ step, n, of }, i) => {
            const complete = n === of;
            const current = next?.step.id === step.id && started;
            return (
              <li key={step.id} className="relative">
                <Link href={`/research/workspace/start#step-${step.id}`} className={cn("flex items-center gap-3 rounded-lg py-1 pr-2 text-sm transition-colors hover:text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none", current ? "font-semibold text-white" : "text-white/80")}>
                  <span className={cn("relative grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold tabular-nums", complete ? "bg-signal-orange text-text-primary" : current ? "bg-bdnavy-900 text-signal-orange ring-2 ring-signal-orange" : "bg-bdnavy-900 text-white/80 ring-1 ring-white/25")}>
                    {complete ? <Icon name="check" className="text-base" /> : i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{step.title}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>
    </section>
  );
}

/**
 * JSTOR's Workspace: what the reader saved, what they uploaded (with its
 * review status) and what they cited, kept in their Kandari Profile on
 * this browser. Select items to export their citations or remove them.
 */
export function WorkspaceView() {
  const { account, ready } = useAuth();
  const list = useLibrary();
  const saved = useResearch((s) => s.saved);
  const cited = useResearch((s) => s.cited);
  const mine = useResearch((s) => s.mine);
  const [tab, setTab] = useState<Tab>("saved");
  const [picked, setPicked] = useState<string[]>([]);

  if (!ready) return <div className={cn(COLUMN, "py-12")}><div className="h-96 animate-pulse rounded-3xl bg-bdnavy-900 motion-reduce:animate-none" aria-label="Loading" /></div>;

  if (!account) {
    return (
      <div className={cn(COLUMN, "py-14")}>
        <h1 className={cn(H1, "hero-rise")}>Workspace</h1>
        <div className={cn(PANEL, "hero-rise mt-8 max-w-2xl p-8")}>
          <span className="grid size-14 place-items-center rounded-2xl bg-signal-orange text-text-primary"><Icon name="bookmark" filled className="text-3xl" /></span>
          <h2 className={cn(H2, "mt-5 text-2xl sm:text-2xl")}>Log in to use your Workspace</h2>
          <p className="mt-3 text-base leading-relaxed text-white/80">Save items to read later, follow the review of your uploads, and export citations for your reference manager, all from your free Kandari Profile.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/login?next=/research/workspace" className={BTN_SOLID}><Icon name="account_circle" className="text-xl" /> Log in</Link>
            <Link href="/signup" className={BTN}>Register</Link>
          </div>
        </div>
        <StartCard />
      </div>
    );
  }

  const items: Record<Tab, Article[]> = {
    saved: list.filter((a) => saved[a.slug]),
    uploads: list.filter((a) => mine.some((m) => m.slug === a.slug)),
    cited: list.filter((a) => cited[a.slug]),
  };
  const shown = items[tab];
  const chosen = shown.filter((a) => picked.includes(a.slug));
  const exportAs = (kind: "bib" | "ris") => {
    const origin = window.location.origin;
    const text = chosen.map((a) => (kind === "bib" ? toBibtex : toRis)(a, `${origin}/research/${a.slug}`)).join(kind === "bib" ? "\n" : "");
    saveFile(`kandari-workspace.${kind}`, kind === "bib" ? "application/x-bibtex;charset=utf-8" : "application/x-research-info-systems;charset=utf-8", text);
    toast.success(`${plural(chosen.length, "citation")} downloaded`);
  };
  const remove = () => {
    const key = tab === "cited" ? "cited" : "saved";
    updateResearch((s) => {
      const next = { ...s[key] };
      for (const slug of picked) delete next[slug];
      return { ...s, [key]: next };
    });
    toast.success(`${plural(chosen.length, "item")} removed`);
    setPicked([]);
  };

  return (
    <div className={cn(COLUMN, "py-12 lg:py-14")}>
      <h1 className={cn(H1, "hero-rise")}>Workspace</h1>
      <p className="mt-3 text-base text-white/65">Signed in as {account.name}. Your Workspace is kept with your Kandari Profile on this browser.</p>
      <StartCard />
      <div className="mt-8 grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <nav aria-label="Workspace" className={cn(PANEL, "self-start p-2")}>
          <ul>
            {TABS.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => {
                    setTab(t.id);
                    setPicked([]);
                  }}
                  aria-current={tab === t.id ? "page" : undefined}
                  className={cn("flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none", tab === t.id ? "bg-signal-orange text-text-primary" : "text-white/80 hover:bg-bdnavy-700 hover:text-white")}
                >
                  <Icon name={t.icon} filled={tab === t.id} className={cn("text-xl", tab !== t.id && "text-signal-orange")} />
                  <span className="flex-1">{t.label}</span>
                  <span className="tabular-nums">{items[t.id].length}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-2 border-t border-white/12 px-2 pt-4 pb-2">
            <Link href="/research/submit" className={cn(BTN_GOLD, "w-full")}><Icon name="upload" className="text-xl" /> Upload research</Link>
          </div>
        </nav>

        <section aria-label={TABS.find((t) => t.id === tab)!.label} className="min-w-0">
          <div className="flex min-h-14 flex-wrap items-center gap-3 border-y border-white/12 py-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-white">
              <input type="checkbox" className="size-4.5 accent-signal-orange" checked={shown.length > 0 && chosen.length === shown.length} onChange={() => setPicked(chosen.length === shown.length ? [] : shown.map((a) => a.slug))} />
              Select all
            </label>
            <span className="text-sm text-white/65">{chosen.length ? `${plural(chosen.length, "item")} selected` : "No items selected."}</span>
            {chosen.length > 0 && (
              <span className="ml-auto flex flex-wrap gap-2">
                <button type="button" onClick={() => exportAs("bib")} className={BTN}><Icon name="format_quote" className="text-xl" /> BibTeX</button>
                <button type="button" onClick={() => exportAs("ris")} className={BTN}><Icon name="format_quote" className="text-xl" /> RIS</button>
                {tab !== "uploads" && <button type="button" onClick={remove} className={BTN}><Icon name="delete" className="text-xl" /> Remove</button>}
              </span>
            )}
          </div>
          {shown.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-white/20 p-10 text-center">
              <p className={cn(TITLE, "text-xl")}>{TABS.find((t) => t.id === tab)!.empty}</p>
              <Link href={tab === "uploads" ? "/research/submit" : "/research"} className={cn(BTN, "mt-6")}>{tab === "uploads" ? "Upload research" : "Explore the library"}</Link>
            </div>
          ) : (
            <ol className="divide-y divide-white/12">
              {shown.map((a) => (
                <li key={a.slug} className="grid grid-cols-[auto_4.5rem_minmax(0,1fr)] gap-4 py-6">
                  <input type="checkbox" aria-label={`Select ${a.title}`} checked={picked.includes(a.slug)} onChange={() => setPicked(picked.includes(a.slug) ? picked.filter((x) => x !== a.slug) : [...picked, a.slug])} className="mt-1 size-4.5 accent-signal-orange" />
                  <Link href={articleHref(a)} tabIndex={-1} aria-hidden><Cover a={a} mini sizes="72px" className="aspect-3/4 w-full" /></Link>
                  <div className="min-w-0">
                    <TypeLabel a={a} />
                    <Link href={articleHref(a)} className={cn(TITLE_LINK, "mt-1.5 block text-lg leading-snug")}>{a.title}</Link>
                    <p className="mt-1 text-sm text-white/80">{byline(a, 4)}</p>
                    <p className="text-sm text-white/65"><Link href={contentHref(a)} className={cn(LINK, "italic")}>{a.institution}</Link>, {a.year}{tab === "uploads" ? ` · submitted ${fmtDate(a.published)}` : ""}</p>
                    {a.tracking && <p className="text-sm text-white/65">Tracking number: <span className="font-semibold text-white tabular-nums">{a.tracking}</span></p>}
                    <StatusTags a={a} className="mt-2" />
                    <div className="mt-3 flex flex-wrap gap-2">
                      <DownloadButton a={a} look="row" />
                      <CiteButton a={a} look="row" />
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}
