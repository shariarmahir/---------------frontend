export const BANGLADESH_OUTLINE =
  "M210,70 L260,85 L310,120 L325,180 L380,185 L395,225 L340,250 L330,310 L370,390 L340,430 L295,410 L280,440 L210,430 L180,390 L160,330 L135,270 L145,210 L195,160 Z";

export interface FiberLink {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export const fiberLinks: FiberLink[] = [
  { x1: 250, y1: 240, x2: 330, y2: 155 },
  { x1: 250, y1: 240, x2: 340, y2: 345 },
  { x1: 250, y1: 240, x2: 165, y2: 190 },
  { x1: 250, y1: 240, x2: 175, y2: 330 },
  { x1: 250, y1: 240, x2: 225, y2: 115 },
  { x1: 330, y1: 155, x2: 340, y2: 345 },
  { x1: 165, y1: 190, x2: 225, y2: 115 },
  { x1: 175, y1: 330, x2: 280, y2: 420 },
];

export interface MicroNode {
  cx: number;
  cy: number;
  r: number;
}

export const microNodes: MicroNode[] = [
  { cx: 225, cy: 115, r: 4.5 },
  { cx: 165, cy: 190, r: 5 },
  { cx: 175, cy: 330, r: 5 },
  { cx: 280, cy: 420, r: 4.5 },
  { cx: 310, cy: 270, r: 4 },
  { cx: 210, cy: 280, r: 4 },
  { cx: 270, cy: 180, r: 4 },
  { cx: 360, cy: 220, r: 4 },
];

export interface MegaNode {
  cx: number;
  cy: number;
  r: number;
  label: string;
  labelX: number;
  labelY: number;
  ping?: number;
}

export const megaNodes: MegaNode[] = [
  {
    cx: 330,
    cy: 155,
    r: 7,
    label: "SYLHET [NODE-03]",
    labelX: 345,
    labelY: 158,
    ping: 14,
  },
  {
    cx: 340,
    cy: 345,
    r: 7.5,
    label: "CHITTAGONG [NODE-02]",
    labelX: 355,
    labelY: 348,
    ping: 15,
  },
  {
    cx: 165,
    cy: 190,
    r: 6,
    label: "RAJSHAHI [NODE-04]",
    labelX: 80,
    labelY: 193,
  },
];
