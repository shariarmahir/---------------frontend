/**
 * Full national silhouette of Bangladesh in a 0 0 600 760 viewBox.
 *
 * Traced to include every division rather than the central landmass only:
 * the Panchagarh/Tetulia spur in the far north, the Sylhet salient in the
 * north-east, the Khulna/Sundarbans coast and estuary islands in the
 * south-west, and the Chittagong Hill Tracts tail running south to Teknaf.
 */
export const BANGLADESH_FULL_OUTLINE = [
  // Northern spur — Panchagarh / Tetulia.
  "M262,18 L276,10 L288,26 L284,52 L296,74 L288,96",
  // North-west — Thakurgaon, Dinajpur, Rangpur down the Indian border.
  "L262,104 L246,96 L228,112 L214,146 L196,170 L186,206",
  // Rajshahi / Chapainawabganj bulge and the Padma bend.
  "L160,222 L138,252 L146,282 L128,300 L136,330 L120,352",
  // Kushtia / Jessore / Satkhira along the western border.
  "L128,384 L110,404 L118,436 L100,462 L108,494 L92,520",
  // Sundarbans and the south-west deltaic coast.
  "L104,556 L86,578 L96,606 L130,622 L168,614 L198,630",
  // Barisal, Bhola and the estuary mouth.
  "L232,640 L268,628 L296,646 L330,636 L352,652 L378,640",
  // Noakhali / Chittagong coastal strip.
  "L398,610 L416,586 L430,600 L448,588 L462,604",
  // Chittagong Hill Tracts tail down to Cox's Bazar and Teknaf.
  "L476,636 L470,668 L484,694 L478,726 L492,744 L504,730",
  "L510,696 L498,660 L506,624 L492,592 L504,560 L486,532",
  // North along the Myanmar / Indian hill border into Sylhet.
  "L494,498 L478,470 L488,440 L470,412 L482,382 L466,354",
  // Sylhet salient — the north-east projection.
  "L480,322 L508,312 L536,322 L556,300 L542,272 L556,246",
  "L536,226 L508,236 L482,224 L456,236 L430,222 L404,232",
  // Mymensingh / Netrokona along the northern border back to the spur.
  "L378,214 L352,196 L328,206 L306,190 L288,166 L296,138",
  "L282,112 L292,86 L280,60 L286,34 Z",
].join(" ");

/** Division anchor points in the same 600x760 space. */
export interface MapNode {
  id: string;
  cx: number;
  cy: number;
  label: string;
}

export const divisionNodes: MapNode[] = [
  { id: "dhaka", cx: 318, cy: 396, label: "DHAKA" },
  { id: "chittagong", cx: 462, cy: 548, label: "CHATTOGRAM" },
  { id: "sylhet", cx: 500, cy: 286, label: "SYLHET" },
  { id: "rajshahi", cx: 188, cy: 286, label: "RAJSHAHI" },
  { id: "khulna", cx: 166, cy: 520, label: "KHULNA" },
  { id: "barisal", cx: 268, cy: 570, label: "BARISHAL" },
  { id: "rangpur", cx: 240, cy: 140, label: "RANGPUR" },
  { id: "mymensingh", cx: 356, cy: 262, label: "MYMENSINGH" },
];

/** Scatter points that render the country as a dotted lattice fill. */
export const latticeDots: { cx: number; cy: number; r: number }[] = (() => {
  const dots: { cx: number; cy: number; r: number }[] = [];
  // Deterministic pseudo-random so SSR and client agree exactly.
  let seed = 20260919;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  for (let y = 40; y < 740; y += 22) {
    for (let x = 90; x < 560; x += 22) {
      dots.push({
        cx: x + (rand() - 0.5) * 9,
        cy: y + (rand() - 0.5) * 9,
        r: 1.1 + rand() * 1.5,
      });
    }
  }
  return dots;
})();
