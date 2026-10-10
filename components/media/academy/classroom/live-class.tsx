"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ClipboardList, ExternalLink, Hand, LayoutGrid, Loader2, MessageSquareText, Mic, MicOff, MonitorUp, PhoneOff, ShieldCheck, UsersRound, Video, VideoOff, X } from "lucide-react";
import { toast } from "sonner";
import { getCourse } from "@/data/media/academy";
import { DEMO_NOW } from "@/data/media/clock";
import { currentUser, personOrThrow } from "@/data/media/users";
import { useAuth } from "@/lib/auth/client";
import { CLASS_MINUTES, type Course } from "@/lib/media/academy";
import { nextClass, slotOf, type Batch } from "@/lib/media/batch";
import { bnDigits } from "@/lib/media/format";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { primaryBtn } from "../catalogue/buttons";
import { CatalogueRoot } from "../catalogue/catalogue-root";
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
  return (
    <CatalogueRoot>
      <Stage id={id} />
    </CatalogueRoot>
  );
}

function Stage({ id }: { id: string }) {
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

  if (!hydrated) return <span aria-hidden className="fixed inset-0 z-60 animate-pulse bg-(--c-bg)" />;
  const allowed = course && batch && (teaches(course) || (enrollment && (enrollment.batch ?? course.id) === batch.id));
  if (!batch || !course || !allowed) {
    return (
      <Shell>
        <div className="m-auto max-w-md px-6 text-center">
          <h1 className="display text-3xl text-(--c-ink-strong)">এই লাইভ ক্লাসে ঢোকা যাবে না</h1>
          <p className="mt-3 text-(--c-muted)">লাইভ ক্লাস শুধু ব্যাচের শিক্ষার্থী আর একাডেমির শিক্ষকদের।</p>
          <Link href="/media/academy/classroom" className={cn(primaryBtn, "mt-8")}>
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

/** The full-screen stage both screens stand on, in the page's theme. */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-60 flex flex-col overflow-hidden bg-(--c-bg) text-(--c-ink)">
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
        <Link
          href={`/media/academy/classroom/${encodeURIComponent(batch.id)}`}
          className="inline-flex h-10 items-center gap-2 border border-(--c-line-strong) px-4 text-sm font-semibold transition-colors duration-150 hover:bg-(--c-invert-bg) hover:text-(--c-invert-fg)"
        >
          <ArrowLeft className="size-4" aria-hidden /> ক্লাসরুমে ফিরুন
        </Link>
      </header>
      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-8 overflow-y-auto px-4 pb-10 sm:px-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <div>
          <div className="relative aspect-video overflow-hidden border border-(--c-line) bg-black">
            <video ref={preview} autoPlay playsInline muted className={cn("absolute inset-0 size-full -scale-x-100 object-cover transition-opacity duration-300", cam ? "opacity-100" : "opacity-0")} />
            {!cam && (
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <PersonAvatar person={currentUser} size="xl" className="mx-auto" />
                  <p className="mt-3 text-sm text-white/75">{denied ? "ক্যামেরার অনুমতি মেলেনি" : "ক্যামেরা বন্ধ"}</p>
                </div>
              </div>
            )}
            <span className="hud absolute top-4 left-4 bg-black/60 px-3 py-1 font-bold text-white">{name}</span>
            <div className="absolute inset-x-0 bottom-4 flex justify-center gap-3">
              <Round on={mic} label={mic ? "মাইক বন্ধ করুন" : "মাইক চালু করুন"} onClick={() => setMic((m) => !m)}>
                {mic ? <Mic className="size-5" aria-hidden /> : <MicOff className="size-5" aria-hidden />}
              </Round>
              <Round on={cam} label={cam ? "ক্যামেরা বন্ধ করুন" : "ক্যামেরা চালু করুন"} onClick={() => void toggleCam()}>
                {cam ? <Video className="size-5" aria-hidden /> : <VideoOff className="size-5" aria-hidden />}
              </Round>
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-(--c-faint)">ক্যামেরা এখানে শুধু আপনিই দেখছেন — ক্লাসে ঢোকার পর বাকিরা দেখবে।</p>
        </div>

        <div>
          <p className="hud inline-flex items-center gap-2 border border-(--c-signal) px-3 py-1 font-bold text-(--c-signal)">
            <span className="size-2 bg-(--c-signal)" aria-hidden /> লাইভ ক্লাস · ব্যাচ <Num value={batch.n} />
          </p>
          <h1 className="display mt-5 text-[clamp(1.9rem,3.6vw,2.8rem)] leading-[1.1] text-(--c-ink-strong)">{lesson?.title ?? course.title}</h1>
          <p className="mt-2 text-(--c-muted)">
            {course.title} · সপ্তাহ <Num value={week} />
          </p>
          <div className="mt-6 flex items-center gap-3 border border-(--c-line) p-3">
            <PersonAvatar person={personOrThrow(course.teacher)} size="md" />
            <div className="min-w-0 text-sm">
              <p className="font-semibold">{personOrThrow(course.teacher).nameBn}</p>
              <p className="text-(--c-muted)">
                {slotOf(batch.day, batch.time)} · <Num value={CLASS_MINUTES} /> মিনিট
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stop();
              onEnter({ mic, cam });
            }}
            className="mt-8 inline-flex h-14 w-full items-center justify-center gap-2 bg-(--c-signal) text-base font-bold text-black transition-opacity duration-150 hover:opacity-85 sm:w-auto sm:px-10"
          >
            {lead ? "ক্লাস শুরু করুন" : "ক্লাসে ঢুকুন"}
          </button>
          <p className="mt-4 flex gap-2 text-xs leading-relaxed text-(--c-muted)">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-(--c-signal)" aria-hidden />
            ভিডিও কল চলে Jitsi Meet-এ ({JITSI_DOMAIN})। সেখানে শুধু আপনার নাম যায়, ইমেইল বা ফোন নয়। ক্লাসের ঘরটা এই ব্যাচের নিজের।
          </p>
          {PUBLIC_JITSI && (
            <p className="mt-2 text-xs leading-relaxed text-(--c-faint)">
              ডেমো: বিনামূল্যের meet.jit.si পাতার ভেতরে বসানো কল কয়েক মিনিটে কেটে দেয়, আর প্রথমজনকে Jitsi-তে লগইন করে ঘর খুলতে হতে পারে। পুরো ক্লাসের জন্য “নতুন ট্যাবে খুলুন” ব্যবহার করুন — আসল একাডেমিতে নিজস্ব Jitsi সার্ভার লাগবে।
            </p>
          )}
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
        "grid size-12 shrink-0 place-items-center transition-colors duration-150",
        tone === "danger"
          ? "bg-(--c-bad) text-black"
          : tone === "accent"
            ? on
              ? "bg-(--c-signal) text-black"
              : "border border-(--c-line-strong) bg-(--c-bg) text-(--c-ink-strong) hover:bg-(--c-bg-raised)"
            : on
              ? "border border-(--c-line-strong) bg-(--c-bg) text-(--c-ink-strong) hover:bg-(--c-bg-raised)"
              : "bg-(--c-invert-bg) text-(--c-invert-fg)",
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
    const night = host.current ? getComputedStyle(host.current).getPropertyValue("--c-bg-sunken").trim() : "";
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
        <button
          type="button"
          onClick={() => leave()}
          className="grid size-10 shrink-0 place-items-center border border-(--c-line-strong) transition-colors duration-150 hover:bg-(--c-invert-bg) hover:text-(--c-invert-fg)"
          aria-label="ক্লাসরুমে ফিরুন"
        >
          <ArrowLeft className="size-4.5" aria-hidden />
        </button>
        <div className="min-w-0 flex-1">
          <p className="display truncate text-base text-(--c-ink-strong)">{lesson?.title ?? course.title}</p>
          <p className="truncate text-xs text-(--c-muted)">
            {course.title} · ব্যাচ <Num value={batch.n} /> · সপ্তাহ <Num value={week} />
          </p>
        </div>
        <div className="flex items-center gap-2.5 border border-(--c-line) py-1.5 pr-3 pl-1.5" aria-label="ক্লাসের সময়">
          <svg viewBox="0 0 36 36" className="size-7 -rotate-90" aria-hidden>
            <circle cx="18" cy="18" r="15" className="fill-none stroke-(--c-line)" strokeWidth="4" />
            <circle
              cx="18"
              cy="18"
              r="15"
              className="fill-none stroke-(--c-signal) transition-[stroke-dashoffset] duration-1000"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={94.25}
              strokeDashoffset={94.25 * (1 - Math.min(1, elapsed / total))}
            />
          </svg>
          <span className="text-sm font-bold tabular-nums">
            {mmss(elapsed)} <span className="font-semibold text-(--c-faint)">/ {mmss(total)}</span>
          </span>
        </div>
        <span className="hud hidden items-center gap-1.5 bg-(--c-bad) px-3 py-1.5 font-bold text-black sm:inline-flex">
          <span className="size-2 animate-pulse bg-black motion-reduce:animate-none" aria-hidden /> লাইভ
        </span>
      </header>

      <div className="flex min-h-0 flex-1 gap-3 px-3 sm:px-5">
        <div className="relative min-w-0 flex-1 overflow-hidden border border-(--c-line) bg-black">
          <div ref={host} className="absolute inset-0" />
          {status === "on" && !joinedAt && (
            <div role="status" className="absolute inset-x-3 top-3 z-10 flex flex-wrap items-center gap-3 border border-(--c-line) bg-(--c-bg-raised) p-3 pl-4 text-sm sm:inset-x-auto sm:right-auto sm:left-1/2 sm:max-w-xl sm:-translate-x-1/2">
              <Loader2 className="size-4 shrink-0 animate-spin text-(--c-signal) motion-reduce:animate-none" aria-hidden />
              <p className="min-w-0 flex-1 leading-snug text-(--c-ink)">{lead ? "ঘর খুলছে — Jitsi লগইন চাইলে লগইন করুন, তারপর শিক্ষার্থীরা ঢুকতে পারবে।" : "শিক্ষক ঘর খোলার অপেক্ষা — শিক্ষক ঢুকলেই ক্লাস শুরু, হাজিরা উঠবে।"}</p>
              <a
                href={jitsiUrl(batch.room)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 shrink-0 items-center gap-1.5 bg-(--c-invert-bg) px-3.5 text-xs font-bold text-(--c-invert-fg) transition-opacity duration-150 hover:opacity-80"
              >
                <ExternalLink className="size-3.5" aria-hidden /> নতুন ট্যাবে
              </a>
            </div>
          )}
          {status !== "on" && (
            <div className="absolute inset-0 grid place-items-center bg-(--c-bg)/95 p-6 text-center">
              {status === "loading" ? (
                <div>
                  <Loader2 className="mx-auto size-8 animate-spin text-(--c-signal) motion-reduce:animate-none" aria-hidden />
                  <p className="mt-3 font-semibold">ক্লাসঘর তৈরি হচ্ছে…</p>
                  <p className="mt-1 text-sm text-(--c-muted)">{JITSI_DOMAIN}-এর সাথে যোগাযোগ হচ্ছে</p>
                </div>
              ) : (
                <div className="max-w-sm">
                  <p className="display text-xl text-(--c-ink-strong)">ভিডিও কল চালু করা গেল না</p>
                  <p className="mt-1 text-sm text-(--c-muted)">ইন্টারনেট বা ব্রাউজার Jitsi-র স্ক্রিপ্ট আটকে দিয়েছে। সরাসরি Jitsi-র পাতায় একই ঘরে ঢুকতে পারেন।</p>
                  <a href={jitsiUrl(batch.room)} target="_blank" rel="noopener noreferrer" className={cn(primaryBtn, "mt-5")}>
                    <ExternalLink aria-hidden /> নতুন ট্যাবে খুলুন
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {side && (
          <aside className="absolute inset-x-3 top-16 bottom-24 z-10 flex w-auto flex-col sm:static sm:inset-auto sm:w-[22rem] sm:shrink-0" aria-label={side === "chat" ? "ব্যাচের আড্ডা" : "কলে যাঁরা আছেন"}>
            <button
              type="button"
              onClick={() => setSide(null)}
              className="absolute top-4 right-4 z-10 grid size-8 place-items-center text-(--c-muted) transition-colors duration-150 hover:bg-(--c-invert-bg) hover:text-(--c-invert-fg)"
              aria-label="বন্ধ করুন"
            >
              <X className="size-4" aria-hidden />
            </button>
            {side === "chat" ? (
              <RoomChat batch={batch} compact className="h-full text-(--c-ink-strong)" />
            ) : (
              <section className="flex h-full flex-col border border-(--c-line) bg-(--c-bg) p-5 text-(--c-ink-strong)">
                <h2 className="display text-xl">কলে আছেন</h2>
                <p className="text-sm text-(--c-muted)">
                  <Num value={people.length} /> জন · ব্যাচে <Num value={batch.enrolled} /> জন শিক্ষার্থী
                </p>
                <ul className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto">
                  {people.map((p) => {
                    const n = p.displayName || p.formattedDisplayName || "অতিথি";
                    return (
                      <li key={p.participantId} className="flex items-center gap-3 border border-(--c-line) p-2.5">
                        <PersonAvatar person={{ nameBn: n, initials: n.slice(0, 1), tone: "green" }} size="sm" />
                        <span className="min-w-0 flex-1 truncate text-sm font-semibold">{n}</span>
                      </li>
                    );
                  })}
                  {people.length === 0 && <li className="py-6 text-center text-sm text-(--c-faint)">কল চালু হলে এখানে নাম দেখাবে।</li>}
                </ul>
              </section>
            )}
          </aside>
        )}
      </div>

      {/* The dock. */}
      <footer className="flex flex-wrap items-center justify-center gap-2 px-3 py-4 sm:gap-3">
        <div className="flex items-center gap-px border border-(--c-line) bg-(--c-line)">
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
        <div className="flex items-center gap-px border border-(--c-line) bg-(--c-line)">
          <Round on={side === "chat"} tone="accent" label="ব্যাচের আড্ডা" onClick={() => setSide((s) => (s === "chat" ? null : "chat"))}>
            <MessageSquareText className="size-5" aria-hidden />
          </Round>
          <Round on={side === "people"} tone="accent" label="কলে যাঁরা আছেন" onClick={() => setSide((s) => (s === "people" ? null : "people"))}>
            <UsersRound className="size-5" aria-hidden />
          </Round>
          <a
            href={jitsiUrl(batch.room)}
            target="_blank"
            rel="noopener noreferrer"
            className="grid size-12 place-items-center bg-(--c-bg) text-(--c-ink-strong) transition-colors duration-150 hover:bg-(--c-bg-raised)"
            aria-label="নতুন ট্যাবে খুলুন"
            title="নতুন ট্যাবে খুলুন"
          >
            <ExternalLink className="size-5" aria-hidden />
          </a>
        </div>
        {lead && (
          <button
            type="button"
            onClick={() => leave(`${roomHref}?tool=attendance`)}
            className="inline-flex h-12 items-center gap-2 border border-(--c-line-strong) px-5 text-sm font-bold text-(--c-ink-strong) transition-colors duration-150 hover:bg-(--c-invert-bg) hover:text-(--c-invert-fg)"
          >
            <ClipboardList className="size-4.5" aria-hidden /> শেষ করে হাজিরা নিন
          </button>
        )}
        <button type="button" onClick={() => leave()} className="inline-flex h-12 items-center gap-2 bg-(--c-bad) px-5 text-sm font-bold text-black transition-opacity duration-150 hover:opacity-85">
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
