"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { LiveChannel } from "@/lib/tv-wall/server";
import { cn } from "@/lib/utils";
import { Empty } from "./panel";

export const VIDEO_ID = /^[\w-]{11}$/;
export const isLive = (c: LiveChannel) => Boolean(c.videoId && VIDEO_ID.test(c.videoId));

/**
 * Bangladeshi news channels that are live on YouTube right now, one on the
 * player at a time. Wide screens start the stream muted once the player is
 * in view; phones wait for a tap, so nobody's data goes on video they did
 * not ask for. Channels that are off air are shown but cannot be chosen.
 * `suspended` stops the stream (e.g. while another view covers it).
 */
export function LiveTv({
  channels,
  large,
  suspended,
  chosen: chosenProp,
  onChoose,
}: {
  channels: LiveChannel[];
  large?: boolean;
  suspended?: boolean;
  chosen?: string | null;
  onChoose?: (id: string) => void;
}) {
  const live = channels.filter(isLive);
  const [chosenOwn, setChosenOwn] = useState<string | null>(null);
  const chosen = chosenProp ?? chosenOwn;
  const [playing, setPlaying] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const current = live.find((c) => c.id === chosen) ?? live[0];

  useEffect(() => {
    if (playing || !box.current || !window.matchMedia("(min-width: 1024px)").matches) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setPlaying(true);
        io.disconnect();
      }
    });
    io.observe(box.current);
    return () => io.disconnect();
  }, [playing]);

  if (!current) return <Empty icon="tv_off" title="No channel is live right now" body="Channels appear here on their own as soon as they go live again." />;

  const choose = (id: string) => {
    setChosenOwn(id);
    onChoose?.(id);
    setPlaying(true);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={box} className={cn("relative aspect-video w-full bg-black", large && "rounded-xl overflow-hidden")}>
        {playing && !suspended ? (
          <iframe
            key={current.videoId}
            src={`https://www.youtube-nocookie.com/embed/${current.videoId}?autoplay=1&mute=1&playsinline=1&rel=0`}
            title={`${current.name} live`}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 size-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 flex flex-col items-center justify-center gap-3 bg-text-primary text-white focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none focus-visible:ring-inset"
          >
            <span className="grid size-16 place-items-center rounded-full bg-signal-orange text-text-primary transition-transform duration-300 group-hover:scale-105 group-active:scale-95">
              <Icon name="play_arrow" filled className="text-4xl!" />
            </span>
            <span className="font-sans text-base font-semibold">Play {current.name}</span>
            <span className="font-sans text-xs text-white/60">Starts muted · uses mobile data</span>
          </button>
        )}
      </div>

      <div role="radiogroup" aria-label="Channel" className="flex flex-wrap gap-1.5 px-5 py-3">
        {channels.map((c) => {
          const on = isLive(c);
          const selected = current.id === c.id;
          return (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={!on}
              onClick={() => choose(c.id)}
              title={on ? c.name : `${c.name}: not live right now`}
              className={cn(
                "inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 font-sans text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none",
                selected ? "bg-signal-orange text-text-primary" : on ? "bg-black/35 text-white hover:bg-black/55" : "cursor-not-allowed bg-black/20 text-white/40",
              )}
            >
              <span aria-hidden className={cn("size-1.5 rounded-full", on ? (selected ? "bg-text-primary" : "bg-signal-orange") : "bg-white/30")} />
              {c.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
