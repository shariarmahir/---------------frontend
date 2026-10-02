import type { RoomIcon } from "@/data/platforms";

/*
 * One small moving drawing per room, ink on a gold tile. They move only
 * while their tile is hovered or focused (.pf-icon in globals.css), so a
 * row of four never competes with the film above it.
 */
function Glyph({ icon }: { icon: RoomIcon }) {
  switch (icon) {
    case "market":
      return (
        <g className="pf-bob">
          <path d="M11 18 H37 L34.5 38 H13.5 Z" className="fill-text-primary" />
          <path d="M18 18 V15 A6 6 0 0 1 30 15 V18" className="fill-none stroke-text-primary" strokeWidth="3" strokeLinecap="round" />
          <circle cx="24" cy="28" r="3.5" className="fill-signal-orange" />
        </g>
      );
    case "jobs":
      return (
        <g>
          <rect x="9" y="16" width="30" height="21" rx="3.5" className="fill-text-primary" />
          <path d="M19 16 V12.5 H29 V16" className="fill-none stroke-text-primary" strokeWidth="3" strokeLinejoin="round" />
          <path d="M18.5 26.5 L22.5 30.5 L30 23" className="pf-bob fill-none stroke-signal-orange" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
    case "team":
      return (
        <g>
          <circle cx="24" cy="24" r="12" className="fill-none stroke-text-primary/35" strokeWidth="2" strokeDasharray="3 4" />
          <g className="pf-orbit">
            <circle cx="24" cy="12" r="5" className="fill-text-primary" />
            <circle cx="13.6" cy="30" r="5" className="fill-text-primary" />
            <circle cx="34.4" cy="30" r="5" className="fill-text-primary" />
          </g>
        </g>
      );
    case "civic":
      return (
        <g>
          <path d="M8 21 H15 L29 13 V35 L15 27 H8 Z" className="fill-text-primary" />
          <path d="M12 27 L14 36 H18.5 L17 27" className="fill-text-primary" />
          <path d="M33 19 A7 7 0 0 1 33 29" className="pf-wave fill-none stroke-text-primary" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M36.5 15 A12 12 0 0 1 36.5 33" className="pf-wave fill-none stroke-text-primary" strokeWidth="2.8" strokeLinecap="round" style={{ "--d": 250 } as React.CSSProperties} />
        </g>
      );
  }
}

export function RoomGlyph({ icon }: { icon: RoomIcon }) {
  return (
    <span aria-hidden className="pf-icon grid size-12 shrink-0 place-items-center rounded-2xl bg-signal-orange">
      <svg viewBox="0 0 48 48" className="size-8">
        <Glyph icon={icon} />
      </svg>
    </span>
  );
}
