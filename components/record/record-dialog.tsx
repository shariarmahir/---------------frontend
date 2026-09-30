"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useState } from "react";
import { Dialog } from "radix-ui";
import { X } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { PixelMark } from "@/components/ui/section-kit";
import { formatDuration, formatSize, useRecorder, type Recording } from "@/components/record/use-recorder";
import { cn } from "@/lib/utils";

/**
 * Evidence recorder — a gold side panel in the home page's language that
 * snaps in from the right edge (keyframes `record-*` in globals.css), its
 * parts rising in one after another like the phone menu.
 *
 * On "spy" recording: a browser cannot do it. Capture requires a permission
 * prompt, and while recording the tab shows a badge and the operating system
 * shows its own indicator. None of that can be suppressed from a web page,
 * and a UI that implied otherwise would be actively unsafe — someone
 * documenting extortion could be caught relying on concealment that was
 * never real. So this is built to be FAST and LOW-PROFILE rather than
 * hidden: one tap to start, and a stealth screen that goes black while
 * capture continues, so a glance at the phone shows nothing useful.
 */
export function RecordDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { state, mode, elapsed, error, recordings, level, start, stop, discard, attachPreview, isRecording } = useRecorder();
  const [stealth, setStealth] = useState(false);

  // Leaving the panel while live would keep the microphone on with no way
  // to stop it, so closing always stops first.
  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next && isRecording) stop();
      if (!next) setStealth(false);
      onOpenChange(next);
    },
    [isRecording, onOpenChange, stop],
  );

  // Warn if the tab is closed mid-recording — the file is only assembled on
  // stop, so navigating away loses it.
  useEffect(() => {
    if (!isRecording) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isRecording]);

  const item = (i: number) => ({ "--i": i }) as CSSProperties;

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="record-veil fixed inset-0 z-[60] bg-black/60" />
        <Dialog.Content
          onOpenAutoFocus={(e) => {
            // Focus the panel itself so no focus ring flashes on open.
            e.preventDefault();
            (e.currentTarget as HTMLElement).focus();
          }}
          className={cn(
            "record-panel fixed inset-y-2 right-2 z-[60] flex w-[min(28rem,calc(100vw-1rem))] flex-col overflow-hidden rounded-3xl shadow-[0_30px_80px_-20px_rgb(0_0_0/0.8)] focus:outline-none sm:inset-y-3 sm:right-3",
            stealth ? "bg-black text-white" : "bg-signal-orange text-text-primary",
          )}
        >
          {stealth ? (
            <>
              <Dialog.Title className="sr-only">Recording</Dialog.Title>
              <Dialog.Description className="sr-only">Stealth screen — recording continues.</Dialog.Description>
              <StealthScreen
                elapsed={elapsed}
                onExit={() => setStealth(false)}
                onStop={() => {
                  stop();
                  setStealth(false);
                }}
              />
            </>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain p-4 sm:p-5">
              {/* Header — pixel mark, title, the ink close button of the phone menu. */}
              <div className="record-item flex items-start justify-between gap-3" style={item(0)}>
                <div>
                  <PixelMark tone="light" />
                  <Dialog.Title className="mt-2 flex items-center gap-2 font-bengali text-3xl leading-tight font-bold">
                    প্রমাণ রেকর্ড
                  </Dialog.Title>
                  <Dialog.Description className="mt-1 font-sans text-sm leading-relaxed text-text-primary/85">
                    Record a bribe demand, extortion or harassment. Files stay on this device until you share them.
                  </Dialog.Description>
                </div>
                <Dialog.Close
                  aria-label="Close recorder"
                  className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-text-primary text-signal-orange [-webkit-tap-highlight-color:transparent] transition-[background-color,scale] duration-200 hover:bg-bd-green-dark focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none active:scale-90"
                >
                  <X className="size-5" aria-hidden />
                </Dialog.Close>
              </div>

              {error ? (
                <p
                  role="alert"
                  className="record-item mt-4 flex items-start gap-2 rounded-2xl bg-national-crimson p-3 font-sans text-[0.8125rem] leading-relaxed text-white"
                  style={item(1)}
                >
                  <Icon name="error" className="mt-px shrink-0 text-[16px]" />
                  {error}
                </p>
              ) : null}

              <div className="record-item mt-4" style={item(2)}>
                {isRecording ? (
                  <LivePanel
                    mode={mode}
                    elapsed={elapsed}
                    level={level}
                    attachPreview={attachPreview}
                    onStop={stop}
                    onStealth={() => setStealth(true)}
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <StartButton
                      onClick={() => start("audio")}
                      disabled={state === "requesting"}
                      icon="mic"
                      title="ভয়েস রেকর্ড"
                      sub="Audio only · discreet"
                      className="bg-national-crimson text-white"
                      tile="bg-white text-national-crimson"
                      glow="var(--color-national-crimson)"
                    />
                    <StartButton
                      onClick={() => start("video")}
                      disabled={state === "requesting"}
                      icon="videocam"
                      title="ভিডিও রেকর্ড"
                      sub="Rear camera + sound"
                      className="bg-text-primary text-white"
                      tile="bg-signal-orange text-text-primary"
                      glow="var(--color-text-primary)"
                    />
                  </div>
                )}
                {state === "requesting" ? (
                  <p className="mt-3 flex items-center gap-2 font-sans text-[0.8125rem] font-semibold">
                    <span className="size-2 animate-pulse rounded-full bg-text-primary" />
                    Waiting for permission — allow microphone access to start.
                  </p>
                ) : null}
              </div>

              {/* The honest limitation, stated before anyone relies on it. */}
              <div className="record-item mt-4 flex items-start gap-3 rounded-2xl bg-text-primary p-4 text-white" style={item(3)}>
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-signal-orange text-text-primary">
                  <Icon name="visibility_off" className="text-[20px]" />
                </span>
                <p className="font-sans text-[0.8125rem] leading-relaxed text-white/85">
                  <strong className="text-signal-orange">Low-profile, not invisible.</strong> Your browser and phone show a recording
                  indicator that no web page can switch off. <em>Stealth screen</em> blacks out the display while recording continues —
                  but assume the indicator can be seen.
                </p>
              </div>

              {recordings.length > 0 ? (
                <div className="record-item mt-5 flex flex-col gap-3" style={item(4)}>
                  <span className="font-mono text-[11px] font-bold tracking-widest uppercase">Saved on this device ({recordings.length})</span>
                  {recordings.map((r) => (
                    <RecordingRow key={r.id} rec={r} onDiscard={discard} />
                  ))}
                </div>
              ) : null}

              {/* Where the evidence goes next. */}
              <div className="record-item mt-5" style={item(5)}>
                <span className="font-mono text-[11px] font-bold tracking-widest uppercase">Then report it</span>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {[
                    { href: "tel:999", icon: "emergency", n: "৯৯৯", label: "Emergency", cls: "bg-national-crimson text-white" },
                    { href: "tel:106", icon: "report", n: "১০৬", label: "Anti-corruption", cls: "bg-bd-green text-white" },
                    { href: "/protibad#file-complaint", icon: "gavel", n: "প্রতিবাদ", label: "File complaint", cls: "bg-text-primary text-white" },
                  ].map((r) => (
                    <a
                      key={r.href}
                      href={r.href}
                      className={cn(
                        "flex flex-col gap-1.5 rounded-2xl p-3 [-webkit-tap-highlight-color:transparent] transition-[translate,scale] duration-200 hover:-translate-y-0.5 active:scale-95 motion-reduce:transition-none",
                        r.cls,
                      )}
                    >
                      <Icon name={r.icon} className="text-[20px]" />
                      <span className="font-bengali text-lg leading-none font-bold">{r.n}</span>
                      <span className="font-sans text-[11px] leading-tight opacity-85">{r.label}</span>
                    </a>
                  ))}
                </div>
              </div>

              <p className="record-item mt-auto flex items-start gap-1.5 pt-5 font-sans text-xs leading-relaxed text-text-primary/80" style={item(6)}>
                <Icon name="info" className="mt-px shrink-0 text-[14px]" />
                <span>
                  Recordings are held in this browser only and are lost if you close the tab without downloading. Consent and recording law
                  varies — check what applies where you are before publishing a recording of another person.
                </span>
              </p>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** A big solid start tile: lifts on hover, presses in on touch. */
function StartButton({
  onClick,
  disabled,
  icon,
  title,
  sub,
  className,
  tile,
  glow,
}: {
  onClick: () => void;
  disabled: boolean;
  icon: string;
  title: string;
  sub: string;
  className: string;
  tile: string;
  glow: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{ "--glow": glow } as CSSProperties}
      className={cn(
        "group flex flex-col items-start gap-3 rounded-3xl p-4 text-left shadow-sm focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none disabled:opacity-60",
        "[-webkit-tap-highlight-color:transparent] touch-manipulation transition-[translate,scale,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[0_20px_36px_-18px_var(--glow)] active:scale-[0.96] active:duration-100 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100",
        className,
      )}
    >
      <span className={cn("grid size-12 place-items-center rounded-2xl transition-transform duration-300 group-hover:-rotate-6 motion-reduce:transition-none", tile)}>
        <Icon name={icon} className="text-[28px]" filled />
      </span>
      <span>
        <span className="block font-bengali text-lg leading-tight font-bold">{title}</span>
        <span className="mt-0.5 block font-sans text-xs opacity-85">{sub}</span>
      </span>
    </button>
  );
}

/** Per-bar weights so the level meter reads as a live waveform, not a slider. */
const BARS = [0.35, 0.6, 0.9, 0.55, 1, 0.7, 0.45, 0.85, 0.5, 0.95, 0.65, 0.4, 0.8, 0.55, 0.9, 0.6, 0.35, 0.75, 1, 0.5];

/** Live recording controls — an ink card with a waveform driven by the mic. */
function LivePanel({
  mode,
  elapsed,
  level,
  attachPreview,
  onStop,
  onStealth,
}: {
  mode: "audio" | "video";
  elapsed: number;
  level: number;
  attachPreview: (el: HTMLVideoElement | null) => void;
  onStop: () => void;
  onStealth: () => void;
}) {
  const amp = Math.min(1, level * 1.6);
  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-text-primary p-4 text-white shadow-[0_24px_44px_-24px_var(--color-national-crimson)] ring-2 ring-national-crimson">
      <div className="flex items-center gap-3">
        <span className="relative flex size-3.5 shrink-0 items-center justify-center">
          <span className="absolute size-3.5 animate-ping rounded-full bg-national-crimson/70 motion-reduce:hidden" />
          <span className="relative size-2.5 rounded-full bg-national-crimson" />
        </span>
        <span className="font-grotesk text-4xl leading-none font-bold text-signal-orange tabular-nums">{formatDuration(elapsed)}</span>
        <span className="ml-auto rounded-full bg-national-crimson px-2.5 py-1 font-mono text-[10px] font-bold tracking-wider uppercase">
          {mode === "audio" ? "Rec · audio" : "Rec · video"}
        </span>
      </div>

      {/* Waveform — proof the microphone is actually picking sound up. */}
      <div
        className="flex h-14 items-center justify-between gap-[3px]"
        role="meter"
        aria-label="Input level"
        aria-valuenow={Math.round(level * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {BARS.map((w, i) => (
          <span
            key={i}
            className={cn("w-full rounded-[3px] transition-[height] duration-75", i % 3 === 0 ? "bg-signal-orange" : i % 3 === 1 ? "bg-bdgreen-500" : "bg-white")}
            style={{ height: `${Math.max(8, amp * w * 100)}%` }}
          />
        ))}
      </div>

      {mode === "video" ? (
        // The callback ref attaches the live stream the moment the element
        // mounts; `srcObject` cannot be passed as a JSX prop.
        <video ref={attachPreview} muted playsInline className="aspect-video w-full rounded-2xl bg-black object-cover" />
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onStop}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-signal-orange px-3 font-grotesk text-sm font-bold text-text-primary uppercase [-webkit-tap-highlight-color:transparent] transition-[scale] duration-150 active:scale-95"
        >
          <Icon name="stop_circle" className="text-[20px]" filled />
          Stop &amp; save
        </button>
        <button
          type="button"
          onClick={onStealth}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-black px-3 font-grotesk text-sm font-bold text-white uppercase ring-1 ring-white/20 [-webkit-tap-highlight-color:transparent] transition-[scale] duration-150 active:scale-95"
        >
          <Icon name="dark_mode" className="text-[18px]" />
          Stealth
        </button>
      </div>
    </div>
  );
}

/**
 * Black screen shown while recording continues.
 *
 * Nothing on it identifies the app. A long-press is needed to leave, so a
 * glance or a fumbled tap does not reveal the recorder.
 */
function StealthScreen({ elapsed, onExit, onStop }: { elapsed: number; onExit: () => void; onStop: () => void }) {
  const [held, setHeld] = useState(0);

  useEffect(() => {
    if (held === 0) return;
    const t = window.setTimeout(onExit, 800);
    return () => window.clearTimeout(t);
  }, [held, onExit]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-black p-6 text-white/25">
      {/* Single dim dot — enough to confirm it is still running, not enough
          to read across a room. */}
      <span className="size-1.5 animate-pulse rounded-full bg-national-crimson/60" />
      <span className="font-mono text-xs tracking-widest tabular-nums">{formatDuration(elapsed)}</span>
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onPointerDown={() => setHeld((h) => h + 1)}
          onPointerUp={() => setHeld(0)}
          onPointerLeave={() => setHeld(0)}
          className="rounded-lg px-6 py-2 font-sans text-xs transition-colors hover:text-white/50"
        >
          hold to exit
        </button>
        <button type="button" onClick={onStop} className="rounded-lg px-6 py-2 font-sans text-xs transition-colors hover:text-national-crimson">
          stop
        </button>
      </div>
    </div>
  );
}

/** One saved recording, on an ink card, with share and download. */
function RecordingRow({ rec, onDiscard }: { rec: Recording; onDiscard: (id: string) => void }) {
  const [shareError, setShareError] = useState<string | null>(null);

  const filename = `kandari-${rec.mode}-${rec.startedAt.replace(/[:.]/g, "-")}.${rec.mimeType.includes("mp4") ? "mp4" : "webm"}`;

  /**
   * Share the file itself where the OS supports it.
   *
   * `navigator.share` with files is the only way a web page can hand a
   * recording to WhatsApp — a wa.me link can carry text but cannot attach a
   * local file. Where that is unavailable, the honest move is to say so and
   * offer the download instead of opening WhatsApp with nothing attached.
   */
  async function share() {
    setShareError(null);
    const file = new File([rec.blob], filename, { type: rec.mimeType });
    const text = `কাণ্ডারী evidence · ${rec.mode} · ${formatDuration(rec.duration)} · ${new Date(rec.startedAt).toLocaleString("en-GB")}${rec.hash ? `\nSHA-256: ${rec.hash.slice(0, 16)}…` : ""}`;

    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text, title: "কাণ্ডারী evidence" });
        return;
      } catch (e) {
        // A user cancelling the share sheet is not an error worth reporting.
        if ((e as DOMException)?.name === "AbortError") return;
      }
    }
    setShareError("This browser cannot attach the file directly. Download it, then attach it in WhatsApp.");
  }

  const action =
    "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 font-sans text-[0.8125rem] font-bold [-webkit-tap-highlight-color:transparent] transition-[scale,background-color] duration-150 active:scale-95";

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-text-primary p-3.5 text-white">
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-signal-orange text-text-primary">
          <Icon name={rec.mode === "audio" ? "mic" : "videocam"} className="text-[20px]" filled />
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="font-grotesk text-[0.9375rem] font-bold">
            {formatDuration(rec.duration)} · {formatSize(rec.sizeBytes)}
          </span>
          <time dateTime={rec.startedAt} className="font-sans text-xs text-white/70">
            {new Date(rec.startedAt).toLocaleString("en-GB")}
          </time>
        </span>
      </div>

      {rec.mode === "audio" ? (
        <audio src={rec.url} controls className="w-full" />
      ) : (
        <video src={rec.url} controls playsInline className="w-full rounded-xl" />
      )}

      {rec.hash ? (
        <span className="rounded-lg bg-black px-2 py-1 font-mono text-[0.6875rem] break-all text-white/70">SHA-256 {rec.hash}</span>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={share} className={cn(action, "bg-bdgreen-500 text-text-primary")}>
          <Icon name="share" className="text-[16px]" />
          Share to WhatsApp
        </button>
        <a href={rec.url} download={filename} className={cn(action, "bg-signal-orange text-text-primary")}>
          <Icon name="download" className="text-[16px]" />
          Download
        </a>
        <a href="/protibad#file-complaint" className={cn(action, "bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20")}>
          <Icon name="gavel" className="text-[16px]" />
          Complaint
        </a>
        <button type="button" onClick={() => onDiscard(rec.id)} className={cn(action, "text-white/70 hover:bg-national-crimson hover:text-white")}>
          <Icon name="delete" className="text-[16px]" />
          Discard
        </button>
      </div>

      {shareError ? (
        <p role="status" className="font-sans text-xs leading-relaxed text-signal-orange">
          {shareError}
        </p>
      ) : null}
    </div>
  );
}
