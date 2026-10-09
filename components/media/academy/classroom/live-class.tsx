"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ClipboardList, ExternalLink, Hand, LayoutGrid, Loader2, MessageSquareText, Mic, MicOff, MonitorUp, PhoneOff, ShieldCheck, UsersRound, Video, VideoOff, X } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { getCourse } from "@/data/media/academy";
import { DEMO_NOW } from "@/data/media/clock";
import { currentUser, personOrThrow } from "@/data/media/users";
import { useAuth } from "@/lib/auth/client";
import { CLASS_MINUTES, type Course } from "@/lib/media/academy";
import { nextClass, slotOf, type Batch } from "@/lib/media/batch";
import { bnDigits } from "@/lib/media/format";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../../ui/button-styles";
import { Num, useFormat } from "../../ui/numerals";
import { PersonAvatar } from "../../ui/person";
import { useAcademy, updateAcademy } from "../use-academy";
import { JITSI_DOMAIN, PUBLIC_JITSI, jitsiUrl, loadJitsi, type JitsiApi, type JitsiParticipant } from "./jitsi";
import { RoomChat } from "./room-chat";
import { teaches, useBatches } from "./use-batches";

/**
 * The live class: a lobby to check your camera and microphone, then the
 * batch's video room — Jitsi Meet underneath, our own controls on top: mic,
 * camera, share the screen, raise a hand, the grid, the batch chat, who is
 * here, a 40-minute class clock, and leave. Joining marks the learner
 * present for the week; the teacher can end the class into the roll call.
 */
export function LiveClass({ id }: { id: string }) {
  const hydrated = useHydrated();
  const all = useBatches();
  const enrollment = useAcademy((a) => {
    const b = all.find((x) => x.id === id);
    return b ? a.enrolled[b.course] : undefined;
  });
  const [stage, setStage] = useState<"lobby" | "call">("lobby");
  const [start, setStart] = useState({ mic: true, cam: false });
  const batch = all.find((b) => b.id === id);
  const course = batch && getCourse(batch.course);

  if (!hydrated) return <Skeleton className="fixed inset-0 z-60 rounded-none bg-m-blue-night" />;
  const allowed = course && batch && (teaches(course) || (enrollment && (enrollment.batch ?? course.id) === batch.id));
  if (!batch || !course || !allowed) {
    return (
      <Shell>
        <div className="m-auto max-w-md px-6 text-center text-white">
          <h1 className="text-2xl font-bold">এই লাইভ ক্লাসে ঢোকা যাবে না</h1>
          <p className="mt-2 text-white/75">লাইভ ক্লাস শুধু ব্যাচের শিক্ষার্থী আর একাডেমির শিক্ষকদের।</p>
          <Link href="/media/academy/classroom" className={mediaButton({ className: "mt-6" })}>
            ক্লাসরুমে ফিরুন
          </Link>
        </div>
      </Shell>
    );
  }
  return stage === "lobby" ? (
    <Lobby
      batch={batch}
      course={course}
      onEnter={(s) => {
        setStart(s);
        setStage("call");
      }}
    />
  ) : (
    <Call batch={batch} course={course} start={start} />
  );
}

/** The full-screen night stage both screens stand on. */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-60 flex flex-col overflow-hidden bg-m-blue-night text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_40rem_at_85%_-10%,rgb(1_63_208/0.55),transparent_60%),radial-gradient(40rem_30rem_at_0%_110%,rgb(255_180_35/0.18),transparent_60%)]" />
      <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}

/* ── The lobby ─────────────────────────────────────────────────────── */

function Lobby({ batch, course, onEnter }: { batch: Batch; course: Course; onEnter: (s: { mic: boolean; cam: boolean }) => void }) {
  const { account } = useAuth();
  const preview = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const [cam, setCam] = useState(false);
  const [mic, setMic] = useState(true);
  const [denied, setDenied] = useState(false);
  const lead = course.teacher === currentUser.handle;
  const next = nextClass(batch, DEMO_NOW);
  const week = next?.week ?? course.lessons.length;
  const lesson = course.lessons[week - 1];
  const name = account?.name ?? currentUser.nameBn;

  const stop = useCallback(() => {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
  }, []);
  useEffect(() => stop, [stop]);

  async function toggleCam() {
    if (cam) {
      stop();
      setCam(false);
      return;
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: false });
      stream.current = s;
      if (preview.current) preview.current.srcObject = s;
      setCam(true);
      setDenied(false);
    } catch {
      setDenied(true);
      toast.error("ক্যামেরা চালু করা গেল না", { description: "ব্রাউজারে ক্যামেরার অনুমতি দিন, অথবা ক্যামেরা ছাড়াই ঢুকুন।" });
    }
  }

  return (
    <Shell>
      <header className="flex items-center gap-3 px-4 py-4 sm:px-8">
        <Link href={`/media/academy/classroom/${encodeURIComponent(batch.id)}`} className="inline-flex h-10 items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-semibold ring-1 ring-white/20 backdrop-blur hover:bg-white/15">
          <ArrowLeft className="size-4" aria-hidden /> ক্লাসরুমে ফিরুন
        </Link>
      </header>
      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-8 overflow-y-auto px-4 pb-10 sm:px-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <div>
          <div className="relative aspect-video overflow-hidden rounded-[1.8rem] bg-black/40 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.7)] ring-1 ring-white/15">
            <video ref={preview} autoPlay playsInline muted className={cn("absolute inset-0 size-full -scale-x-100 object-cover transition-opacity duration-300", cam ? "opacity-100" : "opacity-0")} />
            {!cam && (
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <PersonAvatar person={currentUser} size="xl" className="mx-auto ring-4 ring-white/15" />
                  <p className="mt-3 text-sm text-white/70">{denied ? "ক্যামেরার অনুমতি মেলেনি" : "ক্যামেরা বন্ধ"}</p>
                </div>
              </div>
            )}
            <span className="absolute top-4 left-4 rounded-full bg-black/35 px-3 py-1 text-xs font-semibold backdrop-blur">{name}</span>
            <div className="absolute inset-x-0 bottom-4 flex justify-center gap-3">
              <Round on={mic} label={mic ? "মাইক বন্ধ করুন" : "মাইক চালু করুন"} onClick={() => setMic((m) => !m)}>
                {mic ? <Mic className="size-5" aria-hidden /> : <MicOff className="size-5" aria-hidden />}
              </Round>
              <Round on={cam} label={cam ? "ক্যামেরা বন্ধ করুন" : "ক্যামেরা চালু করুন"} onClick={() => void toggleCam()}>
                {cam ? <Video className="size-5" aria-hidden /> : <VideoOff className="size-5" aria-hidden />}
              </Round>
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-white/55">ক্যামেরা এখানে শুধু আপনিই দেখছেন — ক্লাসে ঢোকার পর বাকিরা দেখবে।</p>
        </div>

        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-m-yellow/15 px-3 py-1 text-xs font-bold text-m-yellow ring-1 ring-m-yellow/30">
            <span className="size-2 rounded-full bg-m-yellow" aria-hidden /> লাইভ ক্লাস · ব্যাচ <Num value={batch.n} />
          </p>
          <h1 className="mt-4 text-[clamp(1.9rem,3.6vw,2.8rem)] leading-[1.1] font-bold">{lesson?.title ?? course.title}</h1>
          <p className="mt-2 text-white/75">
            {course.title} · সপ্তাহ <Num value={week} />
          </p>
          <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white/8 p-3 ring-1 ring-white/12">
            <PersonAvatar person={personOrThrow(course.teacher)} size="md" />
            <div className="min-w-0 text-sm">
              <p className="font-semibold">{personOrThrow(course.teacher).nameBn}</p>
              <p className="text-white/65">
                {slotOf(batch.day, batch.time)} · <Num value={CLASS_MINUTES} /> মিনিট
              </p>
            </div>
          </div>
          <button type="button" onClick={() => { stop(); onEnter({ mic, cam }); }} className="mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-m-yellow text-base font-bold text-m-ink shadow-[0_18px_40px_-16px_rgb(255_180_35/0.8)] transition-transform hover:-translate-y-0.5 motion-reduce:transition-none sm:w-auto sm:px-10">
            {lead ? "ক্লাস শুরু করুন" : "ক্লাসে ঢুকুন"}
          </button>
          <p className="mt-4 flex gap-2 text-xs leading-relaxed text-white/60">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-m-yellow" aria-hidden />
            ভিডিও কল চলে Jitsi Meet-এ ({JITSI_DOMAIN})। সেখানে শুধু আপনার নাম যায়, ইমেইল বা ফোন নয়। ক্লাসের ঘরটা এই ব্যাচের নিজের।
          </p>
          {PUBLIC_JITSI && <p className="mt-2 text-xs leading-relaxed text-white/50">ডেমো: বিনামূল্যের meet.jit.si পাতার ভেতরে বসানো কল কয়েক মিনিটে কেটে দেয়, আর প্রথমজনকে Jitsi-তে লগইন করে ঘর খুলতে হতে পারে। পুরো ক্লাসের জন্য “নতুন ট্যাবে খুলুন” ব্যবহার করুন — আসল একাডেমিতে নিজস্ব Jitsi সার্ভার লাগবে।</p>}
        </div>
      </main>
    </Shell>
  );
}

function Round({ on, label, onClick, children, tone }: { on: boolean; label: string; onClick: () => void; children: React.ReactNode; tone?: "danger" | "accent" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={on}
      title={label}
      className={cn(
        "grid size-12 shrink-0 place-items-center rounded-full ring-1 transition-[background-color,transform] duration-200 hover:-translate-y-0.5 motion-reduce:transition-none",
        tone === "danger" ? "bg-m-red text-white ring-m-red" : tone === "accent" ? (on ? "bg-m-yellow text-m-ink ring-m-yellow" : "bg-white/10 text-white ring-white/20 hover:bg-white/18") : on ? "bg-white/12 text-white ring-white/20 hover:bg-white/20" : "bg-white text-m-ink ring-white",
      )}
    >
      {children}
    </button>
  );
}

/* ── The call ──────────────────────────────────────────────────────── */

type Side = "chat" | "people" | null;

function Call({ batch, course, start }: { batch: Batch; course: Course; start: { mic: boolean; cam: boolean } }) {
  const router = useRouter();
  const { account } = useAuth();
  const { num } = useFormat();
  const host = useRef<HTMLDivElement>(null);
  const api = useRef<JitsiApi | null>(null);
  const [status, setStatus] = useState<"loading" | "on" | "failed">("loading");
  const [mic, setMic] = useState(start.mic);
  const [cam, setCam] = useState(start.cam);
  const [sharing, setSharing] = useState(false);
  const [hand, setHand] = useState(false);
  const [tiles, setTiles] = useState(false);
  const [side, setSide] = useState<Side>(null);
  const [people, setPeople] = useState<JitsiParticipant[]>([]);
  const [joinedAt, setJoinedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const lead = course.teacher === currentUser.handle;
  const roomHref = `/media/academy/classroom/${encodeURIComponent(batch.id)}`;
  const week = nextClass(batch, DEMO_NOW)?.week ?? course.lessons.length;
  const lesson = course.lessons[week - 1];
  const name = account?.name ?? currentUser.nameBn;

  const leave = useCallback(
    (to: string = roomHref) => {
      api.current?.executeCommand("hangup");
      router.push(to);
    },
    [roomHref, router],
  );

  // Build the room once; tear it down when leaving the page.
  useEffect(() => {
    let alive = true;
    const night = getComputedStyle(document.documentElement).getPropertyValue("--color-m-blue-night").trim();
    loadJitsi()
      .then((Jitsi) => {
        if (!alive || !host.current) return;
        const a = new Jitsi(JITSI_DOMAIN, {
          roomName: batch.room,
          parentNode: host.current,
          width: "100%",
          height: "100%",
          userInfo: { displayName: name },
          configOverwrite: {
            prejoinPageEnabled: false,
            prejoinConfig: { enabled: false },
            startWithAudioMuted: !start.mic,
            startWithVideoMuted: !start.cam,
            disableDeepLinking: true,
            disableInviteFunctions: true,
            hideConferenceSubject: true,
            subject: `${course.title} · ব্যাচ ${batch.n}`,
            toolbarButtons: [],
          },
          interfaceConfigOverwrite: { SHOW_JITSI_WATERMARK: false, SHOW_WATERMARK_FOR_GUESTS: false, MOBILE_APP_PROMO: false, DEFAULT_BACKGROUND: night || undefined, TILE_VIEW_MAX_COLUMNS: 4 },
        });
        api.current = a;
        const refresh = () => setPeople(a.getParticipantsInfo());
        a.addListener("videoConferenceJoined", () => {
          setStatus("on");
          setJoinedAt(Date.now());
          refresh();
          markPresent(course, batch, week);
        });
        a.addListener("participantJoined", refresh);
        a.addListener("participantLeft", refresh);
        a.addListener("audioMuteStatusChanged", (e) => setMic(!e.muted));
        a.addListener("videoMuteStatusChanged", (e) => setCam(!e.muted));
        a.addListener("screenSharingStatusChanged", (e) => setSharing(Boolean(e.on)));
        a.addListener("tileViewChanged", (e) => setTiles(Boolean(e.enabled)));
        a.addListener("readyToClose", () => router.push(roomHref));
        // Until Jitsi says we are in (it may first ask the host to sign in), show it as it is.
        setTimeout(() => alive && setStatus((s) => (s === "loading" ? "on" : s)), 6000);
      })
      .catch(() => alive && setStatus("failed"));
    return () => {
      alive = false;
      api.current?.dispose();
      api.current = null;
    };
    // The room is built once per visit; the rest is read when it is.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The class clock.
  useEffect(() => {
    if (!joinedAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [joinedAt]);

  const elapsed = joinedAt ? Math.max(0, Math.floor((now - joinedAt) / 1000)) : 0;
  const total = CLASS_MINUTES * 60;
  const mmss = (s: number) => num(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`);
  const cmd = (c: string) => api.current?.executeCommand(c);

  return (
    <Shell>
      <header className="flex items-center gap-3 px-3 py-3 sm:px-5">
        <button type="button" onClick={() => leave()} className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 ring-1 ring-white/20 hover:bg-white/15" aria-label="ক্লাসরুমে ফিরুন">
          <ArrowLeft className="size-4.5" aria-hidden />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold">{lesson?.title ?? course.title}</p>
          <p className="truncate text-xs text-white/65">
            {course.title} · ব্যাচ <Num value={batch.n} /> · সপ্তাহ <Num value={week} />
          </p>
        </div>
        <div className="flex items-center gap-2.5 rounded-full bg-white/10 py-1.5 pr-3 pl-1.5 ring-1 ring-white/15" aria-label="ক্লাসের সময়">
          <svg viewBox="0 0 36 36" className="size-7 -rotate-90" aria-hidden>
            <circle cx="18" cy="18" r="15" className="fill-none stroke-white/15" strokeWidth="4" />
            <circle cx="18" cy="18" r="15" className="fill-none stroke-m-yellow transition-[stroke-dashoffset] duration-1000" strokeWidth="4" strokeLinecap="round" strokeDasharray={94.25} strokeDashoffset={94.25 * (1 - Math.min(1, elapsed / total))} />
          </svg>
          <span className="text-sm font-bold tabular-nums">
            {mmss(elapsed)} <span className="font-semibold text-white/55">/ {mmss(total)}</span>
          </span>
        </div>
        <span className="hidden items-center gap-1.5 rounded-full bg-m-yellow px-3 py-1.5 text-xs font-bold text-m-ink sm:inline-flex">
          <span className="size-2 animate-pulse rounded-full bg-m-ink motion-reduce:animate-none" aria-hidden /> লাইভ
        </span>
      </header>

      <div className="flex min-h-0 flex-1 gap-3 px-3 sm:px-5">
        <div className="relative min-w-0 flex-1 overflow-hidden rounded-[1.6rem] bg-black/30 ring-1 ring-white/12">
          <div ref={host} className="absolute inset-0" />
          {status === "on" && !joinedAt && (
            <div role="status" className="absolute inset-x-3 top-3 z-10 flex flex-wrap items-center gap-3 rounded-2xl bg-m-blue-night/85 p-3 pl-4 text-sm ring-1 ring-white/15 backdrop-blur-md sm:inset-x-auto sm:right-auto sm:left-1/2 sm:max-w-xl sm:-translate-x-1/2">
              <Loader2 className="size-4 shrink-0 animate-spin text-m-yellow motion-reduce:animate-none" aria-hidden />
              <p className="min-w-0 flex-1 leading-snug text-white/85">
                {lead ? "ঘর খুলছে — Jitsi লগইন চাইলে লগইন করুন, তারপর শিক্ষার্থীরা ঢুকতে পারবে।" : "শিক্ষক ঘর খোলার অপেক্ষা — শিক্ষক ঢুকলেই ক্লাস শুরু, হাজিরা উঠবে।"}
              </p>
              <a href={jitsiUrl(batch.room)} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-white px-3.5 text-xs font-bold text-m-ink">
                <ExternalLink className="size-3.5" aria-hidden /> নতুন ট্যাবে
              </a>
            </div>
          )}
          {status !== "on" && (
            <div className="absolute inset-0 grid place-items-center bg-m-blue-night/90 p-6 text-center">
              {status === "loading" ? (
                <div>
                  <Loader2 className="mx-auto size-8 animate-spin text-m-yellow motion-reduce:animate-none" aria-hidden />
                  <p className="mt-3 font-semibold">ক্লাসঘর তৈরি হচ্ছে…</p>
                  <p className="mt-1 text-sm text-white/60">{JITSI_DOMAIN}-এর সাথে যোগাযোগ হচ্ছে</p>
                </div>
              ) : (
                <div className="max-w-sm">
                  <p className="text-lg font-bold">ভিডিও কল চালু করা গেল না</p>
                  <p className="mt-1 text-sm text-white/65">ইন্টারনেট বা ব্রাউজার Jitsi-র স্ক্রিপ্ট আটকে দিয়েছে। সরাসরি Jitsi-র পাতায় একই ঘরে ঢুকতে পারেন।</p>
                  <a href={jitsiUrl(batch.room)} target="_blank" rel="noopener noreferrer" className={mediaButton({ className: "mt-5" })}>
                    <ExternalLink aria-hidden /> নতুন ট্যাবে খুলুন
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {side && (
          <aside className="absolute inset-x-3 top-16 bottom-24 z-10 flex w-auto flex-col sm:static sm:inset-auto sm:w-[22rem] sm:shrink-0" aria-label={side === "chat" ? "ব্যাচের আড্ডা" : "কলে যাঁরা আছেন"}>
            <button type="button" onClick={() => setSide(null)} className="absolute top-4 right-4 z-10 grid size-8 place-items-center rounded-full bg-m-ink/8 text-m-ink hover:bg-m-ink/15" aria-label="বন্ধ করুন">
              <X className="size-4" aria-hidden />
            </button>
            {side === "chat" ? (
              <RoomChat batch={batch} compact className="h-full text-m-ink" />
            ) : (
              <section className="flex h-full flex-col rounded-[1.6rem] bg-white p-5 text-m-ink">
                <h2 className="text-xl font-bold">কলে আছেন</h2>
                <p className="text-sm text-m-ink/60">
                  <Num value={people.length} /> জন · ব্যাচে <Num value={batch.enrolled} /> জন শিক্ষার্থী
                </p>
                <ul className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto">
                  {people.map((p) => {
                    const n = p.displayName || p.formattedDisplayName || "অতিথি";
                    return (
                      <li key={p.participantId} className="flex items-center gap-3 rounded-xl bg-m-ground p-2.5">
                        <PersonAvatar person={{ nameBn: n, initials: n.slice(0, 1), tone: "green" }} size="sm" />
                        <span className="min-w-0 flex-1 truncate text-sm font-semibold">{n}</span>
                      </li>
                    );
                  })}
                  {people.length === 0 && <li className="py-6 text-center text-sm text-m-ink/55">কল চালু হলে এখানে নাম দেখাবে।</li>}
                </ul>
              </section>
            )}
          </aside>
        )}
      </div>

      {/* The dock. */}
      <footer className="flex flex-wrap items-center justify-center gap-2 px-3 py-4 sm:gap-3">
        <div className="flex items-center gap-2 rounded-full bg-white/8 p-2 ring-1 ring-white/12 backdrop-blur-md sm:gap-2.5">
          <Round on={mic} label={mic ? "মাইক বন্ধ করুন" : "মাইক চালু করুন"} onClick={() => cmd("toggleAudio")}>
            {mic ? <Mic className="size-5" aria-hidden /> : <MicOff className="size-5" aria-hidden />}
          </Round>
          <Round on={cam} label={cam ? "ক্যামেরা বন্ধ করুন" : "ক্যামেরা চালু করুন"} onClick={() => cmd("toggleVideo")}>
            {cam ? <Video className="size-5" aria-hidden /> : <VideoOff className="size-5" aria-hidden />}
          </Round>
          <Round on={sharing} tone="accent" label={sharing ? "স্ক্রিন শেয়ার থামান" : "স্ক্রিন শেয়ার করুন"} onClick={() => cmd("toggleShareScreen")}>
            <MonitorUp className="size-5" aria-hidden />
          </Round>
          <Round
            on={hand}
            tone="accent"
            label={hand ? "হাত নামান" : "হাত তুলুন"}
            onClick={() => {
              cmd("toggleRaiseHand");
              setHand((h) => !h);
            }}
          >
            <Hand className="size-5" aria-hidden />
          </Round>
          <Round on={tiles} tone="accent" label={tiles ? "বক্তার বড় ছবি" : "সবাইকে গ্রিডে"} onClick={() => cmd("toggleTileView")}>
            <LayoutGrid className="size-5" aria-hidden />
          </Round>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-white/8 p-2 ring-1 ring-white/12 backdrop-blur-md sm:gap-2.5">
          <Round on={side === "chat"} tone="accent" label="ব্যাচের আড্ডা" onClick={() => setSide((s) => (s === "chat" ? null : "chat"))}>
            <MessageSquareText className="size-5" aria-hidden />
          </Round>
          <Round on={side === "people"} tone="accent" label="কলে যাঁরা আছেন" onClick={() => setSide((s) => (s === "people" ? null : "people"))}>
            <UsersRound className="size-5" aria-hidden />
          </Round>
          <a href={jitsiUrl(batch.room)} target="_blank" rel="noopener noreferrer" className="grid size-12 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/18" aria-label="নতুন ট্যাবে খুলুন" title="নতুন ট্যাবে খুলুন">
            <ExternalLink className="size-5" aria-hidden />
          </a>
        </div>
        {lead && (
          <button type="button" onClick={() => leave(`${roomHref}?tool=attendance`)} className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-m-ink hover:bg-m-amber-soft">
            <ClipboardList className="size-4.5" aria-hidden /> শেষ করে হাজিরা নিন
          </button>
        )}
        <button type="button" onClick={() => leave()} className="inline-flex h-12 items-center gap-2 rounded-full bg-m-red px-5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 motion-reduce:transition-none">
          <PhoneOff className="size-4.5" aria-hidden /> বের হন
        </button>
      </footer>
    </Shell>
  );
}

/** Joining the live class marks an enrolled learner present for its week. */
function markPresent(course: Course, batch: Batch, week: number) {
  let marked = false;
  updateAcademy((a) => {
    const e = a.enrolled[course.id];
    if (!e || (e.batch ?? course.id) !== batch.id || e.attended.includes(week)) return a;
    marked = true;
    return { ...a, enrolled: { ...a.enrolled, [course.id]: { ...e, attended: [...e.attended, week] } } };
  });
  if (marked) toast.success(`হাজিরা উঠেছে — সপ্তাহ ${bnDigits(week)}`, { description: "লাইভ ক্লাসে ঢোকাই হাজিরা।" });
}
