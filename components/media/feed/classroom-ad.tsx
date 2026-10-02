"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowRight, GraduationCap, Pause, Play, X } from "lucide-react";
import { ClassroomArt } from "./classroom-ad-art";

/*
 * THESIS: a four-frame story — stuck, join, solve together, show it — that
 * sells Classroom by showing what a student does there, in the feed's own
 * gold. Every claim is a real Classroom feature: class codes, the
 * discussion room and chat, the AI helper, sharing work to the feed.
 * It is the platform's own promotion, so it says so ("প্রচার").
 */

const SCENE_MS = 5200;

const SCENES = [
  { tag: "প্রশ্ন", title: "পড়তে বসেছেন, কিন্তু আটকে গেছেন?", body: "একা ভাবলে সময় যায়। সহপাঠী আর শিক্ষকের সাথে ভাবলে উত্তর আসে।" },
  { tag: "যোগ দিন", title: "ক্লাস কোড দিন, ঢুকে পড়ুন", body: "শিক্ষকের দেওয়া কোডটা লিখুন — রুটিন, নোটিশ আর সহপাঠীরা অপেক্ষায়।" },
  { tag: "একসাথে", title: "দল বেঁধে সমাধান করুন", body: "ডিসকাশন রুমে প্রশ্ন পিন করুন, ক্লাস চ্যাটে আলোচনা করুন, দরকারে এআই সহায়ককে জিজ্ঞেস করুন।" },
  { tag: "দেখান", title: "কাজটা ফিডে দেখান", body: "দলের সমাধান বা গবেষণা দলের নামে ফিডে শেয়ার করুন — পরিচিতি পান, সুযোগ আসে।" },
] as const;

/* One shared "closed" flag, so dismissing one copy in the feed hides them all. */
const KEY = "kandari-classroom-ad-v1";
const listeners = new Set<() => void>();
let closed = false;
let loaded = false;

function readClosed() {
  if (!loaded && typeof window !== "undefined") {
    loaded = true;
    try {
      closed = window.localStorage.getItem(KEY) === "1";
    } catch {
      // Blocked storage: it simply comes back next visit.
    }
  }
  return closed;
}
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => void listeners.delete(l);
};
function close() {
  closed = true;
  try {
    window.localStorage.setItem(KEY, "1");
  } catch {
    // Not saved; hidden for this visit.
  }
  listeners.forEach((l) => l());
}

export function ClassroomAd() {
  const dismissed = useSyncExternalStore(subscribe, readClosed, () => false);
  const [scene, setScene] = useState(0);
  const [round, setRound] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hover, setHover] = useState(false);
  const [visible, setVisible] = useState(false);
  const root = useRef<HTMLElement>(null);

  // Only play while it is on screen, so the story starts from its first frame for the reader.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [dismissed]);

  if (dismissed) return null;

  const paused = !playing || hover || !visible;
  const s = SCENES[scene];
  const go = (i: number) => {
    setScene(i);
    setRound((r) => r + 1);
  };

  return (
    <aside
      ref={root}
      aria-label="প্রচার: কাণ্ডারী-ল্যাব ক্লাসরুম"
      data-paused={paused}
      style={{ "--scene-ms": `${SCENE_MS}ms` } as React.CSSProperties}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
      onPointerLeave={() => setHover(false)}
      className="cb-root story-reveal overflow-hidden rounded-2xl bg-signal-orange p-4 text-text-primary sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-text-primary px-3 text-xs font-bold text-signal-orange">
          <GraduationCap className="size-4" aria-hidden /> কাণ্ডারী-ল্যাব ক্লাসরুম
        </p>
        <div className="flex items-center gap-1">
          <span className="mr-1 text-xs font-bold text-text-primary/65">প্রচার</span>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "অ্যানিমেশন থামান" : "অ্যানিমেশন চালান"}
            className="grid size-10 place-items-center rounded-full text-text-primary transition-colors hover:bg-text-primary/10 motion-reduce:hidden"
          >
            {playing ? <Pause className="size-4.5" aria-hidden /> : <Play className="size-4.5" aria-hidden />}
          </button>
          <button type="button" onClick={close} aria-label="প্রচারটি বন্ধ করুন" className="grid size-10 place-items-center rounded-full text-text-primary transition-colors hover:bg-text-primary/10">
            <X className="size-4.5" aria-hidden />
          </button>
        </div>
      </div>

      <div className="mt-2 grid items-center gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] sm:gap-5">
        <div className="order-2 sm:order-1">
          <div key={`${scene}-${round}`} aria-live="off">
            <p className="cb-text text-sm font-bold text-bd-green" style={{ "--d": 0 } as React.CSSProperties}>{s.tag}</p>
            <h3 className="cb-text mt-1 min-h-[2.6em] text-[1.6rem] leading-[1.3] font-bold text-balance sm:text-[1.9rem]" style={{ "--d": 60 } as React.CSSProperties}>{s.title}</h3>
            <p className="cb-text mt-2 min-h-[4.9em] text-[15px] leading-relaxed text-text-primary/80" style={{ "--d": 140 } as React.CSSProperties}>{s.body}</p>
          </div>

          <Link
            href="/media/classroom"
            className="group mt-4 inline-flex h-12 items-center gap-2 rounded-2xl bg-text-primary px-5 text-[15px] font-bold text-white transition-[translate,background-color] duration-200 hover:-translate-y-0.5 hover:bg-black focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-2 focus-visible:ring-offset-signal-orange motion-reduce:hover:translate-y-0"
          >
            ক্লাসরুমে যোগ দিন
            <ArrowRight className="size-4.5 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
          </Link>

          <ol className="mt-5 flex gap-1.5" aria-label="গল্পের ধাপ">
            {SCENES.map((x, i) => (
              <li key={x.tag} className="flex-1">
                <button type="button" onClick={() => go(i)} aria-label={`ধাপ ${i + 1}: ${x.tag}`} aria-current={i === scene ? "step" : undefined} className="group flex h-6 w-full items-center">
                  <span className="relative block h-1.5 w-full overflow-hidden rounded-full bg-text-primary/20 transition-[height] group-hover:h-2">
                    {i < scene && <span className="absolute inset-0 rounded-full bg-text-primary" />}
                    {i === scene && (
                      <span
                        key={`${scene}-${round}`}
                        className="cb-fill absolute inset-0 rounded-full bg-text-primary"
                        onAnimationEnd={() => {
                          setScene((c) => (c + 1) % SCENES.length);
                          setRound((r) => r + 1);
                        }}
                      />
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div className="order-1 mx-auto w-full max-w-[17rem] sm:order-2 sm:max-w-none">
          <ClassroomArt scene={scene} />
        </div>
      </div>
    </aside>
  );
}
