"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import {
  newsCategories,
  SUBMIT_PROMPT,
  SUBMIT_PROMPT_BN,
  type NewsCategory,
} from "@/data/news-feed";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "kandari.news-submissions";
const MAX_CHARS = 400;

interface Draft {
  headline: string;
  category: NewsCategory;
  district: string;
  sourceUrl: string;
  body: string;
  at: string;
}

function readDrafts(): Draft[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Draft[]) : [];
  } catch {
    return [];
  }
}

/**
 * Citizen news submission.
 *
 * Saves locally only — there is no ingestion endpoint yet, so the form makes
 * that explicit rather than implying a report was filed nationally.
 *
 * TODO(backend): POST /api/v1/news/submissions, then show moderation state.
 */
export function NewsSubmit() {
  const [headline, setHeadline] = useState("");
  const [category, setCategory] = useState<NewsCategory>("citizen");
  const [district, setDistrict] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [body, setBody] = useState("");
  const [saved, setSaved] = useState<Draft[]>([]);
  const [justSaved, setJustSaved] = useState(false);

  // Two-pass read: localStorage is unavailable during SSR, so the list stays
  // empty for the first paint and fills in after mount.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaved(readDrafts());
  }, []);

  const canSubmit = headline.trim().length > 8 && body.trim().length > 20;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const entry: Draft = {
      headline: headline.trim(),
      category,
      district: district.trim(),
      sourceUrl: sourceUrl.trim(),
      body: body.trim(),
      at: new Date().toISOString(),
    };
    const next = [entry, ...readDrafts()].slice(0, 20);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Private mode or blocked storage — the draft still shows this session.
    }
    setSaved(next);
    setJustSaved(true);
    setHeadline("");
    setDistrict("");
    setSourceUrl("");
    setBody("");
    window.setTimeout(() => setJustSaved(false), 4000);
  };

  return (
    <section
      id="submit-news"
      className="w-full border-b border-border bg-slate-50 px-gutter py-space-xl"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-gutter lg:grid-cols-12">
        <div className="flex flex-col gap-space-sm lg:col-span-4">
          <h2 className="font-display text-headline-md font-bold tracking-tight text-slate-900">
            Report the news yourself
          </h2>
          <p className="font-display text-body-md text-primary">
            নিজেই সংবাদ জানান
          </p>
          <p className="font-sans text-body-sm leading-relaxed text-slate-600">
            {SUBMIT_PROMPT}
          </p>
          <p className="font-display text-body-sm leading-relaxed text-slate-600">
            {SUBMIT_PROMPT_BN}
          </p>

          <div className="mt-space-sm flex items-start gap-space-xs rounded-lg border border-amber-200 bg-amber-50 p-space-sm">
            <Icon
              name="info"
              className="mt-0.5 shrink-0 text-[16px] text-amber-700"
            />
            <p className="font-sans text-[0.8125rem] leading-relaxed text-amber-900">
              Submissions are saved on this device only. National publishing
              needs the moderation service, which is not built yet.
            </p>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="flex flex-col gap-space-md rounded-xl border border-border bg-white p-space-lg shadow-xs lg:col-span-8"
        >
          <div className="flex flex-col gap-1">
            <label
              htmlFor="news-headline"
              className="font-sans text-[0.8125rem] font-semibold text-slate-900"
            >
              Headline
            </label>
            <input
              id="news-headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="What happened, in one line"
              maxLength={120}
              className="h-10 rounded-lg border border-border bg-white px-space-sm font-sans text-body-sm text-slate-900 outline-none transition-all focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,103,71,0.12)]"
            />
          </div>

          <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="news-category"
                className="font-sans text-[0.8125rem] font-semibold text-slate-900"
              >
                Category
              </label>
              <select
                id="news-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as NewsCategory)}
                className="h-10 rounded-lg border border-border bg-white px-space-sm font-sans text-body-sm text-slate-900 outline-none transition-all focus:border-primary"
              >
                {newsCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label} — {c.banglaLabel}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="news-district"
                className="font-sans text-[0.8125rem] font-semibold text-slate-900"
              >
                District
              </label>
              <input
                id="news-district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Where it happened"
                className="h-10 rounded-lg border border-border bg-white px-space-sm font-sans text-body-sm text-slate-900 outline-none transition-all focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,103,71,0.12)]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="news-source"
              className="font-sans text-[0.8125rem] font-semibold text-slate-900"
            >
              Source link{" "}
              <span className="font-normal text-slate-500">(optional)</span>
            </label>
            <input
              id="news-source"
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://"
              className="h-10 rounded-lg border border-border bg-white px-space-sm font-sans text-body-sm text-slate-900 outline-none transition-all focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,103,71,0.12)]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between">
              <label
                htmlFor="news-body"
                className="font-sans text-[0.8125rem] font-semibold text-slate-900"
              >
                What happened
              </label>
              <span
                className={cn(
                  "font-sans text-[0.75rem]",
                  body.length > MAX_CHARS - 40
                    ? "text-signal-text"
                    : "text-slate-500",
                )}
              >
                {body.length}/{MAX_CHARS}
              </span>
            </div>
            <textarea
              id="news-body"
              value={body}
              onChange={(e) => setBody(e.target.value.slice(0, MAX_CHARS))}
              rows={4}
              placeholder="Facts first: what, where, when, and who said so."
              className="resize-y rounded-lg border border-border bg-white p-space-sm font-sans text-body-sm leading-relaxed text-slate-900 outline-none transition-all focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,103,71,0.12)]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-space-md">
            <button
              type="submit"
              disabled={!canSubmit}
              className={cn(
                "inline-flex items-center gap-space-xs rounded-lg px-space-lg py-2.5",
                "font-sans text-[0.875rem] font-semibold transition-all",
                canSubmit
                  ? "bg-primary text-white shadow-sm hover:bg-emerald-800 active:scale-[0.98]"
                  : "cursor-not-allowed bg-slate-200 text-slate-500",
              )}
            >
              <Icon name="send" className="text-[16px]" />
              Submit news
            </button>

            {justSaved ? (
              <span
                role="status"
                className="flex items-center gap-1.5 font-sans text-[0.8125rem] font-semibold text-primary"
              >
                <Icon name="check_circle" className="text-[16px]" />
                Saved on this device
              </span>
            ) : null}
          </div>

          {saved.length > 0 ? (
            <div className="flex flex-col gap-space-xs border-t border-border pt-space-md">
              <span className="font-sans text-[0.75rem] font-semibold tracking-wider text-slate-500 uppercase">
                Your submissions ({saved.length})
              </span>
              <ul className="flex flex-col gap-1">
                {saved.slice(0, 3).map((d) => (
                  <li
                    key={d.at}
                    className="flex items-start gap-space-xs font-sans text-[0.8125rem] text-slate-600"
                  >
                    <Icon
                      name="draft"
                      className="mt-0.5 shrink-0 text-[14px] text-slate-400"
                    />
                    <span className="min-w-0 truncate">{d.headline}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </form>
      </div>
    </section>
  );
}
