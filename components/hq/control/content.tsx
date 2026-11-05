"use client";

import { ArrowDown, ArrowUp, Check, FlaskConical, ImageIcon, Info, Pencil, PlayCircle, Plus, ShoppingBag, Trash2, Upload, Wrench, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { HqDialog } from "@/components/hq/dialog";
import { nameOf, usePeople } from "@/components/hq/hooks";
import { Empty, FormField, hb, inputCls, PageHead, Panel, Pill, Seg, selectCls, textareaCls, type Tone } from "@/components/hq/kit";
import { fileUrl, uploadFile, useAct, useHq, useNow } from "@/components/hq/provider";
import { ago } from "@/lib/hq/format";
import { taka } from "@/lib/hq/rules";
import type { Approval, ContentItem, ContentKind } from "@/lib/hq/types";
import { cn } from "@/lib/utils";

const KINDS: { kind: ContentKind; label: string }[] = [
  { kind: "ad", label: "Ads" },
  { kind: "banner", label: "Banners" },
  { kind: "image", label: "Images" },
  { kind: "card", label: "Cards" },
  { kind: "section", label: "Sections" },
  { kind: "video", label: "Videos" },
  { kind: "product", label: "Products" },
  { kind: "service", label: "Services" },
  { kind: "category", label: "Categories" },
  { kind: "email", label: "Emails" },
];
const STATUS_TONE: Record<ContentItem["status"], Tone> = { draft: "muted", pending: "cobalt", live: "gold", archived: "ink" };
const ORDER_TONE = { new: "red", accepted: "gold", rejected: "muted", delivered: "navy" } as const;

export function ContentCenter() {
  const v = useHq();
  const act = useAct();
  const [kind, setKind] = useState<ContentKind>("ad");
  const [editing, setEditing] = useState<ContentItem | "new" | null>(null);
  const [bulk, setBulk] = useState(false);
  const [request, setRequest] = useState<"research" | "service" | null>(null);
  const list = v.content.filter((c) => c.kind === kind).sort((a, b) => a.order - b.order);
  const requests = v.approvals.filter((a) => a.kind === "research" || a.kind === "service" || a.kind === "content").sort((a, b) => Number(a.status !== "pending") - Number(b.status !== "pending") || b.at.localeCompare(a.at));
  const items = new Map(v.content.map((c) => [c.id, c]));
  return (
    <>
      <PageHead
        title="Website Content"
        lead="Ads, banners, images, cards, sections, videos, products, services, categories and email templates for the public site — plus orders and incoming requests."
        actions={
          <>
            <button type="button" onClick={() => setBulk(true)} className={hb.outline}>
              <Upload aria-hidden className="size-4" /> Bulk upload
            </button>
            <button type="button" onClick={() => setEditing("new")} className={hb.gold}>
              <Plus aria-hidden className="size-4" /> New item
            </button>
          </>
        }
      />
      <p className="mb-5 flex items-start gap-2 rounded-2xl bg-text-primary p-4 text-sm text-white/75 ring-1 ring-white/12">
        <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-signal-orange" />
        The public site still reads its own data files; publishing here marks an item live for the site to read once the backend connects them. Publishing by anyone but the prime admin goes through approval.
      </p>
      <Seg label="Kind" value={kind} onChange={setKind} className="mb-5" options={KINDS.map((k) => ({ value: k.kind, label: k.label, count: v.content.filter((c) => c.kind === k.kind).length }))} />
      {list.length === 0 ? <Empty icon={ImageIcon} title={`No ${KINDS.find((k) => k.kind === kind)?.label.toLowerCase()} yet`} action={<button type="button" onClick={() => setEditing("new")} className={hb.goldSm}>Add one</button>} /> : null}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {list.map((c, i) => (
          <article key={c.id} style={{ "--i": Math.min(i, 8) } as React.CSSProperties} className="hq-rise flex flex-col overflow-hidden rounded-2xl bg-bdnavy-900 ring-1 ring-white/12">
            <div className="relative grid aspect-[16/9] place-items-center bg-black/40">
              {c.fileId ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={fileUrl(c.fileId)} alt={c.title} className="absolute inset-0 size-full object-cover" />
              ) : c.kind === "video" ? (
                <PlayCircle aria-hidden className="size-12 text-signal-orange" />
              ) : (
                <span className="px-4 text-center font-grotesk text-lg font-bold text-white/80">{c.title}</span>
              )}
              <Pill tone={STATUS_TONE[c.status]} className="absolute top-3 left-3">
                {c.status}
              </Pill>
              {c.sample ? <Pill className="absolute top-3 right-3">Sample</Pill> : null}
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <h3 className="font-grotesk font-bold text-white">{c.title}</h3>
              {c.body ? <p className="line-clamp-2 text-sm text-white/70">{c.body}</p> : null}
              <p className="text-xs text-white/55">
                {c.slot ? `${c.slot} · ` : ""}
                {c.price !== undefined ? `${taka(c.price)} · ` : ""}
                {c.url ? "link set" : c.fileId ? "file attached" : "no media"}
              </p>
              <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
                <select aria-label={`Status of ${c.title}`} value={c.status} onChange={(e) => act("control", "item.status", { id: c.id, status: e.target.value }, { ok: e.target.value === "live" && v.me.isPrime ? "Live" : "Updated" })} className={cn(selectCls, "min-h-9 w-28 text-xs")}>
                  {["draft", "pending", "live", "archived"].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={() => act("control", "item.move", { id: c.id, dir: -1 }, { quiet: true })} aria-label="Move earlier" className={hb.iconSm}>
                  <ArrowUp aria-hidden className="size-3.5" />
                </button>
                <button type="button" onClick={() => act("control", "item.move", { id: c.id, dir: 1 }, { quiet: true })} aria-label="Move later" className={hb.iconSm}>
                  <ArrowDown aria-hidden className="size-3.5" />
                </button>
                <button type="button" onClick={() => setEditing(c)} aria-label={`Edit ${c.title}`} className={cn(hb.iconSm, "ml-auto")}>
                  <Pencil aria-hidden className="size-3.5" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Panel title="Orders" icon={ShoppingBag}>
          {v.orders.length === 0 ? <Empty title="No orders yet" /> : null}
          <ul className="flex flex-col gap-2">
            {[...v.orders]
              .sort((a, b) => b.at.localeCompare(a.at))
              .map((o) => (
                <li key={o.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-black/25 px-3 py-2.5 ring-1 ring-white/8">
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-white">
                      {o.customer} · {o.qty} × {items.get(o.itemId)?.title ?? "item"}
                    </span>
                    <span className="block text-xs text-white/55">
                      {o.phone} · {taka(o.amount)}
                    </span>
                  </span>
                  <Pill tone={ORDER_TONE[o.status]}>{o.status}</Pill>
                  {o.status === "new" ? (
                    <>
                      <button type="button" onClick={() => act("control", "order.status", { id: o.id, status: "accepted" }, { ok: "Order accepted" })} className={hb.goldSm}>
                        <Check aria-hidden className="size-3.5" /> Accept
                      </button>
                      <button type="button" onClick={() => act("control", "order.status", { id: o.id, status: "rejected" }, { ok: "Order rejected" })} aria-label="Reject order" className={hb.quietSm}>
                        <X aria-hidden className="size-3.5" />
                      </button>
                    </>
                  ) : o.status === "accepted" ? (
                    <button type="button" onClick={() => act("control", "order.status", { id: o.id, status: "delivered" }, { ok: "Marked delivered" })} className={hb.outlineSm}>
                      Delivered
                    </button>
                  ) : null}
                </li>
              ))}
          </ul>
        </Panel>
        <Panel
          title="Requests"
          icon={FlaskConical}
          field="ink"
          sub="Research proposals, service requests and publishing approvals"
          action={
            <span className="flex gap-1.5">
              <button type="button" onClick={() => setRequest("research")} className={hb.quietSm}>
                <FlaskConical aria-hidden className="size-3.5" /> Research
              </button>
              <button type="button" onClick={() => setRequest("service")} className={hb.quietSm}>
                <Wrench aria-hidden className="size-3.5" /> Service
              </button>
            </span>
          }
        >
          <RequestList list={requests} />
        </Panel>
      </div>

      <ItemDrawer key={editing === "new" ? `new-${kind}` : (editing?.id ?? "none")} item={editing} kind={kind} onClose={() => setEditing(null)} />
      <BulkDialog open={bulk} onOpenChange={setBulk} kind={kind} />
      <RequestDialog kind={request} onClose={() => setRequest(null)} />
    </>
  );
}

function RequestList({ list }: { list: Approval[] }) {
  const act = useAct();
  const people = usePeople();
  const now = useNow(60_000);
  if (list.length === 0) return <Empty title="No requests" />;
  return (
    <ul className="flex flex-col gap-2">
      {list.map((a) => (
        <li key={a.id} className="rounded-xl bg-black/25 p-3 ring-1 ring-white/8">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone={a.kind === "research" ? "cobalt" : a.kind === "service" ? "gold" : "navy"}>{a.kind}</Pill>
            <span className="min-w-0 flex-1 text-sm font-semibold text-white">{a.title}</span>
            <Pill tone={a.status === "accepted" ? "gold" : a.status === "rejected" ? "red" : "muted"}>{a.status}</Pill>
          </div>
          {a.detail ? <p className="mt-1.5 text-sm text-white/70">{a.detail}</p> : null}
          <p className="mt-1 text-xs text-white/50">
            {nameOf(people, a.by)} · {ago(a.at, now)}
          </p>
          {a.status === "pending" ? (
            <div className="mt-2 flex gap-2">
              <button type="button" onClick={() => act("approvals", "decide", { id: a.id, accepted: true }, { ok: "Accepted" })} className={hb.goldSm}>
                <Check aria-hidden className="size-3.5" /> Accept
              </button>
              <button type="button" onClick={() => act("approvals", "decide", { id: a.id, accepted: false }, { ok: "Declined" })} className={hb.quietSm}>
                Decline
              </button>
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function ItemDrawer({ item, kind, onClose }: { item: ContentItem | "new" | null; kind: ContentKind; onClose: () => void }) {
  const act = useAct();
  const existing = item && item !== "new" ? item : null;
  const content = useHq((v) => v.content);
  const categories = useMemo(() => content.filter((c) => c.kind === "category"), [content]);
  const [f, setF] = useState({ kind: existing?.kind ?? kind, title: existing?.title ?? "", body: existing?.body ?? "", url: existing?.url ?? "", slot: existing?.slot ?? "", categoryId: existing?.categoryId ?? "", price: existing?.price ?? 0, status: existing?.status ?? ("draft" as ContentItem["status"]), fileId: existing?.fileId ?? "" });
  const [busy, setBusy] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF((x) => ({ ...x, [k]: k === "price" ? Number(e.target.value) : e.target.value }));
  const priced = f.kind === "product" || f.kind === "service";
  const save = () =>
    act("control", "item.save", { id: existing?.id, ...f, price: priced ? f.price : undefined, fileId: f.fileId || undefined, categoryId: f.categoryId || undefined, slot: f.slot || undefined }, { ok: "Saved" }).then(onClose, () => {});
  return (
    <HqDialog
      open={item !== null}
      side
      size="md"
      onOpenChange={(o) => !o && onClose()}
      title={existing ? "Edit item" : "New item"}
      footer={
        <>
          {existing ? (
            <button type="button" onClick={() => act("control", "item.remove", { id: existing.id }, { ok: "Removed" }).then(onClose, () => {})} className={hb.quiet}>
              <Trash2 aria-hidden className="size-4" /> Delete
            </button>
          ) : null}
          <button type="button" disabled={f.title.trim().length < 2} onClick={save} className={hb.gold}>
            Save
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <FormField label="Kind">
          <select value={f.kind} onChange={set("kind")} className={selectCls}>
            {KINDS.map((k) => (
              <option key={k.kind} value={k.kind}>
                {k.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Title">
          <input value={f.title} onChange={set("title")} className={inputCls} />
        </FormField>
        <FormField label={f.kind === "email" ? "Email body" : "Text"}>
          <textarea value={f.body} onChange={set("body")} className={textareaCls} />
        </FormField>
        <FormField label="Where on the site" hint="e.g. home/hero, products/swasti">
          <input value={f.slot} onChange={set("slot")} className={inputCls} />
        </FormField>
        {priced ? (
          <FormField label="Price (৳)">
            <input type="number" min={0} value={f.price || ""} onChange={set("price")} className={inputCls} />
          </FormField>
        ) : null}
        {categories.length && f.kind !== "category" ? (
          <FormField label="Category">
            <select value={f.categoryId} onChange={set("categoryId")} className={selectCls}>
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </FormField>
        ) : null}
        <FormField label={f.kind === "video" ? "Video link" : "Link (optional)"}>
          <input value={f.url} onChange={set("url")} className={inputCls} placeholder="https://…" />
        </FormField>
        <div>
          <p className="mb-2 text-sm font-semibold text-white/85">Image or file</p>
          {f.fileId ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fileUrl(f.fileId)} alt="" className="mb-2 max-h-40 rounded-xl ring-1 ring-white/12" />
          ) : null}
          <button type="button" disabled={busy} onClick={() => file.current?.click()} className={hb.outlineSm}>
            <Upload aria-hidden className="size-3.5" /> {busy ? "Uploading…" : f.fileId ? "Replace file" : "Upload file"}
          </button>
          <input
            ref={file}
            type="file"
            hidden
            accept="image/*,video/mp4,video/webm,application/pdf"
            onChange={async (e) => {
              const picked = e.target.files?.[0];
              if (!picked) return;
              setBusy(true);
              const meta = await uploadFile(picked).catch(() => null);
              setBusy(false);
              if (meta) setF((x) => ({ ...x, fileId: meta.id }));
            }}
          />
        </div>
        <FormField label="Status">
          <select value={f.status} onChange={set("status")} className={selectCls}>
            <option value="draft">Draft</option>
            <option value="pending">Ready for review</option>
            <option value="live">Live</option>
            <option value="archived">Archived</option>
          </select>
        </FormField>
      </div>
    </HqDialog>
  );
}

function BulkDialog({ open, onOpenChange, kind }: { open: boolean; onOpenChange: (o: boolean) => void; kind: ContentKind }) {
  const act = useAct();
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [link, setLink] = useState("");
  const [error, setError] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const valid = rows
    .map((r) => ({ kind: (r.kind || kind) as ContentKind, title: r.title ?? "", body: r.body ?? "", price: r.price ? Number(r.price) : undefined, slot: r.slot || undefined, status: (["draft", "pending", "live", "archived"].includes(r.status) ? r.status : "draft") as ContentItem["status"] }))
    .filter((r) => r.title.trim().length >= 2 && KINDS.some((k) => k.kind === r.kind));
  const parse = (text: string) => {
    const lines = text.replace(/^﻿/, "").split(/\r?\n/).filter(Boolean);
    const head = (lines[0] ?? "").split(",").map((h) => h.trim().toLowerCase());
    setRows(lines.slice(1).map((l) => Object.fromEntries(l.split(",").map((c, i) => [head[i], c.replace(/^"|"$/g, "").trim()]))));
    setError(null);
  };
  const readLink = async () => {
    const res = await fetch(`/api/hq/sheet?url=${encodeURIComponent(link)}`).catch(() => null);
    if (!res) return setError("The sheet couldn't be reached.");
    const data = (await res.json().catch(() => ({}))) as { rows?: Record<string, string>[]; error?: string };
    if (!res.ok || !data.rows) return setError(data.error ?? "The sheet couldn't be read.");
    setRows(data.rows);
    setError(null);
  };
  return (
    <HqDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Bulk upload"
      description="Columns: kind, title, body, price, slot, status. Up to 500 rows."
      size="lg"
      footer={
        <button type="button" disabled={!valid.length} onClick={() => act<number>("control", "item.import", { rows: valid }, { ok: `Imported ${valid.length} items` }).then(() => { setRows([]); onOpenChange(false); }, () => {})} className={hb.gold}>
          Import {valid.length} items
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        <button type="button" onClick={() => file.current?.click()} className={cn(hb.outline, "self-start")}>
          <Upload aria-hidden className="size-4" /> Choose a CSV file
        </button>
        <input ref={file} type="file" accept=".csv,text/csv" hidden onChange={async (e) => e.target.files?.[0] && parse(await e.target.files[0].text())} />
        <div className="flex flex-col gap-2 sm:flex-row">
          <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Published Google Sheet link (…/pub?output=csv)" aria-label="Google Sheet link" className={inputCls} />
          <button type="button" disabled={!link} onClick={readLink} className={hb.quiet}>
            Read sheet
          </button>
        </div>
        {error ? <p role="alert" className="text-sm font-semibold text-crimson-bright">{error}</p> : null}
        {rows.length ? <p className="text-sm text-white/75">{valid.length} of {rows.length} rows are valid.</p> : null}
        {valid.length ? (
          <ul className="max-h-60 overflow-y-auto rounded-xl text-sm ring-1 ring-white/10">
            {valid.slice(0, 50).map((r, i) => (
              <li key={i} className="flex gap-3 border-b border-white/8 px-3 py-2 text-white/85">
                <Pill>{r.kind}</Pill> {r.title} {r.price ? <span className="ml-auto text-signal-orange">{taka(r.price)}</span> : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </HqDialog>
  );
}

function RequestDialog({ kind, onClose }: { kind: "research" | "service" | null; onClose: () => void }) {
  const act = useAct();
  const [f, setF] = useState({ title: "", detail: "" });
  return (
    <HqDialog
      open={kind !== null}
      onOpenChange={(o) => !o && onClose()}
      title={kind === "research" ? "Propose research" : "Log a service request"}
      size="sm"
      footer={
        <button type="button" disabled={f.title.trim().length < 3 || f.detail.trim().length < 10} onClick={() => kind && act("control", "request", { kind, ...f }, { ok: "Sent for a decision" }).then(() => { setF({ title: "", detail: "" }); onClose(); }, () => {})} className={hb.gold}>
          Send
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        <FormField label="Title">
          <input value={f.title} onChange={(e) => setF((x) => ({ ...x, title: e.target.value }))} className={inputCls} />
        </FormField>
        <FormField label="Details">
          <textarea value={f.detail} onChange={(e) => setF((x) => ({ ...x, detail: e.target.value }))} className={textareaCls} placeholder={kind === "research" ? "The problem, the idea, the budget and time it needs" : "Who asked, what they need, how to reach them"} />
        </FormField>
      </div>
    </HqDialog>
  );
}
