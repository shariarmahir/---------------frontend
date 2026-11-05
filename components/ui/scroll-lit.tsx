"use client";

import { useEffect, useRef, type CSSProperties } from "react";

/**
 * A paragraph whose words light up one after another as it scrolls up the
 * screen, after kudos.framer.media's "Why choose us" statement (Mahir,
 * 2026-10-29): dim as it enters, fully lit by the time it reaches the
 * middle. Read whole by screen readers; with reduced motion, or before the
 * script runs, it is simply lit.
 */
export function ScrollLit({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = text.split(" ");

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when its top is 90% down the screen, 1 when its bottom reaches 55%.
      const start = vh * 0.9;
      const end = vh * 0.55;
      const p = (start - r.top) / (start - end + r.height);
      el.style.setProperty("--lit", String(Math.min(1, Math.max(0, p))));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) window.addEventListener("scroll", onScroll, { passive: true });
      else window.removeEventListener("scroll", onScroll);
      update();
    });
    el.dataset.lit = "";
    update();
    io.observe(el);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <p ref={ref} className={className} style={{ "--n": words.length } as CSSProperties}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((word, i) => (
          <span key={i} className="scroll-lit-word" style={{ "--i": i } as CSSProperties}>
            {word}{i < words.length - 1 ? " " : null}
          </span>
        ))}
      </span>
    </p>
  );
}
