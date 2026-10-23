'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * The hero's single master clock.
 *
 * Everything in the scene — the pixel intro, the tile reveal, the camera
 * pan, the settle and the idle drift — reads from this one number, so the
 * whole thing can be paused (tab hidden, hero scrolled away) and resumed
 * from exactly where it stopped. The clock is advanced by the render loop
 * in `CollageScene`, never by `setTimeout`, so it cannot drift away from
 * what is actually on screen.
 */
export interface HeroClock {
  /** Seconds since the timeline started. */
  time: number;
  /** Length of the scripted part, in seconds. */
  duration: number;
  playing: boolean;
  /** Name of the phase the clock is currently inside. */
  phase: HeroPhaseName;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seek: (seconds: number) => void;
  /** Advance the clock. Called once per frame by the render loop. */
  advance: (delta: number) => void;
}

export type HeroPhaseName =
  | 'pixel-intro'
  | 'tile-reveal'
  | 'camera-pan'
  | 'settle'
  | 'idle';

/** Phase boundaries, in seconds. The idle phase is open-ended. */
export const PHASES: ReadonlyArray<{ name: HeroPhaseName; start: number; end: number }> = [
  { name: 'pixel-intro', start: 0, end: 2.5 },
  { name: 'tile-reveal', start: 2.5, end: 5 },
  { name: 'camera-pan', start: 5, end: 12 },
  { name: 'settle', start: 12, end: 14 },
  { name: 'idle', start: 14, end: Number.POSITIVE_INFINITY },
];

export const SCRIPTED_DURATION = 14;

/** The reveal easing from the brief: cubic-bezier(0.22, 1, 0.36, 1). */
export const REVEAL_EASE = (t: number) => {
  // Equivalent to the CSS curve, sampled: fast out, long settle.
  return 1 - Math.pow(1 - t, 3);
};

export const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export function phaseAt(time: number): HeroPhaseName {
  for (const phase of PHASES) {
    if (time >= phase.start && time < phase.end) return phase.name;
  }
  return 'idle';
}

export function useHeroTimeline(options: { autoPlay?: boolean } = {}) {
  const { autoPlay = true } = options;
  const timeRef = useRef(0);
  const playingRef = useRef(autoPlay);
  const [playing, setPlaying] = useState(autoPlay);
  const [phase, setPhase] = useState<HeroPhaseName>('pixel-intro');

  const play = useCallback(() => {
    playingRef.current = true;
    setPlaying(true);
  }, []);

  const pause = useCallback(() => {
    playingRef.current = false;
    setPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    playingRef.current = !playingRef.current;
    setPlaying(playingRef.current);
  }, []);

  const seek = useCallback((seconds: number) => {
    timeRef.current = Math.max(0, seconds);
    setPhase(phaseAt(timeRef.current));
  }, []);

  const advance = useCallback((delta: number) => {
    if (!playingRef.current) return;
    // The idle phase loops forever, so the clock keeps counting there too.
    timeRef.current += delta;
    const next = phaseAt(timeRef.current);
    setPhase((prev) => (prev === next ? prev : next));
  }, []);

  // Pause when the tab is hidden, resume when it comes back.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) pause();
      else if (autoPlay) play();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [pause, play, autoPlay]);

  const clock = useMemo<HeroClock>(
    () => ({
      get time() {
        return timeRef.current;
      },
      duration: SCRIPTED_DURATION,
      playing,
      phase,
      play,
      pause,
      toggle,
      seek,
      advance,
    }),
    [playing, phase, play, pause, toggle, seek, advance],
  );

  return { clock, phase, playing, play, pause, toggle, seek };
}
