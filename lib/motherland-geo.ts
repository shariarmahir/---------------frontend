/**
 * The real map's geography, from the same CC0 geoBoundaries outlines as the
 * rest of the site, turned back into longitude and latitude. Pure, so it can
 * be tested without a browser.
 */
import { divisionShapes, unproject, type DivisionId } from "../data/bangladesh-map.ts";

type Position = [number, number];

export const BD_BOUNDS: [Position, Position] = [
  [88.0, 20.55],
  [92.75, 26.7],
];

function ringsOf(d: string): Position[][] {
  return d
    .split("M")
    .filter(Boolean)
    .map((part) =>
      part
        .replace(/Z/g, "")
        .split("L")
        .map((pair) => {
          const [x, y] = pair.split(",").map(Number);
          const { lat, lon } = unproject(x, y);
          return [Number(lon.toFixed(4)), Number(lat.toFixed(4))] as Position;
        }),
    )
    .filter((ring) => ring.length > 2)
    .map((ring) => [...ring, ring[0]]);
}

/** Positive when the ring runs counter-clockwise. */
function signedArea(ring: Position[]) {
  let area = 0;
  for (let i = 0; i < ring.length - 1; i++) area += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  return area / 2;
}

export const divisionShapesCount = divisionShapes.length;

let cachedRings: Position[][] | null = null;
const allRings = () => (cachedRings ??= divisionShapes.flatMap((d) => ringsOf(d.d)));

/** Is this point inside one of the divisions' outlines? */
export function onLand(lat: number, lon: number) {
  return allRings().some((ring) => {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  });
}

const DIVISION_NAME: Record<DivisionId, string> = { chattogram: "Chattogram", dhaka: "Dhaka", mymensingh: "Mymensingh", rajshahi: "Rajshahi", rangpur: "Rangpur", sylhet: "Sylhet", khulna: "Khulna", barishal: "Barishal" };

export function divisionLines() {
  return {
    type: "FeatureCollection" as const,
    features: divisionShapes.map((d) => ({ type: "Feature" as const, properties: { id: d.id }, geometry: { type: "MultiLineString" as const, coordinates: ringsOf(d.d) } })),
  };
}

export function divisionLabels() {
  return {
    type: "FeatureCollection" as const,
    features: divisionShapes.map((d) => {
      const { lat, lon } = unproject(d.cx, d.cy);
      return { type: "Feature" as const, properties: { name: DIVISION_NAME[d.id] }, geometry: { type: "Point" as const, coordinates: [lon, lat] } };
    }),
  };
}

/** The country's outer edge only: a line with land on both sides is an inside line, so it drops out. */
export function countryBorder() {
  const STEP = 0.02;
  const coordinates: Position[][] = [];
  for (const ring of allRings()) {
    for (let i = 0; i < ring.length - 1; i++) {
      const [ax, ay] = ring[i];
      const [bx, by] = ring[i + 1];
      const length = Math.hypot(bx - ax, by - ay) || 1;
      const [nx, ny] = [((by - ay) / length) * STEP, ((ax - bx) / length) * STEP];
      const [mx, my] = [(ax + bx) / 2, (ay + by) / 2];
      if (!(onLand(my + ny, mx + nx) && onLand(my - ny, mx - nx))) coordinates.push([ring[i], ring[i + 1]]);
    }
  }
  return { type: "Feature" as const, properties: {}, geometry: { type: "MultiLineString" as const, coordinates } };
}

/** The whole world with Bangladesh cut out: it dims the neighbours, so the country stands out. */
export function outsideMask() {
  const world: Position[] = [
    [-180, -85],
    [180, -85],
    [180, 85],
    [-180, 85],
    [-180, -85],
  ];
  const holes = allRings().map((ring) => (signedArea(ring) > 0 ? [...ring].reverse() : ring));
  return { type: "Feature" as const, properties: {}, geometry: { type: "Polygon" as const, coordinates: [world, ...holes] } };
}

const tileX = (lon: number, z: number) => Math.floor(((lon + 180) / 360) * 2 ** z);
const tileY = (lat: number, z: number) => {
  const rad = (lat * Math.PI) / 180;
  return Math.floor(((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * 2 ** z);
};

/** Every map tile covering Bangladesh at these zooms, for "Save for offline". */
export function tilesFor(template: string, zooms: number[]) {
  const [[west, south], [east, north]] = BD_BOUNDS;
  const urls: string[] = [];
  for (const z of zooms) {
    for (let x = tileX(west, z); x <= tileX(east, z); x++) {
      for (let y = tileY(north, z); y <= tileY(south, z); y++) {
        urls.push(template.replace("{z}", String(z)).replace("{x}", String(x)).replace("{y}", String(y)));
      }
    }
  }
  return urls;
}
