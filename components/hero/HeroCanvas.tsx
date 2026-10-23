'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { MobileFilmStrip } from './MobileFilmStrip';
import { useMediaQuery, useIsMobile } from './useMediaQuery';
import type { TileData } from './collage-layout';

/**
 * The collage hero, loaded client-side only.
 *
 * The static collage is painted first so the hero never flashes empty, then
 * the WebGL canvas fades in over it once the tiles are ready. If WebGL is
 * unavailable, or the visitor prefers reduced motion, the static collage
 * stays and nothing animates.
 */

const HERO_ALT = 'Collage of everyday life and history in Bangladesh';

interface HeroCanvasProps {
  /** True once the text overlay has resolved (12s in). */
  onPhaseChange?: (phase: string) => void;
}

function hasWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl2') || canvas.getContext('webgl')),
    );
  } catch {
    return false;
  }
}

export function HeroCanvas({ onPhaseChange }: HeroCanvasProps) {
  const [tiles, setTiles] = useState<TileData[]>([]);
  const [manifestLoaded, setManifestLoaded] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // The manifest the slicer writes.
  useEffect(() => {
    let cancelled = false;
    fetch('/hero/tiles.json', { cache: 'no-cache' })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: TileData[]) => {
        if (cancelled) return;
        setTiles(Array.isArray(data) ? data : []);
        setManifestLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        setManifestLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Device and preference checks.
  const isMobile = useIsMobile();
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  // Pause the render loop when the hero is off screen.
  useEffect(() => {
    const element = document.getElementById("hero-canvas");
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const handleReady = useCallback(() => setCanvasReady(true), []);

  const showStatic = reducedMotion || webglFailed || !manifestLoaded;

  // ── Reduced motion or no WebGL: the collage, flat. ─────────────
  if (showStatic) {
    return (
      <div className="relative h-full w-full bg-black">
        <Image
          src="/hero/CREATEDhero.jpg"
          alt={HERO_ALT}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {reducedMotion ? null : null}
      </div>
    );
  }

  // ── Mobile: the film strip. ─────────────────────────────────────
  if (isMobile) {
    return (
      <div className="relative h-full w-full bg-black">
        <MobileFilmStrip tiles={tiles} />
      </div>
    );
  }

  // ── Desktop: the WebGL scene. ───────────────────────────────────
  return (
    <div className="relative h-full w-full bg-black">
      {/* The collage sits underneath until the canvas is ready. */}
      <div
        className="absolute inset-0 transition-opacity duration-1000 ease-out"
        style={{ opacity: canvasReady ? 0 : 1 }}
        aria-hidden="true"
      >
        <Image
          src="/hero/CREATEDhero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <div
        className="absolute inset-0 transition-opacity duration-1000 ease-out"
        style={{ opacity: canvasReady ? 1 : 0 }}
      >
        <HeroSceneLoader
          tiles={tiles}
          isVisible={isVisible}
          onReady={handleReady}
          onPhaseChange={onPhaseChange}
          onFailure={() => setWebglFailed(true)}
        />
      </div>
    </div>
  );
}

/**
 * The canvas is imported with `ssr: false` so three.js never touches the
 * server. It lives in its own module to keep the dynamic import boundary
 * clean.
 */
function HeroSceneLoader({
  tiles,
  isVisible,
  onReady,
  onPhaseChange,
  onFailure,
}: {
  tiles: TileData[];
  isVisible: boolean;
  onReady: () => void;
  onPhaseChange?: (phase: string) => void;
  onFailure: () => void;
}) {
  const [Scene, setScene] = useState<null | typeof import("./CollageScene").CollageScene>(
    null,
  );

  useEffect(() => {
    if (!hasWebGL()) {
      onFailure();
      return;
    }
    let cancelled = false;
    import("./CollageScene")
      .then((module) => {
        if (!cancelled) setScene(() => module.CollageScene);
      })
      .catch(() => {
        if (!cancelled) onFailure();
      });
    return () => {
      cancelled = true;
    };
  }, [onFailure]);

  if (!Scene) return null;

  return (
    <Scene
      tiles={tiles}
      isMobile={false}
      isVisible={isVisible}
      onReady={onReady}
      onPhaseChange={onPhaseChange}
    />
  );
}
