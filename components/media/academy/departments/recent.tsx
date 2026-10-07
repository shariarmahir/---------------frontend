"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { getCourse, getDepartment } from "@/data/media/academy";
import type { Course, Department } from "@/lib/media/academy";

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

function remember(key: string, id: string) {
  try {
    const list = [id, ...(localStorage.getItem(key) ?? "").split(",").filter((x) => x && x !== id)].slice(0, MAX);
    localStorage.setItem(key, list.join(","));
    window.dispatchEvent(new Event(CHANGED));
  } catch {
    /* storage blocked: nothing to remember */
  }
}

/** Put on a course page: notes the visit. Draws nothing. */
export function RememberCourse({ id }: { id: string }) {
  useEffect(() => remember(KEY, id), [id]);
  return null;
}

/* The departments this browser opened last, the same way. */
const DEPT_KEY = "academy-recent-depts";

function readDepts(): string {
  try {
    return localStorage.getItem(DEPT_KEY) ?? "";
  } catch {
    return "";
  }
}

export function useRecentDepts(): Department[] {
  const raw = useSyncExternalStore(subscribe, readDepts, () => "");
  return useMemo(
    () =>
      raw
        .split(",")
        .map((id) => getDepartment(id))
        .filter((d): d is Department => Boolean(d)),
    [raw],
  );
}

/** Put on a department page: notes the visit. Draws nothing. */
export function RememberDept({ id }: { id: string }) {
  useEffect(() => remember(DEPT_KEY, id), [id]);
  return null;
}
