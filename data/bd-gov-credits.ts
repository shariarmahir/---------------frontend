/** Every photograph BD Guide shows, once each, for its credits page. */
import { ABOUT, ALL_TOPICS, BENEFITS, NATIONAL_PORTAL, TOPICS, type Photo } from "./bd-gov.ts";
import { IN_PERSON } from "./bd-gov-services.ts";

export function guidePhotos(): Photo[] {
  const all = [ALL_TOPICS.hero, ABOUT.hero, BENEFITS.hero, NATIONAL_PORTAL.photo, ...[...TOPICS.cards, ...ABOUT.cards, ...BENEFITS.cards].map((c) => c.photo), ...IN_PERSON.map((h) => h.photo)];
  return all.filter((p, i) => all.findIndex((q) => q.src === p.src) === i);
}
