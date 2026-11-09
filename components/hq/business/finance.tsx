"use client";

import { Banknote, Calculator, CheckCircle2, CircleAlert, Download, FileSpreadsheet, Pencil, Plus, Printer, Trash2, TrendingDown, TrendingUp, Upload, Wallet } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Bar, CartesianGrid, Cell, ComposedChart, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DataTable, downloadCsv } from "@/components/hq/data-table";
import { HqDialog } from "@/components/hq/dialog";
import { useToday } from "@/components/hq/hooks";
import { axisProps, CHART, ChartTip, Empty, FormField, hb, inputCls, PageHead, Panel, Pill, Seg, selectCls, Stat } from "@/components/hq/kit";
import { useAct, useHq, useNow } from "@/components/hq/provider";
import { balance, groupBy, inRange, monthly, PERIOD_LABEL, periodRange, totals, txnCsv, type Period } from "@/lib/hq/finance";
import { dateLabel, MONTHS_SHORT } from "@/lib/hq/format";
import { addDays, can, num, taka } from "@/lib/hq/rules";
import type { PayMethod, Txn } from "@/lib/hq/types";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Salaries", "Rent & utilities", "Cloud & software", "Components & PCB", "Travel & field", "Marketing", "Client milestone", "Device sales", "Grant", "Investment", "Other"];
const METHODS: PayMethod[] = ["bank", "cash", "bkash", "nagad", "card"];

export function Finance() {
  const v = useHq();
  const now = useNow(60_000);
  const today = useToday();
  const editor = can(v.me.person, "finance.edit");
  const [period, setPeriod] = useState<Period>("half");
  const [editing, setEditing] = useState<Txn | "new" | null>(null);
  const [importing, setImporting] = useState(false);
  const [printing, setPrinting] = useState(false);
  const clients = useMemo(() => new Map(v.clients.map((c) => [c.id, c.org])), [v.clients]);

  const range = periodRange(period, now);
  const span = useMemo(() => v.txns.filter((t) => inRange(t, range.from, range.to)), [v.txns, range.from, range.to]);
  const prevRange = { from: addDays(range.from, -(Date.parse(range.to) - Date.parse(range.from)) / 86400_000 - 1), to: addDays(range.from, -1) };
  const prev = totals(v.txns.filter((t) => inRange(t, prevRange.from, prevRange.to)));
  const cur = totals(span);
  const delta = (a: number, b: number) => (b ? ((a - b) / Math.abs(b)) * 100 : undefined);
  const months = period === "year" ? 12 : period === "half" ? 6 : 3;
  const flow = useMemo(() => monthly(v.txns, now, months).map((r) => ({ ...r, label: `${MONTHS_SHORT[Number(r.month.slice(5)) - 1]}` })), [v.txns, now, months]);
  const byCategory = useMemo(() => groupBy(span.filter((t) => t.kind === "expense"), (t) => t.category), [span]);
  const byClient = useMemo(() => groupBy(span.filter((t) => t.kind === "income"), (t) => (t.clientId ? (clients.get(t.clientId) ?? "Client") : t.category)).slice(0, 6), [span, clients]);
  const cash = balance(v.txns);
  const sample = v.txns.some((t) => t.sample);

  const columns: ColumnDef<Txn, unknown>[] = [
    { accessorKey: "day", header: "Date", cell: (c) => <span className="font-mono text-xs">{dateLabel(c.row.original.day, { year: true })}</span> },
    { accessorKey: "kind", header: "Type", cell: (c) => (c.row.original.kind === "income" ? <Pill tone="gold">Income</Pill> : <Pill tone="navy">Expense</Pill>) },
    { accessorKey: "category", header: "Category" },
    { id: "client", accessorFn: (t) => (t.clientId ? clients.get(t.clientId) : ""), header: "Client" },
    { accessorKey: "amount", header: "Amount", cell: (c) => <span className={cn("font-mono font-bold", c.row.original.kind === "income" ? "text-signal-orange" : "text-white")}>{c.row.original.kind === "income" ? "+" : "−"}{taka(c.row.original.amount)}</span> },
    { accessorKey: "method", header: "Method", cell: (c) => <span className="capitalize">{c.row.original.method === "bkash" ? "bKash" : c.row.original.method}</span> },
    { accessorKey: "note", header: "Note", cell: (c) => <span className="line-clamp-1 max-w-56 text-white/65">{c.row.original.note}</span> },
    ...(editor
      ? [
          {
            id: "edit",
            header: "",
            cell: (c: { row: { original: Txn } }) => (
              <button type="button" onClick={() => setEditing(c.row.original)} aria-label="Edit transaction" className={hb.iconSm}>
                <Pencil aria-hidden className="size-3.5" />
              </button>
            ),
          } as ColumnDef<Txn, unknown>,
        ]
      : []),
  ];

  const report = (p: Period) => {
    const r = periodRange(p, now);
    const rows = v.txns.filter((t) => inRange(t, r.from, r.to)).sort((a, b) => a.day.localeCompare(b.day));
    const t = totals(rows);
    downloadCsv(`kandari-finance-${PERIOD_LABEL[p].toLowerCase().replace(" ", "-")}-${r.to}`, [...rows.map((x) => txnCsv(x, x.clientId ? clients.get(x.clientId) : "")), { date: "TOTAL", type: "", category: "", amount: t.profit, client: `income ${t.income} / expense ${t.expense}`, method: "", note: "" }]);
  };

  return (
    <>
      <PageHead
        title="Finance"
        lead={`Income, expenses, cash flow and reports, ${dateLabel(range.from)} – ${dateLabel(range.to)}.`}
        actions={
          <>
            <Seg label="Period" value={period} onChange={setPeriod} options={(Object.keys(PERIOD_LABEL) as Period[]).map((p) => ({ value: p, label: PERIOD_LABEL[p] }))} />
            {editor ? (
              <button type="button" onClick={() => setEditing("new")} className={hb.gold}>
                <Plus aria-hidden className="size-4" /> Transaction
              </button>
            ) : null}
          </>
        }
      />
      {sample ? (
        <p className="mb-4 flex items-center gap-2 text-sm text-white/65">
          <Pill>Sample</Pill> These figures are sample data until the prime admin clears them.
        </p>
      ) : null}

      <section aria-label="Totals" className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Income" value={taka(cur.income, { compact: true })} delta={delta(cur.income, prev.income)} icon={TrendingUp} sub="vs previous period" />
        <Stat label="Expenses" value={taka(cur.expense, { compact: true })} delta={delta(cur.expense, prev.expense)} goodDown icon={TrendingDown} field="ink" />
        <Stat label="Profit" value={<span className={cur.profit < 0 ? "text-crimson-bright" : ""}>{taka(cur.profit, { compact: true })}</span>} icon={Banknote} field="cobalt" />
        <Stat label="Cash balance" value={taka(cash, { compact: true })} icon={Wallet} sub="all time" />
        <Stat label="ROI" value={cur.roi === null ? "—" : `${Math.round(cur.roi * 100)}%`} icon={TrendingUp} field="ink" sub="(income − expense) ÷ expense" />
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <Panel title="Cash flow" icon={Banknote} sub={`${months} months`} className="xl:col-span-8">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={flow} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
                <CartesianGrid stroke={CHART.grid} vertical={false} />
                <XAxis dataKey="label" {...axisProps} />
                <YAxis {...axisProps} width={64} tickFormatter={(x: number) => taka(x, { compact: true }).replace("৳", "")} />
                <Tooltip content={<ChartTip format={(x) => taka(x)} />} />
                <Bar dataKey="income" name="Income" fill={CHART.gold} radius={[6, 6, 0, 0]} maxBarSize={32} />
                <Bar dataKey="expense" name="Expenses" fill={CHART.blue2} radius={[6, 6, 0, 0]} maxBarSize={32} />
                <Line type="monotone" dataKey="profit" name="Profit" stroke={CHART.white} strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Expenses by category" icon={TrendingDown} field="ink" className="xl:col-span-4">
          {byCategory.length === 0 ? (
            <Empty title="No expenses in this period" />
          ) : (
            <div className="flex flex-col items-center gap-4 sm:flex-row xl:flex-col 2xl:flex-row">
              <div className="size-44 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={byCategory} dataKey="amount" nameKey="key" innerRadius={48} outerRadius={80} paddingAngle={2} stroke="none">
                      {byCategory.map((_, i) => (
                        <Cell key={i} fill={CHART.series[i % CHART.series.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTip format={(x) => taka(x)} />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="flex w-full flex-col gap-1.5 text-sm">
                {byCategory.slice(0, 7).map((c, i) => (
                  <li key={c.key} className="flex items-center gap-2">
                    <span className="size-2.5 shrink-0 rounded-full" style={{ background: CHART.series[i % CHART.series.length] }} />
                    <span className="min-w-0 flex-1 truncate text-white/85">{c.key}</span>
                    <span className="font-mono text-xs text-white/70">{taka(c.amount, { compact: true })}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Panel>

        <Panel title="Income by client" icon={TrendingUp} className="xl:col-span-5">
          {byClient.length === 0 ? <Empty title="No income in this period" /> : null}
          <ul className="flex flex-col gap-3">
            {byClient.map((c) => (
              <li key={c.key}>
                <span className="flex justify-between text-sm">
                  <span className="truncate text-white">{c.key}</span>
                  <span className="font-mono text-xs font-bold text-signal-orange">{taka(c.amount, { compact: true })}</span>
                </span>
                <span className="mt-1 block h-2 overflow-hidden rounded-full bg-white/10">
                  <span className="block h-full rounded-full bg-signal-orange" style={{ width: `${(c.amount / byClient[0].amount) * 100}%` }} />
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <CalculatorPanel className="xl:col-span-3" />

        <Panel title="Reports" icon={Download} field="cobalt" className="xl:col-span-4">
          <p className="mb-3 text-sm text-white/75">Download every transaction with totals, or print a clean report.</p>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(PERIOD_LABEL) as Period[]).map((p) => (
              <button key={p} type="button" onClick={() => report(p)} className={hb.quietSm}>
                <Download aria-hidden className="size-3.5" /> {PERIOD_LABEL[p]}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setPrinting(true)} className={cn(hb.gold, "mt-3 w-full")}>
            <Printer aria-hidden className="size-4" /> Print report
          </button>
        </Panel>

        <Panel title="Google Sheet" icon={FileSpreadsheet} className="xl:col-span-6">
          <p className="text-sm leading-relaxed text-white/75">Export the ledger as CSV and open it in Google Sheets, or bring rows in from a CSV file or a published Google Sheet.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => downloadCsv(`kandari-ledger-${today}`, [...v.txns].sort((a, b) => a.day.localeCompare(b.day)).map((t) => txnCsv(t, t.clientId ? clients.get(t.clientId) : "")))} className={hb.outline}>
              <Download aria-hidden className="size-4" /> Export CSV
            </button>
            <a href="https://sheets.new" target="_blank" rel="noopener noreferrer" className={hb.quiet}>
              <FileSpreadsheet aria-hidden className="size-4" /> Open a new Google Sheet
            </a>
            {editor ? (
              <button type="button" onClick={() => setImporting(true)} className={hb.gold}>
                <Upload aria-hidden className="size-4" /> Import rows
              </button>
            ) : null}
          </div>
          <p className="mt-3 text-xs text-white/55">In Google Sheets: File → Import → Upload the CSV. To import back: File → Share → Publish to web → CSV, and paste that link.</p>
        </Panel>

        <CaChecklist className="xl:col-span-6" />

        <Panel title="Ledger" icon={Wallet} className="xl:col-span-12">
          <DataTable data={[...span].sort((a, b) => b.day.localeCompare(a.day))} columns={columns} search="Search transactions…" pageSize={12} csv={{ name: `kandari-ledger-${range.from}-${range.to}`, row: (t) => txnCsv(t, t.clientId ? clients.get(t.clientId) : "") }} empty="No transactions in this period." />
        </Panel>
      </div>

      {editor ? <TxnDialog key={editing === "new" ? "new" : (editing?.id ?? "none")} txn={editing} onClose={() => setEditing(null)} /> : null}
      {editor ? <ImportDialog open={importing} onOpenChange={setImporting} /> : null}
      <PrintReport open={printing} onClose={() => setPrinting(false)} period={period} />
    </>
  );
}

function TxnDialog({ txn, onClose }: { txn: Txn | "new" | null; onClose: () => void }) {
  const act = useAct();
  const today = useToday();
  const clients = useHq((v) => v.clients);
  const existing = txn && txn !== "new" ? txn : null;
  const [f, setF] = useState({ day: existing?.day ?? today, kind: existing?.kind ?? ("expense" as Txn["kind"]), category: existing?.category ?? "Other", amount: existing?.amount ?? 0, clientId: existing?.clientId ?? "", note: existing?.note ?? "", method: existing?.method ?? ("bank" as PayMethod) });
  const save = () => {
    const payload = { ...f, amount: Number(f.amount), clientId: f.clientId || undefined };
    (existing ? act("business", "txn.edit", { id: existing.id, ...payload }, { ok: "Saved" }) : act("business", "txn.add", payload, { ok: "Transaction added" })).then(onClose, () => {});
  };
  return (
    <HqDialog
      open={txn !== null}
      onOpenChange={(o) => !o && onClose()}
      title={existing ? "Edit transaction" : "New transaction"}
      footer={
        <>
          {existing ? (
            <button type="button" onClick={() => act("business", "txn.remove", { id: existing.id }, { ok: "Deleted" }).then(onClose, () => {})} className={hb.quiet}>
              <Trash2 aria-hidden className="size-4" /> Delete
            </button>
          ) : null}
          <button type="button" disabled={!(Number(f.amount) > 0)} onClick={save} className={hb.gold}>
            Save
          </button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Type">
          <select value={f.kind} onChange={(e) => setF((x) => ({ ...x, kind: e.target.value as Txn["kind"] }))} className={selectCls}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </FormField>
        <FormField label="Date">
          <input type="date" value={f.day} onChange={(e) => setF((x) => ({ ...x, day: e.target.value }))} className={inputCls} />
        </FormField>
        <FormField label="Amount (৳)">
          <input type="number" min={0} value={f.amount || ""} onChange={(e) => setF((x) => ({ ...x, amount: Number(e.target.value) }))} className={inputCls} />
        </FormField>
        <FormField label="Category">
          <input list="fin-categories" value={f.category} onChange={(e) => setF((x) => ({ ...x, category: e.target.value }))} className={inputCls} />
          <datalist id="fin-categories">
            {CATEGORIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </FormField>
        <FormField label="Method">
          <select value={f.method} onChange={(e) => setF((x) => ({ ...x, method: e.target.value as PayMethod }))} className={selectCls}>
            {METHODS.map((m) => (
              <option key={m} value={m}>
                {m === "bkash" ? "bKash" : m.charAt(0).toUpperCase() + m.slice(1)}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Client (optional)">
          <select value={f.clientId} onChange={(e) => setF((x) => ({ ...x, clientId: e.target.value }))} className={selectCls}>
            <option value="">None</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.org}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Note" className="sm:col-span-2">
          <input value={f.note} onChange={(e) => setF((x) => ({ ...x, note: e.target.value }))} className={inputCls} />
        </FormField>
      </div>
    </HqDialog>
  );
}

/** Rows from a CSV file or a published Google Sheet, previewed before saving. Columns: date, type, category, amount, method, note. */
function ImportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const act = useAct();
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [link, setLink] = useState("");
  const [error, setError] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const parsed = rows
    .map((r) => ({ day: r.date || r.day, kind: (r.type || r.kind || "").toLowerCase(), category: r.category || "Other", amount: Number(String(r.amount ?? "").replace(/[৳,\s]/g, "")), method: (r.method || "bank").toLowerCase(), note: r.note || "" }))
    .filter((r) => /^\d{4}-\d{2}-\d{2}$/.test(r.day ?? "") && (r.kind === "income" || r.kind === "expense") && r.amount > 0)
    .map((r) => ({ ...r, method: METHODS.includes(r.method as PayMethod) ? r.method : "bank" }));

  const readFile = async (f: File) => {
    const text = await f.text();
    const lines = text.replace(/^﻿/, "").split(/\r?\n/).filter(Boolean);
    const head = lines[0].split(",").map((h) => h.trim().toLowerCase());
    setRows(lines.slice(1).map((l) => Object.fromEntries(l.split(",").map((c, i) => [head[i], c.replace(/^"|"$/g, "").trim()]))));
    setError(null);
  };
  const readLink = async () => {
    setError(null);
    const res = await fetch(`/api/hq/sheet?url=${encodeURIComponent(link)}`);
    const data = (await res.json().catch(() => ({}))) as { rows?: Record<string, string>[]; error?: string };
    if (!res.ok || !data.rows) return setError(data.error ?? "The sheet couldn't be read.");
    setRows(data.rows);
  };

  return (
    <HqDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Import transactions"
      description="Columns: date (YYYY-MM-DD), type (income or expense), category, amount, method, note."
      size="lg"
      footer={
        <button type="button" disabled={!parsed.length} onClick={() => act<number>("business", "txn.import", { rows: parsed }, { ok: `Imported ${parsed.length} rows` }).then(() => { setRows([]); onOpenChange(false); }, () => {})} className={hb.gold}>
          <Upload aria-hidden className="size-4" /> Import {parsed.length} rows
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => file.current?.click()} className={hb.outline}>
            <Upload aria-hidden className="size-4" /> Choose a CSV file
          </button>
          <input ref={file} type="file" accept=".csv,text/csv" hidden onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0])} />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://docs.google.com/spreadsheets/d/e/…/pub?output=csv" aria-label="Published Google Sheet link" className={inputCls} />
          <button type="button" disabled={!link} onClick={readLink} className={hb.quiet}>
            Read sheet
          </button>
        </div>
        {error ? <p role="alert" className="text-sm font-semibold text-crimson-bright">{error}</p> : null}
        {rows.length ? (
          <p className="text-sm text-white/75">
            {parsed.length} of {rows.length} rows are valid{rows.length > parsed.length ? " — rows without a date, a type or an amount are skipped" : ""}.
          </p>
        ) : null}
        {parsed.length ? (
          <div className="max-h-64 overflow-auto rounded-xl ring-1 ring-white/10">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-white/70">
                <tr>
                  {["Date", "Type", "Category", "Amount", "Method"].map((h) => (
                    <th key={h} className="px-3 py-2">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsed.slice(0, 50).map((r, i) => (
                  <tr key={i} className="border-t border-white/8 text-white/85">
                    <td className="px-3 py-1.5">{r.day}</td>
                    <td className="px-3 py-1.5">{r.kind}</td>
                    <td className="px-3 py-1.5">{r.category}</td>
                    <td className="px-3 py-1.5">{taka(r.amount)}</td>
                    <td className="px-3 py-1.5">{r.method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </HqDialog>
  );
}

function CalculatorPanel({ className }: { className?: string }) {
  const [expr, setExpr] = useState("");
  const [memory, setMemory] = useState(0);
  const result = useMemo(() => {
    if (!expr.trim()) return 0;
    if (!/^[\d+\-*/().%\s]+$/.test(expr)) return NaN;
    try {
      // Only digits and arithmetic reach this point.
      const value = Function(`"use strict"; return (${expr.replace(/(\d+(?:\.\d+)?)%/g, "($1/100)")})`)() as number;
      return Number.isFinite(value) ? value : NaN;
    } catch {
      return NaN;
    }
  }, [expr]);
  const press = (k: string) => setExpr((x) => (k === "C" ? "" : k === "⌫" ? x.slice(0, -1) : x + k));
  const keys = ["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "%", "+"];
  return (
    <Panel title="Calculator" icon={Calculator} field="ink" className={className}>
      <input
        value={expr}
        onChange={(e) => setExpr(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && Number.isFinite(result)) setExpr(String(Math.round(result * 100) / 100));
        }}
        aria-label="Calculation"
        placeholder="0"
        className={cn(inputCls, "text-right font-mono")}
      />
      <p className="mt-2 text-right font-grotesk text-2xl font-bold text-signal-orange">{Number.isFinite(result) ? taka(result) : "—"}</p>
      <div className="mt-3 grid grid-cols-4 gap-1.5">
        {keys.map((k) => (
          <button key={k} type="button" onClick={() => press(k)} className="min-h-10 rounded-lg bg-white/8 font-mono text-sm font-bold text-white ring-1 ring-white/10 hover:bg-white/15">
            {k}
          </button>
        ))}
        <button type="button" onClick={() => press("C")} className="min-h-10 rounded-lg bg-white/8 text-sm font-bold text-white hover:bg-white/15">
          C
        </button>
        <button type="button" onClick={() => Number.isFinite(result) && setExpr(String(Math.round(result * 1.15 * 100) / 100))} className="min-h-10 rounded-lg bg-white/8 text-xs font-bold text-white hover:bg-white/15">
          +VAT 15%
        </button>
        <button type="button" onClick={() => Number.isFinite(result) && setMemory(result)} className="min-h-10 rounded-lg bg-white/8 text-xs font-bold text-white hover:bg-white/15">
          M+
        </button>
        <button type="button" onClick={() => Number.isFinite(result) && setExpr(String(Math.round(result * 100) / 100))} className="min-h-10 rounded-lg bg-signal-orange text-sm font-bold text-text-primary">
          =
        </button>
      </div>
      {memory ? (
        <button type="button" onClick={() => setExpr((x) => x + String(memory))} className="mt-2 text-xs text-white/60 underline">
          Memory: {taka(memory)} — insert
        </button>
      ) : null}
    </Panel>
  );
}

/** What a chartered accountant will ask for, checked against the data already here. */
function CaChecklist({ className }: { className?: string }) {
  const v = useHq();
  const today = useToday();
  const month = today.slice(0, 7);
  const last = (() => {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(Date.UTC(y, m - 2, 1));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  })();
  const inMonth = (m: string) => v.txns.filter((t) => t.day.startsWith(m));
  const items = [
    { label: `Salary sheet for ${last}`, ok: inMonth(last).some((t) => t.category === "Salaries") },
    { label: `Invoices issued in ${last}`, ok: v.docs.some((d) => d.kind === "invoice" && d.date.startsWith(last)) },
    { label: "Mushok 6.3 for every VAT invoice", ok: v.docs.filter((d) => d.kind === "invoice" && d.vatPct > 0).every((d) => v.docs.some((m) => m.kind === "mushok-6.3" && m.clientId === d.clientId)) },
    { label: `Monthly VAT return for ${last}`, ok: false, hint: "File it on the NBR portal by the 15th" },
    { label: "TDS / withholding on vendor payments", ok: false, hint: "Keep challans with each payment" },
    { label: "Bank statements this quarter", ok: false, hint: "Download from the bank and attach" },
    { label: "Fixed-asset register (devices, lab equipment)", ok: inMonth(month).some((t) => t.category === "Components & PCB") },
    { label: "Every transaction has a category and note", ok: v.txns.every((t) => t.category && t.note) },
  ];
  const done = items.filter((i) => i.ok).length;
  return (
    <Panel title="CA preparation" icon={CheckCircle2} sub={`${done} of ${items.length} ready`} field="ink" className={className}>
      <ul className="flex flex-col gap-2">
        {items.map((i) => (
          <li key={i.label} className="flex items-start gap-2 text-sm">
            {i.ok ? <CheckCircle2 aria-hidden className="mt-0.5 size-4 shrink-0 text-signal-orange" /> : <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-crimson-bright" />}
            <span>
              <span className={i.ok ? "text-white" : "text-white/85"}>{i.label}</span>
              {!i.ok && i.hint ? <span className="block text-xs text-white/55">{i.hint}</span> : null}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/** A black-on-white report for printing or saving as PDF. */
function PrintReport({ open, onClose, period }: { open: boolean; onClose: () => void; period: Period }) {
  const v = useHq();
  const now = useNow(60_000);
  const r = periodRange(period, now);
  const rows = v.txns.filter((t) => inRange(t, r.from, r.to)).sort((a, b) => a.day.localeCompare(b.day));
  const t = totals(rows);
  const cats = groupBy(rows, (x) => `${x.kind === "income" ? "Income" : "Expense"} · ${x.category}`);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[96] overflow-y-auto bg-black/80 p-4 print:static print:bg-white print:p-0">
      <style>{`@media print { body * { visibility: hidden; } #fin-report, #fin-report * { visibility: visible; } #fin-report { position: absolute; inset: 0; } }`}</style>
      <div className="mx-auto mb-3 flex max-w-3xl justify-end gap-2 print:hidden">
        <button type="button" onClick={() => window.print()} className={hb.gold}>
          <Printer aria-hidden className="size-4" /> Print / save as PDF
        </button>
        <button type="button" onClick={onClose} className={hb.quiet}>
          Close
        </button>
      </div>
      <article id="fin-report" className="mx-auto max-w-3xl rounded-xl bg-white p-10 text-text-primary">
        <h1 className="font-grotesk text-2xl font-bold">Kandari Lab — Financial report</h1>
        <p className="text-sm">
          {PERIOD_LABEL[period]}: {dateLabel(r.from, { year: true })} to {dateLabel(r.to, { year: true })} · generated {dateLabel(now, { year: true })}
        </p>
        <table className="mt-6 w-full text-sm">
          <tbody>
            <tr className="border-b">
              <td className="py-1.5">Income</td>
              <td className="text-right font-bold">{taka(t.income)}</td>
            </tr>
            <tr className="border-b">
              <td className="py-1.5">Expenses</td>
              <td className="text-right font-bold">{taka(t.expense)}</td>
            </tr>
            <tr className="border-b">
              <td className="py-1.5">Profit</td>
              <td className="text-right font-bold">{taka(t.profit)}</td>
            </tr>
            <tr>
              <td className="py-1.5">ROI</td>
              <td className="text-right font-bold">{t.roi === null ? "—" : `${Math.round(t.roi * 100)}%`}</td>
            </tr>
          </tbody>
        </table>
        <h2 className="mt-6 font-bold">By category</h2>
        <table className="mt-2 w-full text-sm">
          <tbody>
            {cats.map((c) => (
              <tr key={c.key} className="border-b">
                <td className="py-1">{c.key}</td>
                <td className="text-right">{taka(c.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h2 className="mt-6 font-bold">Transactions ({num(rows.length)})</h2>
        <table className="mt-2 w-full text-xs">
          <tbody>
            {rows.map((x) => (
              <tr key={x.id} className="border-b">
                <td className="py-1">{x.day}</td>
                <td>{x.category}</td>
                <td>{x.note}</td>
                <td className="text-right">{x.kind === "income" ? "+" : "−"}{taka(x.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.some((x) => x.sample) ? <p className="mt-6 text-xs">Contains sample data.</p> : null}
      </article>
    </div>
  );
}
