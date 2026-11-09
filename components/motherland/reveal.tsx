"use client";

import { useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import { cn } from "@/lib/utils";
import { useInView } from "./use-in-view";

/**
 * A card that rises into place the first time it comes into view while its
 * photograph wipes open (motherland.css, .ml-reveal). Without a script or with
 * reduced motion it is simply there.
 */
export function Reveal({ as = "div", order = 0, className, children }: { as?: "div" | "li"; order?: number; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const seen = useInView(ref, "0px 0px -8% 0px");
  const shared = { className: cn("ml-reveal", className), "data-in": seen ? "" : undefined, style: { "--d": `${order * 90}ms` } as CSSProperties };
  return as === "li" ? (
    <li ref={ref as RefObject<HTMLLIElement>} {...shared}>
      {children}
    </li>
  ) : (
    <div ref={ref as RefObject<HTMLDivElement>} {...shared}>
      {children}
    </div>
  );
}
