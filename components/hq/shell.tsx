"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, CalendarPlus, ClipboardPlus, LifeBuoy, LogOut, Menu, NotebookPen, Plus, Search, X } from "lucide-react";
import { Dialog as D, DropdownMenu as DM } from "radix-ui";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { HQ_NAV, NAV_ALL, type NavItem } from "@/data/hq/nav";
import { ago } from "@/lib/hq/format";
import { can, dhakaDay, LEVEL_LABEL } from "@/lib/hq/rules";
import type { HqView, Notice } from "@/lib/hq/types";
import { channelVisible } from "@/lib/hq/view";
import { cn } from "@/lib/utils";
import { Avatar, hb, inputCls } from "./kit";
import { useAct, useHq, useNow } from "./provider";
import { MeetingAlarms } from "./time/alarms";
import { CheckinPill } from "./time/checkin-pill";

/**
 * The HQ frame: a sidebar of everything the member may open (filtered by
 * their access), a top bar with search (Ctrl+K), office check-in, alerts and
 * quick add, and the page. On phones the sidebar slides in from the left.
 */

function visible(item: NavItem, v: HqView): boolean {
  if (!item.perm) return true;
  if (item.perm === "prime") return v.me.isPrime;
  return can(v.me.person, item.perm);
}

function useCounts() {
  const v = useHq();
  return useMemo(() => {
    const me = v.me.person.id;
    let chat = 0;
    for (const c of v.channels) {
      if (!channelVisible(c, me) || c.archived) continue;
      const read = v.reads[`${me}:${c.id}`] ?? "";
      for (const m of v.messages) if (m.channelId === c.id && m.by !== me && !m.deleted && m.at > read) chat++;
    }
    return {
      chat,
      approvals: v.approvals.filter((a) => a.status === "pending" && a.by !== me && (v.me.isPrime || v.me.perms.includes(a.perm))).length,
      help: v.help.filter((h) => h.status === "open" && h.by !== me && h.capable.includes(me)).length,
      notices: v.notices.filter((n) => !n.read).length,
    };
  }, [v]);
}

function isActive(path: string, href: string) {
  return href === "/hq" ? path === "/hq" : path === href || path.startsWith(`${href}/`);
}

function Brand() {
  return (
    <Link href="/hq" className="flex items-center gap-3 rounded-xl px-2 py-1 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none">
      <Image src="/logo/kandari-logo.png" alt="" width={84} height={51} className="logo-on-navy h-9 w-auto" priority />
      <span className="font-grotesk text-lg leading-tight font-bold text-signal-orange">Kandari HQ</span>
    </Link>
  );
}

function SideNav({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname();
  const v = useHq();
  const counts = useCounts();
  return (
    <nav aria-label="HQ" className="flex flex-col gap-6">
      {HQ_NAV.map((g) => {
        const items = g.items.filter((i) => visible(i, v));
        if (items.length === 0) return null;
        return (
          <div key={g.label}>
            <p className="mb-1.5 px-3 text-xs font-semibold text-white/45">{g.label}</p>
            <ul className="flex flex-col gap-0.5">
              {items.map((i) => {
                const active = isActive(path, i.href);
                const n = i.count ? counts[i.count] : 0;
                return (
                  <li key={i.href}>
                    <Link
                      href={i.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none",
                        active ? "bg-bdnavy-900 text-signal-orange ring-1 ring-white/12" : "text-white/75 hover:bg-white/6 hover:text-white",
                      )}
                    >
                      {active ? <span aria-hidden className="absolute top-2 bottom-2 left-0 w-1 rounded-r-full bg-signal-orange" /> : null}
                      <i.icon aria-hidden className="size-4.5 shrink-0" />
                      <span className="min-w-0 flex-1 truncate">{i.label}</span>
                      {n > 0 ? (
                        <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold tabular-nums", i.count === "help" ? "bg-national-crimson text-white" : "bg-signal-orange text-text-primary")}>{n > 99 ? "99+" : n}</span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

function MeCard() {
  const me = useHq((v) => v.me.person);
  const router = useRouter();
  const out = async () => {
    await fetch("/api/hq/auth/logout", { method: "POST", body: "{}" });
    router.replace("/hq/login");
  };
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-bdnavy-900 p-3 ring-1 ring-white/12">
      <Link href={`/hq/people/${me.id}`} className="flex min-w-0 flex-1 items-center gap-3 rounded-lg focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none">
        <Avatar person={me} size="md" />
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold text-white">{me.name}</span>
          <span className="block truncate text-xs text-white/60">{me.designation}</span>
        </span>
      </Link>
      <button type="button" onClick={out} aria-label="Sign out" className={hb.iconSm}>
        <LogOut aria-hidden className="size-4" />
      </button>
    </div>
  );
}

/* ───────────── search (Ctrl+K) ───────────── */

function Palette({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const v = useHq();
  const router = useRouter();
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    const pages = NAV_ALL.filter((i) => visible(i, v)).map((i) => ({ href: i.href, title: i.label, kind: "Page" }));
    const people = v.people.map((p) => ({ href: `/hq/people/${p.id}`, title: `${p.name} · ${p.handle}`, kind: p.designation }));
    const tasks = v.tasks.map((t) => ({ href: `/hq/tasks/${t.id}`, title: `${t.code} ${t.title}`, kind: "Task" }));
    const teams = v.teams.map((t) => ({ href: `/hq/teams/${t.id}`, title: t.name, kind: "Team" }));
    const clients = v.clients.map((c) => ({ href: `/hq/clients/${c.id}`, title: `${c.name} · ${c.org}`, kind: "Client" }));
    const all = [...pages, ...people, ...tasks, ...teams, ...clients];
    if (!s) return pages.slice(0, 10);
    return all.filter((r) => `${r.title} ${r.kind}`.toLowerCase().includes(s)).slice(0, 12);
  }, [q, v]);
  const go = (href: string) => {
    onOpenChange(false);
    setQ("");
    router.push(href);
  };
  return (
    <D.Root open={open} onOpenChange={onOpenChange}>
      <D.Portal>
        <D.Overlay className="fixed inset-0 z-[90] bg-black/70" />
        <D.Content className="hq fixed inset-x-3 top-[10vh] z-[91] mx-auto max-w-xl rounded-2xl bg-bdnavy-900 p-3 text-white shadow-2xl ring-1 ring-white/15 focus:outline-none">
          <D.Title className="sr-only">Search</D.Title>
          <D.Description className="sr-only">Search pages, people, tasks, teams or clients</D.Description>
          <label className="relative block">
            <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-white/45" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && results[0]) go(results[0].href);
              }}
              placeholder="Pages, people, tasks, teams, clients…"
              className={cn(inputCls, "min-h-12 pl-10 text-base")}
            />
          </label>
          <ul className="mt-2 max-h-[55vh] overflow-y-auto">
            {results.length === 0 ? <li className="px-3 py-6 text-center text-sm text-white/60">Nothing found.</li> : null}
            {results.map((r) => (
              <li key={r.href}>
                <button type="button" onClick={() => go(r.href)} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm hover:bg-white/8 focus-visible:bg-white/8 focus-visible:outline-none">
                  <span className="min-w-0 flex-1 truncate font-semibold">{r.title}</span>
                  <span className="shrink-0 text-xs text-white/50">{r.kind}</span>
                </button>
              </li>
            ))}
          </ul>
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}

/* ───────────── alerts ───────────── */

function Bell_({ notices }: { notices: Notice[] }) {
  const act = useAct();
  const now = useNow();
  const unread = notices.filter((n) => !n.read).length;
  const list = [...notices].reverse().slice(0, 30);
  return (
    <DM.Root>
      <DM.Trigger aria-label={`Alerts${unread ? `, ${unread} new` : ""}`} className={cn(hb.icon, "relative")}>
        <Bell aria-hidden className="size-5" />
        {unread ? <span className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-signal-orange px-1 text-xs font-bold text-text-primary">{unread > 9 ? "9+" : unread}</span> : null}
      </DM.Trigger>
      <DM.Portal>
        <DM.Content align="end" sideOffset={8} className="hq z-[70] w-[min(24rem,calc(100vw-1.5rem))] rounded-2xl bg-bdnavy-900 p-2 text-white shadow-2xl ring-1 ring-white/15">
          <div className="flex items-center justify-between px-2 py-1.5">
            <p className="font-grotesk text-sm font-bold text-signal-orange">Alerts</p>
            {unread ? (
              <button type="button" onClick={() => act("me", "notice.read", {}, { quiet: true })} className="rounded-lg px-2 py-1 text-xs font-semibold text-white/70 hover:text-signal-orange">
                Mark all read
              </button>
            ) : null}
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {list.length === 0 ? <p className="px-3 py-8 text-center text-sm text-white/60">No alerts yet.</p> : null}
            {list.map((n) => (
              <DM.Item key={n.id} asChild>
                <Link
                  href={n.href ?? "/hq"}
                  onClick={() => !n.read && act("me", "notice.read", { id: n.id }, { quiet: true })}
                  className={cn("flex gap-3 rounded-xl px-3 py-2.5 outline-none data-[highlighted]:bg-white/8", !n.read && "bg-white/4")}
                >
                  <span aria-hidden className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.read ? "bg-transparent" : n.kind === "urgent" ? "bg-national-crimson" : "bg-signal-orange")} />
                  <span className="min-w-0">
                    <span className={cn("block text-sm leading-snug font-semibold", n.kind === "urgent" ? "text-crimson-bright" : "text-white")}>{n.title}</span>
                    {n.body ? <span className="mt-0.5 line-clamp-2 block text-xs text-white/60">{n.body}</span> : null}
                    <span className="mt-1 block text-xs text-white/45">{ago(n.at, now)}</span>
                  </span>
                </Link>
              </DM.Item>
            ))}
          </div>
        </DM.Content>
      </DM.Portal>
    </DM.Root>
  );
}

/** Pops new alerts as toasts (and as browser notifications for urgent, mention, meeting and help, once allowed). */
function Notifier({ notices }: { notices: Notice[] }) {
  const seen = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (!seen.current) {
      seen.current = new Set(notices.map((n) => n.id));
      return;
    }
    for (const n of notices) {
      if (seen.current.has(n.id)) continue;
      seen.current.add(n.id);
      if (n.read) continue;
      const loud = n.kind === "urgent" || n.kind === "mention" || n.kind === "meeting" || n.kind === "help";
      (n.kind === "urgent" ? toast.error : toast)(n.title, { description: n.body, action: n.href ? { label: "View", onClick: () => (window.location.href = n.href!) } : undefined });
      if (loud && typeof Notification !== "undefined" && Notification.permission === "granted" && document.hidden) {
        new Notification(n.title, { body: n.body, tag: n.id, icon: "/icon.png" });
      }
    }
  }, [notices]);
  return null;
}

function QuickAdd() {
  return (
    <DM.Root>
      <DM.Trigger aria-label="Quick add" className={hb.icon}>
        <Plus aria-hidden className="size-5" />
      </DM.Trigger>
      <DM.Portal>
        <DM.Content align="end" sideOffset={8} className="hq z-[70] w-60 rounded-2xl bg-bdnavy-900 p-1.5 text-white shadow-2xl ring-1 ring-white/15">
          {[
            { href: "/hq/tasks?new=1", label: "New task ticket", icon: ClipboardPlus },
            { href: "/hq/calendar?new=1", label: "Meeting or event", icon: CalendarPlus },
            { href: "/hq/taskbook?note=1", label: "Note or to-do", icon: NotebookPen },
            { href: "/hq/help?new=1", label: "Ask for help", icon: LifeBuoy },
          ].map((x) => (
            <DM.Item key={x.href} asChild>
              <Link href={x.href} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold outline-none data-[highlighted]:bg-white/8 data-[highlighted]:text-signal-orange">
                <x.icon aria-hidden className="size-4.5 text-signal-orange" /> {x.label}
              </Link>
            </DM.Item>
          ))}
        </DM.Content>
      </DM.Portal>
    </DM.Root>
  );
}

export function HqShell({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState(false);
  const [palette, setPalette] = useState(false);
  const notices = useHq((v) => v.notices);
  const me = useHq((v) => v.me);
  const checkedIn = useHq((v) => v.checkins.some((c) => c.personId === v.me.person.id && c.day === dhakaDay(Date.parse(v.now)) && !c.out));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex min-h-dvh">
      <a href="#hq-main" className="sr-only z-[100] rounded-xl bg-signal-orange px-4 py-2 font-bold text-text-primary focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Skip to content
      </a>

      {/* Sidebar, from lg. */}
      <aside className="sticky top-0 hidden h-dvh w-68 shrink-0 flex-col gap-6 overflow-y-auto border-r border-white/10 bg-black px-3 py-5 lg:flex">
        <Brand />
        <SideNav />
        <div className="mt-auto">
          <MeCard />
        </div>
      </aside>

      {/* Sidebar as a drawer below lg. */}
      <D.Root open={menu} onOpenChange={setMenu}>
        <D.Portal>
          <D.Overlay className="fixed inset-0 z-[60] bg-black/70 lg:hidden" />
          <D.Content className="hq fixed inset-y-0 left-0 z-[61] flex w-[min(20rem,86vw)] flex-col gap-6 overflow-y-auto bg-black px-3 py-5 text-white ring-1 ring-white/12 focus:outline-none lg:hidden">
            <D.Title className="sr-only">Menu</D.Title>
            <D.Description className="sr-only">Every page in Kandari HQ</D.Description>
            <div className="flex items-center justify-between">
              <Brand />
              <D.Close aria-label="Close menu" className={hb.iconSm}>
                <X aria-hidden className="size-4" />
              </D.Close>
            </div>
            <SideNav onNavigate={() => setMenu(false)} />
            <div className="mt-auto">
              <MeCard />
            </div>
          </D.Content>
        </D.Portal>
      </D.Root>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-50 flex h-16 items-center gap-2 border-b border-white/10 bg-black/95 px-3 backdrop-blur-sm sm:gap-3 sm:px-5 lg:px-8">
          <button type="button" onClick={() => setMenu(true)} aria-label="Open menu" className={cn(hb.icon, "lg:hidden")}>
            <Menu aria-hidden className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => setPalette(true)}
            className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-xl bg-white/6 px-3.5 text-left text-sm text-white/55 ring-1 ring-white/12 transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none sm:max-w-md"
          >
            <Search aria-hidden className="size-4.5 shrink-0" />
            <span className="truncate">Search…</span>
            <kbd className="ml-auto hidden rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-xs text-white/60 sm:inline">Ctrl K</kbd>
          </button>
          <div className="ml-auto flex items-center gap-2">
            <CheckinPill />
            <QuickAdd />
            <Bell_ notices={notices} />
            <Link href="/hq/settings" aria-label="Settings and profile" className="hidden rounded-full focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none sm:block">
              <Avatar person={me.person} size="md" online={checkedIn} />
            </Link>
          </div>
        </header>

        <main id="hq-main" className="mx-auto w-full max-w-[120rem] min-w-0 flex-1 px-3 py-6 sm:px-5 lg:px-8 lg:py-8">
          {children}
        </main>
        <footer className="border-t border-white/8 px-5 py-4 text-xs text-white/45 lg:px-8">
          Kandari Lab · We turn problems into economy · Signed in as {LEVEL_LABEL[me.person.level]}
        </footer>
      </div>

      <Palette open={palette} onOpenChange={setPalette} />
      <Notifier notices={notices} />
      <MeetingAlarms />
    </div>
  );
}
