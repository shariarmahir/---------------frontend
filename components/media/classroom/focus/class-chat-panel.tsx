"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Eye, FlaskConical, GraduationCap, HelpCircle, MessagesSquare, SendHorizontal, X } from "lucide-react";
import { toast } from "sonner";
import { sampleChats } from "@/data/media/class-chat";
import { useAuth } from "@/lib/auth/client";
import { append, bdDay, canWrite, cleanMsg, openQuestions, thread, type ClassMsg } from "@/lib/media/class-chat";
import { roleOf } from "@/lib/media/notices";
import { newId, updateMedia, useMediaState } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { useFormat, useNumerals } from "../../ui/numerals";
import type { RoomCard } from "./rooms";
import { useClassSession } from "./session-context";

const EMPTY: ClassMsg[] = [];

/** The left-hand class chat: the whole class and the teacher, one thread per room. */
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
  const end = useRef<HTMLDivElement>(null);

  // The room in the centre leads; otherwise the viewer's last pick, else their first room.
  const id = current && rooms.some((r) => r.id === current) ? current : picked && rooms.some((r) => r.id === picked) ? picked : (rooms.find((r) => r.mine) ?? rooms[0])?.id;
  const room = rooms.find((r) => r.id === id);
  const mine = useMediaState((s) => (id ? s.classChat[id] : undefined)) ?? EMPTY;
  const list = useMemo(() => (id ? thread(sampleChats[id] ?? [], mine) : []), [id, mine]);
  const open = openQuestions(list);

  const meId = parent ? undefined : account?.id;
  const member = Boolean(room && meId && (room.members.some((m) => m.id === meId) || room.teacherId === meId) && room.mine);
  const role = room ? roleOf(room, meId, member) : "guest";
  const writable = canWrite(role, parent ? "parent" : "student");

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end", behavior: reduce ? "auto" : "smooth" });
  }, [list.length, id, reduce]);

  const locale = numerals === "bn" ? "bn-BD" : "bn-BD-u-nu-latn";
  const time = (iso: string) => {
    const d = new Date(Date.parse(iso) + 6 * 3_600_000);
    const h = d.getUTCHours();
    const part = h >= 4 && h < 12 ? "সকাল" : h >= 12 && h < 15 ? "দুপুর" : h >= 15 && h < 18 ? "বিকাল" : h >= 18 && h < 20 ? "সন্ধ্যা" : "রাত";
    return `${part} ${num(h % 12 || 12)}:${num(String(d.getUTCMinutes()).padStart(2, "0"))}`;
  };
  const day = (iso: string) => new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "long", timeZone: "Asia/Dhaka" });

  function send() {
    if (!room || !account || !writable) return;
    const text = cleanMsg(draft);
    if (!text) return;
    const msg: ClassMsg = { id: newId("cm"), by: account.id, byName: account.name, byRole: role, text, at: new Date().toISOString(), ...(ask && { ask: true }) };
    const saved = updateMedia((s) => ({ ...s, classChat: { ...s.classChat, [room.id]: append(s.classChat[room.id] ?? [], msg) } }));
    if (!saved) toast.error("এই ব্রাউজারে সেভ হলো না", { description: "বার্তাটা এখন দেখা যাচ্ছে, পাতা বন্ধ করলে হারাবে।" });
    setDraft("");
    setAsk(false);
  }

  return (
    <section aria-label="ক্লাস চ্যাট" className="flex h-full min-h-0 flex-col bg-black">
      <header className="space-y-2.5 border-b border-white/12 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-bd-green text-white">
            <MessagesSquare className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-white">ক্লাস চ্যাট</h2>
            <p className="truncate text-xs text-white/65">{room?.teacher ? `শিক্ষক: ${room.teacher}` : "শিক্ষক আর পুরো ক্লাস"}</p>
          </div>
          {onClose && (
            <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white">
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
              className="h-10 w-full appearance-none rounded-xl bg-text-primary pr-9 pl-3 text-sm font-semibold text-white ring-1 ring-white/12 outline-none focus-visible:ring-signal-orange disabled:opacity-100"
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
              <FlaskConical className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-signal-orange" aria-hidden />
            ) : (
              <GraduationCap className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-signal-orange" aria-hidden />
            )}
          </div>
        )}
        {open.length > 0 && (
          <p className="inline-flex items-center gap-1.5 rounded-full bg-signal-orange/15 px-2.5 py-1 text-xs font-bold text-signal-orange">
            <HelpCircle className="size-3.5" aria-hidden /> শিক্ষকের উত্তরের অপেক্ষায় {num(open.length)}টি প্রশ্ন
          </p>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4">
        {list.length === 0 ? (
          <p className="px-2 pt-6 text-center text-sm text-white/60">এখনো কেউ লেখেনি। প্রথম বার্তাটা আপনিই দিন।</p>
        ) : (
          <ol className="space-y-3">
            {list.map((m, i) => {
              const newDay = i === 0 || bdDay(list[i - 1].at) !== bdDay(m.at);
              const self = m.by === meId;
              const teacher = m.byRole === "teacher";
              const waiting = m.ask && list.slice(i + 1).every((x) => x.byRole !== "teacher");
              return (
                <Fragment key={m.id}>
                  {newDay && (
                    <li className="flex justify-center pt-1" aria-hidden>
                      <span className="rounded-full bg-white/8 px-3 py-0.5 text-[11px] font-semibold text-white/60">{day(m.at)}</span>
                    </li>
                  )}
                  <li className={cn("flex flex-col gap-1", self ? "items-end" : "items-start")}>
                    {!self && (
                      <p className="flex items-center gap-1.5 px-1 text-xs font-semibold text-white/70">
                        {m.byName}
                        {teacher && <span className="rounded-full bg-bd-green px-1.5 py-px text-[10px] font-bold text-white">শিক্ষক</span>}
                        {m.byRole === "leader" && <span className="rounded-full bg-white/10 px-1.5 py-px text-[10px] font-bold text-signal-orange">{room?.kind === "lab" ? "লিডার" : "সিআর"}</span>}
                      </p>
                    )}
                    <div
                      className={cn(
                        "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed break-words whitespace-pre-wrap",
                        self ? "rounded-tr-md bg-signal-orange font-medium text-text-primary" : teacher ? "rounded-tl-md bg-bd-green text-white" : "rounded-tl-md bg-text-primary text-white ring-1 ring-white/12",
                      )}
                    >
                      {m.ask && (
                        <span className={cn("mb-1 flex items-center gap-1 text-[11px] font-bold", self ? "text-text-primary/75" : "text-signal-orange")}>
                          <HelpCircle className="size-3.5" aria-hidden /> শিক্ষকের কাছে প্রশ্ন{waiting ? " · উত্তরের অপেক্ষায়" : ""}
                        </span>
                      )}
                      {m.text}
                    </div>
                    <time dateTime={m.at} className="px-1 text-[10px] text-white/45">
                      {time(m.at)}
                    </time>
                  </li>
                </Fragment>
              );
            })}
          </ol>
        )}
        <div ref={end} />
      </div>

      {parent ? (
        <p className="flex items-start gap-2 border-t border-white/12 px-4 py-3 text-xs leading-relaxed text-white/70">
          <Eye className="mt-0.5 size-4 shrink-0 text-signal-orange" aria-hidden /> অভিভাবক হিসেবে শুধু পড়ছেন — ক্লাসের চ্যাটে লেখা যায় না। কিছু জানাতে চাইলে শিক্ষকের সঙ্গে সরাসরি যোগাযোগ করুন।
        </p>
      ) : !writable ? (
        <p className="border-t border-white/12 px-4 py-3 text-xs leading-relaxed text-white/70">
          এই ক্লাসে যোগ দিলে লিখতে পারবেন।{" "}
          {room && (
            <Link href={room.kind === "lab" ? `/media/classroom/lab/${room.id}` : `/media/classroom/${room.id}`} className="font-bold text-signal-orange hover:underline">
              ক্লাসটা খুলুন
            </Link>
          )}
        </p>
      ) : (
        <form
          className="border-t border-white/12 p-3"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <div className="rounded-2xl bg-text-primary ring-1 ring-white/12 focus-within:ring-signal-orange/60">
            <label htmlFor="class-chat-box" className="sr-only">
              ক্লাসে লিখুন
            </label>
            <textarea
              id="class-chat-box"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={2}
              maxLength={1000}
              placeholder={role === "teacher" ? "ক্লাসকে কিছু বলুন" : ask ? "শিক্ষককে প্রশ্নটা লিখুন" : "ক্লাসে লিখুন"}
              className="block max-h-32 min-h-12 w-full resize-none bg-transparent px-3.5 pt-3 text-sm leading-relaxed text-white outline-none placeholder:text-white/45"
            />
            <div className="flex items-center gap-2 px-2 pb-2">
              {role !== "teacher" && (
                <button
                  type="button"
                  onClick={() => setAsk((a) => !a)}
                  aria-pressed={ask}
                  className={cn("inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-bold transition-colors", ask ? "bg-signal-orange text-text-primary" : "text-white/70 ring-1 ring-white/15 hover:text-white")}
                >
                  <HelpCircle className="size-3.5" aria-hidden /> শিক্ষককে প্রশ্ন
                </button>
              )}
              <span className="flex-1" />
              <button type="submit" disabled={!draft.trim()} className="grid size-9 place-items-center rounded-xl bg-signal-orange text-text-primary transition-[scale,opacity] active:scale-95 disabled:opacity-40">
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
