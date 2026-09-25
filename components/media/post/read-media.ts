"use client";

import { bnDigits } from "@/lib/media/format";

/**
 * Turn a picked file into something a post can keep without a server: a
 * downscaled JPEG data URL (photos) or a poster frame plus duration
 * (videos). Swap for real uploads to storage when a backend exists.
 */

const MAX_SIDE = 1080;
const QUALITY = 0.78;

function toJpeg(source: CanvasImageSource, width: number, height: number): string {
  const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", QUALITY);
}

export async function readPhoto(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  try {
    return toJpeg(bitmap, bitmap.width, bitmap.height);
  } finally {
    bitmap.close();
  }
}

function clock(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return bnDigits(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`);
}

/** A poster frame from about a third of the way in, and the length. */
export function readVideo(file: File): Promise<{ poster: string; duration: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";
    const done = (fn: () => void) => {
      URL.revokeObjectURL(url);
      fn();
    };
    video.onerror = () => done(() => reject(new Error("video")));
    video.onloadedmetadata = () => {
      video.currentTime = Math.min(Math.max(0.1, video.duration / 3), 5);
    };
    video.onseeked = () => {
      try {
        const poster = toJpeg(video, video.videoWidth, video.videoHeight);
        done(() => resolve({ poster, duration: clock(video.duration) }));
      } catch (e) {
        done(() => reject(e));
      }
    };
    video.src = url;
  });
}
