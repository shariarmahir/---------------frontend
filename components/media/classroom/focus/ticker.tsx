"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Activity, AtSign, CalendarClock, ChevronDown, ChevronUp, Clock, Drum, FileClock, FlaskConical, Hourglass, Microscope, TriangleAlert, type LucideIcon } from "lucide-react";
import { sampleChats } from "@/data/media/class-chat";
import { sampleClassrooms } from "@/data/media/classroom";
import { DEMO_NOW } from "@/data/media/clock";
import { sampleLabs } from "@/data/media/labs";
import { sampleProjects } from "@/data/media/research";
import { useAuth } from "@/lib/auth/client";
import { studentCode } from "@/lib/media/class-access";
import { thread } from "@/lib/media/class-chat";
import { TICK_MS, tickerItems, type TickKind } from "@/lib/media/class-ticker";
import type { Classroom } from "@/lib/media/classroom";
import type { LabRoom } from "@/lib/media/lab";
import { updateMedia, useMediaState } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { useFormat } from "../../ui/numerals";
import { roomInPath } from "./rooms";
import { useClassSession } from "./session-context";

const ICON: Record<TickKind, LucideIcon> = {
  welcome: Drum,
  activity: Activity,
  lab: FlaskConical,
  research: Microscope,
  missing: TriangleAlert,
  pending: FileClock,
  exam: CalendarClock,
  classtime: Clock,
  mention: AtSign,
  stay: Hourglass,
};

const MINUTE = 60_000;

/** Time in the classroom: counted a minute at a time while the tab is in view, and saved. */
function useStay(): { visit: number; total: number } {
  const total = useMediaState((s) => s.classStay);
  const [visit, setVisit] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      setVisit((v) => v + MINUTE);
      updateMedia((s) => ({ ...s, classStay: (s.classStay ?? 0) + MINUTE }));
    }, MINUTE);
    return () => window.clearInterval(id);
  }, []);
  return { visit, total: total ?? 0 };
}

/**
 * The search-bar-shaped strip in the classroom's top bar: the welcome line,
 * then one reminder every fifteen seconds, round and round. Hovering or
 * focusing it holds the current one; the arrows step through by hand.
 */
export function ClassTicker() {
  const session = useClassSession();
  const { account } = useAuth();
  const pathname = usePathname();
  const { num } = useFormat();
  const reduce = useReducedMotion();
  const classMap = useMediaState((s) => s.classrooms);
  const labMap = useMediaState((s) => s.labs);
  const projectMap = useMediaState((s) => s.projects);
  const chatMap = useMediaState((s) => s.classChat);
  const stay = useStay();
  const [at, setAt] = useState(0);
  const [held, setHeld] = useState(false);

  const parent = session?.mode === "parent" ? session.child : null;
  const open = roomInPath(pathname);

  const input = useMemo(() => {
    const classOf = (id: string): Classroom | undefined => classMap[id] ?? sampleClassrooms.find((c) => c.id === id);
    const labOf = (id: string): LabRoom | undefined => labMap[id] ?? sampleLabs.find((l) => l.id === id);
    let classes: Classroom[];
    let labs: LabRoom[];
    let me: { id: string; name: string };
    if (parent) {
      classes = parent.classes.flatMap((id) => classOf(id) ?? []);
      labs = parent.labs.flatMap((id) => labOf(id) ?? []);
      const seat = [...classes, ...labs].flatMap((r) => r.members).find((m) => studentCode(m.id) === parent.code || (m.accountId !== undefined && studentCode(m.accountId) === parent.code));
      me = { id: seat?.id ?? "", name: parent.name };
    } else {
      const id = account?.id ?? "";
      const sits = (r: { members: { id: string }[]; teacherId?: string }) => r.members.some((m) => m.id === id) || r.teacherId === id;
      classes = Object.values(classMap).filter(sits);
      labs = Object.values(labMap).filter(sits);
      // A room opened in the middle counts too, so a visitor still gets its news.
      const c = open ? classOf(open) : undefined;
      const l = open ? labOf(open) : undefined;
      if (c && !classes.some((x) => x.id === c.id)) classes = [...classes, c];
      if (l && !labs.some((x) => x.id === l.id)) labs = [...labs, l];
      me = { id, name: account?.name ?? "" };
    }
    const clock = (id: string) => (sampleClassrooms.some((c) => c.id === id) || sampleLabs.some((l) => l.id === id) ? DEMO_NOW : new Date());
    const ids = new Set([...classes, ...labs].map((r) => r.id));
    return {
      me,
      classes: classes.map((room) => ({ room, now: clock(room.id) })),
      labs: labs.map((room) => ({ room, now: clock(room.id) })),
      projects: [...Object.values(projectMap), ...sampleProjects.filter((p) => !projectMap[p.id])].filter((p) => ids.has(p.from.id)),
      chats: [...ids].map((id) => ({ roomId: id, href: labs.some((l) => l.id === id) ? `/media/classroom/lab/${id}` : `/media/classroom/${id}`, list: thread(sampleChats[id] ?? [], chatMap[id] ?? []) })),
    };
  }, [parent, account, classMap, labMap, projectMap, chatMap, open]);

  const items = useMemo(() => tickerItems({ ...input, stay, num }), [input, stay, num]);
  const n = items.length;
  const i = at % n;
  const item = items[i];
  const Icon = ICON[item.kind];

  // The progress line moves the strip on when it fills, so holding pauses both together.
  // Without motion there is no line, and a timer does the same job.
  useEffect(() => {
    if (held || !reduce) return;
    const id = window.setTimeout(() => setAt((a) => a + 1), TICK_MS);
    return () => window.clearTimeout(id);
  }, [at, held, reduce]);

  const step = (d: number) => setAt((a) => (a + d + n) % n);
  const welcome = item.kind === "welcome";

  return (
    <div
      role="region"
      aria-label="ক্লাসের খবর"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setHeld(false)}
      className="relative mx-auto flex h-10 w-full max-w-2xl items-center gap-2 overflow-hidden rounded-full bg-text-primary pr-1 pl-3 text-sm text-white shadow-ink"
    >
      <div key={at} className={cn("flex min-w-0 flex-1 items-center gap-2", !reduce && "live-in")}>
        <Icon className={cn("size-4.5 shrink-0", item.urgent ? "text-crimson-bright" : "text-signal-orange")} aria-hidden />
        <span className={cn("hidden shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold sm:inline", item.urgent ? "bg-national-crimson text-white" : "bg-white/10 text-signal-orange")}>{item.label}</span>
        {item.href ? (
          <Link href={item.href} className="min-w-0 flex-1 truncate font-medium hover:underline" title={item.text}>
            {item.text}
          </Link>
        ) : (
          <span className={cn("min-w-0 flex-1 truncate", welcome ? "font-bold tracking-wide text-signal-orange" : "font-medium")} title={item.text}>
            {item.text}
          </span>
        )}
      </div>
      <span className="hidden shrink-0 text-[11px] font-semibold text-white/50 tabular-nums lg:inline" aria-label={`${num(n)}টির মধ্যে ${num(i + 1)} নম্বর`}>
        {num(i + 1)}/{num(n)}
      </span>
      <span className="flex shrink-0">
        <button type="button" onClick={() => step(-1)} className="grid size-8 place-items-center rounded-full text-white/70 hover:bg-white/10 hover:text-white">
          <ChevronUp className="size-4" aria-hidden />
          <span className="sr-only">আগের খবর</span>
        </button>
        <button type="button" onClick={() => step(1)} className="grid size-8 place-items-center rounded-full text-white/70 hover:bg-white/10 hover:text-white">
          <ChevronDown className="size-4" aria-hidden />
          <span className="sr-only">পরের খবর</span>
        </button>
      </span>
      {!reduce && (
        <span
          key={`bar-${at}`}
          aria-hidden
          className="ticker-bar absolute right-5 bottom-0 left-5 h-0.5 origin-left rounded-full bg-signal-orange/70"
          style={{ animationDuration: `${TICK_MS}ms`, animationPlayState: held ? "paused" : "running" }}
          onAnimationEnd={() => setAt((a) => a + 1)}
        />
      )}
    </div>
  );
}
