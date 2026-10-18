"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/lib/auth/client";
import { POINTS, thread, type Article, type TalkNote } from "@/lib/research/core";
import { toggleIn, updateResearch, useResearch } from "@/lib/research/store";
import { cn } from "@/lib/utils";
import { Avatar, BTN, BTN_SOLID, FIELD, fmtDate, fmtNum, H2 } from "./kit";

const NONE: TalkNote[] = [];
const LIMIT = 1500;

/** A small text action under a comment. */
const NOTE_ACTION = "inline-flex h-9 items-center gap-1.5 rounded-lg px-2 transition-colors hover:text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none";

function Composer({ a, parent, onDone, autoFocus }: { a: Article; parent?: string; onDone?: () => void; autoFocus?: boolean }) {
  const { account } = useAuth();
  const [text, setText] = useState("");
  const id = parent ? `reply-${parent}` : "comment-text";

  function send(e: React.FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (t.length < 4) return toast.error("Write a little more");
    if (t.length > LIMIT) return toast.error("Keep comments within 1,500 characters");
    const by = account?.name ?? "Reader";
    const role = a.authors.some((x) => (x.nameEn ?? x.name) === by || x.name === by) ? "Author" : undefined;
    const note: TalkNote = { id: `n-${Date.now().toString(36)}`, by, at: new Date().toISOString(), text: t, ...(role ? { role } : {}), ...(parent ? { parent } : {}) };
    if (!updateResearch((s) => ({ ...s, talk: { ...s.talk, [a.slug]: [...(s.talk[a.slug] ?? []), note] } }))) return toast.error("Could not post", { description: "Check that you are logged in." });
    setText("");
    onDone?.();
    toast.success(parent ? "Reply posted" : "Comment posted", { description: `+${POINTS.comment} points for the researcher` });
  }

  return (
    <form onSubmit={send} className="flex gap-3">
      <Avatar name={account?.name ?? "Reader"} className={parent ? "size-8 text-xs" : undefined} />
      <div className="min-w-0 flex-1">
        <label htmlFor={id} className="sr-only">{parent ? "Write a reply" : "Write a comment"}</label>
        <textarea
          id={id}
          rows={parent ? 2 : 3}
          value={text}
          autoFocus={autoFocus}
          onChange={(e) => setText(e.target.value)}
          maxLength={LIMIT}
          placeholder={parent ? "Write a reply…" : "A question about the method, a source, a suggestion…"}
          className={cn(FIELD, "resize-y py-3 leading-relaxed")}
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-xs text-white/65 tabular-nums">{fmtNum(text.length)}/{fmtNum(LIMIT)}</span>
          <span className="flex gap-2">
            {onDone && <button type="button" onClick={onDone} className={BTN}>Cancel</button>}
            <button type="submit" className={BTN_SOLID}>{parent ? "Reply" : "Post comment"}</button>
          </span>
        </div>
      </div>
    </form>
  );
}

function Comment({ a, n, reply, onReply, replying, children }: { a: Article; n: TalkNote; reply?: boolean; onReply?: () => void; replying?: boolean; children?: React.ReactNode }) {
  const key = `${a.slug}:${n.id}`;
  const liked = useResearch((s) => Boolean(s.noteLikes[key]));
  const { account } = useAuth();
  const likes = (n.likes ?? 0) + (liked ? 1 : 0);
  const like = () => {
    if (!toggleIn("noteLikes", key)) toast.error("Log in to like comments");
  };
  return (
    <li className={cn("flex gap-3", reply && "mt-4")}>
      <Avatar name={n.by} className={reply ? "size-8 text-xs" : undefined} />
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <span className="font-semibold text-white">{n.by}</span>
          {n.role && <span className={cn("rounded-md px-2 text-xs leading-5 font-semibold", n.role === "Author" ? "bg-signal-orange text-text-primary" : "text-bdnavy-300 ring-1 ring-bdnavy-300/60 ring-inset")}>{n.role}</span>}
          <span className="text-white/65">{fmtDate(n.at)}</span>
        </p>
        <p className="mt-1 text-sm leading-relaxed whitespace-pre-line text-white/80">{n.text}</p>
        <div className="mt-1 flex items-center gap-1 text-sm font-semibold text-white/65">
          <button type="button" onClick={like} aria-pressed={liked} className={cn(NOTE_ACTION, liked && "text-signal-orange")}>
            <Icon name="thumb_up" className="text-lg" filled={liked} /> {likes > 0 ? fmtNum(likes) : "Like"}
          </button>
          {onReply && account && (
            <button type="button" onClick={onReply} aria-expanded={replying} className={NOTE_ACTION}>
              <Icon name="reply" className="text-lg" /> Reply
            </button>
          )}
        </div>
        {children}
      </div>
    </li>
  );
}

/** Comments: questions and suggestions under the work, newest or most liked first, one level of replies. */
export function Discussion({ a }: { a: Article }) {
  const { account, ready } = useAuth();
  const mine = useResearch((s) => s.talk[a.slug] ?? NONE);
  const likedMap = useResearch((s) => s.noteLikes);
  const [order, setOrder] = useState<"new" | "top">("new");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const notes = [...(a.talk ?? []), ...mine];
  const tree = thread(notes, (n) => (n.likes ?? 0) + (likedMap[`${a.slug}:${n.id}`] ? 1 : 0), order);

  return (
    <section id="discussion" aria-labelledby="discussion-title">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/12 pb-4">
        <h2 id="discussion-title" className={H2}>Comments <span className="text-white/65 tabular-nums">({fmtNum(notes.length)})</span></h2>
        {notes.length > 1 && (
          <label className="flex items-center gap-2 text-sm font-semibold text-white/80">
            Sort by
            <select value={order} onChange={(e) => setOrder(e.target.value as "new" | "top")} className={cn(FIELD, "h-10 w-auto px-3 text-sm")}>
              <option value="new">Newest</option>
              <option value="top">Most liked</option>
            </select>
          </label>
        )}
      </div>
      <p className="mt-4 max-w-[70ch] text-sm leading-relaxed text-white/65">Comments are for improving the research: questions on method, sources and suggestions. No personal attacks, and never post a participant&apos;s name or phone number.</p>

      <div className="mt-6">
        {account ? (
          <Composer a={a} />
        ) : ready ? (
          <p className="flex flex-wrap items-center gap-3 rounded-2xl bg-black/30 p-4 text-sm text-white/80 ring-1 ring-white/12 ring-inset">
            <Icon name="lock" className="text-xl text-signal-orange" /> Log in with your Kandari Profile to comment, reply and like.
            <Link href={`/login?next=${encodeURIComponent(`/research/${a.slug}#discussion`)}`} className={cn(BTN_SOLID, "ml-auto")}>Log in</Link>
          </p>
        ) : null}
      </div>

      {tree.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-white/20 p-6 text-center text-sm text-white/65">No comments yet. Ask the first question.</p>
      ) : (
        <ol className="mt-7 space-y-7">
          {tree.map(({ note, replies }) => (
            <Comment key={note.id} a={a} n={note} onReply={() => setReplyTo(replyTo === note.id ? null : note.id)} replying={replyTo === note.id}>
              {(replies.length > 0 || replyTo === note.id) && (
                <div className="mt-3 border-l border-white/15 pl-4">
                  {replies.length > 0 && <ol>{replies.map((r) => <Comment key={r.id} a={a} n={r} reply />)}</ol>}
                  {replyTo === note.id && <div className="mt-4"><Composer a={a} parent={note.id} onDone={() => setReplyTo(null)} autoFocus /></div>}
                </div>
              )}
            </Comment>
          ))}
        </ol>
      )}
    </section>
  );
}
