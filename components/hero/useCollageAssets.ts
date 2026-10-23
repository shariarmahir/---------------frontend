'use client';

import { useEffect, useState } from 'react';

/**
 * Whether the sliced collage assets are in place.
 *
 * The animated hero needs two things: the source collage
 * (`/hero/CREATEDhero.jpg`) and the sliced tiles plus their manifest
 * (`/hero/tiles.json`, `/hero/tiles/*.webp`). Until the slicer has been
 * run there is nothing to animate, so the landing page keeps the photo
 * hero it already had rather than showing an empty black band.
 */
export function useCollageAssets(): "checking" | "ready" | "missing" {
  const [state, setState] = useState<"checking" | "ready" | "missing">(
    "checking",
  );

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const [manifest, source] = await Promise.all([
          fetch("/hero/tiles.json", { cache: "no-cache" }).then((r) =>
            r.ok ? r.json() : null,
          ),
          fetch("/hero/CREATEDhero.jpg", { method: "HEAD" }).then((r) =>
            r.ok ? true : null,
          ),
        ]);

        if (cancelled) return;
        const ready = Array.isArray(manifest) && manifest.length > 0 && source === true;
        setState(ready ? "ready" : "missing");
      } catch {
        if (!cancelled) setState("missing");
      }
    };

    void check();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
