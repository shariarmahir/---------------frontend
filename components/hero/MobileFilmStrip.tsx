'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { TileData } from './collage-layout';

interface MobileFilmStripProps {
  tiles: TileData[];
}

const ADVANCE_MS = 3000;

/**
 * The mobile hero: a horizontal 3D film strip of the collage tiles.
 *
 * One tile sits large in the middle, its neighbours sit slightly smaller
 * and rotated away, so the strip reads as a physical row of prints rather
 * than a flat carousel. It auto-advances every three seconds and can also
 * be swiped, and it snaps to whichever tile is nearest.
 */
export function MobileFilmStrip({ tiles }: MobileFilmStripProps) {
  const [active, setActive] = useState(0);
  const touchStartX = useRef<number | null>(null);

  // Auto-advance.
  useEffect(() => {
    if (!tiles.length) return;
    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % tiles.length);
    }, ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [tiles.length]);

  // Pause the auto-advance while the hero is off screen.
  useEffect(() => {
    const element = document.getElementById('hero-mobile-strip');
    if (!element) return;

    let observer: IntersectionObserver | null = null;
    const onVisibility = () => {
      if (document.hidden) observer?.disconnect();
      else observer?.observe(element);
    };

    observer = new IntersectionObserver(
      ([entry]) => {
        element.dataset.visible = entry.isIntersecting ? 'true' : 'false';
      },
      { threshold: 0.2 },
    );
    observer.observe(element);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      observer?.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const onTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    const start = touchStartX.current;
    if (start === null) return;
    const delta = event.changedTouches[0].clientX - start;
    if (Math.abs(delta) < 40) return;
    setActive((current) => {
      const next = delta < 0 ? current + 1 : current - 1;
      return (next + tiles.length) % tiles.length;
    });
    touchStartX.current = null;
  };

  if (!tiles.length) return null;

  return (
    <div
      id="hero-mobile-strip"
      className="relative w-full overflow-hidden bg-black"
      style={{ perspective: '1200px', height: '46vw', minHeight: '190px' }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {tiles.map((tile, index) => {
          // Distance from the active tile, wrapped into -n..n.
          const raw = index - active;
          const offset =
            raw > tiles.length / 2
              ? raw - tiles.length
              : raw < -tiles.length / 2
                ? raw + tiles.length
                : raw;
          const isActive = offset === 0;
          const abs = Math.abs(offset);

          // Only the neighbours are rendered, so the strip stays cheap.
          if (abs > 1) return null;

          const scale = isActive ? 1 : 0.72;
          const rotateY = offset * 32;
          const translateX = offset * 62;
          const translateZ = isActive ? 60 : -80;
          const opacity = isActive ? 1 : 0.45;

          return (
            <div
              key={tile.id}
              className="absolute shrink-0"
              style={{
                width: '58vw',
                maxWidth: '260px',
                aspectRatio: `${tile.w} / ${tile.h}`,
                transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                opacity,
                transition:
                  'transform 700ms cubic-bezier(0.22, 1, 0.36, 1), opacity 700ms ease-out',
                transformStyle: 'preserve-3d',
                border: '1px solid #E4B027',
                boxShadow: '0 18px 40px -20px rgba(0,0,0,0.9)',
              }}
            >
              <Image
                src={`/hero/tiles/${tile.id}.webp`}
                alt={tile.id.replace(/-/g, ' ')}
                fill
                sizes="60vw"
                className="object-cover"
                style={{ transform: 'scale(1.02)' }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
