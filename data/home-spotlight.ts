/**
 * Home spotlight band — the narrow announcement slider under the hero
 * (modelled on banglalink.net's headline slider).
 *
 * The band is English only: every string a slide shows is written here,
 * so the Bangla announcement copy in `announcements` (still used on the
 * account page) never leaks into it. Links come from `announcements` and
 * `nationalStats`, so a changed destination there follows through.
 *
 * Slides interleave announcements with indicators so two of a kind never
 * sit next to each other.
 */

import { announcements } from "@/data/announcements";
import { nationalStats, type RiskTone } from "@/data/national-index";

/** The motion graphic laid over (or standing in for) a pill's photo. */
export type SpotlightMotif =
  /** ECG trace sweeping across — health, urgency. */
  | "pulse"
  /** A light bar scanning left to right — hardware, research. */
  | "scan"
  /** Equaliser bars rising and falling — data, engineering. */
  | "bars"
  /** Radar rings spreading from the centre — a release, a new reach. */
  | "ping"
  /** A meter filling to a value — national indicators. */
  | "meter";

export interface SpotlightSlide {
  id: string;
  /** Line 1, centred. */
  headline: string;
  /** Line 2, left of the pill — set in grey. */
  lead: string;
  /** Line 2, right of the pill — set in gold. */
  tail: string;
  /** Arrow before the tail (indicator movement). */
  tailArrow?: "up" | "down";
  /** Not shown on the band since 2026-10-21: read to screen readers and set as the slide's tooltip (an indicator's source lives here). */
  sub: string;
  /** Where the slide links; the label is read to screen readers. */
  cta: { label: string; href: string };
  media: {
    /** Omit for a pure motion-graphic pill. */
    src?: string;
    alt: string;
    /** CSS object-position, for crops that need steering. */
    position?: string;
    motif: SpotlightMotif;
    /** Meter fill, 0–100 (motif "meter"). */
    progress?: number;
    /** Meter colour: critical readings run red, the rest gold. */
    tone?: RiskTone;
  };
}

/** English copy and pill media per announcement id. */
const ANNOUNCEMENT_COPY: Record<
  string,
  Pick<SpotlightSlide, "headline" | "lead" | "tail" | "media"> & { sub: string; cta: string }
> = {
  "job-embedded": {
    headline: "New Job Opening",
    lead: "Embedded",
    tail: "Engineer",
    sub: "Embedded firmware engineer for the Aponjon wearable team",
    cta: "Apply Now",
    media: { src: "/sections/device.png", alt: "Aponjon wearable band on a wrist", position: "50% 55%", motif: "scan" },
  },
  "event-fair": {
    headline: "Kandari",
    lead: "Innovation",
    tail: "Fair",
    sub: "Project submissions are open for young innovators",
    cta: "Register",
    media: { src: "/services/automation.webp", alt: "Robotic arm", position: "40% 45%", motif: "scan" },
  },
  "program-intern": {
    headline: "R&D Internship",
    lead: "New",
    tail: "Batch",
    sub: "Applications are open for the new 2.5-month R&D batch",
    cta: "Apply Now",
    media: { src: "/services/iot.webp", alt: "Sensor and microcontroller breadboard", motif: "bars" },
  },
  "release-swasti": {
    headline: "SWASTI App",
    lead: "Beta",
    tail: "Release",
    sub: "Join the early-access list for the SWASTI beta",
    cta: "Join Now",
    media: { src: "/sections/mobileapp.png", alt: "SWASTI app on a phone screen", position: "50% 38%", motif: "ping" },
  },
  "job-ml": {
    headline: "We're Hiring",
    lead: "Bangla NLP",
    tail: "Engineer",
    sub: "Bangla NLP and machine learning engineer for the SWASTI team",
    cta: "Apply Now",
    media: { src: "/services/development.webp", alt: "Data dashboard", motif: "bars" },
  },
  "event-hackathon": {
    headline: "HealthTech Hackathon",
    lead: "Golden",
    tail: "Two Hours",
    sub: "Form a team to solve the Golden Two Hours problem",
    cta: "Register Team",
    media: { src: "/services/ai.webp", alt: "Young team working at a hackathon", position: "50% 40%", motif: "scan" },
  },
  "news-village": {
    headline: "One Village",
    lead: "One",
    tail: "Health Center",
    sub: "One Village, One Medical Health Care Center — progress on the rural smart pharmacy pilot",
    cta: "Learn More",
    media: { src: "/sections/smartpharmacy.png", alt: "Village smart pharmacy", position: "60% 50%", motif: "ping" },
  },
};

/** Pill media per indicator id. No photo where none would be honest. */
const INDICATOR_MEDIA: Record<string, { src?: string; alt: string; position?: string }> = {
  "world-rank": { src: "/bangladesh/padmabridge.jpg", alt: "Padma Bridge" },
  "air-quality": { src: "/bangladesh/winterfog.jpg", alt: "Fields under winter haze", position: "60% 50%" },
  productivity: { src: "/bangladesh/rural/sowing-paddy.jpg", alt: "Farmer sowing paddy" },
  "external-debt": { alt: "External debt meter" },
  "factory-shutdown": { src: "/bangladesh/rural/garment-machine.jpg", alt: "Garment factory workers", position: "60% 45%" },
  "judgment-ratio": { alt: "Judgment clearance meter" },
};

/** Units short enough to sit in the 72px headline; longer ones are dropped. */
function leadFor(value: string, unit?: string) {
  if (!unit) return value;
  if (unit === "%" || unit === "B") return `${value}${unit}`;
  if (unit.startsWith("/")) return `${value} ${unit}`;
  return value;
}

const GOLDEN: SpotlightSlide = {
  id: "golden-protocol",
  headline: "Golden 2-Hours",
  lead: "Critical",
  tail: "Response",
  sub: "The first two hours of treatment change survival odds — the Golden 2-Hours Critical Response Protocol",
  cta: { label: "View Protocol", href: "/products/swasti" },
  media: { alt: "Heartbeat trace", motif: "pulse" },
};

const announcementSlides: SpotlightSlide[] = announcements
  .filter((a) => ANNOUNCEMENT_COPY[a.id])
  .map((a) => {
    const { cta, ...copy } = ANNOUNCEMENT_COPY[a.id];
    return { id: a.id, cta: { label: cta, href: a.href }, ...copy };
  });

const indicatorSlides: SpotlightSlide[] = Object.keys(INDICATOR_MEDIA)
  .map((id) => nationalStats.find((s) => s.id === id))
  .filter((s): s is NonNullable<typeof s> => Boolean(s))
  .map((s) => ({
    id: `stat-${s.id}`,
    headline: s.label,
    lead: leadFor(s.value, s.unit),
    tail: s.delta ?? "",
    tailArrow: s.deltaDirection,
    sub: `${s.caption}. Source: ${s.source}`,
    cta: { label: "View National Index", href: "/bangladesh#national-index" },
    media: { ...INDICATOR_MEDIA[s.id], motif: "meter" as const, progress: s.progress, tone: s.tone },
  }));

/** Golden protocol first, then announcement / indicator alternating. */
function interleave(a: SpotlightSlide[], b: SpotlightSlide[]) {
  const out: SpotlightSlide[] = [];
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i]) out.push(a[i]);
    if (b[i]) out.push(b[i]);
  }
  return out;
}

export const spotlightSlides: SpotlightSlide[] = [
  GOLDEN,
  ...interleave(announcementSlides, indicatorSlides),
];
