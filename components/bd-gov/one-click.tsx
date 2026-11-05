"use client";

import { useState, useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/icon";
import { CHECKED, NEEDS, SERVICES, type NeedId } from "@/data/bd-gov-services";
import { inNeed, searchServices } from "@/lib/bd-gov-services";
import { cn } from "@/lib/utils";
import { CONTAINER } from "./kit";
import { ServiceCard } from "./service-card";

const SUGGESTIONS = ["passport", "NID", "result", "job", "land tax", "bill", "visa"];
const GRID = "grid gap-4 sm:grid-cols-2 xl:grid-cols-3";

const noSubscription = () => () => undefined;

/** What the address asks for, as ?q=passport or ?need=abroad, so the home page and the search box can link here. */
function useAddress() {
  const search = useSyncExternalStore(noSubscription, () => window.location.search, () => "");
  const params = new URLSearchParams(search);
  const need = params.get("need");
  return { q: params.get("q") ?? "", need: NEEDS.some((n) => n.id === need) ? (need as NeedId) : null };
}

/**
 * The national portal's one-click directory: type what you need, or choose a part of
 * life, and each service is one button away from its official page. Every card is in
 * the first page the server sends; typing only filters them.
 */
export function OneClick({ title, lede }: { title: string; lede: string }) {
  const address = useAddress();
  const [typed, setTyped] = useState<string | null>(null);
  const [chosen, setChosen] = useState<NeedId | "all" | null>(null);

  const query = typed ?? address.q;
  const need = chosen === "all" ? null : (chosen ?? address.need);
  const searching = query.trim().length > 0;
  const found = searchServices(SERVICES, query);
  const shown = need ? found.filter((s) => inNeed(s, need)) : found;
  const needName = NEEDS.find((n) => n.id === need)?.name;

  const choose = (next: NeedId | "all") => {
    setChosen(next);
    setTyped("");
  };

  return (
    <>
      <section aria-labelledby="one-click-title" className="bg-gv-navy text-white">
        <div className={cn(CONTAINER, "py-12 lg:py-20")}>
          <h1 id="one-click-title" className="max-w-[20ch] font-gv-serif text-[clamp(2.25rem,4.4vw,3.75rem)] leading-[1.12] font-bold text-balance">
            {title}
          </h1>
          <p className="mt-5 max-w-[60ch] text-[1.13rem] leading-relaxed text-white/90 lg:text-xl">{lede}</p>
          <div className="relative mt-8 max-w-3xl">
            <Icon name="search" className="pointer-events-none absolute top-1/2 left-5 -translate-y-1/2 text-2xl! text-gv-navy" />
            <label htmlFor="service-search" className="sr-only">
              Search government services, in English or Bangla
            </label>
            <input
              id="service-search"
              type="search"
              value={query}
              onChange={(e) => {
                setTyped(e.target.value);
                setChosen("all");
              }}
              placeholder="What do you need? Passport, পাসপোর্ট, land tax…"
              autoComplete="off"
              className="h-16 w-full rounded-xl bg-white pr-5 pl-14 text-lg text-gv-navy shadow-[0_18px_40px_-22px_rgb(0_0_0/0.7)] placeholder:text-gv-ink/60 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gv-gold"
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-white/85">Try:</span>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setTyped(s);
                  setChosen("all");
                }}
                className="min-h-10 cursor-pointer rounded-full px-4 font-semibold text-white ring-1 ring-white/35 transition-colors duration-200 hover:bg-white hover:text-gv-navy focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gv-gold"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="services" aria-label="Government services" className="scroll-mt-4 bg-gv-card-ground py-10 lg:py-14">
        <div className={cn(CONTAINER, "grid gap-8 lg:grid-cols-[16.5rem_minmax(0,1fr)] lg:gap-10")}>
          <nav aria-label="Services by part of life" className="min-w-0 lg:sticky lg:top-4 lg:max-h-[calc(100svh-2rem)] lg:self-start lg:overflow-y-auto">
            <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0 lg:pb-0">
              {[{ id: "all" as const, name: "All services", symbol: "apps" }, ...NEEDS].map((n) => {
                const on = n.id === "all" ? !need : need === n.id;
                return (
                  <li key={n.id} className="shrink-0">
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => choose(n.id)}
                      className={cn(
                        "flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 text-left font-semibold whitespace-nowrap transition-colors duration-200 focus-visible:outline-3 focus-visible:-outline-offset-2 focus-visible:outline-gv-green lg:whitespace-normal",
                        on ? "bg-gv-navy text-white" : "bg-white text-gv-navy ring-1 ring-gv-navy/10 hover:bg-gv-navy/6 lg:bg-transparent lg:ring-0",
                      )}
                    >
                      <Icon name={n.symbol} className="text-[1.3rem]!" />
                      {n.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="min-w-0">
            <p aria-live="polite" className="text-gv-ink/80">
              {searching ? `${shown.length} ${shown.length === 1 ? "service" : "services"} for “${query.trim()}”${needName ? ` in ${needName}` : ""}.` : `${shown.length} official services${needName ? ` in ${needName}` : ""}. Links checked ${CHECKED}.`}
            </p>

            {shown.length === 0 ? (
              <div className="mt-5 rounded-xl bg-white p-6 ring-1 ring-gv-navy/10">
                <p className="text-lg font-bold text-gv-navy">We don&apos;t list that service yet.</p>
                <p className="mt-2">
                  Try another word, call{" "}
                  <a href="tel:333" className="font-bold text-gv-navy underline underline-offset-2">
                    333
                  </a>{" "}
                  for the right office, or look on the{" "}
                  <a href="https://bangladesh.gov.bd/pages/np-services" target="_blank" rel="noopener noreferrer" className="font-bold text-gv-navy underline underline-offset-2">
                    national portal&apos;s full list
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                  .
                </p>
              </div>
            ) : searching || need ? (
              <ul className={cn(GRID, "mt-5")}>
                {shown.map((s) => (
                  <li key={s.id} className="flex">
                    <ServiceCard service={s} />
                  </li>
                ))}
              </ul>
            ) : (
              NEEDS.map((n) => {
                const group = shown.filter((s) => s.need === n.id);
                if (!group.length) return null;
                return (
                  <section key={n.id} aria-labelledby={`need-${n.id}`} className="mt-10 first-of-type:mt-6">
                    <h2 id={`need-${n.id}`} className="flex flex-wrap items-baseline gap-x-3 font-gv-serif text-[1.6rem] leading-tight font-bold text-gv-navy">
                      {n.name}
                      <span lang="bn" className="font-bengali text-[1.05rem] font-medium text-gv-ink/70">
                        {n.bn}
                      </span>
                    </h2>
                    <ul className={cn(GRID, "mt-4")}>
                      {group.map((s) => (
                        <li key={s.id} className="flex">
                          <ServiceCard service={s} />
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })
            )}
          </div>
        </div>
      </section>
    </>
  );
}
