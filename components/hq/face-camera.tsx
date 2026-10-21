"use client";

import { Camera, CameraOff, Loader2, ScanFace } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { hb } from "./kit";

/**
 * The front camera and the face check (face-api, models in /public/hq/models,
 * MIT). It turns the face it sees into a 128-number signature in the
 * browser; only those numbers go to the server, never a picture. "verify"
 * hands back one signature; "enroll" collects three steady captures a moment
 * apart. The camera turns off the moment this unmounts.
 */
type FaceApi = typeof import("@vladmandic/face-api");

let modelsReady: Promise<FaceApi> | null = null;
function loadModels(): Promise<FaceApi> {
  modelsReady ??= (async () => {
    const faceapi = await import("@vladmandic/face-api");
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/hq/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/hq/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/hq/models"),
    ]);
    return faceapi;
  })().catch((e) => {
    modelsReady = null;
    throw e;
  });
  return modelsReady;
}

type Phase = "idle" | "loading" | "looking" | "done" | "error";

export function FaceCamera({
  mode,
  onResult,
  busy,
  className,
}: {
  mode: "verify" | "enroll";
  /** verify: [descriptor]; enroll: three descriptors. */
  onResult: (descriptors: number[][]) => void;
  /** The parent is checking the result with the server. */
  busy?: boolean;
  className?: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState("Turn on the camera to start the face check.");
  const [count, setCount] = useState(0);
  const [run, setRun] = useState(0);
  const need = mode === "enroll" ? 3 : 1;

  useEffect(() => {
    if (run === 0) return;
    let stop = false;
    let timer: ReturnType<typeof setTimeout>;
    const captures: number[][] = [];

    (async () => {
      try {
        const [faceapi, media] = await Promise.all([
          loadModels(),
          navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }, audio: false }),
        ]);
        if (stop) {
          media.getTracks().forEach((t) => t.stop());
          return;
        }
        stream.current = media;
        const el = video.current!;
        el.srcObject = media;
        await el.play();
        setPhase("looking");
        setMessage(mode === "enroll" ? "Look straight ahead with light on your face." : "Look straight at the camera.");
        const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.55 });

        const look = async () => {
          if (stop) return;
          const found = await faceapi.detectSingleFace(el, options).withFaceLandmarks().withFaceDescriptor();
          if (stop) return;
          if (!found) {
            setMessage("No face in view. Move into the middle of the frame.");
          } else if (found.detection.score < 0.7) {
            setMessage("Come a little closer and face the light.");
          } else {
            captures.push(Array.from(found.descriptor));
            setCount(captures.length);
            if (captures.length >= need) {
              setPhase("done");
              setMessage("Face captured. Checking…");
              media.getTracks().forEach((t) => t.stop());
              onResult(captures.slice(0, need));
              return;
            }
            setMessage(`Good! ${need - captures.length} more — turn your head slightly.`);
            timer = setTimeout(look, 900);
            return;
          }
          timer = setTimeout(look, 350);
        };
        look();
      } catch (e) {
        if (stop) return;
        const name = (e as DOMException)?.name;
        setPhase("error");
        setMessage(
          name === "NotAllowedError"
            ? "Camera access was blocked. Allow it from the camera icon beside the address bar."
            : name === "NotFoundError"
              ? "No camera was found."
              : "The face check couldn't start. Reload the page and try again.",
        );
      }
    })();

    return () => {
      stop = true;
      clearTimeout(timer);
      stream.current?.getTracks().forEach((t) => t.stop());
      stream.current = null;
    };
  }, [run, mode, need, onResult]);

  const start = () => {
    setPhase("loading");
    setCount(0);
    setMessage("Starting the camera and face model…");
    setRun((r) => r + 1);
  };

  const scanning = phase === "looking";
  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="relative grid size-56 place-items-center sm:size-64">
        <div className={cn("absolute inset-0 rounded-full ring-2", scanning ? "ring-signal-orange" : phase === "error" ? "ring-national-crimson" : "ring-white/20")} />
        {scanning ? <div aria-hidden className="hq-scan absolute inset-0 rounded-full border-2 border-transparent border-t-signal-orange" /> : null}
        <div className="absolute inset-2 overflow-hidden rounded-full bg-text-primary">
          <video ref={video} muted playsInline className={cn("size-full -scale-x-100 object-cover", phase === "looking" || phase === "done" ? "opacity-100" : "opacity-0")} />
        </div>
        {phase === "idle" || phase === "error" ? (
          phase === "error" ? <CameraOff aria-hidden className="relative size-12 text-crimson-bright" /> : <ScanFace aria-hidden className="relative size-14 text-signal-orange" />
        ) : null}
        {phase === "loading" || busy ? <Loader2 aria-hidden className="relative size-10 animate-spin text-signal-orange motion-reduce:animate-none" /> : null}
      </div>

      {mode === "enroll" ? (
        <div className="flex gap-2" aria-label={`${count} of 3 captures`}>
          {[0, 1, 2].map((i) => (
            <span key={i} className={cn("h-1.5 w-10 rounded-full transition-colors", i < count ? "bg-signal-orange" : "bg-white/15")} />
          ))}
        </div>
      ) : null}

      <p role="status" aria-live="polite" className={cn("min-h-10 max-w-xs text-center text-sm leading-relaxed", phase === "error" ? "text-crimson-bright" : "text-white/80")}>
        {message}
      </p>

      {phase === "idle" || phase === "error" ? (
        <button type="button" onClick={start} className={hb.gold}>
          <Camera aria-hidden className="size-4" /> {phase === "error" ? "Try again" : "Turn on camera"}
        </button>
      ) : null}
      <p className="max-w-xs text-center text-xs leading-relaxed text-white/50">No photo leaves your device: only a 128-number face signature is sent to check it.</p>
    </div>
  );
}
