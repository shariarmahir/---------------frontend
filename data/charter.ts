/**
 * The charter: problem, challenge, vision, mission, goal and impact, one
 * card each on the home page's reel (components/sections/charter-reel.tsx)
 * and one chapter each on the About page.
 *
 * The challenge, vision, mission, goal and impact copy is Mahir's own
 * (2026-10-15). Every figure comes from the national dossier
 * (data/amar-bangladesh.ts) or the product and service lists, and is counted
 * from them here rather than typed in, so it cannot drift.
 */

import { baselineStats, priorityBreaks, sourcePoints } from "./amar-bangladesh";
import { modules } from "./gori/modules";
import { products } from "./products";
import { services } from "./services";

export interface CharterStat {
  value: number;
  /** Shown after the counted number, e.g. "%" or "M". */
  suffix?: string;
  /** Decimal places while counting. */
  decimals?: number;
  label: string;
  note: string;
}

export interface CharterSlide {
  id: string;
  /** The title's plain first line, then its coloured second line. */
  title: [lead: string, accent: string];
  /** The accent line struck through (the vision slide: "in Vision"). */
  strike?: boolean;
  /** The whole text, for the About page. */
  body: string[];
  /**
   * The home card's text: the body in short sentences, its meaning kept
   * (Mahir, 2026-10-21; the impact line written to match the others).
   */
  summary: string;
  stats?: CharterStat[];
  /** A short list of pillars under the copy (the mission's smart · safe · secure). */
  pillars?: { icon: string; label: string }[];
  /** A single word set large in its own box (the vision's "Development"). */
  oneWord?: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
}

const veryHigh = sourcePoints.filter((p) => p.urgency === "very-high").length;
const themes = new Set(sourcePoints.map((p) => p.theme)).size;
const verified = sourcePoints.filter((p) => p.status === "verified").length;
const learning = priorityBreaks.find((b) => b.id === "learning")!;
const corruption = priorityBreaks.find((b) => b.id === "corruption")!;
const sanitation = baselineStats.find((s) => s.id === "sanitation")!;
const population = Number(baselineStats.find((s) => s.id === "population")!.value);

export const charterSlides: CharterSlide[] = [
  {
    id: "problem",
    title: ["Bangladesh", "Problem Statement"],
    summary:
      "Bangladesh is a high-resolution image with corrupted pixels. We map 32 of them, from healthcare and bribery to river pollution and women’s safety. Each failure drags the others down.",
    body: [
      "Bangladesh is a high-resolution image with corrupted pixels. Our dossier maps 32 of them, BD-001 to BD-032: from healthcare access, fake markets and bribery to river pollution, energy load and women’s safety. Each failure drags the others down.",
    ],
    stats: [
      { value: sourcePoints.length, label: "Mapped", note: "problems, BD-001 to BD-032" },
      { value: veryHigh, label: "Urgent", note: "rated very-high urgency" },
      { value: verified, label: "Verified", note: "backed by measured evidence" },
    ],
    primary: { label: "Learn more", href: "/bangladesh" },
    secondary: { label: "Play the 32", href: "/cholo-bangladesh-gori" },
  },
  {
    id: "challenge",
    title: ["The Challenge", "We Accepted"],
    summary:
      "Education, security and livability come first. Keeping development going here is hard, and strong forces push back. We accept the challenge and keep building solutions. It is now or never.",
    body: [
      "The challenge is to prioritize education, security, and livability for Bangladesh. In Bangladesh, it is too difficult to hold the continuous development process and work against the dynamic forces imposed upon it. Kandari Lab accepts this challenge and will continue to develop solutions since we understand that it is now or never!",
    ],
    stats: [
      { value: Number(learning.headline), suffix: "%", label: "Education", note: "of ten-year-olds read well" },
      { value: Number(corruption.headline), suffix: "/100", label: "Security", note: "corruption perception score" },
      { value: Number(sanitation.value), suffix: "%", label: "Livability", note: "have safe sanitation" },
    ],
    primary: { label: "Learn more", href: "/cholo-bangladesh-gori" },
    secondary: { label: "Rights & duties", href: "/nagorik" },
  },
  {
    id: "vision",
    title: ["We Don’t Believe", "in Vision"],
    strike: true,
    summary:
      "A vision has a timeline; our responsibility has none. Our problems are still killing us, so we act now. We build goods, launch services and choose R&D themes. In one word: development.",
    body: [
      "We don’t believe in vision since it has a timeline. We promise to hold our responsibility without any time limitation because all of our problems are still killing us. We assume responsibility for limitation because first identify timeline problems. We are already developing certain goods, launching services, and choosing R&D themes.",
    ],
    oneWord: "Development",
    primary: { label: "Learn more", href: "/research" },
    secondary: { label: "Our services", href: "/services" },
  },
  {
    id: "mission",
    title: ["A New, Smart,", "Safe & Secure Bangladesh"],
    summary:
      "We use commercial innovation and technology to solve real problems. We are building a new, smart, safe and secure Bangladesh. We exist for its people, and for their problems.",
    body: [
      "Our goal is to use commercial innovations and technology to solve all actual problems and create a new, smart, safe, and secure Bangladesh for the people of Bangladesh. It was established for the people of Bangladesh to address their problems.",
    ],
    pillars: [
      { icon: "memory", label: "Smart" },
      { icon: "health_and_safety", label: "Safe" },
      { icon: "verified_user", label: "Secure" },
    ],
    primary: { label: "Learn more", href: "/products" },
    secondary: { label: "Join Kandari Profile", href: "/#kandari-profile" },
  },
  {
    id: "goal",
    title: ["No One Goal.", "An Unending War."],
    summary:
      "Kandari Lab works for Bangladesh and never tires of solving its problems. It is a continuous process, so there is no one goal. Our war never ends: a kinetic process that solves problem after problem. We will keep going till doomsday, solving the human problems of this era.",
    body: [
      "Kandari Lab does everything for Bangladesh. Kandari Lab never tires of solving problems for the country. It is a continuous process; hence, there is no one goal. We begin the war with an unending procedure. That is why its duty can be remarked as a kinetic process that solves infinite problems. Therefore, Kandari Lab will exist till doomsday and continue to solve all the human problems of this human era.",
    ],
    primary: { label: "Learn more", href: "/team" },
    secondary: { label: "Report a problem", href: "/protibad" },
  },
  {
    id: "impact",
    title: ["The Impact", `for ${population} Million`],
    summary:
      "Impact is the gap we close between how hard a problem hits and how far our solutions reach. We track it across our products, services, platform and R&D, for every person in Bangladesh, one pixel at a time.",
    body: [
      "Impact is not a slogan — it is the delta between problem intensity and solution coverage across products, services, social media, and R&D, mapped against our mission-vision covenant.",
    ],
    stats: [
      { value: modules.length, label: "Problems", note: "targeted, of 32 mapped" },
      { value: products.length, label: "Products", note: "in build, healthcare first" },
      { value: services.length, label: "Services", note: "open to clients" },
      { value: themes, label: "Sectors", note: "the 32 cut across" },
    ],
    primary: { label: "Learn more", href: "/bangladesh" },
    secondary: { label: "See the products", href: "/products" },
  },
];

/** People and places for the mission network (World Bank 2025; administrative units). */
export const missionReach = [
  { value: `${population}M`, label: "people" },
  { value: "8", label: "divisions" },
  { value: "64", label: "districts" },
  { value: "495", label: "upazilas" },
];

