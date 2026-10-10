"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { Archivo, Instrument_Serif, Tiro_Bangla } from "next/font/google";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** The wide display face: Archivo stretched, for Latin and digits beside Hind Siliguri's Bangla. */
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });
/** The turned word in a heading — "ছোট *বিশ্ববিদ্যালয়*" — is a serif italic: Instrument Serif for Latin, Tiro Bangla for Bangla. */
const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", style: "italic", variable: "--font-instrument", display: "swap" });
const tiro = Tiro_Bangla({ subsets: ["bengali"], weight: "400", style: "italic", variable: "--font-tiro", display: "swap" });

const SKIN = cn("catalogue", archivo.variable, instrument.variable, tiro.variable);

/** A block shows once its top passes 88% of the screen height. */
const ARRIVE = "0px 0px -12% 0px";
/** Across a row of cards, the rightmost one starts this many seconds after the leftmost. */
const ROW_LAG = 0.18;
/** How closely the glide follows the wheel: lower is silkier, higher is snappier. */
const GLIDE = 0.12;
/** The bar's height; jump links land below it and the running label. */
export const NAV_H = 64;
const ANCHOR_OFFSET = -(NAV_H + 52);

export type CatalogueTheme = "dark" | "light";
const THEME_KEY = "kandari-catalogue-theme";

interface Catalogue {
  theme: CatalogueTheme;
  toggleTheme: () => void;
  /** The academy's scroll area, which this page fills. */
  scroller: () => HTMLElement | null;
  /** The glide, when motion is welcome; jumps go through it so they ease. */
  glide: React.RefObject<Lenis | null>;
  /** The page's theme and faces as a class list, for dialogs portalled outside it. */
  skin: string;
}

const CatalogueContext = createContext<Catalogue | null>(null);

export function useCatalogue(): Catalogue {
  const c = useContext(CatalogueContext);
  if (!c) throw new Error("useCatalogue outside CatalogueRoot");
  return c;
}

const scroller = () => document.getElementById("academy-main");

/**
 * The catalogue page: charcoal (or ash) edge to edge, its sections and
 * blocks marked "in" as they scroll into view (the stylesheet draws them),
 * and the scroll area gliding under the wheel. With reduced motion it is a
 * plain page that still switches theme.
 */
export function CatalogueRoot({ className, children }: { className?: string; children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const glide = useRef<Lenis | null>(null);
  const [theme, setTheme] = useState<CatalogueTheme>(() => {
    try {
      return localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
    } catch {
      return "dark";
    }
  });

  const toggleTheme = useCallback(() => {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        // Private mode: the choice holds for this visit.
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const page = root.current;
    const wrapper = scroller();
    if (!page || !wrapper || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const watch = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.setAttribute("data-in", "");
          watch.unobserve(e.target);
        }
      },
      { rootMargin: ARRIVE },
    );

    // Everything waiting to arrive in a part of the page; cards to the right of a row arrive a beat after those on the left.
    const track = (part: Element) => {
      for (const row of part.querySelectorAll<HTMLElement>("[data-reveal-group]")) {
        const box = row.getBoundingClientRect();
        for (const card of row.querySelectorAll<HTMLElement>("[data-reveal]")) {
          const x = card.getBoundingClientRect().left - box.left;
          card.style.setProperty("--d", `${box.width > 0 ? (x / box.width) * ROW_LAG : 0}s`);
        }
      }
      if (part.matches("[data-choreo]:not([data-in]), [data-reveal]:not([data-in])")) watch.observe(part);
      part.querySelectorAll("[data-choreo]:not([data-in]), [data-reveal]:not([data-in])").forEach((el) => watch.observe(el));
    };
    track(page);

    // Parts drawn later — a form once the browser's records load, the welcome after joining, a new tab — arrive the same way.
    const later = new MutationObserver((changes) => {
      for (const c of changes) for (const node of c.addedNodes) if (node instanceof Element) track(node);
    });
    later.observe(page, { childList: true, subtree: true });

    glide.current = new Lenis({ wrapper, content: page, lerp: GLIDE, anchors: { offset: ANCHOR_OFFSET }, autoRaf: true });
    return () => {
      later.disconnect();
      watch.disconnect();
      glide.current?.destroy();
      glide.current = null;
    };
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme, scroller, glide, skin: SKIN }), [theme, toggleTheme]);

  return (
    <CatalogueContext.Provider value={value}>
      <div ref={root} data-theme={theme} className={cn(SKIN, className)}>
        {children}
      </div>
    </CatalogueContext.Provider>
  );
}
