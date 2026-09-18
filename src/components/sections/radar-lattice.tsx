import { Icon } from "@/components/ui/icon";
import {
  BANGLADESH_OUTLINE,
  fiberLinks,
  megaNodes,
  microNodes,
} from "@/data/radar-map";

export function RadarLattice() {
  return (
    <div className="relative flex aspect-square w-full max-w-[500px] items-center justify-center rounded-full border border-border bg-white p-space-md shadow-xl">
      <div className="pointer-events-none absolute inset-4 rounded-full border border-slate-200/80" />
      <div className="pointer-events-none absolute inset-16 rounded-full border border-emerald-100" />
      <div className="pointer-events-none absolute inset-32 rounded-full border border-emerald-200/70" />
      <div className="pointer-events-none absolute inset-0 animate-[spin_10s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_280deg,rgba(0,103,71,0.08)_360deg)]" />

      <svg
        viewBox="0 0 500 500"
        role="img"
        aria-label="Bangladesh national telemetry lattice with 64 district nodes"
        className="relative z-10 size-full drop-shadow-[0_4px_12px_rgba(0,103,71,0.15)]"
      >
        <path
          d={BANGLADESH_OUTLINE}
          fill="#e6f4ea"
          fillOpacity="0.65"
          stroke="#006747"
          strokeDasharray="3 3"
          strokeWidth="1.75"
        />

        <g stroke="#006747" strokeOpacity="0.35" strokeWidth="1.25">
          {fiberLinks.map((link, i) => (
            <line key={i} x1={link.x1} y1={link.y1} x2={link.x2} y2={link.y2} />
          ))}
        </g>

        {microNodes.map((node, i) => (
          <circle key={i} cx={node.cx} cy={node.cy} r={node.r} fill="#006747" />
        ))}

        {megaNodes.map((node) => (
          <g key={node.label}>
            <circle cx={node.cx} cy={node.cy} r={node.r} fill="#da291c" />
            {node.ping ? (
              <circle
                cx={node.cx}
                cy={node.cy}
                r={node.ping}
                fill="none"
                stroke="#da291c"
                strokeWidth="1.5"
                className="origin-center animate-ping"
              />
            ) : null}
            <text
              x={node.labelX}
              y={node.labelY}
              fill="#0f172a"
              fontFamily="Inter"
              fontSize="10"
              fontWeight="700"
            >
              {node.label}
            </text>
          </g>
        ))}

        <circle cx="250" cy="240" r="10" fill="#da291c" />
        <circle cx="250" cy="240" r="18" fill="none" stroke="#ff9100" strokeWidth="2.5" />
        <circle
          cx="250"
          cy="240"
          r="26"
          fill="none"
          stroke="#006747"
          strokeDasharray="3 3"
          strokeWidth="1.5"
        />
        <text
          x="265"
          y="244"
          fill="#006747"
          fontFamily="Manrope"
          fontSize="12"
          fontWeight="800"
        >
          DHAKA HQ [ROOT]
        </text>
      </svg>

      <div className="absolute -bottom-3 left-6 right-6 flex items-center justify-between rounded-lg border border-border bg-white/95 p-space-sm font-code-telemetry text-code-telemetry shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-space-xs">
          <Icon name="hub" className="text-[18px] text-primary" />
          <span className="font-body-sm text-body-sm font-semibold text-slate-800">
            Active Mesh Latency
          </span>
        </div>
        <span className="font-bold text-signal">14.8 ms • 64 Dist. Coherent</span>
      </div>
    </div>
  );
}
