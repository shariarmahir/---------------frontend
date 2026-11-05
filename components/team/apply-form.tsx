"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { Icon } from "@/components/ui/icon";
import { btn } from "@/components/ui/section-kit";
import { findTrack, TRACKS } from "@/data/fellowship";
import { fellowship } from "@/data/team";
import { useAuth } from "@/lib/auth/client";
import { applicationProblems, buildApplication, LEVELS, LIMITS, parseApplication, type ApplicantLevel, type Application, type ApplicationDraft, type DraftProblems } from "@/lib/fellowship";
import { cn } from "@/lib/utils";

const IDS = TRACKS.map((t) => t.id);
const BASE = "kandari-fellowship-v1";
const EVENT = "kandari-fellowship";

/*
 * The applicant's application lives with their Kandari Profile in this
 * browser until Kandari-Lab has a server, one per account. Reads and writes
 * are guarded: blocked storage means nothing is saved, and the form says so.
 */
function readRaw(key: string | null): string {
  if (!key) return "";
  try {
    return window.localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

function save(key: string, value: Application | null): boolean {
  try {
    if (value) window.localStorage.setItem(key, JSON.stringify(value));
    else window.localStorage.removeItem(key);
  } catch {
    return false;
  }
  window.dispatchEvent(new Event(EVENT));
  return true;
}

function parse(raw: string): Application | null {
  if (!raw) return null;
  try {
    return parseApplication(JSON.parse(raw), IDS);
  } catch {
    return null;
  }
}

const FIELD = "w-full rounded-xl bg-black/40 px-4 py-3 text-base text-white ring-1 ring-white/15 ring-inset transition-shadow placeholder:text-white/55 focus:ring-2 focus:ring-signal-orange focus:outline-none aria-invalid:ring-2 aria-invalid:ring-national-crimson [&>option]:bg-bdnavy-900";
const LABEL = "mb-2 block font-sans text-sm font-semibold text-white";
const HINT = "font-normal text-white/65";

function Err({ show, msg }: { show: boolean; msg?: string }) {
  return show && msg ? (
    <span role="alert" className="mt-1.5 flex items-center gap-1.5 font-sans text-sm font-semibold text-white">
      <Icon name="error" filled className="text-lg! text-national-crimson" />
      {msg}
    </span>
  ) : null;
}

/** The status of a sent application, with the way to withdraw it. */
function Sent({ app, onWithdraw }: { app: Application; onWithdraw: () => void }) {
  const [confirm, setConfirm] = useState(false);
  const track = findTrack(app.track);
  const when = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Dhaka" }).format(new Date(app.at));
  return (
    <div className="rounded-3xl bg-bdnavy-900 p-6 ring-1 ring-white/12 sm:p-8">
      <span className="grid size-12 place-items-center rounded-2xl bg-signal-orange text-text-primary">
        <Icon name="task_alt" className="text-2xl!" />
      </span>
      <h3 className="mt-5 font-grotesk text-2xl font-bold text-signal-orange">Application received</h3>
      <p className="mt-2 font-sans text-base leading-relaxed text-white/85">
        Thank you, {app.name.split(" ")[0]}. We announce each cohort on Kandari Profile; your application is with your profile until the call opens.
      </p>
      <dl className="mt-6 grid gap-x-6 gap-y-4 border-t border-white/12 pt-5 font-sans text-sm sm:grid-cols-2">
        <div>
          <dt className="text-white/65">Reference</dt>
          <dd className="mt-0.5 font-semibold text-white tabular-nums">{app.ref}</dd>
        </div>
        <div>
          <dt className="text-white/65">Track</dt>
          <dd className="mt-0.5 font-semibold text-white">{track?.title ?? app.track}</dd>
        </div>
        <div>
          <dt className="text-white/65">Sent</dt>
          <dd className="mt-0.5 font-semibold text-white">{when}</dd>
        </div>
        <div>
          <dt className="text-white/65">Status</dt>
          <dd className="mt-0.5 font-semibold text-white">Waiting for the next cohort call</dd>
        </div>
      </dl>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {confirm ? (
          <>
            <span className="font-sans text-sm font-semibold text-white">Withdraw this application?</span>
            <button type="button" onClick={onWithdraw} className="inline-flex min-h-11 items-center rounded-xl bg-national-crimson px-4 font-sans text-sm font-bold text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none">
              Withdraw
            </button>
            <button type="button" onClick={() => setConfirm(false)} className="inline-flex min-h-11 items-center rounded-xl px-4 font-sans text-sm font-semibold text-white/80 ring-1 ring-white/20 ring-inset hover:text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none">
              Keep it
            </button>
          </>
        ) : (
          <button type="button" onClick={() => setConfirm(true)} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-1 font-sans text-sm font-semibold text-white/75 transition-colors hover:text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none">
            <Icon name="undo" className="text-lg!" /> Withdraw or change track
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * The fellowship application: who you are, the track, why, and something
 * you built. Opening it from a track card (?track=…) picks that track.
 * Signed out, it asks for a Kandari Profile first, since that is where
 * each cohort is announced.
 */
export function ApplyForm() {
  const { ready, account } = useAuth();
  const params = useSearchParams();
  const key = account ? `${BASE}:${account.id}` : null;
  const raw = useSyncExternalStore(subscribe, () => readRaw(key), () => "");
  const sent = parse(raw);
  const asked = params.get("track") ?? "";

  const [d, setD] = useState<ApplicationDraft>({ name: "", contact: "", institution: "", level: "", track: IDS.includes(asked as never) ? asked : "", why: "", link: "", commit: false, consent: false });
  const [seeded, setSeeded] = useState<string | null>(null);
  const [tried, setTried] = useState(false);
  const set = <K extends keyof ApplicationDraft>(k: K, v: ApplicationDraft[K]) => setD((x) => ({ ...x, [k]: v }));

  // Start from the profile once it is known, and follow a track picked on a card.
  if (account && seeded !== account.id) {
    setSeeded(account.id);
    setD((x) => ({ ...x, name: x.name || account.name, contact: x.contact || account.email || account.phone, institution: x.institution || (account.institution ?? "") }));
  }
  const [lastAsked, setLastAsked] = useState(asked);
  if (asked !== lastAsked) {
    setLastAsked(asked);
    if (IDS.includes(asked as never)) setD((x) => ({ ...x, track: asked }));
  }

  const p: DraftProblems = applicationProblems(d, IDS);
  const show = (k: keyof DraftProblems) => tried && Boolean(p[k]);

  if (!ready) return <div className="h-96 animate-pulse rounded-3xl bg-bdnavy-900 motion-reduce:animate-none" aria-label="Loading" />;

  if (!account) {
    const next = encodeURIComponent("/team/fellowship#apply");
    return (
      <div className="rounded-3xl bg-bdnavy-900 p-6 ring-1 ring-white/12 sm:p-8">
        <h3 className="font-grotesk text-2xl font-bold text-signal-orange">Apply with your Kandari Profile</h3>
        <p className="mt-3 font-sans text-base leading-relaxed text-white/85">
          Every cohort is announced on Kandari Profile, and your application stays with it. Log in, or create a free profile in a minute.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/login?next=${next}`} className={btn.gold}>
            <Icon name="login" className="text-xl!" /> Log in to apply
          </Link>
          <Link href={`/signup?role=researcher&next=${next}`} className={btn.goldOutline}>
            Create a profile
          </Link>
        </div>
      </div>
    );
  }

  if (sent) {
    return (
      <Sent
        app={sent}
        onWithdraw={() => {
          if (key && save(key, null)) toast.success("Application withdrawn", { description: "You can apply again, on any track, until the call closes." });
        }}
      />
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTried(true);
    if (Object.keys(p).length > 0) {
      toast.error("A few answers still need attention", { description: Object.values(p)[0] });
      requestAnimationFrame(() => document.querySelector("#apply [aria-invalid=true]")?.scrollIntoView({ behavior: "smooth", block: "center" }));
      return;
    }
    const app = buildApplication(d, { now: new Date(), rand: crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32 });
    if (!key || !save(key, app)) return toast.error("This browser would not save it", { description: "Check that storage is allowed for this site, then try again." });
    toast.success("Application received", { description: `Reference ${app.ref}` });
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6 rounded-3xl bg-bdnavy-900 p-5 ring-1 ring-white/12 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={LABEL}>Full name</span>
          <input className={FIELD} value={d.name} maxLength={LIMITS.name[1]} autoComplete="name" onChange={(e) => set("name", e.target.value)} aria-invalid={show("name")} />
          <Err show={show("name")} msg={p.name} />
        </label>
        <label className="block">
          <span className={LABEL}>Email or mobile</span>
          <input className={FIELD} value={d.contact} autoComplete="email" onChange={(e) => set("contact", e.target.value)} placeholder="you@example.com or 01XXXXXXXXX" aria-invalid={show("contact")} />
          <Err show={show("contact")} msg={p.contact} />
        </label>
        <label className="block">
          <span className={LABEL}>University, college or workplace</span>
          <input className={FIELD} value={d.institution} maxLength={LIMITS.institution[1]} autoComplete="organization" onChange={(e) => set("institution", e.target.value)} aria-invalid={show("institution")} />
          <Err show={show("institution")} msg={p.institution} />
        </label>
        <label className="block">
          <span className={LABEL}>Where you are now</span>
          <select className={FIELD} value={d.level} onChange={(e) => set("level", e.target.value as ApplicantLevel)} aria-invalid={show("level")}>
            <option value="">Choose</option>
            {(Object.keys(LEVELS) as ApplicantLevel[]).map((l) => <option key={l} value={l}>{LEVELS[l]}</option>)}
          </select>
          <Err show={show("level")} msg={p.level} />
        </label>
      </div>

      <fieldset>
        <legend className={LABEL}>Track</legend>
        <div role="radiogroup" aria-invalid={show("track")} className="grid gap-2 sm:grid-cols-2">
          {TRACKS.map((t) => {
            const on = d.track === t.id;
            return (
              <label key={t.id} className={cn("flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 ring-1 ring-inset transition-[background-color,color,box-shadow] duration-300 has-focus-visible:ring-2 has-focus-visible:ring-signal-orange motion-reduce:transition-none", on ? "bg-signal-orange text-text-primary ring-signal-orange" : "text-white ring-white/15 hover:ring-signal-orange/60")}>
                <input type="radio" name="track" className="sr-only" checked={on} onChange={() => set("track", t.id)} />
                <Icon name={t.icon} filled={on} className={cn("text-2xl!", !on && "text-signal-orange")} />
                <span className="min-w-0">
                  <span className="block font-grotesk text-sm font-bold">{t.title}</span>
                  <span className={cn("block font-sans text-xs", on ? "text-text-primary/80" : "text-white/65")}>{t.project}</span>
                </span>
              </label>
            );
          })}
        </div>
        <Err show={show("track")} msg={p.track} />
      </fieldset>

      <label className="block">
        <span className={LABEL}>
          Why this track? <span className={HINT}>(the problem you care about, and what you would try; {d.why.trim().length}/{LIMITS.why[1]})</span>
        </span>
        <textarea rows={5} className={cn(FIELD, "leading-relaxed")} value={d.why} maxLength={LIMITS.why[1] + 40} onChange={(e) => set("why", e.target.value)} aria-invalid={show("why")} />
        <Err show={show("why")} msg={p.why} />
      </label>

      <label className="block">
        <span className={LABEL}>
          Something you built <span className={HINT}>(optional: a GitHub repo, a video, a paper, a portfolio)</span>
        </span>
        <input className={FIELD} type="url" inputMode="url" value={d.link} maxLength={LIMITS.link} onChange={(e) => set("link", e.target.value)} placeholder="https://" aria-invalid={show("link")} />
        <Err show={show("link")} msg={p.link} />
      </label>

      <div className="space-y-3 border-t border-white/12 pt-6">
        <label className={cn("flex cursor-pointer items-start gap-3 rounded-2xl p-3 ring-1 ring-inset", show("commit") ? "ring-2 ring-national-crimson" : "ring-white/12")}>
          <input type="checkbox" checked={d.commit} onChange={(e) => set("commit", e.target.checked)} className="mt-1 size-4.5 shrink-0 accent-signal-orange" aria-invalid={show("commit")} />
          <span className="font-sans text-sm leading-relaxed text-white/85">I can commit to the full {fellowship.cycle} of a cohort.</span>
        </label>
        <label className={cn("flex cursor-pointer items-start gap-3 rounded-2xl p-3 ring-1 ring-inset", show("consent") ? "ring-2 ring-national-crimson" : "ring-white/12")}>
          <input type="checkbox" checked={d.consent} onChange={(e) => set("consent", e.target.checked)} className="mt-1 size-4.5 shrink-0 accent-signal-orange" aria-invalid={show("consent")} />
          <span className="font-sans text-sm leading-relaxed text-white/85">Kandari-Lab may contact me about this application and the next cohort.</span>
        </label>
        <Err show={show("commit")} msg={p.commit} />
        <Err show={show("consent")} msg={p.consent} />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className={btn.gold}>
          <Icon name="send" className="text-xl!" /> Send application
        </button>
        <p className="max-w-md font-sans text-xs leading-relaxed text-white/65">Until Kandari-Lab&apos;s server is live, your application is kept with your Kandari Profile on this browser.</p>
      </div>
    </form>
  );
}
