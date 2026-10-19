"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/lib/auth/client";
import { NOTE_REACTION_KINDS, NOTE_REACTIONS, POINTS, thread, timeAgo, type Article, type NoteReaction, type TalkNote } from "@/lib/research/core";
import { deleteNote, editNote, reactToNote, updateResearch, useResearch } from "@/lib/research/store";
import { cn } from "@/lib/utils";
import { Avatar, BTN_SOLID, fmtDate, fmtNum, H2 } from "./kit";

const NONE: TalkNote[] = [];
const LIMIT = 1500;

/** Openers for an empty comment box: what comments here are for. */
const STARTERS = [
  { label: "Ask about the method", text: "On the method: " },
  { label: "Suggest a source", text: "A source that may help: " },
  { label: "Point out an error", text: "A possible error: " },
  { label: "Thank the authors", text: "Thank you for this work. " },
];

/** A new comment, stamped now, with an id no other comment shares. Called from event handlers only. */
function makeNote({ by, text, role, parent }: { by: string; text: string; role?: string; parent?: string }): TalkNote {
  const id = `n-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  return { id, by, at: new Date().toISOString(), text, ...(role ? { role } : {}), ...(parent ? { parent } : {}) };
}

/* The clock for "5 min ago": 0 on the server and while hydrating (dates are shown), then the time, refreshed each minute. */
let nowMs = 0;
function subscribeNow(cb: () => void) {
  nowMs = Date.now();
  queueMicrotask(cb);
  const t = window.setInterval(() => {
    nowMs = Date.now();
    cb();
  }, 60_000);
  return () => window.clearInterval(t);
}
const useNow = () => useSyncExternalStore(subscribeNow, () => nowMs, () => 0);

/** A small action under a comment: icon and word, gold when on. */
const ACTION = "inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-bdnavy-200 ring-1 ring-bdnavy-700 ring-inset transition-[color,box-shadow,background-color] hover:text-signal-orange hover:ring-signal-orange/60 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none";

/**
 * The comment box: a navy field that grows with the text, starter openers
 * while it is empty, the character count, and Send (or Ctrl/⌘ + Enter).
 * The same box answers a comment (with the name already in it) and edits
 * one of the reader's own.
 */
function ChatBox({ onSend, onCancel, initial = "", placeholder, submitLabel, starters, autoFocus, compact }: { onSend: (text: string) => boolean; onCancel?: () => void; initial?: string; placeholder: string; submitLabel: string; starters?: boolean; autoFocus?: boolean; compact?: boolean }) {
  const [text, setText] = useState(initial);
  const box = useRef<HTMLTextAreaElement>(null);
  const left = LIMIT - text.length;

  useEffect(() => {
    if (!autoFocus) return;
    const el = box.current;
    el?.focus();
    el?.setSelectionRange(el.value.length, el.value.length);
  }, [autoFocus]);

  function send() {
    const t = text.trim();
    const opener = STARTERS.find((s) => t.startsWith(s.text.trim()));
    const own = opener ? t.slice(opener.text.trim().length).trim() : t;
    if (own.length < 4) return toast.error("Write a little more", { description: opener ? "Add your own words after the opener." : "A comment needs at least a few words." });
    if (t.length > LIMIT) return toast.error("Keep comments within 1,500 characters");
    if (onSend(t)) setText("");
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
      className="rounded-2xl bg-bdnavy-900 ring-1 ring-bdnavy-700 transition-shadow focus-within:ring-2 focus-within:ring-signal-orange"
    >
      <textarea
          ref={box}
          aria-label={placeholder}
          value={text}
          maxLength={LIMIT}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              send();
            }
            if (e.key === "Escape" && onCancel) onCancel();
          }}
          placeholder={placeholder}
          className={cn("block field-sizing-content max-h-72 w-full resize-none bg-transparent px-4 pt-3.5 text-base leading-relaxed text-bdnavy-50 placeholder:text-bdnavy-300 focus:outline-none", compact ? "min-h-16" : "min-h-24")}
        />
      {starters && text.length === 0 && (
        <div className="flex flex-wrap gap-2 px-4 pt-1 pb-1">
          {STARTERS.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => {
                setText(s.text);
                requestAnimationFrame(() => {
                  const el = box.current;
                  el?.focus();
                  el?.setSelectionRange(s.text.length, s.text.length);
                });
              }}
              className="inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold text-bdnavy-200 ring-1 ring-bdnavy-700 ring-inset transition-colors hover:text-signal-orange hover:ring-signal-orange/60 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center gap-3 border-t border-bdnavy-700 px-3 py-2.5 sm:px-4">
        <span className={cn("text-xs tabular-nums", left < 100 ? "text-signal-orange" : "text-bdnavy-300")} aria-live="polite">
          {left < 100 ? `${fmtNum(left)} left` : `${fmtNum(text.length)}/${fmtNum(LIMIT)}`}
        </span>
        <span className="hidden text-xs text-bdnavy-300 sm:inline">Ctrl + Enter to send</span>
        <span className="ml-auto flex items-center gap-2">
          {onCancel && (
            <button type="button" onClick={onCancel} className="inline-flex h-10 items-center rounded-xl px-3 text-sm font-semibold text-bdnavy-200 transition-colors hover:text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none">
              Cancel
            </button>
          )}
          <button type="submit" disabled={text.trim().length === 0} className={cn(BTN_SOLID, "min-h-10 px-4 py-2 disabled:cursor-not-allowed disabled:bg-bdnavy-700 disabled:text-bdnavy-300 disabled:shadow-none disabled:hover:translate-y-0")}>
            <Icon name="send" className="text-lg" /> {submitLabel}
          </button>
        </span>
      </div>
    </form>
  );
}

interface NoteProps {
  a: Article;
  n: TalkNote;
  own: boolean;
  reply?: boolean;
  onReply?: () => void;
  replying?: boolean;
  children?: React.ReactNode;
}

/** One comment as a chat bubble (a lighter navy for the reader's own, deep navy for others), with reactions, reply, and edit or delete on their own. */
function Note({ a, n, own, reply, onReply, replying, children }: NoteProps) {
  const key = `${a.slug}:${n.id}`;
  const mineReact = useResearch((s) => s.noteReacts[key]);
  const { account } = useAuth();
  const now = useNow();
  const [mode, setMode] = useState<"view" | "edit" | "delete">("view");

  const count = (k: NoteReaction) => (k === "like" ? (n.likes ?? 0) : 0) + (mineReact === k ? 1 : 0);
  const react = (k: NoteReaction) => {
    if (!reactToNote(a.slug, n.id, k)) toast.error("Log in to react to comments");
  };

  return (
    <li className={cn("flex gap-3", reply && "mt-5")}>
      <Avatar name={n.by} className={reply ? "size-8 text-xs" : undefined} />
      <div className="min-w-0 flex-1">
        {mode === "edit" ? (
          <ChatBox
            initial={n.text}
            placeholder="Edit your comment"
            submitLabel="Save"
            compact
            autoFocus
            onCancel={() => setMode("view")}
            onSend={(t) => {
              if (!editNote(a.slug, n.id, t)) {
                toast.error("Could not save the change");
                return false;
              }
              setMode("view");
              toast.success("Comment updated");
              return true;
            }}
          />
        ) : (
          <div className={cn("rounded-2xl rounded-tl-md px-4 py-3 ring-1 ring-inset", own ? "bg-bdnavy-700 ring-bdnavy-400/40" : "bg-bdnavy-900 ring-bdnavy-700")}>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              <span className="font-semibold text-signal-orange">{n.by}</span>
              {n.role && <span className={cn("rounded-md px-2 text-xs leading-5 font-semibold", n.role === "Author" ? "bg-signal-orange text-text-primary" : "text-bdnavy-300 ring-1 ring-bdnavy-300/60 ring-inset")}>{n.role}</span>}
              {own && !n.role && <span className="rounded-md px-2 text-xs leading-5 font-semibold text-bdnavy-50 ring-1 ring-bdnavy-200/60 ring-inset">You</span>}
              <time dateTime={n.at} title={fmtDate(n.at)} className={cn("text-xs", own ? "text-bdnavy-100" : "text-bdnavy-300")}>{timeAgo(n.at, now, fmtDate)}</time>
              {n.edited && <span className={cn("text-xs", own ? "text-bdnavy-100" : "text-bdnavy-300")}>· edited</span>}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed wrap-break-word whitespace-pre-line text-bdnavy-50">{n.text}</p>
          </div>
        )}

        {mode !== "edit" && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {NOTE_REACTION_KINDS.map((k) => {
              const on = mineReact === k;
              const c = count(k);
              return (
                <button key={k} type="button" onClick={() => react(k)} aria-pressed={on} aria-label={`${NOTE_REACTIONS[k].label}${c ? ` (${c})` : ""}`} title={NOTE_REACTIONS[k].label} className={cn(ACTION, on && "bg-signal-orange text-text-primary ring-signal-orange hover:text-text-primary")}>
                  <Icon name={NOTE_REACTIONS[k].icon} filled={on} className="text-base" />
                  <span className={cn(c === 0 && "hidden sm:inline")}>{c > 0 ? fmtNum(c) : NOTE_REACTIONS[k].label}</span>
                </button>
              );
            })}
            {onReply && account && (
              <button type="button" onClick={onReply} aria-expanded={replying} className={cn(ACTION, replying && "text-signal-orange ring-signal-orange/60")}>
                <Icon name="reply" className="text-base" /> Reply
              </button>
            )}
            {own && mode === "view" && (
              <span className="ml-auto flex gap-1">
                <button type="button" onClick={() => setMode("edit")} aria-label="Edit your comment" title="Edit" className="grid size-9 place-items-center rounded-full text-bdnavy-300 transition-colors hover:text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none">
                  <Icon name="edit" className="text-lg" />
                </button>
                <button type="button" onClick={() => setMode("delete")} aria-label="Delete your comment" title="Delete" className="grid size-9 place-items-center rounded-full text-bdnavy-300 transition-colors hover:text-national-crimson focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none">
                  <Icon name="delete" className="text-lg" />
                </button>
              </span>
            )}
            {own && mode === "delete" && (
              <span role="group" aria-label="Confirm delete" className="ml-auto flex flex-wrap items-center gap-2 text-xs font-semibold text-bdnavy-100">
                Delete this{reply ? " reply" : " comment and its replies"}?
                <button
                  type="button"
                  autoFocus
                  onClick={() => {
                    if (deleteNote(a.slug, n.id)) toast.success(reply ? "Reply deleted" : "Comment deleted");
                    else toast.error("Could not delete it");
                  }}
                  className="inline-flex h-8 items-center rounded-full bg-national-crimson px-3 text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                >
                  Delete
                </button>
                <button type="button" onClick={() => setMode("view")} className="inline-flex h-8 items-center rounded-full px-3 text-bdnavy-200 ring-1 ring-bdnavy-700 ring-inset hover:text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none">
                  Keep
                </button>
              </span>
            )}
          </div>
        )}
        {children}
      </div>
    </li>
  );
}

/**
 * Comments under a work: a chat-style thread for questions and suggestions,
 * newest or most reacted first, one level of replies (a reply to a reply
 * joins the same thread, with the name it answers). Readers react with
 * Like, Insightful or Same question, and edit or delete their own.
 */
export function Discussion({ a }: { a: Article }) {
  const { account, ready } = useAuth();
  const mine = useResearch((s) => s.talk[a.slug] ?? NONE);
  const reacts = useResearch((s) => s.noteReacts);
  const [order, setOrder] = useState<"new" | "top">("new");
  const [replyTo, setReplyTo] = useState<{ thread: string; name: string } | null>(null);
  const ownIds = new Set(mine.map((n) => n.id));
  const notes = [...(a.talk ?? []), ...mine];
  const weight = (n: TalkNote) => (n.likes ?? 0) + (reacts[`${a.slug}:${n.id}`] ? 1 : 0);
  const tree = thread(notes, weight, order);

  function post(text: string, parent?: string): boolean {
    const by = account?.name ?? "Reader";
    const role = a.authors.some((x) => (x.nameEn ?? x.name) === by || x.name === by) ? "Author" : undefined;
    const note = makeNote({ by, text, role, parent });
    if (!updateResearch((s) => ({ ...s, talk: { ...s.talk, [a.slug]: [...(s.talk[a.slug] ?? []), note] } }))) {
      toast.error("Could not post", { description: "Check that you are logged in." });
      return false;
    }
    toast.success(parent ? "Reply posted" : "Comment posted", { description: `+${POINTS.comment} points for the researcher` });
    return true;
  }

  const replyBox = (threadId: string) =>
    replyTo?.thread === threadId && (
      <div className="mt-4 flex gap-3">
        <Avatar name={account?.name ?? "Reader"} className="size-8 text-xs" />
        <div className="min-w-0 flex-1">
          <ChatBox
            key={`${replyTo.thread}:${replyTo.name}`}
            initial={replyTo.name ? `@${replyTo.name} ` : ""}
            placeholder="Write a reply"
            submitLabel="Reply"
            compact
            autoFocus
            onCancel={() => setReplyTo(null)}
            onSend={(t) => {
              const ok = post(t, threadId);
              if (ok) setReplyTo(null);
              return ok;
            }}
          />
        </div>
      </div>
    );

  return (
    <section id="discussion" aria-labelledby="discussion-title">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-bdnavy-700 pb-4">
        <h2 id="discussion-title" className={H2}>Discussion <span className="text-bdnavy-300 tabular-nums">({fmtNum(notes.length)})</span></h2>
        {notes.length > 1 && (
          <div role="radiogroup" aria-label="Sort comments" className="flex rounded-full bg-bdnavy-900 p-1 ring-1 ring-bdnavy-700 ring-inset">
            {(["new", "top"] as const).map((o) => (
              <label key={o} className={cn("inline-flex h-8 cursor-pointer items-center rounded-full px-3.5 text-xs font-semibold transition-colors has-focus-visible:ring-2 has-focus-visible:ring-signal-orange", order === o ? "bg-signal-orange text-text-primary" : "text-bdnavy-200 hover:text-signal-orange")}>
                <input type="radio" name="comment-order" className="sr-only" checked={order === o} onChange={() => setOrder(o)} />
                {o === "new" ? "Newest" : "Most reacted"}
              </label>
            ))}
          </div>
        )}
      </div>
      <p className="mt-4 max-w-[70ch] text-sm leading-relaxed text-bdnavy-300">For improving the research: questions on method, sources and suggestions. No personal attacks, and never post a participant&apos;s name or phone number.</p>

      <div className="mt-6">
        {account ? (
          <div className="flex gap-3">
            <Avatar name={account.name} />
            <div className="min-w-0 flex-1">
              <ChatBox placeholder="Ask a question, suggest a source, or share what you found" submitLabel="Post" starters onSend={(t) => post(t)} />
            </div>
          </div>
        ) : ready ? (
          <div className="flex flex-col gap-4 rounded-2xl bg-bdnavy-900 p-5 ring-1 ring-bdnavy-700 sm:flex-row sm:items-center">
            <p className="flex-1 text-sm leading-relaxed text-bdnavy-200">Log in with your Kandari Profile to comment, reply and react. Reading the discussion is open to everyone.</p>
            <Link href={`/login?next=${encodeURIComponent(`/research/${a.slug}#discussion`)}`} className={cn(BTN_SOLID, "shrink-0 self-start sm:self-auto")}>
              <Icon name="login" className="text-xl" /> Log in to join
            </Link>
          </div>
        ) : (
          <div className="h-36 animate-pulse rounded-2xl bg-bdnavy-900 motion-reduce:animate-none" aria-label="Loading" />
        )}
      </div>

      {tree.length === 0 ? (
        <div className="mt-7 flex flex-col items-center rounded-2xl border border-dashed border-bdnavy-700 px-6 py-8 text-center">
          <Icon name="forum" className="text-3xl text-signal-orange" />
          <p className="mt-2 font-grotesk text-base font-bold text-signal-orange">No comments yet</p>
          <p className="mt-1 text-sm text-bdnavy-300">Ask the first question: the authors are notified of every comment.</p>
        </div>
      ) : (
        <ol className="mt-8 space-y-7">
          {tree.map(({ note, replies }) => (
            <Note key={note.id} a={a} n={note} own={ownIds.has(note.id)} onReply={() => setReplyTo(replyTo?.thread === note.id && !replyTo.name ? null : { thread: note.id, name: "" })} replying={replyTo?.thread === note.id}>
              {(replies.length > 0 || replyTo?.thread === note.id) && (
                <div className="mt-3 border-l-2 border-bdnavy-700 pl-4">
                  {replies.length > 0 && (
                    <ol>
                      {replies.map((r) => (
                        <Note key={r.id} a={a} n={r} own={ownIds.has(r.id)} reply onReply={() => setReplyTo({ thread: note.id, name: r.by })} />
                      ))}
                    </ol>
                  )}
                  {replyBox(note.id)}
                </div>
              )}
            </Note>
          ))}
        </ol>
      )}
    </section>
  );
}
