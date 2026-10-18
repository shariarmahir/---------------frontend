"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * The About page's signature: a photograph that arrives as a handful of
 * solid blocks and is repaired, step by step, to full resolution, the
 * company's idea of Bangladesh as a picture with broken pixels, fixed one
 * at a time. The sharp image is always underneath; a canvas lays the coarse
 * versions over it and steps aside at the end. Without JavaScript, or with
 * reduced motion, the sharp photograph is all there is.
 */

/** Columns at each step of the repair; rows follow the frame's ratio. */
const STEPS = [5, 8, 13, 21, 34, 55, 89];
const STEP_MS = 420;

export function PixelResolve({
  src,
  alt,
  sizes,
  position = [0.5, 0.5],
  className,
}: {
  src: string;
  alt: string;
  sizes: string;
  /** The photo's focal point, as object-position fractions. */
  position?: [number, number];
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const started = useRef(false);
  const [readout, setReadout] = useState<string | null>(null);
  const [resolved, setResolved] = useState(false);

  const run = useCallback(
    (img: HTMLImageElement) => {
      const canvas = canvasRef.current;
      if (!canvas || started.current || !img.naturalWidth) return;
      started.current = true;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setResolved(true);
        return;
      }

      const box = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(box.width * dpr);
      canvas.height = Math.round(box.height * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx) return setResolved(true);

      // The part of the photo the frame shows (object-fit: cover at `position`).
      const scale = Math.max(box.width / img.naturalWidth, box.height / img.naturalHeight);
      const sw = box.width / scale;
      const sh = box.height / scale;
      const sx = (img.naturalWidth - sw) * position[0];
      const sy = (img.naturalHeight - sh) * position[1];

      const small = document.createElement("canvas");
      const sctx = small.getContext("2d");
      if (!sctx) return setResolved(true);

      const draw = (cols: number) => {
        const rows = Math.max(1, Math.round((cols * box.height) / box.width));
        small.width = cols;
        small.height = rows;
        sctx.imageSmoothingEnabled = true;
        sctx.drawImage(img, sx, sy, sw, sh, 0, 0, cols, rows);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(small, 0, 0, cols, rows, 0, 0, canvas.width, canvas.height);
        setReadout(`${cols} × ${rows}`);
      };

      // The coarsest frame goes up at once; the repair waits until the photo is in view
      // (on a phone it sits below the fold, and the visitor should see it happen).
      let i = 0;
      draw(STEPS[0]);
      const io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          io.disconnect();
          const timer = window.setInterval(() => {
            i += 1;
            if (i < STEPS.length) return draw(STEPS[i]);
            window.clearInterval(timer);
            setResolved(true);
          }, STEP_MS);
        },
        { threshold: 0.6 },
      );
      io.observe(canvas);
    },
    [position],
  );

  // A cached photo can finish loading before hydration, so onLoad never fires.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete) run(img);
  }, [run]);

  return (
    <div className={cn("relative overflow-hidden bg-bdnavy-900", className)}>
      <Image
        ref={imgRef}
        src={src}
        alt={alt}
        fill
        priority
        sizes={sizes}
        onLoad={(e) => run(e.currentTarget)}
        style={{ objectPosition: `${position[0] * 100}% ${position[1] * 100}%` }}
        className="object-cover"
      />
      <canvas
        ref={canvasRef}
        aria-hidden
        className={cn(
          "absolute inset-0 size-full transition-opacity duration-700 ease-out motion-reduce:hidden",
          readout && !resolved ? "opacity-100" : "opacity-0",
        )}
      />
      {/* The repair, read out like a scan: resolution climbing to full. */}
      <p aria-hidden className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 font-sans text-xs font-semibold text-white tabular-nums">
        <span className={cn("size-2 rounded-full", resolved ? "bg-signal-orange" : "animate-pulse bg-white motion-reduce:animate-none")} />
        {resolved || !readout ? "Repaired: full resolution" : `Repairing: ${readout} pixels`}
      </p>
    </div>
  );
}
