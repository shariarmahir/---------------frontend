import {
  BANGLADESH_FULL_OUTLINE,
  divisionNodes,
  latticeDots,
} from "@/data/bangladesh-map";

/**
 * Full-bleed dotted Bangladesh map for the hero background.
 *
 * Keeps the radar treatment of the original lattice — rotating sweep, dashed
 * border, pulsing nodes — but renders the whole country instead of a single
 * city, and spans the entire hero rather than sitting in a boxed circle.
 */
export function BangladeshBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Rotating radar sweep, centred on the landmass. */}
      <div className="absolute top-1/2 right-[6%] aspect-square h-[150%] translate-x-1/4 -translate-y-1/2 animate-[spin_18s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_300deg,rgba(0,103,71,0.10)_355deg,transparent_360deg)] lg:right-[18%]" />

      {/* Whole-country map: centred on mobile, anchored right of the copy on
          desktop so the full silhouette stays readable rather than cropped. */}
      <svg
        viewBox="0 0 600 760"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-y-0 right-0 h-full w-full opacity-[0.55] lg:left-auto lg:w-[52%] lg:opacity-80"
      >
        <defs>
          <clipPath id="bd-clip">
            <path d={BANGLADESH_FULL_OUTLINE} />
          </clipPath>
          <radialGradient id="bd-fill" cx="50%" cy="45%" r="70%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.20" />
            <stop offset="55%" stopColor="#006747" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#006747" stopOpacity="0.05" />
          </radialGradient>
        </defs>

        {/* Landmass wash. */}
        <path d={BANGLADESH_FULL_OUTLINE} fill="url(#bd-fill)" />

        {/* Dotted interior — the drawing treatment, now nationwide. */}
        <g clipPath="url(#bd-clip)" fill="#006747">
          {latticeDots.map((dot, i) => (
            <circle
              key={i}
              cx={dot.cx}
              cy={dot.cy}
              r={dot.r}
              opacity={0.18 + (i % 7) * 0.035}
            >
              <animate
                attributeName="opacity"
                values={`${0.12 + (i % 5) * 0.03};${0.4 + (i % 5) * 0.05};${0.12 + (i % 5) * 0.03}`}
                dur={`${3.5 + (i % 9) * 0.45}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </g>

        {/* Dashed national border. */}
        <path
          d={BANGLADESH_FULL_OUTLINE}
          fill="none"
          stroke="#006747"
          strokeOpacity="0.5"
          strokeWidth="2"
          strokeDasharray="6 5"
          strokeLinejoin="round"
        />

        {/* Division nodes with staggered pulse. */}
        <g clipPath="url(#bd-clip)">
          {divisionNodes.map((node, i) => (
            <g key={node.id}>
              <circle
                cx={node.cx}
                cy={node.cy}
                r="16"
                fill="none"
                stroke="#da291c"
                strokeOpacity="0.45"
                strokeWidth="1.5"
              >
                <animate
                  attributeName="r"
                  values="6;26;6"
                  dur="4s"
                  begin={`${i * 0.5}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="stroke-opacity"
                  values="0.55;0;0.55"
                  dur="4s"
                  begin={`${i * 0.5}s`}
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx={node.cx} cy={node.cy} r="4.5" fill="#da291c" fillOpacity="0.75" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
