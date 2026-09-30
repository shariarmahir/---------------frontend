"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import {
  DAILY_FORM_PROMPT,
  DAILY_FORM_PROMPT_BN,
  improvementAreas,
  KANDARI_PLEDGE,
} from "@/data/national-index";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "kandari.daily-judgment";
const MAX_CHARS = 280;

interface Submission {
  date: string;
  mood: number;
  areas: string[];
  note: string;
}

/** Today as YYYY-MM-DD in the user's own timezone. */
function todayKey(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function readLedger(): Submission[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Submission[]) : [];
  } catch {
    // Private mode or blocked storage — treat as an empty ledger.
    return [];
  }
}

const MOODS = [
  { value: 1, icon: "sentiment_very_dissatisfied", label: "ভয়ানক", en: "Terrible" },
  { value: 2, icon: "sentiment_dissatisfied", label: "খারাপ", en: "Bad" },
  { value: 3, icon: "sentiment_neutral", label: "মোটামুটি", en: "Okay" },
  { value: 4, icon: "sentiment_satisfied", label: "ভালো", en: "Good" },
  { value: 5, icon: "sentiment_very_satisfied", label: "দারুণ", en: "Great" },
];

export function DailyJudgmentForm() {
  const [mood, setMood] = useState<number | null>(null);
  const [areas, setAreas] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [ledgerCount, setLedgerCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // localStorage does not exist during SSR, so the ledger can only be read
  // after mount. The initial render is deliberately storage-free to keep the
  // server and client markup identical; this effect is the second pass.
  useEffect(() => {
    const ledger = readLedger();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe two-pass read of a browser-only API.
    setLedgerCount(ledger.length);
    setSubmitted(ledger.some((entry) => entry.date === todayKey()));
  }, []);

  const toggleArea = (id: string) => {
    setAreas((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (mood === null) {
      setError("আপনার দিনটি কেমন ছিল তা নির্বাচন করুন — please rate your day.");
      return;
    }
    if (areas.length === 0) {
      setError("অন্তত একটি ক্ষেত্র নির্বাচন করুন — pick at least one area.");
      return;
    }
    setError(null);

    const entry: Submission = { date: todayKey(), mood, areas, note: note.trim() };
    try {
      const ledger = readLedger().filter((e) => e.date !== entry.date);
      ledger.push(entry);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ledger));
      setLedgerCount(ledger.length);
    } catch {
      // Submission still counts for this session even if storage is unavailable.
      setLedgerCount((c) => c + 1);
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div
        id="daily-judgment"
        className="flex h-full flex-col items-center justify-center gap-space-md rounded-2xl border-2 border-white/12 bg-bdgreen-500/15 p-space-lg text-center shadow-md"
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-md">
          <Icon name="check" className="text-[28px]" />
        </span>
        <h3 className="font-display text-headline-md font-bold text-white">
          আজকের রায় জমা হয়েছে
        </h3>
        <p className="max-w-md font-body-md text-body-md text-white/80">
          Your judgment is recorded for {todayKey()}. Come back tomorrow — every
          Bangladeshi voice compounds into the national index.
        </p>
        <span className="rounded-full border border-white/12 bg-text-primary ring-1 ring-white/12 px-space-md py-1 font-code-telemetry text-label-sm font-bold text-primary">
          {ledgerCount} DAY{ledgerCount === 1 ? "" : "S"} LOGGED BY YOU
        </span>
        <p className="font-display text-body-md font-semibold text-primary">
          {KANDARI_PLEDGE}
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setError(null);
          }}
          className="font-label-sm text-label-sm text-white/65 underline underline-offset-4 transition-colors hover:text-primary"
        >
          Edit today&apos;s entry
        </button>
      </div>
    );
  }

  return (
    <form
      id="daily-judgment"
      onSubmit={handleSubmit}
      className="flex h-full flex-col gap-space-md rounded-2xl border border-border bg-text-primary p-space-lg shadow-md"
    >
      <div className="flex flex-col gap-space-xs">
        <span className="flex w-fit items-center gap-space-xs rounded-sm bg-primary px-space-sm py-0.5 font-code-telemetry text-label-sm font-bold text-white">
          <Icon name="how_to_vote" className="text-[16px]" />
          DAILY CITIZEN INPUT
        </span>
        <h3 className="font-display text-headline-md font-bold text-white">
          {DAILY_FORM_PROMPT}
        </h3>
        <p className="font-display text-body-md text-white/80">
          {DAILY_FORM_PROMPT_BN}
        </p>
      </div>

      {/* Mood scale. */}
      <fieldset className="flex flex-col gap-space-sm">
        <legend className="font-label-md text-label-md font-semibold text-white">
          1. How was your day?
        </legend>
        <div className="flex flex-wrap gap-space-xs">
          {MOODS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMood(m.value)}
              aria-pressed={mood === m.value}
              className={cn(
                "flex min-w-18 flex-1 flex-col items-center gap-0.5 rounded-lg border-2 px-space-xs py-space-sm transition-all",
                mood === m.value
                  ? "border-primary bg-text-primary ring-1 ring-white/12 shadow-sm"
                  : "border-border bg-white/60 hover:border-white/12",
              )}
            >
              <Icon
                name={m.icon}
                className={cn(
                  "text-[24px]",
                  mood === m.value ? "text-primary" : "text-white/65",
                )}
              />
              <span className="font-display text-body-sm font-semibold text-white">
                {m.label}
              </span>
              <span className="font-label-sm text-label-xs text-white/65">
                {m.en}
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      {/* Improvement areas. */}
      <fieldset className="flex flex-col gap-space-sm">
        <legend className="font-label-md text-label-md font-semibold text-white">
          2. What can the government fix within 2 days?
        </legend>
        <div className="flex flex-wrap gap-space-xs">
          {improvementAreas.map((area) => {
            const active = areas.includes(area.id);
            return (
              <button
                key={area.id}
                type="button"
                onClick={() => toggleArea(area.id)}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-space-sm py-1 font-label-sm text-label-sm transition-all",
                  active
                    ? "border-crimson bg-crimson text-white shadow-sm"
                    : "border-border bg-text-primary ring-1 ring-white/12 text-white hover:border-crimson/40 hover:text-crimson",
                )}
              >
                <Icon name={area.icon} className="text-[14px]" />
                {area.label}
                <span className="font-display opacity-70">{area.banglaLabel}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Short description. */}
      <div className="flex flex-col gap-space-xs">
        <label
          htmlFor="daily-note"
          className="font-label-md text-label-md font-semibold text-white"
        >
          3. Short description
        </label>
        <textarea
          id="daily-note"
          value={note}
          maxLength={MAX_CHARS}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="আজ কী সমস্যায় পড়েছেন? সংক্ষেপে লিখুন…"
          className="w-full resize-none rounded-lg border border-border bg-text-primary ring-1 ring-white/12 px-space-sm py-space-sm font-sans text-body-sm text-white shadow-xs outline-none transition-all placeholder:text-white/65 focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,103,71,0.12)]"
        />
        <span className="self-end font-code-telemetry text-label-xs text-white/65">
          {note.length}/{MAX_CHARS}
        </span>
      </div>

      {error ? (
        <p
          role="alert"
          className="flex items-center gap-space-xs rounded-lg border border-white/12 bg-national-crimson/20 px-space-sm py-space-xs font-body-sm text-body-sm text-crimson"
        >
          <Icon name="error" className="text-[16px]" />
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        className="mt-auto inline-flex items-center justify-center gap-space-sm rounded-lg bg-title px-space-lg py-3 font-display text-label-md font-bold text-white shadow-sm transition-all hover:scale-[1.01] hover:bg-signal active:scale-[0.99]"
      >
        <Icon name="send" className="text-[18px]" />
        Submit Today&apos;s Judgment
      </button>

      <p className="text-center font-display text-body-sm text-primary">
        {KANDARI_PLEDGE}
      </p>
    </form>
  );
}
