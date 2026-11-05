"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { sampleChats } from "@/data/media/class-chat";
import { sampleClassrooms } from "@/data/media/classroom";
import { DEMO_NOW } from "@/data/media/clock";
import { sampleLabs } from "@/data/media/labs";
import { sampleProjects } from "@/data/media/research";
import { useAuth } from "@/lib/auth/client";
import { studentCode } from "@/lib/media/class-access";
import { thread } from "@/lib/media/class-chat";
import { toBijoy } from "@/lib/media/bijoy";
import { GAP_MS, SHOW_MS, tickerItems } from "@/lib/media/class-ticker";
import type { Classroom } from "@/lib/media/classroom";
import type { LabRoom } from "@/lib/media/lab";
import { updateMedia, useMediaState } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { useLang, useT } from "../../ui/language";
import { useFormat } from "../../ui/numerals";
import { ReactionFace } from "./reaction-face";
import { roomInPath } from "./rooms";
import { useClassSession } from "./session-context";

const MINUTE = 60_000;

/** Time in the classroom: counted a minute at a time while the tab is in view, and saved. */
function useStay(): { visit: number; total: number } {
  const total = useMediaState((s) => s.classStay);
  const [visit, setVisit] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      setVisit((v) => v + MINUTE);
      updateMedia((s) => ({ ...s, classStay: (s.classStay ?? 0) + MINUTE }));
    }, MINUTE);
    return () => window.clearInterval(id);
  }, []);
  return { visit, total: total ?? 0 };
}

/** Pop in soft and blurred, settle; leave by lifting away into a blur. */
const CARD: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.92, filter: "blur(8px)" },
  shown: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { type: "spring", stiffness: 210, damping: 22, staggerChildren: 0.09 } },
  gone: { opacity: 0, y: -10, scale: 0.97, filter: "blur(6px)", transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] } },
};
const PART: Variants = {
  hidden: { opacity: 0, y: 8 },
  shown: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 24 } },
};
const FACE: Variants = {
  hidden: { scale: 0, rotate: -25 },
  shown: { scale: 1, rotate: 0, transition: { type: "spring", stiffness: 380, damping: 14 } },
};
const CALM: Variants = { hidden: { opacity: 0 }, shown: { opacity: 1, transition: { duration: 0.3 } }, gone: { opacity: 0, transition: { duration: 0.3 } } };

/**
 * The classroom's top-bar line: the welcome first, then one reminder at a
 * time — what it is about in bold, a face that feels it, and a proverb in
 * the brand's display face. Each stays eight seconds, fades away, and the
 * next pops in two seconds later, round and round. Hovering holds it.
 */
export function ClassTicker() {
  const session = useClassSession();
  const { account } = useAuth();
  const pathname = usePathname();
  const { num } = useFormat();
  const t = useT();
  const { lang } = useLang();
  const reduce = useReducedMotion();
  const classMap = useMediaState((s) => s.classrooms);
  const labMap = useMediaState((s) => s.labs);
  const projectMap = useMediaState((s) => s.projects);
  const chatMap = useMediaState((s) => s.classChat);
  const stay = useStay();
  const [at, setAt] = useState(0);
  const [shown, setShown] = useState(true);
  const [held, setHeld] = useState(false);

  const parent = session?.mode === "parent" ? session.child : null;
  const open = roomInPath(pathname);

  const input = useMemo(() => {
    const classOf = (id: string): Classroom | undefined => classMap[id] ?? sampleClassrooms.find((c) => c.id === id);
    const labOf = (id: string): LabRoom | undefined => labMap[id] ?? sampleLabs.find((l) => l.id === id);
    let classes: Classroom[];
    let labs: LabRoom[];
    let me: { id: string; name: string };
    if (parent) {
      classes = parent.classes.flatMap((id) => classOf(id) ?? []);
      labs = parent.labs.flatMap((id) => labOf(id) ?? []);
      const seat = [...classes, ...labs].flatMap((r) => r.members).find((m) => studentCode(m.id) === parent.code || (m.accountId !== undefined && studentCode(m.accountId) === parent.code));
      me = { id: seat?.id ?? "", name: parent.name };
    } else {
      const id = account?.id ?? "";
      const sits = (r: { members: { id: string }[]; teacherId?: string }) => r.members.some((m) => m.id === id) || r.teacherId === id;
      classes = Object.values(classMap).filter(sits);
      labs = Object.values(labMap).filter(sits);
      // A room opened in the middle counts too, so a visitor still gets its news.
      const c = open ? classOf(open) : undefined;
      const l = open ? labOf(open) : undefined;
      if (c && !classes.some((x) => x.id === c.id)) classes = [...classes, c];
      if (l && !labs.some((x) => x.id === l.id)) labs = [...labs, l];
      me = { id, name: account?.name ?? "" };
    }
    const clock = (id: string) => (sampleClassrooms.some((c) => c.id === id) || sampleLabs.some((l) => l.id === id) ? DEMO_NOW : new Date());
    const ids = new Set([...classes, ...labs].map((r) => r.id));
    return {
      me,
      classes: classes.map((room) => ({ room, now: clock(room.id) })),
      labs: labs.map((room) => ({ room, now: clock(room.id) })),
      projects: [...Object.values(projectMap), ...sampleProjects.filter((p) => !projectMap[p.id])].filter((p) => ids.has(p.from.id)),
      chats: [...ids].map((id) => ({ roomId: id, href: labs.some((l) => l.id === id) ? `/media/classroom/lab/${id}` : `/media/classroom/${id}`, list: thread(sampleChats[id] ?? [], chatMap[id] ?? []) })),
    };
  }, [parent, account, classMap, labMap, projectMap, chatMap, open]);

  const items = useMemo(() => tickerItems({ ...input, stay, num }), [input, stay, num]);
  const item = items[at % items.length];

  useEffect(() => {
    if (held) return;
    const id = shown
      ? window.setTimeout(() => setShown(false), SHOW_MS)
      : window.setTimeout(() => {
          setAt((a) => a + 1);
          setShown(true);
        }, GAP_MS);
    return () => window.clearTimeout(id);
  }, [shown, held]);

  const welcome = item.kind === "welcome";
  const card = reduce ? CALM : CARD;
  const part = reduce ? CALM : PART;
  const topic = (
    <>
      {item.urgent ? (
        <span className="mr-1.5 rounded-md bg-m-red px-1.5 py-px text-[11px] text-m-on">{t(item.label)}</span>
      ) : (
        <span className="text-m-ink/70">{t(item.label)} · </span>
      )}
      {item.text}
    </>
  );

  return (
    <div
      role="region"
      aria-label="ক্লাসের খবর"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      className="flex h-14 w-full min-w-0 items-center justify-center text-m-ink select-none"
    >
      <AnimatePresence mode="wait">
        {shown && (
          <motion.div key={at} variants={card} initial="hidden" animate="shown" exit="gone" className="flex max-w-full min-w-0 items-center gap-3">
            <motion.span variants={reduce ? CALM : FACE} className="shrink-0">
              <ReactionFace mood={item.mood} className="size-10" />
            </motion.span>
            <span className="flex min-w-0 flex-col justify-center">
              {!welcome && (
                <motion.span variants={part} className="block truncate text-[13px] leading-snug font-bold">
                  {item.href ? (
                    <Link href={item.href} className="hover:underline" title={item.text}>
                      {topic}
                    </Link>
                  ) : (
                    topic
                  )}
                </motion.span>
              )}
              {item.quip && (
                <motion.span variants={part} className={cn("block", welcome ? "line-clamp-2 md:truncate" : "truncate")}>
                  {lang === "en" ? (
                    // The slogan face draws Bangla only, so English is set in the bold sans.
                    <span className={cn("font-extrabold", welcome ? "text-[16px] leading-[1.15] md:text-[18px]" : "text-[17px] leading-tight")}>{t(item.quip)}</span>
                  ) : (
                    <>
                      {/* The slogan face draws Bangla on Latin codes, so readers get the Unicode line instead. */}
                      <span aria-hidden translate="no" className={cn("font-slogan", welcome ? "text-[17px] leading-[1.15] md:text-[20px] md:leading-tight 2xl:text-[24px]" : "text-[19px] leading-tight")}>
                        {toBijoy(item.quip)}
                      </span>
                      <span className="sr-only">{item.quip}</span>
                    </>
                  )}
                </motion.span>
              )}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
