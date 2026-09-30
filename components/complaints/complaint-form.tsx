"use client";

import { useState, useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/ui/section-kit";
import { complaintCategories, type ComplaintCategory } from "@/data/complaints";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "kandari.complaints";

/** Dark field in the home page's language: black well, faint ring, gold focus. */
const FIELD =
  "rounded-xl bg-black px-3 font-sans text-body-sm text-white ring-1 ring-white/15 outline-none placeholder:text-white/40 transition-[box-shadow] duration-200 focus:ring-2 focus:ring-signal-orange";
const LABEL = "font-sans text-[0.8125rem] font-semibold text-white/85";
const LEGEND = "mb-3 flex items-center gap-2 font-grotesk text-base font-bold text-signal-orange uppercase";
const MAX_CHARS = 1200;

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

function readDrafts(): Draft[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Draft[]) : [];
  } catch {
    // Private mode, cleared site data, or a blocked accessor.
    return [];
  }
}

/**
 * Tiny store over the saved-draft count.
 *
 * `useSyncExternalStore` needs a real subscription to re-render after a
 * save, and a snapshot that is stable between notifications — returning a
 * fresh read on every call would look like a store that never settles and
 * loop. The cached count is recomputed only when `notify` says it changed.
 */
const listeners = new Set<() => void>();
let cachedCount: number | null = null;

function subscribeCount(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function getCount(): number {
  if (cachedCount === null) cachedCount = readDrafts().length;
  return cachedCount;
}

/** Server has no localStorage, so the count is absent until hydration. */
function getServerCount(): null {
  return null;
}

function notifyCountChanged() {
  cachedCount = readDrafts().length;
  for (const fn of listeners) fn();
}

/**
 * The complaint form.
 *
 * Two things make this useful before any backend exists. First, choosing a
 * category immediately names the authority that actually handles that kind
 * of complaint — most people send theirs to the wrong office. Second, the
 * fields are the ones an authority will ask for, so what gets written here
 * is complete enough to hand over.
 *
 * Saves to localStorage only. The UI says so, plainly and more than once:
 * someone reporting extortion must not believe police were notified when
 * nobody was.
 *
 * TODO(backend): POST /api/v1/complaints, then real delivery to the mapped
 * department and a filed/acknowledged status from the server.
 */
export function ComplaintForm() {
  const [category, setCategory] = useState<ComplaintCategory>("chadabaji");
  const [title, setTitle] = useState("");
  const [district, setDistrict] = useState("");
  const [where, setWhere] = useState("");
  const [when, setWhen] = useState("");
  const [body, setBody] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [contact, setContact] = useState("");
  const [saved, setSaved] = useState(false);

  // localStorage is external state the server cannot see, so the server
  // snapshot is null and the count appears only after hydration.
  const count = useSyncExternalStore(subscribeCount, getCount, getServerCount);

  const meta =
    complaintCategories.find((c) => c.id === category) ??
    complaintCategories[0];

  const canSubmit = title.trim().length > 3 && body.trim().length > 20;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    const draft: Draft = {
      category,
      title: title.trim(),
      district: district.trim(),
      where: where.trim(),
      when: when.trim(),
      body: body.trim(),
      anonymous,
      contact: anonymous ? "" : contact.trim(),
      at: new Date().toISOString(),
    };
    try {
      const all = [draft, ...readDrafts()];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      notifyCountChanged();
    } catch {
      // Storage unavailable; the confirmation below still explains that
      // nothing was sent, which remains true.
    }
    setSaved(true);
    setTitle("");
    setWhere("");
    setWhen("");
    setBody("");
  }

  return (
    <section id="file-complaint" aria-labelledby="file-title" className="section-band w-full scroll-mt-40 bg-black">
      <div className="mx-auto max-w-7xl px-gutter-x">
        <SectionHeading
          tone="dark"
          kicker="অভিযোগ দাখিল"
          title={<span id="file-title">File a complaint</span>}
          lead="Choose what happened. The centre names the authority that handles it and what they can do about it."
        />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <form onSubmit={submit} className="story-reveal flex flex-col gap-6 rounded-3xl bg-text-primary p-5 text-white ring-1 ring-white/12 sm:p-7">
            {/* Category picker — solid colour tiles; the chosen one lifts and rings white. */}
            <fieldset>
              <legend className={LEGEND}>
                <span className="grid size-7 place-items-center rounded-lg bg-signal-orange text-sm text-text-primary">1</span>
                What kind of problem is it?
              </legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {complaintCategories.map((c) => {
                  const on = category === c.id;
                  return (
                    <label
                      key={c.id}
                      className={cn(
                        "relative flex cursor-pointer flex-col gap-2 rounded-2xl p-3 [-webkit-tap-highlight-color:transparent] transition-[translate,scale,box-shadow,opacity] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.96] has-focus-visible:ring-2 has-focus-visible:ring-white motion-reduce:transition-none",
                        c.chip,
                        on ? "-translate-y-1 opacity-100 shadow-[0_18px_30px_-16px_rgb(0_0_0/0.9)] ring-2 ring-white" : "opacity-75 hover:-translate-y-0.5 hover:opacity-100",
                      )}
                    >
                      <input type="radio" name="category" value={c.id} checked={on} onChange={() => setCategory(c.id)} className="sr-only" />
                      <span className="flex items-center justify-between gap-1">
                        <Icon name={c.icon} className="text-[22px]" />
                        {on ? (
                          <Icon name="check_circle" filled className="text-[18px]" />
                        ) : c.urgent ? (
                          <span className="rounded-md bg-black/25 px-1.5 py-px font-mono text-[10px] font-bold">999</span>
                        ) : null}
                      </span>
                      <span className="font-bengali text-sm leading-tight font-bold">{c.labelBn}</span>
                      <span className="font-sans text-[11px] leading-snug opacity-85 max-sm:hidden">{c.label}</span>
                    </label>
                  );
                })}
              </div>
              <p className="mt-3 font-sans text-[0.8125rem] leading-snug text-white/75">{meta.describes}</p>
            </fieldset>

            {/* Details. */}
            <fieldset className="flex flex-col gap-3 border-t border-white/12 pt-6">
              <legend className={LEGEND}>
                <span className="grid size-7 place-items-center rounded-lg bg-signal-orange text-sm text-text-primary">2</span>
                What happened?
              </legend>

              <label className="flex flex-col gap-1.5">
                <span className={LABEL}>
                  Summary <span className="text-crimson-bright">*</span>
                </span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={120}
                  placeholder="One line — what is being done, and to whom"
                  className={cn(FIELD, "h-11")}
                />
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <label className="flex flex-col gap-1.5">
                  <span className={LABEL}>District</span>
                  <input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="e.g. Dhaka" className={cn(FIELD, "h-11")} />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={LABEL}>Place</span>
                  <input value={where} onChange={(e) => setWhere(e.target.value)} placeholder="Area, market, office" className={cn(FIELD, "h-11")} />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={LABEL}>When</span>
                  <input value={when} onChange={(e) => setWhen(e.target.value)} placeholder="Date or 'ongoing'" className={cn(FIELD, "h-11")} />
                </label>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className={cn(LABEL, "flex items-center justify-between")}>
                  <span>
                    Full account <span className="text-crimson-bright">*</span>
                  </span>
                  <span className={cn("font-mono text-[0.75rem]", body.length > MAX_CHARS - 100 ? "text-crimson-bright" : "text-white/60")}>
                    {body.length} / {MAX_CHARS}
                  </span>
                </span>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value.slice(0, MAX_CHARS))}
                  required
                  rows={6}
                  placeholder="Who was involved, what was demanded or done, what you have already tried, and any documents you hold. Stick to facts you can support."
                  className={cn(FIELD, "py-3 leading-relaxed")}
                />
                <span aria-hidden className="h-1 overflow-hidden rounded-full bg-white/10">
                  <span
                    className="block h-full rounded-full bg-signal-orange transition-[width] duration-200"
                    style={{ width: `${Math.min(100, (body.length / MAX_CHARS) * 100)}%` }}
                  />
                </span>
              </label>
            </fieldset>

            {/* Identity. */}
            <fieldset className="flex flex-col gap-3 border-t border-white/12 pt-6">
              <legend className={LEGEND}>
                <span className="grid size-7 place-items-center rounded-lg bg-signal-orange text-sm text-text-primary">3</span>
                How should this appear?
              </legend>
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-black p-3 ring-1 ring-white/12 has-focus-visible:ring-2 has-focus-visible:ring-signal-orange">
                <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="sr-only" />
                <span aria-hidden className={cn("relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors duration-200", anonymous ? "bg-signal-orange" : "bg-white/20")}>
                  <span
                    className={cn(
                      "absolute top-0.5 left-0.5 size-5 rounded-full bg-text-primary transition-[translate] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
                      anonymous && "translate-x-5",
                    )}
                  />
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="font-sans text-[0.875rem] font-bold text-white">File anonymously</span>
                  <span className="font-sans text-[0.75rem] leading-snug text-white/70">
                    Your name is not shown in the public feed. Anonymity is usually the safer choice when reporting extortion or someone in
                    authority.
                  </span>
                </span>
              </label>

              {!anonymous ? (
                <label className="flex flex-col gap-1.5">
                  <span className={LABEL}>Contact for follow-up</span>
                  <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Phone or email" className={cn(FIELD, "h-11")} />
                </label>
              ) : null}
            </fieldset>

            <div className="flex flex-wrap items-center gap-3 border-t border-white/12 pt-6">
              <button
                type="submit"
                disabled={!canSubmit}
                className={cn(
                  "inline-flex h-12 items-center gap-2 rounded-xl px-6 font-grotesk text-sm font-bold uppercase [-webkit-tap-highlight-color:transparent] transition-[translate,scale,box-shadow,background-color] duration-200 active:scale-95",
                  canSubmit ? "bg-national-crimson text-white shadow-red-glow hover:-translate-y-0.5" : "cursor-not-allowed bg-white/10 text-white/45",
                )}
              >
                <Icon name="save" className="text-[18px]" />
                Save complaint
              </button>
              <span className="font-sans text-[0.75rem] text-white/65">Saved on this device only — see the note beside the form.</span>
            </div>

            {saved ? (
              <p role="status" className="live-in flex items-start gap-2 rounded-2xl bg-signal-orange p-4 font-sans text-[0.8125rem] leading-relaxed text-text-primary">
                <Icon name="edit_note" className="mt-px shrink-0 text-[18px]" />
                <span>
                  <strong>Saved as a draft on this device.</strong> It has <strong>not</strong> been sent to {meta.routesTo.authority} —
                  Kandari has no delivery channel yet. Take the text above to the authority named beside the form, or call the helpline for
                  anything urgent.
                </span>
              </p>
            ) : null}
          </form>

          {/* Routing panel — re-keyed on the category so each change snaps in. */}
          <aside className="flex flex-col gap-4 lg:sticky lg:top-44 lg:self-start">
            <div key={meta.id} className="live-in flex flex-col gap-3 rounded-3xl bg-bd-green p-5 text-white shadow-[0_24px_44px_-26px_var(--color-bd-green)]">
              <span className="font-mono text-[11px] font-bold tracking-widest text-signal-orange uppercase">Routes to</span>
              <span className={cn("flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 font-sans text-xs font-bold", meta.chip)}>
                <Icon name={meta.icon} className="text-[14px]" />
                {meta.label}
              </span>
              <span className="font-grotesk text-xl leading-snug font-bold">{meta.routesTo.authority}</span>
              <span className="font-bengali text-sm text-white/85">{meta.routesTo.authorityBn}</span>
              <p className="border-t border-white/20 pt-3 font-sans text-[0.8125rem] leading-relaxed text-white/90">{meta.routesTo.remit}</p>
              {meta.urgent ? (
                <a
                  href="tel:999"
                  className="mt-1 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-national-crimson px-4 font-grotesk text-sm font-bold text-white uppercase shadow-red-glow [-webkit-tap-highlight-color:transparent] transition-[scale] duration-150 active:scale-95"
                >
                  <Icon name="emergency" className="text-[18px]" filled />
                  Call 999 now
                </a>
              ) : null}
            </div>

            <div className="flex flex-col gap-2 rounded-3xl bg-signal-orange p-5 text-text-primary">
              <span className="flex items-center gap-1.5 font-grotesk text-sm font-bold uppercase">
                <Icon name="warning" className="text-[18px]" filled />
                Before you rely on this
              </span>
              <p className="font-sans text-[0.8125rem] leading-relaxed">
                Complaints saved here stay in this browser. Kandari cannot yet deliver them to any police station or ministry. Use this to
                prepare and keep a record — then file it in person, through the authority&apos;s own channel, or by calling the helpline.
              </p>
              {count !== null && count > 0 ? <span className="font-mono text-[0.75rem] font-bold">{count} saved on this device.</span> : null}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
