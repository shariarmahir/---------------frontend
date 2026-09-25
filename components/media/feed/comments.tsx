"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SealCheck, SealWarning } from "@phosphor-icons/react/ssr";
import { Heart, MessageCircle, SendHorizontal } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import type { Comment, Person } from "@/data/media/types";
import { CURRENT_USER_HANDLE } from "@/data/media/users";
import { commentSchema, type CommentInput } from "@/lib/media/schemas";
import { newId, toggleKey, updateMedia, useMediaState } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { Ago, Compact, Num } from "../ui/numerals";
import { PersonAvatar } from "../ui/person";

export type CommentPeople = Record<string, Pick<Person, "handle" | "nameBn" | "initials" | "tone" | "idVerified">>;

const EMPTY: Comment[] = [];

function CommentForm({
  onSubmit,
  placeholder,
  autoFocus,
  compact,
}: {
  onSubmit: (text: string) => void;
  placeholder: string;
  autoFocus?: boolean;
  compact?: boolean;
}) {
  const form = useForm<CommentInput>({ resolver: zodResolver(commentSchema), defaultValues: { text: "" } });
  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit((v) => {
          onSubmit(v.text.trim());
          form.reset();
        })}
        className="flex items-start gap-2"
      >
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem className="flex-1 gap-1">
              <FormControl>
                <Textarea
                  {...field}
                  autoFocus={autoFocus}
                  rows={1}
                  aria-label={placeholder}
                  placeholder={placeholder}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      void form.handleSubmit((v) => {
                        onSubmit(v.text.trim());
                        form.reset();
                      })();
                    }
                  }}
                  className={cn("min-h-10 resize-none rounded-2xl bg-slate-50 py-2", compact && "text-sm")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit" className={mediaButton({ variant: "green", size: "icon", className: "size-10 rounded-full" })}>
          <SendHorizontal aria-hidden />
          <span className="sr-only">পাঠান</span>
        </button>
      </form>
    </Form>
  );
}

function CommentRow({
  postId,
  c,
  people,
  depth = 0,
  onReply,
  live,
}: {
  postId: string;
  c: Comment;
  people: CommentPeople;
  depth?: number;
  onReply?: () => void;
  /** Written in this browser: time it against the real clock. */
  live?: boolean;
}) {
  const key = `${postId}:${c.id}`;
  const liked = useMediaState((s) => Boolean(s.commentLikes[key]));
  const author = people[c.author];
  if (!author) return null;
  return (
    <div className="flex gap-2.5">
      <Link href={`/media/u/${author.handle}`} className="shrink-0">
        <PersonAvatar person={author} size={depth ? "xs" : "sm"} />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="rounded-2xl rounded-tl-md bg-slate-50 px-3.5 py-2.5">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link href={`/media/u/${author.handle}`} className="text-sm font-semibold text-text-primary hover:text-bd-green">
              {author.nameBn}
            </Link>
            {c.verdict && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold",
                  c.verdict.kind === "verify" ? "bg-bd-green-light text-bd-green-dark" : "bg-red-50 text-national-crimson",
                )}
              >
                {c.verdict.kind === "verify" ? <SealCheck size={13} weight="duotone" aria-hidden /> : <SealWarning size={13} weight="duotone" aria-hidden />}
                {c.verdict.kind === "verify" ? "যাচাই করেছেন" : "চ্যালেঞ্জ"} · <Num value={c.verdict.stars} />★
              </span>
            )}
          </p>
          <p className="mt-1 text-[15px] leading-relaxed whitespace-pre-line text-text-primary">{c.text}</p>
        </div>
        <div className="mt-1 flex items-center gap-3 px-2 text-xs text-text-muted">
          <Ago iso={c.at} live={live} />
          <button
            type="button"
            aria-pressed={liked}
            onClick={() => toggleKey("commentLikes", key)}
            className={cn("inline-flex min-h-8 items-center gap-1 font-semibold hover:text-national-crimson", liked && "text-national-crimson")}
          >
            <Heart className={cn("size-3.5", liked && "like-pop fill-current")} aria-hidden />
            {c.likes + (liked ? 1 : 0) > 0 && <Compact n={c.likes + (liked ? 1 : 0)} />}
            <span className="sr-only">পছন্দ</span>
          </button>
          {onReply && (
            <button type="button" onClick={onReply} className="inline-flex min-h-8 items-center font-semibold hover:text-bd-green">
              উত্তর দিন
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * The discussion under a post: seeded comments plus the viewer's own, with
 * one level of replies. `limit` shows a preview (feed); omit for the full
 * thread (post page).
 */
export function CommentThread({
  postId,
  seed,
  people,
  limit,
  showForm = true,
}: {
  postId: string;
  seed: Comment[];
  people: CommentPeople;
  limit?: number;
  showForm?: boolean;
}) {
  const mine = useMediaState((s) => s.comments[postId] ?? EMPTY);
  const replies = useMediaState((s) => s.replies);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const all = [...seed, ...mine];
  const liveIds = new Set(mine.map((c) => c.id));
  const shown = limit ? all.slice(-limit) : all;
  const hidden = all.length - shown.length;

  function add(text: string) {
    const c: Comment = { id: newId("c"), author: CURRENT_USER_HANDLE, text, at: new Date().toISOString(), likes: 0 };
    updateMedia((s) => ({ ...s, comments: { ...s.comments, [postId]: [...(s.comments[postId] ?? []), c] } }));
  }

  function reply(parent: string, text: string) {
    const key = `${postId}:${parent}`;
    const c: Comment = { id: newId("r"), author: CURRENT_USER_HANDLE, text, at: new Date().toISOString(), likes: 0 };
    updateMedia((s) => ({ ...s, replies: { ...s.replies, [key]: [...(s.replies[key] ?? []), c] } }));
    setReplyTo(null);
  }

  return (
    <div className="space-y-4">
      {limit && hidden > 0 && (
        <Link href={`/media/post/${postId}#discussion`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-bd-green">
          <MessageCircle className="size-4" aria-hidden /> আরও <Num value={hidden} />টি মন্তব্য দেখুন
        </Link>
      )}
      {shown.map((c) => {
        const myReplies = replies[`${postId}:${c.id}`] ?? [];
        const allReplies = [...(c.replies ?? []), ...myReplies];
        return (
          <div key={c.id} className="fade-in space-y-3">
            <CommentRow postId={postId} c={c} people={people} live={liveIds.has(c.id)} onReply={() => setReplyTo(replyTo === c.id ? null : c.id)} />
            {(allReplies.length > 0 || replyTo === c.id) && (
              <div className="ml-10 space-y-3 border-l-2 border-slate-100 pl-3">
                {allReplies.map((r) => (
                  <CommentRow key={r.id} postId={postId} c={r} people={people} depth={1} live={myReplies.includes(r)} />
                ))}
                {replyTo === c.id && (
                  <CommentForm compact autoFocus placeholder={`${people[c.author]?.nameBn ?? ""}-কে উত্তর দিন…`} onSubmit={(t) => reply(c.id, t)} />
                )}
              </div>
            )}
          </div>
        );
      })}
      {showForm && <CommentForm placeholder="আলোচনায় যোগ দিন… (Enter পাঠাবে)" onSubmit={add} />}
    </div>
  );
}
