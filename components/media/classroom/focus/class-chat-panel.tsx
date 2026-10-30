"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Eye, FlaskConical, GraduationCap, HelpCircle, Highlighter, LoaderCircle, MessagesSquare, SendHorizontal, WandSparkles, X } from "lucide-react";
import { toast } from "sonner";
import { sampleChats } from "@/data/media/class-chat";
import { DEMO_NOW } from "@/data/media/clock";
import { useAuth } from "@/lib/auth/client";
import { append, bdDay, canWrite, cleanMsg, hasBlanks, MSG_MAX, openQuestions, thread, type ClassMsg } from "@/lib/media/class-chat";
import { buildPin, canAddPin, canPin, canUnpin, chatPin, type PinDraft } from "@/lib/media/class-pins";
import { roleOf, type NoteColor } from "@/lib/media/notices";
import { newId, updateMedia, useMediaState } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { useFormat, useNumerals } from "../../ui/numerals";
import { bdToday } from "../../research/use-research";
import { PAPER } from "../notice-board";
import { MessageTools } from "./message-tools";
import { PinBoard } from "./pin-board";
import type { RoomCard } from "./rooms";
import { useClassSession } from "./session-context";
import { editPins, markMessage, useMarks, usePins } from "./use-pins";
import { useQuestionBuilder } from "./use-question";

const EMPTY: ClassMsg[] = [];

/** The left-hand Discussion Room: the whole class and the teacher, one thread per room, with pins and markers. */
export function ClassChatPanel({ rooms, current, onClose }: { rooms: RoomCard[]; current: string | null; onClose?: () => void }) {
  const session = useClassSession();
  const parent = session?.mode === "parent";
  const { account } = useAuth();
  const { numerals } = useNumerals();
  const { num } = useFormat();
  const reduce = useReducedMotion();
  const [picked, setPicked] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [ask, setAsk] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLTextAreaElement>(null);
  const question = useQuestionBuilder();

  // The room in the centre leads; otherwise the viewer's last pick, else their first room.
  const id = current && rooms.some((r) => r.id === current) ? current : picked && rooms.some((r) => r.id === picked) ? picked : (rooms.find((r) => r.mine) ?? rooms[0])?.id;
  const room = rooms.find((r) => r.id === id);
  const mine = useMediaState((s) => (id ? s.classChat[id] : undefined)) ?? EMPTY;
  const list = useMemo(() => (id ? thread(sampleChats[id] ?? [], mine) : []), [id, mine]);
  const open = openQuestions(list);
  const pins = usePins(id);
  const marks = useMarks(id);

  const meId = parent ? undefined : account?.id;
  const member = Boolean(room && meId && (room.members.some((m) => m.id === meId) || room.teacherId === meId) && room.mine);
  const role = room ? roleOf(room, meId, member) : "guest";
  const writable = canWrite(role, parent ? "parent" : "student");
  const mayPin = canPin(role, parent ? "parent" : "student");
  const who = account && room ? { id: account.id, name: account.name, role } : null;

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end", behavior: reduce ? "auto" : "smooth" });
  }, [list.length, id, reduce]);

  // A jumped-to message stays lit for a moment.
  useEffect(() => {
    if (!flash) return;
    const t = window.setTimeout(() => setFlash(null), 1800);
    return () => window.clearTimeout(t);
  }, [flash]);

  const locale = numerals === "bn" ? "bn-BD" : "bn-BD-u-nu-latn";
  const time = (iso: string) => {
    const d = new Date(Date.parse(iso) + 6 * 3_600_000);
    const h = d.getUTCHours();
    const part = h >= 4 && h < 12 ? "সকাল" : h >= 12 && h < 15 ? "দুপুর" : h >= 15 && h < 18 ? "বিকাল" : h >= 18 && h < 20 ? "সন্ধ্যা" : "রাত";
    return `${part} ${num(h % 12 || 12)}:${num(String(d.getUTCMinutes()).padStart(2, "0"))}`;
  };
  const day = (iso: string) => new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "long", timeZone: "Asia/Dhaka" });

  /** Put the cursor on the first "[ ]" the AI left, selected, so typing fills it. */
  function selectBlank() {
    const el = box.current;
    if (!el) return;
    el.focus();
    const at = el.value.search(/\[\s*\]/);
    if (at >= 0) el.setSelectionRange(at, at + el.value.slice(at).indexOf("]") + 1);
  }

  function send() {
    if (!room || !account || !writable || question.building) return;
    const text = cleanMsg(draft);
    if (!text) return;
    if (hasBlanks(text)) {
      toast.error("[ ] ঘরগুলো আগে পূরণ করুন", { description: "নিজের কথায় লিখে তারপর পাঠান।" });
      selectBlank();
      return;
    }
    const msg: ClassMsg = { id: newId("cm"), by: account.id, byName: account.name, byRole: role, text, at: new Date().toISOString(), ...(ask && { ask: true }) };
    const saved = updateMedia((s) => ({ ...s, classChat: { ...s.classChat, [room.id]: append(s.classChat[room.id] ?? [], msg) } }));
    if (!saved) toast.error("এই ব্রাউজারে সেভ হলো না", { description: "বার্তাটা এখন দেখা যাচ্ছে, পাতা বন্ধ করলে হারাবে।" });
    setDraft("");
    setAsk(false);
  }

  /** Turn the rough draft (or the teacher's last message, if the box is empty) into one clear question. */
  async function buildQuestion() {
    if (question.building) {
      question.stop();
      return;
    }
    if (!room) return;
    const before = draft;
    setAsk(true);
    const lastTeacher = list.findLast((m) => m.byRole === "teacher")?.text;
    const built = await question.build({ draft, room: room.name, subject: room.subject, teacher: room.teacher, lastTeacher }, (t) => setDraft(t.slice(0, MSG_MAX)));
    if (!built?.text) {
      setDraft(before);
      toast.error("প্রশ্নটা বানানো গেল না", { description: "ইন্টারনেট দেখে আবার চেষ্টা করুন।" });
      return;
    }
    setDraft(built.text.slice(0, MSG_MAX));
    if (built.mode === "offline") toast.message("ছাঁচে সাজানো হলো", { description: "এখন AI চালু নেই, তাই প্রশ্নের কাঠামো দিলাম। [ ] ঘরগুলো নিজের কথায় পূরণ করুন।" });
    else if (hasBlanks(built.text)) toast.message("প্রশ্ন তৈরি", { description: "[ ] ঘরগুলো নিজের কথায় পূরণ করুন, তারপর পাঠান।" });
    requestAnimationFrame(selectBlank);
  }

  const saveFailed = () => toast.error("এই ব্রাউজারে সেভ হলো না", { description: "এখন দেখা যাচ্ছে, পাতা বন্ধ করলে হারাবে।" });

  function createPin(d: PinDraft, color: NoteColor): string | null {
    if (!room || !who) return "ক্লাসে যোগ দিলে পিন করতে পারবেন।";
    if (!canAddPin(pins)) return "পিন ভরে গেছে — আগে একটা সরান।";
    const made = buildPin(d, who, newId("pn"), new Date().toISOString(), color);
    if ("problem" in made) return made.problem;
    if (!editPins(room.id, (l) => [...l, made.pin])) saveFailed();
    return null;
  }

  function togglePinMessage(m: ClassMsg) {
    if (!room || !who) return;
    const had = pins.find((p) => p.msgId === m.id);
    if (had) {
      if (!canUnpin(had, role, meId)) {
        toast.message("এই পিনটা শিক্ষক বা সিআর সরাতে পারেন");
        return;
      }
      if (!editPins(room.id, (l) => l.filter((p) => p.id !== had.id))) saveFailed();
      return;
    }
    if (!canAddPin(pins)) {
      toast.error("পিন ভরে গেছে", { description: "আগে একটা পিন সরান।" });
      return;
    }
    if (!editPins(room.id, (l) => [...l, chatPin(m, who, newId("pn"), new Date().toISOString())])) saveFailed();
    else toast.success("বার্তাটা পিন হলো");
  }

  function jump(msgId: string) {
    const el = document.getElementById(`msg-${msgId}`);
    if (!el) {
      toast.message("বার্তাটা এখন চ্যাটে নেই");
      return;
    }
    el.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
    setFlash(msgId);
  }

  return (
    <section aria-label="Discussion Room" className="flex h-full min-h-0 flex-col bg-m-canvas">
      <header className="space-y-2.5 border-b border-m-ink/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-m-blue-soft text-m-ink">
            <MessagesSquare className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-m-ink">Discussion Room</h2>
            <p className="truncate text-xs text-m-ink/65">{room?.teacher ? `শিক্ষক: ${room.teacher}` : "শিক্ষক আর পুরো ক্লাস"}</p>
          </div>
          {onClose && (
            <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-lg text-m-ink/70 transition-colors hover:bg-m-ink/6 hover:text-m-ink">
              <X className="size-5" aria-hidden />
              <span className="sr-only">চ্যাট বন্ধ করুন</span>
            </button>
          )}
        </div>
        {rooms.length > 1 && (
          <div className="relative">
            <label htmlFor="chat-room" className="sr-only">
              কোন ক্লাসের চ্যাট
            </label>
            <select
              id="chat-room"
              value={id ?? ""}
              onChange={(e) => setPicked(e.target.value)}
              disabled={Boolean(current && rooms.some((r) => r.id === current))}
              className="h-10 w-full appearance-none rounded-xl bg-m-card pr-9 pl-3 text-sm font-semibold text-m-ink ring-1 ring-m-ink/10 outline-none focus-visible:ring-m-blue disabled:opacity-100"
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.kind === "lab" ? "ল্যাব · " : ""}
                  {r.name}
                  {r.sample && !r.mine ? " (নমুনা)" : ""}
                </option>
              ))}
            </select>
            {room?.kind === "lab" ? (
              <FlaskConical className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-m-blue" aria-hidden />
            ) : (
              <GraduationCap className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-m-blue" aria-hidden />
            )}
          </div>
        )}
        {open.length > 0 && (
          <p className="inline-flex items-center gap-1.5 rounded-full bg-m-yellow/15 px-2.5 py-1 text-xs font-bold text-m-blue">
            <HelpCircle className="size-3.5" aria-hidden /> শিক্ষকের উত্তরের অপেক্ষায় {num(open.length)}টি প্রশ্ন
          </p>
        )}
      </header>

      {room && (
        <PinBoard
          // A different room starts with its own strip closed.
          key={room.id}
          pins={pins}
          role={role}
          parent={parent}
          meId={meId}
          lab={room.kind === "lab"}
          today={bdToday(room.sample ? DEMO_NOW : new Date())}
          onCreate={createPin}
          onToggle={(pid) => {
            if (!editPins(room.id, (l) => l.map((p) => (p.id === pid ? { ...p, done: !p.done } : p)))) saveFailed();
          }}
          onRemove={(pid) => {
            if (!editPins(room.id, (l) => l.filter((p) => p.id !== pid))) saveFailed();
          }}
          onJump={jump}
        />
      )}

      <div className="scrollbar-gold min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4">
        {list.length === 0 ? (
          <p className="px-2 pt-6 text-center text-sm text-m-ink/60">এখনো কেউ লেখেনি। প্রথম বার্তাটা আপনিই দিন।</p>
        ) : (
          <ol className="space-y-3">
            {list.map((m, i) => {
              const newDay = i === 0 || bdDay(list[i - 1].at) !== bdDay(m.at);
              const self = m.by === meId;
              const teacher = m.byRole === "teacher";
              const waiting = m.ask && list.slice(i + 1).every((x) => x.byRole !== "teacher");
              const mark = marks[m.id];
              const pinned = pins.some((p) => p.msgId === m.id);
              return (
                <Fragment key={m.id}>
                  {newDay && (
                    <li className="flex justify-center pt-1" aria-hidden>
                      <span className="rounded-full bg-m-ink/4 px-3 py-0.5 text-[11px] font-semibold text-m-ink/60">{day(m.at)}</span>
                    </li>
                  )}
                  <li id={`msg-${m.id}`} className={cn("group/msg flex flex-col gap-1", self ? "items-end" : "items-start")}>
                    {!self && (
                      <p className="flex items-center gap-1.5 px-1 text-xs font-semibold text-m-ink/70">
                        {m.byName}
                        {teacher && <span className="rounded-full bg-m-blue-soft px-1.5 py-px text-[10px] font-bold text-m-ink">শিক্ষক</span>}
                        {m.byRole === "leader" && <span className="rounded-full bg-m-ink/6 px-1.5 py-px text-[10px] font-bold text-m-blue">{room?.kind === "lab" ? "লিডার" : "সিআর"}</span>}
                      </p>
                    )}
                    <div
                      className={cn(
                        "relative max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed break-words whitespace-pre-wrap transition-shadow duration-300",
                        self ? "rounded-tr-md" : "rounded-tl-md",
                        mark ? cn(PAPER[mark].paper, "font-medium") : self ? "bg-m-yellow font-medium text-m-ink" : teacher ? "bg-m-blue-soft text-m-ink" : "bg-m-card text-m-ink ring-1 ring-m-ink/10",
                        flash === m.id && "ring-2 ring-white ring-offset-2 ring-offset-white",
                      )}
                    >
                      {m.ask && (
                        <span className={cn("mb-1 flex items-center gap-1 text-[11px] font-bold", mark ? "opacity-80" : self ? "text-m-ink/75" : "text-m-blue")}>
                          <HelpCircle className="size-3.5" aria-hidden /> শিক্ষকের কাছে প্রশ্ন{waiting ? " · উত্তরের অপেক্ষায়" : ""}
                        </span>
                      )}
                      {m.text}
                      {mark && (
                        <span className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-m-card text-m-blue ring-2 ring-white">
                          <Highlighter className="size-3" aria-label={`মার্ক করা — ${PAPER[mark].bn}`} />
                        </span>
                      )}
                    </div>
                    <div className={cn("flex flex-wrap items-center gap-x-1", self && "justify-end")}>
                      <time dateTime={m.at} className="px-1 text-[10px] text-m-ink/45">
                        {time(m.at)}
                      </time>
                      {mayPin && (
                    <MessageTools
                      pinned={pinned}
                      mark={mark}
                      onPin={() => togglePinMessage(m)} onMark={(c) => {
                        if (id && !markMessage(id, m.id, c)) saveFailed();
                      }}
                    />
                  )}
                    </div>
                  </li>
                </Fragment>
              );
            })}
          </ol>
        )}
        <div ref={end} />
      </div>

      {parent ? (
        <p className="flex items-start gap-2 border-t border-m-ink/10 px-4 py-3 text-xs leading-relaxed text-m-ink/70">
          <Eye className="mt-0.5 size-4 shrink-0 text-m-blue" aria-hidden /> অভিভাবক হিসেবে শুধু পড়ছেন — ক্লাসের চ্যাটে লেখা, পিন বা মার্ক করা যায় না। কিছু জানাতে চাইলে শিক্ষকের সঙ্গে সরাসরি যোগাযোগ করুন।
        </p>
      ) : !writable ? (
        <p className="border-t border-m-ink/10 px-4 py-3 text-xs leading-relaxed text-m-ink/70">
          এই ক্লাসে যোগ দিলে লিখতে পারবেন।{" "}
          {room && (
            <Link href={room.kind === "lab" ? `/media/classroom/lab/${room.id}` : `/media/classroom/${room.id}`} className="font-bold text-m-blue hover:underline">
              ক্লাসটা খুলুন
            </Link>
          )}
        </p>
      ) : (
        <form
          className="border-t border-m-ink/10 p-3"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <div className="rounded-2xl bg-m-card ring-1 ring-m-ink/10 focus-within:ring-m-blue/60 shadow-m-tile">
            <label htmlFor="class-chat-box" className="sr-only">
              ক্লাসে লিখুন
            </label>
            <textarea
              id="class-chat-box"
              ref={box}
              value={draft}
              readOnly={question.building}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={ask ? 4 : 2}
              maxLength={MSG_MAX}
              placeholder={role === "teacher" ? "ক্লাসকে কিছু বলুন" : ask ? "শিক্ষককে প্রশ্নটা লিখুন — অথবা এলোমেলো কথা লিখে “AI দিয়ে বানান” চাপুন" : "ক্লাসে লিখুন"}
              className="block max-h-40 min-h-12 w-full resize-none bg-transparent px-3.5 pt-3 text-sm leading-relaxed text-m-ink outline-none placeholder:text-m-ink/45"
            />
            <div className="flex items-center gap-2 px-2 pb-2">
              {role !== "teacher" && (
                <>
                  <button
                    type="button"
                    onClick={() => setAsk((a) => !a)}
                    aria-pressed={ask}
                    className={cn("inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-bold transition-colors", ask ? "bg-m-yellow text-m-ink" : "text-m-ink/70 ring-1 ring-m-ink/13 hover:text-m-ink")}
                  >
                    <HelpCircle className="size-3.5" aria-hidden /> শিক্ষককে প্রশ্ন
                  </button>
                  <button
                    type="button"
                    onClick={() => void buildQuestion()}
                    title="AI দিয়ে প্রশ্ন বানান — খসড়া বা শিক্ষকের শেষ কথা থেকে স্পষ্ট একটা প্রশ্ন সাজিয়ে দেয়"
                    className={cn("inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-bold text-m-blue ring-1 ring-m-blue/50 transition-colors hover:bg-m-yellow/10", question.building && "bg-m-yellow/10")}
                  >
                    {question.building ? <LoaderCircle className="size-3.5 animate-spin motion-reduce:animate-none" aria-hidden /> : <WandSparkles className="size-3.5" aria-hidden />}
                    {question.building ? "থামান" : "AI দিয়ে বানান"}
                  </button>
                </>
              )}
              <span className="flex-1" />
              <button type="submit" disabled={!draft.trim() || question.building} className="grid size-9 place-items-center rounded-xl bg-m-yellow text-m-ink transition-[scale,opacity] active:scale-95 disabled:opacity-40">
                <SendHorizontal className="size-4.5" aria-hidden />
                <span className="sr-only">পাঠান</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </section>
  );
}
