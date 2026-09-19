"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type RecordMode = "audio" | "video";
export type RecorderState = "idle" | "requesting" | "recording" | "stopped";

export interface Recording {
  id: string;
  mode: RecordMode;
  blob: Blob;
  url: string;
  /** Seconds. */
  duration: number;
  startedAt: string;
  sizeBytes: number;
  mimeType: string;
  /** SHA-256 of the file, so tampering after the fact is detectable. */
  hash: string | null;
}

/**
 * Pick a container the browser will actually produce.
 *
 * Safari has no webm support and silently records nothing if handed an
 * unsupported mimeType, so the list is probed rather than assumed.
 */
function pickMimeType(mode: RecordMode): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates =
    mode === "audio"
      ? ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"]
      : [
          "video/webm;codecs=vp9,opus",
          "video/webm;codecs=vp8,opus",
          "video/webm",
          "video/mp4",
        ];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t));
}

/**
 * SHA-256 of the recording.
 *
 * Evidence is worth more if its integrity can be shown. `crypto.subtle` is
 * only available in a secure context, so this returns null over plain HTTP
 * rather than throwing.
 */
async function hashBlob(blob: Blob): Promise<string | null> {
  try {
    if (!crypto?.subtle) return null;
    const buf = await blob.arrayBuffer();
    const digest = await crypto.subtle.digest("SHA-256", buf);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    return null;
  }
}

/**
 * Microphone / camera recorder built on MediaRecorder.
 *
 * Deliberately NOT covert. A browser cannot record without a permission
 * prompt and a visible indicator (tab badge, OS dot), and no amount of UI
 * hides that. Pretending otherwise would be dangerous: someone documenting
 * extortion might rely on concealment that does not exist. What this does
 * instead is make recording fast, one-tap, and low-visibility on screen.
 *
 * TODO(native): true background capture needs a packaged mobile app with OS
 * permissions — Capacitor or React Native — not a web page.
 */
export function useRecorder() {
  const [state, setState] = useState<RecorderState>("idle");
  const [mode, setMode] = useState<RecordMode>("audio");
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  /** Live input level 0–1, so the UI can show the mic is actually hearing. */
  const [level, setLevel] = useState(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number>(0);
  const tickRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  /** Release every device handle. Leaving one open keeps the OS dot lit. */
  const teardown = useCallback(() => {
    if (tickRef.current !== null) window.clearInterval(tickRef.current);
    tickRef.current = null;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    recorderRef.current = null;
    setLevel(0);
  }, []);

  // Stop the hardware if the component goes away mid-recording.
  useEffect(() => teardown, [teardown]);

  /** Drive the level meter from the live stream. */
  const meter = useCallback((stream: MediaStream) => {
    try {
      const Ctx =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new Ctx();
      audioCtxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const loop = () => {
        analyser.getByteTimeDomainData(data);
        let peak = 0;
        for (const v of data) peak = Math.max(peak, Math.abs(v - 128) / 128);
        setLevel(peak);
        rafRef.current = requestAnimationFrame(loop);
      };
      loop();
    } catch {
      // Metering is a nicety; recording continues without it.
    }
  }, []);

  const start = useCallback(
    async (nextMode: RecordMode) => {
      setError(null);
      setMode(nextMode);
      setState("requesting");

      if (!navigator.mediaDevices?.getUserMedia) {
        setError(
          "This browser cannot access the microphone or camera. Try Chrome or Safari on your phone.",
        );
        setState("idle");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia(
          nextMode === "audio"
            ? { audio: true }
            : {
                audio: true,
                // Rear camera where there is one — you point a phone at
                // what is happening, not at yourself.
                video: { facingMode: { ideal: "environment" } },
              },
        );
        streamRef.current = stream;

        const mimeType = pickMimeType(nextMode);
        const rec = new MediaRecorder(
          stream,
          mimeType ? { mimeType } : undefined,
        );
        recorderRef.current = rec;
        chunksRef.current = [];

        rec.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        rec.onstop = async () => {
          const type = rec.mimeType || mimeType || "application/octet-stream";
          const blob = new Blob(chunksRef.current, { type });
          const duration = Math.round(
            (Date.now() - startedAtRef.current) / 1000,
          );
          const hash = await hashBlob(blob);
          setRecordings((prev) => [
            {
              id: `r-${startedAtRef.current}`,
              mode: nextMode,
              blob,
              url: URL.createObjectURL(blob),
              duration,
              startedAt: new Date(startedAtRef.current).toISOString(),
              sizeBytes: blob.size,
              mimeType: type,
              hash,
            },
            ...prev,
          ]);
          teardown();
          setState("stopped");
        };

        startedAtRef.current = Date.now();
        setElapsed(0);
        // A timeslice means chunks land periodically, so a crash or a killed
        // tab still leaves most of the recording recoverable.
        rec.start(1000);
        setState("recording");
        tickRef.current = window.setInterval(
          () =>
            setElapsed(Math.round((Date.now() - startedAtRef.current) / 1000)),
          500,
        );
        meter(stream);
      } catch (e) {
        teardown();
        setState("idle");
        const name = (e as DOMException)?.name;
        setError(
          name === "NotAllowedError"
            ? "Permission was refused. Recording needs microphone access — check the site permissions in your browser."
            : name === "NotFoundError"
              ? "No microphone or camera was found on this device."
              : "Recording could not start on this device.",
        );
      }
    },
    [meter, teardown],
  );

  const stop = useCallback(() => {
    const rec = recorderRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
    else {
      teardown();
      setState("stopped");
    }
  }, [teardown]);

  const discard = useCallback((id: string) => {
    setRecordings((prev) => {
      const gone = prev.find((r) => r.id === id);
      if (gone) URL.revokeObjectURL(gone.url);
      return prev.filter((r) => r.id !== id);
    });
  }, []);

  /**
   * Attach the live stream to a <video> for preview.
   *
   * `srcObject` cannot be set as a JSX prop, so the element is handed over
   * once it exists. Muted, or the speaker feeds straight back into the mic.
   */
  const attachPreview = useCallback((el: HTMLVideoElement | null) => {
    if (!el || !streamRef.current) return;
    el.srcObject = streamRef.current;
    el.muted = true;
    el.play().catch(() => {});
  }, []);

  return {
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
    isRecording: state === "recording",
  };
}

/** "01:23" from seconds. */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Human file size. */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
