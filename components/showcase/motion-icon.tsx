/*
 * Animated icons for the showcase, one per scene: each is a small drawing
 * whose parts move on their own (a gear turns, waves ripple, a caret
 * blinks). Drawn in ink on the gold tile; motion comes from the .ms-*
 * classes, so the card's pause and reduced motion apply here too.
 */
import type { CSSProperties } from "react";
import type { SceneKind } from "./motion-scene";

const t = (d = 0, dur?: number) => ({ "--d": d, ...(dur ? { "--dur": dur } : {}) }) as CSSProperties;

function Glyph({ kind }: { kind: SceneKind }) {
  switch (kind) {
    case "ecg":
      return <path pathLength={100} className="ms-dash fill-none stroke-text-primary" style={t(0, 2)} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" d="M4 25 H13 L17 15 L22 33 L27 9 L31 25 H44" />;
    case "voice":
      return (
        <g>
          {[10, 18, 26, 34].map((x, i) => (
            <rect key={x} x={x - 2} y="10" width="4" height="28" rx="2" className="ms-bar fill-text-primary" style={t(i * 120, 1)} />
          ))}
        </g>
      );
    case "grid":
      return (
        <g>
          <circle cx="24" cy="24" r="9" className="ms-ring fill-none stroke-text-primary" strokeWidth="2.4" style={t(0, 2)} />
          <path d="M24 38 C16 29 14 24 14 20 A10 10 0 0 1 34 20 C34 24 32 29 24 38 Z" className="fill-text-primary" />
          <circle cx="24" cy="20" r="3.5" className="fill-signal-orange" />
        </g>
      );
    case "neural":
      return (
        <g>
          <path d="M10 14 L24 24 L38 14 M10 34 L24 24 L38 34 M10 14 L10 34 M38 14 L38 34" className="fill-none stroke-text-primary/45" strokeWidth="2" />
          {[[10, 14], [38, 14], [10, 34], [38, 34]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="4" className="ms-pulse fill-text-primary" style={t(i * 300, 1.6)} />
          ))}
          <circle cx="24" cy="24" r="6" className="fill-text-primary" />
        </g>
      );
    case "factory": {
      const pts: string[] = [];
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        const r = i % 2 === 0 ? 17 : 13.5;
        pts.push(`${(24 + Math.cos(a) * r).toFixed(1)},${(24 + Math.sin(a) * r).toFixed(1)}`);
      }
      return (
        <g className="ms-spin" style={t(0, 5)}>
          <polygon points={pts.join(" ")} className="fill-text-primary" />
          <circle cx="24" cy="24" r="5.5" className="fill-signal-orange" />
        </g>
      );
    }
    case "signal":
      return (
        <g>
          <circle cx="24" cy="32" r="3.5" className="fill-text-primary" />
          {[9, 16, 23].map((r, i) => (
            <path key={r} d={`M${24 - r * 0.8} ${32 - r * 0.6} A${r} ${r} 0 0 1 ${24 + r * 0.8} ${32 - r * 0.6}`} className="ms-pulse fill-none stroke-text-primary" strokeWidth="3" strokeLinecap="round" style={t(i * 250, 1.6)} />
          ))}
        </g>
      );
    case "code":
      return (
        <g>
          <path d="M17 15 L8 24 L17 33 M31 15 L40 24 L31 33" className="fill-none stroke-text-primary" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="22.5" y="15" width="3" height="18" rx="1.5" className="ms-blink fill-text-primary" />
        </g>
      );
  }
}

/** A gold tile with the kind's moving glyph. */
export function MotionIcon({ kind, className }: { kind: SceneKind; className?: string }) {
  return (
    <span aria-hidden className={className ?? "grid size-14 shrink-0 place-items-center rounded-2xl bg-signal-orange shadow-tile"}>
      <svg viewBox="0 0 48 48" className="size-9">
        <Glyph kind={kind} />
      </svg>
    </span>
  );
}
