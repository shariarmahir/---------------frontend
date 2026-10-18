import type { CSSProperties } from "react";
import type { ProjectTech } from "@/data/projects";

/** Each sticker rests at its own slight angle, so the row reads hand-stuck. */
const TILTS = [-6, 4, -3, 7, -5, 3, -7, 5];

/**
 * The technology behind a project as a row of die-cut stickers: each brand
 * logo in its own colour with a white cut edge (the `tech-sticker` SVG
 * filter), no tile behind it. The row scrolls on its own and holds still
 * under a pointer; each sticker bobs at its own pace and straightens when
 * pointed at. Under reduced motion the row wraps in place and stays still
 * (`.catalog-marquee` and `.tech-sticker` in globals.css).
 */
export function TechRow({ items }: { items: ProjectTech[] }) {
  const row = (copy: boolean) => (
    <ul aria-hidden={copy || undefined} className="flex shrink-0 items-start gap-14 pr-14">
      {items.map((item, i) => (
        <li
          key={item.logo.slug}
          title={`${item.logo.title}: ${item.role}${item.layer === "demo" ? ", in the demo" : ", proposed"}`}
          className="group flex w-28 flex-col items-center gap-3 text-center"
        >
          <span
            className="tech-sticker block"
            style={{ "--tilt": `${TILTS[i % TILTS.length]}deg`, animationDelay: `${-(i * 0.7)}s` } as CSSProperties}
          >
            <svg viewBox="-3 -3 30 30" className="size-20 overflow-visible" aria-hidden>
              <path d={item.logo.path} fill={`#${item.logo.hex}`} filter="url(#tech-sticker)" />
            </svg>
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="font-grotesk text-sm font-bold text-white">{item.logo.title}</span>
            <span className="font-sans text-xs text-white/60">
              {item.role}
              {copy ? null : <span className="sr-only">{item.layer === "demo" ? ", used in the demo" : ", proposed for the floor"}</span>}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="mx-[calc(50%-50vw)] overflow-hidden py-4">
      {/* The die-cut edge: the logo's shape grown outward and filled white, with a soft lift under it. */}
      <svg aria-hidden className="absolute size-0">
        <filter id="tech-sticker" x="-40%" y="-40%" width="180%" height="180%" colorInterpolationFilters="sRGB">
          <feMorphology in="SourceAlpha" operator="dilate" radius="2.1" result="cut" />
          <feFlood floodColor="#ffffff" />
          <feComposite in2="cut" operator="in" result="edge" />
          <feDropShadow dx="0" dy="1.2" stdDeviation="0.9" floodColor="#000000" floodOpacity="0.55" result="lifted" />
          <feMerge>
            <feMergeNode in="lifted" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </svg>
      <div className="catalog-marquee flex w-max">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
