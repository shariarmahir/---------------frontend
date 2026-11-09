"use client";

import { useRouter } from "next/navigation";
import { Bell, Camera, Database, FlaskConical, LogOut, ScanFace, ShieldCheck, Trash2, Upload, User } from "lucide-react";
import { useRef, useState, useSyncExternalStore } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { SKILLS } from "@/data/hq/people";
import { DataTable } from "@/components/hq/data-table";
import { HqDialog } from "@/components/hq/dialog";
import { nameOf, usePeople } from "@/components/hq/hooks";
import { Avatar, FormField, hb, inputCls, PageHead, Panel, Pill, Toggle, type Tone } from "@/components/hq/kit";
import { useAct, useHq, useNow } from "@/components/hq/provider";
import { ago, dateTimeLabel } from "@/lib/hq/format";
import { DEPT_LABEL, LEVEL_LABEL } from "@/lib/hq/rules";
import type { AuditEntry, AuditKind } from "@/lib/hq/types";
import { cn } from "@/lib/utils";

const AUDIT_TONE: Partial<Record<AuditKind, Tone>> = { "login-fail": "red", "face-fail": "red", locked: "red", login: "gold", "face-ok": "gold", "face-enrolled": "cobalt", perm: "navy", designation: "navy", security: "navy" };
const AUDIT_LABEL: Record<AuditKind, string> = { login: "Signed in", "login-fail": "Sign-in failed", locked: "Locked out", "face-ok": "Face matched", "face-fail": "Face didn't match", "face-enrolled": "Face enrolled", logout: "Signed out", apply: "ID application", perm: "Permissions", designation: "Designation", approve: "Approved", reject: "Rejected", export: "Export", delete: "Deleted", security: "Security setting" };

function device(ua?: string): string {
  if (!ua) return "—";
  const os = /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Windows/.test(ua) ? "Windows" : /Mac OS/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "Device";
  const browser = /Edg\//.test(ua) ? "Edge" : /HeadlessChrome/.test(ua) ? "Headless Chrome" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Browser";
  return `${browser} · ${os}`;
}

/** The security log (audit.view). */
export function SecurityLog() {
  const audit = useHq((v) => v.audit);
  const act = useAct();
  const people = usePeople();
  const now = useNow(60_000);
  const [kind, setKind] = useState<AuditKind | "">("");
  const rows = [...audit].reverse().filter((a) => !kind || a.kind === kind);
  const failures = audit.filter((a) => (a.kind === "login-fail" || a.kind === "face-fail" || a.kind === "locked") && Date.parse(a.at) > now - 7 * 86400_000).length;
  const columns: ColumnDef<AuditEntry, unknown>[] = [
    { accessorKey: "at", header: "When", cell: (c) => <span className="font-mono text-xs whitespace-nowrap">{dateTimeLabel(c.row.original.at)}</span> },
    { accessorKey: "kind", header: "What", cell: (c) => <Pill tone={AUDIT_TONE[c.row.original.kind] ?? "muted"}>{AUDIT_LABEL[c.row.original.kind]}</Pill> },
    { id: "who", accessorFn: (a) => nameOf(people, a.actor), header: "Who", cell: (c) => <span className="flex items-center gap-2 whitespace-nowrap"><Avatar person={people.get(c.row.original.actor ?? "")} size="xs" />{nameOf(people, c.row.original.actor)}</span> },
    { accessorKey: "ip", header: "IP", cell: (c) => <span className="font-mono text-xs">{c.row.original.ip ?? "—"}</span> },
    { id: "device", accessorFn: (a) => device(a.ua), header: "Device" },
    { accessorKey: "detail", header: "Detail", cell: (c) => <span className="text-white/70">{c.row.original.detail ?? ""}{c.row.original.target ? ` → ${nameOf(people, c.row.original.target)}` : ""}</span> },
  ];
  return (
    <>
      <PageHead title="Security Log" lead={`Every sign-in, face check, lock-out, permission and designation change. ${failures} failed attempts in the last 7 days.`} />
      <Panel title="Events" icon={ShieldCheck}>
        <DataTable
          data={rows}
          columns={columns}
          search="Search the log…"
          pageSize={20}
          toolbar={
            <select aria-label="Event kind" value={kind} onChange={(e) => setKind(e.target.value as AuditKind | "")} className={cn(inputCls, "min-h-10 w-auto")}>
              <option value="">Every event</option>
              {Object.entries(AUDIT_LABEL).map(([k, l]) => (
                <option key={k} value={k}>
                  {l}
                </option>
              ))}
            </select>
          }
          csv={{ name: "kandari-security-log", row: (a) => ({ at: a.at, event: AUDIT_LABEL[a.kind], who: nameOf(people, a.actor), ip: a.ip ?? "", device: device(a.ua), detail: a.detail ?? "" }), onExport: () => act("system", "audit.export", {}, { quiet: true }).catch(() => {}) }}
        />
      </Panel>
    </>
  );
}

function notificationState(): string {
  return typeof Notification === "undefined" ? "unsupported" : Notification.permission;
}

/** Downscales a picked image to a ≤ 400 KB square JPEG data URL. */
async function shrink(file: File): Promise<string> {
  const img = await createImageBitmap(file);
  const size = 320;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const side = Math.min(img.width, img.height);
  ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
  let q = 0.86;
  let url = canvas.toDataURL("image/jpeg", q);
  while (url.length > 400_000 && q > 0.4) {
    q -= 0.1;
    url = canvas.toDataURL("image/jpeg", q);
  }
  return url;
}

/** The prime admin's switch for the labelled sample records that fill every page until real work starts. */
function SampleData() {
  const act = useAct();
  const samples = useHq((v) => v.tasks.some((t) => t.sample) || v.clients.some((c) => c.sample) || v.txns.some((t) => t.sample));
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  if (!samples) return null;
  return (
    <Panel title="Sample data" icon={Database} field="ink">
      <p className="text-sm leading-relaxed text-white/75">Sample tasks, clients, money, events and stories fill every page so HQ can be tried. Clear them once real work starts; real records stay.</p>
      <button type="button" onClick={() => setOpen(true)} className={cn(hb.quiet, "mt-3")}>
        <Trash2 aria-hidden className="size-4" /> Clear sample data
      </button>
      <HqDialog
        open={open}
        onOpenChange={setOpen}
        title="Clear all sample data?"
        description="Sample records are removed for everyone. Real records stay. Type DELETE to confirm."
        size="sm"
        footer={
          <>
            <button type="button" onClick={() => setOpen(false)} className={hb.quiet}>
              Cancel
            </button>
            <button
              type="button"
              disabled={typed !== "DELETE"}
              onClick={() =>
                act<number>("system", "samples.clear", { confirm: "DELETE" }, { ok: "Sample data cleared" }).then(
                  () => {
                    setOpen(false);
                    setTyped("");
                  },
                  () => {},
                )
              }
              className={hb.danger}
            >
              Clear sample data
            </button>
          </>
        }
      >
        <input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="DELETE" className={inputCls} aria-label="Type DELETE to confirm" />
      </HqDialog>
    </Panel>
  );
}

export function Settings() {
  const v = useHq();
  const act = useAct();
  const router = useRouter();
  const me = v.me.person;
  const [phone, setPhone] = useState(me.phone ?? "");
  const [skills, setSkills] = useState<string[]>(me.skills);
  const [learning, setLearning] = useState<string[]>(me.learning);
  const [reenrol, setReenrol] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const permission = useSyncExternalStore(
    (cb) => {
      const t = setInterval(cb, 2000);
      return () => clearInterval(t);
    },
    notificationState,
    () => "default",
  );
  const mine = v.audit.filter((a) => a.actor === me.id && ["login", "login-fail", "face-ok", "face-fail", "locked", "logout", "face-enrolled"].includes(a.kind)).slice(-10).reverse();
  const now = useNow(60_000);
  const demos = v.people.filter((p) => p.demo && p.status === "active").length;

  const chips = (value: string[], set: (v: string[]) => void, label: string) => (
    <fieldset>
      <legend className="text-sm font-semibold text-white/85">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {SKILLS.map((s) => {
          const on = value.includes(s);
          return (
            <button key={s} type="button" aria-pressed={on} onClick={() => set(on ? value.filter((x) => x !== s) : [...value, s])} className={cn("min-h-8 rounded-full px-3 text-xs font-semibold ring-1", on ? "bg-signal-orange text-text-primary ring-signal-orange" : "text-white/75 ring-white/15")}>
              {s}
            </button>
          );
        })}
      </div>
    </fieldset>
  );

  return (
    <>
      <PageHead title="Settings" lead="Your profile, alerts and sign-in security." />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <Panel title="Profile" icon={User} className="xl:col-span-7">
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-4">
              <Avatar person={me} size="xl" />
              <div>
                <p className="font-grotesk text-xl font-bold text-white">{me.name}</p>
                <p className="text-sm text-white/65">
                  {me.designation} · {LEVEL_LABEL[me.level]} · {DEPT_LABEL[me.dept]}
                </p>
                <p className="font-mono text-xs text-signal-orange">
                  {me.handle} · {me.memberId}
                </p>
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => file.current?.click()} className={hb.outlineSm}>
                    <Upload aria-hidden className="size-3.5" /> New photo
                  </button>
                  {me.photo ? (
                    <button type="button" onClick={() => act("me", "profile", { photo: null }, { ok: "Photo removed" })} className={hb.quietSm}>
                      Remove
                    </button>
                  ) : null}
                </div>
                <input
                  ref={file}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    try {
                      const photo = await shrink(f);
                      await act("me", "profile", { photo }, { ok: "Photo updated" });
                    } catch {
                      toast.error("That image couldn't be used.");
                    }
                  }}
                />
              </div>
            </div>
            <FormField label="Mobile">
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} inputMode="tel" />
            </FormField>
            {chips(skills, setSkills, "My skills (tickets and help requests match these)")}
            {chips(learning, setLearning, "Skills I'm learning (for weekly learning projects)")}
            <button type="button" onClick={() => act("me", "profile", { phone, skills, learning }, { ok: "Profile saved" })} className={cn(hb.gold, "self-start")}>
              Save profile
            </button>
          </div>
        </Panel>
        <div className="flex flex-col gap-5 xl:col-span-5">
          <Panel title="Alerts" icon={Bell} field="cobalt">
            <p className="text-sm text-white/80">Browser notifications for urgent messages, mentions, meetings and help requests when HQ is in the background.</p>
            <p className="mt-2 text-sm">
              Status: <strong className="text-signal-orange">{permission === "granted" ? "on" : permission === "denied" ? "blocked in the browser" : permission === "unsupported" ? "not supported here" : "not set"}</strong>
            </p>
            {permission === "default" ? (
              <button type="button" onClick={() => Notification.requestPermission()} className={cn(hb.gold, "mt-3")}>
                <Bell aria-hidden className="size-4" /> Allow alerts
              </button>
            ) : null}
          </Panel>
          <Panel title="Security" icon={ShieldCheck} field="ink">
            <div className="flex flex-col gap-3">
              {v.me.isPrime ? (
                <div className="flex items-start gap-3 rounded-xl bg-black/30 p-3 ring-1 ring-white/10">
                  <ScanFace aria-hidden className="mt-0.5 size-5 shrink-0 text-signal-orange" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">Face lock at sign-in</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-white/65">
                      {v.faceLock ? "On: everyone signs in with password and face. Members without a face on record add it at their next sign-in." : "Off: a username and password are enough. Turn it on once everyone has a front camera."}
                    </p>
                  </div>
                  <Toggle on={v.faceLock} label="Face lock at sign-in" onChange={() => act("system", "faceLock.set", { on: !v.faceLock }, { ok: v.faceLock ? "Face lock off" : "Face lock on" })} />
                </div>
              ) : null}
              <p className="text-sm text-white/70">Password changes aren&apos;t self-service yet — ask the super prime admin.</p>
              {v.faceLock ? (
                <button type="button" onClick={() => setReenrol(true)} className={hb.outline}>
                  <ScanFace aria-hidden className="size-4" /> Re-enrol my face
                </button>
              ) : null}
              <button
                type="button"
                onClick={async () => {
                  await fetch("/api/hq/auth/logout", { method: "POST", body: JSON.stringify({ everywhere: true }) });
                  router.replace("/hq/login");
                }}
                className={hb.quiet}
              >
                <LogOut aria-hidden className="size-4" /> Sign out of all devices
              </button>
            </div>
          </Panel>
          {v.me.isPrime && demos > 0 ? (
            <Panel title="Demo sign-ins are on" icon={FlaskConical} field="cobalt">
              <p className="text-sm leading-relaxed text-white/80">
                {demos} demo accounts, one per level below yours, share one open password, and the sign-in page shows it. Set <code className="font-mono text-signal-orange">HQ_DEMO_PASSWORD=off</code> on the server before the real team signs in.
              </p>
            </Panel>
          ) : null}
          {v.me.isPrime ? <SampleData /> : null}
          <Panel title="My recent sign-ins" icon={Camera}>
            {mine.length === 0 ? <p className="text-sm text-white/60">Nothing yet.</p> : null}
            <ul className="flex flex-col gap-2">
              {mine.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center gap-2 text-sm">
                  <Pill tone={AUDIT_TONE[a.kind] ?? "muted"}>{AUDIT_LABEL[a.kind]}</Pill>
                  <span className="text-white/70">{device(a.ua)}</span>
                  <span className="ml-auto text-xs text-white/50">{ago(a.at, now)}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
      <HqDialog
        open={reenrol}
        onOpenChange={setReenrol}
        title="Re-enrol your face"
        description="Confirm your password. You'll be signed out, and your next sign-in takes three new captures."
        size="sm"
        footer={
          <button
            type="button"
            disabled={!password || busy}
            onClick={async () => {
              setBusy(true);
              const res = await fetch("/api/hq/auth/reenroll", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
              const data = (await res.json().catch(() => ({}))) as { error?: string };
              setBusy(false);
              if (!res.ok) return toast.error(data.error ?? "That didn't work.");
              router.replace("/hq/login");
            }}
            className={hb.gold}
          >
            Confirm & sign out
          </button>
        }
      >
        <FormField label="Password">
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" className={inputCls} />
        </FormField>
      </HqDialog>
    </>
  );
}
