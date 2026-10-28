"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { ACK_WINDOW_MS } from "@/lib/command/engine";
import { areaKey } from "@/lib/command/history";
import { hotspots, type ResponseCertainty } from "@/lib/command/intel";
import { bdDay, inDivision, isOpen } from "@/lib/command/selectors";
import { perDivision, selectEarlyWarnings, selectHotspots, selectResponseCertainty, useCommand } from "@/lib/command/store";
import type { Case, DivisionId, World } from "@/lib/command/types";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import { DivisionPicker, DivisionScopeNote, useDivision } from "./division-picker";
import { Bn, Panel, Skeleton, cb, formatMin, num } from "./kit";
import { CommandPage } from "./shell";

/**
 * /protibad/command/roadmap: a prevention model, readable and live. The cycle
 * Report → Route → Respond → Resolve → Review → Prevent, each stage with its
 * measure from the demo world in the ?div= scope; why people in Bangladesh stay
 * silent and what the board does about it (design reasons, no statistics); a
 * phased proposal; and the targets it would track. Uses useSearchParams:
 * render it inside <Suspense>.
 */

/* ───────────── live measures ───────────── */

const MIN = 60_000;
/** A first alert sent within this of the report went out at once (the engine alerts on the tick a case arrives). */
const AT_ONCE_MS = 5_000;

interface Measures {
  /** Police cases reported today (Bangladesh day) in scope, and how many of them anonymously. */
  reported: number;
  anonymous: number;
  /** Of today's: first alert to the nearest free unit at once, and those that waited in the queue for one. */
  atOnce: number;
  queued: number;
  certainty: ResponseCertainty;
  /** Minutes from report to first answer, median over the police cases in the world. */
  medianFirstMin: number | null;
  resolvedToday: number;
  open: number;
  overdue: number;
  /** Escalations (an alert missed or declined) logged today. */
  escalations: number;
  warnings: number;
  serious: number;
  /** Areas that were rising an hour ago and are not now. */
  cooling: number;
  /** Police cases of the last 24 h whose area already had the same kind of case earlier in those 24 h. */
  repeat: number;
  recent: number;
}

function median(xs: number[]): number | null {
  if (xs.length === 0) return null;
  const s = xs.slice().sort((a, b) => a - b);
  const mid = s.length >> 1;
  return Math.round((s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2) * 10) / 10;
}

function measures(w: World, d: DivisionId | undefined): Measures {
  const now = w.now;
  const today = bdDay(now);
  const police = w.cases.filter((c) => c.dept === "police" && inDivision(c, d));
  const m: Measures = {
    reported: 0, anonymous: 0, atOnce: 0, queued: 0, certainty: selectResponseCertainty(d)(w), medianFirstMin: null,
    resolvedToday: 0, open: 0, overdue: 0, escalations: 0, warnings: 0, serious: 0, cooling: 0, repeat: 0, recent: 0,
  };
  const firsts: number[] = [];
  for (const c of police) {
    if (c.firstAckAt !== undefined) firsts.push((c.firstAckAt - c.reportedAt) / MIN);
    if (isOpen(c)) {
      m.open++;
      if (c.overdue) m.overdue++;
    } else if (c.resolvedAt !== undefined && bdDay(c.resolvedAt) === today) m.resolvedToday++;
    for (const t of c.timeline) if (t.kind === "escalated" && bdDay(t.at) === today) m.escalations++;
    if (bdDay(c.reportedAt) !== today) continue;
    m.reported++;
    if (c.anonymous) m.anonymous++;
    if (c.alerts.length > 0 && c.alerts[0].at - c.reportedAt <= AT_ONCE_MS) m.atOnce++;
    else m.queued++;
  }
  m.medianFirstMin = median(firsts);

  // Repeat at the same place, oldest first so "earlier" is a set lookup.
  const seen = new Set<string>();
  const recent: Case[] = police.filter((c) => c.reportedAt > now - 24 * 60 * MIN && c.reportedAt <= now).sort((a, b) => a.reportedAt - b.reportedAt);
  for (const c of recent) {
    const k = `${areaKey(c.place)}|${c.category}`;
    if (seen.has(k)) m.repeat++;
    seen.add(k);
  }
  m.recent = recent.length;

  const warnings = selectEarlyWarnings(d)(w);
  m.warnings = warnings.length;
  m.serious = warnings.filter((x) => x.level !== "watch").length;
  const risingNow = new Set(selectHotspots(d)(w).filter((h) => h.rising).map((h) => h.area));
  m.cooling = hotspots(w, now - 60 * MIN, { division: d }).filter((h) => h.rising && !risingNow.has(h.area)).length;
  return m;
}

const selectMeasures = perDivision(measures);

const pct = (part: number, whole: number): string => (whole > 0 ? `${Math.round((part / whole) * 100)}%` : "—");
const share = (x: number | null): string => (x === null ? "—" : `${Math.round(x * 100)}%`);

/* ───────────── the cycle ───────────── */

interface Stage {
  name: string;
  icon: string;
  meaning: string;
  measure(m: Measures): { value: string; label: string; sub: ReactNode; urgent?: boolean };
}

const STAGES: Stage[] = [
  {
    name: "Report",
    icon: "campaign",
    meaning: "Anyone can report, by name or anonymously, from a phone. The complainant's identity is never on the board.",
    measure: (m) => ({
      value: num(m.reported),
      label: "police cases reported today",
      sub: <>{pct(m.anonymous, m.reported)} of them anonymous</>,
    }),
  },
  {
    name: "Route",
    icon: "alt_route",
    meaning: "The case goes at once to the nearest free unit by travel time, not to whoever owns the paperwork.",
    measure: (m) => ({
      value: pct(m.atOnce, m.reported),
      label: "alerted to the nearest free unit at once",
      sub: <>{num(m.queued)} waited for a unit to come free</>,
    }),
  },
  {
    name: "Respond",
    icon: "directions_car",
    meaning: "Every alert has a short window. Answered in time is the measure that deters: the certainty that someone comes.",
    measure: (m) => ({
      value: share(m.certainty.share),
      label: "first alerts answered within the window today",
      sub: <>Median first response {formatMin(m.medianFirstMin)}</>,
    }),
  },
  {
    name: "Resolve",
    icon: "check_circle",
    meaning: "A case stays a task with a visible clock and status trail until it is resolved and closed.",
    measure: (m) => ({
      value: num(m.resolvedToday),
      label: "resolved today",
      sub: <>{num(m.open)} still open</>,
    }),
  },
  {
    name: "Review",
    icon: "fact_check",
    meaning: "Missed alerts escalate on their own; overdue cases are seen by the division, not buried at the station.",
    measure: (m) => ({
      value: num(m.overdue),
      label: "overdue after three missed alerts",
      sub: <>{num(m.escalations)} escalations logged today</>,
      urgent: m.overdue > 0,
    }),
  },
  {
    name: "Prevent",
    icon: "shield",
    meaning: "Rising areas and the hours they usually rise put patrols in place before harm happens.",
    measure: (m) => ({
      value: num(m.warnings),
      label: "active early warnings",
      sub: (
        <>
          {num(m.serious)} serious · {num(m.cooling)} hotspot{m.cooling === 1 ? "" : "s"} cooling down
        </>
      ),
    }),
  },
];

function Cycle({ m }: { m: Measures | null }) {
  const reduced = useReducedMotion();
  return (
    <Panel
      title="The cycle"
      icon="autorenew"
      sub="Six stages, each with its live measure from the demo world in scope. Prevent feeds back into Report: every case teaches where to be next."
    >
      <ol aria-label="Prevention cycle" className="grid gap-0 lg:grid-cols-6 lg:gap-3">
        {STAGES.map((s, i) => {
          const v = m ? s.measure(m) : null;
          const last = i === STAGES.length - 1;
          return (
            <li key={s.name} className="flex min-w-0 gap-3 lg:flex-col">
              {/* The rail: the stage's number and the line to the next stage (down on phones, across from lg). */}
              <div aria-hidden="true" className="flex shrink-0 flex-col items-center lg:flex-row">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-signal-orange font-grotesk text-base font-bold text-text-primary">{i + 1}</span>
                <span className={cn("relative block w-0.5 flex-1 lg:ml-3 lg:h-0.5 lg:w-auto", last && "lg:invisible")}>
                  <motion.span
                    className={cn("absolute inset-0 block bg-signal-orange/60", last && "max-lg:bg-white/15")}
                    style={{ originX: 0, originY: 0 }}
                    initial={reduced ? false : { scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={reduced ? { duration: 0 } : { duration: 0.5, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  />
                </span>
              </div>
              <div
                className="flex min-w-0 flex-1 flex-col gap-2 pb-6 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:duration-500 lg:pb-0"
                style={{ animationDelay: `${i * 90}ms`, animationFillMode: "backwards" }}
              >
                <h3 className="flex items-center gap-2 pt-2.5 font-grotesk text-lg font-bold text-signal-orange lg:pt-0">
                  <Icon name={s.icon} className="text-[20px]" />
                  {s.name}
                </h3>
                <p className="text-sm leading-relaxed text-white/75">{s.meaning}</p>
                <div className="mt-auto rounded-xl bg-black/30 px-3.5 py-3 ring-1 ring-white/10 lg:min-h-32">
                  {v ? (
                    <>
                      <p className={cn("font-grotesk text-2xl leading-none font-bold tabular-nums", v.urgent ? "text-crimson-bright" : "text-white")}>{v.value}</p>
                      <p className="mt-1.5 text-xs leading-snug text-white/85">{v.label}</p>
                      <p className="mt-1 text-xs leading-snug text-white/65 tabular-nums">{v.sub}</p>
                    </>
                  ) : (
                    <div aria-hidden="true" className="flex flex-col gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </Panel>
  );
}

/* ───────────── human factors ───────────── */

const FACTORS: { icon: string; why: string; context: string; does: string }[] = [
  {
    icon: "visibility_off",
    why: "Fear of retaliation, and of the police, stops people reporting",
    context: "A shopkeeper who names the local extortion collector, or a family that files against a powerful neighbour, can expect a visit.",
    does: "Anonymous reports are allowed and shown as such. The complainant's identity is never on the board, on any view.",
  },
  {
    icon: "woman",
    why: "Shame and stigma keep women silent",
    context: "Harassment on a bus or abuse at home is often kept within the family to protect its name, and a public complaint can follow a woman for years.",
    does: "Survivor details are hidden everywhere: area only, no name, no exact point. Cases go to the station's women help desk, with 109 and the One-Stop Crisis Centre beside every one.",
  },
  {
    icon: "hourglass_empty",
    why: "Low trust: nothing happens after I complain",
    context: "Many people have filed a complaint once and never heard back, so they do not try a second time.",
    does: "Every case shows a visible clock and status trail, and the median response time is public.",
  },
  {
    icon: "groups",
    why: "The bystander effect in crowds and transport",
    context: "In a packed bus terminal or a market, everyone assumes someone else will step in or call.",
    does: "Early warnings name the place and the hour, so a patrol is there before it happens rather than after.",
  },
  {
    icon: "payments",
    why: "Extortion and harassment are treated as how things are",
    context: "Paying the weekly chada at a market or a bus stand comes to feel normal when each shop only sees its own case.",
    does: "Repeat patterns across shops and areas are linked into one network view, so a ring is seen as a ring.",
  },
  {
    icon: "verified",
    why: "Certainty of being caught deters more than severity of punishment",
    context: "A harsh sentence that rarely comes changes less than a response that reliably arrives.",
    does: "The roadmap measures response certainty (the share of cases answered within the window), not arrests.",
  },
];

function Factors() {
  return (
    <Panel
      title="Why people stay silent, and what the board does about it"
      icon="psychology"
      sub="Design reasons drawn from how reporting works in Bangladesh. These are not statistics; the page invents no national figures."
      field="ink"
    >
      <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {FACTORS.map((f) => (
          <li key={f.why} className="flex min-w-0 flex-col gap-3 rounded-xl bg-bdnavy-900 px-4 py-4 ring-1 ring-white/12">
            <div className="flex items-start gap-3">
              <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-lg bg-white/6 ring-1 ring-white/10">
                <Icon name={f.icon} className="text-[22px] text-signal-orange" />
              </span>
              <h3 className="font-grotesk text-base leading-snug font-bold text-white">{f.why}</h3>
            </div>
            <p className="text-sm leading-relaxed text-white/70">{f.context}</p>
            <div className="mt-auto border-t border-white/10 pt-3">
              <p className="text-xs font-semibold text-signal-orange">What the board does</p>
              <p className="mt-1 text-sm leading-relaxed text-white/85">{f.does}</p>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* ───────────── phased roadmap ───────────── */

const PHASES: { span: string; title: string; steps: ReactNode[] }[] = [
  {
    span: "0–6 months",
    title: "Make reporting safe and visible",
    steps: [
      "A real backend and a verified station directory (names, areas and duty numbers checked with each thana) in place of this browser demo.",
      "Women help desks staffed in every thana, with a first-response target for every women and child case and the desk's load on the board.",
      "Nearest-unit alerting with automatic escalation, piloted in the Dhaka metropolitan thanas.",
      "Anonymous reporting through প্রতিবাদ, with 999 and 109 shown beside every case.",
      "A public monthly response report per thana: response certainty, median first response and overdue cases.",
    ],
  },
  {
    span: "6–18 months",
    title: "Get ahead of the hour",
    steps: [
      "Patrol windows driven by hotspot history: where and when each category usually rises, reviewed every week.",
      "Extortion ring linking across stations: one investigation per group code instead of one file per shop.",
      <>
        Consumer price watch and recall enforcement with <Bn>ভোক্তা অধিদপ্তর</Bn>, BSTI, the Food Safety Authority and DGDA.
      </>,
      "Community alert volunteers in markets, terminals and launch ghats, trained to call early and to stay with the person at risk.",
      "Rollout to all eight divisions, each with its own command room.",
    ],
  },
  {
    span: "18–36 months",
    title: "Make prevention the habit",
    steps: [
      "A standing plan for every place with repeat cases, reviewed monthly until the repeats stop.",
      "Misconduct complaints against police reviewed by a body outside the station concerned.",
      "Open data: anonymised monthly counts per thana, with no personal details of anyone.",
      "One survivor pathway linking the One-Stop Crisis Centres, legal aid and shelters.",
      "An honest evaluation: response certainty and repeat cases per thana before and after, published.",
    ],
  },
];

function Phases() {
  return (
    <Panel
      title="Phased roadmap"
      icon="flag"
      sub="What it would take to run this model for real, in three phases."
      action={
        <span className="inline-flex min-h-7 items-center gap-1.5 rounded-full bg-white px-2.5 text-xs font-semibold text-text-primary">
          <Icon name="forum" className="text-[15px]" />A proposal for discussion, not government policy
        </span>
      }
    >
      <ol className="grid gap-3 lg:grid-cols-3">
        {PHASES.map((p, i) => (
          <li key={p.span} className="flex min-w-0 flex-col gap-3 rounded-xl bg-black/30 px-4 py-4 ring-1 ring-white/10">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-white/75 tabular-nums">
                <span aria-hidden="true" className="grid size-7 place-items-center rounded-full bg-bdnavy-700 text-xs font-bold text-white ring-1 ring-bdnavy-400/50">
                  {i + 1}
                </span>
                {p.span}
              </p>
              <h3 className="mt-2 font-grotesk text-lg leading-snug font-bold text-signal-orange">{p.title}</h3>
            </div>
            <ul className="flex flex-col gap-2.5">
              {p.steps.map((s, k) => (
                <li key={k} className="flex gap-2.5 text-sm leading-relaxed text-white/85">
                  <span aria-hidden="true" className="inline-flex shrink-0 pt-0.5">
                    <Icon name="arrow_right_alt" className="text-[18px] text-bdnavy-300" />
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

/* ───────────── targets ───────────── */

function Targets({ m }: { m: Measures | null }) {
  const overdueShare = m && m.open > 0 ? m.overdue / m.open : null;
  const repeatShare = m && m.recent > 0 ? m.repeat / m.recent : null;
  const rows: { name: string; what: string; now: string; target: string; met: boolean | null; icon: string }[] = m
    ? [
        {
          name: "Response certainty",
          icon: "verified",
          what: `First alerts answered within their window today (${num(m.certainty.answered)} answered, ${num(m.certainty.missed)} missed)`,
          now: share(m.certainty.share),
          target: "90% or more",
          met: m.certainty.share === null ? null : m.certainty.share >= 0.9,
        },
        {
          name: "Median first response",
          icon: "timer",
          what: "Report to first answer, police cases",
          now: formatMin(m.medianFirstMin),
          target: `Inside the alert window (${ACK_WINDOW_MS.critical / 1000} s for a critical case)`,
          met: m.medianFirstMin === null ? null : m.medianFirstMin * 60_000 <= ACK_WINDOW_MS.critical,
        },
        {
          name: "Repeat at the same place",
          icon: "replay",
          what: "Police cases in the last 24 h where the same area already had the same kind of case (the board records no victim identities, so place stands in for repeat victimisation)",
          now: share(repeatShare),
          target: "Falling month on month",
          met: null,
        },
        {
          name: "Overdue share",
          icon: "timer_off",
          what: `Open police cases overdue after three missed alerts (${num(m.overdue)} of ${num(m.open)})`,
          now: share(overdueShare),
          target: "Under 5%",
          met: overdueShare === null ? null : overdueShare < 0.05,
        },
      ]
    : [];
  return (
    <Panel title="Targets" icon="track_changes" sub="The measures the roadmap would track, with the demo's value right now. Targets are proposals for discussion.">
      {m === null ? (
        <div aria-hidden="true" className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : (
        <ul className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          {rows.map((r) => (
            <li key={r.name} className="flex min-w-0 flex-col gap-2 rounded-xl bg-black/30 px-4 py-4 ring-1 ring-white/10">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                <Icon name={r.icon} className="text-[18px] text-bdnavy-300" />
                {r.name}
              </h3>
              <p className="font-grotesk text-3xl leading-none font-bold text-white tabular-nums">{r.now}</p>
              <p className="text-xs leading-relaxed text-white/65">{r.what}</p>
              <p className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-white/10 pt-2.5 text-xs text-white/85">
                <span className="text-white/65">Target</span>
                <span className="font-semibold">{r.target}</span>
                {r.met === null ? null : r.met ? (
                  <span className="ml-auto inline-flex items-center gap-1 font-semibold text-signal-orange">
                    <Icon name="check_circle" className="text-[16px]" />
                    Met
                  </span>
                ) : (
                  <span className="ml-auto inline-flex items-center gap-1 font-semibold text-white/85">
                    <Icon name="pending" className="text-[16px]" />
                    Not yet
                  </span>
                )}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

/* ───────────── the page ───────────── */

export function Roadmap() {
  const [div] = useDivision();
  const m = useCommand(selectMeasures(div));
  return (
    <CommandPage
      title="Prevention roadmap"
      subtitle="A model for reducing crime, not only answering it: report safely, reach the nearest unit, answer every time, close the case, review what slipped, and be there before it happens again."
      actions={
        <Link href="/protibad/command/intel" className={cb.outline}>
          <Icon name="radar" className="text-[18px]" />
          Crime intelligence
        </Link>
      }
    >
      <div className="flex flex-col gap-2">
        <DivisionPicker />
        <DivisionScopeNote div={div}>The live measures follow this scope</DivisionScopeNote>
      </div>
      <Cycle m={m} />
      <Targets m={m} />
      <Factors />
      <Phases />
    </CommandPage>
  );
}

/** What the server and the first paint show before the world is read. */
export function RoadmapFallback() {
  return (
    <CommandPage title="Prevention roadmap" subtitle="Loading the live measures…">
      <Skeleton className="h-12 w-full rounded-2xl" />
      <Skeleton className="h-96 w-full rounded-2xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </CommandPage>
  );
}
