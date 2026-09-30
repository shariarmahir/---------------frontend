"use client";

import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { codeOf } from "@/data/gori/modules";
import { pillarOf, policyDef, RULES, type PolicyId } from "@/data/gori/mission";
import { cascadePreview, NODES, whyNot, type MissionAction, type MissionState } from "@/lib/gori/mission/engine";
import { PILLAR_COLOR } from "@/lib/gori/mission/layout";
import { bn, titleOf } from "@/lib/gori/mission/narrate";
import { cn } from "@/lib/utils";
import { CardFace, PillarGlyph } from "./hud";

const shell = "max-w-md bg-text-primary ring-1 ring-white/12 text-white font-bengali";
const optionLabel = (s: MissionState, n: number) => `${codeOf(n)} ${titleOf(n)} — চাপ ${bn(s.pressure[n])}`;

function NodeSelect({ state, value, onChange, filter, label }: { state: MissionState; value: number; onChange: (n: number) => void; filter: (n: number) => boolean; label: string }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <select value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-1 h-11 w-full rounded-xl border border-white/20 bg-black ring-1 ring-white/12 px-2 text-sm">
        {NODES.filter(filter).map((n) => (
          <option key={n} value={n}>
            {optionLabel(state, n)}
          </option>
        ))}
      </select>
    </label>
  );
}

function Confirm({ state, action, onAct, children = "খেলুন" }: { state: MissionState; action: MissionAction; onAct: (a: MissionAction) => void; children?: React.ReactNode }) {
  const why = whyNot(state, action);
  return (
    <div>
      {why && <p className="mb-2 text-sm text-crimson-bright">{why}</p>}
      <button type="button" disabled={!!why} onClick={() => onAct(action)} className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-signal-orange font-bold text-text-primary disabled:opacity-50">
        {children}
      </button>
    </div>
  );
}

/** Target picking for a policy card. */
export function PolicyDialog({ state, id, selected, onAct, onClose }: { state: MissionState; id: PolicyId | null; selected: number; onAct: (a: MissionAction) => void; onClose: () => void }) {
  return (
    <Dialog open={id !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={shell}>
        {id && <PolicyBody key={id} state={state} id={id} selected={selected} onAct={onAct} />}
      </DialogContent>
    </Dialog>
  );
}

function PolicyBody({ state, id, selected, onAct }: { state: MissionState; id: PolicyId; selected: number; onAct: (a: MissionAction) => void }) {
  const def = policyDef(id);
  const pressured = NODES.filter((n) => state.pressure[n] > 0).sort((a, b) => state.pressure[b] - state.pressure[a]);
  const [node, setNode] = useState(() => (id === "fund" ? (state.hubs.includes(selected) ? NODES.find((n) => !state.hubs.includes(n))! : selected) : id === "resilience" ? (state.crisisDiscard[0] ?? 1) : selected));
  const [order, setOrder] = useState(() => state.crisisDeck.slice(0, 6));
  const [targets, setTargets] = useState<number[]>(() => pressured.slice(0, 1));
  const [player, setPlayer] = useState(0);

  const move = (i: number, d: -1 | 1) =>
    setOrder((o) => {
      const x = o.slice();
      [x[i], x[i + d]] = [x[i + d], x[i]];
      return x;
    });

  return (
    <>
      <DialogTitle className="text-xl font-bold">নীতি-কার্ড: {def.bn}</DialogTitle>
      <DialogDescription className="text-sm leading-6 text-white/80">{def.body} নীতি-কার্ডে অ্যাকশন লাগে না।</DialogDescription>
      {id === "fund" && (
        <>
          <NodeSelect state={state} value={node} onChange={setNode} filter={(n) => !state.hubs.includes(n)} label="কেন্দ্র কোথায় হবে?" />
          <Confirm state={state} action={{ type: "policy", id, n: node }} onAct={onAct} />
        </>
      )}
      {id === "forecast" && (
        <>
          <p className="text-sm">উপরেরটি সবার আগে উঠবে। নিরাপদ কার্ড উপরে, বিপজ্জনকগুলো নিচে রাখুন — অথবা এমন মডিউল উপরে দিন যেখানে চাপ নেই।</p>
          <ol className="space-y-1.5">
            {order.map((n, i) => (
              <li key={n} className="flex items-center gap-2 rounded-lg bg-black ring-1 ring-white/12 px-2 py-1.5 text-sm">
                <span className="w-5 text-center font-bold text-white/65">{bn(i + 1)}</span>
                <PillarGlyph id={pillarOf(n)} />
                <span className="min-w-0 flex-1 truncate">
                  <strong>{codeOf(n)}</strong> {titleOf(n)}
                </span>
                <span className="text-crimson-bright">{"■".repeat(state.pressure[n])}</span>
                <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="rounded p-1 hover:bg-white/15 disabled:opacity-30" aria-label={`${codeOf(n)} উপরে`}>
                  <ArrowUp className="size-4" />
                </button>
                <button type="button" disabled={i === order.length - 1} onClick={() => move(i, 1)} className="rounded p-1 hover:bg-white/15 disabled:opacity-30" aria-label={`${codeOf(n)} নিচে`}>
                  <ArrowDown className="size-4" />
                </button>
              </li>
            ))}
          </ol>
          <Confirm state={state} action={{ type: "policy", id, order }} onAct={onAct}>
            এই ক্রমে রাখুন
          </Confirm>
        </>
      )}
      {id === "volunteers" && (
        <>
          <p className="text-sm">মোট ২টি চাপ সরানো যাবে — একই জায়গা থেকে দুটিও।</p>
          <ul className="max-h-60 space-y-1 overflow-y-auto">
            {pressured.map((n) => {
              const k = targets.filter((t) => t === n).length;
              return (
                <li key={n} className="flex items-center gap-2 rounded-lg bg-black ring-1 ring-white/12 px-2 py-1.5 text-sm">
                  <PillarGlyph id={pillarOf(n)} />
                  <span className="min-w-0 flex-1 truncate">
                    <strong>{codeOf(n)}</strong> {titleOf(n)}
                  </span>
                  <span className="text-crimson-bright">{"■".repeat(state.pressure[n] - k)}</span>
                  <button type="button" disabled={!k} onClick={() => setTargets((t) => t.filter((_, j) => j !== t.indexOf(n)))} className="size-7 rounded-lg bg-white/10 font-bold disabled:opacity-30" aria-label={`${codeOf(n)} থেকে কম`}>
                    −
                  </button>
                  <span className="w-4 text-center font-bold">{bn(k)}</span>
                  <button type="button" disabled={targets.length >= 2 || k >= state.pressure[n]} onClick={() => setTargets((t) => [...t, n])} className="size-7 rounded-lg bg-white/10 font-bold disabled:opacity-30" aria-label={`${codeOf(n)} থেকে বেশি`}>
                    +
                  </button>
                </li>
              );
            })}
          </ul>
          <Confirm state={state} action={{ type: "policy", id, targets }} onAct={onAct} />
        </>
      )}
      {id === "quiet" && <Confirm state={state} action={{ type: "policy", id }} onAct={onAct}>পরের সংকট-পর্ব বাদ দিন</Confirm>}
      {id === "resilience" && (
        <>
          <NodeSelect state={state} value={node} onChange={setNode} filter={(n) => state.crisisDiscard.includes(n)} label="কোন সংকট-কার্ড চিরতরে সরাবেন?" />
          <Confirm state={state} action={{ type: "policy", id, n: node }} onAct={onAct} />
        </>
      )}
      {id === "airlift" && (
        <>
          <label className="block text-sm font-semibold">
            কাকে?
            <select value={player} onChange={(e) => setPlayer(Number(e.target.value))} className="mt-1 h-11 w-full rounded-xl border border-white/20 bg-black ring-1 ring-white/12 px-2">
              {state.players.map((p, i) => (
                <option key={i} value={i}>
                  {p.name} ({codeOf(p.at)})
                </option>
              ))}
            </select>
          </label>
          <NodeSelect state={state} value={node} onChange={setNode} filter={() => true} label="কোথায়?" />
          <Confirm state={state} action={{ type: "policy", id, player, to: node }} onAct={onAct} />
        </>
      )}
    </>
  );
}

/** The data analyst's look at the crisis deck. */
export function PeekDialog({ state, open, onAct, onClose }: { state: MissionState; open: boolean; onAct: (a: MissionAction) => void; onClose: () => void }) {
  const [bury, setBury] = useState<number | undefined>(undefined);
  const top = state.crisisDeck.slice(0, 3);
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={shell}>
        <DialogTitle className="text-xl font-bold">সংকট-ডেকের উপরের তিনটি</DialogTitle>
        <DialogDescription className="text-sm leading-6 text-white/80">পরের পালাগুলোতে এগুলো আগে উঠবে। চাইলে একটিকে ডেকের একেবারে নিচে পাঠান। এতে ১টি অ্যাকশন লাগে।</DialogDescription>
        <ul className="space-y-1.5" role="radiogroup" aria-label="কোনটি নিচে পাঠাবেন">
          {top.map((n, i) => {
            const c = cascadePreview(state, n);
            return (
              <li key={n}>
                <button type="button" role="radio" aria-checked={bury === i} onClick={() => setBury(bury === i ? undefined : i)} className={cn("flex w-full items-center gap-2 rounded-lg border-2 bg-black ring-1 ring-white/12 px-2.5 py-2 text-left text-sm", bury === i ? "border-signal-orange" : "border-transparent")}>
                  <span className="w-5 text-center font-bold text-white/65">{bn(i + 1)}</span>
                  <PillarGlyph id={pillarOf(n)} />
                  <span className="min-w-0 flex-1">
                    <strong>{codeOf(n)}</strong> {titleOf(n)}
                    <span className="block text-xs text-white/80">
                      চাপ {bn(state.pressure[n])}/{bn(RULES.maxPressure)}
                      {state.pressure[n] === RULES.maxPressure && c.hit.length ? ` — উঠলেই ভাঙবে, ঢেউ ${bn(c.hit.length)}টিতে` : ""}
                    </span>
                  </span>
                  {bury === i && <Trash2 className="size-4 text-signal-orange" aria-hidden />}
                </button>
              </li>
            );
          })}
        </ul>
        <Confirm state={state} action={{ type: "peek", bury }} onAct={(a) => (onAct(a), setBury(undefined))}>
          {bury === undefined ? "শুধু দেখুন (ক্রম অপরিবর্তিত)" : `${codeOf(top[bury])} নিচে পাঠান`}
        </Confirm>
      </DialogContent>
    </Dialog>
  );
}

/** Over the hand limit: choose what to let go of (or play a policy). */
export function DiscardDialog({ state, onAct, onPolicy }: { state: MissionState; onAct: (a: MissionAction) => void; onPolicy: (id: PolicyId) => void }) {
  const d = state.discard;
  const open = state.phase === "discard" && !!d && !state.players[d.player].bot;
  const p = d ? state.players[d.player] : null;
  return (
    <Dialog open={open}>
      <DialogContent className={cn(shell, "max-w-2xl")} showCloseButton={false} onEscapeKeyDown={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
        {p && (
          <>
            <DialogTitle className="text-xl font-bold">{p.name}: হাতে {bn(p.hand.length)}টি কার্ড — সর্বোচ্চ {bn(RULES.handLimit)}</DialogTitle>
            <DialogDescription className="text-sm leading-6 text-white/80">একটি কার্ড ফেলুন (বা নীতি-কার্ড খেলুন)। যে স্তম্ভের সংস্কার হয়ে গেছে, তার কার্ড সাধারণত সবচেয়ে কম কাজে লাগে।</DialogDescription>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {p.hand.map((c, i) => (
                <li key={i} className="flex flex-col gap-1">
                  <div className="relative h-28 overflow-hidden rounded-xl bg-black ring-1 ring-white/12 p-2.5 pl-3.5">
                    <span className={cn("absolute inset-y-0 left-0 w-1.5", c.kind !== "node" && "bg-signal-orange")} style={c.kind === "node" ? { background: PILLAR_COLOR[pillarOf(c.n)] } : undefined} aria-hidden />
                    <CardFace card={c} small />
                  </div>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => onAct({ type: "discard", index: i })} className="h-9 flex-1 rounded-lg bg-white/10 text-xs font-bold text-white hover:bg-white/15">
                      ফেলুন
                    </button>
                    {c.kind === "policy" && d!.player === state.current && (
                      <button type="button" onClick={() => onPolicy(c.id)} className="h-9 flex-1 rounded-lg bg-signal-orange text-xs font-bold text-text-primary">
                        খেলুন
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
