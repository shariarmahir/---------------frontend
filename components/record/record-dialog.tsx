"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import {
  formatDuration,
  formatSize,
  useRecorder,
  type Recording,
} from "@/components/record/use-recorder";
import { cn } from "@/lib/utils";

/**
 * Evidence recorder.
 *
 * Opens over whatever the user was looking at, so starting a recording is
 * two taps from anywhere on the site.
 *
 * On "spy" recording: a browser cannot do it. Capture requires a permission
 * prompt, and while recording the tab shows a badge and the operating system
 * shows its own indicator. None of that can be suppressed from a web page,
 * and a UI that implied otherwise would be actively unsafe — someone
 * documenting extortion could be caught relying on concealment that was
 * never real. So this is built to be FAST and LOW-PROFILE rather than
 * hidden: one tap to start, and a stealth screen that goes near-black while
 * capture continues, so a glance at the phone shows nothing useful.
 */
export function RecordDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const {
    state,
    mode,
    elapsed,
    error,
    recordings,
    level,
    start,
    stop,
    discard,
    attachPreview,
    isRecording,
  } = useRecorder();
  const [stealth, setStealth] = useState(false);

  // Leaving the dialog while live would keep the camera on with no way to
  // stop it, so closing always stops first.
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={!stealth}
        className={cn(
          "max-w-xl gap-space-md p-0",
          stealth && "border-slate-800 bg-slate-950",
        )}
      >
        {stealth ? (
          <StealthScreen
            elapsed={elapsed}
            onExit={() => setStealth(false)}
            onStop={() => {
              stop();
              setStealth(false);
            }}
          />
        ) : (
          <div className="flex max-h-[85vh] flex-col overflow-y-auto p-space-lg">
            <DialogHeader className="mb-space-md">
              <DialogTitle className="flex items-center gap-space-xs font-display text-headline-sm font-extrabold text-slate-900">
                <Icon
                  name="radio_button_checked"
                  className="text-[20px] text-crimson"
                  filled
                />
                প্রমাণ রেকর্ড
              </DialogTitle>
              <DialogDescription className="font-sans text-body-sm text-slate-600">
                Record audio or video as evidence of extortion, a bribe demand
                or harassment. Files stay on this device until you share them.
              </DialogDescription>
            </DialogHeader>

            {/* The honest limitation, stated before anyone relies on it. */}
            <p className="mb-space-md flex items-start gap-1.5 rounded-lg border border-amber-300 bg-amber-50 p-space-sm font-sans text-[0.8125rem] leading-relaxed text-amber-900">
              <Icon name="visibility" className="mt-px shrink-0 text-[15px]" />
              <span>
                <strong>This cannot record secretly.</strong> Your browser and
                phone both show a recording indicator that a web page cannot
                switch off. Use <em>Stealth screen</em> to darken the display
                while recording continues — but assume the indicator is visible
                to anyone looking at your phone.
              </span>
            </p>

            {error ? (
              <p
                role="alert"
                className="mb-space-md flex items-start gap-1.5 rounded-lg border border-crimson/30 bg-red-50 p-space-sm font-sans text-[0.8125rem] leading-relaxed text-crimson"
              >
                <Icon name="error" className="mt-px shrink-0 text-[15px]" />
                {error}
              </p>
            ) : null}

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
              <div className="flex flex-col gap-space-sm sm:flex-row">
                <button
                  type="button"
                  onClick={() => start("audio")}
                  disabled={state === "requesting"}
                  className="flex flex-1 flex-col items-center gap-1.5 rounded-xl border-2 border-crimson bg-crimson px-space-md py-space-lg text-white transition-colors hover:bg-red-700 disabled:opacity-60"
                >
                  <Icon name="mic" className="text-[32px]" filled />
                  <span className="font-display text-label-md font-bold">
                    ভয়েস রেকর্ড
                  </span>
                  <span className="font-sans text-[0.75rem] opacity-90">
                    Audio only · discreet
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => start("video")}
                  disabled={state === "requesting"}
                  className="flex flex-1 flex-col items-center gap-1.5 rounded-xl border-2 border-border bg-white px-space-md py-space-lg text-slate-900 transition-colors hover:border-slate-400 disabled:opacity-60"
                >
                  <Icon name="videocam" className="text-[32px]" filled />
                  <span className="font-display text-label-md font-bold">
                    ভিডিও রেকর্ড
                  </span>
                  <span className="font-sans text-[0.75rem] text-slate-600">
                    Rear camera + sound
                  </span>
                </button>
              </div>
            )}

            {state === "requesting" ? (
              <p className="mt-space-sm font-sans text-[0.8125rem] text-slate-600">
                Waiting for permission — allow microphone access to start.
              </p>
            ) : null}

            {recordings.length > 0 ? (
              <div className="mt-space-lg flex flex-col gap-space-sm border-t border-border pt-space-md">
                <span className="font-sans text-[0.75rem] font-semibold tracking-wider text-slate-500 uppercase">
                  Saved on this device ({recordings.length})
                </span>
                {recordings.map((r) => (
                  <RecordingRow key={r.id} rec={r} onDiscard={discard} />
                ))}
              </div>
            ) : null}

            <p className="mt-space-md flex items-start gap-1.5 font-sans text-[0.75rem] leading-relaxed text-slate-500">
              <Icon name="info" className="mt-px shrink-0 text-[14px]" />
              <span>
                Recordings are held in this browser only and are lost if you
                close the tab without downloading. Consent and recording law
                varies — check what applies where you are before publishing a
                recording of another person.
              </span>
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Live recording controls. */
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
  return (
    <div className="flex flex-col gap-space-md rounded-xl border-2 border-crimson bg-red-50/40 p-space-md">
      <div className="flex items-center gap-space-sm">
        <span className="relative flex size-3 shrink-0 items-center justify-center">
          <span className="absolute size-3 animate-ping rounded-full bg-crimson/60" />
          <span className="relative size-2 rounded-full bg-crimson" />
        </span>
        <span className="font-display text-[1.75rem] leading-none font-extrabold tabular-nums text-slate-900">
          {formatDuration(elapsed)}
        </span>
        <span className="font-sans text-[0.8125rem] font-semibold text-crimson uppercase">
          {mode === "audio" ? "Recording audio" : "Recording video"}
        </span>
      </div>

      {/* Level meter — proof the microphone is actually picking sound up. */}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-slate-200"
        role="meter"
        aria-label="Input level"
        aria-valuenow={Math.round(level * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-crimson transition-[width] duration-75"
          style={{ width: `${Math.min(100, level * 140)}%` }}
        />
      </div>

      {mode === "video" ? (
        // The callback ref attaches the live stream the moment the element
        // mounts; `srcObject` cannot be passed as a JSX prop.
        <video
          ref={attachPreview}
          muted
          playsInline
          className="aspect-video w-full rounded-lg bg-slate-900 object-cover"
        />
      ) : null}

      <div className="flex flex-col gap-space-xs sm:flex-row">
        <button
          type="button"
          onClick={onStop}
          className="inline-flex h-11 flex-1 items-center justify-center gap-space-xs rounded-lg bg-slate-900 px-space-md font-sans text-label-md font-bold text-white transition-colors hover:bg-slate-800"
        >
          <Icon name="stop_circle" className="text-[20px]" filled />
          Stop and save
        </button>
        <button
          type="button"
          onClick={onStealth}
          className="inline-flex h-11 items-center justify-center gap-space-xs rounded-lg border border-slate-700 bg-slate-800 px-space-md font-sans text-label-md font-bold text-white transition-colors hover:bg-slate-700"
        >
          <Icon name="dark_mode" className="text-[18px]" />
          Stealth screen
        </button>
      </div>
    </div>
  );
}

/**
 * Near-black screen shown while recording continues.
 *
 * Nothing on it identifies the app. A long-press is needed to leave, so a
 * glance or a fumbled tap does not reveal the recorder.
 */
function StealthScreen({
  elapsed,
  onExit,
  onStop,
}: {
  elapsed: number;
  onExit: () => void;
  onStop: () => void;
}) {
  const [held, setHeld] = useState(0);

  useEffect(() => {
    if (held === 0) return;
    const t = window.setTimeout(onExit, 800);
    return () => window.clearTimeout(t);
  }, [held, onExit]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-space-lg bg-slate-950 p-space-lg text-slate-700">
      {/* Single dim dot — enough to confirm it is still running, not enough
          to read across a room. */}
      <span className="size-1.5 animate-pulse rounded-full bg-crimson/70" />
      <span className="font-code-telemetry text-[0.75rem] tracking-widest tabular-nums text-slate-600">
        {formatDuration(elapsed)}
      </span>
      <div className="flex flex-col items-center gap-space-sm">
        <button
          type="button"
          onPointerDown={() => setHeld((h) => h + 1)}
          onPointerUp={() => setHeld(0)}
          onPointerLeave={() => setHeld(0)}
          className="rounded-lg px-space-lg py-space-sm font-sans text-[0.75rem] text-slate-700 transition-colors hover:text-slate-500"
        >
          hold to exit
        </button>
        <button
          type="button"
          onClick={onStop}
          className="rounded-lg px-space-lg py-space-sm font-sans text-[0.75rem] text-slate-700 transition-colors hover:text-crimson"
        >
          stop
        </button>
      </div>
    </div>
  );
}

/** One saved recording, with share and download. */
function RecordingRow({
  rec,
  onDiscard,
}: {
  rec: Recording;
  onDiscard: (id: string) => void;
}) {
  const [shareError, setShareError] = useState<string | null>(null);

  const filename = `kandari-${rec.mode}-${rec.startedAt.replace(/[:.]/g, "-")}.${
    rec.mimeType.includes("mp4") ? "mp4" : "webm"
  }`;

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
        await navigator.share({
          files: [file],
          text,
          title: "কাণ্ডারী evidence",
        });
        return;
      } catch (e) {
        // A user cancelling the share sheet is not an error worth reporting.
        if ((e as DOMException)?.name === "AbortError") return;
      }
    }
    setShareError(
      "This browser cannot attach the file directly. Download it, then attach it in WhatsApp.",
    );
  }

  return (
    <div className="flex flex-col gap-space-sm rounded-lg border border-border bg-white p-space-sm">
      <div className="flex items-center gap-space-sm">
        <Icon
          name={rec.mode === "audio" ? "mic" : "videocam"}
          className="shrink-0 text-[20px] text-slate-500"
          filled
        />
        <span className="flex min-w-0 flex-col">
          <span className="font-display text-[0.9375rem] font-bold text-slate-900">
            {formatDuration(rec.duration)} · {formatSize(rec.sizeBytes)}
          </span>
          <time
            dateTime={rec.startedAt}
            className="font-sans text-[0.75rem] text-slate-500"
          >
            {new Date(rec.startedAt).toLocaleString("en-GB")}
          </time>
        </span>
      </div>

      {rec.mode === "audio" ? (
        <audio src={rec.url} controls className="w-full" />
      ) : (
        <video
          src={rec.url}
          controls
          playsInline
          className="w-full rounded-lg"
        />
      )}

      {rec.hash ? (
        <span className="rounded-md bg-slate-50 px-space-xs py-1 font-code-telemetry text-[0.6875rem] break-all text-slate-600">
          SHA-256 {rec.hash}
        </span>
      ) : null}

      <div className="flex flex-wrap gap-space-xs">
        <button
          type="button"
          onClick={share}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#25D366] px-space-md font-sans text-[0.8125rem] font-bold text-white transition-opacity hover:opacity-90"
        >
          <Icon name="share" className="text-[16px]" />
          Share to WhatsApp
        </button>
        <a
          href={rec.url}
          download={filename}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-white px-space-md font-sans text-[0.8125rem] font-semibold text-slate-700 transition-colors hover:border-slate-400"
        >
          <Icon name="download" className="text-[16px]" />
          Download
        </a>
        <a
          href="/protibad#file-complaint"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-white px-space-md font-sans text-[0.8125rem] font-semibold text-slate-700 transition-colors hover:border-slate-400"
        >
          <Icon name="gavel" className="text-[16px]" />
          File a complaint
        </a>
        <button
          type="button"
          onClick={() => onDiscard(rec.id)}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-white px-space-sm font-sans text-[0.8125rem] font-semibold text-slate-500 transition-colors hover:border-crimson hover:text-crimson"
        >
          <Icon name="delete" className="text-[16px]" />
          Discard
        </button>
      </div>

      {shareError ? (
        <p
          role="status"
          className="font-sans text-[0.75rem] leading-relaxed text-amber-800"
        >
          {shareError}
        </p>
      ) : null}
    </div>
  );
}
