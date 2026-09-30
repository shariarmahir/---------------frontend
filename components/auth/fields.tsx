"use client";

import * as React from "react";
import { useId, useRef, useState } from "react";
import { Check, Eye, EyeOff, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AUTH_RULES } from "@/data/auth";
import { PASSWORD_ISSUE_BN, passwordIssues, passwordStrength, toAsciiDigits, toBanglaDigits } from "@/lib/auth/validate";
import { cn } from "@/lib/utils";

/**
 * The auth fields sit on the home page's gold (sign-in, sign-up and the
 * profile's gold cards): a white well with an ink edge and an ink focus
 * ring; chosen chips and switches turn ink with gold; the primary action is
 * ink, since gold on gold would vanish.
 */
const GOLD_INPUT =
  "rounded-xl border-text-primary/25 bg-white hover:border-text-primary/50 focus-visible:border-text-primary focus-visible:ring-text-primary/25 placeholder:text-text-primary/45";

/* ── Text field with label, hint and error wired to aria ─────────────── */

export function TextField({
  label,
  hint,
  error,
  className,
  labelAction,
  ...props
}: React.ComponentProps<"input"> & { label: string; hint?: React.ReactNode; error?: string; labelAction?: React.ReactNode }) {
  const id = useId();
  return (
    <div className={cn("grid gap-space-sm", className)}>
      <div className="flex items-baseline justify-between gap-space-sm">
        <Label htmlFor={id} className="font-bold text-text-primary">
          {label}
        </Label>
        {labelAction}
      </div>
      <Input id={id} aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined} {...props} className={GOLD_INPUT} />
      {error ? <FieldError id={`${id}-err`}>{error}</FieldError> : hint ? <p id={`${id}-hint`} className="font-sans text-body-sm text-text-primary/75">{hint}</p> : null}
    </div>
  );
}

/** An error, as a solid red chip so it reads on gold and on ink alike. */
export function FieldError({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <p id={id} role="alert" className="live-in flex w-fit items-start gap-space-xs rounded-lg bg-national-crimson px-2.5 py-1.5 font-sans text-body-sm font-semibold text-white">
      <X className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

/* ── Password with reveal toggle and optional strength meter ───────── */

const STRENGTH = [
  { label: "", bar: "bg-text-primary/15" },
  { label: "দুর্বল", bar: "bg-national-crimson" },
  { label: "চলনসই", bar: "bg-bdorange-600" },
  { label: "ভালো", bar: "bg-bd-green" },
  { label: "শক্ত", bar: "bg-text-primary" },
];

export function PasswordField({
  label,
  error,
  showRules,
  labelAction,
  value,
  ...props
}: React.ComponentProps<"input"> & { label: string; error?: string; showRules?: boolean; labelAction?: React.ReactNode; value: string }) {
  const id = useId();
  const [shown, setShown] = useState(false);
  const issues = passwordIssues(value, AUTH_RULES.passwordMin, AUTH_RULES.passwordMax);
  const strength = passwordStrength(value);
  return (
    <div className="grid gap-space-sm">
      <div className="flex items-baseline justify-between gap-space-sm">
        <Label htmlFor={id} className="font-bold text-text-primary">
          {label}
        </Label>
        {labelAction}
      </div>
      <div className="relative">
        {/* Edge's own reveal button would duplicate the toggle. */}
        <Input
          id={id}
          type={shown ? "text" : "password"}
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={showRules ? `${id}-rules` : error ? `${id}-err` : undefined}
          className={cn(GOLD_INPUT, "pe-11 [&::-ms-reveal]:hidden")}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShown((s) => !s)}
          className="absolute inset-y-0 inset-e-0 flex w-11 items-center justify-center rounded-e-xl text-text-primary/60 transition-colors hover:text-text-primary focus-visible:text-text-primary focus-visible:ring-2 focus-visible:ring-text-primary/40 focus-visible:outline-none"
          aria-label={shown ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
          aria-pressed={shown}
        >
          {shown ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
        </button>
      </div>
      {showRules ? (
        <div id={`${id}-rules`} className="grid gap-space-xs">
          <div className="flex items-center gap-space-sm" aria-hidden={!value}>
            <div className="grid flex-1 grid-cols-4 gap-1">
              {[1, 2, 3, 4].map((n) => (
                <span key={n} className={cn("h-1.5 rounded-full transition-colors duration-300", n <= strength ? STRENGTH[strength].bar : "bg-text-primary/15")} />
              ))}
            </div>
            <span className="w-12 text-right font-sans text-body-sm font-bold text-text-primary">{STRENGTH[strength].label}</span>
          </div>
          <ul className="grid gap-x-space-md gap-y-1 sm:grid-cols-2">
            {(["short", "letter", "digit"] as const).map((rule) => {
              const met = !!value && !issues.includes(rule);
              return (
                <li key={rule} className={cn("flex items-center gap-1.5 font-sans text-body-sm", met ? "font-semibold text-text-primary" : "text-text-primary/65")}>
                  {met ? <Check className="size-3.5" aria-hidden /> : <span className="size-1.5 rounded-full bg-current" aria-hidden />}
                  {PASSWORD_ISSUE_BN[rule]}
                  <span className="sr-only">{met ? " — হয়েছে" : " — বাকি"}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
      {error ? <FieldError id={`${id}-err`}>{error}</FieldError> : null}
    </div>
  );
}

/* ── One-time code: six boxes, paste-friendly, Bangla digits accepted ─ */

export function OtpInput({ value, onChange, invalid, disabled, autoFocus, label }: { value: string; onChange: (v: string) => void; invalid?: boolean; disabled?: boolean; autoFocus?: boolean; label: string }) {
  const n = AUTH_RULES.otpLength;
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: n }, (_, i) => value[i] ?? "");

  const setFrom = (start: number, raw: string) => {
    const clean = toAsciiDigits(raw).replace(/\D/g, "");
    if (!clean) return;
    const next = (value.slice(0, start) + clean + value.slice(start + clean.length)).slice(0, n);
    onChange(next);
    refs.current[Math.min(start + clean.length, n - 1)]?.focus();
  };

  return (
    <fieldset className="grid gap-space-sm" disabled={disabled}>
      <legend className="mb-space-sm font-sans text-label-sm font-bold tracking-wide text-text-primary">{label}</legend>
      <div className="flex justify-between gap-1.5 sm:gap-2" dir="ltr">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={d ? toBanglaDigits(d) : ""}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            autoFocus={autoFocus && i === 0}
            aria-label={`অঙ্ক ${toBanglaDigits(i + 1)}`}
            aria-invalid={invalid ? true : undefined}
            maxLength={n}
            onChange={(e) => {
              const raw = e.target.value;
              if (!raw) {
                onChange(value.slice(0, i));
                return;
              }
              // One keystroke into a filled box replaces its digit; a paste
              // or SMS autofill fills onward from here.
              let typed = raw;
              if (d && raw.length === 2) typed = raw[0] === toBanglaDigits(d) || raw[0] === d ? raw.slice(1) : raw.slice(0, 1);
              setFrom(i, typed);
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !d && i > 0) {
                e.preventDefault();
                onChange(value.slice(0, i - 1));
                refs.current[i - 1]?.focus();
              } else if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
              else if (e.key === "ArrowRight" && i < n - 1) refs.current[i + 1]?.focus();
            }}
            onFocus={(e) => {
              // Always type into the first empty box.
              if (i > value.length) refs.current[value.length]?.focus();
              else e.target.select();
            }}
            className={cn(
              "h-13 w-full min-w-0 rounded-xl border-2 bg-white text-center font-mono text-headline-sm font-bold text-text-primary shadow-sm transition-[border-color,scale] duration-150 focus-visible:scale-105 focus-visible:border-text-primary focus-visible:ring-2 focus-visible:ring-text-primary/30 focus-visible:outline-none disabled:opacity-50 motion-reduce:transition-none motion-reduce:focus-visible:scale-100",
              invalid ? "border-national-crimson" : d ? "border-text-primary" : "border-text-primary/25",
            )}
          />
        ))}
      </div>
    </fieldset>
  );
}

/* ── Choices ───────────────────────────────────────────────────────── */
/** A checkbox styled as a pill, for multi-select lists: ink with gold when chosen. */
export function Chip({ on, onChange, children }: { on: boolean; onChange: () => void; children: React.ReactNode }) {
  return (
    <label
      className={cn(
        "relative inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full border-2 px-space-md font-sans text-body-sm font-semibold [-webkit-tap-highlight-color:transparent] transition-[background-color,color,scale] duration-150 has-focus-visible:ring-2 has-focus-visible:ring-text-primary/40 active:scale-95",
        on ? "border-text-primary bg-text-primary text-signal-orange" : "border-text-primary/30 text-text-primary hover:bg-text-primary/10",
      )}
    >
      <input type="checkbox" checked={on} onChange={onChange} className="sr-only" />
      {on ? <Check className="size-3.5" aria-hidden /> : null}
      {children}
    </label>
  );
}

/** A checkbox styled as a switch: an ink track with a gold knob when on. */
export function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <label className={cn("flex min-h-10 items-center justify-between gap-space-md font-sans text-body-md text-text-primary", disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer")}>
      {label}
      <span className="relative inline-flex shrink-0">
        <input type="checkbox" role="switch" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
        <span className="h-6 w-11 rounded-full bg-text-primary/25 transition-colors peer-checked:bg-text-primary peer-focus-visible:ring-2 peer-focus-visible:ring-text-primary/40 peer-focus-visible:ring-offset-2" />
        <span className="absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-[translate,background-color] duration-200 peer-checked:translate-x-5 peer-checked:bg-signal-orange motion-reduce:transition-none" />
      </span>
    </label>
  );
}

/* ── Buttons ───────────────────────────────────────────────────────── */

export function SubmitButton({ busy, children, className, ...props }: React.ComponentProps<"button"> & { busy?: boolean }) {
  return (
    <button
      type="submit"
      disabled={busy || props.disabled}
      aria-busy={busy || undefined}
      className={cn(
        "inline-flex h-12 w-full items-center justify-center gap-space-sm rounded-xl bg-text-primary px-space-lg font-display text-label-md font-bold text-signal-orange shadow-ink [-webkit-tap-highlight-color:transparent] transition-[translate,scale,background-color,color] duration-200 hover:-translate-y-0.5 hover:bg-bd-green hover:text-white active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-text-primary/40 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 motion-reduce:transition-none",
        className,
      )}
      {...props}
    >
      {busy ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden /> : null}
      {children}
    </button>
  );
}

export function TextButton({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "rounded font-sans text-body-sm font-bold text-text-primary underline decoration-text-primary/30 decoration-2 underline-offset-4 transition-colors hover:text-bd-green-dark hover:decoration-bd-green-dark focus-visible:ring-2 focus-visible:ring-text-primary/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:text-text-primary/50 disabled:no-underline",
        className,
      )}
      {...props}
    />
  );
}

/* ── The mock gateway's "phone" / "inbox" ──────────────────────────── */

/**
 * No SMS or email is sent in the demo, so the message that would arrive is
 * shown here instead, clearly marked as such — an ink card on the gold.
 */
export function DemoMessage({ kind, children }: { kind: "sms" | "email"; children: React.ReactNode }) {
  return (
    <div role="status" className="live-in rounded-2xl bg-text-primary p-space-md font-sans text-body-sm text-white shadow-ink">
      <p className="mb-1 font-mono text-label-xs font-bold tracking-widest text-signal-orange uppercase">{kind === "sms" ? "ডেমো এসএমএস" : "ডেমো ইমেইল"} · আসলে পাঠানো হয়নি</p>
      {children}
    </div>
  );
}

/** Seconds left until `until` (ms timestamp), ticking once a second. */
export function useCountdown(until: number | null): number {
  const [now, setNow] = useState(() => Date.now());
  React.useEffect(() => {
    if (!until) return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [until]);
  return until ? Math.max(0, Math.ceil((until - now) / 1000)) : 0;
}
