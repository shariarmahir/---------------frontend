import { pic } from "./motherland-blocks.ts";
import type { Picture } from "./motherland.ts";

const need = (key: string, alt: string): Picture => {
  const picture = pic(key, alt);
  if (!picture) throw new Error(`MOTHERLAND: no photograph called ${key}`);
  return picture;
};

/** The three pages with no section of their own on the landing page. */
export const ESSENTIALS = {
  title: "Three more ways in",
  lede: "The real numbers, every public service and a trip you can plan today.",
  cards: [
    { title: "Facts about Bangladesh", text: "The proud numbers and the hard ones, side by side.", cta: { label: "Read the facts", href: "/bangladesh/facts" }, picture: need("dhaka-air", "Dhaka from the air, a river running through the city") },
    { title: "Government guide", text: "How the state works, and every service one click from its official page.", cta: { label: "Open the guide", href: "/bangladesh/government" }, picture: need("court-supreme", "The Supreme Court of Bangladesh in Dhaka") },
    { title: "Plan your trip", text: "Choose places, month and days, and see the route and the cost.", cta: { label: "Plan a trip", href: "/bangladesh/travel#plan" }, picture: need("sajek-mist", "Morning mist over the hills at Sajek") },
  ],
};
