import type { NeedId, Service } from "../data/bd-gov-services.ts";

const clean = (text: string) => text.toLowerCase().normalize("NFC").trim();

/** Everything a person might type to find a service, in English or Bangla. */
const haystack = (s: Service) => clean([s.name, s.bn, s.what, s.words ?? ""].join(" "));

/** Services matching every word typed: those whose name holds the very word first, so "train" finds trains before training. Nothing typed returns them all. */
export function searchServices(services: Service[], query: string): Service[] {
  const words = clean(query).split(/\s+/).filter(Boolean);
  if (!words.length) return services;
  const score = (s: Service) => {
    const name = clean(`${s.name} ${s.bn}`);
    const whole = name.split(/[\s,:()]+/);
    return words.reduce((total, w) => total + (whole.includes(w) ? 3 : name.includes(w) ? 1 : 0), 0);
  };
  return services.filter((s) => words.every((w) => haystack(s).includes(w))).sort((a, b) => score(b) - score(a));
}

export const inNeed = (service: Service, need: NeedId) => service.need === need || Boolean(service.also?.includes(need));

/** The site's name as people read it in the address bar. */
export const hostOf = (href: string) => new URL(href).hostname.replace(/^www\./, "");
