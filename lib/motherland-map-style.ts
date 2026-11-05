/**
 * The Geography & Travel map's own look. Open data, no key, no bill:
 * OpenStreetMap roads, rivers and names by way of OpenFreeMap, and elevation
 * from the Terrain Tiles on AWS. Bangladesh is drawn in bottle green with its
 * rivers bright, the neighbours dimmed, so the country is what you see.
 * The satellite view is a layer in the same style.
 */
import type { LayerSpecification, StyleSpecification } from "maplibre-gl";
import { countryBorder, divisionLabels, divisionLines, outsideMask } from "./motherland-geo.ts";

export const VECTOR_TILEJSON = "https://tiles.openfreemap.org/planet";
export const DEM_TILES = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png";
const SATELLITE_TILES = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const GLYPHS = "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf";

/** Every font and letter range the map's labels use, so "Save for offline" keeps them all. */
export const GLYPH_URLS = ["Noto Sans Regular", "Noto Sans Bold", "Noto Sans Italic"].flatMap((font) => ["0-255", "256-511", "512-767", "768-1023", "7680-7935", "8192-8447", "8448-8703", "9472-9727", "9984-10239"].map((range) => GLYPHS.replace("{fontstack}", encodeURIComponent(font)).replace("{range}", range)));

const REGULAR = ["Noto Sans Regular"];
const BOLD = ["Noto Sans Bold"];
const ITALIC = ["Noto Sans Italic"];
/**
 * Names in Latin letters only. The map's text engine can't join Bangla conjuncts
 * and would print them broken, and a letter range missing offline loses a whole tile.
 */
const NAME = ["coalesce", ["get", "name:en"], ["get", "name_en"], ["get", "name:latin"], ""];

const WATER = "#2f8fc9";
const LAND = "#123a2c";
const FOREST = "#0d3024";
const WETLAND = "#17504a";
const GOLD = "#e4b027";

const road = (id: string, classes: string[], color: string, width: unknown[], minzoom: number): LayerSpecification =>
  ({
    id,
    type: "line",
    source: "osm",
    "source-layer": "transportation",
    minzoom,
    filter: ["in", ["get", "class"], ["literal", classes]],
    layout: { "line-cap": "round", "line-join": "round" },
    paint: { "line-color": color, "line-width": width },
  }) as unknown as LayerSpecification;

const halo = { "text-halo-color": "rgba(0,0,0,0.85)", "text-halo-width": 1.4 };

export function travelMapStyle(): StyleSpecification {
  const layers = [
    { id: "land", type: "background", paint: { "background-color": LAND } },
    { id: "forest", type: "fill", source: "osm", "source-layer": "landcover", filter: ["==", ["get", "class"], "wood"], paint: { "fill-color": FOREST } },
    { id: "wetland", type: "fill", source: "osm", "source-layer": "landcover", filter: ["==", ["get", "class"], "wetland"], paint: { "fill-color": WETLAND } },
    { id: "park", type: "fill", source: "osm", "source-layer": "park", paint: { "fill-color": "#1b5c3f", "fill-opacity": 0.45 } },
    { id: "hillshade", type: "hillshade", source: "dem", paint: { "hillshade-exaggeration": 0.75, "hillshade-shadow-color": "#02140d", "hillshade-highlight-color": "#6fae8c", "hillshade-accent-color": "#0e2f22" } },
    { id: "water", type: "fill", source: "osm", "source-layer": "water", paint: { "fill-color": WATER } },
    {
      id: "rivers",
      type: "line",
      source: "osm",
      "source-layer": "waterway",
      filter: ["in", ["get", "class"], ["literal", ["river", "canal"]]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": WATER, "line-width": ["interpolate", ["exponential", 1.4], ["zoom"], 5, 0.5, 9, 1.6, 14, 5] },
    },
    { id: "streams", type: "line", source: "osm", "source-layer": "waterway", minzoom: 10, filter: ["==", ["get", "class"], "stream"], paint: { "line-color": WATER, "line-width": 0.7, "line-opacity": 0.7 } },
    { id: "satellite", type: "raster", source: "satellite", layout: { visibility: "none" } },
    road("roads-minor", ["tertiary", "minor", "service"], "rgba(255,255,255,0.28)", ["interpolate", ["linear"], ["zoom"], 10, 0.3, 15, 2.5], 10),
    road("roads-main", ["primary", "secondary"], "rgba(255,255,255,0.5)", ["interpolate", ["linear"], ["zoom"], 7, 0.4, 14, 3.5], 7),
    road("roads-trunk", ["motorway", "trunk"], "rgba(244,222,160,0.8)", ["interpolate", ["linear"], ["zoom"], 6, 0.6, 14, 5], 6),
    { id: "rail", type: "line", source: "osm", "source-layer": "transportation", minzoom: 8, filter: ["==", ["get", "class"], "rail"], paint: { "line-color": "rgba(255,255,255,0.55)", "line-width": 1, "line-dasharray": [3, 2] } },
    { id: "ferries", type: "line", source: "osm", "source-layer": "transportation", minzoom: 8, filter: ["==", ["get", "class"], "ferry"], paint: { "line-color": "#bfe4f7", "line-width": 1.1, "line-dasharray": [2, 2] } },
    { id: "outside", type: "fill", source: "outside", paint: { "fill-color": "#000", "fill-opacity": 0.78 } },
    { id: "division-lines", type: "line", source: "divisions", paint: { "line-color": "rgba(255,255,255,0.28)", "line-width": 0.8, "line-dasharray": [3, 2] } },
    { id: "border-glow", type: "line", source: "border", paint: { "line-color": GOLD, "line-width": 5, "line-blur": 5, "line-opacity": 0.3 } },
    { id: "border", type: "line", source: "border", paint: { "line-color": GOLD, "line-width": 1.1 } },
    {
      id: "river-names",
      type: "symbol",
      source: "osm",
      "source-layer": "waterway",
      minzoom: 7,
      filter: ["==", ["get", "class"], "river"],
      layout: { "symbol-placement": "line", "symbol-spacing": 420, "text-field": NAME, "text-font": ITALIC, "text-size": 12, "text-letter-spacing": 0.08 },
      paint: { "text-color": "#d7f0fd", ...halo },
    },
    {
      id: "water-names",
      type: "symbol",
      source: "osm",
      "source-layer": "water_name",
      layout: { "text-field": NAME, "text-font": ITALIC, "text-size": 13, "text-max-width": 8 },
      paint: { "text-color": "#d7f0fd", ...halo },
    },
    {
      id: "peaks",
      type: "symbol",
      source: "osm",
      "source-layer": "mountain_peak",
      minzoom: 8,
      layout: { "text-field": ["concat", "▲ ", NAME, ["case", ["has", "ele"], ["concat", " ", ["get", "ele"], " m"], ""]], "text-font": REGULAR, "text-size": 11, "text-max-width": 9 },
      paint: { "text-color": "#e8ecd9", ...halo },
    },
    {
      id: "airports",
      type: "symbol",
      source: "osm",
      "source-layer": "aerodrome_label",
      minzoom: 7,
      filter: ["has", "iata"],
      layout: { "text-field": ["concat", "✈ ", ["get", "iata"]], "text-font": BOLD, "text-size": 11 },
      paint: { "text-color": "#ffffff", ...halo },
    },
    {
      id: "villages",
      type: "symbol",
      source: "osm",
      "source-layer": "place",
      minzoom: 10.5,
      filter: ["in", ["get", "class"], ["literal", ["village", "suburb", "hamlet", "neighbourhood"]]],
      layout: { "text-field": NAME, "text-font": REGULAR, "text-size": 11, "text-max-width": 8 },
      paint: { "text-color": "rgba(255,255,255,0.8)", ...halo },
    },
    {
      id: "towns",
      type: "symbol",
      source: "osm",
      "source-layer": "place",
      minzoom: 7.5,
      filter: ["==", ["get", "class"], "town"],
      layout: { "text-field": NAME, "text-font": REGULAR, "text-size": ["interpolate", ["linear"], ["zoom"], 8, 11, 12, 14], "text-max-width": 8 },
      paint: { "text-color": "rgba(255,255,255,0.9)", ...halo },
    },
    {
      id: "cities",
      type: "symbol",
      source: "osm",
      "source-layer": "place",
      minzoom: 6,
      filter: ["==", ["get", "class"], "city"],
      layout: { "text-field": NAME, "text-font": BOLD, "text-size": ["interpolate", ["linear"], ["zoom"], 6, 11, 12, 18], "text-max-width": 8 },
      paint: { "text-color": "#ffffff", ...halo },
    },
    {
      id: "division-names",
      type: "symbol",
      source: "division-names",
      maxzoom: 7.4,
      layout: { "text-field": ["upcase", ["get", "name"]], "text-font": BOLD, "text-size": 11, "text-letter-spacing": 0.22, "text-allow-overlap": false },
      paint: { "text-color": "rgba(255,255,255,0.5)" },
    },
  ] as LayerSpecification[];

  return {
    version: 8,
    glyphs: GLYPHS,
    sources: {
      osm: { type: "vector", url: VECTOR_TILEJSON },
      dem: { type: "raster-dem", tiles: [DEM_TILES], tileSize: 256, encoding: "terrarium", maxzoom: 12, attribution: "Elevation: Terrain Tiles on AWS" },
      "dem-3d": { type: "raster-dem", tiles: [DEM_TILES], tileSize: 256, encoding: "terrarium", maxzoom: 12 },
      satellite: { type: "raster", tiles: [SATELLITE_TILES], tileSize: 256, maxzoom: 18, attribution: "Imagery: Esri, Maxar, Earthstar Geographics" },
      outside: { type: "geojson", data: outsideMask() },
      border: { type: "geojson", data: countryBorder() },
      divisions: { type: "geojson", data: divisionLines() },
      "division-names": { type: "geojson", data: divisionLabels() },
    },
    layers,
  };
}
