"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, FlaskConical, KeyRound, LoaderCircle, LockKeyhole, ScanFace, UserRound } from "lucide-react";
import { type ReactNode, useCallback, useState } from "react";
import type { DemoOffer } from "@/lib/hq/server/demo";
import { cn } from "@/lib/utils";
import { FaceCamera } from "./face-camera";
import { FormField, hb, inputCls } from "./kit";

/** The sign-in pages' frame: the brand on a navy field at the left (from lg), the form at the right. */
export function GateFrame({ faceLock, children }: { faceLock: boolean; children: ReactNode }) {
  const steps = [
    { icon: UserRound, t: "Username" },
    { icon: KeyRound, t: "Password" },
    ...(faceLock ? [{ icon: ScanFace, t: "Face check" }] : []),
  ];
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-bdnavy-900 p-10 ring-1 ring-white/10 lg:flex xl:p-14">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo/kandari-logo.png" alt="Kandari Lab" width={120} height={72} className="logo-on-navy h-14 w-auto" priority />
        </Link>
        <div>
          <p className="font-grotesk text-5xl leading-tight font-bold text-signal-orange xl:text-6xl">HQ</p>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-white/80">TaskBook, teams, chat, calendars, HR, clients and finance — the whole of Kandari Lab in one brain.</p>
          <p className="mt-10 font-grotesk text-2xl font-bold text-white">We turn problems into economy.</p>
        </div>
        <ul className={cn("grid gap-3 text-sm text-white/75", faceLock ? "grid-cols-3" : "grid-cols-2")}>
          {steps.map((x) => (
            <li key={x.t} className="flex items-center gap-2 rounded-xl bg-black/30 px-3 py-3 ring-1 ring-white/10">
              <x.icon aria-hidden className="size-4.5 text-signal-orange" /> {x.t}
            </li>
          ))}
        </ul>
      </aside>
      <main className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}

type Step = "id" | "face" | "enroll";

/**
 * Username and password, then (while the prime admin's face lock is on) the
 * face check. With demo sign-ins on, a panel under the form signs in as any
 * level in one click.
 */
export function LoginForm({ faceLock, demo }: { faceLock: boolean; demo: DemoOffer | null }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const target = next && next.startsWith("/hq") && !next.startsWith("//") ? next : "/hq";
  const [step, setStep] = useState<Step>("id");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [demoBusy, setDemoBusy] = useState<string | null>(null);

  const signIn = useCallback(async (ident: string, pass: string) => {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/hq/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: ident, password: pass }) });
    const data = (await res.json().catch(() => ({}))) as { next?: string; error?: string; name?: string };
    if (res.ok && data.next === "in") {
      // Stay busy while the dashboard loads.
      router.replace(target);
      return;
    }
    setBusy(false);
    setDemoBusy(null);
    if (!res.ok) return setError(data.error ?? "Sign-in failed.");
    setName(data.name ?? "");
    setStep(data.next === "enroll" ? "enroll" : "face");
  }, [router, target]);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    void signIn(id, password);
  };
  const asDemo = (handle: string) => {
    if (!demo || busy) return;
    setId(handle);
    setPassword(demo.password);
    setDemoBusy(handle);
    void signIn(handle, demo.password);
  };

  const sendFace = useCallback(
    async (descriptors: number[][]) => {
      setBusy(true);
      setError(null);
      const body = step === "enroll" ? { captures: descriptors } : { descriptor: descriptors[0] };
      const res = await fetch("/api/hq/auth/face", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = (await res.json().catch(() => ({}))) as { next?: string; error?: string };
      setBusy(false);
      if (res.ok && data.next === "in") return router.replace(target);
      setError(data.error ?? "The face check failed.");
      if (res.status === 401 && data.error?.includes("expired")) return setStep("id");
      if (res.status === 429) return setStep("id");
      setAttempt((a) => a + 1);
    },
    [step, router, target],
  );

  return (
    <GateFrame faceLock={faceLock}>
      <div className="mb-8 lg:hidden">
        <p className="font-grotesk text-4xl font-bold text-signal-orange">HQ</p>
        <p className="mt-1 text-sm text-white/65">We turn problems into economy.</p>
      </div>

      {faceLock ? (
        <ol aria-label="Steps" className="mb-6 flex gap-2">
          {["Username & password", "Face check"].map((t, i) => {
            const on = (i === 0 && step === "id") || (i === 1 && step !== "id");
            const done = i === 0 && step !== "id";
            return (
              <li key={t} className={cn("flex-1 rounded-xl px-3 py-2 text-xs font-bold ring-1", on ? "bg-signal-orange text-text-primary ring-signal-orange" : done ? "bg-bdnavy-900 text-signal-orange ring-white/12" : "text-white/55 ring-white/12")}>
                {i + 1}. {t}
              </li>
            );
          })}
        </ol>
      ) : null}

      {step === "id" ? (
        <form onSubmit={submit} className="rounded-2xl bg-bdnavy-900 p-6 ring-1 ring-white/12 sm:p-8">
          <h1 className="font-grotesk text-2xl font-bold text-signal-orange">Sign in</h1>
          <p className="mt-1 text-sm text-white/65">For Kandari Lab members only.</p>
          <div className="mt-6 flex flex-col gap-4">
            <FormField label="Username or email" hint="e.g. kandari@ishtiak-creatives">
              <input value={id} onChange={(e) => setId(e.target.value)} autoComplete="username" required autoFocus className={inputCls} placeholder="kandari@name-dept" />
            </FormField>
            <FormField label="Password">
              <span className="relative block">
                <input value={password} onChange={(e) => setPassword(e.target.value)} type={show ? "text" : "password"} autoComplete="current-password" required className={cn(inputCls, "pr-12")} />
                <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute top-1/2 right-1 grid size-10 -translate-y-1/2 place-items-center rounded-lg text-white/60 hover:text-signal-orange">
                  {show ? <EyeOff aria-hidden className="size-4.5" /> : <Eye aria-hidden className="size-4.5" />}
                </button>
              </span>
            </FormField>
            {error ? (
              <p role="alert" className="rounded-xl bg-national-crimson/15 px-3 py-2 text-sm font-semibold text-crimson-bright ring-1 ring-national-crimson/40">
                {error}
              </p>
            ) : null}
            <button type="submit" disabled={busy} className={cn(hb.gold, "w-full")}>
              <LockKeyhole aria-hidden className="size-4" /> {busy ? "Checking…" : faceLock ? "Next: face check" : "Sign in"}
            </button>
          </div>
          <p className="mt-6 text-center text-sm text-white/65">
            No ID yet?{" "}
            <Link href="/hq/apply" className="font-semibold text-signal-orange hover:underline">
              Apply for a member ID <ArrowRight aria-hidden className="inline size-3.5" />
            </Link>
          </p>
        </form>
      ) : (
        <div className="rounded-2xl bg-bdnavy-900 p-6 ring-1 ring-white/12 sm:p-8">
          <h1 className="font-grotesk text-2xl font-bold text-signal-orange">{step === "enroll" ? "First time: add your face" : `Face check${name ? `, ${name}` : ""}`}</h1>
          <p className="mt-1 mb-6 text-sm leading-relaxed text-white/65">
            {step === "enroll" ? "The front camera takes three captures of your face; every later sign-in is checked against them." : "Look straight at the front camera. You're in as soon as your face matches."}
          </p>
          <FaceCamera key={attempt} mode={step === "enroll" ? "enroll" : "verify"} onResult={sendFace} busy={busy} />
          {error ? (
            <p role="alert" className="mt-4 rounded-xl bg-national-crimson/15 px-3 py-2 text-center text-sm font-semibold text-crimson-bright ring-1 ring-national-crimson/40">
              {error}
            </p>
          ) : null}
          <button type="button" onClick={() => setStep("id")} className={cn(hb.quietSm, "mt-6 w-full")}>
            Use another account
          </button>
        </div>
      )}

      {demo && step === "id" ? (
        <section aria-labelledby="demo-title" className="mt-5 rounded-2xl bg-text-primary p-5 ring-1 ring-white/12 sm:p-6">
          <h2 id="demo-title" className="flex items-center gap-2 font-grotesk text-lg font-bold text-signal-orange">
            <FlaskConical aria-hidden className="size-5" /> Demo accounts
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-white/65">
            Try HQ as any level, one click each. They all use the password <code className="rounded-md bg-white/8 px-1.5 py-0.5 font-mono text-sm text-signal-orange">{demo.password}</code>
          </p>
          <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {demo.logins.map((d) => (
              <li key={d.handle}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => asDemo(d.handle)}
                  aria-label={`Sign in as ${d.label} (${d.handle})`}
                  className="group flex w-full items-center gap-3 rounded-xl bg-bdnavy-900 px-3.5 py-2.5 text-left ring-1 ring-white/12 transition hover:-translate-y-0.5 hover:ring-signal-orange/60 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-white">{d.label}</span>
                    <span className="block truncate font-mono text-xs text-signal-orange/90">{d.handle}</span>
                  </span>
                  {demoBusy === d.handle ? (
                    <LoaderCircle aria-hidden className="size-4 shrink-0 animate-spin text-signal-orange motion-reduce:animate-none" />
                  ) : (
                    <ArrowRight aria-hidden className="size-4 shrink-0 text-white/40 transition-colors group-hover:text-signal-orange" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </GateFrame>
  );
}
