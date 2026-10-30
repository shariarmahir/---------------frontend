/**
 * The charter topics' colour fields, names and symbols, shared by the home
 * page's charter accordion and the About page's chapters, so a topic wears
 * the same field wherever it appears.
 */

const GOLD = "var(--color-signal-orange)";
const NAVY = "var(--color-bdnavy-900)";
const INK = "var(--color-text-primary)";
const WHITE = "var(--color-white)";
const COBALT = "var(--color-cobalt)";

export type CharterLook = { gold: boolean; vars: Record<string, string> };

/**
 * Per field: the fill, text colour, accent (gold),
 * the motion graphic's second colour and tint, and the glow of the open card.
 */
const LOOK_NAVY: CharterLook = {
  gold: false,
  vars: {
    "--field": NAVY,
    "--ink": WHITE,
    "--accent": GOLD,
    "--accent-2": WHITE,
    "--accent-3": "var(--color-bdnavy-300)",
    "--accent-on": INK,
    "--glow": "var(--color-bdnavy-400)",
  },
};
const LOOK_INK: CharterLook = {
  gold: false,
  vars: {
    "--field": INK,
    "--ink": WHITE,
    "--accent": GOLD,
    "--accent-2": WHITE,
    "--accent-3": `color-mix(in oklab, ${GOLD} 45%, ${WHITE})`,
    "--accent-on": INK,
    "--glow": GOLD,
  },
};
/** Cobalt replaced the gold field on 2026-10-18 (Mahir): gold now only for titles, accents and buttons. */
const LOOK_COBALT: CharterLook = {
  gold: false,
  vars: {
    "--field": COBALT,
    "--ink": WHITE,
    "--accent": GOLD,
    "--accent-2": WHITE,
    "--accent-3": "var(--color-bdnavy-300)",
    "--accent-on": INK,
    "--glow": COBALT,
  },
};

/** The three fields by name, for other rows built like the charter (the home page's promo row). */
export const FIELD_LOOKS: Record<"navy" | "ink" | "cobalt", CharterLook> = { navy: LOOK_NAVY, ink: LOOK_INK, cobalt: LOOK_COBALT };

/** No two neighbours share a field. */
export const CHARTER_LOOKS: Record<string, CharterLook> = {
  problem: LOOK_NAVY,
  challenge: LOOK_INK,
  vision: LOOK_COBALT,
  mission: LOOK_NAVY,
  goal: LOOK_COBALT,
  impact: LOOK_INK,
};

/** Each topic's name and symbol. */
export const CHARTER_TOPIC: Record<string, { name: string; icon: string }> = {
  problem: { name: "Problem", icon: "broken_image" },
  challenge: { name: "Challenge", icon: "flag" },
  vision: { name: "Vision", icon: "visibility" },
  mission: { name: "Mission", icon: "rocket_launch" },
  goal: { name: "Goal", icon: "track_changes" },
  impact: { name: "Impact", icon: "diversity_3" },
};

