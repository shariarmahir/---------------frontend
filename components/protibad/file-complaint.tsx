"use client";

import { useState, useSyncExternalStore } from "react";
import { openRecorder } from "@/components/record/open-recorder";
import { Icon } from "@/components/ui/icon";
import { SectionHeading, btn } from "@/components/ui/section-kit";
import { complaintCategories, type ComplaintCategory } from "@/data/complaints";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "kandari.complaints";
const MAX_CHARS = 1200;

/** Dark field in the landing page's language: black well, faint ring, gold focus. */
const FIELD =
  "w-full rounded-xl bg-black px-3.5 font-sans text-base text-white ring-1 ring-white/15 outline-none placeholder:text-white/40 transition-[box-shadow] duration-200 focus:ring-2 focus:ring-signal-orange";
const LABEL = "font-sans text-sm font-semibold text-white/85";
const LEGEND = "mb-4 flex items-center gap-3 font-grotesk text-lg font-bold text-signal-orange";
const STEP = "grid size-8 place-items-center rounded-lg bg-signal-orange font-grotesk text-sm text-text-primary";

interface Draft {
  category: ComplaintCategory;
  title: string;
  district: string;
  where: string;
  when: string;
  body: string;
  anonymous: boolean;
  contact: string;
  at: string;
}

/*
 * Saved drafts live in this browser only. A tiny store over localStorage so
 * the list re-renders after a save or a delete, with a snapshot that stays
 * the same between changes (useSyncExternalStore loops otherwise).
 */
const listeners = new Set<() => void>();
let cache: Draft[] | null = null;
const EMPTY: Draft[] = [];

function read(): Draft[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Draft[]) : [];
  } catch {
    return [];
  }
}
function write(all: Draft[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // Private mode or blocked storage: the note beside the form already says nothing was sent.
  }
  cache = all;
  listeners.forEach((fn) => fn());
}
const store = {
  subscribe: (fn: () => void) => (listeners.add(fn), () => void listeners.delete(fn)),
  get: () => (cache ??= read()),
  server: () => EMPTY,
};

/** The complaint as plain text, laid out the way an officer reads it, with the office named in both languages. */
function asText(d: Omit<Draft, "at">): string {
  const cat = complaintCategories.find((c) => c.id === d.category);
  return [
    cat ? `To: ${cat.routesTo.authority} (${cat.routesTo.authorityBn})` : "",
    `Subject: ${cat?.label ?? ""}: ${d.title}`,
    d.district || d.where ? `Place: ${[d.where, d.district].filter(Boolean).join(", ")}` : "",
    d.when ? `When: ${d.when}` : "",
    "",
    d.body,
    "",
    d.anonymous ? "Complainant: wishes to stay anonymous" : d.contact ? `Contact: ${d.contact}` : "",
  ]
    .filter((line, i, all) => line || (i > 0 && all[i - 1]))
    .join("\n")
    .trim();
}

/**
 * Write the complaint (Mahir, 2026-10-29: rebuilt in the landing page's
 * dress). Three steps, in order: what happened, the details, how it should
 * appear. Choosing a kind names the office that handles it, beside the form,
 * since most complaints go to the wrong office. The finished text can be
 * copied for that office, and evidence recorded straight away with the
 * site's recorder. Drafts stay in this browser; the page says plainly that
 * nothing is sent, because someone reporting extortion must not believe the
 * police were told when nobody was.
 *
 * TODO(backend): POST /api/v1/complaints, then real delivery to the office.
 */
export function FileComplaint() {
  const [category, setCategory] = useState<ComplaintCategory>("chadabaji");
  const [title, setTitle] = useState("");
  const [district, setDistrict] = useState("");
  const [where, setWhere] = useState("");
  const [when, setWhen] = useState("");
  const [body, setBody] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [contact, setContact] = useState("");
  const [note, setNote] = useState<"saved" | "copied" | null>(null);
  const drafts = useSyncExternalStore(store.subscribe, store.get, store.server);

  const meta = complaintCategories.find((c) => c.id === category) ?? complaintCategories[0];
  const ready = title.trim().length > 3 && body.trim().length > 20;
  const current = {
    category,
    title: title.trim(),
    district: district.trim(),
    where: where.trim(),
    when: when.trim(),
    body: body.trim(),
    anonymous,
    contact: anonymous ? "" : contact.trim(),
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    write([{ ...current, at: new Date().toISOString() }, ...store.get()]);
    setNote("saved");
    setTitle("");
    setWhere("");
    setWhen("");
    setBody("");
  };
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setNote("copied");
    } catch {
      setNote(null);
    }
  };

  return (
    <section id="file-complaint" aria-labelledby="file-title" className="section-band w-full scroll-mt-40 bg-black">
      <div className="mx-auto max-w-384 px-gutter-x">
        <SectionHeading
          tone="dark"
          title={<span id="file-title">File a complaint</span>}
          lead="Pick what happened and see which office handles it. Write it once, then copy it to that office."
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <form onSubmit={save} className="story-reveal flex flex-col gap-7 rounded-3xl bg-bdnavy-900 p-5 ring-1 ring-white/12 ring-inset sm:p-7">
            <fieldset>
              <legend className={LEGEND}>
                <span className={STEP}>1</span>
                What kind of problem is it?
              </legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
                {complaintCategories.map((c) => {
                  const on = category === c.id;
                  return (
                    <label
                      key={c.id}
                      className={cn(
                        "relative flex cursor-pointer flex-col gap-2 rounded-2xl p-3 [-webkit-tap-highlight-color:transparent] transition-[translate,opacity,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] has-focus-visible:ring-2 has-focus-visible:ring-white motion-reduce:transition-none",
                        c.chip,
                        on
                          ? "-translate-y-1 opacity-100 shadow-[0_18px_30px_-16px_rgb(0_0_0/0.9)] ring-2! ring-signal-orange!"
                          : "opacity-80 hover:-translate-y-0.5 hover:opacity-100",
                      )}
                    >
                      <input type="radio" name="category" value={c.id} checked={on} onChange={() => setCategory(c.id)} className="sr-only" />
                      <span className="flex items-center justify-between gap-1">
                        <Icon name={c.icon} className="text-2xl" />
                        {on ? (
                          <Icon name="check_circle" filled className="text-xl text-signal-orange" />
                        ) : c.urgent ? (
                          <span className="rounded-md bg-black/30 px-1.5 font-sans text-xs font-bold text-signal-orange">999</span>
                        ) : null}
                      </span>
                      <span className="font-sans text-sm leading-tight font-bold">{c.label}</span>
                      <span className="font-bengali text-xs text-white/65">{c.labelBn}</span>
                    </label>
                  );
                })}
              </div>
              <p className="mt-3 font-sans text-sm leading-snug text-white/70">{meta.describes}</p>
            </fieldset>

            <div className="border-t border-white/10 pt-6">
              <fieldset className="flex flex-col gap-4">
                <legend className={LEGEND}>
                  <span className={STEP}>2</span>
                  What happened?
                </legend>
                <label className="flex flex-col gap-1.5">
                  <span className={LABEL}>
                    Summary in one line <span className="text-signal-orange">*</span>
                  </span>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    maxLength={120}
                    placeholder="Who is doing what, and to whom"
                    className={cn(FIELD, "h-12")}
                  />
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <label className="flex flex-col gap-1.5">
                    <span className={LABEL}>District</span>
                    <input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="For example, Dhaka" className={cn(FIELD, "h-12")} />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className={LABEL}>Place</span>
                    <input value={where} onChange={(e) => setWhere(e.target.value)} placeholder="Area, market or office" className={cn(FIELD, "h-12")} />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className={LABEL}>When</span>
                    <input value={when} onChange={(e) => setWhen(e.target.value)} placeholder="A date, or still going on" className={cn(FIELD, "h-12")} />
                  </label>
                </div>
                <label className="flex flex-col gap-1.5">
                  <span className={cn(LABEL, "flex items-center justify-between")}>
                    <span>
                      What happened, in full <span className="text-signal-orange">*</span>
                    </span>
                    <span className={cn("font-sans text-xs tabular-nums", body.length > MAX_CHARS - 100 ? "text-signal-orange" : "text-white/65")}>
                      {body.length} / {MAX_CHARS}
                    </span>
                  </span>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value.slice(0, MAX_CHARS))}
                    required
                    rows={6}
                    placeholder="Who was involved, what was demanded or done, what you have already tried, and any papers or proof you hold. Write only what you can back up."
                    className={cn(FIELD, "py-3 leading-relaxed")}
                  />
                  <span aria-hidden className="h-1 overflow-hidden rounded-full bg-white/10">
                    <span
                      className="block h-full rounded-full bg-signal-orange transition-[width] duration-200"
                      style={{
                        width: `${Math.min(100, (body.length / MAX_CHARS) * 100)}%`,
                      }}
                    />
                  </span>
                </label>
                <button
                  type="button"
                  onClick={openRecorder}
                  className="inline-flex min-h-11 w-fit items-center gap-2 rounded-xl px-4 font-sans text-sm font-semibold text-white ring-1 ring-white/20 transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
                >
                  <Icon name="mic" className="text-lg text-signal-orange" />
                  Record photo, video or audio as evidence
                </button>
              </fieldset>
            </div>

            <div className="border-t border-white/10 pt-6">
              <fieldset className="flex flex-col gap-3">
                <legend className={LEGEND}>
                  <span className={STEP}>3</span>
                  Should your name show?
                </legend>
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-black/40 p-4 ring-1 ring-white/12 has-focus-visible:ring-2 has-focus-visible:ring-signal-orange">
                  <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="sr-only" />
                  <span
                    aria-hidden
                    className={cn(
                      "relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
                      anonymous ? "bg-signal-orange" : "bg-white/20",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 left-0.5 size-5 rounded-full bg-bdnavy-900 transition-[translate] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
                        anonymous && "translate-x-5",
                      )}
                    />
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span className="font-sans text-base font-bold text-white">Keep my name hidden</span>
                    <span className="font-sans text-sm leading-snug text-white/65">
                      Usually the safer choice when reporting extortion or someone with power.
                    </span>
                  </span>
                </label>
                {!anonymous && (
                  <label className="flex flex-col gap-1.5">
                    <span className={LABEL}>Contact</span>
                    <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Phone or email" className={cn(FIELD, "h-12")} />
                  </label>
                )}
              </fieldset>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-6">
              <button
                type="submit"
                disabled={!ready}
                className={cn(btn.gold, "disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/45 disabled:shadow-none")}
              >
                <Icon name="save" className="text-xl" />
                Save draft
              </button>
              <button
                type="button"
                disabled={!ready}
                onClick={() => copy(asText(current))}
                className={cn(
                  btn.goldOutline,
                  "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-signal-orange",
                )}
              >
                <Icon name="content_copy" className="text-xl" />
                Copy complaint
              </button>
            </div>
            {note && (
              <p role="status" className="live-in flex items-start gap-2 rounded-2xl bg-cobalt p-4 font-sans text-sm leading-relaxed text-white">
                <Icon name={note === "copied" ? "content_paste" : "edit_note"} className="mt-0.5 shrink-0 text-lg" />
                {note === "copied" ? (
                  <span>Copied. Paste it into a letter or an email to {meta.routesTo.authority}.</span>
                ) : (
                  <span>
                    Draft saved on this device. It has <strong>not been sent</strong> anywhere: Kandari cannot deliver complaints to any office yet.
                  </span>
                )}
              </p>
            )}
          </form>

          <aside className="flex flex-col gap-4 lg:sticky lg:top-44 lg:self-start">
            <div key={meta.id} className="live-in flex flex-col gap-3 rounded-3xl bg-cobalt p-5 text-white">
              <span className="font-sans text-sm font-semibold text-white/80">Where to take it</span>
              <span className="font-grotesk text-2xl leading-snug font-bold text-signal-orange">{meta.routesTo.authority}</span>
              <span className="font-bengali text-sm text-white/80">{meta.routesTo.authorityBn}</span>
              <p className="border-t border-white/20 pt-3 font-sans text-sm leading-relaxed text-white/85">{meta.routesTo.remit}</p>
              {meta.urgent && (
                <a href="tel:999" className={btn.gold}>
                  <Icon name="call" className="text-xl" />
                  In danger now? Call 999
                </a>
              )}
            </div>

            <div className="flex flex-col gap-3 rounded-3xl bg-text-primary p-5 ring-1 ring-white/12 ring-inset">
              <span className="flex items-center gap-2 font-grotesk text-base font-bold text-white">
                <Icon name="folder_open" className="text-xl text-signal-orange" />
                Drafts on this device
              </span>
              {drafts.length ? (
                <ul className="flex flex-col divide-y divide-white/10">
                  {drafts.slice(0, 5).map((d) => {
                    const cat = complaintCategories.find((c) => c.id === d.category);
                    return (
                      <li key={d.at} className="flex items-center gap-2 py-2.5">
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-sans text-sm font-semibold text-white">{d.title}</span>
                          <span className="font-sans text-xs text-white/65">
                            {cat?.label}, {new Date(d.at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                          </span>
                        </span>
                        <button
                          type="button"
                          aria-label="Copy this draft"
                          onClick={() => copy(asText(d))}
                          className="grid size-10 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
                        >
                          <Icon name="content_copy" className="text-lg" />
                        </button>
                        <button
                          type="button"
                          aria-label="Delete this draft"
                          onClick={() => write(store.get().filter((x) => x.at !== d.at))}
                          className="grid size-10 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
                        >
                          <Icon name="delete" className="text-lg" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="font-sans text-sm text-white/65">No drafts yet. Saved drafts stay in this browser only.</p>
              )}
              <p className="border-t border-white/10 pt-3 font-sans text-xs leading-relaxed text-white/65">
                Nothing saved here reaches a police station or a ministry. Prepare it here, then take it in person, through the office&apos;s own channel, or by
                helpline.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
