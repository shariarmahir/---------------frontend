"use client";

import { useEffect, type RefObject } from "react";
import { filmRegion, navyShare, nextTone, type Tone } from "@/lib/motherland-film-tone";

const COPY_WIDTH = 96;
const READ_EVERY_MS = 600;
const COLOUR: Record<Tone, string> = { navy: "var(--color-ml-navy)", gold: "var(--color-signal-orange)", white: "#fff" };

/**
 * Colours an element navy where the hero film behind it is bright, and `dark` where it isn't,
 * reading the film or its poster while it has no frame. A class on the element sets how
 * slowly the colour changes.
 */
export function useFilmInk(ref: RefObject<HTMLElement | null>, active: boolean, dark: Tone = "gold") {
  useEffect(() => {
    const el = ref.current;
    const video = document.querySelector<HTMLVideoElement>("#top video");
    const canvas = document.createElement("canvas");
    const copy = canvas.getContext("2d", { willReadFrequently: true });
    if (!active || !el || !video || !copy) return;

    const still = new Image();
    let tone: Tone = "gold";

    const read = () => {
      const film = video.getBoundingClientRect();
      if (document.hidden || film.bottom < 0) return;
      const ready = video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;
      const source = ready ? { width: video.videoWidth, height: video.videoHeight } : { width: still.naturalWidth, height: still.naturalHeight };
      if (!source.width) return;
      canvas.width = COPY_WIDTH;
      canvas.height = Math.round((COPY_WIDTH * source.height) / source.width);
      copy.drawImage(ready ? video : still, 0, 0, canvas.width, canvas.height);
      const area = filmRegion(el.getBoundingClientRect(), film, source, canvas);
      tone = nextTone(tone, navyShare(copy.getImageData(area.left, area.top, area.width, area.height).data));
      el.style.color = COLOUR[tone === "navy" ? "navy" : dark];
    };

    still.onload = read;
    still.src = video.poster;
    const timer = setInterval(read, READ_EVERY_MS);
    return () => {
      clearInterval(timer);
      el.style.color = "";
    };
  }, [ref, active, dark]);
}
