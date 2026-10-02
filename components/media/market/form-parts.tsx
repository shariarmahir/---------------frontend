"use client";

import { Check, Hash } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Field } from "@/data/media/bazaar";
import { parseTags } from "@/lib/media/bazaar";
import { cn } from "@/lib/utils";
import { choiceClass, selectClass } from "../ui/field-styles";

/** Label, control slot and error line, wired for screen readers. */
export function Row({ id, label, error, hint, children, className }: { id: string; label: string; error?: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-sm font-semibold text-white">{label}</label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium text-crimson-bright">{error}</p>
      ) : hint ? (
        <p className="text-xs text-white/60">{hint}</p>
      ) : null}
    </div>
  );
}

/** One form-driven field (stage or category specific). Multi-choice values are stored comma-joined. */
export function SpecField({ field, value, error, onChange }: { field: Field; value: string; error?: string; onChange: (v: string) => void }) {
  const id = `spec-${field.key}`;
  const label = field.required ? `${field.label} *` : field.label;
  const aria = { "aria-invalid": Boolean(error) || undefined, "aria-describedby": error ? `${id}-error` : undefined };
  if (field.kind === "chips") {
    const picked = new Set(value.split(", ").filter(Boolean));
    const toggle = (o: string) => {
      if (!picked.delete(o)) picked.add(o);
      onChange(field.options!.filter((x) => picked.has(x)).join(", "));
    };
    return (
      <fieldset className="space-y-1.5 sm:col-span-2" {...aria}>
        <legend className="text-sm font-semibold text-white">{label}</legend>
        <div className="flex flex-wrap gap-2">
          {field.options!.map((o) => (
            <label key={o} className={choiceClass(picked.has(o))}>
              <input type="checkbox" className="sr-only" checked={picked.has(o)} onChange={() => toggle(o)} />
              {picked.has(o) && <Check className="size-3.5" aria-hidden />}
              {o}
            </label>
          ))}
        </div>
        {error && <p id={`${id}-error`} className="text-xs font-medium text-crimson-bright">{error}</p>}
      </fieldset>
    );
  }
  return (
    <Row id={id} label={label} error={error}>
      {field.kind === "select" ? (
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={selectClass} {...aria}>
          <option value="">বেছে নিন</option>
          {field.options!.map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <Input id={id} type={field.kind === "date" ? "date" : "text"} inputMode={field.kind === "number" ? "numeric" : undefined} placeholder={field.placeholder} value={value} onChange={(e) => onChange(e.target.value)} {...aria} />
      )}
    </Row>
  );
}

/** Hashtags as typed, with the canonical tags they fold into and one-tap ideas. */
export function TagInput({ value, ideas, error, onChange }: { value: string; ideas: string[]; error?: string; onChange: (v: string) => void }) {
  const tags = parseTags(value);
  const add = (t: string) => onChange(`${value.trim()} #${t}`.trim());
  return (
    <Row id="tags" label="হ্যাশট্যাগ *" error={error} hint="বাংলা বা ইংরেজি, যেভাবে খুশি — #coconut আর #ডাব দুটোই #নারকেল হয়ে মিলবে।">
      <div className="relative">
        <Hash className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-signal-orange" aria-hidden />
        <Input id="tags" value={value} onChange={(e) => onChange(e.target.value)} placeholder={ideas.length ? ideas.slice(0, 3).map((t) => `#${t}`).join(" ") : "#পণ্যেরনাম #জেলা"} className="pl-9" aria-invalid={Boolean(error) || undefined} aria-describedby={error ? "tags-error" : undefined} />
      </div>
      {(tags.length > 0 || ideas.length > 0) && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {tags.map((t) => (
            <span key={t} className="live-in rounded-md bg-signal-orange px-2 py-0.5 text-xs font-bold text-text-primary">#{t}</span>
          ))}
          {ideas.filter((t) => !tags.includes(t)).map((t) => (
            <button key={t} type="button" onClick={() => add(t)} className="rounded-md border border-dashed border-white/25 px-2 py-0.5 text-xs text-white/75 transition-colors hover:border-signal-orange hover:text-signal-orange">
              + #{t}
            </button>
          ))}
        </div>
      )}
    </Row>
  );
}

/** Progress across the form's steps; finished steps can be revisited. */
export function Stepper({ steps, at, onJump }: { steps: string[]; at: number; onJump: (i: number) => void }) {
  return (
    <ol className="grid gap-2" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
      {steps.map((s, i) => (
        <li key={s}>
          <button type="button" disabled={i > at} onClick={() => onJump(i)} aria-current={i === at ? "step" : undefined} className="group w-full text-left disabled:cursor-default">
            <span className="block h-1.5 overflow-hidden rounded-full bg-white/12">
              <span className={cn("block h-full rounded-full bg-signal-orange transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none", i < at ? "w-full" : i === at ? "w-1/2" : "w-0")} />
            </span>
            <span className={cn("mt-2 hidden text-xs font-semibold sm:block", i === at ? "text-signal-orange" : i < at ? "text-white group-hover:text-signal-orange" : "text-white/45")}>
              {i + 1}. {s}
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
}
