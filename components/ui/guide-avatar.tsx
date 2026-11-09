import type { CSSProperties } from "react";

/**
 * The site guide (Mahir, 2026-10-29): a young Bangladeshi man drawn full
 * length, with no badge or backdrop behind him: a bottle-green panjabi with
 * a gold placket, white pajama and brown sandals. Asleep he leans his head,
 * shuts his eyes, breathes slowly and lets small Z's float up; awake he
 * straightens, opens his eyes (and blinks now and then), lifts his brows,
 * smiles, and his eyes and head follow the pointer (--px, --py and --tilt,
 * set by the launcher). While he greets he waves, and while he speaks his
 * mouth moves. Transforms and crossfades only (globals.css, "Site guide");
 * reduced motion keeps him still. Decorative: the launcher carries the name.
 */
export function GuideAvatar({ awake, talking, waving }: { awake: boolean; talking: boolean; waving: boolean }) {
  return (
    <svg
      viewBox="0 0 120 216"
      aria-hidden
      data-awake={awake || undefined}
      data-talking={talking || undefined}
      data-waving={waving || undefined}
      className="guide-avatar block h-auto w-full overflow-visible"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* A soft shadow under his feet. */}
      <ellipse className="ga-ground" cx="60" cy="211" rx="30" ry="3.6" fill="#000000" opacity="0.35" />

      <g className="ga-body">
        {/* Legs: the white pajama, and the sandals. */}
        <path d="M45 152h13l-1 50h-11Z" fill="#efe7d4" stroke="#0b1849" strokeWidth="1.6" />
        <path d="M62 152h13l-1 50H63Z" fill="#efe7d4" stroke="#0b1849" strokeWidth="1.6" />
        <path d="M42 201.5c0-2.5 2.6-3.6 8-3.6s8.4 1.4 8.4 3.8c0 2.2-3.4 3.2-8.2 3.2S42 204 42 201.5Z" fill="#6b3f22" stroke="#0b1849" strokeWidth="1.4" />
        <path d="M61.6 201.7c0-2.4 3-3.8 8.4-3.8s8 1.1 8 3.6-3.4 3.4-8.2 3.4-8.2-1-8.2-3.2Z" fill="#6b3f22" stroke="#0b1849" strokeWidth="1.4" />

        {/* The arm at his side (viewer's left). */}
        <g className="ga-arm-rest">
          <path d="M36 84c-5 10-7 26-7 46" fill="none" stroke="#0b1849" strokeWidth="13.6" />
          <path d="M36 84c-5 10-7 26-7 46" fill="none" stroke="#006747" strokeWidth="11" />
          <circle cx="29" cy="134" r="5.6" fill="#c98a5a" stroke="#0b1849" strokeWidth="1.4" />
        </g>

        {/* The panjabi: a knee-length tunic with side slits, a gold placket and a band collar. */}
        <path d="M37 79c7-6 15-8 23-8s16 2 23 8l7 76c-9 4-19 5-30 5s-21-1-30-5Z" fill="#006747" stroke="#0b1849" strokeWidth="1.8" />
        <path d="M33.4 150 37 136M86.6 150 83 136" stroke="#0b1849" strokeWidth="1.4" />
        <path d="M60 74v34" stroke="#e4b027" strokeWidth="2.2" />
        <g fill="#e4b027">
          <circle cx="60" cy="84" r="1.4" />
          <circle cx="60" cy="93" r="1.4" />
          <circle cx="60" cy="102" r="1.4" />
        </g>
        <path d="M51.5 71.5q8.5 5 17 0" fill="none" stroke="#e4b027" strokeWidth="2.2" />
        {/* A pocket, a little gold edge. */}
        <path d="M68 92h9v9h-9Z" fill="none" stroke="#e4b027" strokeWidth="1.2" opacity="0.8" />

        {/* The arm that waves (viewer's right): down at his side, raised while he greets. */}
        <g className="ga-arm-wave">
          <path d="M84 84c5 10 7 26 7 46" fill="none" stroke="#0b1849" strokeWidth="13.6" />
          <path d="M84 84c5 10 7 26 7 46" fill="none" stroke="#006747" strokeWidth="11" />
          <g className="ga-hand">
            <circle cx="91" cy="134" r="5.6" fill="#c98a5a" stroke="#0b1849" strokeWidth="1.4" />
          </g>
        </g>

        {/* The neck. */}
        <path d="M53.5 58h13v13c-4 2.4-9 2.4-13 0Z" fill="#a8693f" />

        <g className="ga-head">
          {/* Ears, face, a light stubble and the hair. */}
          <circle cx="40.6" cy="42" r="4.4" fill="#b9774a" stroke="#0b1849" strokeWidth="1.3" />
          <circle cx="79.4" cy="42" r="4.4" fill="#b9774a" stroke="#0b1849" strokeWidth="1.3" />
          <path d="M60 18c11.6 0 19.6 8.8 19.6 21.6 0 13.8-8.6 24-19.6 24s-19.6-10.2-19.6-24C40.4 26.8 48.4 18 60 18Z" fill="#c98a5a" stroke="#0b1849" strokeWidth="1.6" />
          <path d="M45 50c3 9 8.6 13.6 15 13.6S72 59 75 50c-2.4 6.6-8 10.4-15 10.4S47.4 56.6 45 50Z" fill="#3b2a22" opacity="0.28" />
          <path d="M39.8 40.5C38 25 47 12.5 60.6 12.5c12.6 0 21.2 9.4 20 25.6-1.6-5.6-4.4-9.6-8.8-11.6-1.4 3-5.8 4.6-11.6 4.4-6.6-.2-11.2-2.4-13.4-5.8-3.2 3.2-5.6 8.4-7 15.4Z" fill="#17161c" />
          <path d="M57 12.8c5.6-3 13.6-1.8 17.4 3.2" fill="none" stroke="#17161c" strokeWidth="3" />

          {/* Brows: they lift when he wakes. */}
          <g className="ga-brows" fill="none" stroke="#17161c" strokeWidth="2">
            <path d="M47.6 33.8q4-2 8 0" />
            <path d="M64.4 33.8q4-2 8 0" />
          </g>

          {/* Eyes: shut while he sleeps; open, with pupils that follow the pointer, when he wakes. */}
          <g className="ga-eyes-closed" fill="none" stroke="#17161c" strokeWidth="1.9">
            <path d="M48.4 41q3.2 2.6 6.4 0" />
            <path d="M65.2 41q3.2 2.6 6.4 0" />
          </g>
          <g className="ga-eyes-open">
            <g className="ga-eye">
              <ellipse cx="51.6" cy="41" rx="3.8" ry="3.2" fill="#ffffff" stroke="#0b1849" strokeWidth="1" />
              <g className="ga-pupil">
                <circle cx="51.6" cy="41.2" r="2.1" fill="#17161c" />
                <circle cx="52.4" cy="40.4" r="0.7" fill="#ffffff" />
              </g>
            </g>
            <g className="ga-eye">
              <ellipse cx="68.4" cy="41" rx="3.8" ry="3.2" fill="#ffffff" stroke="#0b1849" strokeWidth="1" />
              <g className="ga-pupil">
                <circle cx="68.4" cy="41.2" r="2.1" fill="#17161c" />
                <circle cx="69.2" cy="40.4" r="0.7" fill="#ffffff" />
              </g>
            </g>
          </g>

          <path d="M60.4 42.6q-1.8 5.2.8 6" fill="none" stroke="#8a5233" strokeWidth="1.5" />
          <g className="ga-cheeks" fill="#e0806e">
            <ellipse cx="46.4" cy="50" rx="3" ry="1.7" />
            <ellipse cx="73.6" cy="50" rx="3" ry="1.7" />
          </g>

          {/* Mouth: at rest asleep, a smile awake, open and moving while he speaks. */}
          <path className="ga-mouth-sleep" d="M56.6 54.6q3.4 1 6.8 0" fill="none" stroke="#6b2f22" strokeWidth="1.7" />
          <path className="ga-mouth-smile" d="M54.4 53q5.6 5 11.2 0" fill="none" stroke="#6b2f22" strokeWidth="1.9" />
          <g className="ga-mouth-talk">
            <ellipse cx="60" cy="54.8" rx="4.2" ry="2.8" fill="#5a1d1d" stroke="#0b1849" strokeWidth="0.8" />
            <path d="M56.8 53.2h6.4" stroke="#ffffff" strokeWidth="1.2" />
          </g>
        </g>
      </g>

      {/* Asleep: three Z's drifting up from his head. */}
      <g className="ga-zz" fill="#ffffff" stroke="#0b1849" strokeWidth="0.8" paintOrder="stroke" fontFamily="var(--font-grotesk), sans-serif" fontWeight="800">
        <text className="ga-z" x="80" y="22" fontSize="11" style={{ "--i": 0 } as CSSProperties}>
          z
        </text>
        <text className="ga-z" x="87" y="12" fontSize="14" style={{ "--i": 1 } as CSSProperties}>
          z
        </text>
        <text className="ga-z" x="95" y="1" fontSize="17" style={{ "--i": 2 } as CSSProperties}>
          Z
        </text>
      </g>
    </svg>
  );
}
