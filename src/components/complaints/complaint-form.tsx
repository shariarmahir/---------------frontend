"use client";

import { useState, useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/icon";
import { complaintCategories, type ComplaintCategory } from "@/data/complaints";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "kandari.complaints";
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
    <section
      id="file-complaint"
      className="w-full border-b border-border bg-slate-50 px-gutter py-space-lg"
    >
      <div className="mx-auto flex max-w-[1440px] flex-col gap-space-lg">
        <div className="flex flex-col gap-space-xs">
          <h2 className="font-display text-headline-md font-extrabold tracking-tight text-slate-900">
            অভিযোগ দাখিল করুন
          </h2>
          <p className="max-w-2xl font-sans text-body-sm leading-relaxed text-slate-600">
            Choose what happened. The centre will tell you which authority
            handles it and what they can do about it.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-space-lg lg:grid-cols-[1fr_20rem]">
          {/* Form. */}
          <form
            onSubmit={submit}
            className="flex flex-col gap-space-md rounded-xl border border-border bg-white p-space-lg"
          >
            {/* Category picker. */}
            <fieldset className="flex flex-col gap-space-sm">
              <legend className="mb-space-xs font-sans text-label-md font-semibold text-slate-900">
                1. What kind of problem is it?
              </legend>
              <div className="grid grid-cols-1 gap-space-xs sm:grid-cols-2">
                {complaintCategories.map((c) => (
                  <label
                    key={c.id}
                    className={cn(
                      "flex cursor-pointer items-start gap-space-sm rounded-lg border p-space-sm transition-colors",
                      category === c.id
                        ? "border-primary bg-emerald-50/60"
                        : "border-border bg-white hover:border-slate-400",
                    )}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={c.id}
                      checked={category === c.id}
                      onChange={() => setCategory(c.id)}
                      className="mt-0.5 size-4 shrink-0 accent-[var(--primary)]"
                    />
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="flex items-center gap-1.5 font-sans text-[0.875rem] font-semibold text-slate-900">
                        <Icon name={c.icon} className="text-[16px]" />
                        {c.label}
                        {c.urgent ? (
                          <span className="rounded-sm bg-red-100 px-1 py-px font-sans text-[0.6875rem] font-bold text-crimson">
                            999
                          </span>
                        ) : null}
                      </span>
                      <span className="font-sans text-[0.75rem] leading-snug text-slate-600">
                        {c.describes}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Details. */}
            <fieldset className="flex flex-col gap-space-sm border-t border-border pt-space-md">
              <legend className="mb-space-xs font-sans text-label-md font-semibold text-slate-900">
                2. What happened?
              </legend>

              <label className="flex flex-col gap-1">
                <span className="font-sans text-[0.8125rem] font-medium text-slate-700">
                  Summary <span className="text-crimson">*</span>
                </span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={120}
                  placeholder="One line — what is being done, and to whom"
                  className="h-10 rounded-lg border border-border bg-white px-space-sm font-sans text-body-sm text-slate-900 outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,103,71,0.12)]"
                />
              </label>

              <div className="grid grid-cols-1 gap-space-sm sm:grid-cols-3">
                <label className="flex flex-col gap-1">
                  <span className="font-sans text-[0.8125rem] font-medium text-slate-700">
                    District
                  </span>
                  <input
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Dhaka"
                    className="h-10 rounded-lg border border-border bg-white px-space-sm font-sans text-body-sm text-slate-900 outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,103,71,0.12)]"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-sans text-[0.8125rem] font-medium text-slate-700">
                    Place
                  </span>
                  <input
                    value={where}
                    onChange={(e) => setWhere(e.target.value)}
                    placeholder="Area, market, office"
                    className="h-10 rounded-lg border border-border bg-white px-space-sm font-sans text-body-sm text-slate-900 outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,103,71,0.12)]"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-sans text-[0.8125rem] font-medium text-slate-700">
                    When
                  </span>
                  <input
                    value={when}
                    onChange={(e) => setWhen(e.target.value)}
                    placeholder="Date or 'ongoing'"
                    className="h-10 rounded-lg border border-border bg-white px-space-sm font-sans text-body-sm text-slate-900 outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,103,71,0.12)]"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1">
                <span className="flex items-center justify-between font-sans text-[0.8125rem] font-medium text-slate-700">
                  <span>
                    Full account <span className="text-crimson">*</span>
                  </span>
                  <span
                    className={cn(
                      "font-sans text-[0.75rem]",
                      body.length > MAX_CHARS - 100
                        ? "text-crimson"
                        : "text-slate-500",
                    )}
                  >
                    {body.length} / {MAX_CHARS}
                  </span>
                </span>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value.slice(0, MAX_CHARS))}
                  required
                  rows={6}
                  placeholder="Who was involved, what was demanded or done, what you have already tried, and any documents you hold. Stick to facts you can support."
                  className="rounded-lg border border-border bg-white p-space-sm font-sans text-body-sm leading-relaxed text-slate-900 outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,103,71,0.12)]"
                />
              </label>
            </fieldset>

            {/* Identity. */}
            <fieldset className="flex flex-col gap-space-sm border-t border-border pt-space-md">
              <legend className="mb-space-xs font-sans text-label-md font-semibold text-slate-900">
                3. How should this appear?
              </legend>
              <label className="flex cursor-pointer items-start gap-space-sm">
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                  className="mt-0.5 size-4 shrink-0 accent-[var(--primary)]"
                />
                <span className="flex flex-col gap-0.5">
                  <span className="font-sans text-[0.875rem] font-semibold text-slate-900">
                    File anonymously
                  </span>
                  <span className="font-sans text-[0.75rem] leading-snug text-slate-600">
                    Your name is not shown in the public feed. Anonymity is
                    usually the safer choice when reporting extortion or someone
                    in authority.
                  </span>
                </span>
              </label>

              {!anonymous ? (
                <label className="flex flex-col gap-1">
                  <span className="font-sans text-[0.8125rem] font-medium text-slate-700">
                    Contact for follow-up
                  </span>
                  <input
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Phone or email"
                    className="h-10 rounded-lg border border-border bg-white px-space-sm font-sans text-body-sm text-slate-900 outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,103,71,0.12)]"
                  />
                </label>
              ) : null}
            </fieldset>

            <div className="flex flex-wrap items-center gap-space-sm border-t border-border pt-space-md">
              <button
                type="submit"
                disabled={!canSubmit}
                className={cn(
                  "inline-flex h-10 items-center gap-space-xs rounded-lg px-space-lg font-sans text-label-md font-bold transition-colors",
                  canSubmit
                    ? "bg-crimson text-white hover:bg-red-700"
                    : "cursor-not-allowed bg-slate-200 text-slate-500",
                )}
              >
                <Icon name="save" className="text-[18px]" />
                Save complaint
              </button>
              <span className="font-sans text-[0.75rem] text-slate-500">
                Saved on this device only — see the note on the right.
              </span>
            </div>

            {saved ? (
              <p
                role="status"
                className="flex items-start gap-space-xs rounded-lg border border-amber-300 bg-amber-50 p-space-sm font-sans text-[0.8125rem] leading-relaxed text-amber-900"
              >
                <Icon name="edit_note" className="mt-px shrink-0 text-[16px]" />
                <span>
                  <strong>Saved as a draft on this device.</strong> It has{" "}
                  <strong>not</strong> been sent to {meta.routesTo.authority} —
                  Kandari has no delivery channel yet. Take the text above to
                  the authority named on the right, or call the helpline for
                  anything urgent.
                </span>
              </p>
            ) : null}
          </form>

          {/* Routing panel. */}
          <aside className="flex flex-col gap-space-md">
            <div className="flex flex-col gap-space-sm rounded-xl border border-border bg-white p-space-md">
              <span className="font-sans text-[0.75rem] font-semibold tracking-wider text-slate-500 uppercase">
                Routes to
              </span>
              <span
                className={cn(
                  "flex w-fit items-center gap-1.5 rounded-sm border px-1.5 py-0.5 font-sans text-[0.6875rem] font-semibold",
                  meta.chip,
                )}
              >
                <Icon name={meta.icon} className="text-[12px]" />
                {meta.label}
              </span>
              <span className="font-display text-[1.0625rem] leading-snug font-bold text-slate-900">
                {meta.routesTo.authority}
              </span>
              <span className="font-sans text-[0.8125rem] text-slate-600">
                {meta.routesTo.authorityBn}
              </span>
              <p className="border-t border-border pt-space-sm font-sans text-[0.8125rem] leading-relaxed text-slate-600">
                {meta.routesTo.remit}
              </p>
              {meta.urgent ? (
                <a
                  href="tel:999"
                  className="mt-space-xs inline-flex h-10 items-center justify-center gap-space-xs rounded-lg bg-crimson px-space-md font-sans text-label-md font-bold text-white transition-colors hover:bg-red-700"
                >
                  <Icon name="emergency" className="text-[18px]" filled />
                  Call 999 now
                </a>
              ) : null}
            </div>

            <div className="flex flex-col gap-space-xs rounded-xl border border-amber-300 bg-amber-50 p-space-md">
              <span className="flex items-center gap-1.5 font-sans text-label-md font-bold text-amber-900">
                <Icon name="warning" className="text-[17px]" filled />
                Before you rely on this
              </span>
              <p className="font-sans text-[0.8125rem] leading-relaxed text-amber-900">
                Complaints saved here stay in this browser. Kandari cannot yet
                deliver them to any police station or ministry. Use this to
                prepare and keep a record — then file it in person, through the
                authority&apos;s own channel, or by calling the helpline.
              </p>
              {count !== null && count > 0 ? (
                <span className="font-sans text-[0.75rem] text-amber-800">
                  {count} saved on this device.
                </span>
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
