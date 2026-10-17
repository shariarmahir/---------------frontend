"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { btn } from "@/components/ui/section-kit";
import { Textarea } from "@/components/ui/textarea";
import {
  ACCESS_ROLES,
  REASON_MAX,
  REVIEW_MS,
  makeRequest,
  statusOf,
  type AccessErrors,
  type AccessInput,
  type AccessRequest,
} from "@/lib/research/access";
import { saveAccessRequest, useAccessRequest } from "@/lib/research/access-store";
import { cn } from "@/lib/utils";

/**
 * An R&D project's access button, in three states: "Request to view"
 * opens a short form; once sent it reads "Awaiting approval" (and opens
 * the request); approved, it links straight to the research. On a gold
 * row the buttons are navy, elsewhere gold.
 */
export function AccessRequestButton({ project, title, href, onGold }: { project: string; title: string; href: string; onGold: boolean }) {
  const request = useAccessRequest(project);
  const [now, setNow] = useState(0);
  const [open, setOpen] = useState(false);
  const status = statusOf(request, now);

  // Re-read the clock when the review is due, so the button turns by itself.
  useEffect(() => {
    if (!request) return;
    const t = window.setTimeout(() => setNow(Date.now()), Math.max(0, request.at + REVIEW_MS - Date.now()));
    return () => window.clearTimeout(t);
  }, [request]);

  const solid = onGold ? btn.navy : btn.gold;
  const outline = onGold ? btn.navyOutline : btn.goldOutline;

  if (status === "approved") {
    return (
      <Link href={href} className={solid}>
        <Icon name="verified" className="text-lg" />
        Approved · View research
      </Link>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button type="button" onClick={() => setOpen(true)} className={status === "pending" ? outline : solid}>
        <Icon name={status === "pending" ? "schedule" : "lock_open"} className="text-lg" />
        {status === "pending" ? "Awaiting approval" : "Request to view research"}
      </button>
      <DialogContent
        showCloseButton={false}
        className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] gap-6 overflow-y-auto rounded-3xl border-0 bg-bdnavy-900 p-6 text-white ring-1 ring-white/12 sm:p-8"
      >
        <header className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <p className="font-sans tabular-nums text-xs font-semibold text-signal-orange">Research access</p>
            <DialogTitle className="font-grotesk text-xl leading-tight font-bold">{title}</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-white/65">
              {request
                ? "The lab reviews every request. This button turns into a link to the research once yours is approved."
                : "This work is still in the lab. Tell us who you are and why you want to read it, and the team will review your request."}
            </DialogDescription>
          </div>
          <DialogClose
            aria-label="Close"
            className="-mt-1 -mr-2 grid size-10 shrink-0 place-items-center rounded-full text-white/65 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
          >
            <Icon name="close" className="text-2xl" />
          </DialogClose>
        </header>

        {request ? <Summary request={request} /> : <RequestForm project={project} />}
      </DialogContent>
    </Dialog>
  );
}

/** What was sent, and where it stands. */
function Summary({ request }: { request: AccessRequest }) {
  const rows: [string, string][] = [
    ["Name", request.name],
    ["Contact", request.contact],
    ["Who you are", ACCESS_ROLES[request.role]],
    ["Why", request.reason],
  ];
  return (
    <div className="flex flex-col gap-5">
      <p className="inline-flex items-center gap-2 self-start rounded-full bg-signal-orange/12 px-3 py-1.5 text-xs font-semibold text-signal-orange ring-1 ring-signal-orange/40">
        <Icon name="schedule" className="text-base" />
        Awaiting approval
      </p>
      <dl className="grid gap-3 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="grid gap-1 border-t border-white/10 pt-3">
            <dt className="text-xs font-semibold tracking-wide text-white/65">{k}</dt>
            <dd className="break-words text-white/80">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

const FIELD =
  "border-white/15 bg-white/[0.06] text-white shadow-none placeholder:text-white/65 hover:border-white/30 focus-visible:border-signal-orange focus-visible:ring-signal-orange/25 aria-invalid:border-signal-orange aria-invalid:ring-signal-orange/25";
const LABEL = "text-xs text-white/65";

function RequestForm({ project }: { project: string }) {
  const id = useId();
  const form = useRef<HTMLFormElement>(null);
  const [input, setInput] = useState<AccessInput>({ name: "", contact: "", role: "", reason: "" });
  const [errors, setErrors] = useState<AccessErrors>({});
  const [failed, setFailed] = useState(false);

  const set = <K extends keyof AccessInput>(key: K, value: AccessInput[K]) => {
    setInput((s) => ({ ...s, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const result = makeRequest(project, input, Date.now());
    if (!result.ok) {
      setErrors(result.errors);
      // Take the reader to the first field that needs fixing.
      const first = (["name", "contact", "role", "reason"] as const).find((k) => result.errors[k]);
      form.current?.querySelector<HTMLElement>(`[data-field="${first}"]`)?.focus();
      return;
    }
    setFailed(!saveAccessRequest(result.request));
  };

  const error = (key: keyof AccessInput) =>
    errors[key] ? (
      <p id={`${id}-${key}-error`} className="flex items-center gap-1.5 text-xs text-signal-orange">
        <Icon name="error" className="text-sm" />
        {errors[key]}
      </p>
    ) : null;
  const described = (key: keyof AccessInput) => (errors[key] ? `${id}-${key}-error` : undefined);

  return (
    <form ref={form} noValidate onSubmit={submit} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor={`${id}-name`} className={LABEL}>Full name</Label>
          <Input
            id={`${id}-name`}
            data-field="name"
            autoComplete="name"
            value={input.name}
            onChange={(e) => set("name", e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={described("name")}
            className={FIELD}
          />
          {error("name")}
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${id}-contact`} className={LABEL}>Email or mobile</Label>
          <Input
            id={`${id}-contact`}
            data-field="contact"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com or 017…"
            value={input.contact}
            onChange={(e) => set("contact", e.target.value)}
            aria-invalid={Boolean(errors.contact)}
            aria-describedby={described("contact")}
            className={FIELD}
          />
          {error("contact")}
        </div>
      </div>

      <fieldset className="grid gap-2" aria-describedby={described("role")}>
        <legend className={cn("mb-2 font-sans font-semibold tracking-wide", LABEL)}>I am a</legend>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(ACCESS_ROLES) as (keyof typeof ACCESS_ROLES)[]).map((role, i) => (
            <label key={role} className="cursor-pointer">
              <input
                type="radio"
                name={`${id}-role`}
                value={role}
                data-field={i === 0 ? "role" : undefined}
                checked={input.role === role}
                onChange={() => set("role", role)}
                className="peer sr-only"
              />
              <span className="inline-flex rounded-full px-3.5 py-2 text-sm text-white/80 ring-1 ring-white/20 transition-colors peer-checked:bg-signal-orange peer-checked:font-semibold peer-checked:text-text-primary peer-checked:ring-signal-orange peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-signal-orange hover:ring-white/45">
                {ACCESS_ROLES[role]}
              </span>
            </label>
          ))}
        </div>
        {error("role")}
      </fieldset>

      <div className="grid gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <Label htmlFor={`${id}-reason`} className={LABEL}>Why do you want to read it?</Label>
          <span className="text-xs text-white/65 tabular-nums">
            {input.reason.trim().length}/{REASON_MAX}
          </span>
        </div>
        <Textarea
          id={`${id}-reason`}
          data-field="reason"
          rows={4}
          maxLength={REASON_MAX + 50}
          value={input.reason}
          onChange={(e) => set("reason", e.target.value)}
          aria-invalid={Boolean(errors.reason)}
          aria-describedby={described("reason")}
          className={FIELD}
        />
        {error("reason")}
      </div>

      {failed && (
        <p role="alert" className="text-sm text-signal-orange">
          This browser would not save the request (private mode or full storage). Try again in a normal window.
        </p>
      )}

      <button type="submit" className={cn(btn.gold, "self-start")}>
        <Icon name="send" className="text-lg" />
        Send request
      </button>
    </form>
  );
}
