import type { CSSProperties, ReactNode } from "react";
import { LOGO_ART } from "@/data/motherland-art";
import { cn } from "@/lib/utils";

/*
 * Mahir's MotherLand mark, drawn in the letters' own units (scripts/motherland-art.py): the
 * baseline at y = 0, the tallest letter reaching LOGO_ART.top. "MotherLand." in Knewave: the
 * letters in the colour of the text around it (white on the film and the footer, navy on the
 * white header), each with a thin navy rim; Mahir's own heart-eyes emoji
 * (public/motherland/logo/face.webp, its white ground cut away) standing in for the o; and
 * Knewave's own full stop in gold, closing the name like a statement.
 */
type Box = [number, number, number, number];
const { letters, top } = LOGO_ART;
const first = letters[0];
const last = letters[letters.length - 1];

/** The thin rim round each letter: navy, unless the logo is given --ml-logo-rim (gold on the white header). */
const RIM = 18;
/** The emoji stands in for the o: on the baseline, a little taller than the short letters so it
 * reads at a glance, close after the M; the letters after it move right to make room. */
const O_INDEX = 1;
const STOP_INDEX = letters.length - 1;
/** Where "Land" starts: the letters before it can take their own colour (--ml-logo-mother, green on the white header). */
const LAND_INDEX = 6;
const FACE_SRC = "/motherland/logo/face.webp";
const FACE_H = 620;
const FACE_W = (FACE_H * 512) / 468;
const FACE_X = letters[O_INDEX].x0 + 110;
const FACE_Y = 45 - FACE_H;
const SHIFT = 290;
/** Knewave's full stop hangs below the line: it is lifted to sit on the baseline with the letters, a little clear of the d. */
const STOP_LIFT = 58;
/** It is drawn a little larger than the font's, growing from the middle of its foot, so it reads at small sizes. */
const STOP_SCALE = 1.3;
const stop = letters[STOP_INDEX];
const STOP_GROW = ((STOP_SCALE - 1) * (stop.x1 - stop.x0)) / 2;
const STOP_ROOM = 30 + STOP_GROW;
const shiftOf = (i: number) => (i > O_INDEX ? SHIFT : 0) + (i === STOP_INDEX ? STOP_ROOM : 0);
const liftOf = (i: number) => (i === STOP_INDEX ? STOP_LIFT : 0);
const bottom = Math.max(...letters.map((l, i) => l.y1 - liftOf(i)));

const PAD = 40;
const VIEW: Box = [
  first.x0 - PAD,
  top - PAD,
  last.x1 + shiftOf(STOP_INDEX) + STOP_GROW + 2 * PAD - first.x0,
  bottom - top + 2 * PAD,
];

/** One part of the logo in a layer of its own, placed in the logo's units, so it moves without the rest being painted again. */
function Layer({
  box,
  index,
  children,
}: {
  box: Box;
  index: number;
  children: ReactNode;
}) {
  const [vx, vy, vw, vh] = VIEW;
  const [x, y, w, h] = box;
  return (
    <svg
      aria-hidden
      viewBox={box.join(" ")}
      className="absolute overflow-visible"
      style={
        {
          left: `${((x - vx) / vw) * 100}%`,
          top: `${((y - vy) / vh) * 100}%`,
          width: `${(w / vw) * 100}%`,
          height: `${(h / vh) * 100}%`,
          "--i": index,
        } as CSSProperties
      }
    >
      <g className="ml-logo-zoom">
        <g className="ml-logo-wave">{children}</g>
      </g>
    </svg>
  );
}

/**
 * The logo, a motion graphic (motherland.css, .ml-logo): as it appears, each letter zooms in after
 * the one before, M, the emoji o, t, h, e, r, L, a, n, d and the full stop. With `loop` (the hero)
 * a soft zoom then runs through the letters one by one, again and again; elsewhere it settles
 * after the entrance. Still for visitors who ask for less motion. The letters take
 * `currentColor`: give the logo text-white on dark ground, text-ml-navy on white.
 */
export function Logo({ loop, className }: { loop?: boolean; className?: string }) {
  return (
    <span
      role="img"
      aria-label="MotherLand"
      data-loop={loop ? "" : undefined}
      className={cn("ml-logo relative block", className)}
      style={{ aspectRatio: `${VIEW[2]} / ${VIEW[3]}` }}
    >
      {letters.map((letter, i) => {
        const dx = shiftOf(i);
        const dy = -liftOf(i);
        if (i === O_INDEX) {
          return (
            <Layer key={i} index={i} box={[FACE_X - 20, top - 20, FACE_W + 40, bottom - top + 40]}>
              <image href={FACE_SRC} x={FACE_X} y={FACE_Y} width={FACE_W} height={FACE_H} />
            </Layer>
          );
        }
        const isStop = i === STOP_INDEX;
        const grow = isStop ? STOP_GROW : 0;
        const [fx, fy] = [(letter.x0 + letter.x1) / 2, letter.y1];
        return (
          <Layer
            key={i}
            index={i}
            box={[letter.x0 - 20 + dx - grow, top - 20, letter.x1 - letter.x0 + 40 + 2 * grow, bottom - top + 40]}
          >
            <path
              d={letter.d}
              transform={
                isStop
                  ? `translate(${dx + fx} ${dy + fy}) scale(${STOP_SCALE}) translate(${-fx} ${-fy})`
                  : dx
                    ? `translate(${dx} 0)`
                    : undefined
              }
              fill={isStop ? "var(--ml-logo-dot, var(--color-signal-orange))" : i < LAND_INDEX ? "var(--ml-logo-mother, currentColor)" : "currentColor"}
              stroke="var(--ml-logo-rim, var(--color-ml-navy))"
              strokeLinejoin="round"
              paintOrder="stroke"
              style={{ strokeWidth: `var(--ml-logo-rim-width, ${RIM}px)` }}
            />
          </Layer>
        );
      })}
    </span>
  );
}
