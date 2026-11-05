"use client";

import Link from "next/link";
import { ArrowRightLeft, Briefcase, FilePlus2, FileText, Mail, MessagesSquare, Plus, Printer, Send, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { downloadCsv } from "@/components/hq/data-table";
import { HqDialog } from "@/components/hq/dialog";
import { nameOf, usePeople, useToday } from "@/components/hq/hooks";
import { Avatar, Empty, FormField, hb, inputCls, PageHead, Panel, Pill, Seg, selectCls, Stat, textareaCls } from "@/components/hq/kit";
import { useAct, useHq } from "@/components/hq/provider";
import { docTotals, takaInWords } from "@/lib/hq/finance";
import { dateLabel } from "@/lib/hq/format";
import { addDays, taka } from "@/lib/hq/rules";
import type { Doc, DocKind, Project } from "@/lib/hq/types";
import { cn } from "@/lib/utils";

const DOC_LABEL: Record<DocKind, string> = { quotation: "Quotation", invoice: "Invoice", challan: "Delivery challan", "mushok-6.3": "Mushok 6.3 (VAT invoice)", contract: "Contract", receipt: "Receipt" };

export function HrCenter() {
  const v = useHq();
  const act = useAct();
  const people = usePeople();
  const today = useToday();
  const [docKind, setDocKind] = useState<DocKind | "all">("all");
  const [newDoc, setNewDoc] = useState(false);
  const [viewDoc, setViewDoc] = useState<Doc | null>(null);
  const [handover, setHandover] = useState<Project | null>(null);
  const [group, setGroup] = useState(false);
  const [pick, setPick] = useState<string[]>([]);
  const [range, setRange] = useState({ from: addDays(today, -29), to: today });
  const [rows, setRows] = useState<Record<string, string | number>[] | null>(null);
  const setup = v.projects.filter((p) => p.status === "setup" || !p.handedOver);
  const docs = v.docs.filter((d) => docKind === "all" || d.kind === docKind).sort((a, b) => b.date.localeCompare(a.date));
  const clients = new Map(v.clients.map((c) => [c.id, c]));
  const groups = v.channels.filter((c) => c.kind === "group");
  const active = v.people.filter((p) => p.status === "active");
  const emails = pick.map((id) => people.get(id)?.email).filter(Boolean);

  return (
    <>
      <PageHead
        title="HR"
        lead="HR opens every confirmed project's room and owns resources, budget and documents until a client manager and team leader take over."
        actions={
          <button type="button" onClick={() => setNewDoc(true)} className={hb.gold}>
            <FilePlus2 aria-hidden className="size-4" /> New document
          </button>
        }
      />
      <section className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Projects waiting for setup" value={setup.length} icon={Briefcase} />
        <Stat label="Documents" value={v.docs.length} icon={FileText} field="ink" />
        <Stat label="Unpaid invoices" value={taka(v.docs.filter((d) => d.kind === "invoice" && d.status === "sent").reduce((s, d) => s + docTotals(d).total, 0), { compact: true })} icon={FileText} field="cobalt" />
        <Stat label="Pending ID applications" value={v.applications.filter((a) => a.status === "pending").length} icon={Users} href="/hq/approvals" />
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <Panel title="Confirmed projects" icon={Briefcase} className="xl:col-span-7" sub="Set up, then hand over">
          {v.projects.length === 0 ? <Empty title="No projects yet" /> : null}
          <ul className="flex flex-col gap-2">
            {v.projects.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-black/25 px-3 py-3 ring-1 ring-white/8">
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-white">{p.title}</span>
                  <span className="block text-xs text-white/55">
                    {clients.get(p.clientId)?.org} · budget {taka(p.budget, { compact: true })} · due {dateLabel(p.due)}
                  </span>
                  <span className="mt-1 block text-xs text-white/55">
                    {p.handedOver ? `Handed to ${p.handedOver.to.map((x) => nameOf(people, x)).join(" & ")}` : "With HR"} · {v.docs.filter((d) => d.projectId === p.id).length} documents
                  </span>
                </span>
                <Pill tone={p.status === "setup" ? "cobalt" : p.status === "running" ? "gold" : "muted"}>{p.status}</Pill>
                {p.channelId ? (
                  <Link href={`/hq/chat?c=${p.channelId}`} className={hb.quietSm}>
                    <MessagesSquare aria-hidden className="size-3.5" /> Room
                  </Link>
                ) : null}
                {!p.handedOver ? (
                  <button type="button" onClick={() => setHandover(p)} className={hb.goldSm}>
                    <ArrowRightLeft aria-hidden className="size-3.5" /> Hand over
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Groups & email" icon={Users} field="ink" className="xl:col-span-5" action={<button type="button" onClick={() => setGroup(true)} className={hb.quietSm}><Plus aria-hidden className="size-3.5" /> Group</button>}>
          {groups.length ? (
            <ul className="mb-4 flex flex-wrap gap-2">
              {groups.map((g) => (
                <li key={g.id}>
                  <Link href={`/hq/chat?c=${g.id}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-white/8 px-3 text-xs font-semibold text-white ring-1 ring-white/12 hover:text-signal-orange">
                    #{g.name} · {g.memberIds.length}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
          <p className="mb-2 text-sm text-white/70">Pick people to email:</p>
          <ul className="grid max-h-56 gap-1 overflow-y-auto sm:grid-cols-2">
            {active.map((p) => {
              const on = pick.includes(p.id);
              return (
                <li key={p.id}>
                  <button type="button" aria-pressed={on} onClick={() => setPick((x) => (on ? x.filter((y) => y !== p.id) : [...x, p.id]))} className={cn("flex min-h-10 w-full items-center gap-2 rounded-lg px-2 text-left text-sm ring-1", on ? "bg-white/10 text-white ring-signal-orange" : "text-white/75 ring-transparent hover:bg-white/5")}>
                    <Avatar person={p} size="xs" /> <span className="truncate">{p.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <a href={emails.length ? `mailto:${emails.join(",")}` : undefined} aria-disabled={!emails.length} className={cn(hb.gold, !emails.length && "pointer-events-none opacity-50")}>
              <Mail aria-hidden className="size-4" /> Email {pick.length || ""}
            </a>
            <button type="button" onClick={() => setPick(active.map((p) => p.id))} className={hb.quiet}>
              Everyone
            </button>
          </div>
          {pick.length > emails.length ? <p className="mt-2 text-xs text-white/55">{pick.length - emails.length} picked people have no email on record yet.</p> : null}
        </Panel>

        <Panel title="Document centre" icon={FileText} className="xl:col-span-12" action={<Seg label="Kind" value={docKind} onChange={setDocKind} options={[{ value: "all", label: "All" }, { value: "quotation", label: "Quotations" }, { value: "invoice", label: "Invoices" }, { value: "challan", label: "Challans" }, { value: "mushok-6.3", label: "Mushok" }]} />}>
          {docs.length === 0 ? <Empty title="No documents" /> : null}
          <div className="overflow-x-auto rounded-xl ring-1 ring-white/10">
            <table className="w-full min-w-[42rem] text-left text-sm">
              <thead className="bg-white/5 text-xs text-white/65">
                <tr>
                  <th className="px-3 py-2.5">Number</th>
                  <th className="px-3 py-2.5">Kind</th>
                  <th className="px-3 py-2.5">Client</th>
                  <th className="px-3 py-2.5">Date</th>
                  <th className="px-3 py-2.5 text-right">Total</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {docs.map((d) => (
                  <tr key={d.id} className="border-t border-white/8">
                    <td className="px-3 py-2.5 font-mono text-xs text-white">{d.number}</td>
                    <td className="px-3 py-2.5 text-white/85">{DOC_LABEL[d.kind]}</td>
                    <td className="px-3 py-2.5 text-white/85">{clients.get(d.clientId)?.org}</td>
                    <td className="px-3 py-2.5 text-white/70">{dateLabel(d.date, { year: true })}</td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-signal-orange">{taka(docTotals(d).total)}</td>
                    <td className="px-3 py-2.5">
                      <select aria-label={`Status of ${d.number}`} value={d.status} onChange={(e) => act("business", "doc.edit", { id: d.id, status: e.target.value }, { quiet: true })} className={cn(selectCls, "min-h-8 w-28 text-xs")}>
                        {["draft", "sent", "paid", "void"].map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="flex gap-1">
                        <button type="button" onClick={() => setViewDoc(d)} aria-label={`Open ${d.number}`} className={hb.iconSm}>
                          <Printer aria-hidden className="size-3.5" />
                        </button>
                        <button type="button" onClick={() => act("business", "doc.remove", { id: d.id }, { ok: "Document deleted" })} aria-label={`Delete ${d.number}`} className={hb.iconSm}>
                          <Trash2 aria-hidden className="size-3.5" />
                        </button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Report to the CEO" icon={Send} field="cobalt" className="xl:col-span-12" sub="Task delivery per member for a period">
          <div className="flex flex-wrap items-end gap-3">
            <FormField label="From">
              <input type="date" value={range.from} onChange={(e) => setRange((x) => ({ ...x, from: e.target.value }))} className={inputCls} />
            </FormField>
            <FormField label="To">
              <input type="date" value={range.to} onChange={(e) => setRange((x) => ({ ...x, to: e.target.value }))} className={inputCls} />
            </FormField>
            <button type="button" onClick={() => act<Record<string, string | number>[]>("business", "report.ceo", range, { ok: "Sent to the CEO" }).then(setRows, () => {})} className={hb.gold}>
              <Send aria-hidden className="size-4" /> Build & send to CEO
            </button>
            {rows ? (
              <button type="button" onClick={() => downloadCsv(`hr-report-${range.from}-${range.to}`, rows)} className={hb.outline}>
                Download CSV
              </button>
            ) : null}
          </div>
          {rows ? (
            <div className="mt-4 overflow-x-auto rounded-xl ring-1 ring-white/15">
              <table className="w-full min-w-[36rem] text-left text-sm">
                <thead className="bg-black/25 text-xs text-white/70">
                  <tr>
                    <th className="px-3 py-2">Member</th>
                    <th className="px-3 py-2">Tasks done</th>
                    <th className="px-3 py-2">On time</th>
                    <th className="px-3 py-2">Points</th>
                    <th className="px-3 py-2">Daily reports</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={String(r.member)} className="border-t border-white/10 text-white">
                      <td className="px-3 py-2">{r.member}</td>
                      <td className="px-3 py-2">{r.tasksDone}</td>
                      <td className="px-3 py-2">{r.onTimePct}%</td>
                      <td className="px-3 py-2">{r.points}</td>
                      <td className="px-3 py-2">{r.dailyReports}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </Panel>
      </div>

      <DocDialog open={newDoc} onOpenChange={setNewDoc} />
      <DocView doc={viewDoc} onClose={() => setViewDoc(null)} />
      <HandoverDialog project={handover} onClose={() => setHandover(null)} />
      <GroupDialog open={group} onOpenChange={setGroup} />
    </>
  );
}

function DocDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const act = useAct();
  const today = useToday();
  const clients = useHq((v) => v.clients);
  const projects = useHq((v) => v.projects);
  const [f, setF] = useState({ kind: "quotation" as DocKind, clientId: "", projectId: "", date: today, vatPct: 15 });
  const [lines, setLines] = useState([{ item: "", qty: 1, rate: 0 }]);
  const t = docTotals({ lines, vatPct: f.vatPct });
  return (
    <HqDialog
      open={open}
      onOpenChange={onOpenChange}
      title="New document"
      size="lg"
      footer={
        <button type="button" disabled={!f.clientId || !lines.some((l) => l.item.trim())} onClick={() => act("business", "doc.create", { ...f, projectId: f.projectId || undefined, lines: lines.filter((l) => l.item.trim()) }, { ok: "Document created" }).then(() => { onOpenChange(false); setLines([{ item: "", qty: 1, rate: 0 }]); }, () => {})} className={hb.gold}>
          Create
        </button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Kind">
          <select value={f.kind} onChange={(e) => setF((x) => ({ ...x, kind: e.target.value as DocKind, vatPct: e.target.value === "challan" ? 0 : x.vatPct }))} className={selectCls}>
            {Object.entries(DOC_LABEL).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Date">
          <input type="date" value={f.date} onChange={(e) => setF((x) => ({ ...x, date: e.target.value }))} className={inputCls} />
        </FormField>
        <FormField label="Client">
          <select value={f.clientId} onChange={(e) => setF((x) => ({ ...x, clientId: e.target.value, projectId: "" }))} className={selectCls}>
            <option value="">Choose…</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.org}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Project (optional)">
          <select value={f.projectId} onChange={(e) => setF((x) => ({ ...x, projectId: e.target.value }))} className={selectCls}>
            <option value="">None</option>
            {projects
              .filter((p) => p.clientId === f.clientId)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
          </select>
        </FormField>
        <fieldset className="sm:col-span-2">
          <legend className="mb-2 text-sm font-semibold text-white/85">Lines</legend>
          <div className="flex flex-col gap-2">
            {lines.map((l, i) => (
              <div key={i} className="grid grid-cols-[1fr_5rem_8rem_auto] gap-2">
                <input aria-label="Item" value={l.item} onChange={(e) => setLines((x) => x.map((y, j) => (j === i ? { ...y, item: e.target.value } : y)))} placeholder="Item or service" className={inputCls} />
                <input aria-label="Quantity" type="number" min={1} value={l.qty} onChange={(e) => setLines((x) => x.map((y, j) => (j === i ? { ...y, qty: Number(e.target.value) } : y)))} className={inputCls} />
                <input aria-label="Rate" type="number" min={0} value={l.rate || ""} onChange={(e) => setLines((x) => x.map((y, j) => (j === i ? { ...y, rate: Number(e.target.value) } : y)))} placeholder="Rate ৳" className={inputCls} />
                <button type="button" onClick={() => setLines((x) => x.filter((_, j) => j !== i))} aria-label="Remove line" className={hb.icon}>
                  <Trash2 aria-hidden className="size-4" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => setLines((x) => [...x, { item: "", qty: 1, rate: 0 }])} className={cn(hb.quietSm, "self-start")}>
              <Plus aria-hidden className="size-3.5" /> Add line
            </button>
          </div>
        </fieldset>
        <FormField label="VAT %">
          <input type="number" min={0} max={100} value={f.vatPct} onChange={(e) => setF((x) => ({ ...x, vatPct: Number(e.target.value) }))} className={inputCls} />
        </FormField>
        <div className="self-end rounded-xl bg-black/30 p-3 text-sm text-white/85">
          Subtotal {taka(t.subtotal)} · VAT {taka(t.vat)} · <strong className="text-signal-orange">Total {taka(t.total)}</strong>
        </div>
      </div>
    </HqDialog>
  );
}

/** An A4, black-on-white document ready to print or save as PDF. */
function DocView({ doc, onClose }: { doc: Doc | null; onClose: () => void }) {
  const clients = useHq((v) => v.clients);
  if (!doc) return null;
  const c = clients.find((x) => x.id === doc.clientId);
  const t = docTotals(doc);
  return (
    <div className="fixed inset-0 z-[96] overflow-y-auto bg-black/80 p-4 print:static print:bg-white print:p-0">
      <style>{`@media print { body * { visibility: hidden; } #hq-doc, #hq-doc * { visibility: visible; } #hq-doc { position: absolute; inset: 0; } }`}</style>
      <div className="mx-auto mb-3 flex max-w-[210mm] justify-end gap-2 print:hidden">
        <button type="button" onClick={() => window.print()} className={hb.gold}>
          <Printer aria-hidden className="size-4" /> Print / save as PDF
        </button>
        <button type="button" onClick={onClose} className={hb.quiet}>
          Close
        </button>
      </div>
      <article id="hq-doc" className="mx-auto min-h-[297mm] max-w-[210mm] bg-white p-[18mm] text-text-primary">
        <header className="flex items-start justify-between border-b-2 border-text-primary pb-4">
          <div>
            <p className="font-grotesk text-2xl font-bold">Kandari Lab</p>
            <p className="text-xs">Deep-tech for Bangladesh · Dhaka</p>
          </div>
          <div className="text-right">
            <p className="font-grotesk text-xl font-bold">{DOC_LABEL[doc.kind]}</p>
            <p className="font-mono text-sm">{doc.number}</p>
            <p className="text-sm">{dateLabel(doc.date, { year: true, long: true })}</p>
          </div>
        </header>
        <section className="mt-6 text-sm">
          <p className="text-xs font-bold">Bill to</p>
          <p className="font-semibold">{c?.org}</p>
          <p>{c?.contact.name}</p>
          <p>{c?.contact.phone}</p>
          <p>{c?.contact.email}</p>
        </section>
        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b-2 border-text-primary text-left">
              <th className="py-2">#</th>
              <th className="py-2">Description</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Rate</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {doc.lines.map((l, i) => (
              <tr key={i} className="border-b">
                <td className="py-2">{i + 1}</td>
                <td className="py-2">{l.item}</td>
                <td className="py-2 text-right">{l.qty}</td>
                <td className="py-2 text-right">{taka(l.rate)}</td>
                <td className="py-2 text-right">{taka(l.qty * l.rate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 ml-auto w-64 text-sm">
          <p className="flex justify-between py-1"><span>Subtotal</span><span>{taka(t.subtotal)}</span></p>
          <p className="flex justify-between py-1"><span>VAT {doc.vatPct}%</span><span>{taka(t.vat)}</span></p>
          <p className="flex justify-between border-t-2 border-text-primary py-2 font-bold"><span>Total</span><span>{taka(t.total)}</span></p>
        </div>
        <p className="mt-4 text-sm italic">{takaInWords(t.total)}</p>
        <footer className="mt-24 grid grid-cols-2 gap-12 text-xs">
          <p className="border-t pt-2">Prepared by</p>
          <p className="border-t pt-2">Authorised signature</p>
        </footer>
        {doc.sample ? <p className="mt-8 text-xs">Sample document.</p> : null}
      </article>
    </div>
  );
}

function HandoverDialog({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const act = useAct();
  const all = useHq((v) => v.people);
  const [f, setF] = useState({ managerId: "", leaderId: "", note: "" });
  const active = all.filter((p) => p.status === "active");
  return (
    <HqDialog
      open={Boolean(project)}
      onOpenChange={(o) => !o && onClose()}
      title="Hand over the project"
      description={project?.title}
      size="sm"
      footer={
        <button type="button" disabled={!f.managerId || !f.leaderId} onClick={() => project && act("business", "project.handover", { id: project.id, ...f }, { ok: "Handed over" }).then(onClose, () => {})} className={hb.gold}>
          <ArrowRightLeft aria-hidden className="size-4" /> Hand over
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        <FormField label="Client manager">
          <select value={f.managerId} onChange={(e) => setF((x) => ({ ...x, managerId: e.target.value }))} className={selectCls}>
            <option value="">Choose…</option>
            {active.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Team leader">
          <select value={f.leaderId} onChange={(e) => setF((x) => ({ ...x, leaderId: e.target.value }))} className={selectCls}>
            <option value="">Choose…</option>
            {active.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Handover note">
          <textarea value={f.note} onChange={(e) => setF((x) => ({ ...x, note: e.target.value }))} className={textareaCls} placeholder="Budget, documents done, open questions…" />
        </FormField>
      </div>
    </HqDialog>
  );
}

function GroupDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const act = useAct();
  const all = useHq((v) => v.people);
  const [f, setF] = useState({ name: "", topic: "" });
  const [pick, setPick] = useState<string[]>([]);
  return (
    <HqDialog open={open} onOpenChange={onOpenChange} title="New HR group" footer={<button type="button" disabled={f.name.trim().length < 2 || !pick.length} onClick={() => act("business", "group.create", { ...f, memberIds: pick }, { ok: "Group created" }).then(() => onOpenChange(false), () => {})} className={hb.gold}>Create group</button>}>
      <div className="flex flex-col gap-4">
        <FormField label="Name">
          <input value={f.name} onChange={(e) => setF((x) => ({ ...x, name: e.target.value }))} className={inputCls} />
        </FormField>
        <FormField label="Topic">
          <input value={f.topic} onChange={(e) => setF((x) => ({ ...x, topic: e.target.value }))} className={inputCls} />
        </FormField>
        <ul className="grid gap-1 sm:grid-cols-2">
          {all
            .filter((p) => p.status === "active")
            .map((p) => {
              const on = pick.includes(p.id);
              return (
                <li key={p.id}>
                  <button type="button" aria-pressed={on} onClick={() => setPick((x) => (on ? x.filter((y) => y !== p.id) : [...x, p.id]))} className={cn("flex min-h-10 w-full items-center gap-2 rounded-lg px-2 text-left text-sm ring-1", on ? "bg-white/10 text-white ring-signal-orange" : "text-white/75 ring-transparent hover:bg-white/5")}>
                    <Avatar person={p} size="xs" /> {p.name}
                  </button>
                </li>
              );
            })}
        </ul>
      </div>
    </HqDialog>
  );
}
