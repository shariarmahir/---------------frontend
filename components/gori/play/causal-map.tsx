"use client";

import "@xyflow/react/dist/style.css";
import {
  Background,
  BaseEdge,
  ConnectionMode,
  Controls,
  EdgeLabelRenderer,
  Handle,
  Position,
  ReactFlow,
  useInternalNode,
  type Connection,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { Link2, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { evidenceById } from "@/data/gori/evidence";
import { PUZZLE_TARGET } from "@/lib/gori/progression";
import { assumptionValue } from "@/lib/gori/sim/engine";
import { explainChange } from "@/lib/gori/sim/report";
import type { CausalEdge, RunResult, ScenarioDef } from "@/lib/gori/sim/types";
import { cn } from "@/lib/utils";
import { useT } from "../provider";
import { useGori } from "../store";

const R = 46;
const POS: Record<string, { x: number; y: number }> = {
  staff: { x: 225, y: 0 },
  quality: { x: 425, y: 10 },
  meds: { x: 615, y: 60 },
  oop: { x: 25, y: 205 },
  access: { x: 225, y: 205 },
  health: { x: 425, y: 225 },
  data: { x: 615, y: 270 },
  income: { x: 130, y: 420 },
  equity: { x: 355, y: 430 },
  trust: { x: 560, y: 450 },
};

type VarData = { label: string; value: number; delta: number; good: "up" | "down"; kind: string; focused: boolean };
type IntData = { label: string; scale: "pilot" | "full" | "planned" };
type EdgeData = { sign: 1 | -1; weight: number; basis: string; confidence: string; delay: number; user?: boolean; selected?: boolean };

function VarNode({ data }: NodeProps<Node<VarData>>) {
  const { n } = useT();
  const better = data.delta === 0 ? null : (data.good === "up") === data.delta > 0;
  const c = 2 * Math.PI * (R - 5);
  return (
    <div className={cn("relative flex size-[92px] flex-col items-center justify-center rounded-full bg-black ring-1 ring-white/12 text-center shadow-[0_6px_16px_-10px_rgb(0_0_0/0.5)]", data.focused && "ring-4 ring-signal-orange/60")}>
      <svg viewBox="0 0 92 92" className="absolute inset-0" aria-hidden>
        <circle cx="46" cy="46" r={R - 5} className="fill-none stroke-white/25" strokeWidth="5" />
        <circle
          cx="46"
          cy="46"
          r={R - 5}
          className={cn("fill-none transition-[stroke-dashoffset] duration-700", data.kind === "pressure" ? "stroke-bdorange-600" : "stroke-bdgreen-500")}
          strokeWidth="5"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - data.value / 100)}
          strokeLinecap="round"
          transform="rotate(-90 46 46)"
        />
      </svg>
      <span className="relative max-w-[70px] font-bengali text-[11px] leading-tight font-semibold text-white">{data.label}</span>
      <span className="relative font-bengali text-base font-bold text-white tabular-nums">{n(Math.round(data.value))}</span>
      {better !== null && (
        <span className={cn("relative font-bengali text-[10px] font-bold", better ? "text-bdgreen-500" : "text-bdorange-600")}>
          {data.delta > 0 ? "▲" : "▼"} {n(Math.abs(data.delta))}
        </span>
      )}
      <Handle type="target" position={Position.Left} className="!size-3 !border-2 !border-white !bg-slate-400" />
      <Handle type="source" position={Position.Right} className="!size-3 !border-2 !border-white !bg-signal-orange text-text-primary" />
    </div>
  );
}

function IntNode({ data }: NodeProps<Node<IntData>>) {
  return (
    <div className={cn("max-w-40 rounded-lg px-2.5 py-1.5 text-center font-bengali text-[11px] leading-tight font-semibold shadow-sm", data.scale === "planned" ? "border-2 border-dashed border-signal-orange bg-bdorange-600 text-text-primary" : "bg-black text-white")}>
      {data.label}
      <span className="block text-[10px] font-normal opacity-80">{data.scale === "pilot" ? "পাইলট" : data.scale === "full" ? "পূর্ণ" : "পরিকল্পনায়"}</span>
      <Handle type="source" position={Position.Bottom} className="!opacity-0" isConnectable={false} />
    </div>
  );
}

/** Edge between node centres, trimmed to the circles, bent so two-way pairs don't overlap. */
function CausalEdgeView({ id, source, target, data, markerEnd }: EdgeProps<Edge<EdgeData>>) {
  const s = useInternalNode(source);
  const t = useInternalNode(target);
  const { n } = useT();
  if (!s || !t || !data) return null;
  const sw = s.measured.width ?? 92;
  const sh = s.measured.height ?? 92;
  const tw = t.measured.width ?? 92;
  const th = t.measured.height ?? 92;
  const a = { x: s.internals.positionAbsolute.x + sw / 2, y: s.internals.positionAbsolute.y + sh / 2 };
  const b = { x: t.internals.positionAbsolute.x + tw / 2, y: t.internals.positionAbsolute.y + th / 2 };
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const rs = Math.min(sw, sh) / 2 + 2;
  const rt = Math.min(tw, th) / 2 + 6;
  const p1 = { x: a.x + ux * rs, y: a.y + uy * rs };
  const p2 = { x: b.x - ux * rt, y: b.y - uy * rt };
  const bend = 28;
  const c = { x: (p1.x + p2.x) / 2 - uy * bend, y: (p1.y + p2.y) / 2 + ux * bend };
  const path = `M${p1.x},${p1.y} Q${c.x},${c.y} ${p2.x},${p2.y}`;
  const mid = { x: 0.25 * p1.x + 0.5 * c.x + 0.25 * p2.x, y: 0.25 * p1.y + 0.5 * c.y + 0.25 * p2.y };
  const color = data.user ? "#6d4bd1" : data.sign > 0 ? "#00875a" : "#c2410c";
  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        style={{
          stroke: color,
          strokeWidth: data.selected ? 4 : 1.5 + data.weight * 6,
          strokeDasharray: data.user || data.basis === "assumption" ? "6 5" : undefined,
          opacity: data.confidence === "low" ? 0.6 : 1,
        }}
      />
      <EdgeLabelRenderer>
        <span
          className="nodrag nopan pointer-events-none absolute flex items-center gap-0.5 rounded-full border border-current/30 bg-black ring-1 ring-white/12 px-2 py-0.5 font-bengali text-[14px] leading-none font-bold shadow-sm"
          style={{ transform: `translate(-50%,-50%) translate(${mid.x}px,${mid.y}px)`, color }}
        >
          {data.sign > 0 ? "+" : "−"}
          {data.delay > 0 && <span className="text-[11px] font-normal text-white/65">⏱{n(data.delay)}</span>}
        </span>
      </EdgeLabelRenderer>
    </>
  );
}

const nodeTypes = { v: VarNode, i: IntNode };
const edgeTypes = { c: CausalEdgeView };

export function CausalMap({ sc, run, turn, puzzle }: { sc: ScenarioDef; run: RunResult; turn: number; puzzle: boolean }) {
  const found = useGori((s) => s.progress.puzzleFound);
  const setProgress = useGori((s) => s.setProgress);
  const game = useGori((s) => s.game);
  const addUserEdge = useGori((s) => s.addUserEdge);
  const { n } = useT();
  const [selEdge, setSelEdge] = useState<string | null>(null);
  const [selVar, setSelVar] = useState<string | null>(null);
  const [pending, setPending] = useState<{ from: string; to: string } | null>(null);

  const last = turn > 0 ? run.turns[turn - 1] : null;
  const vars = last?.vars ?? run.start.vars;
  const visible = (e: CausalEdge) => !puzzle || !e.puzzle || found.includes(e.id);
  const hiddenLeft = sc.edges.filter((e) => e.puzzle && !found.includes(e.id)).length;

  const nodes = useMemo<Node[]>(() => {
    const vn: Node[] = sc.variables.map((v) => ({
      id: v.id,
      type: "v",
      position: POS[v.id] ?? { x: 0, y: 0 },
      data: { label: v.bn, value: vars[v.id], delta: last?.delta[v.id] ?? 0, good: v.good, kind: v.kind, focused: selVar === v.id } satisfies VarData,
      ariaLabel: `${v.bn}: ${Math.round(vars[v.id])}`,
    }));
    const active = last?.active ?? [];
    const planned = (game?.plan[turn] ?? []).filter((a) => a.type === "launch").map((a) => (a as { id: string }).id);
    const ints = [...active.map((a) => ({ id: a.id, scale: a.scale as IntData["scale"] })), ...planned.filter((id) => !active.some((a) => a.id === id)).map((id) => ({ id, scale: "planned" as const }))];
    const count: Record<string, number> = {};
    const inNodes: Node[] = ints.map((x) => {
      const def = sc.interventions.find((i) => i.id === x.id)!;
      const target = def.effects[0].v;
      const k = (count[target] = (count[target] ?? 0) + 1);
      const p = POS[target];
      return { id: `i:${x.id}`, type: "i", position: { x: p.x - 150 + (k - 1) * 30, y: p.y - 70 - (k - 1) * 44 }, data: { label: def.bn, scale: x.scale } satisfies IntData, draggable: true, connectable: false };
    });
    return [...vn, ...inNodes];
  }, [sc, vars, last, selVar, game?.plan, turn]);

  const edges = useMemo<Edge[]>(() => {
    const model: Edge[] = sc.edges.filter(visible).map((e) => ({
      id: e.id,
      source: e.from,
      target: e.to,
      type: "c",
      data: { sign: e.sign, weight: e.weight * assumptionValue(sc, run.config, e.assumption), basis: e.basis, confidence: e.confidence, delay: e.delay, selected: selEdge === e.id } satisfies EdgeData,
      markerEnd: { type: "arrowclosed" as never, color: e.sign > 0 ? "#00875a" : "#c2410c" },
      ariaLabel: `${sc.variables.find((v) => v.id === e.from)?.bn} ${e.sign > 0 ? "বাড়ায়" : "কমায়"} ${sc.variables.find((v) => v.id === e.to)?.bn}`,
    }));
    const user: Edge[] = (game?.userEdges ?? []).map((u, i) => ({
      id: `u${i}`,
      source: u.from,
      target: u.to,
      type: "c",
      data: { sign: u.sign, weight: 0.1, basis: "assumption", confidence: "low", delay: 0, user: true } satisfies EdgeData,
    }));
    const effect: Edge[] = nodes
      .filter((x) => x.type === "i")
      .flatMap((x) => {
        const def = sc.interventions.find((i) => `i:${i.id}` === x.id)!;
        return def.effects.map((e) => ({ id: `${x.id}>${e.v}`, source: x.id, target: e.v, type: "c", data: { sign: e.amount > 0 ? 1 : -1, weight: 0.05, basis: def.basis, confidence: "medium", delay: def.delay } as EdgeData }));
      });
    return [...model, ...user, ...effect];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sc, run.config, found, puzzle, selEdge, game?.userEdges, nodes]);

  function propose(from: string, to: string, sign: 1 | -1) {
    setPending(null);
    if (from === to) return;
    const model = sc.edges.find((e) => e.from === from && e.to === to);
    const fromBn = sc.variables.find((v) => v.id === from)?.bn;
    const toBn = sc.variables.find((v) => v.id === to)?.bn;
    if (model && visible(model)) {
      toast.info("এই সম্পর্ক মানচিত্রে আগে থেকেই আছে", { description: model.note });
      return;
    }
    if (model && model.sign === sign) {
      setProgress((p) => ({ ...p, puzzleFound: [...new Set([...p.puzzleFound, model.id])] }));
      toast.success(`লুকোনো সম্পর্ক পেলেন: ${fromBn} → ${toBn}`, { description: model.note });
      return;
    }
    if (model) {
      toast.warning("সম্পর্কটা আছে, কিন্তু দিক উল্টো", { description: `${fromBn} ${toBn}-কে ${model.sign > 0 ? "বাড়ায়" : "কমায়"} — আবার ভাবুন।` });
      return;
    }
    addUserEdge({ from, to, sign });
    toast("আপনার অনুমান হিসেবে যোগ হলো", { description: "খেলার মডেলে এই সম্পর্ক নেই, তাই ফলাফলে প্রভাব ফেলবে না। বেগুনি ড্যাশ দাগে দেখাবে।" });
  }

  const edge = selEdge ? sc.edges.find((e) => e.id === selEdge) : undefined;
  const ctx = sc.contexts.find((c) => c.id === run.config.context)!;
  const varExplain = selVar && turn > 0 ? explainChange(run, turn - 1, selVar) : null;

  return (
    <div className="space-y-4">
      {puzzle && (
        <p className="flex flex-wrap items-center gap-2 rounded-xl bg-bdorange-600 px-4 py-2.5 font-bengali text-sm text-text-primary">
          <Search className="size-4 text-bdorange-600" aria-hidden />
          মানচিত্রে {n(hiddenLeft)}টি সম্পর্ক লুকোনো। এক বৃত্তের কমলা বিন্দু থেকে আরেক বৃত্তে টেনে সম্পর্ক প্রস্তাব করুন, অথবা নিচের ফর্ম ব্যবহার করুন। পেয়েছেন {n(found.length)}/{n(PUZZLE_TARGET)}।
        </p>
      )}
      <div className="h-[460px] overflow-hidden rounded-2xl border border-white/10 bg-text-primary ring-1 ring-white/12 sm:h-[540px]" aria-label="কারণ-মানচিত্র: চাপ দিলে বিস্তারিত নিচে">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionMode={ConnectionMode.Loose}
          onConnect={(c: Connection) => c.source && c.target && !c.source.startsWith("i:") && !c.target.startsWith("i:") && setPending({ from: c.source, to: c.target })}
          onEdgeClick={(_, e) => sc.edges.some((x) => x.id === e.id) && (setSelEdge(e.id), setSelVar(null))}
          onNodeClick={(_, nd) => !nd.id.startsWith("i:") && (setSelVar(nd.id), setSelEdge(null))}
          fitView
          fitViewOptions={{ padding: 0.08 }}
          minZoom={0.4}
          maxZoom={1.6}
          nodesFocusable
          edgesFocusable
        >
          <Background gap={22} size={1} color="#cfd8d3" />
          <Controls showInteractive={false} position="bottom-right" />
        </ReactFlow>
      </div>

      <ul className="flex flex-wrap gap-x-5 gap-y-1 font-bengali text-xs text-white/80" aria-label="সংকেত">
        <li><span className="font-bold text-bdgreen-500">+</span> বাড়ায়</li>
        <li><span className="font-bold text-bdorange-600">−</span> কমায়</li>
        <li>মোটা দাগ = শক্তিশালী সম্পর্ক</li>
        <li>ড্যাশ দাগ = খেলার অনুমান</li>
        <li>⏱ = দেরিতে পৌঁছায় (প্রান্তিক)</li>
        <li><span className="font-bold text-violet-300">বেগুনি</span> = আপনার অনুমান</li>
      </ul>

      {pending && (
        <div role="dialog" aria-label="সম্পর্কের ধরন" className="flex flex-wrap items-center gap-3 rounded-xl bg-black px-4 py-3 font-bengali text-white">
          <span>
            {sc.variables.find((v) => v.id === pending.from)?.bn} → {sc.variables.find((v) => v.id === pending.to)?.bn}:
          </span>
          <button type="button" onClick={() => propose(pending.from, pending.to, 1)} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-bold">+ বাড়ায়</button>
          <button type="button" onClick={() => propose(pending.from, pending.to, -1)} className="rounded-lg bg-bdorange-600 px-3 py-1.5 text-sm font-bold text-text-primary">− কমায়</button>
          <button type="button" onClick={() => setPending(null)} className="ml-auto rounded-lg p-1.5 hover:bg-white/10" aria-label="বাতিল"><X className="size-4" /></button>
        </div>
      )}

      <ProposeForm sc={sc} onPropose={propose} />

      {edge && (
        <section aria-label="সম্পর্কের বিস্তারিত" className="rounded-2xl bg-black ring-1 ring-white/12 p-5 text-white shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-bengali text-lg font-bold">
              {sc.variables.find((v) => v.id === edge.from)?.bn} {edge.sign > 0 ? "বাড়ায়" : "কমায়"} {sc.variables.find((v) => v.id === edge.to)?.bn}
            </h3>
            <button type="button" onClick={() => setSelEdge(null)} aria-label="বন্ধ" className="rounded-lg p-1 hover:bg-white/10"><X className="size-4" /></button>
          </div>
          <p className="mt-1 font-bengali text-sm leading-6 text-white/80">{edge.note}</p>
          <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 font-bengali text-sm sm:grid-cols-3">
            <Fact k="সম্পর্কের ধরন" v={edge.sign > 0 ? "ধনাত্মক (+)" : "ঋণাত্মক (−)"} />
            <Fact k="শক্তি (খেলার সহগ)" v={n(edge.weight * assumptionValue(sc, run.config, edge.assumption))} />
            <Fact k="আস্থা" v={edge.confidence === "high" ? "উচ্চ" : edge.confidence === "medium" ? "মাঝারি" : "নিম্ন"} />
            <Fact k="প্রমাণের অবস্থা" v={edge.basis === "dossier" ? `প্রতিবেদনের প্রক্রিয়া${edge.evidenceRef ? ` — ${evidenceById.get(edge.evidenceRef)?.title}` : ""}` : "খেলার অনুমান"} />
            <Fact k="সময়-বিলম্ব" v={edge.delay ? `${n(edge.delay)} প্রান্তিক` : "সাথে সাথে"} />
            <Fact k="ফেরানো যায়?" v={edge.reversible ? "হ্যাঁ — কারণ সরলে প্রভাবও কমে" : "না"} />
            {edge.assumption && <Fact k="নির্ভর করে যে অনুমানে" v={sc.assumptions.find((a) => a.id === edge.assumption)!.bn} />}
            <Fact k="প্রেক্ষাপট-নোট" v={`${ctx.bn}: ${ctx.description}`} />
          </dl>
        </section>
      )}

      {selVar && (
        <section aria-label="সূচকের বিস্তারিত" className="rounded-2xl bg-black ring-1 ring-white/12 p-5 text-white shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-bengali text-lg font-bold">{sc.variables.find((v) => v.id === selVar)?.bn}</h3>
            <button type="button" onClick={() => setSelVar(null)} aria-label="বন্ধ" className="rounded-lg p-1 hover:bg-white/10"><X className="size-4" /></button>
          </div>
          <p className="mt-1 font-bengali text-sm text-white/80">{sc.variables.find((v) => v.id === selVar)?.description}</p>
          {varExplain ? (
            <>
              <p className="mt-3 font-bengali text-[15px] leading-7">{varExplain.sentence}</p>
              <ul className="mt-2 space-y-1 font-bengali text-sm">
                {varExplain.parts.map((p, i) => (
                  <li key={i} className="flex justify-between gap-3 border-b border-white/12 py-1">
                    <span>{p.label}{p.basis === "assumption" ? " (অনুমান)" : ""}</span>
                    <span className={cn("font-bold tabular-nums", p.amount > 0 ? "text-bdgreen-500" : "text-bdorange-600")}>{p.amount > 0 ? "+" : ""}{n(p.amount)}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mt-3 font-bengali text-sm text-white/65">একটি টার্ন চালালে এখানে দেখাবে কেন এটি বদলাল।</p>
          )}
        </section>
      )}
    </div>
  );
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-xs text-white/65">{k}</dt>
      <dd className="font-semibold">{v}</dd>
    </div>
  );
}

/** The same proposal without dragging — for keyboards, screen readers and phones. */
function ProposeForm({ sc, onPropose }: { sc: ScenarioDef; onPropose: (from: string, to: string, sign: 1 | -1) => void }) {
  const [from, setFrom] = useState(sc.variables[0].id);
  const [to, setTo] = useState(sc.variables[1].id);
  const [sign, setSign] = useState<1 | -1>(1);
  const sel = "h-10 rounded-lg border border-white/15 bg-black ring-1 ring-white/12 px-2 font-bengali text-sm text-white";
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onPropose(from, to, sign);
      }}
      className="flex flex-wrap items-end gap-2 rounded-xl bg-white/70 p-3"
      aria-label="সম্পর্ক প্রস্তাব"
    >
      <label className="font-bengali text-xs text-white/65">
        কারণ
        <select value={from} onChange={(e) => setFrom(e.target.value)} className={cn(sel, "mt-1 block")}>
          {sc.variables.map((v) => <option key={v.id} value={v.id}>{v.bn}</option>)}
        </select>
      </label>
      <label className="font-bengali text-xs text-white/65">
        প্রভাব
        <select value={sign} onChange={(e) => setSign(Number(e.target.value) as 1 | -1)} className={cn(sel, "mt-1 block")}>
          <option value={1}>বাড়ায় (+)</option>
          <option value={-1}>কমায় (−)</option>
        </select>
      </label>
      <label className="font-bengali text-xs text-white/65">
        যার ওপর
        <select value={to} onChange={(e) => setTo(e.target.value)} className={cn(sel, "mt-1 block")}>
          {sc.variables.map((v) => <option key={v.id} value={v.id}>{v.bn}</option>)}
        </select>
      </label>
      <button type="submit" className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-black px-3 font-bengali text-sm font-bold text-white">
        <Link2 className="size-4" aria-hidden /> প্রস্তাব করুন
      </button>
    </form>
  );
}
