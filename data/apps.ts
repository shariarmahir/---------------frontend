/**
 * The apps the home page offers to download: SWASTI for health and
 * শিক্ষিতদের মিডিয়া for skills and work. SWASTI's name, summary, stage and
 * features come from its product entry, so they cannot drift from
 * /products/swasti.
 *
 * Neither app is in a store yet. A store link is filled in only once the
 * listing is live; until then the badge shows "Coming soon" and is not a
 * link, so the page never sends anyone to a listing that does not exist.
 */

import { getProduct } from "./products";

export type AppId = "swasti" | "media";

export interface StoreLinks {
  googlePlay?: string;
  appStore?: string;
}

export interface KandariApp {
  id: AppId;
  /** The name as the brand writes it (Latin for SWASTI, Bangla for the media). */
  name: string;
  /** The same name in the other script. */
  altName: string;
  /** One short word for what it is for. */
  kind: string;
  tagline: string;
  summary: string;
  features: string[];
  stage: string;
  stores: StoreLinks;
  /** What someone can do today, before the store release. */
  action: { label: string; href: string };
  preview: { kind: "image"; src: string; alt: string } | { kind: "media-reel" };
}

const swasti = getProduct("swasti");
if (!swasti) throw new Error("data/apps: the SWASTI product entry is missing");

export const apps: KandariApp[] = [
  {
    id: "swasti",
    name: swasti.name,
    altName: swasti.nameBn,
    kind: "Health",
    tagline: swasti.tagline,
    summary: swasti.summary,
    features: swasti.capabilities.slice(0, 4).map((c) => c.title),
    stage: swasti.stage,
    stores: {},
    action: { label: "Join the beta", href: "/signup" },
    preview: { kind: "image", src: swasti.image.src, alt: swasti.image.alt },
  },
  {
    id: "media",
    name: "শিক্ষিতদের মিডিয়া",
    altName: "Shikkhitoder Media",
    kind: "Skills & work",
    tagline: "Post a skill. Get verified. Get hired.",
    summary:
      "A social platform built around what you can do, not who you know. Post your work, rate yourself honestly, let the community verify it, and get hired at fair pay, with teams, challenges and a daily plan that keeps work and rest in balance.",
    features: ["Skill posts & self-rating", "Community verification", "Fair-pay jobs", "Teams & daily plan"],
    stage: "Members preview · on the web",
    stores: {},
    action: { label: "Open on the web", href: "/media" },
    preview: { kind: "media-reel" },
  },
];
