"use client";

import Image from "next/image";
import { useState, useSyncExternalStore } from "react";
import { Sparkle } from "@/components/motherland/poster";
import { Icon } from "@/components/ui/icon";
import type { Photo } from "@/data/bd-gov";
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
 * life, and each service is one button away from its official page. It opens on a
 * night-navy band in the poster cards' dress: a photograph melting in from the right,
 * a serif title, the search, and a foot line with the government's numbers. Every card is in
 * the first page the server sends; typing only filters them.
 */
export function OneClick({ title, lede, line, photo, stats }: { title: string; lede: string; line: string; photo: Photo; stats: { value: string; label: string }[] }) {
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
      <section aria-labelledby="one-click-title" className="relative isolate overflow-hidden bg-ml-night text-white">
        <div className="absolute inset-0 -z-10 lg:left-[38%]">
          <Image src={photo.src} alt={photo.alt} fill priority sizes="(min-width: 1024px) 62vw, 100vw" className="object-cover opacity-60 lg:opacity-100" style={{ objectPosition: photo.focus }} />
          <span aria-hidden className="absolute inset-0 bg-linear-to-t from-ml-night via-ml-night/70 to-ml-night/40 lg:bg-linear-to-r lg:from-ml-night lg:via-ml-night/55 lg:via-35% lg:to-ml-night/10" />
          <span aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-b from-transparent to-ml-night" />
        </div>

        <div className={cn(CONTAINER, "flex min-h-[40rem] flex-col pt-14 pb-8 lg:min-h-[44rem] lg:pt-20")}>
          <p className="font-ml-serif text-base text-white/90">{line}</p>
          <h1 id="one-click-title" className="mt-5 max-w-[15ch] font-ml-serif text-[clamp(2.6rem,5.4vw,4.9rem)] leading-[1.04] font-normal tracking-[-0.015em] text-balance text-ml-paper">
            {title}
          </h1>
          <p className="mt-5 max-w-[54ch] text-[1.13rem] leading-relaxed text-white/75 lg:text-xl">{lede}</p>

          <div className="relative mt-9 max-w-2xl">
            <Icon name="search" className="pointer-events-none absolute top-1/2 left-6 -translate-y-1/2 text-2xl! text-ml-night" />
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
              className="h-16 w-full rounded-full bg-white pr-6 pl-15 text-lg text-ml-night shadow-[0_24px_50px_-24px_rgb(0_0_0/0.8)] placeholder:text-gv-ink/55 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-signal-orange"
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[15px] text-white/70">Try</span>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setTyped(s);
                  setChosen("all");
                  document.getElementById("services")?.scrollIntoView({ block: "start" });
                }}
                className="h-9 cursor-pointer rounded-full px-4 text-sm font-medium text-white/90 ring-1 ring-white/35 transition-colors duration-300 hover:bg-white hover:text-ml-night hover:ring-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-orange"
              >
                {s}
              </button>
            ))}
          </div>

          <div className="mt-auto flex flex-col gap-3 border-t border-white/15 pt-6 text-[15px] text-white/70">
            <dl aria-label="The government at a glance" className="flex flex-wrap items-center gap-x-3 gap-y-2">
              {stats.map((st, i) => (
                <div key={st.label} className="flex items-center gap-3">
                  {i ? <Sparkle /> : null}
                  <div className="flex items-baseline gap-1.5">
                    <dt className="order-last">{st.label.toLowerCase()}</dt>
                    <dd className="font-semibold text-white tabular-nums">{st.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
            <p className="text-white/60">Every link opened and checked on {CHECKED}</p>
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
                    <h2 id={`need-${n.id}`} className="flex flex-wrap items-baseline gap-x-3 font-ml-serif text-[1.85rem] leading-tight font-normal text-gv-navy">
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
