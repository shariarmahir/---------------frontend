/**
 * Map geometry shared by the TV wall's map layers (SVG, Google Maps, 3D):
 * each district's label point back in latitude/longitude, and the readings
 * every layer draws.
 */
import { districtShapes } from "../../data/tv-wall/districts-map.ts";
import type { RiskLevel } from "./core.ts";

// Inverse of the equirectangular projection in data/bangladesh-map.ts.
const KX = 0.9156625933395611;
const MIN_X = 80.59733538132014;
const MAX_Y = 26.620987730128093;
const SCALE = 140.31099190423743;

export function unproject(x: number, y: number): { lat: number; lng: number } {
  return { lat: MAX_Y - y / SCALE, lng: (x / SCALE + MIN_X) / KX };
}

/** Every district's label point (centroid of its largest part) as lat/lng. */
export const DISTRICT_LATLNG: Record<string, { lat: number; lng: number }> = Object.fromEntries(
  districtShapes.map((d) => [d.id, unproject(d.cx, d.cy)]),
);

/** Bangladesh's bounding box, for fitting a map to the country. */
export const BD_BOUNDS = { north: 26.65, south: 20.55, west: 88.0, east: 92.7 };
export const BD_CENTER = { lat: 23.7, lng: 90.35 };

/** Map colours as hex, for canvases and Google Maps where CSS variables do not reach. */
export const ZONE_HEX: Record<RiskLevel, string> = {
  0: "#1a2c7a",
  1: "#3d56b8",
  2: "#a8231b",
  3: "#da291c",
};

export interface DistrictReading {
  id: string;
  /** English name (Bangla names live in data/tv-wall/districts-map.ts for later). */
  name: string;
  /** Severity-weighted crime and corruption score in the window. */
  score: number;
  /** Crime and corruption reports in the window. */
  count: number;
  level: RiskLevel;
  /** The latest report from the district, if any. */
  top?: { title: string; url: string; source: string };
}

/** What every map layer receives. */
export interface MapLayerProps {
  /** One reading per district that has reports; districts without reports are quiet. */
  readings: DistrictReading[];
  /** Districts with a violent report in the last six hours. */
  pings: string[];
  selected: string | null;
  onSelect: (id: string | null) => void;
  className?: string;
}
