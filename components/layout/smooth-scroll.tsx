"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** How closely the glide follows the wheel: lower is silkier, higher is snappier (the academy's own value). */
const GLIDE = 0.12;
/** The fixed header's height, so a jump to an #anchor lands below it. */
const HEADER_OFFSET = -96;

/**
 * Glides the page under the wheel and the touch, and eases #anchor jumps,
 * like the academy pages. Nothing is added to the page; with reduced motion
 * it does nothing and the browser scrolls as usual. Pages under `except`
 * (the academy, which glides inside its own frame) are left alone, and so
 * are open dialogs and menus, which scroll by themselves.
 */
export function SmoothScroll({ except }: { except?: string }) {
  const path = usePathname();
  const off = Boolean(except && path.startsWith(except));
  useEffect(() => {
    if (off || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const glide = new Lenis({
      lerp: GLIDE,
      anchors: { offset: HEADER_OFFSET },
      allowNestedScroll: true,
      autoRaf: true,
      prevent: (node) => Boolean(node.closest?.('[role="dialog"], [role="menu"], [data-radix-popper-content-wrapper]')),
    });
    return () => glide.destroy();
  }, [off]);
  return null;
}
