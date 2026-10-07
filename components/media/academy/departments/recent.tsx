"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { getCourse } from "@/data/media/academy";
import type { Course } from "@/lib/media/academy";

/**
 * The courses this browser looked at last, newest first — a convenience for
 * "আবার শুরু করুন", kept on this device only. Storage can be missing or
 * blocked; then the list is simply empty.
 */
const KEY = "academy-recent-courses";
const CHANGED = "academy-recent-changed";
const MAX = 6;

function read(): string {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGED, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGED, onChange);
  };
}

export function useRecentCourses(): Course[] {
  const raw = useSyncExternalStore(subscribe, read, () => "");
  return useMemo(
    () =>
      raw
        .split(",")
        .map((id) => getCourse(id))
        .filter((c): c is Course => Boolean(c)),
    [raw],
  );
}

/** Put on a course page: notes the visit. Draws nothing. */
export function RememberCourse({ id }: { id: string }) {
  useEffect(() => {
    try {
      const list = [id, ...read().split(",").filter((x) => x && x !== id)].slice(0, MAX);
      localStorage.setItem(KEY, list.join(","));
      window.dispatchEvent(new Event(CHANGED));
    } catch {
      /* storage blocked: nothing to remember */
    }
  }, [id]);
  return null;
}
