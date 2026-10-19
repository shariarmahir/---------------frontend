"use client";

import { OpenBand } from "../open-band";
import { Panel } from "../panel";
import { useWallData } from "../wall-context";

/** Where the data comes from and how to take the wall anywhere: TV, live stream, embed and the open API. */
export function OpenPage() {
  const w = useWallData();
  return (
    <div className="grid gap-4">
      <OpenBand feeds={w.data.feeds} />
      <Panel title="Open API" sub="Free, no key, CORS open · refreshes every minute" icon="api" field="navy">
        <div className="grid gap-3 px-5 pb-5 lg:grid-cols-2">
          <pre className="overflow-x-auto rounded-xl bg-black/50 p-4 font-mono text-xs leading-relaxed text-white/85 ring-1 ring-white/10">
            {`GET /api/tv-wall

{
  "generatedAt": 1792380000000,
  "newsAt": 1792379900000,
  "items": [{ "title", "url", "source", "alsoIn",
              "publishedAt", "category", "severity",
              "crimeKind", "district", "division" }],
  "feeds": [{ "id", "label", "ok", "count" }],
  "cities": [{ "id", "temp", "aqi", "rainToday", ... }],
  "quakes": [{ "mag", "place", "km", "time", "url" }],
  "fx": { "updatedAt", "rates": [{ "code", "bdt" }] },
  "channels": [{ "id", "name", "videoId" }]
}`}
          </pre>
          <div className="space-y-3 font-sans text-sm leading-relaxed text-white/80">
            <p>
              Every item links to the outlet that published it; the wall only indexes headlines. Categories, districts and severity are worked out from each headline&apos;s own words, so treat them as a reading of the press, not as official statistics.
            </p>
            <p>
              Districts use the ids in <code className="rounded bg-black/40 px-1 font-mono text-xs">data/tv-wall/districts-map.ts</code> (e.g. <code className="rounded bg-black/40 px-1 font-mono text-xs">coxs-bazar</code>); severity runs from 1 (minor) to 3 (a life lost or a violent crime).
            </p>
          </div>
        </div>
      </Panel>
    </div>
  );
}
