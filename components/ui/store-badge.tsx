import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const STORES = {
  "google-play": {
    name: "Google Play",
    live: "Get it on",
    platform: "Android",
    icon: "android",
    glyph: (
      <path d="M4.6 2.7 13.9 12l-9.3 9.3a1.3 1.3 0 0 1-.6-1.1V3.8c0-.5.2-.9.6-1.1Zm10.4 10.4 2.4 2.4-10.5 6 8.1-8.4Zm3.7-3.6 2.6 1.5c.9.5.9 1.6 0 2.1l-2.6 1.5-2.7-2.6 2.7-2.5ZM6.9 2.5l10.5 6L15 10.9 6.9 2.5Z" />
    ),
  },
  "app-store": {
    name: "App Store",
    live: "Download on the",
    platform: "iPhone",
    icon: "phone_iphone",
    glyph: (
      <path d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.9-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 6.9 1.2 9.1.8 1.1 1.7 2.3 2.8 2.3 1.1 0 1.6-.7 3-.7s1.8.7 3 .7c1.2 0 2-1.1 2.7-2.2.9-1.3 1.2-2.5 1.2-2.6 0 0-2.3-.9-2.3-3.7ZM14.2 5.8c.6-.8 1-1.8.9-2.8-.9 0-2 .6-2.6 1.4-.6.7-1.1 1.7-.9 2.7 1 .1 2-.5 2.6-1.3Z" />
    ),
  },
} as const;

export type Store = keyof typeof STORES;

/**
 * A store badge, black as the stores draw them. With a listing URL it is the store's badge and a
 * link out. Without one it is a plain "Coming soon" badge for the platform, never a dead link,
 * and without the store's mark: Apple and Google allow their badges only for apps that are live
 * in their stores. Once a listing is live, the stores' official badge artwork belongs here.
 */
export function StoreBadge({ store, href }: { store: Store; href?: string }) {
  const s = STORES[store];
  // The kit buttons' height and corner, so a badge lines up beside them. Below sm two badges share one row as equal halves.
  const shape =
    "inline-flex h-12 items-center gap-2 rounded-xl bg-black px-3.5 text-white ring-1 ring-white/20 max-sm:w-full max-sm:gap-1.5 max-sm:px-2.5 max-sm:whitespace-nowrap";

  if (!href) {
    return (
      <span className={cn(shape, "cursor-default")}>
        <Icon name={s.icon} className="text-xl! shrink-0" />
        <span className="leading-none">
          <span className="block text-xs font-medium tracking-wide max-sm:tracking-normal">Coming soon</span>
          <span className="mt-0.5 block font-grotesk text-sm font-semibold">{s.platform}</span>
        </span>
        <span className="sr-only"> (not yet in the {s.name})</span>
      </span>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        shape,
        "transition-[translate] duration-200 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
      )}
    >
      <svg viewBox="0 0 24 24" aria-hidden className="size-5.5 shrink-0 fill-current">
        {s.glyph}
      </svg>
      <span className="leading-none">
        <span className="block text-xs font-medium tracking-wide max-sm:tracking-normal">{s.live}</span>
        <span className="mt-0.5 block font-grotesk text-sm font-semibold">{s.name}</span>
      </span>
    </a>
  );
}
