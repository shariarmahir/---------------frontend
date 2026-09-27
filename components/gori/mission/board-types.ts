import type { MissionState } from "@/lib/gori/mission/engine";

/** A short-lived board effect: a collapse shockwave, a treatment ripple, a reform wave. */
export interface Pulse {
  key: number;
  n: number;
  kind: "collapse" | "treat" | "reform";
}

export interface BoardProps {
  state: MissionState;
  /** Whose turn it is (or who must discard). */
  current: number;
  selected: number | null;
  /** Hovered or keyboard-focused module. */
  focus: number | null;
  /** A cascade preview to draw: the chain that would collapse and everything it hits. */
  highlight: { collapsed: number[]; hit: number[] } | null;
  pulses: Pulse[];
  reduce: boolean;
  onSelect: (n: number) => void;
  onHover: (n: number | null) => void;
}
