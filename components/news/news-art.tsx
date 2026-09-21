import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { newsCategories, type NewsCategory } from "@/data/news-feed";
import { photoCredits } from "@/data/news-photos";
import { cn } from "@/lib/utils";

/**
 * Cover image for a news item.
 *
 * Shows a licensed stock photograph when we have one for the item, and falls
 * back to generated artwork otherwise — so a newly submitted report never
 * renders as an empty grey box.
 *
 * The photographs are illustrative of the CATEGORY, not documentation of the
 * specific event, and each one carries a visible credit. We deliberately do
 * not use outlets' own press photography: it would be a licensing problem,
 * and attaching real news photos to summaries would imply a level of
 * documentation we do not have.
 *
 * TODO(backend): when the aggregator returns an outlet-supplied thumbnail we
 * are licensed to display, prefer that over the stock image.
 */

/** Per-category gradient stops for the fallback artwork. */
const PALETTE: Record<NewsCategory, [string, string]> = {
  crime: ["#7f1d1d", "#da291c"],
  durniti: ["#7c2d12", "#e65100"],
  government: ["#1e293b", "#475569"],
  events: ["#1e3a8a", "#2563eb"],
  innovation: ["#064e3b", "#006747"],
  invention: ["#312e81", "#4f46e5"],
  technology: ["#0c4a6e", "#0284c7"],
  growth: ["#065f46", "#0d9488"],
  achievement: ["#78350f", "#ff9100"],
  banking: ["#164e63", "#0891b2"],
  scheme: ["#134e4a", "#0d9488"],
  citizen: ["#4c1d95", "#7c3aed"],
};

/** Deterministic 0–1 from the item id, so SSR and client agree. */
function seeded(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 9973;
  return h / 9973;
}

/** Generated fallback used when an item has no licensed photograph. */
function GeneratedArt({
  id,
  category,
}: {
  id: string;
  category: NewsCategory;
}) {
  const [from, to] = PALETTE[category];
  const s = seeded(id);
  const gid = `g-${id}`;
  const cx = 20 + s * 60;
  const cy = 25 + s * 40;
  const rot = -18 + s * 36;

  return (
    <svg
      viewBox="0 0 400 225"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      className="size-full"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>

      <rect width="400" height="225" fill={`url(#${gid})`} />

      {/* Column rules — a nod to newsprint. */}
      <g stroke="#ffffff" strokeOpacity="0.12" strokeWidth="1">
        <line x1="100" y1="0" x2="100" y2="225" />
        <line x1="200" y1="0" x2="200" y2="225" />
        <line x1="300" y1="0" x2="300" y2="225" />
      </g>

      {/* Soft geometry, seeded per item. */}
      <circle
        cx={cx * 4}
        cy={cy * 2.25}
        r={70 + s * 40}
        fill="#ffffff"
        fillOpacity="0.07"
      />
      <rect
        x={200 + s * 80}
        y={-20}
        width="120"
        height="280"
        fill="#ffffff"
        fillOpacity="0.05"
        transform={`rotate(${rot} 260 112)`}
      />

      {/* Headline rules, suggesting set type. */}
      <g fill="#ffffff" fillOpacity="0.16">
        <rect x="24" y="150" width={110 + s * 60} height="7" rx="3.5" />
        <rect x="24" y="168" width={70 + s * 40} height="7" rx="3.5" />
      </g>
    </svg>
  );
}

export function NewsArt({
  id,
  category,
  className,
  showIcon = true,
  priority = false,
}: {
  id: string;
  category: NewsCategory;
  className?: string;
  showIcon?: boolean;
  /** Set on the lead card so the largest image is not lazy-loaded. */
  priority?: boolean;
}) {
  const meta =
    newsCategories.find((c) => c.id === category) ?? newsCategories[0];
  const photo = photoCredits[id];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-slate-200",
        className,
      )}
    >
      {photo ? (
        <>
          <Image
            src={`/news/${id}.jpg`}
            // Decorative: the headline beside it carries the meaning, and
            // describing a category-illustrative stock photo would only
            // mislead a screen reader about what is documented.
            alt=""
            aria-hidden
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          {/* Scrim so the credit stays legible over a bright photo. */}
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/55 to-transparent"
          />
          <span className="absolute right-1.5 bottom-1.5 left-1.5 truncate text-right font-sans text-[0.6875rem] text-white/85">
            Photo: {photo.photographer} / Pexels
          </span>
        </>
      ) : (
        <GeneratedArt id={id} category={category} />
      )}

      {showIcon ? (
        <span className="absolute top-2 left-2 flex size-7 items-center justify-center rounded-md bg-white/90 text-slate-900 shadow-sm backdrop-blur-sm">
          <Icon name={meta.icon} className="text-[15px]" />
        </span>
      ) : null}
    </div>
  );
}
