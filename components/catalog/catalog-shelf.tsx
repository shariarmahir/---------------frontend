import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { btn } from "@/components/ui/section-kit";
import type { AppId, KandariApp } from "@/data/apps";
import { cn } from "@/lib/utils";
import { CatalogCard, type CatalogItem } from "./catalog-card";

/** The catalogue rows run the full width of the screen, with the page gutter (the home page's product and service rows too). */
export const WIDE = "mx-auto w-full max-w-[120rem] px-gutter-x";

/**
 * One row of the catalogue: the title (and a link to the full list) over a
 * cobalt intro panel and the cards, photos square. Three cards share a row
 * of four with the panel; four sit two by two beside a tall panel, and in
 * one row of five on wide screens.
 */
export function CatalogShelf({
  id,
  title,
  link,
  intro,
  items,
}: {
  id: string;
  title: string;
  link?: { label: string; href: string };
  intro: { title: string; body: string; href: string; cta: string };
  items: CatalogItem[];
}) {
  const many = items.length > 3;
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="section-band scroll-mt-header lg:scroll-mt-header-lg">
      <div className={WIDE}>
        <div className="story-reveal mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 id={`${id}-title`} className="font-grotesk text-3xl font-bold tracking-tight text-signal-orange sm:text-4xl">
            {title}
          </h2>
          {link ? (
            <Link href={link.href} className={btn.goldOutline}>
              {link.label}
            </Link>
          ) : null}
        </div>

        <div className={cn("grid gap-6 sm:grid-cols-2", many ? "lg:grid-cols-3 xl:grid-cols-5" : "lg:grid-cols-4")}>
          <div
            className={cn(
              "flex flex-col justify-between gap-8 rounded-3xl bg-cobalt p-7 text-white ring-1 ring-white/12 sm:p-8",
              many && "sm:col-span-2 lg:col-span-1 lg:row-span-2 xl:row-span-1",
            )}
          >
            <div className="flex flex-col gap-3">
              <h3 className="font-grotesk text-2xl leading-snug font-bold text-signal-orange xl:text-3xl">{intro.title}</h3>
              <p className="font-sans text-base leading-relaxed text-white/80">{intro.body}</p>
            </div>
            <Link href={intro.href} className={cn(btn.gold, "self-start")}>
              {intro.cta}
            </Link>
          </div>

          {items.map((item) => (
            <CatalogCard
              key={item.href}
              item={item}
              ratio="square"
              sizes={many ? "(min-width: 1280px) 20vw, (min-width: 640px) 45vw, 100vw" : "(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 100vw"}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/** Each app's icon tile and card field. */
const APP_LOOKS: Record<AppId, { icon: string; field: string }> = {
  swasti: { icon: "health_and_safety", field: "bg-cobalt" },
  media: { icon: "groups", field: "bg-bdnavy-900" },
};

/**
 * The apps band between the products and the services: one card per app
 * (SWASTI for health, চেতনা for skills and work), each with its
 * icon tile, what it does, how to use it today, and its two stores. A
 * store is a link only once its listing is live; until then it says
 * "coming soon" (data/apps.ts).
 */
export function AppDownload({ apps }: { apps: KandariApp[] }) {
  return (
    <section id="app" aria-labelledby="app-download-title" className={cn(WIDE, "section-band")}>
      <h2 id="app-download-title" className="story-reveal mb-8 font-grotesk text-3xl font-bold tracking-tight text-signal-orange sm:text-4xl">
        Get our apps
      </h2>
      <ul className="grid gap-6 lg:grid-cols-2">
        {apps.map((app) => {
          const look = APP_LOOKS[app.id];
          const stores = [
            { icon: "shop", label: "Google Play", href: app.stores.googlePlay },
            { icon: "phone_iphone", label: "App Store", href: app.stores.appStore },
          ];
          return (
            <li key={app.id} className={cn("story-reveal flex flex-col gap-6 rounded-3xl p-8 text-white ring-1 ring-white/12 sm:p-10", look.field)}>
              <div className="flex items-center gap-4">
                <span aria-hidden className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-signal-orange text-text-primary shadow-[0_5px_0_rgb(0_0_0/0.35)]">
                  <Icon name={look.icon} filled className="text-4xl!" />
                </span>
                <div className="flex min-w-0 flex-col gap-1">
                  <h3 className="font-grotesk text-2xl font-bold text-signal-orange sm:text-3xl">{app.name}</h3>
                  <p className="font-sans text-sm font-semibold text-white/80">
                    {app.kind} · {app.stage}
                  </p>
                </div>
              </div>
              <p className="max-w-xl font-sans text-base leading-relaxed text-white/80">{app.summary}</p>
              <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                {app.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 font-grotesk text-sm font-bold text-white">
                    <Icon name="check_circle" filled className="text-xl text-signal-orange" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex flex-col items-start gap-4 pt-2">
                <Link href={app.action.href} className={btn.gold}>
                  {app.action.label}
                </Link>
                <div className="flex flex-wrap items-center gap-2 font-sans text-sm text-white/65">
                  {stores.some((store) => !store.href) ? <span className="mr-1">Coming soon on</span> : null}
                  {stores.map((store) =>
                    store.href ? (
                      <a
                        key={store.label}
                        href={store.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 font-semibold text-white ring-1 ring-white/40 transition-colors duration-200 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
                      >
                        <Icon name={store.icon} className="text-lg" />
                        {store.label}
                      </a>
                    ) : (
                      <span key={store.label} className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 font-semibold text-white/80 ring-1 ring-white/25">
                        <Icon name={store.icon} className="text-lg" />
                        {store.label}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/**
 * A narrow promotion strip under the services: need something built? One
 * line, and the way to start.
 */
export function ServiceRequest({ href }: { href: string }) {
  return (
    <section aria-labelledby="service-request-title" className={cn(WIDE, "pb-seam")}>
      <div className="story-reveal flex flex-col gap-5 rounded-3xl bg-bdnavy-900 px-7 py-6 ring-1 ring-white/12 sm:flex-row sm:items-center sm:gap-8 sm:px-10">
        <Icon name="handshake" className="text-5xl! text-signal-orange" />
        <div className="flex flex-1 flex-col gap-1">
          <h2 id="service-request-title" className="font-grotesk text-2xl font-bold text-signal-orange">
            Need a service built?
          </h2>
          <p className="font-sans text-base leading-relaxed text-white/80">
            Factory, office, farm or app: join Kandari Profile, then tell us the problem and we scope it with you.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={href} className={btn.gold}>
            Request a service
          </Link>
          <Link href="/services#process" className={btn.goldOutline}>
            How it works
          </Link>
        </div>
      </div>
    </section>
  );
}
