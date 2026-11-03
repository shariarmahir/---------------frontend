import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { project } from "../data/bangladesh-map.ts";
import { TOPICS } from "../data/motherland.ts";
import { GUIDES, HELP, OLD_STACK, PLACES, RIVERS, SEASONS, SOURCES, STORIES, WEEK_FILMS, filmOfWeek, placeById, topTen, travelCredits } from "../data/motherland-travel.ts";
import { SURGES, crowdAt, daysUntil, dhakaClock, nearestPlaces, nextSurge, placesToGpx, seasonAt, ticketOutlook, weekNumber } from "./motherland-crowd.ts";
import { BD_BOUNDS, countryBorder, divisionShapesCount, onLand, outsideMask, tilesFor } from "./motherland-geo.ts";
import { travelMapStyle } from "./motherland-map-style.ts";
import { REPORT_FRESH_MS, inBangladesh, isFresh, newPlace, timeAgo } from "./motherland-reports.ts";

const at = (iso: string) => new Date(iso);

test("the navbar says Geography & Travel in full", () => {
  assert.equal(TOPICS.find((t) => t.id === "travel")?.tab, "Geography & Travel");
});

test("the clock reads Dhaka time, not the server's", () => {
  // 20:00 UTC on a Thursday is 02:00 on Friday in Dhaka.
  const c = dhakaClock(at("2026-11-05T20:00:00Z"));
  assert.deepEqual([c.date, c.weekday, c.hour], ["2026-11-06", "Fri", 2]);
});

test("closed months always read closed: the Sundarbans ban and St Martin's season", () => {
  assert.equal(crowdAt(placeById("sundarbans")!, at("2027-07-10T06:00:00Z")).level, "closed");
  assert.equal(crowdAt(placeById("st-martin")!, at("2027-05-10T06:00:00Z")).level, "closed");
  assert.notEqual(crowdAt(placeById("sundarbans")!, at("2027-01-10T06:00:00Z")).level, "closed");
});

test("a famous place in season at Eid is packed, a hidden one off season is quiet", () => {
  assert.equal(crowdAt({ fame: 3, best: [3] }, at("2027-03-12T06:00:00Z")).level, "packed");
  assert.equal(crowdAt({ fame: 1, best: [12] }, at("2027-07-14T18:00:00Z")).level, "quiet");
});

test("the weekend, in season, says so", () => {
  const { reasons } = crowdAt({ fame: 2, best: [11] }, at("2026-11-06T06:00:00Z"));
  assert.ok(reasons.includes("In season") && reasons.includes("Weekend"));
});

test("holidays are in order, and the next rush is found", () => {
  for (let i = 1; i < SURGES.length; i++) assert.ok(SURGES[i].from > SURGES[i - 1].from, SURGES[i].name);
  assert.equal(nextSurge(at("2026-11-05T06:00:00Z"))?.name, "Victory Day");
  assert.equal(daysUntil(at("2026-12-13T06:00:00Z"), "2026-12-14"), 1);
});

test("ticket outlook covers every way of travelling and tightens near a holiday", () => {
  const calm = ticketOutlook(at("2027-07-13T06:00:00Z"));
  assert.deepEqual(calm.map((t) => t.mode), ["Train", "Bus", "Launch and ferry", "Flight"]);
  assert.equal(ticketOutlook(at("2027-03-08T06:00:00Z"))[0].level, "packed");
  assert.notEqual(calm[0].level, "packed");
});

test("GPX is valid and escapes names", () => {
  const gpx = placesToGpx([{ name: "Cox's Bazar & <beach>", lat: 21.4, lon: 92, note: "Want to go." }]);
  assert.match(gpx, /<wpt lat="21.4" lon="92"><name>Cox&apos;s Bazar &amp; &lt;beach&gt;<\/name>/);
  assert.ok(gpx.startsWith("<?xml") && gpx.trimEnd().endsWith("</gpx>"));
});

test("nearest places come back closest first with sane distances", () => {
  const [first, second] = nearestPlaces({ lat: 23.72, lon: 90.39 }, PLACES, 2);
  assert.equal(first.place.id, "lalbagh");
  assert.ok(first.km < 2 && second.km >= first.km);
});

test("every place is inside the map and well formed", () => {
  const ids = PLACES.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const p of PLACES) {
    const { x, y } = project(p.lat, p.lon);
    assert.ok(x > 0 && x < 600 && y > 0 && y < 842, `${p.id} is off the map (${x}, ${y})`);
    assert.ok(p.text && p.best.length, p.id);
    assert.ok(existsSync(`public${p.picture.src}`) && p.picture.alt && p.picture.credit.sourceUrl, p.picture.src);
    if (p.kind === "antique") assert.ok(p.era, `${p.id} needs its age`);
  }
  for (const r of RIVERS) assert.ok(r.path.length > 1, r.name);
});

test("all six landscapes have a guide, with hazards, and something to carry", () => {
  assert.deepEqual(GUIDES.map((g) => g.id), ["hills", "sylhet", "plains", "char", "sea", "rivers"]);
  for (const g of GUIDES) assert.ok(g.watch.length && g.carry.length && g.best, g.id);
  assert.ok(new Set(PLACES.map((p) => p.terrain)).size === 6, "every landscape has a pin");
  assert.ok(HELP.some((h) => h.tel === "999"));
});

test("the contest keeps its promises", () => {
  assert.ok(STORIES.signup.startsWith("/signup?next=/bangladesh/travel/stories"));
  assert.ok(placeById(STORIES.example.placeId));
  assert.match(STORIES.example.title, /Example/);
  assert.ok(SOURCES.every((s) => s.url.startsWith("https://")));
  assert.ok(travelCredits().every(({ credit }) => credit.author && credit.license));
});

test("the six seasons cover the year, and today falls in the right one", () => {
  assert.equal(SEASONS.length, 6);
  for (const season of SEASONS) assert.ok(season.looks.length <= 36, `${season.id}: keep it to one short line`);
  const on = (iso: string) => seasonAt(at(`${iso}T06:00:00Z`), SEASONS).id;
  assert.equal(on("2026-11-04"), "hemonto");
  assert.equal(on("2027-01-01"), "sheet");
  assert.equal(on("2027-02-13"), "sheet");
  assert.equal(on("2027-02-14"), "boshonto");
  assert.equal(on("2027-04-14"), "grishmo");
  assert.equal(on("2027-07-01"), "borsha");
  assert.equal(on("2027-09-01"), "sharot");
  assert.equal(on("2026-12-31"), "sheet");
  assert.deepEqual(SEASONS.filter((s) => s.pick).map((s) => s.id), ["hemonto", "sheet"]);
});

test("the Top 10 is ten open places, in season first, and it moves each week", () => {
  for (let month = 1; month <= 12; month++) {
    const ten = topTen(month, 7);
    assert.equal(ten.length, 10, `month ${month}`);
    assert.equal(new Set(ten.map((p) => p.id)).size, 10);
    assert.ok(ten.every((p) => !p.closed?.includes(month)), `month ${month} sends people somewhere closed`);
    const firstOut = ten.findIndex((p) => !p.best.includes(month));
    if (firstOut !== -1) assert.ok(ten.slice(firstOut).every((p) => !p.best.includes(month)), `month ${month}: in season comes first`);
  }
  assert.notDeepEqual(topTen(11, 1).map((p) => p.id), topTen(11, 2).map((p) => p.id));
  for (const p of PLACES) assert.ok(existsSync(`public${p.picture.src}`), p.picture.src);
});

test("the full-screen old places are on the map and very old", () => {
  assert.equal(OLD_STACK.length, 4);
  for (const { id } of OLD_STACK) assert.equal(placeById(id)?.kind, "antique", id);
});

test("the film of the week changes each Sunday in Dhaka, and never runs out", () => {
  // Sunday 8 November 2026, 00:30 in Dhaka, is still Saturday in UTC.
  assert.equal(weekNumber(at("2026-11-07T18:30:00Z")), weekNumber(at("2026-11-07T17:30:00Z")) + 1);
  assert.equal(weekNumber(at("2026-11-04T06:00:00Z")), weekNumber(at("2026-11-07T17:00:00Z")));
  for (let w = -1; w < 9; w++) assert.ok(filmOfWeek(w)?.film.src.phone, String(w));
  for (const { film } of WEEK_FILMS) assert.ok(existsSync(`public${film.src.phone}`) && existsSync(`public${film.poster}`), film.title);
  assert.notEqual(filmOfWeek(0), filmOfWeek(1));
});

test("a traveller's new place is checked, and says what to fix", () => {
  const good = { name: "  Kazaikat   ghat ", note: " Best at dawn ", level: "moderate" as const, lat: 25.05, lon: 90.15 };
  const made = newPlace(good, 1_000_000);
  assert.ok(made.ok);
  if (made.ok) assert.deepEqual([made.place.name, made.place.note, made.place.level], ["Kazaikat ghat", "Best at dawn", "moderate"]);
  const error = (d: { name?: string; level?: "moderate" | null; lat?: number | null; lon?: number }) => {
    const r = newPlace({ ...good, ...d }, 0);
    return r.ok ? "" : r.error;
  };
  assert.match(error({ name: "   " }), /name/);
  assert.match(error({ level: null }), /crowded/);
  assert.match(error({ lat: null }), /pin/);
  assert.match(error({ lat: 28.6, lon: 77.2 }), /outside Bangladesh/);
  assert.ok(inBangladesh(20.63, 92.32), "St Martin's is in");
});

test("a crowd report ages out, and the time reads naturally", () => {
  const t = 1_800_000_000_000;
  assert.ok(isFresh(t, t + REPORT_FRESH_MS - 1));
  assert.ok(!isFresh(t, t + REPORT_FRESH_MS));
  assert.equal(timeAgo(t, t + 30_000), "just now");
  assert.equal(timeAgo(t, t + 25 * 60_000), "25 min ago");
  assert.equal(timeAgo(t, t + 3_600_000), "1 hour ago");
  assert.equal(timeAgo(t, t + 50 * 3_600_000), "2 days ago");
});

test("the real map's geography lines up with the country", () => {
  const [[west, south], [east, north]] = BD_BOUNDS;
  // Two tiny islands and two places right on the border fall just outside the simplified outline.
  assert.deepEqual(PLACES.filter((p) => !onLand(p.lat, p.lon)).map((p) => p.id).sort(), ["bichanakandi", "choto-sona", "nijhum-dwip", "st-martin"]);
  for (const p of PLACES) assert.ok(p.lat > south && p.lat < north && p.lon > west && p.lon < east, p.id);
  assert.ok(onLand(23.81, 90.41), "Dhaka is on land");
  assert.ok(!onLand(22.57, 88.36), "Kolkata is not in Bangladesh");
  assert.ok(!onLand(19.5, 90.5), "the Bay is not land");
});

test("the map dims the neighbours and draws only the outer border", () => {
  const mask = outsideMask().geometry.coordinates;
  assert.ok(mask.length > divisionShapesCount, "a hole for each division and island");
  const area = (ring: number[][]) => ring.slice(0, -1).reduce((sum, p, i) => sum + p[0] * ring[i + 1][1] - ring[i + 1][0] * p[1], 0);
  assert.ok(area(mask[0]) > 0, "the world runs counter-clockwise");
  for (const hole of mask.slice(1)) assert.ok(area(hole) < 0, "holes run the other way, or they fill in");
  const border = countryBorder().geometry.coordinates;
  assert.ok(border.length > 100);
  // A true outer edge has a neighbour off the land nearby; an inside line has land all round it.
  const inner = border.filter(([[lon, lat]]) => [[0.15, 0], [-0.15, 0], [0, 0.15], [0, -0.15]].every(([a, b]) => onLand(lat + a, lon + b)));
  assert.ok(inner.length < border.length * 0.05, `${inner.length} of ${border.length} border pieces are deep inland`);
});

test("offline save covers the country at a sane size", () => {
  const urls = tilesFor("https://t/{z}/{x}/{y}.pbf", [5, 6, 7, 8, 9, 10]);
  assert.ok(urls.length > 100 && urls.length < 1000, String(urls.length));
  assert.ok(urls.includes("https://t/7/95/55.pbf"), "the tile over Dhaka");
  assert.equal(new Set(urls).size, urls.length);
});

test("the map's style only draws what exists, on open data", () => {
  const style = travelMapStyle();
  const ids = style.layers.map((l) => l.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const l of style.layers) if ("source" in l && l.source) assert.ok(style.sources[l.source as string], `${l.id} needs ${l.source}`);
  assert.ok(ids.indexOf("satellite") < ids.indexOf("outside") && ids.indexOf("outside") < ids.indexOf("cities"), "imagery under the mask, names on top");
  assert.ok(!JSON.stringify(style).includes("key="), "no API key anywhere");
  const osmLayers = style.layers.filter((l) => "source" in l && l.source === "osm");
  assert.ok(!JSON.stringify(osmLayers).includes('["get","name"]'), "no native-script names: they print broken, and cost tiles offline");
});

test("the map's worker is the same version as the library", () => {
  assert.ok(readFileSync("public/vendor/maplibre-gl-worker.mjs").equals(readFileSync("node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs")), "After updating maplibre-gl, copy its worker to public/vendor");
});
