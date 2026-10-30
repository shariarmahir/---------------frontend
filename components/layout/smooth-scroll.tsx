"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** How closely the glide follows the wheel: lower is silkier, higher is snappier (the academy's own value). */
const GLIDE = 0.12;
/** The fixed header's height (64px, 120px from lg: --header-offset), so a jump to an #anchor lands below it. */
const headerOffset = () => (matchMedia("(min-width: 64rem)").matches ? -120 : -64);

/**
 * Glides the page under the wheel, and eases #anchor jumps, like the
 * academy pages. Nothing is added to the page; on a touch screen or with
 * reduced motion it does nothing and the browser scrolls as usual. Pages under `except`
 * (the academy, which glides inside its own frame) are left alone, and so
 * are open dialogs and menus, which scroll by themselves.
 */
export function SmoothScroll({ except }: { except?: string }) {
  const path = usePathname();
  const off = Boolean(except && path.startsWith(except));
  useEffect(() => {
    // A touch screen already scrolls natively on the compositor: gliding it would only add a frame loop.
    if (off || matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches) return;
    const glide = new Lenis({
      lerp: GLIDE,
      anchors: { offset: headerOffset() },
      allowNestedScroll: true,
      autoRaf: true,
      prevent: (node) => Boolean(node.closest?.('[role="dialog"], [role="menu"], [data-radix-popper-content-wrapper]')),
    });
    return () => glide.destroy();
  }, [off]);
  return null;
}
