"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Eye, GraduationCap, LogOut, MessagesSquare, ShieldAlert, Sparkles, UserRound } from "lucide-react";
import { useAuth } from "@/lib/auth/client";
import { parentMaySee } from "@/lib/media/class-access";
import { LEVELS, type ClassLevel } from "@/lib/media/classroom";
import { cn } from "@/lib/utils";
import { mediaButton } from "../../ui/button-styles";
import { ClassChatPanel } from "./class-chat-panel";
import { ClassGate } from "./gate";
import { ClassLoader } from "./loader";
import { roomInPath, useRooms, type RoomCard } from "./rooms";
import { SessionContext, type ClassSession } from "./session-context";
import { ClassTicker } from "./ticker";
import { TutorPanel } from "./tutor-panel";

/** At this width and up the two chats sit beside the classroom; below it they slide over. */
const DOCK_QUERY = "(min-width: 1536px)";
/** From here the news strip fits in the top bar; on phones it gets its own row. */
const STRIP_QUERY = "(min-width: 768px)";

function useMatch(query: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

type Panel = "chat" | "ai";

/**
 * The classroom as its own full-screen place. Entering asks who is coming
 * in (student or parent), plays the opening, then shows the class chat on
 * the left, the classroom in the middle and the AI helper on the right.
 * Leaving the classroom pages ends the session; coming back asks again.
 */
export function ClassroomSession({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const rooms = useRooms();
  const [stage, setStage] = useState<"gate" | "loading" | "on">("gate");
  const [session, setSession] = useState<ClassSession | null>(null);
  const leave = useCallback(() => router.push("/media"), [router]);
  const open = useCallback(() => setStage("on"), []);

  if (stage === "gate" || !session) {
    return (
      <ClassGate
        rooms={rooms}
        onLeave={leave}
        onEnter={(s) => {
          setSession(s);
          setStage("loading");
        }}
      />
    );
  }
  if (stage === "loading") return <ClassLoader parent={session.mode === "parent"} name={session.mode === "parent" ? session.child.name : undefined} onDone={open} />;
  return (
    <SessionContext.Provider value={session}>
      <FocusShell session={session} rooms={rooms} onLeave={leave}>
        {children}
      </FocusShell>
    </SessionContext.Provider>
  );
}

function FocusShell({ session, rooms, onLeave, children }: { session: ClassSession; rooms: RoomCard[]; onLeave: () => void; children: React.ReactNode }) {
  const pathname = usePathname();
  const { account } = useAuth();
  const docked = useMatch(DOCK_QUERY);
  const wide = useMatch(STRIP_QUERY);
  const reduce = useReducedMotion();
  const [dock, setDock] = useState<Record<Panel, boolean>>({ chat: true, ai: true });
  // A slid-over panel belongs to the page it was opened on, so moving on closes it.
  const [slid, setSlid] = useState<{ panel: Panel; on: string } | null>(null);
  const drawer = slid?.on === pathname ? slid.panel : null;
  const setDrawer = (p: Panel | null) => setSlid(p ? { panel: p, on: pathname } : null);
  const main = useRef<HTMLElement>(null);

  const parent = session.mode === "parent" ? session.child : null;
  const roomId = roomInPath(pathname);
  const visible = parent ? rooms.filter((r) => parentMaySee(parent, r.id)) : rooms;
  const blocked = Boolean(parent && roomId && !parentMaySee(parent, roomId));
  const room = blocked ? undefined : rooms.find((r) => r.id === roomId);

  // The page behind stays still while the classroom is open.
  useEffect(() => {
    const html = document.documentElement;
    const before = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = before;
    };
  }, []);

  // A new page in the middle starts at its top.
  useEffect(() => {
    main.current?.scrollTo({ top: 0 });
  }, [pathname]);

  const shown = (p: Panel) => (docked ? dock[p] : drawer === p);
  const toggle = (p: Panel) => (docked ? setDock((d) => ({ ...d, [p]: !d[p] })) : setDrawer(drawer === p ? null : p));
  const close = docked ? undefined : () => setDrawer(null);

  const context = {
    room: room?.name,
    level: room?.level ? LEVELS[room.level as ClassLevel]?.bn : undefined,
    subject: room?.subject,
    parent: Boolean(parent),
  };

  const slide = (from: "left" | "right") =>
    reduce ? {} : { initial: { x: from === "left" ? "-100%" : "100%" }, animate: { x: 0 }, exit: { x: from === "left" ? "-100%" : "100%" }, transition: { type: "spring" as const, stiffness: 420, damping: 40 } };

  const side = (p: Panel, from: "left" | "right", node: React.ReactNode) => (
    <AnimatePresence initial={false}>
      {shown(p) && (
        <motion.aside
          key={p}
          {...slide(from)}
          className={cn(
            "min-h-0 print:hidden",
            docked
              ? cn("relative w-[22rem] shrink-0", from === "left" ? "border-r" : "w-[25rem] border-l", "border-white/12")
              : cn("absolute inset-y-0 z-20 w-[min(26rem,92vw)] shadow-[0_0_60px_-10px_rgb(0_0_0/0.9)]", from === "left" ? "left-0 border-r border-white/12" : "right-0 border-l border-white/12"),
          )}
        >
          {node}
        </motion.aside>
      )}
    </AnimatePresence>
  );

  return (
    <div className="fixed inset-0 z-[45] flex flex-col bg-black font-sans text-white print:static print:block">
      <header className="flex h-16 shrink-0 items-center gap-2 bg-signal-orange px-3 text-text-primary sm:gap-3 sm:px-4 print:hidden">
        <Link href="/media/classroom" className="flex items-center gap-2.5 rounded-xl pr-1 font-bold">
          <span className="grid size-10 place-items-center rounded-xl bg-text-primary text-signal-orange">
            <GraduationCap className="size-5" aria-hidden />
          </span>
          <span className="hidden text-lg sm:max-md:block xl:block">ক্লাসরুম</span>
        </Link>
        <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-text-primary px-3 py-1.5 text-xs font-bold text-white">
          {parent ? <Eye className="size-3.5 shrink-0 text-signal-orange" aria-hidden /> : <UserRound className="size-3.5 shrink-0 text-signal-orange" aria-hidden />}
          <span className="truncate md:max-xl:sr-only">{parent ? `অভিভাবক · ${parent.name}-এর ক্লাস` : `শিক্ষার্থী · ${account?.name ?? ""}`}</span>
          {parent && <span className="hidden shrink-0 rounded-full bg-white/10 px-2 py-px text-[10px] text-signal-orange md:inline">শুধু দেখা</span>}
        </span>
        {wide ? (
          <div className="min-w-0 flex-1 px-1 lg:px-4">
            <ClassTicker />
          </div>
        ) : (
          <span className="flex-1" />
        )}
        <PanelButton on={shown("chat")} onClick={() => toggle("chat")} Icon={MessagesSquare} label="ক্লাস চ্যাট" />
        <PanelButton on={shown("ai")} onClick={() => toggle("ai")} Icon={Sparkles} label="AI সহায়ক" />
        <button type="button" onClick={onLeave} className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-bold transition-colors hover:bg-text-primary/10">
          <LogOut className="size-4.5" aria-hidden />
          <span className="hidden xl:inline">বের হন</span>
          <span className="sr-only xl:hidden">ক্লাসরুম থেকে বের হন</span>
        </button>
      </header>

      {!wide && (
        <div className="shrink-0 border-b border-white/12 bg-black px-3 py-2 print:hidden">
          <ClassTicker />
        </div>
      )}

      <div className="relative flex min-h-0 flex-1 print:block">
        {side("chat", "left", <ClassChatPanel rooms={visible} current={blocked ? null : roomId} onClose={close} />)}

        <main
          ref={main}
          id="classroom-main"
          className="min-w-0 flex-1 overflow-y-auto overscroll-contain px-3 pt-5 pb-16 [--sticky-top:0px] sm:px-6 print:overflow-visible print:p-0"
        >
          {blocked ? (
            <div className="mx-auto mt-10 max-w-md space-y-4 rounded-3xl bg-text-primary p-6 text-center ring-1 ring-white/12">
              <ShieldAlert className="mx-auto size-10 text-signal-orange" aria-hidden />
              <h1 className="text-xl font-bold">এই ক্লাসটা {parent?.name}-এর নয়</h1>
              <p className="text-sm leading-relaxed text-white/75">অভিভাবক হিসেবে শুধু নিজের সন্তানের ক্লাস আর ল্যাব দেখা যায়।</p>
              <Link href="/media/classroom" className={mediaButton({ variant: "primary" })}>
                সন্তানের ক্লাসগুলো দেখুন
              </Link>
            </div>
          ) : (
            children
          )}
        </main>

        {side("ai", "right", <TutorPanel context={context} onClose={close} />)}

        <AnimatePresence>
          {!docked && drawer && (
            <motion.button
              type="button"
              aria-label="প্যানেল বন্ধ করুন"
              onClick={() => setDrawer(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 bg-black/60 print:hidden"
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function PanelButton({ on, onClick, Icon, label }: { on: boolean; onClick: () => void; Icon: typeof Eye; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-bold transition-[background-color,color,scale] duration-200 active:scale-95",
        on ? "bg-text-primary text-signal-orange" : "ring-1 ring-text-primary/30 hover:bg-text-primary/10",
      )}
    >
      <Icon className="size-4.5" aria-hidden />
      <span className="hidden xl:inline">{label}</span>
      <span className="sr-only xl:hidden">{label}</span>
    </button>
  );
}
