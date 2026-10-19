"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type ReactNode } from "react";
import type { MapLayerProps } from "@/lib/tv-wall/geo";

const District3D = dynamic(() => import("./district-3d"), { ssr: false, loading: () => null });

/** Whether this device can carry the 3D map: WebGL present and not a low-end phone. */
function canRun3D() {
  const nav = navigator as Navigator & { deviceMemory?: number };
  if ((nav.hardwareConcurrency ?? 4) <= 2) return false;
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 2) return false;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/**
 * The 3D district map, code-split: its bundle loads only on a device that
 * can run it, and `fallback` (a light 2D map) shows during server render,
 * while the check runs, and for good on weak or WebGL-less devices.
 */
export function District3DLazy({ fallback, ...props }: MapLayerProps & { windowHours: number; fallback: ReactNode }) {
  const [mode, setMode] = useState<"checking" | "3d" | "fallback">("checking");

  useEffect(() => {
    let alive = true;
    const t = window.setTimeout(() => {
      if (!canRun3D()) {
        setMode("fallback");
        return;
      }
      import("./district-3d").then(
        () => alive && setMode("3d"),
        () => alive && setMode("fallback"),
      );
    }, 0);
    return () => {
      alive = false;
      window.clearTimeout(t);
    };
  }, []);

  return mode === "3d" ? <District3D {...props} /> : <>{fallback}</>;
}
