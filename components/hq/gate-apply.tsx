"use client";

import Link from "next/link";
import { ArrowLeft, Check, CircleCheckBig, Send } from "lucide-react";
import { useCallback, useState } from "react";
import { SKILLS } from "@/data/hq/people";
import { DEPT_LABEL } from "@/lib/hq/rules";
import type { Dept } from "@/lib/hq/types";
import { cn } from "@/lib/utils";
import { FaceCamera } from "./face-camera";
import { GateFrame } from "./gate";
import { FormField, hb, inputCls, selectCls, textareaCls } from "./kit";

/** A short department word for the username ("kandari@mehek-dev"). */
const DEPT_WORD: Record<Dept, string> = { leadership: "lead", creative: "creatives", dev: "dev", iot: "iot", ops: "ops", hr: "hr", client: "client", rnd: "rnd", finance: "finance" };

/**
 * Applying for a member ID (Mahir: every member applies; only the prime
 * admin sets designations). Details and skills, a password, three face
 * captures; it then waits in the approvals inbox.
 */
export function ApplyForm() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [f, setF] = useState({ name: "", nameBn: "", email: "", phone: "", dept: "dev" as Dept, handle: "", note: "", password: "", again: "" });
  const [skills, setSkills] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF((x) => ({ ...x, [k]: e.target.value }));
  const suggested = `kandari@${(f.name.split(/\s+/)[0] || "").toLowerCase().replace(/[^a-z0-9]/g, "")}-${DEPT_WORD[f.dept]}`;
  const handle = f.handle || suggested;

  const next1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^kandari@[a-z0-9]+-[a-z0-9]+$/.test(handle)) return setError("The username must be kandari@name-dept, in lowercase letters.");
    setError(null);
    setStep(2);
  };
  const next2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (f.password.length < 10) return setError("The password must be at least 10 characters.");
    if (f.password !== f.again) return setError("The two passwords don't match.");
    setError(null);
    setStep(3);
  };

  const send = useCallback(
    async (captures: number[][]) => {
      setBusy(true);
      setError(null);
      const res = await fetch("/api/hq/auth/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: f.name, nameBn: f.nameBn, email: f.email, phone: f.phone, handle, dept: f.dept, skills, note: f.note, password: f.password, captures }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setBusy(false);
      if (res.ok) return setStep(4);
      setError(data.error ?? "The application couldn't be sent.");
      if (res.status === 409) setStep(1);
      else setAttempt((a) => a + 1);
    },
    [f, handle, skills],
  );

  return (
    <GateFrame>
      <Link href="/hq/login" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-white/70 hover:text-signal-orange">
        <ArrowLeft aria-hidden className="size-4" /> Back to sign in
      </Link>
      <div className="rounded-2xl bg-bdnavy-900 p-6 ring-1 ring-white/12 sm:p-8">
        <h1 className="font-grotesk text-2xl font-bold text-signal-orange">Apply for a member ID</h1>
        <p className="mt-1 text-sm text-white/65">Once approved, you sign in with this username, password and your face.</p>
        {step < 4 ? (
          <ol aria-label="Steps" className="mt-5 flex gap-1.5">
            {[1, 2, 3].map((n) => (
              <li key={n} aria-current={n === step ? "step" : undefined} className={cn("h-1.5 flex-1 rounded-full", n <= step ? "bg-signal-orange" : "bg-white/15")} />
            ))}
          </ol>
        ) : null}

        {step === 1 ? (
          <form onSubmit={next1} className="mt-6 flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Name (Bangla)">
                <input value={f.nameBn} onChange={set("nameBn")} className={inputCls} lang="bn" placeholder="Optional" />
              </FormField>
              <FormField label="Full name">
                <input required value={f.name} onChange={set("name")} className={inputCls} lang="en" />
              </FormField>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Email">
                <input required type="email" value={f.email} onChange={set("email")} className={inputCls} autoComplete="email" />
              </FormField>
              <FormField label="Mobile">
                <input required inputMode="tel" value={f.phone} onChange={set("phone")} className={inputCls} placeholder="01XXXXXXXXX" autoComplete="tel" />
              </FormField>
            </div>
            <FormField label="Department">
              <select value={f.dept} onChange={set("dept")} className={selectCls}>
                {(Object.keys(DEPT_LABEL) as Dept[]).map((d) => (
                  <option key={d} value={d}>
                    {DEPT_LABEL[d]}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Username" hint={`Suggested: ${suggested}`}>
              <input value={f.handle} onChange={set("handle")} placeholder={suggested} className={cn(inputCls, "font-mono")} />
            </FormField>
            <fieldset>
              <legend className="text-sm font-semibold text-white/85">Skills (pick any)</legend>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {SKILLS.map((s) => {
                  const on = skills.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setSkills((x) => (on ? x.filter((y) => y !== s) : [...x, s]))}
                      className={cn("min-h-8 rounded-full px-3 text-xs font-semibold ring-1 transition-colors", on ? "bg-signal-orange text-text-primary ring-signal-orange" : "text-white/75 ring-white/15 hover:text-white")}
                    >
                      {on ? <Check aria-hidden className="mr-1 inline size-3" /> : null}
                      {s}
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <FormField label="A couple of lines about you">
              <textarea value={f.note} onChange={set("note")} className={textareaCls} maxLength={1500} />
            </FormField>
            {error ? <p role="alert" className="text-sm font-semibold text-crimson-bright">{error}</p> : null}
            <button type="submit" className={cn(hb.gold, "w-full")}>
              Next
            </button>
          </form>
        ) : null}

        {step === 2 ? (
          <form onSubmit={next2} className="mt-6 flex flex-col gap-4">
            <p className="rounded-xl bg-black/30 px-3 py-2 font-mono text-sm text-signal-orange ring-1 ring-white/10">{handle}</p>
            <FormField label="Password" hint="At least 10 characters, not one you use anywhere else.">
              <input required type="password" autoComplete="new-password" value={f.password} onChange={set("password")} className={inputCls} />
            </FormField>
            <FormField label="Password again">
              <input required type="password" autoComplete="new-password" value={f.again} onChange={set("again")} className={inputCls} />
            </FormField>
            {error ? <p role="alert" className="text-sm font-semibold text-crimson-bright">{error}</p> : null}
            <div className="flex gap-2">
              <button type="button" onClick={() => setStep(1)} className={hb.quiet}>
                Back
              </button>
              <button type="submit" className={cn(hb.gold, "flex-1")}>
                Next: your face
              </button>
            </div>
          </form>
        ) : null}

        {step === 3 ? (
          <div className="mt-6">
            <FaceCamera key={attempt} mode="enroll" onResult={send} busy={busy} />
            {error ? <p role="alert" className="mt-4 text-center text-sm font-semibold text-crimson-bright">{error}</p> : null}
            <button type="button" onClick={() => setStep(2)} className={cn(hb.quietSm, "mt-6 w-full")}>
              Back
            </button>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="mt-8 flex flex-col items-center gap-3 text-center">
            <CircleCheckBig aria-hidden className="size-14 text-signal-orange" />
            <p className="font-grotesk text-xl font-bold text-white">Application received</p>
            <p className="text-sm leading-relaxed text-white/70">As soon as the prime admin or HR approves it, you can sign in as {handle}.</p>
            <Link href="/hq/login" className={cn(hb.outline, "mt-2")}>
              <Send aria-hidden className="size-4" /> Go to sign in
            </Link>
          </div>
        ) : null}
      </div>
    </GateFrame>
  );
}
