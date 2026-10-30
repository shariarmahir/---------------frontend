"use client";

import type { AcademyState } from "@/lib/media/academy";
import { updateMedia, useMediaState } from "@/lib/media/store";

/** Read the viewer's academy; the selector must return state or a primitive. */
export function useAcademy<T>(select: (a: AcademyState) => T): T {
  return useMediaState((s) => select(s.academy));
}

/** Change the viewer's academy; false when it could not be saved for next visit. */
export function updateAcademy(fn: (a: AcademyState) => AcademyState): boolean {
  return updateMedia((s) => ({ ...s, academy: fn(s.academy) }));
}
