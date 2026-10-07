"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, ChevronDown, ListFilter, Pin, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { videoComments } from "@/data/media/academy";
import { currentUser, people } from "@/data/media/users";
import type { Tone } from "@/data/media/types";
import { threadsOf, type ClassVideo, type CommentSort, type VideoComment } from "@/lib/media/academy";
import { commentSchema } from "@/lib/media/schemas";
import { newId, useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../../ui/button-styles";
import { Ago, Num, useFormat } from "../../ui/numerals";
import { PersonAvatar } from "../../ui/person";
import { updateAcademy, useAcademy } from "../use-academy";
import { CommentVotes } from "./votes";

const TONES: Tone[] = ["green", "orange", "teal", "slate", "emerald"];
const byHandle = new Map(people.map((p) => [p.handle, p]));

/** Who wrote it, as an avatar can draw them: a member's own, or initials for a learner named in the data. */
function writerOf(c: VideoComment) {
  const p = c.handle ? byHandle.get(c.handle) : undefined;
  if (p) return p;
  const name = c.name ?? "শিক্ষার্থী";
  return { nameBn: name, initials: Array.from(name)[0], tone: TONES[[...name].reduce((n, ch) => n + ch.charCodeAt(0), 0) % TONES.length] };
}

/**
 * The conversation under a class: how many, sorted by most liked or newest,
 * a box to write in, then each comment with its likes and replies. The
 * teacher's answers carry their name in a pill; what the viewer wrote can be
 * taken back. Reading is open to all; writing to those who can watch.
 */
export function VideoComments({ video, canTalk }: { video: ClassVideo; canTalk: boolean }) {
  const hydrated = useHydrated();
  const mine = useAcademy((a) => a.comments);
  const [sort, setSort] = useState<CommentSort>("top");
  const all = useMemo(() => (hydrated ? [...videoComments, ...mine] : videoComments), [hydrated, mine]);
  const threads = threadsOf(all, video.id, sort);
  const count = all.filter((c) => c.video === video.id).length;

  function post(text: string, parent?: string) {
    const comment: VideoComment = { id: newId("c"), video: video.id, handle: currentUser.handle, text, at: new Date().toISOString(), likes: 0, parent };
    if (!updateAcademy((a) => ({ ...a, comments: [...a.comments, comment] }))) {
      toast.error("ব্রাউজারের জায়গা ভরে গেছে");
      return false;
    }
    return true;
  }

  function remove(id: string) {
    updateAcademy((a) => ({ ...a, comments: a.comments.filter((c) => c.id !== id && c.parent !== id) }));
    toast("মতামত মুছে ফেলা হলো");
  }

  return (
    <section aria-labelledby="comments-title" className="mt-8">
      <div className="flex items-center gap-6">
        <h2 id="comments-title" className="text-xl font-bold text-white">
          <Num value={count} />টি মতামত
        </h2>
        <SortMenu sort={sort} onSort={setSort} />
      </div>

      <div className="mt-5">
        {canTalk ? (
          <Composer placeholder="মতামত লিখুন…" action="মতামত দিন" onPost={(t) => post(t)} />
        ) : (
          <p className="rounded-xl bg-white/8 px-4 py-3 text-sm text-white/70">এটা কোর্সের ভিডিও — ভর্তি হলে মতামত দিতে পারবেন। পড়তে পারেন সবাই।</p>
        )}
      </div>

      {threads.length === 0 ? (
        <p className="mt-8 text-sm text-white/65">এখনো কেউ কিছু লেখেননি — প্রথম মতামতটা আপনার হোক।</p>
      ) : (
        <ul className="mt-8 space-y-6">
          <AnimatePresence initial={false}>
            {threads.map(({ comment, replies }) => (
              <Item key={comment.id} comment={comment} replies={replies} teacher={video.teacher} canTalk={canTalk} onRemove={remove} onReply={(t) => post(t, comment.id)} />
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}

function SortMenu({ sort, onSort }: { sort: CommentSort; onSort: (s: CommentSort) => void }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const options: { id: CommentSort; label: string }[] = [
    { id: "top", label: "সেরা মতামত" },
    { id: "new", label: "নতুন আগে" },
  ];
  return (
    <div ref={box} className="relative">
      <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="inline-flex h-9 items-center gap-2 rounded-full px-2 text-sm font-semibold text-white hover:bg-white/10">
        <ListFilter className="size-5" aria-hidden /> সাজান
      </button>
      {open && (
        <div role="menu" className="absolute top-10 left-0 z-20 w-44 overflow-hidden rounded-xl bg-text-primary py-2 shadow-[0_20px_40px_-12px_rgb(0_0_0/0.9)] ring-1 ring-white/12">
          {options.map((o) => (
            <button
              key={o.id}
              type="button"
              role="menuitemradio"
              aria-checked={sort === o.id}
              onClick={() => {
                onSort(o.id);
                setOpen(false);
              }}
              className={cn("block w-full px-4 py-2.5 text-left text-sm hover:bg-white/10", sort === o.id ? "font-bold text-signal-orange" : "text-white")}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** The writing box: grows as you type; the buttons show once you start. */
function Composer({ placeholder, action, onPost, onCancel, autoFocus, small }: { placeholder: string; action: string; onPost: (text: string) => boolean | void; onCancel?: () => void; autoFocus?: boolean; small?: boolean }) {
  const { num } = useFormat();
  const [text, setText] = useState("");
  const [active, setActive] = useState(Boolean(autoFocus));
  const [error, setError] = useState("");
  const area = useRef<HTMLTextAreaElement>(null);

  function grow(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }

  function submit() {
    const parsed = commentSchema.safeParse({ text });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    if (onPost(parsed.data.text) === false) return;
    setText("");
    setError("");
    if (area.current) area.current.style.height = "auto";
    if (onCancel) onCancel();
    else setActive(false);
  }

  function cancel() {
    setText("");
    setError("");
    setActive(false);
    onCancel?.();
  }

  return (
    <div className="flex gap-3">
      <PersonAvatar person={currentUser} size={small ? "sm" : "md"} className="shrink-0" />
      <div className="min-w-0 flex-1">
        <textarea
          ref={area}
          rows={1}
          value={text}
          autoFocus={autoFocus}
          maxLength={500}
          placeholder={placeholder}
          aria-label={placeholder}
          aria-invalid={Boolean(error)}
          onFocus={() => setActive(true)}
          onChange={(e) => {
            setText(e.target.value);
            setError("");
            grow(e.target);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) submit();
          }}
          className="block w-full resize-none border-b border-white/30 bg-transparent pb-1.5 text-[15px] text-white placeholder:text-white/50 focus-visible:border-b-2 focus-visible:border-signal-orange focus-visible:outline-none"
        />
        {error && <p className="mt-1 text-xs text-crimson-bright">{error}</p>}
        {active && (
          <div className="mt-2 flex items-center justify-end gap-2">
            {text.length > 400 && <span className="mr-auto text-xs text-white/60 tabular-nums">{num(text.length)}/{num(500)}</span>}
            <button type="button" onClick={cancel} className="h-9 rounded-full px-4 text-sm font-semibold text-white hover:bg-white/10">
              বাতিল
            </button>
            <button type="button" onClick={submit} disabled={text.trim().length < 2} className={mediaButton({ size: "sm", className: "rounded-full px-4" })}>
              {action}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Long comments show four lines first. */
function ReadMore({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 240;
  return (
    <>
      <p className={cn("mt-1 text-[15px] leading-relaxed whitespace-pre-line text-white/90", long && !open && "line-clamp-4")}>{text}</p>
      {long && (
        <button type="button" onClick={() => setOpen((o) => !o)} className="mt-1 text-sm font-semibold text-white/70 hover:text-white">
          {open ? "কম দেখান" : "আরও পড়ুন"}
        </button>
      )}
    </>
  );
}

function Item({
  comment,
  teacher,
  canTalk,
  onRemove,
  onReply,
  small,
  replies = [],
}: {
  comment: VideoComment;
  replies?: VideoComment[];
  teacher: string;
  canTalk: boolean;
  onRemove: (id: string) => void;
  onReply: (text: string) => boolean | void;
  small?: boolean;
}) {
  const reduce = useReducedMotion();
  const [replying, setReplying] = useState(false);
  const [thread, setThread] = useState(false);
  const who = writerOf(comment);
  const isTeacher = comment.handle === teacher;
  const isMine = comment.handle === currentUser.handle && !videoComments.some((c) => c.id === comment.id);
  const teacherName = byHandle.get(teacher)?.nameBn;

  return (
    <motion.li layout={!reduce} initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="flex gap-3">
      <PersonAvatar person={who} size={small ? "sm" : "md"} className="shrink-0" />
      <div className="min-w-0 flex-1">
        {comment.pinned && (
          <p className="mb-1 flex items-center gap-1.5 text-xs text-white/65">
            <Pin className="size-3.5" aria-hidden /> {teacherName} পিন করেছেন
          </p>
        )}
        <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px]">
          <span className={cn("font-semibold text-white", isTeacher && "inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5")}>
            {who.nameBn}
            {isTeacher && <BadgeCheck className="size-3.5" aria-label="এই ক্লাসের শিক্ষক" />}
          </span>
          <span className="text-white/60">
            <Ago iso={comment.at} />
          </span>
        </p>
        <ReadMore text={comment.text} />
        <div className="mt-1 -ml-2 flex items-center gap-1">
          <CommentVotes id={comment.id} base={comment.likes} disabled={!canTalk} />
          {canTalk && (
            <button type="button" onClick={() => setReplying(true)} className="h-8 rounded-full px-3 text-xs font-semibold text-white hover:bg-white/10">
              উত্তর দিন
            </button>
          )}
          {isMine && (
            <button type="button" onClick={() => onRemove(comment.id)} className="inline-flex h-8 items-center gap-1 rounded-full px-3 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white">
              <Trash2 className="size-3.5" aria-hidden /> মুছুন
            </button>
          )}
        </div>
        {replying && (
          <div className="mt-2">
            <Composer small autoFocus placeholder="উত্তর লিখুন…" action="উত্তর দিন" onPost={(t) => {
                const ok = onReply(small ? `@${who.nameBn} ${t}` : t);
                if (ok !== false) setThread(true);
                return ok;
              }}
              onCancel={() => setReplying(false)}
            />
          </div>
        )}
        {replies.length > 0 && <Replies replies={replies} open={thread} onToggle={() => setThread((o) => !o)} teacher={teacher} canTalk={canTalk} onRemove={onRemove} onReply={onReply} />}
      </div>
    </motion.li>
  );
}

/** "▾ ৩টি উত্তর" — opens the thread; the teacher's face shows when they answered. */
function Replies({
  replies,
  open,
  onToggle,
  teacher,
  canTalk,
  onRemove,
  onReply,
}: {
  replies: VideoComment[];
  open: boolean;
  onToggle: () => void;
  teacher: string;
  canTalk: boolean;
  onRemove: (id: string) => void;
  onReply: (text: string) => boolean | void;
}) {
  const reduce = useReducedMotion();
  const answered = replies.some((r) => r.handle === teacher) ? byHandle.get(teacher) : undefined;
  return (
    <div className="mt-1">
      <button type="button" aria-expanded={open} onClick={onToggle} className="-ml-3 inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm font-semibold text-signal-orange hover:bg-white/10">
        <ChevronDown className={cn("size-5 transition-transform duration-200", open && "rotate-180")} aria-hidden />
        {answered && (
          <span aria-hidden>
            <PersonAvatar person={answered} size="xs" />
          </span>
        )}
        <Num value={replies.length} />টি উত্তর
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mt-2 space-y-4 overflow-hidden"
          >
            {replies.map((r) => (
              <Item key={r.id} small comment={r} teacher={teacher} canTalk={canTalk} onRemove={onRemove} onReply={onReply} />
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
