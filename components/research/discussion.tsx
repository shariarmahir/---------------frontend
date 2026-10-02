"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/lib/auth/client";
import { POINTS, thread, type Article, type TalkNote } from "@/lib/research/core";
import { toggleIn, updateResearch, useResearch } from "@/lib/research/store";
import { cn } from "@/lib/utils";
import { Avatar, bn, bnDate } from "./ui";

const NONE: TalkNote[] = [];
const LIMIT = 1500;

function Composer({ a, parent, onDone, autoFocus }: { a: Article; parent?: string; onDone?: () => void; autoFocus?: boolean }) {
  const { account } = useAuth();
  const [text, setText] = useState("");
  const id = parent ? `reply-${parent}` : "comment-text";

  function send(e: React.FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (t.length < 4) return toast.error("মন্তব্যটা আরেকটু লিখুন");
    if (t.length > LIMIT) return toast.error("মন্তব্য ছোট করুন (১৫০০ অক্ষরের মধ্যে)");
    const by = account?.name ?? "পাঠক";
    const role = a.authors.some((x) => x.name === by) ? "লেখক" : undefined;
    const note: TalkNote = { id: `n-${Date.now().toString(36)}`, by, at: new Date().toISOString(), text: t, ...(role ? { role } : {}), ...(parent ? { parent } : {}) };
    if (!updateResearch((s) => ({ ...s, talk: { ...s.talk, [a.slug]: [...(s.talk[a.slug] ?? []), note] } }))) return toast.error("মন্তব্য রাখা গেল না", { description: "সাইন ইন আছেন কি না দেখুন।" });
    setText("");
    onDone?.();
    toast.success(parent ? "উত্তর যোগ হলো" : "মন্তব্য যোগ হলো", { description: `গবেষকের স্কোরে +${bn(POINTS.comment)}` });
  }

  return (
    <form onSubmit={send} className="flex gap-3">
      <Avatar name={account?.name ?? "পাঠক"} className={parent ? "size-8 text-xs" : undefined} />
      <div className="min-w-0 flex-1">
        <label htmlFor={id} className="sr-only">{parent ? "উত্তর লিখুন" : "মন্তব্য লিখুন"}</label>
        <textarea
          id={id}
          rows={parent ? 2 : 3}
          value={text}
          autoFocus={autoFocus}
          onChange={(e) => setText(e.target.value)}
          maxLength={LIMIT}
          placeholder={parent ? "উত্তর লিখুন…" : "পদ্ধতি নিয়ে প্রশ্ন, তথ্যের উৎস, পরামর্শ — কী ভাবছেন?"}
          className="w-full resize-y rounded-2xl bg-white/[0.06] p-3.5 text-[15px] leading-relaxed text-white ring-1 ring-white/12 placeholder:text-white/40 focus:ring-2 focus:ring-signal-orange focus:outline-none"
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-xs text-white/40 tabular-nums">{bn(text.length)}/{bn(LIMIT)}</span>
          <span className="flex gap-2">
            {onDone && <button type="button" onClick={onDone} className="h-10 rounded-xl px-3 text-sm font-semibold text-white/70 hover:text-white">বাতিল</button>}
            <button type="submit" className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-signal-orange px-4 text-sm font-bold text-text-primary transition-colors hover:bg-white">
              <Icon name="send" className="text-[18px]" /> {parent ? "উত্তর দিন" : "মন্তব্য করুন"}
            </button>
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
    if (!toggleIn("noteLikes", key)) toast.error("পছন্দ করতে সাইন ইন করুন");
  };
  return (
    <li className={cn("flex gap-3", reply && "mt-4")}>
      <Avatar name={n.by} className={reply ? "size-8 text-xs" : undefined} />
      <div className="min-w-0 flex-1">
        <div className={cn("rounded-2xl px-4 py-3", reply ? "bg-white/[0.04]" : "bg-white/[0.06] ring-1 ring-white/10")}>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <span className="font-bold text-white">{n.by}</span>
            {n.role && <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", n.role === "লেখক" ? "bg-signal-orange text-text-primary" : "bg-bd-green text-white")}>{n.role}</span>}
            <span className="text-xs text-white/45">{bnDate(n.at)}</span>
          </p>
          <p className="mt-1.5 text-[15px] leading-relaxed whitespace-pre-line text-white/85">{n.text}</p>
        </div>
        <div className="mt-1.5 flex items-center gap-1 pl-2 text-xs font-bold">
          <button type="button" onClick={like} aria-pressed={liked} className={cn("inline-flex h-8 items-center gap-1 rounded-lg px-2 transition-colors", liked ? "text-signal-orange" : "text-white/55 hover:text-white")}>
            <Icon name="thumb_up" className="text-[16px]" filled={liked} /> {likes > 0 ? bn(likes) : "পছন্দ"}
          </button>
          {onReply && account && (
            <button type="button" onClick={onReply} aria-expanded={replying} className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-white/55 transition-colors hover:text-white">
              <Icon name="reply" className="text-[16px]" /> উত্তর
            </button>
          )}
        </div>
        {children}
      </div>
    </li>
  );
}

/** আলোচনা: questions and suggestions under the article, newest or most liked first, one level of replies. */
export function Discussion({ a }: { a: Article }) {
  const { account, ready } = useAuth();
  const mine = useResearch((s) => s.talk[a.slug] ?? NONE);
  const likedMap = useResearch((s) => s.noteLikes);
  const [order, setOrder] = useState<"new" | "top">("new");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const notes = [...(a.talk ?? []), ...mine];
  const tree = thread(notes, (n) => (n.likes ?? 0) + (likedMap[`${a.slug}:${n.id}`] ? 1 : 0), order);

  return (
    <section id="discussion" aria-labelledby="discussion-title" className="scroll-mt-56">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-signal-orange">প্রশ্ন, পরামর্শ, প্রমাণ</p>
          <h2 id="discussion-title" className="font-wiki mt-1 text-3xl font-bold text-white">আলোচনা <span className="text-white/40">{bn(notes.length)}</span></h2>
        </div>
        {notes.length > 1 && (
          <div role="group" aria-label="সাজানো" className="flex rounded-xl bg-white/[0.06] p-1 ring-1 ring-white/10">
            {(["new", "top"] as const).map((o) => (
              <button key={o} type="button" onClick={() => setOrder(o)} aria-pressed={order === o} className={cn("h-9 rounded-lg px-3 text-sm font-bold transition-colors", order === o ? "bg-white text-text-primary" : "text-white/65 hover:text-white")}>
                {o === "new" ? "নতুন আগে" : "সবচেয়ে পছন্দের"}
              </button>
            ))}
          </div>
        )}
      </div>
      <p className="mt-3 max-w-[65ch] text-sm leading-relaxed text-white/55">আলোচনা গবেষণাটি ভালো করার জন্য — পদ্ধতির প্রশ্ন, তথ্যের উৎস, পরামর্শ। ব্যক্তিগত আক্রমণ নয়; অংশগ্রহণকারীদের নাম বা ফোন নম্বর লিখবেন না।</p>

      <div className="mt-6">
        {account ? (
          <Composer a={a} />
        ) : ready ? (
          <p className="flex flex-wrap items-center gap-3 rounded-2xl bg-white/[0.04] p-4 text-sm text-white/75 ring-1 ring-white/10">
            <Icon name="lock" className="text-[20px] text-signal-orange" /> মন্তব্য, উত্তর আর পছন্দের জন্য কাণ্ডারী প্রোফাইল লাগে।
            <Link href={`/login?next=${encodeURIComponent(`/research/${a.slug}#discussion`)}`} className="ml-auto inline-flex h-10 items-center rounded-xl bg-signal-orange px-4 font-bold text-text-primary">সাইন ইন</Link>
          </p>
        ) : null}
      </div>

      {tree.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-white/15 p-6 text-center text-sm text-white/55">এখনো কোনো আলোচনা নেই। প্রথম প্রশ্নটা আপনিই করুন।</p>
      ) : (
        <ol className="mt-8 space-y-6">
          {tree.map(({ note, replies }) => (
            <Comment key={note.id} a={a} n={note} onReply={() => setReplyTo(replyTo === note.id ? null : note.id)} replying={replyTo === note.id}>
              {(replies.length > 0 || replyTo === note.id) && (
                <div className="mt-3 border-l-2 border-white/10 pl-4">
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
