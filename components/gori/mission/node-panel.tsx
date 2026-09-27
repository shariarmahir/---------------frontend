"use client";

import { ArrowDownRight, ArrowUpRight, Building2, Car, Eye, HandHelping, Landmark, Plane, Radar, Repeat2, Sparkles, Stethoscope, Users } from "lucide-react";
import { codeOf, moduleLinks } from "@/data/gori/modules";
import { pillarDef, pillarOf, PILLARS, RULES } from "@/data/gori/mission";
import {
  cardsOf,
  cascadePreview,
  downstreamOf,
  holds,
  REACH,
  reformNeed,
  ROOTS,
  upstreamOf,
  whyNot,
  type MissionAction,
  type MissionState,
} from "@/lib/gori/mission/engine";
import { PRESSURE_COLOR } from "@/lib/gori/mission/layout";
import { bn, titleOf } from "@/lib/gori/mission/narrate";
import { cn } from "@/lib/utils";
import { PillarGlyph } from "./hud";

const linkNote = (a: number, b: number) => moduleLinks.find((l) => l.from === codeOf(a) && l.to === codeOf(b));

interface Props {
  state: MissionState;
  n: number;
  /** The human whose turn it is, or null while a bot plays / the game is over. */
  me: number | null;
  preview: boolean;
  onPreview: (on: boolean) => void;
  onSelect: (n: number) => void;
  onAct: (a: MissionAction) => void;
  onPeek: () => void;
}

export function NodePanel({ state, n, me, preview, onPreview, onSelect, onAct, onPeek }: Props) {
  const pillar = pillarOf(n);
  const p = state.pressure[n];
  const hub = state.hubs.includes(n);
  const cascade = cascadePreview(state, n);
  const up = upstreamOf(n);
  const down = downstreamOf(n);
  const root = ROOTS.includes(n);
  const here = state.players.filter((pl) => pl.at === n);

  return (
    <section aria-labelledby="node-title" className="rounded-2xl bg-gori-cream p-4 text-gori-ink">
      <p className="flex flex-wrap items-center gap-2 font-bengali text-xs font-semibold text-gori-ink-soft">
        <PillarGlyph id={pillar} /> {pillarDef(pillar).bn}
        {root && <span className="rounded-full bg-bd-green px-2 py-0.5 text-[11px] font-bold text-white">মূল কারণ</span>}
        {hub && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-200 px-2 py-0.5 text-[11px] font-bold text-amber-950">
            <Building2 className="size-3" aria-hidden /> সমন্বয় কেন্দ্র
          </span>
        )}
        {state.reforms[pillar] === "restored" && <span className="rounded-full bg-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-950">সুস্থ স্তম্ভ</span>}
      </p>
      <h2 id="node-title" className="mt-1.5 font-bengali text-lg leading-snug font-bold">
        <span className="text-bd-green">{codeOf(n)}</span> {titleOf(n)}
      </h2>

      <div className="mt-2 flex items-center gap-3 font-bengali text-sm">
        <span className="font-semibold">চাপ</span>
        <span className="flex gap-1" role="meter" aria-valuemin={0} aria-valuemax={RULES.maxPressure} aria-valuenow={p} aria-label="চাপ">
          {Array.from({ length: RULES.maxPressure }, (_, k) => (
            <span key={k} className="block size-4 rounded-[3px] border border-gori-ink/20" style={{ background: k < p ? PRESSURE_COLOR : "transparent" }} />
          ))}
        </span>
        <span className="text-gori-ink-soft">{p === RULES.maxPressure ? "ভাঙনের কিনারে" : p ? `${bn(p)}/${bn(RULES.maxPressure)}` : "শান্ত"}</span>
      </div>
      {here.length > 0 && (
        <p className="mt-1 flex items-center gap-1.5 font-bengali text-xs text-gori-ink-soft">
          <Users className="size-3.5" aria-hidden /> এখানে: {here.map((x) => x.name).join(", ")}
        </p>
      )}

      {/* The systems lesson: what a collapse here would do. */}
      <div className="mt-3 rounded-xl bg-white p-3">
        <button type="button" onClick={() => onPreview(!preview)} aria-pressed={preview} className={cn("inline-flex h-9 items-center gap-1.5 rounded-lg px-3 font-bengali text-sm font-bold", preview ? "bg-national-crimson text-white" : "bg-gori-ink/8 hover:bg-gori-ink/12")}>
          <Eye className="size-4" aria-hidden /> ভাঙলে কী হবে?
        </button>
        <p className="mt-2 font-bengali text-[13px] leading-6 text-gori-ink-soft">
          {down.length === 0
            ? "এটি কাউকে খাওয়ায় না — ভাঙলে আস্থা কমবে, ঢেউ ছড়াবে না।"
            : cascade.collapsed.length > 1
              ? `শৃঙ্খল-ভাঙন: ${cascade.collapsed.map(codeOf).join(" → ")} — ${bn(cascade.collapsed.length)}টি ভাঙন, ${bn(cascade.hit.length)}টি মডিউলে চাপ।`
              : `ভাঙলে চাপ যাবে ${cascade.hit.map(codeOf).join(", ") || "কোথাও না (রক্ষিত)"}-এ। দীর্ঘমেয়াদে ${bn(REACH[n])}টি মডিউল নাগালে।`}
        </p>
      </div>

      <div className="mt-3 grid gap-3 font-bengali text-[13px] sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
        <LinkList title="নির্ভর করে" icon={ArrowDownRight} items={up} other={(m) => linkNote(m, n)} state={state} onSelect={onSelect} empty="কিছুর উপর নয় — এটি একটি মূল কারণ।" />
        <LinkList title="খাওয়ায় (ঢেউ যায়)" icon={ArrowUpRight} items={down} other={(m) => linkNote(n, m)} state={state} onSelect={onSelect} empty="কাউকে না।" />
      </div>

      {me !== null && <Actions state={state} n={n} me={me} onAct={onAct} onPeek={onPeek} />}
    </section>
  );
}

function LinkList({ title, icon: Icon, items, other, state, onSelect, empty }: { title: string; icon: typeof Eye; items: number[] | readonly number[]; other: (m: number) => ReturnType<typeof linkNote>; state: MissionState; onSelect: (n: number) => void; empty: string }) {
  return (
    <div>
      <h3 className="flex items-center gap-1 text-xs font-bold tracking-wide text-gori-ink-soft">
        <Icon className="size-3.5" aria-hidden /> {title}
      </h3>
      {items.length ? (
        <ul className="mt-1 space-y-1">
          {items.map((m) => {
            const l = other(m);
            return (
              <li key={m}>
                <button type="button" onClick={() => onSelect(m)} className="w-full rounded-lg px-2 py-1 text-left hover:bg-white" title={l?.note}>
                  <span className="flex items-center gap-1.5">
                    <PillarGlyph id={pillarOf(m)} className="size-3" />
                    <strong>{codeOf(m)}</strong>
                    <span className="truncate">{titleOf(m)}</span>
                    {state.pressure[m] > 0 && <span className="ml-auto shrink-0 text-national-crimson" aria-label={`চাপ ${bn(state.pressure[m])}`}>{"■".repeat(state.pressure[m])}</span>}
                  </span>
                  {l && <span className="block text-[11px] text-gori-mute">{l.basis === "dossier" ? "প্রতিবেদনের যুক্তি" : "খেলার অনুমান"} · আস্থা {l.confidence === "high" ? "বেশি" : l.confidence === "medium" ? "মাঝারি" : "কম"}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-1 text-gori-mute">{empty}</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Btn({ a, state, onAct, icon: Icon, children, cost }: { a: MissionAction; state: MissionState; onAct: (a: MissionAction) => void; icon: typeof Eye; children: React.ReactNode; cost?: string }) {
  const why = whyNot(state, a);
  return (
    <li>
      <button
        type="button"
        disabled={!!why}
        onClick={() => onAct(a)}
        className="flex w-full items-center gap-2.5 rounded-xl bg-bd-green px-3 py-2.5 text-left font-bengali text-sm font-bold text-white transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-bd-green-dark disabled:translate-y-0 disabled:bg-gori-ink/8 disabled:font-semibold disabled:text-gori-mute"
      >
        <Icon className="size-4 shrink-0" aria-hidden />
        <span className="min-w-0 flex-1">
          {children}
          {(why || cost) && <span className="block text-[11px] font-normal opacity-85">{why ?? cost}</span>}
        </span>
      </button>
    </li>
  );
}

function Actions({ state, n, me, onAct, onPeek }: { state: MissionState; n: number; me: number; onAct: (a: MissionAction) => void; onPeek: () => void }) {
  const pl = state.players[me];
  if (state.phase !== "actions") return null;
  const atHere = pl.at === n;
  const others = state.players.map((q, j) => ({ q, j })).filter(({ q, j }) => j !== me && q.at === pl.at);

  return (
    <div className="mt-4 border-t border-gori-ink/10 pt-3">
      <h3 className="font-bengali text-sm font-bold">
        {pl.name}-এর অ্যাকশন <span className="font-normal text-gori-ink-soft">({bn(state.actionsLeft)}টি বাকি)</span>
      </h3>
      <ul className="mt-2 space-y-1.5">
        {!atHere && (
          <>
            <Btn a={{ type: "drive", to: n }} state={state} onAct={onAct} icon={Car} cost="১ অ্যাকশন">
              সড়কপথে যান
            </Btn>
            {holds(pl, n) && (
              <Btn a={{ type: "flight", to: n }} state={state} onAct={onAct} icon={Plane} cost={`${codeOf(n)} কার্ড খরচ হবে`}>
                সরাসরি যান
              </Btn>
            )}
            {holds(pl, pl.at) && (
              <Btn a={{ type: "charter", to: n }} state={state} onAct={onAct} icon={Plane} cost={`${codeOf(pl.at)} কার্ড খরচ হবে`}>
                চার্টারে যান
              </Btn>
            )}
            {state.hubs.includes(pl.at) && state.hubs.includes(n) && (
              <Btn a={{ type: "shuttle", to: n }} state={state} onAct={onAct} icon={Repeat2} cost="কেন্দ্র থেকে কেন্দ্রে, ১ অ্যাকশন">
                শাটলে যান
              </Btn>
            )}
            {pl.role === "coordinator" &&
              state.players.map((q, j) =>
                q.at !== n && state.players.some((r, k) => k !== j && r.at === n) ? (
                  <Btn key={j} a={{ type: "summon", player: j, to: n }} state={state} onAct={onAct} icon={Users} cost="সমন্বয়কের ক্ষমতা">
                    {q.name}-কে এখানে ডাকুন
                  </Btn>
                ) : null,
              )}
          </>
        )}
        {atHere && (
          <>
            <Btn a={{ type: "treat" }} state={state} onAct={onAct} icon={Stethoscope} cost={pl.role === "organizer" || state.reforms[pillarOf(n)] !== "open" ? "সব চাপ সরবে" : "১টি চাপ সরবে"}>
              চাপ কমান
            </Btn>
            {!state.hubs.includes(n) && (
              <Btn a={{ type: "hub", remove: state.hubs.length >= RULES.maxHubs ? state.hubs[0] : undefined }} state={state} onAct={onAct} icon={Building2} cost={pl.role === "engineer" ? "প্রকৌশলী: কার্ড লাগে না" : `${codeOf(n)} কার্ড খরচ হবে`}>
                সমন্বয় কেন্দ্র বানান
              </Btn>
            )}
            {PILLARS.filter((x) => state.reforms[x.id] === "open").map((x) => {
              const have = cardsOf(pl, x.id);
              if (!have.length) return null;
              return (
                <Btn key={x.id} a={{ type: "reform", pillar: x.id, cards: have.slice(0, reformNeed(pl)) }} state={state} onAct={onAct} icon={Landmark} cost={`${pillarDef(x.id).bn}: ${bn(have.length)}/${bn(reformNeed(pl))} কার্ড`}>
                  সংস্কার: {x.reformBn}
                </Btn>
              );
            })}
            {others.map(({ q, j }) => (
              <li key={j} className="rounded-xl bg-white p-2">
                <p className="px-1 font-bengali text-xs font-bold">{q.name}-এর সাথে কার্ড</p>
                <ul className="mt-1 space-y-1">
                  {pl.hand.map((c) =>
                    c.kind === "node" && (c.n === n || pl.role === "researcher") ? (
                      <Btn key={`g${c.n}`} a={{ type: "share", with: j, n: c.n, dir: "give" }} state={state} onAct={onAct} icon={HandHelping}>
                        {codeOf(c.n)} দিন
                      </Btn>
                    ) : null,
                  )}
                  {q.hand.map((c) =>
                    c.kind === "node" && (c.n === n || q.role === "researcher") ? (
                      <Btn key={`t${c.n}`} a={{ type: "share", with: j, n: c.n, dir: "take" }} state={state} onAct={onAct} icon={HandHelping}>
                        {codeOf(c.n)} নিন
                      </Btn>
                    ) : null,
                  )}
                </ul>
              </li>
            ))}
          </>
        )}
        {pl.role === "analyst" && (
          <li>
            <button type="button" disabled={state.analystUsed || state.actionsLeft <= 0} onClick={onPeek} className="flex w-full items-center gap-2.5 rounded-xl bg-sky-700 px-3 py-2.5 text-left font-bengali text-sm font-bold text-white hover:brightness-110 disabled:bg-gori-ink/8 disabled:text-gori-mute">
              <Radar className="size-4" aria-hidden /> সংকট-ডেক দেখুন (বিশ্লেষক)
            </button>
          </li>
        )}
      </ul>
      {state.reforms[pillarOf(n)] !== "open" && (
        <p className="mt-2 flex items-center gap-1.5 font-bengali text-xs text-bd-green">
          <Sparkles className="size-3.5" aria-hidden /> এই স্তম্ভের সংস্কার চালু — চাপ কমালে সব একবারে সরে।
        </p>
      )}
    </div>
  );
}
