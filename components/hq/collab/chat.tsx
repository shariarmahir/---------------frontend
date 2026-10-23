"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, AtSign, Download, Hash, Lock, MessageSquareReply, MessagesSquare, Paperclip, Pencil, Pin, Plus, Search, SendHorizontal, Siren, SmilePlus, Trash2, Users, X } from "lucide-react";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { HqDialog } from "@/components/hq/dialog";
import { nameOf, useInOffice, usePeople } from "@/components/hq/hooks";
import { Avatar, Empty, FormField, hb, inputCls, Pill, selectCls, textareaCls } from "@/components/hq/kit";
import { fileUrl, uploadFile, useAct, useHq, useNow } from "@/components/hq/provider";
import { bytes, clockLabel, dateLabel } from "@/lib/hq/format";
import { dhakaDay } from "@/lib/hq/rules";
import type { Channel, ChannelKind, Message, Person } from "@/lib/hq/types";
import { channelVisible } from "@/lib/hq/view";
import { cn } from "@/lib/utils";

const QUICK = ["👍", "❤️", "😂", "🎉", "🙏", "🔥", "👀"];
const SECTIONS: { kind: ChannelKind[]; label: string }[] = [
  { kind: ["channel", "group"], label: "Channels" },
  { kind: ["team"], label: "Teams" },
  { kind: ["project"], label: "Projects" },
  { kind: ["issue"], label: "Issues" },
  { kind: ["dm"], label: "Direct messages" },
];

function channelName(c: Channel, me: string, people: Map<string, Person>): string {
  if (c.kind === "dm") return nameOf(people, c.memberIds.find((m) => m !== me));
  return c.name;
}

/** Highlights @mentions and links in a message. */
function Rich({ text, people }: { text: string; people: Person[] }) {
  const parts = text.split(/(@[a-z0-9@._-]+|https?:\/\/\S+)/gi);
  return (
    <>
      {parts.map((p, i) => {
        if (/^https?:\/\//.test(p))
          return (
            <a key={i} href={p} target="_blank" rel="noopener noreferrer" className="text-bdnavy-300 underline">
              {p}
            </a>
          );
        if (p.startsWith("@")) {
          const tag = p.slice(1).toLowerCase();
          const hit = tag === "urgent" || people.some((x) => x.handle === tag || x.handle.replace("kandari@", "") === tag || x.handle.replace("kandari@", "").split("-")[0] === tag);
          if (hit) return <span key={i} className={cn("rounded px-1 font-semibold", tag === "urgent" ? "bg-national-crimson/25 text-crimson-bright" : "bg-signal-orange/15 text-signal-orange")}>{p}</span>;
        }
        return <Fragment key={i}>{p}</Fragment>;
      })}
    </>
  );
}

export function Chat() {
  const v = useHq();
  const act = useAct();
  const people = usePeople();
  const params = useSearchParams();
  const router = useRouter();
  const me = v.me.person.id;
  const visible = useMemo(() => v.channels.filter((c) => channelVisible(c, me) && !c.archived), [v.channels, me]);
  const current = visible.find((c) => c.id === params.get("c")) ?? (params.get("c") ? undefined : visible.find((c) => c.id === "c-general"));
  const [thread, setThread] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState("");
  const open = (id: string) => {
    setThread(null);
    router.replace(`/hq/chat?c=${id}`, { scroll: false });
  };

  const unread = useMemo(() => {
    const m = new Map<string, { n: number; urgent: boolean; mention: boolean }>();
    for (const c of visible) {
      const read = v.reads[`${me}:${c.id}`] ?? "";
      let n = 0;
      let urgent = false;
      let mention = false;
      for (const x of v.messages) {
        if (x.channelId !== c.id || x.by === me || x.deleted || x.at <= read || x.threadOf) continue;
        n++;
        urgent ||= x.urgent;
        mention ||= x.mentions.includes(me);
      }
      m.set(c.id, { n, urgent, mention });
    }
    return m;
  }, [visible, v.messages, v.reads, me]);

  // Mark the open channel read whenever something new arrives in it.
  const lastIn = current ? v.messages.filter((x) => x.channelId === current.id).at(-1)?.at ?? "" : "";
  const readAt = current ? (v.reads[`${me}:${current.id}`] ?? "") : "";
  useEffect(() => {
    if (current && lastIn > readAt) act("me", "channel.read", { channelId: current.id }, { quiet: true }).catch(() => {});
  }, [current, lastIn, readAt, act]);

  return (
    <div className="-mx-3 -my-6 flex h-[calc(100dvh-4rem)] overflow-hidden border-white/10 sm:-mx-5 lg:-mx-8 lg:-my-8">
      {/* Channel list */}
      <aside className={cn("w-full shrink-0 flex-col border-r border-white/10 bg-black md:flex md:w-72", current ? "hidden" : "flex")}>
        <div className="flex items-center gap-2 border-b border-white/10 p-3">
          <h1 className="flex-1 font-grotesk text-xl font-bold text-signal-orange">Chat</h1>
          <button type="button" onClick={() => setCreating(true)} aria-label="New channel, group or message" className={hb.iconSm}>
            <Plus aria-hidden className="size-4" />
          </button>
        </div>
        <label className="relative m-3">
          <span className="sr-only">Find a channel</span>
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/45" />
          <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Find a channel or person" className={cn(inputCls, "min-h-10 pl-9")} />
        </label>
        <nav aria-label="Channels" className="flex-1 overflow-y-auto px-2 pb-4">
          {SECTIONS.map((s) => {
            const list = visible.filter((c) => s.kind.includes(c.kind) && channelName(c, me, people).toLowerCase().includes(filter.toLowerCase()));
            if (!list.length) return null;
            return (
              <div key={s.label} className="mb-4">
                <p className="mb-1 px-2 text-xs font-semibold text-white/45">{s.label}</p>
                <ul>
                  {list.map((c) => {
                    const u = unread.get(c.id)!;
                    const on = current?.id === c.id;
                    const other = c.kind === "dm" ? people.get(c.memberIds.find((m) => m !== me) ?? "") : undefined;
                    return (
                      <li key={c.id}>
                        <button type="button" onClick={() => open(c.id)} aria-current={on ? "page" : undefined} className={cn("flex min-h-10 w-full items-center gap-2 rounded-lg px-2 text-left text-sm transition-colors", on ? "bg-bdnavy-900 text-signal-orange ring-1 ring-white/12" : u.n ? "font-bold text-white hover:bg-white/6" : "text-white/70 hover:bg-white/6")}>
                          {other ? <Avatar person={other} size="xs" /> : c.private ? <Lock aria-hidden className="size-3.5 shrink-0 opacity-70" /> : <Hash aria-hidden className="size-3.5 shrink-0 opacity-70" />}
                          <span className="min-w-0 flex-1 truncate">{channelName(c, me, people)}</span>
                          {u.urgent ? <span className="size-2 rounded-full bg-national-crimson" aria-label="Urgent" /> : null}
                          {u.n ? <span className={cn("rounded-full px-1.5 text-xs font-bold", u.mention || u.urgent ? "bg-national-crimson text-white" : "bg-signal-orange text-text-primary")}>{u.n}</span> : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>
      </aside>

      {current ? (
        <Conversation key={current.id} c={current} onBack={() => router.replace("/hq/chat?c=", { scroll: false })} thread={thread} setThread={setThread} />
      ) : (
        <div className="hidden flex-1 place-items-center md:grid">
          <Empty icon={MessagesSquare} title="Pick a conversation" />
        </div>
      )}

      {current && thread ? <Thread key={thread} c={current} rootId={thread} onClose={() => setThread(null)} /> : null}
      <NewChannel open={creating} onOpenChange={setCreating} onCreated={open} />
    </div>
  );
}

function Conversation({ c, onBack, thread, setThread }: { c: Channel; onBack: () => void; thread: string | null; setThread: (id: string | null) => void }) {
  const v = useHq();
  const people = usePeople();
  const inOffice = useInOffice();
  const me = v.me.person.id;
  const [showPins, setShowPins] = useState(false);
  const [q, setQ] = useState("");
  const [searching, setSearching] = useState(false);
  const all = useMemo(() => v.messages.filter((m) => m.channelId === c.id), [v.messages, c.id]);
  const roots = useMemo(() => all.filter((m) => !m.threadOf && (!q || m.text.toLowerCase().includes(q.toLowerCase()))), [all, q]);
  const replies = useMemo(() => {
    const r = new Map<string, Message[]>();
    for (const m of all) if (m.threadOf) r.set(m.threadOf, [...(r.get(m.threadOf) ?? []), m]);
    return r;
  }, [all]);
  const members = c.memberIds.length ? c.memberIds : v.people.filter((p) => p.status === "active").map((p) => p.id);
  const pinned = all.filter((m) => m.pinned && !m.deleted);
  const scroller = useRef<HTMLDivElement>(null);
  const count = roots.length;
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [count]);

  return (
    <section aria-label={channelName(c, me, people)} className={cn("min-w-0 flex-1 flex-col bg-black", thread ? "hidden xl:flex" : "flex")}>
      <header className="flex min-h-16 items-center gap-3 border-b border-white/10 px-3 sm:px-5">
        <button type="button" onClick={onBack} aria-label="Back to channels" className={cn(hb.iconSm, "md:hidden")}>
          <ArrowLeft aria-hidden className="size-4" />
        </button>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5 font-grotesk text-lg font-bold text-white">
            {c.kind === "dm" ? null : c.private ? <Lock aria-hidden className="size-4 text-white/60" /> : <Hash aria-hidden className="size-4 text-white/60" />}
            <span className="truncate">{channelName(c, me, people)}</span>
          </span>
          {c.topic ? <span className="block truncate text-xs text-white/55">{c.topic}</span> : null}
        </span>
        <span className="hidden items-center gap-1 text-xs text-white/60 sm:flex">
          <Users aria-hidden className="size-3.5" /> {members.length} · {members.filter((m) => inOffice.has(m)).length} in office
        </span>
        <button type="button" onClick={() => setSearching((x) => !x)} aria-pressed={searching} aria-label="Search this conversation" className={hb.iconSm}>
          <Search aria-hidden className="size-4" />
        </button>
        <button type="button" onClick={() => setShowPins((x) => !x)} aria-pressed={showPins} aria-label={`Pinned messages (${pinned.length})`} className={cn(hb.iconSm, "relative")}>
          <Pin aria-hidden className="size-4" />
          {pinned.length ? <span className="absolute -top-1 -right-1 grid min-w-4 place-items-center rounded-full bg-signal-orange px-1 text-xs font-bold text-text-primary">{pinned.length}</span> : null}
        </button>
      </header>
      {searching ? (
        <div className="border-b border-white/10 p-3">
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search messages…" aria-label="Search messages" className={cn(inputCls, "min-h-10")} />
        </div>
      ) : null}
      {showPins ? (
        <div className="max-h-48 overflow-y-auto border-b border-white/10 bg-bdnavy-900 p-3">
          {pinned.length === 0 ? <p className="text-sm text-white/60">Nothing pinned yet.</p> : null}
          {pinned.map((m) => (
            <p key={m.id} className="mb-2 text-sm text-white/85">
              <strong className="text-signal-orange">{nameOf(people, m.by)}:</strong> {m.text}
            </p>
          ))}
        </div>
      ) : null}
      <div ref={scroller} className="flex-1 overflow-y-auto px-2 py-4 sm:px-4">
        {roots.length === 0 ? <Empty icon={MessagesSquare} title={q ? "No messages match" : "No messages yet"} className="m-4">{q ? null : "Say hello 👋"}</Empty> : null}
        {roots.map((m, i) => {
          const prev = roots[i - 1];
          const newDay = !prev || dhakaDay(prev.at) !== dhakaDay(m.at);
          const compact = !newDay && prev && prev.by === m.by && Date.parse(m.at) - Date.parse(prev.at) < 5 * 60_000 && !m.urgent;
          return (
            <Fragment key={m.id}>
              {newDay ? <DayDivider at={m.at} /> : null}
              <MessageRow m={m} compact={Boolean(compact)} replies={replies.get(m.id) ?? []} onThread={() => setThread(m.id)} />
            </Fragment>
          );
        })}
      </div>
      <Composer c={c} members={members} />
    </section>
  );
}

function DayDivider({ at }: { at: string }) {
  const now = useNow(60_000);
  const d = dhakaDay(at);
  const label = d === dhakaDay(now) ? "Today" : d === dhakaDay(now - 86400_000) ? "Yesterday" : dateLabel(at, { weekday: true });
  return (
    <div className="my-4 flex items-center gap-3" role="separator">
      <span className="h-px flex-1 bg-white/10" />
      <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold text-white/70">{label}</span>
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}

function MessageRow({ m, compact, replies, onThread, inThread }: { m: Message; compact: boolean; replies: Message[]; onThread?: () => void; inThread?: boolean }) {
  const act = useAct();
  const people = usePeople();
  const all = useHq((v) => v.people);
  const files = useHq((v) => v.files);
  const me = useHq((v) => v.me.person);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(m.text);
  const [picking, setPicking] = useState(false);
  const author = people.get(m.by);
  const mentioned = m.mentions.includes(me.id);
  if (m.deleted) {
    return <p className={cn("py-1 text-sm text-white/35 italic", compact ? "pl-14" : "pl-14")}>This message was deleted.</p>;
  }
  return (
    <article className={cn("group relative flex gap-3 rounded-xl px-2 transition-colors hover:bg-white/[0.04]", compact ? "py-0.5" : "mt-2 py-1.5", m.urgent && "border-l-4 border-national-crimson bg-national-crimson/10", mentioned && !m.urgent && "border-l-4 border-signal-orange bg-signal-orange/5")}>
      <span className="w-10 shrink-0">{compact ? <span className="hidden pt-1 font-mono text-[0.75rem] text-white/35 group-hover:block">{clockLabel(m.at).replace(/ [AP]M/, "")}</span> : <Avatar person={author} size="md" />}</span>
      <div className="min-w-0 flex-1">
        {compact ? null : (
          <p className="flex flex-wrap items-baseline gap-2">
            <span className="text-sm font-bold text-white">{author?.name ?? "Former member"}</span>
            <span className="text-xs text-white/45">{clockLabel(m.at)}</span>
            {m.urgent ? (
              <Pill tone="red" icon={Siren}>
                Urgent
              </Pill>
            ) : null}
            {m.pinned ? <Pin aria-label="Pinned" className="size-3.5 text-signal-orange" /> : null}
          </p>
        )}
        {editing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              act("chat", "message.edit", { id: m.id, text }, { quiet: true }).then(() => setEditing(false), () => {});
            }}
            className="mt-1 flex gap-2"
          >
            <input autoFocus value={text} onChange={(e) => setText(e.target.value)} aria-label="Edit message" className={cn(inputCls, "min-h-9")} />
            <button type="submit" className={hb.goldSm}>
              Save
            </button>
            <button type="button" onClick={() => setEditing(false)} className={hb.quietSm}>
              Cancel
            </button>
          </form>
        ) : m.text ? (
          <p className="text-sm leading-relaxed break-words whitespace-pre-wrap text-white/90">
            <Rich text={m.text} people={all} />
            {m.editedAt ? <span className="ml-1 text-xs text-white/40">(edited)</span> : null}
          </p>
        ) : null}
        {m.fileIds.length ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {m.fileIds.map((id) => {
              const f = files.find((x) => x.id === id);
              if (!f) return null;
              return f.type.startsWith("image/") ? (
                <a key={id} href={fileUrl(id)} target="_blank" rel="noopener noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={fileUrl(id)} alt={f.name} className="max-h-60 max-w-xs rounded-xl ring-1 ring-white/12" />
                </a>
              ) : (
                <a key={id} href={fileUrl(id, true)} className="flex items-center gap-2 rounded-xl bg-white/6 px-3 py-2 text-sm text-white ring-1 ring-white/12 hover:bg-white/10">
                  <Download aria-hidden className="size-4 text-signal-orange" /> {f.name} <span className="text-xs text-white/50">{bytes(f.size)}</span>
                </a>
              );
            })}
          </div>
        ) : null}
        {Object.keys(m.reactions).length ? (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {Object.entries(m.reactions).map(([e, who]) => (
              <button key={e} type="button" onClick={() => act("chat", "react", { id: m.id, emoji: e }, { quiet: true })} title={who.map((w) => nameOf(people, w)).join(", ")} aria-pressed={who.includes(me.id)} className={cn("inline-flex min-h-7 items-center gap-1 rounded-full px-2 text-xs ring-1", who.includes(me.id) ? "bg-signal-orange/20 text-signal-orange ring-signal-orange/60" : "bg-white/6 text-white/80 ring-white/12")}>
                <span>{e}</span> {who.length}
              </button>
            ))}
          </div>
        ) : null}
        {!inThread && replies.length ? (
          <button type="button" onClick={onThread} className="mt-1.5 flex items-center gap-2 text-xs font-semibold text-bdnavy-300 hover:underline">
            <MessageSquareReply aria-hidden className="size-3.5" /> {replies.length} {replies.length === 1 ? "reply" : "replies"}
          </button>
        ) : null}
      </div>
      <div className="absolute -top-3 right-2 hidden items-center gap-0.5 rounded-xl bg-bdnavy-900 p-0.5 shadow-lg ring-1 ring-white/15 group-focus-within:flex group-hover:flex">
        <button type="button" onClick={() => setPicking((x) => !x)} aria-label="React" className="grid size-8 place-items-center rounded-lg text-white/75 hover:bg-white/10">
          <SmilePlus aria-hidden className="size-4" />
        </button>
        {!inThread ? (
          <button type="button" onClick={onThread} aria-label="Reply in thread" className="grid size-8 place-items-center rounded-lg text-white/75 hover:bg-white/10">
            <MessageSquareReply aria-hidden className="size-4" />
          </button>
        ) : null}
        <button type="button" onClick={() => act("chat", "pin", { id: m.id }, { quiet: true })} aria-label={m.pinned ? "Unpin" : "Pin"} className="grid size-8 place-items-center rounded-lg text-white/75 hover:bg-white/10">
          <Pin aria-hidden className="size-4" />
        </button>
        {m.by === me.id ? (
          <button type="button" onClick={() => setEditing(true)} aria-label="Edit" className="grid size-8 place-items-center rounded-lg text-white/75 hover:bg-white/10">
            <Pencil aria-hidden className="size-4" />
          </button>
        ) : null}
        {m.by === me.id || me.level === "prime" ? (
          <button type="button" onClick={() => act("chat", "message.delete", { id: m.id }, { quiet: true })} aria-label="Delete" className="grid size-8 place-items-center rounded-lg text-white/75 hover:bg-white/10 hover:text-crimson-bright">
            <Trash2 aria-hidden className="size-4" />
          </button>
        ) : null}
      </div>
      {picking ? (
        <div className="absolute top-6 right-2 z-10 flex gap-1 rounded-xl bg-bdnavy-900 p-1.5 shadow-xl ring-1 ring-white/15">
          {QUICK.map((e) => (
            <button key={e} type="button" onClick={() => act("chat", "react", { id: m.id, emoji: e }, { quiet: true }).then(() => setPicking(false), () => {})} className="grid size-9 place-items-center rounded-lg text-lg hover:bg-white/10" aria-label={`React ${e}`}>
              {e}
            </button>
          ))}
        </div>
      ) : null}
    </article>
  );
}

function Composer({ c, members, threadOf }: { c: Channel; members: string[]; threadOf?: string }) {
  const act = useAct();
  const people = usePeople();
  const me = useHq((v) => v.me.person);
  const [text, setText] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [files, setFiles] = useState<{ id: string; name: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const announce = c.id === "c-announce" && !["prime", "chief", "hr"].includes(me.level);
  const tag = /@([a-z0-9._-]*)$/i.exec(text)?.[1];
  const suggestions = tag !== undefined ? members.map((id) => people.get(id)).filter((p): p is Person => Boolean(p) && p!.id !== me.id && `${p!.name} ${p!.handle}`.toLowerCase().includes(tag.toLowerCase())).slice(0, 6) : [];

  const send = async () => {
    const body = `${text.trim()}${urgent && !/@urgent/i.test(text) ? " @urgent" : ""}`.trim();
    if (!body && !files.length) return;
    setBusy(true);
    const ok = await act("chat", "send", { channelId: c.id, text: body, threadOf, fileIds: files.map((f) => f.id) }, { quiet: false }).then(() => true, () => false);
    setBusy(false);
    if (ok) {
      setText("");
      setFiles([]);
      setUrgent(false);
    }
  };
  const pick = (p: Person) => {
    const short = p.handle.replace("kandari@", "").split("-")[0];
    setText((x) => x.replace(/@([a-z0-9._-]*)$/i, `@${short} `));
    input.current?.focus();
  };

  if (announce) return <p className="border-t border-white/10 p-4 text-center text-sm text-white/55">Only leadership posts in #announcements.</p>;
  return (
    <div className="relative border-t border-white/10 p-3">
      {suggestions.length ? (
        <ul className="absolute right-3 bottom-full left-3 mb-1 rounded-xl bg-bdnavy-900 p-1 shadow-xl ring-1 ring-white/15">
          {suggestions.map((p) => (
            <li key={p.id}>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => pick(p)} className="flex min-h-10 w-full items-center gap-2 rounded-lg px-2 text-left text-sm text-white hover:bg-white/10">
                <Avatar person={p} size="xs" /> {p.name} <span className="text-xs text-white/50">{p.handle}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {files.length ? (
        <div className="mb-2 flex flex-wrap gap-2">
          {files.map((f) => (
            <span key={f.id} className="flex items-center gap-1 rounded-lg bg-white/8 px-2 py-1 text-xs text-white">
              {f.name}
              <button type="button" onClick={() => setFiles((x) => x.filter((y) => y.id !== f.id))} aria-label={`Remove ${f.name}`}>
                <X aria-hidden className="size-3" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
      <div className={cn("flex items-end gap-2 rounded-2xl bg-white/5 p-2 ring-1", urgent ? "ring-national-crimson" : "ring-white/12 focus-within:ring-signal-orange")}>
        <button type="button" onClick={() => fileRef.current?.click()} aria-label="Attach a file" className={hb.iconSm}>
          <Paperclip aria-hidden className="size-4" />
        </button>
        <input
          ref={fileRef}
          type="file"
          hidden
          multiple
          onChange={async (e) => {
            for (const file of Array.from(e.target.files ?? [])) {
              const meta = await uploadFile(file, c.private ? c.memberIds : undefined).catch(() => null);
              if (meta) setFiles((x) => [...x, { id: meta.id, name: meta.name }]);
            }
            e.target.value = "";
          }}
        />
        <textarea
          ref={input}
          value={text}
          rows={1}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !suggestions.length) {
              e.preventDefault();
              send();
            }
          }}
          placeholder={threadOf ? "Reply…" : `Message ${c.kind === "dm" ? nameOf(people, c.memberIds.find((m) => m !== me.id)) : `#${c.name}`}`}
          aria-label="Message"
          className="max-h-40 min-h-9 flex-1 resize-none bg-transparent px-1 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none"
          style={{ height: `${Math.min(10, text.split("\n").length) * 1.4 + 1}rem` }}
        />
        <button type="button" aria-pressed={urgent} onClick={() => setUrgent((x) => !x)} aria-label="Mark urgent" title="Urgent: alerts everyone here" className={cn(hb.iconSm, urgent && "bg-national-crimson text-white ring-national-crimson hover:bg-national-crimson hover:text-white")}>
          <Siren aria-hidden className="size-4" />
        </button>
        <button type="button" onClick={() => setText((x) => `${x}@`)} aria-label="Mention someone" className={cn(hb.iconSm, "hidden sm:grid")}>
          <AtSign aria-hidden className="size-4" />
        </button>
        <button type="button" onClick={send} disabled={busy || (!text.trim() && !files.length)} aria-label="Send" className={cn(hb.goldSm, "size-9 px-0")}>
          <SendHorizontal aria-hidden className="size-4" />
        </button>
      </div>
      <p className="mt-1 hidden px-2 text-xs text-white/40 sm:block">Enter to send · Shift+Enter for a new line · the siren marks it urgent and alerts everyone here</p>
    </div>
  );
}

function Thread({ c, rootId, onClose }: { c: Channel; rootId: string; onClose: () => void }) {
  const messages = useHq((v) => v.messages);
  const people = useHq((v) => v.people);
  const root = messages.find((m) => m.id === rootId);
  const replies = messages.filter((m) => m.threadOf === rootId);
  const members = c.memberIds.length ? c.memberIds : people.filter((p) => p.status === "active").map((p) => p.id);
  if (!root) return null;
  return (
    <aside aria-label="Thread" className="flex w-full flex-col border-l border-white/10 bg-black xl:w-96">
      <header className="flex min-h-16 items-center gap-2 border-b border-white/10 px-4">
        <h2 className="flex-1 font-grotesk text-lg font-bold text-signal-orange">Thread</h2>
        <button type="button" onClick={onClose} aria-label="Close thread" className={hb.iconSm}>
          <X aria-hidden className="size-4" />
        </button>
      </header>
      <div className="flex-1 overflow-y-auto p-3">
        <MessageRow m={root} compact={false} replies={[]} inThread />
        <p className="my-3 border-b border-white/10 pb-2 text-xs font-semibold text-white/55">
          {replies.length} {replies.length === 1 ? "reply" : "replies"}
        </p>
        {replies.map((m) => (
          <MessageRow key={m.id} m={m} compact={false} replies={[]} inThread />
        ))}
      </div>
      <Composer c={c} members={members} threadOf={rootId} />
    </aside>
  );
}

function NewChannel({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (o: boolean) => void; onCreated: (id: string) => void }) {
  const act = useAct();
  const all = useHq((v) => v.people);
  const me = useHq((v) => v.me.person.id);
  const [kind, setKind] = useState<"channel" | "group" | "dm">("channel");
  const [f, setF] = useState({ name: "", topic: "" });
  const [pick, setPick] = useState<string[]>([]);
  const others = all.filter((p) => p.status === "active" && p.id !== me);
  return (
    <HqDialog
      open={open}
      onOpenChange={onOpenChange}
      title="New conversation"
      footer={
        <button
          type="button"
          disabled={kind === "dm" ? pick.length !== 1 : f.name.trim().length < 2 || (kind === "group" && pick.length === 0)}
          onClick={async () => {
            const id = await act<string>("chat", "create", { kind, ...f, memberIds: pick }).catch(() => null);
            if (!id) return;
            onOpenChange(false);
            setF({ name: "", topic: "" });
            setPick([]);
            onCreated(id);
          }}
          className={hb.gold}
        >
          Create
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        <FormField label="Kind">
          <select value={kind} onChange={(e) => { setKind(e.target.value as typeof kind); setPick([]); }} className={selectCls}>
            <option value="channel">Public channel — everyone can read</option>
            <option value="group">Private group — only the people you add</option>
            <option value="dm">Direct message</option>
          </select>
        </FormField>
        {kind !== "dm" ? (
          <>
            <FormField label="Name">
              <input value={f.name} onChange={(e) => setF((x) => ({ ...x, name: e.target.value }))} className={inputCls} placeholder="e.g. hardware-lab" />
            </FormField>
            <FormField label="Topic">
              <textarea value={f.topic} onChange={(e) => setF((x) => ({ ...x, topic: e.target.value }))} className={cn(textareaCls, "min-h-16")} />
            </FormField>
          </>
        ) : null}
        {kind !== "channel" ? (
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-white/85">{kind === "dm" ? "With" : "Members"}</legend>
            <ul className="grid gap-1 sm:grid-cols-2">
              {others.map((p) => {
                const on = pick.includes(p.id);
                return (
                  <li key={p.id}>
                    <button type="button" aria-pressed={on} onClick={() => setPick((x) => (kind === "dm" ? [p.id] : on ? x.filter((y) => y !== p.id) : [...x, p.id]))} className={cn("flex min-h-11 w-full items-center gap-2 rounded-xl px-2 text-left text-sm ring-1", on ? "bg-white/10 text-white ring-signal-orange" : "text-white/80 ring-transparent hover:bg-white/5")}>
                      <Avatar person={p} size="xs" /> {p.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        ) : null}
      </div>
    </HqDialog>
  );
}
